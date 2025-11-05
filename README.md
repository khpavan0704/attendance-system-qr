Attendance Management System (QR + GPS) - Mini Project
=====================================================

A complete attendance management system with QR code scanning and GPS location validation. Features user registration, login, and role-based dashboards.

What is included
-----------------
- backend/  -> Flask app (app.py) with API endpoints
- frontend/ -> React app with Registration, Login, and Dashboard pages
- database/ -> MySQL schema (attendance.sql)
- README with quick setup

Features
--------
- User Registration (Students & Teachers)
- User Login
- Student Dashboard with QR Scanner
- Teacher Dashboard with QR Generator
- GPS-based location validation
- Attendance Reports

Defaults (change if needed)
---------------------------
- MySQL host: localhost
- MySQL user: root
- MySQL password: (blank)
- Database name: attendance_db
- Flask port: 5000
- React port: 3000

Setup steps (Linux/Windows with WSL or macOS)
--------------------------------------------
1) Create the database:
   - Open MySQL CLI or use a GUI and run the SQL in `database/attendance.sql`
   - Example Windows (with password):
     mysql -u root -p < database/attendance.sql
   - Example Windows (no password):
     mysql -u root < database/attendance.sql
   - After running attendance.sql, if the database was already created before:
     mysql -u root -p < database/migrate_add_student_fields.sql

2) Backend (Flask)
   - cd backend
   - (optional) create and activate virtualenv
   - pip install -r requirements.txt
   
   **Windows PowerShell:**
   - If MySQL has a password, set environment variables:
     $env:DB_HOST="localhost"
     $env:DB_USER="root"
     $env:DB_PASS="your_mysql_password_here"
     $env:DB_NAME="attendance_db"
   - If no password needed:
     $env:DB_HOST="localhost"
     $env:DB_USER="root"
     $env:DB_PASS=""
     $env:DB_NAME="attendance_db"
   
   **Linux/macOS:**
   - export DB_HOST=localhost (optional)
   - export DB_USER=root
   - export DB_PASS='your_password_or_empty'
   - export DB_NAME=attendance_db
   
   - python app.py
   - Backend will run on http://localhost:5000

3) Frontend (React)
   - cd frontend
   - npm install
   - npm start
   - App runs on http://localhost:3000

Notes
-----
- This is a demo app: passwords are stored in plain text for simplicity.
  For any real use, hash passwords (bcrypt) and add authentication tokens (JWT).
- GPS location accuracy depends on device hardware.
- Threshold for location validation is 50 meters in backend.app

