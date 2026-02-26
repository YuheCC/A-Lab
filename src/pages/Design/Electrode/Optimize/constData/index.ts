import type { RawCurveData } from './distributionData';

/**
 * 将原始 CSV 曲线数据映射到指定区间，并对 y 值归一化
 *
 * x 轴：将 rawData.x 的原始范围线性映射到 [min, max]
 * y 轴：归一化到 [0, 1]，仅保留曲线形状
 *
 * @param rawData - 原始 CSV 数据（未做任何变换）
 * @param min - 目标 x 轴最小值（来自 PARAMETER_RANGES）
 * @param max - 目标 x 轴最大值（来自 PARAMETER_RANGES）
 * @returns 映射后的 {x, y}[] 曲线点数组
 */
export function mapCurveData(
  rawData: RawCurveData,
  min: number,
  max: number,
): { x: number; y: number }[] {
  const { x: rawX, y: rawY } = rawData;

  if (rawX.length === 0) return [];

  const rawXMin = rawX[0];
  const rawXMax = rawX[rawX.length - 1];
  const rawXRange = rawXMax - rawXMin;

  const yMax = Math.max(...rawY);
  const yMin = Math.min(...rawY);
  const yRange = yMax - yMin;

  return rawX.map((xVal, i) => {
    const mappedX =
      rawXRange === 0
        ? min
        : min + ((xVal - rawXMin) / rawXRange) * (max - min);

    const normalizedY = yRange === 0 ? 0 : (rawY[i] - yMin) / yRange;

    return { x: mappedX, y: normalizedY };
  });
}

export { RAW_CAPACITY, RAW_THICKNESS, RAW_VED, RAW_GED } from './distributionData';
