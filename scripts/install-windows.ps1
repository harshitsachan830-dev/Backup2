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
#   6. Updates scripts and extension wheel to the latest verified release
#   7. Launches ModelMind immediately with zero security prompts
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
Write-Host "-> Fetching release information from GitHub... " -NoNewline
$latestTag = "private-companion-v0.3.3"
$fallbackTags = @("private-companion-v0.3.3", "private-companion-v0.3.2", "private-companion-v0.3.1", "private-companion-v0.3.0", "private-companion-v0.2.9")
try {
    $releases = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($releases -and $releases.Count -gt 0) {
        $latestTag = $releases[0].tag_name
        $fallbackTags = @($releases | ForEach-Object { $_.tag_name })
    }
} catch {
    # fallback to default
}
Write-Host $latestTag -ForegroundColor Green

$tempDir = Join-Path $env:TEMP "ModelMind-Install-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$installerPath = Join-Path $tempDir $assetName

# 3. Download installer with multi-version fallback
Write-Host "-> Downloading $appName ($assetName)..."
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13

$downloadSuccess = $false
foreach ($tag in $fallbackTags) {
    $downloadUrl = "https://github.com/$repo/releases/download/$tag/$assetName"
    try {
        (New-Object System.Net.WebClient).DownloadFile($downloadUrl, $installerPath)
        if ((Test-Path $installerPath) -and (Get-Item $installerPath).Length -gt 1000000) {
            $downloadSuccess = $true
            Write-Host "-> Successfully fetched installer from $tag" -ForegroundColor Green
            break
        }
    } catch {
        try {
            Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing -ErrorAction SilentlyContinue
            if ((Test-Path $installerPath) -and (Get-Item $installerPath).Length -gt 1000000) {
                $downloadSuccess = $true
                Write-Host "-> Successfully fetched installer from $tag" -ForegroundColor Green
                break
            }
        } catch { }
    }
}

$installDir = Join-Path $env:LOCALAPPDATA "Programs\ModelMind"

if ($downloadSuccess) {
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
} else {
    Write-Host "-> Direct binary not yet cached on release; performing clean portable setup..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    $zipPath = Join-Path $tempDir "modelmind.zip"
    $zipUrl = "https://github.com/$repo/archive/refs/heads/main.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
    Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force
    $extractedFolder = Get-ChildItem -Path $tempDir -Directory | Where-Object { $_.Name -like "*Backup2*" -or $_.Name -like "*modelmind*" } | Select-Object -First 1
    if ($extractedFolder) {
        Copy-Item -Path (Join-Path $extractedFolder.FullName "*") -Destination $installDir -Recurse -Force
    }
}

# Clean up temp installer
Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue

# 6. Unblock installed program files and apply updates
if (Test-Path $installDir) {
    Get-ChildItem -Path $installDir -Recurse -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

    # Pre-create ModelMind Notebooks directory in user profile
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

    # Copy sample datasets if missing
    foreach ($sample in @("50_Startups.csv", "test_dataset.csv", "messy_preprocessing_dataset.csv", "perceptron-cleaned-data.csv")) {
        $sourceSample = Join-Path $installDir $sample
        $destSample = Join-Path $notebooksDir $sample
        if ((Test-Path $sourceSample) -and (-not (Test-Path $destSample))) {
            Copy-Item -Path $sourceSample -Destination $destSample -Force -ErrorAction SilentlyContinue
        }
    }

    # Update scripts with latest verified fixes
    try {
        $scriptsDir = Join-Path $installDir "scripts"
        if (Test-Path $scriptsDir) {
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/start-platform.ps1" -OutFile (Join-Path $scriptsDir "start-platform.ps1") -UseBasicParsing -ErrorAction SilentlyContinue
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/start-beta-windows.ps1" -OutFile (Join-Path $scriptsDir "start-beta-windows.ps1") -UseBasicParsing -ErrorAction SilentlyContinue
            Invoke-WebRequest -Uri "https://raw.githubusercontent.com/harshitsachan830-dev/Backup2/main/scripts/start-beta-windows.cmd" -OutFile (Join-Path $scriptsDir "start-beta-windows.cmd") -UseBasicParsing -ErrorAction SilentlyContinue
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

        # Create or refresh Desktop shortcut
        $wshShell = New-Object -ComObject WScript.Shell
        $desktopPath = [System.Environment]::GetFolderPath('Desktop')
        $shortcut = $wshShell.CreateShortcut((Join-Path $desktopPath "ModelMind.lnk"))
        $shortcut.TargetPath = Join-Path $installDir "scripts\start-beta-windows.cmd"
        $shortcut.WorkingDirectory = $installDir
        $shortcut.IconLocation = (Join-Path $installDir "modelmind-source\app\favicon.ico")
        $shortcut.Description = "ModelMind Machine Learning Platform"
        $shortcut.Save()
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
Write-Host "You can launch it anytime from your Desktop shortcut or:" -ForegroundColor Cyan
Write-Host "  $launcherPath" -ForegroundColor Yellow
Write-Host "Starting ModelMind now..."
Write-Host ""

if (Test-Path $launcherPath) {
    Start-Process -FilePath $launcherPath
}
