#!/usr/bin/env node

/**
 * Zo Passport Initializer
 * Sets up a new Zo Passport app
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function init() {
  log('\n╔════════════════════════════════════════════════════════════╗', BLUE);
  log('║         🌍  ZO PASSPORT - Project Initialization  🌍      ║', BLUE);
  log('╚════════════════════════════════════════════════════════════╝\n', BLUE);

  try {
    const cwd = process.cwd();

    // Check if directory is empty (except for package.json, node_modules)
    const files = fs.readdirSync(cwd).filter(f =>
      !f.startsWith('.') && f !== 'node_modules' && f !== 'package.json' && f !== 'package-lock.json'
    );

    if (files.length > 0) {
      log('⚠️  Warning: Current directory is not empty', YELLOW);
      log('Files will be copied without overwriting existing files\n', YELLOW);
    }

    // Find zopassport in node_modules
    const sdkPath = path.join(cwd, 'node_modules', 'zopassport');

    if (!fs.existsSync(sdkPath)) {
      log('❌ Error: zopassport not found in node_modules', RED);
      log('\nPlease run: npm install zopassport\n', YELLOW);
      process.exit(1);
    }

    const appTemplateDir = path.join(sdkPath, 'app');
    const assetsDir = path.join(sdkPath, 'assets');

    if (!fs.existsSync(appTemplateDir)) {
      log('❌ Error: App template not found in zopassport', RED);
      process.exit(1);
    }

    log('📋 Copying app files...', BLUE);

    // Copy app structure
    const appFiles = [
      'src',
      'public',
      'index.html',
      'vite.config.ts',
      'tsconfig.json',
      '.env.example'
    ];

    for (const file of appFiles) {
      const srcPath = path.join(appTemplateDir, file);
      const destPath = path.join(cwd, file);

      if (fs.existsSync(srcPath)) {
        if (!fs.existsSync(destPath)) {
          log(`  ✓ ${file}`, GREEN);
          copyRecursive(srcPath, destPath);
        } else {
          log(`  ⊗ ${file} (already exists, skipping)`, YELLOW);
        }
      }
    }

    // Copy assets to public
    if (fs.existsSync(assetsDir)) {
      const assetsTarget = path.join(cwd, 'public', 'assets');
      if (!fs.existsSync(assetsTarget)) {
        log('  ✓ public/assets/', GREEN);
        copyRecursive(assetsDir, assetsTarget);
      } else {
        log('  ⊗ public/assets/ (already exists, skipping)', YELLOW);
      }
    }

    // Update or create package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    let packageJson = {};

    if (fs.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      log('  ✓ Updating package.json', GREEN);
    } else {
      log('  ✓ Creating package.json', GREEN);
    }

    // Merge with required fields
    const sdkVersion = JSON.parse(
      fs.readFileSync(path.join(sdkPath, 'package.json'), 'utf-8')
    ).version;

    packageJson = {
      ...packageJson,
      name: packageJson.name || 'my-zopassport-app',
      version: packageJson.version || '1.0.0',
      description: packageJson.description || 'Zo Passport - One line reputation to rule the world',
      type: 'module',
      scripts: {
        ...packageJson.scripts,
        dev: 'vite',
        build: 'tsc -b && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        ...packageJson.dependencies,
        'zopassport': `^${sdkVersion}`,
        'react': '^18.3.1',
        'react-dom': '^18.3.1',
        'react-native-web': '^0.19.12',
        'axios': '^1.6.0',
        'moment': '^2.30.1'
      },
      devDependencies: {
        ...packageJson.devDependencies,
        '@types/react': '^18.3.27',
        '@types/react-dom': '^18.3.7',
        '@vitejs/plugin-react': '^4.3.4',
        'typescript': '^5.6.3',
        'vite': '^6.0.3'
      }
    };

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2)
    );

    log('\n✨ Project initialized successfully!\n', GREEN);

    // Next steps
    log('╔════════════════════════════════════════════════════════════╗', GREEN);
    log('║                   🎉  READY TO GO!  🎉                     ║', GREEN);
    log('╠════════════════════════════════════════════════════════════╣', GREEN);
    log('║  Next steps:                                               ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  1. Copy the environment template:                        ║', GREEN);
    log('║     ' + BOLD + 'cp .env.example .env' + RESET + GREEN + '                                    ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  2. Edit .env with your Zo client key:                    ║', GREEN);
    log('║     ' + BOLD + 'VITE_ZO_CLIENT_KEY=your-key-here' + RESET + GREEN + '                    ║', GREEN);
    log('║     Get your key: https://zo.xyz/developers               ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  3. Install dependencies:                                 ║', GREEN);
    log('║     ' + BOLD + 'npm install' + RESET + GREEN + '                                          ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  4. Start the dev server:                                 ║', GREEN);
    log('║     ' + BOLD + 'npm run dev' + RESET + GREEN + '                                           ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  🌍 One line reputation to rule the world                 ║', GREEN);
    log('╚════════════════════════════════════════════════════════════╝\n', GREEN);

  } catch (error) {
    log('\n❌ Initialization failed:', RED);
    console.error(error);
    log('\nReport issues: https://github.com/zo-world/zopassport/issues\n', YELLOW);
    process.exit(1);
  }
}

init().catch(console.error);
