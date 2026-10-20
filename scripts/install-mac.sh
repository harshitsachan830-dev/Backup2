#!/bin/bash
# ============================================================
# ModelMind — Mac Auto Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/install-mac.sh | bash
# ============================================================

set -e

echo ""
echo "============================================"
echo "   ModelMind - Auto Installer for Mac      "
echo "============================================"
echo ""

# ---- Step 1: Install Node.js if missing ----
if ! command -v node &> /dev/null; then
    echo "[1/5] Node.js not found. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    brew install node
    echo "[1/5] Node.js installed ✓"
else
    echo "[1/5] Node.js $(node --version) already installed ✓"
fi

# ---- Step 2: Install Git if missing ----
if ! command -v git &> /dev/null; then
    echo "[2/5] Git not found. Installing..."
    brew install git
    echo "[2/5] Git installed ✓"
else
    echo "[2/5] Git $(git --version) already installed ✓"
fi

# ---- Step 3: Clone the repo ----
INSTALL_DIR="$HOME/ModelMind"
echo "[3/5] Cloning ModelMind into $INSTALL_DIR ..."
if [ -d "$INSTALL_DIR" ]; then
    echo "      Folder exists. Pulling latest..."
    cd "$INSTALL_DIR" && git pull origin master
else
    git clone https://github.com/divyanshmaheshwari617-cell/ModelMind.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi
echo "[3/5] Project downloaded ✓"

# ---- Step 4: Create .env.local ----
echo "[4/5] Setting up environment variables..."
cat > "$INSTALL_DIR/.env.local" << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=PASTE_YOUR_VALUE_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_YOUR_VALUE_HERE
BREVO_API_KEY=PASTE_YOUR_VALUE_HERE
BREVO_SENDER_EMAIL=PASTE_YOUR_VALUE_HERE
MONGODB_URI=PASTE_YOUR_VALUE_HERE
MONGODB_DB=modelmind
OTP_HASH_SECRET=PASTE_YOUR_VALUE_HERE
SUPABASE_URL=PASTE_YOUR_VALUE_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_VALUE_HERE
MODELMIND_ADMIN_EMAILS=PASTE_YOUR_VALUE_HERE
EOF
echo ""
echo "==> IMPORTANT: Open $INSTALL_DIR/.env.local and paste your real API keys before running the app!"
echo "    (Get keys from Harshit or your .env.local backup)"
echo "[4/5] .env.local template created ✓"

# ---- Step 5: Install npm packages ----
echo "[5/5] Installing packages (1-2 minutes)..."
cd "$INSTALL_DIR"
npm install --legacy-peer-deps
echo "[5/5] Packages installed ✓"

echo ""
echo "============================================"
echo "   Setup Complete! Launching ModelMind...  "
echo "============================================"
echo ""
echo "Opening http://localhost:3000 ..."
open http://localhost:3000 &
sleep 3
npm run dev
