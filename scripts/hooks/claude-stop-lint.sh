#!/bin/sh
# Claude Code Stop hook: if wiki/ has uncommitted changes, run lint:wiki and
# feed violations back to Claude (exit 2) so it fixes them before finishing.
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
# Already continuing because of this hook once — don't loop forever.
grep -q '"stop_hook_active": *true' && exit 0
[ -n "$(git status --porcelain -- wiki/)" ] || exit 0
out=$(npm run --silent lint:wiki 2>&1) && exit 0
printf '%s\n' "$out" >&2
echo "wiki lint 위반이 있습니다. 위 항목을 고친 뒤 npm run lint:wiki가 통과하는지 확인하세요." >&2
exit 2
