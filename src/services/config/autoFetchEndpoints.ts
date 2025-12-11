import type { EndpointConfig } from './types';

/**
 * Endpoint map for legacy authFetch usage.
 * - default: common paths
 * - box: overrides paths that differ in box env
 */
export const AUTO_FETCH_ENDPOINTS: EndpointConfig<Record<string, string>> = {
  default: {
    sseSearch: '/api/sse/search',
    snowflakeQuery: '/snowflake-query',
    mapInit: '/map-init.js',
    mapInitAnions: '/map-init-anions.js',
    favorites: '/favorites',
    favoritesRetrieve: '/favorites-retrieve',
    favoritesDelete: '/favorites-delete',
    moleculeImage: '/api/molecule_image',
    queryLimit: '/query_limit',
    chatHistory: '/chat-history',
    chatHistoryDetail: '/chat-history',
    chatHistoryDelete: '/chat-history/delete',
    findFriendWithImage: '/api/llm/find-friend-with-image',
    feedback: '/api/feedback',
    moleculeDetails: '/api/molecule_details',
  },
  box: {
    sseSearch: '/api/search/sse/search',
    snowflakeQuery: '/api/search/snowflake-query',
    favorites: '/api/user/favorites',
    favoritesRetrieve: '/api/user/favorites-retrieve',
    favoritesDelete: '/api/user/favorites-delete',
    moleculeImage: '/api/search/molecule_image',
    queryLimit: '/api/user/query_limit',
  },
};
