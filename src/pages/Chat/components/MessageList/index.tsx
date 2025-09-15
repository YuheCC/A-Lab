import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MessageEdit from '../MessageEdit';
import './MessageList.css';
import { InlineMoleculeRenderer } from '@/components/InlineMoleculeRenderer/index.js';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Message, 
  getMessageRole, 
  isUserMessage, 
  isAssistantMessage, 
  isSystemMessage,
  normalizeServerDate
} from '@/utils/messageUtils';

// 检查内容是否包含内联分子的辅助函数
const hasInlineMolecules = (content: string): boolean => {
  return /<inline_molecule>\{.*?\}<\/inline_molecule>/g.test(content);
};

// 自定义消息内容渲染器，用于处理markdown和内联分子
const MessageContentRenderer: React.FC<{ content: string; onMoleculeClick?: (moleculeName: string) => void }> = ({ content, onMoleculeClick }) => {
  // 清理前后空格以避免格式问题
  const trimmedContent = content?.trim() || '';
  
  if (hasInlineMolecules(trimmedContent)) {
    // 如果内容包含内联分子，使用InlineMoleculeRenderer渲染
    return <InlineMoleculeRenderer content={trimmedContent} onMoleculeClick={onMoleculeClick} />;
  } else {
    // 否则直接渲染为普通文本
    return <div style={{ whiteSpace: 'pre-wrap' }}>{trimmedContent}</div>;
  }
};

const SupplementalData: React.FC<{ 
  data: Record<string, any>; 
  onMoleculeClick?: (moleculeName: string) => void;
}> = ({ data, onMoleculeClick }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className={`extra-data-section ${open ? 'open' : ''}`}>
      <div className="extra-data-header" onClick={() => setOpen(!open)}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>{t('chatbox.supplementalData') || 'Supplemental Data'}</span>
      </div>

      {open && (
        <div className="extra-data-wrapper">
          {Object.entries(data).map(([key, value]) => (
            <ExtraDataSection
              key={key}
              title={key}
              content={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onMoleculeClick={onMoleculeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ExtraData展开/折叠组件，用于显示补充信息
const ExtraDataSection: React.FC<{ 
  title: string; 
  content: string; 
  onMoleculeClick?: (moleculeName: string) => void;
}> = ({ title, content, onMoleculeClick }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="extra-data-subsection">
      <div className="extra-data-header" onClick={() => setOpen(!open)}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>{title}</span>
      </div>
      {open && (
        <div className="extra-data-content">
          <MessageContentRenderer content={content} onMoleculeClick={onMoleculeClick} />
        </div>
      )}
    </div>
  );
};

// 使用共享的Message类型，这里不需要重复定义

// 定义组件 Props
interface MessageListProps {
  messages?: Message[];
  onCopyMessage?: (content: string) => void;
  onRegenerateMessage?: (messageId: string, mode?: 'regular' | 'deep-space' | 'clarify' | 'lightning' | 'ask') => void;
  onMoleculeClick?: (moleculeName: string) => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  onMessageUpdate?: (messageId: string, newText: string, mode?: 'regular' | 'deep-space' | 'clarify' | 'lightning' | 'ask') => Promise<void>;
  className?: string;
}

import { useChatContext } from '../../context/ChatContext';
import FeedbackBox from '@/components/FeedbackBox/index.js';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuthStore } from '@/models/useAuth';

const MessageList: FC<MessageListProps> = ({
  messages =  [],
  onCopyMessage,
  onRegenerateMessage,
  onMoleculeClick,
  onEditMessage,
  onMessageUpdate,
  className = ''
}) => {
  const { t } = useTranslation();
  const messageListRef = useRef<HTMLDivElement>(null);
  const {
    messages: ctxMessages,
    handleCopyMessage: ctxHandleCopyMessage,
    handleRegenerateMessage: ctxHandleRegenerateMessage,
    handleMoleculeClick: ctxHandleMoleculeClick,
    handleEditMessage: ctxHandleEditMessage,
    handleMessageUpdate: ctxHandleMessageUpdate,
  } = useChatContext() as any;
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const userPermissions = useAuthStore(state => state.userPermissions);

  // 取上下文消息源
  const resolvedMessages: Message[] = (ctxMessages && ctxMessages.length > 0 ? ctxMessages : messages) as Message[];

  // 滚动到底部的函数
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 计算最后一条用户消息与最后一条助手消息的 id
  const { lastUserId, lastAssistantId } = useMemo(() => {
    let u: string | null = null;
    let a: string | null = null
    for (let i = resolvedMessages.length - 1; i >= 0; i--) {
      const m = resolvedMessages[i] as Message;
      if (!u && isUserMessage(m)) u = m.id;
      if (!a && isAssistantMessage(m)) a = m.id;
      if (u && a) break;
    }
    return { lastUserId: u, lastAssistantId: a };
  }, [resolvedMessages]);

  // 思考中：仅针对最后一条助手消息且内容为空，并且需要显示计时
  // is_running为false时不显示计时（历史消息），is_running为true或undefined时显示计时（新消息）
  const thinkingTarget = useMemo(() => {
    for (let i = resolvedMessages.length - 1; i >= 0; i--) {
      const msg = resolvedMessages[i] as Message & { created_at?: string };
      if (isAssistantMessage(msg) && 
          (!msg.content || String(msg.content).trim() === '') &&
          msg.is_running !== false) { // is_running为false的历史消息不显示计时，新消息（undefined）或明确需要计时（true）的消息显示计时
        const createdAt: Date = msg.timestamp
          ? normalizeServerDate(msg.timestamp as any)
          : (msg.created_at ? normalizeServerDate(msg.created_at) : new Date());
        return { id: msg.id, createdAt };
      }
    }
    return null;
  }, [resolvedMessages]);

  // 已等待时长（秒）
  const [thinkingElapsed, setThinkingElapsed] = useState<number>(0);

  useEffect(() => {
    if (!thinkingTarget) {
      setThinkingElapsed(0);
      return;
    }
    const computeElapsed = () => {
      const now = Date.now();
      const elapsedSec = Math.max(0, Math.floor((now - thinkingTarget.createdAt.getTime()) / 1000));
      setThinkingElapsed(elapsedSec);
    };
    computeElapsed();
    const timer = setInterval(computeElapsed, 1000);
    return () => clearInterval(timer);
  }, [thinkingTarget]);

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    // 当消息列表有变化时，延迟一小段时间确保DOM更新完成后再滚动
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [resolvedMessages.length]); // 只监听消息数量变化，避免内容更新时频繁滚动

  const thinkingElapsedLabel = useMemo(() => {
    const minutes = Math.floor(thinkingElapsed / 60);
    const seconds = thinkingElapsed % 60;
    if (minutes <= 0) {
      return t('chatbox.status.thinkingForSeconds', { seconds: thinkingElapsed });
    }
    return t('chatbox.status.thinkingForMinutesAndSeconds', { minutes, seconds });
  }, [thinkingElapsed, t]);

  // 计算某条助手消息对应的上一条用户消息内容
  const getPrevUserContent = (target: Message): string => {
    const idx = resolvedMessages.findIndex(m => m.id === target.id);
    for (let i = (idx === -1 ? resolvedMessages.length - 1 : idx - 1); i >= 0; i--) {
      if (isUserMessage(resolvedMessages[i] as Message)) {
        return (resolvedMessages[i] as Message).content || '';
      }
    }
    return '';
  };

  // 处理化学分子点击（来自 InlineMoleculeRenderer 的对象 -> 传递完整分子对象给上层）
  const forwardMoleculeClick = (molecule: any) => {
    if (molecule && (molecule.name || molecule.SMILES)) {
      // 传递完整的分子对象而不仅仅是名称
      (onMoleculeClick || ctxHandleMoleculeClick)?.(molecule);
    }
  };

  // 处理复制消息
  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      (onCopyMessage || ctxHandleCopyMessage)?.(content);
      
      // 3秒后重置复制状态
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // 处理重新生成
  const handleRegenerate = (messageId: string) => {
    console.log('Regenerating message:', messageId);
    (onRegenerateMessage || ctxHandleRegenerateMessage)?.(messageId);
  };

  // 处理编辑消息
  const handleEditMessage = (messageId: string, newText: string) => {
    // 查找当前消息
    const currentMessage = resolvedMessages.find(msg => msg.id === messageId);
    
    // 如果是用户消息，使用 handleMessageUpdate 来更新并获取新的AI回复
    if (currentMessage && isUserMessage(currentMessage)) {
      (onMessageUpdate || ctxHandleMessageUpdate)?.(messageId, newText, 'regular');
    } else {
      // 对于非用户消息，使用原来的编辑逻辑
      (onEditMessage || ctxHandleEditMessage)?.(messageId, newText);
    }
    
    setEditingMessageId(null);
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  // 处理开始编辑
  const handleStartEdit = (messageId: string) => {
    setEditingMessageId(messageId);
  };

  // InlineMoleculeRenderer 将负责解析与高亮分子及 hover 浮层

  // 渲染消息操作按钮
  const renderMessageActions = (message: Message) => {
    return (
      <div className="message-actions">
        {/* 反馈按钮：仅管理员且助手消息显示 */}
        {isAssistantMessage(message) && userPermissions === 'admin' && (
          <>
            <button
              className="action-btn"
              onClick={() => {
                setFeedbackData({
                  isPositive: true,
                  inputContent: getPrevUserContent(message),
                  responseContent: message.content,
                  contextContent1: (message as any)?.sources || ''
                });
                setShowFeedbackBox(true);
              }}
              title={t('chatbox.chat.like')}
            >
              <ThumbsUp size={16} />
            </button>
            <button
              className="action-btn"
              onClick={() => {
                setFeedbackData({
                  isPositive: false,
                  inputContent: getPrevUserContent(message),
                  responseContent: message.content,
                  contextContent1: (message as any)?.sources || ''
                });
                setShowFeedbackBox(true);
              }}
              title={t('chatbox.chat.dislike')}
            >
              <ThumbsDown size={16} />
            </button>
          </>
        )}
        {/* 复制按钮 */}
        <button
          className="action-btn copy-btn"
          onClick={() => handleCopyMessage(message.content, message.id)}
          title={t('chatbox.chat.copy')}
        >
          {copiedMessageId === message.id ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <rect x="4" y="4" width="12" height="16" rx="2" stroke="currentColor" fill="none"/>
              <rect x="8" y="8" width="12" height="16" rx="2" stroke="currentColor" fill="none"/>
            </svg>
          )}
        </button>

        {/* 编辑按钮 - 仅最后一条用户消息显示 */}
        {isUserMessage(message) && lastUserId === message.id && (
          <button
            className="edit-btn"
            onClick={() => handleStartEdit(message.id)}
            title={t('chatbox.chat.editQuestion')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        )}

        {/* 重新生成按钮 - 仅最后一条助手消息显示 */}
        {isAssistantMessage(message) && lastAssistantId === message.id && message.showRegenerate && (
          <button
            className="action-btn regenerate-btn"
            onClick={() => handleRegenerate(message.id)}
            title={t('chatbox.chat.regenerate')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // 渲染带按钮的系统消息
  const renderBotMessageWithButton = (message: Message, buttonText: string) => {
    return (
      <div className="message-wrapper bot">
        <div className="message">
          <InlineMoleculeRenderer content={message.content} onMoleculeClick={forwardMoleculeClick} />
          <button
            className="molecule-btn"
            onClick={() => console.log('Molecule button clicked')}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#56B26A',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4a9d5a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#56B26A';
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  };

  // 渲染普通消息
  const renderMessage = (message: Message) => {
    // 如果正在编辑，显示编辑组件
    if (editingMessageId === message.id && isUserMessage(message)) {
      return (
        <div key={message.id} className="message-wrapper user">
          <MessageEdit
            originalText={message.content}
            onSave={(newText) => handleEditMessage(message.id, newText)}
            onCancel={handleCancelEdit}
          />
        </div>
      );
    }

    if (isUserMessage(message)) {
      return (
        <div key={message.id} className="message-wrapper user">
          <div className="message-container">
            <div className="message">
              {message.content}
            </div>
          </div>
          {renderMessageActions(message)}
        </div>
      );
    } else if (isAssistantMessage(message) || isSystemMessage(message)) {
      // system消息按assistant样式展示
      return (
        <div key={message.id} className="message-wrapper bot">
          {isAssistantMessage(message) && thinkingTarget && thinkingTarget.id === message.id && (!message.content || String(message.content).trim() === '') ? (
            <div className="message">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#6b7280' }}>{thinkingElapsedLabel}</span>
              </div>
            </div>
          ) : (
            <div className="message">
              <InlineMoleculeRenderer content={message.content} onMoleculeClick={forwardMoleculeClick} />
              {/* 渲染extraData - 仅助手消息显示 */}
              {isAssistantMessage(message) && message.extraData && Object.keys(message.extraData).length > 0 && (
                <SupplementalData
                  data={message.extraData as Record<string, any>}
                  onMoleculeClick={forwardMoleculeClick}
                />
              )}
            </div>
          )}
          {renderMessageActions(message)}
        </div>
      );
    }
  };

  return (
    <div ref={messageListRef} className={`message-list ${className}`}>
      {(ctxMessages && ctxMessages.length > 0 ? ctxMessages : messages).map((message: Message) => {
        // 特殊处理：如果消息内容包含特定关键词，显示带按钮的消息
        if ((isAssistantMessage(message) || isSystemMessage(message)) && message.content.includes('分子探索')) {
          return renderBotMessageWithButton(message, '分子');
        }
        return renderMessage(message);
      })}
      {/* 反馈弹窗 */}
      {showFeedbackBox && feedbackData && (
        <FeedbackBox
          isPositive={feedbackData.isPositive}
          inputContent={feedbackData.inputContent}
          responseContent={feedbackData.responseContent}
          contextContent1={feedbackData.contextContent1}
          queryType="normal_chat"
          onClose={() => setShowFeedbackBox(false)}
        />
      )}
    </div>
  );
};

export default MessageList;
export type { Message, MessageListProps };