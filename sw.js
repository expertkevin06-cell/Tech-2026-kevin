const CACHE="kevtf-v11";
const SHELL=["./","index.html","app.js","manifest.webmanifest","icon.svg","data/index.json","data/seed.json"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 for(const u of SHELL){try{const r=await fetch(u,{cache:"reload"});if(r.ok)await c.put(u,r);}catch(_){}}
 await self.skipWaiting();})());});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{
 const k=await caches.keys();await Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)));
 await self.clients.claim();})());});
self.addEventListener("message",e=>{if(e.data==="SKIP_WAITING")self.skipWaiting();});
self.addEventListener("fetch",e=>{
 const q=e.request;if(q.method!=="GET")return;
 const u=new URL(q.url);
 if(u.origin!==location.origin){e.respondWith(fetch(q).catch(()=>caches.match(q)));return;}
 e.respondWith((async()=>{
  try{const r=await fetch(q);if(r.ok){const c=r.clone();const k=await caches.open(CACHE);await k.put(q,c);}return r;}
  catch(_){const m=await caches.match(q,{ignoreSearch:true});
   if(m)return m;
   if(q.mode==="navigate"){const h=await caches.match("index.html");if(h)return h;}
   return new Response("",{status:504,statusText:"offline"});}
 })());
});
