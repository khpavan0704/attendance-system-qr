# How to Run the Attendance System

This guide will help you run both the backend and frontend of the attendance system.

## Prerequisites

1. **Python 3.x** installed
2. **Node.js and npm** installed
3. **MySQL** installed and running
4. **Database created** (see Database Setup below)

## Step 1: Database Setup

1. Open MySQL command line or MySQL Workbench
2. Create and import the database:
   ```bash
   mysql -u root -p < database/attendance.sql
   ```
   (Enter your MySQL password when prompted)

3. If the database already exists, also run:
   ```bash
   mysql -u root -p < database/migrate_add_student_fields.sql
   mysql -u root -p < database/security_migration.sql
   ```

## Step 2: Start the Backend Server

### Option A: Using Batch File (Windows - Easiest)

1. Open **Command Prompt** or **PowerShell**
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Run the batch file:
   ```bash
   start_backend.bat
   ```

### Option B: Manual Start (Windows PowerShell)

1. Open **PowerShell**
2. Navigate to backend:
   ```bash
   cd backend
   ```
3. Activate virtual environment:
   ```bash
   .\venv\Scripts\Activate.ps1
   ```
4. Set environment variables (adjust password if needed):
   ```powershell
   $env:DB_PASS='Pavan@123'
   $env:DB_HOST='localhost'
   $env:DB_USER='root'
   $env:DB_NAME='attendance_db'
   ```
5. Start the server:
   ```bash
   python app.py
   ```

### Option C: Manual Start (Linux/macOS)

1. Open terminal
2. Navigate to backend:
   ```bash
   cd backend
   ```
3. Activate virtual environment (if exists):
   ```bash
   source venv/bin/activate
   ```
4. Install dependencies (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```
5. Set environment variables:
   ```bash
   export DB_PASS='Pavan@123'
   export DB_HOST='localhost'
   export DB_USER='root'
   export DB_NAME='attendance_db'
   ```
6. Start the server:
   ```bash
   python app.py
   ```

### Verify Backend is Running

You should see output like:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

**IMPORTANT:** Keep this terminal window open! The backend server must keep running.

## Step 3: Start the Frontend

1. Open a **NEW** terminal/command prompt window (keep the backend running)
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install dependencies (first time only):
   ```bash
   npm install
   ```
4. Start the React app:
   ```bash
   npm start
   ```

The frontend will automatically open in your browser at `http://localhost:3000`

## Step 4: Access the Application

1. **Local Access:**
   - Open browser and go to: `http://localhost:3000`

2. **Mobile/Network Access (for QR scanning):**
   - Find your computer's IP address:
     - Windows: Run `ipconfig` in command prompt, look for "IPv4 Address"
     - Linux/macOS: Run `ifconfig` or `ip addr`
   - On your phone, open browser and go to: `http://YOUR_IP_ADDRESS:3000`
     - Example: `http://192.168.29.129:3000`

## Troubleshooting

### Backend Issues

- **"Port 5000 already in use"**
  - Close any other programs using port 5000
  - Or change the port in `backend/app.py`

- **"Can't connect to MySQL"**
  - Make sure MySQL service is running:
    - Windows: `Get-Service MySQL80` (check if running)
    - Linux: `sudo systemctl status mysql`
  - Verify your MySQL password in the environment variables
  - Check if database `attendance_db` exists

- **"Module not found" errors**
  - Make sure virtual environment is activated
  - Install dependencies: `pip install -r requirements.txt`

### Frontend Issues

- **"Network Error" or "Cannot connect to server"**
  - Make sure backend is running on port 5000
  - Check that you see "Running on http://127.0.0.1:5000" in backend terminal

- **"npm: command not found"**
  - Install Node.js from https://nodejs.org/

- **Port 3000 already in use**
  - Close other React apps or change the port

### Mobile Camera Issues

- **"Camera permission denied"**
  - Allow camera access in your mobile browser settings
  - Make sure you're accessing via HTTP (not HTTPS) on local network
  - Or use HTTPS if you have SSL certificate set up

- **"NotReadableError: Could not start video source"**
  - Close other apps using the camera
  - Click "Retry Camera" button in the app
  - Make sure you're using a modern browser (Chrome, Firefox, Safari)

## Quick Start Summary

**Terminal 1 (Backend):**
```bash
cd backend
start_backend.bat
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Then open `http://localhost:3000` in your browser!

## Default Configuration

- **Backend Port:** 5000
- **Frontend Port:** 3000
- **Database:** attendance_db
- **MySQL User:** root
- **MySQL Password:** Pavan@123 (change in `start_backend.bat` or environment variables)

## Notes

- The backend must be running for the frontend to work
- For mobile QR scanning, use your computer's IP address instead of localhost
- Camera access requires HTTPS or local network (192.168.x.x) addresses
- Keep both terminal windows open while using the application

