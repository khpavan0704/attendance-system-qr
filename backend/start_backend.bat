@echo off
REM Start Flask backend with MySQL configuration

REM SET YOUR MYSQL PASSWORD HERE
set DB_PASS=Pavan@123

REM Set other environment variables
set DB_HOST=localhost
set DB_USER=root
set DB_NAME=attendance_db

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Start Flask application
python app.py

