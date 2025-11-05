// Register service worker for PWA functionality
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/sw.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('SW registered: ', registration);

          // Check for updates periodically
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available, prompt user to refresh
                  console.log(
                    'New content available; please refresh.'
                  );
                  // Optional: Show update notification
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                } else {
                  // Content cached for offline use
                  console.log('Content cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('SW registration failed: ', error);
        });
    });
  }
}

// Check if app is running as PWA (installed)
export function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// Install prompt handler
let deferredPrompt;

export function setInstallPrompt(prompt) {
  deferredPrompt = prompt;
}

export async function showInstallPrompt() {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

// Listen for install prompt
export function listenForInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setInstallPrompt(e);
    // Optional: Show custom install button
    console.log('Install prompt available');
    return false;
  });
}

