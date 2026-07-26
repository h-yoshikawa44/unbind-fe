import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RootLayout } from './layouts/RootLayout';
import { SentencesPage } from './pages/SentencesPage';
import { SentenceNewPage } from './pages/SentenceNewPage';
import { SentenceDetailPage } from './pages/SentenceDetailPage';
import { normalizeTags } from './types';

/**
 * 英文一覧のクエリパラメータ。
 * タグ絞り込みは `?tags=過去文,あいさつ文` のようにカンマ区切りで表現する。
 */
interface SentencesSearch {
  tags?: string;
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SentencesPage,
  validateSearch: (search: Record<string, unknown>): SentencesSearch => {
    const raw = search.tags;
    if (typeof raw !== 'string') return {};
    const tags = normalizeTags(raw.split(','));
    return tags.length > 0 ? { tags: tags.join(',') } : {};
  },
});

const sentenceNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sentences/new',
  component: SentenceNewPage,
});

const sentenceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sentences/$sentenceId',
  component: SentenceDetailPage,
});

const routeTree = rootRoute.addChildren([indexRoute, sentenceNewRoute, sentenceDetailRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
