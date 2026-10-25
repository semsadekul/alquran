/* Al Quran offline service worker
 *
 * - Cache name is derived from the corpus checksum in
 *   /data/verses-manifest.json, so a corrected corpus is a new cache and old
 *   verse files are evicted on activate instead of being served forever.
 * - Verse corpus (/data/verses/*.json): stale-while-revalidate — read cached
 *   immediately, refresh in the background.
 * - Navigations: network-first → cached page → precached /offline document →
 *   minimal inline offline response.
 * - Hashed static assets (JS/CSS/fonts): cache-first (immutable names).
 */
const CACHE_PREFIX = 'alquran-';
const FALLBACK_CACHE = `${CACHE_PREFIX}unversioned`;
const MANIFEST_URL = '/data/verses-manifest.json';
const OFFLINE_URL = '/offline';
const OFFLINE_SHELL_ASSETS = [OFFLINE_URL, '/icon-192.png', '/icon-512.png', '/favicon.ico'];

const INLINE_OFFLINE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline — Al Quran</title>
<style>body{font-family:system-ui,sans-serif;background:#faf7f0;color:#1f1b16;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;text-align:center}main{max-width:28rem}h1{font-size:1.35rem;margin:0 0 .75rem}p{line-height:1.6;margin:0 0 1.25rem;color:#4b443a}a{display:inline-block;padding:.6rem 1.25rem;border-radius:.5rem;background:#b8964a;color:#1a1814;text-decoration:none;font-weight:600}</style>
</head><body><main>
<h1>You are offline · আপনি অফলাইনে আছেন</h1>
<p>Surahs you have already opened are still available. Reconnect to load the rest.</p>
<p>আপনি আগে যে সূরাগুলো খুলেছেন সেগুলো এখনও পড়তে পারবেন। বাকিগুলোর জন্য ইন্টারনেট সংযোগ প্রয়োজন।</p>
<a href="/quran/library">Open surah library</a>
</main></body></html>`;

let cacheNamePromise = null;

/** Resolve the hashed cache name once per worker lifetime. */
function getCacheName() {
  if (!cacheNamePromise) {
    cacheNamePromise = (async () => {
      try {
        const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const manifest = await response.json();
        const hash = typeof manifest?.corpusHash === 'string' ? manifest.corpusHash : '';
        if (/^[a-f0-9]{8,}$/i.test(hash)) return `${CACHE_PREFIX}${hash.slice(0, 12)}`;
      } catch {
        /* manifest unavailable — fall back to a static cache below */
      }
      return FALLBACK_CACHE;
    })();
  }
  return cacheNamePromise;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cacheName = await getCacheName();
      try {
        const cache = await caches.open(cacheName);
        // Cache entries individually: one missing icon must not block install.
        await Promise.all(
          OFFLINE_SHELL_ASSETS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
          )
        );
      } catch {
        /* precaching is best-effort — the app still works online */
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheName = await getCacheName();
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(CACHE_PREFIX) &&
              key !== cacheName &&
              !key.startsWith('alquran-audio-')
          )
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

/** Return the cached verse file immediately and refresh it in the background. */
async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);

  const network = fetch(event.request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(event.request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    // Keep the worker alive until the background refresh settles.
    event.waitUntil(network.catch(() => undefined));
    return cached;
  }

  const response = await network;
  if (response) return response;
  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

async function networkFirstNavigation(event, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(event.request);
    if (response && response.ok) {
      cache.put(event.request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    const cachedPage = await cache.match(event.request, { ignoreSearch: true });
    if (cachedPage) return cachedPage;

    const offlineShell = await cache.match(OFFLINE_URL);
    if (offlineShell) return offlineShell;

    return new Response(INLINE_OFFLINE_HTML, {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Serve cached Quran recitation audio even when offline.
  if (request.method === 'GET' && url.hostname === 'cdn.islamic.network') {
    event.respondWith(
      (async () => {
        try {
          const audioCache = await caches.open('alquran-audio-v1');
          const matched = await audioCache.match(request);
          if (matched) return matched;
          const networkRes = await fetch(request);
          if (networkRes && networkRes.ok) {
            audioCache.put(request, networkRes.clone()).catch(() => undefined);
          }
          return networkRes;
        } catch {
          const audioCache = await caches.open('alquran-audio-v1');
          const matched = await audioCache.match(request);
          if (matched) return matched;
          return new Response('Audio unavailable offline', { status: 503 });
        }
      })()
    );
    return;
  }

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

  event.respondWith(
    (async () => {
      const cacheName = await getCacheName();

      // Verse corpus: stale-while-revalidate (corrections reach readers).
      if (url.pathname.startsWith('/data/verses/')) {
        return staleWhileRevalidate(event, cacheName);
      }

      // Page navigations: network-first with a real offline fallback.
      if (request.mode === 'navigate') {
        return networkFirstNavigation(event, cacheName);
      }

      // Everything else (hashed JS/CSS, fonts, images): cache-first.
      return cacheFirst(request, cacheName);
    })()
  );
});
