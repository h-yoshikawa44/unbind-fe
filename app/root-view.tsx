import { renderToString } from 'react-dom/server';
import { serializePage, type RootView } from '@hono/inertia';
import { ReactRefresh, Script, ViteClient } from 'vite-ssr-components/react';

const Document = ({ page }: { page: Parameters<RootView>[0] }) => (
  <html lang="ja">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <ViteClient />
      <ReactRefresh />
      <Script src="/src/client.tsx" type="module" />
    </head>
    <body>
      {/* Inertia v3 は script[data-page="app"][type="application/json"] の textContent から初期ページを読む */}
      <script
        data-page="app"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: serializePage(page) }}
      />
      <div id="app" />
    </body>
  </html>
);

export const rootView: RootView = (page) =>
  '<!DOCTYPE html>' + renderToString(<Document page={page} />);
