// Service Worker for API caching
const CACHE_NAME = "cafe-app-v1";
const API_CACHE = "cafe-api-v1";
const ASSETS_TO_CACHE = ["/", "/index.html"];
const API_ENDPOINTS = ["/api/offers", "/api/menu"];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache API responses with 5-minute TTL
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Cache API calls
  if (API_ENDPOINTS.some((endpoint) => url.pathname.includes(endpoint))) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              // Clone and cache the response
              const responseToCache = response.clone();
              cache.put(request, responseToCache);
            }
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return cache.match(request);
          });
      })
    );
  }
});
