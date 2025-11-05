import React, {useEffect, useState} from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { API_BASE } from '../config';

export default function TeacherPage({user}){
  const [sessionId,setSessionId]=useState(null);
  const [token,setToken]=useState('');
  const [classId,setClassId]=useState(1);
  const generate = async () => {
    const c = 'CLASS'+classId+'-'+Date.now();
    const res = await axios.post(`${API_BASE}/api/create-session`,{class_id:classId, qr_code:c});
    setSessionId(res.data.session_id);
  }
  const viewReport = async () => {
    const r = await axios.get(`${API_BASE}/api/report/${classId}`);
    window.open('about:blank').document.write('<pre>'+JSON.stringify(r.data, null, 2)+'</pre>');
  }

  const saveClassLocation = async () => {
    if(!classId) return alert('Enter class id');
    if(!('geolocation' in navigator)) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const { latitude, longitude } = pos.coords;
      await axios.post(`${API_BASE}/api/classes/${classId}/location`, { latitude, longitude });
      alert('Classroom location saved');
    }, ()=> alert('Please enable location permissions'));
  }

  // Poll rotating token when a session is active
  useEffect(()=>{
    if(!sessionId) return;
    let timer = null;
    const fetchToken = async () => {
      try{
        const r = await axios.get(`${API_BASE}/api/qr/${sessionId}/current`);
        setToken(r.data.token);
        // refresh a bit faster than server window size
        const ws = (r.data.window_seconds || 15);
        timer = setTimeout(fetchToken, Math.max(3000, ws * 800));
      }catch(e){ /* ignore transient errors */ }
    };
    fetchToken();
    return ()=> { if(timer) clearTimeout(timer); };
  },[sessionId]);
  return (
    <div style={{padding:20}}>
      <h2>Teacher: {user.name}</h2>
      <div>
        <label>Class ID: </label>
        <input value={classId} onChange={e=>setClassId(e.target.value)} />
        <button onClick={saveClassLocation}>Save Class Location</button>
        <button onClick={generate}>Generate QR</button>
        <button onClick={viewReport}>View Report</button>
      </div>
      {sessionId && token && <div style={{marginTop:20}}>
        <h3>Show this on Projector</h3>
        <QRCode value={token} />
        <p style={{fontFamily:'monospace'}}>{token}</p>
      </div>}
    </div>
  )
}
