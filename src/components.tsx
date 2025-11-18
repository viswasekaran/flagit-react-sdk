import { ReactNode } from 'react';
import { flagit } from './singleton';

interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: string) => void;
}

/**
 * Component for conditionally rendering content based on feature flags
 * Uses singleton pattern - no async loading needed
 */
export function FeatureFlag({ 
  flag, 
  children, 
  fallback = null, 
  onError 
}: FeatureFlagProps) {
  try {
    const isEnabled = flagit.isEnabled(flag);
    
    // Render children only if flag is enabled
    return isEnabled ? <>{children}</> : <>{fallback}</>;
  } catch (error) {
    if (onError) {
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
    return <>{fallback}</>;
  }
}