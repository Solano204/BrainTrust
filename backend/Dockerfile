# ============================================
# BUILD STAGE - USE JAVA 25 MAVEN IMAGE
# ============================================
FROM maven:3.9.9-eclipse-temurin-25 AS builder

WORKDIR /app
COPY . .

# Build with Java 25
RUN mvn clean package -DskipTests -pl container-app -am

# Debug: Check generated JARs
RUN echo "=== Generated JARs ===" && find /app -name "*.jar" -type f

# ============================================
# RUNTIME STAGE - USE JAVA 25 JRE
# ============================================
FROM eclipse-temurin:25-jre

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r braintrust && useradd -r -g braintrust braintrust

# Copy the Spring Boot executable JAR
COPY --from=builder /app/container-app/target/container-app-*.jar app.jar

RUN mkdir -p /app/storage/documents /app/logs && \
    chown -R braintrust:braintrust /app

USER braintrust

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]