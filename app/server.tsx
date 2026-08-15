import { Hono } from 'hono';
import { inertia } from '@hono/inertia';
import type { TokenWithAnalysis } from '@/types';
import { rootView } from './root-view';
import {
  createSentence,
  deleteSentence,
  fetchAllTags,
  fetchSentence,
  fetchSentences,
  updateSentence,
} from './store';

// ルートはメソッドチェーンで定義する。
// こうすることで各 c.render の返り値型が app の型に蓄積され、
// pages.gen.ts の PageProps<'...'> がページ props を解決できるようになる。
const app = new Hono()
  .use(inertia({ rootView }))
  // 英文一覧。絞り込み・ページングは当面クライアント側で行うため全件を渡す。
  .get('/', async (c) => {
    const [sentences, allTags] = await Promise.all([fetchSentences(), fetchAllTags()]);
    return c.render('Sentences/Index', { sentences, allTags });
  })
  // 新規作成フォーム。
  .get('/sentences/new', async (c) => {
    const tagSuggestions = await fetchAllTags();
    return c.render('Sentences/New', { tagSuggestions });
  })
  // 英文詳細（編集）。存在しなければ sentence を null で渡す。
  .get('/sentences/:id', async (c) => {
    const [sentence, tagSuggestions] = await Promise.all([
      fetchSentence(c.req.param('id')),
      fetchAllTags(),
    ]);
    return c.render('Sentences/Show', { sentence, tagSuggestions });
  })
  // 英文を新規作成する（tokens はクライアントで tokenize 済みを受領）。
  .post('/sentences', async (c) => {
    const body = await c.req.json<{
      id: string;
      text: string;
      tokens: TokenWithAnalysis[];
      tags: string[];
    }>();
    const sentence = await createSentence(body.text, body.tokens, body.tags, body.id);
    return c.redirect(`/sentences/${sentence.id}`, 303);
  })
  // 英文のトークン分析データを更新する。
  .put('/sentences/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{
      tokens: TokenWithAnalysis[];
      naturalTranslation: string;
      tags: string[];
    }>();
    await updateSentence(id, body.tokens, body.naturalTranslation, body.tags);
    return c.redirect(`/sentences/${id}`, 303);
  })
  // 英文を削除する。
  .delete('/sentences/:id', async (c) => {
    await deleteSentence(c.req.param('id'));
    return c.redirect('/', 303);
  });

export default app;
