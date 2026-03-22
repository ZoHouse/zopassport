import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/components/**',
        'src/react-native.tsx',
        'src/lib/types/**',
        'src/lib/types.ts',
        'src/**/index.ts',
        'src/lib/utils/styles.ts',
      ],
    },
  },
});
