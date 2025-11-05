-- Security enhancements migration
-- Run this to add security features to prevent QR code sharing abuse

USE attendance_db;

-- Track device fingerprints and IP addresses for each scan
ALTER TABLE attendance 
ADD COLUMN device_fingerprint VARCHAR(255) NULL,
ADD COLUMN ip_address VARCHAR(45) NULL,
ADD COLUMN user_agent TEXT NULL,
ADD COLUMN scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX idx_device_fingerprint ON attendance(device_fingerprint);
CREATE INDEX idx_ip_address ON attendance(ip_address);
CREATE INDEX idx_scan_time ON attendance(scan_timestamp);

-- Track suspicious activity patterns
CREATE TABLE IF NOT EXISTS security_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  student_id INT NULL,
  device_fingerprint VARCHAR(255),
  ip_address VARCHAR(45),
  event_type ENUM('suspicious_device', 'suspicious_ip', 'rate_limit_exceeded', 'gps_mismatch') NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_security_logs_time ON security_logs(created_at);
CREATE INDEX idx_security_logs_device ON security_logs(device_fingerprint);

-- Update default window_seconds to 7 seconds (was 15)
ALTER TABLE qr_sessions MODIFY COLUMN window_seconds INT DEFAULT 7;

