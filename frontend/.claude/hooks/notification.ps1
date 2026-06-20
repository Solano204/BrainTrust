# BrainTrust — Notification Hook
# Fires when Claude sends a notification (e.g., task completion, needs attention).
# Shows a Windows Toast notification so you get alerted even when the terminal
# is in the background.
#
# Claude Code sends a JSON payload via stdin:
# {
#   "session_id": "...",
#   "message": "Task completed: updated 3 files"
# }
#
# This hook always exits 0 (it never blocks anything).

param()

$inputJson = $input | Out-String
if (-not $inputJson.Trim()) { exit 0 }

try {
    $payload = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$message = $payload.message
if (-not $message) { $message = "Claude Code finished a task." }

# Truncate long messages for the toast
$shortMessage = if ($message.Length -gt 200) { $message.Substring(0, 197) + "..." } else { $message }

# ── Windows Toast Notification ──────────────────────────────────────────
# Uses BurntToast if available, falls back to built-in WScript
try {
    if (Get-Command "New-BurntToastNotification" -ErrorAction SilentlyContinue) {
        # BurntToast module is installed: `Install-Module BurntToast -Scope CurrentUser`
        New-BurntToastNotification `
            -Text "BrainTrust — Claude Code", $shortMessage `
            -AppLogo "$PSScriptRoot\..\..\public\favicon.ico" `
            -Sound "Default"
    } else {
        # Fallback: use Windows Script Host popup (blocking — closes after 5 seconds)
        $wscript = New-Object -ComObject WScript.Shell
        $wscript.Popup($shortMessage, 5, "BrainTrust — Claude Code", 64) | Out-Null
    }
} catch {
    # Notification failure should never block Claude's work
}

# ── Optional: also log the notification ────────────────────────────────
$logDir  = Join-Path $PSScriptRoot ".." "logs"
$logFile = Join-Path $logDir "notifications.log"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Add-Content -Path $logFile -Value "$timestamp | $message" -Encoding UTF8

exit 0
