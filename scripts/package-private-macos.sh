#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_ROOT="${RUNNER_TEMP:-$ROOT_DIR/.package-temp}/modelmind-macos"
APP_BUNDLE="$PACKAGE_ROOT/ModelMind.app"
APP_CONTENTS="$APP_BUNDLE/Contents"
APP_RESOURCES="$APP_CONTENTS/Resources/app"
PYTHON_VERSION="3.12.15"
PYTHON_BUILD_DATE="20261013"
APP_VERSION="${MODELMIND_APP_VERSION:-0.1.4}"

rm -rf "$PACKAGE_ROOT"
mkdir -p "$APP_CONTENTS/MacOS" "$APP_RESOURCES/runtime/node/bin" \
  "$APP_RESOURCES/runtime/python"
git -C "$ROOT_DIR" archive HEAD | tar -x -C "$APP_RESOURCES"
if [[ ! -f "$APP_RESOURCES/modelmind-source/scripts/run-local.mjs" ]]; then
  printf 'The archived ModelMind companion files are incomplete.\n' >&2
  exit 1
fi

if [[ -d "$ROOT_DIR/extensions/error-assistant/ml_platform_error_assistant/labextension" ]]; then
  mkdir -p "$APP_RESOURCES/extensions/error-assistant/ml_platform_error_assistant/labextension"
  cp -R "$ROOT_DIR/extensions/error-assistant/ml_platform_error_assistant/labextension/"* \
    "$APP_RESOURCES/extensions/error-assistant/ml_platform_error_assistant/labextension/"
fi

node_binary="$(node -p 'process.execPath')"
cp "$node_binary" "$APP_RESOURCES/runtime/node/bin/node"
chmod +x "$APP_RESOURCES/runtime/node/bin/node"

case "$(uname -m)" in
  arm64)
    python_arch="aarch64"
    python_sha256="ba32036ad8f4c434d97a1ee7feef8b7edc0fac16777639b97e39c74a108e4440"
    ;;
  x86_64)
    python_arch="x86_64"
    python_sha256="9686ddd8639b855905447ea4a16eb54a804a9ef12afbe7c9ecb1412d9c1fbc98"
    ;;
  *)
    printf 'Unsupported macOS architecture: %s\n' "$(uname -m)" >&2
    exit 1
    ;;
esac

python_archive="cpython-${PYTHON_VERSION}+${PYTHON_BUILD_DATE}-${python_arch}-apple-darwin-install_only.tar.gz"
python_archive_path="$PACKAGE_ROOT/$python_archive"
python_archive_url="https://github.com/astral-sh/python-build-standalone/releases/download/${PYTHON_BUILD_DATE}/$(printf '%s' "$python_archive" | sed 's/+/%2B/g')"
curl --fail --location --silent --show-error "$python_archive_url" \
  --output "$python_archive_path"
printf '%s  %s\n' "$python_sha256" "$python_archive_path" | shasum -a 256 -c -
tar -xzf "$python_archive_path" -C "$APP_RESOURCES/runtime/python" \
  --strip-components=1
rm "$python_archive_path"

cat > "$APP_CONTENTS/Info.plist" <<PLIST
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
  <key>CFBundleDisplayName</key>
  <string>ModelMind</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleVersion</key>
  <string>${APP_VERSION}</string>
  <key>CFBundleShortVersionString</key>
  <string>${APP_VERSION}</string>
  <key>LSMinimumSystemVersion</key>
  <string>12.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
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

runtime_python="$APP_RESOURCES/runtime/python/bin/python3.12"
if [[ ! -x "$runtime_python" ]]; then
  printf 'Bundled Python runtime is missing or not executable.\n' >&2
  exit 1
fi
"$runtime_python" --version
"$APP_RESOURCES/runtime/node/bin/node" --version
"$runtime_python" -m venv \
  "$PACKAGE_ROOT/runtime-smoke-test"
venv_config="$PACKAGE_ROOT/runtime-smoke-test/pyvenv.cfg"
if ! grep -F "$APP_RESOURCES/runtime/python" "$venv_config" > /dev/null; then
  printf 'The packaged Python runtime is not relocatable.\n' >&2
  exit 1
fi
"$PACKAGE_ROOT/runtime-smoke-test/bin/python" --version
rm -rf "$PACKAGE_ROOT/runtime-smoke-test"

# ─────────────────────────────────────────────────────
# Build a drag-to-Applications .DMG
# ─────────────────────────────────────────────────────
asset_suffix="${MODELMIND_PACKAGE_SUFFIX:-macOS}"
DMG_STAGING="$PACKAGE_ROOT/dmg-staging"
DMG_WRITABLE="$PACKAGE_ROOT/ModelMind-rw.dmg"
DMG_FINAL="${RUNNER_TEMP:-$ROOT_DIR}/ModelMind-Setup-${asset_suffix}.dmg"

mkdir -p "$DMG_STAGING"

# Copy the .app into the staging folder
cp -R "$APP_BUNDLE" "$DMG_STAGING/ModelMind.app"

# Create a symlink to /Applications so users can drag-and-drop
ln -s /Applications "$DMG_STAGING/Applications"

# Create a writable DMG large enough for the app (content is ~300-400 MB)
hdiutil create \
  -srcfolder "$DMG_STAGING" \
  -volname "ModelMind" \
  -fs HFS+ \
  -fsargs "-c c=64,a=16,b=16" \
  -format UDRW \
  -size 800m \
  "$DMG_WRITABLE"

# Mount the writable DMG quietly
MOUNT_POINT="$(hdiutil attach -readwrite -noverify -noautoopen "$DMG_WRITABLE" \
  | awk '/Apple_HFS/ { for(i=3;i<=NF;i++) printf $i" "; print "" }' \
  | sed 's/ *$//')"

printf 'Mounted DMG at: %s\n' "$MOUNT_POINT"

# Give Finder a moment to settle after mount
sleep 2

# Use AppleScript to set window appearance: icon sizes, positions, background colour
osascript <<APPLESCRIPT
tell application "Finder"
  tell disk "ModelMind"
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set the bounds of container window to {200, 120, 780, 460}
    set viewOptions to the icon view options of container window
    set arrangement of viewOptions to not arranged
    set icon size of viewOptions to 128
    set background color of viewOptions to {52428, 52428, 65535}
    set position of item "ModelMind.app" of container window to {160, 170}
    set position of item "Applications" of container window to {420, 170}
    close
    open
    update without registering applications
    delay 2
    close
  end tell
end tell
APPLESCRIPT

# Flush filesystem buffers
sync
sleep 1

# Unmount
hdiutil detach "$MOUNT_POINT" -force

# Compact and convert to read-only compressed DMG
hdiutil convert "$DMG_WRITABLE" \
  -format UDZO \
  -imagekey zlib-level=9 \
  -o "$DMG_FINAL"

rm -f "$DMG_WRITABLE"
printf 'Built DMG: %s\n' "$DMG_FINAL"
