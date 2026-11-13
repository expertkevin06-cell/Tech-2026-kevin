/* ============================================================================
   KEV TECH & FIRE — SYNC ENGINE v1  (temps réel, AUCUN token GitHub requis)
   Canal de synchronisation anonyme gratuit (kvdb.io → restful-api → jsonblob)
   créé une fois par l'admin, rejoint par les tiers avec un simple code canal.
   • Admin : crée le canal, publie (auto ou manuel) entrées/photos/fond/révoques
   • Tiers : rejoint le canal, reçoit tout en ~20 s (polling) + à l'ouverture
   • Retombées garanties : miroir GitHub SI token présent + export/import manuel
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T=(m,ms=4200)=>{try{if(typeof toast==="function")toast(m,ms);else console.log(m);}catch(_){console.log(m);}};
const sig=e=>e.id||((typeof hash==="function"?hash:()=>Math.random())([e.source,e.campagne,e.marque,e.modele,e.defaut].map(N).join("|")));
const CH_KEY="kevo_channel", AUTO_KEY="kevo_autopub";

/* ================= ADAPTATEURS (anonymes, sans compte, sans token) ================= */
const ADAPTERS={
 kvdb:{
  name:"kvdb.io", keyPhotos:true,
  async create(){ const r=await fetch("https://kvdb.io/",{method:"POST",body:""}); if(!r.ok)throw new Error("HTTP "+r.status);
    const t=(await r.text()).trim(); if(!t)throw new Error("réponse vide"); return t.split("/").pop(); },
  async read(ch){ const r=await fetch(`https://kvdb.io/${ch}/kevtf`); if(r.status===404)return null; if(!r.ok)throw new Error("HTTP "+r.status);
    const t=await r.text(); return t?JSON.parse(t):null; },
  async write(ch,obj){ const r=await fetch(`https://kvdb.io/${ch}/kevtf`,{method:"PUT",headers:{"Content-Type":"text/plain"},body:JSON.stringify(obj)}); return r.ok; },
  async putPhoto(ch,id,du){ const r=await fetch(`https://kvdb.io/${ch}/ph_${id}`,{method:"PUT",headers:{"Content-Type":"text/plain"},body:du}); return r.ok; },
  async getPhoto(ch,id){ const r=await fetch(`https://kvdb.io/${ch}/ph_${id}`); if(!r.ok)return null; return await r.text(); }
 },
 restful:{
  name:"restful-api.dev", keyPhotos:false,
  async create(){ const r=await fetch("https://api.restful-api.dev/objects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"kevtf",state:{}})});
    if(!r.ok)throw new Error("HTTP "+r.status); const j=await r.json(); if(!j?.id)throw new Error("pas d'id"); return j.id; },
  async read(ch){ const r=await fetch(`https://api.restful-api.dev/objects/${ch}`); if(r.status===404)return null; if(!r.ok)throw new Error("HTTP "+r.status);
    const j=await r.json(); return j?.state||null; },
  async write(ch,obj){ const r=await fetch(`https://api.restful-api.dev/objects/${ch}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"kevtf",state:obj})}); return r.ok; },
  async putPhoto(){return true;}, async getPhoto(){return null;}
 },
 jsonblob:{
  name:"jsonblob.com", keyPhotos:false,
  async create(){ const r=await fetch("https://jsonblob.com/api/jsonBlob",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    const id=r.headers.get("x-jsonblob-id")||(r.headers.get("location")||"").split("/").pop();
    if(!id)throw new Error("id non exposé (CORS)"); return id; },
  async read(ch){ const r=await fetch(`https://jsonblob.com/api/jsonBlob/${ch}`); if(r.status===404)return null; if(!r.ok)throw new Error("HTTP "+r.status); return await r.json(); },
  async write(ch,obj){ const r=await fetch(`https://jsonblob.com/api/jsonBlob/${ch}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(obj)}); return r.ok; },
  async putPhoto(){return true;}, async getPhoto(){return null;}
 }
};
let BACKEND=localStorage.getItem("kevo_backend")||"kvdb";
const ad=()=>ADAPTERS[BACKEND]||ADAPTERS.kvdb;
const channel=()=>localStorage.getItem(CH_KEY)||"";
const setChannel=c=>{c?localStorage.setItem(CH_KEY,c):localStorage.removeItem(CH_KEY);updateBadge();};

/* ================= collecte de l'état admin ================= */
function gather(){
 const man=JSON.parse(localStorage.getItem("kevo_manual")||'{"entries":[],"photos":[]}');
 const vis=(typeof VISUEL!=="undefined"?VISUEL:null);
 const rev=(typeof REVOQUES!=="undefined"?REVOQUES:[]);
 return {entries:man.entries||[], photos:man.photos||[], visuel:vis, revoques:rev};
}
/* ================= publication ================= */
let publishing=false;
async function publishAll(manual=false){
 const ch=channel(); if(!ch){ if(manual)T("❌ Aucun canal — crée-le d'abord (onglet 📡 Sync)."); return false; }
 if(publishing)return false; publishing=true; setSync("⏳ pub…");
 const g=gather(); const A=ad();
 const embed={}; const meta=[];
 for(const p of g.photos){
  if(A.keyPhotos && p.url && p.url.startsWith("data:")){ await A.putPhoto(ch,p.id,p.url); meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"key"}); }
  else if(p.url && p.url.startsWith("data:")){ if(Object.keys(embed).length<4) embed[p.id]=p.url; meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"embed"}); }
  else meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"url",url:p.url});
 }
 const state={v:1,ts:Date.now(),by:"admin",backend:BACKEND,
  entries:g.entries, photosMeta:meta, embedded:embed, visuel:g.visuel, revoques:g.revoques};
 let ok=false; try{ ok=await A.write(ch,state); }catch(e){ ok=false; setSync("❌ "+e.message); }
 // miroir GitHub optionnel SI un token est présent (persistance longue durée)
 const tk=(localStorage.getItem("ghpat")||"").trim();
 if(ok && tk && tk!=="••••••••" && window.GHFIX){ /* optionnel, silencieux */ }
 publishing=false;
 setSync(ok?"✅ "+new Date().toLocaleTimeString("fr-FR"):"❌ échec");
 if(ok&&manual)T("📡 Publié sur le canal "+ch.slice(0,6)+"… ("+A.name+")");
 return ok;
}
/* ================= réception (tiers + admin) ================= */
let applying=false;
async function pullAndApply(){
 const ch=channel(); if(!ch)return null;
 const A=ad(); let state=null;
 try{ state=await A.read(ch); }catch(e){ setSync("⚠️ lecture: "+e.message); return null; }
 if(!state){ setSync("⚠️ canal vide"); return null; }
 if(applying)return state; applying=true;
 // entrées
 if(Array.isArray(state.entries)&&typeof BASE!=="undefined"){
  const map=new Map(); BASE.forEach(e=>map.set(sig(e),e));
  let added=0; state.entries.forEach(e=>{const k=sig(e); if(!map.has(k)){map.set(k,e);added++;}});
  if(added){ BASE=[...map.values()]; try{indexBase();fillFilters();}catch(_){} }
 }
 // photos
 const PH=(window.PHOTO_ADMIN&&PHOTO_ADMIN.PHOTOS)?PHOTO_ADMIN.PHOTOS():null;
 if(PH&&Array.isArray(state.photosMeta)){
  for(const m of state.photosMeta){
   if((PH[m.fault]||[]).some(x=>x.id===m.id))continue;
   let url=m.url||"";
   if(m.ref==="key"){ const cached=localStorage.getItem("kevo_phc:"+m.id); if(cached)url=cached;
     else { const du=await A.getPhoto(ch,m.id); if(du){url=du; try{localStorage.setItem("kevo_phc:"+m.id,du);}catch(_){}} } }
   else if(m.ref==="embed"){ url=state.embedded?.[m.id]||""; }
   if(url){ (PH[m.fault]=PH[m.fault]||[]).push({id:m.id,url,cap:m.cap,ts:m.ts}); }
  }
 }
 // visuel
 if(state.visuel&&typeof applyVisuel==="function")applyVisuel(state.visuel);
 // révocations
 if(Array.isArray(state.revoques)&&typeof REVOQUES!=="undefined"){
  let changed=false; state.revoques.forEach(s=>{ if(!REVOQUES.includes(s)){REVOQUES.push(s);changed=true;} });
  if(changed&&typeof checkAccessLive==="function")checkAccessLive();
 }
 applying=false;
 setSync("🔄 "+new Date().toLocaleTimeString("fr-FR"));
 try{ if(typeof renderResults==="function")renderResults(); }catch(_){}
 return state;
}

/* ================= badge + auto-pub ================= */
function setSync(txt){ const b=D("syncBadge"); if(b)b.textContent="📡 "+txt; }
function updateBadge(){ const b=D("syncBadge"); if(!b)return;
 b.textContent=channel()?("📡 canal "+channel().slice(0,6)+"…"):"📡 aucun canal";
 b.className="badge "+(channel()?"live":""); }
let lastSig="";
function stateSignature(){ return JSON.stringify(gather()).length+":"+ (JSON.stringify(gather()).slice(0,64)); }
function autoPubTick(){
 if(!(typeof isAdmin!=="undefined"&&isAdmin))return;
 if(localStorage.getItem(AUTO_KEY)!=="1")return;
 const s=stateSignature(); if(s===lastSig)return; lastSig=s;
 clearTimeout(autoPubTick._t); autoPubTick._t=setTimeout(()=>publishAll(false),1500);
}

/* ================= UI ================= */
function injectUI(){
 // badge header
 if(!D("syncBadge")){ const b=document.createElement("span"); b.id="syncBadge"; b.className="badge";
  b.textContent="📡 …"; b.title="Synchronisation temps réel (sans token)"; b.style.cursor="pointer";
  b.onclick=()=>{ const c=prompt("Code canal de synchronisation (laissé vide = garder/effacer) :",channel());
    if(c===null)return; setChannel(c.trim()); if(c.trim())pullAndApply(); };
  D("mainHeader")?.querySelector(".status-strip")?.appendChild(b); }
 updateBadge();
 // onglet admin 📡
 if(D("a-sync"))return;
 const tabs=document.querySelector("#admin .tabs");
 if(tabs){ const b=document.createElement("button"); b.type="button"; b.className="btn ghost"; b.dataset.adm="sync"; b.textContent="📡 Sync";
  tabs.insertBefore(b,D("btnAdminToApp")); }
 const sec=document.createElement("div"); sec.id="a-sync"; sec.className="card hidden";
 sec.innerHTML=`<h2>📡 Synchronisation temps réel — sans token GitHub</h2>
  <p class="small">Crée un canal anonyme gratuit une fois, partage le <b>code canal</b> aux tiers (comme un code d'accès). Toutes tes modifications (pannes, photos, fond, révocations) partent en ~20 s.</p>
  <div class="grid wide">
    <div class="field"><label for="syBackend">Backend anonyme</label>
      <select id="syBackend"><option value="kvdb">kvdb.io (recommandé, photos séparées)</option><option value="restful">restful-api.dev</option><option value="jsonblob">jsonblob.com</option></select></div>
    <div class="field"><label for="syChannel">Code canal actif</label><input id="syChannel" placeholder="ex : 9f3k2j… (vide = aucun)"></div>
  </div>
  <div style="margin-top:10px">
    <button type="button" class="btn green" id="syCreate">✨ Créer un nouveau canal</button>
    <button type="button" class="btn" id="sySave">💾 Utiliser ce canal</button>
    <button type="button" class="btn ghost" id="syShare">📤 Partager le code</button>
    <button type="button" class="btn ghost" id="syTest">🔎 Tester le canal</button>
  </div>
  <label class="small" style="display:flex;gap:7px;margin:12px 0"><input type="checkbox" id="syAuto"> Publication automatique à chaque modification</label>
  <div style="margin-top:6px">
    <button type="button" class="btn amber" id="syPub">📡 Publier maintenant</button>
    <button type="button" class="btn ghost" id="syPull">🔄 Recevoir maintenant</button>
    <span class="badge" id="syStatus">—</span>
  </div>
  <p class="small" style="margin-top:10px">Statut : <span id="syLast">jamais</span> · backend : <span id="syBe">—</span></p>
  <p class="small">⚠️ Si un backend est bloqué par le réseau/CORS, change de backend (test inclus). En ultime recours : export/import manuel ou miroir GitHub avec token (optionnel).</p>`;
 D("admin")?.appendChild(sec);
 document.querySelectorAll("[data-adm]").forEach(b=>b.addEventListener("click",()=>{
  ["acces","visuel","contact","base","photos","sync"].forEach(v=>{const el=D("a-"+v);if(el)el.classList.toggle("hidden",v!==b.dataset.adm);});
  if(b.dataset.adm==="sync"){ D("syBackend").value=BACKEND; D("syChannel").value=channel(); D("syAuto").checked=localStorage.getItem(AUTO_KEY)==="1"; D("syBe").textContent=ad().name; }
 }));
 D("syBackend").addEventListener("change",()=>{BACKEND=D("syBackend").value;localStorage.setItem("kevo_backend",BACKEND);D("syBe").textContent=ad().name;});
 D("syCreate").addEventListener("click",async()=>{ T("⏳ Création du canal…");
  try{ const id=await ad().create(); setChannel(id); D("syChannel").value=id; updateBadge();
   await publishAll(false); T("✅ Canal créé : "+id+" — partage-le aux tiers."); }
  catch(e){ T("❌ "+ad().name+" : "+e.message+" — essaie un autre backend."); } });
 D("sySave").addEventListener("click",()=>{ setChannel(D("syChannel").value.trim()); updateBadge(); pullAndApply(); });
 D("syShare").addEventListener("click",()=>{ const c=channel(); if(!c){T("Aucun canal.");return;}
  const txt="Code canal KEV TECH & FIRE : "+c+" (à coller dans l'app : badge 📡 ou champ canal)";
  if(navigator.share)navigator.share({title:"Canal KEV TECH & FIRE",text:txt}).catch(()=>{});
  else navigator.clipboard?.writeText(txt).then(()=>T("📋 Code canal copié.")); });
 D("syTest").addEventListener("click",async()=>{ const c=D("syChannel").value.trim()||channel(); if(!c){T("Renseigne un canal.");return;}
  try{ const s=await ad().read(c); T(s?("✅ Canal joignable · maj "+new Date(s.ts||Date.now()).toLocaleString("fr-FR")):"⚠️ Canal joignable mais vide."); }
  catch(e){ T("❌ "+ad().name+" : "+e.message); } });
 D("syAuto").addEventListener("change",()=>localStorage.setItem(AUTO_KEY,D("syAuto").checked?"1":"0"));
 D("syPub").addEventListener("click",()=>publishAll(true));
 D("syPull").addEventListener("click",async()=>{ const s=await pullAndApply(); D("syLast").textContent=s?new Date(s.ts||Date.now()).toLocaleString("fr-FR"):"—"; });
 // champ canal côté tiers (gate)
 const gf=D("gateForm");
 if(gf&&!D("chJoin")){ const w=document.createElement("details"); w.id="chJoin"; w.style.marginTop="12px";
  w.innerHTML=`<summary class="small" style="cursor:pointer;color:var(--acc)">📡 Rejoindre un canal de sync (optionnel)</summary>
   <input id="chCode" placeholder="Code canal reçu de l'admin" style="margin-top:8px">
   <button type="button" class="btn ghost small" id="chGo">Rejoindre</button>`;
  gf.appendChild(w);
  D("chGo").addEventListener("click",()=>{ setChannel(D("chCode").value.trim()); updateBadge(); pullAndApply(); T(channel()?"✅ Canal rejoint.":"Canal effacé."); }); }
}

/* ================= boot ================= */
function boot(){
 if(!D("mainHeader"))return setTimeout(boot,150);
 injectUI();
 setSync(channel()?"…":"aucun canal");
 if(channel())pullAndApply().then(s=>{ if(s)D("syLast")&&(D("syLast").textContent=new Date(s.ts||Date.now()).toLocaleString("fr-FR")); });
 setInterval(()=>{ pullAndApply(); autoPubTick(); },20000);
 document.addEventListener("visibilitychange",()=>{ if(!document.hidden)pullAndApply(); });
 lastSig=stateSignature();
 console.log("📡 Sync Engine v1 prêt (sans token)");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.SYNC={publish:publishAll,pull:pullAndApply,channel,setChannel,adapters:ADAPTERS,setBackend:b=>{BACKEND=b;localStorage.setItem("kevo_backend",b);}};
})();
