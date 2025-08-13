import './chat-styles.css';
import ChatSider from './components/ChatSider';
import ChatWelcome from './components/ChatWelcome';
import ChatInput from './components/ChatInput';
import { useParams } from 'react-router';
// import { history } from 'umi';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MessageList from './components/MessageList';
import type { Message } from '@/utils/messageUtils';
import { 
  createAssistantMessage, 
  isAssistantMessage, 
  getLastMessageByRole 
} from '@/utils/messageUtils';
import { useChat } from './hooks/useChat';
import { chatService } from '@/services/chat/chatService';
import MoleculeModal from './components/MoleculeModal';
import { useMoleculePanel } from './hooks/useMoleculePanel';
import { globalWebSocketManager } from '@/services/chat/wsService';

const Chat = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const {
        messages,
        chatHistory,
        currentChatId,
        isLoading,
        sessionId,
        setSessionId,
        setIsLoading,
        addUserMessage,
        addBotMessage,
        editMessage,
        startNewChat,
        loadChatHistory,
        updateChatHistory,
        setMessages,
        deleteChat,
        renameChat,
        togglePinChat,
        isChatHistoryCached,
        sendMessage,
        isWebSocketConnected
    } = useChat();

    const {
        state: moleculePanelState,
        hidePanel: handleMoleculePanelClose,
        handleMoleculeClick,
        handleFindSimilar,
    } = useMoleculePanel();

    // 历史列表分页状态
    const [hasMoreHistory, setHasMoreHistory] = useState(false);
    const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | undefined>(undefined);
    const loadMoreGateTsRef = useRef<number>(0);

    // WebSocket连接状态 - 现在通过全局管理器管理
    const [wsConnected, setWsConnected] = useState(false);
    const currentBotMessageRef = useRef<string>('');

    const nonPinnedHistory = useMemo(() => chatHistory.filter(i => !i.isPinned), [chatHistory]);

    // 初始化聊天历史 - 使用缓存机制避免重复请求
    useEffect(() => {
        // 如果聊天历史已缓存，跳过请求
        if (isChatHistoryCached()) {
            console.log('聊天历史已缓存，跳过重复请求', chatHistory.length);
            // 仍需要设置分页信息
            const initialNonPinned = chatHistory.filter(item => !item.isPinned);
            setHasMoreHistory(initialNonPinned.length > 0);
            if (initialNonPinned.length > 0) {
                const lastItem = initialNonPinned[initialNonPinned.length - 1];
                setLastUpdatedAt(lastItem.timestamp.toISOString());
            } else {
                setLastUpdatedAt(undefined);
            }
            return;
        }

        const initChatHistory = async () => {
            try {
                console.log('初始化聊天历史请求');
                const chatHistoryData = await chatService.getChatHistory();
                updateChatHistory(chatHistoryData);
                // 根据初次返回的非置顶条目数量与末尾updated_at，设置分页信息
                const initialNonPinned = chatHistoryData.filter(item => !item.isPinned);
                // hasMore 按接口是否返回为空判断：首屏非置顶条目非空则认为还有更多，直到下一次请求返回空
                setHasMoreHistory(initialNonPinned.length > 0);
                if (initialNonPinned.length > 0) {
                    const lastItem = initialNonPinned[initialNonPinned.length - 1];
                    setLastUpdatedAt(lastItem.timestamp.toISOString());
                } else {
                    setLastUpdatedAt(undefined);
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };
        initChatHistory();
    }, [updateChatHistory, isChatHistoryCached, chatHistory]);

    // 处理路由参数变化
    useEffect(() => {
        if (id) {
            // 立即更新 currentChatId 以反映选中状态
            loadChatHistory(id);
            // 设置sessionId
            setSessionId(id);
            // 加载聊天数据
            loadChatData(id);
        } else {
            startNewChat();
        }
    }, [id, loadChatHistory, startNewChat, setSessionId]);

    // 设置WebSocket事件监听器
    useEffect(() => {
        // 监听WebSocket连接状态变化
        const unsubscribeConnect = globalWebSocketManager.onConnect(() => {
            console.log('全局WebSocket连接已建立');
            setWsConnected(true);
        });

        const unsubscribeDisconnect = globalWebSocketManager.onDisconnect(() => {
            console.log('全局WebSocket连接已断开');
            setWsConnected(false);
            setIsLoading(false);
        });

        const unsubscribeError = globalWebSocketManager.onError((error) => {
            console.error('全局WebSocket错误:', error);
            setWsConnected(false);
            setIsLoading(false);
            
            // 根据错误类型提供不同的错误消息
            let errorMessage = t('chatbox.chat.sendFailed');
            if (error.message && error.message.includes('timeout')) {
                errorMessage = '连接超时，请检查网络状况或稍后重试。';
            } else if (error.message && error.message.includes('connect')) {
                errorMessage = '无法连接到服务器，请检查网络连接。';
            }
            
            addBotMessage(errorMessage, false);
        });

        // 监听消息
        const unsubscribeMessage = globalWebSocketManager.onMessage((data) => {
            console.log('收到全局WebSocket消息:', data);
            
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    // 如果不是JSON，直接使用字符串
                }
            }

            // 处理流式消息
            if (data.type === 'chunk' || data.content) {
                const content = data.content || data.chunk || data;
                currentBotMessageRef.current += content;
                
                // 更新最后一条机器人消息
                const updatedMessage = createAssistantMessage(
                    currentBotMessageRef.current, 
                    `bot-${Date.now()}`, 
                    true
                );
                
                // 更新消息列表中的最后一条机器人消息
                const newMessages = [...messages];
                const lastBotIndex = newMessages.findLastIndex((msg: Message) => 
                    isAssistantMessage(msg) // 使用工具函数，自动处理兼容性
                );
                if (lastBotIndex !== -1) {
                    newMessages[lastBotIndex] = updatedMessage;
                }
                setMessages(newMessages);
            }

            // 处理完成消息
            if (data.type === 'done' || data.finished) {
                setIsLoading(false);
                currentBotMessageRef.current = '';
            }
        });

        return () => {
            // 组件卸载时清理事件监听器
            unsubscribeConnect();
            unsubscribeDisconnect();
            unsubscribeError();
            unsubscribeMessage();
        };
    }, [setIsLoading, addBotMessage, setMessages, t]);

    // 加载聊天数据
    const loadChatData = async (chatId: string) => {
        try {
            setIsLoading(true);
            const chatData = await chatService.getChatById(chatId);
            setMessages(chatData.messages);
        } catch (error) {
            console.error('Failed to load chat data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 处理发送消息 - 使用全局WebSocket管理器
    const handleSendMessage = async (messageOrChatID: string, modeOrMessage?: 'regular' | 'deep-space' | string, modeParam?: 'regular' | 'deep-space') => {
        // 处理不同的调用签名
        // 1. handleSendMessage(message, mode) - 来自ChatInput
        // 2. handleSendMessage(chatID, message, mode) - 来自其他地方
        let message: string;
        let mode: 'regular' | 'deep-space' = 'regular';
        let chatID: string | undefined;

        if (typeof modeOrMessage === 'string' && (modeOrMessage === 'regular' || modeOrMessage === 'deep-space')) {
            // 调用方式1: handleSendMessage(message, mode)
            message = messageOrChatID;
            mode = modeOrMessage;
            chatID = currentChatId;
        } else if (typeof modeOrMessage === 'string' && typeof modeParam !== 'undefined') {
            // 调用方式2: handleSendMessage(chatID, message, mode)
            chatID = messageOrChatID;
            message = modeOrMessage;
            mode = modeParam;
        } else {
            // 默认处理：假设第一个参数是消息
            message = messageOrChatID;
            chatID = currentChatId;
        }

        console.log('handleSendMessage: 开始发送消息', { chatID, message, mode, sessionId });
        
        // 确保有sessionId，如果没有则设置为chatID
        if (!sessionId && chatID) {
            console.log('handleSendMessage: 设置sessionId为', chatID);
            setSessionId(chatID);
        }
        
        // 先添加一个空的机器人消息，用于流式更新
        addBotMessage('', true);
        currentBotMessageRef.current = '';

        // 使用useChat的sendMessage函数，它会使用全局WebSocket管理器
        const success = sendMessage(message, mode);
        
        if (!success) {
            console.error('handleSendMessage: 消息发送失败');
            addBotMessage(t('chatbox.chat.sendFailed'), false);
        }
    };

    // 处理编辑消息
    const handleEditMessage = (messageId: string, newText: string) => {
        editMessage(messageId, newText);
    };

    // 处理复制消息
    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    // 处理重新生成
    const handleRegenerateMessage = async (messageId: string) => {
        try {
            setIsLoading(true);
            const response = await chatService.regenerateResponse(messageId);
            // 更新最后一条机器人消息
            const lastBotMessageIndex = messages.findLastIndex(msg => 
                isAssistantMessage(msg) // 使用工具函数，自动处理兼容性
            );
            if (lastBotMessageIndex !== -1) {
                const updatedMessages = [...messages];
                updatedMessages[lastBotMessageIndex] = {
                    ...updatedMessages[lastBotMessageIndex],
                    content: response.content,
                    showRegenerate: response.showRegenerate
                };
                setMessages(updatedMessages);
            }
        } catch (error) {
            console.error('Failed to regenerate message:', error);
        } finally {
            setIsLoading(false);
        }
    };



    // 处理新聊天
    const handleNewChat = () => {
        startNewChat();
        // 跳转到新聊天页面
        // TODO: 添加路由跳转逻辑
        window.location.href = '/chat';
    };

    // 处理选择聊天历史
    const handleSelectChat = (selectedChatId: string) => {
        // 只更新状态，路由跳转由 HistoryItem 处理
        loadChatHistory(selectedChatId);
    };

    // 处理删除聊天
    const handleDeleteChat = async (chatId: string) => {
        const success = await chatService.deleteChat(chatId);
        if (success) {
            deleteChat(chatId);
        }
    };

    // 处理重命名聊天
    const handleRenameChat = async (chatId: string, newTitle: string) => {
        const success = await chatService.renameChat(chatId, newTitle);
        if (success) {
            renameChat(chatId, newTitle);
        }
    };

    // 处理置顶聊天
    const handleTogglePinChat = async (chatId: string) => {
        const chatItem = chatHistory.find(item => item.chatId === chatId);
        if (chatItem) {
            const success = await chatService.togglePinChat(chatId, !chatItem.isPinned);
            if (success) {
                togglePinChat(chatId);
            }
        }
    };

    const showInput = !!currentChatId;

    // 加载更多历史（下拉到底触发）
    const handleLoadMoreHistory = async () => {
        const now = Date.now();
        // 双保险：简单时间窗防抖，避免极端情况下重复触发
        if (now - loadMoreGateTsRef.current < 500) return;
        loadMoreGateTsRef.current = now;
        if (loadingMoreHistory || !hasMoreHistory) return;
        try {
            setLoadingMoreHistory(true);
            const more = await chatService.getChatList(lastUpdatedAt, 20);
            console.log('more', more);
            // 仅追加非置顶数据
            const moreNonPinned = more.filter(item => !item.isPinned);
            const pinned = chatHistory.filter(item => item.isPinned);
            const existingNonPinned = chatHistory.filter(item => !item.isPinned);
            // 去重
            const existingIds = new Set(existingNonPinned.map(i => i.chatId));
            const mergedNonPinned = [...existingNonPinned];
            for (const item of moreNonPinned) {
                if (!existingIds.has(item.chatId)) mergedNonPinned.push(item);
            }
            updateChatHistory([...pinned, ...mergedNonPinned]);
            console.log('mergedNonPinned', mergedNonPinned);
            // 更新分页标志：仅依据接口是否返回空
            setHasMoreHistory(moreNonPinned.length > 0);
            if (moreNonPinned?.length > 0) {
                // 使用最后一条数据的updated_at作为下次分页的起始点
                const lastItem = mergedNonPinned[mergedNonPinned.length - 1];
                setLastUpdatedAt(lastItem.timestamp.toISOString());
            } else {
                setLastUpdatedAt(undefined);
            }
        } catch (error) {
            console.error('Failed to load more history:', error);
        } finally {
            console.log('loadingMoreHistoryend', loadingMoreHistory);
            setLoadingMoreHistory(false);
        }
    };

    return (
        <>
            <div className="chat-container">
                <ChatSider
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                    currentChatId={currentChatId}
                    chatHistory={chatHistory}
                    onDeleteChat={handleDeleteChat}
                    onRenameChat={handleRenameChat}
                    onTogglePinChat={handleTogglePinChat}
                    onLoadMoreHistory={handleLoadMoreHistory}
                    hasMoreHistory={hasMoreHistory}
                    loadingMoreHistory={loadingMoreHistory}
                />
                <main className="chat-main" id="chatMain" style={{ position: 'relative' }}>
                    <div className="chat-messages" id="chat-messages">
                        {
                            currentChatId ? (
                                <MessageList
                                    messages={messages}
                                    onCopyMessage={handleCopyMessage}
                                    onRegenerateMessage={handleRegenerateMessage}
                                    onMoleculeClick={handleMoleculeClick}
                                    onEditMessage={handleEditMessage}
                                />
                            ) : (
                                <ChatWelcome onSendMessage={handleSendMessage} />
                            )
                        }
                    </div>
                                            {
                            showInput && (
                                <>
                                    {/* WebSocket连接状态指示器 */}
                                    {!wsConnected && (
                                        <div style={{
                                            background: '#fff3cd',
                                            border: '1px solid #ffeaa7',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            margin: '8px 16px',
                                            fontSize: '14px',
                                            color: '#856404',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: '#ffc107',
                                                animation: 'pulse 2s infinite'
                                            }}></div>
                                            正在连接服务器...
                                        </div>
                                    )}
                                    <ChatInput
                                        onSendMessage={handleSendMessage}
                                        disabled={isLoading || !wsConnected}
                                    />
                                </>
                            )
                        }
                </main>
            </div>
            {moleculePanelState.isVisible && (
                <MoleculeModal
                    moleculeName={moleculePanelState.currentMolecule || 'LiPF6'}
                    onClose={handleMoleculePanelClose}
                    onFindSimilar={handleFindSimilar}
                />
            )}
        </>
    );
};

export default Chat;