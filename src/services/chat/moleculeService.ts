export type MoleculeProperties = {
  smiles?: string;
  molecularWeight?: string;
  meltingPoint?: string;
  boilingPoint?: string;
  flashPoint?: string;
  combustionEnthalpy?: string;
  homo?: string;
  lumo?: string;
  espMax?: string;
  espMin?: string;
  commercialViability?: string;
};

export interface MoleculeDetails {
  name: string;
  properties: MoleculeProperties;
}

export interface SimilarMolecule {
  name: string;
  properties: MoleculeProperties;
}

class MoleculeService {
  private static instance: MoleculeService;
  private baseUrl: string;

  private constructor() {
    // Use global BASE_URL via util helper to satisfy TS
    const { getAPIUrl } = require('@/utils');
    this.baseUrl = getAPIUrl() || '/api';
  }

  public static getInstance(): MoleculeService {
    if (!MoleculeService.instance) {
      MoleculeService.instance = new MoleculeService();
    }
    return MoleculeService.instance;
  }

  async getMoleculeDetails(name: string): Promise<MoleculeDetails> {
    try {
      const { default: request } = await import('@/services/request');
      const resp = await request('/molecule/details', {
        method: 'GET',
        params: { name },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP ${resp.status}`);
      return resp.data as MoleculeDetails;
    } catch (err) {
      // mock fallback
      return {
        name,
        properties: {
          smiles: 'F[P-](F)(F)(F)(F)F.[Li+]',
          molecularWeight: '151.91 g/mol',
          meltingPoint: '-',
          boilingPoint: '-',
          flashPoint: '-',
          combustionEnthalpy: '-12.34 eV',
          homo: '-10.2 eV',
          lumo: '-2.1 eV',
          espMax: '1.8 eV',
          espMin: '-3.2 eV',
          commercialViability: 'Commercially available'
        }
      };
    }
  }

  async getSimilarMolecules(name: string, type: string = 'all'): Promise<SimilarMolecule[]> {
    try {
      const { default: request } = await import('@/services/request');
      const resp = await request('/molecule/similar', {
        method: 'GET',
        params: { name, type },
      });
      if ((resp as any).ok === false || resp.status >= 400) throw new Error(`HTTP ${resp.status}`);
      return (resp.data?.items || []) as SimilarMolecule[];
    } catch (err) {
      // mock fallback (same content as original hardcoded list)
      return [
        {
          name: 'Similar 1',
          properties: {
            smiles: 'CCO',
            molecularWeight: '150.0 g/mol',
            meltingPoint: '25°C',
            boilingPoint: '150°C',
            flashPoint: '45°C',
            combustionEnthalpy: '-65.0 eV',
            homo: '-7.0 eV',
            lumo: '0.5 eV',
            espMax: '0.8 eV',
            espMin: '-1.5 eV',
            commercialViability: 'Commercially available'
          }
        },
        {
          name: 'Similar 2',
          properties: {
            smiles: 'CCCO',
            molecularWeight: '160.0 g/mol',
            meltingPoint: '30°C',
            boilingPoint: '160°C',
            flashPoint: '50°C',
            combustionEnthalpy: '-68.0 eV',
            homo: '-7.2 eV',
            lumo: '0.4 eV',
            espMax: '0.7 eV',
            espMin: '-1.6 eV',
            commercialViability: 'Commercially available'
          }
        },
        {
          name: 'Similar 3',
          properties: {
            smiles: 'CCCCO',
            molecularWeight: '170.0 g/mol',
            meltingPoint: '35°C',
            boilingPoint: '170°C',
            flashPoint: '55°C',
            combustionEnthalpy: '-71.0 eV',
            homo: '-7.4 eV',
            lumo: '0.3 eV',
            espMax: '0.6 eV',
            espMin: '-1.7 eV',
            commercialViability: 'Limited commercial availability'
          }
        },
        {
          name: 'Similar 4',
          properties: {
            smiles: 'CCCCCO',
            molecularWeight: '180.0 g/mol',
            meltingPoint: '40°C',
            boilingPoint: '180°C',
            flashPoint: '60°C',
            combustionEnthalpy: '-74.0 eV',
            homo: '-7.6 eV',
            lumo: '0.2 eV',
            espMax: '0.5 eV',
            espMin: '-1.8 eV',
            commercialViability: 'Limited commercial availability'
          }
        },
        {
          name: 'Similar 5',
          properties: {
            smiles: 'CCCCCCO',
            molecularWeight: '190.0 g/mol',
            meltingPoint: '45°C',
            boilingPoint: '190°C',
            flashPoint: '65°C',
            combustionEnthalpy: '-77.0 eV',
            homo: '-7.8 eV',
            lumo: '0.1 eV',
            espMax: '0.4 eV',
            espMin: '-1.9 eV',
            commercialViability: 'Limited commercial availability'
          }
        }
      ];
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export const moleculeService = MoleculeService.getInstance();


