import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import QRScanner from './QRScanner';
import StudentAttendance from './StudentAttendance';
import StudentSummary from './StudentSummary';
import './Dashboard.css';
import { API_BASE } from '../config';

export default function Dashboard({ user, setUser }) {
  const [sessionId, setSessionId] = useState(null);
  const [token, setToken] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [classId, setClassId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [showManualInfo, setShowManualInfo] = useState(true);

  const logout = () => {
    setUser(null);
  };

  const createDefaultClass = React.useCallback(async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/classes`, {
        class_name: `${user.name}'s Class`,
        teacher_id: user.id
      });
      setClasses([response.data]);
      setClassId(response.data.id);
    } catch (err) {
      alert('Failed to create default class. Please create a class first.');
    }
  }, [user.id, user.name]);

  const loadClasses = React.useCallback(async () => {
    setLoadingClasses(true);
    try {
      const response = await axios.get(`${API_BASE}/api/classes?teacher_id=${user.id}`);
      if (response.data && response.data.length > 0) {
        setClasses(response.data);
        setClassId(response.data[0].id);
      } else {
        // Auto-create a default class for the teacher
        await createDefaultClass();
      }
    } catch (err) {
      console.error('Error loading classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  }, [user.id, createDefaultClass]);

  // Load classes for teacher on mount
  useEffect(() => {
    if (user?.role === 'teacher') {
      loadClasses();
    }
  }, [user, loadClasses]);

  const generateQR = async () => {
    if (!classId) {
      alert('Please select a class first or create one.');
      return;
    }
    try {
      const code = `CLASS-${user.id}-${Date.now()}`;
      const response = await axios.post(`${API_BASE}/api/create-session`, {
        class_id: classId,
        qr_code: code
      });
      // Use the session_id to get rotating tokens
      if (response.data.session_id) {
        setSessionId(response.data.session_id);
        setShowQR(true);
      }
    } catch (err) {
      let errorMessage = 'Failed to generate QR code';
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = `Cannot connect to server. Please make sure the backend server is running on ${API_BASE}`;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        // If class doesn't exist, try to create one
        if (errorMessage.includes('does not exist')) {
          await createDefaultClass();
          errorMessage += '\n\nA default class has been created. Please try again.';
        }
      } else {
        errorMessage = `Failed to generate QR code: ${err.message}`;
      }
      alert(errorMessage);
    }
  };

  // Poll rotating token when a session is active (7 seconds window)
  useEffect(() => {
    if (!sessionId) return;
    let timer = null;
    const fetchToken = async () => {
      try {
        const r = await axios.get(`${API_BASE}/api/qr/${sessionId}/current`);
        setToken(r.data.token);
        // refresh faster than server window size (7 seconds) - refresh every 5 seconds
        const ws = (r.data.window_seconds || 7);
        timer = setTimeout(fetchToken, Math.max(3000, ws * 700)); // 70% of window time
      } catch (e) {
        // ignore transient errors, but log for debugging
        console.error('Error fetching token:', e);
      }
    };
    fetchToken();
    return () => { if (timer) clearTimeout(timer); };
  }, [sessionId]);

  const renderDashboardContent = () => {
    if (activeView === 'qr' && user.role === 'teacher') {
      return (
        <div className="feature-content">
          <h2>Generate QR Code</h2>
          {loadingClasses ? (
            <p>Loading classes...</p>
          ) : (
            <>
              {classes.length > 0 && (
                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', marginBottom: '5px'}}>Select Class:</label>
                  <select 
                    value={classId || ''} 
                    onChange={(e) => setClassId(Number(e.target.value))}
                    style={{padding: '8px', width: '300px', fontSize: '14px'}}
                  >
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button onClick={generateQR} className="action-btn" disabled={!classId}>
                Generate New QR Code
              </button>
            </>
          )}
          {showQR && sessionId && token && (
            <div className="qr-display">
              <h3>Show this on Projector</h3>
              <div style={{
                backgroundColor: '#fff3cd',
                border: '2px solid #ffc107',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <strong style={{color: '#856404', fontSize: '16px'}}>⚠️ SECURITY WARNING</strong>
                <p style={{color: '#856404', marginTop: '10px', fontSize: '14px'}}>
                  Do NOT share this QR code via video call, screenshot, or photo.<br/>
                  Only students physically present in the classroom can scan this code.
                </p>
              </div>
              <div className="qr-code-container">
                <QRCode value={token} size={256} />
              </div>
              <p className="qr-text" style={{fontFamily: 'monospace', wordBreak: 'break-all'}}>{token}</p>
              <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                Session ID: {sessionId} | Token refreshes every 7 seconds
              </p>
              <p style={{fontSize: '11px', color: '#d32f2f', marginTop: '5px', fontWeight: 'bold'}}>
                🔒 Security: GPS verification required. Remote scanning is blocked.
              </p>
              <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px'}}>
                <button
                  onClick={() => {
                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(token)
                        .then(() => alert('Token copied to clipboard. Share only with students in class.'))
                        .catch(() => alert('Unable to copy token. Please copy manually.'));
                    } else {
                      alert('Copy not supported on this browser. Please copy manually.');
                    }
                  }}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Copy Token
                </button>
                <button
                  onClick={() => setShowManualInfo(prev => !prev)}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {showManualInfo ? 'Hide' : 'Show'} Manual Entry Info
                </button>
              </div>
              {showManualInfo && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: '#eef9ff',
                  border: '1px solid #90caf9',
                  borderRadius: '8px',
                  padding: '15px',
                  color: '#0d47a1',
                  textAlign: 'left'
                }}>
                  <h4 style={{marginTop: 0}}>Manual Token Entry Instructions</h4>
                  <ul style={{paddingLeft: '18px', marginBottom: 0}}>
                    <li>Tell students they can tap <strong>⌨️ Enter Token</strong> on their phones if the camera is not working.</li>
                    <li>Read or display the token above so students can type it exactly (including dashes).</li>
                    <li>Manual entry still requires GPS/location verification, so only students in the classroom will succeed.</li>
                    <li>Tokens refresh every few seconds—if someone gets an error, ask them to enter the newest token.</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          {showQR && sessionId && !token && (
            <div style={{padding: '20px', color: '#666'}}>Loading QR token...</div>
          )}
        </div>
      );
    }

    if (activeView === 'manual' && user.role === 'teacher') {
      return (
        <div className="feature-content">
          <h2>Manual Token Entry (Teacher Guide)</h2>
          {!showQR || !sessionId ? (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#856404'
            }}>
              <strong>Generate a QR (and token) first.</strong> The manual entry method uses the same rotating token. 
              Click <strong>GENERATE QR</strong> above, start a session, then return here to share the token with students.
            </div>
          ) : null}

          {showQR && sessionId && token && (
            <div style={{
              backgroundColor: '#eef9ff',
              border: '1px solid #90caf9',
              borderRadius: '8px',
              padding: '18px',
              marginBottom: '20px',
              color: '#0d47a1'
            }}>
              <h3 style={{marginTop: 0}}>Current Token</h3>
              <p style={{fontFamily: 'monospace', fontSize: '18px', wordBreak: 'break-all'}}>{token}</p>
              <p style={{fontSize: '12px', color: '#0d47a1'}}>Session ID: {sessionId} | Refreshes every 7 seconds</p>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button
                  onClick={() => {
                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(token)
                        .then(() => alert('Token copied. Share only with students in class (manual entry still requires GPS).'))
                        .catch(() => alert('Unable to copy. Please copy manually.'));
                    } else {
                      alert('Copy not supported on this browser. Copy manually instead.');
                    }
                  }}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Copy Token
                </button>
                <button
                  onClick={() => setShowManualInfo(prev => !prev)}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {showManualInfo ? 'Hide' : 'Show'} Student Instructions
                </button>
              </div>
            </div>
          )}

          {showManualInfo && (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '18px',
              lineHeight: 1.6
            }}>
              <h3 style={{marginTop: 0}}>How to Use Manual Entry</h3>
              <ol style={{paddingLeft: '18px'}}>
                <li>Show the QR on the projector <strong>and</strong> read out the token text beneath it.</li>
                <li>Tell students with camera issues to tap <strong>⌨️ Enter Token</strong> on their phones.</li>
                <li>They must type the token exactly (including dashes) before it refreshes.</li>
                <li>Manual entry still enforces GPS/device/IP restrictions, so only students in your classroom will succeed.</li>
                <li>If a student gets an “invalid/expired token” error, read the newest token on screen.</li>
              </ol>
              <p style={{marginTop: '10px', color: '#555'}}>
                <strong>Need to run without QR?</strong> You can keep this page open and read out the new token every time it changes. 
                Students can keep using manual entry without needing the camera.
              </p>
            </div>
          )}
        </div>
      );
    }

    if (activeView === 'scan' && user.role === 'student') {
      return <QRScanner user={user} />;
    }

    if (activeView === 'attendance' && user.role === 'student') {
      return <StudentAttendance user={user} />;
    }

    return (
      <div className="dashboard-welcome">
        <h2>Welcome to Attendance Management System</h2>
        <p>Select an option from the menu to get started</p>
        {user.role === 'student' && (
          <div style={{marginTop: 20}}>
            <h3 style={{color:'#333', marginBottom: 10}}>Your Subjects Summary</h3>
            <StudentSummary user={user} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">JSSATE BENGALURU</div>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="profile-pic">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              {user.role === 'student' && (
                <>
                  <div className="profile-id">{user.student_id || 'Student ID'}</div>
                  <div className="profile-course">{user.course || 'Course'}</div>
                  <div className="profile-section">{user.section || 'Section'}</div>
                </>
              )}
              {user.role === 'teacher' && (
                <div className="profile-role">Teacher</div>
              )}
            </div>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-divider"></div>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {user.role === 'student' ? (
            <>
              <button 
                className="dashboard-btn btn-1" 
                onClick={() => setActiveView('scan')}
              >
                SCAN QR CODE
              </button>
              <button 
                className="dashboard-btn btn-2" 
                onClick={() => setActiveView('attendance')}
              >
                MY ATTENDANCE
              </button>
              <button 
                className="dashboard-btn btn-3" 
                onClick={() => setActiveView('dashboard')}
              >
                DASHBOARD
              </button>
            </>
          ) : (
            <>
              <button 
                className="dashboard-btn btn-1" 
                onClick={() => setActiveView('qr')}
              >
                GENERATE QR
              </button>
              <button 
                className="dashboard-btn btn-2" 
                onClick={() => setActiveView('manual')}
              >
                MANUAL ENTRY
              </button>
              <button 
                className="dashboard-btn btn-3" 
                onClick={() => setActiveView('report')}
              >
                VIEW REPORTS
              </button>
              <button 
                className="dashboard-btn btn-4" 
                onClick={() => setActiveView('dashboard')}
              >
                DASHBOARD
              </button>
            </>
          )}
        </div>

        <div className="main-content">
          {renderDashboardContent()}
        </div>
      </main>

      {user.role === 'student' && (
        <button className="fab-scan" onClick={() => setActiveView('scan')}>📷 Scan QR</button>
      )}

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            © Copyright 2025. All Rights Reserved
          </div>
          <div className="footer-right">
            admissions@system.com | 080-28611702
          </div>
        </div>
      </footer>
    </div>
  );
}

