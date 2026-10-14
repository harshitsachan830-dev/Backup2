$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$packageRoot = Join-Path $env:RUNNER_TEMP "modelmind-windows"
if (Test-Path $packageRoot) {
    Remove-Item -LiteralPath $packageRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $packageRoot | Out-Null

$archivePath = Join-Path $env:RUNNER_TEMP "modelmind-source.tar"
git -C $root archive --format=tar "--output=$archivePath" HEAD
if ($LASTEXITCODE -ne 0) {
    throw "Could not stage the private ModelMind companion files."
}
tar -xf $archivePath -C $packageRoot
if ($LASTEXITCODE -ne 0) {
    throw "Could not extract the private ModelMind companion files."
}
Remove-Item -LiteralPath $archivePath -Force
if (-not (Test-Path (Join-Path $packageRoot "modelmind-source\scripts\run-local.mjs"))) {
    throw "The archived ModelMind companion files are incomplete."
}

$nodePath = (& node -p "process.execPath").Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Could not locate the Node.js runtime."
}
$pythonPrefix = (& python -c "import sys; print(sys.prefix)").Trim()
if ($LASTEXITCODE -ne 0) {
    throw "Could not locate the Python runtime."
}

$nodeDirectory = Join-Path $packageRoot "runtime\node"
$pythonDirectory = Join-Path $packageRoot "runtime\python"
New-Item -ItemType Directory -Path $nodeDirectory, $pythonDirectory -Force | Out-Null
Copy-Item -LiteralPath $nodePath -Destination (Join-Path $nodeDirectory "node.exe")
Copy-Item -Path (Join-Path $pythonPrefix "*") -Destination $pythonDirectory -Recurse -Force

$pythonExe = Join-Path $pythonDirectory "python.exe"
& $pythonExe --version
if ($LASTEXITCODE -ne 0) {
    throw "The relocated Python runtime could not start."
}
$nodeExe = Join-Path $nodeDirectory "node.exe"
& $nodeExe --version
if ($LASTEXITCODE -ne 0) {
    throw "The relocated Node.js runtime could not start."
}
$smokeEnvironment = Join-Path $env:RUNNER_TEMP "modelmind-runtime-smoke-test"
& $pythonExe -m venv $smokeEnvironment
if ($LASTEXITCODE -ne 0) {
    throw "The relocated Python runtime could not create a virtual environment."
}
$venvConfiguration = Get-Content (Join-Path $smokeEnvironment "pyvenv.cfg") -Raw
if (-not $venvConfiguration.Contains($pythonDirectory, [StringComparison]::OrdinalIgnoreCase)) {
    throw "The packaged Python runtime is not relocatable."
}
& (Join-Path $smokeEnvironment "Scripts\python.exe") --version
if ($LASTEXITCODE -ne 0) {
    throw "The relocated virtual environment could not start."
}
Remove-Item -LiteralPath $smokeEnvironment -Recurse -Force

choco install innosetup --yes --no-progress
if ($LASTEXITCODE -ne 0) {
    throw "Could not install Inno Setup."
}
$env:MODELMIND_PACKAGE_ROOT = $packageRoot
$compiler = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
& $compiler (Join-Path $root "scripts\installers\modelmind-windows.iss")
if ($LASTEXITCODE -ne 0) {
    throw "Could not build the private Windows installer."
}
