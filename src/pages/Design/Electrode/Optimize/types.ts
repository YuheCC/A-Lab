// TypeScript 类型定义 - Optimize 页面

// 设计目标表单数据
export interface DesignTargetsFormData {
  cellDesign: string;
  npRatio: string; // NP Ratio (Auto-filled)
  anodeActiveMaterial: string;
  cathodeActiveMaterial: string;
  width: string; // Cathode Width (mm)
  length: string; // Cathode Length (mm)
  layers: string; // Cathode Layers
  designCapacity: number; // Design Capacity (Ah)
  specificEnergy: number; // Gravimetric Energy Density (Wh/kg)
  thickness: number; // Jelly Roll Thickness (mm)
  volumetricEnergyDensity: number; // Volumetric Energy Density (Wh/L)
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
  designCapacity: { min: 0.01, max: 1900, step: 0.01, default: 950 },
  specificEnergy: { min: 30, max: 340, step: 1, default: 185 },
  thickness: { min: 0.4, max: 15, step: 0.1, default: 7.7 },
  volumetricEnergyDensity: { min: 530, max: 1060, step: 1, default: 795 },
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
