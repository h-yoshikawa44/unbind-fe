import { Hono } from 'hono';
import { inertia } from '@hono/inertia';
import { zValidator } from '@hono/zod-validator';
import { createSentenceBodySchema, updateSentenceBodySchema } from '@/schemas';
import { rootView } from './root-view';
import {
  createSentence,
  deleteSentence,
  fetchAllTags,
  fetchSentence,
  fetchSentences,
  toDataErrorMessage,
  updateSentence,
} from './store';

// ルートはメソッドチェーンで定義する。
// こうすることで各 c.render の返り値型が app の型に蓄積され、
// pages.gen.ts の PageProps<'...'> がページ props を解決できるようになる。
const app = new Hono()
  .use(inertia({ rootView }))
  // 英文一覧。絞り込み・ページングは当面クライアント側で行うため全件を渡す。
  .get('/', async (c) => {
    try {
      const [sentences, allTags] = await Promise.all([fetchSentences(), fetchAllTags()]);
      return c.render('Sentences/Index', { sentences, allTags });
    } catch (err) {
      // データ取得・検証に失敗してもアプリを落とさず、エラーページを表示する。
      return c.render('Error', { message: toDataErrorMessage(err) });
    }
  })
  // 新規作成フォーム。
  .get('/sentences/new', async (c) => {
    try {
      const tagSuggestions = await fetchAllTags();
      return c.render('Sentences/New', { tagSuggestions });
    } catch (err) {
      return c.render('Error', { message: toDataErrorMessage(err) });
    }
  })
  // 英文詳細（編集）。存在しなければ sentence を null で渡す。
  .get('/sentences/:id', async (c) => {
    try {
      const [sentence, tagSuggestions] = await Promise.all([
        fetchSentence(c.req.param('id')),
        fetchAllTags(),
      ]);
      return c.render('Sentences/Show', { sentence, tagSuggestions });
    } catch (err) {
      return c.render('Error', { message: toDataErrorMessage(err) });
    }
  })
  // 英文を新規作成する（tokens はクライアントで tokenize 済みを受領）。
  .post('/sentences', zValidator('json', createSentenceBodySchema), async (c) => {
    const body = c.req.valid('json');
    const sentence = await createSentence(body.text, body.tokens, body.tags, body.id);
    return c.redirect(`/sentences/${sentence.id}`, 303);
  })
  // 英文のトークン分析データを更新する。
  .put('/sentences/:id', zValidator('json', updateSentenceBodySchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    await updateSentence(id, body.tokens, body.naturalTranslation, body.tags);
    return c.redirect(`/sentences/${id}`, 303);
  })
  // 英文を削除する。
  .delete('/sentences/:id', async (c) => {
    await deleteSentence(c.req.param('id'));
    return c.redirect('/', 303);
  });

// 各ハンドラで捕捉しきれなかった例外（作成・更新・削除時のデータエラー等）の最終防衛線。
// 500 で落とさず、エラーページを描画する。
app.onError((err, c) => {
  console.error(err);
  return c.render('Error', { message: toDataErrorMessage(err) });
});

export default app;
