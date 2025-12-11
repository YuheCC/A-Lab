import type { Environment } from './types';

/**
 * Lightweight URL Configuration Center
 *
 * Responsibilities:
 * - Detect current environment
 * - Provide base URL access
 * - Build full URLs by combining base URL and path
 *
 * Note: This does NOT manage service-specific paths.
 * Each service should manage its own endpoint configuration.
 */
class UrlConfigCenter {
  private static instance: UrlConfigCenter;
  private environment: Environment;
  private baseURL: string;
  private wsBaseURL: string;

  private constructor() {
    this.environment = this.detectEnvironment();
    this.baseURL = this.getBaseURLFromDefine();
    this.wsBaseURL = this.getWSBaseURLFromDefine();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): UrlConfigCenter {
    if (!UrlConfigCenter.instance) {
      UrlConfigCenter.instance = new UrlConfigCenter();
    }
    return UrlConfigCenter.instance;
  }

  /**
   * Detect current environment from define or base URL
   */
  private detectEnvironment(): Environment {
    // Priority 1: Use ENVIRONMENT if defined
    if (typeof ENVIRONMENT !== 'undefined') {
      return ENVIRONMENT;
    }

    // Priority 2: Detect from BASE_URL
    const baseURL = typeof BASE_URL !== 'undefined' ? BASE_URL : '';
    if (baseURL.includes('api-sh.ses.ai')) {
      return 'staging';
    }
    if (baseURL.includes('localhost') || baseURL.includes('127.0.0.1')) {
      return 'development';
    }

    // Default: production
    return 'production';
  }

  /**
   * Get base URL from UmiJS define
   */
  private getBaseURLFromDefine(): string {
    return typeof BASE_URL !== 'undefined' ? BASE_URL : 'https://prod-api.ses.ai';
  }

  /**
   * Get WebSocket base URL from UmiJS define
   */
  private getWSBaseURLFromDefine(): string {
    if (typeof WS_BASE_URL !== 'undefined') {
      return WS_BASE_URL;
    }
    return this.baseURL;
  }

  /**
   * Get current environment
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Get base URL for HTTP/SSE requests
   */
  public getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Get base URL for WebSocket connections
   */
  public getWSBaseURL(): string {
    return this.wsBaseURL;
  }

  /**
   * Build full URL by combining base URL and path
   *
   * @param path - API path (e.g., '/chat/send' or '/api/chat/list')
   * @param useWSBase - Use WebSocket base URL instead of HTTP base URL
   * @returns Full URL
   *
   * @example
   * buildFullURL('/chat/send') // => 'https://prod-api.ses.ai/chat/send'
   */
  public buildFullURL(path: string, useWSBase: boolean = false): string {
    const base = useWSBase ? this.wsBaseURL : this.baseURL;

    // Remove trailing slash from base URL
    const cleanBase = base.replace(/\/+$/, '');

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${cleanBase}${cleanPath}`;
  }
}

// Export singleton instance
export const urlConfig = UrlConfigCenter.getInstance();

/**
 * Backward compatibility: Legacy API URL getter
 * @deprecated Use urlConfig.getBaseURL() instead
 */
export const getAPIUrl = (): string => {
  return urlConfig.getBaseURL();
};
