// ============================================
// 电极性能 Model 层
// Electrode Performance Model Layer
// ============================================

import * as electrodeService from '@/services/electrode/electrodeService';
import { MOCK_HISTORY_DATA, MOCK_PREDICT_RESULT } from './mockData';
import type {
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
 * 获取电极性能历史记录详情
 * Get Electrode Performance History Detail
 *
 * @param params - 查询参数
 * @returns 历史记录详情
 */
export async function getElectrodeHistoryDetail(
  params: ElectrodeHistoryDetailParams,
): Promise<ElectrodeHistoryDetailResponse> {
  // Mock 模式
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockItem = MOCK_HISTORY_DATA.find((item) => item.id === params.id);
    if (!mockItem) {
      throw new Error(`Record not found: ${params.id}`);
    }

    return mockItem;
  }

  // 真实 API 调用
  return await electrodeService.getElectrodeHistoryDetail(params);
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
      model_result: MOCK_PREDICT_RESULT,
    };
  }

  // 真实 API 调用
  return await electrodeService.predictElectrodePerformance(params);
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
    anodeActiveMaterial: string;
    modelParams: ElectrodeModelParams;
  },
  pageType: ElectrodePageType,
): ElectrodeModelPredictParams {
  return {
    cell_design: formData.cellDesign,
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
};

// 导出枚举
export { ElectrodePageType as PageType } from '@/services/electrode/types';
