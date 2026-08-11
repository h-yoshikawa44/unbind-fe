import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RootLayout } from './layouts/RootLayout';
import { SentencesPage } from './pages/SentencesPage';
import { SentenceNewPage } from './pages/SentenceNewPage';
import { SentenceDetailPage } from './pages/SentenceDetailPage';
import { normalizeTags } from './types';

/**
 * 英文一覧のクエリパラメータ。
 * タグ絞り込みは `?tags=過去文,あいさつ文` のようにカンマ区切りで表現する。
 * キーワード絞り込みは `?q=hello world` のように空白区切りで表現する（複数キーワードは AND）。
 * ページングは `?page=2` のように 1 始まりのページ番号で表現する（1 ページ目は省略）。
 */
interface SentencesSearch {
  tags?: string;
  q?: string;
  page?: number;
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SentencesPage,
  validateSearch: (search: Record<string, unknown>): SentencesSearch => {
    const result: SentencesSearch = {};

    const rawTags = search.tags;
    if (typeof rawTags === 'string') {
      const tags = normalizeTags(rawTags.split(','));
      if (tags.length > 0) result.tags = tags.join(',');
    }

    const rawQ = search.q;
    if (typeof rawQ === 'string') {
      const q = rawQ.trim();
      if (q) result.q = q;
    }

    // ページ番号は 1 始まりの整数。1 ページ目は URL を汚さないよう省略する。
    const rawPage = search.page;
    const page = typeof rawPage === 'number' ? rawPage : Number(rawPage);
    if (Number.isInteger(page) && page > 1) result.page = page;

    return result;
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
