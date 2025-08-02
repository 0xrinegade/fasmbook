// Service Worker for FASM eBook PWA
const CACHE_NAME = 'fasm-ebook-v1.0.0';
const urlsToCache = [
    './index.html',
    './manifest.json',
    './styles/main.css',
    './styles/ebook.css', 
    './styles/eink.css',
    './js/main.js',
    './js/settings.js',
    './js/drawing.js',
    './js/navigation.js',
    './js/storage.js',
    './js/markdown.js',
    './js/ai-helper.js',
    './js/instruction-glossary.js',
    './assets/favicon.svg',
    './assets/icon-192.svg',
    './assets/icon-512.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Cache installation failed:', error);
                // Don't fail if some resources can't be cached
                return Promise.resolve();
            })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Claim all clients immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome extension requests
    if (event.request.url.startsWith('chrome-extension://') || 
        event.request.url.startsWith('moz-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                // Clone the request for the fetch
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    
                    // Cache successful responses
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            // Only cache same-origin resources
                            if (event.request.url.startsWith(self.location.origin)) {
                                cache.put(event.request, responseToCache);
                            }
                        })
                        .catch((error) => {
                            console.log('Cache put failed:', error);
                        });
                    
                    return response;
                }).catch((error) => {
                    console.log('Fetch failed:', error);
                    
                    // Return offline page for navigation requests if available
                    if (event.request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                    
                    // For other requests, just fail
                    throw error;
                });
            })
    );
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background sync tasks
            console.log('Background sync triggered')
        );
    }
});

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New content available',
        icon: './assets/icon-192.svg',
        badge: './assets/favicon.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open eBook',
                icon: './assets/favicon.svg'
            },
            {
                action: 'close',
                title: 'Close notification',
                icon: './assets/favicon.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('FASM eBook', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    }
    // Close action or default click - just close notification
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                event.ports[0].postMessage({
                    success: true
                });
            })
        );
    }
});