# CloudCostLens Monolithic Dockerfile
# Combines React Frontend and Spring Boot Backend for Render Deployment

# ---------- STAGE 1: Build Frontend ----------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
# Build cache for dependencies
COPY frontend/package*.json ./
RUN npm install
# Copy source and build
COPY frontend/ ./
RUN npm run build

# ---------- STAGE 2: Build Backend ----------
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
# Build cache for maven dependencies
COPY backend/pom.xml ./backend/
RUN mvn -f backend/pom.xml dependency:go-offline
# Copy backend source
COPY backend/src ./backend/src
# Inject Frontend build results into backend static resources
# This allows Spring Boot to serve the React application
RUN mkdir -p backend/src/main/resources/static
COPY --from=frontend-build /app/frontend/dist ./backend/src/main/resources/static
# Build the final fat JAR
RUN mvn -f backend/pom.xml clean package -DskipTests

# ---------- STAGE 3: Final Runtime ----------
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl unzip bash

# Install Terraform (Essential for the engine)
ENV TERRAFORM_VERSION=1.7.5
RUN curl -fsSL https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o terraform.zip \
    && unzip terraform.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform.zip

# Environment overrides for Render/Production
ENV TERRAFORM_WORKSPACE_BASE=/app/terraform/workspaces
ENV TERRAFORM_ENVIRONMENT_PATH=/app/terraform/environments/dynamic
RUN mkdir -p /app/terraform/workspaces

# Copy the build artifact
COPY --from=backend-build /app/backend/target/*.jar app.jar

EXPOSE 8080

# Run the monolithic application
ENTRYPOINT ["java", "-jar", "app.jar"]
