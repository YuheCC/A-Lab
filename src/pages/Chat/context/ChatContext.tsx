import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Message } from '@/utils/messageUtils';
import { createAssistantMessage, isAssistantMessage, createUserMessage } from '@/utils/messageUtils';
import type { ChatHistoryItem } from '../components/History';
import { useChat } from '../hooks/useChat';
import { chatService } from '@/services/chat/chatService';
import { globalWebSocketManager } from '@/services/chat/wsService';
import { useMoleculePanel } from '../hooks/useMoleculePanel';
import { authFetch, getAPIUrl } from '@/utils.js';
import { useAuthStore } from '@/models/useAuth';

type ChatMode = 'regular' | 'deep-space' | 'clarify';

interface ChatContextType {
    messages: Message[];
    chatHistory: ChatHistoryItem[];
    currentChatId?: number;
    isLoading: boolean;
    sessionId?: string;
    wsConnected: boolean;
    hasMoreHistory: boolean;
    loadingMoreHistory: boolean;
    remainingQueries: number;
    remainingDeepSpaceQueries: number;
    fetchQueryLimit: () => Promise<void>;
    handleSendMessage: (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => Promise<void>;
    onSendMessage: (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => Promise<void>;
    handleEditMessage: (messageId: string, newText: string) => void;
    onEditMessage: (messageId: string, newText: string) => void;
    handleCopyMessage: (content: string) => void;
    onCopyMessage: (content: string) => void;
    handleRegenerateMessage: (messageId: string, mode?: ChatMode) => Promise<void>;
    onRegenerateMessage: (messageId: string, mode?: ChatMode) => Promise<void>;
    handleNewChat: () => void;
    onNewChat: () => void;
    handleSelectChat: (selectedChatId: number) => void;
    onSelectChat: (selectedChatId: number) => void;
    handleDeleteChat: (chatId: number) => Promise<void>;
    onDeleteChat: (chatId: number) => Promise<void>;
    handleRenameChat: (chatId: number, newTitle: string) => Promise<void>;
    onRenameChat: (chatId: number, newTitle: string) => Promise<void>;
    handleTogglePinChat: (chatId: number) => Promise<void>;
    onTogglePinChat: (chatId: number) => Promise<void>;
    handleLoadMoreHistory: () => Promise<void>;
    onLoadMoreHistory: () => Promise<void>;
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
    const navigate = useNavigate();
    const userPermissions = useAuthStore(state => state.userPermissions);

    const {
        messages,
        chatHistory,
        currentChatId,
        isLoading,
        sessionId,
        socketId,
        setSessionId,
        setIsLoading,
        addUserMessage,
        addBotMessage,
        editMessage,
        startNewChat,
        loadChatHistory,
        updateChatHistory,
        setMessages,
        updateMessage: updateMessageFromHook,
        upsertMessage: upsertMessageFromHook,
        deleteChat,
        renameChat,
        togglePinChat,
        sendMessage,
        ragModel,
        ragResultsCount,
        isAdvancedTier
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
    // 分消息ID缓存分片，避免串流到错误消息
    const botChunksRef = useRef<Record<string, string>>({});

    // 用于跟踪当前会话开始时间，区分历史记录和新消息
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

    // 使用从 hook 中获取的精确更新函数
    const updateMessage = updateMessageFromHook;
    const upsertMessage = upsertMessageFromHook;

    // 使用次数相关状态
    const [remainingQueries, setRemainingQueries] = useState(0);
    const [remainingDeepSpaceQueries, setRemainingDeepSpaceQueries] = useState(0);

    // 获取使用次数限制
    const fetchQueryLimit = useCallback(async () => {
        if (userPermissions === 'research' || true) {
            try {
                const API_URL = getAPIUrl();
                const response = await authFetch(`${API_URL}/query_limit`, {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json"
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setRemainingQueries(data.query_limit);
                    setRemainingDeepSpaceQueries(data.ds_limit);
                } else {
                    console.error("Failed to fetch query limit");
                }
            } catch (error) {
                console.error("Error fetching query limit:", error);
            }
        }
    }, [userPermissions]);

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

    // 初始化时获取使用次数
    useEffect(() => {
        fetchQueryLimit();
    }, [fetchQueryLimit]);

    useEffect(() => {
        if (id) {
            const chatId = parseInt(id, 10);
            if (!isNaN(chatId)) {
                loadChatHistory(chatId);
                loadChatData(chatId);
            }
        } else {
            startNewChat();
            // 新聊天时也设置会话开始时间
            setSessionStartTime(new Date());
        }
    }, [id, loadChatHistory, startNewChat]);

    useEffect(() => {
        const unsubscribeConnect = globalWebSocketManager.onConnect(() => {
            setWsConnected(true);
        });

        const unsubscribeDisconnect = globalWebSocketManager.onDisconnect(() => {
            setWsConnected(false);
            setIsLoading(false);
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

        const unsubscribeMessage = globalWebSocketManager.onMessage((raw) => {
            // 新格式可能是 [eventName, payload] 或 payload 直接对象/字符串
            const normalizePayload = (input: any) => {
                if (Array.isArray(input) && input.length >= 2 && typeof input[0] === 'string') {
                    return input[1];
                }
                return input;
            };

            let data: any = normalizePayload(raw);
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) {}
            }

            // 统一拿 chat_id 与消息体
            const incomingChatId = data?.chat_id ?? data?.chatId;
            const messageBody = data?.data ?? data;

            // 若无 chat_id 或与当前会话不匹配，忽略
            if (!incomingChatId || !currentChatId || Number(incomingChatId) !== currentChatId) {
                return;
            }

            // 流式片段或完整答案（必须存在 message_id 才处理）
            // 兼容不同字段名: message_id | id
            const messageId = data?.message_id ?? messageBody?.message_id ?? data?.id ?? messageBody?.id;
            const chunk = messageBody?.chunk ?? messageBody?.answer ?? messageBody?.content ?? messageBody;
            const isChunk = Boolean(messageBody?.chunk || messageBody?.content || typeof chunk === 'string');
            const isDone = Boolean(messageBody?.finished || messageBody?.type === 'done');

            if (isChunk && chunk && messageId !== undefined && messageId !== null) {
                const key = String(messageId);
                botChunksRef.current[key] = (botChunksRef.current[key] || '') + String(chunk);
                const targetId = `assistant-${key}`;
                
                // 只有在当前会话开始后的新消息才显示 regenerate
                const isNewSessionMessage = sessionStartTime ? new Date() > sessionStartTime : true;
                const updatedMessage = createAssistantMessage(botChunksRef.current[key], targetId, isNewSessionMessage);

                // 使用精确更新，避免全量刷新
                upsertMessage(updatedMessage);
            }

            if (isDone) {
                setIsLoading(false);
                if (messageId !== undefined && messageId !== null) {
                    delete botChunksRef.current[String(messageId)];
                }
            }
        });

        return () => {
            unsubscribeConnect();
            unsubscribeDisconnect();
            unsubscribeError();
            unsubscribeMessage();
        };
    }, [setIsLoading, addBotMessage, upsertMessage, messages, t, currentChatId]);

    const loadChatData = async (chatId: number) => {
        try {
            setIsLoading(true);
            const chatData = await chatService.getChatById(chatId);
            
            // 设置当前会话开始时间，用于区分历史记录和新消息
            setSessionStartTime(new Date());
            
            // 找到最后一条助手消息的索引
            let lastAssistantIndex = -1;
            for (let i = chatData.messages.length - 1; i >= 0; i--) {
                if (isAssistantMessage(chatData.messages[i])) {
                    lastAssistantIndex = i;
                    break;
                }
            }
            
            // 处理历史记录消息：只有最后一条助手消息显示 regenerate
            const historyMessages = chatData.messages.map((msg, index) => ({
                ...msg,
                showRegenerate: isAssistantMessage(msg) && index === lastAssistantIndex
            }));
            
            setMessages(historyMessages);
        } catch (error) {
            console.error('Failed to load chat data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const triggerMessageByMode = useCallback(async (sessionId: string, mode: ChatMode, chatId: number, historyMessages: Message[], answerId: string) => {
        if(mode === 'regular'){
            await chatService.triggerMessageAsUser(chatId, answerId, historyMessages, sessionId);
        }else if(mode === 'deep-space'){
            await chatService.triggerMessageAsDeepSpace(chatId, answerId, historyMessages, sessionId);
        }else if(mode === 'clarify'){
            await chatService.triggerMessageAsClarify(chatId, answerId, historyMessages, sessionId);
        }
    }, []);

    const createNewChat = useCallback(async (message: string, mode: ChatMode) => {
        const info = globalWebSocketManager.getConnectionInfo();
        const sid = (socketId || (info?.socketId as string) || '') as string;

        const chatData = await chatService.createChat(message);
        const messageData = await chatService.createNewMessage(chatData?.id, message, ragModel);
        const answerData = messageData?.answer || {};
        if(answerData?.id){
            // 新聊天的消息应该显示 regenerate
            const isNewSessionMessage = sessionStartTime ? new Date() > sessionStartTime : true;
            addBotMessage(answerData?.content, isNewSessionMessage, `assistant-${answerData?.id}`);
        }
        await triggerMessageByMode(
            sid,
            mode,
            chatData?.id,
            [{ role: 'user', content: message, id: messageData?.id }],
            answerData?.id,
        );
        return chatData?.id;
    }, [socketId, sessionStartTime]);

    const createNewMessage = useCallback(async (message: string, chatId: number, historyMessages: Message[], mode: ChatMode) => {
        const info = globalWebSocketManager.getConnectionInfo();
        const sid = (socketId || (info?.socketId as string) || '') as string;
        const messageData = await chatService.createNewMessage(chatId, message, ragModel);
        const answerData = messageData?.answer || {};
        if(answerData?.id){
            // 当前会话中的新消息应该显示 regenerate
            const isNewSessionMessage = sessionStartTime ? new Date() > sessionStartTime : true;
            addBotMessage(answerData?.content, isNewSessionMessage, `assistant-${answerData?.id}`);
        }
        await triggerMessageByMode(
            sid,
            mode,
            chatId,
            historyMessages,
            answerData?.id,
        );
        return messageData?.id;
    }, [socketId, sessionStartTime]);

    const handleSendMessage = useCallback(async (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => {
        // 先本地显示用户消息
        const userMsg = createUserMessage(message);
        addUserMessage(userMsg);
        if (chatId) {
            // 将包含新用户消息的历史传递给后端
            const historyWithNew = [...messages, userMsg];
            createNewMessage(message, chatId, historyWithNew, mode);
        } else {
            const newChatId = await createNewChat(message, mode);
            if (newChatId) {
                navigate(`/chat/${newChatId}`);
            }
        }
    }, [addUserMessage, createNewMessage, messages, createNewChat, navigate]);

    const handleEditMessage = useCallback((messageId: string, newText: string) => {
        editMessage(messageId, newText);
    }, [editMessage]);

    const handleCopyMessage = useCallback((content: string) => {
        navigator.clipboard.writeText(content);
    }, []);

    const handleRegenerateMessage = useCallback(async (messageId: string, mode: ChatMode = 'regular') => {
        try {
            setIsLoading(true);
            
            // 获取 sessionId
            const info = globalWebSocketManager.getConnectionInfo();
            const sid = (socketId || (info?.socketId as string) || '') as string;
            
            // 确保有当前聊天ID
            if (!currentChatId) {
                console.error('No current chat ID for regeneration');
                return;
            }
            
            // 找到要重新生成的消息索引
            const messageIndex = messages.findIndex(msg => msg.id === messageId || msg.id === `assistant-${messageId}`);
            if (messageIndex === -1) {
                console.error('Message not found for regeneration:', messageId);
                return;
            }
            
            // 构建历史消息列表，只包含要重新生成消息之前的消息
            const historyMessages = messages.slice(0, messageIndex);
            
            // 提取answerId（去掉 'assistant-' 前缀）
            const answerId = String(messageId).startsWith('assistant-') ? messageId.substring(10) : messageId;
            
            // 清空当前要重新生成的消息内容，显示思考状态
            const targetMessage = messages[messageIndex];
            updateMessage(targetMessage.id, {
                content: '',
                showRegenerate: true
            });
            
            // 调用 triggerMessageByMode 进行重新生成
            await triggerMessageByMode(
                sid,
                mode,
                currentChatId,
                historyMessages,
                answerId
            );
            
        } catch (error) {
            console.error('Failed to regenerate message:', error);
        } finally {
            setIsLoading(false);
        }
    }, [messages, setIsLoading, updateMessage, socketId, currentChatId, triggerMessageByMode]);

    const handleNewChat = useCallback(() => {
        startNewChat();
        window.location.href = '/chat';
    }, [startNewChat]);

    const handleSelectChat = useCallback((selectedChatId: number) => {
        loadChatHistory(selectedChatId);
    }, [loadChatHistory]);

    const handleDeleteChat = useCallback(async (chatId: number) => {
        const success = await chatService.deleteChat(chatId);
        if (success) {
            deleteChat(chatId);
        }
    }, [deleteChat]);

    const handleRenameChat = useCallback(async (chatId: number, newTitle: string) => {
        const success = await chatService.renameChat(chatId, newTitle);
        if (success) {
            renameChat(chatId, newTitle);
        }
    }, [renameChat]);

    const handleTogglePinChat = useCallback(async (chatId: number) => {
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
        remainingQueries,
        remainingDeepSpaceQueries,
        fetchQueryLimit,
        handleSendMessage,
        onSendMessage: (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => handleSendMessage(message, mode, chatId, extra),
        handleEditMessage,
        onEditMessage: handleEditMessage,
        handleCopyMessage,
        onCopyMessage: handleCopyMessage,
        handleRegenerateMessage,
        onRegenerateMessage: handleRegenerateMessage,
        handleNewChat,
        onNewChat: handleNewChat,
        handleSelectChat,
        onSelectChat: handleSelectChat,
        handleDeleteChat,
        onDeleteChat: handleDeleteChat,
        handleRenameChat,
        onRenameChat: handleRenameChat,
        handleTogglePinChat,
        onTogglePinChat: handleTogglePinChat,
        handleLoadMoreHistory,
        onLoadMoreHistory: handleLoadMoreHistory,
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


