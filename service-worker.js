const APP_VERSION = "joodkids-fast-secure-v12";
const STATIC_CACHE = `${APP_VERSION}-static`;
const RUNTIME_CACHE = `${APP_VERSION}-runtime`;
const IMAGE_CACHE = `${APP_VERSION}-images`;
const STATIC_ASSETS = [
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './assets/logo-mark.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function isCloudinaryImage(request) {
  const url = new URL(request.url);
  return request.method === 'GET' && url.hostname.includes('res.cloudinary.com') && url.pathname.includes('/image/upload/');
}

function isCacheable(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return false;
  if (isCloudinaryImage(request)) return true;
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.endsWith('/__/firebase/init.js')) return false;
  return true;
}

async function staleWhileRevalidate(cacheName, request, { fallbackToIndex = false } = {}) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(async (response) => {
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  }).catch(() => cached || (fallbackToIndex ? caches.match('./index.html') : Response.error()));
  return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!isCacheable(request)) return;

  if (isCloudinaryImage(request)) {
    event.respondWith(staleWhileRevalidate(IMAGE_CACHE, request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        return (await caches.match(request)) || (await caches.match('./index.html'));
      }
    })());
    return;
  }

  const isStatic = STATIC_ASSETS.some((asset) => url.pathname.endsWith(asset.replace('./', '/')) || url.pathname === asset.replace('./', '/'));
  if (isStatic) {
    event.respondWith(staleWhileRevalidate(STATIC_CACHE, request, { fallbackToIndex: url.pathname.endsWith('/index.html') }));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return cached || Response.error();
    }
  })());
});
