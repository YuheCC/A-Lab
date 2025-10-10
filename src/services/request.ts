import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { triggerLoginModal, shouldShowLoginModal, triggerPricingModal } from '@/utils/authHelpers';

// 直接使用定义的 BASE_URL，如果未定义则使用默认值
const baseURL = BASE_URL || 'https://prod-api.ses.ai';

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 1000000,
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
        if(error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('permissions');
            localStorage.removeItem('organization_name');

            const current = window.location.pathname + window.location.search;

            // 使用登录浮层而不是页面跳转
            if (shouldShowLoginModal(window.location.pathname)) {
                triggerLoginModal(current);
            } else {
                // 如果不应该显示浮层，则跳转到登录页面
                console.log('current401', current);
                window.location.href = '/login?redirect=' + encodeURIComponent(current);
            }
        }
        
        // 402 处理 - 弹出 pricing 浮层（GET 请求除外）
        const method = (error.config?.method || 'GET').toUpperCase();
        if(error.response?.status === 402 && method !== 'GET') {
            const permission = error.response.data?.required_permission || null;
            triggerPricingModal(permission);
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
    onUploadProgress?: (progressEvent: any) => void; // 支持上传进度
}

const request = async (url: string, options: RequestOptions = {}) => {
    const { method = 'GET', data, params, headers, onUploadProgress, ...restOptions } = options;
    
    const config: AxiosRequestConfig = {
        url,
        method,
        data,
        params,
        headers,
        onUploadProgress, // 传递给 axios
        ...restOptions,
    };
    
    return axiosInstance(config);
};

export default request;