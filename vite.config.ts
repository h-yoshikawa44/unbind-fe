import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite-plus';
import react from '@vitejs/plugin-react';
import devServer from '@hono/vite-dev-server';
import { inertiaPages } from '@hono/inertia/vite';
import ssrPlugin from 'vite-ssr-components/plugin';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    plugins: ['react', 'typescript'],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    env: {
      browser: true,
      es2020: true,
    },
    rules: {
      // 明示的な React インポートは不要なのでオフ
      'react/react-in-jsx-scope': 'off',
    },
    ignorePatterns: ['generated/**'],
  },
  fmt: {
    singleQuote: true,
    ignorePatterns: ['generated/**'],
  },
  staged: {
    '*': 'vp check --fix',
  },
  plugins: [
    react(),
    devServer({ entry: 'app/server.tsx', injectClientScript: false }),
    inertiaPages(),
    ...ssrPlugin(),
  ],
});
