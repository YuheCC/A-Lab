import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '@/utils/messageUtils';
import type { ChatHistoryItem } from '../components/History';
import { globalWebSocketManager } from '@/services/chat/wsService';
import { createUserMessage, createAssistantMessage, normalizeServerDateToISOString } from '@/utils/messageUtils';
import { useAuthStore } from '@/models/useAuth';

export interface ChatState {
  messages: Message[];
  chatHistory: ChatHistoryItem[];
  currentChatId: number | undefined;
  isLoading: boolean;
  sessionId: string | undefined;
  socketId?: string;
}

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    chatHistory: [], // 简化：不使用缓存
    currentChatId: undefined,
    isLoading: false,
    sessionId: undefined,
    socketId: undefined
  });

  const userPermissions = useAuthStore(state => state.userPermissions);
  const { t } = useTranslation();

  const setSocketId = useCallback((socketId: string | undefined) => {
    setState(prev => ({ ...prev, socketId }));
  }, []);

  // 在组件初始化时建立WebSocket连接
  useEffect(() => {
    console.log('useChat: 初始化全局WebSocket连接');
    globalWebSocketManager.initialize();

    // 连接成功后，同步 socketId 到本地状态
    const unSubConnect = globalWebSocketManager.onConnect(() => {
      const info = globalWebSocketManager.getConnectionInfo();
      if (info?.socketId) {
        setSocketId(info.socketId);
      }
    });

    // 若初始化时已经连接，立即同步一次
    const initInfo = globalWebSocketManager.getConnectionInfo();
    if (initInfo?.socketId) {
      setSocketId(initInfo.socketId as string);
    }

    // 添加连接状态监控
    const checkConnection = () => {
      const connectionInfo = globalWebSocketManager.getConnectionInfo();
      console.log('WebSocket连接状态:', connectionInfo);
      
      if (!globalWebSocketManager.checkConnectionHealth()) {
        console.warn('WebSocket连接异常，尝试重连...');
        globalWebSocketManager.reconnect();
      }
    };

    // 每30秒检查一次连接状态
    const healthCheckInterval = setInterval(checkConnection, 30000);

    // 清理函数：当组件卸载时不关闭连接，因为这是全局连接
    return () => {
      console.log('useChat: 组件卸载，保持WebSocket连接');
      unSubConnect && unSubConnect();
      clearInterval(healthCheckInterval);
    };
  }, []);

  const setSessionId = useCallback((sessionId: string) => {
    setState(prev => ({ ...prev, sessionId }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const addUserMessage = useCallback((content: string | Message) => {
    const userMessage = typeof content === 'string' ? createUserMessage(content) : content;
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
  }, []);

  const addBotMessage = useCallback((content: string | Message, showRegenerate: boolean = true, id?: string) => {
    const nowIso = new Date().toISOString();
    const rawCreatedAt = typeof content === 'object'
      ? ((content as any)?.createdAt ?? (content as any)?.created_at ?? (content as any)?.savedAt)
      : undefined;
    const normalizedCreatedAt = rawCreatedAt ? normalizeServerDateToISOString(rawCreatedAt as any) : nowIso;
    const computedTimestamp = typeof content === 'object' && (content as Message).timestamp
      ? (content as Message).timestamp
      : new Date(normalizedCreatedAt);

    const botMessage: Message = typeof content === 'string'
      ? { 
          ...createAssistantMessage(content, id, showRegenerate),
          createdAt: nowIso,
          savedAt: nowIso,
        }
      : ({
          ...content,
          id: (content as Message).id || (id || `assistant-${Date.now()}`),
          role: (content as Message).role || 'assistant',
          showRegenerate: (content as Message).showRegenerate ?? showRegenerate,
          timestamp: computedTimestamp,
          createdAt: (content as any)?.createdAt ?? (content as any)?.created_at ?? (content as any)?.savedAt ?? normalizedCreatedAt,
          savedAt: (content as any)?.savedAt ?? normalizedCreatedAt,
        } as Message);
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, botMessage]
    }));
  }, []);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      )
    }));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId)
    }));
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: []
    }));
  }, []);

  const startNewChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChatId: undefined,
      messages: []
    }));
  }, []);

  const loadChatHistory = useCallback((chatId: number) => {
    setState(prev => ({
      ...prev,
      currentChatId: chatId
    }));
  }, []);

  const saveChatHistory = useCallback((chatId: number, title: string) => {
    const newChatItem: ChatHistoryItem = {
      chatId,
      title,
      timestamp: new Date(),
      isPinned: false
    };
    setState(prev => ({
      ...prev,
      chatHistory: [newChatItem, ...prev.chatHistory]
    }));
  }, []);

  const updateChatHistory = useCallback((chatHistory: ChatHistoryItem[]) => {
    setState(prev => ({
      ...prev,
      chatHistory
    }));
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    setState(prev => ({
      ...prev,
      messages
    }));
  }, []);

  // 精确更新特定消息
  const updateMessage = useCallback((messageId: string, updatedMessage: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updatedMessage } : msg
      )
    }));
  }, []);

  // 更新或添加消息
  const upsertMessage = useCallback((message: Message) => {
    setState(prev => {
      const existingIndex = prev.messages.findIndex(msg => msg.id === message.id);
      if (existingIndex !== -1) {
        // 更新现有消息
        const newMessages = [...prev.messages];
        newMessages[existingIndex] = message;
        return { ...prev, messages: newMessages };
      } else {
        // 添加新消息
        return { ...prev, messages: [...prev.messages, message] };
      }
    });
  }, []);

  const deleteChat = useCallback((chatId: number) => {
    setState(prev => ({
      ...prev,
      chatHistory: prev.chatHistory.filter(item => item.chatId !== chatId),
      currentChatId: prev.currentChatId === chatId ? undefined : prev.currentChatId
    }));
  }, []);

  const renameChat = useCallback((chatId: number, newTitle: string) => {
    setState(prev => ({
      ...prev,
      chatHistory: prev.chatHistory.map(item =>
        item.chatId === chatId ? { ...item, title: newTitle } : item
      )
    }));
  }, []);

  const togglePinChat = useCallback((chatId: number) => {
    setState(prev => ({
      ...prev,
      chatHistory: prev.chatHistory.map(item =>
        item.chatId === chatId ? { ...item, isPinned: !item.isPinned } : item
      )
    }));
  }, []);

  const isAdvancedTier = useMemo(() => ['admin', 'enterprise', 'joint'].includes(userPermissions || ''), [userPermissions]  );
  const ragModel = useMemo(() => isAdvancedTier ? 'o3' : 'o4-mini', [isAdvancedTier]);
  const ragResultsCount = useMemo(() => isAdvancedTier ? 10 : 3, [isAdvancedTier]);

  // 发送消息函数，使用全局WebSocket连接
  const sendMessage = useCallback((message: string, mode: 'regular' | 'deep-space' | 'lightning' | 'ask' | 'clarify' = 'regular', extra?: Record<string, any>) => {
    console.log('sendMessage: 发送消息', { message, mode, socketSessionId: state.sessionId, chatId: state.currentChatId });
    
    // 检查连接状态
    const connectionInfo = globalWebSocketManager.getConnectionInfo();
    console.log('发送消息时的连接状态:', connectionInfo);
    
    // 添加用户消息到本地状态
    addUserMessage(message);
    setIsLoading(true);

    // 如果连接不健康，尝试重连
    if (!globalWebSocketManager.checkConnectionHealth()) {
      console.warn('sendMessage: 连接不健康，尝试重连后发送...');
      globalWebSocketManager.reconnect();
      
      // 等待2秒后重试发送
      setTimeout(() => {
        const retrySuccess = globalWebSocketManager.sendMessage({
          message,
          chatId: state.currentChatId ? String(state.currentChatId) : undefined,
          mode
        });
        
        if (!retrySuccess) {
          console.error('sendMessage: 重连后仍然发送失败');
          setIsLoading(false);
          addBotMessage(t('chatbox.errors.networkIssueCheck'), false);
        }
      }, 2000);
      
      return false;
    }

    // 使用全局WebSocket发送消息
    const success = globalWebSocketManager.sendMessage({
      message,
      chatId: state.currentChatId ? String(state.currentChatId) : undefined,
      mode,
      ...(extra || {})
    });

    if (!success) {
      console.error('sendMessage: WebSocket未连接，消息发送失败');
      setIsLoading(false);
      addBotMessage(t('chatbox.errors.networkIssueRetry'), false);
    }

    return success;
  }, [state.sessionId, addUserMessage, setIsLoading, addBotMessage]);

  // 获取WebSocket连接状态
  const isWebSocketConnected = useCallback(() => {
    return globalWebSocketManager.isWebSocketConnected();
  }, []);

  // 简化：移除缓存检查逻辑

  return {
    ...state,
    setSessionId,
    setSocketId,
    setIsLoading,
    addUserMessage,
    addBotMessage,
    editMessage,
    deleteMessage,
    clearChat,
    startNewChat,
    loadChatHistory,
    saveChatHistory,
    updateChatHistory,
    setMessages,
    updateMessage,
    upsertMessage,
    deleteChat,
    renameChat,
    togglePinChat,
    sendMessage,
    isWebSocketConnected,
    ragModel,
    ragResultsCount,
    isAdvancedTier
  };
};
