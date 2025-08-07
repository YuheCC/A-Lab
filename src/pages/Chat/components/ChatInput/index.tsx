import React, { useState, useRef, useEffect } from 'react';
import type { FC, ChangeEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const ChatInput: FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = "Ask me anything, as long as it's about batteries, battery chemistry, or related topics.",
  disabled = false,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 更新按钮状态
  useEffect(() => {
    setIsButtonEnabled(inputValue.trim().length > 0 && !disabled);
  }, [inputValue, disabled]);

  // 处理输入变化
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理发送消息
  const handleSendMessage = () => {
    if (inputValue.trim() && isButtonEnabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  return (
    <div className={`chat-input-container ${className}`}>
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          disabled={disabled}
          style={{
            resize: 'none',
            overflow: 'hidden',
            minHeight: '60px',
            maxHeight: '200px'
          }}
        />
        <div className="chat-controls-row">
          <button
            id="send-btn"
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!isButtonEnabled}
            style={{
              opacity: isButtonEnabled ? '1' : '0.6',
              transition: 'opacity 0.2s ease'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5M12 4.5L6 10.5M12 4.5L18 10.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
