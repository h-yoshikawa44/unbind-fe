import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import './index.css';

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob('../app/pages/**/*.tsx');
    const page = pages[`../app/pages/${name}.tsx`];
    if (!page) throw new Error(`Inertia ページが見つかりません: ${name}`);
    const mod = await page();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- import.meta.glob の戻り値はページモジュール（default エクスポートあり）として信頼する
    return (mod as { default: unknown }).default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
