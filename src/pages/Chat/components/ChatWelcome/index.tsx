import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import InfoTooltip, { InfoTooltipContent } from '@/components/InfoTooltip';
import { useChatContext } from '../../context/ChatContext';
import { getRemainingFromLimitInfo } from '@/utils/queryLimit';
import i18n from '@/locales/i18n';
import { useAuthStore } from '@/models/useAuth';

// 推荐问题数据将从多语言配置中获取


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

const ChatWelcome: React.FC = () => {
    const { t } = useTranslation();
    const { handleSendMessage, remainingDeepSpaceQueries, modeLimits } = useChatContext();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isAdmin = userPermissions === 'admin';
    const [inputValue, setInputValue] = useState<string>('');
    const initialMode: ChatMode = isAdmin ? 'ask' : 'lightning';
    const [currentMode, setCurrentMode] = useState<ChatMode>(initialMode);
    const [disableLiterature, setDisableLiterature] = useState(false);
    const [fullDeepSpace, setFullDeepSpace] = useState(false);
    const [enablePatentRag, setEnablePatentRag] = useState(false);
    const [disableTools, setDisableTools] = useState(false);
    
    // 从多语言配置获取推荐问题
    const recommendedQuestions = t('chatbox.chat.recommendedQuestions', { returnObjects: true }) as string[];
    const [currentQuestions, setCurrentQuestions] = useState<string[]>(
        recommendedQuestions.slice(0, 5)
    );
    
    // 随机宽度样式类名数组
    const widthClasses = ['width-xs', 'width-sm', 'width-md', 'width-lg', 'width-xl'];
    
    // 为当前问题预分配固定的宽度类名，避免每次渲染时重新计算
    const [questionWidths, setQuestionWidths] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 处理输入变化
    const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    }, []);

    useEffect(() => {
        const shuffled = [...recommendedQuestions].sort(() => 0.5 - Math.random());
        const initialQuestions = shuffled.slice(0, 5);
        setCurrentQuestions(initialQuestions);
        
        // 为新的问题分配固定的宽度类名
        const newWidths = initialQuestions.map(() => 
            widthClasses[Math.floor(Math.random() * widthClasses.length)]
        );
        setQuestionWidths(newWidths);
    }, [i18n.language]);

    // 处理发送消息
    const handleSendMessageLocal = useCallback(() => {
        const extraPayload: Record<string, any> = {
            ragEnabled: !disableLiterature,
            patentRagEnabled: enablePatentRag,
            toolsEnabled: !disableTools,
            originalMode: currentMode,
        };
        if (isDeepSpaceMode(currentMode)) {
            extraPayload.dump_state = !!fullDeepSpace;
        }
        extraPayload.llmComputePower = computePowerMap[currentMode];
        const backendMode = backendModeMap[currentMode];
        const modeToSend: ChatMode = backendMode === 'deep-space' ? 'clarify' : backendMode;
        handleSendMessage(
            inputValue.trim(),
            modeToSend,
            undefined,
            extraPayload
        );
        setInputValue('');
    }, [inputValue, currentMode, disableLiterature, enablePatentRag, disableTools, fullDeepSpace, handleSendMessage]);

    // 处理键盘事件
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessageLocal();
        }
    }, [handleSendMessageLocal]);

    // 处理模式切换
    const handleModeChange = useCallback((mode: ChatMode) => {
        setCurrentMode(mode);
    }, []);

    const translationKeyMap: Partial<Record<ChatMode, string>> = {
        'deep-space': 'deepSpace',
        'deep-space-oss': 'deepSpaceOss',
        'ask-oss': 'askOss',
    };

    const getTranslationKey = (mode: ChatMode) => translationKeyMap[mode] || mode;

    const modesToRender = isAdmin ? ADMIN_MODE_SEQUENCE : STANDARD_MODE_SEQUENCE;

    // 创建tooltip内容的辅助函数
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

    // 处理推荐问题点击
    const handleQuestionClick = useCallback((question: string) => {
        if (question && question.trim()) {
            const extraPayload: Record<string, any> = {
                ragEnabled: !disableLiterature,
                patentRagEnabled: enablePatentRag,
                toolsEnabled: !disableTools,
                originalMode: currentMode,
            };
            if (isDeepSpaceMode(currentMode)) {
                extraPayload.dump_state = !!fullDeepSpace;
            }
            extraPayload.llmComputePower = computePowerMap[currentMode];
            const backendMode = backendModeMap[currentMode];
            const modeToSend: ChatMode = backendMode === 'deep-space' ? 'clarify' : backendMode;
            handleSendMessage(question, modeToSend, undefined, extraPayload);
        }
    }, [currentMode, disableLiterature, enablePatentRag, disableTools, fullDeepSpace, handleSendMessage]);

    // 处理刷新推荐问题
    const handleRefreshQuestions = useCallback(() => {
        // 添加旋转动画效果
        const refreshBtn = document.querySelector('.refresh-questions-btn svg');
        if (refreshBtn) {
            (refreshBtn as HTMLElement).style.transform = 'rotate(360deg)';
            (refreshBtn as HTMLElement).style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                (refreshBtn as HTMLElement).style.transform = 'rotate(0deg)';
            }, 500);
        }
        
        const shuffled = [...recommendedQuestions].sort(() => 0.5 - Math.random());
        const newQuestions = shuffled.slice(0, 5);
        setCurrentQuestions(newQuestions);
        
        // 为新的问题分配固定的宽度类名
        const newWidths = newQuestions.map(() => 
            widthClasses[Math.floor(Math.random() * widthClasses.length)]
        );
        setQuestionWidths(newWidths);
    }, [recommendedQuestions]);

    const isInputEmpty = inputValue.trim().length === 0;

    return (
        <div className='new-chat-interface'>
            <div className="new-chat-content">
                <h2 className="new-chat-title">{t('chatbox.chat.newExpoler')}</h2>
                {/* <p className="new-chat-subtitle">{t('chatbox.chat.newChatSubtitle')}</p> */}
                <div className="new-chat-input-container">
                    <div className="new-chat-input-wrapper">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={t('chatbox.input.placeholder')}
                            rows={3}
                        />
                        <div className="new-chat-input-controls">
                            <div className="new-chat-mode-switch">
                                {modesToRender.map(modeKey => (
                                    <InfoTooltip
                                        key={modeKey}
                                        title={getModeTooltipContent(modeKey)}
                                        placement="bottom"
                                    >
                                        <button
                                            className={`new-mode-btn ${currentMode === modeKey ? 'active' : ''}`}
                                            onClick={() => handleModeChange(modeKey)}
                                            type="button"
                                        >
                                            <span>{t(`chatbox.chat.modes.${getTranslationKey(modeKey)}` as any)}</span>
                                            {userPermissions === 'research' && ['ask', 'ask-oss', 'deep-space', 'deep-space-oss'].includes(modeKey) && (
                                                <span className="lite-badge">{t('chatbox.chat.modes.liteBadge')}</span>
                                            )}
                                        </button>
                                    </InfoTooltip>
                                ))}
                            </div>
                            <button 
                                className="new-chat-send-btn" 
                                onClick={handleSendMessageLocal}
                                disabled={isInputEmpty}
                                type="button"
                                aria-label={t('chatbox.chat.sendMessage')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5M12 4.5L6 10.5M12 4.5L18 10.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Shared checkboxes & admin controls (mirrors Ask view) */}
                <div className="checkbox-group">
                  {userPermissions === 'admin' && (
                    <div className="admin-controls">
                      <div className="admin-controls-label">Admin Controls</div>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={disableLiterature}
                          onChange={(e) => setDisableLiterature(e.target.checked)}
                        />
                        Disable literature search
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={enablePatentRag}
                          onChange={(e) => setEnablePatentRag(e.target.checked)}
                        />
                        Enable Patent RAG
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={disableTools}
                          onChange={(e) => setDisableTools(e.target.checked)}
                        />
                        Disable tools
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={fullDeepSpace}
                          onChange={(e) => setFullDeepSpace(e.target.checked)}
                          disabled={!isDeepSpaceMode(currentMode)}
                        />
                        Full Deep Space
                      </label>
                    </div>
                  )}
                </div>
                {/* 推荐问题区域 */}
                <div className="recommended-questions">
                    {currentQuestions.map((question, index) => {
                        // 使用预分配的固定宽度类名，避免每次渲染时重新计算
                        const widthClass = questionWidths[index] || 'width-md';
                        
                        return (
                            <div 
                                key={`${question}-${index}`}
                                className={`recommended-question ${widthClass}`}
                                onClick={() => handleQuestionClick(question)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleQuestionClick(question);
                                    }
                                }}
                            >
                                <span title={question} className="question-text">{question}</span>
                            </div>
                        );
                    })}
                </div>
                
                {/* 换一换标签 */}
                <div className="refresh-questions">
                    <button 
                        className="refresh-questions-btn"
                        onClick={handleRefreshQuestions}
                        type="button"
                        aria-label={t('chatbox.chat.refreshQuestions')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span>{t('chatbox.chat.refreshQuestions')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWelcome;
