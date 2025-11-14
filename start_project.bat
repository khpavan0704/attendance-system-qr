@echo off
echo ========================================
echo   Attendance System - Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Check if MySQL service is running
sc query MySQL80 | find "RUNNING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MySQL service may not be running!
    echo Attempting to start MySQL service...
    net start MySQL80 >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Could not start MySQL service!
        echo Please start MySQL manually or check if it's installed.
        pause
        exit /b 1
    )
    echo [OK] MySQL service started.
)

echo [OK] Prerequisites checked.
echo.

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Frontend dependencies installed.
)

REM Check if backend venv exists
if not exist "backend\venv" (
    echo [INFO] Creating Python virtual environment...
    cd backend
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Virtual environment created.
)

REM Check if backend dependencies are installed
if not exist "backend\venv\Lib\site-packages\flask" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Backend dependencies installed.
)

echo.
echo ========================================
echo   Starting Servers...
echo ========================================
echo.

REM Start backend in a new window
echo [INFO] Starting backend server...
start "Attendance Backend" cmd /k "cd /d %~dp0backend && call start_backend.bat"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo [INFO] Starting frontend server...
start "Attendance Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two new windows have opened:
echo - "Attendance Backend" - Keep this running!
echo - "Attendance Frontend" - Keep this running!
echo.
echo Wait for both servers to start, then:
echo 1. Open http://localhost:3000 in your browser
echo 2. For mobile access, use: http://YOUR_IP:3000
echo.
echo To find your IP address, run: get_ip_address.bat
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

