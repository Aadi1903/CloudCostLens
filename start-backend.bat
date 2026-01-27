@echo off
echo Checking for Java...
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher from https://adoptium.net/
    pause
    exit /b 1
)

echo Java found!
java -version

echo.
echo Checking for Maven...
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Maven not found. Please install Maven from https://maven.apache.org/download.cgi
    echo Or use your IDE to run the Spring Boot application
    pause
    exit /b 1
)

echo Maven found!
mvn -version

echo.
echo Starting AWS Recommendation System Backend...
echo Server will start on http://localhost:8080
echo.
cd backend
mvn spring-boot:run
