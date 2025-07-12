import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 直接使用定义的 BASE_URL，如果未定义则使用默认值
const baseURL = BASE_URL || 'https://prod-api.ses.ai';

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// 请求拦截器
axiosInstance.interceptors.request.use((config) => {
    console.log('Request URL:', config.url, 'Options:', config);
    
    const token = localStorage.getItem("token");
    
    // 如果数据是 FormData，不要设置 Content-Type，让浏览器自动处理
    if (config.data instanceof FormData) {
        // 删除默认的 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
        delete config.headers['Content-Type'];
    }
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 响应拦截器
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error)
        if(error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('permissions');
            localStorage.removeItem('redirectAfterLogin');
            const current = window.location.pathname + window.location.search;
            localStorage.setItem('redirectAfterLogin', current);
            window.location.href = '/login?redirect=' + encodeURIComponent(current);
        }
        return Promise.resolve({
            ok: false,
            ...error.response,
        });
    }
);

// 创建与umi-request兼容的请求函数
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: any;
    headers?: Record<string, string>;
}

const request = async (url: string, options: RequestOptions = {}) => {
    const { method = 'GET', data, params, headers, ...restOptions } = options;
    
    const config: AxiosRequestConfig = {
        url,
        method,
        data,
        params,
        headers,
        ...restOptions,
    };
    
    return axiosInstance(config);
};

export default request;