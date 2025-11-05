import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import './Login.css';

export default function Login({ setUser, setShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/login`, { email, password });
      setUser(res.data.user);
    } catch (err) {
      let errorMessage = 'Login failed: ';
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = `Cannot connect to server. Please make sure the backend server is running on ${API_BASE}`;
      } else if (err.response?.data?.error) {
        errorMessage = 'Login failed: ' + err.response.data.error;
      } else {
        errorMessage = 'Login failed: ' + err.message;
      }
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>ATTENDANCE MANAGEMENT SYSTEM</h1>
          <p>Welcome Back</p>
        </div>

        <form onSubmit={submit} className="login-form">
          <div className="input-group">
            <label>Email / User ID</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
          {error && (
            <div style={{ color: 'red', marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button onClick={() => setShowRegister(true)} className="link-btn">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
