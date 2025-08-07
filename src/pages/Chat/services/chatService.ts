import type { Message } from '../components/MessageList';
import type { ChatHistoryItem } from '../components/History';

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

  // 发送消息
  async sendMessage(message: string, mode: 'regular' | 'deep-space' = 'regular', chatId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          message,
          mode,
          chatId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content,
        showRegenerate: data.showRegenerate || true,
        messageId: data.messageId
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      // 返回模拟响应
      return {
        content: `收到您的消息：${message}\n\n这是一个模拟回复，实际应用中这里会调用AI接口。`,
        showRegenerate: true
      };
    }
  }

  // 重新生成回复
  async regenerateResponse(messageId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ messageId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content,
        showRegenerate: data.showRegenerate || true,
        messageId: data.messageId
      };
    } catch (error) {
      console.error('Failed to regenerate response:', error);
      return {
        content: '重新生成失败，请稍后重试。',
        showRegenerate: false
      };
    }
  }

  // 获取聊天历史
  async getChatHistory(): Promise<ChatHistoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Failed to get chat history:', error);
      // 返回模拟数据
      return [
        { chatId: '7', title: 'LiFePO4石墨电池电解质推荐', timestamp: new Date(), isPinned: true },
        { chatId: '1', title: '电解质溶剂稳定性预测分析', timestamp: new Date(), isPinned: false },
        { chatId: '2', title: '锂枝晶形成原因及抑制方法', timestamp: new Date(), isPinned: false },
        { chatId: '3', title: 'SEI层组成成分研究', timestamp: new Date(), isPinned: false },
        { chatId: '4', title: '高镍正极材料性能优化', timestamp: new Date(), isPinned: false },
        { chatId: '5', title: '固态电解质界面稳定性', timestamp: new Date(), isPinned: false },
        { chatId: '6', title: '电池热管理系统设计', timestamp: new Date(), isPinned: false }
      ];
    }
  }

  // 获取特定聊天记录
  async getChatById(chatId: string): Promise<{ title: string; messages: Message[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        title: data.title,
        messages: data.messages || []
      };
    } catch (error) {
      console.error('Failed to get chat by id:', error);
      // 返回模拟数据
      const mockChats: Record<string, { title: string; messages: Message[] }> = {
        '1': {
          title: '电解质溶剂稳定性预测分析',
          messages: [
            { id: '1-1', type: 'user' as const, content: '如何预测电解质溶剂的稳定性？', timestamp: new Date() },
            { id: '1-2', type: 'bot' as const, content: '电解质溶剂稳定性可以通过分子动力学模拟和量子化学计算来预测。主要考虑因素包括：\n\n1. 溶剂分子的分解电位\n2. 与电极材料的相容性\n3. 温度稳定性\n4. 氧化还原稳定性\n\n建议使用DFT计算溶剂分子的HOMO-LUMO能隙来评估其电化学稳定性。', timestamp: new Date(), showRegenerate: true }
          ]
        },
        '2': {
          title: '锂枝晶形成原因及抑制方法',
          messages: [
            { id: '2-1', type: 'user' as const, content: '锂枝晶形成的主要原因是什么？', timestamp: new Date() },
            { id: '2-2', type: 'bot' as const, content: '锂枝晶形成的主要原因包括：\n\n1. 不均匀的锂离子沉积\n2. 电解质浓度梯度\n3. 界面阻抗不均匀\n4. 温度分布不均\n\n抑制方法：\n- 使用固态电解质\n- 优化电解质配方\n- 添加成核剂\n- 控制充放电倍率', timestamp: new Date(), showRegenerate: true }
          ]
        }
      };

      return mockChats[chatId as keyof typeof mockChats] || {
        title: '未知对话',
        messages: []
      };
    }
  }

  // 保存聊天记录
  async saveChat(chatId: string, title: string, messages: Message[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          chatId,
          title,
          messages
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to save chat:', error);
      return false;
    }
  }

  // 删除聊天记录
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete chat:', error);
      return false;
    }
  }

  // 搜索聊天记录
  async searchChats(query: string): Promise<ChatHistoryItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Failed to search chats:', error);
      return [];
    }
  }

  // 获取认证令牌
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

// 导出单例实例
export const chatService = ChatService.getInstance();
