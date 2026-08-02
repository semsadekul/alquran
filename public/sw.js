/* Al Quran offline service worker
 * - Verse corpus (/data/verses/*.json): cache-first → offline Quran reading
 * - Pages (navigations): network-first with cached shell fallback
 * - Hashed static assets (JS/CSS/fonts): cache-first (hashed names = immutable)
 */
const VERSION = 'alquran-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && new URL(request.url).origin === self.location.origin) {
      const cache = await caches.open(VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached;
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Offline navigation → serve the cached home shell.
    if (request.mode === 'navigate') {
      const shell = await caches.match('/');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never intercept API routes or Next.js RSC navigation payloads — they are
  // dynamic and header-dependent; serving them stale breaks search + routing.
  if (
    url.pathname.startsWith('/api/') ||
    request.headers.get('RSC') ||
    request.headers.get('Next-Router-Prefetch') ||
    request.headers.get('Next-Router-State-Tree')
  ) {
    return;
  }

  // Verse corpus: cache-first (the big offline win — read any surah offline).
  if (url.pathname.startsWith('/data/verses/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Page navigations: network-first with offline shell fallback.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else (hashed JS/CSS, fonts, images): cache-first.
  event.respondWith(cacheFirst(request));
});
