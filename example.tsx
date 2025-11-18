import React, { useEffect } from 'react';
import { 
  FlagitProvider, 
  useFeatureFlag, 
  useFeatureFlags,
  useAllFeatureFlags,
  FeatureFlag,
  useFlagitClient
} from './src';
import type { FeatureFlagType } from './src';

// Example configuration using environment key
const flagitConfig = {
  envKey: 'ff_development_myapp_xxxxxxxx', // Your environment key
  // apiUrl is optional - defaults to https://flagit-server.onrender.com
  // apiUrl: 'http://localhost:3000'  // Uncomment for local development
};

// Example user data (would typically come from your auth system)
const currentUser = {
  id: 'user_123',
  email: 'user@example.com',
  subscription: 'pro',
  role: 'admin',
  location: 'US'
};

// Example component using the hook approach with user context
function DashboardComponent() {
  const client = useFlagitClient();
  const { isEnabled, loading, error, rollout, reason } = useFeatureFlag('new-dashboard');

  // Set user context for targeting rules
  useEffect(() => {
    client.setUserContext({
      userId: currentUser.id,
      email: currentUser.email,
      attributes: {
        plan: currentUser.subscription,
        role: currentUser.role,
        location: currentUser.location
      }
    });
  }, [client]);

  if (loading) {
    return <div>Loading feature flag...</div>;
  }

  if (error) {
    return <div>Error loading feature flag: {error}</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {isEnabled ? (
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
          <h3>✨ New Dashboard (Rollout: {rollout}%)</h3>
          <p>This is the new dashboard with improved features!</p>
          <small style={{ color: '#666' }}>Reason: {reason}</small>
        </div>
      ) : (
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <h3>Classic Dashboard</h3>
          <p>This is the classic dashboard.</p>
          <small style={{ color: '#666' }}>Reason: {reason}</small>
        </div>
      )}
    </div>
  );
}

// Example component using the component approach
function FeatureShowcase() {
  const client = useFlagitClient();

  // Set user context
  useEffect(() => {
    client.setUserContext({
      userId: currentUser.id,
      attributes: {
        plan: currentUser.subscription,
        role: currentUser.role
      }
    });
  }, [client]);

  return (
    <div>
      <h2>Feature Showcase</h2>
      
      <FeatureFlag 
        flag="beta-features" 
        fallback={<p>Beta features are not available.</p>}
      >
        <div style={{ background: '#e3f2fd', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
          <h3>🚀 Beta Features</h3>
          <p>Welcome to our beta features section!</p>
          <small>Only shown to beta users or based on targeting rules</small>
        </div>
      </FeatureFlag>

      <FeatureFlag 
        flag="premium-content"
        fallback={<p>Premium content is not available.</p>}
      >
        <div style={{ background: '#fff3e0', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
          <h3>⭐ Premium Content</h3>
          <p>This is exclusive premium content!</p>
          <small>Only shown to pro/enterprise users</small>
        </div>
      </FeatureFlag>

      <FeatureFlag 
        flag="experimental-ui"
        fallback={<button style={{ padding: '10px 20px' }}>Standard Button</button>}
      >
        <button style={{ 
          background: 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)',
          border: 'none',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Experimental Button 🎨
        </button>
      </FeatureFlag>
    </div>
  );
}

// Example showing multiple flags at once
function MultipleFlags() {
  const client = useFlagitClient();
  const { flags, loading, error, refresh } = useFeatureFlags([
    'dark-mode',
    'analytics',
    'notifications',
    'ai-assistant'
  ]);

  useEffect(() => {
    client.setUserContext({
      userId: currentUser.id,
      attributes: { plan: currentUser.subscription }
    });
  }, [client]);

  if (loading) return <div>Loading flags...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Multiple Flags Status</h2>
        <button onClick={refresh} style={{ padding: '5px 10px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
        {Object.entries(flags).map(([flagName, isEnabled]) => (
          <div key={flagName} style={{ 
            border: '1px solid #ddd', 
            padding: '10px', 
            borderRadius: '5px',
            background: isEnabled ? '#e8f5e9' : '#ffebee'
          }}>
            <strong>{flagName}</strong>: {isEnabled ? '✅ Enabled' : '❌ Disabled'}
          </div>
        ))}
      </div>
    </div>
  );
}

// Example component showing all available flags
function AllFlagsList() {
  const { flags, loading, error, refresh } = useAllFeatureFlags();

  if (loading) {
    return <div>Loading flags...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>All Feature Flags ({flags.length})</h2>
        <button onClick={refresh} style={{ padding: '5px 10px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>
      
      {flags.length === 0 ? (
        <p>No feature flags found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
          {flags.map((flag: FeatureFlagType) => (
            <div key={flag._id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '5px',
              background: '#fafafa'
            }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{flag.name}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>{flag.description}</p>
              <div style={{ fontSize: '12px', color: '#999' }}>
                <div>Created: {new Date(flag.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(flag.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Example component for direct client usage
function ClientExample() {
  const client = useFlagitClient();
  const [message, setMessage] = React.useState('');
  const [flagResult, setFlagResult] = React.useState<any>(null);

  useEffect(() => {
    client.setUserContext({
      userId: currentUser.id,
      email: currentUser.email,
      attributes: {
        plan: currentUser.subscription,
        location: currentUser.location
      }
    });
  }, [client]);

  const evaluateFlag = async () => {
    try {
      const result = await client.evaluateFlag('test-flag');
      setFlagResult(result);
      setMessage(`Flag evaluation completed`);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const checkSimpleFlag = async () => {
    try {
      const isEnabled = await client.isFeatureEnabled('simple-flag');
      setMessage(`Simple flag is ${isEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div>
      <h2>Direct Client Usage</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button onClick={evaluateFlag} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          Evaluate Flag (with rules)
        </button>
        <button onClick={checkSimpleFlag} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          Check Simple Flag
        </button>
      </div>
      
      {message && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#f5f5f5',
          borderRadius: '3px'
        }}>
          {message}
        </div>
      )}

      {flagResult && (
        <div style={{ 
          marginTop: '10px', 
          padding: '15px', 
          background: flagResult.isEnabled ? '#e8f5e9' : '#ffebee',
          borderRadius: '5px',
          border: '1px solid #ddd'
        }}>
          <h3>Evaluation Result:</h3>
          <pre style={{ background: '#fff', padding: '10px', borderRadius: '3px', overflow: 'auto' }}>
            {JSON.stringify(flagResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Main App component
function ExampleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🎏 Flagit React SDK Example</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This example demonstrates the Flagit SDK with environment key authentication and rule-based targeting.
      </p>
      
      <DashboardComponent />
      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #eee' }} />
      
      <FeatureShowcase />
      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #eee' }} />
      
      <MultipleFlags />
      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #eee' }} />
      
      <AllFlagsList />
      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #eee' }} />
      
      <ClientExample />
    </div>
  );
}

// Root App with Provider
export default function App() {
  return (
    <FlagitProvider 
      config={flagitConfig}
      enablePolling={true}
      pollInterval={30000}
    >
      <ExampleApp />
    </FlagitProvider>
  );
}