import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
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
    </>
  );
}
