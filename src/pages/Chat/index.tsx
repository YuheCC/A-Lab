import './chat-styles.css';
import ChatSider from './components/ChatSider';
import ChatWelcome from './components/ChatWelcome';
import ChatInput from './components/ChatInput';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
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

    // 初始化聊天历史
    useEffect(() => {
        const initChatHistory = async () => {
            try {
                const history = await chatService.getChatHistory();
                updateChatHistory(history);
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