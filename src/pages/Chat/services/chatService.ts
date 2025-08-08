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
        content: `Received your message: ${message}\n\nThis is a mock response. In actual application, this would call the AI interface.`,
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
        content: 'Failed to regenerate, please try again later.',
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
        { chatId: '1', title: '锂电池制造工艺优化', timestamp: new Date(Date.now() - 1000 * 60 * 810), isPinned: false }
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
          title: '锂电池制造工艺优化',
          messages: [
            { id: '1-1', type: 'user' as const, content: '锂电池制造工艺中的关键控制点有哪些？', timestamp: new Date() },
            { id: '1-2', type: 'bot' as const, content: `### Electrolyte overview

A common electrolyte system pairs <inline_molecule>{"text":"EC","data":[{"SMILES":"O=C1OCCO1","molecular_weight":88.06,"HOMO_eV":-8.12,"LUMO_eV":-0.72,"ESP_min_eV":-1.85,"ESP_max_eV":0.93,"predicted_MP_celsius":36.0,"predicted_BP_celsius":248.5,"predicted_FP_celsius":140.0,"COMBUSTION_ENTHALPY_EV":-67.21,"COMMERCIAL_SCORE":3,"COMMERCIAL_LINK":"https://example.com/ec","functional_groups":["carbonate","cyclic"],"UMAP_0":-2.134,"UMAP_1":1.572}]}</inline_molecule> with <inline_molecule>{"text":"DEC","data":[{"SMILES":"CCOC(=O)OCC","molecular_weight":118.09,"HOMO_eV":-7.65,"LUMO_eV":-0.41,"ESP_min_eV":-1.42,"ESP_max_eV":0.71,"predicted_MP_celsius":-43.0,"predicted_BP_celsius":126.0,"predicted_FP_celsius":25.0,"COMBUSTION_ENTHALPY_EV":-85.02,"COMMERCIAL_SCORE":2,"COMMERCIAL_LINK":"https://example.com/dec","functional_groups":["carbonate","alkyl"],"UMAP_0":0.842,"UMAP_1":-0.315}]}</inline_molecule> as solvents, and uses the salt <inline_molecule>{"text":"LiPF6","data":[{"SMILES":"F[P-](F)(F)(F)(F)F.[Li+]","molecular_weight":151.91,"HOMO_eV":-10.2,"LUMO_eV":-2.1,"ESP_min_eV":-3.2,"ESP_max_eV":1.8,"predicted_MP_celsius":"-","predicted_BP_celsius":"-","predicted_FP_celsius":"-","COMBUSTION_ENTHALPY_EV":-12.34,"COMMERCIAL_SCORE":3,"COMMERCIAL_LINK":"https://example.com/lipf6","functional_groups":["salt"],"UMAP_0":1.423,"UMAP_1":2.017}]}</inline_molecule>.
This combination balances dielectric constant and viscosity; see [1,2] for details.

#### Quick comparison

| Molecule | SMILES              | MW (g/mol) | HOMO (eV) | LUMO (eV) |
|---------:|---------------------|------------|-----------|-----------|
| EC       | O=C1OCCO1           | 88.06      | -8.12     | -0.72     |
| DEC      | CCOC(=O)OCC         | 118.09     | -7.65     | -0.41     |
| LiPF6    | F[P-](F)(F)(F)(F)F… | 151.91     | -10.2     | -2.1      |

- EC tends to form stable SEI on graphite [1].
- DEC lowers viscosity and improves low-temperature performance [2].

## References
- [1] Aurbach, D. et al., On the SEI formation mechanisms on graphite in EC-based electrolytes.
- [2] Xu, K., Nonaqueous liquid electrolytes for lithium-based rechargeable batteries.
`, timestamp: new Date(), showRegenerate: true }
          ]
        },
        '2': {
          title: '电解液低温性能改善',
          messages: [
            { id: '2-1', type: 'user' as const, content: '如何改善电解液的低温性能？', timestamp: new Date() },
            { id: '2-2', type: 'bot' as const, content: '改善电解液低温性能的方法：\n\n1. **溶剂优化**：\n   - 使用低粘度溶剂如EMC、DEC\n   - 添加低温添加剂如VC、FEC\n\n2. **盐浓度调整**：\n   - 适当降低锂盐浓度\n   - 使用导电性更好的锂盐\n\n3. **添加剂选择**：\n   - 抗冻添加剂\n   - 离子导电增强剂\n\n4. **配方优化**：\n   - 多元溶剂体系\n   - 共溶剂效应利用', timestamp: new Date(), showRegenerate: true }
          ]
        },
        '3': {
          title: '电池能量密度提升方案',
          messages: [
            { id: '3-1', type: 'user' as const, content: '有哪些方法可以提升锂电池的能量密度？', timestamp: new Date() },
            { id: '3-2', type: 'bot' as const, content: '提升锂电池能量密度的主要方案：\n\n**正极材料优化**：\n- 高镍三元材料(NCM811/NCA)\n- 富锂锰基材料\n- 固溶体正极材料\n\n**负极材料升级**：\n- 硅碳复合负极\n- 锂金属负极\n- 合金类负极材料\n\n**电解质改进**：\n- 高电压电解质\n- 固态电解质\n- 凝胶电解质\n\n**结构设计优化**：\n- 减少非活性材料\n- 优化极片厚度\n- 提高压实密度', timestamp: new Date(), showRegenerate: true }
          ]
        },
        '4': {
          title: '石墨负极SEI膜形成机制',
          messages: [
            { id: '4-1', type: 'user' as const, content: '石墨负极SEI膜是如何形成的？', timestamp: new Date() },
            { id: '4-2', type: 'bot' as const, content: 'SEI膜(固体电解质界面膜)形成机制：\n\n**形成过程**：\n1. 电解液分解：在低电位下电解液组分还原分解\n2. 产物沉积：分解产物在石墨表面沉积\n3. 膜层生长：逐渐形成致密的保护层\n\n**主要组分**：\n- Li2CO3：来自EC分解\n- LiF：来自LiPF6分解\n- ROCO2Li：有机组分\n- Li2O：深度分解产物\n\n**影响因素**：\n- 电解液组成\n- 化成工艺\n- 温度条件\n- 电流密度', timestamp: new Date(), showRegenerate: true }
          ]
        },
        '5': {
          title: '电池热失控预警系统',
          messages: [
            { id: '5-1', type: 'user' as const, content: '如何设计电池热失控预警系统？', timestamp: new Date() },
            { id: '5-2', type: 'bot' as const, content: '电池热失控预警系统设计要点：\n\n**监测参数**：\n- 温度：多点温度传感器\n- 电压：单体电压监测\n- 电流：充放电电流\n- 气体：可燃气体检测\n\n**预警算法**：\n- 温度梯度分析\n- 电压异常检测\n- 阻抗变化监测\n- 机器学习预测模型\n\n**响应机制**：\n- 分级预警(黄色/橙色/红色)\n- 自动断电保护\n- 冷却系统启动\n- 紧急通风排气\n\n**系统集成**：\n- BMS集成\n- 云端数据分析\n- 远程监控', timestamp: new Date(), showRegenerate: true }
          ]
        },
        '29': {
          title: '电解质溶剂稳定性预测分析',
          messages: [
            { id: '29-1', type: 'user' as const, content: '如何预测电解质溶剂的稳定性？', timestamp: new Date() },
            { id: '29-2', type: 'bot' as const, content: '电解质溶剂稳定性可以通过分子动力学模拟和量子化学计算来预测。主要考虑因素包括：\n\n1. 溶剂分子的分解电位\n2. 与电极材料的相容性\n3. 温度稳定性\n4. 氧化还原稳定性\n\n建议使用DFT计算溶剂分子的HOMO-LUMO能隙来评估其电化学稳定性。', timestamp: new Date(), showRegenerate: true }
          ]
        },
        '28': {
          title: '锂枝晶形成原因及抑制方法',
          messages: [
            { id: '28-1', type: 'user' as const, content: '锂枝晶形成的主要原因是什么？', timestamp: new Date() },
            { id: '28-2', type: 'bot' as const, content: '锂枝晶形成的主要原因包括：\n\n1. 不均匀的锂离子沉积\n2. 电解质浓度梯度\n3. 界面阻抗不均匀\n4. 温度分布不均\n\n抑制方法：\n- 使用固态电解质\n- 优化电解质配方\n- 添加成核剂\n- 控制充放电倍率', timestamp: new Date(), showRegenerate: true }
          ]
        }
      };

      // 为没有具体mock数据的聊天记录生成默认内容
      const defaultChat = mockChats[chatId as keyof typeof mockChats];
      if (defaultChat) {
        return defaultChat;
      }

      // 根据chatId生成默认的聊天内容
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
        '6': '磷酸铁锂改性技术路线'
      };

      const title = chatTitles[chatId] || '未知对话';
      
      return {
        title,
        messages: [
          { 
            id: `${chatId}-1`, 
            type: 'user' as const, 
            content: `请详细介绍一下${title}相关的技术要点。`, 
            timestamp: new Date() 
          },
          { 
            id: `${chatId}-2`, 
            type: 'bot' as const, 
            content: `关于${title}，这是一个重要的电池技术领域。我需要更多具体信息来为您提供详细的技术分析和建议。请告诉我您最关心的具体方面，比如材料特性、工艺参数、性能指标等。`, 
            timestamp: new Date(), 
            showRegenerate: true 
          }
        ]
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
