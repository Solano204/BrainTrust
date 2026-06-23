# BrainTrust — AWS Deployment Guide

Complete steps to deploy the backend from scratch on AWS EC2 using Docker + Terraform.

---

## Prerequisites

- AWS account with IAM user (Access Key + Secret Key)
- Terraform installed locally
- Docker installed and logged in to Docker Hub (`docker login`)
- Key pair file: `braintrust-terraform/braintrust-key.pem`
- EC2 Elastic IP: `32.198.195.5`

---

## 1. Fix the Database Schema

Before building the image, ensure `backend/sql/schema.sql` matches the JPA entities exactly.
Hibernate runs with `ddl-auto: validate` in production — any mismatch crashes startup.

Key fix applied: `unit_grades` was missing its unique constraint declared in `UnitGradeJpaEntity`:

```sql
CREATE TABLE IF NOT EXISTS unit_grades (
    id VARCHAR(50) PRIMARY KEY,
    unit_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    ...
    last_calculated TIMESTAMP NOT NULL,
    CONSTRAINT uq_unit_grade_unit_student UNIQUE (unit_id, student_id)
);
```

---

## 2. Build and Push the Docker Image

Run from the `backend/` directory:

```bash
docker build -t joshua76i/braintrust-backend:latest .
docker push joshua76i/braintrust-backend:latest
```

The Dockerfile uses a two-stage build:
- Stage 1: `maven:3.9.11-eclipse-temurin-25` — builds the fat JAR (`mvn clean install -DskipTests`)
- Stage 2: `eclipse-temurin:25-jre-alpine` — runs the JAR as non-root `appuser`

---

## 3. Configure the Production `.env`

`backend/.env` is the file uploaded to the EC2. Key differences from local dev:

| Variable | Dev value | Prod value |
|---|---|---|
| `DB_HOST` | `localhost` | `postgres` (Docker service name) |
| `DB_NAME` | `brainTrust` | `braintrust_db` |
| `DB_PASSWORD` | `1234` | `BrainTrust2026!DB#Secure` |
| `DOCUMENT_STORAGE_LOCAL_BASE_PATH` | `./storage/documents` | `/app/storage/documents` |
| `CORS_ALLOWED_ORIGINS` | localhost only | include `http://32.198.195.5:8080` |
| `SWAGGER_SERVER_URL` | local | `http://32.198.195.5:8080` |

---

## 4. Provision Infrastructure with Terraform

```bash
cd braintrust-terraform/
terraform init
terraform apply
```

This creates:
- VPC, subnet, security group (ports 22, 80, 443, 8080 open)
- EC2 t3.micro (Amazon Linux 2023) with Elastic IP `32.198.195.5`
- `user_data.sh` runs on first boot: installs Docker, copies docker-compose.yml and init/schema.sql

To start a stopped instance later:
```bash
terraform apply   # or start it from the AWS console
```

---

## 5. Install Docker Compose on the EC2

The Amazon Linux 2023 Docker package doesn't include the Compose plugin. Install the standalone binary:

```bash
ssh -i braintrust-key.pem ec2-user@32.198.195.5

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## 6. Upload Files to EC2

From the `braintrust-terraform/` folder on your local machine:

```bash
# Upload the production .env
scp -i braintrust-key.pem ../backend/.env ec2-user@32.198.195.5:/home/ec2-user/.env

# Upload the SQL schema (if not already there via user_data)
scp -i braintrust-key.pem ../backend/sql/schema.sql ec2-user@32.198.195.5:/home/ec2-user/init/schema.sql
```

---

## 7. Prepare Directories and Permissions

The container runs as non-root `appuser`. The mounted host directories must be writable:

```bash
ssh -i braintrust-key.pem ec2-user@32.198.195.5

mkdir -p /home/ec2-user/logs /home/ec2-user/storage
chmod 777 /home/ec2-user/logs /home/ec2-user/storage
```

---

## 8. Apply the Database Schema Manually

The Postgres init script (`docker-entrypoint-initdb.d`) only runs on a **fresh, empty volume**.
If the volume already exists from a prior run, apply the schema manually:

```bash
# Start only postgres first
docker-compose up -d postgres

# Apply schema
docker exec -i braintrust-db psql -U postgres -d braintrust_db < /home/ec2-user/init/schema.sql
```

---

## 9. Start the Application

```bash
cd /home/ec2-user
docker-compose up -d braintrust-backend
docker-compose logs -f braintrust-backend
```

Wait for: `Started BrainTrustApplication in X.XXX seconds`

Verify health:
```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP","groups":["liveness","readiness"]}
```

---

## 10. Common Errors and Fixes

### Container name already in use
```bash
docker stop braintrust-app && docker rm braintrust-app
docker-compose down --remove-orphans
docker-compose up -d braintrust-backend
```

### Schema validation error (missing table)
The Postgres volume already existed — init script didn't run. Apply manually (see Step 8).

### `Could not resolve placeholder 'GOOGLE_AI_API_KEY'`
The `.env` on the EC2 is missing or outdated. Re-upload (see Step 6), then:
```bash
# Use `up -d` NOT `restart` — restart does not re-read env files
docker-compose up -d braintrust-backend
```

### Log permission denied
```bash
chmod 777 /home/ec2-user/logs
```

### `docker compose` not found (no space)
Use `docker-compose` (hyphen) — the standalone binary, not the plugin. See Step 5.

---

## 11. Connect pgAdmin via SSH Tunnel

Port 5432 is not exposed publicly. Use an SSH tunnel:

```bash
# Run on your LOCAL machine — keep this terminal open
ssh -i braintrust-key.pem -L 5432:localhost:5432 ec2-user@32.198.195.5 -N
```

Then connect pgAdmin to:
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `braintrust_db`
- **Username:** `postgres`
- **Password:** `BrainTrust2026!DB#Secure`

---

## 12. Redeploy After a Code Change

```bash
# 1. Build and push new image
cd backend/
docker build -t joshua76i/braintrust-backend:latest .
docker push joshua76i/braintrust-backend:latest

# 2. Pull and recreate container on EC2
ssh -i braintrust-key.pem ec2-user@32.198.195.5
cd /home/ec2-user
docker-compose pull braintrust-backend
docker-compose up -d braintrust-backend
```

---

## docker-compose.yml Reference

Located at `/home/ec2-user/docker-compose.yml` on the EC2.

- Service name: `braintrust-backend` (use this with docker-compose commands)
- Container name: `braintrust-app` (use this with `docker exec`/`docker logs`)
- Postgres service name: `postgres`, container name: `braintrust-db`
- App port: `8080:8080`
- Volumes: `./logs:/app/logs`, `./storage:/app/storage`, `./init:/docker-entrypoint-initdb.d`
