// Main exports
export { FlagitClient } from './client';
export { 
  useFlagitClient, 
  useAllFeatureFlags
} from './hooks';
export { FeatureFlag } from './components';
export { flagit, FlagitSingleton } from './singleton';

// Type exports
export type {
  FlagitConfig,
  FeatureFlag as FeatureFlagType,
  EnvironmentConfig,
  Environments,
  Rule,
  Project,
  ApiResponse,
  AuthTokens,
  UseFeatureFlagOptions,
  UseFeatureFlagsOptions,
  UserContext,
  EvaluationResult
} from './types';

// Default export for convenience (singleton instance)
// Recommended usage: import flagit from 'flagit-react-sdk'
export { flagit as default } from './singleton';