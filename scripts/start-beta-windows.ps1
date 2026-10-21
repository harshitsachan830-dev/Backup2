$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$appDirectory = Join-Path $root "modelmind-source"
$websiteOrigin = "https://modelmind-staging.onrender.com"
$packagedNode = Join-Path $root "runtime\node\node.exe"
$packagedPython = Join-Path $root "runtime\python\python.exe"
$userDataDirectory = Join-Path $env:LOCALAPPDATA "ModelMind"
$docs = [Environment]::GetFolderPath("MyDocuments")
if (-not $docs -or -not (Test-Path -LiteralPath $docs)) {
    $docs = Join-Path $env:USERPROFILE "Documents"
}
if (-not (Test-Path -LiteralPath $docs)) {
    $docs = $env:USERPROFILE
}
$workspaceDirectory = Join-Path $docs "ModelMind Notebooks"
$jupyterRuntimeDirectory = Join-Path $userDataDirectory "jupyter\runtime"

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

foreach ($dir in @($userDataDirectory, $workspaceDirectory, $jupyterRuntimeDirectory)) {
    if (-not (Test-Path -LiteralPath $dir)) {
        [System.IO.Directory]::CreateDirectory($dir) | Out-Null
    }
}

foreach ($sample in @("50_Startups.csv", "test_dataset.csv", "messy_preprocessing_dataset.csv", "perceptron-cleaned-data.csv")) {
    $src = Join-Path $root $sample
    $dst = Join-Path $workspaceDirectory $sample
    if ((Test-Path -LiteralPath $src) -and -not (Test-Path -LiteralPath $dst)) {
        Copy-Item -LiteralPath $src -Destination $dst -ErrorAction SilentlyContinue
    }
}

$env:MODELMIND_USER_DATA_DIR = $userDataDirectory
$env:MODELMIND_VENV_DIR = Join-Path $userDataDirectory ".venv"
$env:JUPYTER_RUNTIME_DIR = $jupyterRuntimeDirectory
$env:WORKSPACE = $workspaceDirectory

Write-Host "Starting the local ModelMind notebook services. Keep this window open."
try {
    Start-Process $websiteOrigin -ErrorAction SilentlyContinue
} catch {
    # Non-fatal if browser cannot be spawned directly
}
$env:MODELMIND_WEB_ORIGINS = $websiteOrigin
& $node (Join-Path $appDirectory "scripts\run-local.mjs") companion
if ($LASTEXITCODE -ne 0) {
    throw "The local companion stopped with exit code $LASTEXITCODE. Review the messages above."
}
