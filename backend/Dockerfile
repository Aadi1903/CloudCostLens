# ---------- BACKEND BUILD ----------
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
# Copy pom first for better caching
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:17-jdk-focal
WORKDIR /app

# Install dependencies for Terraform
RUN apt-get update && apt-get install -y curl unzip bash

# Install official Terraform binary
ENV TERRAFORM_VERSION=1.7.5
RUN curl -fsSL https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o terraform.zip \
    && unzip terraform.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform.zip

# Create space for terraform workspaces (will be mounted as volume)
RUN mkdir -p /app/terraform/workspaces

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

# The app needs access to the terraform templates
# We will mount the terraform directory in docker-compose

ENTRYPOINT ["java", "-jar", "app.jar"]
