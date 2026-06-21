---
name: daily-log-review
description: >
  Daily routine: reviews the past 24 hours of backend logs. Reports error count,
  slowest AI analyses, authentication failures, and any new exception types.
  Run manually with: /daily-log-review
  Or schedule with: /loop "run the daily-log-review routine"
schedule: daily at 09:00
---

# Routine: Daily Log Review

## What this does

Reviews the past 24 hours of BrainTrust backend logs and produces a summary report.

## Steps

### 1. Check error count
```powershell
$yesterday = (Get-Date).AddHours(-24).ToString("yyyy-MM-dd HH")
$errors = Select-String -Path ./logs/braintrust-api-error.log -Pattern $yesterday
Write-Output "Errors in last 24h: $($errors.Count)"
```

### 2. Find new exception types (not seen before)
Read `./logs/braintrust-api-error.log` and group by exception class name. Report any exception class that appears for the first time today.

### 3. Slowest AI analyses
Search `./logs/braintrust-api.log` for lines matching `Analysis complete`:
- Find the 5 with the highest `durationMs` value
- Report: submission ID, duration, AI probability, model used

### 4. Authentication failures
Search for `JwtTokenException` or `Authentication failed` patterns.
Count: how many? Same IP repeatedly? Possible brute force?

### 5. Submission pipeline health
Count:
- Submissions created (lines matching `Submission created`)
- AI analyses triggered
- AI analyses completed
- AI analyses failed

Report as: `created=N triggered=N completed=N failed=N`

## Output

Produce a short report:
```
=== Daily Log Report [DATE] ===
Errors:          3
New exceptions:  none
Slowest AI:      id=xxx durationMs=12340 probability=87% model=ENSEMBLE
Auth failures:   0
Submissions:     created=15 triggered=12 completed=11 failed=1
Action needed:   Review failed AI analysis (id=xxx) — see error log
```
