---
name: run-tests
description: >
  Run tests for a specific module or the full backend. Shows failures clearly
  with the test name, error message, and stack trace location.
---

# Skill: Run Tests

When the user runs `/run-tests`, ask:
1. Which module? (`all` / `identity` / `education` / `aidetectition` / `shared`)
2. A specific test class? (optional — runs all if not specified)

## Commands

### All modules
```bash
mvn test 2>&1 | grep -E "(Tests run|FAILED|ERROR|BUILD)" | tail -40
```

### Single module
```bash
mvn -pl {module} test 2>&1 | tail -50
```

### Single test class
```bash
mvn -pl {module} test -Dtest={TestClassName} 2>&1 | tail -60
```

### Single test method
```bash
mvn -pl {module} test -Dtest={TestClassName}#{methodName} 2>&1 | tail -60
```

## Reading the output

After running, report:
- Total: X passed, Y failed, Z skipped
- For each FAILURE:
  - Test class + method name
  - Expected vs actual (from AssertionError)
  - Line number in source

## Common failure patterns in this project

| Symptom | Likely cause |
|---------|-------------|
| `DataIntegrityViolationException` | Missing required column in test fixture |
| `NoSuchBeanDefinitionException` | Missing `@Component`/`@Service` or wrong module config |
| `JwtTokenException` | Test is missing `@WithMockUser` or auth header |
| `LazyInitializationException` | Missing `@Transactional` on test or `FetchType.EAGER` needed |

## Notes
- Integration tests hit a real DB — make sure Docker is running with `docker-compose up -d`
- Test DB connection is configured in `application.yml` (dev profile)
