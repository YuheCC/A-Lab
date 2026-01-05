// Model 层 - Optimize 页面数据逻辑
import { mockRecommendations, generateMockDetail } from './example';
import type {
  DesignTargetsFormData,
  DesignRecommendation,
  DesignDetails,
} from './types';

/**
 * 获取优化推荐列表
 * @param formData 表单数据
 * @returns 推荐结果列表
 */
export const getOptimizeRecommendations = async (
  formData: DesignTargetsFormData
): Promise<{ data: DesignRecommendation[] }> => {
  // TODO: 未来替换为真实 API 调用
  // const response = await fetch('/api/electrode/optimize', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(formData),
  // });
  // return response.json();

  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log('Optimize form data:', formData);

  // 返回 Mock 数据
  return {
    data: mockRecommendations,
  };
};

/**
 * 获取设计详情
 * @param id 推荐 ID
 * @returns 设计详情数据
 */
export const getOptimizeDetail = async (
  id: string
): Promise<{ data: DesignDetails }> => {
  // TODO: 未来替换为真实 API 调用
  // const response = await fetch(`/api/electrode/optimize/detail?id=${id}`);
  // return response.json();

  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Fetching detail for ID:', id);

  // 返回 Mock 数据
  return {
    data: generateMockDetail(id),
  };
};
