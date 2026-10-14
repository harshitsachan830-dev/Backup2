$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$appDirectory = Join-Path $root "modelmind-source"
$websiteOrigin = "https://modelmind-staging.onrender.com"
$packagedNode = Join-Path $root "runtime\node\node.exe"
$packagedPython = Join-Path $root "runtime\python\python.exe"
$userDataDirectory = Join-Path $env:LOCALAPPDATA "ModelMind"
$workspaceDirectory = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "ModelMind Notebooks"

if (Test-Path $packagedNode) {
    $node = $packagedNode
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
    $node = (Get-Command node).Source
} else {
    throw "The bundled Node.js runtime is missing. Reinstall ModelMind or install Node.js 20.9 or newer."
}

$nodeVersionText = (& $node -p "process.versions.node").Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Could not determine the installed Node.js version."
}
$nodeVersion = [version]$nodeVersionText
if ($nodeVersion -lt [version]"20.9.0") {
    throw "Node.js 20.9 or newer is required. Update Node.js and run this script again."
}

if (Test-Path $packagedPython) {
    $python = $packagedPython
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $python = "py"
} else {
    throw "The bundled Python runtime is missing. Reinstall ModelMind or install Python 3.10 or newer."
}
if ($python -eq "py") {
    & $python -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)"
} else {
    & $python -c "import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)"
}
if ($LASTEXITCODE -ne 0) {
    throw "Python 3.10 or newer is required. Update the bundled runtime or install a supported Python version."
}

if (-not (Test-Path (Join-Path $appDirectory "scripts\run-local.mjs"))) {
    throw "The ModelMind companion files are incomplete. Reinstall ModelMind and try again."
}

New-Item -ItemType Directory -Path $userDataDirectory, $workspaceDirectory -Force | Out-Null
$env:MODELMIND_USER_DATA_DIR = $userDataDirectory
$env:MODELMIND_VENV_DIR = Join-Path $userDataDirectory ".venv"
$env:WORKSPACE = $workspaceDirectory

Start-Process $websiteOrigin
Write-Host "Starting the local ModelMind notebook services. Keep this window open."
$env:MODELMIND_WEB_ORIGINS = $websiteOrigin
& $node (Join-Path $appDirectory "scripts\run-local.mjs") companion
if ($LASTEXITCODE -ne 0) {
    throw "The local companion stopped with exit code $LASTEXITCODE. Review the messages above."
}
