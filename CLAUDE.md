# unbind-fe

英文を単語・句に分解して品詞や訳を付けて学習する Web アプリ。
React 19 + TypeScript(strict) + Vite+（vite-plus）。

## コマンド（npm/pnpm ではなく vp を使う）

lint / format はパッケージマネージャではなく vite-plus の `vp` CLI で行う。

- チェック一括（lint + format 検査）: `vp check` / 自動修正: `vp check --fix`
- フォーマットのみ: `vp fmt`（`singleQuote`）
- 型チェック: `npm run typecheck`（= `tsc -b --noEmit`。solution 構成なので `-b` が必須。`tsc --noEmit` 単体では何も検査しない）
- 開発サーバ: `npm run dev` / ビルド: `npm run build`
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

- `src/api.ts` は localStorage 実装だが、関数シグネチャ・戻り値は REST API 形（`fetchSentences` = `GET /api/sentences` 等）に寄せてある。バックエンド実装後は中身だけ fetch に差し替える前提
- Token 型は DB スキーマ対応: `Token`（sentences 相当）+ `TokenAnalysis`（token_analyses 相当）を `TokenWithAnalysis` に結合してフロントで扱う

## 運用

- 応答・コミットメッセージ・PR は日本語で書く
- コミットは `feat:` / `docs:` などの接頭辞 + 日本語の要約 + `(#issue番号)` の形式（例: `feat: ページング機能を作成(#21)`）
