import { useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import ChatHistory from "../History";
import ChatSearchModal from "../ChatSearchModal";
import type { ChatHistoryItem } from "../History";

interface ChatSiderProps {
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    currentChatId?: string;
    chatHistory: ChatHistoryItem[];
    onDeleteChat?: (chatId: string) => void;
    onRenameChat?: (chatId: string, newTitle: string) => void;
    onTogglePinChat?: (chatId: string) => void;
}

const ChatSider: React.FC<ChatSiderProps> = ({
    onNewChat,
    onSelectChat,
    currentChatId,
    chatHistory,
    onDeleteChat,
    onRenameChat,
    onTogglePinChat
}) => {
    const { t } = useTranslation();
    const [ isSidebarCollapsed, setIsSidebarCollapsed ] = useState(false);
    const searchModalRef = useRef<any>(null);
    
    const handleSearchClick = () => {
        searchModalRef.current.show();
    }
    return (
        <aside className={`chat-sidebar ${isSidebarCollapsed ? 'mini-sidebar' : ''}`} id="chatSidebar">
            <div className="sidebar-top-section">
                <div style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 0 12px 0'}}>
                <div className="ask-title">{t('chatbox.chat.askTitle')}</div>
                <button id="toggleSidebarBtn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="toggle-sidebar-btn" title="Toggle sidebar" style={{background:'none',border:'none',cursor:'pointer',padding:'4px'}}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
                    <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
                    <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/>
                    </svg>
                </button>
                </div>
                {/* Mini模式下的切换按钮 */}
                <button id="miniToggleSidebarBtn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="mini-toggle-btn" title="Toggle sidebar">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
                    <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
                    <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/>
                </svg>
                </button>
                {/* Mini模式下的新聊天按钮 */}
                <a href="#" className="mini-new-chat-btn" id="miniNewChatBtn" title={t('chatbox.chat.newChat')} onClick={(e) => { e.preventDefault(); onNewChat(); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="7" y="3" width="2" height="12" rx="1" fill="currentColor"/>
                    <rect x="2" y="9" width="12" height="2" rx="1" fill="currentColor"/>
                </svg>
                </a>
                {/* Mini模式下的搜索按钮 */}
                <a href="#" className="mini-search-btn" id="miniSearchBtn" title={t('chatbox.chat.searchChat')} onClick={handleSearchClick}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12.5 12.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                </a>
                <div className="sidebar-actions">
                <a href="#" className="new-chat-btn" id="mainNewChatBtn" onClick={(e) => { e.preventDefault(); onNewChat(); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="3" width="2" height="12" rx="1" fill="currentColor"/><rect x="2" y="9" width="12" height="2" rx="1" fill="currentColor"/></svg>
                    <span>{t('chatbox.chat.newChat')}</span>
                </a>
                <a href="#" className="new-chat-btn" id="searchChatBtn" onClick={handleSearchClick}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M12.5 12.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span>{t('chatbox.chat.searchChat')}</span>
                </a>
                </div>
            </div>
            <ChatHistory 
                history={chatHistory}
                onSelectChat={onSelectChat}
                onNewChat={onNewChat}
                currentChatId={currentChatId}
                onDeleteChat={onDeleteChat}
                onRenameChat={onRenameChat}
                onTogglePinChat={onTogglePinChat}
            />
            <ChatSearchModal 
                ref={searchModalRef} 
                onSelectChat={onSelectChat}
                onNewChat={onNewChat}
            />
        </aside>
    )
}

export default ChatSider;