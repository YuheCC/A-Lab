import type { Environment } from '../config/types';

/**
 * Molecule Service Endpoint Configuration
 */

// HTTP API endpoints
export const MOLECULE_ENDPOINTS = {
  // Default configuration
  default: {
    moleculeDetails: '/api/search/molecule_details',
    similarMolecules: '/api/llm/molecule/similar',
  },
  box: {
    moleculeDetails: '/api/search/molecule_details',
    similarMolecules: '/api/llm/molecule/similar',
  },
  // Environment-specific overrides (if needed)
  // staging: {
  //   moleculeDetails: '/api/v2/molecule_details',
  // },
};

/**
 * Get Molecule endpoint
 *
 * @param env - Current environment
 * @param endpoint - Endpoint key
 * @returns API path
 */
export function getMoleculeEndpoint(
  env: Environment,
  endpoint: keyof typeof MOLECULE_ENDPOINTS.default
): string {
  const envConfig = MOLECULE_ENDPOINTS[env as keyof typeof MOLECULE_ENDPOINTS] || {};
  const defaultConfig = MOLECULE_ENDPOINTS.default;

  return (envConfig as any)[endpoint] || defaultConfig[endpoint];
}
