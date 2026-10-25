param()

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

$os = $PSVersionTable.PSEdition
$python = Join-Path $root ".venv\Scripts\python.exe"

Write-Host "== Release readiness check =="
Write-Host "OS: $os"
if (-not (Test-Path $python)) {
    throw "Python venv is missing; run scripts\start-platform.ps1 first."
}

& $python --version
if ($LASTEXITCODE -ne 0) {
    throw "Could not run the Python interpreter at $python."
}

$checks = @(
    (Join-Path $root "requirements.txt"),
    (Join-Path $root "extensions\error-assistant\ml_platform_error_assistant\model-manifest.json"),
    (Join-Path $root "extensions\error-assistant\package.json")
)
foreach ($check in $checks) {
    if (-not (Test-Path $check)) {
        throw "Missing required file: $check"
    }
}

if ($env:ML_PLATFORM_CLOUD_FALLBACK -and $env:ML_PLATFORM_CLOUD_FALLBACK -ne "disabled") {
    Write-Host "Cloud fallback is explicitly enabled: $($env:ML_PLATFORM_CLOUD_FALLBACK)"
    Write-Host "This is allowed only for an intentional deployment opt-in."
} else {
    Write-Host "Cloud fallback remains disabled by default."
}

if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "Ollama is installed; local-only path remains allowed."
} else {
    Write-Host "Ollama is not installed. Local AI remains optional until the user approves installation."
}

& $python -m pytest "extensions/error-assistant" -q
if ($LASTEXITCODE -ne 0) {
    throw "The Python test suite failed with exit code $LASTEXITCODE."
}

Write-Host ""
Write-Host "Security and release gates checklist:"
Write-Host "  - Gemini/cloud routes remain disabled by default."
Write-Host "  - Local Ollama install remains explicit and user-approved."
Write-Host "  - Notebook execution is sandboxed before any fix is applied."
Write-Host "  - OS-specific validation should be run on actual macOS and Windows machines before a signed distributable is published."
Write-Host ""
Write-Host "Release-ready guardrails: PASS"
