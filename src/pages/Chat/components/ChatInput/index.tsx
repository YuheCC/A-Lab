import React, { useState, useRef, useCallback } from 'react';
import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import ModeTooltip from '../ModeTooltip';

type ChatMode = 'regular' | 'deep-space';

interface ChatInputProps {
  onSendMessage: (message: string, mode: ChatMode) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const ChatInput: FC<ChatInputProps> = ({
  onSendMessage,
  placeholder,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('chatbox.input.placeholder');
  const [inputValue, setInputValue] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentMode, setCurrentMode] = useState<ChatMode>('regular');
  const [tooltipState, setTooltipState] = useState<{
    isVisible: boolean;
    mode: ChatMode;
    position: { x: number; y: number };
    buttonCenterX?: number;
  }>({
    isVisible: false,
    mode: 'regular',
    position: { x: 0, y: 0 },
    buttonCenterX: undefined
  });
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // 更新按钮状态
  React.useEffect(() => {
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
      onSendMessage(inputValue.trim(), currentMode);
      setInputValue('');
    }
  };

  const handleModeChange = useCallback((mode: ChatMode) => {
    setCurrentMode(mode);
  }, []);

  const handleModeHover = useCallback((mode: ChatMode, event: React.MouseEvent) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const container = button.closest('.chat-input-container');

    if (container) {
      const containerRect = container.getBoundingClientRect();

      const buttonCenterX = rect.left - containerRect.left + rect.width / 2;
      const buttonBottomY = rect.bottom - containerRect.top;

      const tooltipWidth = 280;
      const margin = 10;

      let tooltipX = buttonCenterX - tooltipWidth / 2;
      const tooltipY = buttonBottomY + 8;

      const containerWidth = containerRect.width;

      if (tooltipX < margin) {
        tooltipX = margin;
      }
      if (tooltipX + tooltipWidth > containerWidth - margin) {
        tooltipX = containerWidth - tooltipWidth - margin;
      }
      tooltipX = Math.max(margin, Math.min(tooltipX, containerWidth - tooltipWidth - margin));

      setTooltipState({
        isVisible: true,
        mode,
        position: { x: tooltipX, y: tooltipY },
        buttonCenterX
      });
    }
  }, [hideTimeout]);

  const handleModeLeave = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    const timeout = setTimeout(() => {
      if (!isTooltipHovered) {
        setTooltipState(prev => ({ ...prev, isVisible: false }));
      }
      setHideTimeout(null);
    }, 150);
    setHideTimeout(timeout);
  }, [hideTimeout, isTooltipHovered]);

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setIsTooltipHovered(true);
  }, [hideTimeout]);

  const handleTooltipMouseLeave = useCallback(() => {
    setIsTooltipHovered(false);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    setTooltipState(prev => ({ ...prev, isVisible: false }));
    setHideTimeout(null);
  }, [hideTimeout]);

  // 固定高度由CSS控制，这里不再自适应高度

  return (
    <div className={`chat-input-container ${className}`}>
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={defaultPlaceholder}
          rows={3}
          disabled={disabled}
          style={{
            resize: 'none',
            overflow: 'auto',
            minHeight: '32px',
            maxHeight: '120px'
          }}
        />
        <div className="chat-controls-row">
          <div
            className="input-mode-switch"
            onMouseLeave={handleModeLeave}
          >
            <button
              className={`mode-btn ${currentMode === 'regular' ? 'active' : ''}`}
              onClick={() => handleModeChange('regular')}
              onMouseEnter={(e) => handleModeHover('regular', e)}
              type="button"
            >
              <span>{t('chatbox.chat.modes.regular')}</span>
            </button>
            <button
              className={`mode-btn ${currentMode === 'deep-space' ? 'active' : ''}`}
              onClick={() => handleModeChange('deep-space')}
              onMouseEnter={(e) => handleModeHover('deep-space', e)}
              type="button"
            >
              <span>{t('chatbox.chat.modes.deepSpace')}</span>
              <span className="beta-badge">{t('chatbox.chat.modes.betaBadge')}</span>
            </button>
          </div>
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
      <ModeTooltip
        mode={tooltipState.mode}
        isVisible={tooltipState.isVisible}
        position={tooltipState.position}
        buttonCenterX={tooltipState.buttonCenterX}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
    </div>
  );
};

export default ChatInput;
