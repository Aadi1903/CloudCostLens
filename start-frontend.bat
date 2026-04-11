@echo off
setlocal

echo ============================================================
echo   CloudCostLens — Frontend Startup
echo ============================================================
echo.

echo [CHECK] Verifying Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [CHECK] Verifying npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)

cd /d "%~dp0frontend"

if not exist "node_modules\" (
    echo [SETUP] First run detected. Installing dependencies...
    npm install
)

echo ============================================================
echo   Starting Vite Dev Server...
echo   Open your browser to: http://localhost:5173
echo   Press Ctrl+C to stop.
echo ============================================================
echo.

npm run dev

endlocal
