import React, { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';

interface MessageEditProps {
  originalText: string;
  onSave: (newText: string) => void;
  onCancel: () => void;
}

const MessageEdit: FC<MessageEditProps> = ({ originalText, onSave, onCancel }) => {
  const [editText, setEditText] = useState(originalText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, []);

  const handleSave = () => {
    const newText = editText.trim();
    if (newText && newText !== originalText) {
      onSave(newText);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%'
    }}>
      {/* 取消按钮 */}
      <button
        className="edit-cancel-btn"
        onClick={handleCancel}
        style={{
          padding: '8px',
          background: 'none',
          color: '#6b7280',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          width: '40px',
          height: '40px',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 编辑输入框 */}
      <textarea
        ref={textareaRef}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="edit-input"
        style={{
          flex: 1,
          minHeight: '60px',
          padding: '12px 16px',
          border: '1px solid #56B26A',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'none',
          outline: 'none',
          background: 'white',
          color: '#333',
          boxSizing: 'border-box'
        }}
      />

      {/* 保存按钮 */}
      <button
        className="edit-save-btn"
        onClick={handleSave}
        style={{
          padding: '8px',
          backgroundColor: '#56B26A',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          width: '40px',
          height: '40px',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4a9d5a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#56B26A';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L21 3M21 3L13.5 21L11.25 13.5M21 3L11.25 13.5" />
        </svg>
      </button>
    </div>
  );
};

export default MessageEdit;
