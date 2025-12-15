import type { EndpointConfig } from '../config/types';
import type { Environment } from '../config/types';

export const FORMULATION_MD_ENDPOINTS: EndpointConfig<Record<string, string>> = {
  default: {
    run: '/api/md/run',
    historyList: '/api/md/history/list',
    historyDetail: '/api/md/history/detail',
    historyDelete: '/api/md/history/delete',
  },
  box: {
    run: '/api/formulate/run',
    historyList: '/api/formulate/history/list',
    historyDetail: '/api/formulate/history/detail',
    historyDelete: '/api/formulate/history/delete',
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
