/* ================= KEV TECH & FIRE — by Kevin ================= */
"use strict";
const FIREBASE_CONFIG={apiKey:"À_REMPLACER",authDomain:"À_REMPLACER.firebaseapp.com",projectId:"À_REMPLACER",appId:"À_REMPLACER"};
const ADMIN_EMAIL="admin@kev-tech-fire.fr",ADMIN_UID="À_REMPLACER",REPO="expertkevin06-cell/kev-tech-fire",DEMO_PWD="Kevin83600";
const FB_READY=!JSON.stringify(FIREBASE_CONFIG).includes("REMPLACER");
const $=id=>document.getElementById(id);
let db=null,auth=null,uid=null,adminAuth=null,adminDb=null,isAdmin=false,prenom=localStorage.getItem("prenom")||"";
let BASE=[],CATALOG={marques:[],modeles:{},motorisations:[]},VERSION="?",THEME="tous",SUGTERMS=[],CORPUS={},BIGRAMS={};
let OVERLAY=JSON.parse(localStorage.getItem("overlay")||"[]"),IA_ENDPOINT="",adminSubs=[],adminWired=false,wasAdmin=false,carImg=null;
const norm=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const esc=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(m,ms=4200){const d=document.createElement("div");d.className="toast";d.innerHTML=m;$("toasts").appendChild(d);setTimeout(()=>d.remove(),ms);}
function notify(t,b){toast("🔔 <b>"+esc(t)+"</b><br>"+esc(b));if("Notification" in window&&Notification.permission==="granted"){try{new Notification(t,{body:b,icon:"icon.svg"});}catch(e){}}}
function askNotif(){if("Notification" in window&&Notification.permission==="default")Notification.requestPermission();}
function lev1(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else{if(++e>1)return false;a.length>b.length?i++:b.length>a.length?j++:(i++,j++);}}return true;}
function dl(n,t){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"application/json"}));a.download=n;a.click();}
function majNet(){const c=navigator.connection||{},t=c.type==="wifi"?"WiFi":(c.effectiveType||"").toUpperCase().replace("4G","4G/5G");
$("netBadge").textContent=navigator.onLine?("📶 "+(t||"réseau")+" • en ligne"):"📴 Hors ligne — base locale";}
addEventListener("online",majNet);addEventListener("offline",majNet);if(navigator.connection)navigator.connection.addEventListener("change",majNet);
$("themeSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;THEME=b.dataset.t;document.documentElement.dataset.theme=THEME;[...$("themeSeg").children].forEach(x=>x.classList.toggle("on",x===b));renderResults();});
/* ---- FOND ANIMÉ "Néon Drive" ---- */
const cv=$("bg"),cx=cv.getContext("2d");let W=0,H=0,stars=[],bld1=[],bld2=[],trails=[],streaks=[],dashOff=0,running=true;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize(){const d=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
 stars=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H*.55,r:Math.random()*1.4+.3,p:Math.random()*6}));
 const mk=(n,hb)=>Array.from({length:n},(_,i)=>({x:i*(W/n),w:W/n*.7,h:hb+Math.random()*hb}));bld1=mk(14,H*.16);bld2=mk(20,H*.1);}
addEventListener("resize",resize);resize();
function acc(){return getComputedStyle(document.documentElement).getPropertyValue("--acc").trim()||"#00e676";}
function drawCar(x,y,s,t){cx.save();cx.translate(x,y+Math.sin(t/180)*1.6);cx.scale(s,s);
 if(carImg){cx.drawImage(carImg,-150,-78,300,90);cx.restore();return;}
 const a=acc();cx.shadowColor=a;cx.shadowBlur=18;
 cx.fillStyle="#0d1330";cx.strokeStyle=a;cx.lineWidth=2;
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
function applyVisuel(d){$("wallpaper").style.backgroundImage=d.fond?`url(${d.fond})`:"";$("wallpaper").style.opacity=(d.opacite??60)/100;
 if(d.voiture){const im=new Image();im.onload=()=>carImg=im;im.src=d.voiture;}else carImg=null;}
/* ---- base ---- */
async function fetchJSON(u){const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(u);return r.json();}
async function loadBase(force){try{const idx=await fetchJSON("data/index.json?ts="+Date.now());
 if(!force&&idx.version===VERSION&&BASE.length)return;VERSION=idx.version;let all=[];
 for(const f of idx.chunks){try{all=all.concat(await fetchJSON("data/"+f));}catch(e){}}
 BASE=all;CATALOG=idx.catalogue&&idx.catalogue.marques&&idx.catalogue.marques.length?idx.catalogue:buildCatalog(BASE);
}catch(e){try{BASE=await fetchJSON("data/seed.json");CATALOG=buildCatalog(BASE);VERSION="seed (hors ligne)";}catch(e2){BASE=[];}}
 BASE=BASE.concat(OVERLAY);indexBase();$("baseBadge").textContent="🗄️ "+BASE.length+" fiches • "+VERSION;fillFilters();fillDatalists();buildCorpus();renderResults();}
function buildCatalog(en){const m=new Set(),mo={},mot=new Set();en.forEach(e=>{(e.marque||"").split(/[\/,]/).forEach(x=>{x=x.trim();if(x)m.add(x);});
 if(e.modele)e.modele.split(/[\/,]/).forEach(x=>{x=x.trim();if(x){const k=(e.marque||"").split("/")[0].trim();(mo[k]=mo[k]||new Set()).add(x);}});if(e.motorisation)mot.add(e.motorisation);});
 const modeles={};Object.keys(mo).forEach(k=>modeles[k]=[...mo[k]].sort());return{marques:[...m].sort(),modeles,motorisations:[...mot].sort()};}
function indexBase(){BASE.forEach(e=>{e._h=norm([e.marque,e.modele,e.motorisation,e.systeme,e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" "),(e.dtc||[]).join(" "),e.campagne].join(" "));e._t=norm((e.defaut||"")+" "+(e.systeme||""));});}
/* ---- recherche prédictive ---- */
function search(q,limit=40){const toks=norm(q).split(" ").filter(Boolean);if(!toks.length)return[];const out=[];
 for(const e of BASE){if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;
  if($("fMarque").value&&norm(e.marque).indexOf(norm($("fMarque").value))<0)continue;
  if($("fSys").value&&norm(e.systeme)!==norm($("fSys").value))continue;
  if($("fGrav").value&&e.gravite!==$("fGrav").value)continue;
  let s=0;for(const t of toks){if(e._t.includes(t))s+=3;else if(e._h.includes(t))s+=2;else if(t.length>=5&&e._h.split(" ").some(w=>lev1(w,t)))s+=1;}
  if(s>0)out.push([s,e]);}return out.sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>x[1]);}
function hitCard(e){return `<div class="hit ${e.risque_feu?"feu":""}"><b>${esc(e.defaut||"Fiche")}</b>
 <div class="meta">${esc(e.marque||"Multi-marques")} • ${esc(e.modele||"")} ${esc(e.motorisation||"")} ${e.annees?("• "+e.annees[0]+"-"+e.annees[1]):""}</div>
 <div>${(e.themes||[]).includes("incendie")?'<span class="tag feu">🔥 incendie</span>':""}<span class="tag">${esc(e.systeme||"général")}</span>${e.gravite==="critique"?'<span class="tag crit">critique</span>':""}${(e.dtc||[]).map(d=>'<span class="tag">'+esc(d)+"</span>").join("")}<span class="tag ok">${esc(e.source||"")}</span>${e.source==="nhtsa"?'<span class="tag">🇬🇧 VO</span>':""}</div>
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
 SUGTERMS=[];const add=v=>{if(v)SUGTERMS.push({v,n:norm(v)});};CATALOG.marques.forEach(add);Object.values(CATALOG.modeles).flat().forEach(add);CATALOG.motorisations.forEach(add);ss.forEach(add);BASE.slice(0,4000).forEach(e=>(e.dtc||[]).forEach(add));
 const seen=new Set();SUGTERMS=SUGTERMS.filter(t=>!seen.has(t.n)&&seen.add(t.n));}
function fillDatalists(){$("dlMarques").innerHTML=CATALOG.marques.map(m=>`<option value="${esc(m)}">`).join("");$("dlMoteurs").innerHTML=CATALOG.motorisations.map(m=>`<option value="${esc(m)}">`).join("");majModeles();}
function majModeles(){const m=$("cMarque").value;let l=[];for(const k in CATALOG.modeles)if(!m||norm(k).includes(norm(m)))l=l.concat(CATALOG.modeles[k]);$("dlModeles").innerHTML=[...new Set(l)].sort().map(x=>`<option value="${esc(x)}">`).join("");}
$("cMarque").addEventListener("input",majModeles);
/* ---- rédaction prédictive ---- */
function buildCorpus(){CORPUS={};BIGRAMS={};const feed=t=>{const w=norm(t).split(" ").filter(x=>x.length>2);for(let i=0;i<w.length;i++){CORPUS[w[i]]=(CORPUS[w[i]]||0)+1;if(i+1<w.length){(BIGRAMS[w[i]]=BIGRAMS[w[i]]||{});BIGRAMS[w[i]][w[i+1]]=(BIGRAMS[w[i]][w[i+1]]||0)+1;}}};
 BASE.slice(0,9000).forEach(e=>feed([e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" ")].join(" ")));
 feed("incendie fuite huile carburant surchauffe courroie distribution turbo EGR faisceau batterie voyant moteur panne achat occasion vendeur professionnel particulier vice caché garantie expertise litige assurance sinistre");}
function predict(text){const w=norm(text).split(" "),last=w[w.length-1]||"",prev=w[w.length-2]||"",end=/\s$/.test(text),out=[];
 if(!end&&last.length>=2)Object.keys(CORPUS).filter(k=>k.startsWith(last)&&k!==last).sort((a,b)=>CORPUS[b]-CORPUS[a]).slice(0,4).forEach(k=>out.push({label:k,mode:"replace"}));
 const key=end?last:prev;if(key&&BIGRAMS[key])Object.keys(BIGRAMS[key]).sort((a,b)=>BIGRAMS[key][b]-BIGRAMS[key][a]).slice(0,3).forEach(k=>out.push({label:k,mode:"append"}));return out.slice(0,6);}
function wirePredict(ta,ch){ta.addEventListener("input",()=>{const s=predict(ta.value);ch.innerHTML=s.map((x,i)=>`<button data-i="${i}">${esc(x.label)} ⏎</button>`).join("");ch._s=s;});
 ch.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const s=ch._s[+b.dataset.i];ta.value=s.mode==="replace"?ta.value.replace(/[\wÀ-ÿ-]+$/,s.label)+" ":ta.value.replace(/\s*$/,"")+" "+s.label+" ";ta.dispatchEvent(new Event("input"));ta.focus();});}
wirePredict($("ctx"),$("predCtx"));wirePredict($("msgTexte"),$("predMsg"));
/* ---- véhicule + QCM ---- */
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
function energyOK(e,v){if(!e.energie)return true;if(!v.energie)return true;if(e.energie===v.energie)return true;
 if(v.energie==="hybride")return true;if(e.energie==="electrique"&&v.energie==="hybride")return true;return false;}
/* ---- 🔥 moteur incendie renforcé ---- */
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
 const lvlTxt=lvl==="hi"?"ÉLEVÉ — rappel incendie concordant":lvl==="mid"?"MODÉRÉ — chaînes documentées pour ce véhicule":"GÉNÉRIQUE — doctrine applicable, pas de chaîne spécifique";
 const ctrl=[...new Set(spec.concat(doctrine).flatMap(e=>e.indices||[]))].slice(0,10);
 let h=`<div class="firebox"><h3>🔥 Analyse incendie renforcée — ${esc(v.marque||"véhicule")} ${esc(v.modele)} ${esc(v.moteur)} ${v.energie?("("+v.energie+")"):""}</h3>
 <p><span class="lvl ${lvl}">${lvlTxt}</span></p>`;
 if(rappelsFeu.length)h+=`<h3>🚨 Rappels incendie concordants (${rappelsFeu.length})</h3>`+rappelsFeu.map(e=>`<div class="hit feu"><b>${esc(e.defaut)}</b><div class="meta">${esc(e.campagne||e.source)} ${e.date||""}</div><p class="small">${esc(e.chaine_feu||e.mecanisme||"")}</p>${e.url?`<a class="small" href="${esc(e.url)}" target="_blank">📎 Campagne</a>`:""}</div>`).join("");
 if(spec.length)h+=`<h3>Chaînes « panne initiale → incendie » documentées pour CE véhicule (${spec.length})</h3>`+spec.slice(0,10).map(e=>`<div class="hit feu"><b>${esc(e.defaut)}</b><p class="small">⛓️ ${esc(e.chaine_feu||e.mecanisme||"")}</p><div class="meta">${esc(e.source)} ${esc(e.campagne||"")}</div></div>`).join("");
 if(boost.length)h+=`<h3>⚠️ Signaux du contexte à vérifier en priorité</h3><ul class="small">${boost.map(b=>"<li>"+esc(b)+"</li>").join("")}</ul>`;
 if(doctrine.length)h+=`<details><summary class="small" style="cursor:pointer;color:var(--acc)">Doctrine incendie applicable à l'énergie (${doctrine.length})</summary>`+doctrine.map(e=>`<div class="hit feu"><b>${esc(e.defaut)}</b><p class="small">${esc(e.mecanisme||"")}</p></div>`).join("")+"</details>";
 if(ctrl.length)h+=`<h3>🔍 Points de contrôle prioritaires</h3><ul class="small">${ctrl.map(c=>"<li>"+esc(c)+"</li>").join("")}</ul>`;
 h+=`<p class="small">Niveau fondé sur les données documentées (rappels + base fusionnée). Ne préjuge pas de l'origine réelle : expertise physique nécessaire. En cas de doute sécurité, ne pas rouler / ne pas charger (VE).</p></div>`;
 return{html:h,data:{niveau:lvlTxt,rappels_feu:rappelsFeu,chaines:spec,signaux:boost,doctrine}};}
/* ---- étude de cas ---- */
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
 ${feu.html}
 <h3>Conclusion</h3><p><b>Niveau : ${niveau}.</b></p><p class="small">Méthode : qualifier → inférer → corréler → analyser → tester → conclure. Aide documentaire fondée sur les sources ; ne remplace pas une expertise physique.</p></div>`;
 const histo=JSON.parse(localStorage.getItem("histo")||"[]");histo.unshift({date,v,niveau,n:rappels.length+" rappels / "+pannes.length+" pannes"});localStorage.setItem("histo",JSON.stringify(histo.slice(0,20)));renderHisto();
 window._rapport={date,vehicule:v,symptomes:sym,dtc:dtcs,niveau,rappels,pannes,incendie:feu.data};toast("✅ Étude terminée.");}
$("btnAnalyser").addEventListener("click",analyser);
$("btnPrint").addEventListener("click",()=>window.print());
$("btnExportEtude").addEventListener("click",()=>window._rapport&&dl("etude-cas.json",JSON.stringify(window._rapport,null,1)));
function renderHisto(){const h=JSON.parse(localStorage.getItem("histo")||"[]");$("histo").innerHTML=h.map(x=>`<div class="hit"><b>${esc(x.v.marque)} ${esc(x.v.modele)}</b> <span class="small">${esc(x.date)} — ${esc(x.n)} — ${esc(x.niveau)}</span></div>`).join("")||'<p class="small">Aucune.</p>';}
/* ---- quota 5/sem + analyse contexte ---- */
async function consumeQuota(){if(isAdmin)return{ok:true,left:"∞"};
 if(!FB_READY){const q=JSON.parse(localStorage.getItem("quota")||'{"debut":0,"n":0}'),now=Date.now();if(now-q.debut>=7*864e5){q.debut=now;q.n=0;}if(q.n>=5)return{ok:false,left:0,reset:q.debut+7*864e5};q.n++;localStorage.setItem("quota",JSON.stringify(q));return{ok:true,left:5-q.n,reset:q.debut+7*864e5};}
 const ref=db.collection("quotas").doc(uid);
 try{const r=await db.runTransaction(async tx=>{const s=await tx.get(ref),now=Date.now();
  if(!s.exists){tx.set(ref,{debut:firebase.firestore.FieldValue.serverTimestamp(),n:1});return{left:4,reset:now+7*864e5};}
  const d=s.data(),debut=d.debut.toMillis?d.debut.toMillis():now;
  if(now-debut>=7*864e5){tx.set(ref,{debut:firebase.firestore.FieldValue.serverTimestamp(),n:1});return{left:4,reset:now+7*864e5};}
  if(d.n>=5)return{blocked:true,reset:debut+7*864e5};tx.update(ref,{n:d.n+1});return{left:4-d.n,reset:debut+7*864e5};});
  if(r.blocked)return{ok:false,left:0,reset:r.reset};return{ok:true,left:r.left,reset:r.reset};}catch(e){return{ok:false,error:e.message};}}
function updQuota(q){$("quotaBadge").textContent=q.left==="∞"?"🎟️ admin ∞":`🎟️ ${q.left}/5 restantes`+(q.reset?` · reset ${new Date(q.reset).toLocaleDateString("fr-FR")}`:"");}
async function analyserContexte(){const ctx=$("ctx").value.trim();if(!ctx){toast("Décris ta situation dans la case contexte.");return;}
 const q=await consumeQuota();updQuota(q);
 if(!q.ok){toast(q.error?("❌ Quota : "+q.error):"🚫 Quota atteint (5/7 jours). Réinitialisation le "+new Date(q.reset).toLocaleDateString("fr-FR")+".",6000);return;}
 const v=getVeh(),vendeur=$("cVendeur").value,ctxToks=norm(ctx).split(" ").filter(t=>t.length>3);
 const legal=legalMatch(ctx,vendeur);
 const scored=[];for(const e of BASE){let s=matchVehicle(e,v);if(s<0)s=0;for(const t of ctxToks){if(norm(e.defaut).includes(t))s+=2;else if(e._h.includes(t))s+=1;}if(s>=3)scored.push([s,e]);}
 scored.sort((a,b)=>b[0]-a[0]);const tech=scored.slice(0,12).map(x=>x[1]);
 const fireSig=/incendie|feu|flamme|brule|fumee|sinistre/.test(norm(ctx))||tech.some(e=>e.risque_feu);
 const feu=fireSig?fireAnalysis(v,tech,ctxToks,[]):null;
 let iaHtml="";if(IA_ENDPOINT){try{const r=await fetch(IA_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contexte:ctx,vehicule:v,vendeur})});const j=await r.json().catch(()=>null);const txt=j&&(j.reponse||j.text||j.analysis)||(typeof j==="string"?j:"");if(txt)iaHtml=`<h3>🤖 Analyse IA Auto-Legal (en ligne)</h3><div class="hit"><p class="small">${esc(txt)}</p></div>`;}catch(e){iaHtml='<p class="small">Pont IA injoignable — moteur local utilisé.</p>';}}
 const date=new Date().toLocaleString("fr-FR");
 $("ctxReport").innerHTML=`<div class="card"><h2>⚖️🔧 Analyse du contexte — ${date}</h2>
 <p class="small"><b>Véhicule :</b> ${esc(v.marque)} ${esc(v.modele)} ${esc(v.moteur)} ${v.annee||""} · <b>Vendeur :</b> ${esc(vendeur)} · <b>Quota :</b> ${q.left==="∞"?"admin ∞":q.left+"/5 restantes"}</p>
 <p class="small"><b>Contexte :</b> ${esc(ctx)}</p>${iaHtml}
 <h3>1️⃣ Qualification juridique (moteur Auto-Legal by Kevin)</h3>${renderLegal(legal)}
 <h3>2️⃣ Corrélation technique (base fusionnée APK)</h3>${tech.map(hitCard).join("")||'<p class="small">Aucune corrélation — précise marque/modèle/motorisation et symptômes.</p>'}
 ${feu?("<h3>3️⃣ Volet incendie</h3>"+feu.html):""}
 <h3>${feu?"4️⃣":"3️⃣"} Plan d'action & preuves</h3><ul class="small">${[...new Set(legal.flatMap(f=>f.demarches).concat(["Conserver factures, annonce, contrat, historique d'entretien","Faire établir un diagnostic écrit avant toute réparation","En cas de litige : réclamation écrite puis médiation / expertise contradictoire"]))].slice(0,10).map(x=>"<li>"+esc(x)+"</li>").join("")}</ul>
 <p class="small">⚠️ Aide documentaire (base Auto-Legal + base technique fusionnée). Ne constitue pas une consultation juridique personnalisée ni une expertise ; fais vérifier ton dossier par un professionnel du droit / un expert automobile.</p></div>`;
 window._ctx={date,contexte:ctx,vehicule:v,vendeur,legal:legal.map(f=>f.id),technique:tech,incendie:feu?feu.data:null};toast("✅ Analyse contexte terminée.");}
$("btnCtx").addEventListener("click",analyserContexte);
$("btnCtxPrint").addEventListener("click",()=>window.print());
$("btnCtxExport").addEventListener("click",()=>window._ctx&&dl("analyse-contexte.json",JSON.stringify(window._ctx,null,1)));
/* ---- OBD BLE ---- */
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
/* ---- Firebase double porte ---- */
const SCREENS=["choice","gate","adminLogin","app","admin"];
function showOnly(id){SCREENS.forEach(x=>$(x).classList.toggle("hidden",x!==id));$("btnQuit").classList.toggle("hidden",!(id==="app"||id==="admin"));}
function showChoice(){showOnly("choice");}
function gate(st,name){showOnly("gate");["gateForm","gateWait","gateOk","gateKo"].forEach(i=>$(i).classList.add("hidden"));
 if(st==="attente"){$("gateWait").classList.remove("hidden");$("waitName").textContent=name;}
 else if(st==="autorise"){$("gateOk").classList.remove("hidden");$("okName").textContent=name;}
 else if(st==="refuse"||st==="revoque"){$("gateKo").classList.remove("hidden");$("koText").textContent=st==="revoque"?"🔒 Accès révoqué par l'admin.":"❌ Accès refusé.";}
 else $("gateForm").classList.remove("hidden");}
function showApp(){showOnly("app");$("btnBackAdmin").classList.toggle("hidden",!isAdmin);renderHisto();updQuota(isAdmin?{left:"∞"}:{left:"…"});}
function showAdmin(){showOnly("admin");adminListen();}
function adminStop(){adminSubs.forEach(f=>{try{f();}catch(e){}});adminSubs=[];adminWired=false;}
async function initFirebase(){if(!FB_READY){toast("⚠️ Firebase non configuré : mode démo local. Suis le guide Firebase.");uid="demo";showChoice();return;}
 firebase.initializeApp(FIREBASE_CONFIG);const adminApp=firebase.initializeApp(FIREBASE_CONFIG,"admin");
 auth=firebase.auth();db=firebase.firestore();adminAuth=adminApp.auth();adminDb=adminApp.firestore();
 try{await db.enablePersistence({synchronizeTabs:true});}catch(e){}
 try{await adminAuth.setPersistence(firebase.auth.Auth.Persistence.NONE);}catch(e){}
 adminAuth.onAuthStateChanged(u=>{isAdmin=!!u&&u.uid===ADMIN_UID;if(isAdmin){wasAdmin=true;notify("🛡️ Mode admin","Console déverrouillée.");showAdmin();}else if(wasAdmin){wasAdmin=false;adminStop();showChoice();}});
 auth.onAuthStateChanged(async u=>{if(!u){await auth.signInAnonymously();return;}uid=u.uid;
  db.collection("acces").doc(uid).onSnapshot(doc=>{const d=doc.data(),mt=localStorage.getItem("mode")==="tiers";
   if(!d){if(mt&&!isAdmin)gate("form");else if(!isAdmin)showChoice();return;}
   prenom=d.prenom||prenom;localStorage.setItem("prenom",prenom);localStorage.setItem("statut",d.statut);
   const prev=gate._last;gate._last=d.statut;
   if(prev&&prev!==d.statut){if(d.statut==="autorise")notify("✅ Accès autorisé","Bienvenue "+prenom);if(d.statut==="revoque")notify("🔒 Accès révoqué","L'admin a coupé l'accès.");if(d.statut==="refuse")notify("❌ Refusé","Tu peux refaire une demande.");}
   if(isAdmin)return;if(!mt){showChoice();return;}if(d.statut==="autorise")showApp();else gate(d.statut,prenom);
  },()=>{const st=localStorage.getItem("statut"),mt=localStorage.getItem("mode")==="tiers";if(isAdmin)return;if(mt&&st==="autorise")showApp();else if(mt)gate(st||"form",prenom);else showChoice();});
  db.collection("config").doc("visuel").onSnapshot(doc=>applyVisuel(doc.data()||{}));
  db.collection("config").doc("legal").onSnapshot(doc=>{IA_ENDPOINT=(doc.data()||{}).endpoint||"";});});
 if(localStorage.getItem("mode")!=="tiers")showChoice();}
$("btnModeAdmin").addEventListener("click",()=>{askNotif();$("adminPwd").value="";showOnly("adminLogin");$("adminPwd").focus();});
$("btnModeTiers").addEventListener("click",()=>{askNotif();localStorage.setItem("mode","tiers");if(!FB_READY){showApp();return;}const st=gate._last||localStorage.getItem("statut");if(st==="autorise")showApp();else gate(st||"form",prenom);});
$("btnGateBack").addEventListener("click",()=>{localStorage.removeItem("mode");showChoice();});
$("btnAdminBack").addEventListener("click",showChoice);
$("btnDemande").addEventListener("click",async()=>{askNotif();const p=$("prenom").value.trim();if(!p){toast("Indique ton prénom.");return;}prenom=p;localStorage.setItem("prenom",p);
 if(!FB_READY){showApp();return;}await db.collection("acces").doc(uid).set({prenom:p,statut:"attente",cree:Date.now(),maj:Date.now(),historique:[{action:"demande",date:Date.now()}]});gate("attente",p);notify("📨 Demande envoyée","L'admin va valider.");});
$("btnReDemande").addEventListener("click",async()=>{if(FB_READY)await db.collection("acces").doc(uid).update({statut:"attente",maj:Date.now(),historique:firebase.firestore.FieldValue.arrayUnion({action:"nouvelle demande",date:Date.now()})});gate("attente",prenom);});
$("btnEntrer").addEventListener("click",showApp);
$("btnAdminLogin").addEventListener("click",async()=>{const pwd=$("adminPwd").value;$("adminPwd").value="";if(!pwd)return;
 if(!FB_READY){if(pwd===DEMO_PWD){isAdmin=true;wasAdmin=true;showAdmin();}else toast("❌ Mot de passe incorrect.");return;}
 try{await adminAuth.signInWithEmailAndPassword(ADMIN_EMAIL,pwd);const u=adminAuth.currentUser;if(!u||u.uid!==ADMIN_UID){await adminAuth.signOut();toast("❌ Compte non admin.");}}catch(e){toast("❌ Refus : "+e.code);}});
$("btnLogout").addEventListener("click",async()=>{if(FB_READY&&adminAuth.currentUser)await adminAuth.signOut();isAdmin=false;adminStop();showChoice();});
$("btnQuit").addEventListener("click",async()=>{if(isAdmin){if(FB_READY&&adminAuth.currentUser)await adminAuth.signOut();isAdmin=false;adminStop();}showChoice();});
$("btnBackAdmin").addEventListener("click",()=>isAdmin&&showAdmin());
$("btnAdminToApp").addEventListener("click",showApp);
/* ---- admin listes ---- */
function adminListen(){if(!FB_READY){$("accesList").innerHTML="<p class='small'>Mode démo : configure Firebase.</p>";return;}if(adminWired)return;adminWired=true;
 adminSubs.push(adminDb.collection("acces").orderBy("maj","desc").onSnapshot(snap=>{let pend=0;const rows=[];
  snap.forEach(doc=>{const d=doc.data();if(d.statut==="attente")pend++;rows.push(`<tr><td>${esc(d.prenom)}</td><td><span class="tag ${d.statut==="autorise"?"ok":d.statut==="attente"?"":"crit"}">${esc(d.statut)}</span></td><td class="small">${new Date(d.maj||d.cree).toLocaleString("fr-FR")}</td><td><button class="btn green" data-id="${doc.id}" data-a="autorise">✅</button><button class="btn red" data-id="${doc.id}" data-a="refuse">❌</button><button class="btn ghost" data-id="${doc.id}" data-a="revoque">🔒</button></td></tr>`);});
  $("accesList").innerHTML=`<p class="small">${snap.size} appareil(s) • ${pend} en attente</p><table><tr><th>Prénom</th><th>Statut</th><th>Action</th><th>Décision</th></tr>${rows.join("")}</table>`;
  if(pend>(adminListen._p||0))notify("📨 Nouvelle demande",pend+" en attente");adminListen._p=pend;},()=>{}));
 if(!$("accesList")._w){$("accesList")._w=1;$("accesList").addEventListener("click",async e=>{const b=e.target.closest("button[data-a]");if(!b)return;await adminDb.collection("acces").doc(b.dataset.id).update({statut:b.dataset.a,maj:Date.now(),historique:firebase.firestore.FieldValue.arrayUnion({action:b.dataset.a,par:"admin",date:Date.now()})});toast("✔️ "+b.dataset.a+" en temps réel.");});}
 adminSubs.push(adminDb.collection("messages").orderBy("date","desc").limit(100).onSnapshot(snap=>{$("msgList").innerHTML=snap.docs.map(doc=>{const d=doc.data();return `<div class="hit"><b>${esc(d.prenom)}</b> <span class="small">${new Date(d.date).toLocaleString("fr-FR")}</span><p>${esc(d.texte)}</p><button class="btn ghost" data-del="${doc.id}">🗑️</button></div>`;}).join("")||"<p class='small'>Aucun.</p>";if(snap.size>(adminListen._m||0)&&adminListen._m!==undefined)notify("✉️ Message tiers","Ouvre la boîte admin.");adminListen._m=snap.size;},()=>{}));
 if(!$("msgList")._w){$("msgList")._w=1;$("msgList").addEventListener("click",async e=>{const b=e.target.closest("[data-del]");if(b)await adminDb.collection("messages").doc(b.dataset.del).delete();});}}
/* ---- messages tiers ---- */
$("btnMsg").addEventListener("click",async()=>{const t=$("msgTexte").value.trim();if(!t)return;if(!FB_READY){toast("Mode démo : Firebase requis.");return;}await db.collection("messages").add({uid,prenom,texte:t,date:Date.now(),lu:false});$("msgTexte").value="";$("predMsg").innerHTML="";toast("📨 Envoyé.");});
/* ---- visuel + opacité + IA (admin) ---- */
async function compress(file,maxW,q,type){const img=await createImageBitmap(file),sc=Math.min(1,maxW/img.width),c=document.createElement("canvas");c.width=img.width*sc;c.height=img.height*sc;c.getContext("2d").drawImage(img,0,0,c.width,c.height);let url;do{url=c.toDataURL(type,q);q-=.08;}while(url.length>700000&&q>.3);if(url.length>900000)throw new Error("Image trop lourde");return url;}
async function pushVisuel(patch){if(!FB_READY||!isAdmin){toast("Réservé admin (Firebase).");return;}await adminDb.collection("config").doc("visuel").set({...patch,maj:Date.now()},{merge:true});toast("🖼️ Diffusé en temps réel.");}
$("fileFond").addEventListener("change",async e=>{if(e.target.files[0])try{pushVisuel({fond:await compress(e.target.files[0],1600,.85,"image/jpeg")});}catch(x){toast("❌ "+x.message);}});
$("fileVoiture").addEventListener("change",async e=>{if(e.target.files[0])try{pushVisuel({voiture:await compress(e.target.files[0],900,.85,"image/png")});}catch(x){toast("❌ "+x.message);}});
$("opacite").addEventListener("input",()=>{$("opVal").textContent=$("opacite").value+"%";$("wallpaper").style.opacity=$("opacite").value/100;});
$("btnOp").addEventListener("click",()=>pushVisuel({opacite:+$("opacite").value}));
$("btnVisuelReset").addEventListener("click",()=>{pushVisuel({fond:null,voiture:null,opacite:60});applyVisuel({});});
$("btnIa").addEventListener("click",async()=>{if(!FB_READY||!isAdmin){toast("Réservé admin.");return;}await adminDb.collection("config").doc("legal").set({endpoint:$("iaEndpoint").value.trim(),maj:Date.now()},{merge:true});toast("🔗 Endpoint IA enregistré.");});
/* ---- base & MAJ & imports (admin seul) ---- */
$("btnReloadBase").addEventListener("click",async()=>{await loadBase(true);toast("✅ Base rechargée : "+BASE.length);});
$("btnMajServeur").addEventListener("click",async()=>{const pat=$("ghPat").value.trim();if(pat)localStorage.setItem("ghpat",pat);const tk=pat||localStorage.getItem("ghpat");if(!tk){toast("Token GitHub (scope workflow) requis une fois.");return;}
 const r=await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/maj-bases.yml/dispatches`,{method:"POST",headers:{Authorization:"Bearer "+tk,Accept:"application/vnd.github+json"},body:JSON.stringify({ref:"main"})});toast(r.status===204?"🚀 MAJ lancée.":"❌ GitHub HTTP "+r.status);});
$("btnAddFiche").addEventListener("click",()=>{if(!isAdmin){toast("Réservé admin.");return;}const a=($("mAnnees").value.match(/\d{4}/g)||[]).map(Number);
 const e={id:"admin-"+Date.now(),themes:["technique",...($("mFeu").checked?["incendie"]:[])],type:"panne",source:"admin",marque:$("mMarque").value,modele:$("mModele").value,motorisation:$("mMoteur").value,annees:a.length?[a[0],a[a.length-1]]:null,dtc:($("mDtc").value.toUpperCase().match(/[PCBU][0-9]{4}/g)||[]),defaut:$("mTitre").value,mecanisme:$("mMeca").value,consequences:$("mConseq").value.split("\n").filter(Boolean),risque_feu:$("mFeu").checked,gravite:$("mFeu").checked?"critique":"eleve",url:$("mUrl").value,date:new Date().toISOString().slice(0,10)};
 if(!e.defaut){toast("Titre requis.");return;}OVERLAY.push(e);localStorage.setItem("overlay",JSON.stringify(OVERLAY));BASE.push(e);indexBase();fillFilters();buildCorpus();$("baseBadge").textContent="🗄️ "+BASE.length+" fiches";toast("💾 Fiche ajoutée.");});
$("fileImport").addEventListener("change",async e=>{if(!isAdmin){toast("🔒 Import réservé à l'admin.");e.target.value="";return;}const f=e.target.files[0];if(!f)return;
 try{let added=0;const ext=f.name.split(".").pop().toLowerCase();
  if(ext==="json"){let j=JSON.parse(await f.text());if(Array.isArray(j))j={entries:j};(j.entries||[]).forEach((x,i)=>{OVERLAY.push({id:x.id||"imp-"+Date.now()+"-"+i,themes:x.themes||["technique"],type:x.type||"panne",source:x.source||"import",...x});added++;});}
  else if(ext==="txt"||ext==="md"){const txt=await f.text();for(let i=0;i<txt.length;i+=1500){OVERLAY.push({id:"doc-"+Date.now()+"-"+i,themes:["technique","incendie"],type:"document",source:"admin-document",defaut:"Document : "+f.name,mecanisme:txt.slice(i,i+1500),consequences:[],risque_feu:/incendie|feu/i.test(txt),gravite:"modere",date:new Date().toISOString().slice(0,10)});added++;}}
  else if(ext==="pdf"){toast("⏳ Lecture PDF…");await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
   pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
   const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let txt="";for(let p=1;p<=Math.min(pdf.numPages,200);p++){const pg=await pdf.getPage(p);const tc=await pg.getTextContent();txt+=tc.items.map(x=>x.str).join(" ")+"\n";}
   for(let i=0;i<txt.length;i+=1500){OVERLAY.push({id:"pdf-"+Date.now()+"-"+i,themes:["technique","incendie"],type:"document",source:"admin-document",defaut:"PDF : "+f.name,mecanisme:txt.slice(i,i+1500),consequences:[],risque_feu:/incendie|feu/i.test(txt),gravite:"modere",date:new Date().toISOString().slice(0,10)});added++;}}
  localStorage.setItem("overlay",JSON.stringify(OVERLAY));await loadBase(true);toast("📥 "+added+" élément(s) importé(s) (admin).");}catch(err){toast("❌ Import : "+err.message);}e.target.value="";});
$("btnExportOverlay").addEventListener("click",()=>{if(!isAdmin){toast("Réservé admin.");return;}dl("manual.json",JSON.stringify(OVERLAY,null,1));});
/* ---- navigation + boot ---- */
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>["recherche","etude","obd","message"].forEach(v=>$("v-"+v).classList.toggle("hidden",v!==b.dataset.nav))));
document.querySelectorAll("[data-adm]").forEach(b=>b.addEventListener("click",()=>{["acces","msgs","visuel","base"].forEach(v=>$("a-"+v).classList.toggle("hidden",v!==b.dataset.adm));if(b.dataset.adm==="base")$("baseStats").textContent=`Version ${VERSION} • ${BASE.length} fiches • ${CATALOG.marques.length} marques • ${Object.values(CATALOG.modeles).flat().length} modèles • overlay ${OVERLAY.length}`;}));
majNet();if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
loadBase().then(initFirebase);setInterval(()=>loadBase(false),6*3600*1000);
