import type { EndpointConfig } from '../config/types';
import type { Environment } from '../config/types';

export const FORMULATION_MD_ENDPOINTS: EndpointConfig<Record<string, string>> = {
  default: {
    run: '/api/formulate/run',
    historyList: '/api/formulate/history/list',
    historyDetail: '/api/formulate/history/detail',
    historyDelete: '/api/formulate/history/delete',
    rerun: '/api/formulate/rerun',
  },
  us: {
    run: '/api/formulate/run',
    historyList: '/api/formulate/history/list',
    historyDetail: '/api/formulate/history/detail',
    historyDelete: '/api/formulate/history/delete',
    rerun: '/api/formulate/rerun',
  },
  box: {
    run: '/api/formulate/run',
    historyList: '/api/formulate/history/list',
    historyDetail: '/api/formulate/history/detail',
    historyDelete: '/api/formulate/history/delete',
    rerun: '/api/formulate/rerun',
  },
};

export const getFormulationMDEndpoint = (
  env: Environment,
  key: keyof typeof FORMULATION_MD_ENDPOINTS.default,
) => {
  const envConfig = FORMULATION_MD_ENDPOINTS[env as keyof typeof FORMULATION_MD_ENDPOINTS] || {};
  const defaultConfig = FORMULATION_MD_ENDPOINTS.default;
  return (envConfig as any)[key] || defaultConfig[key];
};
