import type { Message } from '@/pages/Chat/components/MessageList';
import type { ChatHistoryItem } from '@/pages/Chat/components/History';
import request from '@/services/request';
import { getAPIUrl } from '@/utils';

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
    this.baseUrl = getAPIUrl() || '/api';
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(message: string, mode: 'regular' | 'deep-space' = 'regular', chatId?: string): Promise<ChatResponse> {
    try {
      const resp = await request('/chat/send', {
        method: 'POST',
        data: { message, mode, chatId },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      const data = resp.data;
      return {
        content: data.content,
        showRegenerate: data.showRegenerate ?? true,
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
      const resp = await request('/chat/regenerate', {
        method: 'POST',
        data: { messageId },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      const data = resp.data;
      return {
        content: data.content,
        showRegenerate: data.showRegenerate ?? true,
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

  //获取置顶聊天列表
  async getPinnedChatList(): Promise<ChatHistoryItem[]> {
    try {
      const resp = await request('/api/chat/list', {
        params: {
          pinned: true,
          limit: 100,
        },
        method: 'GET',
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return (resp.data || [])?.map((item: any) => ({
        ...item,
        chatId: item.id,
        title: item.session_name,
        timestamp: new Date(item.updated_at),
        isPinned: item.pinned,
      })) || [];
    } catch (error) {
      console.error('Failed to get pinned chat list:', error);
      return [];
    }
  }

  // 获取聊天列表
  async getChatList(start?: string, limit: number = 20): Promise<ChatHistoryItem[]> {
    try {
      const resp = await request('/api/chat/list', {
        params: {
          pinned: false,
          start: start || null,
          limit,
        },
        method: 'GET',
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      console.log('resp.data', resp.data);
      return (resp.data || [])?.map((item: any) => ({
        ...item,
        chatId: item.id,
        title: item.session_name,
        timestamp: new Date(item.updated_at),
        isPinned: item.pinned,
      })) || [];
    } catch (error) {
      console.error('Failed to get chat list:', error);
      return [];
    }
  }

  // 初次获取历史记录，用于初始化聊天列表
  async getChatHistory(): Promise<ChatHistoryItem[]> {
    try {
      // 并发获取置顶数据和第一页数据，用于初始化聊天列表
      const [pinnedChatList, chatList] = await Promise.all([
        this.getPinnedChatList(),
        this.getChatList(undefined, 20)
      ]);
      return [...pinnedChatList, ...chatList];
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [];
    }
  }

  async getChatById(chatId: string): Promise<{ title: string; messages: Message[] }> {
    try {
      const resp = await request(`/api/chat/detail`, {
        method: 'GET',
        params: {
          id: chatId,
        },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      const data = resp.data;
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
      const resp = await request('/chat/save', {
        method: 'POST',
        data: { chatId, title, messages },
      });
      return resp.status >= 200 && resp.status < 300;
    } catch (error) {
      console.error('Failed to save chat:', error);
      return false;
    }
  }

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      const resp = await request(`/chat/${chatId}`, {
        method: 'DELETE',
      });
      return resp.status >= 200 && resp.status < 300;
    } catch (error) {
      console.error('Failed to delete chat:', error);
      return false;
    }
  }

  async searchChats(query: string): Promise<ChatHistoryItem[]> {
    try {
      const resp = await request('/chat/search', {
        method: 'GET',
        params: { q: query },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.data.results || [];
    } catch (error) {
      console.error('Failed to search chats:', error);
      return [];
    }
  }

  async renameChat(chatId: string, newTitle: string): Promise<boolean> {
    try {
      const resp = await request(`/chat/${chatId}/rename`, {
        method: 'PUT',
        data: { title: newTitle },
      });
      return resp.status >= 200 && resp.status < 300;
    } catch (error) {
      console.error('Failed to rename chat:', error);
      return false;
    }
  }

  async togglePinChat(chatId: string, isPinned: boolean): Promise<boolean> {
    try {
      const resp = await request(`/chat/${chatId}/pin`, {
        method: 'PUT',
        data: { isPinned },
      });
      return resp.status >= 200 && resp.status < 300;
    } catch (error) {
      console.error('Failed to toggle pin chat:', error);
      return false;
    }
  }
}

export const chatService = ChatService.getInstance();

