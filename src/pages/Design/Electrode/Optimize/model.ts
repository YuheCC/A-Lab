// Model 层 - Optimize 页面数据逻辑
import { optimizeElectrodeDesign, getBackwardResultList } from '@/services/electrode/electrodeService';
import {
  ElectrodePageType,
  type BackwardResultItemDTO,
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
 * @param item 接口返回的单条结果（BackwardResultItemDTO）
 * @param index 索引（用于生成 rank 和 id）
 */
const transformToRecommendation = (
  item: BackwardResultItemDTO,
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
 * 只检查必填目标（jrt / ved）及当前激活的次要目标（sed 或 dc）
 * @param item 接口返回的单条结果
 * @param formData 表单数据（包含目标范围）
 * @param activeSecondaryTarget 激活的次要目标
 * @returns 偏差字段数组
 */
const checkDeviations = (
  item: BackwardResultItemDTO,
  formData: DesignTargetsFormData,
  activeSecondaryTarget: 'specificEnergy' | 'designCapacity',
): DeviatedFieldType[] => {
  const deviatedFields: DeviatedFieldType[] = [];

  // 检查 Jelly Roll Thickness（必填目标，始终校验）
  if (
    item.jelly_roll_thickness < formData.thickness[0] ||
    item.jelly_roll_thickness > formData.thickness[1]
  ) {
    deviatedFields.push('thickness');
  }

  // 检查 Volumetric Energy Density（必填目标，始终校验）
  if (
    item.volumetric_ED < formData.volumetricEnergyDensity[0] ||
    item.volumetric_ED > formData.volumetricEnergyDensity[1]
  ) {
    deviatedFields.push('volumetricEnergyDensity');
  }

  // 根据激活的次要目标，选择校验 Design Capacity 或 Specific Energy
  if (activeSecondaryTarget === 'designCapacity') {
    if (
      item.design_capacity < formData.designCapacity[0] ||
      item.design_capacity > formData.designCapacity[1]
    ) {
      deviatedFields.push('designCapacity');
    }
  } else {
    if (
      item.specific_ED < formData.specificEnergy[0] ||
      item.specific_ED > formData.specificEnergy[1]
    ) {
      deviatedFields.push('specificEnergy');
    }
  }

  return deviatedFields;
};

/**
 * 获取优化推荐列表
 * 两步调用：
 *   1. 调用 optimizeElectrodeDesign 提交参数，获取 history_id
 *   2. 调用 getBackwardResultList 通过 history_id 获取推荐结果列表
 * @param formData 表单数据
 * @param activeSecondaryTarget 当前激活的次要目标参数（specificEnergy 或 designCapacity），决定发送 sed 或 dc 参数
 * @returns 分组后的推荐结果和完整数据
 */
export const getOptimizeRecommendations = async (
  formData: DesignTargetsFormData,
  activeSecondaryTarget: 'specificEnergy' | 'designCapacity',
): Promise<{ data: GroupedRecommendations; fullResults: GroupedFullResults }> => {
  // 构建 model_params，dc 和 sed 四个字段为选填，根据激活的次要目标决定发送哪组
  const modelParams: Parameters<typeof optimizeElectrodeDesign>[0]['model_params'] = {
    cathode_width: Number(formData.width),
    cathode_length: Number(formData.length),
    jrt_min: formData.thickness[0],
    jrt_max: formData.thickness[1],
    ved_min: formData.volumetricEnergyDensity[0],
    ved_max: formData.volumetricEnergyDensity[1],
    ...(activeSecondaryTarget === 'designCapacity'
      ? { dc_min: formData.designCapacity[0], dc_max: formData.designCapacity[1] }
      : { sed_min: formData.specificEnergy[0], sed_max: formData.specificEnergy[1] }),
  };

  // 第一步：提交优化参数，获取 history_id
  const { id: historyId } = await optimizeElectrodeDesign({
    cell_design: formData.cellDesign,
    np_ratio: formData.npRatio,
    cathode_active_material: formData.cathodeActiveMaterial,
    anode_active_material: formData.anodeActiveMaterial,
    type: ElectrodePageType.INVERSE_DESIGN, // type=2
    model_params: modelParams,
  });

  // 第二步：通过 history_id 获取推荐结果列表（平铺数组）
  const flatItems = await getBackwardResultList({ history_id: historyId });

  // 客户端分组：根据目标范围将平铺数组拆分为 valid / invalid
  const validItems: BackwardResultItemDTO[] = [];
  const invalidItems: BackwardResultItemDTO[] = [];

  flatItems.forEach((item) => {
    const deviations = checkDeviations(item, formData, activeSecondaryTarget);
    if (deviations.length === 0) {
      validItems.push(item);
    } else {
      invalidItems.push(item);
    }
  });

  // 转换 valid 数据
  const validData: DesignRecommendation[] = validItems.map(
    (item, index) => transformToRecommendation(item, index),
  );

  // 转换 invalid 数据 - 附带偏差字段信息
  const invalidData: DesignRecommendationWithDeviation[] = invalidItems.map(
    (item, index) => ({
      ...transformToRecommendation(item, index),
      deviatedFields: checkDeviations(item, formData, activeSecondaryTarget),
    }),
  );

  return {
    data: {
      valid: validData,
      invalid: invalidData,
    },
    fullResults: {
      valid: validItems,
      invalid: invalidItems,
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
