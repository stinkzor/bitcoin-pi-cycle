// Service Worker für Bitcoin Pi Cycle App
const CACHE_NAME = 'btc-pi-cycle-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event - Cache First Strategy
self.addEventListener('fetch', event => {
  // Skip caching for API calls (always fetch fresh data)
  if (event.request.url.includes('api.') || 
      event.request.url.includes('query1.finance.yahoo.com') ||
      event.request.url.includes('cryptocompare.com') ||
      event.request.url.includes('coincap.io') ||
      event.request.url.includes('binance.com') ||
      event.request.url.includes('coinbase.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});