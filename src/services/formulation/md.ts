import request from '@/services/request';
import { urlConfig } from '@/services/config/urlConfig';
import { getFormulationMDEndpoint } from './endpoints';

export interface MDRunParams {
  solvent_smiles_list: string[];
  solvent_fractions_type: "weight" | "mole";
  solvent_fractions: number[];
  anion_name_list: string[];
  anion_fractions: number[];
  anion_fractions_type: "mole";
  cation_name: string;
  num_cations: number;
  cation_molality: number;
  simulation_box_size: number;
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
  const env = urlConfig.getEnvironment();
  const endpoint = getFormulationMDEndpoint(env, 'run');
  const url = urlConfig.buildFullURL(endpoint);
  return request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

// MD历史记录相关接口
export async function getMDHistoryList(params?: any) {
  const env = urlConfig.getEnvironment();
  const endpoint = getFormulationMDEndpoint(env, 'historyList');
  const url = urlConfig.buildFullURL(endpoint);
  return request(url, {
    method: 'GET',
    params,
  });
}

export async function getMDHistoryDetail(id: number) {
  const env = urlConfig.getEnvironment();
  const endpoint = getFormulationMDEndpoint(env, 'historyDetail');
  const url = urlConfig.buildFullURL(endpoint);
  return request(`${url}?id=${id}`, {
    method: 'GET',
  });
}

export async function deleteMDHistory(id: number) {
  const env = urlConfig.getEnvironment();
  const endpoint = getFormulationMDEndpoint(env, 'historyDelete');
  const url = urlConfig.buildFullURL(endpoint);
  return request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { id },
  });
}