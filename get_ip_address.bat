@echo off
echo ========================================
echo   Attendance System - IP Address Finder
echo ========================================
echo.
echo Finding your IP address...
echo.

ipconfig | findstr /i "IPv4"

echo.
echo ========================================
echo   Instructions:
echo ========================================
echo.
echo 1. Look for "IPv4 Address" above
echo 2. Share this URL with students:
echo    http://YOUR_IP_ADDRESS:3000
echo.
echo 3. Or open this page to show QR code:
echo    http://YOUR_IP_ADDRESS:3000/access.html
echo.
echo ========================================
echo.
pause
