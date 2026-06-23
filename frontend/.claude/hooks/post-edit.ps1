# BrainTrust — Post-Edit Hook
# Runs after Claude edits or writes a file.
# Logs the changed file to a local session log for audit purposes.
# Does NOT block anything (always exits 0).
#
# Claude Code sends a JSON payload via stdin after each Edit/Write:
# {
#   "session_id": "...",
#   "tool_name": "Edit",
#   "tool_input": { "file_path": "...", ... },
#   "tool_response": { ... }
# }

param()

$inputJson = $input | Out-String
if (-not $inputJson.Trim()) { exit 0 }

try {
    $payload = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$filePath = $payload.tool_input.file_path
$toolName = $payload.tool_name
$sessionId = $payload.session_id

if (-not $filePath) { exit 0 }

# ── Log the change ──────────────────────────────────────────────────────
$logDir  = Join-Path $PSScriptRoot ".." "logs"
$logFile = Join-Path $logDir "session-changes.log"

# Ensure log directory exists
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
$logLine   = "$timestamp | $toolName | $filePath | session:$sessionId"

Add-Content -Path $logFile -Value $logLine -Encoding UTF8

# ── TypeScript quick-check on .ts/.tsx edits ────────────────────────────
# Only run if it's a TypeScript file to avoid slowing down every edit.
# Remove the return below to enable (it adds ~5s per edit on large projects).
exit 0

if ($filePath -match '\.(tsx?|ts)$') {
    $projectRoot = Resolve-Path (Join-Path $PSScriptRoot ".." "..") 2>$null
    if ($projectRoot) {
        $result = & npx tsc --noEmit --project "$projectRoot\tsconfig.json" 2>&1
        if ($LASTEXITCODE -ne 0) {
            # Print errors so they appear in Claude's context
            Write-Output "TypeScript errors detected after editing $filePath :"
            Write-Output ($result | Select-Object -First 20 | Out-String)
        }
    }
}

exit 0
