import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const sharedAlias = { '@shared': resolve('src/shared') };

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { ...sharedAlias, '@main': resolve('src/main') } },
    build: { outDir: 'out/main' },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: sharedAlias },
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        output: {
          entryFileNames: '[name].cjs',
          format: 'cjs',
        },
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    resolve: { alias: { ...sharedAlias, '@renderer': resolve('src/renderer/src') } },
    plugins: [react()],
    build: { outDir: 'out/renderer' },
    // Monaco editor workers must be served from the same origin.
    // Vite handles this automatically for dynamic imports.
    optimizeDeps: {
      include: ['monaco-editor'],
    },
  },
});
