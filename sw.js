// Service Worker for Netflix Clone - Offline Support
const CACHE_NAME = 'filmalisa-v1.0.0';
const STATIC_CACHE_NAME = 'filmalisa-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'filmalisa-dynamic-v1.0.0';

// Files to cache for offline use
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles/global.css',
    '/assets/icons/logo.svg',
    '/assets/icons/profile-img.svg',
    '/assets/icons/title-movie.svg',
    '/pages/client/home/home.html',
    '/pages/client/home/home.css',
    '/pages/client/home/home.js',
    '/pages/client/login/login.html',
    '/pages/client/login/login.css',
    '/pages/client/login/login.js',
    '/pages/client/favorite/favorite.html',
    '/pages/client/favorite/favorite.css',
    '/pages/client/favorite/favorite.js',
    '/pages/client/detailed/detailed.html',
    '/pages/client/detailed/detailed.css',
    '/pages/client/detailed/detailed.js',
    '/pages/client/searchPanel/searchPanel.html',
    '/pages/client/searchPanel/searchPanel.css',
    '/pages/client/searchPanel/searchPanel.js',
    '/pages/client/landingPage/landingPage.css',
    '/pages/client/landingPage/landingPage.js',
    '/assets/bootstrap/css/bootstrap.min.css',
    '/assets/bootstrap/js/bootstrap.bundle.min.js'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/filmalisa\/movie/,
    /\/api\/filmalisa\/category/,
    /\/api\/filmalisa\/search/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request.url)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isNavigationRequest(request)) {
        event.respondWith(handleNavigationRequest(request));
    } else {
        event.respondWith(handleOtherRequest(request));
    }
});

// Check if request is for static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset)) ||
           url.includes('/assets/') ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.svg') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.jpeg');
}

// Check if request is for API
function isAPIRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Check if request is navigation
function isNavigationRequest(request) {
    return request.mode === 'navigate';
}

// Handle static asset requests
async function handleStaticAsset(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('[SW] Error handling static asset:', error);
        
        // Return offline fallback
        if (request.destination === 'image') {
            return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#333"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">No Image</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
            );
        }
        
        throw error;
    }
}

// Handle API requests
async function handleAPIRequest(request) {
    try {
        // Try network first for API requests
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful API responses
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('[SW] Network error for API request:', error);
        
        // Try cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API requests
        return new Response(
            JSON.stringify({
                success: false,
                error: 'You are offline. Some data may not be available.',
                offline: true
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        return networkResponse;
        
    } catch (error) {
        console.error('[SW] Network error for navigation:', error);
        
        // Return cached page or offline page
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return new Response(
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Offline - Filmalisa</title>
                <style>
                    body {
                        font-family: 'Raleway', sans-serif;
                        background: #000;
                        color: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .offline-container {
                        max-width: 500px;
                        padding: 40px;
                    }
                    .offline-icon {
                        font-size: 4rem;
                        color: #e50914;
                        margin-bottom: 20px;
                    }
                    h1 {
                        font-size: 2.5rem;
                        margin-bottom: 20px;
                        color: #e50914;
                    }
                    p {
                        font-size: 1.1rem;
                        color: #ccc;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .btn {
                        background: #e50914;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 4px;
                        font-size: 1rem;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        transition: background-color 0.3s;
                    }
                    .btn:hover {
                        background: #f40612;
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">📺</div>
                    <h1>You're Offline</h1>
                    <p>It looks like you're not connected to the internet. Don't worry, you can still browse some content that was previously loaded.</p>
                    <button class="btn" onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
            `,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

// Handle other requests
async function handleOtherRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        return networkResponse;
        
    } catch (error) {
        console.error('[SW] Network error:', error);
        
        // Try cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync event:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Perform background sync
async function doBackgroundSync() {
    try {
        // Get pending offline actions from IndexedDB
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            try {
                await performOfflineAction(action);
                await removePendingAction(action.id);
            } catch (error) {
                console.error('[SW] Error syncing action:', error);
            }
        }
        
        console.log('[SW] Background sync completed');
        
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

// Get pending actions from IndexedDB
async function getPendingActions() {
    // This would typically use IndexedDB
    // For now, return empty array
    return [];
}

// Perform offline action
async function performOfflineAction(action) {
    // This would perform the actual API call
    // For now, just log it
    console.log('[SW] Performing offline action:', action);
}

// Remove pending action from IndexedDB
async function removePendingAction(actionId) {
    // This would remove from IndexedDB
    console.log('[SW] Removing pending action:', actionId);
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('[SW] Push event received');
    
    const options = {
        body: event.data ? event.data.text() : 'New content available on Filmalisa!',
        icon: '/assets/icons/logo.svg',
        badge: '/assets/icons/logo.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/assets/icons/movies.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/logout.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Filmalisa', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click received');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/pages/client/home/home.html')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync event:', event.tag);
    
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

// Sync content periodically
async function syncContent() {
    try {
        // Sync popular content
        const popularContent = await fetch('/api/filmalisa/movie?limit=10&sort=popular');
        if (popularContent.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            await cache.put('/api/filmalisa/movie?limit=10&sort=popular', popularContent.clone());
        }
        
        console.log('[SW] Content sync completed');
        
    } catch (error) {
        console.error('[SW] Content sync failed:', error);
    }
}

console.log('[SW] Service worker script loaded');
