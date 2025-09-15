import { io, Socket } from 'socket.io-client';


export type ChatMode = 'regular' | 'deep-space' | 'clarify' | 'lightning' | 'ask' ;

export interface HeartbeatOptions {
  intervalMs?: number;
  pingMessage?: string;
}

export interface ReconnectOptions {
  autoReconnect?: boolean;
  maxRetries?: number;
  retryDelayBaseMs?: number; // exponential backoff base delay
}

export interface ChatStreamOptions extends ReconnectOptions {
  baseUrl?: string; // e.g. https://api.example.com or /api
  path?: string; // e.g. /chat/stream or /ws/chat
  chatId?: string;
  message?: string;
  mode?: ChatMode;
  query?: Record<string, string | number | boolean | undefined | null>;
  protocols?: string[]; // optional Sec-WebSocket-Protocol list (not used in Socket.IO)
  withTokenInQuery?: boolean; // default true. If true, append token= to query
  heartbeat?: HeartbeatOptions; // default { intervalMs: 30000, pingMessage: 'ping' }
  onOpen?: (ev: any) => void;
  onMessage?: (data: any, rawEvent?: any) => void;
  onError?: (ev: any) => void;
  onClose?: (ev: any) => void;
}

export interface ChatStreamHandle {
  send: (data: string | object) => void;
  close: () => void;
  isConnected: () => boolean;
}

function buildSocketUrl(apiBase: string): string {
  // For Socket.IO, we need HTTP/HTTPS URLs, not WebSocket URLs
  if (/^https?:/i.test(apiBase)) {
    return apiBase;
  }
  const origin = window.location.origin; // http(s)://host
  return origin + (apiBase.startsWith('/') ? apiBase : `/${apiBase}`);
}

// 创建仅使用WebSocket传输的Socket.IO连接（备用方案）
export function createChatWebSocketStreamWebSocketOnly(options: ChatStreamOptions): ChatStreamHandle {
  const modifiedOptions = { ...options };
  return createChatWebSocketStreamInternal(modifiedOptions, ['websocket']);
}

// 创建标准Socket.IO连接
export function createChatWebSocketStream(options: ChatStreamOptions): ChatStreamHandle {
  return createChatWebSocketStreamInternal(options, ['websocket', 'polling']);
}

function createChatWebSocketStreamInternal(options: ChatStreamOptions, transports: string[]): ChatStreamHandle {
  const {
    baseUrl = (window as any).BASE_URL || '/api',
    path = '/ws/socket.io',  // Socket.IO 默认路径
    chatId,
    message,
    mode,
    query = {},
    protocols, // Socket.IO 不使用 protocols，但保留兼容性
    withTokenInQuery = false,
    heartbeat: hb = {},
    autoReconnect = true,
    maxRetries = 5,
    retryDelayBaseMs = 800,
    onOpen,
    onMessage,
    onError,
    onClose,
  } = options;

  const socketUrl = buildSocketUrl(baseUrl);
  const token = localStorage.getItem('token') || '';
  
  // 构建 Socket.IO 查询参数
  const socketQuery: Record<string, string> = {};
  
  // 只添加有效的参数值
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      socketQuery[key] = String(value);
    }
  });
  
  if (chatId) socketQuery.chat_id = chatId;
  if (mode) socketQuery.mode = mode;
  if (message) socketQuery.message = message;
  if (withTokenInQuery && token) socketQuery.token = token;

  let socket: Socket | null = null;
  let retries = 0;
  let heartbeatTimer: number | undefined;
  const heartbeatInterval = hb.intervalMs ?? 30000;
  const heartbeatMsg = hb.pingMessage ?? 'ping';

  const clearHeartbeat = () => {
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    }
  };

  const startHeartbeat = () => {
    clearHeartbeat();
    if (heartbeatInterval > 0 && socket && socket.connected) {
      heartbeatTimer = window.setInterval(() => {
        try {
          if (socket && socket.connected) {
            socket.emit('ping', heartbeatMsg);
          }
        } catch {}
      }, heartbeatInterval);
    }
  };

  const connect = () => {
    console.log('Socket.IO 连接配置:', {
      url: socketUrl,
      path: path,
      query: socketQuery
    });
    
    // 创建 Socket.IO 连接
    socket = io(socketUrl, {
      path: path,
      query: socketQuery,
      autoConnect: true,
      reconnection: autoReconnect,
      reconnectionAttempts: maxRetries,
      reconnectionDelay: retryDelayBaseMs,
      reconnectionDelayMax: retryDelayBaseMs * Math.pow(2, 5),
      timeout: 200000,
      forceNew: true,
      // 明确指定传输方式
      transports: transports,
      // 添加更多调试信息
      upgrade: true,
      rememberUpgrade: false,
      // 添加额外的配置来处理潜在的连接问题
      withCredentials: false
    });

    socket.on('connect', () => {
      console.log('Socket.IO 连接成功');
      retries = 0;
      startHeartbeat();
      onOpen && onOpen({});
    });

    socket.on('message', (data: any) => {
      console.log('收到 message 事件:', data);
      onMessage && onMessage(data);
    });

    socket.on('chat_message', (data: any) => {
      console.log('收到 chat_message 事件:', data);
      onMessage && onMessage(data);
    });

    socket.on('response', (data: any) => {
      console.log('收到 response 事件:', data);
      onMessage && onMessage(data);
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket.IO 连接错误:', error);
      console.error('错误详情:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
      onError && onError(error);
    });

    socket.on('error', (error: any) => {
      console.error('Socket.IO 运行错误:', error);
      onError && onError(error);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket.IO 断开连接:', reason);
      clearHeartbeat();
      onClose && onClose({ reason });
      
      if (autoReconnect && (maxRetries < 0 || retries < maxRetries)) {
        retries += 1;
        console.log(`准备重连，当前重试次数: ${retries}/${maxRetries}`);
      }
    });

    // 添加更多调试事件
    socket.on('reconnect', (attemptNumber: number) => {
      console.log('Socket.IO 重连成功，尝试次数:', attemptNumber);
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('Socket.IO 尝试重连，尝试次数:', attemptNumber);
    });

    socket.on('reconnect_error', (error: any) => {
      console.error('Socket.IO 重连失败:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket.IO 重连完全失败');
    });
  };

  connect();

  const handle: ChatStreamHandle = {
    send: (data: string | object) => {
      if (!socket || !socket.connected) return;
      
      // 发送消息到 Socket.IO 服务器
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      socket.emit('message', payload);
    },
    close: () => {
      clearHeartbeat();
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    },
    isConnected: () => !!socket && socket.connected,
  };

  return handle;
}

export default createChatWebSocketStream;

// 全局WebSocket连接管理器
class GlobalWebSocketManager {
  private static instance: GlobalWebSocketManager;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private sessionId: string | undefined = undefined;
  private messageCallbacks: Array<(data: any) => void> = [];
  private connectionCallbacks: Array<() => void> = [];
  private disconnectionCallbacks: Array<() => void> = [];
  private errorCallbacks: Array<(error: any) => void> = [];

  private constructor() {}

  static getInstance(): GlobalWebSocketManager {
    if (!GlobalWebSocketManager.instance) {
      GlobalWebSocketManager.instance = new GlobalWebSocketManager();
    }
    return GlobalWebSocketManager.instance;
  }

  // 设置session_id
  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    console.log('全局WebSocket管理器设置session_id:', sessionId);
  }

  // 获取session_id
  getSessionId(): string | undefined {
    return this.sessionId;
  }

  // 初始化连接（页面加载时调用）
  initialize() {
    if (this.socket && this.socket.connected) {
      console.log('WebSocket已连接，无需重新初始化');
      return;
    }

    const baseUrl = BASE_URL || 'https://prod-api.ses.ai';
    const path = '/ws/socket.io';
    const socketUrl = buildSocketUrl(baseUrl);
    const token = localStorage.getItem('token') || '';

    const socketQuery: Record<string, string> = {};
    // if (token) socketQuery.token = token;

    console.log('初始化全局WebSocket连接:', {
      baseUrl: baseUrl,
      url: socketUrl,
      path: path,
      query: socketQuery
    });

    this.socket = io(socketUrl, {
      path: path,
      query: socketQuery,
      autoConnect: true,
      reconnection: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false, // 允许复用连接
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: false,
      withCredentials: true,
      auth: {
        token: token
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('全局WebSocket连接成功');
      this.isConnected = true;
      this.connectionCallbacks.forEach(callback => callback());
    });

    this.socket.on('message', (...args: any[]) => {
      console.log('全局WebSocket收到 message 事件:', ...args);
      const payload = args.length > 1 ? args : args[0];
      this.messageCallbacks.forEach(callback => callback(payload));
    });

    this.socket.on('chat_message', (data: any) => {
      console.log('全局WebSocket收到 chat_message 事件:', data);
      this.messageCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('response', (...args: any[]) => {
      console.log('全局WebSocket收到 response 事件:', ...args);
      const payload = args.length > 1 ? args : args[0];
      this.messageCallbacks.forEach(callback => callback(payload));
    });

    // 兼容后端通过 message("chat-events", payload) 的新格式
    this.socket.on('chat-events', (...args: any[]) => {
      console.log('全局WebSocket收到 chat-events 事件:', ...args);
      const payload = args.length > 1 ? args : args[0];
      this.messageCallbacks.forEach(callback => callback(payload));
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('全局WebSocket连接错误:', error);
      this.isConnected = false;
      this.errorCallbacks.forEach(callback => callback(error));
    });

    this.socket.on('error', (error: any) => {
      console.error('全局WebSocket运行错误:', error);
      this.errorCallbacks.forEach(callback => callback(error));
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('全局WebSocket断开连接:', reason);
      this.isConnected = false;
      this.disconnectionCallbacks.forEach(callback => callback());
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('全局WebSocket重连成功，尝试次数:', attemptNumber);
      this.isConnected = true;
      this.connectionCallbacks.forEach(callback => callback());
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('全局WebSocket尝试重连，尝试次数:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('全局WebSocket重连失败:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('全局WebSocket重连完全失败');
      this.isConnected = false;
    });
  }

  // 发送消息
  sendMessage(data: { message: string; chatId?: string; mode?: string } & Record<string, any>) {
    if (!this.socket || !this.socket.connected) {
      console.error('WebSocket未连接，无法发送消息');
      return false;
    }

    const payload = {
      ...data,
      chat_id: data.chatId || this.sessionId,
      session_id: this.sessionId
    };

    console.log('发送WebSocket消息:', payload);
    this.socket.emit('message', JSON.stringify(payload));
    return true;
  }

  // 检查连接状态
  isWebSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // 获取连接信息
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      socketConnected: this.socket?.connected || false,
      sessionId: this.sessionId,
      socketId: this.socket?.id || null,
      transport: this.socket?.io?.engine?.transport?.name || null
    };
  }

  // 检查连接健康状态
  checkConnectionHealth(): boolean {
    if (!this.socket) {
      console.warn('WebSocket: socket实例不存在');
      return false;
    }
    
    if (!this.socket.connected) {
      console.warn('WebSocket: socket未连接');
      return false;
    }
    
    if (!this.isConnected) {
      console.warn('WebSocket: 管理器状态显示未连接');
      return false;
    }
    
    return true;
  }

  // 重连方法
  reconnect() {
    console.log('WebSocket: 尝试重新连接...');
    
    if (this.socket) {
      // 先断开现有连接
      this.socket.disconnect();
    }
    
    // 重置状态
    this.isConnected = false;
    
    // 重新初始化连接
    this.initialize();
  }

  // 订阅消息
  onMessage(callback: (data: any) => void) {
    this.messageCallbacks.push(callback);
    
    // 返回取消订阅函数
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  // 订阅连接事件
  onConnect(callback: () => void) {
    this.connectionCallbacks.push(callback);
    
    // 如果已经连接，立即触发回调
    if (this.isConnected) {
      callback();
    }
    
    // 返回取消订阅函数
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // 订阅断连事件
  onDisconnect(callback: () => void) {
    this.disconnectionCallbacks.push(callback);
    
    // 返回取消订阅函数
    return () => {
      this.disconnectionCallbacks = this.disconnectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // 订阅错误事件
  onError(callback: (error: any) => void) {
    this.errorCallbacks.push(callback);
    
    // 返回取消订阅函数
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  // 关闭连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.sessionId = undefined;
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
    this.disconnectionCallbacks = [];
    this.errorCallbacks = [];
  }
}

// 导出全局WebSocket管理器实例
export const globalWebSocketManager = GlobalWebSocketManager.getInstance();


