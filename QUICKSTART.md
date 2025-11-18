# Flagit React SDK - Quick Start Guide

> ⚠️ **Work In Progress**: This SDK is under active development. Some features may change.

Get started with Flagit feature flags in 5 minutes!

## Step 1: Install the SDK

```bash
npm install flagit-react-sdk
```

## Step 2: Get Your Environment Key

1. Login to your Flagit dashboard
2. Go to **Settings** → **Developer**
3. Copy your environment key (starts with `ff_development_` or `ff_production_`)

## Step 3: Configure the Provider

In your main App component:

```tsx
import { FlagitProvider } from 'flagit-react-sdk';

function App() {
  return (
    <FlagitProvider 
      config={{
        envKey: 'ff_development_myapp_xxxxxxxx'
      }}
    >
      <YourApp />
    </FlagitProvider>
  );
}
```

## Step 4: Use Feature Flags

### Simple Usage

```tsx
import { useFeatureFlag } from 'flagit-react-sdk';

function MyComponent() {
  const { isEnabled, loading } = useFeatureFlag('new-feature');

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isEnabled ? <NewFeature /> : <OldFeature />}
    </div>
  );
}
```

### With User Targeting

```tsx
import { useFlagitClient, useFeatureFlag } from 'flagit-react-sdk';

function Dashboard() {
  const client = useFlagitClient();
  const { user } = useAuth();

  // Set user context for targeting rules
  useEffect(() => {
    client.setUserContext({
      userId: user.id,
      email: user.email,
      attributes: {
        plan: user.subscription,
        role: user.role
      }
    });
  }, [user]);

  const { isEnabled } = useFeatureFlag('premium-feature');
  
  return isEnabled ? <PremiumDashboard /> : <BasicDashboard />;
}
```

## Step 5: Create Your First Feature Flag

1. Go to your Flagit dashboard
2. Navigate to your project
3. Click "New Flag"
4. Configure:
   - **Name**: `new-feature`
   - **Environment**: `development`
   - **Status**: `enabled`
   - **Rollout**: `100%`
5. Save

## Advanced Features

### Gradual Rollouts

Roll out features to a percentage of users:

```tsx
// In dashboard: Set rollout to 25%
// 25% of users will see the new feature (based on userId)

client.setUserContext({ userId: user.id });
const { isEnabled } = useFeatureFlag('gradual-feature');
```

### Targeting Rules

Target specific users or attributes:

```tsx
// In dashboard: Add rule
// - Type: Attribute
// - Field: plan
// - Values: ["enterprise", "pro"]

client.setUserContext({
  userId: user.id,
  attributes: { plan: user.subscription }
});

const { isEnabled } = useFeatureFlag('enterprise-feature');
// Only enabled for enterprise/pro users
```

### Real-time Updates

Enable polling to get flag updates automatically:

```tsx
<FlagitProvider 
  config={config}
  enablePolling={true}
  pollInterval={30000}  // Check every 30 seconds
>
  <App />
</FlagitProvider>
```

## Common Patterns

### A/B Testing

```tsx
const { isEnabled } = useFeatureFlag('variant-b');
return isEnabled ? <VariantB /> : <VariantA />;
```

### Beta Features

```tsx
client.setUserContext({
  userId: user.id,
  attributes: { betaTester: user.isBetaTester }
});

const { isEnabled } = useFeatureFlag('beta-feature');
```

### Regional Features

```tsx
client.setUserContext({
  userId: user.id,
  attributes: { region: user.location.country }
});

const { isEnabled } = useFeatureFlag('eu-feature');
// Configure rule: region = ["DE", "FR", "UK"]
```

## Custom Client-Side Rules (Optional)

For advanced use cases, you can optionally add custom evaluation logic:

```tsx
import { FlagitProvider, CustomRule } from 'flagit-react-sdk';

const customRules: CustomRule[] = [
  {
    flagName: 'dark-mode',
    type: 'custom',
    enabled: true,
    condition: (context) => {
      // Enable dark mode based on user preference
      return context.attributes?.theme === 'dark';
    }
  },
  {
    flagName: 'premium-content',
    type: 'custom',
    enabled: true,
    condition: (context) => {
      // Enable for paid users
      return ['pro', 'enterprise'].includes(context.attributes?.plan);
    }
  }
];

<FlagitProvider 
  config={{
    envKey: 'ff_development_myapp_xxx',
    rules: customRules  // Optional: only pass in initial config
  }}
>
  <App />
</FlagitProvider>
```

**Note:** Custom rules are optional and must be defined in the initial config. They execute before server-side rules and can provide instant evaluation without API calls.

## Troubleshooting

### Flag not updating?
- Check if polling is enabled
- Verify environment key is correct
- Ensure flag exists in the correct environment

### Rules not working?
- Make sure user context is set before checking flags
- Verify attribute names match dashboard configuration
- Check that userId is provided for percentage rollouts

### Authentication errors?
- Verify envKey is correct
- Check that API URL is accessible (if using custom backend)
- Ensure environment key is active in dashboard

## Next Steps

- [Full API Documentation](./README.md)
- [Advanced Targeting Rules](./docs/targeting.md)
- [Best Practices](./docs/best-practices.md)

## Support

Need help? Open an issue on [GitHub](https://github.com/your-org/flagit-react-sdk/issues)
