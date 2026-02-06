// Model layer for predictionTool history data management and model training
import {
  getHistoryList as getHistoryListAPI,
  getHistoryDetail as getHistoryDetailAPI,
  deleteHistory as deleteHistoryAPI,
  type HistoryListResponse,
  type HistoryDetailResponse,
  type HistoryListParams,
  type DeleteHistoryParams,
  type DeleteHistoryResponse
} from '@/services/prediction/predictionTool';
import { mockPredictionHistory, generateMockDetail, type MockPredictResponse, type MockHistoryDetailResponse } from './example';

// Model training imports
import {
  trainModel as trainModelAPI,
  getModelList as getModelListAPI,
  getModelDetail as getModelDetailAPI,
  deployModel as deployModelAPI,
  undeployModel as undeployModelAPI,
  removeModel as removeModelAPI,
  getModelFileList as getModelFileListAPI,
  getModelMetrics as getModelMetricsAPI,
  getModelTrainLog as getModelTrainLogAPI,
  downloadModelFile as downloadModelFileAPI,
  type TrainModelParams,
  type ModelListParams,
  type ModelListResponse,
  type ModelDetailResponse,
  type ModelFileListParams,
  type ModelFileListResponse,
  type ModelMetricsParams,
  type ModelMetricsResponse,
  type ModelTrainLogParams,
  type ModelFileDownloadParams,
} from '@/services/model/training';
import { mockModelList, mockModelDetail } from './modelExample';

// Check if user is logged in
const isUserLoggedIn = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Check if the record is a mock record
export const isMockRecord = (record: any): boolean => {
  // Check if the record has isMock field set to true
  return record?.isMock === true;
};

/**
 * Get prediction history list with mock data fallback
 * 统一逻辑：
 * - 未登录 → 返回 mock 数据
 * - 已登录 + 有搜索条件（id, model_id）→ 仅返回搜索结果，不展示 mock
 * - 已登录 + 无搜索条件 + 列表为空 → 返回 mock 数据
 * - 已登录 + 无搜索条件 + 有数据 → 仅返回真实数据
 */
export const getHistoryList = async (params: HistoryListParams = {}): Promise<HistoryListResponse> => {
  try {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      console.log('User not logged in, returning mock data');
      return {
        total: mockPredictionHistory.length,
        data: mockPredictionHistory
      };
    }

    // 检查是否有搜索条件（params 可能包含动态扩展字段）
    const paramsAny = params as any;
    const hasSearchCondition = paramsAny && (paramsAny.id || paramsAny.model_id);

    // Try to fetch real data
    const response = await getHistoryListAPI(params);

    // Check if response is valid and has data
    if (response && response.data && Array.isArray(response.data)) {
      // 有搜索条件时，仅返回搜索结果，不展示 mock
      if (hasSearchCondition) {
        return response;
      }

      // If data is empty and no search, return mock data
      if (response.data.length === 0) {
        console.log('No history data found, returning mock data');
        return {
          total: mockPredictionHistory.length,
          data: mockPredictionHistory
        };
      }
      return response;
    }

    // If response is invalid, return mock data (only when no search condition)
    console.log('Invalid response, returning mock data');
    if (hasSearchCondition) {
      return { total: 0, data: [] };
    }
    return {
      total: mockPredictionHistory.length,
      data: mockPredictionHistory
    };
  } catch (error) {
    console.error('Error fetching history list:', error);
    // On error, return mock data (only when no search condition)
    const paramsAny = params as any;
    const hasSearchCondition = paramsAny && (paramsAny.id || paramsAny.model_id);
    if (hasSearchCondition) {
      return { total: 0, data: [] };
    }
    return {
      total: mockPredictionHistory.length,
      data: mockPredictionHistory
    };
  }
};

// Get prediction history detail with mock data fallback
export const getHistoryDetail = async (id: number): Promise<HistoryDetailResponse | MockHistoryDetailResponse> => {
  try {
    // Check if this is a mock record by finding it in mock data
    const mockRecord = mockPredictionHistory.find(item => item.id === id);
    if (mockRecord && mockRecord.isMock) {
      console.log('Returning mock detail for ID:', id);
      return generateMockDetail(mockRecord);
    }

    // Check if user is logged in
    if (!isUserLoggedIn()) {
      const foundMockRecord = mockPredictionHistory.find(item => item.id === id);
      if (foundMockRecord) {
        return generateMockDetail(foundMockRecord);
      }
      throw new Error('Record not found');
    }

    // Try to fetch real detail
    const response = await getHistoryDetailAPI(id);

    if (response) {
      return response;
    }

    // If no data, try to find in mock data
    const fallbackMockRecord = mockPredictionHistory.find(item => item.id === id);
    if (fallbackMockRecord) {
      return generateMockDetail(fallbackMockRecord);
    }

    throw new Error('Record not found');
  } catch (error) {
    console.error('Error fetching history detail:', error);

    // Try to find in mock data as fallback
    const errorMockRecord = mockPredictionHistory.find(item => item.id === id);
    if (errorMockRecord) {
      return generateMockDetail(errorMockRecord);
    }

    throw error;
  }
};

// Delete prediction history (mock records cannot be deleted)
export const deleteHistory = async (params: DeleteHistoryParams): Promise<DeleteHistoryResponse> => {
  // Check if this is a mock record by finding it in mock data
  const mockRecord = mockPredictionHistory.find(item => item.id === params.id);
  if (mockRecord && mockRecord.isMock) {
    console.log('Cannot delete mock record with ID:', params.id);
    throw new Error('Cannot delete demo record');
  }

  // Check if user is logged in
  if (!isUserLoggedIn()) {
    throw new Error('Please login to delete records');
  }

  // Delete real record
  return deleteHistoryAPI(params);
};

// Export mock data utilities for testing
export { mockPredictionHistory, generateMockDetail } from './example';

// ============= Model Training Functions =============

// Namespace constant - used by all model training APIs
const MODEL_NAMESPACE = 'cell_life';

/**
 * Train a new model
 * @param params Training parameters (without namespace, will be added automatically)
 * @returns Promise<TrainModelResponse> Training response with model ID
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
 * Get base model list (base_model_id = -1)
 * @param params Query parameters
 * @returns Promise<ModelListResponse> Base model list with pagination
 */
export const getBaseModelList = async (
  params?: Omit<ModelListParams, 'namespace' | 'base_model_id'>
): Promise<ModelListResponse> => {
  try { 
    const response = await getModelListAPI({
      ...params,
      namespace: MODEL_NAMESPACE,
      base_model_id: -1,
    });

    if (response?.data && response.data.length > 0) {
      return response;
    }

    console.log('No base model data found, returning mock data');
    return { total: 0, data: [] };
  } catch (error) {   
    console.error('Get base model list failed:', error);
    return { total: 0, data: [] };
  }
};

/**
 * Get model list with mock data fallback
 * @param params Query parameters (without namespace, will be added automatically)
 * @returns Promise<ModelListResponse> Model list with pagination
 */
export const getModelList = async (
  params?: Omit<ModelListParams, 'namespace'>
): Promise<ModelListResponse> => {
  try {
    const response = await getModelListAPI({
      ...params,
      namespace: MODEL_NAMESPACE,
    });

    if (response?.data && response.data.length > 0) {
      return response;
    }

    // Return mock data when no data
    console.log('No model data found, returning mock data');
    return { total: 0, data: [] };
  } catch (error) {
    console.error('Get model list failed:', error);
    return { total: 0, data: [] };
  }
};

/**
 * Get model detail by ID with mock data fallback
 * @param modelId Model ID to fetch
 * @returns Promise<ModelDetailResponse> Model detail information
 */
export const getModelDetail = async (
  modelId: string
): Promise<ModelDetailResponse> => {
  try {
    // Check if it's mock data
    const mockModel = mockModelList.find(item => item.id.toString() === modelId);
    if (mockModel?.isMock) {
      console.log('Returning mock model detail for ID:', modelId);
      return mockModelDetail;
    }

    if (!isUserLoggedIn()) {
      if (mockModel) return mockModelDetail;
      throw new Error('Model not found');
    }

    const response = await getModelDetailAPI({
      model_id: modelId,
      namespace: MODEL_NAMESPACE,
    });
    return response;
  } catch (error) {
    console.error('Get model detail failed:', error);
    // Fallback to mock
    const mockModel = mockModelList.find(item => item.id.toString() === modelId);
    if (mockModel) return mockModelDetail;
    throw error;
  }
};

/**
 * Deploy model (make it online)
 * @param modelId Model ID to deploy
 * @returns Promise<any> Deploy result
 */
export const deployModel = async (modelId: string): Promise<any> => {
  const mockModel = mockModelList.find(item => item.id.toString() === modelId);
  if (mockModel?.isMock) {
    console.log('Cannot deploy mock model with ID:', modelId);
    throw new Error('Cannot deploy demo model');
  }

  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  try {
    return await deployModelAPI({
      model_id: modelId,
      namespace: MODEL_NAMESPACE,
    });
  } catch (error) {
    console.error('Deploy model failed:', error);
    throw error;
  }
};

/**
 * Undeploy model (make it offline)
 * @param modelId Model ID to undeploy
 * @returns Promise<any> Undeploy result
 */
export const undeployModel = async (modelId: string): Promise<any> => {
  const mockModel = mockModelList.find(item => item.id.toString() === modelId);
  if (mockModel?.isMock) {
    console.log('Cannot undeploy mock model with ID:', modelId);
    throw new Error('Cannot undeploy demo model');
  }

  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  try {
    return await undeployModelAPI({
      model_id: modelId,
      namespace: MODEL_NAMESPACE,
    });
  } catch (error) {
    console.error('Undeploy model failed:', error);
    throw error;
  }
};

/**
 * Remove/delete a model
 * @param modelId Model ID to remove
 * @returns Promise<any> Remove result
 */
export const removeModel = async (modelId: string): Promise<any> => {
  const mockModel = mockModelList.find(item => item.id.toString() === modelId);
  if (mockModel?.isMock) {
    console.log('Cannot delete mock model with ID:', modelId);
    throw new Error('Cannot delete demo model');
  }

  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  try {
    return await removeModelAPI({
      model_id: modelId,
      namespace: MODEL_NAMESPACE
    });
  } catch (error) {
    console.error('Remove model failed:', error);
    throw error;
  }
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

/**
 * Download model training file
 * @param modelId Model ID
 * @param filePath File path to download
 * @param fileName File name for download
 * @returns Promise<void>
 */
export const downloadModelFile = async (modelId: string, filePath: string, fileName: string): Promise<void> => {
  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  try {
    const blob = await downloadModelFileAPI({
      model_id: modelId,
      file_path: filePath,
      namespace: MODEL_NAMESPACE,
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download model file failed:', error);
    throw error;
  }
};

// Export mock model data utilities for testing
export { mockModelList, mockModelDetail } from './modelExample';