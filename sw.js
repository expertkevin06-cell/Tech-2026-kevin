const CACHE = "kevtf-v5";
const SHELL = [
  "./",
  "index.html",
  "app.js",
  "legal.js",
  "catalogue.js",
  "data-engine.js",
  "manifest.webmanifest",
  "icon.svg",
  "data/index.json",
  "data/seed.json",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);

  if (
    e.request.method !== "GET" ||
    u.hostname.includes("firestore") ||
    u.hostname.includes("googleapis") ||
    u.hostname.includes("identitytoolkit")
  ) return;

  const networkFirst = u.pathname.includes("/data/") || e.request.mode === "navigate";

  if (networkFirst) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          caches.open(CACHE).then(k => k.put(e.request, r.clone()));
          return r;
        })
        .catch(() =>
          caches.match(e.request, { ignoreSearch: true })
            .then(m => m || caches.match("index.html"))
        )
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(m =>
        m || fetch(e.request).then(r => {
          caches.open(CACHE).then(k => k.put(e.request, r.clone()));
          return r;
        })
      )
    );
  }
});

self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
