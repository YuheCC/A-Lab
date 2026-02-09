import { IconButton, Tooltip } from "@mui/material";
import { LoaderCircle, MessageCirclePlus, PanelLeftClose, PanelLeftOpen, Trash, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useChatStore } from "@/models/useChat";
import { useShallow } from "zustand/react/shallow";
import CustomButton from "@/components/CustomButton/index.js";

import './ChatHistorySidebar.less'; 

export const ChatItem = ({ chatId, chatName, isActive, onConfirmDelete, onClick, loading }) => {
    return (
        <Tooltip title={chatName} placement="right" arrow>
            <div className={`chat-item ${isActive ? 'active' : ''}`} onClick={() => onClick(chatId)}>
                {loading ? (<LoaderCircle className="chat-item-loader" size={18} style={{
                    marginRight: '8px',
                    minWidth: '18px'
                }} />) : null}
                <span className="chat-name">{chatName}</span>
                <IconButton
                    style={{ marginLeft: 'auto' }}
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onConfirmDelete(chatId);
                    }}
                >
                    <X size={18} />
                </IconButton>
            </div>
        </Tooltip>
    );
};

const ConfirmDeleteChat = ({ onDelete, onCancel }) => {
    const { t } = useTranslation();
    
    return (
        <div className="confirm-delete-cover" onClick={onCancel}>
            <div className="confirm-delete-chat">
                <h3>{t('chatbox.history.confirmDelete')}</h3>
                <div className="confirm-delete-actions">
                 <CustomButton onClick={() => onCancel()} size="small" variant={"outlined"}
                      style={{ marginRight: 10 }}>
                      {t('chatbox.history.cancel')}
                  </CustomButton>
                 <CustomButton Icon={Trash} onClick={() => onDelete()} size="small"
                      style={{ marginRight: 10 }} color="error">
                      {t('chatbox.history.delete')}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}

export const ChatHistorySidebar = ({ compressed = false }) => {
    const { t } = useTranslation();

    const { createChat, deleteChat, setActiveChat, chatMap, activeChat } = useChatStore(useShallow((state) => ({
        createChat: state.createChat,
        deleteChat: state.deleteChat,
        setActiveChat: state.setActiveChat,
        chatMap: state.chatMap,
        activeChat: state.activeChat,
    })));

    const [chatIdToDelete, setChatIdToDelete] = useState(null);
    const [collapsed, setCollapsed] = useState(true);

    const chatItemsSortedByDate = useMemo(() => (Object.entries(chatMap).sort((a, b) => {
        // Sort by newest first (descending order)
        return new Date(b[1].createdAt) - new Date(a[1].createdAt);
    })), [chatMap]);

    const handleConfirmDelete = (chatId) => {
        setChatIdToDelete(chatId);
    }

    return (
        <div className={`chat-history-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <span className="sidebar-header-content">
                    <Tooltip title={t('chatbox.history.createNewChat')} placement="right" enterNextDelay={5000} enterDelay={500}>
                        <IconButton style={{ marginRight: '8px' }} size="small" onClick={() => createChat(t('chatbox.history.newChat'))}>
                            <MessageCirclePlus size={21}/>
                        </IconButton>
                    </Tooltip>
                     <h2>{t('chatbox.history.title')}</h2>
                </span>
                <IconButton className="close-sidebar-button" style={{ marginLeft: 'auto' }} onClick={() => setCollapsed(!collapsed)} size="small">
                    {collapsed ? (
                        <div className="open-sidebar-button-wrapper">
                            <div className="open-sidebar-icon" onClick={() => setCollapsed(!collapsed)}>
                                <PanelLeftOpen size={21} />
                            </div>
                            {(compressed === false) && (
                                <div className="open-sidebar-text" onClick={() => setCollapsed(!collapsed)}>
                                    <span>{t('chatbox.history.title')}</span>
                                </div>
                            )}
                        </div>
                    ): <PanelLeftClose size={21} />}
                </IconButton>
            </div>
            {collapsed && (
                <div className="collapsed-actions">
                    <Tooltip title={t('chatbox.history.createNewChat')} placement="right" enterNextDelay={5000} enterDelay={500}>
                        <IconButton 
                            style={{marginLeft: '23px'}}
                            className="collapsed-new-chat-button" 
                            size="small" 
                            onClick={() => createChat(t('chatbox.history.newChat'))}
                        >
                            <MessageCirclePlus size={21}/>
                        </IconButton>
                    </Tooltip>
                </div>
            )}
            <div className="chat-history">
                {chatItemsSortedByDate.map(([chatId, chat]) => {
                   return <ChatItem
                        key={chatId}
                        loading={chat.isThinking || chat.moleculesLoading || chat.similarMoleculesLoading}
                        chatId={chatId}
                        onConfirmDelete={handleConfirmDelete}
                        chatName={chat.name}
                        isActive={parseInt(chatId) === parseInt(activeChat)}
                        onClick={() => setActiveChat(chatId)}
                    />
                }
                )}
                <div className="chat-history-footer">
                    <span className="note">{t('chatbox.history.footer')}</span>
                </div>
            </div>
            {chatIdToDelete !== null && (
                <ConfirmDeleteChat 
                    onDelete={() => {
                        deleteChat(chatIdToDelete);
                        setChatIdToDelete(null);
                    }}
                    onCancel={() => setChatIdToDelete(null)}
                />
            )}
        </div>
    );
};