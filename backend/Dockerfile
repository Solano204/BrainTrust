# ============================================
# BUILD STAGE
# ============================================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app
COPY . .

# Build con Spring Boot Maven Plugin
RUN mvn clean package -DskipTests -pl container-app -am

# Debug: Ver qué JARs se generaron
RUN echo "=== Generated JARs ===" && ls -la /app/container-app/target/*.jar

# ============================================
# RUNTIME STAGE
# ============================================
FROM eclipse-temurin:21-jre

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r braintrust && useradd -r -g braintrust braintrust

# Copiar el JAR ejecutable de Spring Boot (NO el original-*)
COPY --from=builder /app/container-app/target/container-app-*.jar app.jar

RUN mkdir -p /app/storage/documents /app/logs && \
    chown -R braintrust:braintrust /app

USER braintrust

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]