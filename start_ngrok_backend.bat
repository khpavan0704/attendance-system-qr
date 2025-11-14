@echo off
echo ========================================
echo Starting ngrok Tunnel for Backend (Port 5000)
echo ========================================
echo.
echo This will create a public URL for your backend API
echo.
echo IMPORTANT: Update frontend/src/config.js with the ngrok URL
echo.
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

ngrok http 5000

pause

