#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/modelmind-source"
WEB_ORIGIN="https://modelmind-staging.onrender.com"
PACKAGED_NODE="$ROOT_DIR/runtime/node/bin/node"
PACKAGED_PYTHON="$ROOT_DIR/runtime/python/bin/python3"
USER_DATA_DIR="$HOME/Library/Application Support/ModelMind"
WORKSPACE_DIR="$HOME/ModelMind Notebooks"

fail() {
  printf '\nModelMind setup could not continue: %s\n' "$1" >&2
  read -r -p "Press Return to close this window..." || true
  exit 1
}

if [[ -x "$PACKAGED_NODE" ]]; then
  NODE_BIN="$PACKAGED_NODE"
elif command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  fail "The bundled Node.js runtime is missing. Reinstall ModelMind or install Node.js 20.9 or newer."
fi

if ! "$NODE_BIN" -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 20 || (major === 20 && minor >= 9) ? 0 : 1)'; then
  fail "Node.js 20.9 or newer is required. Update Node.js and run this script again."
fi

if [[ -x "$PACKAGED_PYTHON" ]]; then
  PYTHON_BIN="$PACKAGED_PYTHON"
elif [[ -x "$ROOT_DIR/runtime/python/bin/python3.12" ]]; then
  PYTHON_BIN="$ROOT_DIR/runtime/python/bin/python3.12"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
else
  fail "The bundled Python runtime is missing. Reinstall ModelMind or install Python 3.10 or newer."
fi

if ! "$PYTHON_BIN" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)'; then
  fail "Python 3.10 or newer is required. Update the bundled runtime or install a supported Python version."
fi

if [[ ! -f "$APP_DIR/scripts/run-local.mjs" ]]; then
  fail "The ModelMind companion files are incomplete. Reinstall ModelMind and try again."
fi

mkdir -p "$USER_DATA_DIR" "$WORKSPACE_DIR"
export MODELMIND_USER_DATA_DIR="$USER_DATA_DIR"
export MODELMIND_VENV_DIR="$USER_DATA_DIR/.venv"
export WORKSPACE="$WORKSPACE_DIR"

if ! open "$WEB_ORIGIN"; then
  fail "Could not open the ModelMind dashboard in your browser."
fi

printf '\nStarting the local ModelMind notebook services. Keep this window open.\n'
if MODELMIND_WEB_ORIGINS="$WEB_ORIGIN" "$NODE_BIN" "$APP_DIR/scripts/run-local.mjs" companion; then
  exit 0
else
  status=$?
  if [[ "$status" -ne 130 ]]; then
    fail "The local companion stopped with exit code $status. Review the messages above."
  fi
fi
