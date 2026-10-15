#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_DATA_DIR="${MODELMIND_USER_DATA_DIR:-$ROOT_DIR}"
VENV_DIR="${MODELMIND_VENV_DIR:-${VENV_DIR:-$ROOT_DIR/.venv}}"
PORT="${PORT:-8899}"
WORKSPACE="${WORKSPACE:-$ROOT_DIR}"
ENV_FILE="$USER_DATA_DIR/.env"
export MODELMIND_JUPYTER_PORT="$PORT"
export JUPYTER_CONFIG_PATH="$ROOT_DIR/jupyter-config${JUPYTER_CONFIG_PATH:+:$JUPYTER_CONFIG_PATH}"

if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key value || [[ -n "$key" ]]; do
    key="${key%%[[:space:]]*}"
    value="${value%$'\r'}"
    [[ -z "$key" || "$key" == \#* ]] && continue
    case "$key" in
      ML_PLATFORM_CLOUD_FALLBACK|GEMINI_API_KEY|GEMINI_MODEL|MODELMIND_WEB_ORIGINS)
        if [[ ${#value} -ge 2 && ( "$value" == \"*\" || "$value" == \'*\' ) ]]; then
          value="${value:1:${#value}-2}"
        fi
        export "$key=$value"
        ;;
    esac
  done < "$ENV_FILE"
  echo "Loaded Gemini settings from .env (values hidden)."
fi

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  echo "Creating local virtual environment at $VENV_DIR"
  mkdir -p "$(dirname "$VENV_DIR")"
  if [[ -n "${MODELMIND_PYTHON_EXECUTABLE:-}" ]]; then
    "$MODELMIND_PYTHON_EXECUTABLE" -m venv "$VENV_DIR"
  elif [[ -x "$ROOT_DIR/runtime/python/bin/python3.12" ]]; then
    "$ROOT_DIR/runtime/python/bin/python3.12" -m venv "$VENV_DIR"
  elif [[ -x "$ROOT_DIR/runtime/python/bin/python3" ]]; then
    "$ROOT_DIR/runtime/python/bin/python3" -m venv "$VENV_DIR"
  else
    python3 -m venv "$VENV_DIR"
  fi
fi

PYTHON_BIN="$VENV_DIR/bin/python"
JUPYTER_BIN="$VENV_DIR/bin/jupyter"
EXTENSION_LINK="$VENV_DIR/share/jupyter/labextensions/@ml-platform/error-assistant"

if [[ ! -x "$JUPYTER_BIN" || "${MODELMIND_SETUP_ONLY:-0}" == "1" ]]; then
  echo "Installing ModelMind dependencies into virtual environment..."
  "$PYTHON_BIN" -m pip install --upgrade pip
  "$PYTHON_BIN" -m pip install -r "$ROOT_DIR/requirements.txt"
  "$PYTHON_BIN" -m pip install -r "$ROOT_DIR/modelmind-source/backend/requirements.txt"
  if [[ -L "$EXTENSION_LINK" ]]; then
    unlink "$EXTENSION_LINK"
  fi
  # Install the ModelMind extension. Prefer a pre-built wheel (no network or
  # Node.js required); fall back to a source install with --no-build-isolation
  # so the venv's own hatchling is reused instead of downloading from PyPI.
  if ls "$ROOT_DIR"/wheels/ml_platform_error_assistant-*.whl 1>/dev/null 2>&1; then
    echo "Installing ModelMind extension from pre-built wheel..."
    "$PYTHON_BIN" -m pip install --no-deps "$ROOT_DIR"/wheels/ml_platform_error_assistant-*.whl
  else
    echo "Pre-built wheel not found – installing from source (requires hatchling)..."
    "$PYTHON_BIN" -m pip install --no-build-isolation "$ROOT_DIR/extensions/error-assistant"
  fi
fi

if [[ "${MODELMIND_SETUP_ONLY:-0}" == "1" ]]; then
  echo "ModelMind Python environment is ready."
  exit 0
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama is not installed. The local AI route is optional; install it from https://ollama.com/download"
  echo "Model installation remains explicit and must be approved before any pull command."
fi

exec "$JUPYTER_BIN" lab \
  --port "$PORT" \
  --ServerApp.ip=127.0.0.1 \
  --ServerApp.token='' \
  --ServerApp.password='' \
  --ServerApp.open_browser=True \
  --LabServerApp.open_browser=True \
  --ServerApp.root_dir "$WORKSPACE"
