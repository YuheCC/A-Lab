/**
 * Server-Sent Events (SSE) Service
 *
 * Provides unified SSE connection management and stream parsing
 */

export interface SSEOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  withCredentials?: boolean;
  onMessage?: (data: any, event?: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: () => void;
}

export interface SSEHandle {
  close: () => void;
  isConnected: () => boolean;
}

/**
 * Create SSE connection
 *
 * @param url - Full URL (should include base URL)
 * @param options - SSE options
 * @returns SSE handle for managing the connection
 *
 * @example
 * const handle = createSSEConnection('https://api.example.com/stream', {
 *   query: { q: 'search query' },
 *   onMessage: (data) => console.log(data),
 * });
 */
export function createSSEConnection(url: string, options: SSEOptions = {}): SSEHandle {
  const {
    query = {},
    withCredentials = true,
    onMessage,
    onError,
    onOpen,
    onClose,
  } = options;

  // Build URL with query parameters
  const finalURL = new URL(url);

  // Add query parameters
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      finalURL.searchParams.append(key, String(value));
    }
  });

  // Add token if withCredentials is true
  if (withCredentials) {
    const token = localStorage.getItem('token');
    if (token) {
      finalURL.searchParams.append('token', token);
    }
  }

  let eventSource: EventSource | null = null;
  let isActive = false;

  try {
    eventSource = new EventSource(finalURL.toString());
    isActive = true;

    eventSource.onopen = (event) => {
      console.log('SSE connection opened:', finalURL.toString());
      onOpen && onOpen(event);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage && onMessage(data, event);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
        // If parsing fails, pass raw data
        onMessage && onMessage(event.data, event);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      isActive = false;
      onError && onError(event);
    };
  } catch (error) {
    console.error('Failed to create SSE connection:', error);
    isActive = false;
  }

  return {
    close: () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
        isActive = false;
        onClose && onClose();
      }
    },
    isConnected: () => isActive && eventSource?.readyState === EventSource.OPEN,
  };
}

/**
 * Stream SSE from a Response object (for use with fetch)
 *
 * This is an async generator that yields parsed SSE events.
 * Compatible with the existing streamSSE implementation from StreamSSE component.
 *
 * @param response - Fetch Response object
 * @yields Parsed SSE events
 *
 * @example
 * const response = await fetch('/api/stream');
 * for await (const event of streamSSE(response)) {
 *   console.log(event);
 * }
 */
export async function* streamSSE(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  const parseEvent = (raw: string) => {
    let eventName = 'message';
    let data = '';

    raw.split('\n').forEach((line) => {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data += line.slice(5).trim();
      }
    });

    if (!data) return null;

    try {
      const json = JSON.parse(data);
      return eventName === 'message' ? json : { event: eventName, ...json };
    } catch (err) {
      console.error('[streamSSE] Failed to parse JSON:', err, data);
      return null;
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let split;
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);

      const parsed = parseEvent(rawEvent);
      if (parsed) yield parsed;
    }
  }
}

export default createSSEConnection;
