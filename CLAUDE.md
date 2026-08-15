# unbind-fe

英文を単語・句に分解して品詞や訳を付けて学習する Web アプリ。
**Hono + Inertia + React 19** 構成（サーバがルーティングとデータ取得を担い、React ページへ props を注入する）。
TypeScript(strict) + Vite+（vite-plus）。ランタイムは Node（`@hono/node-server`）。
構成の要点・落とし穴は `app/` 配下と、この後の「アーキテクチャの要点」を参照。

## コマンド（npm/pnpm ではなく vp を使う）

lint / format はパッケージマネージャではなく vite-plus の `vp` CLI で行う。

- チェック一括（lint + format 検査）: `vp check` / 自動修正: `vp check --fix`
- フォーマットのみ: `vp fmt`（`singleQuote`）
- 型チェック: `npm run typecheck`（= `tsc -b --noEmit`。solution 構成なので `-b` が必須。`tsc --noEmit` 単体では何も検査しない）
- 開発サーバ: `npm run dev`（cmk watch + `vp dev`。Hono を Vite ミドルウェアとして実行し http://localhost:5173 で配信）
- ビルド: `npm run build`（`generate` → `build:client`（`vp build`）→ `build:server`（`vp build --mode server`）の順。サーバは client のマニフェストを参照するため client → server の順が必須）
- 本番起動: `npm run start`（`node dist-server/index.js`。http://localhost:3000）
- **CSS Module のクラスを追加/削除したら `npm run generate`**（cmk が型を再生成。これを忘れると型が古いまま typecheck が通ってしまう）

## TypeScript 規約（型/リンタが強制するので違反するとエラー）

- `verbatimModuleSyntax` → 型のインポートは必ず `import type { ... }`
- `erasableSyntaxOnly` → `enum` と `namespace` は使わない
- `noUnusedLocals` / `noUnusedParameters` → 未使用の変数・引数を残さない
- 値の絞り込みに `as` を使わず、型ガードで行う（oxlint `no-unsafe-type-assertion`）。
  避けられない箇所（例: `JSON.parse` の結果）は理由コメント付きで `// eslint-disable-next-line` する
- `src` 配下は `@/` エイリアスで参照できる（`@/types` など）

## CSS Modules

- クラス名は **camelCase** で書く（例: `.sentenceList`）／TS 側は `styles.sentenceList` とドット参照
- 共通ボタンは `src/styles/button.module.css` を `buttonStyles` として import して使う
- CSS カスタムプロパティ（`--accent` 等）は全て `src/index.css` に集約（light / dark 両方定義済み）。
  色や余白のトークンを増やすときもここに追加する
- 型は cmk が `generated/` に生成する。`generated/**` は tsconfig の include・lint・format のいずれからも除外されている（手で編集しない）

## アーキテクチャの要点

- **`app/`＝サーバ + Inertia ページ、`src/`＝共有コード**（`@/` エイリアスは `src` を指す）
  - `app/server.tsx`: Hono ルート。**ルートは必ずメソッドチェーンで書く**（`new Hono().use(...).get(...).post(...)`）。別文の `app.get()` だと型がスキーマに蓄積されず、`PageProps<'...'>` が `never` になる
  - `app/store.ts`: データ層。現在は JSON ファイル（`data.json`）実装だが、関数シグネチャ・戻り値は REST API 形（`fetchSentences` = `GET /api/sentences` 等）に寄せてある。DB 導入時は中身だけ差し替える前提
  - `app/root-view.tsx`: HTML シェル。**Inertia の初期ページは `<script data-page="app" type="application/json">` の textContent で渡す**（v3 の `getInitialPageFromDOM` がこのセレクタで読む。`<div data-page>` 属性ではない）
  - `app/pages.gen.ts`: `@hono/inertia/vite` が自動生成（`PageProps<C>` の型元）。手編集・コミット禁止（gitignore 済み）
  - `src/client.tsx`: `createInertiaApp`（クライアントエントリ）
- データ取得・遷移・保存は Inertia 方式:
  - 取得: サーバの `c.render('Sentences/Xxx', props)` → ページは `PageProps<'Sentences/Xxx'>` で受領（`useEffect + fetch` は不要）
  - 遷移: `@inertiajs/react` の `<Link>` / `router.visit`（クライアントルータは無し）
  - 変更: `router.post/put/delete` → サーバは `c.redirect(url, 303)` で返す
  - `router.post/put` のペイロードは **`src/inertia.ts` の `toPayload()`** を通す（interface 由来のドメイン型は `RequestPayload` の index signature に構造的一致しないため。理由コメント付き `as` を 1 箇所に集約）
- 一覧の絞り込み・ページングは当面クライアント側（全件を props で受け、フィルタは state + `history.replaceState` で URL 同期）
- Token 型は DB スキーマ対応: `Token`（sentences 相当）+ `TokenAnalysis`（token_analyses 相当）を `TokenWithAnalysis` に結合してフロントで扱う

## 運用

- 応答・コミットメッセージ・PR は日本語で書く
- コミットは `feat:` / `docs:` などの接頭辞 + 日本語の要約 + `(#issue番号)` の形式（例: `feat: ページング機能を作成(#21)`）
