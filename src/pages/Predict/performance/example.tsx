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
    isMock: true,
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
    temperature_25_label_0_count: 2,
    temperature_45_label_0_count: 2,
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
    "id": 535,
    "battery_system_id": 1,
    "smiles": "O=C1OC(F)CO1",
    "temperature_25_CE_prob": null,
    "temperature_25_CE_label": null,
    "temperature_25_CL_prob": null,
    "temperature_25_CL_label": null,
    "temperature_25_CR_prob": null,
    "temperature_25_CR_label": null,
    "temperature_45_CE_prob": null,
    "temperature_45_CE_label": null,
    "temperature_45_CL_prob": null,
    "temperature_45_CL_label": null,
    "model_result": "{\"smiles\": \"O=C1OC(F)CO1\", \"ratio\": 1.9, \"ce_cl_result\": {\"temperature_25_CE_label\": 0, \"temperature_25_CE_prob\": 0.0040884679183363914, \"temperature_25_CL_label\": 0, \"temperature_25_CL_prob\": 0.0026209773495793343, \"temperature_45_CE_label\": 0, \"temperature_45_CE_prob\": 0.17683938145637512, \"temperature_45_CL_label\": 0, \"temperature_45_CL_prob\": 0.09403320401906967, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife. \\n    \\u572845\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CE\\uff0c\\u63d0\\u5347\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CycleLife.\"}, \"cr_result\": {\"temperature_25_CR_label\": 1, \"temperature_25_CR_prob\": 0.708771824836731, \"conclusion\": \"25\\u2103\\u4e0b\\uff0c\\u7528\\u6237\\u52a0\\u5165O=C1OC(F)CO1\\u4f5c\\u4e3a\\u6dfb\\u52a0\\u5242\\uff0c\\u964d\\u4f4e\\u57fa\\u51c6\\u7535\\u89e3\\u6db2\\u7684CR\"}, \"quantification_result\": {\"cr\": 0.53, \"pred_cl_25\": 49.72, \"pred_cl_45\": 2.82, \"smiles_hash_digest\": \"924038e82f90d642772066c100db13bc\"}, \"is_filter\": -1, \"filter_explain\": \"\", \"mu_explain\": \"\"}",
    "llm_analysis_result": "Additive: fluoroethylene carbonate (FEC, `O=C1OC(F)CO1`) at 1.9 wt% in EC/EMC/DEC with LiPF6 + LiFSI and VC + LiDFP.\n\n1) 25°C (room temperature)\n- CE: Increase is reasonable because FEC is a well-known film-forming additive that stabilizes the anode interphase and improves reversibility in blended-additive systems, and FEC-based electrolytes have delivered high cycling CE in literature [1,3,4].\n- CycleLife: Increase is reasonable; blended additive strategies including FEC commonly enhance long-term stability for Ni-rich cathodes and SiOx/graphite anodes, and FEC-rich systems have shown improved cycling vs. conventional EC-based electrolytes [1,3,4].\n- CR (rate capability): A decrease is plausible at room temperature because VC can raise charge-transfer resistance at RT, and adding FEC on top of VC typically does not reduce that impedance, leading to some rate penalty [2,4].\n\n2) 45°C (high temperature)\n- CE: Increase is reasonable since VC is particularly beneficial at elevated temperature, forming more stable, protective interphases, and FEC-based formulations also support stable cycling, collectively boosting reversibility [2,1,3].\n- CycleLife: Increase is reasonable; VC enhances high-temperature cycling stability and blended-additive approaches (including FEC) are known to improve overall durability at elevated temperatures [2,1,3].\n\n3) Recommendation\n- The reported trends (25°C: CE↑/CycleLife↑/CR↓; 45°C: CE↑/CycleLife↑) are consistent with known behaviors of FEC and VC in blended-additive EC-based electrolytes, and the 1.9 wt% dose is close to commonly effective ~2 wt% levels [1,2,3,4].\n- Recommended to use if priority is CE and cycle life; expect a modest 25°C rate-capability trade-off, which can be tuned by optimizing FEC loading near the ~1–2 wt% range and balancing with the existing VC/LiDFP system [1,2,4].\n\nReferences\n\n[1] Fuqiang An, Hongliang Zhao, Weinan Zhou, Yonghong Ma, Ping Li. S-containing and Si-containing compounds as highly effective electrolyte additives for SiOx -based anodes/NCM 811 cathodes in lithium ion cells. Scientific Reports, 9:14108, 2019. [DOI:10.1038/s41598-019-49568-1](https://doi.org/10.1038/s41598-019-49568-1).\n\n[2] Zhao, L.-F., Hu, Z., Lai, W.-H., et al. Hard Carbon Anodes: Fundamental Understanding and Commercial Perspectives for Na-Ion Batteries beyond Li-Ion and K-Ion Counterparts. Advanced Energy Materials, 2020. [DOI:10.1002/aenm.202002704](https://doi.org/10.1002/aenm.202002704).\n\n[3] Deng, T., Fan, X., Cao, L., et al. Designing In-Situ-Formed Interphases Enables Highly Reversible Cobalt-Free LiNiO2 Cathode for Li-ion and Li-metal Batteries. Joule, 3, 2550–2564, 2019. [DOI:10.1016/j.joule.2019.08.004](https://doi.org/10.1016/j.joule.2019.08.004).\n\n[4] SES AI. Internally validated knowledge by SES professional scientists.",
    "created_at": "2025-10-15T08:38:45.626789",
    "updated_at": "2025-10-15T08:44:00.233482",
    "temperature_25_label_0_count": 2,
    "temperature_45_label_0_count": 2,
    "isMock": true
};
};