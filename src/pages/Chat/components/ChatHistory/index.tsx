import React from 'react';
import type { FC } from 'react';

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: Array<{
    type: 'user' | 'bot';
    content: string;
  }>;
  timestamp: Date;
}

interface ChatHistoryProps {
  history: ChatHistoryItem[];
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId?: string;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  history,
  onSelectChat,
  onNewChat,
  currentChatId
}) => {
  // Mock 聊天历史数据
  const mockHistory: ChatHistoryItem[] = [
    {
      id: '1',
      title: '电解质溶剂稳定性预测分析',
      messages: [
        { type: 'user', content: '如何预测电解质溶剂的稳定性？' },
        { type: 'bot', content: '电解质溶剂稳定性可以通过分子动力学模拟和量子化学计算来预测...' }
      ],
      timestamp: new Date('2024-01-15')
    },
    {
      id: '2',
      title: '锂枝晶形成原因及抑制方法',
      messages: [
        { type: 'user', content: '锂枝晶形成的主要原因是什么？' },
        { type: 'bot', content: '锂枝晶形成的主要原因包括不均匀的锂离子沉积...' }
      ],
      timestamp: new Date('2024-01-14')
    },
    {
      id: '3',
      title: 'SEI层组成成分研究',
      messages: [
        { type: 'user', content: 'SEI层主要由哪些成分组成？' },
        { type: 'bot', content: 'SEI（固体电解质界面）层主要由以下成分组成...' }
      ],
      timestamp: new Date('2024-01-13')
    },
    {
      id: '4',
      title: '高镍正极材料性能优化',
      messages: [
        { type: 'user', content: '如何优化高镍正极材料的性能？' },
        { type: 'bot', content: '高镍正极材料性能优化策略包括表面包覆...' }
      ],
      timestamp: new Date('2024-01-12')
    },
    {
      id: '5',
      title: '固态电解质界面稳定性',
      messages: [
        { type: 'user', content: '固态电解质界面稳定性如何评估？' },
        { type: 'bot', content: '固态电解质界面稳定性评估方法包括电化学测试...' }
      ],
      timestamp: new Date('2024-01-11')
    },
    {
      id: '6',
      title: '电池热管理系统设计',
      messages: [
        { type: 'user', content: '电池热管理系统的设计要点有哪些？' },
        { type: 'bot', content: '电池热管理系统设计要点包括温度控制...' }
      ],
      timestamp: new Date('2024-01-10')
    },
    {
      id: '7',
      title: 'LiFePO4石墨电池电解质推荐',
      messages: [
        { type: 'user', content: '为LiFePO4和石墨电池推荐一种电解质' },
        { type: 'bot', content: '对于LiFePO4和石墨电池，推荐使用六氟磷酸锂-碳酸酯电解液...' }
      ],
      timestamp: new Date('2024-01-09')
    }
  ];

  const displayHistory = history.length > 0 ? history : mockHistory;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '昨天';
    } else if (diffDays === 0) {
      return '今天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="chat-history">
      <div className="chat-history-header">
        <h3>聊天历史</h3>
        <button
          className="new-chat-btn"
          onClick={onNewChat}
          style={{
            padding: '8px 16px',
            backgroundColor: '#56B26A',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          新聊天
        </button>
      </div>
      
      <div className="chat-history-list">
        {displayHistory.map((chat) => (
          <div
            key={chat.id}
            className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              backgroundColor: currentChatId === chat.id ? '#f0f9ff' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (currentChatId !== chat.id) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (currentChatId !== chat.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '4px'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: '500',
                color: '#111827',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}>
                {chat.title}
              </h4>
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                flexShrink: 0,
                marginLeft: '8px'
              }}>
                {formatDate(chat.timestamp)}
              </span>
            </div>
            
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#6b7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: '1.4'
            }}>
              {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : '暂无消息'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
export type { ChatHistoryItem };
