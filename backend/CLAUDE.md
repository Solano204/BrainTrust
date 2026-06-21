# BrainTrust Backend

## Project Overview

Spring Boot 3.5.6 / Java 25 multi-module Maven monorepo — educational platform with AI-powered assignment detection.

## Module Structure

```
backend/
  shared/          - Shared DTOs, exceptions, base classes
  identity/        - Auth, JWT, users, persons, roles
  education/       - Courses, assignments, quizzes, submissions, gradebook
  aidetectition/   - AI detection engine (Google Gemini integration)
  container-app/   - Single deployable Spring Boot app, REST controllers
```

All modules are assembled into **container-app** at runtime. There is no separate deploy per module.

## Architecture

Hexagonal (ports-and-adapters) per module:
- `domain/` — pure domain model, no Spring
- `application/` — services, helpers, DTOs, ports (interfaces)
- `infraestructure/` — JPA adapters, external providers, mappers
- `container-app/rest/` — REST controllers, global exception handler

Pattern: Controller → ApplicationService → Helper(s) → Repository (port) → JPA adapter

## Running the App

```bash
# Dev profile (default)
mvn -pl container-app spring-boot:run

# Prod profile
SPRING_PROFILES_ACTIVE=prod mvn -pl container-app spring-boot:run
```

Required environment variables (prod):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET`
- `GOOGLE_AI_API_KEY`

## Logging

Using SLF4J with Logback (`logback-spring.xml` in container-app/resources).

**Log file location**: controlled by `LOG_PATH` env var (default `./logs/`).  
- `braintrust-api.log` — all INFO+ logs, rolling daily, 30-day retention
- `braintrust-api-error.log` — ERROR only, 60-day retention

**Profile behavior**:
- `dev` — console only, `com.braintrust` at DEBUG
- `prod` — console + file + error file, all at INFO

**Log message convention** (key=value pairs):
```java
log.info("Action verb + noun key=value key2=value2", val1, val2);
// Examples:
log.info("Submission created id={} durationMs={} format={}", id, ms, format);
log.error("Analysis failed submission={}: {}", id, e.getMessage(), e);
log.warn("Deleting course id={} with cascade", courseId);
```

No emojis in log messages. No multi-line info dumps (consolidate into one line).

## Key Classes

| Class | Location | Responsibility |
|-------|----------|----------------|
| `GlobalExceptionHandler` | container-app/rest/ | Maps all exceptions to HTTP responses |
| `SecurityConfig` | identity/infraestructure/security/ | JWT filter chain, CORS, role rules |
| `JwtAuthenticationFilter` | identity/.../filters/ | Extracts + validates JWT on each request |
| `JwtService` | identity/.../services/ | Issues and validates JWT tokens |
| `AnalysisApplicationService` | aidetectition/application/services/ | Orchestrates AI text analysis |
| `SubmissionAIAnalysisHelper` | education/.../helpers/submission/ | Async AI trigger on submission |
| `VirtualThreadConfiguration` | container-app/ | Configures Java 21 virtual threads for Tomcat and @Async |
| `VirtualThreadHealthIndicator` | container-app/ | Actuator health check at /actuator/health/virtualThreads |

## Security

- JWT access token: 15 min (`JWT_ACCESS_EXPIRATION=900000`)
- JWT refresh token: 30 days (`JWT_REFRESH_EXPIRATION=2592000000`)
- Roles: `STUDENT`, `TEACHER`, `ADMIN`
- Rate limiting: 60 req/min per IP (configurable via `RATE_LIMIT_RPM`)
- CORS: `allowedOriginPatterns("*")` with credentials — **restrict in production**

## AI Detection

Provider selection via env vars:
- `AI_PROVIDER` — main provider (default: `GoogleGeminiAIProvider`)
- `TEXT_EXTRACTION_PROVIDER` — PDF text extraction (default: `MockTextExtractionProvider`)
- `AI_MODEL_DEFAULT_TYPE` — model type enum (default: `ENSEMBLE`)

Analysis is triggered **asynchronously** after every `DIGITAL` format submission via `@Async("virtualTaskExecutor")`. Minimum text length: `AI_ANALYSIS_MIN_TEXT_LENGTH` (default 50 chars).

## Configuration Files

| File | Purpose |
|------|---------|
| `application.yml` | Base config (dev defaults) |
| `application-prod.yml` | Prod overrides (loaded when `SPRING_PROFILES_ACTIVE=prod`) |
| `logback-spring.xml` | Logback config with rolling file appenders |

## Testing

```bash
mvn test                          # all modules
mvn -pl education test            # single module
```

No mocks for repositories in integration tests — they use real DB.

## Build

```bash
mvn clean package -DskipTests
# Output: container-app/target/container-app-0.0.1-SNAPSHOT.jar
```
