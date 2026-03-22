import { defineConfig } from 'vite-plus';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
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
  },
  fmt: {
    singleQuote: true,
  },
  staged: {
    '*': 'vp check --fix',
  },
  plugins: [react()],
});
