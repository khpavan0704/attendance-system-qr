-- Migration to add student fields to existing users table
USE attendance_db;

ALTER TABLE users 
ADD COLUMN student_id VARCHAR(50) AFTER password,
ADD COLUMN course VARCHAR(200) AFTER student_id,
ADD COLUMN section VARCHAR(50) AFTER course;

-- Add rotating QR support columns
ALTER TABLE qr_sessions
  ADD COLUMN IF NOT EXISTS secret VARCHAR(64),
  ADD COLUMN IF NOT EXISTS window_seconds INT DEFAULT 15,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1;

-- Create used_windows table if missing
CREATE TABLE IF NOT EXISTS used_windows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  student_id INT NOT NULL,
  window_start DATETIME NOT NULL,
  UNIQUE KEY uniq_session_student_window (session_id, student_id, window_start),
  FOREIGN KEY (session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

