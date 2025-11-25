/**
 * SSE (Server-Sent Events) 请求工具
 * 用于处理流式响应的通用方法
 */

import { triggerLoginModal, shouldShowLoginModal, triggerPricingModal } from '@/utils/authHelpers';

// 使用全局声明的 BASE_URL（在 typings.d.ts 中定义）
declare const BASE_URL: string;

interface SSERequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
}

/**
 * 发送 SSE 请求并返回原生 Response 对象
 * 自动处理 token、错误等逻辑，与 request.ts 保持一致
 *
 * @param url - 请求的 URL 路径（如 '/api/cellPerformance/llm_analysis'）
 * @param options - 请求配置选项
 * @returns Promise<Response> - 原生 Response 对象，可用于 streamSSE
 *
 * @example
 * ```ts
 * const response = await sseRequest('/api/cellPerformance/llm_analysis', {
 *   method: 'POST',
 *   data: { id: 123, lang: 'zh' }
 * });
 *
 * for await (const event of streamSSE(response)) {
 *   console.log(event);
 * }
 * ```
 */
export async function sseRequest(url: string, options: SSERequestOptions = {}): Promise<Response> {
    const { method = 'GET', data, params, headers = {} } = options;

    // 获取 baseURL（使用全局声明的 BASE_URL）
    let baseURL = BASE_URL || 'https://prod-api.ses.ai';
    if (baseURL === '/') {
        baseURL = '';
    }

    // 获取 token
    const token = localStorage.getItem('token') || '';

    // 构建完整 URL
    let fullUrl = `${baseURL}${url}`;

    // 处理 query 参数
    if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            fullUrl += `?${queryString}`;
        }
    }

    // 构建请求头
    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    // 添加 token
    if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 发送请求
    const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
    });

    // 错误处理 - 与 request.ts 拦截器保持一致
    if (!response.ok) {
        // 401 未授权处理
        if (response.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('permissions');
            localStorage.removeItem('organization_name');

            const current = window.location.pathname + window.location.search;

            // 使用登录浮层而不是页面跳转（与 request.ts 保持一致）
            if (shouldShowLoginModal(window.location.pathname)) {
                triggerLoginModal(current);
            } else {
                // 如果不应该显示浮层，则跳转到登录页面
                window.location.href = '/login?redirect=' + encodeURIComponent(current);
            }
        }

        // 402 处理 - 弹出 pricing 浮层（与 request.ts 保持一致，GET 请求除外）
        const requestMethod = method.toUpperCase();
        if (response.status === 402 && requestMethod !== 'GET') {
            // 尝试获取响应中的 required_permission 信息
            let permission = null;
            try {
                const errorData = await response.json();
                permission = errorData?.required_permission || null;
            } catch (e) {
                // 如果解析失败，permission 保持为 null
                console.warn('Failed to parse 402 response:', e);
            }
            triggerPricingModal(permission);
        }

        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}

export default sseRequest;
