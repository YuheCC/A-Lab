import { urlConfig } from './urlConfig';
import { AUTO_FETCH_ENDPOINTS } from './autoFetchEndpoints';
import type { Environment } from './types';

type AutoFetchKey = keyof typeof AUTO_FETCH_ENDPOINTS.default;

/**
 * Build full URL for legacy authFetch calls with environment-aware overrides.
 *
 * @param keyOrPath - registered key in AUTO_FETCH_ENDPOINTS or a raw path
 */
export function buildAutoFetchURL(keyOrPath: AutoFetchKey | string): string {
  const env: Environment = urlConfig.getEnvironment();
  const envConfig = (AUTO_FETCH_ENDPOINTS as any)[env] || {};
  const defaultConfig = AUTO_FETCH_ENDPOINTS.default;

  const mapped =
    (envConfig as Record<string, string>)[keyOrPath] ??
    (defaultConfig as Record<string, string>)[keyOrPath];

  const path = mapped || keyOrPath;
  return urlConfig.buildFullURL(path);
}
