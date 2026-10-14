#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/modelmind-source"
WEB_ORIGIN="https://modelmind-staging.onrender.com"

fail() {
  printf '\nModelMind setup could not continue: %s\n' "$1" >&2
  read -r -p "Press Return to close this window..." || true
  exit 1
}

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  fail "Install Node.js 20.9 or newer from https://nodejs.org/en/download, then run this script again."
fi

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 20 || (major === 20 && minor >= 9) ? 0 : 1)'; then
  fail "Node.js 20.9 or newer is required. Update Node.js and run this script again."
fi

if ! command -v python3 >/dev/null 2>&1; then
  fail "Install Python 3 from https://www.python.org/downloads/, then run this script again."
fi

if [[ ! -f "$APP_DIR/package-lock.json" ]]; then
  fail "The extracted beta folder is incomplete. Extract the full ZIP and try again."
fi

if [[ ! -x "$APP_DIR/node_modules/.bin/next" ]]; then
  printf 'Installing ModelMind dependencies. This may take several minutes...\n'
  if ! (cd "$APP_DIR" && npm ci); then
    fail "Node dependency installation failed. Check your internet connection and try again."
  fi
fi

if ! open "$WEB_ORIGIN"; then
  fail "Could not open the ModelMind dashboard in your browser."
fi

printf '\nStarting the local ModelMind notebook services. Keep this window open.\n'
cd "$APP_DIR"
if MODELMIND_WEB_ORIGINS="$WEB_ORIGIN" npm run companion; then
  exit 0
else
  status=$?
  if [[ "$status" -ne 130 ]]; then
    fail "The local companion stopped with exit code $status. Review the messages above."
  fi
fi
