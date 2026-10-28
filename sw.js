// ShopMap service worker: always try the network first so new builds show up; cache is only an offline fallback.
const CACHE = "shopmap-v1";
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; // backend calls go straight to the network
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const key = req.mode === "navigate" ? new Request(url.origin + url.pathname) : req;
    try {
      const res = await fetch(req, { cache: "no-store" });
      if (res && res.ok) c.put(key, res.clone());
      return res;
    } catch (err) {
      const hit = await c.match(key, { ignoreSearch: req.mode === "navigate" });
      if (hit) return hit;
      throw err;
    }
  })());
});
