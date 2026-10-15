#!/usr/bin/env bash
# ==============================================================================
# ModelMind — macOS One-Line Fast Installer
# ==============================================================================
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/install-mac.sh | bash
#
# What this does:
#   1. Detects Apple Silicon vs Intel Mac
#   2. Downloads the latest ModelMind DMG from GitHub Releases
#   3. Mounts and installs ModelMind.app to /Applications
#   4. Removes the macOS quarantine flag (bypasses Gatekeeper "Open Anyway" popup)
#   5. Launches ModelMind
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
printf "${COLOR_CYAN}${COLOR_BOLD}╔════════════════════════════════════════════════════╗${COLOR_RESET}\n"
printf "${COLOR_CYAN}${COLOR_BOLD}║              ModelMind Installer (macOS)           ║${COLOR_RESET}\n"
printf "${COLOR_CYAN}${COLOR_BOLD}╚════════════════════════════════════════════════════╝${COLOR_RESET}\n\n"

# 1. Architecture detection
ARCH="$(uname -m)"
case "$ARCH" in
  arm64)
    ASSET_NAME="ModelMind-Setup-macOS-arm64.dmg"
    printf "Detected Architecture: ${COLOR_GREEN}Apple Silicon (arm64)${COLOR_RESET}\n"
    ;;
  x86_64)
    ASSET_NAME="ModelMind-Setup-macOS-x64.dmg"
    printf "Detected Architecture: ${COLOR_GREEN}Intel (x86_64)${COLOR_RESET}\n"
    ;;
  *)
    printf "${COLOR_RED}Unsupported Mac architecture: %s${COLOR_RESET}\n" "$ARCH" >&2
    exit 1
    ;;
esac

# 2. Get latest release tag
printf "Fetching latest release from GitHub... "
LATEST_TAG="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases" | grep '"tag_name":' | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/')"
if [[ -z "$LATEST_TAG" ]]; then
  LATEST_TAG="private-companion-v0.2.2"
fi
printf "${COLOR_GREEN}%s${COLOR_RESET}\n" "$LATEST_TAG"

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${ASSET_NAME}"
TMP_DIR="$(mktemp -d -t modelmind-install-XXXXXX)"
TMP_DMG="${TMP_DIR}/${ASSET_NAME}"

cleanup() {
  if [[ -n "${MOUNT_POINT:-}" && -d "$MOUNT_POINT" ]]; then
    hdiutil detach "$MOUNT_POINT" -force >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# 3. Download DMG
printf "Downloading ModelMind installer...\n"
curl -fL --progress-bar "$DOWNLOAD_URL" -o "$TMP_DMG"

# 4. Mount DMG
printf "Mounting disk image... "
MOUNT_POINT="$(hdiutil attach -nobrowse -readonly "$TMP_DMG" | awk '/Apple_HFS/ { for(i=3;i<=NF;i++) printf $i" "; print "" }' | sed 's/ *$//')"
if [[ -z "$MOUNT_POINT" || ! -d "$MOUNT_POINT" ]]; then
  printf "${COLOR_RED}Failed to mount DMG.${COLOR_RESET}\n" >&2
  exit 1
fi
printf "${COLOR_GREEN}OK${COLOR_RESET}\n"

# 5. Copy .app to /Applications
printf "Installing to /Applications... "
if [[ -d "/Applications/ModelMind.app" ]]; then
  rm -rf "/Applications/ModelMind.app"
fi
cp -R "${MOUNT_POINT}/ModelMind.app" "/Applications/ModelMind.app"
printf "${COLOR_GREEN}OK${COLOR_RESET}\n"

# 6. Bypass Gatekeeper quarantine flag
printf "Configuring security permissions (bypassing Gatekeeper warning)... "
xattr -dr com.apple.quarantine "/Applications/ModelMind.app" 2>/dev/null || true
printf "${COLOR_GREEN}OK${COLOR_RESET}\n\n"

# 7. Success
printf "${COLOR_GREEN}${COLOR_BOLD}✔ ModelMind installed successfully!${COLOR_RESET}\n\n"
printf "You can launch it anytime from ${COLOR_CYAN}Launchpad${COLOR_RESET} or ${COLOR_CYAN}/Applications/ModelMind.app${COLOR_RESET}\n"
printf "Launching ModelMind now...\n\n"

open "/Applications/ModelMind.app"
