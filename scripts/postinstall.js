#!/usr/bin/env node

/**
 * Post-install script for zopassport
 * Sets up the demo app with all dependencies and assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
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
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function setup() {
  log('\n╔════════════════════════════════════════════════════════════╗', BLUE);
  log('║         🌍  ZO PASSPORT - Installation Setup  🌍          ║', BLUE);
  log('╚════════════════════════════════════════════════════════════╝\n', BLUE);

  // Check if we're in a fresh install (not in the SDK repo itself)
  const cwd = process.cwd();
  const isDevMode = fs.existsSync(path.join(cwd, 'tsup.config.ts'));

  if (isDevMode) {
    log('📦 Development mode detected - skipping setup\n', YELLOW);
    return;
  }

  try {
    // Find the package installation directory
    const packageDir = path.join(__dirname, '..');
    const appTemplateDir = path.join(packageDir, 'app');
    const assetsDir = path.join(packageDir, 'assets');

    // Target directory for the demo app
    const targetDir = cwd;

    log('📋 Copying demo application files...', BLUE);

    // Copy app files
    if (fs.existsSync(appTemplateDir)) {
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
        const destPath = path.join(targetDir, file);

        if (fs.existsSync(srcPath)) {
          if (!fs.existsSync(destPath)) {
            log(`  ✓ ${file}`, GREEN);
            copyRecursive(srcPath, destPath);
          } else {
            log(`  ⊗ ${file} (already exists, skipping)`, YELLOW);
          }
        }
      }

      // Copy assets
      if (fs.existsSync(assetsDir)) {
        const assetsTarget = path.join(targetDir, 'public', 'assets');
        if (!fs.existsSync(assetsTarget)) {
          log('  ✓ assets/', GREEN);
          copyRecursive(assetsDir, assetsTarget);
        } else {
          log('  ⊗ assets/ (already exists, skipping)', YELLOW);
        }
      }

      // Create package.json if it doesn't exist
      const packageJsonPath = path.join(targetDir, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        const demoPackageJson = {
          name: 'my-zopassport-app',
          version: '1.0.0',
          description: 'Zo Passport - One line reputation to rule the world',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'tsc -b && vite build',
            preview: 'vite preview'
          },
          dependencies: {
            'zopassport-sdk': require(path.join(packageDir, 'package.json')).version,
            'react': '^18.3.1',
            'react-dom': '^18.3.1',
            'react-native-web': '^0.19.12',
            'axios': '^1.6.0',
            'moment': '^2.30.1'
          },
          devDependencies: {
            '@types/react': '^18.3.27',
            '@types/react-dom': '^18.3.7',
            '@vitejs/plugin-react': '^4.3.4',
            'typescript': '^5.6.3',
            'vite': '^6.0.3'
          }
        };

        fs.writeFileSync(
          packageJsonPath,
          JSON.stringify(demoPackageJson, null, 2)
        );
        log('  ✓ package.json', GREEN);
      }

      log('\n✨ Demo app files copied successfully!\n', GREEN);
    }

    // Installation instructions
    log('╔════════════════════════════════════════════════════════════╗', GREEN);
    log('║                   🎉  SETUP COMPLETE!  🎉                  ║', GREEN);
    log('╠════════════════════════════════════════════════════════════╣', GREEN);
    log('║  Next steps:                                               ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  1. Copy the example environment file:                    ║', GREEN);
    log('║     ' + BOLD + 'cp .env.example .env' + RESET + GREEN + '                                    ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  2. Edit .env and add your Zo client key:                 ║', GREEN);
    log('║     ' + BOLD + 'VITE_ZO_CLIENT_KEY=your-key-here' + RESET + GREEN + '                    ║', GREEN);
    log('║     Get your key at: https://zo.xyz/developers            ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  3. Install dependencies:                                 ║', GREEN);
    log('║     ' + BOLD + 'npm install' + RESET + GREEN + '                                          ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  4. Start the development server:                         ║', GREEN);
    log('║     ' + BOLD + 'npm run dev' + RESET + GREEN + '                                           ║', GREEN);
    log('║                                                            ║', GREEN);
    log('║  🌍 One line reputation to rule the world                 ║', GREEN);
    log('╚════════════════════════════════════════════════════════════╝\n', GREEN);

  } catch (error) {
    log('\n❌ Setup failed:', 'red');
    console.error(error);
    log('\nPlease report this issue at: https://github.com/zo-world/zopassport/issues\n', YELLOW);
    process.exit(1);
  }
}

// Only run if called directly (not required as module)
if (require.main === module) {
  setup().catch(console.error);
}

module.exports = { setup };
