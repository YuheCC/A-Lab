import React, { useState, useRef, useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

// 推荐问题数据
const RECOMMENDED_QUESTIONS = [
    "锂离子电池的电解质溶剂选择有哪些关键考虑因素？",
    "固态电解质在下一代电池技术中的优势和应用前景如何？",
    "SEI层的形成机制及其对电池性能的影响是什么？",
    "高镍正极材料的稳定性问题及解决方案有哪些？",
    "锂枝晶的形成原因及抑制方法有哪些？",
    "钠离子电池与锂离子电池的性能对比如何？",
    "全固态电池的技术挑战和发展前景如何？",
    "电池热管理系统的设计原理和关键技术有哪些？",
    "快充技术对电池寿命的影响及优化策略？",
    "电池回收利用的技术路线和经济性分析？"
];

type ChatMode = 'regular' | 'deep-space';

interface ChatWelcomeProps {
    onSendMessage?: (message: string, mode: ChatMode) => void;
}

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ onSendMessage }) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [currentMode, setCurrentMode] = useState<ChatMode>('regular');
    const [currentQuestions, setCurrentQuestions] = useState<string[]>(
        RECOMMENDED_QUESTIONS.slice(0, 5)
    );
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 处理输入变化
    const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    }, []);

    // 处理键盘事件
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [inputValue, currentMode]);

    // 处理发送消息
    const handleSendMessage = useCallback(() => {
        if (inputValue.trim() && onSendMessage) {
            onSendMessage(inputValue.trim(), currentMode);
            setInputValue('');
        }
    }, [inputValue, currentMode, onSendMessage]);

    // 处理模式切换
    const handleModeChange = useCallback((mode: ChatMode) => {
        setCurrentMode(mode);
    }, []);

    // 处理推荐问题点击
    const handleQuestionClick = useCallback((question: string) => {
        if (onSendMessage) {
            onSendMessage(question, currentMode);
        }
    }, [currentMode, onSendMessage]);

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
        
        const shuffled = [...RECOMMENDED_QUESTIONS].sort(() => 0.5 - Math.random());
        setCurrentQuestions(shuffled.slice(0, 5));
    }, []);

    const isInputEmpty = inputValue.trim().length === 0;

    return (
        <div className='new-chat-interface'>
            <div className="new-chat-content">
                <h2 className="new-chat-title">新聊天</h2>
                <p className="new-chat-subtitle">开始一段新的对话，探索分子宇宙的奥秘</p>
                <div className="new-chat-input-container">
                    <div className="new-chat-input-wrapper">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything, as long as it's about batteries, battery chemistry, or related topics."
                            rows={3}
                        />
                        <div className="new-chat-input-controls">
                            <div className="new-chat-mode-switch">
                                <button 
                                    className={`new-mode-btn ${currentMode === 'regular' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('regular')}
                                    type="button"
                                >
                                    <span>Regular Ask</span>
                                </button>
                                <button 
                                    className={`new-mode-btn ${currentMode === 'deep-space' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('deep-space')}
                                    type="button"
                                >
                                    <span>Deep Space</span>
                                    <span className="beta-badge">Beta</span>
                                </button>
                            </div>
                            <button 
                                className="new-chat-send-btn" 
                                onClick={handleSendMessage}
                                disabled={isInputEmpty}
                                type="button"
                                aria-label="发送消息"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5M12 4.5L6 10.5M12 4.5L18 10.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* 推荐问题区域 */}
                <div className="recommended-questions">
                    {currentQuestions.map((question, index) => (
                        <div 
                            key={`${question}-${index}`}
                            className="recommended-question"
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
                            <span className="question-text">{question}</span>
                        </div>
                    ))}
                </div>
                
                {/* 换一换标签 */}
                <div className="refresh-questions">
                    <button 
                        className="refresh-questions-btn"
                        onClick={handleRefreshQuestions}
                        type="button"
                        aria-label="刷新推荐问题"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span>换一换</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWelcome;