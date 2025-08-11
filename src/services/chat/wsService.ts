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
  protocols?: string[]; // optional Sec-WebSocket-Protocol list
  withTokenInQuery?: boolean; // default true. If true, append token= to query
  heartbeat?: HeartbeatOptions; // default { intervalMs: 30000, pingMessage: 'ping' }
  onOpen?: (ev: Event) => void;
  onMessage?: (data: any, rawEvent: MessageEvent) => void;
  onError?: (ev: Event) => void;
  onClose?: (ev: CloseEvent) => void;
}

export interface ChatStreamHandle {
  send: (data: string | object) => void;
  close: () => void;
  isConnected: () => boolean;
}

function toWebSocketBase(apiBase: string): string {
  // apiBase may be absolute (https://domain) or relative (/api)
  if (/^https?:/i.test(apiBase)) {
    return apiBase.replace(/^http/i, 'ws');
  }
  const origin = window.location.origin; // http(s)://host
  return origin.replace(/^http/i, 'ws') + (apiBase.startsWith('/') ? apiBase : `/${apiBase}`);
}

function buildUrl(baseUrl: string, path: string, params: Record<string, string | number | boolean | undefined | null> = {}): string {
  const url = new URL((path.startsWith('ws') || path.startsWith('http')) ? path : `${baseUrl}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export function createChatWebSocketStream(options: ChatStreamOptions): ChatStreamHandle {
  const {
    baseUrl = '/api',
    path = '/chat/stream',
    chatId,
    message,
    mode,
    query = {},
    protocols,
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

  const wsBase = toWebSocketBase(baseUrl);

  const token = localStorage.getItem('token') || '';
  const params: Record<string, string | number | boolean> = {
    ...query,
  };
  if (chatId) params.chat_id = chatId;
  if (mode) params.mode = mode;
  if (message) params.message = message;
  if (withTokenInQuery && token) params.token = token;

  let ws: WebSocket | null = null;
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
    if (heartbeatInterval > 0 && ws && ws.readyState === WebSocket.OPEN) {
      heartbeatTimer = window.setInterval(() => {
        try {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(heartbeatMsg);
          }
        } catch {}
      }, heartbeatInterval);
    }
  };

  const connect = () => {
    const url = buildUrl(wsBase, path, params);
    ws = new WebSocket(url, protocols);

    ws.onopen = (ev) => {
      retries = 0;
      startHeartbeat();
      onOpen && onOpen(ev);
    };

    ws.onmessage = (ev) => {
      const text = typeof ev.data === 'string' ? ev.data : '';
      let payload: any = text;
      try {
        payload = JSON.parse(text);
      } catch {}
      onMessage && onMessage(payload, ev);
    };

    ws.onerror = (ev) => {
      onError && onError(ev);
    };

    ws.onclose = (ev) => {
      clearHeartbeat();
      onClose && onClose(ev);
      if (autoReconnect && (maxRetries < 0 || retries < maxRetries)) {
        const delay = retryDelayBaseMs * Math.pow(2, retries);
        retries += 1;
        window.setTimeout(connect, delay);
      }
    };
  };

  connect();

  const handle: ChatStreamHandle = {
    send: (data: string | object) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    },
    close: () => {
      autoReconnect && (options.autoReconnect = false);
      clearHeartbeat();
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        try { ws.close(); } catch {}
      }
      ws = null;
    },
    isConnected: () => !!ws && ws.readyState === WebSocket.OPEN,
  };

  return handle;
}

export default createChatWebSocketStream;


