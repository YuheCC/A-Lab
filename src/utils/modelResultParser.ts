/**
 * 统一的 model_result 解析工具
 * 用于处理性能预测接口返回的 model_result 字段
 * 支持两种格式：
 * 1. 老格式：ce_cl_result + cr_result
 * 2. 新格式：temperature_25/45 + performance_type
 */

export interface ParsedModelResult {
  temperature_25_CE_label?: string;
  temperature_25_CE_prob?: string;
  temperature_25_CL_label?: string;
  temperature_25_CL_prob?: string;
  temperature_25_CR_label?: string;
  temperature_25_CR_prob?: string;
  temperature_45_CE_label?: string;
  temperature_45_CE_prob?: string;
  temperature_45_CL_label?: string;
  temperature_45_CL_prob?: string;
  quantification_result?: any;
}

// 新格式数据类型定义
interface NewFormatMetric {
  status: string;
  performance_type: string; // 'CR_25', 'CL_25', 'CL_45', 'CE_25', 'CE_45'
  task: string; // 'regression' 或 'classification'
  smiles: string;
  value?: number; // 回归任务的预测值
  label?: number; // 分类任务的标签
  prob?: number;  // 分类任务的概率
}

// performance_type 到字段名的映射
const PERFORMANCE_TYPE_TO_FIELD_MAP: Record<string, { probField: keyof ParsedModelResult; labelField: keyof ParsedModelResult }> = {
  'CR_25': { probField: 'temperature_25_CR_prob', labelField: 'temperature_25_CR_label' },
  'CL_25': { probField: 'temperature_25_CL_prob', labelField: 'temperature_25_CL_label' },
  'CL_45': { probField: 'temperature_45_CL_prob', labelField: 'temperature_45_CL_label' },
  'CE_25': { probField: 'temperature_25_CE_prob', labelField: 'temperature_25_CE_label' },
  'CE_45': { probField: 'temperature_45_CE_prob', labelField: 'temperature_45_CE_label' },
};

/**
 * 检测是否为新格式数据
 */
function isNewFormatData(modelResult: any): boolean {
  return (
    modelResult &&
    (modelResult.temperature_25?.performance_type || modelResult.temperature_45?.performance_type)
  );
}

/**
 * 处理新格式的单个指标数据
 */
function processNewFormatMetric(metricData: NewFormatMetric): { prob: string; label: string } {
  if (!metricData) {
    return { prob: '0', label: '0' };
  }

  // 根据任务类型处理
  if (metricData.task === 'regression') {
    // 回归任务：使用 value 作为概率，根据正负判断标签
    const value = metricData.value ?? 0;
    const label = value >= 0 ? 0 : 1;
    return {
      prob: (Math.abs(value) * 100).toString(),
      label: label.toString()
    };
  } else {
    // 分类任务：使用 prob 和 label
    const prob = metricData.prob ?? metricData.value ?? 0;
    const label = metricData.label ?? 0;
    return {
      prob: (Math.abs(prob) * 100).toString(),
      label: label.toString()
    };
  }
}

/**
 * 解析新格式数据
 */
function parseNewFormatData(model_result: any): ParsedModelResult {
  const result: ParsedModelResult = {};

  // 处理 temperature_25 数据
  if (model_result.temperature_25) {
    const metric25 = model_result.temperature_25 as NewFormatMetric;
    const mapping = PERFORMANCE_TYPE_TO_FIELD_MAP[metric25.performance_type];
    if (mapping) {
      const { prob, label } = processNewFormatMetric(metric25);
      result[mapping.probField] = prob;
      result[mapping.labelField] = label;
    }
  }

  // 处理 temperature_45 数据
  if (model_result.temperature_45) {
    const metric45 = model_result.temperature_45 as NewFormatMetric;
    const mapping = PERFORMANCE_TYPE_TO_FIELD_MAP[metric45.performance_type];
    if (mapping) {
      const { prob, label } = processNewFormatMetric(metric45);
      result[mapping.probField] = prob;
      result[mapping.labelField] = label;
    }
  }

  return result;
}

/**
 * 解析老格式数据
 */
function parseOldFormatData(model_result: any): ParsedModelResult {
  const result: ParsedModelResult = {};

  // 提取 ce_cl_result
  result.temperature_25_CE_label = model_result?.ce_cl_result?.temperature_25_CE_label?.toString();
  result.temperature_25_CE_prob = model_result?.ce_cl_result?.temperature_25_CE_prob?.toString();
  result.temperature_25_CL_label = model_result?.ce_cl_result?.temperature_25_CL_label?.toString();
  result.temperature_25_CL_prob = model_result?.ce_cl_result?.temperature_25_CL_prob?.toString();

  result.temperature_45_CE_label = model_result?.ce_cl_result?.temperature_45_CE_label?.toString();
  result.temperature_45_CE_prob = model_result?.ce_cl_result?.temperature_45_CE_prob?.toString();
  result.temperature_45_CL_label = model_result?.ce_cl_result?.temperature_45_CL_label?.toString();
  result.temperature_45_CL_prob = model_result?.ce_cl_result?.temperature_45_CL_prob?.toString();

  // 提取 cr_result
  result.temperature_25_CR_label = model_result?.cr_result?.temperature_25_CR_label?.toString();
  result.temperature_25_CR_prob = model_result?.cr_result?.temperature_25_CR_prob?.toString();

  // 提取 quantification_result
  result.quantification_result = model_result?.quantification_result ?? {};

  return result;
}

/**
 * 解析 model_result JSON 字符串并提取字段
 * 自动检测并处理新格式和老格式数据
 * @param apiData 原始 API 响应数据
 * @returns 解析后的数据对象
 */
export function parseModelResult(apiData: any): ParsedModelResult & { originalData: any } {
  let result: ParsedModelResult = {};

  try {
    if (apiData?.model_result) {
      const model_result = JSON.parse(apiData.model_result);

      // 检测并处理新格式数据
      if (isNewFormatData(model_result)) {
        console.log('[ModelResultParser] Detected new format data');
        result = parseNewFormatData(model_result);
      } else {
        // 老格式处理逻辑
        console.log('[ModelResultParser] Using old format data');
        result = parseOldFormatData(model_result);
      }
    }
  } catch (error) {
    console.error('Error parsing model_result:', error);
  }

  return {
    ...result,
    originalData: apiData,
  };
}
