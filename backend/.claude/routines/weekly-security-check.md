---
name: weekly-security-check
description: >
  Weekly routine: scans for security regressions. Checks for new hardcoded secrets,
  new endpoints without role enforcement, and dependency vulnerabilities.
  Run manually with: /weekly-security-check
schedule: every Monday at 10:00
---

# Routine: Weekly Security Check

## What this does

Scans the backend codebase every week for common security regressions introduced during development.

## Checks

### 1. Hardcoded secrets scan
Search all Java and YAML files for patterns that look like hardcoded credentials:
```powershell
Select-String -Path . -Pattern "(password|secret|apikey|api_key)\s*[:=]\s*['\"][^$\{][^'\"]{8,}" -Recurse -Include "*.java","*.yml","*.yaml" -CaseSensitive:$false
```
Exclude test files and `settings.local.json`. Report any matches.

### 2. Unannotated controller endpoints
Find all `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` in `container-app/rest/`:
```powershell
Select-String -Path container-app/src -Pattern "@(Get|Post|Put|Patch|Delete)Mapping" -Recurse -Include "*.java"
```
For each endpoint found, verify the controller class or method has `@PreAuthorize`. Report any without it.

### 3. New env var references without defaults in prod config
Check `application-prod.yml` for any `${ENV_VAR:default_value}` where `default_value` is non-empty and looks like a real secret. All secrets must use `${ENV_VAR}` with NO default.

### 4. AI-generated comments check
Search for emoji or section dividers in `.java` files (regression from previous cleanup):
```powershell
Select-String -Path . -Pattern "//.*[✅❌🚀]|/\*\*.*[✅❌]|// ={5,}" -Recurse -Include "*.java"
```
Report count. Should be zero.

### 5. Dependency snapshot

Run and save:
```bash
mvn dependency:tree -DoutputFile=.claude/logs/dependency-tree.txt
```
Compare against last week's snapshot if it exists.

## Output
```
=== Weekly Security Check [DATE] ===
Hardcoded secrets:       0 found
Unannotated endpoints:   0 found
Prod config secrets:     all clean
AI comments:             0 found
Dependency changes:      spring-security bumped 6.3.1 -> 6.3.2
Status: CLEAN
```
