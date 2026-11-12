const CACHE = "kevtf-v7";
const PRECACHE = ["./","index.html","app.js","legal.js","data-engine.js","manifest.webmanifest","icon.svg","data/index.json","data/seed.json"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const u of PRECACHE) {
      try { const r = await fetch(u, { cache: "reload" }); if (r.ok) await c.put(u, r); } catch (_) {}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
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
  const u = new URL(req.url);
  if (u.hostname.includes("firestore") || u.hostname.includes("googleapis") || u.hostname.includes("identitytoolkit")) return;

  const same = u.origin === location.origin;
  const isNav = req.mode === "navigate";
  const isData = same && u.pathname.includes("/data/");
  const isAsset = same && /\.(js|css|json|svg|webmanifest|png)$/.test(u.pathname);

  /* Navigation + données + NOS assets : toujours réseau d'abord, on ne cache que si OK */
  if (isNav || isData || isAsset) {
    e.respondWith(
      fetch(req).then(r => {
        if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
        return r;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(m => m || (isNav ? caches.match("index.html") : Response.error())))
    );
    return;
  }

  /* Tiers (CDN Firebase…) : stale-while-revalidate, jamais de réponse en échec en cache */
  e.respondWith((async () => {
    const cached = caches.match(req);
    const net = fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; }).catch(() => null);
    const m = await cached;
    if (m) { net; return m; }
    const n = await net;
    return n || Response.error();
  })());
});
