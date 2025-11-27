// Mock data for model selection
// 模型选择的 Mock 数据

export interface ModelOption {
  id: string;
  name: string;
  baseModel: string;
  category: 'base' | 'finetuned';
}

export const mockModels: ModelOption[] = [
  // Base Model
  {
    id: 'D-BASE-000',
    name: 'Base Model (Cycle Life + CE + Rate Performance)',
    baseModel: '-',
    category: 'base'
  },

  // Fine-tuned Models
  {
    id: 'D-2024-001',
    name: 'VC Additive Cycle Optimizer v1.2',
    baseModel: 'Cycle Life Base Model',
    category: 'finetuned'
  },
  {
    id: 'D-2024-002',
    name: 'FEC Impact Predictor v2.0',
    baseModel: 'Coulombic Efficiency Base Model',
    category: 'finetuned'
  },
  {
    id: 'D-2024-003',
    name: 'LiTFSI Concentration Optimizer v1.5',
    baseModel: 'Rate Performance Base Model',
    category: 'finetuned'
  },
  {
    id: 'D-2024-004',
    name: 'Multi-salt Electrolyte Predictor v3.1',
    baseModel: 'Cycle Life Base Model',
    category: 'finetuned'
  },
  {
    id: 'D-2024-005',
    name: 'High Temperature Performance Model v2.3',
    baseModel: 'Coulombic Efficiency Base Model',
    category: 'finetuned'
  },
  {
    id: 'D-2024-006',
    name: 'Fast Charging Compatibility Predictor v1.8',
    baseModel: 'Rate Performance Base Model',
    category: 'finetuned'
  },
  {
    id: 'D-2024-007',
    name: 'Low Temperature Stability Model v2.1',
    baseModel: 'Cycle Life Base Model',
    category: 'finetuned'
  },
  {
    id: 'D-2024-008',
    name: 'Additive Synergy Predictor v1.4',
    baseModel: 'Coulombic Efficiency Base Model',
    category: 'finetuned'
  }
];
