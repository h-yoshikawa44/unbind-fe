import { Hono } from 'hono';
import { inertia } from '@hono/inertia';
import { rootView } from './root-view';

const app = new Hono();

app.use(inertia({ rootView }));

// Step 0 検証用の暫定ルート（互換性確認後に本実装へ置き換える）
app.get('/', (c) => c.render('Home', { message: 'Hono + Inertia 稼働確認' }));

export default app;

// PageProps<C> が Hono アプリのルート型から props を解決できるよう AppRegistry を登録する
declare module '@hono/inertia' {
  interface AppRegistry {
    app: typeof app;
  }
}
