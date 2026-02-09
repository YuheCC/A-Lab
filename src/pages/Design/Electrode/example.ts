// Mock data configuration for electrode history
import type { ElectrodeHistoryItem, ElectrodeModelResult } from '@/services/electrode/types';

// Extended interface for mock data with isMock field
export interface MockElectrodeHistoryItem extends ElectrodeHistoryItem {
  isMock?: boolean;
}

// Mock electrode history data - single example for demo
export const mockElectrodeHistory: MockElectrodeHistoryItem[] = [
  {
    id: 145,
    cell_design: 'Balanced',
    np_ratio: '1.07',
    cathode_active_material: 'NCM811',
    anode_active_material: '12% Si',
    model_params: {
      anodeCMC: 0.42,
      anodeSBR: 0.5,
      anodePAA: 2.3,
      anodeSuperP: 0.6,
      anodeSWCNT: 0.41,
      anodePressDensity: 1.4,
      anodeSCBI: 11.49,
      anodeGrSI: 84.28,
      anodeArealLoading: 4.11,
      cathodeKF9700: 1.2,
      cathodeCN01Y: 0.72,
      cathodeSuperC65: 0.09,
      cathodeArealLoading: 4,
      cathodePressDensity: 3.4,
      cathodeNCMA: 97.99,
      width: 43.5,
      length: 50.5,
      layers: 22,
    },
    model_result: {
      designCapacity: 3.71,
      specificED: 298.45,
      jellyRollThickness: 6.14,
      volumetricED: 966.24,
    },
    type: 1,
    created_at: '2026-01-22T08:52:53.272015',
    updated_at: '2026-01-22T08:52:53.272024',
    isMock: true,
  },
];

// Mock detail data generator (returns the same item with detailed information)
export const generateMockDetail = (baseItem: MockElectrodeHistoryItem): MockElectrodeHistoryItem => {
  return {
    id: 145,
    cell_design: 'Balanced',
    np_ratio: '1.07',
    cathode_active_material: 'NCM811',
    anode_active_material: '12% Si',
    model_params: {
      anodeCMC: 0.42,
      anodeSBR: 0.5,
      anodePAA: 2.3,
      anodeSuperP: 0.6,
      anodeSWCNT: 0.41,
      anodePressDensity: 1.4,
      anodeSCBI: 11.49,
      anodeGrSI: 84.28,
      anodeArealLoading: 4.11,
      cathodeKF9700: 1.2,
      cathodeCN01Y: 0.72,
      cathodeSuperC65: 0.09,
      cathodeArealLoading: 4,
      cathodePressDensity: 3.4,
      cathodeNCMA: 97.99,
      width: 43.5,
      length: 50.5,
      layers: 22,
    },
    model_result: {
      designCapacity: 3.71,
      specificED: 298.45,
      jellyRollThickness: 6.14,
      volumetricED: 966.24,
    },
    type: 1,
    created_at: '2026-01-22T08:52:53.272015',
    updated_at: '2026-01-22T08:52:53.272024',
    isMock: true,
  };
};
