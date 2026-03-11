/**
 * 电极设计参数验证配置和验证函数
 * 用于 Predict 和 Optimize 页面的参数校验
 */

// 验证选项接口
export interface ValidationOptions {
  skipEmptyCheck?: boolean;  // 是否跳过空值检查，默认 false（用于实时验证时只检查非空字段的范围和业务规则）
}

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

/**
 * 严格判断字符串值是否为空（不会把 0 误识别为空）
 * 用于材料选择等字符串类型字段
 */
function isEmptyString(value: string | undefined | null): boolean {
  return value === undefined || value === null || value === '';
}

/**
 * 判断数值是否为空（用于数字类型字段）
 * 支持 number 和 string 类型（Input 组件可能返回字符串）
 * 不会把 0 误识别为空
 */
function isEmptyNumber(value: number | string | undefined | null): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
}

// 阴极参数范围（默认范围）
export const cathodeParameterRanges: Record<string, ParameterRange> = {
  cathodeKF9700: {
    key: 'cathodeKF9700',
    label: 'PVDF (wt.%)',
    min: 0.8,
    max: 2.5,
  },
  cathodeCN01Y: {
    key: 'cathodeCN01Y',
    label: 'CNT (wt.%)',
    min: 0,
    max: 2,
  },
  cathodeSuperC65: {
    key: 'cathodeSuperC65',
    label: 'Carbon Black (wt.%)',
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
    label: 'Carbon Black (wt.%)',
    min: 0,
    max: 2.0,
  },
  anodeSWCNT: {
    key: 'anodeSWCNT',
    label: 'CNT (wt.%)',
    min: 0.05,
    max: 1.2,
  },
  anodePressDensity: {
    key: 'anodePressDensity',
    label: 'Press Density (g/cc)',
    min: 1.28,
    max: 1.5,
  },
  // Areal Loading根据公式计算: cathode_loading / 0.9142 * 1.07 * 0.878
  // 基于cathode的范围 [2.91, 5.3] 计算得出
  anodeArealLoading: {
    key: 'anodeArealLoading',
    label: 'Areal Loading (mAh/cm²)',
    min: Number((2.91 / 0.9142 * 1.07 * 0.878).toFixed(2)), // ≈ 2.99
    max: Number((5.3 / 0.9142 * 1.07 * 0.878).toFixed(2)),  // ≈ 5.45
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
 * @param params 电极参数
 * @param t 可选的翻译函数
 * @param options 验证选项，skipEmptyCheck 为 true 时跳过空值检查
 */
function validateCathodeParameters(
  params: ElectrodeParameters,
  t?: TranslateFunction,
  options?: ValidationOptions,
): string | null {
  const skipEmptyCheck = options?.skipEmptyCheck ?? false;

  // 检查是否选择了阴极材料（空值检查）
  if (!skipEmptyCheck && isEmptyString(params.cathodeActiveMaterial)) {
    return t
      ? t('design.electrode.validation.selectCathodeMaterial')
      : '请选择阴极活性材料';
  }

  // 检查各参数范围（只检查非空值）
  const rangeErrors: string[] = [];

  Object.entries(cathodeParameterRanges).forEach(([key, range]) => {
    const value = params[key as keyof ElectrodeParameters] as number;
    // 如果值为空，跳过范围检查（空值检查在其他地方处理）
    if (isEmptyNumber(value)) return;
    const error = checkParameterRange(value, range, t);
    if (error) {
      rangeErrors.push(error);
    }
  });

  if (rangeErrors.length > 0) {
    return rangeErrors[0]; // 返回第一个错误
  }

  // 规则1: Carbon Black (导电碳) + CNT (碳纳米管) > 0.8
  // 使用 ?? 0 替代 || 0，避免 0 被替换
  const cathodeSuperC65 = params.cathodeSuperC65 ?? 0;
  const cathodeCN01Y = params.cathodeCN01Y ?? 0;

  // 只有当两个值都非空时才检查业务规则
  if (!isEmptyNumber(params.cathodeSuperC65) && !isEmptyNumber(params.cathodeCN01Y)) {
    if (cathodeSuperC65 + cathodeCN01Y <= 0.8) {
      return t
        ? t('design.electrode.validation.cathodeConductiveSum')
        : 'Carbon Black + CNT 的总和必须大于 0.8';
    }
  }

  return null;
}

/**
 * 验证阳极参数
 * @param params 电极参数
 * @param t 可选的翻译函数
 * @param options 验证选项，skipEmptyCheck 为 true 时跳过空值检查
 */
function validateAnodeParameters(
  params: ElectrodeParameters,
  t?: TranslateFunction,
  options?: ValidationOptions,
): string | null {
  const skipEmptyCheck = options?.skipEmptyCheck ?? false;

  // 检查各参数范围（只检查非空值）
  const rangeErrors: string[] = [];

  Object.entries(anodeParameterRanges).forEach(([key, range]) => {
    const value = params[key as keyof ElectrodeParameters] as number;
    // 如果值为空，跳过范围检查（空值检查在其他地方处理）
    if (isEmptyNumber(value)) return;
    const error = checkParameterRange(value, range, t);
    if (error) {
      rangeErrors.push(error);
    }
  });

  if (rangeErrors.length > 0) {
    return rangeErrors[0]; // 返回第一个错误
  }

  // 使用 ?? 0 替代 || 0，避免 0 被替换
  const anodeCMC = params.anodeCMC ?? 0;
  const anodeSWCNT = params.anodeSWCNT ?? 0;
  const anodeSuperP = params.anodeSuperP ?? 0;

  // 规则2: CMC (粘合剂) > CNT (碳纳米管)
  // 只有当两个值都非空时才检查业务规则
  if (!isEmptyNumber(params.anodeCMC) && !isEmptyNumber(params.anodeSWCNT)) {
    if (anodeCMC <= anodeSWCNT) {
      return t
        ? t('design.electrode.validation.cmcGreaterThanSwcnt')
        : 'CMC 必须大于 CNT';
    }
  }

  // 规则3: Carbon Black (导电碳) + CNT (碳纳米管) > 0.005
  // 只有当两个值都非空时才检查业务规则
  if (!isEmptyNumber(params.anodeSuperP) && !isEmptyNumber(params.anodeSWCNT)) {
    if (anodeSuperP + anodeSWCNT <= 0.005) {
      return t
        ? t('design.electrode.validation.anodeConductiveSum')
        : 'Carbon Black + CNT 的总和必须大于 0.005';
    }
  }

  return null;
}

/**
 * 验证尺寸参数
 * @param params 电极参数
 * @param t 可选的翻译函数
 * @param options 验证选项，skipEmptyCheck 为 true 时跳过空值检查
 */
function validateDimensionParameters(
  params: ElectrodeParameters,
  t?: TranslateFunction,
  options?: ValidationOptions,
): string | null {
  const skipEmptyCheck = options?.skipEmptyCheck ?? false;

  // 解析值（支持 string 和 number 类型）
  const widthRaw = params.width;
  const lengthRaw = params.length;

  const width = typeof widthRaw === 'string' ? parseFloat(widthRaw) : widthRaw;
  const length = typeof lengthRaw === 'string' ? parseFloat(lengthRaw) : lengthRaw;

  // 检查是否填写了所有尺寸参数（空值检查）
  // 使用 isEmptyNumber 避免 0 被误识别为空
  const widthEmpty = isEmptyNumber(widthRaw);
  const lengthEmpty = isEmptyNumber(lengthRaw);

  if (!skipEmptyCheck && (widthEmpty || lengthEmpty)) {
    return t
      ? t('design.electrode.validation.fillAllDimensions')
      : '请填写所有尺寸参数';
  }

  // 检查 width 范围（只检查非空值）
  if (!widthEmpty && width !== undefined) {
    const widthError = checkParameterRange(width, dimensionParameterRanges.width, t);
    if (widthError) {
      return widthError;
    }
  }

  // 检查 length 范围（只检查非空值）
  if (!lengthEmpty && length !== undefined) {
    const lengthError = checkParameterRange(length, dimensionParameterRanges.length, t);
    if (lengthError) {
      return lengthError;
    }
  }

  // 规则4: ratio = min(width, length) / max(width, length)
  // 只有当 width 和 length 都非空时才检查长宽比规则
  if (!widthEmpty && !lengthEmpty && width !== undefined && length !== undefined) {
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
  }

  return null;
}

/**
 * 验证所有参数
 * @param params 电极参数
 * @param t 可选的翻译函数，用于多语言支持
 * @param options 验证选项，skipEmptyCheck 为 true 时跳过空值检查
 * @returns 验证结果
 */
export function validateElectrodeParameters(
  params: ElectrodeParameters,
  t?: TranslateFunction,
  options?: ValidationOptions,
): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // 验证阴极参数
  const cathodeError = validateCathodeParameters(params, t, options);
  if (cathodeError) {
    errors.cathode = cathodeError;
  }

  // 验证阳极参数
  const anodeError = validateAnodeParameters(params, t, options);
  if (anodeError) {
    errors.anode = anodeError;
  }

  // 验证尺寸参数
  const dimensionError = validateDimensionParameters(params, t, options);
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

/**
 * 导出区域验证函数，用于组件实时验证
 * 这些函数已在 validateElectrodeParameters 中使用，现在导出供外部使用
 */
export {
  validateCathodeParameters,
  validateAnodeParameters,
  validateDimensionParameters
};
