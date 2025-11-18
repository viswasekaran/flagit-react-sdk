# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-18

### 🚀 Major Release - Complete Redesign

### Breaking Changes
- **Removed `FlagitProvider`** - No Provider wrapper needed, use singleton pattern
- **Removed `useFeatureFlag` hook** - Use `flagit.isEnabled()` instead
- **Removed `useFlagitContext`** - Use singleton directly
- **Removed custom client-side rules** - All rules evaluated server-side only
- **Changed API endpoint** - Single unified `POST /sdk/flags` endpoint
- **Removed multiple endpoints** - Consolidated from 3 endpoints to 1

### Added
- ✅ **Singleton pattern** - `flagit.init()` and use anywhere
- ✅ **Synchronous access** - `flagit.isEnabled()` with no async/await
- ✅ **Single API call** - Fetch and evaluate all flags in one request
- ✅ **Server-side only evaluation** - All rules managed in portal
- ✅ **User context in init** - Pass context once during initialization
- ✅ **Smaller bundle** - Reduced from 22KB to 19KB (~14% reduction)

### Changed
- **Backend API**: Single `POST /sdk/flags` endpoint handles everything
- **Response format**: Returns `{ flagName: boolean }` map directly
- **Initialization**: Auto-fetches and evaluates flags with user context
- **Component**: `<FeatureFlag>` now uses singleton (no loading state)
- **Hooks**: Simplified to `useFlagitClient()` and `useAllFeatureFlags()`

### Migration Guide

#### Before (v1.x)
```tsx
<FlagitProvider config={{ envKey: 'xxx' }}>
  <App />
</FlagitProvider>

const { isEnabled, loading } = useFeatureFlag('feature');
if (loading) return <Loading />;
```

#### After (v2.0)
```tsx
// Initialize once
flagit.init({ 
  envKey: 'xxx',
  userContext: { userId: '123' }
});

// Use anywhere - no loading!
if (flagit.isEnabled('feature')) {
  // ...
}
```

### Performance
- 🚀 Single API call vs multiple calls
- 🚀 No Provider overhead
- 🚀 Synchronous flag access (no re-renders)
- 🚀 Smaller bundle size

### Documentation
- Complete README rewrite
- Migration guide from v1.x
- Comparison with LaunchDarkly/Flagsmith
- Best practices guide

## [1.1.2] - 2025-11-18

### Changed
- Default API URL set to production: `https://flagit-server.onrender.com`
- `apiUrl` is now optional in config
- Updated documentation to reflect optional apiUrl

### Added
- Custom client-side rules support via optional `rules` config
- `CustomRule` type for defining client-side evaluation logic
- Client-side rule evaluation executes before server-side rules
- Enhanced documentation with custom rules examples

### Important Notes
- Custom rules are **optional** - SDK works without them
- Rules must be passed in **initial config only**
- Rules cannot be modified after SDK initialization

### Improved
- Better developer experience - only `envKey` is required
- Reduced configuration complexity
- Added examples for custom rules in QUICKSTART and README

## [1.1.0] - 2025-11-18

### Added
- Complete SDK restructure with environment key authentication
- Server-side rule evaluation with user context
- User targeting support
- Attribute-based targeting
- Percentage-based rollouts with consistent hashing
- TypeScript definitions
- React hooks API

## [1.0.0] - 2025-11-18

### Added
- Environment key-based authentication system
- Server-side rule evaluation with user context
- `setUserContext()` method for user targeting
- `evaluateFlag()` method for server-side flag evaluation
- Support for user targeting rules
- Support for attribute-based targeting
- Consistent hash-based percentage rollouts
- `useAllFeatureFlags()` hook for fetching all flags
- `EvaluationResult` interface with detailed evaluation info
- `UserContext` interface for targeting

### Changed
- **BREAKING**: Replaced JWT authentication with environment keys
- **BREAKING**: Removed `projectId`, `accessToken`, and `refreshToken` from config
- **BREAKING**: Changed `useFeatureFlags` to accept array of flag names
- **BREAKING**: Hook return values now include `rollout` and `reason` instead of `config`
- Updated all API endpoints from `/projects/*` to `/sdk/*`
- Authentication now uses `x-flagit-env-key` header instead of Bearer token
- Flag evaluation moved from client-side to server-side

### Removed
- **BREAKING**: `useToggleFeatureFlag` hook (mutations should be done via dashboard)
- **BREAKING**: `useFeatureFlagRenderer` hook (incompatible with async rendering)
- **BREAKING**: `environment` parameter from most methods
- **BREAKING**: `config` property from `useFeatureFlag` return value
- JWT token refresh logic
- Client-side flag evaluation

### Security
- Environment keys are read-only (no mutation capabilities)
- Server-side rule validation prevents client-side tampering
- Scoped keys per environment (development/production isolation)

## [Unreleased]

### Planned
- Real-time flag updates via WebSocket
- Offline mode with cached flags
- React Native support
- Advanced analytics integration
- A/B testing utilities
