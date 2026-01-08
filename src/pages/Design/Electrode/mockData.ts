/**
 * Electrode Records Mock Data
 * 电极设计记录 Mock 数据
 */

import type {
  ElectrodeHistoryItem,
  ElectrodeModelResult,
} from '@/services/electrode/types';

export interface ElectrodeRecord {
  id: string;           // Record ID (RP-XXX)
  cellDesign: string;   // Cell Design (Balanced, Energy Dense, Power Dense)
  cathode: string;      // Cathode Active Material
  anode: string;        // Anode Active Material
  createdTime: string;  // Created Time (YYYY/MM/DD HH:mm:ss)
}

export const MOCK_RECORDS: ElectrodeRecord[] = [
  {
    id: 'RP-080',
    cellDesign: 'Balanced',
    cathode: 'NCM811',
    anode: '12% Si',
    createdTime: '2025/12/09 14:52:08'
  },
  {
    id: 'RP-065',
    cellDesign: 'Energy Dense',
    cathode: 'NCM622',
    anode: 'Gr',
    createdTime: '2025/12/08 09:46:57'
  },
  {
    id: 'RP-054',
    cellDesign: 'Power Dense',
    cathode: 'LFP',
    anode: '30% Si',
    createdTime: '2025/12/07 10:20:01'
  }
];

// ============================================
// API Mock 数据（用于 Model 层）
// ============================================

/**
 * Mock 历史记录数据（完整数据，包含模型参数和结果）
 * Mock History Data (Full data with model params and results)
 */
export const MOCK_HISTORY_DATA: ElectrodeHistoryItem[] = [
  {
    id: 1,
    cell_design: 'Cylindrical',
    cathode_active_material: 'LiFePO4',
    anode_active_material: 'Graphite',
    model_params: {
      anodeBinder1: 0.8,
      anodeBinder2: 0.8,
      anodeBinder3: 0,
      anodeConductiveCarbon: 1.2,
      anodeCNT: 0,
      anodePressDensity: 1.5,
      cathodeBinder1: 2.0,
      cathodeCNT: 0.5,
      cathodeConductiveCarbon: 1.5,
      cathodeArealLoading: 15.0,
      cathodePressDensity: 3.5,
      width: 100,
      length: 200,
      layers: 50,
    },
    model_result: {
      designCapacity: 10.5,
      specificED: 250.0,
      jellyRollThickness: 25.5,
      volumetricED: 650.0,
    },
    created_at: '2025-01-05 10:30:00',
    updated_at: '2025-01-05 10:30:00',
  },
  {
    id: 2,
    cell_design: 'Prismatic',
    cathode_active_material: 'NMC811',
    anode_active_material: 'Silicon-Graphite',
    model_params: {
      anodeBinder1: 1.0,
      anodeBinder2: 1.0,
      anodeBinder3: 0.5,
      anodeConductiveCarbon: 1.5,
      anodeCNT: 0.3,
      anodePressDensity: 1.6,
      cathodeBinder1: 2.5,
      cathodeCNT: 0.8,
      cathodeConductiveCarbon: 2.0,
      cathodeArealLoading: 18.0,
      cathodePressDensity: 3.8,
      width: 120,
      length: 250,
      layers: 60,
    },
    model_result: {
      designCapacity: 15.2,
      specificED: 280.0,
      jellyRollThickness: 30.2,
      volumetricED: 700.0,
    },
    created_at: '2025-01-06 14:20:00',
    updated_at: '2025-01-06 14:20:00',
  },
  {
    id: 3,
    cell_design: 'Pouch',
    cathode_active_material: 'LCO',
    anode_active_material: 'Graphite',
    model_params: {
      anodeBinder1: 0.9,
      anodeBinder2: 0.9,
      anodeBinder3: 0,
      anodeConductiveCarbon: 1.3,
      anodeCNT: 0.2,
      anodePressDensity: 1.55,
      cathodeBinder1: 2.2,
      cathodeCNT: 0.6,
      cathodeConductiveCarbon: 1.8,
      cathodeArealLoading: 16.5,
      cathodePressDensity: 3.6,
      width: 110,
      length: 220,
      layers: 55,
    },
    model_result: {
      designCapacity: 12.8,
      specificED: 265.0,
      jellyRollThickness: 28.0,
      volumetricED: 680.0,
    },
    created_at: '2025-01-07 09:15:00',
    updated_at: '2025-01-07 09:15:00',
  },
];

/**
 * Mock 预测结果
 * Mock Prediction Result
 */
export const MOCK_PREDICT_RESULT: ElectrodeModelResult = {
  designCapacity: 11.5,
  specificED: 255.0,
  jellyRollThickness: 26.8,
  volumetricED: 665.0,
};
