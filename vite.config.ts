/// <reference types="vitest" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const isBundled = mode === 'bundled';
  const outDir = isBundled ? 'dist/bundled' : 'dist/peer';

  return {
    plugins: [
      tailwindcss(),
      preact(),
      dts({
        outDir: 'dist/types',
        insertTypesEntry: true,
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'hello-csv',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => `index.${format}.js`,
      },
      rollupOptions: {
        external: isBundled ? [] : ['preact'],
        output: {
          globals: isBundled ? {} : { preact: 'Preact' },
        },
      },
      outDir,
    },
  };
});
