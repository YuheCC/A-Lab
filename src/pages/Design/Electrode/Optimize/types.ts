// TypeScript 类型定义 - Optimize 页面
import type { OptimizeResultItemDTO } from '@/services/electrode/types';

// 设计目标表单数据
export interface DesignTargetsFormData {
  cellDesign: string;
  npRatio: string; // NP Ratio (Auto-filled)
  anodeActiveMaterial: string;
  cathodeActiveMaterial: string;
  width: string; // Cathode Width (mm)
  length: string; // Cathode Length (mm)
  designCapacity: [number, number]; // Design Capacity (Ah) - 区间
  specificEnergy: [number, number]; // Gravimetric Energy Density (Wh/kg) - 区间
  thickness: [number, number]; // Jelly Roll Thickness (mm) - 区间
  volumetricEnergyDensity: [number, number]; // Volumetric Energy Density (Wh/L) - 区间
}

// 参数范围配置
export interface ParameterRange {
  min: number;
  max: number;
  step: number;
  default: [number, number]; // 区间模式：默认值为 [min, max]
  minDiff: number; // 最小差值
}

// 参数范围常量
export const PARAMETER_RANGES: Record<string, ParameterRange> = {
  designCapacity: { min: 0.01, max: 600, step: 0.01, default: [0.01, 600], minDiff: 1 },
  specificEnergy: { min: 30, max: 340, step: 0.01, default: [30, 340], minDiff: 20 },
  thickness: { min: 0.4, max: 15, step: 0.01, default: [0.4, 15], minDiff: 0.5 },
  volumetricEnergyDensity: { min: 530, max: 1060, step: 0.01, default: [530, 1060], minDiff: 20 },
};

// 设计推荐结果（表格行）
export interface DesignRecommendation {
  rank: number;
  designCapacity: number;
  specificEnergy: number;
  thickness: number;
  volumetricEnergyDensity: number;
  id: string; // 用于查询详情
}

// 正极参数
export interface CathodeParameters {
  binder1: string; // KF-9700 (wt.%)
  binder2: string; // CN-01Y (wt.%)
  conductiveCarbon: string; // Super C65 (wt.%)
  activeMaterial: string; // NCM-A (%)
  arealLoading: string; // Areal Loading (mAh/cm²)
  pressDensity: string; // Press Density (g/cc)
}

// 负极参数
export interface AnodeParameters {
  binder1: string; // CMC (wt.%)
  binder2: string; // SBR (wt.%)
  binder3: string; // PAA (wt.%)
  conductiveCarbon1: string; // Super P (wt.%)
  conductiveCarbon2: string; // SWCNT (wt.%)
  activeMaterial1: string; // Active material-1 SC-B-I (%)
  activeMaterial2: string; // Active material-2 Gr-S-I (%)
  arealLoading: string; // Areal Loading (mAh/cm²)
  pressDensity: string; // Press Density (g/cc)
}

// 偏差字段类型
export type DeviatedFieldType = 'designCapacity' | 'specificEnergy' | 'thickness' | 'volumetricEnergyDensity';

// 带偏差标记的推荐结果
export interface DesignRecommendationWithDeviation extends DesignRecommendation {
  deviatedFields: DeviatedFieldType[];
}

// 分组后的推荐结果
export interface GroupedRecommendations {
  valid: DesignRecommendation[];
  invalid: DesignRecommendationWithDeviation[];
}

// 分组后的完整 API 数据
export interface GroupedFullResults {
  valid: OptimizeResultItemDTO[];
  invalid: OptimizeResultItemDTO[];
}

// 设计详情数据
export interface DesignDetails {
  rank: number;
  // Performance Prediction
  designCapacity: number; // mAh
  gravimetricEnergyDensity: number; // Wh/kg
  thickness: number; // mm
  volumetricEnergy: number; // Wh/L
  // Design
  cellDesign: string;
  cathodeActiveMaterial: string;
  anodeActiveMaterial: string;
  width: number; // mm
  length: number; // mm
  layers: number;
  npRatio: string;
  cathodeParameters: CathodeParameters;
  anodeParameters: AnodeParameters;
}
