# Security Enhancements to Prevent QR Code Sharing Abuse

## Problem
Students were able to:
- Take photos of QR codes and share them in WhatsApp groups
- Scan QR codes remotely from photos without being in class
- Get attendance marked even when not physically present

## Solutions Implemented

### 1. **Reduced QR Code Time Window**
   - **Before:** 15 seconds
   - **After:** 7 seconds (default)
   - **Impact:** QR codes expire much faster, making it harder to take photos and share them before they expire

### 2. **Stricter GPS Location Verification**
   - **Before:** 50 meters radius
   - **After:** 25 meters radius
   - **Impact:** Students must be physically closer to the classroom location, reducing abuse from nearby areas (like library)

### 3. **Device Fingerprinting**
   - **New Feature:** Tracks unique device characteristics (browser, screen, hardware)
   - **Protection:** Detects if the same device is being used to mark attendance for multiple students
   - **Action:** Blocks suspicious activity when same device scans for >1 different student

### 4. **IP Address Tracking**
   - **New Feature:** Tracks IP addresses of all scans
   - **Protection:** Flags suspicious patterns when >3 different students scan from the same IP within 2 minutes
   - **Use Case:** Detects remote sharing via VPN or when someone shares from another location

### 5. **Rate Limiting**
   - **New Feature:** Prevents rapid successive scans from the same student
   - **Limit:** Only 1 scan per student every 30 seconds
   - **Protection:** Prevents abuse attempts and scanning errors

### 6. **Security Logging**
   - **New Feature:** Comprehensive logging of suspicious activities
   - **Tracks:** 
     - Same device used by multiple students
     - Same IP used by multiple students
     - GPS location mismatches
     - Rate limit violations
   - **Use:** Administrators can review logs to identify patterns of abuse

### 7. **Tighter Token Validation**
   - **Before:** Allowed current, previous, and future windows (delta: -1, 0, 1)
   - **After:** Only allows current and previous window (delta: -1, 0)
   - **Impact:** Prevents pre-capturing QR codes for future use

## Database Changes Required

Run the migration script to add security features:

```sql
-- Run this file:
database/security_migration.sql
```

This will:
- Add `device_fingerprint`, `ip_address`, `user_agent`, and `scan_timestamp` columns to `attendance` table
- Create `security_logs` table for tracking suspicious activities
- Update default `window_seconds` to 7

## How It Works Now

1. **When a student scans:**
   - Device fingerprint is generated based on browser/device characteristics
   - IP address is captured
   - GPS location is verified (must be within 25 meters)
   - Time window validation (QR code expires every 7 seconds)
   - Rate limiting check (max 1 scan per 30 seconds)
   - Device/IP pattern analysis

2. **Security Checks:**
   - ✅ **Device Check:** If same device scans for >1 student → BLOCKED
   - ✅ **IP Check:** If same IP scans for >3 students in 2 minutes → FLAGGED (logged)
   - ✅ **GPS Check:** If distance > 25 meters → ATTENDANCE REJECTED
   - ✅ **Rate Check:** If student scans again within 30 seconds → BLOCKED
   - ✅ **Token Check:** If QR code is expired or invalid → BLOCKED

3. **Security Logs:**
   All suspicious activities are logged in the `security_logs` table for administrator review.

## Additional Recommendations

### For Even Better Security:

1. **Network Proximity Detection:** 
   - Require students to be on the campus WiFi network
   - Block scans from external networks

2. **Face Verification (Future):**
   - Add optional face verification during scan
   - Compare with student profile photo

3. **Two-Factor Verification:**
   - Require PIN or biometric confirmation after scan

4. **Real-time Monitoring:**
   - Dashboard for teachers to see scans in real-time
   - Alerts when suspicious patterns detected

5. **Stricter GPS (Optional):**
   - Reduce radius to 15-20 meters if classrooms are well-defined
   - Use WiFi fingerprinting as additional verification

## Testing the Security Features

1. **Test Device Fingerprinting:**
   - Try scanning with same device for two different students → Should be blocked

2. **Test GPS Verification:**
   - Try scanning from >25 meters away → Should be rejected

3. **Test Rate Limiting:**
   - Try scanning twice within 30 seconds → Second scan should be blocked

4. **Test Token Expiry:**
   - Wait >7 seconds after QR code is generated → Should be expired

## Migration Instructions

1. **Backup your database** (important!)
2. Run the migration script:
   ```bash
   mysql -u root -p attendance_db < database/security_migration.sql
   ```
3. Restart the backend server
4. Test with a few scans to ensure everything works

## Notes

- Device fingerprinting is privacy-conscious (doesn't reveal personal info)
- All security checks run server-side and cannot be bypassed
- Security logs can be reviewed via SQL queries on the `security_logs` table
- The system maintains backward compatibility while adding security layers

