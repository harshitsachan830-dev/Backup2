#!/usr/bin/env bash
# ==============================================================================
# ModelMind — Package Linux Standalone Distribution (.tar.gz)
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_ROOT="${RUNNER_TEMP:-$ROOT_DIR/.package-temp}/modelmind-linux"
APP_DIR="$PACKAGE_ROOT/modelmind"
PYTHON_VERSION="3.12.15"
PYTHON_BUILD_DATE="20261013"
APP_VERSION="${MODELMIND_APP_VERSION:-0.3.0}"

rm -rf "$PACKAGE_ROOT"
mkdir -p "$APP_DIR/runtime/node/bin" "$APP_DIR/runtime/python"

git -C "$ROOT_DIR" archive HEAD | tar -x -C "$APP_DIR"
if [[ ! -f "$APP_DIR/modelmind-source/scripts/run-local.mjs" ]]; then
  printf 'The archived ModelMind companion files are incomplete.\n' >&2
  exit 1
fi

if [[ -d "$ROOT_DIR/extensions/error-assistant/ml_platform_error_assistant/labextension" ]]; then
  mkdir -p "$APP_DIR/extensions/error-assistant/ml_platform_error_assistant/labextension"
  cp -R "$ROOT_DIR/extensions/error-assistant/ml_platform_error_assistant/labextension/"* \
    "$APP_DIR/extensions/error-assistant/ml_platform_error_assistant/labextension/"
fi

# Bundle Node.js binary
node_binary="$(node -p 'process.execPath')"
cp "$node_binary" "$APP_DIR/runtime/node/bin/node"
chmod +x "$APP_DIR/runtime/node/bin/node"

# Download Python standalone build for Linux
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64)
    python_arch="x86_64"
    python_sha256="4cf774be0a3d5b2cf030bbafe3f6284260321aa71a5fae804fbfb0153835e557"
    ;;
  aarch64|arm64)
    python_arch="aarch64"
    python_sha256="9bc02be55fbbce3e08f0290caab722c1bc1651e4431eefc0eb2617f0ea58a8a6"
    ;;
  *)
    printf 'Unsupported Linux architecture: %s\n' "$ARCH" >&2
    exit 1
    ;;
esac

python_archive="cpython-${PYTHON_VERSION}+${PYTHON_BUILD_DATE}-${python_arch}-unknown-linux-gnu-install_only.tar.gz"
python_archive_path="$PACKAGE_ROOT/$python_archive"
python_archive_url="https://github.com/astral-sh/python-build-standalone/releases/download/${PYTHON_BUILD_DATE}/$(printf '%s' "$python_archive" | sed 's/+/%2B/g')"

if curl --fail --location --silent --show-error "$python_archive_url" --output "$python_archive_path" 2>/dev/null; then
  tar -xzf "$python_archive_path" -C "$APP_DIR/runtime/python" --strip-components=1
  rm -f "$python_archive_path"
fi

chmod +x "$APP_DIR/scripts/"*.sh 2>/dev/null || true

# Package tarball
asset_suffix="${MODELMIND_PACKAGE_SUFFIX:-Linux-x64}"
TAR_FINAL="${RUNNER_TEMP:-$ROOT_DIR}/ModelMind-Setup-${asset_suffix}.tar.gz"

tar -czf "$TAR_FINAL" -C "$PACKAGE_ROOT" modelmind
printf 'Built Linux standalone package successfully: %s\n' "$TAR_FINAL"
