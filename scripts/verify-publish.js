#!/usr/bin/env node

/**
 * Pre-publish verification script
 * Checks if the package is ready to be published to npm
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(condition, message) {
  if (condition) {
    log(`✓ ${message}`, 'green');
    return true;
  } else {
    log(`✗ ${message}`, 'red');
    return false;
  }
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

async function verify() {
  log('\n🔍 Verifying package readiness for npm...\n', 'blue');
  
  let passed = true;

  // Check package.json
  info('Checking package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  passed &= check(packageJson.name, 'Package name is set');
  passed &= check(packageJson.version, 'Version is set');
  passed &= check(packageJson.description, 'Description is set');
  passed &= check(packageJson.main, 'Main entry point is set');
  passed &= check(packageJson.types, 'TypeScript types entry is set');
  passed &= check(packageJson.license, 'License is set');
  passed &= check(packageJson.repository, 'Repository is set');
  passed &= check(packageJson.keywords && packageJson.keywords.length > 0, 'Keywords are set');
  
  // Check required files
  info('\nChecking required files...');
  passed &= check(fs.existsSync('README.md'), 'README.md exists');
  passed &= check(fs.existsSync('LICENSE'), 'LICENSE exists');
  passed &= check(fs.existsSync('CHANGELOG.md'), 'CHANGELOG.md exists');
  passed &= check(fs.existsSync('package.json'), 'package.json exists');
  
  // Check build output
  info('\nChecking build output...');
  passed &= check(fs.existsSync('dist'), 'dist/ folder exists');
  
  if (fs.existsSync('dist')) {
    passed &= check(fs.existsSync('dist/index.js') || fs.existsSync('dist/index.es.js'), 
      'Main bundle exists');
    passed &= check(fs.existsSync('dist/index.d.ts'), 'Type definitions exist');
    
    // Check bundle sizes
    if (fs.existsSync('dist/index.es.js')) {
      const esSize = fs.statSync('dist/index.es.js').size;
      const esSizeKB = (esSize / 1024).toFixed(2);
      info(`  ES bundle size: ${esSizeKB} KB`);
      
      if (esSize > 100000) {
        warn('  Bundle size is quite large (>100KB)');
      }
    }
  }
  
  // Check .npmignore or files field
  info('\nChecking publish configuration...');
  const hasNpmIgnore = fs.existsSync('.npmignore');
  const hasFilesField = packageJson.files && packageJson.files.length > 0;
  
  if (hasNpmIgnore) {
    check(true, '.npmignore exists');
  } else if (hasFilesField) {
    check(true, 'files field in package.json is configured');
  } else {
    warn('Neither .npmignore nor files field in package.json is set');
    warn('All files will be published (not recommended)');
  }
  
  // Check peer dependencies
  info('\nChecking dependencies...');
  if (packageJson.peerDependencies) {
    info(`  Peer dependencies: ${Object.keys(packageJson.peerDependencies).join(', ')}`);
  }
  if (packageJson.dependencies) {
    warn('  Package has runtime dependencies: ' + Object.keys(packageJson.dependencies).join(', '));
    warn('  Consider moving to peerDependencies if possible');
  }
  
  // Version warnings
  info('\nVersion information:');
  info(`  Current version: ${packageJson.version}`);
  
  if (packageJson.version === '0.0.0') {
    warn('  Version is 0.0.0 - update before publishing');
  }
  
  // Check git status
  info('\nChecking git status...');
  try {
    const { execSync } = require('child_process');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim()) {
      warn('Uncommitted changes detected:');
      console.log(gitStatus);
      warn('Consider committing changes before publishing');
    } else {
      check(true, 'Working directory is clean');
    }
    
    // Check if on main/master branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    info(`  Current branch: ${branch}`);
    
    if (branch !== 'main' && branch !== 'master') {
      warn(`Publishing from '${branch}' branch (not main/master)`);
    }
  } catch (error) {
    warn('Could not check git status (not a git repository?)');
  }
  
  // Final summary
  log('\n' + '='.repeat(60), 'blue');
  
  if (passed) {
    log('\n✅ All checks passed! Package is ready to publish.\n', 'green');
    log('To publish, run:', 'blue');
    log('  npm publish\n', 'green');
    
    log('Or test locally first:', 'blue');
    log('  npm pack', 'yellow');
    log('  npm install ./flagit-react-sdk-*.tgz\n', 'yellow');
  } else {
    log('\n❌ Some checks failed. Please fix the issues above.\n', 'red');
    process.exit(1);
  }
  
  log('='.repeat(60) + '\n', 'blue');
}

// Run verification
verify().catch(error => {
  log('\n❌ Verification failed with error:', 'red');
  console.error(error);
  process.exit(1);
});
