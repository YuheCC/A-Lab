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