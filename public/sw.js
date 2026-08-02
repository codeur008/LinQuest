/**
 * LingoQuest Service Worker
 * Enables offline support, PWA installability, and background sync.
 * Required for the Android "Install App" banner to appear in Chrome.
 */

const CACHE_NAME = "lingoquest-v1.0.0";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon.svg",
];

// ─── Install: cache essential assets ──────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[SW] Failed to cache some assets:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: clean up old caches ────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: Network first, fallback to cache ─────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  // For navigation requests: network first, fallback to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() =>
          caches.match("/").then(
            (cachedResponse) => cachedResponse || caches.match(request)
          )
        )
    );
    return;
  }

  // For static assets: cache first
  if (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
      )
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ─── Push notifications (future use) ──────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "LingoQuest", {
    body: data.body || "Prêt pour votre session d'aujourd'hui ?",
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "lingoquest-reminder",
  });
});
