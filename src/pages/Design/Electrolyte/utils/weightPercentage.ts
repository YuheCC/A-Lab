/**
 * Weight Percentage 工具函数
 * 根据模型的 base_model_id 判断 Weight Percentage 的值
 */

/**
 * 根据 base_model_id 和 model_type 判断 Weight Percentage 的值
 * @param base_model_id - 基础模型ID
 * @param model_type - 模型类型
 * @returns Weight Percentage 值（1 或 1.9）
 */
export const getWeightPercentage = (
  base_model_id: number | undefined | null,
  model_type: number | undefined | null
): number => {
  // 只有当 model_type === 100 时才返回 1.9，其余都返回 1
  if (model_type === 100) {
    return 1.9;
  }
  return 1;
};

/**
 * 格式化 Weight Percentage 为显示文本
 * @param base_model_id - 基础模型ID
 * @param model_type - 模型类型
 * @returns 格式化的文本，如 "1.9 wt%" 或 "1 wt%"
 */
export const formatWeightPercentage = (
  base_model_id: number | undefined | null,
  model_type: number | undefined | null
): string => {
  const value = getWeightPercentage(base_model_id, model_type);
  return `${value} wt%`;
};
