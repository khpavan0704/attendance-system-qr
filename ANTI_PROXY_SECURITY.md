# Anti-Proxy & Anti-Fraud Security Features

This document explains the security measures implemented to prevent students from marking attendance remotely via video calls, screenshots, or proxy methods.

## 🎯 Problem Statement

**Attack Scenario:**
- Student A is physically present in class
- Student A shows QR code on video call to Student B (at home)
- Student B scans QR code from video call
- Student B marks attendance even though not physically present

**Our Solution:** Multiple layers of security checks that make this attack impossible.

---

## 🔒 Security Features Implemented

### 1. **GPS Location Verification (STRICT)**
- **Requirement:** Student must be within **20 meters** of classroom location
- **How it works:**
  - Teacher sets classroom GPS coordinates when creating class
  - When student scans, their GPS location is captured
  - System calculates distance from classroom
  - If distance > 20 meters → **ATTENDANCE BLOCKED**
- **Prevents:** Remote scanning from home/other locations

### 2. **Device Fingerprinting**
- **Requirement:** Each device can only mark attendance for ONE student per session
- **How it works:**
  - Unique device fingerprint generated from browser/device characteristics
  - System tracks which device was used by which student
  - If same device tries to mark for multiple students → **BLOCKED**
- **Prevents:** One person using their phone to mark attendance for multiple friends

### 3. **IP Address Pattern Detection**
- **Requirement:** Maximum 2 students per IP address within 2 minutes
- **How it works:**
  - System tracks IP addresses of all scans
  - If >2 students scan from same IP within 2 minutes → **BLOCKED**
- **Prevents:** 
  - Multiple students sharing one device/network
  - Proxy/VPN usage for remote access
  - Video call sharing scenarios

### 4. **Rate Limiting**
- **Requirement:** One scan per student every 30 seconds
- **How it works:**
  - System tracks last scan time for each student
  - If student tries to scan again within 30 seconds → **BLOCKED**
- **Prevents:** Rapid scanning attempts and abuse

### 5. **Fast-Expiring QR Codes**
- **Requirement:** QR codes expire every **7 seconds**
- **How it works:**
  - QR code token rotates every 7 seconds
  - Old tokens become invalid immediately
  - System only accepts current or previous window token
- **Prevents:** 
  - Screenshot sharing (code expires before sharing)
  - Pre-capturing QR codes for later use

### 6. **Duplicate Prevention**
- **Requirement:** Each student can mark attendance only once per session
- **How it works:**
  - System checks if student already marked attendance
  - If duplicate attempt → **BLOCKED**
- **Prevents:** Multiple attendance entries

### 7. **Security Logging**
- **All suspicious activities are logged:**
  - Device fingerprint violations
  - IP address pattern violations
  - GPS location mismatches
  - Rate limit violations
- **Purpose:** Administrators can review and identify fraud attempts

---

## 🛡️ How It Prevents Video Call Attacks

### Scenario: Student A shows QR code on video call to Student B

**What happens when Student B tries to scan:**

1. ✅ **QR Code Check:** Code might be valid (if scanned quickly)
2. ❌ **GPS Check:** Student B's location is far from classroom → **BLOCKED**
   - Error: "Location verification failed. You are X meters away from the classroom."
3. ❌ **IP Check:** If Student B uses same network as Student A → **BLOCKED**
   - Error: "Security violation: Multiple students detected from same network."
4. ❌ **Device Check:** If Student B uses Student A's device → **BLOCKED**
   - Error: "Security violation: This device was already used by another student."

**Result:** Student B **CANNOT** mark attendance remotely.

---

## 📊 Security Check Flow

```
Student Scans QR Code
        ↓
1. Token Validation (7-second window)
        ↓
2. Rate Limiting Check (30 seconds)
        ↓
3. Device Fingerprint Check
        ↓
4. IP Address Pattern Check
        ↓
5. GPS Location Verification (20 meters)
        ↓
6. Duplicate Check
        ↓
✅ All Checks Pass → Attendance Marked
❌ Any Check Fails → Attendance BLOCKED
```

---

## 🔧 Configuration

### GPS Radius
- **Current:** 20 meters
- **Location:** `backend/app.py` line 220
- **To change:** Modify `distance <= 20` to your preferred radius

### Rate Limit
- **Current:** 30 seconds
- **Location:** `backend/app.py` line 187
- **To change:** Modify `time_diff < 30` to your preferred limit

### QR Code Expiry
- **Current:** 7 seconds
- **Location:** `backend/app.py` line 95
- **To change:** Modify `window_seconds = int(data.get('window_seconds', 7))`

### IP Address Limit
- **Current:** 2 students per IP in 2 minutes
- **Location:** `backend/app.py` line 208
- **To change:** Modify `ip_check['student_count'] >= 3` (change 3 to your limit)

---

## 📝 Database Requirements

Run the security migration to enable all features:

```bash
mysql -u root -p attendance_db < database/security_migration.sql
```

This adds:
- `device_fingerprint` column
- `ip_address` column
- `user_agent` column
- `scan_timestamp` column
- `security_logs` table

---

## 🧪 Testing Security

### Test 1: GPS Verification
1. Set classroom location
2. Try scanning from >20 meters away
3. **Expected:** "Location verification failed" error

### Test 2: Device Fingerprinting
1. Student A scans with Device 1
2. Student B tries to scan with same Device 1
3. **Expected:** "Security violation: This device was already used" error

### Test 3: IP Address Pattern
1. 3 students try to scan from same IP within 2 minutes
2. **Expected:** 3rd student gets "Multiple students detected from same network" error

### Test 4: Rate Limiting
1. Student scans successfully
2. Same student tries to scan again within 30 seconds
3. **Expected:** "Please wait before scanning again" error

### Test 5: QR Code Expiry
1. Wait 8 seconds after QR code is generated
2. Try to scan old QR code
3. **Expected:** "invalid or expired token" error

---

## 🚨 Security Warnings Displayed

### Teacher Dashboard:
- ⚠️ Warning: "Do NOT share this QR code via video call, screenshot, or photo"
- 🔒 Message: "GPS verification required. Remote scanning is blocked."

### Student Scanner:
- ⚠️ Warning: "You must be physically present in the classroom"
- 📍 Message: "GPS location, device fingerprint, and network verification are required"

---

## 📈 Monitoring & Logs

### View Security Logs:
```sql
SELECT * FROM security_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

### Check Suspicious Patterns:
```sql
-- Multiple students from same IP
SELECT ip_address, COUNT(DISTINCT student_id) as student_count
FROM attendance
WHERE session_id = YOUR_SESSION_ID
GROUP BY ip_address
HAVING student_count > 2;

-- GPS violations
SELECT student_id, gps_lat, gps_lng, location_ok
FROM attendance
WHERE session_id = YOUR_SESSION_ID AND location_ok = 0;
```

---

## ✅ Security Guarantees

With these measures in place:

1. ✅ **Cannot scan from remote location** (GPS check)
2. ✅ **Cannot share device** (Device fingerprinting)
3. ✅ **Cannot use proxy/VPN** (IP pattern detection)
4. ✅ **Cannot share via video call** (GPS + IP + Device checks)
5. ✅ **Cannot screenshot and share** (7-second expiry)
6. ✅ **Cannot mark multiple times** (Duplicate prevention)
7. ✅ **Cannot rapid-fire scan** (Rate limiting)

---

## 🔐 Additional Recommendations

### For Even Stronger Security:

1. **Require Campus WiFi:**
   - Only allow scans from specific WiFi network
   - Block external networks

2. **Face Verification (Future):**
   - Capture photo during scan
   - Compare with student profile

3. **Biometric Confirmation:**
   - Require fingerprint/face ID after scan

4. **Time Window Restrictions:**
   - Only allow scans during class hours
   - Block scans outside scheduled time

5. **Network Fingerprinting:**
   - Track WiFi network SSID
   - Require specific network name

---

## 📞 Support

If you encounter security issues or need to adjust settings:
1. Check security logs in database
2. Review error messages in frontend
3. Adjust configuration values as needed
4. Test thoroughly before deploying

---

## 🎓 Summary

**Your attendance system is now protected against:**
- ❌ Remote scanning via video calls
- ❌ Screenshot sharing
- ❌ Proxy/VPN usage
- ❌ Device sharing
- ❌ Multiple attendance entries
- ❌ Rapid scanning abuse

**Students MUST:**
- ✅ Be physically present in classroom (within 20 meters)
- ✅ Use their own device
- ✅ Be on their own network (or limited sharing)
- ✅ Scan within 7-second window
- ✅ Wait 30 seconds between scans

**Result:** Only physically present students can mark attendance! 🎯

