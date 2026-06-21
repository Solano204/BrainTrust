---
name: code-review
description: >
  Quick backend code review checklist for BrainTrust. Checks Java code quality,
  Spring Boot patterns, hexagonal architecture compliance, security, and logging conventions.
  For a deep review use the java-reviewer agent instead.
---

# Skill: Code Review (Backend)

When the user runs `/code-review`, ask:
1. Which files/module? (or "last commit" to diff HEAD)
2. Quick or thorough?

## Step 1 — Compilation check
```bash
mvn -pl {module} compile -q 2>&1 | tail -20
```
Report any compile errors first. If there are errors, stop and fix them before reviewing anything else.

## Step 2 — Tests
```bash
mvn -pl {module} test -q 2>&1 | tail -30
```
Report failures. Note: do NOT run tests if the user said "quick" and the module has no recent changes.

## Step 3 — Manual checks on changed files

### Architecture (hexagonal)
- [ ] Controllers are in `container-app/rest/` only — no business logic there
- [ ] ApplicationService never imports JPA entities — only domain models
- [ ] Domain models in `domain/` have no Spring imports
- [ ] Ports are interfaces — no implementations in `application/ports/`

### Java / Spring Boot
- [ ] No `@Autowired` field injection — only constructor injection
- [ ] `@Transactional` on service methods that write to DB
- [ ] No `Optional.get()` without `isPresent()` check — use `.orElseThrow()`
- [ ] No raw `new RuntimeException("...")` for domain errors — use specific domain exceptions
- [ ] Records used for DTOs/Commands where possible (Java 16+)

### Logging
- [ ] All log messages use `key=value` format
- [ ] No emoji in log messages
- [ ] No multi-line log dumps — one line per event
- [ ] `log.error()` always includes the exception as third argument

### Security
- [ ] New endpoints have `@PreAuthorize("hasRole('...')")` or are explicitly public
- [ ] No passwords or tokens logged
- [ ] No hardcoded credentials or API keys

### Code style
- [ ] No AI-generated comments (emoji, `// ✅ PHASE`, `/** ✅ */`, `// ========`)
- [ ] No unused imports
- [ ] Short focused methods — extract helpers if a method exceeds ~40 lines

## Output format
```
PASS  Compilation
PASS  Tests (3 passed)
WARN  Architecture — CourseController calls JPA directly (line 87)
FAIL  Logging — emoji found in GradebookService:112
```

For thorough review, say: "Use the java-reviewer agent for a deep review of [files]"
