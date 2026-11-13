const CACHE="kevtf-v10";
const SHELL=["./","index.html","app.js","manifest.webmanifest","icon.svg",
"icons/icon-192.png","icons/icon-512.png","icons/icon-192-maskable.png","icons/icon-512-maskable.png",
"data/index.json","data/seed.json"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
 for(const u of SHELL){try{const r=await fetch(u,{cache:"reload"});if(r.ok)await c.put(u,r);}catch(_){}}
 await self.skipWaiting();})());});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{const k=await caches.keys();
 await Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)));await self.clients.claim();})());});
self.addEventListener("message",e=>{if(e.data==="SKIP_WAITING")self.skipWaiting();});
self.addEventListener("fetch",e=>{const q=e.request;if(q.method!=="GET")return;const u=new URL(q.url);
 if(u.origin!==location.origin){e.respondWith(fetch(q).catch(()=>caches.match(q)));return;}
 e.respondWith(fetch(q).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(k=>k.put(q,c));}return r;})
  .catch(()=>caches.match(q,{ignoreSearch:true}).then(m=>m||(q.mode==="navigate"?caches.match("index.html"):Response.error()))));});
