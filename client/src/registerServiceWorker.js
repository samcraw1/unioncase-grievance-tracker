import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    // Show update notification when new service worker is waiting
    wb.addEventListener('waiting', (event) => {
      const updateConfirmed = window.confirm(
        'A new version of this app is available. Click OK to update now.'
      );

      if (updateConfirmed) {
        wb.addEventListener('controlling', (event) => {
          window.location.reload();
        });

        wb.messageSkipWaiting();
      }
    });

    // Log when service worker has successfully controlled the page
    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        console.log('Service Worker activated for the first time!');
      } else {
        console.log('Service Worker updated!');
      }
    });

    // Register the service worker
    wb.register().catch((err) => {
      console.error('Service Worker registration failed:', err);
    });

    return wb;
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
