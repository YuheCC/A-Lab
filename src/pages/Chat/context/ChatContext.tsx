import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Message } from '@/utils/messageUtils';
import { createAssistantMessage, isAssistantMessage } from '@/utils/messageUtils';
import type { ChatHistoryItem } from '../components/History';
import { useChat } from '../hooks/useChat';
import { chatService } from '@/services/chat/chatService';
import { globalWebSocketManager } from '@/services/chat/wsService';
import { useMoleculePanel } from '../hooks/useMoleculePanel';
import { useChatStore } from '@/models/useChat';

type ChatMode = 'regular' | 'deep-space';

interface ChatContextType {
    messages: Message[];
    chatHistory: ChatHistoryItem[];
    currentChatId?: string;
    isLoading: boolean;
    sessionId?: string;
    wsConnected: boolean;
    hasMoreHistory: boolean;
    loadingMoreHistory: boolean;

    handleSendMessage: (message: string, mode: ChatMode) => void;
    handleEditMessage: (messageId: string, newText: string) => void;
    handleCopyMessage: (content: string) => void;
    handleRegenerateMessage: (messageId: string) => Promise<void>;

    handleNewChat: () => void;
    handleSelectChat: (selectedChatId: string) => void;
    handleDeleteChat: (chatId: string) => Promise<void>;
    handleRenameChat: (chatId: string, newTitle: string) => Promise<void>;
    handleTogglePinChat: (chatId: string) => Promise<void>;

    handleLoadMoreHistory: () => Promise<void>;
    showInput: boolean;

    moleculePanelState: ReturnType<typeof useMoleculePanel>['state'];
    handleMoleculePanelClose: ReturnType<typeof useMoleculePanel>['hidePanel'];
    handleMoleculeClick: ReturnType<typeof useMoleculePanel>['handleMoleculeClick'];
    handleFindSimilar: ReturnType<typeof useMoleculePanel>['handleFindSimilar'];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = (): ChatContextType => {
    const ctx = useContext(ChatContext);
    if (!ctx) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return ctx;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        sendMessage,
    } = useChat();

    const {
        state: moleculePanelState,
        hidePanel: handleMoleculePanelClose,
        handleMoleculeClick,
        handleFindSimilar,
    } = useMoleculePanel();

    const [hasMoreHistory, setHasMoreHistory] = useState(false);
    const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | undefined>(undefined);
    const loadMoreGateTsRef = useRef<number>(0);

    const [wsConnected, setWsConnected] = useState(false);
    const currentBotMessageRef = useRef<string>('');

    useEffect(() => {
        const initChatHistory = async () => {
            try {
                const chatHistoryData = await chatService.getChatHistory();
                updateChatHistory(chatHistoryData);
                const initialNonPinned = chatHistoryData.filter(item => !item.isPinned);
                setHasMoreHistory(initialNonPinned.length > 0);
                if (initialNonPinned.length > 0) {
                    const lastItem = initialNonPinned[initialNonPinned.length - 1];
                    setLastUpdatedAt(lastItem.updatedAt);
                } else {
                    setLastUpdatedAt(undefined);
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        };
        initChatHistory();
    }, [updateChatHistory]);

    useEffect(() => {
        if (id) {
            loadChatHistory(id);
            loadChatData(id);
        } else {
            startNewChat();
        }
    }, [id, loadChatHistory, startNewChat]);

    useEffect(() => {
        const unsubscribeConnect = globalWebSocketManager.onConnect(() => {
            setWsConnected(true);
            const info = globalWebSocketManager.getConnectionInfo();
            try {
                useChatStore.getState().setSocketId?.(info?.socketId || undefined);
            } catch (e) {}
        });

        const unsubscribeDisconnect = globalWebSocketManager.onDisconnect(() => {
            setWsConnected(false);
            setIsLoading(false);
            try {
                useChatStore.getState().setSocketId?.(undefined);
            } catch (e) {}
        });

        const unsubscribeError = globalWebSocketManager.onError((error) => {
            console.error('全局WebSocket错误:', error);
            setWsConnected(false);
            setIsLoading(false);
            let errorMessage = t('chatbox.chat.sendFailed');
            if ((error as any).message && (error as any).message.includes('timeout')) {
                errorMessage = '连接超时，请检查网络状况或稍后重试。';
            } else if ((error as any).message && (error as any).message.includes('connect')) {
                errorMessage = '无法连接到服务器，请检查网络连接。';
            }
            addBotMessage(errorMessage, false);
        });

        const unsubscribeMessage = globalWebSocketManager.onMessage((data) => {
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {}
            }

            if ((data as any).type === 'chunk' || (data as any).content) {
                const content = (data as any).content || (data as any).chunk || data;
                currentBotMessageRef.current += content as string;

                const updatedMessage = createAssistantMessage(
                    currentBotMessageRef.current,
                    `bot-${Date.now()}`,
                    true
                );

                const newMessages = [...messages];
                const lastBotIndex = newMessages.findLastIndex((msg: Message) => isAssistantMessage(msg));
                if (lastBotIndex !== -1) {
                    newMessages[lastBotIndex] = updatedMessage;
                }
                setMessages(newMessages);
            }

            if ((data as any).type === 'done' || (data as any).finished) {
                setIsLoading(false);
                currentBotMessageRef.current = '';
            }
        });

        return () => {
            unsubscribeConnect();
            unsubscribeDisconnect();
            unsubscribeError();
            unsubscribeMessage();
        };
    }, [setIsLoading, addBotMessage, setMessages, messages, t]);

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

    const handleSendMessage = useCallback((message: string, mode: ChatMode) => {
        // sessionId 由 socketId 填充，这里不再覆盖
        addBotMessage('', true);
        currentBotMessageRef.current = '';
        const success = sendMessage(message, mode);
        if (!success) {
            addBotMessage(t('chatbox.chat.sendFailed'), false);
        }
    }, [addBotMessage, sendMessage, t]);

    const handleEditMessage = useCallback((messageId: string, newText: string) => {
        editMessage(messageId, newText);
    }, [editMessage]);

    const handleCopyMessage = useCallback((content: string) => {
        navigator.clipboard.writeText(content);
    }, []);

    const handleRegenerateMessage = useCallback(async (messageId: string) => {
        try {
            setIsLoading(true);
            const response = await chatService.regenerateResponse(messageId);
            const lastBotMessageIndex = messages.findLastIndex(msg => isAssistantMessage(msg));
            if (lastBotMessageIndex !== -1) {
                const updatedMessages = [...messages];
                updatedMessages[lastBotMessageIndex] = {
                    ...updatedMessages[lastBotMessageIndex],
                    content: (response as any).content,
                    showRegenerate: (response as any).showRegenerate
                } as Message;
                setMessages(updatedMessages);
            }
        } catch (error) {
            console.error('Failed to regenerate message:', error);
        } finally {
            setIsLoading(false);
        }
    }, [messages, setIsLoading, setMessages]);

    const handleNewChat = useCallback(() => {
        startNewChat();
        window.location.href = '/chat';
    }, [startNewChat]);

    const handleSelectChat = useCallback((selectedChatId: string) => {
        loadChatHistory(selectedChatId);
    }, [loadChatHistory]);

    const handleDeleteChat = useCallback(async (chatId: string) => {
        const success = await chatService.deleteChat(chatId);
        if (success) {
            deleteChat(chatId);
        }
    }, [deleteChat]);

    const handleRenameChat = useCallback(async (chatId: string, newTitle: string) => {
        const success = await chatService.renameChat(chatId, newTitle);
        if (success) {
            renameChat(chatId, newTitle);
        }
    }, [renameChat]);

    const handleTogglePinChat = useCallback(async (chatId: string) => {
        const chatItem = chatHistory.find(item => item.chatId === chatId);
        if (chatItem) {
            const success = await chatService.togglePinChat(chatId, !chatItem.isPinned);
            if (success) {
                togglePinChat(chatId);
            }
        }
    }, [chatHistory, togglePinChat]);

    const handleLoadMoreHistory = useCallback(async () => {
        const now = Date.now();
        if (now - loadMoreGateTsRef.current < 500) return;
        loadMoreGateTsRef.current = now;
        if (loadingMoreHistory || !hasMoreHistory) return;
        try {
            setLoadingMoreHistory(true);
            const more = await chatService.getChatList(lastUpdatedAt, 20);
            const moreNonPinned = more.filter(item => !item.isPinned);
            const pinned = chatHistory.filter(item => item.isPinned);
            const existingNonPinned = chatHistory.filter(item => !item.isPinned);
            const existingIds = new Set(existingNonPinned.map(i => i.chatId));
            const mergedNonPinned = [...existingNonPinned];
            for (const item of moreNonPinned) {
                if (!existingIds.has(item.chatId)) mergedNonPinned.push(item);
            }
            const updatedHistory = [...pinned, ...mergedNonPinned];
            updateChatHistory(updatedHistory);
            setHasMoreHistory(moreNonPinned.length > 0);
            if (moreNonPinned?.length > 0) {
                const lastItem = mergedNonPinned[mergedNonPinned.length - 1];
                setLastUpdatedAt(lastItem.updatedAt);
            } else {
                setLastUpdatedAt(undefined);
            }
        } catch (error) {
            console.error('Failed to load more history:', error);
        } finally {
            setLoadingMoreHistory(false);
        }
    }, [loadingMoreHistory, hasMoreHistory, lastUpdatedAt, chatHistory, updateChatHistory]);

    const showInput = useMemo(() => !!currentChatId, [currentChatId]);

    const value: ChatContextType = {
        messages,
        chatHistory,
        currentChatId,
        isLoading,
        sessionId,
        wsConnected,
        hasMoreHistory,
        loadingMoreHistory,
        handleSendMessage,
        handleEditMessage,
        handleCopyMessage,
        handleRegenerateMessage,
        handleNewChat,
        handleSelectChat,
        handleDeleteChat,
        handleRenameChat,
        handleTogglePinChat,
        handleLoadMoreHistory,
        showInput,
        moleculePanelState,
        handleMoleculePanelClose,
        handleMoleculeClick,
        handleFindSimilar,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;


