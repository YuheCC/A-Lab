import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { chatService } from '@/services/chat/chatService';
import { useChatContext } from '../../context/ChatContext';

interface ChatSearchModalProps {
    onSelectChat?: (chatId: string) => void;
    onNewChat?: () => void;
}

const ChatSearchModal = forwardRef<{ show: () => void; hide: () => void }, ChatSearchModalProps>((props, ref) => { 
    const { t } = useTranslation();
    const { chatHistory } = useChatContext();
    const [show, setShow] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ chatId: string; title: string }[]>([]);
    const debounceTimer = useRef<number | null>(null);
    
    useImperativeHandle(ref, () => ({
        show: () => setShow(true),
        hide: () => setShow(false)
    }));

    // 处理点击浮层外区域关闭
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // 如果点击的是最外层的遮罩层，则关闭弹窗
        if (e.target === e.currentTarget) {
            setShow(false);
        }
    };

    const visibleRecent = useMemo(() => {
        const recent = (chatHistory || []).filter(i => !i.isPinned).slice(0, 10);
        return recent.map(i => ({ chatId: i.chatId, title: i.title }));
    }, [chatHistory]);

    useEffect(() => {
        if (!show) return;
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }
        if (debounceTimer.current) {
            window.clearTimeout(debounceTimer.current);
        }
        setLoading(true);
        debounceTimer.current = window.setTimeout(async () => {
            try {
                const data = await chatService.searchChats(query);
                setResults(data.map(d => ({ chatId: d.chatId, title: d.title })));
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => {
            if (debounceTimer.current) {
                window.clearTimeout(debounceTimer.current);
                debounceTimer.current = null;
            }
        };
    }, [query, show]);

    const handleSelect = (chatId: string) => {
        setShow(false);
        props.onSelectChat?.(chatId);
        window.location.href = `/chat/${chatId}`;
    };

    const handleNew = () => {
        setShow(false);
        props.onNewChat?.();
    };

    return (
        <>
            <div 
                className={`search-chat-modal ${show ? 'show' : ''}`} 
                id="searchChatModal"
                onClick={handleOverlayClick}
            >
                <div className="search-chat-content">
                    <div className="search-chat-header">
                        <input 
                            type="text" 
                            className="search-chat-input" 
                            placeholder={t('chatbox.chat.searchModal.placeholder')} 
                            id="searchChatInput" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <button onClick={() => setShow(false)} className="search-chat-close" id="searchChatClose">×</button>
                    </div>
                    <div className="search-chat-body">
                        <div 
                            className="search-chat-item new-chat-item"
                            onClick={handleNew}
                        >
                            <svg className="search-chat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>{t('chatbox.chat.newChat')}</span>
                        </div>
                        {query && (
                            <div className="search-chat-section">
                                <div className="search-chat-section-title">{t('chatbox.chat.searchChat')}</div>
                                {loading && (
                                    <div className="search-chat-item" style={{opacity:0.7}}>
                                        <span>加载中...</span>
                                    </div>
                                )}
                                {!loading && results.length === 0 && (
                                    <div className="search-chat-item" style={{opacity:0.7}}>
                                        <span>无结果</span>
                                    </div>
                                )}
                                {!loading && results.map(item => (
                                    <div 
                                        key={item.chatId}
                                        className="search-chat-item"
                                        onClick={() => handleSelect(item.chatId)}
                                    >
                                        <svg className="search-chat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                        </svg>
                                        <span>{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!query && (
                            <div className="search-chat-section">
                                <div className="search-chat-section-title">{t('chatbox.chat.searchModal.recentChats')}</div>
                                {visibleRecent.map(item => (
                                    <div 
                                        key={item.chatId}
                                        className="search-chat-item"
                                        onClick={() => handleSelect(item.chatId)}
                                    >
                                        <svg className="search-chat-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                        </svg>
                                        <span>{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
});

ChatSearchModal.displayName = 'ChatSearchModal';

export default ChatSearchModal;