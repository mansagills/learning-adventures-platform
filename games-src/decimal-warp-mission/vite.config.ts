import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The built game is copied into the Next.js site's public folder so it is
// served at /games/decimal-warp-mission/. The site only lets pages under
// /games/ and /lessons/ be embedded in its player. base: './' keeps every
// asset path relative.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../public/games/decimal-warp-mission',
    emptyOutDir: true,
    target: 'es2020',
  },
});
