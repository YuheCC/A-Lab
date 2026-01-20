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
  DesignRecommendationWithDeviation,
  DesignDetails,
  DeviatedFieldType,
  GroupedRecommendations,
  GroupedFullResults,
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
 * 检查单条结果是否有偏差（超出目标范围）
 * @param item API 返回的单条结果
 * @param formData 表单数据（包含目标范围）
 * @returns 偏差字段数组
 */
const checkDeviations = (
  item: OptimizeResultItemDTO,
  formData: DesignTargetsFormData,
): DeviatedFieldType[] => {
  const deviatedFields: DeviatedFieldType[] = [];

  // 检查 Design Capacity
  if (
    item.design_capacity < formData.designCapacity[0] ||
    item.design_capacity > formData.designCapacity[1]
  ) {
    deviatedFields.push('designCapacity');
  }

  // 检查 Specific Energy (Gravimetric Energy Density)
  if (
    item.specific_ED < formData.specificEnergy[0] ||
    item.specific_ED > formData.specificEnergy[1]
  ) {
    deviatedFields.push('specificEnergy');
  }

  // 检查 Jelly Roll Thickness
  if (
    item.jelly_roll_thickness < formData.thickness[0] ||
    item.jelly_roll_thickness > formData.thickness[1]
  ) {
    deviatedFields.push('thickness');
  }

  // 检查 Volumetric Energy Density
  if (
    item.volumetric_ED < formData.volumetricEnergyDensity[0] ||
    item.volumetric_ED > formData.volumetricEnergyDensity[1]
  ) {
    deviatedFields.push('volumetricEnergyDensity');
  }

  return deviatedFields;
};

/**
 * 获取优化推荐列表
 * 后端直接返回 valid/invalid 分组结构，仅对 invalid 数据计算偏差字段
 * @param formData 表单数据
 * @returns 分组后的推荐结果和完整数据
 */
export const getOptimizeRecommendations = async (
  formData: DesignTargetsFormData,
): Promise<{ data: GroupedRecommendations; fullResults: GroupedFullResults }> => {
  // 调用真实 API - 后端直接返回 { valid: [], invalid: [] } 结构
  const apiResult = await optimizeElectrodeDesign({
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

  // 转换 valid 数据 - 直接转换，无需计算偏差
  const validData: DesignRecommendation[] = apiResult.valid.map(
    (item, index) => transformToRecommendation(item, index),
  );

  // 转换 invalid 数据 - 需要计算偏差字段
  const invalidData: DesignRecommendationWithDeviation[] = apiResult.invalid.map(
    (item, index) => {
      const recommendation = transformToRecommendation(item, index);
      const deviatedFields = checkDeviations(item, formData);
      return {
        ...recommendation,
        deviatedFields,
      };
    },
  );

  return {
    data: {
      valid: validData,
      invalid: invalidData,
    },
    fullResults: {
      valid: apiResult.valid,
      invalid: apiResult.invalid,
    },
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
