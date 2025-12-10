// Model layer for performance history data management
import {
  getPerformanceHistoryList,
  getPerformanceHistoryDetail,
  deletePerformanceHistory,
  getBatterySystemList,
  type PerformanceHistoryItem,
  type PerformanceHistoryResponse,
} from '@/services/prediction/performance';
import { mockPerformanceHistory, generateMockDetail, type MockPerformanceHistoryItem } from './example';

// Check if user is logged in
const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Check if the record is a mock record
export const isMockRecord = (record: PerformanceHistoryItem | MockPerformanceHistoryItem): boolean => {
  // Check if the record has isMock field set to true
  return (record as MockPerformanceHistoryItem).isMock === true;
};

// Get performance history list with mock data fallback for not logged in users
export const getHistoryList = async (params?: any): Promise<{ data: PerformanceHistoryResponse }> => {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    console.log('User not logged in, returning mock data');
    return {
      data: {
        total: mockPerformanceHistory.length,
        data: mockPerformanceHistory
      }
    };
  }

  // Fetch real data
  const response = await getPerformanceHistoryList(params);
  return response;
};

// Get performance history detail with mock data fallback for not logged in users
export const getHistoryDetail = async (id: number): Promise<{ data: PerformanceHistoryItem | MockPerformanceHistoryItem }> => {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    const foundMockRecord = mockPerformanceHistory.find(item => item.id === id);
    if (foundMockRecord) {
      return {
        data: generateMockDetail(foundMockRecord)
      };
    }
    throw new Error('Record not found');
  }

  // Fetch real detail
  const response = await getPerformanceHistoryDetail(id);
  return response;
};

// Delete performance history
export const deleteHistory = async (id: number): Promise<any> => {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    throw new Error('Please login to delete records');
  }

  // Delete real record
  return deletePerformanceHistory(id);
};

// Get battery system list (always returns real data)
export const getBatterySystemOptions = async (params?: any): Promise<{ data: any[] }> => {
  try {
    const response = await getBatterySystemList(params);
    return response;
  } catch (error) {
    console.error('Error fetching battery systems:', error);
    // On error, return empty array instead of throwing
    return {
      data: []
    };
  }
};

// Export mock data utilities for testing
export { mockPerformanceHistory, generateMockDetail } from './example';

// ============= Model Training Functions =============

// Model training imports
import {
  trainModel as trainModelAPI,
  getModelList as getModelListAPI,
  getModelDetail as getModelDetailAPI,
  deployModel as deployModelAPI,
  removeModel as removeModelAPI,
  getModelFileList as getModelFileListAPI,
  getModelMetrics as getModelMetricsAPI,
  getModelTrainLog as getModelTrainLogAPI,
  type TrainModelParams,
  type ModelListParams,
  type ModelListResponse,
  type ModelDetailResponse,
  type ModelFileListParams,
  type ModelFileListResponse,
  type ModelMetricsParams,
  type ModelMetricsResponse,
  type ModelTrainLogParams,
} from '@/services/model/training';
import { mockModelList, mockModelDetail } from './modelExample';

// Namespace constant - used by all Design model training APIs
const MODEL_NAMESPACE = 'cell_performance';

// Model type name mapping for base models (base_model_id = -1)
const BASE_MODEL_TYPE_MAP: Record<number, string> = {
  1: 'Rate Performance',
  2: 'Coulombic Efficiency',
  3: 'Cycle Life',
};

/**
 * Transform model name for base models based on model_type
 * @param model Model data
 * @returns Transformed model with mapped name
 */
const transformBaseModelName = <T extends { base_model_id?: number; model_type?: number; name?: string }>(
  model: T
): T => {
  if (model.base_model_id === -1 && model.model_type && BASE_MODEL_TYPE_MAP[model.model_type]) {
    return {
      ...model,
      model_name: BASE_MODEL_TYPE_MAP[model.model_type]
    };
  }
  if (model.base_model_id && model.base_model_id > 0 && model.model_type && BASE_MODEL_TYPE_MAP[model.model_type]) {
    return {
      ...model,
      base_model_name: BASE_MODEL_TYPE_MAP[model.model_type]
    };
  }
  return model;
};

/**
 * Train a new model for Design
 * @param params Training parameters (without namespace, will be added automatically)
 * @returns Promise<{ id: string }> Training response with model ID
 */
export const trainModel = async (
  params: Omit<TrainModelParams, 'namespace'>
): Promise<{ id: string }> => {
  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  try {
    const response = await trainModelAPI({
      ...params,
      namespace: MODEL_NAMESPACE,
    });
    return response;
  } catch (error) {
    console.error('Train model failed:', error);
    throw error;
  }
};

/**
 * Get model list with mock data fallback for not logged in users
 * @param params Query parameters (without namespace, will be added automatically)
 * @returns Promise<ModelListResponse> Model list with pagination
 */
export const getModelList = async (
  params?: Omit<ModelListParams, 'namespace'>
): Promise<ModelListResponse> => {
  if (!isUserLoggedIn()) {
    console.log('User not logged in, returning mock model data');
    return { total: mockModelList.length, data: mockModelList };
  }

  const response = await getModelListAPI({
    ...params,
    namespace: MODEL_NAMESPACE,
  });

  // Transform base model names
  const transformedData = response.data.map(transformBaseModelName);

  return {
    ...response,
    data: transformedData,
  };
};

/**
 * Get base model list (base_model_id = -1)
 * @param params Query parameters
 * @returns Promise<ModelListResponse> Base model list with pagination
 */
export const getBaseModelList = async (
  params?: Omit<ModelListParams, 'namespace' | 'base_model_id'>
): Promise<ModelListResponse> => {
  if (!isUserLoggedIn()) {
    console.log('User not logged in, returning mock model data');
    return { total: mockModelList.length, data: mockModelList };
  }

  const response = await getModelListAPI({
    ...params,
    namespace: MODEL_NAMESPACE,
    base_model_id: -1,
  });

  // Transform base model names
  const transformedData = response.data.map(transformBaseModelName);

  return {
    ...response,
    data: transformedData,
  };
};

/**
 * Get mu model list (base_model_id = -2)
 * @param params Query parameters
 * @returns Promise<ModelListResponse> Mu model list with pagination
 */
export const getMuModelList = async (
  params?: Omit<ModelListParams, 'namespace' | 'base_model_id'>
): Promise<ModelListResponse> => {
  if (!isUserLoggedIn()) {
    console.log('User not logged in, returning mock model data');
    return { total: mockModelList.length, data: mockModelList };
  }

  const response = await getModelListAPI({
    ...params,
    namespace: MODEL_NAMESPACE,
    base_model_id: -2,
  });

  // Transform base model names (won't affect mu models but keep consistent)
  const transformedData = response.data.map(transformBaseModelName);

  return {
    ...response,
    data: transformedData,
  };
};

/**
 * Get model detail by ID with mock data fallback for not logged in users
 * @param modelId Model ID to fetch
 * @returns Promise<ModelDetailResponse> Model detail information
 */
export const getModelDetail = async (
  modelId: string
): Promise<ModelDetailResponse> => {
  if (!isUserLoggedIn()) {
    console.log('User not logged in, returning mock model detail');
    return mockModelDetail;
  }

  const response = await getModelDetailAPI({
    model_id: modelId,
    namespace: MODEL_NAMESPACE,
  });

  // Transform base model name
  return transformBaseModelName(response);
};

/**
 * Deploy model (make it online)
 * @param modelId Model ID to deploy
 * @returns Promise<any> Deploy result
 */
export const deployModel = async (modelId: string): Promise<any> => {
  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  return deployModelAPI({
    model_id: modelId,
    namespace: MODEL_NAMESPACE,
  });
};

/**
 * Remove/delete a model
 * @param modelId Model ID to remove
 * @returns Promise<any> Remove result
 */
export const removeModel = async (modelId: string): Promise<any> => {
  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  return removeModelAPI({ model_id: modelId, namespace: MODEL_NAMESPACE });
};

/**
 * Check if a model is a mock/demo model
 * @param model Model object to check
 * @returns boolean True if model is mock data
 */
export const isMockModel = (model: any): boolean => {
  return model?.isMock === true;
};

/**
 * Get model file list
 * @param modelId Model ID to fetch files for
 * @returns Promise<ModelFileListResponse> File list (array)
 */
export const getModelFileList = async (
  modelId: string
): Promise<ModelFileListResponse> => {
  try {
    if (!isUserLoggedIn()) {
      console.log('User not logged in, returning empty file list');
      return [];
    }

    const response = await getModelFileListAPI({
      model_id: modelId,
      namespace: MODEL_NAMESPACE,
    });
    return response;
  } catch (error) {
    console.error('Get model file list failed:', error);
    return [];
  }
};

/**
 * Get model metrics
 * @param modelId Model ID to fetch metrics for
 * @returns Promise<ModelMetricsResponse | null> Model metrics data
 */
export const getModelMetrics = async (
  modelId: string
): Promise<ModelMetricsResponse | null> => {
  try {
    if (!isUserLoggedIn()) {
      console.log('User not logged in, returning empty metrics');
      return null;
    }

    const response = await getModelMetricsAPI({
      model_id: modelId,
      namespace: MODEL_NAMESPACE,
    });
    return response;
  } catch (error) {
    console.error('Get model metrics failed:', error);
    return null;
  }
};

/**
 * Download model train log
 * @param modelId Model ID to download train log for
 * @param modelName Model name for filename
 * @returns Promise<void>
 */
export const downloadModelTrainLog = async (modelId: string, modelName: string): Promise<void> => {
  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  try {
    const blob = await getModelTrainLogAPI({
      model_id: modelId,
      namespace: MODEL_NAMESPACE,
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${modelName}_train_log.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download train log failed:', error);
    throw error;
  }
};

// Export mock model data utilities for testing
export { mockModelList, mockModelDetail } from './modelExample';
