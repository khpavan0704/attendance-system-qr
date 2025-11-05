# Security Migration Guide

## Quick Start

1. **Backup your database first!**
   ```bash
   mysqldump -u root -p attendance_db > backup_before_security.sql
   ```

2. **Run the migration:**
   ```bash
   mysql -u root -p attendance_db < database/security_migration.sql
   ```

3. **Restart your backend server**

4. **Test the system** with a few scans to ensure everything works

## What Gets Added

### New Database Columns
- `attendance.device_fingerprint` - Unique device identifier
- `attendance.ip_address` - Client IP address
- `attendance.user_agent` - Browser/device information
- `attendance.scan_timestamp` - Precise scan time

### New Security Table
- `security_logs` - Tracks all suspicious activities for administrator review

### Updated Defaults
- `qr_sessions.window_seconds` - Changed from 15 to 7 seconds (default)

## Rollback (if needed)

If you need to rollback, you can run:
```sql
ALTER TABLE attendance 
DROP COLUMN device_fingerprint,
DROP COLUMN ip_address,
DROP COLUMN user_agent,
DROP COLUMN scan_timestamp;

DROP TABLE IF EXISTS security_logs;

ALTER TABLE qr_sessions MODIFY COLUMN window_seconds INT DEFAULT 15;
```

## Verifying the Migration

After running the migration, verify it worked:
```sql
USE attendance_db;

-- Check new columns exist
DESCRIBE attendance;

-- Check security_logs table exists
SHOW TABLES LIKE 'security_logs';

-- Check default window_seconds
SHOW COLUMNS FROM qr_sessions LIKE 'window_seconds';
```

