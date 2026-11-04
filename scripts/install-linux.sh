#!/usr/bin/env bash
# ==============================================================================
# ModelMind — Linux One-Line Automated Installer
# ==============================================================================
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/install-linux.sh | bash
#
# What this script does:
#   1. Detects Linux architecture (x86_64 / aarch64) and distribution
#   2. Verifies Python 3.10+ and Node.js 20.9+ (helps auto-install missing packages)
#   3. Installs ModelMind to $HOME/.local/share/modelmind (No root/sudo required!)
#   4. Sets up dedicated Python venv and installs the ModelMind extension
#   5. Configures JupyterLab with AI Error Assistant, Chatbot & Studio
#   6. Installs Desktop Entry (application menu shortcut) and CLI command 'modelmind'
#   7. Pre-populates workspace at $HOME/ModelMind Notebooks with sample datasets
#   8. Launches ModelMind immediately
# ==============================================================================

set -euo pipefail

REPO="harshitsachan830-dev/Backup2"
APP_NAME="ModelMind"
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/modelmind"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
WORKSPACE_DIR="$HOME/ModelMind Notebooks"

COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_CYAN="\033[36m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"

printf "\n"
printf "${COLOR_CYAN}${COLOR_BOLD}╔══════════════════════════════════════════════════════════════╗${COLOR_RESET}\n"
printf "${COLOR_CYAN}${COLOR_BOLD}║             ModelMind Automated Linux Installer              ║${COLOR_RESET}\n"
printf "${COLOR_CYAN}${COLOR_BOLD}╚══════════════════════════════════════════════════════════════╝${COLOR_RESET}\n\n"

# 1. Architecture Detection
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64)
    printf "→ Architecture: ${COLOR_GREEN}Linux x86_64 (64-bit)${COLOR_RESET}\n"
    ;;
  aarch64|arm64)
    printf "→ Architecture: ${COLOR_GREEN}Linux ARM64 / aarch64${COLOR_RESET}\n"
    ;;
  *)
    printf "${COLOR_RED}Unsupported Linux architecture: %s${COLOR_RESET}\n" "$ARCH" >&2
    exit 1
    ;;
esac

# Helper function to detect package manager
detect_pkg_manager() {
  if command -v apt-get >/dev/null 2>&1; then echo "apt";
  elif command -v dnf >/dev/null 2>&1; then echo "dnf";
  elif command -v pacman >/dev/null 2>&1; then echo "pacman";
  elif command -v zypper >/dev/null 2>&1; then echo "zypper";
  else echo "unknown"; fi
}

# 2. Check Python & venv
printf "→ Checking Python environment... "
if command -v python3 >/dev/null 2>&1 && python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' >/dev/null 2>&1; then
  PY_VER="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")')"
  printf "${COLOR_GREEN}Python %s detected${COLOR_RESET}\n" "$PY_VER"
else
  printf "${COLOR_YELLOW}Python 3.10+ not found!${COLOR_RESET}\n"
  PKG_MGR="$(detect_pkg_manager)"
  printf "${COLOR_RED}Please install Python 3.10 or newer.${COLOR_RESET}\n"
  case "$PKG_MGR" in
    apt) printf "Run: ${COLOR_CYAN}sudo apt update && sudo apt install -y python3 python3-venv python3-pip${COLOR_RESET}\n" ;;
    dnf) printf "Run: ${COLOR_CYAN}sudo dnf install -y python3 python3-pip${COLOR_RESET}\n" ;;
    pacman) printf "Run: ${COLOR_CYAN}sudo pacman -S python python-pip${COLOR_RESET}\n" ;;
    *) printf "Install Python 3.10+ using your system package manager.\n" ;;
  esac
  exit 1
fi

# Verify venv module
if ! python3 -m venv --help >/dev/null 2>&1; then
  printf "${COLOR_RED}The python3-venv module is missing.${COLOR_RESET}\n"
  PKG_MGR="$(detect_pkg_manager)"
  if [[ "$PKG_MGR" == "apt" ]]; then
    printf "Run: ${COLOR_CYAN}sudo apt install -y python3-venv${COLOR_RESET}\n"
  fi
  exit 1
fi

# 3. Check Node.js
printf "→ Checking Node.js environment... "
HAS_NODE=0
if command -v node >/dev/null 2>&1; then
  if node -e 'const [m, n] = process.versions.node.split(".").map(Number); process.exit(m > 20 || (m === 20 && n >= 9) ? 0 : 1)' >/dev/null 2>&1; then
    HAS_NODE=1
    printf "${COLOR_GREEN}Node.js %s detected${COLOR_RESET}\n" "$(node -v)"
  else
    printf "${COLOR_YELLOW}Node.js %s found (v20.9+ recommended)${COLOR_RESET}\n" "$(node -v)"
  fi
fi

if [[ "$HAS_NODE" -eq 0 ]]; then
  printf "${COLOR_YELLOW}Node.js >= 20.9 is required.${COLOR_RESET}\n"
  printf "→ You can install it quickly using fnm or nvm, or via package manager:\n"
  printf "  ${COLOR_CYAN}curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs${COLOR_RESET}\n\n"
  read -r -p "Do you want to continue anyway? (y/N) " CONTINUE_ANYWAY || true
  if [[ ! "${CONTINUE_ANYWAY:-}" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 4. Fetch latest release tag
printf "→ Fetching latest release info from GitHub... "
LATEST_TAG="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases" 2>/dev/null | grep '"tag_name":' | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/' || true)"
if [[ -z "$LATEST_TAG" ]]; then
  LATEST_TAG="private-companion-v0.3.3"
fi
printf "${COLOR_GREEN}%s${COLOR_RESET}\n" "$LATEST_TAG"

# 5. Download and Extract ModelMind
printf "→ Installing ModelMind to %s... " "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
TMP_DIR="$(mktemp -d -t modelmind-linux-XXXXXX)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

ARCHIVE_URL="https://github.com/${REPO}/archive/refs/tags/${LATEST_TAG}.tar.gz"
if ! curl -fsSL "$ARCHIVE_URL" -o "$TMP_DIR/modelmind.tar.gz" 2>/dev/null; then
  # Fallback to main branch archive
  curl -fsSL "https://github.com/${REPO}/archive/refs/heads/main.tar.gz" -o "$TMP_DIR/modelmind.tar.gz"
fi

tar -xzf "$TMP_DIR/modelmind.tar.gz" -C "$TMP_DIR"
EXTRACTED_FOLDER="$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
cp -rf "$EXTRACTED_FOLDER"/* "$INSTALL_DIR/"
printf "${COLOR_GREEN}Done${COLOR_RESET}\n"

# 6. Setup Python Virtual Environment
VENV_DIR="$INSTALL_DIR/.venv"
printf "→ Configuring Python virtual environment at %s...\n" "$VENV_DIR"
if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  python3 -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/python" -m pip install --upgrade pip --quiet
printf "→ Installing dependencies and ML libraries (numpy, pandas, scipy, scikit-learn, xgboost, lightgbm, catboost, imbalanced-learn, statsmodels, joblib, matplotlib, seaborn, plotly, shap, optuna)... "
if [[ -f "$INSTALL_DIR/requirements.txt" ]]; then
  "$VENV_DIR/bin/python" -m pip install --quiet -r "$INSTALL_DIR/requirements.txt"
fi
if [[ -f "$INSTALL_DIR/modelmind-source/backend/requirements.txt" ]]; then
  "$VENV_DIR/bin/python" -m pip install --quiet -r "$INSTALL_DIR/modelmind-source/backend/requirements.txt"
fi
"$VENV_DIR/bin/python" -m pip install --quiet \
  numpy pandas scipy scikit-learn xgboost lightgbm catboost imbalanced-learn statsmodels joblib matplotlib seaborn plotly shap optuna
printf "${COLOR_GREEN}Done${COLOR_RESET}\n"

# Install custom ModelMind Error Assistant Wheel
printf "→ Installing ModelMind AI Assistant & Studio extension... "
WHEEL_FILE="$(find "$INSTALL_DIR/wheels" -name "ml_platform_error_assistant-*.whl" | head -n 1)"
if [[ -n "$WHEEL_FILE" && -f "$WHEEL_FILE" ]]; then
  "$VENV_DIR/bin/python" -m pip install --quiet --no-deps --force-reinstall "$WHEEL_FILE"
fi

# Pre-seed Jupyter server config
JUPYTER_CONFIG_D="$HOME/.jupyter/jupyter_server_config.d"
mkdir -p "$JUPYTER_CONFIG_D"
echo '{"ServerApp": {"jpserver_extensions": {"ml_platform_error_assistant": true}}}' > "$JUPYTER_CONFIG_D/ml_platform_error_assistant.json"

# Pre-seed venv config as well
mkdir -p "$VENV_DIR/etc/jupyter/jupyter_server_config.d"
echo '{"ServerApp": {"jpserver_extensions": {"ml_platform_error_assistant": true}}}' > "$VENV_DIR/etc/jupyter/jupyter_server_config.d/ml_platform_error_assistant.json"
printf "${COLOR_GREEN}Configured${COLOR_RESET}\n"

# 7. Make scripts executable
chmod +x "$INSTALL_DIR/scripts/"*.sh 2>/dev/null || true

# 8. Setup CLI Command & Desktop Shortcut
printf "→ Creating desktop shortcut and CLI command... "
mkdir -p "$BIN_DIR" "$DESKTOP_DIR"

# CLI wrapper
cat > "$BIN_DIR/modelmind" <<WRAPPER
#!/usr/bin/env bash
exec "$INSTALL_DIR/scripts/start-beta-linux.sh" "\$@"
WRAPPER
chmod +x "$BIN_DIR/modelmind"

# Desktop Entry
ICON_PATH="$INSTALL_DIR/modelmind-source/app/favicon.ico"
cat > "$DESKTOP_DIR/modelmind.desktop" <<DESKTOP
[Desktop Entry]
Version=1.0
Type=Application
Name=ModelMind
GenericName=Machine Learning & Notebook Platform
Comment=ModelMind Interactive ML Platform and JupyterLab Companion
Exec=$BIN_DIR/modelmind
Icon=$ICON_PATH
Terminal=true
Categories=Development;Education;Science;IDE;
Keywords=ML;MachineLearning;Python;Jupyter;Notebook;ModelMind;
DESKTOP
chmod +x "$DESKTOP_DIR/modelmind.desktop"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi
printf "${COLOR_GREEN}Done${COLOR_RESET}\n"

# 9. Setup Workspace
mkdir -p "$WORKSPACE_DIR"
for sample in "$INSTALL_DIR"/50_Startups.csv "$INSTALL_DIR"/test_dataset.csv "$INSTALL_DIR"/messy_preprocessing_dataset.csv "$INSTALL_DIR"/perceptron-cleaned-data.csv; do
  if [[ -f "$sample" && ! -f "$WORKSPACE_DIR/$(basename "$sample")" ]]; then
    cp "$sample" "$WORKSPACE_DIR/" 2>/dev/null || true
  fi
done

# Check if ~/.local/bin is in PATH
PATH_NOTE=""
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  PATH_NOTE="Note: Add export PATH=\"\$HOME/.local/bin:\$PATH\" to your ~/.bashrc or ~/.zshrc\n"
fi

printf "\n"
printf "${COLOR_GREEN}${COLOR_BOLD}════════════════════════════════════════════════════════════════${COLOR_RESET}\n"
printf "${COLOR_GREEN}${COLOR_BOLD} ✔ ModelMind successfully installed on Linux!                  ${COLOR_RESET}\n"
printf "${COLOR_GREEN}${COLOR_BOLD}════════════════════════════════════════════════════════════════${COLOR_RESET}\n\n"
printf "You can launch it anytime:\n"
printf "  • From your Application menu: search for ${COLOR_CYAN}ModelMind${COLOR_RESET}\n"
printf "  • From Terminal: run ${COLOR_CYAN}modelmind${COLOR_RESET} (or %s)\n\n" "$BIN_DIR/modelmind"
if [[ -n "$PATH_NOTE" ]]; then
  printf "${COLOR_YELLOW}%b${COLOR_RESET}\n" "$PATH_NOTE"
fi
printf "Starting ModelMind now...\n\n"

exec "$INSTALL_DIR/scripts/start-beta-linux.sh"
