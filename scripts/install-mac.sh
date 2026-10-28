#!/usr/bin/env bash
# ==============================================================================
# ModelMind — macOS One-Line Zero-Prompt Installer
# ==============================================================================
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/install-mac.sh | bash
#
# What this script does:
#   1. Detects Apple Silicon (M1/M2/M3/M4) vs Intel
#   2. Downloads the official release DMG directly from GitHub
#   3. Mounts and installs ModelMind.app to /Applications
#   4. Removes ALL macOS Gatekeeper & quarantine flags (xattr -cr)
#   5. Sets proper execution permissions
#   6. Launches ModelMind immediately — NO SECURITY PROMPT, NO "OPEN ANYWAY" NEEDED
# ==============================================================================

set -euo pipefail

REPO="harshitsachan830-dev/Backup2"
COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_CYAN="\033[36m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"

printf "\n"
printf "${COLOR_CYAN}${COLOR_BOLD}╔══════════════════════════════════════════════════════════════╗${COLOR_RESET}\n"
printf "${COLOR_CYAN}${COLOR_BOLD}║              ModelMind Automated Mac Installer               ║${COLOR_RESET}\n"
printf "${COLOR_CYAN}${COLOR_BOLD}╚══════════════════════════════════════════════════════════════╝${COLOR_RESET}\n\n"

# 1. Architecture detection
ARCH="$(uname -m)"
case "$ARCH" in
  arm64)
    ASSET_NAME="ModelMind-Setup-macOS-arm64.dmg"
    printf "→ Mac Architecture: ${COLOR_GREEN}Apple Silicon (arm64 — M1/M2/M3/M4)${COLOR_RESET}\n"
    ;;
  x86_64)
    ASSET_NAME="ModelMind-Setup-macOS-x64.dmg"
    printf "→ Mac Architecture: ${COLOR_GREEN}Intel (x86_64)${COLOR_RESET}\n"
    ;;
  *)
    printf "${COLOR_RED}Unsupported Mac architecture: %s${COLOR_RESET}\n" "$ARCH" >&2
    exit 1
    ;;
esac

# 2. Get latest release tag
printf "→ Fetching latest release info... "
LATEST_TAG="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases" 2>/dev/null | grep '"tag_name":' | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/' || true)"
if [[ -z "$LATEST_TAG" ]]; then
  LATEST_TAG="private-companion-v0.2.6"
fi
printf "${COLOR_GREEN}%s${COLOR_RESET}\n" "$LATEST_TAG"

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${ASSET_NAME}"
TMP_DIR="$(mktemp -d -t modelmind-install-XXXXXX)"
TMP_DMG="${TMP_DIR}/${ASSET_NAME}"

cleanup() {
  if [[ -n "${MOUNT_POINT:-}" && -d "${MOUNT_POINT:-}" ]]; then
    hdiutil detach "$MOUNT_POINT" -force >/dev/null 2>&1 || true
  fi
  for v in /Volumes/ModelMind*; do
    if [[ -d "$v" ]]; then
      hdiutil detach "$v" -force >/dev/null 2>&1 || true
    fi
  done
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# 3. Determine install destination
if [[ -w "/Applications" ]]; then
  TARGET_DIR="/Applications"
  APP_DEST="/Applications/ModelMind.app"
else
  mkdir -p "$HOME/Applications"
  TARGET_DIR="$HOME/Applications"
  APP_DEST="$HOME/Applications/ModelMind.app"
fi
printf "→ Install target: ${COLOR_GREEN}%s${COLOR_RESET}\n" "$APP_DEST"

# 4. Download DMG
printf "→ Downloading ModelMind (${ASSET_NAME})...\n"
curl -fL --progress-bar "$DOWNLOAD_URL" -o "$TMP_DMG"

# 5. Clean up any existing stale mount
for v in /Volumes/ModelMind*; do
  if [[ -d "$v" ]]; then
    hdiutil detach "$v" -force >/dev/null 2>&1 || true
  fi
done

# 6. Mount DMG
printf "→ Mounting disk image... "
ATTACH_OUT="$(hdiutil attach -nobrowse -readonly "$TMP_DMG" 2>/dev/null || true)"
MOUNT_POINT="$(printf '%s\n' "$ATTACH_OUT" | grep -o '/Volumes/[^[:cntrl:]]*' | head -n 1 | sed 's/[[:space:]]*$//' || true)"

# Fallback: scan /Volumes for ModelMind.app if mountpoint string parsing was empty
if [[ -z "$MOUNT_POINT" || ! -d "$MOUNT_POINT/ModelMind.app" ]]; then
  for v in /Volumes/ModelMind*; do
    if [[ -d "$v/ModelMind.app" ]]; then
      MOUNT_POINT="$v"
      break
    fi
  done
fi

# Fallback 2: try diskutil image attach if modern macOS
if [[ -z "$MOUNT_POINT" || ! -d "$MOUNT_POINT/ModelMind.app" ]]; then
  ATTACH_OUT="$(diskutil image attach "$TMP_DMG" 2>/dev/null || true)"
  for v in /Volumes/ModelMind*; do
    if [[ -d "$v/ModelMind.app" ]]; then
      MOUNT_POINT="$v"
      break
    fi
  done
fi

if [[ -z "$MOUNT_POINT" || ! -d "$MOUNT_POINT/ModelMind.app" ]]; then
  printf "${COLOR_RED}Failed to mount DMG or find ModelMind.app.${COLOR_RESET}\n" >&2
  exit 1
fi
printf "${COLOR_GREEN}Mounted at %s${COLOR_RESET}\n" "$MOUNT_POINT"

# 7. Install .app
printf "→ Installing ModelMind to %s... " "$TARGET_DIR"
if [[ -d "$APP_DEST" ]]; then
  rm -rf "$APP_DEST"
fi
cp -R "${MOUNT_POINT}/ModelMind.app" "$APP_DEST"
printf "${COLOR_GREEN}Done${COLOR_RESET}\n"

# 8. Unmount DMG cleanly now that files are copied
hdiutil detach "$MOUNT_POINT" -force >/dev/null 2>&1 || true
MOUNT_POINT=""

# 9. Security: Strip Apple Quarantine & Gatekeeper attributes completely
printf "→ Removing macOS Gatekeeper restrictions & security quarantine... "
xattr -cr "$APP_DEST" 2>/dev/null || true
xattr -dr com.apple.quarantine "$APP_DEST" 2>/dev/null || true
chmod -R 755 "$APP_DEST" 2>/dev/null || true
chmod +x "$APP_DEST/Contents/MacOS/ModelMind" 2>/dev/null || true
printf "${COLOR_GREEN}Unrestricted${COLOR_RESET}\n\n"

# 10. Success & Launch
printf "${COLOR_GREEN}${COLOR_BOLD}════════════════════════════════════════════════════════════════${COLOR_RESET}\n"
printf "${COLOR_GREEN}${COLOR_BOLD} ✔ ModelMind successfully installed with full security clearance!${COLOR_RESET}\n"
printf "${COLOR_GREEN}${COLOR_BOLD}════════════════════════════════════════════════════════════════${COLOR_RESET}\n\n"
printf "You can launch it anytime from ${COLOR_CYAN}Launchpad${COLOR_RESET} or ${COLOR_CYAN}%s${COLOR_RESET}\n" "$APP_DEST"
printf "Starting ModelMind now...\n\n"

open "$APP_DEST"
