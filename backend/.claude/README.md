# BrainTrust Backend — Claude Code Setup

This directory configures Claude Code for the BrainTrust backend (Spring Boot 3 / Java 25 / Maven multi-module).

## Directory Structure

```
.claude/
  settings.json          <- Project permissions, hooks, MCP servers (committed)
  settings.local.json    <- Local overrides: DB password, API keys (GITIGNORED)
  mcp.json               <- MCP server catalog (reference — activate in settings.json)
  README.md              <- This file
  agents/                <- Custom sub-agent definitions
  hooks/                 <- PowerShell hook scripts
  routines/              <- Scheduled task definitions
  skills/                <- Slash command definitions
  logs/                  <- Hook logs (GITIGNORED)
```

## Slash Commands (Skills)

| Command | What it does |
|---------|-------------|
| `/add-endpoint` | Scaffold a full hexagonal chain for a new REST endpoint |
| `/code-review` | Quick backend code review checklist |
| `/run-tests` | Run tests for a module with readable output |
| `/check-logs` | Analyze backend log files for errors and patterns |
| `/security-audit` | JWT, CORS, role enforcement, SQL injection scan |
| `/analyze-ai` | Inspect the AI detection module status |
| `/db-migration` | Guide for writing safe SQL migrations |
| `/debug-api` | Trace a failing endpoint through the call chain |
| `/deploy-check` | Pre-deployment checklist |
| `/add-module` | Scaffold a new Maven module with hexagonal layout |

## Sub-Agents

| Agent | What it does | When to use |
|-------|-------------|-------------|
| `java-reviewer` | Deep Java/Spring code review | Before merging a PR |
| `security-auditor` | JWT, CORS, role, SQL security audit | Before deploying |
| `test-writer` | Writes JUnit 5 integration tests | After implementing features |
| `api-designer` | Designs REST API endpoints | Before implementing a feature |
| `sql-analyst` | Finds N+1 queries, missing indexes | When endpoints are slow |

Invoke agents by name: "use the java-reviewer agent to review SubmissionApplicationService.java"

## Hooks

| Hook | Trigger | What it does |
|------|---------|-------------|
| `guardrail.ps1` | Before any Bash command | Blocks: rm -rf, DROP TABLE, force push to main, secret exposure |
| `notification.ps1` | When Claude sends a notification | Windows toast notification |
| `post-edit.ps1` | After Edit or Write tool | Logs the file, warns on .env/JPA entity edits |
| `on-stop.ps1` | End of session | Logs session end timestamp |

## Routines

Run with `/loop "run the [routine-name] routine"` or manually:

| Routine | Schedule | What it does |
|---------|---------|-------------|
| `daily-log-review` | Daily 09:00 | Error count, slow AI, auth failures |
| `weekly-security-check` | Monday 10:00 | Hardcoded secrets, unannotated endpoints |
| `weekly-test-health` | Friday 15:00 | Full test run, coverage report |

## MCP Servers

See `mcp.json` for all available MCP servers. Currently active in `settings.json`:
- `filesystem` — direct backend directory access

To activate more (PostgreSQL, GitHub, etc.), copy from `mcp.json` into `settings.local.json`.

## First-Time Setup

1. Copy `.claude/settings.local.json` and fill in your real DB password and API keys
2. Ensure Docker is running (`docker-compose up -d`)
3. Run `mvn -pl container-app spring-boot:run` to start the app
4. Try `/check-logs` to verify log files are being written
