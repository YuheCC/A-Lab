/**
 * Environment types for the application
 */
export type Environment = 'production' | 'staging' | 'development' | 'box' | 'us';

/**
 * Endpoint configuration structure with environment-specific overrides
 *
 * Usage:
 * - default: Base configuration used for all environments
 * - production/staging/development: Override specific endpoints as needed
 */
export interface EndpointConfig<T extends Record<string, string>> {
  default: T;
  production?: Partial<T>;
  staging?: Partial<T>;
  development?: Partial<T>;
  box?: Partial<T>;
  us?: Partial<T>;
}
