import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface MessageContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

interface MessageItem {
  id: string;
  message: string;
  severity: AlertColor;
  duration: number;
}

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const showMessage = useCallback((message: string, severity: AlertColor, duration: number = 3000) => {
    const id = Date.now().toString();
    const newMessage: MessageItem = {
      id,
      message,
      severity,
      duration,
    };

    setMessages(prev => [...prev, newMessage]);

    // 自动移除消息
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, duration);
  }, []);

  const handleClose = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const messageAPI = {
    success: (message: string, duration?: number) => showMessage(message, 'success', duration),
    error: (message: string, duration?: number) => showMessage(message, 'error', duration),
    warning: (message: string, duration?: number) => showMessage(message, 'warning', duration),
    info: (message: string, duration?: number) => showMessage(message, 'info', duration),
  };

  return (
    <MessageContext.Provider value={messageAPI}>
      {children}
      {messages.map((msg, index) => (
        <Snackbar
          key={msg.id}
          open={true}
          autoHideDuration={msg.duration}
          onClose={() => handleClose(msg.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          style={{ 
            top: `${80 + index * 60}px`, // 多条消息时垂直排列
            zIndex: 9999 
          }}
        >
          <Alert 
            onClose={() => handleClose(msg.id)} 
            severity={msg.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {msg.message}
          </Alert>
        </Snackbar>
      ))}
    </MessageContext.Provider>
  );
};

// Hook for using the message context
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}; 