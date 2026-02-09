import {
  getMDHistoryList,
  getMDHistoryDetail,
  MDHistoryItem,
  MDHistoryDetailResponse,
  MDHistoryResponse,
  MDUpdatesInfo
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
 * 解析 updates 字段（JSON 字符串）并计算进度
 * 规则：
 * - running 状态：根据 updates 字段计算进度，没有 updates 则不显示
 * - success/completed 状态：显示 100%
 * - fail 状态：显示 0%
 * - pending 状态：显示 0%
 */
const parseUpdatesAndCalculateProcess = (item: MDHistoryItem): MDHistoryItem => {
  try {
    // 只有 running 状态才需要解析 updates 字段
    if (item.status === 'running') {
      // 如果 updates 字段存在且为字符串，尝试解析
      if (item.updates && typeof item.updates === 'string') {
        const updatesInfo: MDUpdatesInfo = JSON.parse(item.updates);
        
        // 计算进度百分比
        let process = 0;
        if (updatesInfo.total_steps && updatesInfo.completed_steps !== undefined) {
          if (updatesInfo.total_steps > 0) {
            process = Math.round((updatesInfo.completed_steps / updatesInfo.total_steps) * 100);
            // 确保进度在 0-100 之间
            process = Math.max(0, Math.min(100, process));
          }
        }
        
        return {
          ...item,
          updatesInfo,
          process
        };
      }
      
      // running 状态但没有 updates 字段，不显示进度
      return {
        ...item,
        process: undefined
      };
    }
    
    // 非 running 状态，根据 status 设置固定进度
    if (item.status === 'success' || item.status === 'completed') {
      return {
        ...item,
        process: 100
      };
    }
    
    if (item.status === 'fail') {
      return {
        ...item,
        process: 0
      };
    }
    
    if (item.status === 'pending') {
      return {
        ...item,
        process: 0
      };
    }
    
    // 其他状态不显示进度
    return {
      ...item,
      process: undefined
    };
  } catch (error) {
    console.error('Failed to parse updates field:', error);
    // 解析失败时，根据 status 设置默认进度
    if (item.status === 'success' || item.status === 'completed') {
      return { ...item, process: 100 };
    }
    if (item.status === 'fail' || item.status === 'pending') {
      return { ...item, process: 0 };
    }
    return { ...item, process: undefined };
  }
};

/**
 * 获取历史记录列表
 * 统一逻辑：
 * - 未登录 → 返回 mock 数据
 * - 已登录 + 有搜索条件（id 或 status）→ 仅返回搜索结果，不展示 mock
 * - 已登录 + 无搜索条件 + 列表为空 → 返回 mock 数据
 * - 已登录 + 无搜索条件 + 有数据 → 仅返回真实数据
 */
export const getHistoryList = async (params?: any): Promise<{
  data: {
    data: MDHistoryItem[],
    total: number
  }
}> => {
  const isLoggedIn = isUserLoggedIn();
  
  // 检查是否有搜索条件
  const hasSearchCondition = params && (params.id || params.status);

  // 解析 updates 字段并计算进度的辅助函数
  const parseDataList = (dataList: MDHistoryItem[]) => {
    return dataList.map(item => parseUpdatesAndCalculateProcess(item));
  };

  if (!isLoggedIn) {
    // 用户未登录，返回处理过的 mock 数据
    return {
      data: {
        data: parseDataList(mockListData),
        total: mockListData.length
      }
    };
  }

  try {
    // 用户已登录，尝试获取真实数据
    const response = await getMDHistoryList(params);

    // 如果有搜索条件，直接返回搜索结果，不展示 mock 数据
    if (hasSearchCondition) {
      const parsedData = parseDataList(response?.data?.data || []);
      return {
        data: {
          data: parsedData,
          total: response?.data?.total || 0
        }
      };
    }

    // 检查返回的数据是否为空
    if (!response?.data?.data || response.data.data.length === 0) {
      // 返回历史记录为空时，显示处理过的 mock 数据
      return {
        data: {
          data: parseDataList(mockListData),
          total: mockListData.length
        }
      };
    }

    // 有真实数据时，仅返回真实数据，不合并 mock
    const parsedRealData = parseDataList(response.data.data);
    return {
      data: {
        data: parsedRealData,
        total: response.data.total
      }
    };
  } catch (error) {
    console.error('Failed to fetch history list, falling back to mock data:', error);
    // 接口调用失败时，返回处理过的 mock 数据
    return {
      data: {
        data: parseDataList(mockListData),
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