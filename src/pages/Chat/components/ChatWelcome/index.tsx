import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import { useChatContext } from '../../context/ChatContext';
import i18n from '@/locales/i18n';
import { useAuthStore } from '@/models/useAuth';

// 推荐问题数据将从多语言配置中获取

type ChatMode = 'regular' | 'deep-space' | 'clarify';

const ChatWelcome: React.FC = () => {
    const { t } = useTranslation();
    const { handleSendMessage, remainingQueries, remainingDeepSpaceQueries } = useChatContext();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const [inputValue, setInputValue] = useState<string>('');
    const [currentMode, setCurrentMode] = useState<ChatMode>('regular');
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 处理输入变化
    const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    }, []);

    useEffect(() => {
        const shuffled = [...recommendedQuestions].sort(() => 0.5 - Math.random());
        const initialQuestions = shuffled.slice(0, 5);
        setCurrentQuestions(initialQuestions);
    }, [i18n.language]);

    // 处理发送消息
    const handleSendMessageLocal = useCallback(() => {
        const extraPayload: Record<string, any> = {
            ragEnabled: !disableLiterature,
            patentRagEnabled: enablePatentRag,
            toolsEnabled: !disableTools,
        };
        if (currentMode === 'deep-space') {
            extraPayload.dump_state = !!fullDeepSpace;
        }
        handleSendMessage(
            inputValue.trim(),
            (currentMode === "deep-space" ? "clarify" : currentMode) as ChatMode,
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

    // 创建tooltip内容的辅助函数
    const getModeTooltipContent = (mode: ChatMode) => {
        if (mode === 'regular') {
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
                            {t('chatbox.chat.modes.regular')}
                        </h4>
                        {
                            userPermissions === 'research' && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#56B26A',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {t('chatbox.chat.modes.regularRemaining', { count: remainingQueries })}
                                </span>
                            )
                        }
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: '#4b5563',
                        lineHeight: '1.5',
                        fontWeight: '300'
                    }}>
                        {t('chatbox.chat.modes.regularDescription')}
                    </div>
                </div>
            );
        } else {
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
                            {t('chatbox.chat.modes.deepSpace')}
                        </h4>
                        {
                            userPermissions !== 'admin' && (
                                <span style={{
                                    fontSize: '12px',
                                    color: '#56B26A',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {t('chatbox.chat.modes.deepSpaceRemaining', { count: remainingDeepSpaceQueries })}
                                </span>
                            )
                        }        
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: '#4b5563',
                        lineHeight: '1.5',
                        fontWeight: '300'
                    }}>
                        {t('chatbox.chat.modes.deepSpaceDescription')}
                    </div>
                </div>
            );
        }
    };

    // 处理推荐问题点击
    const handleQuestionClick = useCallback((question: string) => {
        if (question && question.trim()) {
            const extraPayload: Record<string, any> = {
                ragEnabled: !disableLiterature,
                patentRagEnabled: enablePatentRag,
                toolsEnabled: !disableTools,
            };
            if (currentMode === 'deep-space') {
                extraPayload.dump_state = !!fullDeepSpace;
            }
            handleSendMessage(question, currentMode === 'deep-space' ? 'clarify' : currentMode, undefined, extraPayload);
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
                                <Tooltip 
                                    title={getModeTooltipContent('regular')} 
                                    placement="bottom" 
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
                                        className={`new-mode-btn ${currentMode === 'regular' ? 'active' : ''}`}
                                        onClick={() => handleModeChange('regular')}
                                        type="button"
                                    >
                                        <span>{t('chatbox.chat.modes.regular')}</span>
                                    </button>
                                </Tooltip>
                                <Tooltip 
                                    title={getModeTooltipContent('deep-space')} 
                                    placement="bottom" 
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
                                        className={`new-mode-btn ${currentMode === 'deep-space' ? 'active' : ''}`}
                                        onClick={() => handleModeChange('deep-space')}
                                        type="button"
                                    >
                                        <span>{t('chatbox.chat.modes.deepSpace')}</span>
                                        <span className="beta-badge">{t('chatbox.chat.modes.betaBadge')}</span>
                                    </button>
                                </Tooltip>
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
                        />
                        Full Deep Space
                      </label>
                    </div>
                  )}
                </div>
                {/* 推荐问题区域 */}
                <div className="recommended-questions">
                    {currentQuestions.map((question, index) => {
                        // 为每个问题分配随机宽度类名，创造错落效果
                        const randomWidthClass = widthClasses[Math.floor(Math.random() * widthClasses.length)];
                        
                        return (
                            <div 
                                key={`${question}-${index}`}
                                className={`recommended-question ${randomWidthClass}`}
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