/**
 * SSE (Server-Sent Events) 请求工具
 * 用于处理流式响应的通用方法
 */

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

    // 获取 baseURL
    const baseURL = BASE_URL || 'https://prod-api.ses.ai';

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
            window.location.href = '/login?redirect=' + encodeURIComponent(current);
        }

        // 402 需要升级权限（这里不处理 pricing modal，由调用方处理）
        // 因为 SSE 通常是长连接，弹窗逻辑应该在调用前处理

        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}

export default sseRequest;
