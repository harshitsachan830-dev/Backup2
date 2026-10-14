$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$appDirectory = Join-Path $root "modelmind-source"
$websiteOrigin = "https://modelmind-staging.onrender.com"

if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
    -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "Install Node.js 20.9 or newer from https://nodejs.org/en/download, then run this script again."
}

$nodeVersionText = (& node -p "process.versions.node").Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Could not determine the installed Node.js version."
}
$nodeVersion = [version]$nodeVersionText
if ($nodeVersion -lt [version]"20.9.0") {
    throw "Node.js 20.9 or newer is required. Update Node.js and run this script again."
}

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw "Install Python 3 from https://www.python.org/downloads/ and enable the Python launcher, then run this script again."
}
& py -3 --version
if ($LASTEXITCODE -ne 0) {
    throw "The Python launcher could not find Python 3. Install Python 3 and run this script again."
}

if (-not (Test-Path (Join-Path $appDirectory "package-lock.json"))) {
    throw "The extracted beta folder is incomplete. Extract the full ZIP and try again."
}

if (-not (Test-Path (Join-Path $appDirectory "node_modules\next\package.json"))) {
    Write-Host "Installing ModelMind dependencies. This may take several minutes..."
    Push-Location $appDirectory
    try {
        & npm ci
        if ($LASTEXITCODE -ne 0) {
            throw "Node dependency installation failed. Check your internet connection and try again."
        }
    } finally {
        Pop-Location
    }
}

Start-Process $websiteOrigin
Write-Host "Starting the local ModelMind notebook services. Keep this window open."
$env:MODELMIND_WEB_ORIGINS = $websiteOrigin
Push-Location $appDirectory
try {
    & npm run companion
    if ($LASTEXITCODE -ne 0) {
        throw "The local companion stopped with exit code $LASTEXITCODE. Review the messages above."
    }
} finally {
    Pop-Location
}
