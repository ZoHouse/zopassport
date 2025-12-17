import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
