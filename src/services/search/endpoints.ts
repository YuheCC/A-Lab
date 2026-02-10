import type { Environment } from '../config/types';

/**
 * Search Service Endpoint Configuration
 */

// HTTP API endpoints
export const SEARCH_ENDPOINTS = {
  // Default configuration
  default: {
    thirdSearch: '/api/search/sse/search',
  },
  us: {
    thirdSearch: '/api/search/sse/search',
  },
  box: {
    thirdSearch: '/api/search/sse/search',
  },
  // Environment-specific overrides (if needed)
  // staging: {
  //   thirdSearch: '/api/v2/sse/search',
  // },
};

/**
 * Get Search endpoint
 *
 * @param env - Current environment
 * @param endpoint - Endpoint key
 * @returns API path
 */
export function getSearchEndpoint(
  env: Environment,
  endpoint: keyof typeof SEARCH_ENDPOINTS.default
): string {
  const envConfig = SEARCH_ENDPOINTS[env as keyof typeof SEARCH_ENDPOINTS] || {};
  const defaultConfig = SEARCH_ENDPOINTS.default;

  return (envConfig as any)[endpoint] || defaultConfig[endpoint];
}
