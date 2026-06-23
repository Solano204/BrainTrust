# BrainTrust Backend — Post-Edit Hook
# Fires after Claude edits or writes a Java file.
# Logs which file changed and checks for common problems without running a full compile.
#
# Input JSON (stdin):
# {
#   "session_id": "...",
#   "tool_name": "Edit",
#   "tool_input": { "file_path": "...", ... },
#   "tool_response": { ... }
# }
#
# Exit 0  -> continue
# Exit 2  -> BLOCK further actions (use sparingly)

param()

$inputJson = $input | Out-String
if (-not $inputJson.Trim()) { exit 0 }

try {
    $payload = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$filePath = $payload.tool_input.file_path
if (-not $filePath) { exit 0 }

$isJava = $filePath -match "\.java$"
$isYaml = $filePath -match "\.(yml|yaml)$"
$isXml  = $filePath -match "\.xml$"

$logDir  = Join-Path $PSScriptRoot ".." "logs"
$logFile = Join-Path $logDir "edits.log"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Add-Content -Path $logFile -Value "$timestamp | edited: $filePath" -Encoding UTF8

# Warn if an .env or prod config file was edited
if ($filePath -match "application-prod\.yml" -or $filePath -match "\.env$") {
    Write-Output "WARNING: You just edited a sensitive config file ($filePath). Verify no secrets were committed."
}

# Warn if a JPA entity was edited (schema drift risk)
if ($filePath -match "JpaEntity\.java$" -or $filePath -match "Entity\.java$") {
    Write-Output "INFO: JPA entity modified ($filePath). If you added/changed columns, create a SQL migration script in shared/src/main/resources/db/migration/."
}

exit 0
