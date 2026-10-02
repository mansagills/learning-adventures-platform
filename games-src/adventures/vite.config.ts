/// <reference types="vitest/config" />
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Every folder with an index.html is one game (for example
// number-line-ninja/index.html). The build writes them all to
// public/games/play/<slug>/ in the Next.js site, with shared code (three.js
// and the Adventure Kit) in public/games/play/assets/. It must stay under
// /games/: the site only lets /games/ and /lessons/ pages be embedded in its
// game player. base: './' keeps every path relative.
const root = process.cwd();
const games = Object.fromEntries(
  readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !['node_modules', 'src', 'tests', 'scripts', 'test-output'].includes(d.name) && existsSync(resolve(root, d.name, 'index.html')))
    .map((d) => [d.name, resolve(root, d.name, 'index.html')]),
);

export default defineConfig({
  base: './',
  build: {
    outDir: '../../public/games/play',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: games },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
