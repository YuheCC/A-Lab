import React, { useState, useRef, useCallback } from 'react';
import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Tooltip } from '@mui/material';
import { useChatContext } from '../../context/ChatContext';
import { useAuthStore } from '@/models/useAuth';

type ChatMode = 'regular' | 'deep-space' | 'clarify' | 'lightning' | 'ask'

interface ChatInputProps {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const ChatInput: FC<ChatInputProps> = ({
  placeholder,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { handleSendMessage, currentChatId, messages, remainingQueries, remainingDeepSpaceQueries } = useChatContext();
  const userPermissions = useAuthStore(state => state.userPermissions);
  const defaultPlaceholder = placeholder || t('chatbox.input.placeholder');
  const [inputValue, setInputValue] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialMode: ChatMode = userPermissions === 'admin' ? 'ask' : 'regular';
  const [currentMode, setCurrentMode] = useState<ChatMode>(initialMode);

  // 管理员参数（参考 Ask 页）
  const [ignoreChatHistory, setIgnoreChatHistory] = useState<boolean>(false);
  const [disableLiteratureSearch, setDisableLiteratureSearch] = useState<boolean>(false);
  const [fullDeepSpace, setFullDeepSpace] = useState<boolean>(false);
  const [enablePatentRag, setEnablePatentRag] = useState<boolean>(false);
  const [disableTools, setDisableTools] = useState<boolean>(false);

  // 更新按钮状态
  React.useEffect(() => {
    setIsButtonEnabled(inputValue.trim().length > 0 && !disabled);
  }, [inputValue, disabled]);

  // 从 URL 参数读取 mode 并设置，读取后删除参数
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMode = searchParams.get('mode');

    const allowedModes = ['regular','deep-space','clarify','lightning','ask'];
    if (urlMode && allowedModes.includes(urlMode)) {
      console.log('URL mode detected:', urlMode);
      setCurrentMode(urlMode as ChatMode);
      
      // 删除 URL 参数
      searchParams.delete('mode');
      const newSearch = searchParams.toString();
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
      
      // 使用 replace 而不是 push，这样不会在浏览器历史中留下记录
      navigate(newUrl, { replace: true });
    } else {
      // 如果没有 URL 参数，使用默认的 regular
      // setCurrentMode('regular');
    }
  }, [location.search, location.pathname, navigate]);

  // 处理输入变化
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // e.preventDefault();
      // handleSendMessageLocal();
    }
  };

  // 处理发送消息
  const handleSendMessageLocal = () => {
    if (inputValue.trim() && isButtonEnabled) {
      // 组装附加参数，透传到后端
      const extraPayload: Record<string, any> = {
        ignoreChatHistory,
        ragEnabled: !disableLiteratureSearch,
        patentRagEnabled: enablePatentRag,
        toolsEnabled: !disableTools,
      };
      if (currentMode === 'deep-space') {
        extraPayload.dump_state = !!fullDeepSpace;
      }
      const powerMap: Record<ChatMode, 'low' | 'medium' | 'high'> = {
        lightning: 'medium',
        ask: 'high',
        'deep-space': 'high',
        regular: 'high',
        clarify: 'high'
      };
      extraPayload.llmComputePower = powerMap[currentMode];
      let mode: ChatMode = currentMode;
      // 如果是deep-space模式且有消息历史，默认使用clarify模式
      if(currentMode === 'deep-space' && messages.length > 0 && messages[messages.length - 1].msg_type === 'multi-agent-clarify'){
        mode = 'clarify';
      }
      handleSendMessage(inputValue.trim(), mode, currentChatId, extraPayload);
      setInputValue('');
    }
  };

  const handleModeChange = useCallback((mode: ChatMode) => {
    setCurrentMode(mode);
  }, []);

  const translationKeyMap: Record<string, string> = {
    'deep-space': 'deepSpace',
  };

  const getTranslationKey = (mode: ChatMode) => translationKeyMap[mode] || mode;

  // 创建 tooltip 内容的辅助函数
  const getModeTooltipContent = (mode: ChatMode) => {
    const key = getTranslationKey(mode);
    const title = t(`chatbox.chat.modes.${key}` as any);
    const desc = t(`chatbox.chat.modes.${key}Description` as any);
    let remaining: string | undefined;
    if (mode === 'regular' && userPermissions === 'research') {
      remaining = t('chatbox.chat.modes.regularRemaining', { count: remainingQueries });
    } else if (mode === 'deep-space' && userPermissions !== 'admin') {
      remaining = t('chatbox.chat.modes.deepSpaceRemaining', { count: remainingDeepSpaceQueries });
    }
    return (
      <div style={{ padding: '4px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {title}
          </h4>
          {remaining && (
            <span style={{
              fontSize: '12px',
              color: '#56B26A',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {remaining}
            </span>
          )}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#4b5563',
          lineHeight: '1.5',
          fontWeight: '300'
        }}>
          {desc}
        </div>
      </div>
    );
  };

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
          <div className="input-mode-switch">

            {(userPermissions === 'admin' ? ['lightning','ask','deep-space'] : ['regular','lightning','deep-space']).map(modeKey => (
              <Tooltip
                key={modeKey}
                title={getModeTooltipContent(modeKey as ChatMode)}
                placement="top"
                arrow
                PopperProps={{
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'white',
                      color: 'black',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      maxWidth: 280
                    },
                    '& .MuiTooltip-arrow': {
                      color: 'white',
                    }
                  }
                }}
              >
                <button
                  className={`mode-btn ${currentMode === modeKey ? 'active' : ''}`}
                  onClick={() => handleModeChange(modeKey as ChatMode)}
                  type="button"
                >
                  <span>{t(`chatbox.chat.modes.${getTranslationKey(modeKey as ChatMode)}` as any)}</span>
                  {['deep-space'].includes(modeKey) && (
                    <span className="beta-badge">{t('chatbox.chat.modes.betaBadge')}</span>
                  )}
                </button>
              </Tooltip>
            ))}
          </div>
          <button
            id="send-btn"
            className="send-btn"
            onClick={handleSendMessageLocal}
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
      <div className="chat-input-options" style={{ justifyContent: 'space-between' }}>
        <label className="option-item">
          
        </label>
        {userPermissions === 'admin' && (
          <div className="admin-group">
            <span className="group-title">{t('chatbox.checkboxes.admin')}</span>
            <label className="option-item">
              <input
                type="checkbox"
                checked={disableLiteratureSearch}
                onChange={(e) => setDisableLiteratureSearch(e.target.checked)}
                disabled={disabled}
              />
              <span>{t('chatbox.checkboxes.disableLiteratureSearch')}</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={fullDeepSpace}
                onChange={(e) => setFullDeepSpace(e.target.checked)}
                disabled={disabled || currentMode !== 'deep-space'}
              />
              <span>{t('chatbox.checkboxes.fullDeepSpace')}</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={enablePatentRag}
                onChange={(e) => setEnablePatentRag(e.target.checked)}
                disabled={disabled}
              />
              <span>Enable Patent RAG</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={disableTools}
                onChange={(e) => setDisableTools(e.target.checked)}
                disabled={disabled}
              />
              <span>{t('chatbox.checkboxes.disableTools')}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;