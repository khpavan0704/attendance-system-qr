# 🎯 START HERE - Run Your Attendance System

## ⚡ Quickest Way to Start (1 Click!)

**Just double-click: `start_project.bat`**

This will:
- ✅ Check all prerequisites
- ✅ Install missing dependencies  
- ✅ Start backend server
- ✅ Start frontend server
- ✅ Open everything automatically

**Then open:** `http://localhost:3000` in your browser!

---

## 📱 For Students to Access on Phones

### Method 1: QR Code (Easiest!)
1. Run `get_ip_address.bat` to find your IP
2. Open: `http://YOUR_IP:3000/access.html`
3. Display QR code on projector
4. Students scan with phone camera
5. Done! ✅

### Method 2: Share URL
- Tell students to type: `http://YOUR_IP:3000`
- Example: `http://192.168.29.129:3000`

**Important:** All devices must be on the same Wi-Fi network!

---

## 🔧 Manual Start (If Script Doesn't Work)

### Terminal 1 - Backend:
```powershell
cd backend
.\start_backend.bat
```

### Terminal 2 - Frontend:
```powershell
cd frontend
npm start
```

---

## ✅ What You Should See

### Backend Terminal:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

### Frontend Terminal:
```
Compiled successfully!
webpack compiled successfully
```

### Browser:
- Opens automatically to `http://localhost:3000`
- Login/Register page appears

---

## 🐛 Common Problems & Quick Fixes

| Problem | Solution |
|---------|----------|
| "Port 5000 in use" | Close other programs, restart computer |
| "Port 3000 in use" | Close other React apps |
| "Network Error" | Make sure backend is running (Terminal 1) |
| "MySQL error" | Check MySQL is running: `Get-Service MySQL80` |
| "Module not found" | Run `npm install` in frontend folder |

---

## 📚 Need More Help?

- **Detailed Setup:** See `RUN_PROJECT.md`
- **Mobile Access:** See `STUDENT_ACCESS_OPTIONS.md`
- **Troubleshooting:** See `HOW_TO_RUN.md`

---

## 🎉 You're Ready!

Once both servers are running:
1. ✅ Open `http://localhost:3000`
2. ✅ Register/Login
3. ✅ Start marking attendance!

**Keep both terminal windows open while using the app!**

