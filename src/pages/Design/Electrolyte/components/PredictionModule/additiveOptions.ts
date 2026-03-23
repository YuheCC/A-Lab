export interface AdditiveOption {
  value: string;
  label: string;
}

// key: 缩写；value: 等价 SMILES 列表（留空时不参与跨类型比较，由开发者后续填写）
export const ADDITIVE_SMILES_MAP: Record<string, string[]> = {
  FEC:  [],
  PS:   [],
  BTS:  [],
  VC:   [],
  DTD:  [],
  TTSB: [],
};

/**
 * model_type=100 对应的 Additive 下拉选项
 */
export const ADDITIVE_NAME_OPTIONS: AdditiveOption[] = [
  { value: 'FEC', label: 'FEC' },
  { value: 'PS', label: 'PS' },
  { value: 'BTS', label: 'BTS' },
];

/**
 * model_type=101 对应的 Additive 下拉选项
 */
export const ADDITIVE_NAME_OPTIONS_101: AdditiveOption[] = [
  { value: 'VC', label: 'VC' },
  { value: 'DTD', label: 'DTD' },
  { value: 'BTS', label: 'BTS' },
  { value: 'TTSB', label: 'TTSB' },
];
