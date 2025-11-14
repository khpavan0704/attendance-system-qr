# 🚀 Quick Access Guide - For Teachers

## Fastest Setup (5 minutes)

### Step 1: Start Servers
```powershell
# Terminal 1 - Backend
cd backend
.\start_backend.bat

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Step 2: Find Your IP Address
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.29.129)
```

### Step 3: Share with Students

**Option A: QR Code (Easiest)**
1. Open: `http://YOUR_IP:3000/access.html`
2. Display QR code on projector
3. Students scan with phone camera

**Option B: Share URL**
- Tell students to type: `http://YOUR_IP:3000`
- Example: `http://192.168.29.129:3000`

---

## For Remote Access (Anywhere)

### Using ngrok:

1. **Download:** https://ngrok.com/download
2. **Sign up:** https://dashboard.ngrok.com/signup (free)
3. **Authenticate:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```
4. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```
5. **Share the ngrok URL** (e.g., `https://abc123.ngrok-free.app`)

Students can access from anywhere! 🌍

---

## Troubleshooting

**Students can't connect?**
- ✅ Check: All devices on same Wi-Fi
- ✅ Check: Backend running (Terminal 1)
- ✅ Check: Frontend running (Terminal 2)
- ✅ Test: Open `http://YOUR_IP:5000/api/health` on phone

**Camera not working?**
- ✅ Use manual token entry option
- ✅ Check browser permissions
- ✅ Try different browser (Chrome recommended)

---

## All Methods Summary

| Method | Time | Best For |
|--------|------|----------|
| Local Network + QR | 5 min | Same classroom |
| ngrok | 10 min | Remote students |
| Cloud Deploy | 30 min | Permanent solution |

**See `STUDENT_ACCESS_OPTIONS.md` for complete details!**

