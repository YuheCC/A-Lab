import { extend } from 'umi-request';

// 直接使用定义的 BASE_URL，如果未定义则使用默认值
const baseURL = 'https://api.ses.ai';
console.log(baseURL)
const request = extend({
    prefix: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
request.interceptors.request.use((url, options) => {
    console.log('Request URL:', url, 'Options:', options);
    
    const token = localStorage.getItem("token");
    
    // 如果数据是 FormData，不要设置 Content-Type，让浏览器自动处理
    if (options.data instanceof FormData) {
        // 删除默认的 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
        const headers = { ...(options.headers || {}) } as any;
        delete headers['Content-Type'];
        options.headers = headers;
    }
    
    if (token) {
        options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        };
    }
    
    return {
        url,
        options,
    };
});

// 响应拦截器
request.interceptors.response.use(async (response) => {
    const body = await response.clone().json();
    if(!response.ok && body.detail) {
        throw new Error(body.detail);
    }
    return response;
});

export default request;