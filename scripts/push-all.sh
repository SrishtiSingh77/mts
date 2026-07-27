#!/usr/bin/env bash
#
# Push to both repositories in one go.
#
#   origin -> SrishtiSingh77/mts               full monorepo (backend + frontend)
#   scaler -> SrishtiSingh77/scalerAssignment1 frontend only, at the repo root
#
# The second repo is produced with `git subtree`, which rewrites the frontend/
# directory so its contents sit at the root — a normal Next.js app that Vercel
# detects with Root Directory left blank.
#
# Usage:  ./scripts/push-all.sh [branch]     (branch defaults to main)

set -euo pipefail

BRANCH="${1:-main}"
FRONTEND_REMOTE="scaler"
FRONTEND_URL="https://github.com/SrishtiSingh77/scalerAssignment1.git"

cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty — commit before pushing." >&2
  git status --short >&2
  exit 1
fi

# Make sure the frontend remote exists and points at the right place.
if git remote get-url "$FRONTEND_REMOTE" >/dev/null 2>&1; then
  git remote set-url "$FRONTEND_REMOTE" "$FRONTEND_URL"
else
  git remote add "$FRONTEND_REMOTE" "$FRONTEND_URL"
fi

echo "==> origin ($BRANCH): full repo"
git push origin "$BRANCH"

echo
echo "==> $FRONTEND_REMOTE ($BRANCH): frontend/ as repo root"
# subtree push always recomputes from history, so it is safe to re-run.
git subtree push --prefix=frontend "$FRONTEND_REMOTE" "$BRANCH"

echo
echo "==> done"
printf '    monorepo : %s\n' "$(git rev-parse --short HEAD)"
printf '    frontend : %s\n' "$(git ls-remote --heads "$FRONTEND_REMOTE" "$BRANCH" | cut -c1-7)"
