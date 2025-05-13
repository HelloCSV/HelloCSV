import { defineConfig, UserConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const base = mode === 'gh-pages' ? '/HelloCSV/' : '/';

  return {
    plugins: [preact(), tailwindcss()],
    base,
    resolve: {
      dedupe: ['preact'],
    },
  };
});
