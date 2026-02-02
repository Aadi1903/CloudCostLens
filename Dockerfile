# ---------- FRONTEND BUILD ----------
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ---------- BACKEND BUILD ----------
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src

# Copy React build output into Spring Boot static resources directory
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

# Build Spring Boot JAR with embedded React files
RUN mvn clean package -DskipTests

# ---------- FINAL IMAGE ----------
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy only the self-contained JAR (includes React files inside)
COPY --from=backend-build /backend/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
