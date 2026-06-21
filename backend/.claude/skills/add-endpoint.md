---
name: add-endpoint
description: >
  Scaffold a complete REST endpoint following the BrainTrust hexagonal architecture.
  Creates the full chain: Controller -> ApplicationService -> Helper -> Repository port -> JPA adapter.
  Prompts for the resource name, HTTP method, and module, then generates all files.
---

# Skill: Add Endpoint

When the user runs `/add-endpoint`, gather these inputs:

1. **Module**: which module? (`identity` / `education` / `aidetectition`)
2. **Resource**: what is the entity/aggregate? (e.g., `Assignment`, `QuizResult`)
3. **HTTP method + path**: e.g., `GET /api/courses/{id}/assignments`
4. **Role access**: which roles can call this? (`STUDENT`, `TEACHER`, `ADMIN`, or combination)
5. **Input/Output**: what does the request body look like? What does it return?

## Files to create (in order)

Follow hexagonal architecture strictly. All file names follow existing patterns.

### 1. Command or Query DTO
Path: `{module}/src/main/java/com/braintrust/{module}/application/dtos/commands/{ResourceAction}Command.java`
- Use Java record for commands
- Use `@NotBlank`, `@NotNull` for validation

### 2. Response DTO
Path: `{module}/src/main/java/com/braintrust/{module}/application/dtos/dtos/{Resource}DTO.java`
- Java record, all fields typed explicitly

### 3. Port (interface)
Path: `{module}/src/main/java/com/braintrust/{module}/application/ports/in/{Resource}Service.java`
- Interface with one method for this operation

### 4. ApplicationService
Path: `{module}/src/main/java/com/braintrust/{module}/application/service/{Resource}ApplicationService.java`
- Implements the port
- Uses `@Service`, `@Transactional`
- Delegates to Helper(s) for complex logic
- Log: `log.info("Action description resourceId={}", ...)` on entry and success

### 5. Helper (if needed)
Path: `{module}/src/main/java/com/braintrust/{module}/application/helpers/{resource}/{Resource}Helper.java`
- `@Component`, logic only, no domain-rule enforcement

### 6. Repository port (if new entity)
Path: `{module}/src/main/java/com/braintrust/{module}/application/ports/out/{Resource}Repository.java`
- Interface, only the methods this use-case needs

### 7. JPA adapter (if new entity)
Path: `{module}/src/main/java/com/braintrust/{module}/infraestructure/repositoriesPersistence/sql/repositories/Jpa{Resource}RepositoryAdapter.java`

### 8. REST Controller method
Path: `container-app/src/main/java/com/braintrust/containerapp/rest/{module}/{Resource}Controller.java`
- Add `@GetMapping` / `@PostMapping` etc.
- `@PreAuthorize` with role(s) determined in step 4
- Returns `ResponseEntity<{Resource}DTO>`
- Log request entry: `log.debug("GET {path} resourceId={}", ...)`

## Checklist before finishing
- [ ] Added new route to `SecurityConfig` if not covered by existing patterns
- [ ] Added to the module's `pom.xml` if a new dependency is needed
- [ ] Log messages use `key=value` format, no emoji
- [ ] No AI-generated comments
- [ ] Response DTO has all fields the frontend needs

## Example
User says: "Add GET /api/courses/{courseId}/gradebook for TEACHER role"

Creates:
- `GetGradebookQuery.java` (record with courseId)
- `GradebookDTO.java` (response)
- `GradebookService.java` (port interface)
- `GradebookApplicationService.java` (service impl)
- `GradebookHelper.java` (calculation logic)
- Method in `GradebookController.java`
