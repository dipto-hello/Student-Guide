import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');

/**
 * Minimal Vite config for Storybook.
 *
 * Storybook's react-vite builder loads the project's `vite.config.ts` by
 * default, which pins `root` to `client/`, emits to `dist/public`, and runs the
 * PWA plugin — all of which fight the builder's own entry and output. Pointing
 * Storybook here instead keeps the two builds independent; only the pieces
 * stories actually need (React, Tailwind, path aliases) are shared.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'client', 'src'),
      '@shared': path.resolve(rootDir, 'shared'),
    },
  },
});
