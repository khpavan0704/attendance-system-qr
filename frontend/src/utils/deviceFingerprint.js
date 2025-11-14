// Device fingerprinting utility for security
// Generates a unique fingerprint based on browser/device characteristics

export function generateDeviceFingerprint() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 'nofp';
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px "Arial"';
  ctx.fillText('Device fingerprint', 2, 2);

  const scr = window.screen || {};
  const nav = window.navigator || {};

  const fingerprint = {
    // Screen properties
    screenResolution: `${scr.width || 0}x${scr.height || 0}`,
    screenColorDepth: scr.colorDepth || 0,

    // Browser properties
    userAgent: nav.userAgent || '',
    language: nav.language || '',
    platform: nav.platform || '',
    cookieEnabled: !!nav.cookieEnabled,
    doNotTrack: nav.doNotTrack || 'unknown',

    // Canvas fingerprint (unique rendering characteristics)
    canvasFingerprint: canvas.toDataURL(),

    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    // Hardware
    hardwareConcurrency: nav.hardwareConcurrency || 'unknown',
    deviceMemory: nav.deviceMemory || 'unknown',
  };

  const fingerprintString = JSON.stringify(fingerprint);

  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  const stableFingerprint =
    Math.abs(hash).toString(16) + '_' +
    fingerprint.screenResolution + '_' +
    (fingerprint.platform || '').substring(0, 10);

  return stableFingerprint.substring(0, 64);
}
