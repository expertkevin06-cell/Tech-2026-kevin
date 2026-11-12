/* ================= KEV TECH & FIRE — app.js v6 (SANS backend) =================
   Auth admin locale · accès tiers par codes signés (HMAC) · révocation publiée
   Fond/contact publiés via data/visuel.json · messages par email · quota local
   ============================================================================ */
"use strict";
const ADMIN_B64 = "S2V2aW44MzYwMA==";              // = "Kevin83600" (porte locale, sans serveur)
const ACCESS_SECRET = "KEVTF-ACCESS-2026-" + ADMIN_B64;
const REPO = localStorage.getItem("kevo_repo") || "expertkevin06-cell/Tech-2026-kevin";
let ADMIN_EMAIL = "contact@kev-tech-fire.fr";

const $ = id => document.getElementById(id);
let isAdmin=false, prenom=localStorage.getItem("prenom")||"", THEME="tous";
let BASE=[], CATALOG={marques:[],modeles:{},motorisations:[],powers:[],versions:[]}, VERSION="?", SUGTERMS=[], CORPUS={}, BIGRAMS={};
let OVERLAY=JSON.parse(localStorage.getItem("overlay")||"[]"), VISUEL={}, REVOQUES=[], CONTACT_EMAIL="";
let carImg=null;

const norm=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const esc=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(m,ms=4200){const d=document.createElement("div");d.className="toast";d.innerHTML=m;$("toasts").appendChild(d);setTimeout(()=>d.remove(),ms);}
function notify(t,b){toast("🔔 <b>"+esc(t)+"</b><br>"+esc(b));if("Notification" in window&&Notification.permission==="granted"){try{new Notification(t,{body:b,icon:"icon.svg"});}catch(e){}}}
function askNotif(){if("Notification" in window&&Notification.permission==="default")Notification.requestPermission();}
function lev1(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else{if(++e>1)return false;a.length>b.length?i++:b.length>a.length?j++:(i++,j++);}}return true;}
function dl(n,t){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"application/json"}));a.download=n;a.click();}
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
async function hmacHex(msg){
  try{
    if(crypto&&crypto.subtle){
      const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(ACCESS_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
      const s=await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(msg));
      return [...new Uint8Array(s)].map(b=>b.toString(16).padStart(2,"0")).join("");
    }
  }catch(e){}
  return hash(msg+"::"+ACCESS_SECRET);
}
const b64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64u=s=>decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/"))));

/* ---------- réseau + thème ---------- */
function majNet(){const c=navigator.connection||{},t=c.type==="wifi"?"WiFi":(c.effectiveType||"").toUpperCase().replace("4G","4G/5G");
 $("netBadge").textContent=navigator.onLine?("📶 "+(t||"réseau")+" • en ligne"):"📴 Hors ligne — base locale";
 $("netBadge").classList.toggle("live",navigator.onLine);}
addEventListener("online",majNet);addEventListener("offline",majNet);if(navigator.connection)navigator.connection.addEventListener("change",majNet);
$("themeSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;THEME=b.dataset.t;document.documentElement.dataset.theme=THEME;[...$("themeSeg").children].forEach(x=>x.classList.toggle("on",x===b));renderResults();});

/* ---------- fond animé Néon Drive ---------- */
const cv=$("bg"),cx=cv.getContext("2d");let W=0,H=0,stars=[],bld1=[],bld2=[],trails=[],streaks=[],dashOff=0,running=true;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize(){const d=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
 stars=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H*.55,r:Math.random()*1.4+.3,p:Math.random()*6}));
 const mk=(n,hb)=>Array.from({length:n},(_,i)=>({x:i*(W/n),w:W/n*.7,h:hb+Math.random()*hb}));bld1=mk(14,H*.16);bld2=mk(20,H*.1);}
addEventListener("resize",resize);resize();
const acc=()=>getComputedStyle(document.documentElement).getPropertyValue("--acc").trim()||"#00e676";
function drawCar(x,y,s,t){cx.save();cx.translate(x,y+Math.sin(t/180)*1.6);cx.scale(s,s);
 if(carImg){cx.drawImage(carImg,-150,-78,300,90);cx.restore();return;}
 const a=acc();cx.shadowColor=a;cx.shadowBlur=18;cx.fillStyle="#0d1330";cx.strokeStyle=a;cx.lineWidth=2;
 cx.beginPath();cx.moveTo(-140,0);cx.quadraticCurveTo(-130,-30,-80,-36);cx.lineTo(-45,-58);cx.quadraticCurveTo(0,-72,55,-56);cx.lineTo(95,-36);cx.quadraticCurveTo(140,-30,146,-8);cx.lineTo(146,0);cx.closePath();cx.fill();cx.stroke();
 cx.shadowBlur=0;cx.fillStyle="rgba(144,202,249,.85)";cx.beginPath();cx.moveTo(-40,-54);cx.lineTo(48,-52);cx.lineTo(78,-38);cx.lineTo(-62,-38);cx.closePath();cx.fill();
 for(const wx of[-88,92]){cx.fillStyle="#05070f";cx.beginPath();cx.arc(wx,2,20,0,7);cx.fill();cx.strokeStyle=a;cx.lineWidth=2;cx.stroke();
  cx.save();cx.translate(wx,2);cx.rotate(t/90);cx.strokeStyle="rgba(255,255,255,.6)";cx.lineWidth=2;for(let k=0;k<4;k++){cx.rotate(Math.PI/2);cx.beginPath();cx.moveTo(0,0);cx.lineTo(0,-14);cx.stroke();}cx.restore();}
 cx.fillStyle="rgba(255,241,118,.9)";cx.beginPath();cx.moveTo(146,-14);cx.lineTo(230,-4);cx.lineTo(230,10);cx.lineTo(146,2);cx.closePath();cx.fill();
 cx.fillStyle="#ff1744";cx.fillRect(-146,-16,6,8);cx.restore();}
function frame(t){if(!running)return;const a=acc(),road=H*.8;
 const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#050816");g.addColorStop(.55,"#141034");g.addColorStop(1,"#070b1e");cx.fillStyle=g;cx.fillRect(0,0,W,H);
 for(let i=0;i<2;i++){const bx=W*(.3+.4*i)+Math.sin(t/4000+i*2)*W*.12,by=H*.22;const rg=cx.createRadialGradient(bx,by,0,bx,by,W*.35);rg.addColorStop(0,i?"rgba(124,77,255,.18)":"rgba(0,229,255,.14)");rg.addColorStop(1,"transparent");cx.fillStyle=rg;cx.fillRect(0,0,W,H);}
 cx.fillStyle="#fff";stars.forEach(s=>{cx.globalAlpha=.3+.5*Math.abs(Math.sin(t/900+s.p));cx.fillRect(s.x,s.y,s.r,s.r);});cx.globalAlpha=1;
 cx.fillStyle="rgba(10,14,36,.9)";bld1.forEach(b=>{const x=(b.x-t*.008)%W;cx.fillRect(x<0?x+W:x,road-b.h,b.w,b.h);});
 cx.fillStyle="rgba(16,20,52,.95)";bld2.forEach(b=>{const x=(b.x-t*.02)%W;cx.fillRect(x<0?x+W:x,road-b.h,b.w,b.h);});
 cx.fillStyle=a;cx.globalAlpha=.5;cx.fillRect(0,road,W,2);cx.globalAlpha=1;
 cx.fillStyle="#0a0d1c";cx.fillRect(0,road,W,H-road);
 dashOff=(dashOff+6)%160;cx.fillStyle="rgba(255,215,64,.8)";for(let x=-dashOff;x<W;x+=160)cx.fillRect(x,road+(H-road)*.5,70,5);
 if(Math.random()<.04)streaks.push({x:W+50,y:road+20+Math.random()*(H-road-40),v:8+Math.random()*8});
 streaks=streaks.filter(s=>s.x>-100);streaks.forEach(s=>{s.x-=s.v;cx.strokeStyle="rgba(255,255,255,.25)";cx.lineWidth=2;cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.x+60,s.y);cx.stroke();});
 const cxp=W*.34;trails.push({x:cxp-140,y:road-6,a:1});trails=trails.filter(p=>p.a>0);trails.forEach(p=>{p.x-=3;p.a-=.03;cx.fillStyle=`rgba(0,229,255,${p.a*.3})`;cx.fillRect(p.x,p.y,14,3);});
 drawCar(cxp,road-2,Math.min(1,W/700),t);
 if(!reduce)requestAnimationFrame(frame);}
document.addEventListener("visibilitychange",()=>{running=!document.hidden;if(running&&!reduce)requestAnimationFrame(frame);});
if(reduce)frame(0);else requestAnimationFrame(frame);
function applyVisuel(d){VISUEL=d||{};
 $("wallpaper").style.backgroundImage=VISUEL.fond?`url(${VISUEL.fond})`:"";
 $("wallpaper").style.opacity=(VISUEL.opacite??60)/100;
 if(VISUEL.opacite!=null&&$("opacite")){$("opacite").value=VISUEL.opacite;$("opVal").textContent=VISUEL.opacite+"%";}
 if(VISUEL.contact)CONTACT_EMAIL=VISUEL.contact;
 if(VISUEL.voiture){const im=new Image();im.onload=()=>carImg=im;im.src=VISUEL.voiture;}else carImg=null;}

/* ---------- base ---------- */
async function fetchJSON(u){const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(u);return r.json();}
async function loadBase(force){
 try{const idx=await fetchJSON("data/index.json?ts="+Date.now());
  if(!force&&idx.version===VERSION&&BASE.length)return;VERSION=idx.version;let all=[];
  for(const f of idx.chunks){try{all=all.concat(await fetchJSON("data/"+f));}catch(e){}}
  BASE=all;CATALOG=(idx.catalogue&&idx.catalogue.marques&&idx.catalogue.marques.length)?idx.catalogue:buildCatalog(BASE);
 }catch(e){try{BASE=await fetchJSON("data/seed.json");CATALOG=buildCatalog(BASE);VERSION="seed (hors ligne)";}catch(e2){BASE=[];}}
 BASE=BASE.concat(OVERLAY);indexBase();paintBase();fillFilters();fillDatalists();buildCorpus();renderResults();}
function buildCatalog(en){const m=new Set(),mo={},mot=new Set();en.forEach(e=>{(e.marque||"").split(/[\/,]/).forEach(x=>{x=x.trim();if(x)m.add(x);});
 if(e.modele)e.modele.split(/[\/,]/).forEach(x=>{x=x.trim();if(x){const k=(e.marque||"").split("/")[0].trim();(mo[k]=mo[k]||new Set()).add(x);}});if(e.motorisation)mot.add(e.motorisation);});
 const modeles={};Object.keys(mo).forEach(k=>modeles[k]=[...mo[k]].sort());return{marques:[...m].sort(),modeles,motorisations:[...mot].sort(),powers:[],versions:[]};}
function indexBase(){BASE.forEach(e=>{e._h=norm([e.marque,e.modele,e.motorisation,e.systeme,e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" "),(e.dtc||[]).join(" "),e.campagne].join(" "));e._t=norm((e.defaut||"")+" "+(e.systeme||""));});}
function paintBase(){$("baseBadge").textContent=`🗄️ ${BASE.length} fiches • ${CATALOG.marques.length} marques • ${Object.values(CATALOG.modeles||{}).flat().length} modèles • ${VERSION}`;}

/* ---------- fichiers publiés (visuel + révocations) ---------- */
async function loadPublished(){
 try{const v=await fetchJSON("data/visuel.json?ts="+Date.now());applyVisuel(v);}catch(e){}
 try{REVOQUES=await fetchJSON("data/revoques.json?ts="+Date.now());if(!Array.isArray(REVOQUES))REVOQUES=[];}catch(e){REVOQUES=REVOQUES||[];}
 checkAccessLive();}
setInterval(loadPublished,3600*1000);

/* ---------- recherche prédictive ---------- */
function search(q,limit=40){const toks=norm(q).split(" ").filter(Boolean);if(!toks.length)return[];const out=[];
 for(const e of BASE){if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;
  if($("fMarque").value&&norm(e.marque).indexOf(norm($("fMarque").value))<0)continue;
  if($("fSys").value&&norm(e.systeme)!==norm($("fSys").value))continue;
  if($("fGrav").value&&e.gravite!==$("fGrav").value)continue;
  let s=0;for(const t of toks){if(e._t.includes(t))s+=3;else if(e._h.includes(t))s+=2;else if(t.length>=5&&e._h.split(" ").some(w=>lev1(w,t)))s+=1;}
  if(s>0)out.push([s,e]);}return out.sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>x[1]);}
function hitCard(e){return `<div class="hit ${e.risque_feu?"feu":""}"><b>${esc(e.defaut||"Fiche")}</b>
 <div class="meta">${esc(e.marque||"Multi-marques")} • ${esc(e.modele||"")} ${esc(e.motorisation||"")} ${e.annees?("• "+e.annees[0]+"-"+e.annees[1]):""}</div>
 <div>${(e.themes||[]).includes("incendie")?'<span class="tag feu">🔥 incendie</span>':""}<span class="tag">${esc(e.systeme||"général")}</span>${e.gravite==="critique"?'<span class="tag crit">critique</span>':""}${(e.dtc||[]).map(d=>'<span class="tag">'+esc(d)+"</span>").join("")}<span class="tag ok">${esc(e.source||"")}</span></div>
 ${e.mecanisme?("<p class='small'><b>Mécanisme :</b> "+esc(e.mecanisme)+"</p>"):""}
 ${(e.consequences||[]).length?("<p class='small'><b>Conséquences :</b> "+esc(e.consequences.join(" ; "))+"</p>"):""}
 ${e.risque_feu&&e.chaine_feu?("<p class='small'>🔥 <b>Chaîne incendie :</b> "+esc(e.chaine_feu)+"</p>"):""}
 ${e.url?(`<a class="small" href="${esc(e.url)}" target="_blank" rel="noopener">📎 Source ${esc(e.campagne||"")}</a>`):""}</div>`;}
function renderResults(){const q=$("q").value;const list=q.trim()?search(q):BASE.filter(e=>THEME==="tous"||(e.themes||[]).includes(THEME)).slice(0,25);
 $("results").innerHTML=list.length?list.map(hitCard).join(""):'<p class="small">Aucun résultat.</p>';}
$("q").addEventListener("input",()=>{renderResults();suggest($("q").value);});
["fMarque","fSys","fGrav"].forEach(id=>$(id).addEventListener("change",renderResults));
function suggest(q){const box=$("qList"),n=norm(q);if(n.length<2){box.classList.add("hidden");return;}
 const hits=SUGTERMS.filter(t=>t.n.startsWith(n)||t.n.includes(n)).slice(0,8);
 if(!hits.length){box.classList.add("hidden");return;}box.innerHTML=hits.map(h=>`<div data-v="${esc(h.v)}">${esc(h.v)}</div>`).join("");box.classList.remove("hidden");}
$("qList").addEventListener("click",e=>{const d=e.target.closest("div[data-v]");if(!d)return;$("q").value=d.dataset.v;$("qList").classList.add("hidden");renderResults();});
document.addEventListener("click",e=>{if(!e.target.closest("#sugs"))$("qList").classList.add("hidden");});
function fillFilters(){const ms=[...new Set(BASE.map(e=>(e.marque||"").split("/")[0].trim()).filter(Boolean))].sort();
 $("fMarque").innerHTML='<option value="">Toutes marques</option>'+ms.map(m=>`<option>${esc(m)}</option>`).join("");
 const ss=[...new Set(BASE.map(e=>e.systeme).filter(Boolean))].sort();
 $("fSys").innerHTML='<option value="">Tous systèmes</option>'+ss.map(s=>`<option>${esc(s)}</option>`).join("");
 SUGTERMS=[];const add=v=>{if(v)SUGTERMS.push({v,n:norm(v)});};CATALOG.marques.forEach(add);Object.values(CATALOG.modeles||{}).flat().forEach(add);CATALOG.motorisations.forEach(add);ss.forEach(add);BASE.slice(0,4000).forEach(e=>(e.dtc||[]).forEach(add));
 const seen=new Set();SUGTERMS=SUGTERMS.filter(t=>!seen.has(t.n)&&seen.add(t.n));}
function fillDatalists(){$("dlMarques").innerHTML=CATALOG.marques.map(m=>`<option value="${esc(m)}">`).join("");$("dlMoteurs").innerHTML=CATALOG.motorisations.map(m=>`<option value="${esc(m)}">`).join("");majModeles();}
function majModeles(){const m=$("cMarque").value;let l=[];for(const k in (CATALOG.modeles||{}))if(!m||norm(k).includes(norm(m)))l=l.concat(CATALOG.modeles[k]);$("dlModeles").innerHTML=[...new Set(l)].sort().map(x=>`<option value="${esc(x)}">`).join("");}
$("cMarque").addEventListener("input",majModeles);

/* ---------- rédaction prédictive ---------- */
function buildCorpus(){CORPUS={};BIGRAMS={};const feed=t=>{const w=norm(t).split(" ").filter(x=>x.length>2);for(let i=0;i<w.length;i++){CORPUS[w[i]]=(CORPUS[w[i]]||0)+1;if(i+1<w.length){(BIGRAMS[w[i]]=BIGRAMS[w[i]]||{});BIGRAMS[w[i]][w[i+1]]=(BIGRAMS[w[i]][w[i+1]]||0)+1;}}};
 BASE.slice(0,9000).forEach(e=>feed([e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" ")].join(" ")));
 feed("incendie fuite huile carburant surchauffe courroie distribution turbo EGR faisceau batterie voyant moteur panne achat occasion vendeur professionnel particulier vice caché garantie expertise litige assurance sinistre");}
function predict(text){const w=norm(text).split(" "),last=w[w.length-1]||"",prev=w[w.length-2]||"",end=/\s$/.test(text),out=[];
 if(!end&&last.length>=2)Object.keys(CORPUS).filter(k=>k.startsWith(last)&&k!==last).sort((a,b)=>CORPUS[b]-CORPUS[a]).slice(0,4).forEach(k=>out.push({label:k,mode:"replace"}));
 const key=end?last:prev;if(key&&BIGRAMS[key])Object.keys(BIGRAMS[key]).sort((a,b)=>BIGRAMS[key][b]-BIGRAMS[key][a]).slice(0,3).forEach(k=>out.push({label:k,mode:"append"}));return out.slice(0,6);}
function wirePredict(ta,ch){ta.addEventListener("input",()=>{const s=predict(ta.value);ch.innerHTML=s.map((x,i)=>`<button data-i="${i}">${esc(x.label)} ⏎</button>`).join("");ch._s=s;});
 ch.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const s=ch._s[+b.dataset.i];ta.value=s.mode==="replace"?ta.value.replace(/[\wÀ-ÿ-]+$/,s.label)+" ":ta.value.replace(/\s*$/,"")+" "+s.label+" ";ta.dispatchEvent(new Event("input"));ta.focus();});}
wirePredict($("ctx"),$("predCtx"));wirePredict($("msgTexte"),$("predMsg"));

/* ---------- véhicule + QCM + incendie + étude ---------- */
const SYMPT=["voyant allumé","perte de puissance","à-coups moteur","à-coups boîte","bruit anormal","claquement","fumée","odeur carburant","odeur brûlé","surchauffe","fuite visible","démarrage difficile","incendie / départ de feu","véhicule immobilisé","après entretien / réparation","après choc","après immersion"];
$("qcm").innerHTML=SYMPT.map(s=>`<label><input type="checkbox" value="${esc(s)}">${esc(s)}</label>`).join("");
$("dtcLu").addEventListener("change",()=>$("cDtc").classList.toggle("hidden",!$("dtcLu").checked));
function getVeh(){return{marque:$("cMarque").value.trim(),modele:$("cModele").value.trim(),moteur:$("cMoteur").value.trim(),puiss:+$("cPuiss").value||0,annee:+$("cAnnee").value||0,energie:$("cEnergie").value};}
function matchVehicle(e,v){let s=0;
 if(v.marque&&norm(e.marque).includes(norm(v.marque)))s+=4;else if(v.marque&&e.marque&&!/multi/i.test(e.marque))return -1;
 if(v.modele){const nm=norm(e.modele);if(nm&&nm.includes(norm(v.modele)))s+=4;else if(nm&&!/tous|multi/i.test(nm))s-=2;}
 if(v.moteur){const tk=norm(v.moteur).split(" "),em=norm(e.motorisation);if(em&&tk.some(t=>em.includes(t)))s+=3;}
 if(v.annee&&e.annees)s+=(v.annee>=e.annees[0]&&v.annee<=e.annees[1])?3:-3;
 if(v.puiss&&e.puissance_ch)s+=(v.puiss>=e.puissance_ch[0]*.9&&v.puiss<=e.puissance_ch[1]*1.1)?2:0;
 if(v.energie&&e.energie&&e.energie!==v.energie)s-=2;return s;}
function energyOK(e,v){if(!e.energie)return true;if(!v.energie)return true;if(e.energie===v.energie)return true;if(v.energie==="hybride")return true;return false;}
function fireAnalysis(v,matched,ctxToks,qcm){
 const sig=(qcm||[]).join(" ")+" "+ctxToks.join(" ");
 const spec=matched.filter(e=>e.risque_feu&&matchVehicle(e,v)>=4&&energyOK(e,v));
 const rappelsFeu=spec.filter(e=>e.type==="rappel");
 const doctrine=BASE.filter(e=>e.risque_feu&&/multi/i.test(e.marque||"")&&energyOK(e,v)).slice(0,12);
 const boost=[];const S=norm(sig);
 if(/carburant|essence|gazole|odeur/.test(S))boost.push("Fuite carburant / vapeurs (chaîne flash)");
 if(/brule|fumee|huile/.test(S))boost.push("Huile sur organe chaud / faisceau (auto-inflammation)");
 if(/entretien|reparation|vidange/.test(S))boost.push("Erreur de service (huile résiduelle, faisceau pincé, fusible sur-calibré)");
 if(/choc|accident|immersion|inond/.test(S))boost.push(v.energie==="electrique"?"Pack HT : choc / immersion → runaway différé":"Réservoir / lignes impactés");
 if(/surchauffe|temperature|egr/.test(S))boost.push("Surchauffe / EGR cooler (couvaison)");
 const lvl=rappelsFeu.length?"hi":spec.length?"mid":"low";
 const lvlTxt=lvl==="hi"?"ÉLEVÉ — rappel incendie concordant":lvl==="mid"?"MODÉRÉ — chaînes documentées pour ce véhicule":"GÉNÉRIQUE — doctrine applicable";
 const ctrl=[...new Set(spec.concat(doctrine).flatMap(e=>e.indices||[]))].slice(0,10);
 let h=`<div class="firebox"><h3>🔥 Analyse incendie renforcée — ${esc(v.marque||"véhicule")} ${esc(v.modele)} ${esc(v.moteur)} ${v.energie?("("+v.energie+")"):""}</h3><p><span class="lvl ${lvl}">${lvlTxt}</span></p>`;
 if(rappelsFeu.length)h+=`<h3>🚨 Rappels incendie concordants (${rappelsFeu.length})</h3>`+rappelsFeu.map(e=>`<div class="hit feu"><b>${esc(e.defaut)}</b><div class="meta">${esc(e.campagne||e.source)} ${e.date||""}</div><p class="small">${esc(e.chaine_feu||e.mecanisme||"")}</p>${e.url?`<a class="small" href="${esc(e.url)}" target="_blank">📎 Campagne</a>`:""}</div>`).join("");
 if(spec.length)h+=`<h3>Chaînes « panne → incendie » documentées (${spec.length})</h3>`+spec.slice(0,10).map(e=>`<div class="hit feu"><b>${esc(e.defaut)}</b><p class="small">⛓️ ${esc(e.chaine_feu||e.mecanisme||"")}</p><div class="meta">${esc(e.source)} ${esc(e.campagne||"")}</div></div>`).join("");
 if(boost.length)h+=`<h3>⚠️ Signaux du contexte à vérifier</h3><ul class="small">${boost.map(b=>"<li>"+esc(b)+"</li>").join("")}</ul>`;
 if(doctrine.length)h+=`<details><summary class="small" style="cursor:pointer;color:var(--acc)">Doctrine incendie applicable (${doctrine.length})</summary>`+doctrine.map(e=>`<div class="hit feu"><b>${esc(e.defaut)}</b><p class="small">${esc(e.mecanisme||"")}</p></div>`).join("")+"</details>";
 if(ctrl.length)h+=`<h3>🔍 Points de contrôle prioritaires</h3><ul class="small">${ctrl.map(c=>"<li>"+esc(c)+"</li>").join("")}</ul>`;
 h+=`<p class="small">Niveau fondé sur données documentées. Ne préjuge pas de l'origine réelle : expertise physique nécessaire.</p></div>`;
 return{html:h,data:{niveau:lvlTxt,rappels_feu:rappelsFeu,chaines:spec,signaux:boost}};}
function analyser(){const v=getVeh();const sym=[...$("qcm").querySelectorAll("input:checked")].map(i=>i.value);
 const dtcs=($("dtcLu").checked?$("cDtc").value:"").toUpperCase().match(/[PCBU][0-9]{4}/g)||[];
 const ctx=$("ctx").value;const ctxToks=norm(ctx+" "+sym.join(" ")).split(" ").filter(t=>t.length>3);
 if(!v.marque&&!v.modele&&!ctx.trim()){toast("Renseigne le véhicule ou le contexte.");return;}
 const scored=[];for(const e of BASE){if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;let s=matchVehicle(e,v);if(s<0)continue;
  for(const d of dtcs)if((e.dtc||[]).includes(d))s+=6;for(const t of ctxToks){if(norm(e.defaut).includes(t))s+=2;else if(e._h.includes(t))s+=1;}if(s>=4)scored.push([s,e]);}
 scored.sort((a,b)=>b[0]-a[0]);const top=scored.slice(0,25).map(x=>x[1]);
 const rappels=top.filter(e=>e.type==="rappel"),pannes=top.filter(e=>e.type!=="rappel"),best=scored[0]?scored[0][0]:0;
 const niveau=best>=12?"PROBABLE à CERTAIN (sous réserve VIN)":best>=8?"PROBABLE — à confirmer par mesures":best>=4?"POSSIBLE — hypothèse documentée":"INDÉTERMINÉ en l'état";
 const feu=fireAnalysis(v,top,ctxToks,sym);const date=new Date().toLocaleString("fr-FR");
 $("rapport").innerHTML=`<div class="card"><h2>📋 Étude de cas — ${esc(v.marque)} ${esc(v.modele)} ${esc(v.moteur)} ${v.puiss?v.puiss+" ch":""} ${v.annee||""}</h2>
 <p class="small">${date} • base ${VERSION} • thème ${THEME}</p><p class="small"><b>Constatations :</b> ${esc(sym.join(", ")||"—")} ${dtcs.length?("• DTC "+dtcs.join(", ")):""}</p>
 <h3>1️⃣ Rappels officiels concordants (${rappels.length})</h3>${rappels.map(hitCard).join("")||'<p class="small">Aucun.</p>'}
 <h3>2️⃣ Pannes connues — base fusionnée (${pannes.length})</h3>${pannes.map(hitCard).join("")||'<p class="small">Aucune.</p>'}
 ${feu.html}<h3>Conclusion</h3><p><b>Niveau : ${niveau}.</b></p>
 <p class="small">Méthode : qualifier → inférer → corréler → analyser → tester → conclure. Aide documentaire ; ne remplace pas une expertise physique.</p></div>`;
 const histo=JSON.parse(localStorage.getItem("histo")||"[]");histo.unshift({date,v,niveau,n:rappels.length+" rappels / "+pannes.length+" pannes"});localStorage.setItem("histo",JSON.stringify(histo.slice(0,20)));renderHisto();
 window._rapport={date,vehicule:v,symptomes:sym,dtc:dtcs,niveau,rappels,pannes,incendie:feu.data};toast("✅ Étude terminée.");}
$("btnAnalyser").addEventListener("click",analyser);
$("btnPrint").addEventListener("click",()=>window.print());
$("btnExportEtude").addEventListener("click",()=>window._rapport&&dl("etude-cas.json",JSON.stringify(window._rapport,null,1)));
function renderHisto(){const h=JSON.parse(localStorage.getItem("histo")||"[]");$("histo").innerHTML=h.map(x=>`<div class="hit"><b>${esc(x.v.marque)} ${esc(x.v.modele)}</b> <span class="small">${esc(x.date)} — ${esc(x.n)} — ${esc(x.niveau)}</span></div>`).join("")||'<p class="small">Aucune.</p>';}

/* ---------- quota local 5/7j ---------- */
function quotaGet(){let q=JSON.parse(localStorage.getItem("kevo_quota")||'{"debut":0,"n":0}');const now=Date.now();
 if(now-q.debut>=7*864e5){q={debut:now,n:0};localStorage.setItem("kevo_quota",JSON.stringify(q));}return q;}
function quotaUse(){if(isAdmin)return{ok:true,left:"∞"};const q=quotaGet();
 if(q.n>=5)return{ok:false,left:0,reset:q.debut+7*864e5};q.n++;localStorage.setItem("kevo_quota",JSON.stringify(q));return{ok:true,left:5-q.n,reset:q.debut+7*864e5};}
function updQuota(q){$("quotaBadge").textContent=q.left==="∞"?"️ admin ∞":`🎟️ ${q.left}/5 restantes`+(q.reset?` · reset ${new Date(q.reset).toLocaleDateString("fr-FR")}`:"");}

/* ---------- analyse contexte (moteur legal.js) ---------- */
async function analyserContexte(){const ctx=$("ctx").value.trim();if(!ctx){toast("Décris ta situation dans la case contexte.");return;}
 const q=quotaUse();updQuota(q);
 if(!q.ok){toast("🚫 Quota atteint (5/7 jours). Réinitialisation le "+new Date(q.reset).toLocaleDateString("fr-FR")+".",6000);return;}
 const v=getVeh(),vendeur=$("cVendeur").value,ctxToks=norm(ctx).split(" ").filter(t=>t.length>3);
 const legal=(typeof legalMatch==="function")?legalMatch(ctx,vendeur):[];
 const scored=[];for(const e of BASE){let s=matchVehicle(e,v);if(s<0)s=0;for(const t of ctxToks){if(norm(e.defaut).includes(t))s+=2;else if(e._h.includes(t))s+=1;}if(s>=3)scored.push([s,e]);}
 scored.sort((a,b)=>b[0]-a[0]);const tech=scored.slice(0,12).map(x=>x[1]);
 const fireSig=/incendie|feu|flamme|brule|fumee|sinistre/.test(norm(ctx))||tech.some(e=>e.risque_feu);
 const feu=fireSig?fireAnalysis(v,tech,ctxToks,[]):null;
 const date=new Date().toLocaleString("fr-FR");
 $("ctxReport").innerHTML=`<div class="card"><h2>⚖️ Analyse du contexte — ${date}</h2>
 <p class="small"><b>Véhicule :</b> ${esc(v.marque)} ${esc(v.modele)} ${esc(v.moteur)} ${v.annee||""} · <b>Vendeur :</b> ${esc(vendeur)} · <b>Quota :</b> ${q.left==="∞"?"admin ∞":q.left+"/5 restantes"}</p>
 <p class="small"><b>Contexte :</b> ${esc(ctx)}</p>
 <h3>1️⃣ Qualification juridique (moteur Auto-Legal)</h3>${(typeof renderLegal==="function")?renderLegal(legal):""}
 <h3>2️⃣ Corrélation technique (base fusionnée)</h3>${tech.map(hitCard).join("")||'<p class="small">Aucune corrélation — précise marque/modèle/motorisation.</p>'}
 ${feu?("<h3>3️⃣ Volet incendie</h3>"+feu.html):""}
 <h3>${feu?"4️⃣":"3️⃣"} Plan d'action & preuves</h3><ul class="small">${[...new Set(legal.flatMap(f=>f.demarches).concat(["Conserver factures, annonce, contrat, historique d'entretien","Faire établir un diagnostic écrit avant toute réparation","En cas de litige : réclamation écrite puis médiation / expertise contradictoire"]))].slice(0,10).map(x=>"<li>"+esc(x)+"</li>").join("")}</ul>
 <p class="small">⚠️ Aide documentaire ; ne constitue pas une consultation juridique personnalisée.</p></div>`;
 window._ctx={date,contexte:ctx,vehicule:v,vendeur,legal:legal.map(f=>f.id),technique:tech,incendie:feu?feu.data:null};toast("✅ Analyse contexte terminée.");}
$("btnCtx").addEventListener("click",analyserContexte);
$("btnCtxPrint").addEventListener("click",()=>window.print());
$("btnCtxExport").addEventListener("click",()=>window._ctx&&dl("analyse-contexte.json",JSON.stringify(window._ctx,null,1)));

/* ---------- OBD ---------- */
let obdWrite=null,obdBuf="";const UUID_S="0000fff0-0000-1000-8000-00805f9b34fb";
async function obdConnect(){if(!navigator.bluetooth){$("obdStatus").textContent="Web Bluetooth indisponible — ouvre dans Chrome Android.";return;}
 try{const dev=await navigator.bluetooth.requestDevice({filters:[{services:[UUID_S]}],optionalServices:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]});
  const srv=await dev.gatt.connect();let svc;try{svc=await srv.getPrimaryService(UUID_S);}catch(e){svc=(await srv.getPrimaryServices())[0];}
  const chs=await svc.getCharacteristics(),ntf=chs.find(c=>c.properties.notify||c.properties.indicate);
  obdWrite=chs.find(c=>c.properties.write||c.properties.writeWithoutResponse);await ntf.startNotifications();
  ntf.addEventListener("characteristicvaluechanged",ev=>obdBuf+=new TextDecoder().decode(ev.target.value));
  $("obdStatus").textContent="✅ Connecté : "+dev.name;$("btnObdRead").disabled=false;
  for(const c of["ATZ","ATE0","ATL0","ATSP0"])await obdSend(c,900);}catch(e){$("obdStatus").textContent="❌ "+e.message;}}
async function obdSend(c,w){obdBuf="";await obdWrite.writeValue(new TextEncoder().encode(c+"\r"));const t0=Date.now();while(Date.now()-t0<w&&!obdBuf.includes(">"))await new Promise(r=>setTimeout(r,60));return obdBuf;}
function decodeDTC(hex){const b=hex.trim().split(/\s+/).map(h=>parseInt(h,16)).filter(n=>!isNaN(n));const i=b.findIndex(x=>x===0x43||x===0x47);if(i<0)return[];const o=[];for(let k=i+1;k+1<b.length;k+=2){const a=b[k],c=b[k+1];if(!a&&!c)continue;o.push("PCBU"[(a>>6)&3]+((a>>4)&3)+(a&15).toString(16).toUpperCase()+(c>>4).toString(16).toUpperCase()+(c&15).toString(16).toUpperCase());}return o;}
async function obdRead(){$("obdStatus").textContent="⏳ Lecture…";const r1=await obdSend("03",2500),r2=await obdSend("07",2500);const codes=[...new Set([...decodeDTC(r1),...decodeDTC(r2)])];
 $("obdResult").innerHTML=codes.length?codes.map(c=>{const e=BASE.find(x=>(x.dtc||[]).includes(c));return `<div class="hit"><b>${c}</b><p class="small">${esc(e?e.defaut:"Code absent de la base.")}</p></div>`;}).join(""):'<p class="small">Aucun code.</p>';
 if(codes.length){$("dtcLu").checked=true;$("cDtc").classList.remove("hidden");$("cDtc").value=codes.join(", ");toast("✅ "+codes.length+" code(s) injectés.");}}
$("btnObd").addEventListener("click",obdConnect);$("btnObdRead").addEventListener("click",obdRead);

/* ---------- écrans ---------- */
const SCREENS=["choice","gate","adminLogin","app","admin"];
function showOnly(id){SCREENS.forEach(x=>$(x).classList.toggle("hidden",x!==id));$("btnQuit").classList.toggle("hidden",!(id==="app"||id==="admin"));}
function showChoice(){showOnly("choice");}
function gate(st,name){showOnly("gate");["gateForm","gateWait","gateOk","gateKo"].forEach(i=>$(i).classList.add("hidden"));
 if(st==="attente"){$("gateWait").classList.remove("hidden");$("waitName").textContent=name;}
 else if(st==="autorise"){$("gateOk").classList.remove("hidden");$("okName").textContent=name;}
 else if(st==="refus"){$("gateKo").classList.remove("hidden");$("koText").textContent="Code invalide ou expiré.";}
 else if(st==="revoque"){$("gateKo").classList.remove("hidden");$("koText").textContent="🔒 Ce code a été révoqué par l'administrateur.";}
 else $("gateForm").classList.remove("hidden");}
function showApp(){showOnly("app");$("btnBackAdmin").classList.toggle("hidden",!isAdmin);renderHisto();updQuota(isAdmin?{left:"∞"}:quotaLeftView());renderOutbox();}
function quotaLeftView(){const q=quotaGet();return{left:Math.max(0,5-q.n),reset:q.debut+7*864e5};}
function showAdmin(){showOnly("admin");renderIssued();renderRevoke();}

/* ---------- auth admin locale ---------- */
$("btnModeAdmin").addEventListener("click",()=>{askNotif();$("adminPwd").value="";showOnly("adminLogin");$("adminPwd").focus();});
$("btnAdminBack").addEventListener("click",showChoice);
$("btnAdminLogin").addEventListener("click",()=>{const pwd=$("adminPwd").value;$("adminPwd").value="";if(!pwd)return;
 let ok=false;try{ok=btoa(pwd)===ADMIN_B64;}catch(e){ok=pwd==="Kevin83600";}
 if(ok){isAdmin=true;notify("🛡️ Mode admin","Console déverrouillée.");showAdmin();}else toast("❌ Mot de passe incorrect.");});
$("btnLogout").addEventListener("click",()=>{isAdmin=false;showChoice();});
$("btnQuit").addEventListener("click",()=>{if(isAdmin)isAdmin=false;showChoice();});
$("btnBackAdmin").addEventListener("click",()=>isAdmin&&showAdmin());
$("btnAdminToApp").addEventListener("click",showApp);

/* ---------- accès tiers par code signé ---------- */
async function verifyCode(code){
 try{const[pl,sg]=code.trim().split(".");if(!pl||!sg)return{ok:false,why:"format"};
  const payload=JSON.parse(unb64u(pl));
  const expect=await hmacHex(pl);
  if(expect!==sg)return{ok:false,why:"signature"};
  if(payload.exp&&Date.now()>payload.exp)return{ok:false,why:"expire"};
  if(REVOQUES.includes(sg))return{ok:false,why:"revoque"};
  return{ok:true,prenom:payload.p||"",sig:sg};}catch(e){return{ok:false,why:"format"};}}
function checkAccessLive(){const st=localStorage.getItem("kevo_access");if(!st)return;
 try{const a=JSON.parse(st);if(REVOQUES.includes(a.sig)){localStorage.removeItem("kevo_access");
   if(!isAdmin&&localStorage.getItem("mode")==="tiers")gate("revoque");}}catch(e){}}
$("btnModeTiers").addEventListener("click",()=>{askNotif();localStorage.setItem("mode","tiers");
 const st=localStorage.getItem("kevo_access");
 if(st){try{const a=JSON.parse(st);if(!REVOQUES.includes(a.sig)){prenom=a.prenom||prenom;showApp();return;}}catch(e){}}
 gate("form");});
$("btnDemande").addEventListener("click",async()=>{const p=$("prenom").value.trim(),code=$("accessCode").value.trim();
 if(!p){toast("Indique ton prénom.");return;}if(!code){toast("Colle ton code d'accès.");return;}
 prenom=p;localStorage.setItem("prenom",p);
 const r=await verifyCode(code);
 if(!r.ok){gate(r.ok===false&&r.why==="revoque"?"revoque":"refus");return;}
 localStorage.setItem("kevo_access",JSON.stringify({prenom:p,sig:r.sig,at:Date.now()}));
 gate("autorise",p);notify("✅ Accès autorisé","Bienvenue "+p);});
$("lnkAskCode").addEventListener("click",e=>{e.preventDefault();const p=$("prenom").value.trim()||"(ton prénom)";
 const to=CONTACT_EMAIL||ADMIN_EMAIL;
 location.href=`mailto:${to}?subject=${encodeURIComponent("Demande de code d'accès KEV TECH & FIRE")}&body=${encodeURIComponent("Bonjour,\n\nPrénom : "+p+"\nJe souhaite un code d'accès à l'application KEV TECH & FIRE.\n\nMerci !")}`;
 $("waitName").textContent=p;gate("attente",p);});
$("btnBackForm").addEventListener("click",()=>gate("form"));
$("btnReDemande").addEventListener("click",()=>gate("form"));
$("btnEntrer").addEventListener("click",showApp);
$("btnGateBack").addEventListener("click",()=>{localStorage.removeItem("mode");showChoice();});

/* ---------- admin : codes ---------- */
function issued(){return JSON.parse(localStorage.getItem("kevo_codes")||"[]");}
function saveIssued(a){localStorage.setItem("kevo_codes",JSON.stringify(a));}
$("btnGenCode").addEventListener("click",async()=>{const p=$("gcPrenom").value.trim();if(!p){toast("Prénom requis.");return;}
 const days=Math.max(1,+$("gcJours").value||365);
 const payload={p,n:hash(p+Date.now()),exp:Date.now()+days*864e5};
 const pl=b64u(JSON.stringify(payload));const sg=await hmacHex(pl);
 const code=pl+"."+sg;
 $("genOut").textContent=code;$("genOut").classList.remove("hidden");
 const a=issued();a.unshift({prenom:p,exp:payload.exp,sig:sg,code,at:Date.now()});saveIssued(a);renderIssued();
 toast("🎟️ Code généré pour "+p+" ("+days+" j).");});
$("btnCopyCode").addEventListener("click",()=>{const t=$("genOut").textContent;if(!t)return;navigator.clipboard?.writeText(t).then(()=>toast("📋 Code copié."));});
$("btnShareCode").addEventListener("click",()=>{const t=$("genOut").textContent;if(!t)return;
 const p=$("gcPrenom").value.trim()||"";
 if(navigator.share)navigator.share({title:"Code d'accès KEV TECH & FIRE",text:"Salut "+p+", voici ton code d'accès :\n"+t}).catch(()=>{});
 else navigator.clipboard?.writeText(t).then(()=>toast("📋 Code copié (partage manuel)."));});
function renderIssued(){const a=issued();
 $("issuedList").innerHTML=a.length?`<table><tr><th>Prénom</th><th>Expire</th><th>État</th><th></th></tr>`+a.map((x,i)=>{
  const rev=REVOQUES.includes(x.sig);const exp=x.exp<Date.now();
  return `<tr><td>${esc(x.prenom)}</td><td class="small">${new Date(x.exp).toLocaleDateString("fr-FR")}</td>
  <td><span class="tag ${rev?"crit":exp?"":"ok"}">${rev?"révoqué":exp?"expiré":"actif"}</span></td>
  <td><button class="btn ghost small" data-copy="${i}">📋</button><button class="btn red small" data-rev="${i}" ${rev?"disabled":""}>🚫</button></td></tr>`;}).join("")+"</table>"
  :'<p class="small">Aucun code émis sur cet appareil.</p>';
 $("issuedList").querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(a[+b.dataset.copy].code).then(()=>toast("📋 Copié."));});
 $("issuedList").querySelectorAll("[data-rev]").forEach(b=>b.onclick=()=>{const x=a[+b.dataset.rev];
  if(!REVOQUES.includes(x.sig))REVOQUES.push(x.sig);renderRevoke();toast("🚫 Code révoqué localement. Publie revoques.json pour l'appliquer partout.");});}
function renderRevoke(){$("revokeList").innerHTML=REVOQUES.length?`<p class="small">${REVOQUES.length} code(s) révoqué(s) publié(s).</p>`:'<p class="small">Aucune révocation publiée.</p>';}
async function ghPut(path,content){const tk=($("ghPat").value.trim())||localStorage.getItem("ghpat")||"";if(!tk){toast("Token GitHub requis (contents).");return false;}
 localStorage.setItem("ghpat",tk);
 const cur=await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`,{headers:{Authorization:"Bearer "+tk,Accept:"application/vnd.github+json"}});
 const sha=cur.ok?(await cur.json()).sha:null;
 const r=await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`,{method:"PUT",headers:{Authorization:"Bearer "+tk,Accept:"application/vnd.github+json","Content-Type":"application/json"},
  body:JSON.stringify({message:"KEV — publie "+path,content:btoa(unescape(encodeURIComponent(content))),branch:"main",...(sha?{sha}:{})})});
 return r.ok||r.status===200||r.status===201;}
$("btnPublishRevoke").addEventListener("click",async()=>{const ok=await ghPut("data/revoques.json",JSON.stringify(REVOQUES,null,1));toast(ok?"✅ revoques.json publié.":"❌ Échec publication (token/scope).");if(ok)loadPublished();});
$("btnExportRevoke").addEventListener("click",()=>dl("revoques.json",JSON.stringify(REVOQUES,null,1)));

/* ---------- admin : visuel + contact ---------- */
async function compress(file,maxW,q,type){const img=await createImageBitmap(file),sc=Math.min(1,maxW/img.width),c=document.createElement("canvas");c.width=img.width*sc;c.height=img.height*sc;c.getContext("2d").drawImage(img,0,0,c.width,c.height);let url;do{url=c.toDataURL(type,q);q-=.08;}while(url.length>700000&&q>.3);if(url.length>900000)throw new Error("Image trop lourde");return url;}
$("fileFond").addEventListener("change",async e=>{if(!e.target.files[0])return;try{VISUEL.fond=await compress(e.target.files[0],1600,.85,"image/jpeg");applyVisuel(VISUEL);toast("🖼️ Fond appliqué localement. Publie pour diffuser.");}catch(x){toast("❌ "+x.message);}});
$("fileVoiture").addEventListener("change",async e=>{if(!e.target.files[0])return;try{VISUEL.voiture=await compress(e.target.files[0],900,.85,"image/png");applyVisuel(VISUEL);}catch(x){toast("❌ "+x.message);}});
$("opacite").addEventListener("input",()=>{$("opVal").textContent=$("opacite").value+"%";$("wallpaper").style.opacity=$("opacite").value/100;});
$("btnOp").addEventListener("click",()=>{VISUEL.opacite=+$("opacite").value;applyVisuel(VISUEL);});
$("btnPublishVisuel").addEventListener("click",async()=>{VISUEL.opacite=+$("opacite").value;VISUEL.contact=CONTACT_EMAIL||$("contactEmail").value||ADMIN_EMAIL;
 const ok=await ghPut("data/visuel.json",JSON.stringify(VISUEL));toast(ok?"✅ visuel.json publié (diffusé à tous).":"❌ Échec publication.");});
$("btnExportVisuel").addEventListener("click",()=>dl("visuel.json",JSON.stringify(VISUEL,null,1)));
$("btnVisuelReset").addEventListener("click",()=>{VISUEL={opacite:60};applyVisuel(VISUEL);});
$("btnPublishContact").addEventListener("click",async()=>{CONTACT_EMAIL=$("contactEmail").value.trim()||ADMIN_EMAIL;VISUEL.contact=CONTACT_EMAIL;
 const ok=await ghPut("data/visuel.json",JSON.stringify(VISUEL));toast(ok?"✅ Contact publié.":"❌ Échec.");});

/* ---------- messages tiers (email) ---------- */
function outbox(){return JSON.parse(localStorage.getItem("kevo_outbox")||"[]");}
function renderOutbox(){const o=outbox();$("outbox").innerHTML=o.length?o.map((x,i)=>`<div class="hit"><span class="small">${new Date(x.at).toLocaleString("fr-FR")}</span><p>${esc(x.texte.slice(0,180))}</p></div>`).join(""):'<p class="small">Aucun message envoyé.</p>';}
function sendMsg(copy){const t=$("msgTexte").value.trim();if(!t){toast("Écris ton message.");return;}
 const to=CONTACT_EMAIL||ADMIN_EMAIL;const o=outbox();o.unshift({texte:t,at:Date.now()});localStorage.setItem("kevo_outbox",JSON.stringify(o.slice(0,30)));renderOutbox();
 if(copy){navigator.clipboard?.writeText(t).then(()=>toast("📋 Message copié."));}
 else location.href=`mailto:${to}?subject=${encodeURIComponent("Message KEV TECH & FIRE — "+prenom)}&body=${encodeURIComponent(t)}`;
 $("msgTexte").value="";$("predMsg").innerHTML="";}
$("btnMsg").addEventListener("click",()=>sendMsg(false));
$("btnMsgCopy").addEventListener("click",()=>sendMsg(true));

/* ---------- base & MAJ & imports (admin) ---------- */
$("btnReloadBase").addEventListener("click",async()=>{await loadBase(true);await loadPublished();toast("✅ Base rechargée : "+BASE.length);});
$("btnMajServeur").addEventListener("click",async()=>{const tk=$("ghPat").value.trim()||localStorage.getItem("ghpat")||"";if(!tk){toast("Token GitHub (scope workflow) requis une fois.");return;}
 const r=await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/maj-bases.yml/dispatches`,{method:"POST",headers:{Authorization:"Bearer "+tk,Accept:"application/vnd.github+json"},body:JSON.stringify({ref:"main"})});
 toast(r.status===204?"🚀 MAJ lancée.":"❌ GitHub HTTP "+r.status);});
$("btnAddFiche").addEventListener("click",()=>{if(!isAdmin){toast("Réservé admin.");return;}const a=($("mAnnees").value.match(/\d{4}/g)||[]).map(Number);
 const e={id:"admin-"+Date.now(),themes:["technique",...($("mFeu").checked?["incendie"]:[])],type:"panne",source:"admin",marque:$("mMarque").value,modele:$("mModele").value,motorisation:$("mMoteur").value,annees:a.length?[a[0],a[a.length-1]]:null,dtc:($("mDtc").value.toUpperCase().match(/[PCBU][0-9]{4}/g)||[]),defaut:$("mTitre").value,mecanisme:$("mMeca").value,consequences:$("mConseq").value.split("\n").filter(Boolean),risque_feu:$("mFeu").checked,gravite:$("mFeu").checked?"critique":"eleve",url:$("mUrl").value,date:new Date().toISOString().slice(0,10)};
 if(!e.defaut){toast("Titre requis.");return;}OVERLAY.push(e);localStorage.setItem("overlay",JSON.stringify(OVERLAY));BASE.push(e);indexBase();fillFilters();buildCorpus();paintBase();toast("💾 Fiche ajoutée.");});
$("fileImport").addEventListener("change",async e=>{if(!isAdmin){toast("🔒 Import réservé admin.");e.target.value="";return;}
 const files=[...e.target.files];if(!files.length)return;
 if(window.KEV&&KEV.import){await KEV.import(files);}else{toast("Moteur indisponible.");}
 e.target.value="";});
$("btnExportOverlay").addEventListener("click",()=>{if(!isAdmin){toast("Réservé admin.");return;}dl("manual.json",JSON.stringify(OVERLAY,null,1));});

/* ---------- navigation + boot ---------- */
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>["recherche","etude","obd","message"].forEach(v=>$("v-"+v).classList.toggle("hidden",v!==b.dataset.nav))));
document.querySelectorAll("[data-adm]").forEach(b=>b.addEventListener("click",()=>{["acces","visuel","contact","base"].forEach(v=>$("a-"+v).classList.toggle("hidden",v!==b.dataset.adm));
 if(b.dataset.adm==="base")$("baseStats").textContent=`Version ${VERSION} • ${BASE.length} fiches • ${CATALOG.marques.length} marques • ${Object.values(CATALOG.modeles||{}).flat().length} modèles • overlay ${OVERLAY.length}`;}));
majNet();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
loadBase().then(()=>{loadPublished();updQuota(quotaLeftView());});
setInterval(()=>loadBase(false),6*3600*1000);
