#!/bin/bash
###############################################################################
# BrainTrust — EC2 Bootstrap Script (user_data)
# Runs automatically on first boot as root
# Installs: Docker, Docker Compose, Nginx, Certbot
# Creates: docker-compose.yml, .env, log directories
# Log: /var/log/braintrust-bootstrap.log
###############################################################################

set -euo pipefail
exec > >(tee /var/log/braintrust-bootstrap.log | logger -t braintrust-bootstrap 2>&1)

echo "=========================================================="
echo "BrainTrust Bootstrap Started: $(date)"
echo "=========================================================="

# ── 1. System Update ──────────────────────────────────────────────────────────
echo "[1/8] Updating system packages..."
dnf update -y

# ── 2. Install Docker ─────────────────────────────────────────────────────────
echo "[2/8] Installing Docker..."
dnf install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user
echo "Docker installed: $(docker --version)"

# ── 3. Install Docker Compose ─────────────────────────────────────────────────
echo "[3/8] Installing Docker Compose..."
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
curl -fsSL "https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
echo "Docker Compose installed: $(docker-compose --version)"

# ── 4. Install Nginx + Certbot ────────────────────────────────────────────────
echo "[4/8] Installing Nginx and Certbot..."
dnf install -y nginx certbot python3-certbot-nginx
systemctl enable nginx

# ── 5. Create directories ─────────────────────────────────────────────────────
echo "[5/8] Creating application directories..."
mkdir -p /var/log/braintrust
chown ec2-user:ec2-user /var/log/braintrust
mkdir -p /home/ec2-user
chown ec2-user:ec2-user /home/ec2-user

# ── 6. Write .env file ────────────────────────────────────────────────────────
echo "[6/8] Writing .env file..."
cat > /home/ec2-user/.env << 'ENVEOF'
# ── Spring ────────────────────────────────────────────────────────────────────
SPRING_PROFILES_ACTIVE=prod

# ── Database — uses Docker Compose service name as hostname ──────────────────
DB_HOST=postgres
DB_PORT=5432
DB_NAME=${db_name}
DB_USERNAME=${db_username}
DB_PASSWORD=${db_password}

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=${jwt_secret}
JWT_EXPIRATION=3600000

# ── AWS ───────────────────────────────────────────────────────────────────────
AWS_REGION=${aws_region}

# ── Server ────────────────────────────────────────────────────────────────────
SERVER_PORT=8080

# UPDATE THIS after deploying frontend to Vercel:
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
ENVEOF

chown ec2-user:ec2-user /home/ec2-user/.env
chmod 600 /home/ec2-user/.env
echo ".env written (permissions 600)"

# ── 7. Write docker-compose.yml ───────────────────────────────────────────────
echo "[7/8] Writing docker-compose.yml..."
cat > /home/ec2-user/docker-compose.yml << 'DCEOF'
version: '3.8'

services:
  # ── PostgreSQL 16 ────────────────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: braintrust-db
    restart: always
    environment:
      POSTGRES_DB: ${db_name}
      POSTGRES_USER: ${db_username}
      POSTGRES_PASSWORD: ${db_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - braintrust-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${db_username} -d ${db_name}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # ── Spring Boot Application ──────────────────────────────────────────────────
  app:
    image: eclipse-temurin:21-jre-alpine
    container_name: braintrust-app
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - /home/ec2-user/.env
    volumes:
      - /home/ec2-user/braintrust-container-app-0.0.1-SNAPSHOT.jar:/app/app.jar:ro
      - /var/log/braintrust:/var/log/braintrust
    ports:
      - "8080:8080"
    networks:
      - braintrust-net
    command: >
      java
      -Xmx512m
      -Xms256m
      -XX:+UseContainerSupport
      -XX:MaxRAMPercentage=60.0
      -jar /app/app.jar
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health | grep -q UP || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s

networks:
  braintrust-net:
    driver: bridge

volumes:
  postgres_data:
    driver: local
DCEOF

chown ec2-user:ec2-user /home/ec2-user/docker-compose.yml
echo "docker-compose.yml written"

# ── 8. Write Nginx default config (no domain yet — direct IP proxy) ───────────
echo "[8/8] Configuring Nginx..."
cat > /etc/nginx/conf.d/braintrust.conf << 'NGINXEOF'
# BrainTrust — Nginx Reverse Proxy
# Routes :80 → Spring Boot :8080
# Run certbot when your domain is ready:
#   sudo certbot --nginx -d api.yourdomain.com

server {
    listen 80 default_server;
    server_name _;

    # Increase timeouts for long AI detection requests
    proxy_read_timeout    300s;
    proxy_connect_timeout 75s;
    proxy_send_timeout    300s;

    # Large file uploads (PDFs, documents)
    client_max_body_size 50M;

    location / {
        proxy_pass         http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Connection        "";
    }

    # Health check endpoint (no auth required)
    location /actuator/health {
        proxy_pass http://localhost:8080/actuator/health;
    }
}
NGINXEOF

nginx -t && systemctl start nginx
echo "Nginx configured and started"

# ── Done ──────────────────────────────────────────────────────────────────────
echo "=========================================================="
echo "BrainTrust Bootstrap COMPLETE: $(date)"
echo ""
echo "NEXT STEPS (from your local machine):"
echo "  1. Upload JAR:"
echo "     scp -i KEY.pem target/braintrust-container-app-0.0.1-SNAPSHOT.jar ec2-user@<IP>:/home/ec2-user/"
echo ""
echo "  2. SSH in and start services:"
echo "     ssh -i KEY.pem ec2-user@<IP>"
echo "     docker-compose up -d"
echo "     docker-compose logs -f app"
echo "=========================================================="
