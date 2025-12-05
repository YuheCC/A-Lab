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

// Get performance history list with mock data fallback
export const getHistoryList = async (params?: any): Promise<{ data: PerformanceHistoryResponse }> => {
  try {
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

    // Try to fetch real data
    const response = await getPerformanceHistoryList(params);

    // Check if response is valid and has data
    if (response?.data?.data && Array.isArray(response.data.data)) {
      // If data is empty, merge with mock data
      if (response.data.data.length === 0) {
        console.log('No history data found, adding mock data');
        return {
          data: {
            total: mockPerformanceHistory.length,
            data: mockPerformanceHistory
          }
        };
      }

      // If we have real data, optionally merge with some mock data for demo
      // Uncomment the following lines if you want to always show some mock data
      // const combinedData = [...response.data.data, ...mockPerformanceHistory.slice(0, 2)];
      // return {
      //   data: {
      //     total: combinedData.length,
      //     data: combinedData
      //   }
      // };

      return response;
    }

    // If response is invalid, return mock data
    console.log('Invalid response, returning mock data');
    return {
      data: {
        total: mockPerformanceHistory.length,
        data: mockPerformanceHistory
      }
    };
  } catch (error) {
    console.error('Error fetching history list:', error);
    // On error, return mock data
    return {
      data: {
        total: mockPerformanceHistory.length,
        data: mockPerformanceHistory
      }
    };
  }
};

// Get performance history detail with mock data fallback
export const getHistoryDetail = async (id: number): Promise<{ data: PerformanceHistoryItem | MockPerformanceHistoryItem }> => {
  try {
    // Check if this is a mock record by finding it in mock data
    const mockRecord = mockPerformanceHistory.find(item => item.id === id);
    if (mockRecord && mockRecord.isMock) {
      console.log('Returning mock detail for ID:', id);
      return {
        data: generateMockDetail(mockRecord)
      };
    }

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

    // Try to fetch real detail
    const response = await getPerformanceHistoryDetail(id);

    if (response?.data) {
      return response;
    }

    // If no data, try to find in mock data
    const fallbackMockRecord = mockPerformanceHistory.find(item => item.id === id);
    if (fallbackMockRecord) {
      return {
        data: generateMockDetail(fallbackMockRecord)
      };
    }

    throw new Error('Record not found');
  } catch (error) {
    console.error('Error fetching history detail:', error);

    // Try to find in mock data as fallback
    const errorMockRecord = mockPerformanceHistory.find(item => item.id === id);
    if (errorMockRecord) {
      return {
        data: generateMockDetail(errorMockRecord)
      };
    }

    throw error;
  }
};

// Delete performance history (mock records cannot be deleted)
export const deleteHistory = async (id: number): Promise<any> => {
  // Check if this is a mock record by finding it in mock data
  const mockRecord = mockPerformanceHistory.find(item => item.id === id);
  if (mockRecord && mockRecord.isMock) {
    console.log('Cannot delete mock record with ID:', id);
    throw new Error('Cannot delete demo record');
  }

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
  type TrainModelParams,
  type ModelListParams,
  type ModelListResponse,
  type ModelDetailResponse,
  type ModelFileListParams,
  type ModelFileListResponse,
  type ModelMetricsParams,
  type ModelMetricsResponse,
} from '@/services/model/training';
import { mockModelList, mockModelDetail } from './modelExample';

// Namespace constant - used by all Design model training APIs
const MODEL_NAMESPACE = 'cell_performance';

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
 * Get model list with mock data fallback
 * @param params Query parameters (without namespace, will be added automatically)
 * @returns Promise<ModelListResponse> Model list with pagination
 */
export const getModelList = async (
  params?: Omit<ModelListParams, 'namespace'>
): Promise<ModelListResponse> => {
  try {
    if (!isUserLoggedIn()) {
      console.log('User not logged in, returning mock model data');
      return { total: mockModelList.length, data: mockModelList };
    }

    const response = await getModelListAPI({
      ...params,
      namespace: MODEL_NAMESPACE,
    });

    if (response?.data && response.data.length > 0) {
      return response;
    }

    // Return mock data when no data
    console.log('No model data found, returning mock data');
    return { total: mockModelList.length, data: mockModelList };
  } catch (error) {
    console.error('Get model list failed:', error);
    return { total: mockModelList.length, data: mockModelList };
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
    if (!isUserLoggedIn()) {
      console.log('User not logged in, returning mock model data');
      return { total: mockModelList.length, data: mockModelList };
    }

    const response = await getModelListAPI({
      ...params,
      namespace: MODEL_NAMESPACE,
      base_model_id: -1,
    });

    if (response?.data && response.data.length > 0) {
      return response;
    }

    console.log('No base model data found, returning mock data');
    return { total: mockModelList.length, data: mockModelList };
  } catch (error) {
    console.error('Get base model list failed:', error);
    return { total: mockModelList.length, data: mockModelList };
  }
};

/**
 * Get mu model list (base_model_id = -2)
 * @param params Query parameters
 * @returns Promise<ModelListResponse> Mu model list with pagination
 */
export const getMuModelList = async (
  params?: Omit<ModelListParams, 'namespace' | 'base_model_id'>
): Promise<ModelListResponse> => {
  try {
    if (!isUserLoggedIn()) {
      console.log('User not logged in, returning mock model data');
      return { total: mockModelList.length, data: mockModelList };
    }

    const response = await getModelListAPI({
      ...params,
      namespace: MODEL_NAMESPACE,
      base_model_id: -2,
    });

    if (response?.data && response.data.length > 0) {
      return response;
    }

    console.log('No mu model data found, returning mock data');
    return { total: mockModelList.length, data: mockModelList };
  } catch (error) {
    console.error('Get mu model list failed:', error);
    return { total: mockModelList.length, data: mockModelList };
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
  const mockModel = mockModelList.find(item => item.id.toString() === modelId);
  if (mockModel?.isMock) {
    console.log('Cannot delete mock model with ID:', modelId);
    throw new Error('Cannot delete demo model');
  }

  if (!isUserLoggedIn()) {
    throw new Error('Please login first');
  }

  return removeModelAPI({ model_id: modelId });
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

// Export mock model data utilities for testing
export { mockModelList, mockModelDetail } from './modelExample';
