// ============================================
// 电极性能 Service 层（纯 API 调用）
// Electrode Performance Service Layer (Pure API Calls)
// ============================================

import request from '@/services/request';
import { urlConfig } from '@/services/config/urlConfig';
import { getElectrodeEndpoint } from './endpoints';
import type {
  ElectrodeHistoryListParams,
  ElectrodeHistoryItemRaw,
  ElectrodeHistoryDetailParams,
  ElectrodeHistoryDeleteParams,
  ElectrodeHistoryDeleteResponse,
  ElectrodeModelPredictParams,
  ElectrodeModelPredictResponseRaw,
} from './types';

// ============================================
// API 函数（只负责 API 调用，不做数据处理）
// ============================================

/**
 * 获取电极性能历史记录列表（原始响应）
 * Get Electrode Performance History List (Raw Response)
 *
 * @param params - 查询参数
 * @returns 历史记录列表原始响应（包含 JSON 字符串）
 *
 * @example
 * ```typescript
 * const response = await getElectrodeHistoryList({
 *   type: ElectrodePageType.RESULT_PREDICTION,
 *   page: 1,
 *   page_size: 20,
 * });
 * // response.data 包含原始的 JSON 字符串，需要在 Model 层解析
 * ```
 */
export async function getElectrodeHistoryList(
  params: ElectrodeHistoryListParams,
): Promise<{ total: number; data: ElectrodeHistoryItemRaw[] }> {
  const env = urlConfig.getEnvironment();
  const endpoint = getElectrodeEndpoint(env, 'historyList');
  const url = urlConfig.buildFullURL(endpoint);

  const response = await request(url, {
    method: 'GET',
    params,
  });

  return response.data as { total: number; data: ElectrodeHistoryItemRaw[] };
}

/**
 * 获取电极性能历史记录详情（原始响应）
 * Get Electrode Performance History Detail (Raw Response)
 *
 * @param params - 查询参数（需要 id 和 type）
 * @returns 历史记录详情原始响应（包含 JSON 字符串）
 *
 * @example
 * ```typescript
 * const detail = await getElectrodeHistoryDetail({
 *   id: 123,
 *   type: ElectrodePageType.RESULT_PREDICTION,
 * });
 * // detail 包含原始的 JSON 字符串，需要在 Model 层解析
 * ```
 */
export async function getElectrodeHistoryDetail(
  params: ElectrodeHistoryDetailParams,
): Promise<ElectrodeHistoryItemRaw> {
  const env = urlConfig.getEnvironment();
  const endpoint = getElectrodeEndpoint(env, 'historyDetail');
  const url = urlConfig.buildFullURL(endpoint);

  const response = await request(url, {
    method: 'GET',
    params,
  });

  return response.data as ElectrodeHistoryItemRaw;
}

/**
 * 删除电极性能历史记录
 * Delete Electrode Performance History
 *
 * @param params - 删除参数（需要 id）
 * @returns 删除结果
 *
 * @example
 * ```typescript
 * const result = await deleteElectrodeHistory({ id: 123 });
 * if (result.success) {
 *   message.success('删除成功');
 * }
 * ```
 */
export async function deleteElectrodeHistory(
  params: ElectrodeHistoryDeleteParams,
): Promise<ElectrodeHistoryDeleteResponse> {
  const env = urlConfig.getEnvironment();
  const endpoint = getElectrodeEndpoint(env, 'historyDelete');
  const url = urlConfig.buildFullURL(endpoint);

  const response = await request(url, {
    method: 'POST',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data as ElectrodeHistoryDeleteResponse;
}

/**
 * 电极性能预测（模型预测 - 原始响应）
 * Electrode Performance Prediction (Model Predict - Raw Response)
 *
 * @param params - 预测参数
 * @returns 预测结果原始响应（包含 JSON 字符串）
 *
 * @example
 * ```typescript
 * const result = await predictElectrodePerformance({
 *   cell_design: 'Cylindrical',
 *   cathode_active_material: 'LiFePO4',
 *   anode_active_material: 'Graphite',
 *   model_params: JSON.stringify({
 *     anodeBinder1: 0.8,
 *     cathodeBinder1: 0.8,
 *     // ... 其他参数
 *   }),
 *   type: ElectrodePageType.RESULT_PREDICTION,
 * });
 * // result.model_result 是 JSON 字符串，需要在 Model 层解析
 * ```
 */
export async function predictElectrodePerformance(
  params: ElectrodeModelPredictParams,
): Promise<ElectrodeModelPredictResponseRaw> {
  const env = urlConfig.getEnvironment();
  const endpoint = getElectrodeEndpoint(env, 'modelPredict');
  const url = urlConfig.buildFullURL(endpoint);

  const response = await request(url, {
    method: 'POST',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data as ElectrodeModelPredictResponseRaw;
}
