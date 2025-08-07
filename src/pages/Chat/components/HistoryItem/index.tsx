import React, { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';

interface HistoryItemProps {
  /** 对话ID */
  chatId: string;
  /** 对话标题 */
  title: string;
  /** 是否置顶 */
  isPinned?: boolean;
  /** 点击对话标题的回调 */
  onChatClick?: (chatId: string) => void;
  /** 重命名对话的回调 */
  onRename?: (chatId: string, newTitle: string) => void;
  /** 切换置顶状态的回调 */
  onTogglePin?: (chatId: string) => void;
  /** 删除对话的回调 */
  onDelete?: (chatId: string) => void;
}

const HistoryItem: FC<HistoryItemProps> = ({
  chatId,
  title,
  isPinned = false,
  onChatClick,
  onRename,
  onTogglePin,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  // 重命名时自动聚焦输入框
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onChatClick?.(chatId);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameStart = () => {
    setIsRenaming(true);
    setTempTitle(title);
    handleMenuClose();
  };

  const handleRenameConfirm = () => {
    if (tempTitle.trim() && tempTitle !== title) {
      onRename?.(chatId, tempTitle.trim());
    }
    setIsRenaming(false);
    setTempTitle(title);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setTempTitle(title);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameConfirm();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleTogglePin = () => {
    onTogglePin?.(chatId);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(chatId);
    handleMenuClose();
  };

  return (
    <li className={isPinned ? 'pinned' : ''}>
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onBlur={handleRenameConfirm}
          onKeyDown={handleRenameKeyDown}
          className="chat-rename-input"
        />
      ) : (
        <a
          href="#"
          className="recent-chat"
          data-chat-id={chatId}
          onClick={handleChatClick}
        >
          {title}
        </a>
      )}
      
      <IconButton
        size="small"
        onClick={handleMenuClick}
        className="chat-menu-btn"
        sx={{
          opacity: 0,
          marginLeft: '4px',
          padding: '4px',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        ⋯
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: '140px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <MenuItem onClick={handleRenameStart} sx={{ fontSize: '13px', padding: '10px 16px' }}>
          修改名称
        </MenuItem>
        <MenuItem onClick={handleTogglePin} sx={{ fontSize: '13px', padding: '10px 16px' }}>
          {isPinned ? '取消置顶' : '置顶'}
        </MenuItem>
        <MenuItem 
          onClick={handleDelete} 
          sx={{ 
            fontSize: '13px', 
            padding: '10px 16px',
            color: '#dc2626',
            '&:hover': {
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
            },
          }}
        >
          删除对话
        </MenuItem>
      </Menu>
    </li>
  );
};

export default HistoryItem;