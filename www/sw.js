const CACHE_NAME = 'quran-offline-v7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './data/bangla_pronunciation.json',
  './data/bangla_pronunciation.js',
  './data/surahs.json',
  './data/surahs.js',
  './data/quran-uthmani.json',
  './data/quran-uthmani.js',
  './data/bn.bengali.json',
  './data/bn.bengali.js',
  './data/en.sahih.json',
  './data/en.sahih.js',
  './data/en.transliteration.json',
  './data/en.transliteration.js'
];

// Install Event - Pre-cache Core Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache-First Strategy with Dynamic Caching for Fonts/Recitations
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Avoid caching external audio recitations (which are huge) and API sync calls
  if (requestUrl.host.includes('alquran.cloud') || requestUrl.pathname.endsWith('.mp3')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        // Cache dynamic external assets like Google Fonts
        if (
          event.request.url.includes('fonts.googleapis.com') ||
          event.request.url.includes('fonts.gstatic.com')
        ) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for offline page if resource not found (not strictly needed for SPA but good practice)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
