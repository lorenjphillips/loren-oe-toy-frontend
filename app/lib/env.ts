/**
 * Environment variable configuration and validation
 */

/**
 * Defines the shape of environment variables
 */
export interface EnvVars {
  // OpenAI Configuration
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_EMBEDDING_MODEL: string;
  
  // Feature Flags
  ENABLE_DEBUG_LOGGING: boolean;
  ENABLE_SEMANTIC_ANALYSIS: boolean;
  
  // App Configuration
  NODE_ENV: 'development' | 'test' | 'production';
  API_TIMEOUT_MS: number;
  CONFIDENCE_THRESHOLD: number;
}

/**
 * Default values for non-critical environment variables
 */
const DEFAULT_ENV: Partial<EnvVars> = {
  OPENAI_MODEL: 'gpt-4o',
  OPENAI_EMBEDDING_MODEL: 'text-embedding-3-small',
  ENABLE_DEBUG_LOGGING: false,
  ENABLE_SEMANTIC_ANALYSIS: true,
  API_TIMEOUT_MS: 30000,
  CONFIDENCE_THRESHOLD: 0.65,
};

/**
 * Get an environment variable with type conversion
 * @param key Environment variable name
 * @param defaultValue Optional default value
 * @returns The environment variable value
 */
export function getEnvVar<T extends keyof EnvVars>(
  key: T,
  defaultValue?: EnvVars[T]
): EnvVars[T] {
  const value = process.env[key];
  
  // If the environment variable is not set
  if (value === undefined) {
    // Use the provided default value if it exists
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    // Use the default from DEFAULT_ENV if it exists
    if (key in DEFAULT_ENV) {
      return DEFAULT_ENV[key] as EnvVars[T];
    }
    
    // If the variable is required, throw an error
    if (isRequiredVar(key)) {
      throw new Error(`Required environment variable ${key} is not defined`);
    }
    
    // If we reach here, the variable is optional and has no default
    return (undefined as any) as EnvVars[T];
  }
  
  // Convert the value based on the expected type
  const typeofDefault = typeof DEFAULT_ENV[key];
  
  if (typeofDefault === 'boolean') {
    return (value === 'true' || value === '1') as EnvVars[T];
  } else if (typeofDefault === 'number') {
    return Number(value) as EnvVars[T];
  } else {
    // String or other type
    return value as EnvVars[T];
  }
}

/**
 * List of required environment variables
 */
const REQUIRED_VARS: Array<keyof EnvVars> = [
  'OPENAI_API_KEY',
];

/**
 * Check if an environment variable is required
 * @param key Environment variable name
 * @returns Whether the variable is required
 */
function isRequiredVar(key: keyof EnvVars): boolean {
  return REQUIRED_VARS.includes(key);
}

/**
 * Get the default value for a type
 * @param key Environment variable key
 * @returns Default value for the type
 */
function getDefaultForType<T extends keyof EnvVars>(key: T): EnvVars[T] | undefined {
  return DEFAULT_ENV[key];
}

/**
 * Detect the current environment
 * @returns The current environment
 */
export function getEnvironment(): EnvVars['NODE_ENV'] {
  return (process.env.NODE_ENV as EnvVars['NODE_ENV']) || 'development';
}

/**
 * Check if running in development environment
 * @returns Whether running in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if running in production environment
 * @returns Whether running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if running in test environment
 * @returns Whether running in test
 */
export function isTest(): boolean {
  return getEnvironment() === 'test';
}

/**
 * Validate all required environment variables
 * @throws Error if any required variables are missing
 */
export function validateEnv(): void {
  for (const key of REQUIRED_VARS) {
    getEnvVar(key); // This will throw if the variable is missing
  }
}

/**
 * Get all environment variables as an object
 * @returns All environment variables
 */
export function getAllEnv(): Partial<EnvVars> {
  const env: Partial<EnvVars> = {};
  
  for (const key in DEFAULT_ENV) {
    const envKey = key as keyof EnvVars;
    try {
      env[envKey] = getEnvVar(envKey);
    } catch (error) {
      // Skip any variables that fail to load
    }
  }
  
  return env;
}

// Export a singleton instance for easy imports
export const env = {
  get: getEnvVar,
  validate: validateEnv,
  isDevelopment,
  isProduction,
  isTest,
  all: getAllEnv,
};

export default env; 