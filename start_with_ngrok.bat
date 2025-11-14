@echo off
echo ========================================
echo Starting Attendance System with ngrok
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ngrok is not installed or not in PATH
    echo.
    echo Please:
    echo 1. Download ngrok from https://ngrok.com/download
    echo 2. Extract it to a folder
    echo 3. Add it to your PATH or place ngrok.exe in this folder
    echo.
    pause
    exit /b 1
)

echo [1/4] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0backend && start_backend.bat"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [2/4] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo [3/4] Starting ngrok tunnel...
echo.
echo ========================================
echo IMPORTANT: Your ngrok URL will appear below
echo Share this URL with students!
echo ========================================
echo.
echo Press Ctrl+C to stop ngrok
echo.
echo ========================================
echo.

REM Start ngrok
ngrok http 3000

pause

