# BrainTrust Backend — Pre-Tool-Use Guardrail Hook
# Blocks dangerous shell commands before Claude executes them.
# Configured in .claude/settings.json under hooks.PreToolUse.
#
# Claude Code sends a JSON payload via stdin:
# {
#   "session_id": "...",
#   "tool_name": "Bash",
#   "tool_input": { "command": "rm -rf /" }
# }
#
# Exit 0  -> allow
# Exit 2  -> BLOCK (Claude sees your error message as stdout)

param()

$inputJson = $input | Out-String
if (-not $inputJson.Trim()) { exit 0 }

try {
    $payload = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$toolName = $payload.tool_name
$command  = $payload.tool_input.command

if ($toolName -ne "Bash") { exit 0 }
if (-not $command) { exit 0 }

$blocked = @(
    # Filesystem destruction
    @{ Pattern = "rm\s+-rf\s+/";               Reason = "BLOCKED: 'rm -rf /' would delete the entire filesystem." },
    @{ Pattern = "rm\s+-rf\s+\.\s*$";          Reason = "BLOCKED: 'rm -rf .' would delete the current directory." },
    @{ Pattern = "rm\s+-rf\s+\.\./";           Reason = "BLOCKED: 'rm -rf ../' is a destructive operation." },

    # Git force push to main/master
    @{ Pattern = "git push.*(--force|-f).*(main|master)"; Reason = "BLOCKED: force push to main/master is not allowed." },
    @{ Pattern = "git push.*--force-with-lease.*(main|master)"; Reason = "BLOCKED: force push to main/master is not allowed." },

    # Git hard reset (data loss)
    @{ Pattern = "git reset\s+--hard";          Reason = "BLOCKED: 'git reset --hard' discards uncommitted work. Use --soft or confirm manually." },

    # Database DDL destruction
    @{ Pattern = "DROP\s+TABLE";                Reason = "BLOCKED: DROP TABLE is a destructive database operation." },
    @{ Pattern = "DROP\s+DATABASE";             Reason = "BLOCKED: DROP DATABASE would delete the entire database." },
    @{ Pattern = "TRUNCATE\s+TABLE";            Reason = "BLOCKED: TRUNCATE TABLE would delete all rows." },
    @{ Pattern = "DELETE\s+FROM\s+\w+\s*;?\s*$"; Reason = "BLOCKED: DELETE without WHERE clause would delete all rows." },

    # Docker system wipe
    @{ Pattern = "docker system prune";         Reason = "BLOCKED: docker system prune removes ALL containers, images, and volumes." },
    @{ Pattern = "docker volume rm";            Reason = "BLOCKED: docker volume rm would destroy database data in volumes." },

    # Maven skip all safety checks in one go
    @{ Pattern = "mvn.*-DskipTests.*-Denforcer\.skip"; Reason = "BLOCKED: Skipping both tests and enforcer simultaneously is not safe in prod builds." },

    # Expose secrets
    @{ Pattern = "cat\s+.*\.env";               Reason = "BLOCKED: Printing .env files could expose secrets." },
    @{ Pattern = "type\s+.*\.env";              Reason = "BLOCKED: Printing .env files could expose secrets." },
    @{ Pattern = "cat\s+.*application-prod";    Reason = "BLOCKED: Printing prod config could expose secrets." }
)

foreach ($rule in $blocked) {
    if ($command -match $rule.Pattern) {
        Write-Output $rule.Reason
        exit 2
    }
}

exit 0
