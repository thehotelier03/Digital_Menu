const CACHE_NAME = 'digital-menu-v2';
const PRECACHE_URLS = [
  'index.html',
  'styles.css',
  'breakfast.html',
  'veg-main-course.html',
  'non-veg-main-course.html',
  'roti.html',
  'rice-bowl.html',
  'ande-ka-fanda.html',
  'offline.html'
];

// Cache images with longer expiration
const IMAGE_CACHE_NAME = 'digital-menu-images-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // HTML navigations: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        return cached || cache.match('offline.html');
      })
    );
    return;
  }

  // Images: cache-first with longer expiration
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          if (cached) {
            return cached;
          }
          return fetch(request).then(resp => {
            if (resp.status === 200) {
              const copy = resp.clone();
              cache.put(request, copy);
            }
            return resp;
          }).catch(() => {
            // Return a placeholder image if fetch fails
            return new Response('', {
              status: 200,
              headers: { 'Content-Type': 'image/svg+xml' }
            });
          });
        });
      })
    );
    return;
  }

  // Others: stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});


