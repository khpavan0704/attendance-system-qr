# Complete ngrok Setup Guide

ngrok creates a secure tunnel to your local server, making it accessible from anywhere on the internet.

## Step 1: Download and Install ngrok

### Windows:
1. Visit: https://ngrok.com/download
2. Download the Windows version (ZIP file)
3. Extract the ZIP file to a folder (e.g., `C:\ngrok`)
4. You'll get `ngrok.exe` file

### Alternative: Using Chocolatey (Windows)
```powershell
choco install ngrok
```

### Alternative: Using Scoop (Windows)
```powershell
scoop install ngrok
```

---

## Step 2: Sign Up for Free Account (Optional but Recommended)

1. Visit: https://dashboard.ngrok.com/signup
2. Create a free account
3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

### Authenticate ngrok:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Benefits of free account:**
- ✅ Longer session times
- ✅ Custom subdomain (with paid plan)
- ✅ More features
- ✅ Better performance

**Without account:** Still works, but with limitations (shorter sessions, random URLs)

---

## Step 3: Start Your Servers

### Terminal 1 - Backend:
```bash
cd backend
.\start_backend.bat
# Or manually:
python app.py
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

**Verify both are running:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

---

## Step 4: Create ngrok Tunnel

### Option A: Tunnel Frontend Only (Simplest)

Open a **new terminal** and run:

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

**Your public URL:** `https://abc123.ngrok-free.app`

**Share this URL with students!** They can access from anywhere.

### Option B: Tunnel Both Frontend and Backend (Recommended)

Since your frontend needs to connect to the backend, you need to tunnel both:

#### Terminal 3 - ngrok for Frontend:
```bash
ngrok http 3000
```
Note the URL: `https://frontend-abc123.ngrok-free.app`

#### Terminal 4 - ngrok for Backend:
```bash
ngrok http 5000
```
Note the URL: `https://backend-xyz789.ngrok-free.app`

#### Update Frontend Config:

Edit `frontend/src/config.js`:

```javascript
// For ngrok - use the backend ngrok URL
const getApiBase = () => {
  // If accessing via ngrok, use the backend ngrok URL
  if (window.location.hostname.includes('ngrok')) {
    return 'https://backend-xyz789.ngrok-free.app'; // Replace with your backend ngrok URL
  }
  // Otherwise use default behavior
  const { protocol, hostname } = window.location;
  const port = 5000;
  return `${protocol}//${hostname}:${port}`;
};

export const API_BASE = getApiBase();
```

**Important:** Restart the frontend after changing config!

---

## Step 5: Access from Mobile

### Students can now:
1. Open browser on their phone
2. Go to: `https://abc123.ngrok-free.app`
3. Access the website from anywhere (no need for same Wi-Fi!)

---

## Step 6: ngrok Web Interface

While ngrok is running, you can monitor traffic:

**Open in browser:** `http://127.0.0.1:4040`

This shows:
- All HTTP requests
- Request/response details
- Replay requests
- Inspect traffic

---

## Advanced: Using ngrok Configuration File

Create `ngrok.yml` in your home directory or project folder:

### Windows Location:
`C:\Users\YOUR_USERNAME\AppData\Local\ngrok\ngrok.yml`

### Configuration Example:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE

tunnels:
  frontend:
    addr: 3000
    proto: http
    bind_tls: true
    
  backend:
    addr: 5000
    proto: http
    bind_tls: true
```

### Start with config:
```bash
ngrok start frontend backend
```

This starts both tunnels at once!

---

## Common ngrok Commands

```bash
# Basic tunnel
ngrok http 3000

# Custom subdomain (requires paid plan)
ngrok http 3000 --subdomain=myapp

# Custom region
ngrok http 3000 --region=us

# Inspect traffic (web UI)
ngrok http 3000 --inspect=false  # Disable web UI

# Start multiple tunnels from config
ngrok start --all

# View ngrok status
ngrok status

# Update authtoken
ngrok config add-authtoken YOUR_TOKEN
```

---

## Troubleshooting

### Issue: "ngrok: command not found"
**Solution:**
- Add ngrok to your PATH
- Or use full path: `C:\ngrok\ngrok.exe http 3000`
- Or navigate to ngrok folder first

### Issue: "Session expired" or URL changes
**Solution:**
- Free ngrok URLs change when you restart
- Keep ngrok running (don't close the terminal)
- Or upgrade to paid plan for static URLs

### Issue: "Too many connections"
**Solution:**
- Free plan has connection limits
- Wait a few minutes
- Or upgrade to paid plan

### Issue: Frontend can't connect to backend
**Solution:**
- Make sure both are tunneled
- Update `config.js` with backend ngrok URL
- Restart frontend after config change

### Issue: "ngrok free account required"
**Solution:**
- Sign up at https://dashboard.ngrok.com/signup
- Get authtoken and run: `ngrok config add-authtoken YOUR_TOKEN`

---

## Quick Setup Script for Windows

Create `start_with_ngrok.bat`:

```batch
@echo off
echo Starting Attendance System with ngrok...
echo.

echo [1/3] Starting Backend...
start "Backend" cmd /k "cd backend && start_backend.bat"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

timeout /t 5 /nobreak >nul

echo [3/3] Starting ngrok tunnel...
echo.
echo Your ngrok URL will appear below:
echo Share this URL with students!
echo.
ngrok http 3000

pause
```

**Usage:** Double-click `start_with_ngrok.bat`

---

## Security Notes

⚠️ **Important:**
- ngrok URLs are public - anyone with the URL can access
- Use HTTPS (ngrok provides it automatically)
- Consider adding authentication
- Don't share URLs publicly
- Free URLs expire when ngrok stops

---

## Comparison: ngrok vs Local Network

| Feature | ngrok | Local Network |
|---------|-------|---------------|
| **Access** | From anywhere | Same Wi-Fi only |
| **Setup** | Easy | Very easy |
| **Cost** | Free (with limits) | Free |
| **Speed** | Depends on internet | Very fast |
| **Security** | Public URL | Private network |
| **URL** | Changes (free) | Static IP |
| **Best for** | Remote access | Classroom/local |

---

## Recommended Setup

**For Classroom (Same Location):**
- Use local network method (faster, more secure)

**For Remote/Online Classes:**
- Use ngrok (accessible from anywhere)

**For Development/Testing:**
- Use ngrok (easy sharing with team)

---

## Next Steps

1. ✅ Download and install ngrok
2. ✅ Sign up for free account (optional)
3. ✅ Start your servers
4. ✅ Run `ngrok http 3000`
5. ✅ Share the ngrok URL with students
6. ✅ Monitor traffic at http://127.0.0.1:4040

**That's it! Your local server is now accessible from anywhere!** 🚀

