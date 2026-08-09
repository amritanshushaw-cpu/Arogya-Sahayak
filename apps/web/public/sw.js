const CACHE_NAME = 'arogya-sahayak-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/screening',
  '/patient-vitals',
  '/patients/new',
  '/dashboard',
  '/manifest.json',
  '/models/kaggle_model_config.json',
  '/models/risk_model.onnx'
];

const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js',
  'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort-wasm.wasm'
];

// Install Event - Pre-cache essential app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline app shell & ML models');
      // Adding ASSETS_TO_CACHE
      cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Asset cache addAll warning:', err);
      });
      // Try to cache CDN scripts
      CDN_URLS.forEach(url => {
        fetch(url, { mode: 'cors' }).then(res => {
          if(res.ok) cache.put(url, res);
        }).catch(err => console.warn('[SW] Failed to pre-cache CDN asset', url));
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache First Strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Ignore API calls so we don't accidentally cache dynamic JSON payloads
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately and update cache in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* Network failed silently, cached version serving */
          });
        return cachedResponse;
      }

      // Network Fallback
      return fetch(event.request)
        .then((networkResponse) => {
          // Allow caching opaque responses (like CDNs)
          if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If navigation request fails offline, fallback to root app shell
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
