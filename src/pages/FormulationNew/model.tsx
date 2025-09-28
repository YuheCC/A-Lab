import {
  getMDHistoryList,
  getMDHistoryDetail,
  MDHistoryItem,
  MDHistoryDetailResponse,
  MDHistoryResponse
} from '@/services/formulation/md';
import { mockListData } from './components/example/listMockData';
import { mockDetailData } from './components/example/detailMockData';

// 检查用户是否登录的工具函数
const isUserLoggedIn = (): boolean => {
  // 检查localStorage中的用户信息或token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
};

/**
 * 获取历史记录列表
 * 逻辑：未登录或登录用户返回历史记录为空时显示mock数据
 */
export const getHistoryList = async (params?: any): Promise<{
  data: {
    data: MDHistoryItem[],
    total: number
  }
}> => {
  const isLoggedIn = isUserLoggedIn();

  if (!isLoggedIn) {
    // 用户未登录，直接返回mock数据
    return {
      data: {
        data: mockListData,
        total: mockListData.length
      }
    };
  }

  try {
    // 用户已登录，尝试获取真实数据
    const response = await getMDHistoryList(params);

    // 检查返回的数据是否为空
    if (!response?.data?.data || response.data.data.length === 0) {
      // 返回历史记录为空时，显示mock数据
      return {
        data: {
          data: mockListData,
          total: mockListData.length
        }
      };
    }

    // 返回真实数据
    return response;
  } catch (error) {
    console.error('Failed to fetch history list, falling back to mock data:', error);
    // 接口调用失败时，返回mock数据
    return {
      data: {
        data: mockListData,
        total: mockListData.length
      }
    };
  }
};

/**
 * 获取历史记录详情
 * 逻辑：用户未登录或id=example时显示mock数据
 */
export const getHistoryDetail = async (id: number | string): Promise<{
  data: MDHistoryDetailResponse
}> => {
  const isLoggedIn = isUserLoggedIn();

  // 如果用户未登录或id为'example'，返回mock数据
  if (!isLoggedIn || id === 'example') {
    return {
      data: mockDetailData
    };
  }

  try {
    // 用户已登录且id不是example，尝试获取真实数据
    const response = await getMDHistoryDetail(Number(id));
    return response;
  } catch (error) {
    console.error('Failed to fetch history detail, falling back to mock data:', error);
    // 接口调用失败时，返回mock数据
    return {
      data: mockDetailData
    };
  }
};

/**
 * 检查特定记录是否是mock数据
 */
export const isMockRecord = (record: MDHistoryItem): boolean => {
  return record.id === 'example';
};

/**
 * 导出mock数据供其他地方使用
 */
export { mockListData, mockDetailData };