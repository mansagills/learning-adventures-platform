/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// The built game is copied into the Next.js site's public folder so it is
// served (unlisted) at /games/seeds-of-genius/ on every Vercel preview.
// base: './' keeps every asset path relative, so the same build also runs
// from any other folder or static host.
export default defineConfig({
  base: './',
  build: {
    outDir: '../../public/games/seeds-of-genius',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
