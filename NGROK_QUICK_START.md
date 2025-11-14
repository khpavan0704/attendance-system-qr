# ngrok Quick Start Guide

## After Installing ngrok - What to Do Next

### Step 1: Authenticate ngrok (First Time Only)

If you haven't signed up yet:
1. Visit: https://dashboard.ngrok.com/signup
2. Create a free account
3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

Then in the terminal, run:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Example:**
```bash
ngrok config add-authtoken 2abc123xyz456_YourTokenHere_789def
```

✅ You only need to do this once!

---

### Step 2: Start Your Servers First

**IMPORTANT:** Start your backend and frontend BEFORE starting ngrok!

#### Terminal 1 - Backend:
```bash
cd backend
.\start_backend.bat
```
Wait until you see: `Running on http://127.0.0.1:5000`

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```
Wait until you see: `Compiled successfully!`

---

### Step 3: Start ngrok Tunnel

#### Option A: Simple Method (Frontend Only)

In a **NEW terminal window**, run:
```bash
ngrok http 3000
```

You'll see output like:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Your public URL is:** `https://abc123.ngrok-free.app`

**Share this URL with students!** They can access from anywhere.

---

#### Option B: Tunnel Both Frontend and Backend (Recommended)

You need TWO ngrok tunnels:

**Terminal 3 - ngrok for Frontend:**
```bash
ngrok http 3000
```
Note the URL: `https://frontend-abc123.ngrok-free.app`

**Terminal 4 - ngrok for Backend:**
```bash
ngrok http 5000
```
Note the URL: `https://backend-xyz789.ngrok-free.app`

**Then update frontend config:**
Edit `frontend/src/config.js` and change it to:
```javascript
const getApiBase = () => {
  // Use your backend ngrok URL
  return 'https://backend-xyz789.ngrok-free.app'; // Replace with your actual backend ngrok URL
};

export const API_BASE = getApiBase();
```

**Restart frontend** after changing config!

---

### Step 4: Access from Mobile

Students can now:
1. Open browser on their phone
2. Go to: `https://abc123.ngrok-free.app` (your ngrok URL)
3. Access the website from anywhere!

---

## Quick Commands Reference

```bash
# Start tunnel for frontend (port 3000)
ngrok http 3000

# Start tunnel for backend (port 5000)
ngrok http 5000

# View ngrok web interface (monitor traffic)
# Open in browser: http://127.0.0.1:4040

# Stop ngrok
# Press Ctrl+C in the terminal
```

---

## Troubleshooting

### "ngrok: command not found"
- Make sure ngrok.exe is in your PATH
- Or navigate to ngrok folder first: `cd C:\ngrok` then run `.\ngrok.exe http 3000`

### "authtoken required"
- Run: `ngrok config add-authtoken YOUR_TOKEN`
- Get token from: https://dashboard.ngrok.com/get-started/your-authtoken

### "address already in use"
- Port 3000 or 5000 is already in use
- Stop other programs using those ports
- Or use different ports

### URL changes every time
- Free ngrok URLs change when you restart
- Keep ngrok running (don't close terminal)
- Or upgrade to paid plan for static URLs

---

## Complete Setup Example

**Terminal 1 (Backend):**
```bash
cd backend
.\start_backend.bat
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

**Terminal 3 (ngrok):**
```bash
ngrok http 3000
```

**Copy the ngrok URL** (e.g., `https://abc123.ngrok-free.app`) and share with students!

---

## Monitor Traffic

While ngrok is running, open in browser:
```
http://127.0.0.1:4040
```

This shows:
- All HTTP requests
- Request/response details
- Replay requests
- Inspect traffic

---

## Important Notes

⚠️ **Keep ngrok running:**
- Don't close the ngrok terminal window
- If you close it, the URL stops working
- Students will lose access

⚠️ **URL changes:**
- Free ngrok URLs change when you restart
- Share new URL with students if you restart ngrok

⚠️ **Security:**
- ngrok URLs are public
- Anyone with the URL can access
- But GPS verification still works - students must be physically present!

---

## That's It! 🎉

Your attendance system is now accessible from anywhere via ngrok!

Students can:
- ✅ Access from any location
- ✅ Use any network (home, mobile data, etc.)
- ✅ But MUST be physically present in classroom to mark attendance (GPS check)

