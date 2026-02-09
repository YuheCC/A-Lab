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
      // 阳极参数 - 重命名
      anodeCMC: 0.8,                  // CMC (wt.%)
      anodeSBR: 0.8,                  // SBR (wt.%)
      anodePAA: 0,                    // PAA (wt.%)
      anodeSuperP: 1.2,               // Super P (wt.%)
      anodeSWCNT: 0,                  // SWCNT (wt.%)
      anodePressDensity: 1.5,         // Press Density (g/cc)
      anodeSCBI: 11.3,                // Active material-1 SC-B-I (%) ← 新增
      anodeGrSI: 82.6,                // Active material-2 Gr-S-I (%) ← 新增
      anodeArealLoading: 4.11,        // Areal Loading (mAh/cm²) ← 新增
      // 阴极参数 - 重命名
      cathodeKF9700: 2.0,             // KF-9700 (wt.%)
      cathodeCN01Y: 0.5,              // CN-01Y (wt.%)
      cathodeSuperC65: 1.5,           // Super C65 (wt.%)
      cathodeArealLoading: 15.0,      // Areal Loading (mAh/cm²)
      cathodePressDensity: 3.5,       // Press Density (g/cc)
      cathodeNCMA: 96.0,              // Active material NCM-A (%) ← 新增
      // 尺寸参数
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
      anodeCMC: 1.0,
      anodeSBR: 1.0,
      anodePAA: 0.5,
      anodeSuperP: 1.5,
      anodeSWCNT: 0.3,
      anodePressDensity: 1.6,
      anodeSCBI: 10.0,
      anodeGrSI: 80.0,
      anodeArealLoading: 5.0,
      cathodeKF9700: 2.5,
      cathodeCN01Y: 0.8,
      cathodeSuperC65: 2.0,
      cathodeArealLoading: 18.0,
      cathodePressDensity: 3.8,
      cathodeNCMA: 94.0,
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
      anodeCMC: 0.9,
      anodeSBR: 0.9,
      anodePAA: 0,
      anodeSuperP: 1.3,
      anodeSWCNT: 0.2,
      anodePressDensity: 1.55,
      anodeSCBI: 12.0,
      anodeGrSI: 83.0,
      anodeArealLoading: 4.5,
      cathodeKF9700: 2.2,
      cathodeCN01Y: 0.6,
      cathodeSuperC65: 1.8,
      cathodeArealLoading: 16.5,
      cathodePressDensity: 3.6,
      cathodeNCMA: 95.0,
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