import { io, Socket } from 'socket.io-client';

export type ChatMode = 'regular' | 'deep-space';

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
    withTokenInQuery = true,
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
      timeout: 20000,
      forceNew: true,
      // 明确指定传输方式
      transports: transports,
      // 添加更多调试信息
      upgrade: true,
      rememberUpgrade: false,
      // 添加额外的配置来处理潜在的连接问题
      withCredentials: false,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      },
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


