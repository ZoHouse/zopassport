import { defineConfig } from 'tsup';

export default defineConfig([
  // Main SDK (no React)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'react-native', 'react-native-reanimated', 'react-native-svg', 'moment'],
  },
  // React Web exports (web-compatible components)
  {
    entry: ['src/react.tsx'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom', 'react-native', 'react-native-reanimated', 'react-native-svg', 'moment'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // React Native exports (requires react-native runtime)
  {
    entry: ['src/react-native.tsx'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['react', 'react-dom', 'react-native', 'react-native-reanimated', 'react-native-svg', 'moment'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  },
  // Assets (constants, stickers, cultures)
  {
    entry: ['assets/index.ts'],
    outDir: 'dist/assets',
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
  },
]);

