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
  removeModel as removeModelAPI,
  type TrainModelParams,
  type ModelListParams,
  type ModelListResponse,
  type ModelDetailResponse,
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

// Get prediction history list with mock data fallback
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

    // Try to fetch real data
    const response = await getHistoryListAPI(params);

    // Check if response is valid and has data
    if (response && response.data && Array.isArray(response.data)) {
      // If data is empty, return mock data
      if (response.data.length === 0) {
        console.log('No history data found, adding mock data');
        return {
          total: mockPredictionHistory.length,
          data: mockPredictionHistory
        };
      }
      return response;
    }

    // If response is invalid, return mock data
    console.log('Invalid response, returning mock data');
    return {
      total: mockPredictionHistory.length,
      data: mockPredictionHistory
    };
  } catch (error) {
    console.error('Error fetching history list:', error);
    // On error, return mock data
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

// Export mock model data utilities for testing
export { mockModelList, mockModelDetail } from './modelExample';