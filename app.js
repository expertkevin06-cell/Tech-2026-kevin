/* ============ KEV TECH & FIRE — by Kevin ============ */
"use strict";
/* >>> À REMPLIR après création du projet Firebase (étape 3 du guide) <<< */
const FIREBASE_CONFIG = {
  apiKey: "À_REMPLACER",
  authDomain: "À_REMPLACER.firebaseapp.com",
  projectId: "À_REMPLACER",
  appId: "À_REMPLACER"
};
const ADMIN_EMAIL = "admin@kev-tech-fire.fr";      // compte Firebase Auth à créer, mot de passe : Kevin83600
const ADMIN_UID   = "À_REMPLACER";                  // UID de ce compte (console Firebase > Authentication)
const REPO = "expertkevin06-cell/kev-tech-fire";
const DEMO_PWD = "Kevin83600";                      // uniquement si Firebase non configuré (mode démo local)

const $ = id => document.getElementById(id);
const FB_READY = !JSON.stringify(FIREBASE_CONFIG).includes("REMPLACER");
let db=null, auth=null, uid=null, isAdmin=false, prenom=localStorage.getItem("prenom")||"";
let BASE=[], CATALOG={marques:[],modeles:{},motorisations:[]}, VERSION="?", THEME="tous";
let OVERLAY=JSON.parse(localStorage.getItem("overlay")||"[]");
let CORPUS={}, BIGRAMS={}, SUGTERMS=[];
const DEFAULT_CAR="data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100'><path d='M20 70 Q30 45 70 40 L100 22 Q140 8 190 22 L225 40 Q270 45 282 62 L284 72 Q284 78 276 78 L24 78 Q18 78 20 70Z' fill='%23e53935'/><path d='M105 26 L185 26 L210 42 L95 42Z' fill='%2390caf9'/><circle cx='75' cy='78' r='15' fill='%23212121'/><circle cx='75' cy='78' r='7' fill='%23b0bec5'/><circle cx='228' cy='78' r='15' fill='%23212121'/><circle cx='228' cy='78' r='7' fill='%23b0bec5'/><rect x='270' y='52' width='12' height='6' rx='2' fill='%23ffd740'/></svg>`);

/* ---------- utilitaires ---------- */
const norm = s => (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const esc = s => (s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(msg,ms=4200){const d=document.createElement("div");d.className="toast";d.innerHTML=msg;$("toasts").appendChild(d);setTimeout(()=>d.remove(),ms);}
function notify(t,b){toast("🔔 <b>"+esc(t)+"</b><br>"+esc(b));if("Notification" in window&&Notification.permission==="granted"){try{new Notification(t,{body:b,icon:"icon.svg"});}catch(e){}}}
function askNotif(){if("Notification" in window&&Notification.permission==="default")Notification.requestPermission();}
function lev1(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else{if(++e>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++;}}}return true;}

/* ---------- réseau : 4G/5G/WiFi + hors ligne ---------- */
function majNet(){const c=navigator.connection||{};const t=c.type==="wifi"?"WiFi":(c.effectiveType||"").toUpperCase().replace("4G","4G/5G");
$("netBadge").textContent=navigator.onLine?("📶 "+(t||"réseau")+" • en ligne"):"📴 Hors ligne — base locale";}
addEventListener("online",majNet);addEventListener("offline",majNet);
if(navigator.connection)navigator.connection.addEventListener("change",majNet);

/* ---------- thème (filtre technique / incendie) ---------- */
$("themeSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
THEME=b.dataset.t;document.documentElement.dataset.theme=THEME;
[...$("themeSeg").children].forEach(x=>x.classList.toggle("on",x===b));renderResults();});

/* ---------- chargement de la base (chunks + hors ligne) ---------- */
async function fetchJSON(u){const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(u);return r.json();}
async function loadBase(force){
  try{
    const idx=await fetchJSON("data/index.json?ts="+Date.now());
    if(!force&&idx.version===VERSION&&BASE.length)return;
    VERSION=idx.version;let all=[];
    for(const f of idx.chunks){try{all=all.concat(await fetchJSON("data/"+f));}catch(e){console.warn(f,e);}}
    BASE=all;
    CATALOG=idx.catalogue&&idx.catalogue.marques&&idx.catalogue.marques.length?idx.catalogue:buildCatalog(BASE);
    localStorage.setItem("baseCache",JSON.stringify({v:VERSION}).slice(0,200));
  }catch(e){
    try{const seed=await fetchJSON("data/seed.json");BASE=seed;CATALOG=buildCatalog(seed);VERSION="seed (hors ligne)";}catch(e2){BASE=[];}
  }
  BASE=BASE.concat(OVERLAY);
  indexBase();$("baseBadge").textContent="🗄️ "+BASE.length+" fiches • "+VERSION;
  fillFilters();fillDatalists();buildCorpus();renderResults();
}
function buildCatalog(entries){const m=new Set(),mo={},mot=new Set();
  entries.forEach(e=>{(e.marque||"").split(/[\/,]/).forEach(x=>{x=x.trim();if(x)m.add(x);});
    if(e.modele)e.modele.split(/[\/,]/).forEach(x=>{x=x.trim();if(x){const k=(e.marque||"").split("/")[0].trim();(mo[k]=mo[k]||new Set()).add(x);}});
    if(e.motorisation)mot.add(e.motorisation);});
  const modeles={};Object.keys(mo).forEach(k=>modeles[k]=[...mo[k]].sort());
  return{marques:[...m].sort(),modeles,motorisations:[...mot].sort()};}
function indexBase(){BASE.forEach(e=>{e._h=norm([e.marque,e.modele,e.motorisation,e.systeme,e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" "),(e.dtc||[]).join(" "),e.campagne].join(" "));e._t=norm((e.defaut||"")+" "+(e.systeme||""));});}

/* ---------- recherche prédictive (déterministe, base uniquement) ---------- */
function search(q,limit=40){const toks=norm(q).split(" ").filter(Boolean);if(!toks.length)return[];
  const out=[];
  for(const e of BASE){
    if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;
    if($("fMarque").value&&norm(e.marque).indexOf(norm($("fMarque").value))<0)continue;
    if($("fSys").value&&norm(e.systeme)!==norm($("fSys").value))continue;
    if($("fGrav").value&&e.gravite!==$("fGrav").value)continue;
    let s=0;for(const t of toks){if(e._t.includes(t))s+=3;else if(e._h.includes(t))s+=2;
      else if(t.length>=5&&e._h.split(" ").some(w=>lev1(w,t)))s+=1;}
    if(s>0)out.push([s,e]);}
  return out.sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>x[1]);}
function hitCard(e){const feu=e.risque_feu;
  return `<div class="hit ${feu?"feu":""}"><b>${esc(e.defaut||e.titre||"Fiche")}</b>
  <div class="meta">${esc(e.marque||"Multi-marques")} • ${esc(e.modele||"")} ${esc(e.motorisation||"")} ${e.annees?("• "+e.annees[0]+"-"+e.annees[1]):""}</div>
  <div>${(e.themes||[]).includes("incendie")?'<span class="tag feu">🔥 incendie</span>':""}<span class="tag">${esc(e.systeme||"général")}</span>
  ${e.gravite==="critique"?'<span class="tag crit">critique</span>':""}${(e.dtc||[]).map(d=>'<span class="tag">'+esc(d)+"</span>").join("")}
  <span class="tag ok">${esc(e.source||"")}</span>${e.source==="nhtsa"?'<span class="tag">🇬🇧 VO</span>':""}</div>
  ${e.mecanisme?("<p class='small'><b>Mécanisme :</b> "+esc(e.mecanisme)+"</p>"):""}
  ${(e.consequences||[]).length?("<p class='small'><b>Conséquences :</b> "+esc(e.consequences.join(" ; "))+"</p>"):""}
  ${feu&&e.chaine_feu?("<p class='small'>🔥 <b>Chaîne vers incendie :</b> "+esc(e.chaine_feu)+"</p>"):""}
  ${e.url?(`<a class="small" href="${esc(e.url)}" target="_blank" rel="noopener">📎 Source ${esc(e.campagne||"")}</a>`):""}</div>`;}
function renderResults(){const q=$("q").value;const list=q.trim()?search(q):BASE.filter(e=>THEME==="tous"||(e.themes||[]).includes(THEME)).slice(0,25);
  $("results").innerHTML=list.length?list.map(hitCard).join(""):'<p class="small">Aucun résultat — élargis le filtre ou la saisie.</p>';}
$("q").addEventListener("input",()=>{renderResults();suggest($("q").value);});
["fMarque","fSys","fGrav"].forEach(id=>$(id).addEventListener("change",renderResults));
function suggest(q){const box=$("qList");const n=norm(q);if(n.length<2){box.classList.add("hidden");return;}
  const hits=SUGTERMS.filter(t=>t.n.startsWith(n)||t.n.includes(n)).slice(0,8);
  if(!hits.length){box.classList.add("hidden");return;}
  box.innerHTML=hits.map(h=>`<div data-v="${esc(h.v)}">${esc(h.v)}</div>`).join("");box.classList.remove("hidden");}
$("qList").addEventListener("click",e=>{const d=e.target.closest("div[data-v]");if(!d)return;$("q").value=d.dataset.v;$("qList").classList.add("hidden");renderResults();});
document.addEventListener("click",e=>{if(!e.target.closest("#sugs"))$("qList").classList.add("hidden");});
function fillFilters(){const ms=[...new Set(BASE.map(e=>(e.marque||"").split("/")[0].trim()).filter(Boolean))].sort();
  $("fMarque").innerHTML='<option value="">Toutes marques</option>'+ms.map(m=>`<option>${esc(m)}</option>`).join("");
  const ss=[...new Set(BASE.map(e=>e.systeme).filter(Boolean))].sort();
  $("fSys").innerHTML='<option value="">Tous systèmes</option>'+ss.map(s=>`<option>${esc(s)}</option>`).join("");
  SUGTERMS=[];const add=v=>{if(v)SUGTERMS.push({v,n:norm(v)});};
  CATALOG.marques.forEach(add);Object.values(CATALOG.modeles).flat().forEach(add);CATALOG.motorisations.forEach(add);
  ss.forEach(add);BASE.slice(0,4000).forEach(e=>(e.dtc||[]).forEach(add));
  const seen=new Set();SUGTERMS=SUGTERMS.filter(t=>!seen.has(t.n)&&seen.add(t.n));}
function fillDatalists(){$("dlMarques").innerHTML=CATALOG.marques.map(m=>`<option value="${esc(m)}">`).join("");
  $("dlMoteurs").innerHTML=CATALOG.motorisations.map(m=>`<option value="${esc(m)}">`).join("");majModeles();}
function majModeles(){const m=$("cMarque").value;let list=[];
  for(const k in CATALOG.modeles){if(!m||norm(k).includes(norm(m)))list=list.concat(CATALOG.modeles[k]);}
  $("dlModeles").innerHTML=[...new Set(list)].sort().map(x=>`<option value="${esc(x)}">`).join("");}
$("cMarque").addEventListener("input",majModeles);

/* ---------- rédaction prédictive fiable (corpus de la base, zéro invention) ---------- */
const VOCAB=["voyant","moteur","pression","huile","courroie","distribution","chaîne","tendeur","turbo","injecteur","pompe","carburant","fuite","huile","liquide de refroidissement","surchauffe","culasse","joint","faisceau","court-circuit","batterie","alternateur","démarreur","boîte de vitesses","embrayage","mécatronique","EGR","FAP","catalyseur","AdBlue","claquement","à-coups","perte de puissance","fumée","odeur","incendie","départ de feu","rappel","campagne","constructeur","diagnostic","constat"," expertise","km","entretien","vidange","autoroute","ville","démarrage","ralenti","accélération"];
function buildCorpus(){CORPUS={};BIGRAMS={};
  const feed=txt=>{const w=norm(txt).split(" ").filter(x=>x.length>2);
    for(let i=0;i<w.length;i++){CORPUS[w[i]]=(CORPUS[w[i]]||0)+1;
      if(i+1<w.length){(BIGRAMS[w[i]]=BIGRAMS[w[i]]||{});BIGRAMS[w[i]][w[i+1]]=(BIGRAMS[w[i]][w[i+1]]||0)+1;}}};
  VOCAB.forEach(v=>feed(v+" moteur véhicule panne"));
  BASE.slice(0,9000).forEach(e=>feed([e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" ")].join(" ")));}
function predict(text){const w=norm(text).split(" ");const last=w[w.length-1]||"";const prev=w[w.length-2]||"";
  const endsSpace=/\s$/.test(text);const out=[];
  if(!endsSpace&&last.length>=2){Object.keys(CORPUS).filter(k=>k.startsWith(last)&&k!==last).sort((a,b)=>CORPUS[b]-CORPUS[a]).slice(0,4).forEach(k=>out.push({label:k,mode:"replace"}));}
  const key=endsSpace?last:prev;
  if(key&&BIGRAMS[key])Object.keys(BIGRAMS[key]).sort((a,b)=>BIGRAMS[key][b]-BIGRAMS[key][a]).slice(0,3).forEach(k=>out.push({label:k,mode:"append"}));
  return out.slice(0,6);}
function wirePredict(taId,chipsId){const ta=$(taId),ch=$(chipsId);
  ta.addEventListener("input",()=>{const s=predict(ta.value);
    ch.innerHTML=s.map((x,i)=>`<button data-i="${i}">${esc(x.label)} ⏎</button>`).join("");
    ch._s=s;});
  ch.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const s=ch._s[+b.dataset.i];
    if(s.mode==="replace")ta.value=ta.value.replace(/[\wÀ-ÿ-]+$/,s.label)+" ";
    else ta.value=ta.value.replace(/\s*$/,"")+" "+s.label+" ";
    ta.dispatchEvent(new Event("input"));ta.focus();});}
wirePredict("cContexte","predCtx");wirePredict("msgTexte","predMsg");

/* ---------- QCM symptômes (demandes précédentes conservées) ---------- */
const SYMPT=["voyant allumé","perte de puissance","à-coups moteur","à-coups boîte","bruit anormal","claquement","fumée","odeur carburant","odeur brûlé","surchauffe","fuite visible","démarrage difficile","défaut comportement route","incendie / départ de feu","véhicule immobilisé","après entretien / réparation"];
$("qcm").innerHTML=SYMPT.map(s=>`<label><input type="checkbox" value="${esc(s)}">${esc(s)}</label>`).join("");
$("dtcLu").addEventListener("change",()=>$("cDtc").classList.toggle("hidden",!$("dtcLu").checked));

/* ---------- ÉTUDE DE CAS ---------- */
function matchVehicle(e,v){let s=0;
  if(v.marque&&norm(e.marque).includes(norm(v.marque)))s+=4;else if(v.marque&&e.marque&&!/multi/i.test(e.marque))return -1;
  if(v.modele){const nm=norm(e.modele);if(nm&&nm.includes(norm(v.modele)))s+=4;else if(nm&&!/tous|multi/i.test(nm))s-=2;}
  if(v.moteur){const toks=norm(v.moteur).split(" ");const em=norm(e.motorisation);if(em&&toks.some(t=>em.includes(t)))s+=3;}
  if(v.annee&&e.annees){if(v.annee>=e.annees[0]&&v.annee<=e.annees[1])s+=3;else s-=3;}
  if(v.puiss&&e.puissance_ch){if(v.puiss>=e.puissance_ch[0]*0.9&&v.puiss<=e.puissance_ch[1]*1.1)s+=2;}
  if(v.energie&&e.energie&&e.energie!==v.energie)s-=2;
  return s;}
function analyser(){
  const v={marque:$("cMarque").value.trim(),modele:$("cModele").value.trim(),moteur:$("cMoteur").value.trim(),
    puiss:+$("cPuiss").value||0,annee:+$("cAnnee").value||0,energie:$("cEnergie").value};
  const sym=[...$("qcm").querySelectorAll("input:checked")].map(i=>i.value);
  const dtcs=($("dtcLu").checked?$("cDtc").value:"").toUpperCase().match(/[PCBU][0-9]{4}/g)||[];
  const ctx=$("cContexte").value;const ctxToks=norm(ctx+" "+sym.join(" ")).split(" ").filter(t=>t.length>3);
  if(!v.marque&&!v.modele&&!ctx.trim()){toast("⚠️ Renseigne au moins le véhicule ou le contexte.");return;}
  const scored=[];
  for(const e of BASE){
    if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;
    let s=matchVehicle(e,v);if(s<0)continue;
    for(const d of dtcs)if((e.dtc||[]).includes(d))s+=6;
    for(const t of ctxToks){if(norm(e.defaut).includes(t))s+=2;else if(e._h.includes(t))s+=1;}
    if(s>=4)scored.push([s,e]);}
  scored.sort((a,b)=>b[0]-a[0]);
  const top=scored.slice(0,25).map(x=>x[1]);
  const rappels=top.filter(e=>e.type==="rappel");
  const pannes=top.filter(e=>e.type!=="rappel");
  const feu=top.filter(e=>e.risque_feu);
  const best=scored[0]?scored[0][0]:0;
  const niveau=best>=12?"PROBABLE à CERTAIN sous réserve de vérification VIN":best>=8?"PROBABLE — faisceau cohérent, à confirmer par mesures":best>=4?"POSSIBLE — hypothèse documentée à vérifier":"INDÉTERMINÉ en l'état des données";
  const date=new Date().toLocaleString("fr-FR");
  let html=`<div class="card" id="rapportPrint"><h2>📋 Rapport d'étude de cas — ${esc(v.marque)} ${esc(v.modele)} ${esc(v.moteur)} ${v.puiss?v.puiss+" ch":""} ${v.annee||""}</h2>
  <p class="small">Généré le ${date} • base ${VERSION} • ${BASE.length} fiches • thème : ${THEME}</p>
  <p class="small"><b>Constatations :</b> ${esc(sym.join(", ")||"—")} ${dtcs.length?("• DTC : "+dtcs.join(", ")):""}<br><b>Contexte :</b> ${esc(ctx||"—")}</p>
  <h3>1️⃣ Campagnes de rappel officielles concordantes (${rappels.length})</h3>${rappels.map(hitCard).join("")||'<p class="small">Aucune campagne concordante trouvée dans NHTSA / RappelConso / Safety Gate pour ces critères.</p>'}
  <h3>2️⃣ Pannes connues — bases fusionnées Kevin (${pannes.length})</h3>${pannes.map(hitCard).join("")||'<p class="small">Aucune panne connue concordante.</p>'}
  <h3>3️⃣ 🔥 Lien possible panne initiale → départ d'incendie (${feu.length})</h3>
  ${feu.length?feu.map(e=>`<div class="hit feu"><b>${esc(e.defaut)}</b><p class="small">Chaîne documentée : ${esc(e.chaine_feu||e.mecanisme||"")}</p>${e.url?`<a class="small" href="${esc(e.url)}" target="_blank">📎 ${esc(e.campagne||e.source)}</a>`:""}</div>`).join("")
   :'<p class="small">Aucune chaîne d\'incendie documentée ne ressort pour ces critères. Ne pas conclure pour autant à l\'absence de risque : expertise physique nécessaire.</p>'}
  <h3>4️⃣ Conclusion argumentée</h3><p><b>Niveau de certitude : ${niveau}.</b></p>
  <p class="small">Méthode : qualifier → inférer → corréler (rappels + pannes connues + DTC) → analyser → tester → conclure. ${rappels.length?"Une campagne officielle concordante existe : vérifier son applicabilité au VIN exact auprès du constructeur et si elle a été exécutée.":""} Ce rapport est une aide documentaire fondée sur les sources citées ; il ne remplace pas une expertise physique du véhicule.</p>
  ${$("cLitige").checked?`<h3>5️⃣ ⚖️ Analyse juridique (droit français)</h3><p class="small">• <b>Vice caché</b> : art. 1641 et s. Code civil — défaut antérieur à la vente, non apparent, rendant le véhicule impropre à l'usage.<br>• <b>Produit défectueux</b> : art. 1245 et s. (L421-3 C. conso.) — défaut de sécurité, dont départ d'incendie ; producteur responsable même sans contrat.<br>• <b>Obligation de sécurité / rappel</b> : L412-1 et R412-1 C. conso. — une campagne RappelConso/Safety Gate non exécutée renforce la démonstration du défaut.<br>• <b>Preuves à préserver</b> : véhicule et pièces en l'état, factures d'entretien, rapport d'expertise, constat, lecture DTC horodatée, photos.</p>`:""}
  </div>`;
  $("rapport").innerHTML=html;
  const histo=JSON.parse(localStorage.getItem("histo")||"[]");
  histo.unshift({date,v,sym,dtcs,niveau,n:rappels.length+" rappels / "+pannes.length+" pannes"});
  localStorage.setItem("histo",JSON.stringify(histo.slice(0,20)));renderHisto();
  window._rapport={date,vehicule:v,symptomes:sym,dtc:dtcs,contexte:ctx,niveau,rappels,pannes,chains_feu:feu};
  toast("✅ Étude terminée : "+rappels.length+" rappel(s), "+pannes.length+" panne(s), "+feu.length+" chaîne(s) feu.");}
$("btnAnalyser").addEventListener("click",analyser);
$("btnPrint").addEventListener("click",()=>{if(!$("rapport").innerHTML){toast("Lance d'abord une étude.");return;}window.print();});
$("btnExportEtude").addEventListener("click",()=>{if(!window._rapport)return;dl("etude-cas-kev.json",JSON.stringify(window._rapport,null,1));});
function renderHisto(){const h=JSON.parse(localStorage.getItem("histo")||"[]");
  $("histo").innerHTML=h.map(x=>`<div class="hit"><b>${esc(x.v.marque)} ${esc(x.v.modele)}</b> <span class="small">${esc(x.date)} — ${esc(x.n)} — ${esc(x.niveau)}</span></div>`).join("")||'<p class="small">Aucune étude.</p>';}
function dl(name,txt){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type:"application/json"}));a.download=name;a.click();}

/* ---------- OBD Bluetooth (ELM327 BLE) ---------- */
let obdWrite=null,obdBuf="";
const UUID_S="0000fff0-0000-1000-8000-00805f9b34fb";
async function obdConnect(){
  if(!navigator.bluetooth){$("obdStatus").textContent="Web Bluetooth indisponible ici — ouvre l'app dans Chrome Android (ou active-le).";return;}
  try{
    const dev=await navigator.bluetooth.requestDevice({filters:[{services:[UUID_S]}],optionalServices:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]});
    const srv=await dev.gatt.connect();
    let svc;try{svc=await srv.getPrimaryService(UUID_S);}catch(e){const all=await srv.getPrimaryServices();svc=all[0];}
    const chs=await svc.getCharacteristics();
    const ntf=chs.find(c=>c.properties.notify||c.properties.indicate);
    obdWrite=chs.find(c=>c.properties.write||c.properties.writeWithoutResponse);
    await ntf.startNotifications();
    ntf.addEventListener("characteristicvaluechanged",ev=>{obdBuf+=new TextDecoder().decode(ev.target.value);});
    $("obdStatus").textContent="✅ Connecté : "+dev.name;
    $("btnObdRead").disabled=false;
    for(const cmd of["ATZ","ATE0","ATL0","ATSP0"]){await obdSend(cmd,900);}
  }catch(e){$("obdStatus").textContent="❌ "+e.message;}}
async function obdSend(cmd,wait){obdBuf="";await obdWrite.writeValue(new TextEncoder().encode(cmd+"\r"));
  const t0=Date.now();while(Date.now()-t0<wait&&!obdBuf.includes(">"))await new Promise(r=>setTimeout(r,60));return obdBuf;}
function decodeDTC(hex){const bytes=hex.trim().split(/\s+/).map(h=>parseInt(h,16)).filter(n=>!isNaN(n));
  const i=bytes.findIndex(b=>b===0x43||b===0x47);if(i<0)return[];const out=[];
  for(let k=i+1;k+1<bytes.length;k+=2){const a=bytes[k],b=bytes[k+1];if(a===0&&b===0)continue;
    const L="PCBU"[(a>>6)&3];out.push(L+(((a>>4)&3).toString())+(a&15).toString(16).toUpperCase()+(b>>4).toString(16).toUpperCase()+(b&15).toString(16).toUpperCase());}
  return out;}
async function obdRead(){ $("obdStatus").textContent="⏳ Lecture…";
  const r1=await obdSend("03",2500),r2=await obdSend("07",2500);
  const codes=[...new Set([...decodeDTC(r1),...decodeDTC(r2)])];
  $("obdResult").innerHTML=codes.length?codes.map(c=>{const e=BASE.find(x=>(x.dtc||[]).includes(c));
    return `<div class="hit"><b>${c}</b><p class="small">${esc(e?e.defaut:"Code non présent dans la base — recherche élargie conseillée.")}</p></div>`;}).join("")
    :'<p class="small">Aucun code défaut stocké/en attente (réponse : '+esc((r1+r2).slice(0,120))+')</p>';
  if(codes.length){$("dtcLu").checked=true;$("cDtc").classList.remove("hidden");$("cDtc").value=codes.join(", ");
    toast("✅ "+codes.length+" code(s) injecté(s) dans l'étude de cas.");}}
$("btnObd").addEventListener("click",obdConnect);$("btnObdRead").addEventListener("click",obdRead);

/* ---------- Firebase : accès temps réel, admin, fond, messages ---------- */
function gate(state,name){["gateForm","gateWait","gateOk","gateKo"].forEach(i=>$(i).classList.add("hidden"));
  $("gate").classList.remove("hidden");$("app").classList.add("hidden");$("admin").classList.add("hidden");$("adminLogin").classList.add("hidden");
  if(state==="attente"){$("gateWait").classList.remove("hidden");$("waitName").textContent=name;}
  else if(state==="autorise"){$("gateOk").classList.remove("hidden");$("okName").textContent=name;}
  else if(state==="refuse"||state==="revoque"){$("gateKo").classList.remove("hidden");
    $("koText").textContent=state==="revoque"?"🔒 Accès révoqué par l'administrateur.":"❌ Accès refusé par l'administrateur.";}
  else $("gateForm").classList.remove("hidden");}
function showApp(){["gate","adminLogin","admin"].forEach(i=>$(i).classList.add("hidden"));$("app").classList.remove("hidden");renderHisto();}
function showAdmin(){["gate","adminLogin","app"].forEach(i=>$(i).classList.add("hidden"));$("admin").classList.remove("hidden");adminListen();}

async function initFirebase(){
  if(!FB_READY){ // mode démo local (Firebase pas encore configuré)
    toast("⚠️ Firebase non configuré : mode démo local (accès libre, admin via mot de passe local). Suis l'étape 3 du guide.");
    uid="demo";prenom=prenom||"Démo";showApp();majNet();return;}
  firebase.initializeApp(FIREBASE_CONFIG);
  auth=firebase.auth();db=firebase.firestore();
  try{await db.enablePersistence({synchronizeTabs:true});}catch(e){}
  auth.onAuthStateChanged(async u=>{
    if(u&&!u.isAnonymous&&u.uid===ADMIN_UID){isAdmin=true;showAdmin();return;}
    isAdmin=false;
    if(!u||!u.isAnonymous){await auth.signInAnonymously();return;}
    uid=u.uid;
    db.collection("acces").doc(uid).onSnapshot(doc=>{
      const d=doc.data();
      if(!d){gate("form");return;}
      prenom=d.prenom||prenom;localStorage.setItem("prenom",prenom);localStorage.setItem("statut",d.statut);
      const prev=gate._last;gate._last=d.statut;
      if(prev&&prev!==d.statut){
        if(d.statut==="autorise")notify("✅ Accès autorisé","Bienvenue "+prenom+" !");
        if(d.statut==="revoque")notify("🔒 Accès révoqué","L'administrateur a coupé l'accès.");
        if(d.statut==="refuse")notify("❌ Demande refusée","Tu peux refaire une demande.");}
      if(d.statut==="autorise"&&(gate._entered||prev==="attente"))showApp();else gate(d.statut,prenom);
    },err=>{ // hors ligne : miroir local
      const st=localStorage.getItem("statut");if(st==="autorise")showApp();else gate(st||"form",prenom);});
    db.collection("config").doc("visuel").onSnapshot(doc=>{const d=doc.data()||{};
      $("scene").style.backgroundImage=d.fond?`url(${d.fond})`:"";
      $("carImg").src=d.voiture||DEFAULT_CAR;});
  });}
$("btnDemande").addEventListener("click",async()=>{askNotif();
  const p=$("prenom").value.trim();if(!p){toast("Indique ton prénom.");return;}
  prenom=p;localStorage.setItem("prenom",p);
  if(!FB_READY){showApp();return;}
  await db.collection("acces").doc(uid).set({prenom:p,statut:"attente",cree:Date.now(),maj:Date.now(),historique:[{action:"demande",date:Date.now()}]});
  gate("attente",p);});
$("btnAnnuler").addEventListener("click",async()=>{if(FB_READY)await db.collection("acces").doc(uid).delete();gate("form");});
$("btnReDemande").addEventListener("click",async()=>{if(FB_READY)await db.collection("acces").doc(uid).update({statut:"attente",maj:Date.now(),historique:firebase.firestore.FieldValue.arrayUnion({action:"nouvelle demande",date:Date.now()})});gate("attente",prenom);});
$("btnEntrer").addEventListener("click",()=>{gate._entered=true;showApp();});
$("btnGoAdmin").addEventListener("click",()=>{$("gate").classList.add("hidden");$("adminLogin").classList.remove("hidden");$("adminPwd").value="";});
$("btnAdminBack").addEventListener("click",()=>gate(gate._last||"form",prenom));
$("btnAdminLogin").addEventListener("click",async()=>{askNotif();
  const pwd=$("adminPwd").value;$("adminPwd").value=""; // vidé après CHAQUE tentative
  if(!FB_READY){if(pwd===DEMO_PWD){isAdmin=true;showAdmin();}else toast("❌ Mot de passe incorrect.");return;}
  try{await auth.signInWithEmailAndPassword(ADMIN_EMAIL,pwd);}catch(e){toast("❌ Connexion refusée : "+e.code);}});
$("btnLogout").addEventListener("click",async()=>{if(FB_READY){await auth.signOut();await auth.signInAnonymously();}isAdmin=false;gate("form");});

/* ---------- Admin : listes temps réel + actions ---------- */
let adminWired=false;
function adminListen(){
  if(!FB_READY){$("accesList").innerHTML="<p class='small'>Mode démo : configure Firebase pour le contrôle temps réel.</p>";return;}
  if(adminWired)return;adminWired=true;
  db.collection("acces").orderBy("maj","desc").onSnapshot(snap=>{
    let pending=0;const rows=[];
    snap.forEach(doc=>{const d=doc.data();if(d.statut==="attente")pending++;
      rows.push(`<tr><td>${esc(d.prenom)}</td><td><span class="tag ${d.statut==="autorise"?"ok":d.statut==="attente"?"":"crit"}">${esc(d.statut)}</span></td>
      <td class="small">${new Date(d.maj||d.cree).toLocaleString("fr-FR")}</td>
      <td><button class="btn green" data-id="${doc.id}" data-a="autorise">✅</button>
      <button class="btn red" data-id="${doc.id}" data-a="refuse">❌</button>
      <button class="btn ghost" data-id="${doc.id}" data-a="revoque">🔒</button></td></tr>`);});
    $("accesList").innerHTML=`<p class="small">${snap.size} appareil(s) • ${pending} en attente</p><table><tr><th>Prénom</th><th>Statut</th><th>Dernière action</th><th>Décision</th></tr>${rows.join("")}</table>`;
    if(pending>(adminListen._p||0))notify("📨 Nouvelle demande d'accès",pending+" demande(s) en attente");
    adminListen._p=pending;});
  $("accesList").addEventListener("click",async e=>{const b=e.target.closest("button[data-a]");if(!b)return;
    await db.collection("acces").doc(b.dataset.id).update({statut:b.dataset.a,maj:Date.now(),
      historique:firebase.firestore.FieldValue.arrayUnion({action:b.dataset.a,par:"admin",date:Date.now()})});
    toast("✔️ "+b.dataset.a+" appliqué en temps réel.");});
  db.collection("messages").orderBy("date","desc").limit(100).onSnapshot(snap=>{
    $("msgList").innerHTML=snap.docs.map(doc=>{const d=doc.data();
      return `<div class="hit"><b>${esc(d.prenom)}</b> <span class="small">${new Date(d.date).toLocaleString("fr-FR")}</span><p>${esc(d.texte)}</p><button class="btn ghost" data-del="${doc.id}">🗑️</button></div>`;}).join("")||"<p class='small'>Aucun message.</p>";
    if(snap.size>(adminListen._m||0)&&adminListen._m!==undefined)notify("✉️ Nouveau message tiers","Ouvre la boîte admin.");
    adminListen._m=snap.size;});
  $("msgList").addEventListener("click",async e=>{const b=e.target.closest("[data-del]");if(b)await db.collection("messages").doc(b.dataset.del).delete();});}

/* ---------- Messages tiers → admin ---------- */
$("btnMsg").addEventListener("click",async()=>{const t=$("msgTexte").value.trim();if(!t)return;
  if(!FB_READY){toast("Mode démo : message non envoyé (Firebase requis).");return;}
  await db.collection("messages").add({uid,prenom,texte:t,date:Date.now(),lu:false});
  $("msgTexte").value="";$("predMsg").innerHTML="";toast("📨 Message envoyé à l'administrateur.");});

/* ---------- Fond d'écran + voiture : upload admin → diffusion ---------- */
async function compress(file,maxW,quality,type){const img=await createImageBitmap(file);
  const sc=Math.min(1,maxW/img.width);const c=document.createElement("canvas");
  c.width=img.width*sc;c.height=img.height*sc;c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  let q=quality,url;do{url=c.toDataURL(type,q);q-=0.08;}while(url.length>700000&&q>0.3);
  if(url.length>900000)throw new Error("Image trop lourde après compression");return url;}
async function pushVisuel(key,file,maxW,type){if(!FB_READY){toast("Firebase requis.");return;}
  try{const url=await compress(file,maxW,0.85,type);
    await db.collection("config").doc("visuel").set({[key]:url,maj:Date.now()},{merge:true});
    toast("🖼️ Diffusé en temps réel à tous les tiers.");}catch(e){toast("❌ "+e.message);}}
$("fileFond").addEventListener("change",e=>e.target.files[0]&&pushVisuel("fond",e.target.files[0],1600,"image/jpeg"));
$("fileVoiture").addEventListener("change",e=>e.target.files[0]&&pushVisuel("voiture",e.target.files[0],900,"image/png"));
$("btnVisuelReset").addEventListener("click",async()=>{if(FB_READY)await db.collection("config").doc("visuel").set({fond:null,voiture:null,maj:Date.now()});
  $("scene").style.backgroundImage="";$("carImg").src=DEFAULT_CAR;});

/* ---------- Base & MAJ (admin) ---------- */
$("btnReloadBase").addEventListener("click",async()=>{await loadBase(true);toast("✅ Base rechargée : "+BASE.length+" fiches ("+VERSION+").");});
$("btnMajServeur").addEventListener("click",async()=>{
  const pat=$("ghPat").value.trim();if(pat)localStorage.setItem("ghpat",pat);
  const token=pat||localStorage.getItem("ghpat");
  if(!token){toast("Renseigne un token GitHub (scope workflow) une seule fois.");return;}
  const r=await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/maj-bases.yml/dispatches`,{method:"POST",headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json"},body:JSON.stringify({ref:"main"})});
  toast(r.status===204?"🚀 MAJ serveur lancée (résultat publié dans ~10-40 min).":"❌ GitHub : HTTP "+r.status);});
$("ghPat").value=localStorage.getItem("ghpat")?"••••••••":"";
$("btnAddFiche").addEventListener("click",()=>{
  const a=($("mAnnees").value.match(/\d{4}/g)||[]).map(Number);
  const e={id:"admin-"+Date.now(),themes:["technique",...($("mFeu").checked?["incendie"]:[])],type:"panne",source:"admin",
    marque:$("mMarque").value,modele:$("mModele").value,motorisation:$("mMoteur").value,
    annees:a.length?[a[0],a[a.length-1]]:null,dtc:($("mDtc").value.toUpperCase().match(/[PCBU][0-9]{4}/g)||[]),
    defaut:$("mTitre").value,mecanisme:$("mMeca").value,consequences:$("mConseq").value.split("\n").filter(Boolean),
    risque_feu:$("mFeu").checked,gravite:$("mFeu").checked?"critique":"eleve",url:$("mUrl").value,date:new Date().toISOString().slice(0,10)};
  if(!e.defaut){toast("Titre requis.");return;}
  OVERLAY.push(e);localStorage.setItem("overlay",JSON.stringify(OVERLAY));
  BASE.push(e);indexBase();fillFilters();buildCorpus();$("baseBadge").textContent="🗄️ "+BASE.length+" fiches • "+VERSION;
  toast("💾 Fiche ajoutée. Exporte manual.json pour la rendre permanente.");});
$("btnExportOverlay").addEventListener("click",()=>dl("manual.json",JSON.stringify(OVERLAY,null,1)));
$("fileImport").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;
  try{let j=JSON.parse(await f.text());if(Array.isArray(j))j={entries:j};
    const arr=(j.entries||[]).map((x,i)=>({id:x.id||"import-"+Date.now()+"-"+i,themes:x.themes||["technique"],type:x.type||"panne",source:x.source||"import",...x}));
    OVERLAY=OVERLAY.concat(arr);localStorage.setItem("overlay",JSON.stringify(OVERLAY));
    await loadBase(true);toast("📥 "+arr.length+" fiches importées et fusionnées.");}catch(err){toast("❌ JSON invalide : "+err.message);}});

/* ---------- navigation ---------- */
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>{
  ["recherche","etude","obd","message"].forEach(v=>$("v-"+v).classList.toggle("hidden",v!==b.dataset.nav));}));
document.querySelectorAll("[data-adm]").forEach(b=>b.addEventListener("click",()=>{
  ["acces","msgs","visuel","base"].forEach(v=>$("a-"+v).classList.toggle("hidden",v!==b.dataset.adm));
  if(b.dataset.adm==="base")$("baseStats").textContent=`Version ${VERSION} • ${BASE.length} fiches • ${CATALOG.marques.length} marques • ${Object.values(CATALOG.modeles).flat().length} modèles • ${CATALOG.motorisations.length} motorisations • overlay admin : ${OVERLAY.length}`;}));

/* ---------- boot ---------- */
$("carImg").src=DEFAULT_CAR;majNet();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
loadBase().then(initFirebase);
setInterval(()=>loadBase(false),6*3600*1000); // revérifie la base publiée si l'app reste ouverte
