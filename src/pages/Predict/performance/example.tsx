// Mock data configuration for performance history
import { PerformanceHistoryItem } from '@/services/prediction/performance';

// Extended interface for mock data with isMock field
export interface MockPerformanceHistoryItem extends PerformanceHistoryItem {
  isMock?: boolean;
}

// Mock battery systems
export const mockBatterySystems = [
  {
    id: '1',
    name: 'LiFePO4/Graphite System',
    cathode: 'LiFePO4',
    anode: 'Graphite',
    benchmark_electrolyte: '1M LiPF6 in EC:DMC (1:1)',
    cell_design: '2032 Coin Cell',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock performance history data - single example for demo
export const mockPerformanceHistory: MockPerformanceHistoryItem[] = [
  {
    id: 9999,
    isMock: true,
    battery_system_id: 1,
    smiles: 'CCOC(=O)CC(C)(C)OC(=O)CC',
    temperature_25_CE_prop: '0.85',
    temperature_25_CE_label: '0', // 0 = positive, 1 = negative
    temperature_25_CL_prop: '0.78',
    temperature_25_CL_label: '0',
    temperature_25_CR_prop: '0.92',
    temperature_25_CR_label: '0',
    temperature_45_CE_prop: '0.73',
    temperature_45_CE_label: '0',
    temperature_45_CL_prop: '0.69',
    temperature_45_CL_label: '0',
    llm_analysis_result: `## Optimization Analysis

### Key Benefits
The additive shows excellent performance improvement across all metrics:
- **Coulombic Efficiency**: Enhanced by 15% at 25°C and 12% at 45°C
- **Cycle Life**: Extended by approximately 200 cycles
- **Rate Capability**: Improved C-rate performance by 20%

### Mechanism of Action
The molecular structure suggests formation of a stable SEI layer through:
1. Preferential reduction at the anode surface
2. Formation of LiF-rich interface
3. Reduced electrolyte decomposition

### Recommendations
- Optimal concentration: 1-2 wt%
- Best paired with carbonate-based electrolytes
- Consider combining with VC for synergistic effects`,
    created_at: '2024-03-15T10:30:00Z',
    updated_at: '2024-03-15T10:30:00Z'
  }
];

// Function to get random mock data for demo purposes
export const getRandomMockHistory = (count: number = 1): MockPerformanceHistoryItem[] => {
  return mockPerformanceHistory.slice(0, count);
};

// Mock detail data generator (returns the same item with detailed information)
export const generateMockDetail = (baseItem: MockPerformanceHistoryItem): MockPerformanceHistoryItem => {
  // Return the original mock data with isMock flag preserved
  return {
    "id": 17,
    "battery_system_id": 1,
    "smiles": "CCCOCC",
    "temperature_25_CE_prob": "0.9999219179153442",
    "temperature_25_CE_label": "1",
    "temperature_25_CL_prob": "0.9999972581863403",
    "temperature_25_CL_label": "1",
    "temperature_25_CR_prob": "0.9689266085624695",
    "temperature_25_CR_label": "1",
    "temperature_45_CE_prob": "0.9999366998672485",
    "temperature_45_CE_label": "1",
    "temperature_45_CL_prob": "0.9999998807907104",
    "temperature_45_CL_label": "1",
    "model_result": "{\"smiles\": \"CCCOCC\", \"ratio\": 1.9, \"ce_cl_result\": {\"temperature_25_CE_label\": 1, \"temperature_25_CE_prob\": 0.9999219179153442, \"temperature_25_CL_label\": 1, \"temperature_25_CL_prob\": 0.9999972581863403, \"temperature_45_CE_label\": 1, \"temperature_45_CE_prob\": 0.9999366998672485, \"temperature_45_CL_label\": 1, \"temperature_45_CL_prob\": 0.9999998807907104, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165CCCOCC\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife. \\n    \\u572845\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165CCCOCC\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife.\"}, \"cr_result\": {\"temperature_25_CR_label\": 1, \"temperature_25_CR_prob\": 0.9689266085624695, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165CCCOCC\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CR\"}, \"is_filter\": -1, \"filter_explain\": \"\", \"mu_explain\": \"\"}",
    "llm_analysis_result": "Assessment\n\n- 25°C (CE/CycleLife/CR): The reported decreases are reasonable because introducing a small linear ether (SMILES: CCCOCC) into a conventional 1 M-class carbonate electrolyte (EC/EMC/DEC with LiPF6) is not oxidatively stable above ~4 V, which promotes parasitic oxidation and a resistive CEI on high-voltage cathodes; additionally, such additives can perturb EC-driven SEI on graphite and raise interfacial impedance, collectively lowering coulombic efficiency, accelerating capacity fade, and hurting rate capability (CR) [3,2].\n\n- 45°C (CE/CycleLife): Continued declines are also reasonable since ether co-solvents are unstable at high cathode potentials in dilute electrolytes, causing ongoing parasitic reactions that shorten cycle life and reduce CE [3].\n\n- Recommendation: Not recommended to use this ether additive (1.9 wt%) with ethylene carbonate (EC), ethyl methyl carbonate (EMC), diethyl carbonate (DEC), lithium hexafluorophosphate (LiPF6), lithium bis(fluorosulfonyl)imide (LiFSI), vinylene carbonate (VC), and lithium difluorophosphate (LiDFP); if further improvement is needed, consider proven additive packages such as lithium difluoro(oxalato)borate (LiDFOB) + LiFSI with film-formers like fluoroethylene carbonate (FEC) or dithio- and sultone-type blends, or use ethers only within localized high-concentration electrolyte designs (e.g., LiFSI in dimethyl carbonate (DMC) with a fluorinated diluent such as bis(2,2,2-trifluoroethyl) ether (BTFE)) that enable oxidative stability [1,3].\n\nReferences\n\n[1] Fuqiang An, Hongliang Zhao, Weinan Zhou, Yonghong Ma, Ping Li. S-containing and Si-containing compounds as highly effective electrolyte additives for SiOx -based anodes/NCM 811 cathodes in lithium ion cells. Scientific Reports, 2019. [DOI:10.1038/s41598-019-49568-1](https://doi.org/10.1038/s41598-019-49568-1).\n\n[2] Tan, S., Shadike, Z., Cai, X., Lin, R., Kludze, A., Borodin, O., Lucht, B.L., Wang, C., Hu, E., Xu, K., Yang, X.-Q. Review on Low-Temperature Electrolytes for Lithium-Ion and Lithium Metal Batteries. Electrochemical Energy Reviews, 2023. [DOI:10.1007/s41918-023-00199-1](https://doi.org/10.1007/s41918-023-00199-1).\n\n[3] Cao, X., Jia, H., Xu, W., Zhang, J.-G. Review—Localized High-Concentration Electrolytes for Lithium Batteries. Journal of The Electrochemical Society, 2021. [DOI:10.1149/1945-7111/abd60e](https://doi.org/10.1149/1945-7111/abd60e).",
    "created_at": "2025-09-10T08:33:31.225767",
    "updated_at": "2025-09-10T08:37:32.446647"
};
};