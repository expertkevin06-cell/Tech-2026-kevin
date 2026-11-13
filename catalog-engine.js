/* ============================================================================
   KEV TECH & FIRE — CATALOG ENGINE v1
   1) 📷 Catalogue photos par panne : recherche massive de photos RÉELLES
      (Wikimedia Commons, CORS + licences libres) corrélées à la panne
      (marque+modèle+motorisation+système+symptômes, FR & EN).
   2) Motorisations renforcées : compléments ENGINE_DB (toutes puissances),
      dont Peugeot 3008 1.2 PureTech / 1.5 BlueHDi(HDi) / hybrides, Skoda Elroq
      (4-5 motorisations 100% électriques par puissance).
   3) Pré-sélection AUTOMATIQUE de l'énergie selon la motorisation choisie.
   4) 🧾 Autovérification d'attribution : chaque motorisation proposée est
      contrôlée (source documentée / catalogue / base / gamme + cohérence
      énergie & puissances) avec badge de confiance.
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ============ 1. COMPLÉMENTS MOTEURS (fusionnés dans POWER.db) ============ */
const EXTRA={
"peugeot|3008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[130,180]},{m:"1.5 BlueHDi (dit 1.5 HDi)",cc:1499,en:"diesel",ch:[100,120,130]},{m:"1.6 BlueHDi",cc:1560,en:"diesel",ch:[120]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[150,180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225,300]},{m:"Électrique e-3008",cc:0,en:"electrique",ch:[210,230,325]}],
"peugeot|208":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[75,82,100,110,130,136,155]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100]},{m:"Électrique e-208",cc:0,en:"electrique",ch:[136,156]}],
"peugeot|2008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[100,130,155]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[110,130]},{m:"Électrique e-2008",cc:0,en:"electrique",ch:[136,156]}],
"peugeot|5008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[150,180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225]},{m:"Électrique e-5008",cc:0,en:"electrique",ch:[210,230]}],
"peugeot|508":[{m:"1.6 PureTech",cc:1598,en:"essence",ch:[180,225]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225,360]}],
"citroen|c3":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[82,100,110]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100]},{m:"Électrique ë-C3",cc:0,en:"electrique",ch:[113]}],
"citroen|c4":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[100,130,155]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[110,130]},{m:"1.6 Hybrid",cc:1598,en:"hybride",ch:[145]},{m:"Électrique e-C4",cc:0,en:"electrique",ch:[136,156]}],
"renault|scenic":[{m:"1.3 TCe",cc:1332,en:"essence",ch:[140,160]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[110,115]},{m:"1.7 Blue dCi",cc:1749,en:"diesel",ch:[150]},{m:"Électrique E-Tech",cc:0,en:"electrique",ch:[170,220]}],
"renault|clio":[{m:"1.0 SCe",cc:999,en:"essence",ch:[65,75]},{m:"1.0 TCe",cc:999,en:"essence",ch:[90,100,110]},{m:"1.3 TCe",cc:1332,en:"essence",ch:[130,140]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[85,100,115]},{m:"E-Tech Hybride",cc:1598,en:"hybride",ch:[140,145]}],
"volkswagen|golf":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[130,150]},{m:"2.0 TSI GTI",cc:1984,en:"essence",ch:[245,300]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,200]},{m:"1.4 TSI eHybrid",cc:1395,en:"hybride",ch:[204,245]}],
"skoda|elroq":[{m:"Elroq 50 (électrique)",cc:0,en:"electrique",ch:[170]},{m:"Elroq 60 (électrique)",cc:0,en:"electrique",ch:[204]},{m:"Elroq 85 (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Elroq 85x AWD (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Elroq RS (électrique)",cc:0,en:"electrique",ch:[340]}],
"skoda|enyaq":[{m:"Enyaq 60 (électrique)",cc:0,en:"electrique",ch:[180,204]},{m:"Enyaq 85 (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Enyaq 85x AWD (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Enyaq RS (électrique)",cc:0,en:"electrique",ch:[340]}],
"bmw|serie 3":[{m:"2.0 320i",cc:1998,en:"essence",ch:[184,190]},{m:"2.0 330i",cc:1998,en:"essence",ch:[245,258]},{m:"2.0 318d",cc:1995,en:"diesel",ch:[150]},{m:"2.0 320d",cc:1995,en:"diesel",ch:[190]},{m:"3.0 330d",cc:2993,en:"diesel",ch:[286]},{m:"2.0 330e PHEV",cc:1998,en:"hybride",ch:[292]}]
};
function mergeEngines(){ if(!window.POWER||!POWER.db)return;
  for(const[k,arr]of Object.entries(EXTRA)){ const cur=POWER.db[k]||[]; const seen=new Set(cur.map(e=>N(e.m)+"|"+e.en));
    arr.forEach(e=>{const key=N(e.m)+"|"+e.en; if(!seen.has(key)){cur.push(e);seen.add(key);}});
    POWER.db[k]=cur; } }

/* ============ 2. Pré-sélection énergie + autovérification attribution ============ */
function matchedEngine(mk,mo,mt){ if(!window.POWER)return null;
  return (POWER.enginesFor(mk,mo)||[]).find(e=>N(e.m)===N(mt)||N(mt).includes(N(e.m))||N(e.m).includes(N(mt).split(" ")[0]))||null; }
function syncEnergy(force){ const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"",mt=D("cMoteur")?.value||"";
  if(!mt)return; const eng=matchedEngine(mk,mo,mt); const ce=D("cEnergie"); if(!eng||!ce)return;
  if(force||!ce.value||ce.value!==eng.en){ ce.value=eng.en; flashBadge(eng.en); } }
function flashBadge(en){ const ic={essence:"🟡",diesel:"⚫",hybride:"🟢",electrique:"🔵"}[en]||"";
  let b=D("energyAuto"); if(!b){ b=document.createElement("span"); b.id="energyAuto"; b.className="badge live"; b.style.marginLeft="6px";
    D("cEnergie")?.parentNode?.appendChild(b); } b.textContent=ic+" énergie auto : "+en; }
function verifyAttribution(){ const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"";
  const wrap=D("attribWrap"); if(!wrap)return;
  if(!mk||!mo){wrap.innerHTML="";return;}
  const list=(window.POWER?POWER.enginesFor(mk,mo):[])||[];
  if(!list.length){wrap.innerHTML=`<p class="small">⚠️ Aucune motorisation attribuable à ${E(mk)} ${E(mo)} — vérifie l'orthographe du modèle.</p>`;return;}
  const doc=list.filter(e=>e.src==="documenté"||e.src==="catalogue").length;
  const rows=list.map(e=>{
    const enOk=!D("cEnergie")?.value||D("cEnergie").value===e.en;
    const pwOk=(e.ch&&e.ch.length)>0;
    const lvl=(e.src==="documenté"||e.src==="catalogue")?"ok":(e.src==="base"?"ok":"warn");
    return `<tr><td><b>${E(e.m)}</b></td><td>${e.en}</td><td>${(e.ch||[]).join("/")} ch</td>
      <td><span class="tag ${lvl}">${e.src}</span></td>
      <td>${enOk?"✅":"⚠️"} ${pwOk?"✅":"⚠️"}</td></tr>`;}).join("");
  wrap.innerHTML=`<h3>🧾 Autovérification d'attribution — ${E(mk)} ${E(mo)}</h3>
    <p class="small">${doc}/${list.length} motorisation(s) <b>documentée(s)</b> pour ce modèle · le reste provient de la base de pannes ou de la gamme marque (fiabilité moindre).</p>
    <table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Puissances</th><th>Source</th><th>Cohérence énergie/puiss.</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function ensureAttribUI(){ if(D("attribWrap"))return;
  const anchor=D("engineWrap")||D("puissWrap")||D("topAnalyse")?.querySelector(".grid");
  if(!anchor)return; const w=document.createElement("div"); w.id="attribWrap"; w.className="small"; w.style.marginTop="10px";
  anchor.insertAdjacentElement("afterend",w); }

/* ============ 3. PHOTOS RÉELLES (Wikimedia Commons) ============ */
const TERM_EN=[[/courroie|distribution/,"timing belt damage delamination"],[/cha[îi]ne|distribution/,"timing chain wear tensioner"],
 [/turbo/,"turbocharger failure oil leak"],[/egr/,"EGR cooler leak soot"],[/fap|cataly|cata\b/,"DPF diesel particulate filter clogged"],
 [/adblue|scr|uree/,"AdBlue crystallization SCR injector"],[/inject/,"fuel injector coking diesel"],[/batterie 12|12v/,"car battery corrosion terminal"],
 [/pack ht|ht\b|haute tension/,"electric vehicle high voltage battery damage"],[/faisceau|c[âa]blage|alternat/,"car wiring harness burnt alternator"],
 [/frein/,"overheated brake disc glazing"],[/r[ée]servoir|carburant|fuel/,"fuel tank leak line"],[/embrayage|bo[îi]te|m[ée]catron/,"clutch gearbox mechatronic wear"],
 [/culasse|joint/,"cracked cylinder head gasket"],[/pompe [àa] eau|radiat|refroid/,"water pump coolant leak radiator"],
 [/huile|lubrif|reniflard/,"engine oil leak sludge"],[/incendie|feu|flamme/,"car engine fire damage burnt"],
 [/surchauffe|temp[ée]rature/,"engine overheating damage"],[/direction|cr[ée]maill/,"steering rack leak"],[/suspension|amortis/,"shock absorber leak"],
 [/pneu|roue/,"tyre damage wheel"],[/pare-brise|vitrage|adas/,"windshield crack camera"],[/[ée]cran|multim[ée]dia/,"car infotainment screen failure"]];
function enQuery(f){ const t=N((f.systeme||"")+" "+(f.defaut||"")+" "+(f.mecanisme||""));
  for(const[re,q]of TERM_EN) if(re.test(t)) return q; return "car engine component damage"; }
function photoQueries(f){ const q=[]; const mk=(f.marque||"").split("/")[0].trim();
  if(mk&&!/multi|tous/i.test(mk)) q.push(`${mk} ${f.modele||""} ${f.motorisation||""} ${f.systeme||""}`.trim());
  q.push(`${f.systeme||""} ${f.defaut||""}`.slice(0,90));
  q.push(enQuery(f));
  q.push(`${enQuery(f)} ${mk||""}`.trim());
  return q.filter(x=>x&&x.length>3); }
const PCACHE={};
async function commonsSearch(query,limit=8){
  const key="q:"+N(query);
  if(PCACHE[key])return PCACHE[key];
  try{ const ls=localStorage.getItem("kevo_ph:"+key);
    if(ls){const o=JSON.parse(ls); if(Date.now()-o.ts<7*864e5){PCACHE[key]=o.items;return o.items;}} }catch(_){}
  const url="https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch="
    +encodeURIComponent(query)+"&gsrnamespace=6&gsrlimit="+limit+"&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=480";
  let items=[];
  try{ const r=await fetch(url); if(r.ok){ const j=await r.json(); const pages=j?.query?.pages;
    if(pages) items=Object.values(pages).map(p=>{const ii=p.imageinfo&&p.imageinfo[0]; if(!ii||!ii.thumburl)return null;
      const md=ii.extmetadata||{}; const strip=v=>(v&&v.value)?v.value.replace(/<[^>]+>/g,"").trim():"";
      return{thumb:ii.thumburl,page:ii.descriptionurl,title:(p.title||"").replace(/^File:/,""),artist:strip(md.Artist).slice(0,60),license:strip(md.LicenseShortName)};}).filter(Boolean); } }catch(_){}
  PCACHE[key]=items;
  try{ localStorage.setItem("kevo_ph:"+key, JSON.stringify({ts:Date.now(),items})); }catch(_){}
  return items;
}
async function photosForFault(f,max=6){
  const qs=photoQueries(f); let all=[];
  for(const q of qs){ const r=await commonsSearch(q,8); all=all.concat(r); if(all.length>=max)break; }
  const seen=new Set(); all=all.filter(x=>{if(seen.has(x.thumb))return false;seen.add(x.thumb);return true;}).slice(0,max);
  return {items:all,queries:qs};
}
function galleryHTML(res,f){
  if(!res.items.length){
    const g="https://www.google.com/search?tbm=isch&q="+encodeURIComponent(photoQueries(f)[0]||f.defaut);
    const b="https://www.bing.com/images/search?q="+encodeURIComponent(photoQueries(f)[0]||f.defaut);
    const w="https://commons.wikimedia.org/w/index.php?search="+encodeURIComponent(photoQueries(f)[1]||f.defaut);
    return `<p class="small">Aucune photo libre trouvée automatiquement pour cette panne. Consultation manuelle :
      <a href="${E(g)}" target="_blank" rel="noopener">Google Images</a> ·
      <a href="${E(b)}" target="_blank" rel="noopener">Bing Images</a> ·
      <a href="${E(w)}" target="_blank" rel="noopener">Wikimedia</a>.</p>`;
  }
  return `<div class="ph-grid">`+res.items.map((x,i)=>`<figure class="ph-item" data-full="${E(x.thumb)}" data-page="${E(x.page||"")}">
    <img src="${E(x.thumb)}" alt="${E(x.title)}" loading="lazy">
    <figcaption>${E(x.title.slice(0,44))}${x.license?` <span class="tag ok">${E(x.license)}</span>`:""}</figcaption></figure>`).join("")+`</div>`;
}
async function showPhotosFor(f,host){
  host.innerHTML=`<p class="small">⏳ Recherche de photos réelles : ${E(f.defaut.slice(0,70))}…</p>`;
  const res=await photosForFault(f);
  host.innerHTML=`<h3>📷 ${E(f.defaut.slice(0,90))}</h3>
    <p class="small">${E(f.marque||"")} ${E(f.modele||"")} ${E(f.motorisation||"")} · ${E(f.systeme||"")} · requêtes : ${res.queries.slice(0,2).map(E).join(" | ")}</p>`+galleryHTML(res,f);
  wireLightbox(host);
}
function wireLightbox(scope){
  scope.querySelectorAll(".ph-item").forEach(fig=>{ fig.style.cursor="zoom-in";
    fig.onclick=()=>{ const lb=D("phLightbox")||makeLightbox();
      lb.querySelector("img").src=fig.dataset.full;
      lb.querySelector(".ph-cap").innerHTML=`${E(fig.querySelector("figcaption").textContent)} ${fig.dataset.page?`· <a href="${E(fig.dataset.page)}" target="_blank" rel="noopener">source & licence</a>`:""}`;
      lb.classList.add("open"); }; });
}
function makeLightbox(){ const lb=document.createElement("div"); lb.id="phLightbox";
  lb.style.cssText="position:fixed;inset:0;z-index:400;display:none;place-items:center;background:rgba(2,4,12,.9);backdrop-filter:blur(6px);padding:20px";
  lb.innerHTML=`<div style="max-width:min(900px,94vw);text-align:center"><img style="max-height:74vh;max-width:100%;border-radius:14px;box-shadow:0 20px 70px #000"><p class="ph-cap small" style="color:#cfd6ff;margin-top:10px"></p><button class="btn ghost small" id="phClose">✕ Fermer</button></div>`;
  document.body.appendChild(lb);
  lb.addEventListener("click",e=>{ if(e.target===lb||e.target.id==="phClose")lb.classList.remove("open"); });
  return lb;
}

/* ============ 4. Onglet 📷 + injection ============ */
function injectPhotosTab(){
  if(D("v-photos"))return;
  const st=document.createElement("style"); st.textContent=`
  .ph-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));margin:10px 0}
  .ph-item{margin:0;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.14);background:rgba(9,13,34,.8);transition:transform .18s,box-shadow .18s}
  .ph-item:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,0,0,.4)}
  .ph-item img{width:100%;height:110px;object-fit:cover;display:block}
  .ph-item figcaption{font-size:.66rem;color:#93a0d6;padding:6px 7px;line-height:1.35}`;
  document.head.appendChild(st);
  const tabs=document.querySelector("#app .tabs");
  if(tabs){ const b=document.createElement("button"); b.type="button"; b.className="btn ghost"; b.dataset.nav="photos"; b.textContent="📷 Photos"; tabs.insertBefore(b, D("btnBackAdmin")); }
  const sec=document.createElement("div"); sec.id="v-photos"; sec.className="card hidden";
  sec.innerHTML=`<h2>📷 Catalogue photos par panne</h2>
    <p class="small">Recherche une panne dans la base massive, puis affiche des <b>photos réelles</b> (Wikimedia Commons, licences libres) corrélées : marque + modèle + motorisation + système + symptômes.</p>
    <div class="field"><label for="photoQ">Panne recherchée</label><input id="photoQ" placeholder="ex : 1.2 PureTech courroie délaminée · 1.5 BlueHDi AdBlue cristallisation · batterie haute tension déformée…"></div>
    <button type="button" class="btn" id="photoGo">📷 Chercher les photos</button>
    <div id="photoOut"></div>`;
  D("app")?.appendChild(sec);
  D("photoGo").addEventListener("click",runPhotoSearch);
  D("photoQ").addEventListener("keydown",e=>{if(e.key==="Enter")runPhotoSearch();});
  // bascule d'onglets incluant photos
  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-nav]"); if(!nav)return;
    const isPhoto=nav.dataset.nav==="photos";
    D("v-photos").classList.toggle("hidden",!isPhoto);
    if(isPhoto){ ["recherche","etude","obd","message"].forEach(v=>{const el=D("v-"+v);if(el)el.classList.add("hidden");});
      document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("active",x===nav)); }
    else { D("v-photos").classList.add("hidden"); }
  },true);
}
async function runPhotoSearch(){
  const q=D("photoQ").value.trim(); const out=D("photoOut"); if(!q){out.innerHTML="";return;}
  let faults=[]; try{ faults=(typeof search==="function"?search(q,4):[]); }catch(_){}
  if(!faults.length){ out.innerHTML=`<p class="small">Aucune panne de la base ne correspond. Essaie : marque + modèle + symptôme (ex : « Peugeot courroie »).</p>`; return; }
  out.innerHTML="";
  for(const f of faults){ const box=document.createElement("div"); box.className="hit"; out.appendChild(box); showPhotosFor(f,box); }
}

/* ============ 5. renderResults enrichi (boutons 📷 + notes) ============ */
let LAST_FAULTS=[];
function overrideResults(){
  window.renderResults=function(){
    const q=(D("q")?.value||"").trim(), box=D("results"); if(!box)return;
    const themeOk=e=>(typeof THEME==="undefined"||THEME==="tous"||(e.themes||[]).includes(THEME));
    const card=(e,i)=>{ let h; try{h=hitCard(e);}catch(_){h=`<div class="hit"><b>${E(e.defaut||"")}</b></div>`;}
      const mk=(e.marque||"").split("/")[0].trim(), mo=(e.modele||"").split("/")[0].trim();
      const pw=(window.POWER&&mk&&!/multi|tous/i.test(mk))?POWER.knownPowers(mk,mo,e.motorisation||""):[];
      if(pw.length)h+=`<div class="de-note" style="color:#93a0d6;font-size:.72rem;margin:2px 0 4px">⚙️ Puissances : ${pw.slice(0,8).map(x=>x.ch+" ch").join(" · ")}</div>`;
      h+=`<button class="de-use" data-photo="${i}">📷 Photos réelles</button>`;
      return h; };
    if(!q){ LAST_FAULTS=(typeof search==="function"?search(""):(typeof BASE!=="undefined"?BASE:[]).filter(themeOk)).slice(0,20);
      box.innerHTML=LAST_FAULTS.map((e,i)=>card(e,i)).join("")||`<p class="small">Base vide.</p>`; return; }
    const veh=(typeof searchVehicles==="function")?searchVehicles(q):[];
    LAST_FAULTS=(typeof search==="function")?search(q):[];
    const vcard=v=>{ let h; try{h=vehCard(v);}catch(_){h=`<div class="hit"><b>🚗 ${E(v.marque)} ${E(v.modele)}</b></div>`;}
      const eng=(window.POWER?POWER.enginesFor(v.marque,v.modele):[])||[];
      if(eng.length)h+=`<div class="de-note" style="color:#93a0d6;font-size:.72rem">⚙️ Motorisations : ${eng.slice(0,6).map(x=>x.m+" ("+x.en+")").join(" · ")}</div>`;
      return h; };
    box.innerHTML=(veh.length?`<h3 class="de-h3" style="color:#00e5ff;margin:14px 0 6px">🚗 Véhicules · motorisations · puissances (${veh.length})</h3>`+veh.map(vcard).join(""):"")+
      `<h3 class="de-h3" style="color:#00e5ff;margin:14px 0 6px">🔧 Pannes &amp; rappels (${LAST_FAULTS.length})</h3>`+
      (LAST_FAULTS.length?LAST_FAULTS.map((e,i)=>card(e,i)).join(""):`<p class="small">Aucune panne pour cette saisie.</p>`);
  };
  D("results")?.addEventListener("click",e=>{ const b=e.target.closest("[data-photo]"); if(!b)return;
    const f=LAST_FAULTS[+b.dataset.photo]; if(!f)return;
    injectPhotosTab(); D("v-photos").classList.remove("hidden");
    ["recherche","etude","obd","message"].forEach(v=>{const el=D("v-"+v);if(el)el.classList.add("hidden");});
    document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("active",x.dataset.nav==="photos"));
    D("photoQ").value=f.defaut; runPhotoSearch(); });
}

/* ============ 6. boot ============ */
function boot(){
  if(!D("topAnalyse"))return setTimeout(boot,120);
  mergeEngines();
  ensureAttribUI();
  injectPhotosTab();
  overrideResults();
  // énergie auto + vérification à chaque changement pertinent
  ["cMarque","cModele","cMoteur"].forEach(id=>{const el=D(id);if(!el)return;
    el.addEventListener("change",()=>{syncEnergy(true);verifyAttribution();});
    el.addEventListener("input",()=>{clearTimeout(el.__t);el.__t=setTimeout(()=>{syncEnergy(false);verifyAttribution();},300);});});
  D("cMoteur")?.addEventListener("change",()=>syncEnergy(true));
  setInterval(()=>{ if(!D("de-panel")?.classList.contains("open")){ verifyAttribution(); } },5000);
  syncEnergy(false); verifyAttribution();
  console.log("📷 Catalog Engine v1 prêt (photos + motorisations + autovérification)");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.CATALOG_ENGINE={photosForFault,showPhotosFor,verifyAttribution,syncEnergy,mergeEngines,extra:EXTRA};
})();
