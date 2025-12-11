import type { Environment } from '../config/types';

/**
 * Find Friends Service Endpoint Configuration
 */

// HTTP API endpoints
export const FIND_FRIENDS_ENDPOINTS = {
  // Default configuration
  default: {
    findFriend: '/api/llm/find-friend-with-image',
  },
  // Environment-specific overrides (if needed)
  // staging: {
  //   findFriend: '/api/v2/llm/find-friend-with-image',
  // },
};

/**
 * Get Find Friends endpoint
 *
 * @param env - Current environment
 * @param endpoint - Endpoint key
 * @returns API path
 */
export function getFindFriendsEndpoint(
  env: Environment,
  endpoint: keyof typeof FIND_FRIENDS_ENDPOINTS.default
): string {
  const envConfig = FIND_FRIENDS_ENDPOINTS[env as keyof typeof FIND_FRIENDS_ENDPOINTS] || {};
  const defaultConfig = FIND_FRIENDS_ENDPOINTS.default;

  return (envConfig as any)[endpoint] || defaultConfig[endpoint];
}
