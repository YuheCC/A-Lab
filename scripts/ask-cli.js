#!/usr/bin/env node
'use strict';

/**
 * Simple CLI helper for SES Ask that mirrors the front-end flow:
 *   1. Prompt for credentials.
 *   2. Log in against the backend to obtain an access token.
 *   3. Prompt for a query and mode (lightning or pro).
 *   4. Invoke the Ask endpoint and print the model response.
 *
 * Requirements:
 *   - Node.js 18+ (for the built-in `fetch` and `FormData` implementations).
 *   - Network access to the SES API (default: https://llm-staging.ses.ai).
 *
 * Optional configuration:
 *   - Set SES_API_BASE_URL or BASE_URL to point at a non-production API.
 */

const readline = require('readline');
const { randomUUID } = require('crypto');
const { io } = require('socket.io-client');

const DEFAULT_BASE_URL = 'https://llm-staging.ses.ai';
const SOCKET_PATH = '/ws/socket.io';

if (typeof fetch !== 'function' || typeof FormData !== 'function') {
  process.stderr.write('This script requires Node.js 18 or newer (fetch/FormData are missing).\n');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

/**
 * Normalizes the backend base URL.
 */
function resolveBaseUrl() {
  const candidate =
    process.env.SES_API_BASE_URL ||
    process.env.BASE_URL ||
    DEFAULT_BASE_URL;
  return candidate.replace(/\/+$/u, '').replace(/\/api$/iu, '');
}

/**
 * Readline prompt helper with optional masking (for passwords).
 */
function prompt(question, { mask = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    const handleExit = () => {
      rl.close();
      process.stdout.write('\n');
      process.exit(1);
    };

    rl.on('SIGINT', handleExit);

    if (mask) {
      rl.stdoutMuted = true;
      const originalWrite = rl._writeToOutput.bind(rl);
      rl._writeToOutput = function write(stringToWrite) {
        if (rl.stdoutMuted && stringToWrite.trim() !== '') {
          rl.output.write('*');
        } else {
          originalWrite(stringToWrite);
        }
      };
    }

    rl.question(question, (answer) => {
      rl.close();
      if (mask) {
        process.stdout.write('\n');
      }
      resolve(answer.trim());
    });
  });
}

/**
 * Attempt to parse a JSON response body, surfacing parsing errors with context.
 */
async function readJsonResponse(response, context) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    const snippet = text.length > 200 ? `${text.slice(0, 200)}...` : text;
    throw new Error(`${context}: expected JSON but received: ${snippet}`);
  }
}

function normalizeErrorDetail(data, fallback = 'Unknown error') {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const candidates = [
    data.detail,
    data.message,
    data.error,
    data.errors,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) return trimmed;
      continue;
    }

    if (Array.isArray(candidate)) {
      const joined = candidate
        .map((item) => {
          if (item == null) return '';
          if (typeof item === 'string') return item.trim();
          try {
            return JSON.stringify(item);
          } catch {
            return String(item);
          }
        })
        .filter(Boolean)
        .join('; ');
      if (joined) return joined;
      continue;
    }

    if (typeof candidate === 'object') {
      try {
        const serialized = JSON.stringify(candidate);
        if (serialized) return serialized;
      } catch {
        // ignore serialization issues and keep looping
      }
    }
  }

  return fallback;
}

function createHttpError(context, response, data) {
  const fallback = response?.statusText || 'Request failed';
  const detail = normalizeErrorDetail(data, fallback);
  const status = typeof response?.status === 'number' ? response.status : 0;
  const message = `${context} (${status}): ${detail}`;

  const error = new Error(message);
  error.name = 'HttpError';
  error.status = status;
  error.context = context;
  if (data !== undefined) {
    error.data = data;
  }
  error.isHttpError = true;
  error.isClientError = status >= 400 && status < 500;
  return error;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripInlineMoleculeTags(input) {
  if (typeof input !== 'string' || input.indexOf('<inline_molecule') === -1) {
    return input;
  }
  return input.replace(
    /<inline_molecule>([\s\S]*?)<\/inline_molecule>/g,
    (match, inner) => {
      try {
        const parsed = JSON.parse(inner);
        if (parsed && typeof parsed.text === 'string' && parsed.text.trim()) {
          return parsed.text;
        }
      } catch (_) {}
      return '';
    },
  );
}

function buildSocketUrl(apiBase) {
  if (!apiBase) return DEFAULT_BASE_URL;
  let normalized = apiBase.trim();
  if (normalized.endsWith('/')) {
    normalized = normalized.replace(/\/+$/u, '');
  }
  normalized = normalized.replace(/\/api$/iu, '');
  if (/^https?:\/\//iu.test(normalized)) {
    return normalized;
  }
  return `https://${normalized.replace(/^\/+/u, '')}`;
}

function connectSocket(baseUrl, token, { timeoutMs = 15000 } = {}) {
  const socketUrl = buildSocketUrl(baseUrl);
  return new Promise((resolve, reject) => {
    const socket = io(socketUrl, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token },
      reconnection: false,
      timeout: timeoutMs,
    });

    let settled = false;
    const cleanup = () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
    };

    const handleConnect = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(socket);
    };

    const handleError = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      const reason = error?.message || error?.toString() || 'Unknown socket error';
      socket.disconnect();
      reject(new Error(`WebSocket connection failed: ${reason}`));
    };

    socket.once('connect', handleConnect);
    socket.once('connect_error', handleError);
    socket.once('error', handleError);
  });
}

function normalizeSocketPayload(input) {
  let data = input;
  if (Array.isArray(data)) {
    if (data.length === 1) {
      data = data[0];
    } else if (data.length >= 2 && typeof data[0] === 'string') {
      data = data[1];
    }
  }
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

function waitForAskResponse(socket, chatId, answerId, { timeoutMs = 180000 } = {}) {
  if (!socket || typeof socket.on !== 'function') {
    return {
      promise: Promise.reject(new Error('Socket connection is not available.')),
      cancel: () => {},
    };
  }

  const expectedIds = answerId
    ? new Set([String(answerId), `assistant-${String(answerId)}`])
    : null;
  const normalizedChatId = String(chatId);
  const chunkMap = new Map();

  let settled = false;
  let timeoutHandle;

  const cleanup = (error, result) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutHandle);
    socket.off('message', onSocketEvent);
    socket.off('chat_message', onSocketEvent);
    socket.off('chat-events', onSocketEvent);
    socket.off('response', onSocketEvent);
    if (error) {
      if (rejectPromise) rejectPromise(error);
    } else {
      if (resolvePromise) resolvePromise(result);
    }
  };

  const resolveWithPayload = (payload) => {
    const messageBody = payload?.data ?? payload ?? {};
    const messageId =
      payload?.message_id ??
      messageBody?.message_id ??
      payload?.id ??
      messageBody?.id ??
      null;

    const key = messageId ? String(messageId) : expectedIds ? Array.from(expectedIds)[0] : 'default';
    const aggregated = chunkMap.get(key) || '';
    const fallbackContent =
      (typeof messageBody?.content === 'string' && messageBody.content) ||
      (typeof messageBody?.answer === 'string' && messageBody.answer) ||
      '';
    const content = (aggregated || fallbackContent || '').trim();

    cleanup(null, { content, payload });
  };

  const onSocketEvent = (...args) => {
    if (settled) return;
    let payload = args.length > 1 ? args : args[0];
    payload = normalizeSocketPayload(payload);
    if (!payload) return;

    const incomingChatId =
      payload?.chat_id ??
      payload?.chatId ??
      payload?.data?.chat_id ??
      payload?.data?.chatId;
    if (!incomingChatId || String(incomingChatId) !== normalizedChatId) {
      return;
    }

    const messageBody = payload?.data ?? payload ?? {};
    const messageId =
      payload?.message_id ??
      messageBody?.message_id ??
      payload?.id ??
      messageBody?.id ??
      null;

    if (expectedIds && messageId) {
      const idStr = String(messageId);
      const stripped = idStr.startsWith('assistant-') ? idStr.substring(10) : idStr;
      if (!expectedIds.has(idStr) && !expectedIds.has(stripped)) {
        return;
      }
    }

    const chunkSource =
      messageBody?.chunk ??
      messageBody?.answer ??
      messageBody?.content ??
      messageBody;
    let chunkText = '';
    if (typeof chunkSource === 'string') {
      chunkText = chunkSource;
    } else if (chunkSource && typeof chunkSource === 'object') {
      if (typeof chunkSource.text === 'string') {
        chunkText = chunkSource.text;
      } else if (typeof chunkSource.content === 'string') {
        chunkText = chunkSource.content;
      }
    }

    if (chunkText && messageId) {
      const key = String(messageId);
      const previous = chunkMap.get(key) || '';
      chunkMap.set(key, previous + chunkText);
    }

    const isDone =
      messageBody?.finished === true ||
      messageBody?.type === 'done' ||
      messageBody?.status === 'completed' ||
      messageBody?.status === 'success' ||
      messageBody?.event === 'final' ||
      messageBody?.event === 'final_answer';

    if (isDone) {
      resolveWithPayload(payload);
    }
  };

  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  timeoutHandle = setTimeout(() => {
    cleanup(new Error('Timed out waiting for Ask response.'), null);
  }, timeoutMs);

  socket.on('message', onSocketEvent);
  socket.on('chat_message', onSocketEvent);
  socket.on('chat-events', onSocketEvent);
  socket.on('response', onSocketEvent);

  return {
    promise,
    cancel: () => {
      if (!settled) {
        cleanup(new Error('Stream cancelled.'), null);
      }
    },
  };
}

async function fetchChatDetail(baseUrl, token, chatId) {
  const url = new URL(`${baseUrl}/api/chat/detail`);
  url.searchParams.set('id', String(chatId));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonResponse(response, 'Chat detail');
  if (!response.ok || data?.ok === false) {
    throw createHttpError('Chat detail failed', response, data);
  }

  return data;
}

function extractAnswerFromChatDetail(chatData, { answerId, startedAt }) {
  const messages = Array.isArray(chatData?.messages) ? chatData.messages : [];
  if (!messages.length) return null;

  const answerIdStr = answerId ? String(answerId) : null;
  const startedMs = startedAt ? Number(startedAt) : 0;

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i] || {};
    const role = typeof msg.role === 'string' ? msg.role.toLowerCase() : '';
    const type = typeof msg.type === 'string' ? msg.type.toLowerCase() : '';
    if (!['assistant', 'bot'].includes(role) && type !== 'bot') {
      continue;
    }

    if (msg.is_running === true) {
      continue;
    }

    const messageIdCandidates = [
      msg.id,
      msg.message_id,
      msg.messageId,
      msg.answer_id,
      msg.answerId,
    ]
      .filter(Boolean)
      .map((value) => String(value));

    if (answerIdStr && messageIdCandidates.length > 0) {
      const match = messageIdCandidates.some((candidate) => {
        if (candidate === answerIdStr) return true;
        if (candidate === `assistant-${answerIdStr}`) return true;
        return false;
      });
      if (!match) {
        continue;
      }
    }

    if (startedMs) {
      const tsRaw =
        msg.timestamp ||
        msg.updated_at ||
        msg.updatedAt ||
        msg.created_at ||
        msg.createdAt;
      if (tsRaw) {
        const tsValue = Number(new Date(tsRaw));
        if (!Number.isNaN(tsValue) && tsValue + 1000 < startedMs) {
          continue;
        }
      }
    }

    const content =
      (typeof msg.content === 'string' && msg.content.trim()) ||
      (typeof msg.answer === 'string' && msg.answer.trim()) ||
      (typeof msg.text === 'string' && msg.text.trim()) ||
      '';
    if (!content) {
      continue;
    }

    return { content, message: msg };
  }

  return null;
}

async function waitForAskPolling(baseUrl, token, chatId, { answerId, startedAt, pollIntervalMs = 2000, timeoutMs = 180000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 3;

  while (Date.now() < deadline) {
    try {
      const detail = await fetchChatDetail(baseUrl, token, chatId);
      const match = extractAnswerFromChatDetail(detail, { answerId, startedAt });
      if (match) {
        return { content: match.content, payload: detail, message: match.message };
      }
      lastError = null;
      consecutiveErrors = 0;
    } catch (error) {
      lastError = error;
      consecutiveErrors += 1;

      const status = typeof error?.status === 'number' ? error.status : null;
      const isClientError = status && status >= 400 && status < 500;
      const shouldAbortImmediately = isClientError && status !== 404;
      const exhaustedRetries = consecutiveErrors >= MAX_CONSECUTIVE_ERRORS;

      if (shouldAbortImmediately || exhaustedRetries) {
        throw error;
      }
    }

    await delay(pollIntervalMs);
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error('Timed out waiting for Ask response (polling).');
}

async function createChat(baseUrl, token, title) {
  const chatName = title && title.trim() ? title.trim() : 'CLI Ask Session';
  const response = await fetch(`${baseUrl}/api/chat/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ chat_name: chatName }),
  });

  const data = await readJsonResponse(response, 'Create chat');
  if (!response.ok || data?.ok === false) {
    throw createHttpError('Chat creation failed', response, data);
  }

  const chatId = data?.id ?? data?.chat_id ?? data?.chatId;
  if (!chatId) {
    throw new Error('Chat creation succeeded but no chat ID was returned.');
  }

  return { chatId, data };
}

async function createUserMessage(baseUrl, token, chatId, model, content) {
  const response = await fetch(`${baseUrl}/api/chat/message/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      chat_id: chatId,
      model,
      content,
      role: 'user',
    }),
  });

  const data = await readJsonResponse(response, 'Create message');
  if (!response.ok || data?.ok === false) {
    throw createHttpError('Message creation failed', response, data);
  }

  const messageId = data?.id ?? data?.message_id ?? data?.messageId;
  return { messageId, data };
}

async function triggerAskRequest(baseUrl, token, payload) {
  const response = await fetch(`${baseUrl}/api/llm/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonResponse(response, 'Ask request');
  if (!response.ok || data?.ok === false) {
    throw createHttpError('Query failed', response, data);
  }

  return data;
}

/**
 * Perform the login request to retrieve an access token.
 */
async function login(baseUrl, username, password) {
  const form = new FormData();
  form.set('username', username);
  form.set('password', password);

  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    body: form,
  });

  const data = await readJsonResponse(response, 'Login');
  if (!response.ok || data?.ok === false) {
    throw createHttpError('Login failed', response, data);
  }

  const token =
    data?.access_token ||
    data?.token ||
    data?.accessToken ||
    data?.jwt;

  if (!token) {
    throw new Error('Login succeeded but no access token was returned.');
  }

  return { token, profile: data };
}

/**
 * Trigger the Ask query following the same sequence used by the web client.
 */
async function runAsk(baseUrl, {
  token,
  query,
  apiMode,
  llmComputePower,
  model,
  numRagResults,
  socket,
}) {
  if (!socket || socket.connected !== true) {
    throw new Error('Socket connection is required before triggering Ask.');
  }

  const modeTimeoutMs = resolveModeTimeoutMs(apiMode);
  const title = query.split('\n')[0]?.slice(0, 80) || 'CLI Ask Session';
  const { chatId } = await createChat(baseUrl, token, title);
  const startedAt = Date.now();
  const { messageId, data: messageData } = await createUserMessage(baseUrl, token, chatId, model, query);
  const answerId =
    messageData?.answer?.id ??
    messageData?.answer_id ??
    messageData?.answerId ??
    null;

  const historyMessageId = messageId || answerId || randomUUID();
  const historyMessages = [
    {
      id: historyMessageId,
      role: 'user',
      content: query,
    },
  ];

  const sessionId = socket.id || randomUUID();
  const askPayload = {
    chat_id: chatId,
    messages: historyMessages,
    session_id: sessionId,
    model,
    ragEnabled: true,
    webSearchEnabled: false,
    webSearchClient: 'Tavily',
    numRagResults,
    toolsEnabled: true,
    patentRagEnabled: true,
    llm_compute_power: llmComputePower,
  };

  if (answerId) {
    askPayload.answer_id = answerId;
  }

  // Remove undefined/null entries (defensive).
  const normalizedPayload = Object.fromEntries(
    Object.entries(askPayload).filter(([, value]) => value !== undefined && value !== null),
  );

  const streamWait = waitForAskResponse(socket, chatId, answerId, { timeoutMs: modeTimeoutMs });

  let data;
  try {
    data = await triggerAskRequest(baseUrl, token, normalizedPayload);
  } catch (error) {
    streamWait.cancel();
    try {
      await streamWait.promise;
    } catch {
      // swallow cancellation errors
    }
    throw error;
  }

  const STREAM_TIMEOUT_MS = modeTimeoutMs;
  let streamResult = null;
  let streamError = null;
  try {
    streamResult = await Promise.race([
      streamWait.promise,
      (async () => {
        await delay(STREAM_TIMEOUT_MS);
        throw new Error('stream-timeout');
      })(),
    ]);
  } catch (error) {
    streamError = error;
  }

  streamWait.cancel();
  streamWait.promise.catch(() => {});

  let content = '';
  let rawStream = null;
  let rawPoll = null;
  let delivery = 'stream';

  if (streamResult && !streamError) {
    content = streamResult?.content || '';
    rawStream = streamResult?.payload || null;
  } else if (streamResult && streamResult.content) {
    content = streamResult.content;
    rawStream = streamResult.payload || null;
  }

  const streamTimedOut = streamError && streamError.message === 'stream-timeout';
  const streamCancelled = streamError && streamError.message === 'Stream cancelled.';
  const shouldPoll = !content || streamTimedOut || streamCancelled;

  if (shouldPoll) {
    delivery = 'poll';
    try {
      const elapsed = Date.now() - startedAt;
      const remainingMs = Math.max(modeTimeoutMs - elapsed, 2000);
      const pollResult = await waitForAskPolling(baseUrl, token, chatId, {
        answerId,
        startedAt,
        timeoutMs: remainingMs,
      });
      if (pollResult?.content) {
        content = pollResult.content;
      }
      rawPoll = pollResult?.payload || null;
    } catch (pollError) {
      if (!content) {
        if (data?.content) {
          content = data.content;
        } else {
          throw pollError;
        }
      }
    }
  }

  if (!content && data?.content) {
    content = data.content;
  }

  return {
    content: stripInlineMoleculeTags(content || ''),
    raw: {
      initial: data,
      stream: rawStream,
      poll: rawPoll,
    },
    meta: {
      chatId,
      messageId: historyMessageId,
      sessionId,
      mode: apiMode,
      taskId: data?.task_id ?? data?.taskId,
      answerId,
      delivery,
    },
  };
}

/**
 * Normalize the user-facing mode name to the backend mode identifier.
 */
function normalizeMode(input) {
  const sanitized = (input || '').trim().toLowerCase();
  if (!sanitized || sanitized === 'lightning') {
    return { label: 'lightning', apiMode: 'lightning', llmComputePower: 'medium' };
  }
  if (sanitized === 'pro' || sanitized === 'ask') {
    return { label: 'pro', apiMode: 'ask', llmComputePower: 'high' };
  }
  throw new Error('Mode must be either "lightning" or "pro".');
}

function resolveModeTimeoutMs(apiMode) {
  const normalized = typeof apiMode === 'string' ? apiMode.trim().toLowerCase() : '';
  if (normalized === 'ask' || normalized === 'pro') {
    return 12 * 60 * 1000;
  }
  return 4 * 60 * 1000;
}

function printHelp() {
  const script = process.argv[1];
  process.stdout.write(
    [
      'SES Ask CLI',
      '',
      'Usage:',
      `  node ${script}            # interactive prompts`,
      '',
      'Environment variables:',
      '  SES_API_BASE_URL   Override the API base URL (default: https://llm-staging.ses.ai)',
      '  BASE_URL           Fallback for the API base URL',
      '',
      'Options:',
      '  -h, --help         Show this help message',
      '',
    ].join('\n'),
  );
}

async function main() {
  const baseUrl = resolveBaseUrl();
  process.stdout.write(`SES Ask CLI\nUsing API base: ${baseUrl}\n\n`);

  const username = await prompt('Username or email: ');
  if (!username) {
    throw new Error('Username is required.');
  }

  const password = await prompt('Password: ', { mask: true });
  if (!password) {
    throw new Error('Password is required.');
  }

  const { token, profile } = await login(baseUrl, username, password);
  const name = profile?.username || username;
  const permission = profile?.permissions || 'unknown';
  process.stdout.write(`Logged in as ${name} (permissions: ${permission}).\n\n`);

  const query = await prompt('Enter your Ask query: ');
  if (!query) {
    throw new Error('A query is required.');
  }

  const modeInput = await prompt('Mode (lightning/pro) [lightning]: ');
  const { label, apiMode, llmComputePower } = normalizeMode(modeInput);
  const normalizedPermission = typeof permission === 'string' ? permission.toLowerCase() : '';
  const isAdvancedTier = ['admin', 'enterprise', 'joint'].includes(normalizedPermission);
  const model = isAdvancedTier ? 'o3' : 'o4-mini';
  const numRagResults = isAdvancedTier ? 10 : 3;
  process.stdout.write(`\nRunning Ask ${label}...\n`);

  process.stdout.write('Establishing realtime channel...\n');
  const socket = await connectSocket(baseUrl, token);
  let result;
  try {
    result = await runAsk(baseUrl, {
      token,
      query,
      apiMode,
      llmComputePower,
      model,
      numRagResults,
      socket,
    });
  } finally {
    socket.disconnect();
  }

  const { content, raw, meta } = result;

  process.stdout.write('\n=== Response ===\n');
  if (typeof content === 'string' && content.trim()) {
    process.stdout.write(`${content.trim()}\n`);
  } else {
    process.stdout.write('No textual content was returned. Raw payload:\n');
    process.stdout.write(`${JSON.stringify(raw, null, 2)}\n`);
  }

  if (meta?.chatId) {
    process.stdout.write(`\n(chat_id: ${meta.chatId}, session_id: ${meta.sessionId})\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`\nError: ${error.message}\n`);
  process.exit(1);
});
