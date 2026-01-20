/**
 * 消息类型工具函数
 * 支持新的role字段和向后兼容的type字段
 */

// 通用消息接口，同时支持role和type字段
export interface ToolStats {
  papers_examined?: number;
  papers_studied?: number;
  molecules_considered?: number;
}

export interface Message {
  id: string;
  role?: 'system' | 'user' | 'assistant';
  type?: 'user' | 'bot'; // 保持向后兼容性，将被弃用
  msg_type?: string; // 消息类型标识，用于业务场景区分
  content: string;
  timestamp?: Date;
  createdAt?: string;
  created_at?: string;
  savedAt?: string;
  showRegenerate?: boolean;
  is_running?: boolean; // 是否需要显示计时，用于区分历史记录和新消息
  molText?: string;
  molecules?: any[];
  sources?: string;
  inputs?: any;
  extraData?: any;
  toolStats?: ToolStats;
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
 * 判断是否为deep space消息对象（用于控制PDF下载按钮显示）
 * @param message 消息对象
 * @returns boolean - 当 msg_type 为 'multi-agent' 且消息已完成（is_running === false）时返回 true
 */
export const isDeepSpaceMessage = (message: Message): boolean => {
  return message.msg_type === 'multi-agent' && message.is_running === false;
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
 * @param msg_type 消息类型（可选）
 * @returns Message
 */
export const createUserMessage = (content: string, id?: string, msg_type?: string): Message => {
  const now = new Date();
  const iso = now.toISOString();
  return {
    id: id || `user-${Date.now()}`,
    role: 'user',
    content: cleanMessageContent(content),
    timestamp: now,
    createdAt: iso,
    savedAt: iso,
    ...(msg_type && { msg_type })
  };
};

/**
 * 创建助手消息
 * @param content 消息内容
 * @param id 消息ID（可选，默认自动生成）
 * @param showRegenerate 是否显示重新生成按钮
 * @param msg_type 消息类型（可选）
 * @returns Message
 */
export const createAssistantMessage = (
  content: string, 
  id?: string, 
  showRegenerate: boolean = true,
  msg_type?: string
): Message => {
  const now = new Date();
  const iso = now.toISOString();
  return {
    id: id || `assistant-${Date.now()}`,
    role: 'assistant',
    content: cleanMessageContent(content),
    timestamp: now,
    createdAt: iso,
    savedAt: iso,
    showRegenerate,
    ...(msg_type && { msg_type })
  };
};

/**
 * 创建系统消息
 * @param content 消息内容
 * @param id 消息ID（可选，默认自动生成）
 * @param msg_type 消息类型（可选）
 * @returns Message
 */
export const createSystemMessage = (content: string, id?: string, msg_type?: string): Message => {
  const now = new Date();
  const iso = now.toISOString();
  return {
    id: id || `system-${Date.now()}`,
    role: 'system',
    content: cleanMessageContent(content),
    timestamp: now,
    createdAt: iso,
    savedAt: iso,
    ...(msg_type && { msg_type })
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

/**
 * 获取消息的msg_type
 * @param message 消息对象
 * @returns msg_type字符串或undefined
 */
export const getMessageType = (message: Message): string | undefined => {
  return message.msg_type;
};

/**
 * 设置消息的msg_type
 * @param message 消息对象
 * @param msg_type 消息类型
 * @returns 更新后的消息对象
 */
export const setMessageType = (message: Message, msg_type: string): Message => {
  return {
    ...message,
    msg_type
  };
};

/**
 * 判断消息是否为指定类型
 * @param message 消息对象
 * @param msg_type 消息类型
 * @returns boolean
 */
export const isMessageType = (message: Message, msg_type: string): boolean => {
  return message.msg_type === msg_type;
};

/**
 * 清理消息内容中的无效换行符
 * 删除叠加在一起的多个换行符，保留合理的换行结构
 * @param content 原始消息内容
 * @returns 清理后的消息内容
 */
export const cleanMessageNewlines = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return content || '';
  }

  return content
    // 将3个或更多连续的换行符替换为2个
    .replace(/\n{3,}/g, '\n\n')
    // 清理行首和行尾的空白字符，但保留换行符
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    // 删除首尾的多余换行符
    .replace(/^\n+|\n+$/g, '')
    // 确保段落之间最多只有一个空行
    .replace(/\n\s*\n\s*\n/g, '\n\n');
};

/**
 * 清理消息内容（综合处理函数）
 * @param content 原始消息内容
 * @returns 清理后的消息内容
 */
export const cleanMessageContent = (content: string): string => {
  return cleanMessageNewlines(content);
};
