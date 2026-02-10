// Mock data for model selection
// 模型选择的 Mock 数据

// 性能指标类型
export type PerformanceMetricType = 'cl' | 'ce' | 'rate';

export interface ModelOption {
  id: string;
  name: string;
  baseModel: string;
  category: 'base' | 'finetuned' | 'mu';
  supportedMetrics: PerformanceMetricType[]; // 支持的性能指标配置
  disabled?: boolean; // 禁用标记
  disabledText?: string; // 禁用提示文案的多语言翻译键
}

export const mockModels: ModelOption[] = [
  // Base Model - 支持所有指标
  {
    id: 'D-BASE-000',
    name: 'Base Model (Cycle Life + CE + Rate Performance)',
    baseModel: '-',
    category: 'base',
    supportedMetrics: ['cl', 'ce', 'rate']
  },

  // Fine-tuned Models - 根据 baseModel 配置对应指标
  {
    id: 'D-2024-001',
    name: 'VC Additive Cycle Optimizer v1.2',
    baseModel: 'Cycle Life Base Model',
    category: 'finetuned',
    supportedMetrics: ['cl']
  },
  {
    id: 'D-2024-002',
    name: 'FEC Impact Predictor v2.0',
    baseModel: 'Coulombic Efficiency Base Model',
    category: 'finetuned',
    supportedMetrics: ['ce']
  },
  {
    id: 'D-2024-003',
    name: 'LiTFSI Concentration Optimizer v1.5',
    baseModel: 'Rate Performance Base Model',
    category: 'finetuned',
    supportedMetrics: ['rate']
  },
  {
    id: 'D-2024-004',
    name: 'Multi-salt Electrolyte Predictor v3.1',
    baseModel: 'Cycle Life Base Model',
    category: 'finetuned',
    supportedMetrics: ['cl']
  },
  {
    id: 'D-2024-005',
    name: 'High Temperature Performance Model v2.3',
    baseModel: 'Coulombic Efficiency Base Model',
    category: 'finetuned',
    supportedMetrics: ['ce']
  },
  {
    id: 'D-2024-006',
    name: 'Fast Charging Compatibility Predictor v1.8',
    baseModel: 'Rate Performance Base Model',
    category: 'finetuned',
    supportedMetrics: ['rate']
  },
  {
    id: 'D-2024-007',
    name: 'Low Temperature Stability Model v2.1',
    baseModel: 'Cycle Life Base Model',
    category: 'finetuned',
    supportedMetrics: ['cl']
  },
  {
    id: 'D-2024-008',
    name: 'Additive Synergy Predictor v1.4',
    baseModel: 'Coulombic Efficiency Base Model',
    category: 'finetuned',
    supportedMetrics: ['ce']
  }
];

// MU2 即将推出的模型（置灰状态）- 用于添加到真实数据中
export const upcomingModels: ModelOption[] = [
  {
    id: 'D-MU2-001',
    name: 'LFP-Graphite - Carbonate electrolyte',
    disabledText: 'design.model.toLaunchInMU2',
    baseModel: 'Cycle Life + Coulombic Efficiency + Rate Performance',
    category: 'mu',
    supportedMetrics: ['cl', 'ce', 'rate'],
    disabled: true
  },
  {
    id: 'D-MU2-002',
    name: 'NCM811-Li-Metal - SES proprietary electrolyte',
    disabledText: 'design.model.toLaunchInMU2',
    baseModel: 'Cycle Life + Coulombic Efficiency + Rate Performance',
    category: 'mu',
    supportedMetrics: ['cl', 'ce', 'rate'],
    disabled: true
  }
];
