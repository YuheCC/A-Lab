import type { Environment } from '../config/types';

/**
 * Chat Service Endpoint Configuration
 *
 * This file demonstrates the recommended pattern for managing service endpoints:
 * - Define a `default` configuration that applies to most environments
 * - Only override specific endpoints for environments that differ
 * - Reduces configuration duplication
 *
 * Usage:
 * ```ts
 * import { getChatEndpoint } from './endpoints';
 * import { urlConfig } from '../config/urlConfig';
 *
 * const env = urlConfig.getEnvironment();
 * const endpoint = getChatEndpoint(env, 'send');
 * const fullURL = urlConfig.buildFullURL(endpoint);
 * ```
 */

// HTTP API endpoints
export const CHAT_ENDPOINTS = {
  // Default configuration (used for all environments unless overridden)
  default: {
    send: '/api/llm/chat/send',
    regenerate: '/api/llm/chat/regenerate',
    list: '/api/llm/chat/list',
    detail: '/api/llm/chat/detail',
    create: '/api/llm/chat/new',
    messageNew: '/api/llm/chat/message/new',
    messageUpdate: '/api/llm/chat/message/update',
    llmAsk: '/api/llm/ask',
    multiAgent: '/api/llm/multi-agent',
    multiAgentClarify: '/api/llm/multi-agent/clarify',
    save: '/api/llm/chat/save',
    delete: '/api/llm/chat/delete',
    update: '/api/llm/chat/update',
    downloadPdf: '/api/llm/chat/message/download-pdf',
  },
  us: {
    send: '/api/llm/chat/send',
    regenerate: '/api/llm/chat/regenerate',
    list: '/api/llm/chat/list',
    detail: '/api/llm/chat/detail',
    create: '/api/llm/chat/new',
    messageNew: '/api/llm/chat/message/new',
    messageUpdate: '/api/llm/chat/message/update',
    save: '/api/llm/chat/save',
    delete: '/api/llm/chat/delete',
    update: '/api/llm/chat/update',
    downloadPdf: '/api/llm/chat/message/download-pdf',
  },
  // box 环境使用旧的 /api/llm/chat 路径
  box: {
    send: '/api/llm/chat/send',
    regenerate: '/api/llm/chat/regenerate',
    list: '/api/llm/chat/list',
    detail: '/api/llm/chat/detail',
    create: '/api/llm/chat/new',
    messageNew: '/api/llm/chat/message/new',
    messageUpdate: '/api/llm/chat/message/update',
    save: '/api/llm/chat/save',
    delete: '/api/llm/chat/delete',
    update: '/api/llm/chat/update',
    downloadPdf: '/api/llm/chat/message/download-pdf',
  },
};

// SSE (Server-Sent Events) endpoints
export const CHAT_SSE_ENDPOINTS = {
  default: '/api/sse/chat',
  // staging: '/stream/chat',  // Example override
};

// WebSocket configuration
export const CHAT_WS_ENDPOINTS = {
  default: {
    path: '/api/llm/ws/socket.io',
    namespace: '/chat',
  },
  box: {
    path: '/api/llm/ws/socket.io',
    namespace: '/chat',
  },
  // staging: {
  //   path: '/websocket',
  //   namespace: '/chat-v2',
  // },
};

/**
 * Get HTTP endpoint for specific action
 *
 * @param env - Current environment
 * @param endpoint - Endpoint key
 * @returns API path
 */
export function getChatEndpoint(
  env: Environment,
  endpoint: keyof typeof CHAT_ENDPOINTS.default
): string {
  const envConfig = CHAT_ENDPOINTS[env as keyof typeof CHAT_ENDPOINTS] || {};
  const defaultConfig = CHAT_ENDPOINTS.default;

  // Use environment-specific config if available, otherwise fallback to default
  return (envConfig as any)[endpoint] || defaultConfig[endpoint];
}

/**
 * Get SSE endpoint
 *
 * @param env - Current environment
 * @returns SSE path
 */
export function getChatSSEEndpoint(env: Environment): string {
  return (
    CHAT_SSE_ENDPOINTS[env as keyof typeof CHAT_SSE_ENDPOINTS] ||
    CHAT_SSE_ENDPOINTS.default
  );
}

/**
 * Get WebSocket configuration
 *
 * @param env - Current environment
 * @returns WebSocket config (path and namespace)
 */
export function getChatWSConfig(env: Environment) {
  return (
    CHAT_WS_ENDPOINTS[env as keyof typeof CHAT_WS_ENDPOINTS] ||
    CHAT_WS_ENDPOINTS.default
  );
}
