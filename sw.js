const CACHE = "kevtf-v9";
const PRECACHE = [
  "./", "index.html", "app.js", "legal.js", "data-engine.js", "power-engine.js",
  "expert-engine.js", "catalog-engine.js", "vin-engine.js", "photo-admin-engine.js",
  "github-fix-engine.js", "sync-engine.js",
  "manifest.webmanifest", "icon.svg",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-192-maskable.png", "icons/icon-512-maskable.png",
  "data/index.json", "data/seed.json", "data/visuel.json", "data/revoques.json"
];
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of PRECACHE) { try { const r = await fetch(u, { cache: "reload" }); if (r.ok) await c.put(u, r); } catch (_) {} }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => { const ks = await caches.keys(); await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))); await self.clients.claim(); })());
});
self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
  if (e.data === "PURGE") caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  const same = u.origin === location.origin;
  const isNav = req.mode === "navigate";
  const isData = same && u.pathname.includes("/data/");
  const isAsset = same && /\.(js|css|json|svg|webmanifest|png)$/.test(u.pathname);
  if (isNav || isData || isAsset) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(m => m || (isNav ? caches.match("index.html") : Response.error()))));
    return;
  }
  e.respondWith((async () => {
    const cached = caches.match(req);
    const net = fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; }).catch(() => null);
    const m = await cached; if (m) { net; return m; }
    const n = await net; return n || Response.error();
  })());
});
