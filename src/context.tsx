import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FlagitClient } from './client';
import { FlagitConfig, FeatureFlag } from './types';

interface FlagitContextValue {
  client: FlagitClient;
  flags: FeatureFlag[];
  loading: boolean;
  error: string | null;
  refreshFlags: () => Promise<void>;
}

const FlagitContext = createContext<FlagitContextValue | null>(null);

interface FlagitProviderProps {
  children: ReactNode;
  config: FlagitConfig;
  enablePolling?: boolean;
  pollInterval?: number;
}

export function FlagitProvider({ 
  children, 
  config, 
  enablePolling = false, 
  pollInterval 
}: FlagitProviderProps) {
  const [client] = useState(() => new FlagitClient(config));
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFlags = async () => {
    try {
      setError(null);
      await client.refresh();
      const newFlags = client.getCachedFlags();
      setFlags(newFlags);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flags';
      setError(errorMessage);
      console.error('Error refreshing flags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshFlags();
  }, []);

  // Handle polling
  useEffect(() => {
    if (enablePolling) {
      client.startPolling(pollInterval);
      
      return () => {
        client.stopPolling();
      };
    }
  }, [enablePolling, pollInterval, client]);

  // Update client config if it changes
  useEffect(() => {
    client.updateConfig(config);
  }, [config, client]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      client.destroy();
    };
  }, [client]);

  const value: FlagitContextValue = {
    client,
    flags,
    loading,
    error,
    refreshFlags
  };

  return (
    <FlagitContext.Provider value={value}>
      {children}
    </FlagitContext.Provider>
  );
}

export function useFlagitContext(): FlagitContextValue {
  const context = useContext(FlagitContext);
  if (!context) {
    throw new Error('useFlagitContext must be used within a FlagitProvider');
  }
  return context;
}