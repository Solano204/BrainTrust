# BrainTrust — Pre-Tool-Use Guardrail Hook
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
# Exit 0  → allow the command
# Exit 2  → BLOCK the command (Claude sees your error message)

param()

# Read the JSON payload from stdin
$inputJson = $input | Out-String
if (-not $inputJson.Trim()) { exit 0 }

try {
    $payload = $inputJson | ConvertFrom-Json
} catch {
    exit 0
}

$toolName = $payload.tool_name
$command  = $payload.tool_input.command

# Only intercept Bash tool calls
if ($toolName -ne "Bash") { exit 0 }
if (-not $command) { exit 0 }

# ── Dangerous patterns ─────────────────────────────────────────────────
$blocked = @(
    # File destruction
    @{ Pattern = "rm\s+-rf\s+/";         Reason = "Blocked: 'rm -rf /' would delete the entire filesystem." },
    @{ Pattern = "rm\s+-rf\s+\.\s*$";    Reason = "Blocked: 'rm -rf .' would delete the current directory." },
    @{ Pattern = "rimraf\s+/";            Reason = "Blocked: rimraf on root directory." },
    @{ Pattern = "del\s+/s\s+/q\s+C:\\"; Reason = "Blocked: del /s on C drive." },

    # Git force push to main
    @{ Pattern = "git push.*--force.*main";        Reason = "Blocked: force push to main is not allowed." },
    @{ Pattern = "git push.*-f.*main";             Reason = "Blocked: force push to main is not allowed." },
    @{ Pattern = "git push.*--force-with-lease.*main"; Reason = "Blocked: force push to main is not allowed." },

    # Database destruction
    @{ Pattern = "DROP\s+TABLE";    Reason = "Blocked: DROP TABLE is a destructive database operation." },
    @{ Pattern = "DROP\s+DATABASE"; Reason = "Blocked: DROP DATABASE is a destructive database operation." },
    @{ Pattern = "TRUNCATE\s+TABLE";Reason = "Blocked: TRUNCATE TABLE would delete all rows." },

    # Sensitive file exposure
    @{ Pattern = "cat\s+.*\.env";      Reason = "Blocked: printing .env files could expose secrets." },
    @{ Pattern = "type\s+.*\.env";     Reason = "Blocked: printing .env files could expose secrets." },

    # .next wipe (rebuilds take long)
    @{ Pattern = "rm\s+-rf\s+\.next\s*$"; Reason = "Warning: Wiping .next will require a full rebuild. If you need to clear cache, confirm first." }
)

foreach ($rule in $blocked) {
    if ($command -match $rule.Pattern) {
        # Write reason to stdout — Claude sees this as an error message
        Write-Output $rule.Reason
        exit 2
    }
}

exit 0
