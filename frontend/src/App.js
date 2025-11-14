import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InstallPrompt from './components/InstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // Suppress React error overlay for camera errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const errorStr = args.join(' ');
      if (errorStr.includes('NotReadableError') || 
          errorStr.includes('Could not start video source') ||
          errorStr.includes('getUserMedia')) {
        // Suppress React error overlay for camera errors
        return;
      }
      originalError.apply(console, args);
    };

    // Global error handler to prevent React error overlay
    const handleError = (event) => {
      if (event.error && (
        event.error.message?.includes('NotReadableError') ||
        event.error.message?.includes('Could not start video source') ||
        event.error.name === 'NotReadableError'
      )) {
        event.preventDefault();
        event.stopPropagation();
        // Error will be handled by ErrorBoundary
      }
    };

    window.addEventListener('error', handleError, true);
    
    return () => {
      console.error = originalError;
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  return (
    <ErrorBoundary>
      {!user ? (
        showRegister ? (
          <Register setShowLogin={() => setShowRegister(false)} />
        ) : (
          <Login setUser={setUser} setShowRegister={setShowRegister} />
        )
      ) : (
        <Dashboard user={user} setUser={setUser} />
      )}
      <InstallPrompt />
    </ErrorBoundary>
  );
}
