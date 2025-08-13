import { useState, useCallback, useEffect } from 'react';
import type { Message } from '@/utils/messageUtils';
import type { ChatHistoryItem } from '../components/History';
import { globalWebSocketManager } from '@/services/chat/wsService';
import { createUserMessage, createAssistantMessage } from '@/utils/messageUtils';

export interface ChatState {
  messages: Message[];
  chatHistory: ChatHistoryItem[];
  currentChatId: string | undefined;
  isLoading: boolean;
  sessionId: string | undefined;
}

// 全局会话级别缓存
let chatHistoryCache: ChatHistoryItem[] = [];
let isChatHistoryLoaded = false;

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    chatHistory: chatHistoryCache, // 使用缓存初始化
    currentChatId: undefined,
    isLoading: false,
    sessionId: undefined
  });

  // 在组件初始化时建立WebSocket连接
  useEffect(() => {
    console.log('useChat: 初始化全局WebSocket连接');
    globalWebSocketManager.initialize();

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
      clearInterval(healthCheckInterval);
    };
  }, []);

  const setSessionId = useCallback((sessionId: string) => {
    setState(prev => ({ ...prev, sessionId }));
    // 同时设置全局WebSocket管理器的session_id
    globalWebSocketManager.setSessionId(sessionId);
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const userMessage = createUserMessage(content);
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
  }, []);

  const addBotMessage = useCallback((content: string, showRegenerate: boolean = true) => {
    const botMessage = createAssistantMessage(content, undefined, showRegenerate);
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

  const loadChatHistory = useCallback((chatId: string) => {
    setState(prev => ({
      ...prev,
      currentChatId: chatId
    }));
  }, []);

  const saveChatHistory = useCallback((chatId: string, title: string) => {
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
    // 更新缓存
    chatHistoryCache = chatHistory;
    isChatHistoryLoaded = true;
    
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

  const deleteChat = useCallback((chatId: string) => {
    setState(prev => ({
      ...prev,
      chatHistory: prev.chatHistory.filter(item => item.chatId !== chatId),
      currentChatId: prev.currentChatId === chatId ? undefined : prev.currentChatId
    }));
  }, []);

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setState(prev => ({
      ...prev,
      chatHistory: prev.chatHistory.map(item =>
        item.chatId === chatId ? { ...item, title: newTitle } : item
      )
    }));
  }, []);

  const togglePinChat = useCallback((chatId: string) => {
    setState(prev => ({
      ...prev,
      chatHistory: prev.chatHistory.map(item =>
        item.chatId === chatId ? { ...item, isPinned: !item.isPinned } : item
      )
    }));
  }, []);

  // 发送消息函数，使用全局WebSocket连接
  const sendMessage = useCallback((message: string, mode: 'regular' | 'deep-space' = 'regular') => {
    console.log('sendMessage: 发送消息', { message, mode, sessionId: state.sessionId });
    
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
          chatId: state.sessionId,
          mode
        });
        
        if (!retrySuccess) {
          console.error('sendMessage: 重连后仍然发送失败');
          setIsLoading(false);
          addBotMessage('抱歉，网络连接出现问题，请检查网络后重试。', false);
        }
      }, 2000);
      
      return false;
    }

    // 使用全局WebSocket发送消息
    const success = globalWebSocketManager.sendMessage({
      message,
      chatId: state.sessionId,
      mode
    });

    if (!success) {
      console.error('sendMessage: WebSocket未连接，消息发送失败');
      setIsLoading(false);
      addBotMessage('抱歉，网络连接出现问题，请稍后重试。', false);
    }

    return success;
  }, [state.sessionId, addUserMessage, setIsLoading, addBotMessage]);

  // 获取WebSocket连接状态
  const isWebSocketConnected = useCallback(() => {
    return globalWebSocketManager.isWebSocketConnected();
  }, []);

  // 获取缓存状态
  const isChatHistoryCached = useCallback(() => {
    return isChatHistoryLoaded && chatHistoryCache.length > 0;
  }, []);

  return {
    ...state,
    setSessionId,
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
    deleteChat,
    renameChat,
    togglePinChat,
    isChatHistoryCached,
    sendMessage,
    isWebSocketConnected
  };
};
