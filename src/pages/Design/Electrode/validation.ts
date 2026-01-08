/**
 * 电极设计参数验证配置和验证函数
 * 用于 Predict 和 Optimize 页面的参数校验
 */

// 参数范围配置
export interface ParameterRange {
  min: number;
  max: number;
  label: string;
  key: string;
}

// 材料类型定义
export type CathodeMaterialType = 'NCM811' | 'NCM622' | 'NCM523' | 'LFP' | 'LCO' | 'NCA';
export type AnodeMaterialType = 'Graphite' | 'Gr' | '12% Si' | '30% Si' | 'Silicon-Graphite' | 'SiOx';

// 阴极参数范围（默认范围）
export const cathodeParameterRanges: Record<string, ParameterRange> = {
  cathodeKF9700: {
    key: 'cathodeKF9700',
    label: 'KF-9700 (wt.%)',
    min: 0.8,
    max: 2.5,
  },
  cathodeCN01Y: {
    key: 'cathodeCN01Y',
    label: 'CN-01Y (wt.%)',
    min: 0,
    max: 2,
  },
  cathodeSuperC65: {
    key: 'cathodeSuperC65',
    label: 'Super C65 (wt.%)',
    min: 0,
    max: 3,
  },
  cathodeArealLoading: {
    key: 'cathodeArealLoading',
    label: 'Areal Loading (mAh/cm²)',
    min: 2.91,
    max: 5.3,
  },
  cathodePressDensity: {
    key: 'cathodePressDensity',
    label: 'Press Density (g/cc)',
    min: 3.15,
    max: 3.6,
  },
};

// 阳极参数范围（默认范围）
export const anodeParameterRanges: Record<string, ParameterRange> = {
  anodeCMC: {
    key: 'anodeCMC',
    label: 'CMC (wt.%)',
    min: 0.1,
    max: 3,
  },
  anodeSBR: {
    key: 'anodeSBR',
    label: 'SBR (wt.%)',
    min: 0.1,
    max: 3,
  },
  anodePAA: {
    key: 'anodePAA',
    label: 'PAA (wt.%)',
    min: 0.1,
    max: 3,
  },
  anodeSuperP: {
    key: 'anodeSuperP',
    label: 'Super P (wt.%) / KS-6',
    min: 0,
    max: 2.0,
  },
  anodeSWCNT: {
    key: 'anodeSWCNT',
    label: 'SWCNT (wt.%)',
    min: 0.05,
    max: 1.2,
  },
  anodePressDensity: {
    key: 'anodePressDensity',
    label: 'Press Density (g/cc)',
    min: 1.28,
    max: 1.5,
  },
};

// 尺寸参数范围
export const dimensionParameterRanges: Record<string, ParameterRange> = {
  width: {
    key: 'width',
    label: 'Width (mm)',
    min: 10,
    max: 1000,
  },
  length: {
    key: 'length',
    label: 'Length (mm)',
    min: 10,
    max: 1000,
  },
  layers: {
    key: 'layers',
    label: 'Layers',
    min: 1,
    max: 40,
  },
};

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: {
    cathode?: string;
    anode?: string;
    dimension?: string;
  };
}

// 翻译函数类型
export type TranslateFunction = (key: string, options?: Record<string, any>) => string;

// 参数接口
export interface ElectrodeParameters {
  // 阴极参数
  cathodeActiveMaterial?: string;
  cathodeKF9700?: number;
  cathodeCN01Y?: number;
  cathodeSuperC65?: number;
  cathodeArealLoading?: number;
  cathodePressDensity?: number;

  // 阳极参数
  anodeActiveMaterial?: string;
  anodeCMC?: number;
  anodeSBR?: number;
  anodePAA?: number;
  anodeSuperP?: number;
  anodeSWCNT?: number;
  anodePressDensity?: number;

  // 尺寸参数
  width?: number | string;
  length?: number | string;
  layers?: number | string;
}

/**
 * 检查参数是否在范围内
 */
function checkParameterRange(
  value: number | undefined,
  range: ParameterRange,
  t?: TranslateFunction,
): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  
  if (value < range.min || value > range.max) {
    return t 
      ? t('design.electrode.validation.parameterRange', { label: range.label, min: range.min, max: range.max })
      : `${range.label} 必须在 ${range.min} 到 ${range.max} 之间`;
  }
  
  return null;
}

/**
 * 验证阴极参数
 */
function validateCathodeParameters(params: ElectrodeParameters, t?: TranslateFunction): string | null {
  // 检查是否选择了阴极材料
  if (!params.cathodeActiveMaterial) {
    return t 
      ? t('design.electrode.validation.selectCathodeMaterial')
      : '请选择阴极活性材料';
  }

  // 检查各参数范围
  const rangeErrors: string[] = [];
  
  Object.entries(cathodeParameterRanges).forEach(([key, range]) => {
    const value = params[key as keyof ElectrodeParameters] as number;
    const error = checkParameterRange(value, range, t);
    if (error) {
      rangeErrors.push(error);
    }
  });

  if (rangeErrors.length > 0) {
    return rangeErrors[0]; // 返回第一个错误
  }

  // 规则1: (CB)cathode Conductive Carbon + (CN-01Y)cathode CNT > 0.8
  const cathodeSuperC65 = params.cathodeSuperC65 || 0;
  const cathodeCN01Y = params.cathodeCN01Y || 0;
  
  if (cathodeSuperC65 + cathodeCN01Y <= 0.8) {
    return t 
      ? t('design.electrode.validation.cathodeConductiveSum')
      : 'Super C65 + CN-01Y 的总和必须大于 0.8';
  }

  return null;
}

/**
 * 验证阳极参数
 */
function validateAnodeParameters(params: ElectrodeParameters, t?: TranslateFunction): string | null {
  // 检查是否选择了阳极材料
  if (!params.anodeActiveMaterial) {
    return t 
      ? t('design.electrode.validation.selectAnodeMaterial')
      : '请选择阳极活性材料';
  }

  // 检查各参数范围
  const rangeErrors: string[] = [];
  
  Object.entries(anodeParameterRanges).forEach(([key, range]) => {
    const value = params[key as keyof ElectrodeParameters] as number;
    const error = checkParameterRange(value, range, t);
    if (error) {
      rangeErrors.push(error);
    }
  });

  if (rangeErrors.length > 0) {
    return rangeErrors[0]; // 返回第一个错误
  }

  const anodeCMC = params.anodeCMC || 0;
  const anodeSWCNT = params.anodeSWCNT || 0;
  const anodeSuperP = params.anodeSuperP || 0;

  // 规则2: (CMC)anode Binder2 > (SWCNT)anode CNT
  if (anodeCMC <= anodeSWCNT) {
    return t 
      ? t('design.electrode.validation.cmcGreaterThanSwcnt')
      : 'CMC 必须大于 SWCNT';
  }

  // 规则3: (KS-6)anode Conductive Carbon + (SWCNT)anode CNT > 0.005
  if (anodeSuperP + anodeSWCNT <= 0.005) {
    return t 
      ? t('design.electrode.validation.anodeConductiveSum')
      : 'Super P (KS-6) + SWCNT 的总和必须大于 0.005';
  }

  return null;
}

/**
 * 验证尺寸参数
 */
function validateDimensionParameters(params: ElectrodeParameters, t?: TranslateFunction): string | null {
  const width = typeof params.width === 'string' ? parseFloat(params.width) : params.width;
  const length = typeof params.length === 'string' ? parseFloat(params.length) : params.length;
  const layers = typeof params.layers === 'string' ? parseInt(params.layers, 10) : params.layers;

  // 检查是否填写了所有尺寸参数
  if (!width || !length || !layers) {
    return t 
      ? t('design.electrode.validation.fillAllDimensions')
      : '请填写所有尺寸参数';
  }

  // 检查 width 范围
  const widthError = checkParameterRange(width, dimensionParameterRanges.width, t);
  if (widthError) {
    return widthError;
  }

  // 检查 length 范围
  const lengthError = checkParameterRange(length, dimensionParameterRanges.length, t);
  if (lengthError) {
    return lengthError;
  }

  // 检查 layers 范围
  const layersError = checkParameterRange(layers, dimensionParameterRanges.layers, t);
  if (layersError) {
    return layersError;
  }

  // 规则4: ratio = min(width, length) / max(width, length)
  const minDimension = Math.min(width, length);
  const maxDimension = Math.max(width, length);
  const ratio = minDimension / maxDimension;

  if (width <= 100) {
    // If width <= 100: 0.2 <= ratio <= 1
    if (ratio < 0.2 || ratio > 1) {
      return t 
        ? t('design.electrode.validation.ratioSmallWidth')
        : '宽度不超过 100 时，长宽比必须在 0.2 到 1 之间。';
    }
  } else if (width <= 1000) {
    // If 100 < width <= 1000: 0.1 <= ratio <= 0.5
    if (ratio < 0.1 || ratio > 0.5) {
      return t 
        ? t('design.electrode.validation.ratioLargeWidth')
        : '宽度在 100 到 1000 之间时，长宽比必须保持在 0.1 到 0.5 之间。';
    }
  }

  return null;
}

/**
 * 验证所有参数
 * @param params 电极参数
 * @param t 可选的翻译函数，用于多语言支持
 * @returns 验证结果
 */
export function validateElectrodeParameters(
  params: ElectrodeParameters,
  t?: TranslateFunction,
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // 验证阴极参数
  const cathodeError = validateCathodeParameters(params, t);
  if (cathodeError) {
    errors.cathode = cathodeError;
  }

  // 验证阳极参数
  const anodeError = validateAnodeParameters(params, t);
  if (anodeError) {
    errors.anode = anodeError;
  }

  // 验证尺寸参数
  const dimensionError = validateDimensionParameters(params, t);
  if (dimensionError) {
    errors.dimension = dimensionError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 获取所有参数范围（用于显示提示信息）
 */
export function getAllParameterRanges() {
  return {
    cathode: cathodeParameterRanges,
    anode: anodeParameterRanges,
    dimension: dimensionParameterRanges,
  };
}

/**
 * 获取参数的最小值
 */
export function getParameterMin(key: string): number | undefined {
  const allRanges = {
    ...cathodeParameterRanges,
    ...anodeParameterRanges,
    ...dimensionParameterRanges,
  };
  return allRanges[key]?.min;
}

/**
 * 获取参数的最大值
 */
export function getParameterMax(key: string): number | undefined {
  const allRanges = {
    ...cathodeParameterRanges,
    ...anodeParameterRanges,
    ...dimensionParameterRanges,
  };
  return allRanges[key]?.max;
}
