// Model layer for predictionTool history data management
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