# Methods to Access Website on Students' Phones

This guide provides multiple ways for students to access the attendance system on their mobile phones.

## Method 1: Local Network Access (Current - Easiest)

### Setup:
1. Make sure your computer and students' phones are on the **same Wi-Fi network**
2. Start backend and frontend servers
3. Find your computer's IP address:
   - **Windows:** Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
   - **Example:** `192.168.29.129`

### Share with Students:
**URL:** `http://YOUR_IP_ADDRESS:3000`
- Example: `http://192.168.29.129:3000`

### Steps for Students:
1. Connect phone to same Wi-Fi network
2. Open browser (Chrome, Firefox, Safari)
3. Type the URL: `http://192.168.29.129:3000`
4. Allow camera permission when prompted

---

## Method 2: Using QR Code (Recommended for Easy Sharing)

### Create a QR Code:
1. Generate a QR code with your IP address URL
2. Display it on projector/board
3. Students scan with their phone camera

### Online QR Code Generator:
- Visit: https://www.qr-code-generator.com/
- Enter: `http://YOUR_IP_ADDRESS:3000`
- Download and display the QR code

### Quick QR Code Script:
Create a simple HTML file to display QR code:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Attendance System - Scan to Access</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
</head>
<body>
    <h1>Scan QR Code to Access Attendance System</h1>
    <div id="qrcode"></div>
    <script>
        const ip = "192.168.29.129"; // Change to your IP
        const url = `http://${ip}:3000`;
        new QRCode(document.getElementById("qrcode"), url);
    </script>
</body>
</html>
```

---

## Method 3: Using ngrok (Access from Anywhere)

ngrok creates a public URL that tunnels to your local server.

### Setup ngrok:
1. **Download ngrok:**
   - Visit: https://ngrok.com/download
   - Extract the file

2. **Start your backend and frontend** (ports 5000 and 3000)

3. **Create tunnel for frontend:**
   ```bash
   ngrok http 3000
   ```

4. **You'll get a URL like:**
   ```
   https://abc123.ngrok.io
   ```

5. **Share this URL with students** - they can access from anywhere!

### Update Backend for ngrok:
If using ngrok, you need to update the frontend config to use the ngrok backend URL.

**Note:** Free ngrok URLs change each time you restart. Paid plans give permanent URLs.

---

## Method 4: Mobile Hotspot (If No Wi-Fi Available)

### Setup:
1. **On your computer:**
   - Create a mobile hotspot (Windows: Settings > Network > Mobile hotspot)
   - Note the network name and password

2. **On students' phones:**
   - Connect to your hotspot
   - Access: `http://YOUR_COMPUTER_IP:3000`

### Find Hotspot IP:
- Usually: `192.168.137.1` (Windows hotspot default)
- Check in Command Prompt: `ipconfig`

---

## Method 5: Create a Simple Landing Page

Create a simple page that shows the access URL and QR code.

### Create `access.html` in frontend/public/:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Attendance System Access</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .url-box {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 14px;
        }
        #qrcode {
            margin: 20px auto;
        }
        .instructions {
            text-align: left;
            margin-top: 20px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 5px;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Access Attendance System</h1>
        <p>Scan the QR code or click the link below:</p>
        
        <div id="qrcode"></div>
        
        <div class="url-box">
            <strong>URL:</strong><br>
            <a href="http://192.168.29.129:3000" id="accessUrl">
                http://192.168.29.129:3000
            </a>
        </div>
        
        <div class="instructions">
            <strong>Instructions:</strong>
            <ol>
                <li>Make sure you're on the same Wi-Fi network</li>
                <li>Scan the QR code or click the link above</li>
                <li>Allow camera permission when prompted</li>
                <li>Login with your credentials</li>
            </ol>
        </div>
    </div>
    
    <script>
        // Update this with your actual IP address
        const IP_ADDRESS = "192.168.29.129";
        const PORT = "3000";
        const url = `http://${IP_ADDRESS}:${PORT}`;
        
        // Generate QR Code
        new QRCode(document.getElementById("qrcode"), {
            text: url,
            width: 200,
            height: 200
        });
        
        // Update link
        document.getElementById("accessUrl").href = url;
        document.getElementById("accessUrl").textContent = url;
    </script>
</body>
</html>
```

**Access it at:** `http://YOUR_IP:3000/access.html`

---

## Method 6: Deploy to Cloud (Permanent Solution)

### Option A: Deploy to Vercel/Netlify (Frontend)
1. Build the React app: `npm run build`
2. Deploy `build` folder to Vercel or Netlify
3. Update API_BASE in config to point to your backend

### Option B: Deploy Backend to Heroku/Railway
1. Deploy Flask backend to cloud service
2. Update frontend config to use cloud backend URL
3. Deploy frontend separately

### Option C: Use a VPS (Virtual Private Server)
- Rent a VPS (DigitalOcean, AWS, etc.)
- Install everything on the server
- Get a permanent IP address or domain name

---

## Quick Reference: Finding Your IP Address

### Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter

### Linux/macOS:
```bash
ifconfig
# or
ip addr
```

### Quick PowerShell Command (Windows):
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}).IPAddress
```

---

## Troubleshooting Network Access

### Students Can't Connect:

1. **Check Firewall:**
   - Windows: Allow ports 3000 and 5000 in Windows Firewall
   - Command: `netsh advfirewall firewall add rule name="Node" dir=in action=allow protocol=TCP localport=3000`
   - Command: `netsh advfirewall firewall add rule name="Flask" dir=in action=allow protocol=TCP localport=5000`

2. **Verify Same Network:**
   - Make sure all devices are on the same Wi-Fi network
   - Check IP address range (should be similar, e.g., 192.168.1.x)

3. **Test Connection:**
   - From phone, try: `http://YOUR_IP:5000/api/health`
   - Should return: `{"status":"ok",...}`

4. **Check Backend Binding:**
   - Make sure Flask is binding to `0.0.0.0`, not just `127.0.0.1`
   - Check `backend/app.py` - should have: `app.run(host='0.0.0.0', port=5000)`

---

## Recommended Setup for Classroom

**Best Method:** Method 1 (Local Network) + Method 2 (QR Code)

1. Display QR code on projector/board
2. Students scan QR code
3. Website opens automatically
4. Students login and scan attendance QR codes

**Benefits:**
- ✅ Fast and easy
- ✅ No internet required (local network only)
- ✅ Secure (only accessible on same network)
- ✅ Works offline

---

## Security Notes

⚠️ **Important:**
- Local network access is only secure within your private network
- Don't expose to public internet without proper security
- Use HTTPS in production
- Consider authentication and rate limiting

