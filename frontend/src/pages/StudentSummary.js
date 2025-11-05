import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

export default function StudentSummary({ user }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await axios.get(`${API_BASE}/api/student/attendance?student_id=${user.id}`);
        setStats(r.data.statistics || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  if (loading) {
    return <div style={{color:'#666'}}>Loading summary...</div>;
  }

  if (!stats.length) {
    return <div style={{color:'#666'}}>No attendance yet. Start scanning to see your stats.</div>;
  }

  return (
    <div className="stats-grid">
      {stats.map(s => (
        <div key={s.class_id} className="stat-card">
          <div className="stat-header">
            <h3>{s.class_name}</h3>
            <span className={`percentage ${s.percentage >= 75 ? 'good' : s.percentage >= 60 ? 'warning' : 'low'}`}>{s.percentage}%</span>
          </div>
          <div className="stat-details">
            <div className="stat-item"><span className="stat-label">Present</span><span className="stat-value present">{s.present}</span></div>
            <div className="stat-item"><span className="stat-label">Absent</span><span className="stat-value absent">{s.absent}</span></div>
            <div className="stat-item"><span className="stat-label">Total</span><span className="stat-value">{s.total}</span></div>
          </div>
          <div className="stat-progress"><div className="progress-bar" style={{width: `${s.percentage}%`}}></div></div>
        </div>
      ))}
    </div>
  );
}


