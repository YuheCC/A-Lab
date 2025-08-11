import React from 'react';
import type { FC } from 'react';
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
}

const ChatHistory: FC<ChatHistoryProps> = ({
    history,
    onSelectChat,
    onNewChat,
    currentChatId,
    onDeleteChat,
    onRenameChat,
    onTogglePinChat
}) => {
    const { t } = useTranslation();
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

    return (
        <>
            <nav className="history-nav">
                <p className="history-title">{t('chatbox.chat.historyTitle')}</p>
                <ul>
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
                </ul>
            </nav>
        </>
    );
};

export default ChatHistory;