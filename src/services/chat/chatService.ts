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
import { createChatWebSocketStream, createChatWebSocketStreamWebSocketOnly } from './wsService';

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

  private normalizeServerDate(input?: string): Date {
    if (!input) return new Date();
    const trimmed = String(input).trim();
    const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);
    const normalized = hasTimezone ? trimmed : (trimmed.endsWith('Z') ? trimmed : trimmed + 'Z');
    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? new Date(trimmed) : parsed;
  }

  /**
   * 映射后端消息数据到前端Message格式
   * 主要处理字段名转换：extra_data -> extraData
   * 支持嵌套extra_data，如果内部还有extra_data则以内部字段为准
   */
  private mapServerMessageToClientMessage(serverMessage: any): Message {
    let extraData = serverMessage.extra_data || serverMessage.extraData;
    
    // 如果extra_data内部还有extra_data这个key，以内部字段为准（不管值是什么）
    if (extraData && typeof extraData === 'object' && 'extra_data' in extraData) {
      extraData = extraData.extra_data;
    }
    
    return {
      ...serverMessage,
      // 将后端的extra_data映射为前端的extraData
      extraData: extraData,
      // 确保时间戳格式正确
      timestamp: serverMessage.timestamp ? this.normalizeServerDate(serverMessage.timestamp) : undefined,
      // 移除后端的extra_data字段，避免重复
      extra_data: undefined
    };
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
    websocketOnly?: boolean; // 新增选项：是否仅使用WebSocket
    onOpen?: (ev: Event) => void;
    onMessage?: (data: any, ev: MessageEvent) => void;
    onError?: (ev: Event) => void;
    onClose?: (ev: CloseEvent) => void;
  }): ChatStreamHandle {
    const { 
      chatId, 
      message, 
      mode = 'regular', 
      path = '/ws/socket.io', 
      protocols, 
      websocketOnly = false,
      onOpen, 
      onMessage, 
      onError, 
      onClose 
    } = options || {};
    
    console.log('chatId', chatId);
    console.log('使用WebSocket-only模式:', websocketOnly);
    
    const createStreamFn = websocketOnly ? createChatWebSocketStreamWebSocketOnly : createChatWebSocketStream;
    
    return createStreamFn({
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
      maxRetries: websocketOnly ? 3 : 8, // WebSocket-only模式下减少重试次数
      retryDelayBaseMs: 800,
      onOpen,
      onMessage,
      onError: (ev) => {
        console.error('连接错误，当前模式:', websocketOnly ? 'WebSocket-only' : 'Auto');
        if (onError) onError(ev);
      },
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
        timestamp: this.normalizeServerDate(item.updated_at),
        isPinned: true,
        updatedAt: item.updated_at, // 保存原始updated_at用于分页
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
        timestamp: this.normalizeServerDate(item.updated_at),
        isPinned: item.pinned,
        updatedAt: item.updated_at, // 保存原始updated_at用于分页
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

  async getChatById(chatId: number): Promise<{ title: string; messages: Message[] }> {
    try {
      const resp = await request(`/api/chat/detail`, {
        method: 'GET',
        params: {
          id: chatId,
        },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      const data = resp.data;
      
      // 映射后端消息数据到前端格式
      const mappedMessages = (data.messages || []).map((msg: any) => 
        this.mapServerMessageToClientMessage(msg)
      );
      
      return { title: data.title, messages: mappedMessages };
    } catch (error) {
      console.error('Failed to get chat by id:', error);
      // 直接抛出错误，不返回mock数据
      throw error;
    }
  }

  // only create a new chat with a chat_name
  async createChat(title: string): Promise<any> {
    try {
      const resp = await request('/api/chat/new', {
        method: 'POST',
        data: { chat_name: title },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.data;
    } catch (error) {
      console.error('Failed to create chat:', error);
      return '';
    }
  }

  // send a new message to the chat, return a response id
  async createNewMessage(chatId: number, message: string, model: string = 'o3'): Promise<any> {
    try {
      const resp = await request('/api/chat/message/new', {
        method: 'POST',
        data: { 
            chat_id: chatId, 
            model,
            content: message,
            role: 'user',
        },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.data;
    } catch (error) {
      console.error('Failed to new message:', error);
      return '';
    }
  }

  // update a message with a new content
  async updateMessage(chatId: number, messageId: string, message: string, model: string = 'o3'): Promise<any> {
    try {
      const resp = await request('/api/chat/message/update', {
        method: 'POST',
        data: { 
            id: messageId,
            chat_id: chatId, 
            model,
            content: message,
            role: 'user',
        },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.data;
    } catch (error) {
      console.error('Failed to update message:', error);
      return '';
    }
  }

  async triggerMessageAsUser(chatId: number, answerId: string, messages: any[], sessionId: string, model: string = 'o3', extraOptions?: { ragEnabled?: boolean; disableLiteratureSearch?: boolean; }): Promise<string> {
    try {
      // 处理管理员开关参数
      const ragEnabled = extraOptions?.disableLiteratureSearch === false ? true : (extraOptions?.ragEnabled ?? false);
      
      const resp = await request('/api/llm/ask', {
        method: 'POST',
        data: { 
          chat_id: chatId, 
          answer_id: answerId,
          messages, 
          session_id: sessionId,
          model,
          ragEnabled,
          webSearchEnabled: false,
          webSearchClient: "Tavily",
        },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.data;
    } catch (error) {
      console.error('Failed to trigger message as user:', error);
      return '';
    }
  }

  async triggerMessageAsDeepSpace(chatId: number, answerId: string, messages: any[], sessionId: string, model: string = 'o3', extraOptions?: { ragEnabled?: boolean; disableLiteratureSearch?: boolean; fullDeepSpace?: boolean; }): Promise<string> {
    try {
      // 处理管理员开关参数
      const ragEnabled = extraOptions?.disableLiteratureSearch === false ? true : (extraOptions?.ragEnabled ?? false);
      
      const payload: any = {
        chat_id: chatId, 
        answer_id: answerId,
        messages, 
        session_id: sessionId,
        model,
        ragEnabled,
        webSearchEnabled: false,
        webSearchClient: "Tavily",
      };
      
      // 如果启用了fullDeepSpace，添加dump_state参数
      if (extraOptions?.fullDeepSpace) {
        payload.dump_state = true;
      }
      
      const resp = await request('/api/llm/multi-agent', {
        method: 'POST',
        data: payload,
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.data;
    } catch (error) {
      console.error('Failed to trigger message as deep space:', error);
      return '';
    }
  }

  async triggerMessageAsClarify(chatId: number, answerId: string, messages: any[], sessionId: string, model: string = 'o3', extraOptions?: { ragEnabled?: boolean; disableLiteratureSearch?: boolean; fullDeepSpace?: boolean; }): Promise<string> {
    try {
      // 处理管理员开关参数
      const ragEnabled = extraOptions?.disableLiteratureSearch === false ? true : (extraOptions?.ragEnabled ?? false);
      
      const payload: any = {
        chat_id: chatId, 
        answer_id: answerId,
        messages, 
        session_id: sessionId,
        model,
        ragEnabled,
        webSearchEnabled: false,
        webSearchClient: "Tavily",
      };
      
      // 如果启用了fullDeepSpace，添加dump_state参数
      if (extraOptions?.fullDeepSpace) {
        payload.dump_state = true;
      }
      
      const resp = await request('/api/llm/multi-agent/clarify', {
        method: 'POST',
        data: payload,
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.data;
    } catch (error) {
      console.error('Failed to trigger message as claritai:', error);
      return '';
    }
  }

  async saveChat(chatId: number, title: string, messages: Message[]): Promise<boolean> {
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

  async deleteChat(chatId: number): Promise<boolean> {
    try {
      const resp = await request(`/api/chat/delete`, {
        method: 'POST',
        data: { id: chatId },
      });
      return resp.status >= 200 && resp.status < 300;
    } catch (error) {
      console.error('Failed to delete chat:', error);
      return false;
    }
  }

  async searchChats(query: string): Promise<ChatHistoryItem[]> {
    try {
      const resp = await request('/api/chat/list', {
        method: 'GET',
        params: { 
          search_text: query, 
          limit: 10,
          pinned: false,
        },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP error! status: ${resp.status}`);
      const list = resp.data || [];
      return (list || [])?.map((item: any) => ({
        ...item,
        chatId: item.id,
        title: item.session_name,
        timestamp: this.normalizeServerDate(item.updated_at),
        isPinned: !!item.pinned,
        updatedAt: item.updated_at,
      })) || [];
    } catch (error) {
      console.error('Failed to search chats:', error);
      return [];
    }
  }

  async renameChat(chatId: number, newTitle: string): Promise<boolean> {
    try {
      const resp = await request(`/api/chat/update`, {
        method: 'POST',
        data: { id: chatId, chat_name: newTitle },
      });
      return resp.status >= 200 && resp.status < 300;
    } catch (error) {
      console.error('Failed to rename chat:', error);
      return false;
    }
  }

  async togglePinChat(chatId: number, isPinned: boolean): Promise<boolean> {
    try {
      const resp = await request(`/api/chat/update`, {
        method: 'POST',
        data: { id: chatId, pinned: isPinned },
      });
      return resp.status >= 200 && resp.status < 300;
    } catch (error) {
      console.error('Failed to toggle pin chat:', error);
      return false;
    }
  }
}

export const chatService = ChatService.getInstance();

