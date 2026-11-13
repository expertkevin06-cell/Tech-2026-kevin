/* ============================================================================
   KEV TECH & FIRE — PHOTO & FAULT ADMIN ENGINE v2
   • Photos réelles (coller / glisser / fichier / URL) compressées, rattachées
     par IDENTIFIANT de panne (existante ou nouvelle) — plus aucun décalage.
   • Rendu : miniatures sous chaque fiche correspondante (recherche), bouton
     « 🖼️ Photos (n) », lightbox, et alimentation de l'onglet 📷 Catalogue.
   • Publication sans token via Sync Engine (canal anonyme) + miroir GitHub
     optionnel (data/img + data/photos.json + data/manual.json).
   • Tiers : reçoivent photos + pannes et les voient partout (recherche, étude,
     compte rendu, catalogue photos).
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T=(m,ms=4200)=>{try{if(typeof toast==="function")toast(m,ms);else console.log(m);}catch(_){console.log(m);}};
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
const sig=e=>e.id||hash([e.source,e.campagne,e.marque,e.modele,e.motorisation,e.defaut].map(N).join("|"));

let PHOTOS={};                 // faultId -> [{id,url,cap,ts}]
let PENDING=[];
let OVERLAY=JSON.parse(localStorage.getItem("kevo_manual")||'{"entries":[],"photos":[]}');
let LASTF=[];

/* ---------- GitHub (optionnel, miroir longue durée) ---------- */
const ghToken=()=>{const v=(D("ghPat")?.value||localStorage.getItem("ghpat")||"").trim();
 if(v&&v!=="••••••••")localStorage.setItem("ghpat",v);return v==="••••••••"?"":v;};
const REPO=()=>localStorage.getItem("kevo_repo")||"expertkevin06-cell/Tech-2026-kevin";
const b64=s=>{const b=new TextEncoder().encode(s);let bin="";const C=0x8000;for(let i=0;i<b.length;i+=C)bin+=String.fromCharCode.apply(null,b.subarray(i,i+C));return btoa(bin);};
async function ghGet(path){try{const r=await fetch(`https://api.github.com/repos/${REPO()}/contents/${path}`,{headers:{Accept:"application/vnd.github+json",...(ghToken()?{Authorization:"Bearer "+ghToken()}:{})}});
 if(!r.ok)return null;const j=await r.json();return j.content?decodeURIComponent(escape(atob(j.content.replace(/\n/g,"")))):null;}catch(e){return null;}}
async function ghPut(path,content,msg){const tk=ghToken();if(!tk)return false;
 let sha=null;try{const r=await fetch(`https://api.github.com/repos/${REPO()}/contents/${path}`,{headers:{Authorization:"Bearer "+tk,Accept:"application/vnd.github+json"}});if(r.ok)sha=(await r.json()).sha;}catch(e){}
 const r=await fetch(`https://api.github.com/repos/${REPO()}/contents/${path}`,{method:"PUT",headers:{Authorization:"Bearer "+tk,Accept:"application/vnd.github+json","Content-Type":"application/json"},
  body:JSON.stringify({message:msg,content:b64(content),branch:"main",...(sha?{sha}:{})})});
 return r.ok||r.status===200||r.status===201;}

/* ---------- compression ---------- */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
async function compressImage(src,maxW=1000,q=0.72,target=180000){
 const img=typeof src==="string"?await loadImg(src):src;
 const sc=Math.min(1,maxW/img.width);const c=document.createElement("canvas");
 c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
 c.getContext("2d").drawImage(img,0,0,c.width,c.height);
 let url=c.toDataURL("image/jpeg",q);
 while(url.length*0.75>target&&q>0.3){q-=0.08;url=c.toDataURL("image/jpeg",q);}
 return url;}
const du2b64=du=>du.slice(du.indexOf(",")+1);

/* ---------- intake ---------- */
function addPending(src,cap){PENDING.push({id:"ph-"+hash(src+Date.now()+PENDING.length),src,cap:cap||"",ts:Date.now()});renderPending();}
async function intakeFiles(files,cap){for(const f of files){if(!/^image\//.test(f.type)){T("⚠️ "+f.name+" ignoré.");continue;}
 addPending(await compressImage(f),cap||f.name);}}
async function intakeUrl(u,cap){try{addPending(await compressImage(u),cap||u);}catch(e){addPending(u,cap||u);T("ℹ️ URL conservée en lien direct.");}}
function wireIntake(){
 document.addEventListener("paste",async e=>{
  if(!(typeof isAdmin!=="undefined"&&isAdmin))return;
  const imgs=[...(e.clipboardData?.items||[])].filter(i=>/^image\//.test(i.type));
  if(!imgs.length)return; e.preventDefault();
  for(const it of imgs){const f=it.getAsFile();if(f)addPending(await compressImage(f),"photo collée");}
  T("📷 "+imgs.length+" photo(s) en attente — rattache-les.");});
 const dz=D("paDrop");
 if(dz){["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("drag");}));
  ["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("drag");}));
  dz.addEventListener("drop",e=>{if(e.dataTransfer.files.length)intakeFiles([...e.dataTransfer.files]);});
  dz.addEventListener("click",()=>D("paFile")?.click());}
 D("paFile")?.addEventListener("change",e=>{if(e.target.files.length)intakeFiles([...e.target.files]);e.target.value="";});
 D("paUrlGo")?.addEventListener("click",()=>{const u=D("paUrl")?.value.trim();if(u)intakeUrl(u,D("paCap")?.value||"");D("paUrl").value="";});
}

/* ---------- rattachement / création ---------- */
function faultOptions(){const q=N(D("paFaultQ")?.value||"");
 return (typeof BASE!=="undefined"?BASE:[]).filter(e=>!q||N(e.defaut+" "+e.marque+" "+e.modele+" "+(e.dtc||[]).join(" ")).includes(q)).slice(0,60);}
function renderFaultPicker(){const sel=D("paFault");if(!sel)return;
 sel.innerHTML=`<option value="__new__">➕ Créer une NOUVELLE panne…</option>`+
  faultOptions().map(e=>`<option value="${E(e.id||sig(e))}">${E((e.defaut||"").slice(0,70))} · ${E(e.marque||"")} ${E(e.modele||"")}</option>`).join("");}
const currentTargetId=()=>D("paFault")?.value||"__new__";
function readNewFault(){const g=id=>D(id)?.value||"";const feu=D("paFeu")?.checked;
 const ch=(g("paCh").match(/\d{2,4}/g)||[]).map(Number);
 return{id:"admin-"+Date.now(),themes:["technique",...(feu?["incendie"]:[])],type:g("paCampagne")?"rappel":"panne",source:"admin",
  marque:g("paMarque")||"Multi-marques",modele:g("paModele")||"Tous",motorisation:g("paMoteur"),
  annees:(g("paAnnees").match(/\d{4}/g)||[]).length?[(g("paAnnees").match(/\d{4}/g)||[]).map(Number)[0],(g("paAnnees").match(/\d{4}/g)||[]).map(Number).pop()]:null,
  energie:g("paEnergie"),systeme:g("paSys"),dtc:(g("paDtc").toUpperCase().match(/[PCBU]\d{4}/g)||[]),
  symptomes:g("paSympt").split(",").map(x=>x.trim()).filter(Boolean),
  defaut:g("paTitre")||"Nouvelle panne",mecanisme:g("paMeca"),
  consequences:g("paConseq").split("\n").map(x=>x.trim()).filter(Boolean),
  indices:g("paIndices").split("\n").map(x=>x.trim()).filter(Boolean),
  risque_feu:feu,chaine_feu:feu?(g("paChaine")||"Défaut documenté → mécanisme → risque incendie à confirmer"):"",
  gravite:g("paGrav")||(feu?"critique":"eleve"),campagne:g("paCampagne"),url:g("paUrlSrc"),
  puissance_ch:ch.length?ch:null,date:new Date().toISOString().slice(0,10)};}
function attachPending(){const tid=currentTargetId();
 if(tid==="__new__"){const nf=readNewFault();if(!nf.defaut){T("❌ Titre requis.");return;}
  OVERLAY.entries.push(nf);
  PENDING.forEach(p=>OVERLAY.photos.push({id:p.id,fault:nf.id,url:p.src,cap:p.cap,ts:p.ts}));
  PENDING=[];localStorage.setItem("kevo_manual",JSON.stringify(OVERLAY));mergeLocal();
  T("✅ Panne créée + photos rattachées. Publie (📡 ou 📤).");renderPending();return;}
 PENDING.forEach(p=>OVERLAY.photos.push({id:p.id,fault:tid,url:p.src,cap:p.cap,ts:p.ts}));
 const n=PENDING.length;PENDING=[];localStorage.setItem("kevo_manual",JSON.stringify(OVERLAY));mergeLocal();
 T("✅ "+n+" photo(s) rattachée(s) à la panne.");renderPending();}
function mergeLocal(){
 if(typeof BASE!=="undefined"){const map=new Map();BASE.forEach(e=>map.set(sig(e),e));
  OVERLAY.entries.forEach(e=>map.set(sig(e),e));BASE=[...map.values()];
  try{indexBase();}catch(_){}try{fillFilters();}catch(_){}}
 PHOTOS={};OVERLAY.photos.forEach(p=>{(PHOTOS[p.fault]=PHOTOS[p.fault]||[]).push(p);});
 // fusionne aussi les photos publiées reçues via sync (déjà dans PHOTOS via pull) 
}
async function loadPublished(){
 try{const m=await fetch("data/manual.json?ts="+Date.now(),{cache:"no-store"});
  if(m.ok){const j=await m.json();const arr=Array.isArray(j)?j:(j.entries||[]);
   if(typeof BASE!=="undefined"){const map=new Map();BASE.forEach(e=>map.set(sig(e),e));arr.forEach(e=>map.set(sig(e),e));BASE=[...map.values()];try{indexBase();fillFilters();}catch(_){}}}}catch(_){}
 try{const p=await fetch("data/photos.json?ts="+Date.now(),{cache:"no-store"});
  if(p.ok){const j=await p.json();const arr=Array.isArray(j)?j:(j.photos||[]);
   arr.forEach(x=>{if(!OVERLAY.photos.some(o=>o.id===x.id))(PHOTOS[x.fault]=PHOTOS[x.fault]||[]).push(x);});
   for(const k in PHOTOS){const s=new Set();PHOTOS[k]=PHOTOS[k].filter(x=>!s.has(x.id)&&s.add(x.id));}}}catch(_){}
 try{if(typeof renderResults==="function")renderResults();}catch(_){}}
async function publishGithub(){const tk=ghToken();if(!tk){T("ℹ️ Aucun token : publication via canal 📡 (recommandé).");return false;}
 for(const p of OVERLAY.photos){if(p.url&&p.url.startsWith("data:")){if(await ghPut("data/img/"+p.id+".jpg",du2b64(p.url),"KEV — photo "+p.id))p.url="data/img/"+p.id+".jpg";}}
 let ex=[];try{const c=await ghGet("data/photos.json");if(c)ex=JSON.parse(c);}catch(_){}
 const s=new Set(ex.map(x=>x.id));OVERLAY.photos.forEach(p=>{if(!s.has(p.id))ex.push(p);});
 const a=await ghPut("data/photos.json",JSON.stringify(ex,null,1),"KEV — photos.json");
 let me=[];try{const c=await ghGet("data/manual.json");if(c){const j=JSON.parse(c);me=Array.isArray(j)?j:(j.entries||[]);}}catch(_){}
 const ms=new Set(me.map(sig));OVERLAY.entries.forEach(e=>{if(!ms.has(sig(e)))me.push(e);});
 const b=await ghPut("data/manual.json",JSON.stringify(me,null,1),"KEV — manual.json");
 localStorage.setItem("kevo_manual",JSON.stringify(OVERLAY));await loadPublished();mergeLocal();
 return a&&b;}

/* ---------- accès photos par identifiant (API publique) ---------- */
function photosFor(faultId){return PHOTOS[faultId]||[];}
function photosForFault(f){return photosFor(f.id||sig(f));}
function allPhotos(){return PHOTOS;}

/* ---------- lightbox ---------- */
function lightbox(src,cap){let lb=D("paLightbox");
 if(!lb){lb=document.createElement("div");lb.id="paLightbox";
  lb.style.cssText="position:fixed;inset:0;z-index:500;display:none;place-items:center;background:rgba(2,4,12,.92);backdrop-filter:blur(6px);padding:18px";
  lb.innerHTML=`<div style="text-align:center;max-width:min(940px,95vw)"><img style="max-height:76vh;max-width:100%;border-radius:14px;box-shadow:0 20px 70px #000"><p class="small" style="color:#cfd6ff;margin-top:10px"></p><button class="btn ghost small" id="paLbClose">✕ Fermer</button></div>`;
  document.body.appendChild(lb);
  lb.addEventListener("click",e=>{if(e.target===lb||e.target.id==="paLbClose")lb.style.display="none";});}
 lb.querySelector("img").src=src;lb.querySelector("p").textContent=cap||"";lb.style.display="grid";}

/* ---------- RENDU recherche : fiches taggées data-fid + photos locales ---------- */
function photoStrip(f){const ph=photosForFault(f);if(!ph.length)return "";
 return `<div class="chips" style="margin-top:6px">`+
  ph.slice(0,4).map(p=>`<img data-lb="${E(p.id)}" src="${E(p.url)}" alt="${E(p.cap||"photo panne")}" style="width:70px;height:52px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,229,255,.45);cursor:zoom-in">`).join("")+
  (ph.length>4?`<span class="tag">+${ph.length-4}</span>`:"")+
  `<button type="button" class="de-use" data-gal="${E(f.id||sig(f))}">🖼️ Photos (${ph.length})</button></div>`;}
function overrideResults(){
 window.renderResults=function(){
  const q=(D("q")?.value||"").trim(),box=D("results");if(!box)return;
  const themeOk=e=>(typeof THEME==="undefined"||THEME==="tous"||(e.themes||[]).includes(THEME));
  let veh=[],faults=[];
  if(!q){faults=(typeof BASE!=="undefined"?BASE:[]).filter(themeOk).slice(0,25);}
  else{veh=(typeof searchVehicles==="function")?searchVehicles(q):[];faults=(typeof search==="function")?search(q):[];}
  LASTF=faults;
  const pw=(typeof POWER!=="undefined")?POWER:null;
  const faultCard=e=>{
   let h;try{h=hitCard(e);}catch(_){h=`<div class="hit"><b>${E(e.defaut||"")}</b></div>`;}
   let notes="";
   if(pw){const mk=(e.marque||"").split("/")[0].trim(),mo=(e.modele||"").split("/")[0].trim();
    if(mk&&!/multi|tous/i.test(mk)){const p=pw.knownPowers(mk,mo,e.motorisation||"");
     if(p.length)notes+=`<div class="de-note" style="color:#93a0d6;font-size:.72rem;margin:2px 0 4px">⚙️ Puissances : ${p.slice(0,8).map(x=>x.ch+" ch").join(" · ")}</div>`;}}
   return `<div data-fid="${E(e.id||sig(e))}">`+h+notes+photoStrip(e)+
    `<button type="button" class="de-use" data-cs="${E((e.defaut||"").slice(0,60))}">📷 Photos web</button></div>`;};
  const vehCardSafe=v=>{let h;try{h=vehCard(v);}catch(_){h=`<div class="hit"><b>🚗 ${E(v.marque)} ${E(v.modele)}</b></div>`;}
   if(pw){const eng=pw.enginesFor(v.marque,v.modele);if(eng.length)h+=`<div class="de-note" style="color:#93a0d6;font-size:.72rem">⚙️ Motorisations : ${eng.slice(0,6).map(x=>x.m+" ("+x.en+")").join(" · ")}</div>`;}
   return h;};
  box.innerHTML=(veh.length?`<h3 class="de-h3" style="color:#00e5ff;margin:14px 0 6px">🚗 Véhicules · motorisations · puissances (${veh.length})</h3>`+veh.map(vehCardSafe).join(""):"")+
   `<h3 class="de-h3" style="color:#00e5ff;margin:14px 0 6px">🔧 Pannes &amp; rappels (${faults.length})</h3>`+
   (faults.length?faults.map(faultCard).join(""):`<p class="small">Aucune panne pour cette saisie.</p>`);
 };
 const box=D("results");
 if(box&&!box.__phWired){box.__phWired=true;
  box.addEventListener("click",e=>{
   const lb=e.target.closest("[data-lb]");
   if(lb){const id=lb.dataset.lb;for(const k in PHOTOS){const hit=PHOTOS[k].find(p=>p.id===id);if(hit){lightbox(hit.url,hit.cap);return;}}return;}
   const gal=e.target.closest("[data-gal]");
   if(gal){openGallery(gal.dataset.gal);return;}
   const cs=e.target.closest("[data-cs]");
   if(cs){openCommons(cs.dataset.cs);return;}
  });}
}
function openGallery(fid){
 // bascule vers l'onglet 📷 et affiche local + web pour cette panne
 const f=(typeof BASE!=="undefined"?BASE:[]).find(e=>(e.id||sig(e))===fid);
 if(window.CATALOG_ENGINE?.showFaultGallery){document.querySelector('[data-nav="photos"]')?.click();window.CATALOG_ENGINE.showFaultGallery(f||{id:fid,defaut:fid});}
 else if(f){document.querySelector('[data-nav="photos"]')?.click();const pq=D("photoQ");if(pq){pq.value=f.defaut;D("photoGo")?.click();}}
}
function openCommons(query){document.querySelector('[data-nav="photos"]')?.click();
 const pq=D("photoQ");if(pq){pq.value=query;D("photoGo")?.click();}}

/* ---------- UI admin ---------- */
function injectAdmin(){if(D("paPanel"))return;
 const tabs=document.querySelector("#admin .tabs");
 if(tabs){const b=document.createElement("button");b.type="button";b.className="btn ghost";b.dataset.adm="photos";b.textContent="🖼️ Photos & pannes";
  tabs.insertBefore(b,D("btnAdminToApp"));}
 const sec=document.createElement("div");sec.id="a-photos";sec.className="card hidden";
 sec.innerHTML=`<div id="paPanel">
  <h2>🖼️ Photos réelles &amp; nouvelles pannes (admin)</h2>
  <p class="small">Colle (Ctrl+V), glisse ou choisis des photos de défauts réels ; rattache-les à une panne existante ou nouvelle. Diffusion aux tiers via <b>📡 Sync</b> (sans token) ou miroir GitHub (token optionnel).</p>
  <div id="paDrop" style="border:2px dashed rgba(0,229,255,.5);border-radius:14px;padding:18px;text-align:center;color:#93a0d6;cursor:pointer;background:rgba(0,229,255,.04)">📷 <b>Colle / glisse / clique</b><input type="file" id="paFile" accept="image/*" multiple style="display:none"></div>
  <div class="grid" style="margin-top:10px">
   <div class="field"><label for="paUrl">OU URL d'image</label><input id="paUrl" placeholder="https://…/photo.jpg"></div>
   <div class="field"><label for="paCap">Légende</label><input id="paCap" placeholder="ex : courroie délaminée 1.2 PureTech"></div></div>
  <button type="button" class="btn ghost" id="paUrlGo">➕ Ajouter l'URL</button>
  <div id="paPending" class="chips" style="margin-top:10px"></div>
  <div class="divider"></div>
  <h3>Rattacher à une panne</h3>
  <div class="grid wide">
   <div class="field"><label for="paFaultQ">Filtrer</label><input id="paFaultQ" placeholder="courroie, P0016, AdBlue…"></div>
   <div class="field"><label for="paFault">Panne cible</label><select id="paFault"></select></div></div>
  <div id="paNewForm" class="hidden">
   <h3>Caractéristiques de la nouvelle panne</h3>
   <div class="grid wide">
    <div class="field"><label for="paTitre">Défaut / titre</label><input id="paTitre"></div>
    <div class="field"><label for="paMarque">Marque(s)</label><input id="paMarque"></div>
    <div class="field"><label for="paModele">Modèle(s)</label><input id="paModele"></div>
    <div class="field"><label for="paMoteur">Motorisation</label><input id="paMoteur"></div>
    <div class="field"><label for="paCh">Puissances (ch)</label><input id="paCh" placeholder="82,100,130"></div>
    <div class="field"><label for="paAnnees">Années</label><input id="paAnnees" placeholder="2013-2023"></div>
    <div class="field"><label for="paEnergie">Énergie</label><select id="paEnergie"><option value="">—</option><option>essence</option><option>diesel</option><option>hybride</option><option>electrique</option></select></div>
    <div class="field"><label for="paSys">Système</label><input id="paSys"></div>
    <div class="field"><label for="paDtc">DTC</label><input id="paDtc"></div>
    <div class="field"><label for="paSympt">Symptômes (virgules)</label><input id="paSympt"></div>
    <div class="field"><label for="paGrav">Gravité</label><select id="paGrav"><option>eleve</option><option>critique</option><option>modere</option></select></div>
    <div class="field"><label for="paCampagne">N° campagne</label><input id="paCampagne"></div>
    <div class="field"><label for="paUrlSrc">Source URL</label><input id="paUrlSrc"></div></div>
   <div class="field" style="margin-top:10px"><label for="paMeca">Mécanisme / causes</label><textarea id="paMeca"></textarea></div>
   <div class="field" style="margin-top:10px"><label for="paConseq">Conséquences (1/ligne)</label><textarea id="paConseq"></textarea></div>
   <div class="field" style="margin-top:10px"><label for="paIndices">Indices visuels (1/ligne)</label><textarea id="paIndices"></textarea></div>
   <label class="small" style="display:flex;gap:7px;margin:10px 0"><input type="checkbox" id="paFeu"> Risque d'incendie</label>
   <div class="field"><label for="paChaine">Chaîne incendie</label><input id="paChaine"></div></div>
  <div style="margin-top:12px">
   <button type="button" class="btn green" id="paAttach">🔗 Rattacher les photos</button>
   <button type="button" class="btn" id="paPubSync">📡 Publier (canal, sans token)</button>
   <button type="button" class="btn ghost" id="paPubGh">📤 Miroir GitHub (token)</button>
   <button type="button" class="btn ghost" id="paExport">📥 Exporter</button></div>
  <div class="divider"></div>
  <h3>Photos rattachées (locales + publiées)</h3><div id="paList"></div></div>`;
 D("admin")?.appendChild(sec);
 document.querySelectorAll("[data-adm]").forEach(b=>b.addEventListener("click",()=>{
  ["acces","visuel","contact","base","photos","sync"].forEach(v=>{const el=D("a-"+v);if(el)el.classList.toggle("hidden",v!==b.dataset.adm);});
  if(b.dataset.adm==="photos"){renderFaultPicker();renderPending();renderAdminList();D("paNewForm").classList.toggle("hidden",currentTargetId()!=="__new__");}}));
 D("paFaultQ")?.addEventListener("input",renderFaultPicker);
 D("paFault")?.addEventListener("change",()=>D("paNewForm").classList.toggle("hidden",currentTargetId()!=="__new__"));
 D("paAttach")?.addEventListener("click",attachPending);
 D("paPubSync")?.addEventListener("click",async()=>{ if(window.SYNC){const ok=await SYNC.publish(true); T(ok?"✅ Publié sur le canal (tiers à jour en ~20 s).":"❌ Échec canal — crée/rejoins un canal (📡 Sync)."); } else T("❌ Sync Engine absent."); });
 D("paPubGh")?.addEventListener("click",async()=>{const ok=await publishGithub();T(ok?"✅ Miroir GitHub publié.":"❌ Miroir impossible (token/scope).");});
 D("paExport")?.addEventListener("click",()=>{const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify({entries:OVERLAY.entries,photos:OVERLAY.photos},null,1)],{type:"application/json"}));
  a.download="manual-photos-export.json";a.click();});
 wireIntake();}
function renderPending(){const w=D("paPending");if(!w)return;
 w.innerHTML=PENDING.length?PENDING.map((p,i)=>`<span style="position:relative;display:inline-block;margin:3px"><img src="${E(p.src)}" style="width:74px;height:56px;object-fit:cover;border-radius:8px;border:1px solid rgba(0,229,255,.4)"><button type="button" data-rm="${i}" style="position:absolute;top:-6px;right:-6px;border:0;border-radius:50%;background:#ff1744;color:#fff;width:18px;height:18px;cursor:pointer;font-size:.7rem">✕</button></span>`).join("")
 :`<span class="chips-loading">Aucune photo en attente.</span>`;
 w.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{PENDING.splice(+b.dataset.rm,1);renderPending();});}
function renderAdminList(){const w=D("paList");if(!w)return;
 const keys=Object.keys(PHOTOS);
 w.innerHTML=keys.length?keys.slice(0,40).map(k=>{const f=(typeof BASE!=="undefined"?BASE:[]).find(e=>(e.id||sig(e))===k);
  return `<div class="hit"><b>${E(f?f.defaut:k)}</b><div class="meta">${PHOTOS[k].length} photo(s)</div>
   <div class="chips">${PHOTOS[k].slice(0,6).map(p=>`<img data-lb="${E(p.id)}" src="${E(p.url)}" style="width:64px;height:48px;object-fit:cover;border-radius:7px;border:1px solid rgba(255,255,255,.2);cursor:zoom-in">`).join("")}</div></div>`;}).join("")
  :`<p class="small">Aucune photo rattachée pour l'instant.</p>`;
 w.querySelectorAll("[data-lb]").forEach(im=>im.onclick=()=>{for(const k in PHOTOS){const h=PHOTOS[k].find(p=>p.id===im.dataset.lb);if(h){lightbox(h.url,h.cap);return;}}});}

/* ---------- boot ---------- */
function boot(){if(!D("admin"))return setTimeout(boot,150);
 injectAdmin();mergeLocal();overrideResults();loadPublished();
 setInterval(loadPublished,5*60*1000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadPublished();});
 console.log("🖼️ Photo & Fault Admin Engine v2 prêt (photos par identifiant de panne)");}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.PHOTO_ADMIN={photosFor,photosForFault,all:allPhotos,lightbox,publishGithub,loadPublished,mergeLocal,addPending,intakeFiles,intakeUrl,openGallery};
})();
