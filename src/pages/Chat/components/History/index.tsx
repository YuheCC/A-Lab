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
  updatedAt?: string; // 原始的updated_at字符串，用于分页
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
  const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreDebounceTimerRef = useRef<number | null>(null);
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
      // 若当前不允许加载，清理观察器与任何待执行的防抖定时器
      if (!hasMore || loadingMore) {
          if (observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
          }
          if (loadMoreDebounceTimerRef.current) {
              window.clearTimeout(loadMoreDebounceTimerRef.current);
              loadMoreDebounceTimerRef.current = null;
          }
          return;
      }

      const rootEl = listRef.current;
      const sentinelEl = sentinelRef.current;
      if (!rootEl || !sentinelEl) return;

      const scheduleLoadMore = () => {
          // 双重保护：若已经加载完成或当前正在加载，则不再触发
          if (!hasMore || loadingMore) return;
          if (loadMoreDebounceTimerRef.current) {
              window.clearTimeout(loadMoreDebounceTimerRef.current);
          }
          loadMoreDebounceTimerRef.current = window.setTimeout(() => {
              onLoadMore?.();
              loadMoreDebounceTimerRef.current = null;
          }, 300);
      };

      const observer = new IntersectionObserver(
          (entries) => {
              for (const entry of entries) {
                  if (entry.isIntersecting) {
                      scheduleLoadMore();
                  }
              }
          },
          { root: rootEl, threshold: 0.1 }
      );

      observerRef.current = observer;
      observer.observe(sentinelEl);

      return () => {
          observer.disconnect();
          observerRef.current = null;
          if (loadMoreDebounceTimerRef.current) {
              window.clearTimeout(loadMoreDebounceTimerRef.current);
              loadMoreDebounceTimerRef.current = null;
          }
      };
  }, [hasMore, loadingMore, onLoadMore]);
console.log(currentChatId)
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
                            isActive={String(currentChatId) === String(item.chatId)}
                            onChatClick={handleChatClick}
                            onRename={handleRename}
                            onTogglePin={handleTogglePin}
                            onDelete={handleDelete}
                        />
                    ))}
                    {hasMore && (
                        <li style={{ padding: 0, margin: 0 }}>
                            <div ref={sentinelRef} style={{ height: 1 }} />
                        </li>
                    )}
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