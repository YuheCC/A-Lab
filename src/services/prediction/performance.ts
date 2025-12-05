import request from "@/services/request";

// 电池系统相关接口
export async function getBatterySystemList(params?: any) {
    return request("/api/batterySystem/list", {
        method: "GET",
        params,
    });
}

// Performance历史记录接口类型定义
export interface PerformanceHistoryItem {
    id: number;
    battery_system_id: number;
    smiles: string;
    model_id?: number;  // 当前记录使用的模型 ID
    temperature_25_CE_prob?: string | null;
    temperature_25_CE_prop?: string | null;
    temperature_25_CE_label?: string | null;
    temperature_25_CL_prob?: string | null;
    temperature_25_CL_prop?: string | null;
    temperature_25_CL_label?: string | null;
    temperature_25_CR_prob?: string | null;
    temperature_25_CR_prop?: string | null;
    temperature_25_CR_label?: string | null;
    temperature_45_CE_prob?: string | null;
    temperature_45_CE_prop?: string | null;
    temperature_45_CE_label?: string | null;
    temperature_45_CL_prob?: string | null;
    temperature_45_CL_prop?: string | null;
    temperature_45_CL_label?: string | null;
    llm_analysis_result: string | null;
    model_result?: string | null;
    created_at: string;
    updated_at: string;
    temperature_25_label_0_count?: number | null;
    temperature_45_label_0_count?: number | null;
}

export interface PerformanceHistoryResponse {
    total: number;
    data: PerformanceHistoryItem[];
}

export interface PerformanceHistoryDetailResponse {
    id: number;
    battery_system_id: number;
    smiles: string;
    model_id?: number;  // 当前记录使用的模型 ID
    temperature_25_CE_prob?: string | null;
    temperature_25_CE_prop?: string | null;
    temperature_25_CE_label?: string | null;
    temperature_25_CL_prob?: string | null;
    temperature_25_CL_prop?: string | null;
    temperature_25_CL_label?: string | null;
    temperature_25_CR_prob?: string | null;
    temperature_25_CR_prop?: string | null;
    temperature_25_CR_label?: string | null;
    temperature_45_CE_prob?: string | null;
    temperature_45_CE_prop?: string | null;
    temperature_45_CE_label?: string | null;
    temperature_45_CL_prob?: string | null;
    temperature_45_CL_prop?: string | null;
    temperature_45_CL_label?: string | null;
    llm_analysis_result: string | null;
    model_result?: string | null;
    created_at: string;
    updated_at: string;
}

// Performance历史记录相关接口
export async function getPerformanceHistoryList(params?: any) {
    return request("/api/cellPerformance/history/list", {
        method: "GET",
        params,
    });
}

export async function getPerformanceHistoryDetail(id: number) {
    return request(`/api/cellPerformance/history/detail?id=${id}`, {
        method: "GET",
    });
}

export async function deletePerformanceHistory(id: number) {
    return request("/api/cellPerformance/history/delete", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        data: { id },
    });
}

// Performance calculation API
export interface PerformancePredictionRequest {
    smiles: string;
    battery_system_id: number;
    model_id?: string;
}

export interface PerformancePredictionResponse {
    id: number;
    battery_system_id: number;
    smiles: string;
    temperature_25_CE_prob: string;
    temperature_25_CE_label: string;
    temperature_25_CL_prob: string;
    temperature_25_CL_label: string;
    temperature_25_CR_prob: string;
    temperature_25_CR_label: string;
    temperature_45_CE_prob: string;
    temperature_45_CE_label: string;
    temperature_45_CL_prob: string;
    temperature_45_CL_label: string;
    llm_analysis_result: string | null;
    created_at: string;
    updated_at: string;
}

export async function predictPerformance(params: PerformancePredictionRequest) {
    return request("/api/cellPerformance/model_predict", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        data: params,
    });
}

// LLM Analysis API
export interface LLMAnalysisRequest {
    id: number;
    battery_system_id: number;
    session_id: string;
    lang: string;
}

export interface LLMAnalysisResponse {
    session_id: string;
    // WebSocket will provide streaming data
}

export async function requestLLMAnalysis(params: LLMAnalysisRequest) {
    return request("/api/cellPerformance/llm_analysis", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        data: params,
    });
}
