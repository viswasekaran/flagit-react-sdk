# Flagit React SDK

A lightweight React SDK for feature flags with server-side evaluation, intelligent targeting, and zero configuration needed.

🌐 **Get Started**: [https://www.flagit.app/](https://www.flagit.app/)

## Features

- ✅ **Single API Call** - Fetch and evaluate all flags in one request
- ✅ **Server-Side Evaluation** - All rules evaluated on backend with portal configuration
- ✅ **Synchronous Access** - No async/await needed after initialization
- ✅ **Smart Targeting** - User-based, attribute-based, and percentage rollouts
- ✅ **Lightweight** - ~20KB bundle size
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Zero Config** - Just initialize and use

## Installation

```bash
npm install flagit-react-sdk
```

## Quick Start

```tsx
import flagit from 'flagit-react-sdk';

// 1. Initialize once at app startup
flagit.init({
  envKey: 'ff_development_yourproject_xxxxxxxxxxxx',
  userContext: {
    userId: 'user-123',
    email: 'user@example.com',
    attributes: {
      plan: 'premium',
      region: 'us-east'
    }
  }
});

// 2. Use anywhere in your app - NO ASYNC/AWAIT!
function MyComponent() {
  if (flagit.isEnabled('new-dashboard')) {
    return <NewDashboard />;
  }
  return <OldDashboard />;
}
```

## API Reference

### Initialization

```typescript
flagit.init({
  envKey: string;              // Required: Environment key from dashboard
  apiUrl?: string;             // Optional: API URL (defaults to production)
  environment?: string;        // Optional: Override environment (development/production)
  userContext?: {              // Optional: User context for targeting
    userId?: string;
    email?: string;
    attributes?: Record<string, any>;
  };
  pollInterval?: number;       // Optional: Auto-refresh interval in ms (default: 30000)
  timeout?: number;            // Optional: Request timeout in ms (default: 5000)
  retryAttempts?: number;      // Optional: Retry attempts (default: 3)
  onError?: (error: Error) => void; // Optional: Error handler
});
```

### Synchronous Methods (Recommended)

**`flagit.isEnabled(flagName: string): boolean`**
```tsx
// Simple boolean check - no await needed!
if (flagit.isEnabled('new-feature')) {
  // Feature is enabled
}
```

**`flagit.isFeatureEnabled(flagName: string): boolean`**
```tsx
// Alias for isEnabled
const enabled = flagit.isFeatureEnabled('beta-feature');
```

**`flagit.getValue(flagName: string): any | null`**
```tsx
// Get full flag object
const flag = flagit.getValue('my-feature');
```

**`flagit.isReady(): boolean`**
```tsx
// Check if flags are loaded
if (flagit.isReady()) {
  // Flags are ready
}
```

### User Context

**`flagit.setContext(context: UserContext): void`**
```tsx
// Update user context dynamically
flagit.setContext({
  userId: 'user-456',
  email: 'new@example.com',
  attributes: { plan: 'enterprise' }
});
```

**`flagit.getContext(): UserContext | null`**
```tsx
// Get current user context
const context = flagit.getContext();
```

### Async Methods

**`flagit.refresh(): Promise<void>`**
```tsx
// Manually refresh flags from server
await flagit.refresh();
```

**`flagit.startPolling(interval?: number): void`**
```tsx
// Auto-refresh flags every 30 seconds
flagit.startPolling(30000);
```

**`flagit.stopPolling(): void`**
```tsx
// Stop auto-refresh
flagit.stopPolling();
```

## React Hooks

### useFlagitClient

```tsx
import { useFlagitClient } from 'flagit-react-sdk';

function MyComponent() {
  const client = useFlagitClient();
  
  // Access client methods
  const enabled = client.isEnabled('feature');
  client.setUserContext({ userId: '123' });
  
  return <div>...</div>;
}
```

### useAllFeatureFlags

```tsx
import { useAllFeatureFlags } from 'flagit-react-sdk';

function FlagList() {
  const { flags, loading, error, refresh } = useAllFeatureFlags();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {flags.map(flag => (
        <li key={flag.name}>{flag.name}: {flag.isActive ? '✓' : '✗'}</li>
      ))}
    </ul>
  );
}
```

## Components

### FeatureFlag

```tsx
import { FeatureFlag } from 'flagit-react-sdk';

function App() {
  return (
    <FeatureFlag
      flag="new-feature"
      fallback={<OldFeature />}
      onError={(error) => console.error(error)}
    >
      <NewFeature />
    </FeatureFlag>
  );
}
```

## How It Works

1. **Initialize once** with `flagit.init()` - SDK fetches and evaluates all flags
2. **Server evaluates** flags using rules defined in your portal
3. **Results cached** locally for instant synchronous access
4. **Use anywhere** with `flagit.isEnabled()` - no async needed!

### Evaluation Flow

```
Client                          Backend
  |                               |
  |-- POST /sdk/flags ----------->|
  |   { context: {...} }          |
  |                               |
  |                        [Evaluate all flags]
  |                        [Apply portal rules]
  |                        [Check rollouts]
  |                               |
  |<-- { "flag1": true, ... } ----|
  |                               |
[Cache results]
  |
[flagit.isEnabled() → instant!]
```

## Advanced Usage

### Dynamic User Context

```tsx
import flagit from 'flagit-react-sdk';

// Initialize without context
flagit.init({ envKey: 'xxx' });

// Set context after user logs in
function LoginPage() {
  const handleLogin = async (user) => {
    // Update context
    flagit.setContext({
      userId: user.id,
      email: user.email,
      attributes: {
        plan: user.subscription,
        role: user.role
      }
    });
    
    // Refresh flags with new context
    await flagit.refresh();
  };
}
```

### Environment-Specific Configuration

```tsx
const config = {
  envKey: import.meta.env.VITE_FLAGIT_ENV_KEY,
  environment: import.meta.env.MODE, // 'development' or 'production'
  apiUrl: import.meta.env.VITE_FLAGIT_API_URL
};

flagit.init(config);
```

## Migration from Other SDKs

### From LaunchDarkly

```tsx
// Before (LaunchDarkly)
const client = await LDClient.initialize(clientKey, context);
const flagValue = client.variation('feature-key', false);

// After (Flagit)
flagit.init({ envKey: 'xxx', userContext: context });
const flagValue = flagit.isEnabled('feature-key'); // No await!
```

### From Flagsmith

```tsx
// Before (Flagsmith)
await flagsmith.init({ environmentID: 'xxx' });
const enabled = flagsmith.hasFeature('feature');

// After (Flagit)
flagit.init({ envKey: 'xxx' });
const enabled = flagit.isEnabled('feature'); // Same pattern!
```

## Best Practices

1. **Initialize early** - Call `flagit.init()` before rendering your app
2. **Set context once** - Include user context in init config
3. **Use synchronous methods** - Prefer `isEnabled()` over async methods
4. **Handle errors** - Provide `onError` callback in config
5. **Refresh strategically** - Use polling for long-lived apps

## Troubleshooting

**Flags not loading?**
- Check your environment key is correct
- Verify network requests in browser DevTools
- Check console for initialization errors

**Always getting false?**
- Ensure flags are enabled in portal
- Check user context matches targeting rules
- Verify environment is correct

**TypeScript errors?**
- Update to latest version
- Check import paths are correct

## Get Your Environment Key

1. Sign up at [https://www.flagit.app/](https://www.flagit.app/)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **Developer**
4. Copy the environment key for your environment (development or production)

## License

MIT
