# BrainTrust Backend — Notification Hook
# Fires when Claude sends a notification (task complete, needs attention, etc.).
# Shows a Windows Toast notification.
#
# Input JSON (stdin):
# { "session_id": "...", "message": "Task completed: ..." }
#
# Always exits 0 — never blocks.

param()

$inputJson = $input | Out-String
if (-not $inputJson.Trim()) { exit 0 }

try {
    $payload = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$message = $payload.message
if (-not $message) { $message = "Claude Code (backend) finished a task." }

$shortMessage = if ($message.Length -gt 200) { $message.Substring(0, 197) + "..." } else { $message }

try {
    if (Get-Command "New-BurntToastNotification" -ErrorAction SilentlyContinue) {
        New-BurntToastNotification `
            -Text "BrainTrust Backend", $shortMessage `
            -Sound "Default"
    } else {
        $wscript = New-Object -ComObject WScript.Shell
        $wscript.Popup($shortMessage, 5, "BrainTrust Backend — Claude", 64) | Out-Null
    }
} catch { }

$logDir  = Join-Path $PSScriptRoot ".." "logs"
$logFile = Join-Path $logDir "notifications.log"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Add-Content -Path $logFile -Value "$timestamp | $message" -Encoding UTF8

exit 0
