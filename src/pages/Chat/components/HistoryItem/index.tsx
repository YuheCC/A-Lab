import React, { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleRenameStart = () => {
    setIsRenaming(true);
    setTempTitle(title);
    setIsMenuOpen(false);
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
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete?.(chatId);
    setIsMenuOpen(false);
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
      
      <button
        className="chat-menu-btn"
        data-chat-id={chatId}
        onClick={handleMenuClick}
      >
        ⋯
      </button>

      {isMenuOpen && (
        <div className="chat-delete-menu" ref={menuRef}>
          <div className="delete-menu-content">
            <button
              className="rename-chat-btn"
              data-chat-id={chatId}
              onClick={handleRenameStart}
            >
              修改名称
            </button>
            <button
              className="pin-chat-btn"
              data-chat-id={chatId}
              onClick={handleTogglePin}
            >
              {isPinned ? '取消置顶' : '置顶'}
            </button>
            <button
              className="delete-chat-btn"
              data-chat-id={chatId}
              onClick={handleDelete}
            >
              删除对话
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default HistoryItem;