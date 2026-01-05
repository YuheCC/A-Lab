// TypeScript 类型定义 - Optimize 页面

// 设计目标表单数据
export interface DesignTargetsFormData {
  cellDesign: string;
  anodeActiveMaterial: string;
  cathodeActiveMaterial: string;
  designCapacity: number;
  specificEnergy: number;
  thickness: number;
  volumetricEnergyDensity: number;
}

// 参数范围配置
export interface ParameterRange {
  min: number;
  max: number;
  step: number;
  default: number;
}

// 参数范围常量
export const PARAMETER_RANGES: Record<string, ParameterRange> = {
  designCapacity: { min: 0, max: 100, step: 1, default: 50 },
  specificEnergy: { min: 0, max: 500, step: 10, default: 250 },
  thickness: { min: 0, max: 20, step: 0.5, default: 10 },
  volumetricEnergyDensity: { min: 0, max: 1000, step: 10, default: 500 },
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
  binder1: string; // KF-0700 (wt.%)
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
  conductiveCarbon2: string; // 5WCNT (wt.%)
  activeMaterial1: string; // SC-B-i (%)
  activeMaterial2: string; // Gr-S-i (%)
  arealLoading: string; // Areal Loading (mAh/cm²)
  pressDensity: string; // Press Density (g/cc)
}

// 设计详情数据
export interface DesignDetails {
  rank: number;
  cellDesign: string;
  cathodeActiveMaterial: string;
  anodeActiveMaterial: string;
  npRatio: string;
  cathodeParameters: CathodeParameters;
  anodeParameters: AnodeParameters;
}
