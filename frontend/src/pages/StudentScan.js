import React, {useEffect, useState, useRef} from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint';
import { API_BASE } from '../config';
import './QRScanner.css';

export default function StudentScan({user}){
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef(null);

  useEffect(()=>{
    if (scanMode !== 'camera') {
      // stop camera if switching away
      if (scannerRef.current) {
        const currentScanner = scannerRef.current;
        scannerRef.current = null;
        currentScanner.clear().catch((e) => {
          console.warn("Scanner already cleared:", e?.message || e);
        });
      }
      setError(null);
      return;
    }

    // Clear any previous error
    setError(null);

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.");
      return;
    }

    // Check if we're on HTTPS or localhost (required for camera access)
    const isSecureContext = window.isSecureContext || 
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.startsWith('172.');

    if (!isSecureContext) {
      setError("Camera access requires HTTPS. Please access this site via HTTPS or use a local network address.");
      return;
    }

    // Adjust QR box size based on screen size
    const qrboxSize = window.innerWidth < 480 ? 200 : 250;
    
    // Mobile-friendly camera configuration
    const config = { 
      fps: 10, 
      qrbox: qrboxSize,
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      // Try environment (back camera) first, fallback to user (front camera)
      supportedScanTypes: ["environment", "user"]
    };

    const scanner = new Html5QrcodeScanner('reader', config);
    scannerRef.current = scanner;
    
    const onScanSuccess = async (decodedText) => {
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
            scanner.clear().catch(() => {});
          }
        } catch (err) {
          alert('Failed to mark attendance: ' + (err.response?.data?.error || err.message));
        }
      }, ()=> alert('Enable GPS to mark attendance'));
    };

    const onScanError = (errorMessage) => {
      // Don't show error for every scan failure, only for camera initialization errors
      if (errorMessage.includes("NotReadableError") || 
          errorMessage.includes("Could not start video source") ||
          errorMessage.includes("Permission denied") ||
          errorMessage.includes("NotFoundError")) {
        let userFriendlyMessage = "Camera error: ";
        
        if (errorMessage.includes("NotReadableError") || errorMessage.includes("Could not start video source")) {
          userFriendlyMessage += "Camera is already in use by another app. Please close other apps using the camera and try again.";
        } else if (errorMessage.includes("Permission denied")) {
          userFriendlyMessage += "Camera permission was denied. Please allow camera access in your browser settings.";
        } else if (errorMessage.includes("NotFoundError")) {
          userFriendlyMessage += "No camera found on this device.";
        } else {
          userFriendlyMessage += errorMessage;
        }
        
        setError(userFriendlyMessage);
        
        // Clear the scanner on error
        scanner.clear().catch((e) => console.warn("Scanner already cleared (error handler):", e));
      }
    };

    try {
      scanner.render(onScanSuccess, onScanError);
    } catch (err) {
      setError("Failed to initialize camera: " + err.message);
    }
    
    return () => {
      if (scannerRef.current) {
        const currentScanner = scannerRef.current;
        scannerRef.current = null;
        currentScanner.clear().catch((e) => console.warn("Scanner already stopped:", e));
      }
    };
  },[user, isRetrying, scanMode]);

  const handleManualSubmit = async () => {
    if (!manualToken.trim()) {
      setError('Please enter the token shown by your teacher.');
      return;
    }

    setError(null);
    const token = manualToken.trim();

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const device_fingerprint = generateDeviceFingerprint();
      try {
        const res = await axios.post(`${API_BASE}/api/attendance-token`, {
          student_id: user.id,
          token,
          latitude,
          longitude,
          device_fingerprint
        });
        if (res.data.error) {
          setError('Error: ' + res.data.error);
        } else {
          alert(res.data.message || 'Attendance marked successfully!');
          setManualToken('');
        }
      } catch (err) {
        setError('Failed to mark attendance: ' + (err.response?.data?.error || err.message));
      }
    }, () => setError('Enable GPS to mark attendance'));
  };

  const handleRetry = () => {
    setIsRetrying(!isRetrying);
    setError(null);
  };

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <h2>Mark Attendance</h2>
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => {
              setScanMode('camera');
              setError(null);
              setManualToken('');
              setIsRetrying(prev => !prev); // retrigger effect
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: scanMode === 'camera' ? '#4CAF50' : '#e0e0e0',
              color: scanMode === 'camera' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: scanMode === 'camera' ? 'bold' : 'normal'
            }}
          >
            📷 Scan QR Code
          </button>
          <button
            onClick={() => {
              setScanMode('manual');
              setError(null);
              if (scannerRef.current) {
                const currentScanner = scannerRef.current;
                scannerRef.current = null;
                currentScanner.clear().catch((e) => console.warn("Scanner already cleared:", e));
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: scanMode === 'manual' ? '#4CAF50' : '#e0e0e0',
              color: scanMode === 'manual' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: scanMode === 'manual' ? 'bold' : 'normal'
            }}
          >
            ⌨️ Enter Token
          </button>
        </div>
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196F3',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '15px',
          fontSize: '13px',
          color: '#1565c0'
        }}>
          <strong>⚠️ Important:</strong> You must be physically present in the classroom. GPS and device verification are required.
        </div>
        {scanMode === 'camera' ? (
        <p>
          Point your camera at the QR code displayed in class. Your location and device information will be verified for security.
        </p>
        ) : (
          <p>
            Enter the token shown by your teacher (it refreshes every few seconds). GPS checks still ensure you are in class.
          </p>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '15px',
          margin: '15px 0',
          color: '#c33'
        }}>
          <strong>Error:</strong> {error}
          {scanMode === 'camera' ? (
            <button 
              onClick={handleRetry}
              style={{
                display: 'block',
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry Camera
            </button>
          ) : (
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#a33' }}>
              Double-check the token text and try again.
            </p>
          )}
        </div>
      )}

      {scanMode === 'camera' && (
      <div className="qr-reader-wrapper">
        <div id="reader"></div>
      </div>
      )}

      {scanMode === 'manual' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
          margin: '20px auto',
          textAlign: 'center'
        }}>
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Enter token (e.g., CLASS-123-4567890)"
            style={{
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              textAlign: 'center'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualSubmit();
              }
            }}
          />
          <button
            onClick={handleManualSubmit}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Submit Token
          </button>
          <p style={{ color: '#666', fontSize: '13px' }}>
            💡 Tip: The token appears under the QR code on the projector. It changes every few seconds.
          </p>
        </div>
      )}
    </div>
  )
}
