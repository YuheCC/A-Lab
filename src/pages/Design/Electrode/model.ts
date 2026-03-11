// ============================================
// 电极性能 Model 层
// Electrode Performance Model Layer
// ============================================

import * as electrodeService from '@/services/electrode/electrodeService';
import { mockElectrodeHistory, generateMockDetail, type MockElectrodeHistoryItem } from './example';
import {
  ElectrodePageType,
  isOptimizeHistoryItem,
  type ElectrodeHistoryListParams,
  type ElectrodeHistoryListResponse,
  type ElectrodeHistoryItem,
  type ElectrodeHistoryDetailParams,
  type ElectrodeHistoryDetailResponse,
  type ElectrodeHistoryDeleteParams,
  type ElectrodeHistoryDeleteResponse,
  type ElectrodeModelPredictParams,
  type ElectrodeModelPredictResponse,
  type ElectrodeModelParams,
  type ElectrodeModelResult,
  type OptimizeHistoryItem,
  type OptimizeResultItemDTO,
  type UniversalHistoryDetailResponse,
} from '@/services/electrode/types';

// ============================================
// 登录状态检查
// ============================================

// Check if user is logged in
const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Check if the record is a mock record
export const isMockRecord = (record: any): boolean => {
  return record?.isMock === true;
};

// ============================================
// 辅助函数 - 数据处理
// ============================================

/**
 * 格式化 model_result，将所有数字字段保留2位小数
 * Format model_result to keep 2 decimal places for all number fields
 *
 * @param result - 原始模型结果
 * @returns 格式化后的模型结果
 */
function formatModelResult(result: ElectrodeModelResult): ElectrodeModelResult {
  return {
    designCapacity: Number(result.designCapacity?.toFixed(2)),
    specificED: Number(result.specificED?.toFixed(2)),
    jellyRollThickness: Number(result.jellyRollThickness?.toFixed(2)),
    volumetricED: Number(result.volumetricED?.toFixed(2)),
    // Rate Capability 字段（可选，保留2位小数）
    cap1C: result.cap1C !== undefined ? Number(result.cap1C.toFixed(2)) : undefined,
    cap2C: result.cap2C !== undefined ? Number(result.cap2C.toFixed(2)) : undefined,
    cap3C: result.cap3C !== undefined ? Number(result.cap3C.toFixed(2)) : undefined,
    cap4C: result.cap4C !== undefined ? Number(result.cap4C.toFixed(2)) : undefined,
    cap5C: result.cap5C !== undefined ? Number(result.cap5C.toFixed(2)) : undefined,
    t1C: result.t1C !== undefined ? Number(result.t1C.toFixed(2)) : undefined,
    t2C: result.t2C !== undefined ? Number(result.t2C.toFixed(2)) : undefined,
    t3C: result.t3C !== undefined ? Number(result.t3C.toFixed(2)) : undefined,
    t4C: result.t4C !== undefined ? Number(result.t4C.toFixed(2)) : undefined,
    t5C: result.t5C !== undefined ? Number(result.t5C.toFixed(2)) : undefined,
  };
}

// ============================================
// Model 层 API（数据处理 + Mock）
// ============================================

/**
 * 获取电极性能历史记录列表
 * Get Electrode Performance History List
 *
 * 统一逻辑：
 * - 未登录 → 返回 mock 数据
 * - 已登录 + 有搜索条件（id）→ 仅返回搜索结果，不展示 mock
 * - 已登录 + 无搜索条件 + 列表为空 → 返回 mock 数据
 * - 已登录 + 无搜索条件 + 有数据 → 仅返回真实数据
 *
 * @param params - 查询参数
 * @returns 历史记录列表
 */
export async function getElectrodeHistoryList(
  params: ElectrodeHistoryListParams,
): Promise<ElectrodeHistoryListResponse> {
  // 未登录，返回 mock 数据
  if (!isUserLoggedIn()) {
    console.log('User not logged in, returning mock electrode data');
    return {
      total: mockElectrodeHistory.length,
      data: mockElectrodeHistory,
    };
  }

  // 检查是否有搜索条件
  const hasSearchCondition = params && params.id;

  try {
    // 真实 API 调用
    const response = await electrodeService.getElectrodeHistoryList(params);

    // 有搜索条件时，仅返回搜索结果，不展示 mock
    if (hasSearchCondition) {
      return response;
    }

    // 无搜索条件且列表为空，返回 mock 数据
    if (!response.data || response.data.length === 0) {
      console.log('No electrode history data found, returning mock data');
      return {
        total: mockElectrodeHistory.length,
        data: mockElectrodeHistory,
      };
    }

    return response;
  } catch (error) {
    console.error('Error fetching electrode history list:', error);
    // 出错时根据搜索条件决定是否返回 mock
    if (hasSearchCondition) {
      return { total: 0, data: [] };
    }
    return {
      total: mockElectrodeHistory.length,
      data: mockElectrodeHistory,
    };
  }
}

/**
 * 格式化 Optimize 结果数组，将所有数字字段保留2位小数
 * Format Optimize result array to keep 2 decimal places for all number fields
 *
 * @param results - 原始 Optimize 结果数组
 * @returns 格式化后的结果数组
 */
function formatOptimizeResults(results: OptimizeResultItemDTO[]): OptimizeResultItemDTO[] {
  return results.map((item) => ({
    // 阴极参数
    cathode_binder_wt: Number(item.cathode_binder_wt?.toFixed(2)),
    cathode_cnt_wt: Number(item.cathode_cnt_wt?.toFixed(2)),
    cathode_conductive_carbon_wt: Number(item.cathode_conductive_carbon_wt?.toFixed(2)),
    cathode_areal_loading: Number(item.cathode_areal_loading?.toFixed(2)),
    cathode_press_density: Number(item.cathode_press_density?.toFixed(2)),
    // 阳极参数
    anode_binder1_wt: Number(item.anode_binder1_wt?.toFixed(2)),
    anode_binder2_wt: Number(item.anode_binder2_wt?.toFixed(2)),
    anode_binder3_wt: Number(item.anode_binder3_wt?.toFixed(2)),
    anode_conductive_carbon_wt: Number(item.anode_conductive_carbon_wt?.toFixed(2)),
    anode_cnt_wt: Number(item.anode_cnt_wt?.toFixed(2)),
    anode_press_density: Number(item.anode_press_density?.toFixed(2)),
    // 尺寸参数
    width: item.width,
    length: item.length,
    layers: item.layers,
    // 结果参数
    design_capacity: Number(item.design_capacity?.toFixed(2)),
    specific_ED: Number(item.specific_ED?.toFixed(2)),
    jelly_roll_thickness: Number(item.jelly_roll_thickness?.toFixed(2)),
    volumetric_ED: Number(item.volumetric_ED?.toFixed(2)),
  }));
}

/**
 * 获取电极性能历史记录详情
 * Get Electrode Performance History Detail
 *
 * @param params - 查询参数（包含 type 区分正向预测和反向设计）
 * @returns 历史记录详情（根据 type 返回不同结构）
 *   - type=1: ElectrodeHistoryItem（正向预测）
 *   - type=2: OptimizeHistoryItem（反向设计）
 */
export async function getElectrodeHistoryDetail(
  params: ElectrodeHistoryDetailParams,
): Promise<UniversalHistoryDetailResponse> {
  // Check if this is a mock record
  const mockRecord = mockElectrodeHistory.find(item => item.id === params.id);
  if (mockRecord && mockRecord.isMock) {
    console.log('Returning mock electrode detail for ID:', params.id);
    return {
      ...generateMockDetail(mockRecord),
      model_result: formatModelResult(generateMockDetail(mockRecord).model_result),
    };
  }

  // 未登录时尝试从 mock 数据查找
  if (!isUserLoggedIn()) {
    const foundMockRecord = mockElectrodeHistory.find(item => item.id === params.id);
    if (foundMockRecord) {
      return {
        ...generateMockDetail(foundMockRecord),
        model_result: formatModelResult(generateMockDetail(foundMockRecord).model_result),
      };
    }
    throw new Error('Record not found');
  }

  // 真实 API 调用
  const response = await electrodeService.getElectrodeHistoryDetail(params);

  // 根据 type 处理不同的数据结构
  if (isOptimizeHistoryItem(response)) {
    // type=2: 反向设计 - model_result 是数组，格式化每个结果项
    return {
      ...response,
      model_result: {
        valid: formatOptimizeResults(response.model_result.valid),
        invalid: formatOptimizeResults(response.model_result.invalid),
      },
    };
  }

  // type=1: 正向预测 - model_result 是单个对象
  return {
    ...response,
    model_result: formatModelResult(response.model_result),
  };
}

/**
 * 删除电极性能历史记录
 * Delete Electrode Performance History
 *
 * @param params - 删除参数
 * @returns 删除结果
 */
export async function deleteElectrodeHistory(
  params: ElectrodeHistoryDeleteParams,
): Promise<ElectrodeHistoryDeleteResponse> {
  // Mock 记录不可删除
  const mockRecord = mockElectrodeHistory.find(item => item.id === params.id);
  if (mockRecord && mockRecord.isMock) {
    console.log('Cannot delete mock electrode record with ID:', params.id);
    throw new Error('Cannot delete demo record');
  }

  // 未登录不可删除
  if (!isUserLoggedIn()) {
    throw new Error('Please login to delete records');
  }

  // 真实 API 调用
  return await electrodeService.deleteElectrodeHistory(params);
}

/**
 * 电极性能预测
 * Electrode Performance Prediction
 *
 * @param params - 预测参数
 * @returns 预测结果
 */
export async function predictElectrodePerformance(
  params: ElectrodeModelPredictParams,
): Promise<ElectrodeModelPredictResponse> {
  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  // 真实 API 调用
  const response = await electrodeService.predictElectrodePerformance(params);

  // 格式化 model_result，保留2位小数
  return {
    ...response,
    model_result: formatModelResult(response.model_result),
  };
}

// ============================================
// 便捷函数
// ============================================

/**
 * 构建预测请求参数（从前端表单数据）
 * Build Predict Request Parameters (From Frontend Form Data)
 *
 * @param formData - 前端表单数据
 * @param pageType - 页面类型
 * @returns API 请求参数
 */
export function buildPredictParams(
  formData: {
    cellDesign: string;
    cathodeActiveMaterial: string;
    anodeActiveMaterial?: string;
    modelParams: ElectrodeModelParams;
  },
  pageType: ElectrodePageType,
): ElectrodeModelPredictParams {
  return {
    cell_design: formData.cellDesign,
    cathode_active_material: formData.cathodeActiveMaterial,
    ...(formData.anodeActiveMaterial !== undefined && { anode_active_material: formData.anodeActiveMaterial }),
    model_params: formData.modelParams,
    type: pageType,
  };
}

// ============================================
// 类型导出（便于页面组件使用）
// ============================================

export type {
  ElectrodePageType,
  ElectrodeHistoryListParams,
  ElectrodeHistoryListResponse,
  ElectrodeHistoryItem,
  ElectrodeHistoryDetailParams,
  ElectrodeHistoryDetailResponse,
  ElectrodeHistoryDeleteParams,
  ElectrodeHistoryDeleteResponse,
  ElectrodeModelPredictParams,
  ElectrodeModelPredictResponse,
  ElectrodeModelParams,
  ElectrodeModelResult,
  OptimizeHistoryItem,
  OptimizeResultItemDTO,
  UniversalHistoryDetailResponse,
};

// 导出枚举和类型守卫
export { ElectrodePageType as PageType } from '@/services/electrode/types';
export { isOptimizeHistoryItem } from '@/services/electrode/types';

// Export mock data utilities
export { mockElectrodeHistory, generateMockDetail } from './example';
