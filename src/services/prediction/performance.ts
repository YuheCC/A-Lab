import request from "@/services/request";
import { urlConfig } from "@/services/config/urlConfig";
import { getPerformanceEndpoint } from "./endpoints";

// 电池系统相关接口
export async function getBatterySystemList(params?: any) {
    const env = urlConfig.getEnvironment();
    const endpoint = getPerformanceEndpoint(env, 'batterySystemList');
    const url = urlConfig.buildFullURL(endpoint);
    return request(url, {
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
    const env = urlConfig.getEnvironment();
    const endpoint = getPerformanceEndpoint(env, 'historyList');
    const url = urlConfig.buildFullURL(endpoint);
    return request(url, {
        method: "GET",
        params,
    });
}

export async function getPerformanceHistoryDetail(id: number) {
    const env = urlConfig.getEnvironment();
    const endpoint = getPerformanceEndpoint(env, 'historyDetail');
    const url = urlConfig.buildFullURL(endpoint);
    return request(`${url}?id=${id}`, {
        method: "GET",
    });
}

export async function deletePerformanceHistory(id: number) {
    const env = urlConfig.getEnvironment();
    const endpoint = getPerformanceEndpoint(env, 'historyDelete');
    const url = urlConfig.buildFullURL(endpoint);
    return request(url, {
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
    const env = urlConfig.getEnvironment();
    const endpoint = getPerformanceEndpoint(env, 'modelPredict');
    const url = urlConfig.buildFullURL(endpoint);
    return request(url, {
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
    const env = urlConfig.getEnvironment();
    const endpoint = getPerformanceEndpoint(env, 'llmAnalysis');
    const url = urlConfig.buildFullURL(endpoint);
    return request(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        data: params,
    });
}

// LLM Analysis SSE Stream API
export interface LLMAnalysisStreamRequest {
    id: number;
    battery_system_id: number;
    lang: string;
}

/**
 * 使用 SSE 流式接收 LLM 分析结果
 */
export async function requestLLMAnalysisStream(params: LLMAnalysisStreamRequest): Promise<Response> {
    return sseRequest('/api/cellPerformance/llm_analysis', {
        method: 'POST',
        data: params,
    });
}
