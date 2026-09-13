/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const isBundled = mode === 'bundled';
  const isReact = mode === 'react';
  const isTest = mode === 'test';
  const outDir = isBundled
    ? 'dist/bundled'
    : isReact
      ? 'dist/react'
      : 'dist/preact';

  const baseAlias = {
    '@': path.resolve(__dirname, './src'),
    // In tests everything renders with Preact; map React (pulled in by
    // @tanstack/react-table) onto preact/compat so a single renderer is used.
    ...(isTest
      ? {
          react: 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/jsx-runtime',
          'react-dom/test-utils': 'preact/test-utils',
        }
      : {}),
  };

  return {
    plugins: [
      tailwindcss(),
      isReact ? react() : preact(),
      dts({
        tsconfigPath: isReact ? './tsconfig.react.json' : './tsconfig.json',
        outDir: isReact ? 'dist/types-react' : 'dist/types-preact',
        insertTypesEntry: true,
      }),
    ],
    define: {
      'process.env': { NODE_ENV: 'production' },
    },
    resolve: {
      alias: isReact
        ? {
            ...baseAlias,
            'preact/compat/client': 'react-dom/client',
            'preact/compat': resolve(__dirname, 'shims/react-compat-shim.js'),
            'preact/jsx-runtime': 'react/jsx-runtime',
            'preact/hooks': 'react',
            'preact/test-utils': 'react-dom/test-utils',
            'preact/debug': 'react',
            preact: 'react',
          }
        : baseAlias,
    },
    test: {
      // Component tests render with Preact; the React→preact/compat aliases live
      // in resolve.alias (test-only). Inline the TanStack deps so those aliases
      // apply during transform instead of being pre-bundled with real React.
      // Per-file DOM environments are selected via `@vitest-environment` docblocks.
      server: {
        deps: {
          inline: [
            '@tanstack/react-table',
            '@tanstack/react-virtual',
            '@headlessui/react',
          ],
        },
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'hello-csv',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => `index.${format}.js`,
      },
      rollupOptions: {
        external: isBundled
          ? []
          : isReact
            ? ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client']
            : ['preact'],
        output: {
          globals: isBundled
            ? {}
            : {
                preact: isReact ? 'React' : 'Preact',
                react: 'React',
                'react-dom': 'ReactDOM',
                'react/jsx-runtime': 'jsxRuntime',
              },
        },
      },
      outDir,
    },
  };
});
