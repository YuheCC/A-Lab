/**
 * Electrode Records Mock Data
 * 电极设计记录 Mock 数据
 */

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
