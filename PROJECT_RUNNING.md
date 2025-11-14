# 🚀 Project is Starting!

## ✅ Servers Launched

I've started both servers in separate windows:

1. **Backend Server** - Running in "Attendance Backend" window
   - URL: `http://localhost:5000`
   - API Health: `http://localhost:5000/api/health`

2. **Frontend Server** - Running in "Attendance Frontend" window
   - URL: `http://localhost:3000`
   - Will open automatically in your browser

---

## 📋 What to Expect

### Backend Window:
You should see:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

### Frontend Window:
You should see:
```
Compiled successfully!
webpack compiled successfully
```

The browser should automatically open to `http://localhost:3000`

---

## 🌐 Access the Application

### On This Computer:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### On Mobile/Other Devices (Same Wi-Fi):
1. **Find your IP address:**
   - Run: `get_ip_address.bat`
   - Or run: `ipconfig` and look for "IPv4 Address"

2. **Access from phone:**
   - URL: `http://YOUR_IP:3000`
   - Example: `http://192.168.29.129:3000`

3. **Or use QR Code:**
   - Open: `http://YOUR_IP:3000/access.html`
   - Display QR code on projector
   - Students scan with phone camera

---

## ⚠️ Important Notes

1. **Keep both windows open** - Don't close the terminal windows while using the app
2. **Wait for compilation** - Frontend takes 30-60 seconds to compile the first time
3. **Check for errors** - If you see errors in the terminal windows, let me know

---

## 🐛 Troubleshooting

### Backend not starting?
- Check MySQL is running: `Get-Service MySQL80`
- Check port 5000 is not in use
- Look at the backend window for error messages

### Frontend not starting?
- Check Node.js is installed: `node --version`
- Check port 3000 is not in use
- Look at the frontend window for error messages

### Can't access from phone?
- Make sure phone is on same Wi-Fi network
- Check firewall isn't blocking ports 3000 and 5000
- Verify IP address is correct

---

## 🎉 Next Steps

1. Wait for both servers to fully start (about 30 seconds)
2. Browser should open automatically to `http://localhost:3000`
3. Register/Login to start using the app
4. For students, share the IP address or QR code

---

## 📱 Quick Access for Students

**Easiest Method:**
1. Run `get_ip_address.bat`
2. Open `http://YOUR_IP:3000/access.html`
3. Display QR code
4. Students scan with phone camera

**Done!** ✅

