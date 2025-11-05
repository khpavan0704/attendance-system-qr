import React, {useEffect} from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint';
import { API_BASE } from '../config';
import './QRScanner.css';

export default function StudentScan({user}){
  useEffect(()=>{
    // Adjust QR box size based on screen size
    const qrboxSize = window.innerWidth < 480 ? 200 : 250;
    const scanner = new Html5QrcodeScanner('reader',{ 
      fps: 10, 
      qrbox: qrboxSize,
      aspectRatio: 1.0
    });
    scanner.render(async (decodedText)=>{
      const token = decodedText; // rotating QR token from teacher's screen
      navigator.geolocation.getCurrentPosition(async (pos)=>{
        const {latitude, longitude} = pos.coords;
        const device_fingerprint = generateDeviceFingerprint();
        try {
          const res = await axios.post(`${API_BASE}/api/attendance-token`,{
            student_id: user.id, 
            token, 
            latitude, 
            longitude,
            device_fingerprint
          });
          if (res.data.error) {
            alert('Error: ' + res.data.error);
          } else {
            alert(res.data.message || 'Attendance marked successfully!');
            scanner.clear();
          }
        } catch (err) {
          alert('Failed to mark attendance: ' + (err.response?.data?.error || err.message));
        }
      }, ()=> alert('Enable GPS to mark attendance'));
    });
    
    return () => {
      scanner.clear();
    };
  },[user]);
  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <h2>Scan QR Code</h2>
        <p>
          Point your camera at the QR code displayed in class. Your location and device information will be verified for security.
        </p>
      </div>
      <div className="qr-reader-wrapper">
        <div id="reader"></div>
      </div>
    </div>
  )
}
