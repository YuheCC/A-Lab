import type { RawCurveData } from './distributionData';

/**
 * 按 [min, max] 对原始 CSV 曲线数据进行截取，并对 y 值归一化
 *
 * x 轴：在 rawData.x 中找最接近 min 的值（不超过 min）作为起始，
 *        找最接近 max 的值（不小于 max）作为结束，保留原始 x 值。
 *        若 rawData.x 中没有精确匹配，则取最近邻，确保 [min, max] 在渲染范围内。
 * y 轴：归一化到 [0, 1]，仅保留曲线形状
 *
 * @param rawData - 原始 CSV 数据（未做任何变换）
 * @param min - x 轴截取最小值（来自 PARAMETER_RANGES）
 * @param max - x 轴截取最大值（来自 PARAMETER_RANGES）
 * @returns 截取后的 {x, y}[] 曲线点数组
 */
export function mapCurveData(
  rawData: RawCurveData,
  min: number,
  max: number,
): { x: number; y: number }[] {
  const { x: rawX, y: rawY } = rawData;

  if (rawX.length === 0) return [];

  // 找最后一个 <= min 的索引，保证 min 在渲染范围内
  // 若所有 x > min，则 startIndex 保持 0（取最近的较大值）
  let startIndex = 0;
  for (let i = 0; i < rawX.length; i++) {
    if (rawX[i] <= min) {
      startIndex = i;
    } else {
      break;
    }
  }

  // 找第一个 >= max 的索引，保证 max 在渲染范围内
  // 若所有 x < max，则 endIndex 保持 rawX.length - 1（取最近的较小值）
  let endIndex = rawX.length - 1;
  for (let i = 0; i < rawX.length; i++) {
    if (rawX[i] >= max) {
      endIndex = i;
      break;
    }
  }

  const slicedX = rawX.slice(startIndex, endIndex + 1);
  const slicedY = rawY.slice(startIndex, endIndex + 1);

  const yMax = Math.max(...slicedY);
  const yMin = Math.min(...slicedY);
  const yRange = yMax - yMin;

  return slicedX.map((xVal, i) => ({
    x: xVal,
    y: yRange === 0 ? 0 : (slicedY[i] - yMin) / yRange,
  }));
}

export { RAW_CAPACITY, RAW_THICKNESS, RAW_VED, RAW_GED } from './distributionData';
