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
   *
   * @returns Base URL string
   *          - Returns empty string if BASE_URL is '/' or ''
   *          - Returns absolute URL if BASE_URL is 'http://...'
   *          - Converts relative path to absolute URL using window.location.origin
   */
  public getBaseURL(): string {
    return this.normalizeBaseURL(this.baseURL);
  }

  /**
   * Get base URL for WebSocket connections
   *
   * @returns Base URL string (normalized)
   */
  public getWSBaseURL(): string {
    return this.normalizeBaseURL(this.wsBaseURL);
  }

  /**
   * Normalize base URL to handle various edge cases
   *
   * @param url - Raw base URL from config
   * @returns Normalized URL
   *
   * Handles:
   * - '/' -> '' (empty, for fetch to work correctly)
   * - '' -> '' (empty)
   * - '/api' -> 'http://localhost:3000/api' (relative path -> absolute)
   * - 'http://...' -> 'http://...' (absolute URL, unchanged)
   */
  private normalizeBaseURL(url: string): string {
    // Handle empty or root path
    if (!url || url === '/') {
      return '';
    }

    // If already an absolute URL (http:// or https://), return as-is
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // If relative path (starts with /), convert to absolute URL
    if (url.startsWith('/')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return origin + url;
    }

    // Otherwise return as-is
    return url;
  }

  /**
   * Build full URL by combining base URL and path
   *
   * Ensures no double slashes in the result (except in protocol like 'http://')
   *
   * @param path - API path (e.g., '/chat/send' or '/api/chat/list')
   * @param useWSBase - Use WebSocket base URL instead of HTTP base URL
   * @returns Full URL without double slashes
   *
   * @example
   * // With BASE_URL = 'https://prod-api.ses.ai'
   * buildFullURL('/chat/send') // => 'https://prod-api.ses.ai/chat/send'
   *
   * // With BASE_URL = '/'
   * buildFullURL('/chat/send') // => '/chat/send'
   *
   * // With BASE_URL = '/api'
   * buildFullURL('/chat/send') // => 'http://localhost:3000/api/chat/send'
   *
   * // Edge cases handled:
   * buildFullURL('//chat/send') // => '/chat/send' (removes leading double slash)
   * buildFullURL('chat/send') // => '/chat/send' (adds leading slash)
   */
  public buildFullURL(path: string, useWSBase: boolean = false): string {
    const base = useWSBase ? this.getWSBaseURL() : this.getBaseURL();

    // Clean path: remove leading slashes and normalize
    let cleanPath = path.trim();
    // Remove all leading slashes
    while (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    // If base is empty, return path with single leading slash
    if (!base) {
      return cleanPath ? `/${cleanPath}` : '/';
    }

    // Clean base: remove trailing slashes (but preserve protocol slashes like 'http://')
    let cleanBase = base.trim();
    // Remove trailing slashes
    while (cleanBase.endsWith('/') && !cleanBase.endsWith('://')) {
      cleanBase = cleanBase.substring(0, cleanBase.length - 1);
    }

    // If path is empty, return base as-is
    if (!cleanPath) {
      return cleanBase;
    }

    // Combine with single slash
    return `${cleanBase}/${cleanPath}`;
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
