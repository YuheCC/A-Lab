export interface AdditiveOption {
  value: string;
  label: string;
}

/**
 * Additive 1/2/3 下拉选项（对应 model_params 中的 additive_3/4/5_name）
 * 空字符串值表示"不添加"
 * 如需新增/删除选项，仅修改此处
 */
export const ADDITIVE_NAME_OPTIONS: AdditiveOption[] = [
  { value: '', label: '-' },
  { value: 'VC', label: 'VC' },
  { value: 'DTD', label: 'DTD' },
  { value: 'BTS', label: 'BTS' },
  { value: 'TTSB', label: 'TTSB' },
];
