/**
 * Weight Percentage 工具函数
 * 根据模型的 base_model_id 判断 Weight Percentage 的值
 */

/**
 * 根据 base_model_id 判断 Weight Percentage 的值
 * @param base_model_id - 基础模型ID
 * @returns Weight Percentage 值（1 或 1.9）
 */
export const getWeightPercentage = (base_model_id: number | undefined | null): number => {
  if (base_model_id === undefined || base_model_id === null) {
    return 1.9; // 默认值
  }
  return base_model_id > 0 ? 1 : 1.9;
};

/**
 * 格式化 Weight Percentage 为显示文本
 * @param base_model_id - 基础模型ID
 * @returns 格式化的文本，如 "1.9 wt%" 或 "1 wt%"
 */
export const formatWeightPercentage = (base_model_id: number | undefined | null): string => {
  const value = getWeightPercentage(base_model_id);
  return `${value} wt%`;
};
