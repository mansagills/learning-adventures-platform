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
    //
    // games-src/ holds standalone game projects (e.g. Seeds of Genius) with
    // their own package.json and test runner, for the same reason.
    exclude: ['**/node_modules/**', '**/dist/**', 'demo/**', 'games-src/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
