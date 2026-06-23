---
name: weekly-test-health
description: >
  Weekly routine: runs the full test suite and generates a health report.
  Tracks test count over time and flags modules with no tests or failing tests.
  Run manually with: /weekly-test-health
schedule: every Friday at 15:00
---

# Routine: Weekly Test Health

## What this does

Runs all backend tests and produces a test coverage + health report.

## Steps

### 1. Run all tests
```bash
mvn test 2>&1 | tee .claude/logs/test-run-latest.txt
```

### 2. Parse results per module

From the output, extract for each module:
- Tests run
- Failures
- Errors
- Skipped
- Time taken

### 3. Check for modules with zero tests
List all modules in the parent `pom.xml`, then check if each has test files:
```powershell
Get-ChildItem -Path . -Recurse -Filter "*Test.java" | Group-Object { $_.FullName.Split('\')[5] } | Select-Object Name, Count
```
Report any module with `Count = 0`.

### 4. Identify consistently failing tests
Read `.claude/logs/test-run-latest.txt` and compare against previous run if stored.
Note: tests that fail every week are probably broken or flaky, not just environmental.

### 5. Coverage check (if JaCoCo configured)
```bash
mvn test jacoco:report
```
Open `target/site/jacoco/index.html` conceptually — report overall line coverage %.
Target: >= 70% for `application/services/` and `application/helpers/`.

## Output
```
=== Weekly Test Health [DATE] ===
identity:      12 tests | 0 failures | 0 skipped
education:     47 tests | 0 failures | 2 skipped
aidetectition: 5 tests  | 0 failures | 0 skipped
shared:        0 tests  (WARNING: no tests)
container-app: 3 tests  | 0 failures | 0 skipped

Total: 67 tests, 0 failures, 2 skipped
Time: 23.4s

Coverage: not configured (add JaCoCo plugin to measure)
Status: HEALTHY
```
