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
COPY backend/ .
RUN mvn clean package -DskipTests

# ---------- FINAL IMAGE ----------
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

COPY --from=backend-build /backend/target/*.jar app.jar
COPY --from=frontend-build /frontend/dist /app/static

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
