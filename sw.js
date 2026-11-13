const CACHE = "ktf-v3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of SHELL) {
      try { const r = await fetch(u, { cache: "reload" }); if (r.ok) await c.put(u, r); } catch (_) {}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
  if (e.data === "PURGE") caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    e.respondWith(fetch(req).catch(() => caches.match(req).then(m => m || new Response("", { status: 504 }))));
    return;
  }
  e.respondWith((async () => {
    try {
      const r = await fetch(req);
      if (r.ok) { const c = await caches.open(CACHE); await c.put(req, r.clone()); }
      return r;
    } catch (_) {
      const m = await caches.match(req, { ignoreSearch: true });
      if (m) return m;
      if (req.mode === "navigate") { const h = await caches.match("./index.html"); if (h) return h; }
      return new Response("", { status: 504, statusText: "hors ligne" });
    }
  })());
});
