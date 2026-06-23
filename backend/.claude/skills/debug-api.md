---
name: debug-api
description: >
  Debug a specific REST endpoint in BrainTrust. Traces the full request path from
  controller to database, identifies where it fails, and suggests fixes.
---

# Skill: Debug API Endpoint

When the user runs `/debug-api`, ask:
1. Which endpoint? (method + path, e.g., `POST /api/courses/{id}/assignments`)
2. What's the symptom? (500 error / 403 / wrong data / slow response / not found)
3. Do you have the error message or stack trace?

## Trace the call chain

Find the controller method:
```bash
Select-String -Path container-app/src -Pattern "RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping" -Recurse -Include "*.java" | Select-String "{path_keyword}"
```

Then follow the chain:
1. **Controller** — `container-app/rest/{module}/{Resource}Controller.java`
2. **ApplicationService** — `{module}/application/service/{Resource}ApplicationService.java`
3. **Helper(s)** — `{module}/application/helpers/`
4. **Repository port** — `{module}/application/ports/out/{Resource}Repository.java`
5. **JPA adapter** — `{module}/infraestructure/...Jpa{Resource}RepositoryAdapter.java`

## Common symptoms and fixes

| Symptom | Where to look | Likely fix |
|---------|--------------|-----------|
| `403 Forbidden` | SecurityConfig + @PreAuthorize | Role mismatch or missing JWT |
| `404 Not Found` | Controller @RequestMapping | Path typo or missing mapping |
| `500 NullPointerException` | Service or Helper | Null check missing, or lazy-load outside transaction |
| `400 Bad Request` | GlobalExceptionHandler | DTO validation failed — check @Valid |
| `409 Conflict` | Domain exception | Business rule violation — check exception type |
| Response is empty / wrong data | DTO mapper | Check the toDTO() mapper method |
| Async task not running | VirtualThreadConfiguration | @Async executor name mismatch |

## Check SecurityConfig
```bash
Select-String -Path identity/src -Pattern "requestMatchers|antMatchers" -Recurse -Include "*.java"
```
Verify the endpoint path is either:
- Explicitly permitted: `.permitAll()`
- Explicitly role-guarded: `.hasRole("TEACHER")`
- Covered by `@PreAuthorize` on the controller

## Check GlobalExceptionHandler
```bash
Read container-app/src/main/java/com/braintrust/containerapp/rest/GlobalExceptionHandler.java
```
If the error is a new exception type not mapped there, it returns a generic 500.

## Check logs for the real error
```bash
Get-Content ./logs/braintrust-api-error.log -Tail 50
```

## Test with curl
```bash
curl -s -X {METHOD} http://localhost:8080/{path} \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{body}' | python -m json.tool
```
