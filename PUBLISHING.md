# Flagit React SDK - Publishing Guide

## Prerequisites

1. **npm Account**: You need an npm account. Create one at [npmjs.com](https://www.npmjs.com/signup)

2. **npm CLI**: Make sure npm is installed and you're logged in
   ```bash
   npm --version
   npm login
   ```

## Publishing Steps

### 1. Update Version (if needed)

Update the version in `package.json` following [semver](https://semver.org/):
- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Major** (1.0.0 → 2.0.0): Breaking changes

```bash
# Using npm version command (recommended)
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### 2. Build the Package

```bash
npm run build
```

This will:
- Run TypeScript compiler
- Build ES and UMD bundles with Vite
- Generate type definitions
- Output to `dist/` folder

### 3. Test the Package Locally (Optional)

Create a tarball and test in another project:

```bash
# Create a tarball
npm pack

# This creates: flagit-react-sdk-1.0.0.tgz

# In another project, install it:
npm install /path/to/flagit-react-sdk-1.0.0.tgz
```

### 4. Publish to npm

**First Time Publishing:**

```bash
npm publish
```

**Publishing Updates:**

```bash
# Update version first
npm version patch  # or minor/major

# Then publish
npm publish
```

**Publishing Beta/Alpha Versions:**

```bash
# Update to pre-release version
npm version 1.1.0-beta.0

# Publish with tag
npm publish --tag beta
```

### 5. Verify Publication

Check your package on npm:
```bash
npm view flagit-react-sdk
```

Or visit: `https://www.npmjs.com/package/flagit-react-sdk`

## Using the Published Package

After publishing, users can install it:

```bash
npm install flagit-react-sdk
# or
yarn add flagit-react-sdk
# or
pnpm add flagit-react-sdk
```

## Package Scope (Optional)

If you want to publish under an organization scope:

1. Update `package.json`:
   ```json
   {
     "name": "@flagit/react-sdk"
   }
   ```

2. Publish with public access:
   ```bash
   npm publish --access public
   ```

## Automation with GitHub Actions (Recommended)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Setting up NPM_TOKEN:

1. Generate npm token: `npm token create`
2. Add to GitHub: Settings → Secrets → New repository secret
3. Name: `NPM_TOKEN`, Value: your token

## Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass (`npm test` if you have tests)
- [ ] Documentation is up to date (README.md, QUICKSTART.md)
- [ ] Version number is updated
- [ ] CHANGELOG.md is updated (if you maintain one)
- [ ] Build succeeds (`npm run build`)
- [ ] Package is tested locally (`npm pack` and test)
- [ ] Git changes are committed
- [ ] Git tag matches version (if using git tags)

## Common Issues

### "You do not have permission to publish"
- Run `npm login` to authenticate
- Check if package name is already taken
- Use scoped package name (`@yourorg/package-name`)

### "Package name too similar to existing package"
- Choose a more unique name
- Use organization scope

### "Missing required field"
- Ensure package.json has: name, version, description, main, types

### Build files not included
- Check `files` field in package.json
- Verify `dist/` folder exists after build
- Don't include `dist/` in `.gitignore` npm publishing

## Version Management

**Semantic Versioning Guidelines:**

- **1.0.0** → **1.0.1**: Bug fixes (patch)
  - Fixed rule evaluation bug
  - Corrected TypeScript types
  
- **1.0.0** → **1.1.0**: New features (minor)
  - Added new hook
  - New evaluation method
  
- **1.0.0** → **2.0.0**: Breaking changes (major)
  - Changed API interface
  - Removed deprecated methods
  - Changed authentication method

## Maintaining the Package

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update react

# Major version updates
npm install react@latest
```

### Publishing Patch Releases

```bash
npm version patch
npm publish
git push && git push --tags
```

## Support & Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [npm Package Naming Guidelines](https://docs.npmjs.com/package-name-guidelines)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## Quick Reference

```bash
# Login to npm
npm login

# Build package
npm run build

# Test locally
npm pack
npm install ./flagit-react-sdk-1.0.0.tgz

# Publish
npm publish

# Update & publish
npm version patch
npm publish

# View published package
npm view flagit-react-sdk
```
