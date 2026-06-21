---
name: check-logs
description: >
  Read and analyze the BrainTrust backend log files. Finds errors, slow requests,
  AI analysis failures, and unusual patterns. Log files are in ./logs/.
---

# Skill: Check Logs

When the user runs `/check-logs`, ask:
1. Time range? (last 1h / last 24h / specific date `2026-06-19`)
2. What to look for? (errors / slow requests / AI failures / all)

## Log file locations

| File | Contents |
|------|---------|
| `./logs/braintrust-api.log` | All INFO+ logs (current day) |
| `./logs/braintrust-api.log.2026-06-18` | Previous days (rolling) |
| `./logs/braintrust-api-error.log` | ERROR level only |
| `./logs/notifications.log` | Claude Code notification history |
| `./logs/edits.log` | Files edited by Claude Code |

## Analysis commands

### Recent errors (last 100 lines)
```bash
Get-Content ./logs/braintrust-api-error.log -Tail 100
```

### Errors in last hour
```bash
$cutoff = (Get-Date).AddHours(-1).ToString("yyyy-MM-dd HH:mm")
Get-Content ./logs/braintrust-api.log | Where-Object { $_ -match "ERROR" -and $_ -gt $cutoff }
```

### Slow AI analysis (> 5s)
```bash
Select-String -Path ./logs/braintrust-api.log -Pattern "Analysis complete.*durationMs=([0-9]+)" | Where-Object { [int]($_ -replace '.*durationMs=(\d+).*','$1') -gt 5000 }
```

### Submission failures
```bash
Select-String -Path ./logs/braintrust-api.log -Pattern "Failed to submit"
```

## What to report

For each error found, include:
1. Timestamp
2. Thread (virtual thread ID)
3. Logger class (tells you which service threw it)
4. Full message (key=value pairs)
5. Exception class + first stack frame (for root cause)

## Key log patterns to recognize

| Pattern | Meaning |
|---------|---------|
| `Analysis failed submission={}` | Google Gemini API call failed |
| `Failed to submit assignment studentId={}` | Submission pipeline error |
| `Course not found` | Client sent invalid courseId |
| `JwtTokenException` | Expired or invalid JWT |
| `Low Virtual Thread utilization` | VT actuator warning (informational) |
