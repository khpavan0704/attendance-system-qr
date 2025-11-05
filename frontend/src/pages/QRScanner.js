import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint';
import './QRScanner.css';
import { API_BASE } from '../config';

export default function QRScanner({ user }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    // Adjust QR box size based on screen size for better mobile experience
    const qrboxSize = window.innerWidth < 480 ? 200 : 250;
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: qrboxSize,
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        const token = decodedText; // QR code should contain the rotating token from teacher's screen
        try {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              const device_fingerprint = generateDeviceFingerprint();
              try {
                // Use the secure token-based endpoint (same as StudentScan.js)
                const res = await axios.post(`${API_BASE}/api/attendance-token`, {
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
                  // Stop scanner after successful scan
                  scanner.clear();
                }
              } catch (err) {
                alert('Failed to mark attendance: ' + (err.response?.data?.error || err.message));
              }
            },
            () => {
              alert('Enable GPS to mark attendance');
            }
          );
        } catch (err) {
          alert('Failed to mark attendance: ' + err.message);
        }
      },
      (errorMessage) => {
        // Handle scan errors silently or log them
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [user]);

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
  );
}

