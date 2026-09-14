import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // demo/la-campus-demo is a standalone snapshot of this app with its own
    // package.json, tsconfig and copies of these very test files. Without this
    // exclusion vitest collects BOTH copies of every duplicated suite, so each
    // failure is reported twice and the demo's own tests (which deliberately
    // ship without the backend deps) fail here as well.
    exclude: ['**/node_modules/**', '**/dist/**', 'demo/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
