#!/usr/bin/env bash
# Stop hook: 編集を伴うターンの終了時だけ typecheck と lint を実行する。
# mark-dirty.sh が付けた印(フラグ)がある時のみ動く。
# どちらかが失敗したら出力を stderr に流し exit 2 で終了する。
# exit 2 は Claude Code にとって blocking error で、stderr の内容が Claude に
# 差し戻され、問題を修正する作業が継続される。すべて通れば印を消して exit 0。
set -uo pipefail

input="$(cat)"
session_id="$(printf '%s' "$input" | tr -d '\n' | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
[ -n "$session_id" ] || session_id="default"

# フックは CLAUDE_PROJECT_DIR で起動されるが、念のためスクリプト位置からも辿れるようにする。
cd "${CLAUDE_PROJECT_DIR:-}" 2>/dev/null || cd "$(dirname "$0")/../.." || exit 0

flag="node_modules/.tmp/claude-check.${session_id}"

# このターンで編集が無ければ(印が無ければ)何もしない
[ -f "$flag" ] || exit 0

status=0

run() {
  local label="$1"
  shift
  local result code
  result="$("$@" 2>&1)"
  code=$?
  if [ "$code" -ne 0 ]; then
    status=1
    {
      echo ""
      echo "===== ${label} failed (exit ${code}) ====="
      echo "${result}"
    } >&2
  fi
}

run "npm run typecheck" npm run typecheck
run "npm run lint" npm run lint

if [ "$status" -ne 0 ]; then
  {
    echo ""
    echo "typecheck / lint に問題があります。上記のエラーを修正してください。"
  } >&2
  # 印は残す。修正後に再び Stop で走り、グリーンになるまで繰り返す。
  exit 2
fi

# すべて通ったので印を消す(以降の編集の無いターンでは走らない)
rm -f "$flag"
exit 0
