import { MDHistoryItem } from '@/services/formulation/md';

export const mockListData: MDHistoryItem[] = [
  {
    id: 'example' as any,
    cation_name: "Li+",
    num_cations: 50,
    cation_molality: 1.0,
    anion_name_list: ["PF6-"],
    anion_fractions: [1.0],
    anion_fractions_type: "mole",
    solvent_smiles_list: ["C1COC(=O)O1", "CCOC(=O)OC"],
    solvent_fractions: [0.7, 0.3],
    solvent_fractions_type: "weight",
    simulation_box_size: 40,
    status: "success",
    result_data: {
      density: 1.23,
      viscosity: 2.5,
      conductivity: 8.7,
      diffusion_coefficient: {
        "Li+": 1.2e-6,
        "PF6-": 0.8e-6
      },
      radial_distribution_functions: {
        "Li-O": [/* RDF data */],
        "Li-F": [/* RDF data */]
      }
    },
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T12:45:00Z"
  },
];