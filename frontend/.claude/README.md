# .claude/ — BrainTrust LMS Configuration

This directory contains all Claude Code configuration for the BrainTrust frontend.

```
.claude/
├── settings.json          ← Project settings: permissions, hooks, MCP servers
├── settings.local.json    ← YOUR local API keys (never commit this file)
├── mcp.json               ← MCP server catalog (reference + activation guide)
├── agents/                ← Custom sub-agents (invoke with /agents <name>)
│   ├── code-reviewer.md   → Deep code review (thorough, uses Opus)
│   ├── ui-builder.md      → Build React components (design-system-aware)
│   ├── api-integrator.md  → Wire up backend API endpoints (full layer)
│   ├── bug-hunter.md      → Systematic debugging (finds root cause)
│   └── translator.md      → Translate UI text to Spanish (fast, uses Haiku)
├── skills/                ← Slash command playbooks (type /<name> to use)
│   ├── create-component.md  → /create-component
│   ├── add-api-hook.md      → /add-api-hook
│   ├── responsive-table.md  → /responsive-table
│   ├── translate-ui.md      → /translate-ui
│   ├── debug.md             → /debug
│   └── code-review.md       → /code-review
├── hooks/                 ← Automation scripts (run automatically)
│   ├── guardrail.ps1      → Blocks dangerous commands before execution
│   ├── post-edit.ps1      → Logs file changes after each edit
│   └── notification.ps1   → Windows toast notification on task completion
├── routines/              ← Scheduled autonomous tasks
│   ├── daily-review.md    → TypeScript + ESLint + English text check (weekday mornings)
│   └── weekly-cleanup.md  → Dead code + TODO scan (Friday mornings)
└── logs/                  ← Auto-created by hooks (gitignored)
    ├── session-changes.log
    └── notifications.log
```

---

## How to Use Each Feature

### Skills (slash commands)
Type in Claude Code chat:
```
/create-component   — scaffold a new React component
/add-api-hook       — create full API integration layer for a new endpoint
/responsive-table   — add mobile card view to an existing desktop table
/translate-ui       — convert English UI text to Spanish
/debug              — systematic bug diagnosis
/code-review        — quick review of changed files
```

### Sub-Agents
Use when you need specialized help on a complex task:
```
/agents code-reviewer   — thorough code review with severity levels
/agents ui-builder      — build components with full design system context
/agents api-integrator  — integrate a new backend endpoint end-to-end
/agents bug-hunter      — diagnose a tricky bug systematically
/agents translator      — translate a whole file or component to Spanish
```

### Hooks (automatic — no action needed)
- **guardrail.ps1**: runs before every Bash command. Blocks `rm -rf /`, force pushes to main, DROP TABLE, and other destructive operations.
- **post-edit.ps1**: runs after every file edit. Logs changes to `.claude/logs/session-changes.log`.
- **notification.ps1**: runs when Claude sends a notification. Shows a Windows desktop toast so you know when a long task finishes.

To enable hooks, they must be configured in `settings.json` (already done).

### MCP Servers
See `mcp.json` for available servers. To activate:
1. Copy the `mcpServers` entry you want into `settings.local.json`
2. Fill in your API key
3. Restart Claude Code

Recommended for BrainTrust: `brave-search` (docs lookup) + `github` (PR management)

### Routines
Manual (type in chat):
```
/daily-review     — run the morning code health check
/weekly-cleanup   — find dead code and tech debt
```

Automatic scheduling: run `claude --schedule` (see Claude Code docs for scheduling setup).

---

## Setup Checklist

- [ ] `settings.local.json` filled in with your API keys
- [ ] `.claude/logs/` added to `.gitignore`
- [ ] PowerShell execution policy allows scripts: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- [ ] MCP servers you want are activated in `settings.local.json`
- [ ] (Optional) Install BurntToast for better notifications: `Install-Module BurntToast -Scope CurrentUser`
