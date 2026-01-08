// ============================================
// 电极性能 API 端点配置
// Electrode Performance API Endpoints Configuration
// ============================================

import type { EndpointConfig, Environment } from '../config/types';

/**
 * 电极性能相关接口端点配置
 * Electrode Performance API Endpoints
 *
 * 支持多环境配置：production, staging, development, box, us
 * 所有环境默认使用相同的端点路径
 */
export const ELECTRODE_ENDPOINTS: EndpointConfig<Record<string, string>> = {
  /**
   * 默认端点配置（所有环境通用）
   * Default Endpoints (Used by All Environments)
   */
  default: {
    /** 获取历史记录列表 */
    historyList: '/api/electrodePerformance/history/list',
    /** 获取历史记录详情 */
    historyDetail: '/api/electrodePerformance/history/detail',
    /** 删除历史记录 */
    historyDelete: '/api/electrodePerformance/history/delete',
    /** 性能预测 */
    modelPredict: '/api/electrodePerformance/model_predict',
  },

  /**
   * 生产环境（可选覆盖）
   * Production Environment (Optional Overrides)
   */
  production: {
    // 如需覆盖特定端点，在此定义
    // Example: historyList: '/prod-api/electrodePerformance/history/list',
  },

  /**
   * 测试环境（可选覆盖）
   * Staging Environment (Optional Overrides)
   */
  staging: {
    // 如需覆盖特定端点，在此定义
  },

  /**
   * 开发环境（可选覆盖）
   * Development Environment (Optional Overrides)
   */
  development: {
    // 如需覆盖特定端点，在此定义
  },

  /**
   * Box 环境（可选覆盖）
   * Box Environment (Optional Overrides)
   */
  box: {
    // 如需覆盖特定端点，在此定义
  },

  /**
   * US 环境（可选覆盖）
   * US Environment (Optional Overrides)
   */
  us: {
    // 如需覆盖特定端点，在此定义
  },
};

/**
 * 获取电极性能端点（环境感知）
 * Get Electrode Performance Endpoint (Environment-Aware)
 *
 * @param env - 当前环境
 * @param key - 端点键名
 * @returns 端点路径
 *
 * @example
 * ```typescript
 * const env = urlConfig.getEnvironment();
 * const endpoint = getElectrodeEndpoint(env, 'historyList');
 * // => '/api/electrodePerformance/history/list'
 * ```
 */
export const getElectrodeEndpoint = (
  env: Environment,
  key: keyof typeof ELECTRODE_ENDPOINTS.default,
): string => {
  // 获取环境特定配置
  const envConfig = ELECTRODE_ENDPOINTS[env as keyof typeof ELECTRODE_ENDPOINTS] || {};

  // 优先使用环境特定端点，否则使用默认端点
  return (envConfig as any)[key] || ELECTRODE_ENDPOINTS.default[key];
};
