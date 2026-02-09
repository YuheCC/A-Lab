/**
 * Electrode 模块常量定义
 * 包含 Cell Type、Active Material 等枚举值和配置
 */

// ============ Cell Design (Cell Type) 配置 ============

export interface CellDesignOption {
  value: string;
  label: string;
  disabled: boolean;
  npRatio: string; // 对应的 NP Ratio 默认值
}

export const CELL_DESIGN_OPTIONS: CellDesignOption[] = [
  {
    value: 'Balanced',
    label: 'Balanced',
    disabled: false,
    npRatio: '1.07',
  },
  {
    value: 'High Energy',
    label: 'High Energy',
    disabled: true,
    npRatio: '1.05',
  },
  {
    value: 'High Power',
    label: 'High Power',
    disabled: true,
    npRatio: '1.10',
  },
];

// 根据 Cell Design 获取对应的 NP Ratio
export const getNpRatioByCellDesign = (cellDesign: string): string => {
  const option = CELL_DESIGN_OPTIONS.find((opt) => opt.value === cellDesign);
  return option?.npRatio || '1.07'; // 默认返回 Balanced 的值
};

// ============ Cathode Active Material 配置 ============

export interface MaterialOption {
  value: string;
  label: string;
  disabled: boolean;
}

export const CATHODE_ACTIVE_MATERIAL_OPTIONS: MaterialOption[] = [
  {
    value: 'NCM811',
    label: 'NCM811',
    disabled: false,
  },
  {
    value: 'NCM622',
    label: 'NCM622',
    disabled: true,
  },
  {
    value: 'LFP',
    label: 'LFP',
    disabled: true,
  },
];

// ============ Anode Active Material 配置 ============

export const ANODE_ACTIVE_MATERIAL_OPTIONS: MaterialOption[] = [
  {
    value: '12% Si',
    label: '12% SiC / 88% Graphite',
    disabled: false,
  },
  {
    value: '30% Si',
    label: '30% SiC / 70% Graphite',
    disabled: true,
  },
  {
    value: 'Si',
    label: 'SiC',
    disabled: true,
  },
  {
    value: 'Gr',
    label: 'Graphite',
    disabled: true,
  },
];

// ============ 默认值 ============

export const DEFAULT_VALUES = {
  cellDesign: 'Balanced',
  npRatio: '1.07',
  cathodeActiveMaterial: 'NCM811',
  anodeActiveMaterial: '12% Si',
};
