#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_ROOT="${RUNNER_TEMP:-$ROOT_DIR/.package-temp}/modelmind-macos"
APP_BUNDLE="$PACKAGE_ROOT/ModelMind.app"
APP_CONTENTS="$APP_BUNDLE/Contents"
APP_RESOURCES="$APP_CONTENTS/Resources/app"

rm -rf "$PACKAGE_ROOT"
mkdir -p "$APP_CONTENTS/MacOS" "$APP_RESOURCES/runtime/node/bin" \
  "$APP_RESOURCES/runtime/python"
git -C "$ROOT_DIR" archive HEAD | tar -x -C "$APP_RESOURCES"
if [[ ! -f "$APP_RESOURCES/modelmind-source/scripts/run-local.mjs" ]]; then
  printf 'The archived ModelMind companion files are incomplete.\n' >&2
  exit 1
fi

node_binary="$(node -p 'process.execPath')"
python_prefix="$(python -c 'import sys; print(sys.prefix)')"
cp "$node_binary" "$APP_RESOURCES/runtime/node/bin/node"
chmod +x "$APP_RESOURCES/runtime/node/bin/node"
cp -R "$python_prefix"/. "$APP_RESOURCES/runtime/python/"

cat > "$APP_CONTENTS/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>ModelMind</string>
  <key>CFBundleIdentifier</key>
  <string>com.modelmind.companion</string>
  <key>CFBundleName</key>
  <string>ModelMind</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleVersion</key>
  <string>0.1.0</string>
</dict>
</plist>
PLIST

cat > "$APP_CONTENTS/MacOS/ModelMind" <<'LAUNCHER'
#!/bin/bash
set -euo pipefail
app_dir="$(cd "$(dirname "$0")/../Resources/app" && pwd)"
open -a Terminal "$app_dir/scripts/start-beta-macos.command"
LAUNCHER
chmod +x "$APP_CONTENTS/MacOS/ModelMind"
chmod +x "$APP_RESOURCES/scripts/start-beta-macos.command"

runtime_python="$APP_RESOURCES/runtime/python/bin/python3"
if [[ ! -x "$runtime_python" ]]; then
  runtime_python="$APP_RESOURCES/runtime/python/bin/python3.12"
fi
if [[ ! -x "$runtime_python" ]]; then
  printf 'Bundled Python runtime is missing or not executable.\n' >&2
  exit 1
fi
"$runtime_python" --version
"$APP_RESOURCES/runtime/node/bin/node" --version
"$runtime_python" -m venv \
  "$PACKAGE_ROOT/runtime-smoke-test"
venv_config="$PACKAGE_ROOT/runtime-smoke-test/pyvenv.cfg"
if ! grep -F "$APP_RESOURCES/runtime/python" "$venv_config" >/dev/null; then
  printf 'The packaged Python runtime is not relocatable.\n' >&2
  exit 1
fi
"$PACKAGE_ROOT/runtime-smoke-test/bin/python" --version
rm -rf "$PACKAGE_ROOT/runtime-smoke-test"

asset_suffix="${MODELMIND_PACKAGE_SUFFIX:-macOS}"
pkgbuild \
  --root "$PACKAGE_ROOT" \
  --identifier com.modelmind.companion \
  --version 0.1.0 \
  --install-location /Applications \
  "${RUNNER_TEMP:-$ROOT_DIR}/ModelMind-Setup-${asset_suffix}.pkg"
