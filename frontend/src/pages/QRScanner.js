import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint';
import './QRScanner.css';
import { API_BASE } from '../config';

export default function QRScanner({ user }) {
  const html5QrCodeRef = useRef(null);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [manualToken, setManualToken] = useState('');
  const cameraRunningRef = useRef(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const isSwitchingCameraRef = useRef(false);

  const stopCameraSafely = async (updateState = true) => {
    if (html5QrCodeRef.current && cameraRunningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.warn("Camera stop warning:", e?.message || e);
      }
      try {
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Camera clear warning:", e?.message || e);
      }
      html5QrCodeRef.current = null;
      cameraRunningRef.current = false;
      if (updateState) {
        setIsScanning(false);
      }
    }
  };

  useEffect(() => {
    // Only initialize camera if scanMode is 'camera'
    if (scanMode !== 'camera') {
        return;
      }

    let isMounted = true;
    
    // Define handleCameraError first
    const handleCameraError = (errorMessage) => {
      if (!isMounted) return;
      
      let userFriendlyMessage = "Camera error: ";
      
      if (errorMessage.includes("NotReadableError") || errorMessage.includes("Could not start video source")) {
        userFriendlyMessage += "Camera is already in use by another app. Please close other apps using the camera and try again.";
      } else if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        userFriendlyMessage += "Camera permission was denied. Please allow camera access in your browser settings and refresh the page.";
      } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("no camera")) {
        userFriendlyMessage += "No camera found on this device.";
      } else {
        userFriendlyMessage += errorMessage;
      }
      
      setError(userFriendlyMessage);
      setIsScanning(false);
    cameraRunningRef.current = false;
    };
    
    // Global error handler to catch unhandled errors
    const globalErrorHandler = (event) => {
      if (event.error && (
        event.error.message?.includes("NotReadableError") ||
        event.error.message?.includes("Could not start video source") ||
        event.error.message?.includes("userMedia") ||
        event.error.name === "NotReadableError"
      )) {
        event.preventDefault();
        if (isMounted) {
          handleCameraError(event.error.message || "Camera error: Could not start video source. Please close other apps using the camera.");
        }
      }
    };

    // Add global error listener
    window.addEventListener('error', globalErrorHandler);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && (
        event.reason.message?.includes("NotReadableError") ||
        event.reason.message?.includes("Could not start video source") ||
        event.reason.message?.includes("userMedia")
      )) {
        event.preventDefault();
        if (isMounted) {
          handleCameraError(event.reason.message || "Camera error: Could not start video source.");
        }
      }
    });

    const handleScanSuccess = async (token, scanner) => {
      if (!isMounted) return;
      
      try {
        // Stop scanning temporarily
        await scanner.stop();
        setIsScanning(false);
        cameraRunningRef.current = false;

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
            if (!isMounted) return;
            
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
              alert("Error: " + res.data.error);
            } else {
              alert(res.data.message || "Attendance marked successfully!");
              }
              
              // Restart scanner
              if (isMounted) {
                startScanner();
            }
          } catch (err) {
            alert("Failed to mark attendance: " + (err.response?.data?.error || err.message));
              // Restart scanner
              if (isMounted) {
                startScanner();
              }
          }
        },
        () => {
          alert("Enable GPS to mark attendance.");
            // Restart scanner
            if (isMounted) {
              startScanner();
            }
        }
      );
      } catch (e) {
        console.error("Error handling scan:", e);
        if (isMounted) {
          startScanner();
        }
      }
    };

    const startScanner = async () => {
      if (!isMounted) return;
      
      // Clear any previous error
      setError(null);

      // Check secure context first - camera requires HTTPS or localhost
      const isSecureContext = window.isSecureContext || 
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.startsWith('172.') ||
        window.location.hostname.includes('ngrok');

      if (!isSecureContext) {
        const errorMsg = "Camera requires a secure connection. Please use:\n- localhost (http://localhost:3000)\n- HTTPS (https://...)\n- Local network IP (http://192.168.x.x:3000)";
        console.error("Not a secure context:", errorMsg);
        setError(errorMsg);
        return;
      }

      // Check if getUserMedia is supported - Chrome and all modern browsers support this
      // More robust check - Chrome always has navigator.mediaDevices in secure context
      const hasModernAPI = !!(navigator.mediaDevices && 
                          typeof navigator.mediaDevices.getUserMedia === 'function');
      
      // Legacy API checks (for older browsers)
      const hasLegacyAPI = !!(navigator.getUserMedia && typeof navigator.getUserMedia === 'function') || 
                          !!(navigator.webkitGetUserMedia && typeof navigator.webkitGetUserMedia === 'function') || 
                          !!(navigator.mozGetUserMedia && typeof navigator.mozGetUserMedia === 'function') || 
                          !!(navigator.msGetUserMedia && typeof navigator.msGetUserMedia === 'function');

      // Additional check: navigator.mediaDevices might exist but getUserMedia might be undefined
      // This can happen in some edge cases
      const hasMediaDevices = !!(navigator.mediaDevices !== undefined && navigator.mediaDevices !== null);

      // Debug logging with more details
      const debugInfo = {
        hasModernAPI: !!hasModernAPI,
        hasLegacyAPI: !!hasLegacyAPI,
        hasMediaDevices: !!hasMediaDevices,
        mediaDevicesExists: !!navigator.mediaDevices,
        getUserMediaType: typeof (navigator.mediaDevices?.getUserMedia),
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        isSecureContext: window.isSecureContext,
        fullUrl: window.location.href
      };
      console.log("Camera API Check:", debugInfo);
      
      // If mediaDevices doesn't exist, it's definitely not a secure context
      if (!navigator.mediaDevices) {
        const currentUrl = window.location.href;
        const hostname = window.location.hostname;
        
        let errorMsg = "📷 Camera requires a secure connection!\n\n";
        errorMsg += `Current URL: ${currentUrl}\n\n`;
        errorMsg += "🔧 Solutions:\n\n";
        
        // Check if it's a local network IP
        if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) {
          errorMsg += "1. ✅ Use localhost (if on same computer):\n";
          errorMsg += "   http://localhost:3000\n\n";
          errorMsg += "2. ✅ Use ngrok for HTTPS (for mobile/remote):\n";
          errorMsg += "   See: NGROK_SETUP_GUIDE.md\n\n";
          errorMsg += "3. ✅ Use manual token entry (no camera needed):\n";
          errorMsg += "   Click '⌨️ Enter Token' button\n\n";
        } else {
          errorMsg += "1. ✅ Use localhost: http://localhost:3000\n";
          errorMsg += "2. ✅ Use HTTPS: https://your-domain.com\n";
          errorMsg += "3. ✅ Use ngrok: See NGROK_SETUP_GUIDE.md\n\n";
        }
        
        errorMsg += "💡 Tip: Manual token entry works without camera!";
        
        console.error("mediaDevices not available - not a secure context:", errorMsg, debugInfo);
        setError(errorMsg);
        return;
      }

      // If neither modern nor legacy API exists, check if we should still try
      // Chrome and modern browsers always have mediaDevices, even if getUserMedia check fails
      if (!hasModernAPI && !hasLegacyAPI) {
        // If mediaDevices exists, try anyway - sometimes the check fails but API works
        if (hasMediaDevices || navigator.mediaDevices) {
          console.log("mediaDevices exists - will attempt to use camera despite check failure");
          console.log("This is normal - proceeding with camera access attempt...");
          // Don't return - try to use it anyway
        } else {
          // Only show error if mediaDevices doesn't exist at all
          const errorMsg = "Camera access is not supported in this browser. Please use Chrome, Firefox, Safari, or Edge (latest version).";
          console.error("Camera not supported - no mediaDevices found:", errorMsg, debugInfo);
          setError(errorMsg);
          return;
        }
      }

      // Create a wrapper function for getUserMedia that works with all browsers
      const requestUserMedia = async (constraints) => {
        // Modern browsers (Chrome, Firefox, Safari, Edge)
        // Check again at call time - sometimes it becomes available
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          console.log("Using modern getUserMedia API");
          return navigator.mediaDevices.getUserMedia(constraints);
        }
        
        // Try to access it directly (might work even if check failed)
        // Sometimes the function exists but typeof check fails
        try {
          if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
            console.log("Using navigator.mediaDevices.getUserMedia (direct - property check)");
            return navigator.mediaDevices.getUserMedia(constraints);
          }
        } catch (e) {
          console.warn("Direct access failed, trying next method:", e);
        }
        
        // Legacy browsers - wrap in Promise
        const legacyGetUserMedia = navigator.getUserMedia || 
                                  navigator.webkitGetUserMedia || 
                                  navigator.mozGetUserMedia || 
                                  navigator.msGetUserMedia;
        
        if (legacyGetUserMedia && typeof legacyGetUserMedia === 'function') {
          console.log("Using legacy getUserMedia API");
          return new Promise((resolve, reject) => {
            legacyGetUserMedia.call(navigator, constraints, resolve, reject);
          });
        }
        
        // Last resort: try to use mediaDevices even if check failed
        if (navigator.mediaDevices) {
          console.log("Attempting to use mediaDevices despite check failure");
          try {
            return await navigator.mediaDevices.getUserMedia(constraints);
          } catch (e) {
            console.error("Direct mediaDevices.getUserMedia failed:", e);
          }
        }
        
        throw new Error("getUserMedia not supported - no API available");
      };

      // Secure context already checked above - no need to check again

      // Clean up any existing scanner
      if (html5QrCodeRef.current) {
        await stopCameraSafely();
      }

      const qrboxSize = window.innerWidth < 480 ? 220 : 280;
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      // Detect if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       (window.innerWidth <= 768 && window.innerHeight <= 1024);

      try {
        // Step 1: Request camera permission explicitly first
        // For mobile: prioritize back camera (environment)
        // For laptop/desktop: use any available camera
        console.log("Starting camera permission request...", { isMobile });
        try {
          let stream;
          if (isMobile) {
            // Mobile: Try back camera first (environment), then any camera
            try {
              stream = await requestUserMedia({ 
                video: { facingMode: "environment" } 
              });
            } catch (envErr) {
              // If environment fails, try any camera
              try {
                stream = await requestUserMedia({ 
                  video: true 
                });
              } catch (anyErr) {
                // Last resort: try basic video constraint
                stream = await requestUserMedia({ 
                  video: {} 
                });
              }
            }
          } else {
            // Desktop/Laptop: Try any camera first
            try {
              stream = await requestUserMedia({ 
                video: true 
              });
            } catch (err) {
              // If that fails, try environment facing
              try {
                stream = await requestUserMedia({ 
                  video: { facingMode: "environment" } 
                });
              } catch (envErr) {
                // Last resort: try basic video constraint
                stream = await requestUserMedia({ 
                  video: {} 
                });
              }
            }
          }
          // Stop the test stream immediately after getting permission
          if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => track.stop());
          }
        } catch (permErr) {
          if (isMounted) {
            console.error("Camera permission error:", permErr);
            if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
              handleCameraError("Camera permission was denied. Please click 'Allow' when your browser asks for camera permission, then refresh the page.");
            } else if (permErr.name === "NotFoundError" || permErr.name === "DevicesNotFoundError") {
              handleCameraError("No camera found on this device. Please connect a camera and try again.");
            } else if (permErr.name === "NotReadableError" || permErr.name === "TrackStartError") {
              handleCameraError("Camera is already in use by another app. Please close other apps using the camera and try again.");
            } else {
              handleCameraError(`Camera access error: ${permErr.message || permErr.name}. Please check your camera permissions in browser settings.`);
            }
            return;
          }
        }

        // Step 2: Get available cameras
        let cameraId = null;
        let selectedIndex = currentCameraIndex; // Use current index if switching cameras
        let devices = [];
        try {
          // Try to get cameras - this might fail on some browsers
          try {
            devices = await Html5Qrcode.getCameras();
          } catch (camErr) {
            console.warn("Could not enumerate cameras, will use default:", camErr);
            devices = []; // Empty array, will use default camera
          }
          
          if (devices && devices.length > 0) {
            // Store available cameras for switching
            if (isMounted) {
              setAvailableCameras(devices);
            }
            
            // If we're switching cameras and have a valid index, use it
            // Otherwise, prefer back camera on mobile, or first camera on laptop
            if (isSwitchingCameraRef.current && currentCameraIndex >= 0 && currentCameraIndex < devices.length) {
              // We're switching cameras - use the selected index
              selectedIndex = currentCameraIndex;
              isSwitchingCameraRef.current = false; // Reset flag
            } else {
              // First time or reset - select best camera
              // For mobile: prefer back camera (environment)
              // For laptop/desktop: use any available camera (usually front-facing is fine)
              const backCameraIndex = devices.findIndex(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('environment')
              );
              
              // If back camera found, use it; otherwise use first camera
              selectedIndex = backCameraIndex >= 0 ? backCameraIndex : 0;
            }
            
            cameraId = devices[selectedIndex].id;
            
            if (isMounted) {
              setCurrentCameraIndex(selectedIndex);
            }
          }
        } catch (e) {
          console.log("Could not enumerate cameras, using default:", e);
        }

        // Step 3: Mobile-friendly camera configuration
        const config = {
          fps: isMobile ? 5 : 10, // Lower FPS on mobile for better performance
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        // Step 4: Start the scanner with comprehensive error handling
        try {
          // Add delay to ensure camera is ready (longer for mobile)
          await new Promise(resolve => setTimeout(resolve, isMobile ? 800 : 500));
          
          // Use cameraId if available, otherwise use appropriate fallback
          let cameraConfig;
          if (cameraId) {
            cameraConfig = cameraId;
          } else if (devices && devices.length > 0) {
            cameraConfig = devices[0].id;
          } else if (isMobile) {
            // Mobile: prefer back camera
            cameraConfig = { facingMode: "environment" };
          } else {
            // Desktop/Laptop: use front camera (user facing)
            cameraConfig = { facingMode: "user" };
          }
          
          await html5QrCode.start(
            cameraConfig,
            config,
            (decodedText) => {
              // Success callback
              if (isMounted) {
                const token = decodedText;
                handleScanSuccess(token, html5QrCode);
              }
            },
            (errorMessage) => {
              // Error callback - catch all camera-related errors
              if (isMounted) {
                const errorStr = errorMessage?.toString() || String(errorMessage) || '';
                if (errorStr.includes("NotReadableError") || 
                    errorStr.includes("Could not start video source") ||
                    errorStr.includes("Permission denied") ||
                    errorStr.includes("NotFoundError") ||
                    errorStr.includes("NotAllowedError") ||
                    errorStr.includes("TrackStartError") ||
                    errorStr.includes("DevicesNotFoundError") ||
                    errorStr.includes("getUserMedia")) {
                  handleCameraError(errorStr);
                }
              }
            }
          ).catch((err) => {
            // Additional catch for promise rejection
            if (isMounted) {
              console.error("Camera start error:", err);
              const errorStr = err?.message || err?.toString() || String(err);
              if (errorStr.includes("NotReadableError") || errorStr.includes("Could not start video source")) {
                handleCameraError("Camera is already in use by another app. Please close other apps using the camera and try again.");
              } else if (errorStr.includes("NotAllowedError") || errorStr.includes("Permission denied")) {
                handleCameraError("Camera permission was denied. Please allow camera access in your browser settings and refresh the page.");
              } else if (errorStr.includes("NotFoundError")) {
                handleCameraError("No camera found. Please check your device has a camera and try again.");
              } else {
                handleCameraError(`Camera error: ${errorStr}. Please try refreshing the page or use manual token entry.`);
              }
            }
          });
          
          if (isMounted) {
            cameraRunningRef.current = true;
            setIsScanning(true);
          }
        } catch (startErr) {
          // Catch any errors during start()
          if (isMounted) {
            console.error("Camera initialization error:", startErr);
            const errorStr = startErr?.message || startErr?.toString() || String(startErr);
            if (errorStr.includes("NotReadableError") || errorStr.includes("Could not start video source")) {
              handleCameraError("Camera is already in use by another app. Please close other apps using the camera and try again.");
            } else if (errorStr.includes("Permission denied") || errorStr.includes("NotAllowedError")) {
              handleCameraError("Camera permission was denied. Please allow camera access in your browser settings and refresh the page.");
            } else if (errorStr.includes("NotFoundError")) {
              handleCameraError("No camera found on this device. Please check your device has a camera.");
            } else {
              handleCameraError(`Failed to start camera: ${errorStr}. Please try refreshing the page or use manual token entry.`);
            }
          }
        }
      } catch (err) {
        // Final catch-all for any unexpected errors
        if (isMounted) {
          const errorStr = err.message || err.toString();
          handleCameraError(`Camera initialization error: ${errorStr}`);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      // Remove global error listeners
      window.removeEventListener('error', globalErrorHandler);
      stopCameraSafely(false);
    };
  }, [user, isRetrying, scanMode, currentCameraIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = async () => {
    setError(null);
    
    await stopCameraSafely();
    // Small delay to ensure cleanup is complete, then trigger retry
    setTimeout(() => {
      setIsRetrying(prev => !prev);
    }, 500);
  };

  const handleSwitchCamera = async () => {
    if (availableCameras.length <= 1) {
      setError('Only one camera is available on this device.');
      return;
    }

    setIsSwitchingCamera(true);
    setError(null);
    isSwitchingCameraRef.current = true; // Set flag for camera switching
    
    // Stop current camera
    await stopCameraSafely(false);
    
    // Switch to next camera
    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);
    
    // Small delay before restarting
    setTimeout(() => {
      setIsRetrying(prev => !prev);
      setIsSwitchingCamera(false);
    }, 500);
  };

  const handleManualSubmit = async () => {
    if (!manualToken.trim()) {
      setError('Please enter the token');
      return;
      }

    setError(null);
    const token = manualToken.trim();
    
    // Use the same success handler as camera scan
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
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
            setError("Error: " + res.data.error);
          } else {
            alert(res.data.message || "Attendance marked successfully!");
            setManualToken(''); // Clear input
          }
        } catch (err) {
          setError("Failed to mark attendance: " + (err.response?.data?.error || err.message));
        }
      },
      () => {
        setError("Enable GPS to mark attendance.");
      }
    );
  };

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-header">
        <h2>Mark Attendance</h2>
        
        {/* Mode Toggle */}
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
              if (!cameraRunningRef.current) {
                setIsRetrying(prev => !prev);
              }
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
            onClick={async () => {
              setScanMode('manual');
              setError(null);
              await stopCameraSafely();
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
          <strong>⚠️ Important:</strong> You must be physically present in the classroom to mark attendance. 
          GPS location verification is required. Remote attendance is blocked.
        </div>

        {scanMode === 'camera' ? (
          <div>
            <p style={{ marginBottom: '10px' }}>
          Point your camera at the QR code displayed in class. Your location and device information will be verified.
        </p>
            {!isScanning && !error && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '15px',
                fontSize: '13px',
                color: '#856404'
              }}>
                <strong>📷 Camera Permission:</strong> Your browser will ask for camera permission. Please click <strong>"Allow"</strong> to enable QR code scanning.
              </div>
            )}
            {availableCameras.length > 1 && (
              <button
                onClick={handleSwitchCamera}
                disabled={isSwitchingCamera}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isSwitchingCamera ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSwitchingCamera ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  marginTop: '10px'
                }}
              >
                {isSwitchingCamera ? '🔄 Switching...' : '🔄 Switch Camera'}
              </button>
            )}
            {availableCameras.length > 0 && (
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Using: {availableCameras[currentCameraIndex]?.label || 'Camera ' + (currentCameraIndex + 1)}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '15px' }}>
              Enter the token shown by your teacher on the projector screen.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Enter token here (e.g., CLASS-123-4567890)"
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
            </div>
          </div>
        )}
      </div>

      {scanMode === 'camera' && !isScanning && !error && (
        <div style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '8px',
          padding: '15px',
          margin: '15px 0',
          color: '#1565c0',
          textAlign: 'center'
        }}>
          Initializing camera...
        </div>
      )}

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
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '10px'
              }}
            >
              Retry Camera
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {scanMode === 'camera' && (
      <div className="qr-reader-wrapper">
        <div id="reader"></div>
      </div>
      )}
      
      {scanMode === 'manual' && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            💡 <strong>Tip:</strong> Look at the projector screen for the token text below the QR code.
            Type it exactly as shown (including dashes and numbers).
          </p>
        </div>
      )}
    </div>
  );
}
