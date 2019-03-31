const expectedCacheName = 'mws-restaurant-cache-v5';

self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(cacheNames => Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName !== expectedCacheName) {
        console.log('Deleting out of date cache:', cacheName);
        return caches.delete(cacheName);
      }
    }),
  )),
));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.port === '1337') {
    console.log('not caching api', event.request.url);
    return fetch(event.request);
  }

  event.respondWith(
    caches
      .open(expectedCacheName)
      .then(cache => cache
        .match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((response) => {
              cache.put(event.request, response.clone());
              return response;
            });
        })),
  );
});
