import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RootLayout } from './layouts/RootLayout';
import { SentencesPage } from './pages/SentencesPage';
import { SentenceNewPage } from './pages/SentenceNewPage';
import { SentenceDetailPage } from './pages/SentenceDetailPage';

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SentencesPage,
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
