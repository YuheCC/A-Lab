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
  ElectrodeModelParams,
  ElectrodeModelParamsDTO,
  ElectrodeModelResult,
  ElectrodeModelResultDTO,
} from './types';

// ============================================
// Transfer 层 - 数据转换函数
// Transfer Layer - Data Conversion Functions
// ============================================

/**
 * 将前端业务模型转换为后端 DTO（用于发送请求）
 * Convert Frontend Business Model to Backend DTO (for API requests)
 */
function toElectrodeModelParamsDTO(
  params: ElectrodeModelParams,
): ElectrodeModelParamsDTO {
  return {
    // 阳极参数映射
    anode_binder1_wt: params.anodeCMC,
    anode_binder2_wt: params.anodeSBR,
    anode_binder3_wt: params.anodePAA,
    anode_conductive_carbon_wt: params.anodeSuperP,
    anode_cnt_wt: params.anodeSWCNT,
    anode_press_density: params.anodePressDensity,
    anodeSCBI: params.anodeSCBI,
    anodeGrSI: params.anodeGrSI,
    anode_areal_loading: params.anodeArealLoading,

    // 阴极参数映射
    cathode_binder_wt: params.cathodeKF9700,
    cathode_cnt_wt: params.cathodeCN01Y,
    cathode_conductive_carbon_wt: params.cathodeSuperC65,
    cathode_areal_loading: params.cathodeArealLoading,
    cathode_press_density: params.cathodePressDensity,
    cathode_NCMA: params.cathodeNCMA,

    // 尺寸参数（不需要转换）
    width: params.width,
    length: params.length,
    layers: params.layers,
  };
}

/**
 * 将后端 DTO 转换为前端业务模型（用于接收响应）
 * Convert Backend DTO to Frontend Business Model (for API responses)
 *
 * 优先使用老字段(驼峰命名),如果不存在则使用新字段(下划线命名)
 */
function fromElectrodeModelParamsDTO(
  dto: ElectrodeModelParamsDTO | any,
): ElectrodeModelParams {
  return {
    // 阳极参数映射 - 优先使用老字段
    anodeCMC: dto.anodeCMC ?? dto.anode_binder1_wt,
    anodeSBR: dto.anodeSBR ?? dto.anode_binder2_wt,
    anodePAA: dto.anodePAA ?? dto.anode_binder3_wt,
    anodeSuperP: dto.anodeSuperP ?? dto.anode_conductive_carbon_wt,
    anodeSWCNT: dto.anodeSWCNT ?? dto.anode_cnt_wt,
    anodePressDensity: dto.anodePressDensity ?? dto.anode_press_density,
    anodeSCBI: dto.anodeSCBI,
    anodeGrSI: dto.anodeGrSI,
    anodeArealLoading: dto.anodeArealLoading ?? dto.anode_areal_loading,

    // 阴极参数映射 - 优先使用老字段
    cathodeKF9700: dto.cathodeKF9700 ?? dto.cathode_binder_wt,
    cathodeCN01Y: dto.cathodeCN01Y ?? dto.cathode_cnt_wt,
    cathodeSuperC65: dto.cathodeSuperC65 ?? dto.cathode_conductive_carbon_wt,
    cathodeArealLoading: dto.cathodeArealLoading ?? dto.cathode_areal_loading,
    cathodePressDensity: dto.cathodePressDensity ?? dto.cathode_press_density,
    cathodeNCMA: dto.cathodeNCMA ?? dto.cathode_NCMA,

    // 尺寸参数（不需要转换）
    width: dto.width,
    length: dto.length,
    layers: dto.layers,
  };
}

/**
 * 将后端 DTO 转换为前端业务模型（用于接收响应）
 * Convert Backend DTO to Frontend Business Model (for API responses)
 *
 * 优先使用老字段(驼峰命名),如果不存在则使用新字段(下划线命名)
 */
function fromElectrodeModelResultDTO(
  dto: ElectrodeModelResultDTO | any,
): ElectrodeModelResult {
  return {
    designCapacity: dto.designCapacity ?? dto.design_capacity,
    specificED: dto.specificED ?? dto.specific_ED,
    jellyRollThickness: dto.jellyRollThickness ?? dto.jelly_roll_thickness,
    volumetricED: dto.volumetricED ?? dto.volumetric_ED,
  };
}

/**
 * 将前端业务模型转换为后端 DTO（用于发送请求）
 * Convert Frontend Business Model to Backend DTO (for API requests)
 */
function toElectrodeModelResultDTO(
  result: ElectrodeModelResult,
): ElectrodeModelResultDTO {
  return {
    design_capacity: result.designCapacity,
    specific_ED: result.specificED,
    jelly_roll_thickness: result.jellyRollThickness,
    volumetric_ED: result.volumetricED,
  };
}

// ============================================
// API 函数（只负责 API 调用，不做数据处理）
// ============================================

/**
 * 获取电极性能历史记录列表
 * Get Electrode Performance History List
 *
 * @param params - 查询参数
 * @returns 历史记录列表（包含前端业务模型）
 *
 * @example
 * ```typescript
 * const response = await getElectrodeHistoryList({
 *   type: ElectrodePageType.RESULT_PREDICTION,
 *   page: 1,
 *   page_size: 20,
 * });
 * // response.data 已转换为前端驼峰命名格式
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

  // 转换后端 DTO 为前端业务模型
  const rawData = response.data as {
    total: number;
    data: Array<{
      id: number;
      cell_design: string;
      np_ratio?: string;
      cathode_active_material: string;
      anode_active_material: string;
      model_params: ElectrodeModelParamsDTO;
      model_result: ElectrodeModelResultDTO;
      created_at?: string;
      updated_at?: string;
    }>;
  };

  return {
    total: rawData.total,
    data: rawData.data.map((item) => ({
      id: item.id,
      cell_design: item.cell_design,
      np_ratio: item.np_ratio,
      cathode_active_material: item.cathode_active_material,
      anode_active_material: item.anode_active_material,
      model_params: fromElectrodeModelParamsDTO(item.model_params),
      model_result: fromElectrodeModelResultDTO(item.model_result),
      created_at: item.created_at,
      updated_at: item.updated_at,
    })),
  };
}

/**
 * 获取电极性能历史记录详情
 * Get Electrode Performance History Detail
 *
 * @param params - 查询参数（需要 id 和 type）
 * @returns 历史记录详情（包含前端业务模型）
 *
 * @example
 * ```typescript
 * const detail = await getElectrodeHistoryDetail({
 *   id: 123,
 *   type: ElectrodePageType.RESULT_PREDICTION,
 * });
 * // detail 已转换为前端驼峰命名格式
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

  // 转换后端 DTO 为前端业务模型
  const rawData = response.data as {
    id: number;
    cell_design: string;
    np_ratio?: string;
    cathode_active_material: string;
    anode_active_material: string;
    model_params: ElectrodeModelParamsDTO;
    model_result: ElectrodeModelResultDTO;
    created_at?: string;
    updated_at?: string;
  };

  return {
    id: rawData.id,
    cell_design: rawData.cell_design,
    np_ratio: rawData.np_ratio,
    cathode_active_material: rawData.cathode_active_material,
    anode_active_material: rawData.anode_active_material,
    model_params: fromElectrodeModelParamsDTO(rawData.model_params),
    model_result: fromElectrodeModelResultDTO(rawData.model_result),
    created_at: rawData.created_at,
    updated_at: rawData.updated_at,
  };
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
 * @param params - 预测参数（使用前端业务模型）
 * @returns 预测结果（包含前端业务模型）
 *
 * @example
 * ```typescript
 * const result = await predictElectrodePerformance({
 *   cell_design: 'Cylindrical',
 *   np_ratio: '1.1',
 *   cathode_active_material: 'LiFePO4',
 *   anode_active_material: 'Graphite',
 *   model_params: {
 *     anodeCMC: 0.8,
 *     anodeSBR: 1.2,
 *     // ... 其他参数（驼峰命名）
 *   },
 *   type: ElectrodePageType.RESULT_PREDICTION,
 * });
 * // result.model_result 已转换为前端驼峰命名格式
 * ```
 */
export async function predictElectrodePerformance(
  params: ElectrodeModelPredictParams,
): Promise<ElectrodeModelPredictResponse> {
  const env = urlConfig.getEnvironment();
  const endpoint = getElectrodeEndpoint(env, 'modelPredict');
  const url = urlConfig.buildFullURL(endpoint);

  // 将前端业务模型转换为后端 DTO
  const requestData = {
    cell_design: params.cell_design,
    np_ratio: params.np_ratio,
    cathode_active_material: params.cathode_active_material,
    anode_active_material: params.anode_active_material,
    model_params: toElectrodeModelParamsDTO(params.model_params),
    type: params.type,
  };

  const response = await request(url, {
    method: 'POST',
    data: requestData,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 转换后端 DTO 为前端业务模型
  const rawData = response.data as {
    id: number;
    model_result: ElectrodeModelResultDTO;
  };

  return {
    id: rawData.id,
    model_result: fromElectrodeModelResultDTO(rawData.model_result),
  };
}
