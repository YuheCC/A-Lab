import { IconButton, Tooltip } from "@mui/material";
import { LoaderCircle, MessageCirclePlus, PanelLeftClose, PanelLeftOpen, Trash, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useChatStore } from "../../providers/chat";
import { useShallow } from "zustand/react/shallow";
import CustomButton from "../CustomButton";

import './ChatHistorySidebar.css'; 

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
    return (
        <div className="confirm-delete-cover" onClick={onCancel}>
            <div className="confirm-delete-chat">
                <h3>Are you sure you want to delete this chat?</h3>
                <div className="confirm-delete-actions">
                 <CustomButton onClick={() => onCancel()} size="small" variant={"outlined"}
                      style={{ marginRight: 10 }}>
                      Cancel
                  </CustomButton>
                 <CustomButton Icon={Trash} onClick={() => onDelete()} size="small"
                      style={{ marginRight: 10 }} color="error">
                      Delete
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}

export const ChatHistorySidebar = ({ compressed = false }) => {

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
                    <Tooltip title="Create New Chat" placement="right" enterNextDelay={5000} enterDelay={500}>
                        <IconButton style={{ marginRight: '8px' }} size="small" onClick={() => createChat("New Chat")}>
                            <MessageCirclePlus size={21}/>
                        </IconButton>
                    </Tooltip>
                     <h2>Your Chats</h2>
                </span>
                <IconButton className="close-sidebar-button" style={{ marginLeft: 'auto' }} onClick={() => setCollapsed(!collapsed)} size="small">
                    {collapsed ? (
                        <div className="open-sidebar-button-wrapper">
                            <div className="open-sidebar-icon" onClick={() => setCollapsed(!collapsed)}>
                                <PanelLeftOpen size={21} />
                            </div>
                            {(compressed === false) && (
                                <div className="open-sidebar-text" onClick={() => setCollapsed(!collapsed)}>
                                    <span>Your Chats</span>
                                </div>
                            )}
                        </div>
                    ): <PanelLeftClose size={21} />}
                </IconButton>
            </div>
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
                    <span className="note">Chat history shows the last 20 chats you've had.</span>
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