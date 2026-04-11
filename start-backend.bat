@echo off
setlocal EnableDelayedExpansion

echo ============================================================
echo   CloudCostLens — Backend Startup
echo ============================================================
echo.

REM ──────────────────────────────────────────────────────
REM Step 1: Load environment variables from .env file
REM ──────────────────────────────────────────────────────
set ENV_FILE=%~dp0.env
if exist "%ENV_FILE%" (
    echo [ENV] Loading credentials from .env ...
    for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
        set "LINE=%%A"
        REM Skip comment lines and blank lines
        if not "!LINE:~0,1!"=="#" (
            if not "%%A"=="" (
                set "%%A=%%B"
            )
        )
    )
    echo [ENV] Variables loaded.
) else (
    echo [WARN] .env file not found at %ENV_FILE%
    echo [WARN] AWS credentials must be set as system environment variables.
)
echo.

REM ──────────────────────────────────────────────────────
REM Step 2: Validate AWS credentials are present
REM ──────────────────────────────────────────────────────
if "%AWS_ACCESS_KEY_ID%"=="" (
    echo [ERROR] AWS_ACCESS_KEY_ID is not set.
    echo         Add it to your .env file or set it as a system environment variable.
    echo         See: Control Panel -^> System -^> Advanced System Settings -^> Environment Variables
    pause
    exit /b 1
)
if "%AWS_SECRET_ACCESS_KEY%"=="" (
    echo [ERROR] AWS_SECRET_ACCESS_KEY is not set.
    echo         Add it to your .env file or set it as a system environment variable.
    pause
    exit /b 1
)
echo [OK]  AWS credentials detected (KEY: %AWS_ACCESS_KEY_ID:~0,8%...)
if not "%AWS_DEFAULT_REGION%"=="" (
    echo [OK]  AWS region: %AWS_DEFAULT_REGION%
) else (
    set AWS_DEFAULT_REGION=us-east-1
    echo [DEFAULT] AWS_DEFAULT_REGION not set, using us-east-1
)
echo.

REM ──────────────────────────────────────────────────────
REM Step 3: Check Java
REM ──────────────────────────────────────────────────────
echo [CHECK] Verifying Java installation...
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed or not in PATH.
    echo         Install Java 17+ from https://adoptium.net/
    pause
    exit /b 1
)
echo [OK]  Java found:
java -version 2>&1 | find "version"
echo.

REM ──────────────────────────────────────────────────────
REM Step 4: Check Maven
REM ──────────────────────────────────────────────────────
echo [CHECK] Verifying Maven installation...
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven not found.
    echo         Install Maven from https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo [OK]  Maven found:
mvn -version 2>&1 | find "Apache Maven"
echo.

REM ──────────────────────────────────────────────────────
REM Step 5: Check Terraform (warn only, not fatal)
REM ──────────────────────────────────────────────────────
where terraform >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Terraform not found in PATH.
    echo        Deployments will fail. Install from https://developer.hashicorp.com/terraform/downloads
) else (
    echo [OK]  Terraform found.
)
echo.

REM ──────────────────────────────────────────────────────
REM Step 6: Start the backend
REM ──────────────────────────────────────────────────────
echo ============================================================
echo   Starting CloudCostLens Backend...
echo   App Dashboard: http://localhost:5173
echo   API Docs:      http://localhost:8080/swagger-ui/index.html
echo   Health:        http://localhost:8080/api/health
echo   Press Ctrl+C to stop.
echo ============================================================
echo.

cd /d "%~dp0backend"
mvn spring-boot:run

endlocal
