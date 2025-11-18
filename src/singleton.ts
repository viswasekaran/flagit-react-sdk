import { FlagitClient } from './client';
import { FlagitConfig, UserContext } from './types';

/**
 * Singleton instance for Flagit SDK
 * Initialize once and use anywhere in your application
 */
class FlagitSingleton {
  private static instance: FlagitClient | null = null;
  private static initialized = false;

  /**
   * Initialize the Flagit SDK with configuration
   * Must be called once before using any other methods
   */
  static init(config: FlagitConfig): void {
    if (this.initialized) {
      console.warn('Flagit SDK already initialized. Updating configuration...');
      this.instance?.updateConfig(config);
      return;
    }

    this.instance = new FlagitClient(config);
    this.initialized = true;
    
    // Wait for initial flag fetch in background
    this.instance.waitForInitialization().catch(err => {
      console.error('Flagit initialization error:', err);
    });
  }

  /**
   * Get the client instance (internal use)
   * @internal
   */
  static getClient(): FlagitClient {
    if (!this.instance) {
      throw new Error(
        'Flagit SDK not initialized. Call flagit.init(config) first.'
      );
    }
    return this.instance;
  }

  /**
   * Check if a feature flag is enabled (synchronous - no await needed!)
   * Uses cached flags fetched during initialization
   * Returns false if flag not found
   */
  static isEnabled(flagName: string): boolean {
    return this.getClient().isEnabled(flagName);
  }

  /**
   * Alias for isEnabled - check if a feature is enabled (synchronous)
   * Uses cached flags - no async/await needed
   * Returns false if flag not found
   */
  static isFeatureEnabled(flagName: string): boolean {
    return this.getClient().isFeatureEnabled(flagName);
  }

  /**
   * Get flag value (synchronous - no await needed!)
   * Returns null if flag not found
   */
  static getValue(flagName: string): any | null {
    return this.getClient().getValue(flagName);
  }

  /**
   * Check if SDK is ready (flags loaded)
   */
  static isReady(): boolean {
    return this.instance?.isReady() || false;
  }

  /**
   * Get detailed evaluation of a feature flag
   */
  /**
   * @deprecated Use isEnabled() instead - flags are pre-evaluated
   * Get a feature flag evaluation
   */
  static async getFlag(flagName: string): Promise<{
    code: string;
    flagName: string;
    isEnabled: boolean;
    reason: string;
    rollout: number;
    matchedRule?: string;
  }> {
    const isEnabled = this.getClient().isEnabled(flagName);
    const cachedFlag = this.getClient().getCachedFlags().find(f => f.name === flagName);
    return {
      code: '00',
      flagName,
      isEnabled,
      reason: isEnabled ? 'enabled' : 'disabled',
      rollout: cachedFlag?.rollout || 0
    };
  }

  /**
   * Get all feature flags
   */
  static getAllFlags() {
    return this.getClient().getCachedFlags();
  }

  /**
   * Set user context for evaluation
   */
  static setContext(context: UserContext): void {
    this.getClient().setUserContext(context);
  }

  /**
   * Get current user context
   */
  static getContext(): UserContext | null {
    return this.getClient().getUserContext();
  }

  /**
   * Update SDK configuration
   */
  static updateConfig(config: Partial<FlagitConfig>): void {
    this.getClient().updateConfig(config);
  }

  /**
   * Start polling for flag updates
   */
  static startPolling(interval?: number): void {
    this.getClient().startPolling(interval);
  }

  /**
   * Stop polling for flag updates
   */
  static stopPolling(): void {
    this.getClient().stopPolling();
  }

  /**
   * Manually refresh flags
   */
  static async refresh(): Promise<void> {
    await this.getClient().refresh();
  }

  /**
   * Destroy the SDK instance
   */
  static destroy(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
      this.initialized = false;
    }
  }

  /**
   * Check if SDK is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Default export for convenient usage
 * 
 * @example
 * ```typescript
 * import flagit from 'flagit-react-sdk';
 * 
 * // Initialize once in your app entry point
 * flagit.init({
 *   apiUrl: 'http://localhost:3000',
 *   envKey: 'your-env-key'
 * });
 * 
 * // Use anywhere in your app
 * const isEnabled = await flagit.isEnabled('my-feature');
 * if (isEnabled) {
 *   // Feature is enabled
 * }
 * ```
 */
export const flagit = FlagitSingleton;

// Also export the class for advanced usage
export { FlagitSingleton };
