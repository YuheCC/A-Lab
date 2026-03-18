import React, { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'umi';

interface HistoryItemProps {
  /** 对话ID */
  chatId: number;
  /** 对话标题 */
  title: string;
  /** 是否置顶 */
  isPinned?: boolean;
  /** 是否为当前会话（高亮） */
  isActive?: boolean;
  /** 点击对话标题的回调 */
  onChatClick?: (chatId: number) => void;
  /** 重命名对话的回调 */
  onRename?: (chatId: number, newTitle: string) => void;
  /** 切换置顶状态的回调 */
  onTogglePin?: (chatId: number) => void;
  /** 删除对话的回调 */
  onDelete?: (chatId: number) => void;
}

const HistoryItem: FC<HistoryItemProps> = ({
  chatId,
  title,
  isPinned = false,
  isActive = false,
  onChatClick,
  onRename,
  onTogglePin,
  onDelete,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const [tooltipTypography, setTooltipTypography] = useState({
    color: 'black',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '1.3',
    letterSpacing: 'normal',
  });

  const isMenuOpen = Boolean(anchorEl);

  // 重命名时自动聚焦输入框
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const updateTitleOverflow = () => {
      const titleElement = titleRef.current;
      if (!titleElement) return;
      setIsTitleOverflowing(titleElement.scrollWidth > titleElement.clientWidth);
      const computedStyle = window.getComputedStyle(titleElement);
      setTooltipTypography({
        color: computedStyle.color || 'black',
        fontFamily: computedStyle.fontFamily || 'inherit',
        fontSize: computedStyle.fontSize || '12px',
        fontWeight: computedStyle.fontWeight || '400',
        lineHeight: computedStyle.lineHeight || '1.3',
        letterSpacing: computedStyle.letterSpacing || 'normal',
      });
    };

    updateTitleOverflow();
    window.addEventListener('resize', updateTitleOverflow);

    return () => {
      window.removeEventListener('resize', updateTitleOverflow);
    };
  }, [title, isRenaming, isActive]);

  const handleChatClick = (e: React.MouseEvent) => {
    // 防止事件冒泡到li元素
    if ((e.target as HTMLElement).closest('.chat-menu-btn') || 
        (e.target as HTMLElement).closest('.chat-rename-input')) {
      return;
    }
    e.preventDefault();
    // 先更新状态，确保立即反映选中状态
    onChatClick?.(chatId);
    // 然后进行路由跳转
    navigate(`/ask/${chatId}`);
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
    <li 
      className={`${isPinned ? 'pinned' : ''} ${isActive ? 'active' : ''}`.trim()}
      onClick={handleChatClick}
      style={{ cursor: 'pointer' }}
    >
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
        <Tooltip
          title={isTitleOverflowing ? title : ''}
          placement="right"
          arrow
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: 'white',
                color: tooltipTypography.color,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: tooltipTypography.fontFamily,
                fontSize: tooltipTypography.fontSize,
                fontWeight: tooltipTypography.fontWeight,
                lineHeight: tooltipTypography.lineHeight,
                letterSpacing: tooltipTypography.letterSpacing,
                maxWidth: 360,
                border: 'none',
              },
              '& .MuiTooltip-arrow': {
                color: 'white',
              },
            },
          }}
          disableHoverListener={!isTitleOverflowing}
          disableFocusListener={!isTitleOverflowing}
          disableTouchListener={!isTitleOverflowing}
        >
          <span
            ref={titleRef}
            className={`recent-chat ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            data-chat-id={chatId}
          >
            {title}
          </span>
        </Tooltip>
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
          {t('chatbox.chat.historyItem.rename')}
        </MenuItem>
        <MenuItem onClick={handleTogglePin} sx={{ fontSize: '13px', padding: '10px 16px' }}>
          {isPinned ? t('chatbox.chat.historyItem.unpin') : t('chatbox.chat.historyItem.pin')}
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
          {t('chatbox.chat.historyItem.delete')}
        </MenuItem>
      </Menu>
    </li>
  );
};

export default HistoryItem;
