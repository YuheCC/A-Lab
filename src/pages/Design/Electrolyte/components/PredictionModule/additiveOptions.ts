export interface AdditiveOption {
  value: string;
  label: string;
}

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
