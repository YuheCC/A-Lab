import type { Message } from '@/pages/Chat/components/MessageList';
import type { ChatHistoryItem } from '@/pages/Chat/components/History';

export interface ChatResponse {
  content: string;
  showRegenerate: boolean;
  messageId?: string;
}

export interface ChatRequest {
  message: string;
  mode: 'regular' | 'deep-space';
  chatId?: string;
}

import type { ChatStreamHandle } from './wsService';
import { createChatWebSocketStream } from './wsService';

export class ChatService {
  private static instance: ChatService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || '/api';
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(message: string, mode: 'regular' | 'deep-space' = 'regular', chatId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ message, mode, chatId }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return {
        content: data.content,
        showRegenerate: data.showRegenerate || true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      return {
        content: `Received your message: ${message}\n\nThis is a mock response. In actual application, this would call the AI interface.`,
        showRegenerate: true,
      };
    }
  }

  async regenerateResponse(messageId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return {
        content: data.content,
        showRegenerate: data.showRegenerate || true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error('Failed to regenerate response:', error);
      return { content: 'Failed to regenerate, please try again later.', showRegenerate: false };
    }
  }

  openChatStream(options: {
    chatId?: string;
    message?: string;
    mode?: 'regular' | 'deep-space';
    path?: string;
    protocols?: string[];
    onOpen?: (ev: Event) => void;
    onMessage?: (data: any, ev: MessageEvent) => void;
    onError?: (ev: Event) => void;
    onClose?: (ev: CloseEvent) => void;
  }): ChatStreamHandle {
    const { chatId, message, mode = 'regular', path = '/chat/stream', protocols, onOpen, onMessage, onError, onClose } = options || {};

    return createChatWebSocketStream({
      baseUrl: this.baseUrl,
      path,
      chatId,
      message,
      mode,
      protocols,
      query: {},
      withTokenInQuery: true,
      heartbeat: { intervalMs: 30000, pingMessage: 'ping' },
      autoReconnect: true,
      maxRetries: 8,
      retryDelayBaseMs: 800,
      onOpen,
      onMessage,
      onError,
      onClose,
    });
  }

  async getChatHistory(): Promise<ChatHistoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/history`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [
        { chatId: '30', title: 'LiFePO4石墨电池电解质推荐', timestamp: new Date(Date.now() - 1000 * 60 * 5), isPinned: true },
        { chatId: '29', title: '电解质溶剂稳定性预测分析', timestamp: new Date(Date.now() - 1000 * 60 * 15), isPinned: false },
        { chatId: '28', title: '锂枝晶形成原因及抑制方法', timestamp: new Date(Date.now() - 1000 * 60 * 30), isPinned: false },
        { chatId: '27', title: 'SEI层组成成分研究', timestamp: new Date(Date.now() - 1000 * 60 * 45), isPinned: false },
        { chatId: '26', title: '高镍正极材料性能优化', timestamp: new Date(Date.now() - 1000 * 60 * 60), isPinned: false },
        { chatId: '25', title: '固态电解质界面稳定性', timestamp: new Date(Date.now() - 1000 * 60 * 90), isPinned: false },
        { chatId: '24', title: '电池热管理系统设计', timestamp: new Date(Date.now() - 1000 * 60 * 120), isPinned: false },
        { chatId: '23', title: '钠离子电池正极材料筛选', timestamp: new Date(Date.now() - 1000 * 60 * 150), isPinned: false },
        { chatId: '22', title: '电池循环寿命预测模型', timestamp: new Date(Date.now() - 1000 * 60 * 180), isPinned: false },
        { chatId: '21', title: '硅负极材料膨胀抑制策略', timestamp: new Date(Date.now() - 1000 * 60 * 210), isPinned: false },
        { chatId: '20', title: '电解液添加剂优化配方', timestamp: new Date(Date.now() - 1000 * 60 * 240), isPinned: false },
        { chatId: '19', title: '锂金属负极保护层设计', timestamp: new Date(Date.now() - 1000 * 60 * 270), isPinned: false },
        { chatId: '18', title: '电池安全性评估方法', timestamp: new Date(Date.now() - 1000 * 60 * 300), isPinned: false },
        { chatId: '17', title: '快充技术对电池寿命影响', timestamp: new Date(Date.now() - 1000 * 60 * 330), isPinned: false },
        { chatId: '16', title: '三元材料掺杂改性研究', timestamp: new Date(Date.now() - 1000 * 60 * 360), isPinned: false },
        { chatId: '15', title: '电池管理系统算法优化', timestamp: new Date(Date.now() - 1000 * 60 * 390), isPinned: false },
        { chatId: '14', title: '固态电池界面阻抗分析', timestamp: new Date(Date.now() - 1000 * 60 * 420), isPinned: false },
        { chatId: '13', title: '电池回收工艺流程设计', timestamp: new Date(Date.now() - 1000 * 60 * 450), isPinned: false },
        { chatId: '12', title: '锂离子传导机理研究', timestamp: new Date(Date.now() - 1000 * 60 * 480), isPinned: false },
        { chatId: '11', title: '电池包结构优化设计', timestamp: new Date(Date.now() - 1000 * 60 * 510), isPinned: false },
        { chatId: '10', title: '电解质盐浓度优化策略', timestamp: new Date(Date.now() - 1000 * 60 * 540), isPinned: false },
        { chatId: '9', title: '电池容量衰减机理分析', timestamp: new Date(Date.now() - 1000 * 60 * 570), isPinned: false },
        { chatId: '8', title: '新型导电剂性能评估', timestamp: new Date(Date.now() - 1000 * 60 * 600), isPinned: false },
        { chatId: '7', title: '电池电化学阻抗谱解析', timestamp: new Date(Date.now() - 1000 * 60 * 630), isPinned: false },
        { chatId: '6', title: '磷酸铁锂改性技术路线', timestamp: new Date(Date.now() - 1000 * 60 * 660), isPinned: false },
        { chatId: '5', title: '电池热失控预警系统', timestamp: new Date(Date.now() - 1000 * 60 * 690), isPinned: false },
        { chatId: '4', title: '石墨负极SEI膜形成机制', timestamp: new Date(Date.now() - 1000 * 60 * 720), isPinned: false },
        { chatId: '3', title: '电池能量密度提升方案', timestamp: new Date(Date.now() - 1000 * 60 * 750), isPinned: false },
        { chatId: '2', title: '电解液低温性能改善', timestamp: new Date(Date.now() - 1000 * 60 * 780), isPinned: false },
        { chatId: '1', title: '锂电池制造工艺优化', timestamp: new Date(Date.now() - 1000 * 60 * 810), isPinned: false },
      ];
    }
  }

  async getChatById(chatId: string): Promise<{ title: string; messages: Message[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/${chatId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return { title: data.title, messages: data.messages || [] };
    } catch (error) {
      console.error('Failed to get chat by id:', error);
      const chatTitles: Record<string, string> = {
        '30': 'LiFePO4石墨电池电解质推荐',
        '27': 'SEI层组成成分研究',
        '26': '高镍正极材料性能优化',
        '25': '固态电解质界面稳定性',
        '24': '电池热管理系统设计',
        '23': '钠离子电池正极材料筛选',
        '22': '电池循环寿命预测模型',
        '21': '硅负极材料膨胀抑制策略',
        '20': '电解液添加剂优化配方',
        '19': '锂金属负极保护层设计',
        '18': '电池安全性评估方法',
        '17': '快充技术对电池寿命影响',
        '16': '三元材料掺杂改性研究',
        '15': '电池管理系统算法优化',
        '14': '固态电池界面阻抗分析',
        '13': '电池回收工艺流程设计',
        '12': '锂离子传导机理研究',
        '11': '电池包结构优化设计',
        '10': '电解质盐浓度优化策略',
        '9': '电池容量衰减机理分析',
        '8': '新型导电剂性能评估',
        '7': '电池电化学阻抗谱解析',
        '6': '磷酸铁锂改性技术路线',
      };

      const title = chatTitles[chatId] || '未知对话';
      return {
        title,
        messages: [
          { id: `${chatId}-1`, type: 'user' as const, content: `请详细介绍一下${title}相关的技术要点。`, timestamp: new Date() },
          { id: `${chatId}-2`, type: 'bot' as const, content: `关于${title}，这是一个重要的电池技术领域。我需要更多具体信息来为您提供详细的技术分析和建议。请告诉我您最关心的具体方面，比如材料特性、工艺参数、性能指标等。`, timestamp: new Date(), showRegenerate: true },
        ],
      };
    }
  }

  async saveChat(chatId: string, title: string, messages: Message[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ chatId, title, messages }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to save chat:', error);
      return false;
    }
  }

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to delete chat:', error);
      return false;
    }
  }

  async searchChats(query: string): Promise<ChatHistoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Failed to search chats:', error);
      return [];
    }
  }

  private getAuthToken(): string {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      ''
    );
  }
}

export const chatService = ChatService.getInstance();

