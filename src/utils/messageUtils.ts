/**
 * 消息类型工具函数
 * 支持新的role字段和向后兼容的type字段
 */

// 通用消息接口，同时支持role和type字段
export interface Message {
  id: string;
  role?: 'system' | 'user' | 'assistant';
  type?: 'user' | 'bot'; // 保持向后兼容性，将被弃用
  content: string;
  timestamp?: Date;
  showRegenerate?: boolean;
  molText?: string;
  molecules?: any[];
  sources?: string;
  inputs?: any;
  extraData?: any;
}

/**
 * 规范化后端时间字符串到 Date（默认无时区按 UTC 处理）
 */
export const normalizeServerDate = (input?: string | Date): Date => {
  if (!input) return new Date();
  if (input instanceof Date) return new Date(input);
  const trimmed = String(input).trim();
  const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);
  const normalized = hasTimezone ? trimmed : (trimmed.endsWith('Z') ? trimmed : trimmed + 'Z');
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date(trimmed) : parsed;
};

/**
 * 规范化后端时间字符串到 ISO 字符串（默认无时区按 UTC 处理）
 */
export const normalizeServerDateToISOString = (input?: string | Date): string => {
  return normalizeServerDate(input).toISOString();
};

/**
 * 获取消息角色（支持role和type字段，优先使用role）
 * @param message 消息对象
 * @returns 消息角色：'system' | 'user' | 'assistant'
 */
export const getMessageRole = (message: Message): 'system' | 'user' | 'assistant' => {
  if (message.role) {
    return message.role;
  }
  // 向后兼容：将旧的type字段映射到role
  if (message.type === 'user') return 'user';
  if (message.type === 'bot') return 'assistant';
  return 'assistant'; // 默认值
};

/**
 * 判断是否为用户消息
 * @param message 消息对象
 * @returns boolean
 */
export const isUserMessage = (message: Message): boolean => {
  return getMessageRole(message) === 'user';
};

/**
 * 判断是否为助手消息
 * @param message 消息对象
 * @returns boolean
 */
export const isAssistantMessage = (message: Message): boolean => {
  return getMessageRole(message) === 'assistant';
};

/**
 * 判断是否为系统消息
 * @param message 消息对象
 * @returns boolean
 */
export const isSystemMessage = (message: Message): boolean => {
  return getMessageRole(message) === 'system';
};

/**
 * 创建用户消息
 * @param content 消息内容
 * @param id 消息ID（可选，默认自动生成）
 * @returns Message
 */
export const createUserMessage = (content: string, id?: string): Message => {
  return {
    id: id || `user-${Date.now()}`,
    role: 'user',
    content,
    timestamp: new Date()
  };
};

/**
 * 创建助手消息
 * @param content 消息内容
 * @param id 消息ID（可选，默认自动生成）
 * @param showRegenerate 是否显示重新生成按钮
 * @returns Message
 */
export const createAssistantMessage = (
  content: string, 
  id?: string, 
  showRegenerate: boolean = true
): Message => {
  return {
    id: id || `assistant-${Date.now()}`,
    role: 'assistant',
    content,
    timestamp: new Date(),
    showRegenerate
  };
};

/**
 * 创建系统消息
 * @param content 消息内容
 * @param id 消息ID（可选，默认自动生成）
 * @returns Message
 */
export const createSystemMessage = (content: string, id?: string): Message => {
  return {
    id: id || `system-${Date.now()}`,
    role: 'system',
    content,
    timestamp: new Date()
  };
};

/**
 * 将旧的type格式消息转换为新的role格式
 * @param message 带有type字段的消息
 * @returns 带有role字段的消息
 */
export const convertLegacyMessage = (message: any): Message => {
  if (message.role) {
    return message; // 已经是新格式
  }
  
  return {
    ...message,
    role: message.type === 'user' ? 'user' : 
          message.type === 'bot' ? 'assistant' : 'assistant',
    // 保留原始type字段以便调试
    type: message.type
  };
};

/**
 * 过滤指定角色的消息
 * @param messages 消息列表
 * @param roles 要过滤的角色列表
 * @returns 过滤后的消息列表
 */
export const filterMessagesByRole = (
  messages: Message[], 
  roles: ('system' | 'user' | 'assistant')[]
): Message[] => {
  return messages.filter(message => roles.includes(getMessageRole(message)));
};

/**
 * 获取最后一条指定角色的消息
 * @param messages 消息列表
 * @param role 角色
 * @returns 消息或undefined
 */
export const getLastMessageByRole = (
  messages: Message[], 
  role: 'system' | 'user' | 'assistant'
): Message | undefined => {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (getMessageRole(messages[i]) === role) {
      return messages[i];
    }
  }
  return undefined;
};
