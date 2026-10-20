# ============================================================
# ModelMind — Windows Auto Installer
# Usage: irm https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/install-windows.ps1 | iex
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ModelMind - Auto Installer for Windows  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---- Helper: Check if command exists ----
function CommandExists($cmd) {
    return $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

# ---- Step 1: Install Node.js if missing ----
if (-not (CommandExists "node")) {
    Write-Host "[1/5] Node.js not found. Downloading and installing Node.js..." -ForegroundColor Yellow
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    Invoke-WebRequest "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi" -OutFile $nodeInstaller
    Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "[1/5] Node.js installed successfully!" -ForegroundColor Green
} else {
    $nodeVer = node --version
    Write-Host "[1/5] Node.js already installed ($nodeVer) ✓" -ForegroundColor Green
}

# ---- Step 2: Install Git if missing ----
if (-not (CommandExists "git")) {
    Write-Host "[2/5] Git not found. Downloading and installing Git..." -ForegroundColor Yellow
    $gitInstaller = "$env:TEMP\git-installer.exe"
    Invoke-WebRequest "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe" -OutFile $gitInstaller
    Start-Process $gitInstaller -ArgumentList "/VERYSILENT /NORESTART" -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "[2/5] Git installed successfully!" -ForegroundColor Green
} else {
    $gitVer = git --version
    Write-Host "[2/5] Git already installed ($gitVer) ✓" -ForegroundColor Green
}

# ---- Step 3: Clone the repo ----
$installDir = "$env:USERPROFILE\ModelMind"
Write-Host "[3/5] Cloning ModelMind into $installDir ..." -ForegroundColor Yellow

if (Test-Path $installDir) {
    Write-Host "      Folder already exists. Pulling latest changes..." -ForegroundColor Yellow
    Set-Location $installDir
    git pull origin master
} else {
    git clone https://github.com/divyanshmaheshwari617-cell/ModelMind.git $installDir
    Set-Location $installDir
}
Write-Host "[3/5] Project downloaded successfully!" -ForegroundColor Green

# ---- Step 4: Create .env.local ----
Write-Host "[4/5] Setting up environment variables..." -ForegroundColor Yellow
if (Test-Path "$installDir\.env.local") {
    Write-Host "[4/5] .env.local already exists, preserving your configuration ✓" -ForegroundColor Green
} else {
    $envContent = @"
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
"@
    $envContent | Out-File -FilePath "$installDir\.env.local" -Encoding utf8 -Force
    Write-Host ""
    Write-Host "==> IMPORTANT: Open $installDir\.env.local in Notepad and paste your real API keys!" -ForegroundColor Red
    Write-Host "    (Get keys from Harshit or your .env.local backup)" -ForegroundColor Yellow
    Write-Host "[4/5] .env.local template created ✓" -ForegroundColor Green
}

# ---- Step 5: Install npm packages ----
Write-Host "[5/5] Installing packages..." -ForegroundColor Yellow
Set-Location $installDir
npm install --legacy-peer-deps
Write-Host "[5/5] All packages installed ✓" -ForegroundColor Green

# ---- Launch ----
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! Starting ModelMind...   " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting local Next.js server on port 3000..." -ForegroundColor White
Write-Host "Once server is ready, opening browser at http://localhost:3000 ..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C when you want to stop the server." -ForegroundColor Gray
Write-Host ""

Start-Job -ScriptBlock {
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 1
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 1
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
                Start-Process "http://localhost:3000"
                break
            }
        } catch {}
    }
} | Out-Null

npm run dev
