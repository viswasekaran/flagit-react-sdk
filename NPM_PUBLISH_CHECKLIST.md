# NPM Publishing Checklist for Flagit React SDK

## ✅ Pre-Publishing Checklist

### 1. Verify Build
- [x] Package builds successfully (`npm run build`)
- [x] TypeScript compiles without errors
- [x] All type definitions generated
- [x] Dist folder contains ES and UMD bundles

### 2. Documentation
- [x] README.md is complete and accurate
- [x] QUICKSTART.md has working examples
- [x] CHANGELOG.md is updated
- [x] API documentation is current
- [x] LICENSE file exists

### 3. Package Configuration
- [x] package.json has correct metadata
- [x] Version number is appropriate (1.0.0)
- [x] Files array includes necessary files
- [x] Keywords are relevant
- [x] Repository URL is correct
- [x] .npmignore is configured

### 4. Testing
- [ ] Package tested locally with `npm pack`
- [ ] Installed in test project
- [ ] All hooks work correctly
- [ ] TypeScript types are recognized
- [ ] No console errors

## 📦 Publishing Steps

### Step 1: Ensure npm Login

```bash
# Check if logged in
npm whoami

# If not logged in
npm login
```

### Step 2: Final Build

```bash
cd d:\Project\flagit-react-sdk

# Clean previous builds
npm run clean

# Fresh build
npm run build
```

### Step 3: Test Package Locally

```bash
# Create a tarball
npm pack

# This creates: flagit-react-sdk-1.0.0.tgz (16.8 kB)

# Test in your flagit-vite project
cd d:\Project\flagit-vite
npm install ../flagit-react-sdk/flagit-react-sdk-1.0.0.tgz

# Verify it works in your app
npm run dev
```

### Step 4: Publish to npm

```bash
cd d:\Project\flagit-react-sdk

# First time publish
npm publish

# You should see:
# npm notice Publishing to https://registry.npmjs.org/
# + flagit-react-sdk@1.0.0
```

### Step 5: Verify Publication

```bash
# Check package info
npm view flagit-react-sdk

# Install from npm to verify
npm install flagit-react-sdk
```

Visit: https://www.npmjs.com/package/flagit-react-sdk

## 🔄 Publishing Updates

### For Bug Fixes (Patch: 1.0.0 → 1.0.1)

```bash
# Update version
npm version patch

# Build and publish
npm run build
npm publish

# Push git tags
git push && git push --tags
```

### For New Features (Minor: 1.0.0 → 1.1.0)

```bash
npm version minor
npm run build
npm publish
git push && git push --tags
```

### For Breaking Changes (Major: 1.0.0 → 2.0.0)

```bash
# Update CHANGELOG.md first with breaking changes
# Update README.md with migration guide

npm version major
npm run build
npm publish
git push && git push --tags
```

## 🧪 Local Testing Script

Create this test in a temporary directory:

```bash
# Create test project
mkdir flagit-sdk-test
cd flagit-sdk-test
npm init -y
npm install react react-dom

# Install local package
npm install ../flagit-react-sdk/flagit-react-sdk-1.0.0.tgz

# Create test file
cat > test.tsx << 'EOF'
import { FlagitProvider, useFeatureFlag } from 'flagit-react-sdk';

function TestComponent() {
  const { isEnabled, loading } = useFeatureFlag('test-flag');
  return <div>{loading ? 'Loading...' : `Flag: ${isEnabled}`}</div>;
}

function App() {
  return (
    <FlagitProvider config={{ 
      apiUrl: 'http://localhost:3000',
      envKey: 'ff_development_test_xxx'
    }}>
      <TestComponent />
    </FlagitProvider>
  );
}
EOF
```

## 📊 Package Stats (After Publishing)

Expected package size: **16.8 kB** (compressed)
Unpacked size: **56.0 kB**
Total files: **19**

Contents:
- ES Module: `dist/index.es.js` (17.8 kB)
- UMD Module: `dist/index.umd.js` (12.5 kB)
- TypeScript definitions: `dist/*.d.ts`
- Documentation: README.md, QUICKSTART.md, CHANGELOG.md
- License: LICENSE

## 🚀 Quick Publish Command

If everything is ready:

```bash
cd d:\Project\flagit-react-sdk && npm run clean && npm run build && npm publish
```

## ⚠️ Common Issues

### Issue: "You must be logged in to publish packages"
**Solution:** Run `npm login` and enter credentials

### Issue: "Package name already exists"
**Solution:** Change package name in package.json or use scoped package `@username/flagit-react-sdk`

### Issue: "npm ERR! 402 Payment Required"
**Solution:** Scoped packages require `npm publish --access public`

### Issue: "Version already published"
**Solution:** Update version with `npm version patch/minor/major`

## 📝 Post-Publishing Tasks

After successful publish:

1. **Update Documentation**
   - Add installation instructions to main README
   - Update project documentation

2. **Tag Release on GitHub**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

3. **Create GitHub Release**
   - Go to GitHub repository
   - Create new release from tag
   - Copy CHANGELOG content
   - Attach tarball (optional)

4. **Update Backend Integration**
   - Update flagit-vite to use published package
   - Test end-to-end integration

5. **Announce Release**
   - Update project website
   - Notify users/team
   - Social media announcement (if applicable)

## 🔐 npm Token for CI/CD (Optional)

For automated publishing via GitHub Actions:

```bash
# Generate token
npm token create

# Add to GitHub Secrets
# Go to: Repository → Settings → Secrets → Actions
# Name: NPM_TOKEN
# Value: <your-token>
```

## 📈 Monitoring

After publishing, monitor:
- npm download stats: https://npmcharts.com/compare/flagit-react-sdk
- GitHub issues for bug reports
- npm package page for questions/feedback

## ✨ Success Criteria

Package is successfully published when:
- ✅ `npm view flagit-react-sdk` returns package info
- ✅ `npm install flagit-react-sdk` works
- ✅ Package appears on npmjs.com
- ✅ TypeScript types are recognized in IDE
- ✅ All peer dependencies resolve correctly
- ✅ No runtime errors in test project

---

**Current Status:** Ready to publish! 🚀

Run: `npm publish` in `d:\Project\flagit-react-sdk`
