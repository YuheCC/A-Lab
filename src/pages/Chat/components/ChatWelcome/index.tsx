import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
const MAX_SUGGESTIONS = 5;

type SuggestionItem = {
    key: string;
    label: string;
    type: 'chat' | 'fallback';
    chatId?: number;
    widthClass?: string;
};

type PublicFeatureKey = 'askInput' | 'lightning' | 'pro' | 'deepSpace';

const modeToPublicFeature: Partial<Record<ChatMode, PublicFeatureKey>> = {
    lightning: 'lightning',
    ask: 'pro',
    'ask-oss': 'pro',
    'deep-space': 'deepSpace',
    'deep-space-oss': 'deepSpace',
};

const ChatWelcome: React.FC = () => {
    const { t } = useTranslation();
    const {
        handleSendMessage,
        remainingDeepSpaceQueries,
        modeLimits,
        chatHistory,
        handleSelectChat,
    } = useChatContext();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const initialAuthLoaded = useAuthStore(state => state.initialAuthLoaded);
    const isAdmin = userPermissions === 'admin';
    const isPublic = initialAuthLoaded && !isAuthenticated;
    const [inputValue, setInputValue] = useState<string>('');
    const initialMode: ChatMode = isAdmin ? 'ask' : 'lightning';
    const [currentMode, setCurrentMode] = useState<ChatMode>(initialMode);
    const [disableLiterature, setDisableLiterature] = useState(false);
    const [fullDeepSpace, setFullDeepSpace] = useState(false);
    const [enablePatentRag, setEnablePatentRag] = useState(false);
    const [disableTools, setDisableTools] = useState(false);

    const [fallbackSelection, setFallbackSelection] = useState<string[]>([]);
    const [fallbackPoolSize, setFallbackPoolSize] = useState(0);
    const [questionWidths, setQuestionWidths] = useState<string[]>([]);
    const [publicNotice, setPublicNotice] = useState<string | null>(null);
    const publicNoticeTimerRef = useRef<number | null>(null);

    const recommendedQuestions = useMemo(() => {
        const list = t('chatbox.chat.recommendedQuestions', { returnObjects: true }) as string[];
        return Array.isArray(list) ? list.filter(Boolean) : [];
    }, [i18n.language, t]);
    const widthClasses = useMemo(() => ['width-xs', 'width-sm', 'width-md', 'width-lg', 'width-xl'], []);
    const generateWidthClasses = useCallback((count: number) => (
        Array.from({ length: count }, () => widthClasses[Math.floor(Math.random() * widthClasses.length)])
    ), [widthClasses]);

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

    useEffect(() => {
        return () => {
            clearPublicNoticeTimer();
        };
    }, [clearPublicNoticeTimer]);
    useEffect(() => {
        const sanitized = recommendedQuestions;
        const poolSize = isPublic ? Math.min(MAX_SUGGESTIONS, sanitized.length) : sanitized.length;
        setFallbackPoolSize(poolSize);
        if (sanitized.length === 0) {
            setFallbackSelection([]);
            setQuestionWidths([]);
            return;
        }
        if (isPublic) {
            const preset = sanitized.slice(0, MAX_SUGGESTIONS);
            setFallbackSelection(preset);
            setQuestionWidths(generateWidthClasses(preset.length));
            return;
        }
        const shuffled = [...sanitized].sort(() => 0.5 - Math.random());
        const selection = shuffled.slice(0, MAX_SUGGESTIONS);
        setFallbackSelection(selection);
        setQuestionWidths(generateWidthClasses(selection.length));
    }, [generateWidthClasses, isPublic, recommendedQuestions]);

    const [suggestionStart, setSuggestionStart] = useState(0);
    useEffect(() => {
        setSuggestionStart(0);
    }, [chatHistory.length]);

    const chatSuggestions = useMemo(() => {
        if (chatHistory.length === 0) {
            return [];
        }
        const total = chatHistory.length;
        const count = Math.min(MAX_SUGGESTIONS, total);
        const items = [] as typeof chatHistory;
        for (let i = 0; i < count; i += 1) {
            const chat = chatHistory[(suggestionStart + i) % total];
            if (chat) {
                items.push(chat);
            }
        }
        return items;
    }, [chatHistory, suggestionStart]);

    const suggestionItems = useMemo((): SuggestionItem[] => {
        if (chatSuggestions.length > 0) {
            return chatSuggestions.map((chat) => ({
                key: `chat-${chat.chatId}`,
                label: chat.title?.trim() || t('chatbox.chat.untitledChat', 'Untitled chat'),
                type: 'chat' as const,
                chatId: chat.chatId,
                widthClass: 'width-md',
            }));
        }
        return fallbackSelection.map((question, index) => ({
            key: `fallback-${index}`,
            label: question,
            type: 'fallback' as const,
            widthClass: questionWidths[index] || 'width-md',
        }));
    }, [chatSuggestions, fallbackSelection, questionWidths, t]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        if (isPublic) return;
        setInputValue(e.target.value);
    }, [isPublic]);

    const buildExtraPayload = useCallback(() => {
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
        return { extraPayload, modeToSend };
    }, [currentMode, disableLiterature, enablePatentRag, disableTools, fullDeepSpace]);

    const handleSendMessageLocal = useCallback(() => {
        if (isPublic) return;
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        const { extraPayload, modeToSend } = buildExtraPayload();
        handleSendMessage(trimmed, modeToSend, undefined, extraPayload);
        setInputValue('');
    }, [buildExtraPayload, handleSendMessage, inputValue, isPublic]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessageLocal();
        }
    }, [handleSendMessageLocal]);

    const handleModeChange = useCallback((mode: ChatMode) => {
        if (isPublic) {
            const feature = modeToPublicFeature[mode];
            if (feature) {
                showPublicNotice(feature);
            }
            return;
        }
        setCurrentMode(mode);
    }, [isPublic, showPublicNotice]);

    const translationKeyMap: Partial<Record<ChatMode, string>> = {
        'deep-space': 'deepSpace',
        'deep-space-oss': 'deepSpaceOss',
        'ask-oss': 'askOss',
    };

    const getTranslationKey = (mode: ChatMode) => translationKeyMap[mode] || mode;

    const modesToRender = isAdmin ? ADMIN_MODE_SEQUENCE : STANDARD_MODE_SEQUENCE;

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

    const handleSuggestionClick = useCallback((item: SuggestionItem) => {
        if (item.type === 'chat' && typeof item.chatId === 'number') {
            handleSelectChat(item.chatId);
            return;
        }
        if (item.type === 'fallback') {
            if (isPublic) {
                showPublicNotice('askInput');
                return;
            }
            if (item.label.trim()) {
                const { extraPayload, modeToSend } = buildExtraPayload();
                handleSendMessage(item.label.trim(), modeToSend, undefined, extraPayload);
            }
        }
    }, [buildExtraPayload, handleSelectChat, handleSendMessage, isPublic, showPublicNotice]);

    const handleRefreshQuestions = useCallback(() => {
        const refreshBtn = document.querySelector('.refresh-questions-btn svg');
        if (refreshBtn) {
            (refreshBtn as HTMLElement).style.transform = 'rotate(360deg)';
            (refreshBtn as HTMLElement).style.transition = 'transform 0.5s ease';
            window.setTimeout(() => {
                (refreshBtn as HTMLElement).style.transform = 'rotate(0deg)';
            }, 500);
        }
        if (chatHistory.length > 0) {
            if (chatHistory.length > MAX_SUGGESTIONS) {
                setSuggestionStart(prev => (prev + MAX_SUGGESTIONS) % chatHistory.length);
            }
            return;
        }
        const sanitized = recommendedQuestions;
        const poolSize = isPublic ? Math.min(MAX_SUGGESTIONS, sanitized.length) : sanitized.length;
        setFallbackPoolSize(poolSize);
        if (sanitized.length === 0) {
            setFallbackSelection([]);
            setQuestionWidths([]);
            return;
        }
        if (isPublic) {
            const preset = sanitized.slice(0, MAX_SUGGESTIONS);
            setFallbackSelection(preset);
            setQuestionWidths(generateWidthClasses(preset.length));
            return;
        }
        const shuffled = [...sanitized].sort(() => 0.5 - Math.random());
        const selection = shuffled.slice(0, MAX_SUGGESTIONS);
        setFallbackSelection(selection);
        setQuestionWidths(generateWidthClasses(selection.length));
    }, [chatHistory.length, generateWidthClasses, isPublic, recommendedQuestions]);

    const isInputEmpty = inputValue.trim().length === 0;
    const placeholderText = isPublic ? t('chatbox.input.placeholderPublic') : t('chatbox.input.placeholder');

    return (
        <div className='new-chat-interface'>
            <div className="new-chat-content">
                <h2 className="new-chat-title">{t('chatbox.chat.newExpoler')}</h2>
                <div className="new-chat-input-container">
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
                    <div className="new-chat-input-wrapper">
                        <div className="public-textarea-guard">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholderText}
                                rows={3}
                                disabled={isPublic}
                            />
                            {isPublic && (
                                <button
                                    type="button"
                                    className="public-access-overlay"
                                    onClick={() => showPublicNotice('askInput')}
                                    aria-label={buildPublicBannerMessage('askInput')}
                                />
                            )}
                        </div>
                        <div className="new-chat-input-controls">
                            <div className="new-chat-mode-switch">
                                {modesToRender.map(modeKey => {
                                    const featureKey = modeToPublicFeature[modeKey];
                                    return (
                                        <div key={modeKey} className="mode-btn-wrapper">
                                            <InfoTooltip
                                                title={getModeTooltipContent(modeKey)}
                                                placement="bottom"
                                            >
                                                <button
                                                    className={`new-mode-btn ${currentMode === modeKey ? 'active' : ''}${isPublic ? ' public-locked' : ''}`}
                                                    onClick={() => handleModeChange(modeKey)}
                                                    type="button"
                                                    disabled={isPublic}
                                                >
                                                    <span>{t(`chatbox.chat.modes.${getTranslationKey(modeKey)}` as any)}</span>
                                                    {userPermissions === 'research' && !isPublic && ['ask', 'ask-oss', 'deep-space', 'deep-space-oss'].includes(modeKey) && (
                                                        <span className="lite-badge">{t('chatbox.chat.modes.liteBadge')}</span>
                                                    )}
                                                </button>
                                            </InfoTooltip>
                                            {isPublic && featureKey && (
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
                                className="new-chat-send-btn" 
                                onClick={handleSendMessageLocal}
                                disabled={isInputEmpty || isPublic}
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

                <div className="checkbox-group">
                  {userPermissions === 'admin' && (
                    <div className="admin-controls">
                      <div className="admin-controls-label">Admin Controls</div>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={disableLiterature}
                          onChange={(e) => {
                            if (isPublic) return;
                            setDisableLiterature(e.target.checked);
                          }}
                          disabled={isPublic}
                        />
                        Disable literature search
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={enablePatentRag}
                          onChange={(e) => {
                            if (isPublic) return;
                            setEnablePatentRag(e.target.checked);
                          }}
                          disabled={isPublic}
                        />
                        Enable Patent RAG
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={disableTools}
                          onChange={(e) => {
                            if (isPublic) return;
                            setDisableTools(e.target.checked);
                          }}
                          disabled={isPublic}
                        />
                        Disable tools
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={fullDeepSpace}
                          onChange={(e) => {
                            if (isPublic) return;
                            setFullDeepSpace(e.target.checked);
                          }}
                          disabled={isPublic || !isDeepSpaceMode(currentMode)}
                        />
                        Full Deep Space
                      </label>
                    </div>
                  )}
                </div>

                <div className="recommended-questions">
                    {suggestionItems.map((item) => {
                        const isClickable = item.type === 'chat' || (!isPublic && item.type === 'fallback');
                        const widthClass = item.widthClass || 'width-md';
                        return (
                            <div 
                                key={item.key}
                                className={`recommended-question ${widthClass}`}
                                onClick={() => isClickable && handleSuggestionClick(item)}
                                role="button"
                                tabIndex={isClickable ? 0 : -1}
                                aria-disabled={!isClickable}
                                onKeyDown={(e) => {
                                    if (!isClickable) return;
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSuggestionClick(item);
                                    }
                                }}
                            >
                                <span title={item.label} className="question-text">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
                
                <div className="refresh-questions">
                    <button 
                        className="refresh-questions-btn"
                        onClick={handleRefreshQuestions}
                        type="button"
                        aria-label={t('chatbox.chat.refreshQuestions')}
                        disabled={chatHistory.length <= MAX_SUGGESTIONS && fallbackPoolSize <= MAX_SUGGESTIONS}
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
