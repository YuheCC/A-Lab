import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import HistoryItem from '../HistoryItem';

// 定义 ChatHistoryItem 类型
export interface ChatHistoryItem {
  chatId: string;
  title: string;
  timestamp: Date;
  isPinned: boolean;
}

interface ChatHistoryProps {
    history: ChatHistoryItem[];
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    currentChatId?: string;
    onDeleteChat?: (chatId: string) => void;
    onRenameChat?: (chatId: string, newTitle: string) => void;
    onTogglePinChat?: (chatId: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loadingMore?: boolean;
}

const ChatHistory: FC<ChatHistoryProps> = ({
    history,
    onSelectChat,
    onNewChat,
    currentChatId,
    onDeleteChat,
    onRenameChat,
    onTogglePinChat,
    onLoadMore,
    hasMore = false,
    loadingMore = false,
}) => {
    const { t } = useTranslation();
    const listRef = useRef<HTMLUListElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const handleChatClick = (chatId: string) => {
        console.log('Chat clicked:', chatId);
        onSelectChat(chatId);
    };

    const handleRename = (chatId: string, newTitle: string) => {
        console.log('Rename chat:', chatId, newTitle);
        if (onRenameChat) {
            onRenameChat(chatId, newTitle);
        }
    };

    const handleTogglePin = (chatId: string) => {
        console.log('Toggle pin status:', chatId);
        if (onTogglePinChat) {
            onTogglePinChat(chatId);
        }
    };

    const handleDelete = (chatId: string) => {
        console.log('Delete chat:', chatId);
        if (onDeleteChat) {
            onDeleteChat(chatId);
        }
    };

    useEffect(() => {
        if (!hasMore || loadingMore) return;
        const rootEl = listRef.current;
        const sentinelEl = sentinelRef.current;
        if (!rootEl || !sentinelEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        onLoadMore?.();
                    }
                }
            },
            { root: rootEl, threshold: 0.1 }
        );

        observer.observe(sentinelEl);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loadingMore, onLoadMore]);

    return (
        <>
            <nav className="history-nav">
                <p className="history-title">{t('chatbox.chat.historyTitle')}</p>
                <ul ref={listRef}>
                    {history.map((item) => (
                        <HistoryItem
                            key={item.chatId}
                            chatId={item.chatId}
                            title={item.title}
                            isPinned={item.isPinned}
                            isActive={currentChatId === item.chatId}
                            onChatClick={handleChatClick}
                            onRename={handleRename}
                            onTogglePin={handleTogglePin}
                            onDelete={handleDelete}
                        />
                    ))}
                    <li style={{ padding: 0, margin: 0 }}>
                        <div ref={sentinelRef} style={{ height: 1 }} />
                    </li>
                    {loadingMore && (
                        <li style={{ textAlign: 'center', padding: '6px 0', color: '#64748b', fontSize: 12 }}>
                            加载中...
                        </li>
                    )}
                </ul>
            </nav>
        </>
    );
};

export default ChatHistory;