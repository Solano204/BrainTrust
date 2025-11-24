# ----------------------------------------------------------------------
# STAGE 1: BUILDER
# ----------------------------------------------------------------------
FROM maven:3.9.11-eclipse-temurin-25 AS builder
WORKDIR /app

# Copy project structure
COPY pom.xml .
COPY shared shared/
COPY identity identity/
COPY education education/
COPY aidetectition aidetectition/
COPY container-app container-app/

# Build all modules
RUN mvn clean install -DskipTests -B

# Verify the JAR was created
RUN echo "=== Verifying built JAR ===" && \
    ls -lh container-app/target/container-app-*.jar && \
    echo "=== JAR verified successfully ==="

# ----------------------------------------------------------------------
# STAGE 2: RUNTIME
# ----------------------------------------------------------------------
FROM eclipse-temurin:25-jre-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the complete executable JAR
COPY --from=builder --chown=appuser:appgroup \
    /app/container-app/target/container-app-0.0.1-SNAPSHOT.jar \
    app.jar

# Verify JAR was copied
RUN ls -lh app.jar && \
    echo "=== Application JAR ready ===" && \
    echo "Size: $(du -h app.jar | cut -f1)"

# Switch to non-root user
USER appuser

# Run the application
ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-default}", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", \
    "app.jar"]

EXPOSE 8080

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1