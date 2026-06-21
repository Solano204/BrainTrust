# BrainTrust Backend — Stop Hook
# Fires when Claude finishes a session (Stop event).
# Logs a session-end marker to the audit log.
#
# Input JSON (stdin):
# { "session_id": "...", "stop_hook_active": true }
#
# Always exits 0.

param()

$inputJson = $input | Out-String
if (-not $inputJson.Trim()) { exit 0 }

try {
    $payload = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$sessionId = $payload.session_id
if (-not $sessionId) { $sessionId = "unknown" }

$logDir  = Join-Path $PSScriptRoot ".." "logs"
$logFile = Join-Path $logDir "sessions.log"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Add-Content -Path $logFile -Value "$timestamp | session ended: $sessionId" -Encoding UTF8

exit 0
