// Service Worker for ToolVault PWA
const CACHE_NAME = 'toolvault-v3';
const RUNTIME_CACHE = 'toolvault-runtime-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png', 
  '/icons/icon-512.png',
  '/offline.html'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Ensure new service worker activates immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});

// Fetch event - cache first for assets, network first for HTML
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (!url.origin.includes(self.location.origin)) {
    return;
  }
  
  // For HTML requests, try network first with cache fallback
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the new version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache, then offline page
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // For everything else (JS, CSS, images), use stale-while-revalidate for better performance
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Determine which cache to use based on file type
        const cacheName = request.url.match(/\.(js|css|woff|woff2|ttf|eot)$/) 
          ? RUNTIME_CACHE 
          : CACHE_NAME;
        
        // Cache the fetched resource
        const responseToCache = response.clone();
        caches.open(cacheName).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // For failed requests, try to return offline page for navigation
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
      
      // Return cached response immediately, but still fetch update in background
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'ToolVault Update';
  const options = {
    body: data.body || 'New features available!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
