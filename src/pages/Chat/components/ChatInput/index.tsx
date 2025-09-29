import React, { useState, useRef, useCallback } from 'react';
import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import InfoTooltip, { InfoTooltipContent } from '@/components/InfoTooltip';
import { useChatContext } from '../../context/ChatContext';
import { useAuthStore } from '@/models/useAuth';
import { getRemainingFromLimitInfo } from '@/utils/queryLimit';

type ChatMode =
  | 'regular'
  | 'clarify'
  | 'lightning'
  | 'ask'
  | 'ask-oss'
  | 'deep-space'
  | 'deep-space-oss';

const ADMIN_MODE_SEQUENCE: ChatMode[] = ['lightning', 'ask', 'ask-oss', 'deep-space', 'deep-space-oss'];
const STANDARD_MODE_SEQUENCE: ChatMode[] = ['lightning', 'ask', 'deep-space'];
const DEEP_SPACE_MODES: ChatMode[] = ['deep-space', 'deep-space-oss'];
const computePowerMap: Record<ChatMode, string> = {
  lightning: 'medium',
  ask: 'high',
  'ask-oss': 'oss-120b',
  'deep-space': 'high',
  'deep-space-oss': 'oss-120b',
  regular: 'high',
  clarify: 'high'
};
const backendModeMap: Record<ChatMode, ChatMode> = {
  lightning: 'lightning',
  ask: 'ask',
  'ask-oss': 'ask',
  'deep-space': 'deep-space',
  'deep-space-oss': 'deep-space',
  regular: 'regular',
  clarify: 'clarify'
};
const isDeepSpaceMode = (mode: ChatMode) => DEEP_SPACE_MODES.includes(mode);

type PublicFeatureKey = 'askInput' | 'lightning' | 'pro' | 'deepSpace';

const modeToPublicFeature: Partial<Record<ChatMode, PublicFeatureKey>> = {
  lightning: 'lightning',
  ask: 'pro',
  'ask-oss': 'pro',
  'deep-space': 'deepSpace',
  'deep-space-oss': 'deepSpace',
};

interface ChatInputProps {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputLocked?: boolean;
}

const ChatInput: FC<ChatInputProps> = ({
  placeholder,
  disabled = false,
  className = '',
  inputLocked = false,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { handleSendMessage, currentChatId, messages, remainingDeepSpaceQueries, modeLimits } = useChatContext();
  const userPermissions = useAuthStore(state => state.userPermissions);
  const isAdmin = userPermissions === 'admin';
  const defaultPlaceholder = placeholder || (inputLocked ? t('chatbox.input.placeholderPublic') : t('chatbox.input.placeholder'));
  const [inputValue, setInputValue] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialMode: ChatMode = isAdmin ? 'ask' : 'lightning';
  const [currentMode, setCurrentMode] = useState<ChatMode>(initialMode);

  // 管理员参数（参考 Ask 页）
  const [ignoreChatHistory, setIgnoreChatHistory] = useState<boolean>(false);
  const [disableLiteratureSearch, setDisableLiteratureSearch] = useState<boolean>(false);
  const [fullDeepSpace, setFullDeepSpace] = useState<boolean>(false);
  const [enablePatentRag, setEnablePatentRag] = useState<boolean>(false);
  const [disableTools, setDisableTools] = useState<boolean>(false);
  const [publicNotice, setPublicNotice] = useState<string | null>(null);
  const publicNoticeTimerRef = useRef<number | null>(null);

  const getFeatureLabel = useCallback((feature: PublicFeatureKey) => (
    t(`chatbox.publicAccess.features.${feature}` as any)
  ), [t]);

  const buildPublicBannerMessage = useCallback((feature: PublicFeatureKey) => (
    t('chatbox.publicAccess.bannerMessage', { feature: getFeatureLabel(feature) })
  ), [getFeatureLabel, t]);

  const clearPublicNoticeTimer = useCallback(() => {
    if (publicNoticeTimerRef.current) {
      window.clearTimeout(publicNoticeTimerRef.current);
      publicNoticeTimerRef.current = null;
    }
  }, []);

  const dismissPublicNotice = useCallback(() => {
    clearPublicNoticeTimer();
    setPublicNotice(null);
  }, [clearPublicNoticeTimer]);

  const showPublicNotice = useCallback((feature: PublicFeatureKey) => {
    const message = buildPublicBannerMessage(feature);
    setPublicNotice(message);
    clearPublicNoticeTimer();
    publicNoticeTimerRef.current = window.setTimeout(() => {
      setPublicNotice(null);
      publicNoticeTimerRef.current = null;
    }, 4000);
  }, [buildPublicBannerMessage, clearPublicNoticeTimer]);

  React.useEffect(() => {
    return () => {
      clearPublicNoticeTimer();
    };
  }, [clearPublicNoticeTimer]);

  // 更新按钮状态
  React.useEffect(() => {
    setIsButtonEnabled(inputValue.trim().length > 0 && !disabled && !inputLocked);
  }, [inputValue, disabled, inputLocked]);

  // 从 URL 参数读取 mode 并设置，读取后删除参数
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlMode = searchParams.get('mode');

    const allowedModes: ChatMode[] = ['deep-space', 'deep-space-oss', 'clarify', 'lightning', 'ask', 'ask-oss'];
    const normalizedMode = (urlMode === 'regular' ? 'ask' : urlMode) as ChatMode | null;
    if (normalizedMode && allowedModes.includes(normalizedMode)) {
      console.log('URL mode detected:', normalizedMode);
      setCurrentMode(normalizedMode);
      
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
    if (inputLocked) {
      showPublicNotice('askInput');
      return;
    }
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
    if (inputLocked) {
      showPublicNotice('askInput');
      return;
    }
    if (inputValue.trim() && isButtonEnabled) {
      // 组装附加参数，透传到后端
      const extraPayload: Record<string, any> = {
        ignoreChatHistory,
        ragEnabled: !disableLiteratureSearch,
        patentRagEnabled: enablePatentRag,
        toolsEnabled: !disableTools,
        originalMode: currentMode,
      };
      if (isDeepSpaceMode(currentMode)) {
        extraPayload.dump_state = !!fullDeepSpace;
      }
      extraPayload.llmComputePower = computePowerMap[currentMode];
      const backendMode = backendModeMap[currentMode];
      let mode: ChatMode = backendMode;
      // 如果是deep-space模式且有消息历史，默认使用clarify模式
      if(backendMode === 'deep-space' && messages.length > 0 && messages[messages.length - 1].msg_type === 'multi-agent-clarify'){
        mode = 'clarify';
      }
      handleSendMessage(inputValue.trim(), mode, currentChatId, extraPayload);
      setInputValue('');
    }
  };

  const handleModeChange = useCallback((mode: ChatMode) => {
    if (inputLocked) {
      const feature = modeToPublicFeature[mode];
      if (feature) {
        showPublicNotice(feature);
      }
      return;
    }
    setCurrentMode(mode);
  }, [inputLocked, showPublicNotice]);

  const translationKeyMap: Partial<Record<ChatMode, string>> = {
    'deep-space': 'deepSpace',
    'deep-space-oss': 'deepSpaceOss',
    'ask-oss': 'askOss',
  };

  const getTranslationKey = (mode: ChatMode) => translationKeyMap[mode] || mode;

  const modesToRender = isAdmin ? ADMIN_MODE_SEQUENCE : STANDARD_MODE_SEQUENCE;

  // 创建 tooltip 内容的辅助函数
  const getModeTooltipContent = (mode: ChatMode) => {
    const key = getTranslationKey(mode);
    const title = t(`chatbox.chat.modes.${key}` as any);
    let desc = t(`chatbox.chat.modes.${key}Description` as any);
    if (userPermissions === 'research' && ['ask', 'ask-oss', 'deep-space', 'deep-space-oss'].includes(mode)) {
      const liteNotice = t('chatbox.chat.modes.liteNotice');
      desc = `${desc}${liteNotice}`;
    }

    const getRemainingLabel = () => {
      if (mode === 'lightning') {
        const info = modeLimits.lightning;
        if (info) {
          const limitValue = typeof info.limit === 'number' ? info.limit : null;
          if (limitValue !== null && limitValue > 0) {
            const remainingValue = getRemainingFromLimitInfo(info);
            if (typeof remainingValue === 'number') {
              return t('chatbox.chat.modes.lightningLimitLabel', { remaining: remainingValue, limit: limitValue });
            }
          }
        }
      }
      if (mode === 'ask' || mode === 'ask-oss') {
        const info = modeLimits.pro;
        if (info) {
          const limitValue = typeof info.limit === 'number' ? info.limit : null;
          if (limitValue !== null && limitValue > 0) {
            const remainingValue = getRemainingFromLimitInfo(info);
            if (typeof remainingValue === 'number') {
              return t('chatbox.chat.modes.proLimitLabel', { remaining: remainingValue, limit: limitValue });
            }
          }
        }
      }
      if (isDeepSpaceMode(mode)) {
        const info = modeLimits.deepSpace;
        if (info) {
          const limitValue = typeof info.limit === 'number' ? info.limit : null;
          if (limitValue !== null && limitValue > 0) {
            const remainingValue = typeof info.remaining === 'number' ? info.remaining : undefined;
            if (typeof remainingValue === 'number') {
              return t('chatbox.chat.modes.deepSpaceLimitLabel', { remaining: remainingValue, limit: limitValue });
            }
          }
          if (typeof info.remaining === 'number') {
            return t('chatbox.chat.modes.deepSpaceRemaining', { count: info.remaining });
          }
        } else if (typeof remainingDeepSpaceQueries === 'number') {
          return t('chatbox.chat.modes.deepSpaceRemaining', { count: remainingDeepSpaceQueries });
        }
      }
      return undefined;
    };

    const remaining = getRemainingLabel();
    return (
      <InfoTooltipContent title={title} description={desc} remainingLabel={remaining} />
    );
  };

  // 固定高度由CSS控制，这里不再自适应高度

  return (
    <div className={`chat-input-container ${className}`}>
      {publicNotice && (
        <div className="public-access-banner" role="alert">
          <span>{publicNotice}</span>
          <button
            type="button"
            className="public-access-banner__close"
            onClick={dismissPublicNotice}
            aria-label={t('chatbox.publicAccess.dismiss')}
          >
            ×
          </button>
        </div>
      )}
      <div className="chat-input-wrapper">
        <div className="public-textarea-guard">
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={defaultPlaceholder}
            rows={3}
            disabled={disabled || inputLocked}
            style={{
              resize: 'none',
              overflow: 'auto',
              minHeight: '32px',
              maxHeight: '120px'
            }}
          />
          {inputLocked && (
            <button
              type="button"
              className="public-access-overlay"
              onClick={() => showPublicNotice('askInput')}
              aria-label={buildPublicBannerMessage('askInput')}
            />
          )}
        </div>
        <div className="chat-controls-row">
          <div className="input-mode-switch">

            {modesToRender.map(modeKey => {
              const featureKey = modeToPublicFeature[modeKey];
              return (
                <div key={modeKey} className="mode-btn-wrapper">
                  <InfoTooltip
                    title={getModeTooltipContent(modeKey)}
                    placement="top"
                  >
                    <button
                      className={`mode-btn ${currentMode === modeKey ? 'active' : ''}${inputLocked ? ' public-locked' : ''}`}
                      onClick={() => handleModeChange(modeKey)}
                      type="button"
                      disabled={inputLocked}
                    >
                      <span>{t(`chatbox.chat.modes.${getTranslationKey(modeKey)}` as any)}</span>
                      {userPermissions === 'research' && !inputLocked && ['ask', 'ask-oss', 'deep-space', 'deep-space-oss'].includes(modeKey) && (
                        <span className="lite-badge">{t('chatbox.chat.modes.liteBadge')}</span>
                      )}
                    </button>
                  </InfoTooltip>
                  {inputLocked && featureKey && (
                    <button
                      type="button"
                      className="public-access-overlay mode"
                      onClick={() => showPublicNotice(featureKey)}
                      aria-label={buildPublicBannerMessage(featureKey)}
                    />
                  )}
                </div>
              );
            })}
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
                onChange={(e) => {
                  if (inputLocked) return;
                  setDisableLiteratureSearch(e.target.checked);
                }}
                disabled={disabled || inputLocked}
              />
              <span>{t('chatbox.checkboxes.disableLiteratureSearch')}</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={fullDeepSpace}
                onChange={(e) => {
                  if (inputLocked) return;
                  setFullDeepSpace(e.target.checked);
                }}
                disabled={disabled || !isDeepSpaceMode(currentMode) || inputLocked}
              />
              <span>{t('chatbox.checkboxes.fullDeepSpace')}</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={enablePatentRag}
                onChange={(e) => {
                  if (inputLocked) return;
                  setEnablePatentRag(e.target.checked);
                }}
                disabled={disabled || inputLocked}
              />
              <span>Enable Patent RAG</span>
            </label>
            <label className="option-item">
              <input
                type="checkbox"
                checked={disableTools}
                onChange={(e) => {
                  if (inputLocked) return;
                  setDisableTools(e.target.checked);
                }}
                disabled={disabled || inputLocked}
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
