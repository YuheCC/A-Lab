import request from "@/services/request";

export interface FeedbackSubmitData {
    type: string;
    feature: string;
    text: string;
    file?: File; // 可选的文件上传
}

export async function submitFeedback(data: FeedbackSubmitData) {
    const formData = new FormData();
    
    // 添加基本字段
    formData.append('type', data.type);
    formData.append('feature', data.feature);
    formData.append('text', data.text);
    
    // 处理文件字段
    if (data.file) {
        formData.append('file', data.file);
        formData.append('file_path', data.file.name); // 使用文件名作为路径
    } else {
        formData.append('file_path', ''); // 没有文件时设为空字符串
    }

    return request('/api/user/feedback/new', {
        method: "POST",
        data: formData,
    });
}

export async function getFeedbackList(params?: {
    page?: number;
    limit?: number;
    type?: string;
    function?: string;
}) {
    return request('/api/user/feedback/list', {
        method: "GET",
        params,
    });
}

export async function getFeedbackById(id: string) {
    return request(`/api/user/feedback/${id}`, {
        method: "GET",
    });
}
