#!/usr/bin/env bash
# PostToolUse(Write|Edit|NotebookEdit): このセッションでファイル編集が発生したことを
# 印(フラグファイル)として記録する。Stop フックはこの印がある時だけチェックを走らせる。
# さらに編集対象が *.module.css なら「CSS変更フラグ」も付け、Stop 側で
# typecheck の前に npm run generate(cmk による型再生成)を走らせる。
set -uo pipefail

input="$(cat)"
# stdin の JSON から値を取り出す(jq が無い環境なので sed で抽出)
squished="$(printf '%s' "$input" | tr -d '\n')"
session_id="$(printf '%s' "$squished" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
file_path="$(printf '%s' "$squished" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
[ -n "$session_id" ] || session_id="default"

cd "${CLAUDE_PROJECT_DIR:-}" 2>/dev/null || cd "$(dirname "$0")/../.." || exit 0

mkdir -p node_modules/.tmp 2>/dev/null || exit 0
: > "node_modules/.tmp/claude-check.${session_id}"

# CSS Module を編集/新規作成したら型再生成が必要
case "$file_path" in
  *.module.css) : > "node_modules/.tmp/claude-css.${session_id}" ;;
esac

exit 0
