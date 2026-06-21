---
name: add-module
description: >
  Scaffold a new Maven module following the BrainTrust multi-module structure.
  Creates the standard hexagonal directory layout and wires it into the parent pom.xml
  and container-app dependencies.
---

# Skill: Add Maven Module

When the user runs `/add-module`, ask:
1. Module name (e.g., `notifications`, `analytics`)
2. What domain problem does it solve?
3. Will it have a REST controller? (yes/no — controllers always go in container-app)
4. Will it need DB access? (yes/no)

## Directory structure to create

```
{module-name}/
  src/
    main/
      java/
        com/braintrust/{modulename}/
          domain/
            model/           <- Domain entities (no Spring)
            valueobjects/    <- Value objects
            exceptions/      <- Domain exceptions
          application/
            dtos/
              commands/      <- Input records (commands/queries)
              dtos/          <- Output records (response DTOs)
            ports/
              in/            <- Use-case interfaces
              out/           <- Repository interfaces
            services/        <- ApplicationService implementations
            helpers/         <- Domain helpers (@Component)
          infraestructure/
            repositoriesPersistence/
              sql/
                entities/    <- JPA entities
                Mapper/      <- Entity <-> Domain mappers
                repositories/ <- JPA adapters + Spring Data repos
      resources/
        application.yml      <- Module-specific config (empty/minimal)
    test/
      java/
        com/braintrust/{modulename}/
          application/       <- Service tests
          infraestructure/   <- Repository tests
  pom.xml
```

## pom.xml template for new module

```xml
<project>
  <parent>
    <groupId>com.braintrust</groupId>
    <artifactId>braintrust-parent</artifactId>
    <version>0.0.1-SNAPSHOT</version>
  </parent>
  <artifactId>{module-name}</artifactId>
  <dependencies>
    <dependency>
      <groupId>com.braintrust</groupId>
      <artifactId>shared</artifactId>
    </dependency>
    <!-- Add spring-boot-starter-data-jpa if DB access needed -->
  </dependencies>
</project>
```

## Files to update
1. Root `pom.xml` — add `<module>{module-name}</module>` to the `<modules>` section
2. `container-app/pom.xml` — add the new module as a dependency
3. `container-app/src/main/resources/application.yml` — add any module config if needed

## Checklist
- [ ] Module name is lowercase, no hyphens in package name
- [ ] Package is `com.braintrust.{modulename}` (no dots in the last segment)
- [ ] REST controllers go in `container-app/rest/{modulename}/`, not in the module itself
- [ ] Shared DTOs/exceptions that cross module boundaries go in the `shared` module
