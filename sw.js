/**
 * ArtFlow CRM - Service Worker
 * Caching per funzionalità offline
 */

const CACHE_NAME = 'artflow-crm-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/store.js',
    '/js/i18n.js',
    '/manifest.json'
];

// Assets esterni da cachare
const EXTERNAL_ASSETS = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:wght@400;600;700&display=swap'
];

/**
 * Evento Install - Cacha gli asset statici
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installazione...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching assets statici');
                // Cache assets locali
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Cache assets esterni separatamente (potrebbero fallire)
                return caches.open(CACHE_NAME).then((cache) => {
                    return Promise.allSettled(
                        EXTERNAL_ASSETS.map((url) => 
                            fetch(url)
                                .then((response) => {
                                    if (response.ok) {
                                        return cache.put(url, response);
                                    }
                                })
                                .catch(() => console.log(`⚠️ Skip caching: ${url}`))
                        )
                    );
                });
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * Evento Activate - Pulisce cache vecchie
 */
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Attivazione...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log(`🗑️ Service Worker: Eliminazione cache ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * Evento Fetch - Strategia Cache-First con fallback network
 */
self.addEventListener('fetch', (event) => {
    // Ignora richieste non-GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignora richieste chrome-extension e altre non-http
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Ritorna dalla cache se disponibile
                if (cachedResponse) {
                    // Aggiorna cache in background (stale-while-revalidate)
                    fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse.ok) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, networkResponse);
                                });
                            }
                        })
                        .catch(() => {});
                    
                    return cachedResponse;
                }

                // Altrimenti fetch dalla rete
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Cacha la risposta per usi futuri
                        if (networkResponse.ok) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Fallback per pagine HTML
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

/**
 * Evento Message - Per comunicazioni con la pagina
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🎨 ArtFlow CRM Service Worker caricato');