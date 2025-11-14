from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import time
import hmac
import hashlib
import base64
import os

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD = os.path.join(BASE_DIR, '..', 'frontend', 'build')

app = Flask(__name__, static_folder=FRONTEND_BUILD, static_url_path='/')
CORS(app)

# ---------------- DB CONFIG ----------------
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Pavan@123',
    'database': 'attendance_db'
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)


# ---------------- HEALTH ----------------
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'time': datetime.utcnow().isoformat()})


# ---------------- LOGIN ----------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT id,name,role,student_id,course,section 
        FROM users 
        WHERE email=%s AND password=%s
    """, (email, password))

    user = cur.fetchone()

    cur.close()
    conn.close()

    if user:
        return jsonify({'user': user})
    return jsonify({'error': 'invalid credentials'}), 401


# ---------------- QR TOKEN GEN ----------------
def build_token(secret, session_id, window_seconds, offset=0):
    window = int(time.time() // window_seconds) + offset
    payload = f"{session_id}.{window}"
    mac = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
    mac8 = base64.urlsafe_b64encode(mac)[:11].decode()
    return f"{payload}.{mac8}"


# ---------------- CREATE SESSION ----------------
@app.route('/api/create-session', methods=['POST'])
def create_session():
    data = request.json
    class_id = data.get("class_id")

    if not class_id:
        return jsonify({'error': 'class_id required'}), 400

    secret = hashlib.sha256(os.urandom(32)).hexdigest()
    window_seconds = 15

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO qr_sessions (class_id, qr_code, session_date, secret, window_seconds, is_active)
        VALUES (%s, %s, NOW(), %s, %s, 1)
    """, (class_id, "qr", secret, window_seconds))

    conn.commit()
    session_id = cur.lastrowid

    cur.close()
    conn.close()

    return jsonify({'session_id': session_id})


# ---------------- CLASSES (list / create) ----------------
@app.route('/api/classes', methods=['GET', 'POST'])
def classes_handler():
    if request.method == 'GET':
        teacher_id = request.args.get('teacher_id')
        conn = get_db()
        cur = conn.cursor(dictionary=True)
        if teacher_id:
            cur.execute("SELECT id, class_name, teacher_id, latitude, longitude FROM classes WHERE teacher_id=%s", (teacher_id,))
        else:
            cur.execute("SELECT id, class_name, teacher_id, latitude, longitude FROM classes")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(rows)

    # POST -> create class
    data = request.json or {}
    class_name = data.get('class_name')
    teacher_id = data.get('teacher_id')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not class_name or not teacher_id:
        return jsonify({'error': 'class_name and teacher_id are required'}), 400

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO classes (class_name, teacher_id, latitude, longitude) VALUES (%s,%s,%s,%s)", (class_name, teacher_id, latitude, longitude))
        conn.commit()
        new_id = cur.lastrowid
        cur.close()
        conn.close()
        return jsonify({'id': new_id, 'class_name': class_name, 'teacher_id': teacher_id, 'latitude': latitude, 'longitude': longitude}), 201
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'error': str(e)}), 500


# Backwards-compatible teacher classes route (frontend expects /api/teacher/classes)
@app.route('/api/teacher/classes', methods=['GET'])
def teacher_classes():
    teacher_id = request.args.get('teacher_id')
    if not teacher_id:
        return jsonify({'error': 'teacher_id required'}), 400
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, class_name, teacher_id, latitude, longitude FROM classes WHERE teacher_id=%s", (teacher_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)


# ---------------- QR CURRENT TOKEN ----------------
@app.route('/api/qr/<int:session_id>/current')
def get_qr(session_id):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT secret, window_seconds, is_active
        FROM qr_sessions
        WHERE id=%s
    """, (session_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row or row["is_active"] != 1:
        return jsonify({"error": "Session inactive"}), 404

    token = build_token(row["secret"], session_id, row["window_seconds"])
    return jsonify({"token": token, "window_seconds": row["window_seconds"]})


# ---------------- MARK ATTENDANCE WITH TOKEN ----------------
@app.route('/api/attendance-token', methods=['POST'])
def mark_attendance_token():
    data = request.json
    student_id = data.get("student_id")
    token = data.get("token")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    device_fingerprint = data.get("device_fingerprint")
    client_ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', '')

    if not student_id or not token:
        return jsonify({'error': 'student_id and token are required'}), 400

    # Parse token: format is "session_id.window.mac"
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return jsonify({'error': 'Invalid token format'}), 400
        
        session_id = int(parts[0])
        window = int(parts[1])
        received_mac = parts[2]
    except (ValueError, IndexError):
        return jsonify({'error': 'Invalid token format'}), 400

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # Get session details
    cur.execute("""
        SELECT secret, window_seconds, class_id, is_active
        FROM qr_sessions
        WHERE id = %s
    """, (session_id,))
    
    session = cur.fetchone()
    if not session or session["is_active"] != 1:
        cur.close()
        conn.close()
        return jsonify({'error': 'Session not found or inactive'}), 404

    # Verify token (check current window and previous window for timing tolerance)
    for offset in [0, -1, 1]:
        expected_token = build_token(session["secret"], session_id, session["window_seconds"], offset)
        if token == expected_token:
            break
    else:
        cur.close()
        conn.close()
        return jsonify({'error': 'Invalid or expired token'}), 400

    # Get class location
    cur.execute("""
        SELECT latitude, longitude
        FROM classes
        WHERE id = %s
    """, (session["class_id"],))
    
    class_location = cur.fetchone()
    location_ok = 0
    
    if class_location and class_location["latitude"] and class_location["longitude"]:
        # Calculate distance (simple haversine approximation)
        lat_diff = abs(float(latitude) - float(class_location["latitude"]))
        lon_diff = abs(float(longitude) - float(class_location["longitude"]))
        # Rough conversion: 1 degree ≈ 111km, so 0.00018 ≈ 20m
        if lat_diff < 0.00018 and lon_diff < 0.00018:
            location_ok = 1

    # Check for duplicate attendance
    cur.execute("""
        SELECT id FROM attendance
        WHERE student_id = %s AND session_id = %s
    """, (student_id, session_id))
    
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Attendance already marked for this session'}), 400

    # Insert attendance record
    try:
        # Check if device_fingerprint, ip_address, user_agent columns exist
        cur.execute("SHOW COLUMNS FROM attendance LIKE 'device_fingerprint'")
        has_security_columns = cur.fetchone() is not None
        
        if has_security_columns:
            cur.execute("""
                INSERT INTO attendance (student_id, session_id, status, location_ok, device_fingerprint, ip_address, user_agent, scan_timestamp)
                VALUES (%s, %s, 'Present', %s, %s, %s, %s, NOW())
            """, (student_id, session_id, location_ok, device_fingerprint, client_ip, user_agent))
        else:
            cur.execute("""
                INSERT INTO attendance (student_id, session_id, status, location_ok, scan_timestamp)
                VALUES (%s, %s, 'Present', %s, NOW())
            """, (student_id, session_id, location_ok))
        
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'message': 'Attendance marked successfully!',
            'location_ok': location_ok == 1
        })
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({'error': str(e)}), 500


# ---------------- STUDENT ATTENDANCE ----------------
@app.route('/api/student/attendance', methods=['GET'])
def student_attendance():
    student_id = request.args.get("student_id")
    class_id = request.args.get("class_id")

    if not student_id:
        return jsonify({'error': 'student_id required'}), 400

    conn = get_db()
    cur = conn.cursor(dictionary=True)

    # ------------- ATTENDANCE RECORDS -------------
    if class_id:
        cur.execute("""
            SELECT  
                a.id AS attendance_id,
                a.status,
                a.location_ok,
                a.scan_timestamp,
                c.class_name,
                c.id AS class_id
            FROM attendance a
            JOIN qr_sessions q ON a.session_id = q.id
            JOIN classes c ON q.class_id = c.id
            WHERE a.student_id = %s AND c.id = %s
            ORDER BY a.scan_timestamp DESC
        """, (student_id, class_id))
    else:
        cur.execute("""
            SELECT  
                a.id AS attendance_id,
                a.status,
                a.location_ok,
                a.scan_timestamp,
                c.class_name,
                c.id AS class_id
            FROM attendance a
            JOIN qr_sessions q ON a.session_id = q.id
            JOIN classes c ON q.class_id = c.id
            WHERE a.student_id = %s
            ORDER BY a.scan_timestamp DESC
        """, (student_id,))

    attendance_records = cur.fetchall()

    # Convert datetime → string
    for r in attendance_records:
        if r["scan_timestamp"]:
            r["scan_timestamp"] = r["scan_timestamp"].isoformat()

    # ------------- STATS -------------
    cur.execute("""
        SELECT  
            c.id AS class_id,
            c.class_name,
            COUNT(a.id) AS total,
            COUNT(CASE WHEN a.status='Present' AND a.location_ok=1 THEN 1 END) AS present,
            COUNT(CASE WHEN a.status='Absent' THEN 1 END) AS absent
        FROM classes c
        LEFT JOIN qr_sessions q ON c.id = q.class_id
        LEFT JOIN attendance a ON a.session_id = q.id AND a.student_id = %s
        GROUP BY c.id, c.class_name
    """, (student_id,))

    statistics = cur.fetchall()

    # compute %
    for s in statistics:
        if s["total"] > 0:
            s["percentage"] = round((s["present"] / s["total"]) * 100, 2)
        else:
            s["percentage"] = 0

    cur.close()
    conn.close()

    return jsonify({
        "attendance_records": attendance_records,
        "statistics": statistics
    })


# -------- ROOT & HELP --------
@app.route('/')
def root():
    return jsonify({
        "app": "Attendance Management System",
        "status": "running",
        "version": "1.0",
        "endpoints": {
            "health": "GET /api/health",
            "login": "POST /api/login",
            "classes": "GET /api/classes or POST /api/classes",
            "create_session": "POST /api/create-session",
            "qr_token": "GET /api/qr/<session_id>/current",
            "student_attendance": "GET /api/student/attendance?student_id=<id>"
        }
    })

@app.route('/api/help')
def help_page():
    return jsonify({
        "endpoints": {
            "GET /api/health": "Check backend is running",
            "POST /api/login": "Login with email & password",
            "GET /api/classes": "List all classes or filter by teacher_id=<id>",
            "POST /api/classes": "Create a new class (requires class_name, teacher_id)",
            "POST /api/create-session": "Create QR session (requires class_id)",
            "GET /api/qr/<session_id>/current": "Get current QR token",
            "GET /api/student/attendance": "Get student attendance records (requires student_id)"
        },
        "frontend_url": "http://<your-pc-ip>:3000"
    })

# Serve React frontend for any non-API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # If it's an API route, let Flask handle it normally
    if path.startswith('api/'):
        return {'error': 'Not found'}, 404
    
    # Otherwise serve React's index.html (React Router will handle the path)
    index_path = os.path.join(FRONTEND_BUILD, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_BUILD, 'index.html')
    
    # Fallback if build doesn't exist
    return jsonify({'error': 'Frontend build not found. Run "npm run build" in frontend folder.'}), 404

# ---------------- RUN SERVER ----------------
app.run(host="0.0.0.0", port=5000, debug=True)
