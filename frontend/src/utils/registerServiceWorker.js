// Register service worker for PWA functionality
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const base = (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) || '';
    const swUrl = `${base}/sw.js`;

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('SW registered: ', registration);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content available; please refresh.');
                if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                  if (window.confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              } else {
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

export function isPWA() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

let deferredPrompt;

export function setInstallPrompt(prompt) { deferredPrompt = prompt; }

export async function showInstallPrompt() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === 'accepted';
}

export function listenForInstallPrompt() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setInstallPrompt(e);
    console.log('Install prompt available');
    return false;
  });
}
