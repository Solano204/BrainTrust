---
name: db-migration
description: >
  Helper for creating and applying database migrations for BrainTrust.
  Guides you through writing safe SQL migrations, checking JPA entity alignment,
  and validating with the dev database.
---

# Skill: Database Migration

When the user runs `/db-migration`, ask:
1. What changed? (new table / add column / rename / index / constraint)
2. Which entity/module is affected?

## Step 1 — Check the JPA entity

Read the entity class that changed. For example, if a column was added to `Course`:
```
education/src/main/java/com/braintrust/education/infraestructure/repositoriesPersistence/sql/entities/CourseJpaEntity.java
```

Make note of:
- New `@Column` annotations
- Changed `nullable`, `length`, `unique` settings
- New `@ManyToOne`, `@OneToMany` relationships

## Step 2 — Write the SQL migration

File location: `shared/src/main/resources/db/migration/` (or wherever Flyway/Liquibase is configured).

Naming convention: `V{next_version}__description_with_underscores.sql`

Example for adding a nullable column:
```sql
ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
```

Example for adding a NOT NULL column (safe pattern):
```sql
-- Step 1: add nullable
ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMP;

-- Step 2: backfill existing rows
UPDATE assignments
    SET submission_deadline = created_at + INTERVAL '7 days'
    WHERE submission_deadline IS NULL;

-- Step 3: add constraint (separate statement)
ALTER TABLE assignments
    ALTER COLUMN submission_deadline SET NOT NULL;
```

## Step 3 — Validate alignment

Check that the entity `@Column` definitions match the SQL:
- `nullable = false` in Java <-> `NOT NULL` in SQL
- `length = 255` in Java <-> `VARCHAR(255)` in SQL
- `unique = true` in Java <-> `UNIQUE` constraint in SQL

## Step 4 — Test locally

```bash
# Start DB only
docker-compose up -d postgres

# Run Spring Boot — Hibernate will validate against the new schema
mvn -pl container-app spring-boot:run -Dspring-boot.run.arguments="--spring.jpa.hibernate.ddl-auto=validate"
```

If Hibernate throws `SchemaManagementException`, the entity and SQL don't match.

## Safety rules
- Always use `IF NOT EXISTS` / `IF EXISTS` for idempotent migrations
- Never write `DROP COLUMN` without confirming no code reads that column
- Never write `TRUNCATE` in a migration script
- Test on dev DB before applying to prod
