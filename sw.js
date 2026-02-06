const CACHE_NAME = 'type-motion-v1';
const STATIC_ASSETS = [
  'index.html',
  'index.tsx',
  'App.tsx',
  'utils.ts',
  'types.ts',
  'services/geminiService.ts',
  'index.css',
  'manifest.webmanifest'
];

const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.1',
  'https://aistudiocdn.com/react-dom@^19.2.1',
  'https://aistudiocdn.com/@google/genai@^1.32.0',
  'https://aistudiocdn.com/lucide-react@^0.557.0',
  'https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js',
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Orbitron:wght@700&family=Playfair+Display:ital,wght@0,700;1,700&family=Roboto+Mono:wght@700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Relative paths are naturally resolved relative to the SW location by cache.addAll
      return cache.addAll([...STATIC_ASSETS, ...CDN_ASSETS]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    // If URL parsing fails (e.g. invalid request.url), just let the network handle it or fail
    return;
  }

  // Do not cache API calls (Gemini) or sensitive responses
  if (url.origin.includes('generativelanguage.googleapis.com') || request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate for local assets
        const fetchPromise = fetch(request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      }

      return fetch(request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});