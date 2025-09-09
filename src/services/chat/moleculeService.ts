export type MoleculeProperties = {
  smiles?: string;
  molecularWeight?: string | number;
  meltingPoint?: string;
  boilingPoint?: string;
  flashPoint?: string;
  combustionEnthalpy?: string;
  homo?: string | number;
  lumo?: string | number;
  espMax?: string | number;
  espMin?: string | number;
  commercialViability?: string;
  umapX?: number;
  umapY?: number;
  functionalGroups?: string;
  commercialLink?: string;
  commercialScore?: number;
};

export interface MoleculeDetails {
  name: string;
  properties: MoleculeProperties;
}

export interface APIMoleculeDetail {
  SMILES: string;
  UMAP_0: number;
  UMAP_1: number;
  HOMO_eV: number;
  LUMO_eV: number;
  ESP_max_eV: number;
  ESP_min_eV: number;
  molecular_weight: number;
  functional_groups: string;
  COMMERCIAL_LINK?: string;
  COMMERCIAL_SCORE?: number;
}

export interface APIResponse {
  found: boolean;
  molecule_details: APIMoleculeDetail[];
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

  private mapAPIResponseToMoleculeDetails(apiData: APIMoleculeDetail, name: string): MoleculeDetails {
    return {
      name,
      properties: {
        smiles: apiData.SMILES,
        molecularWeight: apiData.molecular_weight,
        homo: apiData.HOMO_eV,
        lumo: apiData.LUMO_eV,
        espMax: apiData.ESP_max_eV,
        espMin: apiData.ESP_min_eV,
        umapX: apiData.UMAP_0,
        umapY: apiData.UMAP_1,
        functionalGroups: apiData.functional_groups,
        commercialLink: apiData.COMMERCIAL_LINK,
        commercialScore: apiData.COMMERCIAL_SCORE,
        commercialViability: this.getCommercialViabilityText(apiData.COMMERCIAL_SCORE),
        // Keep existing fields as fallback
        meltingPoint: '-',
        boilingPoint: '-',
        flashPoint: '-',
        combustionEnthalpy: '-'
      }
    };
  }

  private getCommercialViabilityText(score?: number): string {
    if (!score) return 'Unknown';
    if (score >= 8) return 'Highly commercially available';
    if (score >= 5) return 'Commercially available';
    if (score >= 3) return 'Limited commercial availability';
    return 'Research compound only';
  }

  async getMoleculeDetails(name: string): Promise<MoleculeDetails> {
    try {
      const { default: request } = await import('@/services/request');
      const resp = await request('/api/molecule_details', {
        method: 'GET',
        params: { molecule: name },
      });
      
      if ((resp as any).ok === false || resp.status >= 400) {
        throw new Error(`HTTP ${resp.status}`);
      }
      
      const apiResponse = resp.data as APIResponse;
      
      // 检查是否找到分子数据
      if (!apiResponse.found || !apiResponse.molecule_details || apiResponse.molecule_details.length === 0) {
        throw new Error('Molecule not found');
      }
      
      // 使用第一个结果
      const moleculeData = apiResponse.molecule_details[0];
      return this.mapAPIResponseToMoleculeDetails(moleculeData, name);
      
    } catch (err) {
      // mock fallback - 使用与实际API结构相似的mock数据
      return {
        name,
        properties: {
          smiles: 'F[P-](F)(F)(F)(F)F.[Li+]',
          molecularWeight: 151.91,
          meltingPoint: '-',
          boilingPoint: '-',
          flashPoint: '-',
          combustionEnthalpy: '-',
          homo: -10.2,
          lumo: -2.1,
          espMax: 1.8,
          espMin: -3.2,
          umapX: 0,
          umapY: 0,
          functionalGroups: '["Salt"]',
          commercialViability: 'Commercially available',
          commercialScore: 3
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

}

export const moleculeService = MoleculeService.getInstance();


