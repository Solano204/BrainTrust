---
name: deploy-check
description: >
  Pre-deployment checklist for BrainTrust backend. Verifies all required env vars,
  runs tests, checks security config, and validates the build before deploying.
---

# Skill: Pre-Deployment Check

When the user runs `/deploy-check`, run this checklist in order. Stop and report if anything fails.

## 1. Clean build + tests
```bash
mvn clean package
```
Must succeed with zero test failures. If tests are skipped, warn explicitly.

## 2. Required environment variables check

The following env vars MUST be set in production. Check they are non-empty:

| Variable | Purpose |
|----------|---------|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_NAME` | Database name |
| `DB_USERNAME` | DB user |
| `DB_PASSWORD` | DB password |
| `JWT_SECRET` | Must be >= 32 chars |
| `GOOGLE_AI_API_KEY` | Gemini API key |
| `SPRING_PROFILES_ACTIVE` | Must be `prod` |
| `LOG_PATH` | Log directory path |

## 3. Security checks

Read `SecurityConfig.java`:
- [ ] CORS `allowedOriginPatterns("*")` should be restricted to actual frontend domain
- [ ] Actuator endpoints not exposed publicly

Read `application-prod.yml`:
- [ ] No hardcoded secrets (all values use `${ENV_VAR}` syntax with no defaults)
- [ ] `spring.jpa.show-sql=false`
- [ ] Log level is `INFO`, not `DEBUG`

## 4. Docker image build
```bash
docker build -t braintrust-backend:latest .
```
Check Dockerfile uses the correct Java version (21+).

## 5. Verify the JAR starts

```bash
java -jar container-app/target/container-app-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --server.port=8080
```
Watch for startup errors in the first 30 seconds, then hit:
```bash
curl http://localhost:8080/actuator/health
```
Expected: `{"status":"UP"}`

## 6. Virtual thread health
```bash
curl http://localhost:8080/actuator/health/virtualThreads
```
Should show `{"status":"UP"}`.

## 7. Final checklist
- [ ] Git is on `main` branch and up-to-date
- [ ] No uncommitted changes
- [ ] `CHANGELOG` or release notes updated
- [ ] Terraform infrastructure matches if infrastructure changed (`braintrust-terraform/`)
