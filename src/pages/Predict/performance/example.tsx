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
    battery_system_id: 1,
    created_at: "2025-10-09T03:40:53.354875",
    id: 354,
    model_result: "{\"smiles\": \"O=C1OC(F)CO1\", \"ratio\": 1.9, \"ce_cl_result\": {\"temperature_25_CE_label\": 0, \"temperature_25_CE_prob\": 0.0040884679183363914, \"temperature_25_CL_label\": 0, \"temperature_25_CL_prob\": 0.0026209773495793343, \"temperature_45_CE_label\": 0, \"temperature_45_CE_prob\": 0.17683938145637512, \"temperature_45_CL_label\": 0, \"temperature_45_CL_prob\": 0.09403320401906967, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife. \\n    \\u572845\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife.\"}, \"cr_result\": {\"temperature_25_CR_label\": 1, \"temperature_25_CR_prob\": 0.708771824836731, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CR\"}, \"is_filter\": -1, \"filter_explain\": \"\", \"mu_explain\": \"\"}",
    smiles: "O=C1OC(F)CO1",
    temperature_25_CE_label: "0",
    temperature_25_CE_prob: "0.0040884679183363914",
    temperature_25_CL_label: "0",
    temperature_25_CL_prob: "0.0026209773495793343",
    temperature_25_CR_label: "1",
    temperature_25_CR_prob: "0.708771824836731",
    temperature_45_CE_label: "0",
    temperature_45_CE_prob: "0.17683938145637512",
    temperature_45_CL_label: "0",
    temperature_45_CL_prob: "0.09403320401906967",
    updated_at: "2025-10-09T03:43:45.693185",
    llm_analysis_result: `### Key Benefits
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
- Consider combining with VC for synergistic effects`
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
    "id": 354,
    "battery_system_id": 1,
    "smiles": "O=C1OC(F)CO1",
    "temperature_25_CE_prob": "0.0040884679183363914",
    "temperature_25_CE_label": "0",
    "temperature_25_CL_prob": "0.0026209773495793343",
    "temperature_25_CL_label": "0",
    "temperature_25_CR_prob": "0.708771824836731",
    "temperature_25_CR_label": "1",
    "temperature_45_CE_prob": "0.17683938145637512",
    "temperature_45_CE_label": "0",
    "temperature_45_CL_prob": "0.09403320401906967",
    "temperature_45_CL_label": "0",
    "model_result": "{\"smiles\": \"O=C1OC(F)CO1\", \"ratio\": 1.9, \"ce_cl_result\": {\"temperature_25_CE_label\": 0, \"temperature_25_CE_prob\": 0.0040884679183363914, \"temperature_25_CL_label\": 0, \"temperature_25_CL_prob\": 0.0026209773495793343, \"temperature_45_CE_label\": 0, \"temperature_45_CE_prob\": 0.17683938145637512, \"temperature_45_CL_label\": 0, \"temperature_45_CL_prob\": 0.09403320401906967, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife. \\n    \\u572845\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife.\"}, \"cr_result\": {\"temperature_25_CR_label\": 1, \"temperature_25_CR_prob\": 0.708771824836731, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CR\"}, \"is_filter\": -1, \"filter_explain\": \"\", \"mu_explain\": \"\"}",
    "llm_analysis_result": "Additive identity: fluoroethylene carbonate (FEC, SMILES `O=C1OC(F)CO1`).\n\n1) 25°C (room temperature)\n- CE: Increase is reasonable. Film-forming additives and blended systems (e.g., adding FEC on top of VC/LiDFP) are known to stabilize the anode interphase and reduce parasitic reactions; LiFSI and LiDFP further aid interphase stability and kinetics, so CE gains are expected at ~2 wt% film-former levels [1,2].  \n- CycleLife: Increase is reasonable for the same reasons (more stable SEI/CEI from FEC/VC/LiDFP and additive synergy), which is consistent with prior reports using ~2 wt% FEC in blended-additive electrolytes [1,2].  \n- CR (rate capability): Decrease is reasonable. Film-formers like VC can elevate SEI charge-transfer resistance at room temperature; adding another strong film-former (FEC) can further thicken/impede the interphase, penalizing rate performance at 25°C [2,3].\n\n2) 45°C (elevated temperature)\n- CE: Increase is reasonable. VC-containing systems improve high-temperature stability, and phosphate/fluorophosphate chemistry (LiDFP) strengthens the interphase against parasitic reactions at elevated T; adding FEC is consistent with further passivation and higher CE at 45°C [2,3].  \n- CycleLife: Increase is reasonable for the same high-temperature stabilization mechanisms and known benefits of blended additives in Ni-rich/Si-containing systems [1,3].\n\n3) Recommendation\n- Recommend conditional use. At 1.9 wt% (a typical effective loading), this additive is suitable when longevity and efficiency are prioritized; however, if 25°C rate performance is critical, consider dialing back total film-former content (FEC and/or VC) to mitigate the impedance-driven CR penalty while retaining much of the CE/cycle-life benefit [1,3].\n\nReferences\n\n[1] Fuqiang An, Hongliang Zhao, Weinan Zhou, Yonghong Ma, Ping Li. S-containing and Si-containing compounds as highly effective electrolyte additives for SiOx -based anodes/NCM 811 cathodes in lithium ion cells. Scientific Reports, 9:14108, 2019. [DOI:10.1038/s41598-019-49568-1](https://doi.org/10.1038/s41598-019-49568-1)\n\n[2] Sha Tan, Zulipiya Shadike, Xinyin Cai, Ruoqian Lin, Atsu Kludze, Oleg Borodin, Brett L. Lucht, Chunsheng Wang, Enyuan Hu, Kang Xu, Xiao-Qing Yang. Review on Low-Temperature Electrolytes for Lithium-Ion and Lithium Metal Batteries. Electrochemical Energy Reviews, 2023. [DOI:10.1007/s41918-023-00199-1](https://doi.org/10.1007/s41918-023-00199-1)\n\n[3] Ling‐Fei Zhao, Zhe Hu, Wei‐Hong Lai, Ying Tao, Jian Peng, Zong‐Cheng Miao, Yun‐Xiao Wang, Shu‐Lei Chou, Hua‐Kun Liu, Shi‐Xue Dou. Hard Carbon Anodes: Fundamental Understanding and Commercial Perspectives for Na‐Ion Batteries beyond Li‐Ion and K‐Ion Counterparts. Advanced Energy Materials, 2020. [DOI:10.1002/aenm.202002704](https://doi.org/10.1002/aenm.202002704)",
    "created_at": "2025-10-09T03:40:53.354875",
    "updated_at": "2025-10-09T03:43:45.693185"
};
};