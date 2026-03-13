import type { EndpointConfig, Environment } from '../config/types';

export const PREDICTION_ENDPOINTS: EndpointConfig<Record<string, string>> = {
  default: {
    modelPredict: '/api/cellLife/model_predict',
    historyList: '/api/cellLife/history/list',
    historyDetail: '/api/cellLife/history/detail',
    historyDelete: '/api/cellLife/history/delete',
    fileGet: '/api/user/files/get',
  },
  us: {
    modelPredict: '/api/cellLife/model_predict',
    historyList: '/api/cellLife/history/list',
    historyDetail: '/api/cellLife/history/detail',
    historyDelete: '/api/cellLife/history/delete',
    fileGet: '/api/user/files/get',
  },
  box: {
    modelPredict: '/api/cellLife/model_predict',
    historyList: '/api/cellLife/history/list',
    historyDetail: '/api/cellLife/history/detail',
    historyDelete: '/api/cellLife/history/delete',
    fileGet: '/api/user/files/get',
  },
};

export const PERFORMANCE_ENDPOINTS: EndpointConfig<Record<string, string>> = {
  default: {
    batterySystemList: '/api/cellPerformance/batterySystem/list',
    historyList: '/api/cellPerformance/history/list',
    historyDetail: '/api/cellPerformance/history/detail',
    historyDelete: '/api/cellPerformance/history/delete',
    modelPredict: '/api/cellPerformance/model_predict',
    llmAnalysis: '/api/cellPerformance/llm_analysis',
  },
  us: {
    batterySystemList: '/api/cellPerformance/batterySystem/list',
    historyList: '/api/cellPerformance/history/list',
    historyDetail: '/api/cellPerformance/history/detail',
    historyDelete: '/api/cellPerformance/history/delete',
    modelPredict: '/api/cellPerformance/model_predict',
    llmAnalysis: '/api/cellPerformance/llm_analysis',
  },
  box: {
    batterySystemList: '/api/cellPerformance/batterySystem/list',
    historyList: '/api/cellPerformance/history/list',
    historyDetail: '/api/cellPerformance/history/detail',
    historyDelete: '/api/cellPerformance/history/delete',
    modelPredict: '/api/cellPerformance/model_predict',
    llmAnalysis: '/api/cellPerformance/llm_analysis',
  },
};

export const getPredictionEndpoint = (
  env: Environment,
  key: keyof typeof PREDICTION_ENDPOINTS.default,
) => {
  const envConfig = PREDICTION_ENDPOINTS[env as keyof typeof PREDICTION_ENDPOINTS] || {};
  return (envConfig as any)[key] || PREDICTION_ENDPOINTS.default[key];
};

export const getPerformanceEndpoint = (
  env: Environment,
  key: keyof typeof PERFORMANCE_ENDPOINTS.default,
) => {
  const envConfig = PERFORMANCE_ENDPOINTS[env as keyof typeof PERFORMANCE_ENDPOINTS] || {};
  return (envConfig as any)[key] || PERFORMANCE_ENDPOINTS.default[key];
};
