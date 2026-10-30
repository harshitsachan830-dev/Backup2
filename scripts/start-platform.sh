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
export ML_PLATFORM_CLOUD_FALLBACK="${ML_PLATFORM_CLOUD_FALLBACK:-disabled}"

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
EXTENSION_SOURCE="$ROOT_DIR/extensions/error-assistant/ml_platform_error_assistant/labextension"
EXTENSION_WHEEL_DIR="$ROOT_DIR/wheels"

install_extension() {
  local wheel_files=("$EXTENSION_WHEEL_DIR"/ml_platform_error_assistant-*.whl)
  if [[ -f "${wheel_files[0]}" ]]; then
    if ((${#wheel_files[@]} != 1)); then
      echo "Expected one bundled ModelMind extension wheel, found ${#wheel_files[@]}." >&2
      return 1
    fi
    echo "Installing bundled ModelMind extension ${wheel_files[0]##*/}..."
    "$PYTHON_BIN" -m pip install --no-deps --force-reinstall "${wheel_files[0]}"
  else
    echo "Installing ModelMind extension from the bundled source..."
    "$PYTHON_BIN" -m pip install --no-deps --no-build-isolation --force-reinstall \
      "$ROOT_DIR/extensions/error-assistant"
  fi
}

extension_is_current() {
  [[ -f "$EXTENSION_SOURCE/package.json" ]] || return 1
  "$PYTHON_BIN" "$ROOT_DIR/scripts/check-extension-wheel.py" \
    --installed "$EXTENSION_LINK" >/dev/null 2>&1
}

NEEDS_DEPENDENCIES=0
if [[ ! -x "$JUPYTER_BIN" || "${MODELMIND_SETUP_ONLY:-0}" == "1" ]]; then
  NEEDS_DEPENDENCIES=1
  echo "Installing ModelMind dependencies into virtual environment..."
  "$PYTHON_BIN" -m pip install --upgrade pip
  "$PYTHON_BIN" -m pip install -r "$ROOT_DIR/requirements.txt"
  "$PYTHON_BIN" -m pip install -r "$ROOT_DIR/modelmind-source/backend/requirements.txt"
fi

# User data virtual environments persist across app upgrades. Refresh the
# bundled Python package and JupyterLab assets when either version or build
# entry changes; otherwise the UI can silently keep loading an older chatbot.
if ((NEEDS_DEPENDENCIES)) || ! extension_is_current; then
  install_extension
fi

if [[ "${MODELMIND_SETUP_ONLY:-0}" == "1" ]]; then
  echo "ModelMind Python environment is ready."
  exit 0
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama is not installed. The local AI route is optional; install it from https://ollama.com/download"
  echo "Model installation remains explicit and must be approved before any pull command."
fi

exec "$PYTHON_BIN" -m jupyterlab \
  --no-browser \
  --port "$PORT" \
  --ServerApp.ip=127.0.0.1 \
  --ServerApp.token='' \
  --ServerApp.password='' \
  --IdentityProvider.token='' \
  --IdentityProvider.password='' \
  --ServerApp.open_browser=False \
  --ExtensionApp.open_browser=False \
  --LabServerApp.open_browser=False \
  --ServerApp.root_dir "$WORKSPACE" \
  --ServerApp.jpserver_extensions="ml_platform_error_assistant=True"
