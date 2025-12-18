import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    force: true, // Always re-bundle dependencies
  },
  server: {
    hmr: {
      overlay: true,
    },
    fs: {
      // Allow serving files from the parent SDK assets folder
      allow: ['..', '../..'],
    },
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-reanimated': path.resolve(process.cwd(), './reanimated-mock.js'),
      'react-native-svg': path.resolve(process.cwd(), './svg-mock.js'),
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
  },
  define: {
    global: 'window',
  },
  // Serve assets from parent SDK folder
  publicDir: path.resolve(__dirname, '../../assets'),
})
