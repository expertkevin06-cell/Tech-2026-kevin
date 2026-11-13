/* ============================================================================
   KEV TECH & FIRE — CATALOG ENGINE v2
   • Onglet « 📷 Catalogue photos par panne » : affiche d'abord les PHOTOS
     LOCALES rattachées à la panne (admin), puis complète avec Wikimedia.
   • Motorisations complémentaires (EXTRA) + autovérification d'attribution.
   • NE surcharge plus renderResults (photo-admin v2 en est propriétaire).
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const EXTRA={
"peugeot|3008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[130,180]},{m:"1.5 BlueHDi (dit 1.5 HDi)",cc:1499,en:"diesel",ch:[100,120,130]},{m:"1.6 BlueHDi",cc:1560,en:"diesel",ch:[120]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[150,180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225,300]},{m:"Électrique e-3008",cc:0,en:"electrique",ch:[210,230,325]}],
"peugeot|208":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[75,100,130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100]},{m:"Électrique e-208",cc:0,en:"electrique",ch:[136,156]}],
"peugeot|2008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[100,130,155]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[110,130]},{m:"Électrique e-2008",cc:0,en:"electrique",ch:[136,156]}],
"peugeot|5008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[150,180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225]},{m:"Électrique e-5008",cc:0,en:"electrique",ch:[210,230]}],
"citroen|c3":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[82,100,110]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100]},{m:"Électrique ë-C3",cc:0,en:"electrique",ch:[113]}],
"citroen|c4":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[100,130,155]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[110,130]},{m:"1.6 Hybrid",cc:1598,en:"hybride",ch:[145]},{m:"Électrique e-C4",cc:0,en:"electrique",ch:[136,156]}],
"renault|scenic":[{m:"1.3 TCe",cc:1332,en:"essence",ch:[140,160]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[110,115]},{m:"1.7 Blue dCi",cc:1749,en:"diesel",ch:[150]},{m:"Électrique E-Tech",cc:0,en:"electrique",ch:[170,220]}],
"volkswagen|golf":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[130,150]},{m:"2.0 TSI GTI",cc:1984,en:"essence",ch:[245,300]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,200]},{m:"1.4 TSI eHybrid",cc:1395,en:"hybride",ch:[204,245]}],
"skoda|elroq":[{m:"Elroq 50 (électrique)",cc:0,en:"electrique",ch:[170]},{m:"Elroq 60 (électrique)",cc:0,en:"electrique",ch:[204]},{m:"Elroq 85 (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Elroq 85x AWD (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Elroq RS (électrique)",cc:0,en:"electrique",ch:[340]}],
"skoda|enyaq":[{m:"Enyaq 60 (électrique)",cc:0,en:"electrique",ch:[204]},{m:"Enyaq 85 (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Enyaq 85x AWD (électrique)",cc:0,en:"electrique",ch:[286]},{m:"Enyaq RS (électrique)",cc:0,en:"electrique",ch:[340]}]
};
function mergeEngines(){if(!window.POWER||!POWER.db)return;
 for(const[k,arr]of Object.entries(EXTRA)){const cur=POWER.db[k]||[];const seen=new Set(cur.map(e=>N(e.m)+"|"+e.en));
  arr.forEach(e=>{const key=N(e.m)+"|"+e.en;if(!seen.has(key)){cur.push(e);seen.add(key);}});POWER.db[k]=cur;}}

/* ---------- autovérification d'attribution ---------- */
function ensureAttribUI(){if(D("attribWrap"))return;
 const a=D("engineWrap")||D("puissWrap")||D("topAnalyse")?.querySelector(".grid");if(!a)return;
 const w=document.createElement("div");w.id="attribWrap";w.className="small";w.style.marginTop="10px";a.insertAdjacentElement("afterend",w);}
function verifyAttribution(){const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"";const wrap=D("attribWrap");if(!wrap)return;
 if(!mk||!mo){wrap.innerHTML="";return;}
 const list=(window.POWER?POWER.enginesFor(mk,mo):[])||[];
 if(!list.length){wrap.innerHTML=`<p class="small">⚠️ Aucune motorisation attribuable à ${E(mk)} ${E(mo)}.</p>`;return;}
 const doc=list.filter(e=>e.src==="documenté"||e.src==="catalogue").length;
 wrap.innerHTML=`<h3>🧾 Autovérification d'attribution — ${E(mk)} ${E(mo)}</h3>
  <p class="small">${doc}/${list.length} motorisation(s) documentée(s) ; le reste = base de pannes ou gamme marque.</p>
  <table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Puissances</th><th>Source</th></tr></thead><tbody>`+
  list.map(e=>`<tr><td><b>${E(e.m)}</b></td><td>${e.en}</td><td>${(e.ch||[]).join("/")} ch</td><td><span class="tag ${e.src==="gamme"?"":"ok"}">${e.src}</span></td></tr>`).join("")+`</tbody></table>`;}
const syncEnergy=()=>{if(window.POWER?.autoAttribute)window.POWER.autoAttribute({toast:false});};

/* ---------- Wikimedia Commons (complément web) ---------- */
const TERM_EN=[[/courroie|distribution/,"timing belt damage delamination"],[/cha[îi]ne|distribution/,"timing chain wear tensioner"],
 [/turbo/,"turbocharger failure oil leak"],[/egr/,"EGR cooler leak soot"],[/fap|cataly|cata\b/,"DPF diesel particulate filter clogged"],
 [/adblue|scr|uree/,"AdBlue crystallization SCR injector"],[/inject/,"fuel injector coking diesel"],[/batterie 12|12v/,"car battery corrosion terminal"],
 [/pack ht|haute tension/,"electric vehicle high voltage battery damage"],[/faisceau|c[âa]blage|alternat/,"car wiring harness burnt alternator"],
 [/frein/,"overheated brake disc glazing"],[/r[ée]servoir|carburant/,"fuel tank leak line"],[/embrayage|bo[îi]te|m[ée]catron/,"clutch gearbox mechatronic wear"],
 [/culasse|joint/,"cracked cylinder head gasket"],[/pompe [àa] eau|radiat|refroid/,"water pump coolant leak radiator"],
 [/huile|lubrif/,"engine oil leak sludge"],[/incendie|feu|flamme/,"car engine fire damage burnt"],[/surchauffe/,"engine overheating damage"]];
function enQuery(f){const t=N((f.systeme||"")+" "+(f.defaut||"")+" "+(f.mecanisme||""));
 for(const[re,q]of TERM_EN)if(re.test(t))return q;return "car engine component damage";}
function photoQueries(f){const q=[];const mk=(f.marque||"").split("/")[0].trim();
 if(mk&&!/multi|tous/i.test(mk))q.push(`${mk} ${f.modele||""} ${f.motorisation||""} ${f.systeme||""}`.trim());
 q.push(`${f.systeme||""} ${f.defaut||""}`.slice(0,90));q.push(enQuery(f));return q.filter(x=>x&&x.length>3);}
const PC={};
async function commonsSearch(query,limit=8){const key="q:"+N(query);if(PC[key])return PC[key];
 try{const ls=localStorage.getItem("kevo_ph:"+key);if(ls){const o=JSON.parse(ls);if(Date.now()-o.ts<7*864e5){PC[key]=o.items;return o.items;}}}catch(_){}
 const url="https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch="+encodeURIComponent(query)+"&gsrnamespace=6&gsrlimit="+limit+"&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=480";
 let items=[];
 try{const r=await fetch(url);if(r.ok){const j=await r.json();const pages=j?.query?.pages;
  if(pages)items=Object.values(pages).map(p=>{const ii=p.imageinfo&&p.imageinfo[0];if(!ii||!ii.thumburl)return null;
   const md=ii.extmetadata||{};const strip=v=>(v&&v.value)?v.value.replace(/<[^>]+>/g,"").trim():"";
   return{thumb:ii.thumburl,page:ii.descriptionurl,title:(p.title||"").replace(/^File:/,""),artist:strip(md.Artist).slice(0,60),license:strip(md.LicenseShortName)};}).filter(Boolean);}}catch(_){}
 PC[key]=items;try{localStorage.setItem("kevo_ph:"+key,JSON.stringify({ts:Date.now(),items}));}catch(_){}
 return items;}
async function photosForFaultWeb(f,max=6){const qs=photoQueries(f);let all=[];
 for(const q of qs){const r=await commonsSearch(q,8);all=all.concat(r);if(all.length>=max)break;}
 const s=new Set();return{items:all.filter(x=>{if(s.has(x.thumb))return false;s.add(x.thumb);return true;}).slice(0,max),queries:qs};}
function webGallery(res){if(!res.items.length){
  const g="https://www.google.com/search?tbm=isch&q="+encodeURIComponent(res.queries[0]||"");
  return `<p class="small">Aucune photo libre trouvée. <a href="${E(g)}" target="_blank" rel="noopener">Google Images</a>.</p>`;}
 return `<div class="ph-grid">`+res.items.map(x=>`<figure class="ph-item" data-full="${E(x.thumb)}" data-page="${E(x.page||"")}"><img src="${E(x.thumb)}" alt="${E(x.title)}" loading="lazy"><figcaption>${E(x.title.slice(0,44))}${x.license?` <span class="tag ok">${E(x.license)}</span>`:""}</figcaption></figure>`).join("")+`</div>`;}

/* ---------- onglet 📷 : LOCAL d'abord, web ensuite ---------- */
function localGallery(f){const ph=(window.PHOTO_ADMIN?PHOTO_ADMIN.photosForFault(f):[])||[];
 if(!ph.length)return `<p class="small">Aucune photo locale rattachée à cette panne. (Admin : 🖼️ Photos & pannes → rattacher → 📡 Publier.)</p>`;
 return `<div class="ph-grid">`+ph.map(p=>`<figure class="ph-item" data-local="${E(p.id)}"><img src="${E(p.url)}" alt="${E(p.cap||"photo panne")}" loading="lazy"><figcaption>📌 ${E(p.cap||"photo admin")}</figcaption></figure>`).join("")+`</div>`;}
async function showFaultGallery(f){const out=D("photoOut");if(!out)return;
 const box=document.createElement("div");box.className="hit";out.prepend(box);
 box.innerHTML=`<h3>🖼️ ${E((f.defaut||"").slice(0,90))}</h3>
  <p class="small">${E(f.marque||"")} ${E(f.modele||"")} ${E(f.motorisation||"")} · ${E(f.systeme||"")}</p>
  <h3 style="margin-top:8px">📌 Photos intégrées (catalogue local)</h3>`+localGallery(f)+
  `<h3 style="margin-top:10px">🌐 Photos web complémentaires (Commons)</h3><p class="small">⏳ recherche…</p>`;
 wireLocal(box);
 const res=await photosForFaultWeb(f);
 box.querySelector("h3:last-of-type").nextElementSibling.outerHTML=webGallery(res);
 wireWeb(box);}
function wireLocal(scope){scope.querySelectorAll("[data-local]").forEach(fig=>{fig.style.cursor="zoom-in";
 fig.onclick=()=>{const id=fig.dataset.local;const all=window.PHOTO_ADMIN?PHOTO_ADMIN.all():{};
  for(const k in all){const h=all[k].find(p=>p.id===id);if(h){PHOTO_ADMIN.lightbox(h.url,h.cap);return;}}};});}
function wireWeb(scope){scope.querySelectorAll(".ph-item[data-full]").forEach(fig=>{fig.style.cursor="zoom-in";
 fig.onclick=()=>{const lb=D("phLightbox")||makeLb();lb.querySelector("img").src=fig.dataset.full;
  lb.querySelector(".ph-cap").innerHTML=`${E(fig.querySelector("figcaption").textContent)} ${fig.dataset.page?`· <a href="${E(fig.dataset.page)}" target="_blank" rel="noopener">source</a>`:""}`;lb.classList.add("open");};});}
function makeLb(){const lb=document.createElement("div");lb.id="phLightbox";
 lb.style.cssText="position:fixed;inset:0;z-index:400;display:none;place-items:center;background:rgba(2,4,12,.9);backdrop-filter:blur(6px);padding:20px";
 lb.innerHTML=`<div style="max-width:min(900px,94vw);text-align:center"><img style="max-height:74vh;max-width:100%;border-radius:14px"><p class="ph-cap small" style="color:#cfd6ff;margin-top:10px"></p><button class="btn ghost small" id="phClose">✕ Fermer</button></div>`;
 document.body.appendChild(lb);lb.addEventListener("click",e=>{if(e.target===lb||e.target.id==="phClose")lb.classList.remove("open");});return lb;}
function injectPhotosTab(){if(D("v-photos"))return;
 const st=document.createElement("style");st.textContent=`
 .ph-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));margin:10px 0}
 .ph-item{margin:0;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.14);background:rgba(9,13,34,.8);transition:transform .18s}
 .ph-item:hover{transform:translateY(-3px)}
 .ph-item img{width:100%;height:110px;object-fit:cover;display:block}
 .ph-item figcaption{font-size:.66rem;color:#93a0d6;padding:6px 7px}`;
 document.head.appendChild(st);
 const tabs=document.querySelector("#app .tabs");
 if(tabs){const b=document.createElement("button");b.type="button";b.className="btn ghost";b.dataset.nav="photos";b.textContent="📷 Photos";tabs.insertBefore(b,D("btnBackAdmin"));}
 const sec=document.createElement("div");sec.id="v-photos";sec.className="card hidden";
 sec.innerHTML=`<h2>📷 Catalogue photos par panne</h2>
  <p class="small">Recherche une panne : les <b>photos intégrées</b> (admin) s'affichent d'abord, complétées par des photos réelles libres (Commons).</p>
  <div class="field"><label for="photoQ">Panne recherchée</label><input id="photoQ" placeholder="ex : courroie distribution délaminée · AdBlue cristallisation · batterie HT déformée…"></div>
  <button type="button" class="btn" id="photoGo">📷 Chercher</button><div id="photoOut"></div>`;
 D("app")?.appendChild(sec);
 D("photoGo").addEventListener("click",runPhotoSearch);
 D("photoQ").addEventListener("keydown",e=>{if(e.key==="Enter")runPhotoSearch();});
 document.addEventListener("click",e=>{const nav=e.target.closest("[data-nav]");if(!nav)return;
  const isP=nav.dataset.nav==="photos";D("v-photos").classList.toggle("hidden",!isP);
  if(isP){["recherche","etude","obd","message"].forEach(v=>{const el=D("v-"+v);if(el)el.classList.add("hidden");});
   document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("active",x===nav));}
  else D("v-photos").classList.add("hidden");},true);}
async function runPhotoSearch(){const q=D("photoQ").value.trim();const out=D("photoOut");if(!q){out.innerHTML="";return;}
 let faults=[];try{faults=(typeof search==="function"?search(q,5):[]);}catch(_){}
 if(!faults.length){out.innerHTML=`<p class="small">Aucune panne correspondante. Essaie marque + symptôme (ex : « Peugeot courroie »).</p>`;return;}
 out.innerHTML="";for(const f of faults)showFaultGallery(f);}

/* ---------- boot ---------- */
function boot(){if(!D("topAnalyse"))return setTimeout(boot,120);
 mergeEngines();ensureAttribUI();injectPhotosTab();
 ["cMarque","cModele","cMoteur"].forEach(id=>{const el=D(id);if(!el)return;
  el.addEventListener("change",()=>{syncEnergy();verifyAttribution();});});
 setInterval(()=>{if(!D("de-panel")?.classList.contains("open"))verifyAttribution();},5000);
 verifyAttribution();
 console.log("📷 Catalog Engine v2 prêt (photos locales prioritaires)");}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.CATALOG_ENGINE={verifyAttribution,syncEnergy,showFaultGallery,runPhotoSearch,commonsSearch,extra:EXTRA};
})();
