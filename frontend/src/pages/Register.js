import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import './Register.css';

export default function Register({ setShowLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    course: '',
    section: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/register`, formData);
      alert('Registration successful! Please login.');
      setShowLogin(true);
    } catch (err) {
      let errorMessage = 'Registration failed: ';
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = `Cannot connect to server. Please make sure the backend server is running on ${API_BASE}`;
      } else if (err.response?.data?.error) {
        errorMessage = 'Registration failed: ' + err.response.data.error;
      } else {
        errorMessage = 'Registration failed: ' + err.message;
      }
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>ATTENDANCE MANAGEMENT SYSTEM</h1>
          <p>Create Your Account</p>
        </div>
        
        <form onSubmit={submit} className="register-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Create a password"
              required
              minLength="6"
            />
          </div>

          <div className="input-group">
            <label>I am a</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                Student
              </label>
              <label>
                <input
                  type="radio"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                Teacher
              </label>
            </div>
          </div>

          {formData.role === 'student' && (
            <>
              <div className="input-group">
                <label>Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g., JS240504"
                />
              </div>

              <div className="input-group">
                <label>Course</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g., BE in Information Science & Engineering"
                />
              </div>

              <div className="input-group">
                <label>Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="e.g., BEIS-3"
                />
              </div>
            </>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
          {error && (
            <div style={{ color: 'red', marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <button onClick={() => setShowLogin(true)} className="link-btn">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

