// Device fingerprinting utility for security
// Generates a unique fingerprint based on browser/device characteristics

export function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px "Arial"';
  ctx.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = {
    // Screen properties
    screenResolution: `${screen.width}x${screen.height}`,
    screenColorDepth: screen.colorDepth,
    
    // Browser properties
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || 'unknown',
    
    // Canvas fingerprint (unique rendering characteristics)
    canvasFingerprint: canvas.toDataURL(),
    
    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    
    // Hardware concurrency
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    
    // Device memory (if available)
    deviceMemory: navigator.deviceMemory || 'unknown',
  };
  
  // Create a hash of the fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  
  // Simple hash function (for better performance, you could use crypto.subtle in production)
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Also include a timestamp component to make it more unique (but stable for same device)
  const stableFingerprint = Math.abs(hash).toString(16) + '_' + 
    fingerprint.screenResolution + '_' + 
    fingerprint.platform.substring(0, 10);
  
  return stableFingerprint.substring(0, 64); // Limit length
}

