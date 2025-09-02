// Service Worker for Leica Gallery
const CACHE_NAME = 'leica-gallery-v1.0.0';
const STATIC_CACHE = 'leica-gallery-static-v1.0.0';
const IMAGE_CACHE = 'leica-gallery-images-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/gallery-data.js',
    '/js/script.js',
    '/images/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...');
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),

            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== IMAGE_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method !== 'GET') return;

    // Handle image requests with cache-first strategy
    if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        event.respondWith(handleImageRequest(request));
        return;
    }

    // Handle static assets with cache-first strategy
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/css/') || url.pathname.startsWith('/js/')) {
        event.respondWith(handleStaticRequest(request));
        return;
    }

    // Handle HTML requests with network-first strategy
    if (request.destination === 'document') {
        event.respondWith(handleDocumentRequest(request));
        return;
    }

    // Default network-first strategy
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

// Handle image requests (cache-first with background update)
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // Return cached version and update in background
        updateCacheInBackground(request, cache);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('Failed to fetch image:', request.url);
        return new Response('', { status: 404 });
    }
}

// Handle static asset requests (cache-first)
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('Failed to fetch static asset:', request.url);
        return new Response('', { status: 404 });
    }
}

// Handle document requests (network-first)
async function handleDocumentRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Update cache with fresh content
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.warn('Network request failed, trying cache:', request.url);
    }

    // Fallback to cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    // Ultimate fallback - offline page
    return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Offline - Leica Gallery</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #666; }
            </style>
        </head>
        <body>
            <h1>📱 오프라인 모드</h1>
            <p>인터넷 연결이 없어 갤러리를 표시할 수 없습니다.</p>
            <p>연결이 복구되면 자동으로 갤러리가 로드됩니다.</p>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// Update cache in background without blocking response
async function updateCacheInBackground(request, cache) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silently fail background updates
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('🔄 Background sync triggered');
    // Implement background sync logic here if needed
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png'
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Message handling
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        event.waitUntil(
            Promise.all([
                caches.keys(),
                caches.open(STATIC_CACHE).then(cache => cache.keys()),
                caches.open(IMAGE_CACHE).then(cache => cache.keys())
            ]).then(([cacheNames, staticKeys, imageKeys]) => {
                event.ports[0].postMessage({
                    cacheNames,
                    staticCacheSize: staticKeys.length,
                    imageCacheSize: imageKeys.length
                });
            })
        );
    }
});
