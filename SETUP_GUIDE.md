# Setup Guide - Attendance Management System

## The Error: "Network Error" / "Access denied for user 'root'@'localhost'"

This error occurs because your MySQL server requires a password, but the backend is configured to use an empty password.

## Quick Fix Solution

Follow these steps:

### Step 1: Find Your MySQL Root Password

**Option A:** Try to connect to MySQL using one of these common passwords:
- Check if you set a password during MySQL installation
- Try common defaults: `root`, `password`, `admin`, or blank (empty string)

**Option B:** If you forgot your MySQL password, reset it:
1. Stop MySQL service: `net stop MySQL80`
2. Start MySQL in safe mode: `mysqld --skip-grant-tables`
3. Connect without password: `mysql -u root`
4. Reset password:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```
5. Restart MySQL normally: `net start MySQL80`

### Step 2: Update Database Configuration

Once you know your MySQL password, update the backend configuration:

**Method 1: Using the batch file (easiest)**
1. Open `backend/start_backend.bat` in a text editor
2. Find the line: `set DB_PASS=`
3. Add your password: `set DB_PASS=your_mysql_password`
4. Save and run: `start_backend.bat`

**Method 2: Using PowerShell**
```powershell
cd backend
$env:DB_PASS = "your_mysql_password"
$env:DB_HOST = "localhost"
$env:DB_USER = "root"
$env:DB_NAME = "attendance_db"

# Activate virtual environment
.\venv\Scripts\activate.ps1

# Start Flask
python app.py
```

### Step 3: Create/Update Database

Run the SQL schema to create the database:

```bash
# If your MySQL has a password:
mysql -u root -p < database/attendance.sql

# If you need to add the new student fields to an existing database:
mysql -u root -p < database/migrate_add_student_fields.sql
```

When prompted, enter your MySQL password.

### Step 4: Start Backend Server

Use Method 1 or 2 from Step 2 to start the backend with your password configured.

### Step 5: Verify Everything Works

1. Backend should be running on http://localhost:5000
2. Test the health endpoint: Open browser and go to http://localhost:5000/api/health
   - Should see: `{"status":"ok","time":"..."}`
3. Frontend should be running on http://localhost:3000 (start with `npm start`)

### Step 6: Try Registration Again

1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in the form
4. Submit

If you still get errors, check:
- MySQL service is running: `Get-Service MySQL80`
- Backend is running: Check http://localhost:5000/api/health
- Database exists: `mysql -u root -p -e "SHOW DATABASES;"`

## Common Issues

**Issue:** "Database doesn't exist"
**Solution:** Run `database/attendance.sql` to create the database

**Issue:** "Table 'users' doesn't have column 'student_id'"
**Solution:** Run `database/migrate_add_student_fields.sql` to add the columns

**Issue:** "Port 5000 already in use"
**Solution:** Kill the process using port 5000 or change the port in `app.py`

## Need Help?

If you're still stuck, check:
1. MySQL is running: `Get-Service MySQL80`
2. Backend logs for error messages
3. Frontend console (F12 in browser) for network errors

