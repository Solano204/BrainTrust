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

# Build arguments
ARG ARTIFACT_NAME=container-app-0.0.1-SNAPSHOT.jar
ARG JAR_PATH=container-app/target/${ARTIFACT_NAME}

# Build all modules
RUN mvn clean install -DskipTests

# Verify JAR was created and is executable
RUN echo "--- Verifying built JAR ---" && \
    ls -lh ${JAR_PATH} && \
    java -Djarmode=layertools -jar ${JAR_PATH} list

# Extract layers to a temporary directory
RUN mkdir -p /app/extracted && \
    cd /app/extracted && \
    java -Djarmode=layertools -jar /app/${JAR_PATH} extract

# Verify extraction worked
RUN echo "--- Verifying extracted layers ---" && \
    ls -la /app/extracted/ && \
    echo "--- Spring Boot Loader contents ---" && \
    ls -la /app/extracted/spring-boot-loader/ || echo "No spring-boot-loader directory"

# ----------------------------------------------------------------------
# STAGE 2: RUNTIME
# ----------------------------------------------------------------------
FROM eclipse-temurin:25-jre-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy layers in correct order
COPY --from=builder --chown=appuser:appgroup /app/extracted/dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appgroup /app/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/extracted/application/ ./

# Switch to non-root user
USER appuser

# Debug: Verify final structure
RUN echo "--- Final app directory structure ---" && \
    ls -laR /app && \
    echo "--- Searching for JarLauncher class ---" && \
    find /app -name "*.jar" -exec sh -c 'echo "Checking {}"; jar tf {} | grep JarLauncher || true' \;

# Use explicit classpath with proper launcher
ENTRYPOINT ["java", \
    "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-default}", \
    "org.springframework.boot.loader.launch.JarLauncher"]

EXPOSE 8080