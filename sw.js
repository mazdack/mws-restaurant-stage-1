var cacheName = 'mws-restaurant-cache-v1';

self.addEventListener('fetch', event => {
    event.respondWith(
        caches
                    .match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        caches.open(cacheName).then(cache => cache.add(event.request));
                        return fetch(event.request);

                    })
    );

});
