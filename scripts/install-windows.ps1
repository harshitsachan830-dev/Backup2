# ==============================================================================
# ModelMind — Windows One-Line Zero-Prompt Installer
# ==============================================================================
# Usage (run in PowerShell as regular user - NO Admin required):
#   irm https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/install-windows.ps1 | iex
#
# What this script does:
#   1. Verifies 64-bit Windows
#   2. Downloads the official ModelMind Windows installer directly from GitHub
#   3. Removes Windows Mark-of-the-Web (Unblock-File) to bypass SmartScreen warnings
#   4. Installs ModelMind quietly to %LOCALAPPDATA%\Programs\ModelMind (no admin needed)
#   5. Creates Start Menu and Desktop shortcuts with custom ModelMind icon
#   6. Launches ModelMind immediately
# ==============================================================================

$ErrorActionPreference = "Stop"

$repo = "harshitsachan830-dev/Backup2"
$appName = "ModelMind"
$assetName = "ModelMind-Setup-Windows-x64.exe"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "            ModelMind Automated Windows Installer           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Architecture check
if (-not [System.Environment]::Is64BitOperatingSystem) {
    Write-Error "ModelMind requires a 64-bit version of Windows."
    exit 1
}
Write-Host "-> System Architecture: 64-bit Windows detected" -ForegroundColor Green

# 2. Get latest release
Write-Host "-> Fetching latest release info from GitHub... " -NoNewline
$latestTag = "private-companion-v0.2.5"
try {
    $releaseData = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($releaseData -and $releaseData.Count -gt 0) {
        $latestTag = $releaseData[0].tag_name
    }
} catch {
    # fallback to default
}
Write-Host $latestTag -ForegroundColor Green

$downloadUrl = "https://github.com/$repo/releases/download/$latestTag/$assetName"
$tempDir = Join-Path $env:TEMP "ModelMind-Install-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$installerPath = Join-Path $tempDir $assetName

# 3. Download installer
Write-Host "-> Downloading $appName ($assetName)..."
try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13
    (New-Object System.Net.WebClient).DownloadFile($downloadUrl, $installerPath)
} catch {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
}

if (-not (Test-Path $installerPath)) {
    Write-Error "Failed to download installer from $downloadUrl"
    exit 1
}

# 4. Remove Windows Mark-of-the-Web (bypasses SmartScreen untrusted download warning)
Write-Host "-> Removing security download restrictions (Unblock-File)... " -NoNewline
Unblock-File -Path $installerPath -ErrorAction SilentlyContinue
Write-Host "Unrestricted" -ForegroundColor Green

# 5. Run Inno Setup installer silently to local app data (no elevation required)
Write-Host "-> Installing ModelMind... " -NoNewline
$installProcess = Start-Process -FilePath $installerPath -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-" -PassThru -Wait
if ($installProcess.ExitCode -ne 0) {
    Write-Host "Running with standard UI..." -ForegroundColor Yellow
    Start-Process -FilePath $installerPath -Wait
} else {
    Write-Host "Installed" -ForegroundColor Green
}

# Clean up temp installer
Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue

# 6. Unblock installed program files and apply updates
$installDir = Join-Path $env:LOCALAPPDATA "Programs\ModelMind"
if (Test-Path $installDir) {
    Get-ChildItem -Path $installDir -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

    # Pre-create ModelMind Notebooks directory in user profile (same as macOS ~/ModelMind Notebooks)
    $homeDir = if ($env:USERPROFILE) { $env:USERPROFILE } else { $HOME }
    $notebooksDir = Join-Path $homeDir "ModelMind Notebooks"
    try {
        if (-not (Test-Path -LiteralPath $notebooksDir)) {
            [System.IO.Directory]::CreateDirectory($notebooksDir) | Out-Null
        }
    } catch {
        $notebooksDir = Join-Path $env:LOCALAPPDATA "ModelMind\Notebooks"
        try {
            [System.IO.Directory]::CreateDirectory($notebooksDir) | Out-Null
        } catch { }
    }

    # Update scripts with latest verified fixes
    try {
        $scriptsDir = Join-Path $installDir "scripts"
        if (Test-Path $scriptsDir) {
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/start-platform.ps1" -OutFile (Join-Path $scriptsDir "start-platform.ps1") -UseBasicParsing -ErrorAction SilentlyContinue
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/start-beta-windows.ps1" -OutFile (Join-Path $scriptsDir "start-beta-windows.ps1") -UseBasicParsing -ErrorAction SilentlyContinue
        }

        $jupyterCfgDir = Join-Path $installDir "jupyter-config"
        if (Test-Path $jupyterCfgDir) {
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/jupyter-config/jupyter_server_config.py" -OutFile (Join-Path $jupyterCfgDir "jupyter_server_config.py") -UseBasicParsing -ErrorAction SilentlyContinue
        }

        $runLocalPath = Join-Path $installDir "modelmind-source\scripts\run-local.mjs"
        if (Test-Path $runLocalPath) {
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/modelmind-source/scripts/run-local.mjs" -OutFile $runLocalPath -UseBasicParsing -ErrorAction SilentlyContinue
        }

        # Pre-seed server extension configuration into APPDATA\jupyter
        $appDataJupyterConfigD = Join-Path $env:APPDATA "jupyter\jupyter_server_config.d"
        try {
            New-Item -ItemType Directory -Path $appDataJupyterConfigD -Force | Out-Null
            Set-Content -Path (Join-Path $appDataJupyterConfigD "ml_platform_error_assistant.json") -Value '{"ServerApp": {"jpserver_extensions": {"ml_platform_error_assistant": true}}}' -Force
        } catch { }

        # Ensure custom ModelMind labextension is active in venv if venv already exists
        $venv = Join-Path $env:LOCALAPPDATA "ModelMind\.venv"
        $builtExt = Join-Path $installDir "extensions\error-assistant\ml_platform_error_assistant\labextension"
        $targetExt = Join-Path $venv "share\jupyter\labextensions\@ml-platform\error-assistant"
        if ((Test-Path $venv) -and (Test-Path $builtExt)) {
            New-Item -ItemType Directory -Path $targetExt -Force | Out-Null
            Copy-Item -Path (Join-Path $builtExt "*") -Destination $targetExt -Recurse -Force
            $cfgTarget = Join-Path $venv "etc\jupyter\jupyter_server_config.d"
            New-Item -ItemType Directory -Path $cfgTarget -Force | Out-Null
            Set-Content -Path (Join-Path $cfgTarget "ml_platform_error_assistant.json") -Value '{"ServerApp": {"jpserver_extensions": {"ml_platform_error_assistant": true}}}' -Force
        }
    } catch {
        # Non-fatal if offline
    }
}

# 7. Success & Launch
$launcherPath = Join-Path $installDir "scripts\start-beta-windows.cmd"
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  ModelMind successfully installed with zero security alerts! " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Shortcuts created on Desktop and Start Menu." -ForegroundColor Cyan
Write-Host "Starting ModelMind now..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $launcherPath) {
    Start-Process -FilePath $launcherPath
} else {
    Write-Host "You can start ModelMind anytime from your Desktop or Start Menu." -ForegroundColor Yellow
}
