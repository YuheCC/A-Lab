import { extractIsPublished } from '@/utils/publicationStatus';

export type MoleculeProperties = {
  smiles?: string;
  cation?: string;
  casrn?: string;
  molecularWeight?: string | number;
  meltingPoint?: string;
  boilingPoint?: string;
  flashPoint?: string;
  combustionEnthalpy?: string;
  molecularVolume?: string | number;
  fluorineBondDissociationEnergy?: string | number;
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
  isPublished?: boolean;
};

export interface MoleculeDetails {
  name: string;
  properties: MoleculeProperties;
}

export interface APIMoleculeDetail {
  SMILES: string;
  cation?: string;
  CASRN?: string;
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
  grade?: number;
  reasoning?: string;
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
    const isPublished = extractIsPublished(apiData);
    return {
      name,
      properties: {
        smiles: apiData.SMILES,
        cation: apiData.cation,
        casrn: apiData.CASRN,
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
        isPublished,
        // Keep existing fields as fallback
        meltingPoint: '-',
        boilingPoint: '-',
        flashPoint: '-',
        combustionEnthalpy: '-'
      }
    };
  }

  // 新的映射方法，处理 molecular_details 接口返回的数据格式
  private mapMoleculeDetailsToMoleculeDetails(raw: any, originalName: string): MoleculeDetails {
    const smiles = raw?.SMILES || raw?.smiles || '';
    const cation = raw?.cation ?? raw?.CATION;
    const casrn = raw?.CASRN ?? raw?.casrn ?? raw?.cas;
    const molecularWeight = raw?.molecular_weight != null ? raw.molecular_weight : raw?.molecularWeight;
    const predictedMp = raw?.predicted_MP_celsius ?? raw?.predicted_mp_celsius ?? raw?.predicted_MP ?? raw?.predictedMp;
    const predictedBp = raw?.predicted_BP_celsius ?? raw?.predicted_bp_celsius ?? raw?.predicted_BP ?? raw?.predictedBp;
    const predictedFp = raw?.PREDICTED_FP_CELSIUS ?? raw?.predicted_FP_celsius ?? raw?.predicted_fp_celsius ?? raw?.predictedFp;
    const combustionEnthalpy = raw?.COMBUSTION_ENTHALPY_EV ?? raw?.combustion_enthalpy_ev ?? raw?.combustionEnthalpy;
    const vdwVolume = raw?.vdw_volume_angstroms3 ?? raw?.VDW_VOLUME_ANGSTROMS3 ?? raw?.vdwVolumeAngstroms3;
    const fluorideBde = raw?.fluoride_bde_ev ?? raw?.FLUORIDE_BDE_EV ?? raw?.fluorideBdeEv;
    const homo = raw?.HOMO_eV ?? raw?.HOMO ?? raw?.homo;
    const lumo = raw?.LUMO_eV ?? raw?.LUMO ?? raw?.lumo;
    const espMax = raw?.ESP_max_eV ?? raw?.ESP_MAX ?? raw?.espMax;
    const espMin = raw?.ESP_min_eV ?? raw?.ESP_MIN ?? raw?.espMin;
    const commercialScore = raw?.commercial_score ?? raw?.COMMERCIAL_SCORE;
    const functionalGroups = raw?.functional_groups ?? raw?.FUNCTIONAL_GROUPS;
    const umapX = raw?.umap_x ?? raw?.x;
    const umapY = raw?.umap_y ?? raw?.y;
    const isPublished = extractIsPublished(raw);

    return {
      name: originalName,
      properties: {
        smiles,
        cation,
        casrn,
        molecularWeight: molecularWeight != null ? Number(molecularWeight) : undefined,
        meltingPoint: predictedMp != null ? `${predictedMp}` : '-',
        boilingPoint: predictedBp != null ? `${predictedBp}` : '-',
        flashPoint: predictedFp != null ? `${predictedFp}` : '-',
        combustionEnthalpy: combustionEnthalpy != null ? `${combustionEnthalpy}` : '-',
        molecularVolume: vdwVolume != null ? `${vdwVolume}` : undefined,
        fluorineBondDissociationEnergy: fluorideBde != null ? `${fluorideBde}` : undefined,
        homo: homo != null ? Number(homo) : undefined,
        lumo: lumo != null ? Number(lumo) : undefined,
        espMax: espMax != null ? Number(espMax) : undefined,
        espMin: espMin != null ? Number(espMin) : undefined,
        umapX: umapX != null ? Number(umapX) : 0,
        umapY: umapY != null ? Number(umapY) : 0,
        functionalGroups: typeof functionalGroups === 'string' ? functionalGroups : JSON.stringify(functionalGroups || []),
        commercialViability: this.getCommercialViabilityText(commercialScore),
        commercialScore: commercialScore != null ? Number(commercialScore) : undefined,
        isPublished,
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

  async getMoleculeDetails(name: string, userPermissions?: string): Promise<MoleculeDetails> {
    try {
      const { authFetch } = await import('@/utils');
      
      // 使用 molecular_details 接口，参考 MoleculeModal 的实现
      const isHighTier = ['admin', 'enterprise', 'joint'].includes(userPermissions || '');
      let queryUrl = `${this.baseUrl}/api/molecule_details?query_type=smiles&molecule=${encodeURIComponent(name.trim())}`;
      if (isHighTier) {
        queryUrl += '&use_35m=true';
      }
      
      const resp = await authFetch(queryUrl, { method: 'GET' });
      const data = await resp.json();
      console.log(data);
      // 检查响应状态和错误信息
      if (!resp.ok || data.error_type) {
        // 根据错误内容判断是否为不合法的 SMILES
        if (data?.message && typeof data.message === 'string') {
          const errorMsg = data.message.toLowerCase();
          console.log(errorMsg);
          if (errorMsg.includes('invalid')) {
            throw new Error('Invalid SMILES string');
          }
        }
        throw new Error(data?.detail || data?.message || `HTTP ${resp.status}`);
      }
      
      // 检查 found 字段和 molecule_details 数组
      if (data.found === false || !Array.isArray(data.molecule_details) || data.molecule_details.length === 0) {
        throw new Error('Molecule not found');
      }
      
      // 使用第一个结果，参考 MoleculeModal 的 mapDetailsToProperties 方法
      const moleculeData = data.molecule_details[0];
      return this.mapMoleculeDetailsToMoleculeDetails(moleculeData, name);
      
    } catch (err) {
      // 如果是无效的 SMILES 错误，直接抛出而不使用 mock 数据
      if (err instanceof Error && err.message === 'Invalid SMILES string') {
        throw err;
      }
      
      // 其他错误使用 mock fallback - 使用与实际API结构相似的mock数据
      throw err;
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
