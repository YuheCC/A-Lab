import request from '@/services/request';

export interface MDRunParams {
  solvent_smiles_list: string[];
  solvent_fractions_type: "weight" | "mole";
  solvent_fractions: number[];
  anion_name_list: string[];
  anion_fractions: number[];
  anion_fractions_type: "weight" | "mole";
  cation_name: string;
  num_cations: number;
  cation_molality: number;
  simulation_box_size: number;
  temperature?: number;
}

export interface MDRunResponse {
  solvent_smiles_list: string[];
  solvent_fractions: number[];
  solvent_fractions_type: string;
  simulation_box_size: number;
  status: string;
  result_data: any;
  created_at: string;
  updated_at: string;
}

// MD历史记录接口类型定义
export interface MDHistoryItem {
  id: number;
  cation_name: string;
  num_cations: number;
  cation_molality: number;
  anion_name_list: string[];
  anion_fractions: number[];
  anion_fractions_type: string;
  solvent_smiles_list: string[];
  solvent_fractions: number[];
  solvent_fractions_type: string;
  simulation_box_size: number;
  status: string;
  result_data: any;
  created_at: string;
  updated_at: string;
}

export interface MDHistoryResponse {
  total: number;
  data: MDHistoryItem[];
}

export interface MDHistoryDetailResponse {
  id: number;
  cation_name: string;
  num_cations: number;
  cation_molality: number;
  anion_name_list: string[];
  anion_fractions: number[];
  anion_fractions_type: string;
  solvent_smiles_list: string[];
  solvent_fractions: number[];
  solvent_fractions_type: string;
  simulation_box_size: number;
  status: string;
  result_data: any;
  created_at: string;
  updated_at: string;
}

export async function runMDSimulation(params: MDRunParams) {
  return request('/api/formulate/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

// MD历史记录相关接口
export async function getMDHistoryList(params?: any) {
  return request('/api/formulate/history/list', {
    method: 'GET',
    params,
  });
}

export async function getMDHistoryDetail(id: number) {
  return request(`/api/formulate/history/detail?id=${id}`, {
    method: 'GET',
  });
}

export async function deleteMDHistory(id: number) {
  return request('/api/formulate/history/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { id },
  });
}