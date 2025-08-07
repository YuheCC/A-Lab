import { useState, useCallback } from 'react';
import type { Message } from '../components/MessageList';
import type { ChatHistoryItem } from '../components/History';

export interface ChatState {
  messages: Message[];
  chatHistory: ChatHistoryItem[];
  currentChatId: string | undefined;
  isLoading: boolean;
}

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    chatHistory: [],
    currentChatId: undefined,
    isLoading: false
  });

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
  }, []);

  const addBotMessage = useCallback((content: string, showRegenerate: boolean = true) => {
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      showRegenerate
    };
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

  return {
    ...state,
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
    setMessages
  };
};
