import './chat-styles.css';
import ChatSider from './components/ChatSider';
import ChatWelcome from './components/ChatWelcome';
import ChatInput from './components/ChatInput';
import { useParams } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MessageList from './components/MessageList';
import { useChat } from './hooks/useChat';
import { chatService } from '@/services/chat/chatService';
import MoleculeModal from './components/MoleculeModal';
import { useMoleculePanel } from './hooks/useMoleculePanel';

const Chat = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const {
        messages,
        chatHistory,
        currentChatId,
        isLoading,
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
        togglePinChat
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
    const [lastHistoryId, setLastHistoryId] = useState<string | undefined>(undefined);

    const nonPinnedHistory = useMemo(() => chatHistory.filter(i => !i.isPinned), [chatHistory]);

    // 初始化聊天历史
    useEffect(() => {
        const initChatHistory = async () => {
            try {
                const history = await chatService.getChatHistory();
                updateChatHistory(history);
                // 根据初次返回的非置顶条目数量与末尾ID，设置分页信息
                const initialNonPinned = history.filter(item => !item.isPinned);
                setHasMoreHistory(initialNonPinned.length >= 20);
                setLastHistoryId(initialNonPinned.length ? initialNonPinned[initialNonPinned.length - 1].chatId : undefined);
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };
        initChatHistory();
    }, [updateChatHistory]);

    // 处理路由参数变化
    useEffect(() => {
        if (id) {
            loadChatHistory(id);
            loadChatData(id);
        } else {
            startNewChat();
        }
    }, [id, loadChatHistory, startNewChat]);

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

    // 处理发送消息
    const handleSendMessage = async (message: string, mode: 'regular' | 'deep-space' = 'regular') => {
        addUserMessage(message);

        try {
            setIsLoading(true);
            const response = await chatService.sendMessage(message, mode, currentChatId);
            addBotMessage(response.content, response.showRegenerate);
        } catch (error) {
            console.error('Failed to send message:', error);
            addBotMessage(t('chatbox.chat.sendFailed'), false);
        } finally {
            setIsLoading(false);
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
            const lastBotMessageIndex = messages.findLastIndex(msg => msg.type === 'bot');
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
    };

    // 处理选择聊天历史
    const handleSelectChat = (selectedChatId: string) => {
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
        if (loadingMoreHistory || !hasMoreHistory) return;
        try {
            setLoadingMoreHistory(true);
            const more = await chatService.getChatList(lastHistoryId, 20);
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
            // 更新分页标志
            setHasMoreHistory(moreNonPinned.length >= 20);
            setLastHistoryId(mergedNonPinned.length ? mergedNonPinned[mergedNonPinned.length - 1].chatId : lastHistoryId);
        } catch (error) {
            console.error('Failed to load more history:', error);
        } finally {
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
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                disabled={isLoading}
                            />
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