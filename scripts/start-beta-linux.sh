#!/usr/bin/env bash
# ==============================================================================
# ModelMind — Linux Launcher
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/modelmind-source"
WEB_ORIGIN="https://modelmind-staging.onrender.com"
USER_DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/modelmind"
WORKSPACE_DIR="$HOME/ModelMind Notebooks"
JUPYTER_RUNTIME_DIR="$USER_DATA_DIR/jupyter/runtime"

fail() {
  printf '\n\033[31mModelMind setup error: %s\033[0m\n' "$1" >&2
  read -r -p "Press Enter to exit..." || true
  exit 1
}

# 1. Detect Node.js
NODE_BIN=""
if [[ -x "$ROOT_DIR/runtime/node/bin/node" ]]; then
  NODE_BIN="$ROOT_DIR/runtime/node/bin/node"
elif command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  fail "Node.js 20.9+ is required. Please install Node.js (e.g., sudo apt install nodejs or via fnm/nvm)."
fi

# Verify Node version >= 20.9
if ! "$NODE_BIN" -e 'const [m, n] = process.versions.node.split(".").map(Number); process.exit(m > 20 || (m === 20 && n >= 9) ? 0 : 1)'; then
  fail "Node.js version 20.9 or newer is required (found $("$NODE_BIN" -v)). Please update Node.js."
fi

# 2. Detect Python
PYTHON_BIN=""
if [[ -x "$ROOT_DIR/runtime/python/bin/python3" ]]; then
  PYTHON_BIN="$ROOT_DIR/runtime/python/bin/python3"
elif [[ -x "$USER_DATA_DIR/.venv/bin/python" ]]; then
  PYTHON_BIN="$USER_DATA_DIR/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1 && python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
else
  fail "Python 3.10 or newer is required. Please install Python (e.g., sudo apt install python3 python3-venv python3-pip)."
fi
export MODELMIND_PYTHON_EXECUTABLE="$PYTHON_BIN"

if [[ ! -f "$APP_DIR/scripts/run-local.mjs" ]]; then
  fail "ModelMind files are incomplete. Reinstall ModelMind and try again."
fi

mkdir -p "$USER_DATA_DIR" "$WORKSPACE_DIR" "$JUPYTER_RUNTIME_DIR"
export MODELMIND_USER_DATA_DIR="$USER_DATA_DIR"
if [[ -d "$ROOT_DIR/.venv" && -x "$ROOT_DIR/.venv/bin/python" ]] && "$ROOT_DIR/.venv/bin/python" -c "pass" >/dev/null 2>&1; then
  export MODELMIND_VENV_DIR="$ROOT_DIR/.venv"
else
  export MODELMIND_VENV_DIR="$USER_DATA_DIR/.venv"
fi
export JUPYTER_RUNTIME_DIR
export WORKSPACE="$WORKSPACE_DIR"
export ML_PLATFORM_CLOUD_FALLBACK="${ML_PLATFORM_CLOUD_FALLBACK:-disabled}"

# Free port 8000 if occupied by a conflicting foreign process
if command -v lsof >/dev/null 2>&1; then
  PID_8000="$(lsof -ti :8000 2>/dev/null || true)"
  if [[ -n "$PID_8000" ]]; then
    HEALTH_RESP="$(curl -s -m 2 http://127.0.0.1:8000/health 2>/dev/null || true)"
    if [[ "$HEALTH_RESP" != *"modelmind"* ]]; then
      echo "Port 8000 was occupied by conflicting process (PID $PID_8000). Freeing port 8000 for ModelMind..."
      kill -9 $PID_8000 2>/dev/null || true
      sleep 1
    fi
  fi
fi

# Copy sample datasets
for sample in "$ROOT_DIR"/50_Startups.csv "$ROOT_DIR"/test_dataset.csv "$ROOT_DIR"/messy_preprocessing_dataset.csv "$ROOT_DIR"/perceptron-cleaned-data.csv; do
  if [[ -f "$sample" && ! -f "$WORKSPACE_DIR/$(basename "$sample")" ]]; then
    cp "$sample" "$WORKSPACE_DIR/" 2>/dev/null || true
  fi
done

printf "\n\033[36m╔══════════════════════════════════════════════════════════════╗\033[0m\n"
printf "\033[36m║                  Starting ModelMind Platform                 ║\033[0m\n"
printf "\033[36m╚══════════════════════════════════════════════════════════════╝\033[0m\n\n"
printf "→ Opening dashboard in your browser: \033[32m%s\033[0m\n" "$WEB_ORIGIN"
printf "→ Local workspace: \033[33m%s\033[0m\n" "$WORKSPACE_DIR"
printf "→ Press \033[1mCtrl+C\033[0m to stop.\n\n"

# Launch default browser in Linux
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$WEB_ORIGIN" 2>/dev/null || true
elif command -v sensible-browser >/dev/null 2>&1; then
  sensible-browser "$WEB_ORIGIN" 2>/dev/null || true
elif command -v x-www-browser >/dev/null 2>&1; then
  x-www-browser "$WEB_ORIGIN" 2>/dev/null || true
fi

if MODELMIND_WEB_ORIGINS="$WEB_ORIGIN" "$NODE_BIN" "$APP_DIR/scripts/run-local.mjs" companion; then
  exit 0
else
  status=$?
  if [[ "$status" -ne 130 ]]; then
    fail "ModelMind stopped with exit code $status."
  fi
fi
