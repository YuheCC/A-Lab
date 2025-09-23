import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Message, ToolStats } from '@/utils/messageUtils';
import { createAssistantMessage, isAssistantMessage, createUserMessage } from '@/utils/messageUtils';
import type { ChatHistoryItem } from '../components/History';
import { useChat } from '../hooks/useChat';
import { chatService } from '@/services/chat/chatService';
import { globalWebSocketManager } from '@/services/chat/wsService';
import { useMoleculePanel } from '../hooks/useMoleculePanel';
import { authFetch, getAPIUrl } from '@/utils.js';
import { useAuthStore } from '@/models/useAuth';


type ChatMode =
    | 'regular'
    | 'clarify'
    | 'lightning'
    | 'ask'
    | 'ask-oss'
    | 'deep-space'
    | 'deep-space-oss';

const normalizeModeForBackend = (mode: ChatMode): ChatMode => {
    if (mode === 'ask-oss') return 'ask';
    if (mode === 'deep-space-oss') return 'deep-space';
    return mode;
};

interface ModeLimitInfo {
    limit?: number | null;
    remaining?: number | null;
    used?: number | null;
}

interface ModeLimits {
    lightning?: ModeLimitInfo;
    pro?: ModeLimitInfo;
    deepSpace?: ModeLimitInfo;
}

const extractExtraData = (payload: any) => {
    let extraData = payload?.extra_outputs ?? payload?.extra_output ?? payload?.extraData ?? payload?.extra_data;
    if (extraData && typeof extraData === 'object' && 'extra_data' in extraData) {
        extraData = extraData.extra_data;
    }
    return extraData;
};

const extractToolStats = (payload: any): ToolStats | undefined => {
    const statsSource = payload?.tool_stats ?? payload?.toolStats;
    if (!statsSource || typeof statsSource !== 'object') {
        return undefined;
    }

    const parseStat = (value: any): number | undefined => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'number') return value;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const stats: ToolStats = {
        papers_examined: parseStat(statsSource.papers_examined ?? statsSource.papersExamined),
        papers_studied: parseStat(statsSource.papers_studied ?? statsSource.papersStudied),
        molecules_considered: parseStat(statsSource.molecules_considered ?? statsSource.moleculesConsidered)
    };

    if (
        stats.papers_examined === undefined &&
        stats.papers_studied === undefined &&
        stats.molecules_considered === undefined
    ) {
        return undefined;
    }

    return stats;
};

interface ChatContextType {
    messages: Message[];
    chatHistory: ChatHistoryItem[];
    currentChatId?: number;
    isLoading: boolean;
    loadingChatData: boolean;
    sessionId?: string;
    wsConnected: boolean;
    hasMoreHistory: boolean;
    loadingMoreHistory: boolean;
    remainingQueries: number | null;
    remainingLightningQueries: number | null;
    remainingDeepSpaceQueries: number | null;
    modeLimits: ModeLimits;
    fetchQueryLimit: () => Promise<void>;
    handleSendMessage: (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => Promise<void>;
    onSendMessage: (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => Promise<void>;
    handleEditMessage: (messageId: string, newText: string) => void;
    onEditMessage: (messageId: string, newText: string) => void;
    handleMessageUpdate: (messageId: string, newText: string, mode?: ChatMode, extraOptions?: any) => Promise<void>;
    onMessageUpdate: (messageId: string, newText: string, mode?: ChatMode, extraOptions?: any) => Promise<void>;
    handleCopyMessage: (content: string) => void;
    onCopyMessage: (content: string) => void;
    handleRegenerateMessage: (messageId: string, mode?: ChatMode, extraOptions?: any) => Promise<void>;
    onRegenerateMessage: (messageId: string, mode?: ChatMode, extraOptions?: any) => Promise<void>;
    sendMessageUpdate: (messageId: string, message: string, chatId: number, historyMessages: Message[], mode: ChatMode, extraOptions?: any) => Promise<string | undefined>;
    onSendMessageUpdate: (messageId: string, message: string, chatId: number, historyMessages: Message[], mode: ChatMode, extraOptions?: any) => Promise<string | undefined>;
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
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    handleToggleSidebar: () => void;
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
        deleteMessage,
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

    // 侧边栏状态管理
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const {
        state: moleculePanelState,
        hidePanel: handleMoleculePanelClose,
        handleMoleculeClick,
        handleFindSimilar,
    } = useMoleculePanel(setIsSidebarCollapsed);

    const [hasMoreHistory, setHasMoreHistory] = useState(false);
    const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
    const [loadingChatData, setLoadingChatData] = useState(false);
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
    const [remainingQueries, setRemainingQueries] = useState<number | null>(null);
    const [remainingLightningQueries, setRemainingLightningQueries] = useState<number | null>(null);
    const [remainingDeepSpaceQueries, setRemainingDeepSpaceQueries] = useState<number | null>(null);
    const [modeLimits, setModeLimits] = useState<ModeLimits>({});

    // 获取使用次数限制
    const fetchQueryLimit = useCallback(async () => {
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

                const normalizeLimitInfo = (info: any): ModeLimitInfo | undefined => {
                    if (!info && info !== 0) {
                        return undefined;
                    }
                    const limitValue = typeof info?.limit === 'number' ? info.limit : info?.limit === null ? null : undefined;
                    const remainingValue = typeof info?.remaining === 'number' ? info.remaining : info?.remaining === 0 ? 0 : undefined;
                    const usedValue = typeof info?.used === 'number' ? info.used : info?.used === 0 ? 0 : undefined;

                    if (limitValue === undefined && remainingValue === undefined && usedValue === undefined) {
                        return undefined;
                    }

                    return {
                        limit: limitValue ?? null,
                        remaining: remainingValue ?? null,
                        used: usedValue ?? null,
                    };
                };

                const proLimit = normalizeLimitInfo(data?.ask_limits?.high);
                const lightningLimit = normalizeLimitInfo(data?.ask_limits?.low);

                const extractDeepSpaceInfo = (): ModeLimitInfo | undefined => {
                    const possibleContainers = [
                        data?.deep_space_limits,
                        data?.ds_limits,
                        data?.deep_space_limit,
                    ];
                    let deepLimit: number | null | undefined;
                    let deepRemaining: number | null | undefined;

                    for (const container of possibleContainers) {
                        if (deepLimit === undefined && container && typeof container?.limit === 'number') {
                            deepLimit = container.limit;
                        } else if (deepLimit === undefined && container && container?.limit === null) {
                            deepLimit = null;
                        }
                        if (deepRemaining === undefined && container && typeof container?.remaining === 'number') {
                            deepRemaining = container.remaining;
                        }
                    }

                    if (deepRemaining === undefined && typeof data?.ds_limit === 'number') {
                        deepRemaining = data.ds_limit;
                    } else if (deepRemaining === undefined && data?.ds_limit === null) {
                        deepRemaining = null;
                    }

                    if (deepLimit === undefined && typeof data?.ds_limit_total === 'number') {
                        deepLimit = data.ds_limit_total;
                    }

                    if (deepLimit === undefined && deepRemaining === undefined) {
                        return undefined;
                    }

                    return {
                        limit: deepLimit ?? null,
                        remaining: deepRemaining ?? null,
                    };
                };

                const deepSpaceLimit = extractDeepSpaceInfo();

                setModeLimits({
                    pro: proLimit,
                    lightning: lightningLimit,
                    deepSpace: deepSpaceLimit,
                });

                const fallbackProRemaining = typeof data?.query_limit === 'number' ? data.query_limit : null;
                setRemainingQueries(proLimit?.remaining ?? fallbackProRemaining);
                setRemainingLightningQueries(lightningLimit?.remaining ?? null);
                const deepSpaceRemaining = typeof data?.ds_limit === 'number' ? data.ds_limit : deepSpaceLimit?.remaining ?? null;
                setRemainingDeepSpaceQueries(deepSpaceRemaining);
            } else {
                console.error("Failed to fetch query limit");
            }
        } catch (error) {
            console.error("Error fetching query limit:", error);
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
            } else {
                // id 存在但不是数字（如 "new"），按新聊天处理
                startNewChat();
                // 新聊天时也设置会话开始时间
                setSessionStartTime(new Date());
                // 重置 molecular panel 状态
                handleMoleculePanelClose();
            }
        } else {
            startNewChat();
            // 新聊天时也设置会话开始时间
            setSessionStartTime(new Date());
            // 重置 molecular panel 状态
            handleMoleculePanelClose();
        }
    }, [id, loadChatHistory, startNewChat, handleMoleculePanelClose]);

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
                errorMessage = t('chatbox.errors.connectionTimeout');
            } else if ((error as any).message && (error as any).message.includes('connect')) {
                errorMessage = t('chatbox.errors.serverConnectionFailed');
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
            const extraData = extractExtraData(messageBody);
            const toolStats = extractToolStats(messageBody);

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
                
                // 智能匹配现有消息 ID
                // 可能的格式：messageId, assistant-messageId
                const possibleIds = [key, `assistant-${key}`];
                let existingMessage = null;
                let targetId = `assistant-${key}`;
                // 查找现有消息
                for (const possibleId of possibleIds) {
                    existingMessage = messages.find(msg => String(msg.id) === String(possibleId));
                    if (existingMessage) {
                        targetId = possibleId; // 使用已存在的消息 ID
                        break;
                    }
                }
                
                if (!existingMessage) {
                    console.log('WebSocket message creating new message:', key);
                }
                
                // 只有在当前会话开始后的新消息才显示 regenerate
                const isNewSessionMessage = sessionStartTime ? new Date() > sessionStartTime : true;
                
                // 如果找到现有消息，保持其原有的时间戳和其他属性
                const updatedMessage = existingMessage
                    ? {
                        ...existingMessage,
                        content: botChunksRef.current[key],
                        showRegenerate: existingMessage.showRegenerate ?? isNewSessionMessage,
                        ...(extraData ? { extraData } : {}),
                        ...(toolStats ? { toolStats } : {})
                    } as Message
                    : createAssistantMessage(botChunksRef.current[key], targetId, isNewSessionMessage);

                if (extraData) {
                    (updatedMessage as Message).extraData = extraData;
                }
                if (toolStats) {
                    (updatedMessage as Message).toolStats = toolStats;
                }

                // 使用精确更新，避免全量刷新
                upsertMessage(updatedMessage);
            }

            if (extraData && !(isChunk && chunk) && messageId !== undefined && messageId !== null) {
                const key = String(messageId);
                const possibleIds = [key, `assistant-${key}`];
                for (const possibleId of possibleIds) {
                    const existingMessage = messages.find(msg => String(msg.id) === String(possibleId));
                    if (existingMessage) {
                        upsertMessage({ ...existingMessage, extraData });
                        break;
                    }
                }
            }

            if (toolStats && !(isChunk && chunk) && messageId !== undefined && messageId !== null) {
                const key = String(messageId);
                const possibleIds = [key, `assistant-${key}`];
                for (const possibleId of possibleIds) {
                    const existingMessage = messages.find(msg => String(msg.id) === String(possibleId));
                    if (existingMessage) {
                        upsertMessage({ ...existingMessage, toolStats });
                        break;
                    }
                }
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
            setLoadingChatData(true);
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
            // is_running 字段从接口数据中读取，不存在时默认为 false
            const historyMessages = chatData.messages.map((msg, index) => ({
                ...msg,
                showRegenerate: isAssistantMessage(msg) && index === lastAssistantIndex,
                is_running: msg.is_running ?? false // 从接口读取 is_running，不存在时默认为 false
            }));
            
            setMessages(historyMessages);
        } catch (error) {
            console.error('Failed to load chat data:', error);
            // 聊天数据不存在或加载失败时跳转到welcome页面
            navigate('/ask');
        } finally {
            setLoadingChatData(false);
        }
    };

    const triggerMessageByMode = useCallback(async (sessionId: string, mode: ChatMode, chatId: number, historyMessages: Message[], answerId: string, extraOptions?: any) => {
        // 确保传递ragResultsCount
        const finalExtraOptions = { 
            ...extraOptions, 
            numRagResults: ragResultsCount 
        };
        const normalizedMode = normalizeModeForBackend(mode);
        
        if (['regular','lightning','ask'].includes(normalizedMode)) {
            await chatService.triggerMessageAsUser(chatId, answerId, historyMessages, sessionId, ragModel, finalExtraOptions);
        } else if (normalizedMode === 'deep-space') {
            await chatService.triggerMessageAsDeepSpace(chatId, answerId, historyMessages, sessionId, ragModel, finalExtraOptions);
        } else if (normalizedMode === 'clarify') {
            await chatService.triggerMessageAsClarify(chatId, answerId, historyMessages, sessionId, ragModel, finalExtraOptions);
        }
    }, [ragResultsCount, ragModel]);

    // 辅助函数：将聊天记录添加到非置顶位置第一条
    const addOrMoveToTopOfNonPinned = useCallback((chatId: number, title: string) => {
        const newChatItem: ChatHistoryItem = {
            chatId,
            title,
            timestamp: new Date(),
            isPinned: false,
            updatedAt: new Date().toISOString()
        };

        const currentHistory = chatHistory;
        const pinnedItems = currentHistory.filter(item => item.isPinned);
        const nonPinnedItems = currentHistory.filter(item => !item.isPinned);
        
        // 移除可能已存在的相同聊天记录
        const filteredNonPinned = nonPinnedItems.filter(item => item.chatId !== chatId);
        
        // 将新聊天记录添加到非置顶项的第一位
        console.log('newChatItem', newChatItem);
        const updatedHistory = [...pinnedItems, newChatItem, ...filteredNonPinned];
        updateChatHistory(updatedHistory);
    }, [chatHistory, updateChatHistory]);

    const createNewChat = useCallback(async (message: string, mode: ChatMode, extraOptions?: any) => {
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
        
        // 在历史记录的非置顶位置增加新创建的聊天
        if (chatData?.id && chatData?.session_name) {
            addOrMoveToTopOfNonPinned(chatData.id, chatData.session_name);
        }
        
        await triggerMessageByMode(
            sid,
            mode,
            chatData?.id,
            [{ role: 'user', content: message, id: messageData?.id }],
            answerData?.id,
            extraOptions
        );
        return chatData?.id;
    }, [socketId, sessionStartTime, addOrMoveToTopOfNonPinned]);

    const createNewMessage = useCallback(async (message: string, chatId: number, historyMessages: Message[], mode: ChatMode, extraOptions?: any) => {
        const info = globalWebSocketManager.getConnectionInfo();
        const sid = (socketId || (info?.socketId as string) || '') as string;
        const messageData = await chatService.createNewMessage(chatId, message, ragModel);
        const answerData = messageData?.answer || {};
        if(answerData?.id){
            // 当前会话中的新消息应该显示 regenerate
            const isNewSessionMessage = sessionStartTime ? new Date() > sessionStartTime : true;
            addBotMessage(answerData?.content, isNewSessionMessage, `assistant-${answerData?.id}`);
        }
        
        // 在已有聊天发送消息后，将该聊天提升至非置顶位置第一条
        const existingChatItem = chatHistory.find(item => item.chatId === chatId);
        if (existingChatItem && !existingChatItem.isPinned) {
            addOrMoveToTopOfNonPinned(chatId, existingChatItem.title);
        }
        
        await triggerMessageByMode(
            sid,
            mode,
            chatId,
            historyMessages,
            answerData?.id,
            extraOptions
        );
        return messageData?.id;
    }, [socketId, sessionStartTime, chatHistory, addOrMoveToTopOfNonPinned]);

    const sendMessageUpdate = useCallback(async (messageId: string, message: string, chatId: number, historyMessages: Message[], mode: ChatMode, extraOptions?: any) => {
        const info = globalWebSocketManager.getConnectionInfo();
        const sid = (socketId || (info?.socketId as string) || '') as string;
        const messageData = await chatService.updateMessage(chatId, messageId, message, ragModel);
        const answerData = messageData?.answer || {};
        if(answerData?.id){
            // 更新消息应该显示 regenerate
            const isNewSessionMessage = sessionStartTime ? new Date() > sessionStartTime : true;
            addBotMessage(answerData?.content, isNewSessionMessage, `assistant-${answerData?.id}`);
        }
        await triggerMessageByMode(
            sid,
            mode,
            chatId,
            historyMessages,
            answerData?.id,
            extraOptions
        );
        return messageData?.id;
    }, [socketId, sessionStartTime]);

    const handleSendMessage = useCallback(async (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => {
        // 先本地显示用户消息
        const userMsg = createUserMessage(message);
        addUserMessage(userMsg);

        const originalMode = extra?.originalMode as ChatMode | undefined;
        const normalizedMode = normalizeModeForBackend(mode);

        // 从extra参数中提取管理员开关参数
        const extraOptions: Record<string, any> = {
            numRagResults: ragResultsCount,
            llmComputePower: extra?.llmComputePower,
        };
        if (extra) {
            extraOptions.ragEnabled = extra.ragEnabled;
            extraOptions.disableLiteratureSearch = !extra.ragEnabled; // ragEnabled是反向的disableLiteratureSearch
            extraOptions.fullDeepSpace = extra.dump_state;
            extraOptions.toolsEnabled = extra.toolsEnabled;
            extraOptions.patentRagEnabled = extra.patentRagEnabled;
        }

        if (chatId) {
            // 将包含新用户消息的历史传递给后端
            const historyWithNew = [...messages, userMsg];
            createNewMessage(message, chatId, historyWithNew, normalizedMode, extraOptions);
        } else {
            // 从 Welcome 页面创建新聊天时，通过 URL 参数传递 mode
            const newChatId = await createNewChat(message, normalizedMode, extraOptions);
            if (newChatId) {
                const urlMode = originalMode || (normalizedMode === 'clarify' ? 'deep-space' : normalizedMode);
                navigate(`/ask/${newChatId}?mode=${urlMode}`);
            }
        }
    }, [addUserMessage, createNewMessage, messages, createNewChat, navigate, ragResultsCount]);

    const handleEditMessage = useCallback((messageId: string, newText: string) => {
        editMessage(messageId, newText);
    }, [editMessage]);

    const handleMessageUpdate = useCallback(async (messageId: string, newText: string, mode: ChatMode = 'regular', extraOptions?: any) => {
        console.log('handleMessageUpdate', messageId, newText, mode);
        if (!currentChatId) {
            console.error('No current chat ID for message update');
            return;
        }

        try {
            // 找到被修改消息的索引位置
            const messageIndex = messages.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1) {
                console.error('Message not found:', messageId);
                return;
            }

            // 删除该消息之后的所有消息（包括旧的AI回复）
            const messagesToDelete = messages.slice(messageIndex + 1);
            messagesToDelete.forEach(msg => {
                console.log('删除消息:', msg.id, msg.content.substring(0, 50));
                deleteMessage(msg.id);
            });

            // 更新用户消息的内容
            editMessage(messageId, newText);
            
            // 获取更新后的消息列表（只包含修改消息之前的和修改后的消息）
            const updatedHistoryMessages = messages.slice(0, messageIndex + 1).map(msg => 
                msg.id === messageId ? { ...msg, content: newText } : msg
            );
            
            // 调用 sendMessageUpdate 获取新的 AI 回复
            await sendMessageUpdate(messageId, newText, currentChatId, updatedHistoryMessages, mode, extraOptions);
        } catch (error) {
            console.error('Failed to update message:', error);
        }
    }, [editMessage, deleteMessage, messages, currentChatId, sendMessageUpdate]);

    const handleCopyMessage = useCallback((content: string) => {
        navigator.clipboard.writeText(content);
    }, []);

    const handleRegenerateMessage = useCallback(async (messageId: string, mode: ChatMode = 'regular', extraOptions?: any) => {
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
            const targetMessage = messages[messageIndex];
            
            // 提取answerId（去掉 'assistant-' 前缀）
            const answerId = String(messageId).startsWith('assistant-') ? messageId.substring(10) : messageId;
            
            // 清空当前要重新生成的消息内容，显示思考状态，并更新时间戳
            updateMessage(targetMessage.id, {
                content: '',
                showRegenerate: true,
                timestamp: new Date() // 重置时间戳，让倒计时从0开始
            });
            
            // 调用 triggerMessageByMode 进行重新生成
            await triggerMessageByMode(
                sid,
                mode,
                currentChatId,
                historyMessages,
                answerId,
                extraOptions
            );
            
        } catch (error) {
            console.error('Failed to regenerate message:', error);
        } finally {
            setIsLoading(false);
        }
    }, [messages, setIsLoading, updateMessage, socketId, currentChatId, triggerMessageByMode]);

    const handleNewChat = useCallback(() => {
        startNewChat();
        navigate('/ask');
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

    // 处理侧边栏切换
    const handleToggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    const showInput = useMemo(() => !!currentChatId, [currentChatId]);

    const value: ChatContextType = {
        messages,
        chatHistory,
        currentChatId,
        isLoading,
        loadingChatData,
        sessionId,
        wsConnected,
        hasMoreHistory,
        loadingMoreHistory,
        remainingQueries,
        remainingLightningQueries,
        remainingDeepSpaceQueries,
        modeLimits,
        fetchQueryLimit,
        handleSendMessage,
        onSendMessage: (message: string, mode: ChatMode, chatId?: number, extra?: Record<string, any>) => handleSendMessage(message, mode, chatId, extra),
        handleEditMessage,
        onEditMessage: handleEditMessage,
        handleMessageUpdate,
        onMessageUpdate: handleMessageUpdate,
        handleCopyMessage,
        onCopyMessage: handleCopyMessage,
        handleRegenerateMessage,
        onRegenerateMessage: handleRegenerateMessage,
        sendMessageUpdate,
        onSendMessageUpdate: sendMessageUpdate,
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
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        handleToggleSidebar,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;
