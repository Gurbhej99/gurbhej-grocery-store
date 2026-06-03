const CACHE_NAME = "gurbhej-store-cache-v31"; // Incremented version to refresh client caches
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./app.js?v=11",
  "./db.js",
  "./firebase-config.js",
  "./style.css?v=13",
  "./translation.js?v=10",
  "./manifest.json",
  "./icons/icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"
];

// Install Event - Pre-cache all static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("[Service Worker] Pre-caching static assets");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve assets from cache, falling back to network
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  // Only cache local repository assets
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Fetch new version in background (stale-while-revalidate)
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {}); // Suppress background fetch errors when offline
          
          return cachedResponse;
        }

        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
  );
});
