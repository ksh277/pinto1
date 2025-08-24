import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      reporter: ['text', 'html', 'json'],
      thresholds: {
        lines: 0,
        statements: 0,
        branches: 0,
        functions: 0,
      },
    },
  },
});
