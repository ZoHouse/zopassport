import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Check if we're running in development (inside the SDK repo)
const isDev = process.cwd().includes('zopassport-sdk');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Mock native-only libraries FIRST (order matters!)
      {
        find: /^react-native-reanimated$/,
        replacement: path.resolve(__dirname, 'reanimated-mock.jsx'),
      },
      {
        find: /^react-native-svg$/,
        replacement: path.resolve(__dirname, 'svg-mock.jsx'),
      },
      // React Native Web (must use absolute path)
      {
        find: /^react-native$/,
        replacement: path.resolve(__dirname, 'node_modules/react-native-web'),
      },
      // In development, resolve zopassport to the local source
      ...(isDev ? [
        {
          find: /^zopassport\/react$/,
          replacement: path.resolve(__dirname, '../src/react.tsx'),
        },
        {
          find: /^zopassport$/,
          replacement: path.resolve(__dirname, '../src/index.ts'),
        },
      ] : []),
    ],
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
  },
  optimizeDeps: {
    // Force Vite to pre-bundle these
    include: ['react', 'react-dom', 'axios', 'moment'],
    // Exclude native libraries from optimization
    exclude: ['react-native-reanimated', 'react-native-svg'],
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from the parent assets folder
      allow: ['..'],
    },
  },
  // In dev, serve assets from parent SDK folder
  publicDir: isDev ? path.resolve(__dirname, '../assets') : 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['react-native-worklets'],
    },
  },
});



