---
name: security-audit
description: >
  Security audit for BrainTrust backend. Checks JWT configuration, CORS settings,
  Spring Security rules, role enforcement, and common OWASP Top 10 issues.
---

# Skill: Security Audit

When the user runs `/security-audit`, ask:
1. Scope: quick check / full audit
2. Specific area: JWT / CORS / roles / SQL / dependencies / all

## Areas to audit

### 1. JWT Configuration
Read `JwtService.java` and check:
- [ ] `JWT_ACCESS_EXPIRATION` is 900000 (15 min) or less — not longer
- [ ] `JWT_REFRESH_EXPIRATION` is 2592000000 (30 days) or less
- [ ] Secret is loaded from env var, not hardcoded
- [ ] Token is signed with HS256 or stronger (RS256 preferred in prod)
- [ ] Claims validated: expiration, issuer if set, not-before

### 2. Spring Security Config
Read `SecurityConfig.java` and check:
- [ ] CSRF disabled only for stateless REST (JWT) — correct for this project
- [ ] `.anyRequest().authenticated()` is the default — no public catch-all
- [ ] CORS `allowedOriginPatterns("*")` flagged — should restrict origins in prod
- [ ] Actuator endpoints require ADMIN role (not public)
- [ ] Rate limiter is wired up (`RateLimitingFilter` or similar)

### 3. Role enforcement
Read all `@PreAuthorize` annotations:
```bash
Select-String -Path container-app/src -Pattern "@PreAuthorize" -Recurse | Select-Object Line, Filename
```
Check:
- [ ] Every endpoint has explicit role requirement (no unannotated endpoints in controllers)
- [ ] STUDENT cannot call TEACHER or ADMIN endpoints
- [ ] Grade endpoints require TEACHER or ADMIN
- [ ] User management requires ADMIN

### 4. SQL Injection (JPA)
```bash
Select-String -Path . -Pattern "createNativeQuery|@Query.*nativeQuery" -Recurse -Include "*.java"
```
Check:
- [ ] All native queries use `?1`/`:param` binding — no string concatenation in queries
- [ ] No raw JDBC calls

### 5. Sensitive data in logs
```bash
Select-String -Path . -Pattern "log\..*(password|secret|token|key)" -Recurse -Include "*.java" -CaseSensitive:$false
```
Check: none of these should appear in log messages.

### 6. Dependency vulnerabilities
```bash
mvn dependency-check:check -DfailBuildOnCVSS=7
```
(requires OWASP dependency-check plugin — add to pom.xml if not present)

## Report format
```
CRITICAL  CORS allows all origins (production risk) — SecurityConfig.java:45
WARNING   JWT secret has no minimum length validation — JwtService.java:23
INFO      Rate limiter configured at 60 rpm — good
PASS      All controller endpoints have @PreAuthorize
```
