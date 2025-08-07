import './chat-styles.css';
import ChatSider from './components/ChatSider';
import ChatWelcome from './components/ChatWelcome';
import ChatInput from './components/ChatInput';
import { useParams } from 'umi';
import { useEffect } from 'react';
import MessageList from './components/MessageList';
import { useChat } from './hooks/useChat';
import { chatService } from './services/chatService';
import type { Message } from './components/MessageList';
import type { ChatHistoryItem } from './components/History';

const Chat = () => {
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
        clearChat,
        startNewChat,
        loadChatHistory,
        saveChatHistory,
        updateChatHistory,
        setMessages
    } = useChat();

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
            addBotMessage('发送消息失败，请稍后重试。', false);
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

    // 处理分子点击
    const handleMoleculeClick = (moleculeName: string) => {
        console.log('Clicked molecule:', moleculeName);
        // 这里可以添加分子点击的处理逻辑
    };

    // 处理新聊天
    const handleNewChat = () => {
        startNewChat();
    };

    // 处理选择聊天历史
    const handleSelectChat = (selectedChatId: string) => {
        loadChatHistory(selectedChatId);
    };

    const showInput = !!currentChatId;

    return (
        <div className="chat-container">
            <ChatSider 
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                currentChatId={currentChatId}
                chatHistory={chatHistory}
            />
            <main className="chat-main" id="chatMain" style={{position:'relative'}}>
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
    );
};

export default Chat;