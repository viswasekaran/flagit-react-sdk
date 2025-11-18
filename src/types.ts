// Environment configuration for a feature flag
export interface EnvironmentConfig {
  status: 'enabled' | 'disabled';
  rollout: number; // 0-100 percentage
  isActive: boolean;
  rules?: Rule[];
}

// Targeting rule for feature flags
export interface Rule {
  enabled: boolean;
  field: string;
  name: string;
  type: 'user' | 'platform' | 'attribute' | 'custom' | 'percentage';
  values: string[];
}

// Environment collection type
export interface Environments {
  development: EnvironmentConfig;
  production: EnvironmentConfig;
  [key: string]: EnvironmentConfig;
}

// Feature flag data structure
export interface FeatureFlag {
  _id: string;
  name: string;
  description: string;
  environments: Environments;
  createdAt: string;
  updatedAt: string;
}

// Project data structure
export interface Project {
  _id: string;
  name: string;
  key: string;
  description: string;
  ownerId: string[];
  memberCount: number;
  isActive: boolean;
  plan: string;
  featureFlags: FeatureFlag[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  activeFlagsCount: number;
}

// API Response structure
export interface ApiResponse<T = any> {
  code: string;
  message?: string;
  data?: T;
  flags?: FeatureFlag[];
}

// Authentication tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// SDK Configuration
export interface FlagitConfig {
  envKey: string;              // Environment key for authentication
  apiUrl?: string;             // Optional: override API URL (default: https://api.flagit.dev)
  environment?: string;         // Optional: override environment from key
  userContext?: UserContext;    // Optional: user context for server-side rule evaluation
  pollInterval?: number;        // Optional: milliseconds between flag updates
  timeout?: number;             // Optional: request timeout in milliseconds
  retryAttempts?: number;       // Optional: number of retry attempts for failed requests
  onError?: (error: Error) => void; // Optional: error handler callback
}

// User context for rule evaluation
export interface UserContext {
  userId?: string;
  email?: string;
  attributes?: Record<string, any>;
}

// Evaluation result
export interface EvaluationResult {
  isEnabled: boolean;
  reason: string;
  matchedRule?: Rule;
  rollout?: number;
}

// Hook options
export interface UseFeatureFlagOptions {
  defaultValue?: boolean;
}

export interface UseFeatureFlagsOptions {
  enablePolling?: boolean;
  pollInterval?: number;
}