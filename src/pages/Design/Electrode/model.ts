// ============================================
// 电极性能 Model 层
// Electrode Performance Model Layer
// ============================================

import * as electrodeService from '@/services/electrode/electrodeService';
import { MOCK_HISTORY_DATA, MOCK_PREDICT_RESULT } from './mockData';
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
// Mock 数据开关
// ============================================

/**
 * 是否使用 Mock 数据
 * 可通过环境变量控制：REACT_APP_USE_ELECTRODE_MOCK
 */
const USE_MOCK = process.env.REACT_APP_USE_ELECTRODE_MOCK === 'true';

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
  };
}

// ============================================
// Model 层 API（数据处理 + Mock）
// ============================================

/**
 * 获取电极性能历史记录列表
 * Get Electrode Performance History List
 *
 * @param params - 查询参数
 * @returns 历史记录列表
 */
export async function getElectrodeHistoryList(
  params: ElectrodeHistoryListParams,
): Promise<ElectrodeHistoryListResponse> {
  // Mock 模式
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 简单过滤逻辑
    let filteredData = MOCK_HISTORY_DATA;

    if (params.cell_design) {
      filteredData = filteredData.filter((item) =>
        item.cell_design.toLowerCase().includes(params.cell_design!.toLowerCase()),
      );
    }

    if (params.cathode_active_material) {
      filteredData = filteredData.filter((item) =>
        item.cathode_active_material
          .toLowerCase()
          .includes(params.cathode_active_material!.toLowerCase()),
      );
    }

    if (params.anode_active_material) {
      filteredData = filteredData.filter((item) =>
        item.anode_active_material
          .toLowerCase()
          .includes(params.anode_active_material!.toLowerCase()),
      );
    }

    return {
      total: filteredData.length,
      data: filteredData,
    };
  }

  // 真实 API 调用
  return await electrodeService.getElectrodeHistoryList(params);
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
  // Mock 模式（仅支持 type=1）
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockItem = MOCK_HISTORY_DATA.find((item) => item.id === params.id);
    if (!mockItem) {
      throw new Error(`Record not found: ${params.id}`);
    }

    return {
      ...mockItem,
      model_result: formatModelResult(mockItem.model_result),
    };
  }

  // 真实 API 调用
  const response = await electrodeService.getElectrodeHistoryDetail(params);

  // 根据 type 处理不同的数据结构
  if (isOptimizeHistoryItem(response)) {
    // type=2: 反向设计 - model_result 是数组，格式化每个结果项
    return {
      ...response,
      model_result: formatOptimizeResults(response.model_result),
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
  // Mock 模式
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = MOCK_HISTORY_DATA.findIndex((item) => item.id === params.id);
    if (index === -1) {
      return { success: false };
    }

    // 注意：这里只是演示，实际 Mock 数据不会真的删除
    return { success: true };
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
  // Mock 模式
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      id: Math.floor(Math.random() * 10000),
      model_result: formatModelResult(MOCK_PREDICT_RESULT),
    };
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
    npRatio: string;
    cathodeActiveMaterial: string;
    anodeActiveMaterial: string;
    modelParams: ElectrodeModelParams;
  },
  pageType: ElectrodePageType,
): ElectrodeModelPredictParams {
  return {
    cell_design: formData.cellDesign,
    np_ratio: formData.npRatio,
    cathode_active_material: formData.cathodeActiveMaterial,
    anode_active_material: formData.anodeActiveMaterial,
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
