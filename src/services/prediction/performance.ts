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
    temperature_25_CE_prop: string;
    temperature_25_CE_label: string;
    temperature_25_CL_prop: string;
    temperature_25_CL_label: string;
    temperature_25_CR_prop: string;
    temperature_25_CR_label: string;
    temperature_45_CE_prop: string;
    temperature_45_CE_label: string;
    temperature_45_CL_prop: string;
    temperature_45_CL_label: string;
    llm_analysis_result: string | null;
    created_at: string;
    updated_at: string;
}

export interface PerformanceHistoryResponse {
    total: number;
    data: PerformanceHistoryItem[];
}

export interface PerformanceHistoryDetailResponse {
    id: number;
    battery_system_id: number;
    smiles: string;
    temperature_25_CE_prop: string;
    temperature_25_CE_label: string;
    temperature_25_CL_prop: string;
    temperature_25_CL_label: string;
    temperature_25_CR_prop: string;
    temperature_25_CR_label: string;
    temperature_45_CE_prop: string;
    temperature_45_CE_label: string;
    temperature_45_CL_prop: string;
    temperature_45_CL_label: string;
    llm_analysis_result: string | null;
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