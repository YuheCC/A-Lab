import request from "@/services/request";

export interface FeedbackSubmitData {
    type: string;
    function: string;
    text: string;
    screenshot?: File;
}

export async function submitFeedback(data: FeedbackSubmitData) {
    const formData = new FormData();
    
    // 添加基本字段
    formData.append('type', data.type);
    formData.append('function', data.function);
    formData.append('text', data.text);
    
    // 如果有截图，添加到FormData
    if (data.screenshot) {
        formData.append('screenshot', data.screenshot);
    }

    return request('/api/feedback/new', {
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
    return request('/feedback/list', {
        method: "GET",
        params,
    });
}

export async function getFeedbackById(id: string) {
    return request(`/feedback/${id}`, {
        method: "GET",
    });
}
