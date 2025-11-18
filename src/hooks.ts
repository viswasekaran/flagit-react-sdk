import { useState, useEffect } from 'react';
import { flagit } from './singleton';

/**
 * Hook to get the Flagit client instance
 * Returns the singleton client instance
 */
export function useFlagitClient() {
  return flagit.getClient();
}

/**
 * Hook to get all available feature flags
 * Returns cached flags from singleton
 */
export function useAllFeatureFlags(): {
  flags: any[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const client = useFlagitClient();
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      await client.refresh();
      setFlags(client.getCachedFlags());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flags';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial cached flags
    setFlags(client.getCachedFlags());
  }, []);

  return {
    flags,
    loading,
    error,
    refresh,
  };
}