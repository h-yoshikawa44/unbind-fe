#!/usr/bin/env bash
# PostToolUse(Write|Edit|NotebookEdit): このセッションでファイル編集が発生したことを
# 印(フラグファイル)として記録する。Stop フックはこの印がある時だけチェックを走らせる。
set -uo pipefail

input="$(cat)"
# stdin の JSON から session_id を取り出す(jq が無い環境なので sed で抽出)
session_id="$(printf '%s' "$input" | tr -d '\n' | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
[ -n "$session_id" ] || session_id="default"

cd "${CLAUDE_PROJECT_DIR:-}" 2>/dev/null || cd "$(dirname "$0")/../.." || exit 0

mkdir -p node_modules/.tmp 2>/dev/null || exit 0
: > "node_modules/.tmp/claude-check.${session_id}"

exit 0
