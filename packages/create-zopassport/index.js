#!/usr/bin/env node

/**
 * create-zopassport
 * 
 * Create Zo Passport apps with a SINGLE command:
 *   npx create-zopassport my-app
 * 
 * For local testing:
 *   npx ./create-zopassport-0.1.0.tgz my-app
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
const DIM = '\x1b[2m';

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
            if (entry === 'node_modules' || entry === '.git') continue;
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

async function main() {
    const args = process.argv.slice(2);

    // Show help
    if (args.includes('--help') || args.includes('-h')) {
        log('\nUsage: npx create-zopassport <project-name>\n');
        log('Examples:');
        log('  npx create-zopassport my-zo-app');
        log('  npx create-zopassport .\n');
        process.exit(0);
    }

    // Get project name
    let projectName = args[0];

    if (!projectName) {
        // Default to current directory if empty
        projectName = '.';
    }

    const isCurrentDir = projectName === '.';
    const projectPath = isCurrentDir ? process.cwd() : path.resolve(process.cwd(), projectName);
    const displayName = isCurrentDir ? path.basename(process.cwd()) : projectName;

    log('\n╔════════════════════════════════════════════════════════════╗', BLUE);
    log('║         🌍  CREATE ZO PASSPORT APP  🌍                    ║', BLUE);
    log('╚════════════════════════════════════════════════════════════╝\n', BLUE);

    log(`Creating a new Zo Passport app in ${BOLD}${projectPath}${RESET}\n`);

    try {
        // Create project directory if not current dir
        if (!isCurrentDir) {
            if (fs.existsSync(projectPath)) {
                const files = fs.readdirSync(projectPath);
                if (files.length > 0) {
                    log(`❌ Directory ${projectName} already exists and is not empty.`, RED);
                    process.exit(1);
                }
            } else {
                fs.mkdirSync(projectPath, { recursive: true });
            }
        }

        // Find template and assets directories (bundled with this CLI)
        const cliDir = __dirname;
        const templateDir = path.join(cliDir, 'template');
        const assetsDir = path.join(cliDir, 'assets');

        if (!fs.existsSync(templateDir)) {
            log('❌ Template directory not found. Package may be corrupted.', RED);
            log(`   Looked in: ${templateDir}`, DIM);
            process.exit(1);
        }

        // Copy template files
        log('📋 Copying project files...', BLUE);

        const templateFiles = fs.readdirSync(templateDir);
        for (const file of templateFiles) {
            const srcPath = path.join(templateDir, file);
            const destPath = path.join(projectPath, file);

            if (!fs.existsSync(destPath)) {
                log(`   ${GREEN}✓${RESET} ${file}`);
                copyRecursive(srcPath, destPath);
            } else {
                log(`   ${YELLOW}⊗${RESET} ${file} (already exists)`);
            }
        }

        // Copy assets to public (at root level, not in assets subfolder)
        // This ensures URLs like /figma-assets/landing-zo-logo.png work correctly
        if (fs.existsSync(assetsDir)) {
            const publicPath = path.join(projectPath, 'public');
            if (!fs.existsSync(publicPath)) {
                fs.mkdirSync(publicPath, { recursive: true });
            }
            log(`   ${GREEN}✓${RESET} public/ (assets)`);
            copyRecursive(assetsDir, publicPath);
        }

        // Create package.json
        log('\n📦 Creating package.json...', BLUE);

        const packageJson = {
            name: displayName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            version: '1.0.0',
            private: true,
            description: 'Zo Passport - One line reputation to rule the world',
            type: 'module',
            scripts: {
                dev: 'vite',
                build: 'tsc -b && vite build',
                preview: 'vite preview'
            },
            dependencies: {
                'zopassport': '^0.1.0',
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
            path.join(projectPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        log(`   ${GREEN}✓${RESET} package.json created`);

        // Success message
        log('\n╔════════════════════════════════════════════════════════════╗', GREEN);
        log('║                 🎉  SUCCESS!  🎉                          ║', GREEN);
        log('╚════════════════════════════════════════════════════════════╝\n', GREEN);

        log(`Your Zo Passport app is ready!\n`);

        if (!isCurrentDir) {
            log(`${BOLD}Next steps:${RESET}\n`);
            log(`  1. ${BOLD}cd ${projectName}${RESET}`);
            log(`  2. ${BOLD}cp .env.example .env${RESET}`);
            log(`  3. Edit .env with your ${BOLD}VITE_ZO_CLIENT_KEY${RESET}`);
            log(`  4. ${BOLD}npm install${RESET}`);
            log(`  5. ${BOLD}npm run dev${RESET}\n`);
        } else {
            log(`${BOLD}Next steps:${RESET}\n`);
            log(`  1. ${BOLD}cp .env.example .env${RESET}`);
            log(`  2. Edit .env with your ${BOLD}VITE_ZO_CLIENT_KEY${RESET}`);
            log(`  3. ${BOLD}npm install${RESET}`);
            log(`  4. ${BOLD}npm run dev${RESET}\n`);
        }

        log(`${DIM}Get your API key at: https://zo.xyz/developers${RESET}`);
        log(`${DIM}Documentation: https://docs.zo.xyz${RESET}\n`);

        log(`🌍 ${BOLD}One line reputation to rule the world${RESET}\n`);

    } catch (error) {
        log('\n❌ Failed to create project:', RED);
        console.error(error);
        process.exit(1);
    }
}

main().catch(console.error);
