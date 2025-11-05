from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from datetime import datetime
import time
import hmac
import hashlib
import base64
import math
import os

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app)

# === DB CONFIG (update if needed) ===
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASS', 'Pavan@123'),
    'database': os.getenv('DB_NAME', 'attendance_db')
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

@app.route('/api/health')
def health():
    return jsonify({'status':'ok', 'time': datetime.utcnow().isoformat()})

# Register (simple demo - DO NOT use plain passwords in production)
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name'); email = data.get('email'); role = data.get('role'); password = data.get('password')
    student_id = data.get('studentId'); course = data.get('course'); section = data.get('section')
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (name,email,role,password,student_id,course,section) VALUES (%s,%s,%s,%s,%s,%s,%s)", 
                   (name,email,role,password,student_id,course,section))
        conn.commit()
        return jsonify({'message':'registered'})
    except Exception as e:
        return jsonify({'error':str(e)}), 400
    finally:
        cur.close(); conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json or {}
        email = data.get('email'); password = data.get('password')
        if not email or not password:
            return jsonify({'error': 'email and password required'}), 400
        conn = get_db(); cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id,name,role,student_id,course,section FROM users WHERE email=%s AND password=%s", (email,password))
        user = cur.fetchone()
        cur.close(); conn.close()
        if user:
            return jsonify({'user': user})
        return jsonify({'error':'invalid credentials'}), 401
    except Exception as e:
        # Return detailed message to help diagnose 500s from mobile
        return jsonify({'error': f'login_failed: {str(e)}'}), 500

@app.route('/api/debug/db', methods=['GET'])
def debug_db():
    """Quick DB connectivity check"""
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute('SELECT 1')
        cur.close(); conn.close()
        return jsonify({'db': 'ok'})
    except Exception as e:
        return jsonify({'db': 'error', 'message': str(e), 'config': {
            'host': DB_CONFIG.get('host'), 'user': DB_CONFIG.get('user'), 'database': DB_CONFIG.get('database')
        }}), 500

@app.route('/api/create-session', methods=['POST'])
def create_session():
    data = request.json
    class_id = data.get('class_id'); qr_code = data.get('qr_code')
    
    if not class_id:
        return jsonify({'error': 'class_id is required'}), 400
    if not qr_code:
        return jsonify({'error': 'qr_code is required'}), 400
    
    # Generate a per-session secret used to sign rotating QR tokens
    session_secret = hashlib.sha256(os.urandom(32)).hexdigest()
    # Default to 7 seconds (more secure) instead of 15 seconds
    window_seconds = int(data.get('window_seconds', 7))
    conn = get_db(); cur = conn.cursor()
    try:
        # First check if class exists
        cur.execute("SELECT id FROM classes WHERE id=%s", (class_id,))
        if not cur.fetchone():
            return jsonify({'error': f'Class with ID {class_id} does not exist. Please create the class first or use an existing class ID.'}), 404
        
        cur.execute(
            "INSERT INTO qr_sessions (class_id, qr_code, session_date, secret, window_seconds, is_active) VALUES (%s,%s,NOW(),%s,%s,1)",
            (class_id, qr_code, session_secret, window_seconds)
        )
        conn.commit()
        session_id = cur.lastrowid
        return jsonify({'session_id': session_id, 'qr_code': qr_code})
    except mysql.connector.Error as db_err:
        conn.rollback()
        error_msg = str(db_err)
        if 'foreign key constraint' in error_msg.lower():
            return jsonify({'error': f'Class with ID {class_id} does not exist. Please check your database.'}), 400
        return jsonify({'error': f'Database error: {error_msg}'}), 500
    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Failed to create session: {str(e)}'}), 500
    finally:
        cur.close(); conn.close()


def _build_token(secret: str, session_id: int, window_seconds: int, offset_windows: int = 0) -> str:
    # Compute current time window
    window = int(time.time() // window_seconds) + offset_windows
    payload = f"{session_id}.{window}"
    sig = hmac.new(secret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).digest()
    mac8 = base64.urlsafe_b64encode(sig)[:11].decode('utf-8')  # short but strong enough for windowed use
    return f"{payload}.{mac8}"


@app.route('/api/qr/<int:session_id>/current', methods=['GET'])
def get_current_qr_token(session_id: int):
    """Return the current rotating QR token for a session without exposing the secret."""
    conn = get_db(); cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT secret, window_seconds, is_active FROM qr_sessions WHERE id=%s", (session_id,))
        row = cur.fetchone()
        if not row or not row['is_active']:
            return jsonify({'error': 'Session inactive or not found'}), 404
        token = _build_token(row['secret'], session_id, int(row['window_seconds']))
        return jsonify({'token': token, 'window_seconds': int(row['window_seconds'])})
    finally:
        cur.close(); conn.close()

def haversine(lat1, lon1, lat2, lon2):
    # returns meters
    R = 6371000
    phi1 = math.radians(lat1); phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1); dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.asin(math.sqrt(a))

@app.route('/api/attendance-token', methods=['POST'])
def mark_attendance_with_token():
    data = request.json
    student_id = data.get('student_id'); token = data.get('token')
    latitude = data.get('latitude'); longitude = data.get('longitude')
    device_fingerprint = data.get('device_fingerprint', '')
    
    # Get client IP address
    ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', ''))
    if ',' in ip_address:
        ip_address = ip_address.split(',')[0].strip()
    user_agent = request.headers.get('User-Agent', '')
    
    if not token:
        return jsonify({'error': 'token required'}), 400

    # Parse token: session.window.signature
    try:
        session_str, window_str, mac = token.split('.')
        session_id = int(session_str)
        window = int(window_str)
    except Exception:
        return jsonify({'error': 'invalid token'}), 400

    conn = get_db(); cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT q.id as session_id, q.secret, q.window_seconds, c.latitude as class_lat, c.longitude as class_lng
            FROM qr_sessions q JOIN classes c ON q.class_id = c.id WHERE q.id=%s AND q.is_active=1
        """, (session_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'session not found'}), 404

        # Validate token signature for current/adjacent window to allow small clock skew
        # Only allow current window (delta=0) and previous window (delta=-1) - removed future window
        ok = False
        for delta in (-1, 0):
            expected = _build_token(row['secret'], session_id, int(row['window_seconds']), delta)
            if expected.split('.')[-1] == mac and int(expected.split('.')[1]) == window:
                ok = True
                break
        if not ok:
            return jsonify({'error': 'invalid or expired token'}), 400

        # SECURITY: Check for suspicious device patterns (same device scanning for multiple students)
        if device_fingerprint:
            cur2 = conn.cursor(dictionary=True)
            cur2.execute("""
                SELECT DISTINCT student_id, COUNT(*) as scan_count 
                FROM attendance 
                WHERE device_fingerprint = %s 
                AND session_id = %s 
                AND scan_timestamp > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
                GROUP BY student_id
            """, (device_fingerprint, session_id))
            device_scans = cur2.fetchall()
            cur2.close()
            
            if len(device_scans) > 1:
                # Same device used by multiple students - suspicious!
                cur2 = conn.cursor()
                cur2.execute("""
                    INSERT INTO security_logs (session_id, student_id, device_fingerprint, ip_address, event_type, details)
                    VALUES (%s, %s, %s, %s, 'suspicious_device', %s)
                """, (session_id, student_id, device_fingerprint, ip_address, 
                      f"Device used by {len(device_scans)} different students"))
                conn.commit()
                cur2.close()
                return jsonify({'error': 'Suspicious activity detected. Contact administrator.'}), 403

        # SECURITY: Rate limiting - prevent rapid scans from same student
        cur2 = conn.cursor(dictionary=True)
        cur2.execute("""
            SELECT COUNT(*) as recent_scans 
            FROM attendance 
            WHERE student_id = %s 
            AND scan_timestamp > DATE_SUB(NOW(), INTERVAL 30 SECOND)
        """, (student_id,))
        rate_check = cur2.fetchone()
        cur2.close()
        if rate_check and rate_check['recent_scans'] > 0:
            return jsonify({'error': 'Too many scans. Please wait before scanning again.'}), 429

        # SECURITY: Check if same IP is being used by multiple different students (possible sharing)
        if ip_address:
            cur2 = conn.cursor()
            cur2.execute("""
                SELECT COUNT(DISTINCT student_id) as unique_students 
                FROM attendance 
                WHERE ip_address = %s 
                AND session_id = %s 
                AND scan_timestamp > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
            """, (ip_address, session_id))
            ip_check = cur2.fetchone()
            cur2.close()
            if ip_check and ip_check['unique_students'] > 3:
                # More than 3 different students from same IP in 2 minutes - suspicious
                cur2 = conn.cursor()
                cur2.execute("""
                    INSERT INTO security_logs (session_id, student_id, ip_address, event_type, details)
                    VALUES (%s, %s, %s, 'suspicious_ip', %s)
                """, (session_id, student_id, ip_address, 
                      f"IP used by {ip_check['unique_students']} different students"))
                conn.commit()
                cur2.close()

        # Prevent replay for this student in the same window
        window_start_unix = window * int(row['window_seconds'])
        window_start_iso = datetime.utcfromtimestamp(window_start_unix).strftime('%Y-%m-%d %H:%M:%S')
        cur2 = conn.cursor()
        try:
            cur2.execute("""
                INSERT INTO used_windows (session_id, student_id, window_start)
                VALUES (%s,%s,%s)
            """, (session_id, student_id, window_start_iso))
            conn.commit()
        except Exception:
            return jsonify({'error': 'duplicate scan in same window'}), 409
        finally:
            cur2.close()

        # SECURITY: Stricter location gating (reduced to 25 meters from 50 meters)
        class_lat = float(row['class_lat']); class_lng = float(row['class_lng'])
        distance = haversine(class_lat, class_lng, float(latitude), float(longitude))
        location_ok = distance <= 25  # Reduced from 50 to 25 meters

        if not location_ok:
            # Log GPS mismatch
            cur2 = conn.cursor()
            cur2.execute("""
                INSERT INTO security_logs (session_id, student_id, device_fingerprint, ip_address, event_type, details)
                VALUES (%s, %s, %s, %s, 'gps_mismatch', %s)
            """, (session_id, student_id, device_fingerprint, ip_address, 
                  f"Distance: {distance:.2f}m (limit: 25m)"))
            conn.commit()
            cur2.close()

        # Insert attendance with security tracking
        cur.execute(
            """INSERT INTO attendance (student_id, session_id, gps_lat, gps_lng, status, location_ok, 
               scan_time, device_fingerprint, ip_address, user_agent, scan_timestamp) 
               VALUES (%s,%s,%s,%s,%s,%s,NOW(),%s,%s,%s,NOW())""",
            (student_id, session_id, latitude, longitude, 
             'Present' if location_ok else 'Absent', 1 if location_ok else 0,
             device_fingerprint, ip_address, user_agent)
        )
        conn.commit()
        return jsonify({
            'message': 'Attendance marked' if location_ok else 'Outside allowed location: attendance rejected', 
            'distance_m': round(distance, 2), 
            'location_ok': location_ok,
            'security_notice': 'Your attendance is being monitored for security purposes'
        })
    finally:
        cur.close(); conn.close()

@app.route('/api/report/<int:class_id>', methods=['GET'])
def report(class_id):
    conn = get_db(); cur = conn.cursor(dictionary=True)
    q = """
    SELECT a.id as attendance_id, u.name as student_name, q.session_date, a.status, a.location_ok, a.scan_time
    FROM attendance a
    JOIN users u ON a.student_id = u.id
    JOIN qr_sessions q ON a.session_id = q.id
    WHERE q.class_id = %s
    ORDER BY a.scan_time DESC
    """
    cur.execute(q, (class_id,))
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows)

@app.route('/api/student/attendance', methods=['GET'])
def get_student_attendance():
    """Get attendance records for a specific student, optionally filtered by class"""
    student_id = request.args.get('student_id', type=int)
    class_id = request.args.get('class_id', type=int)
    
    if not student_id:
        return jsonify({'error': 'student_id is required'}), 400
    
    conn = get_db(); cur = conn.cursor(dictionary=True)
    try:
        if class_id:
            # Filter by specific class
            q = """
            SELECT 
                a.id as attendance_id,
                c.class_name,
                c.id as class_id,
                q.session_date,
                a.status,
                a.location_ok,
                a.scan_time,
                a.scan_timestamp,
                CASE WHEN a.status = 'Present' AND a.location_ok = 1 THEN 1 ELSE 0 END as is_present
            FROM attendance a
            JOIN qr_sessions q ON a.session_id = q.id
            JOIN classes c ON q.class_id = c.id
            WHERE a.student_id = %s AND c.id = %s
            ORDER BY q.session_date DESC, a.scan_time DESC
            """
            cur.execute(q, (student_id, class_id))
        else:
            # Get all attendance records grouped by class
            q = """
            SELECT 
                a.id as attendance_id,
                c.class_name,
                c.id as class_id,
                q.session_date,
                a.status,
                a.location_ok,
                a.scan_time,
                a.scan_timestamp,
                CASE WHEN a.status = 'Present' AND a.location_ok = 1 THEN 1 ELSE 0 END as is_present
            FROM attendance a
            JOIN qr_sessions q ON a.session_id = q.id
            JOIN classes c ON q.class_id = c.id
            WHERE a.student_id = %s
            ORDER BY c.class_name, q.session_date DESC, a.scan_time DESC
            """
            cur.execute(q, (student_id,))
        
        rows = cur.fetchall()
        
        # Calculate statistics by class
        stats = {}
        for row in rows:
            class_id_key = row['class_id']
            if class_id_key not in stats:
                stats[class_id_key] = {
                    'class_id': class_id_key,
                    'class_name': row['class_name'],
                    'total': 0,
                    'present': 0,
                    'absent': 0,
                    'percentage': 0
                }
            stats[class_id_key]['total'] += 1
            if row['is_present']:
                stats[class_id_key]['present'] += 1
            else:
                stats[class_id_key]['absent'] += 1
        
        # Calculate percentages
        for key in stats:
            if stats[key]['total'] > 0:
                stats[key]['percentage'] = round((stats[key]['present'] / stats[key]['total']) * 100, 2)
        
        cur.close(); conn.close()
        return jsonify({
            'attendance_records': rows,
            'statistics': list(stats.values())
        })
    except Exception as e:
        cur.close(); conn.close()
        return jsonify({'error': str(e)}), 500


# ---- Class management ----
@app.route('/api/classes', methods=['GET'])
def list_classes():
    """List all classes, optionally filtered by teacher_id"""
    teacher_id = request.args.get('teacher_id', type=int)
    conn = get_db(); cur = conn.cursor(dictionary=True)
    try:
        if teacher_id:
            cur.execute("SELECT id, class_name, teacher_id, latitude, longitude FROM classes WHERE teacher_id=%s", (teacher_id,))
        else:
            cur.execute("SELECT id, class_name, teacher_id, latitude, longitude FROM classes")
        rows = cur.fetchall()
        return jsonify(rows)
    finally:
        cur.close(); conn.close()

@app.route('/api/classes', methods=['POST'])
def create_class():
    """Create a new class"""
    data = request.json or {}
    class_name = data.get('class_name')
    teacher_id = data.get('teacher_id')
    
    if not class_name:
        return jsonify({'error': 'class_name is required'}), 400
    if not teacher_id:
        return jsonify({'error': 'teacher_id is required'}), 400
    
    conn = get_db(); cur = conn.cursor()
    try:
        # Check if teacher exists
        cur.execute("SELECT id FROM users WHERE id=%s AND role='teacher'", (teacher_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Teacher not found'}), 404
        
        cur.execute(
            "INSERT INTO classes (class_name, teacher_id, latitude, longitude) VALUES (%s, %s, %s, %s)",
            (class_name, teacher_id, data.get('latitude'), data.get('longitude'))
        )
        conn.commit()
        class_id = cur.lastrowid
        return jsonify({'id': class_id, 'class_name': class_name, 'teacher_id': teacher_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Failed to create class: {str(e)}'}), 500
    finally:
        cur.close(); conn.close()

# ---- Class location management ----
@app.route('/api/classes/<int:class_id>', methods=['GET'])
def get_class(class_id: int):
    conn = get_db(); cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT id, class_name, teacher_id, latitude, longitude FROM classes WHERE id=%s", (class_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'not found'}), 404
        return jsonify(row)
    finally:
        cur.close(); conn.close()


@app.route('/api/classes/<int:class_id>/location', methods=['POST'])
def set_class_location(class_id: int):
    data = request.json or {}
    latitude = data.get('latitude'); longitude = data.get('longitude')
    if latitude is None or longitude is None:
        return jsonify({'error': 'latitude and longitude required'}), 400
    conn = get_db(); cur = conn.cursor()
    try:
        cur.execute("UPDATE classes SET latitude=%s, longitude=%s WHERE id=%s", (latitude, longitude, class_id))
        conn.commit()
        return jsonify({'message': 'location updated', 'latitude': latitude, 'longitude': longitude})
    finally:
        cur.close(); conn.close()

# Serve frontend (build) files if exist
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        index_path = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({'message':'Frontend not built'}), 404

if __name__ == '__main__':
    # Bind to all interfaces so other devices on the same network can access
    app.run(host='0.0.0.0', port=5000, debug=True)
