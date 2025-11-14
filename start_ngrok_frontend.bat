@echo off
echo ========================================
echo Starting ngrok Tunnel for Frontend (Port 3000)
echo ========================================
echo.
echo This will create a public URL for your frontend
echo Share this URL with students!
echo.
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

ngrok http 3000

pause

