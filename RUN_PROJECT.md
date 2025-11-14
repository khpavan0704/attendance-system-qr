# 🚀 How to Run the Project - Step by Step

## Quick Start (Easiest Method)

### Option 1: Use the Automated Script (Recommended)

1. **Double-click `start_project.bat`**
   - This will automatically:
     - Check all prerequisites
     - Install missing dependencies
     - Start both backend and frontend servers
     - Open two windows (one for each server)

2. **Wait for servers to start** (about 30 seconds)

3. **Open your browser** and go to: `http://localhost:3000`

4. **For mobile access:**
   - Run `get_ip_address.bat` to find your IP
   - On phone, go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.29.129:3000`

---

## Option 2: Manual Start (If script doesn't work)

### Step 1: Start Backend Server

1. Open **PowerShell** or **Command Prompt**
2. Navigate to backend folder:
   ```powershell
   cd "C:\Users\LENOVO\Downloads\attendance-system-qr\backend"
   ```
3. Run the start script:
   ```powershell
   .\start_backend.bat
   ```
4. **Keep this window open!** You should see:
   ```
   * Running on http://127.0.0.1:5000
   * Debug mode: on
   ```

### Step 2: Start Frontend Server

1. Open a **NEW** PowerShell/Command Prompt window
2. Navigate to frontend folder:
   ```powershell
   cd "C:\Users\LENOVO\Downloads\attendance-system-qr\frontend"
   ```
3. Install dependencies (first time only):
   ```powershell
   npm install
   ```
4. Start the React app:
   ```powershell
   npm start
   ```
5. Browser should automatically open to `http://localhost:3000`

---

## Prerequisites Check

Before running, make sure you have:

- ✅ **Node.js** installed (https://nodejs.org/)
- ✅ **Python** installed (https://www.python.org/)
- ✅ **MySQL** installed and running
- ✅ **MySQL password** set to `Pavan@123` (or update in `backend/start_backend.bat`)

### Check Prerequisites:

**Node.js:**
```powershell
node --version
```

**Python:**
```powershell
python --version
```

**MySQL Service:**
```powershell
Get-Service MySQL80
```

---

## Common Issues & Fixes

### Issue 1: "Port 5000 already in use"
**Solution:**
- Close any other programs using port 5000
- Or restart your computer

### Issue 2: "Port 3000 already in use"
**Solution:**
- Close other React apps
- Or change port: `set PORT=3001 && npm start`

### Issue 3: "Cannot connect to MySQL"
**Solution:**
1. Check MySQL is running:
   ```powershell
   Get-Service MySQL80
   ```
2. Start MySQL if not running:
   ```powershell
   net start MySQL80
   ```
3. Verify password in `backend/start_backend.bat` matches your MySQL password

### Issue 4: "Module not found" errors
**Solution:**
- Backend: `cd backend && .\venv\Scripts\activate && pip install -r requirements.txt`
- Frontend: `cd frontend && npm install`

### Issue 5: "Network Error" in browser
**Solution:**
- Make sure backend is running (check Terminal 1)
- Verify backend shows: `Running on http://127.0.0.1:5000`
- Test backend: Open `http://localhost:5000/api/health` in browser
- Should see: `{"status":"ok","time":"..."}`

### Issue 6: Database doesn't exist
**Solution:**
1. Open MySQL command line:
   ```powershell
   mysql -u root -p
   ```
2. Enter password: `Pavan@123`
3. Run the SQL file:
   ```sql
   source C:/Users/LENOVO/Downloads/attendance-system-qr/database/attendance.sql
   ```
   Or manually:
   ```powershell
   mysql -u root -p < database\attendance.sql
   ```

---

## Access URLs

### Local Access (Same Computer):
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

### Network Access (Other Devices):
1. Find your IP address:
   - Run `get_ip_address.bat`
   - Or run `ipconfig` and look for "IPv4 Address"
2. On other devices (phones, tablets):
   - Frontend: `http://YOUR_IP:3000`
   - Example: `http://192.168.29.129:3000`
3. **Important:** All devices must be on the same Wi-Fi network

### QR Code Access (Easiest for Students):
1. Open: `http://YOUR_IP:3000/access.html`
2. Display the QR code on projector/board
3. Students scan with phone camera
4. Website opens automatically!

---

## Default Credentials

After first setup, you'll need to:
1. **Register** a new account (teacher or student)
2. **Login** with your credentials

---

## Stopping the Servers

1. **Backend:** Press `Ctrl+C` in the backend terminal window
2. **Frontend:** Press `Ctrl+C` in the frontend terminal window
3. Or simply close both terminal windows

---

## Project Structure

```
attendance-system-qr/
├── backend/              # Flask backend server
│   ├── app.py           # Main backend file
│   ├── start_backend.bat # Backend startup script
│   └── requirements.txt  # Python dependencies
├── frontend/            # React frontend
│   ├── src/            # Source code
│   ├── public/         # Public files
│   └── package.json    # Node dependencies
├── database/           # SQL schema files
├── start_project.bat   # ⭐ Main startup script (use this!)
└── get_ip_address.bat  # Helper to find IP address
```

---

## Need Help?

1. Check `HOW_TO_RUN.md` for detailed instructions
2. Check `STUDENT_ACCESS_OPTIONS.md` for mobile access methods
3. Check backend terminal for error messages
4. Check browser console (F12) for frontend errors

---

## Quick Troubleshooting Checklist

- [ ] MySQL service is running
- [ ] Backend terminal shows "Running on http://127.0.0.1:5000"
- [ ] Frontend terminal shows "Compiled successfully!"
- [ ] Can access `http://localhost:5000/api/health`
- [ ] Can access `http://localhost:3000`
- [ ] No firewall blocking ports 3000 and 5000
- [ ] All devices on same Wi-Fi network (for mobile access)

---

**That's it! Your attendance system should now be running! 🎉**

