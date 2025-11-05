import React, { useState, useEffect } from 'react';
import { isPWA, showInstallPrompt, listenForInstallPrompt, setInstallPrompt } from '../utils/registerServiceWorker';
import './InstallPrompt.css';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isPWA()) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    listenForInstallPrompt();
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowPrompt(true);
    });

    // Check if prompt was dismissed before
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      // Don't show if dismissed within last 7 days
      setShowPrompt(false);
    }
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setShowPrompt(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h3>Install Attendance App</h3>
          <p>Add to home screen for quick access and better experience!</p>
        </div>
        <div className="install-actions">
          <button onClick={handleInstall} className="install-btn">
            Install
          </button>
          <button onClick={handleDismiss} className="dismiss-btn">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

