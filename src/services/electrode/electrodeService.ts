// ============================================
// 电极性能 Service 层（纯 API 调用）
// Electrode Performance Service Layer (Pure API Calls)
// ============================================

import request from '@/services/request';
import { urlConfig } from '@/services/config/urlConfig';
import { getElectrodeEndpoint } from './endpoints';
import type {
  ElectrodeHistoryListParams,
  ElectrodeHistoryItem,
  ElectrodeHistoryDetailParams,
  ElectrodeHistoryDeleteParams,
  ElectrodeHistoryDeleteResponse,
  ElectrodeModelPredictParams,
  ElectrodeModelPredictResponse,
} from './types';

// ============================================
// API 函数（只负责 API 调用，不做数据处理）
// ============================================

/**
 * 获取电极性能历史记录列表
 * Get Electrode Performance History List
 *
 * @param params - 查询参数
 * @returns 历史记录列表（包含对象）
 *
 * @example
 * ```typescript
 * const response = await getElectrodeHistoryList({
 *   type: ElectrodePageType.RESULT_PREDICTION,
 *   page: 1,
 *   page_size: 20,
 * });
 * // response.data 直接包含对象，无需解析
 * ```
 */
export async function getElectrodeHistoryList(
  params: ElectrodeHistoryListParams,
): Promise<{ total: number; data: ElectrodeHistoryItem[] }> {
  const env = urlConfig.getEnvironment();
  const endpoint = getElectrodeEndpoint(env, 'historyList');
  const url = urlConfig.buildFullURL(endpoint);

  const response = await request(url, {
    method: 'GET',
    params,
  });

  return response.data as { total: number; data: ElectrodeHistoryItem[] };
}

/**
 * 获取电极性能历史记录详情
 * Get Electrode Performance History Detail
 *
 * @param params - 查询参数（需要 id 和 type）
 * @returns 历史记录详情（包含对象）
 *
 * @example
 * ```typescript
 * const detail = await getElectrodeHistoryDetail({
 *   id: 123,
 *   type: ElectrodePageType.RESULT_PREDICTION,
 * });
 * // detail 直接包含对象，无需解析
 * ```
 */
export async function getElectrodeHistoryDetail(
  params: ElectrodeHistoryDetailParams,
): Promise<ElectrodeHistoryItem> {
  const env = urlConfig.getEnvironment();
  const endpoint = getElectrodeEndpoint(env, 'historyDetail');
  const url = urlConfig.buildFullURL(endpoint);

  const response = await request(url, {
    method: 'GET',
    params,
  });

  return response.data as ElectrodeHistoryItem;
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
 * 电极性能预测（模型预测）
 * Electrode Performance Prediction (Model Predict)
 *
 * @param params - 预测参数
 * @returns 预测结果（包含对象）
 *
 * @example
 * ```typescript
 * const result = await predictElectrodePerformance({
 *   cell_design: 'Cylindrical',
 *   cathode_active_material: 'LiFePO4',
 *   anode_active_material: 'Graphite',
 *   model_params: {
 *     anodeBinder1: 0.8,
 *     cathodeBinder1: 0.8,
 *     // ... 其他参数
 *   },
 *   type: ElectrodePageType.RESULT_PREDICTION,
 * });
 * // result.model_result 直接是对象，无需解析
 * ```
 */
export async function predictElectrodePerformance(
  params: ElectrodeModelPredictParams,
): Promise<ElectrodeModelPredictResponse> {
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

  return response.data as ElectrodeModelPredictResponse;
}
