import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './utils/registerServiceWorker';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Register service worker for PWA
registerServiceWorker();
