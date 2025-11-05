-- MySQL schema for Attendance System
CREATE DATABASE IF NOT EXISTS attendance_db;
USE attendance_db;

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS qr_sessions;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  role ENUM('teacher','student','admin') DEFAULT 'student',
  password VARCHAR(255),
  student_id VARCHAR(50),
  course VARCHAR(200),
  section VARCHAR(50)
);

CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(150),
  teacher_id INT,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE qr_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT,
  qr_code VARCHAR(200),
  session_date DATETIME,
  secret VARCHAR(64),
  window_seconds INT DEFAULT 15,
  is_active TINYINT(1) DEFAULT 1,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  session_id INT,
  gps_lat DECIMAL(10,6),
  gps_lng DECIMAL(10,6),
  status ENUM('Present','Absent') DEFAULT 'Present',
  location_ok BOOLEAN DEFAULT 0,
  scan_time DATETIME,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE
);

-- Prevent replay: store which time window a student has scanned for a session
CREATE TABLE IF NOT EXISTS used_windows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  student_id INT NOT NULL,
  window_start DATETIME NOT NULL,
  UNIQUE KEY uniq_session_student_window (session_id, student_id, window_start),
  FOREIGN KEY (session_id) REFERENCES qr_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO users (name,email,role,password) VALUES ('Admin','admin@college.edu','admin','adminpass');
INSERT INTO users (name,email,role,password) VALUES ('Prof Mehta','mehta@college.edu','teacher','teachpass');
INSERT INTO users (name,email,role,password) VALUES ('Pavan Kh','pavan@student.edu','student','studpass');
INSERT INTO users (name,email,role,password) VALUES ('Asha R','asha@student.edu','student','studpass');

INSERT INTO classes (class_name, teacher_id, latitude, longitude) VALUES ('DBMS', 2, 12.971600, 77.594600);
