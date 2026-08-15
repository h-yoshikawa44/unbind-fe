#!/usr/bin/env bash
# Stop hook: 編集を伴うターンの終了時だけチェックを実行する。
# mark-dirty.sh が付けた印(フラグ)がある時のみ動く。
#   - CSS Module を編集していれば、まず npm run generate で型を再生成する
#     (typecheck はこの生成型に依存するため必ず先に走らせる)
#   - その後 npm run typecheck と npm run lint を実行する
# どれかが失敗したら出力を stderr に流し exit 2 で終了する。
# exit 2 は Claude Code にとって blocking error で、stderr の内容が Claude に
# 差し戻され、問題を修正する作業が継続される。すべて通れば印を消して exit 0。
set -uo pipefail

input="$(cat)"
session_id="$(printf '%s' "$input" | tr -d '\n' | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
[ -n "$session_id" ] || session_id="default"

# フックは CLAUDE_PROJECT_DIR で起動されるが、念のためスクリプト位置からも辿れるようにする。
cd "${CLAUDE_PROJECT_DIR:-}" 2>/dev/null || cd "$(dirname "$0")/../.." || exit 0

flag="node_modules/.tmp/claude-check.${session_id}"
css_flag="node_modules/.tmp/claude-css.${session_id}"

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

fail_exit() {
  {
    echo ""
    echo "上記のエラーを修正してください。"
  } >&2
  # 印は残す。修正後に再び Stop で走り、グリーンになるまで繰り返す。
  exit 2
}

# CSS Module を編集していたら型を再生成(typecheck より前に必ず実行)
if [ -f "$css_flag" ]; then
  run "npm run generate" npm run generate
  if [ "$status" -ne 0 ]; then
    # 生成に失敗したら型が古いまま typecheck しても混乱するのでここで打ち切る
    fail_exit
  fi
  rm -f "$css_flag"
fi

run "npm run typecheck" npm run typecheck
run "npm run lint" npm run lint

if [ "$status" -ne 0 ]; then
  fail_exit
fi

# すべて通ったので印を消す(以降の編集の無いターンでは走らない)
rm -f "$flag"
exit 0
