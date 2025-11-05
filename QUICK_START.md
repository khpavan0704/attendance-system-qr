# Quick Start Guide - Fix Network Error

## The Problem
You're seeing "Network Error" because the **backend server is not running**.

## Solution: Start the Backend Server

### Method 1: Using the Batch File (Easiest)

1. **Open a new PowerShell or Command Prompt window**
2. Navigate to the backend folder:
   ```
   cd "C:\Users\LENOVO\Downloads\attendance_system qr\backend"
   ```
3. Run the start script:
   ```
   .\start_backend.bat
   ```

### Method 2: Manual Start (If batch file doesn't work)

1. **Open PowerShell**
2. Navigate to backend:
   ```
   cd "C:\Users\LENOVO\Downloads\attendance_system qr\backend"
   ```
3. Activate virtual environment:
   ```
   .\venv\Scripts\Activate.ps1
   ```
4. Set environment variables:
   ```
   $env:DB_PASS='Pavan@123'
   $env:DB_HOST='localhost'
   $env:DB_USER='root'
   $env:DB_NAME='attendance_db'
   ```
5. Start the server:
   ```
   python app.py
   ```

### Verify Backend is Running

You should see output like:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Keep the Backend Window Open

**IMPORTANT:** Leave the backend terminal window open. The server needs to keep running for the frontend to connect.

## Starting the Frontend

In a **separate terminal window**:

1. Navigate to frontend:
   ```
   cd "C:\Users\LENOVO\Downloads\attendance_system qr\frontend"
   ```
2. Start React app:
   ```
   npm start
   ```

## Now Try Again

1. Open `http://localhost:3000` in your browser
2. Try registering or logging in
3. The network error should be gone!

## Troubleshooting

- **Still seeing network error?** Make sure the backend terminal shows "Running on http://127.0.0.1:5000"
- **Port 5000 already in use?** Close any other programs using port 5000
- **Database connection error?** Make sure MySQL is running: `Get-Service MySQL80`

