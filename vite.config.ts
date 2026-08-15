import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite-plus';
import react from '@vitejs/plugin-react';
import devServer from '@hono/vite-dev-server';
import nodeBuild from '@hono/vite-build/node';
import { inertiaPages } from '@hono/inertia/vite';
import ssrPlugin from 'vite-ssr-components/plugin';

// クライアントビルドが出力する manifest のパス（サーバビルド時に読み込む）。
const CLIENT_MANIFEST = './dist/.vite/manifest.json';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // mode=server のときだけ Hono サーバを Node 向けにビルドする。
  const isServerBuild = command === 'build' && mode === 'server';

  return {
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
      // generated/** は cmk、app/pages.gen.ts は @hono/inertia/vite の自動生成物
      ignorePatterns: ['generated/**', 'app/pages.gen.ts', 'dist/**', 'dist-server/**'],
    },
    fmt: {
      singleQuote: true,
      ignorePatterns: ['generated/**', 'app/pages.gen.ts', 'dist/**', 'dist-server/**'],
    },
    staged: {
      '*': 'vp check --fix',
    },
    // 本番では vite-ssr-components の <Script> がこの define からハッシュ付き asset を解決する。
    define: isServerBuild
      ? {
          'import.meta.env.VITE_MANIFEST_CONTENT': JSON.stringify(
            readFileSync(CLIENT_MANIFEST, 'utf-8'),
          ),
        }
      : {},
    plugins: [
      react(),
      inertiaPages(),
      ...(isServerBuild
        ? [
            // Hono アプリを Node 向けにビルドし、@hono/node-server で起動する単一エントリを生成する。
            // クライアント資産（/assets/*）は dist から serveStatic で配信する。
            nodeBuild({
              entry: 'app/server.tsx',
              outputDir: './dist-server',
              staticPaths: ['/assets/*'],
              staticRoot: './dist',
              port: 3000,
            }),
          ]
        : [
            // dev のみ Hono を Vite ミドルウェアとして実行する。
            ...(command === 'serve'
              ? [devServer({ entry: 'app/server.tsx', injectClientScript: false })]
              : []),
            // クライアントビルド / dev の資産解決を担う。
            ...ssrPlugin(),
          ]),
    ],
  };
});
