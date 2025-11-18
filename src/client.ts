import { 
  FlagitConfig, 
  UserContext
} from './types';

// Default API URL - can be overridden in config
const DEFAULT_API_URL = 'https://flagit-server.onrender.com';

export class FlagitClient {
  private config: FlagitConfig;
  private cachedFlags: Map<string, any> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private userContext: UserContext | null = null;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_TTL = 5000; // 5 seconds cache to prevent rapid duplicate requests
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: FlagitConfig) {
    if (!config.envKey) {
      throw new Error('envKey is required in FlagitConfig');
    }

    this.config = {
      apiUrl: DEFAULT_API_URL,
      environment: 'development',
      pollInterval: 30000, // 30 seconds default
      timeout: 5000, // 5 seconds default
      retryAttempts: 3,
      ...config
    };

    // Set user context if provided in config
    if (config.userContext) {
      this.userContext = config.userContext;
    }

    // Auto-fetch flags on initialization (with user context for rule evaluation)
    this.initPromise = this.initialize();
  }

  /**
   * Initialize and fetch flags automatically
   * Always evaluates flags with user context if provided
   */
  private async initialize(): Promise<void> {
    try {
      // Use unified endpoint - always evaluates with context if provided
      await this.getFlags();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Flagit SDK:', error);
      // Don't throw - allow SDK to work in degraded mode
      this.initialized = true;
    }
  }

  /**
   * Unified method: Get flags with optional evaluation
   * Backend evaluates flags with user context and returns { flagName: boolean }
   */
  private async getFlags(): Promise<void> {
    const endpoint = '/sdk/flags';

    try {
      const evaluatedFlags = await this.makeRequest<Record<string, boolean>>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          environment: this.config.environment,
          context: this.userContext
        })
      });

      // Cache the evaluated results
      for (const [flagName, isEnabled] of Object.entries(evaluatedFlags)) {
        this.cachedFlags.set(flagName, {
          name: flagName,
          isActive: isEnabled,
          rollout: 100,
          rules: []
        });
      }
    } catch (error) {
      console.error('Error fetching flags:', error);
      throw error;
    }
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInitialization(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Check if a feature flag is enabled (synchronous)
   * Uses cached flags - no async/await needed
   * Returns false if flag not found in cache
   */
  isEnabled(flagName: string): boolean {
    const flag = this.cachedFlags.get(flagName);
    if (!flag) {
      return false;
    }
    return flag.isActive === true;
  }

  /**
   * Alias for isEnabled - check if a feature is enabled (synchronous)
   * Uses cached flags - no async/await needed
   * Returns false if flag not found in cache
   */
  isFeatureEnabled(flagName: string): boolean {
    return this.isEnabled(flagName);
  }

  /**
   * Get a feature flag value (synchronous)
   * Uses cached flags - no async/await needed
   * Returns null if flag not found
   */
  getValue(flagName: string): any | null {
    return this.cachedFlags.get(flagName) || null;
  }

  /**
   * Check if flags are loaded and ready
   */
  isReady(): boolean {
    return this.initialized && this.cachedFlags.size > 0;
  }

  /**
   * Set user context for rule evaluation
   */
  setUserContext(context: UserContext): void {
    this.userContext = context;
  }

  /**
   * Get current user context
   */
  getUserContext(): UserContext | null {
    return this.userContext;
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<FlagitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Make SDK API request with environment key authentication
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(options.body || '')}`;
    
    // Check if there's a pending request for the same operation
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }
    
    // Check request cache to prevent rapid duplicate requests
    const cached = this.requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }

    const url = `${this.config.apiUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-flagit-env-key': this.config.envKey,
      ...((options.headers || {}) as Record<string, string>)
    };

    const requestConfig: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout || 5000)
    };

    // Create the request promise
    const requestPromise = (async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= (this.config.retryAttempts || 3); attempt++) {
        try {
          const response = await fetch(url, requestConfig);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.message || response.statusText;
            
            if (response.status === 401) {
              throw new Error(`Authentication failed: ${errorMsg}`);
            }
            if (response.status === 429) {
              throw new Error(`Rate limit exceeded. Please try again later.`);
            }
            throw new Error(`HTTP ${response.status}: ${errorMsg}`);
          }

          const data = await response.json();
          
          // Cache successful response
          this.requestCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
          
          // Clean old cache entries
          this.cleanRequestCache();
          
          return data;
        } catch (error) {
          lastError = error as Error;
          
          // Call error handler if provided
          if (this.config.onError && attempt === this.config.retryAttempts) {
            this.config.onError(lastError);
          }
          
          // Don't retry on rate limit errors
          if (lastError.message.includes('Rate limit exceeded')) {
            throw lastError;
          }
          
          if (attempt < (this.config.retryAttempts || 3)) {
            // Exponential backoff
            await new Promise(resolve => 
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
        }
      }

      throw lastError || new Error('Request failed');
    })();

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Clean expired cache entries
   */
  private cleanRequestCache(): void {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Refresh flags from server
   */
  async refresh(): Promise<void> {
    await this.getFlags();
  }

  /**
   * Start polling for flag updates
   */
  startPolling(interval?: number): void {
    if (this.pollInterval) {
      this.stopPolling();
    }

    const pollTime = interval || this.config.pollInterval || 30000;
    
    this.pollInterval = setInterval(async () => {
      try {
        await this.getFlags();
      } catch (error) {
        console.error('Error during polling:', error);
      }
    }, pollTime);
  }

  /**
   * Stop polling for flag updates
   */
  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Clear cached flags
   */
  clearCache(): void {
    this.cachedFlags.clear();
  }

  /**
   * Get cached flags
   */
  getCachedFlags(): any[] {
    return Array.from(this.cachedFlags.values());
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopPolling();
    this.clearCache();
  }
}
