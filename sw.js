// Star Wars Chronological Watch Order — service worker
// Caches the app shell so it launches instantly and works offline once installed.
// Bump CACHE_NAME whenever the HTML/icons change so old clients pick up the update.
const CACHE_NAME = "starwars-watch-order-v1";

const APP_SHELL = [
  "./star-wars-watch-order.html",
  "./manifest.json",
  "./favicon.ico",
  "./icon-16.png",
  "./icon-32.png",
  "./icon-48.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// Cache-first for the app shell, falling back to network — then updating the
// cache in the background so the next launch has whatever changed.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached); // offline and not cached — nothing more we can do

      return cached || network;
    })
  );
});
