import type { ComponentType } from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import './index.css';

void createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob<{ default: ComponentType }>('../app/pages/**/*.tsx');
    const importPage = pages[`../app/pages/${name}.tsx`];
    if (!importPage) throw new Error(`Inertia ページが見つかりません: ${name}`);
    const mod = await importPage();
    return mod.default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
