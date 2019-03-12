const cacheName = 'mws-restaurant-cache-v1';

self.addEventListener('fetch', event => {
    //cache only jpg png and css

    var url = new URL(event.request.url);

    if (url.pathname.endsWith('/restaurants')) {
        console.log('not caching db', event.request.url);
        return fetch(event.request);
    }

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
