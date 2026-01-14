// Model 层 - Optimize 页面数据逻辑
import { optimizeElectrodeDesign } from '@/services/electrode/electrodeService';
import {
  ElectrodePageType,
  type OptimizeResultItemDTO,
} from '@/services/electrode/types';
import { generateMockDetail } from './example';
import type {
  DesignTargetsFormData,
  DesignRecommendation,
  DesignDetails,
} from './types';

/**
 * 将 API 结果转换为前端 DesignRecommendation 格式
 * @param item API 返回的单条结果
 * @param index 索引（用于生成 rank 和 id）
 * @returns 前端推荐结果格式
 */
const transformToRecommendation = (
  item: OptimizeResultItemDTO,
  index: number,
): DesignRecommendation => ({
  rank: index + 1,
  designCapacity: item.design_capacity,
  specificEnergy: item.specific_ED,
  thickness: item.jelly_roll_thickness,
  volumetricEnergyDensity: item.volumetric_ED,
  id: `${index + 1}`,
});

/**
 * 获取优化推荐列表
 * @param formData 表单数据
 * @returns 推荐结果列表和完整数据
 */
export const getOptimizeRecommendations = async (
  formData: DesignTargetsFormData,
): Promise<{ data: DesignRecommendation[]; fullResults: OptimizeResultItemDTO[] }> => {
  // 调用真实 API
  const results = await optimizeElectrodeDesign({
    cell_design: formData.cellDesign,
    np_ratio: formData.npRatio,
    cathode_active_material: formData.cathodeActiveMaterial,
    anode_active_material: formData.anodeActiveMaterial,
    type: ElectrodePageType.INVERSE_DESIGN, // type=2
    model_params: {
      width: Number(formData.width),
      length: Number(formData.length),
      layers: Number(formData.layers),
      design_capacity: formData.designCapacity,
      specific_ED: formData.specificEnergy,
      jelly_roll_thickness: formData.thickness,
      volumetric_ED: formData.volumetricEnergyDensity,
    },
  });

  // 返回转换后的数据和完整数据
  return {
    data: results.map(transformToRecommendation),
    fullResults: results,
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
