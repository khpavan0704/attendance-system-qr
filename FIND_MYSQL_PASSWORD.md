# How to Find or Reset Your MySQL Password

## Problem
The password `Pavan@!23` is not working. We need to either:
1. Find your correct MySQL password, OR
2. Reset it to a new password

## Option 1: Find Your MySQL Password

Try these common places where your password might be stored:

### Check MySQL Configuration
```powershell
# Check MySQL config file
Get-Content C:\ProgramData\MySQL\MySQL Server 8.0\my.ini | Select-String -Pattern "password"
```

### Common Default Passwords to Try
- `root`
- `password`
- `admin`
- `123456`
- `mysql`
- Blank/empty string

### Check Environment Variables
```powershell
Get-ChildItem Env: | Where-Object { $_.Name -like "*MYSQL*" -or $_.Name -like "*DB*" }
```

### Check Your Notes/Documents
- Look for any installation notes
- Check password managers
- Look in any setup documents

## Option 2: Reset MySQL Password

**IMPORTANT:** This will change your MySQL password. Make sure to update it everywhere after resetting.

### Step 1: Stop MySQL Service
```powershell
net stop MySQL80
```

### Step 2: Start MySQL in Safe Mode
```powershell
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
.\mysqld.exe --skip-grant-tables --console
```
Leave this window open and running.

### Step 3: Connect Without Password
Open a NEW PowerShell window and run:
```powershell
mysql -u root
```

### Step 4: Reset Password
```sql
USE mysql;
UPDATE user SET authentication_string=PASSWORD('NewPassword123') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Restart MySQL Normally
1. Close the safe mode window (Ctrl+C)
2. Start MySQL service:
```powershell
net start MySQL80
```

### Step 6: Test New Password
```powershell
mysql -u root -pNewPassword123
```

### Step 7: Update Your Configuration
Update `backend/start_backend.bat`:
```batch
set DB_PASS=NewPassword123
```

## Option 3: Ask For Help
If you still can't figure it out, let me know what error messages you see and I'll help you troubleshoot further.

