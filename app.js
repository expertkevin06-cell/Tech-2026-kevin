/* KEV TECH & FIRE — application consolidée (aucune dépendance externe) */
"use strict";
(function(){
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const arr=v=>Array.isArray(v)?v.map(x=>String(x).trim()).filter(Boolean):typeof v==="string"?v.replace(/;/g,"\n").split(/\r?\n/).map(x=>x.trim()).filter(Boolean):[];
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);};
const fid=e=>e.id||hash([e.source,e.campagne,e.marque,e.modele,e.motorisation,e.defaut].map(N).join("|"));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function toast(m,ms){const d=document.createElement("div");d.className="toast";d.innerHTML=m;D("toasts").appendChild(d);setTimeout(()=>d.remove(),ms||4200);}
function dl(n,t){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"application/json"}));a.download=n;a.click();}
const ADMIN_B64="S2V2aW44MzYwMA==",SECRET="KEVTF-"+ADMIN_B64;
let BASE=[],PHOTOS={},THEME="tous",isAdmin=false,prenom=localStorage.getItem("prenom")||"";
let OVERLAY=JSON.parse(localStorage.getItem("kevo_manual")||'{"entries":[],"photos":[]}');
let VISUEL=JSON.parse(localStorage.getItem("kevo_visuel")||'{"opacite":60}');
let REVOQUES=JSON.parse(localStorage.getItem("kevo_rev")||"[]");
let PENDING=[],LASTF=[],carImg=null,CONTACT=localStorage.getItem("kevo_contact")||"contact@kev-tech-fire.fr";
const SYMPT=["voyant allumé","perte de puissance","à-coups moteur","à-coups boîte","bruit anormal","claquement","fumée","odeur carburant","odeur brûlé","surchauffe","fuite visible","démarrage difficile","incendie / départ de feu","véhicule immobilisé","après entretien / réparation","après choc","après immersion"];
const FIRE=/incendie|feu\b|flamme|embras|brulure|inflamm|\bfire\b|flamm|ignit|burn/i;

/* ---------- moteurs ---------- */
const EDB={
"peugeot|208":[["1.2 PureTech",1199,"essence",[75,100,130]],["1.5 BlueHDi",1499,"diesel",[100]],["e-208 électrique",0,"electrique",[136,156]]],
"peugeot|2008":[["1.2 PureTech",1199,"essence",[100,130,155]],["1.5 BlueHDi",1499,"diesel",[110,130]],["e-2008 électrique",0,"electrique",[136,156]]],
"peugeot|308":[["1.2 PureTech",1199,"essence",[110,130]],["1.5 BlueHDi",1499,"diesel",[130]],["1.6 Hybrid PHEV",1598,"hybride",[180,225]],["e-308 électrique",0,"electrique",[156]]],
"peugeot|3008":[["1.2 PureTech",1199,"essence",[130]],["1.5 BlueHDi",1499,"diesel",[130]],["1.6 BlueHDi",1560,"diesel",[120]],["2.0 BlueHDi",1997,"diesel",[150,180]],["1.6 Hybrid PHEV",1598,"hybride",[180,225,300]],["e-3008 électrique",0,"electrique",[210,230,325]]],
"peugeot|5008":[["1.2 PureTech",1199,"essence",[130]],["1.5 BlueHDi",1499,"diesel",[130]],["2.0 BlueHDi",1997,"diesel",[150,180]],["1.6 Hybrid PHEV",1598,"hybride",[180,225]]],
"peugeot|508":[["1.6 PureTech",1598,"essence",[180,225]],["1.5 BlueHDi",1499,"diesel",[130]],["2.0 BlueHDi",1997,"diesel",[180]],["1.6 Hybrid PHEV",1598,"hybride",[225,360]]],
"citroen|c3":[["1.2 PureTech",1199,"essence",[82,100,110]],["1.5 BlueHDi",1499,"diesel",[100]],["ë-C3 électrique",0,"electrique",[113]]],
"citroen|c4":[["1.2 PureTech",1199,"essence",[100,130,155]],["1.5 BlueHDi",1499,"diesel",[110,130]],["ë-C4 électrique",0,"electrique",[136,156]]],
"citroen|c5 aircross":[["1.2 PureTech",1199,"essence",[130]],["1.5 BlueHDi",1499,"diesel",[130]],["1.6 Hybrid PHEV",1598,"hybride",[180,225]]],
"renault|clio":[["1.0 SCe",999,"essence",[65,75]],["1.0 TCe",999,"essence",[90,100,110]],["1.3 TCe",1332,"essence",[130,140]],["1.5 Blue dCi",1461,"diesel",[85,100,115]],["E-Tech Hybride",1598,"hybride",[140,145]]],
"renault|captur":[["1.0 TCe",999,"essence",[90,100,110]],["1.3 TCe",1332,"essence",[130,140,150]],["1.5 Blue dCi",1461,"diesel",[95,115]],["E-Tech Hybride",1598,"hybride",[145,160]]],
"renault|megane":[["1.3 TCe",1332,"essence",[140,160]],["1.5 Blue dCi",1461,"diesel",[115]],["E-Tech électrique",0,"electrique",[130,220]]],
"renault|scenic":[["1.3 TCe",1332,"essence",[140,160]],["1.5 Blue dCi",1461,"diesel",[110,115]],["E-Tech électrique",0,"electrique",[170,220]]],
"renault|austral":[["1.2 E-Tech Hybride",1199,"hybride",[130,160,200]],["1.3 TCe",1332,"essence",[140,160]]],
"dacia|duster":[["1.0 TCe",999,"essence",[90,100,110]],["1.3 TCe",1332,"essence",[130,150]],["1.5 Blue dCi",1461,"diesel",[95,115]],["Hybride 140",1598,"hybride",[140]]],
"dacia|sandero":[["1.0 SCe",999,"essence",[65,75]],["1.0 TCe",999,"essence",[90,100,110]]],
"skoda|elroq":[["Elroq 50 électrique",0,"electrique",[170]],["Elroq 60 électrique",0,"electrique",[204]],["Elroq 85 électrique",0,"electrique",[286]],["Elroq 85x AWD électrique",0,"electrique",[286]],["Elroq RS électrique",0,"electrique",[340]]],
"skoda|enyaq":[["Enyaq 60 électrique",0,"electrique",[204]],["Enyaq 85 électrique",0,"electrique",[286]],["Enyaq 85x électrique",0,"electrique",[286]],["Enyaq RS électrique",0,"electrique",[340]]],
"skoda|octavia":[["1.0 TSI",999,"essence",[110]],["1.5 TSI",1498,"essence",[130,150]],["2.0 TSI",1984,"essence",[190,204,245]],["2.0 TDI",1968,"diesel",[115,150,200]],["1.4 TSI iV PHEV",1395,"hybride",[204,245]]],
"skoda|fabia":[["1.0 MPI",999,"essence",[75,80]],["1.0 TSI",999,"essence",[95,110]],["1.5 TSI",1498,"essence",[150]]],
"skoda|kodiaq":[["1.5 TSI",1498,"essence",[150]],["2.0 TSI",1984,"essence",[190,245]],["2.0 TDI",1968,"diesel",[150,190,200]]],
"skoda|karoq":[["1.0 TSI",999,"essence",[110,115]],["1.5 TSI",1498,"essence",[150]],["2.0 TDI",1968,"diesel",[115,150]]],
"volkswagen|golf":[["1.0 TSI",999,"essence",[95,110,115]],["1.5 TSI",1498,"essence",[130,150]],["2.0 TSI GTI",1984,"essence",[245,300]],["2.0 TDI",1968,"diesel",[115,150,200]],["1.4 eHybrid",1395,"hybride",[204,245]]],
"volkswagen|polo":[["1.0 MPI",999,"essence",[80]],["1.0 TSI",999,"essence",[95,110]],["2.0 TSI GTI",1984,"essence",[207]]],
"volkswagen|tiguan":[["1.5 TSI",1498,"essence",[130,150]],["2.0 TSI",1984,"essence",[190,245]],["2.0 TDI",1968,"diesel",[150,190,200]]],
"volkswagen|passat":[["1.5 TSI",1498,"essence",[150]],["2.0 TDI",1968,"diesel",[150,190,200]],["1.4 GTE",1395,"hybride",[218]]],
"volkswagen|id 3":[["Pro électrique",0,"electrique",[204]],["Pro S électrique",0,"electrique",[204]],["GTX électrique",0,"electrique",[326]]],
"volkswagen|id 4":[["Pro électrique",0,"electrique",[204]],["GTX électrique",0,"electrique",[340]]],
"audi|a3":[["1.0 30 TFSI",999,"essence",[110]],["1.5 35 TFSI",1498,"essence",[150]],["2.0 35 TDI",1968,"diesel",[150]]],
"audi|a4":[["2.0 40 TFSI",1984,"essence",[190,204]],["2.0 35 TDI",1968,"diesel",[163]],["2.0 40 TDI",1968,"diesel",[190,204]]],
"audi|q5":[["2.0 40 TFSI",1984,"essence",[204]],["2.0 40 TDI",1968,"diesel",[204]],["50 TFSI e",1984,"hybride",[299]]],
"bmw|serie 3":[["2.0 320i",1998,"essence",[184]],["2.0 330i",1998,"essence",[245,258]],["2.0 320d",1995,"diesel",[190]],["3.0 330d",2993,"diesel",[286]],["2.0 330e PHEV",1998,"hybride",[292]]],
"bmw|serie 1":[["1.5 118i",1499,"essence",[136,140]],["2.0 120i",1998,"essence",[178]],["2.0 118d",1995,"diesel",[150]]],
"bmw|x1":[["1.5 18i",1499,"essence",[136]],["2.0 20i",1998,"essence",[192,204]],["2.0 18d",1995,"diesel",[150]]],
"mercedes benz|classe a":[["1.3 A180",1332,"essence",[136]],["1.3 A200",1332,"essence",[163]],["2.0 A180d",1950,"diesel",[116]],["2.0 A220d",1950,"diesel",[190]]],
"mercedes benz|classe c":[["1.5 C180",1496,"essence",[170]],["2.0 C200",1999,"essence",[204]],["2.0 C220d",1993,"diesel",[194]],["2.0 C300e PHEV",1999,"hybride",[313]]],
"mercedes benz|gla":[["1.3 GLA180",1332,"essence",[136]],["1.3 GLA200",1332,"essence",[163]],["2.0 GLA220d",1950,"diesel",[190]]],
"toyota|yaris":[["1.0 VVT-i",998,"essence",[72]],["1.5 Hybride",1490,"hybride",[116,130]]],
"toyota|corolla":[["1.8 Hybride",1798,"hybride",[140]],["2.0 Hybride",1987,"hybride",[180,196]]],
"toyota|c hr":[["1.8 Hybride",1798,"hybride",[122,140]],["2.0 Hybride",1987,"hybride",[180,198]]],
"toyota|rav4":[["2.5 Hybride",2487,"hybride",[218,222]],["2.5 PHEV",2487,"hybride",[306]]],
"ford|fiesta":[["1.1 Ti-VCT",1084,"essence",[75,85]],["1.0 EcoBoost",999,"essence",[95,100,125,140,155]],["1.5 EcoBlue",1499,"diesel",[85,95]]],
"ford|focus":[["1.0 EcoBoost",999,"essence",[100,125,155]],["1.5 EcoBlue",1499,"diesel",[95,120]],["2.0 EcoBlue",1997,"diesel",[150]]],
"ford|puma":[["1.0 EcoBoost",999,"essence",[95,125,155,170]]],
"ford|kuga":[["1.5 EcoBoost",1499,"essence",[120,150]],["2.0 EcoBlue",1997,"diesel",[150,190]],["2.5 Hybride",2488,"hybride",[190,225]]],
"opel|corsa":[["1.2 Turbo",1199,"essence",[75,100,130]],["1.5 Diesel",1499,"diesel",[100,110]],["Corsa-e électrique",0,"electrique",[136,156]]],
"opel|mokka":[["1.2 Turbo",1199,"essence",[100,130]],["1.5 Diesel",1499,"diesel",[110]],["Mokka-e électrique",0,"electrique",[136,156]]],
"hyundai|tucson":[["1.6 T-GDi",1598,"essence",[150,180]],["1.6 CRDi",1598,"diesel",[115,136]],["1.6 Hybride",1598,"hybride",[230]],["1.6 PHEV",1598,"hybride",[265]]],
"hyundai|ioniq 5":[["58 kWh électrique",0,"electrique",[170]],["77 kWh électrique",0,"electrique",[229]],["AWD électrique",0,"electrique",[325]],["N électrique",0,"electrique",[650]]],
"kia|sportage":[["1.6 T-GDi",1598,"essence",[150,180]],["1.6 CRDi",1598,"diesel",[115,136]],["1.6 Hybride",1598,"hybride",[230]]],
"kia|ev6":[["58 kWh électrique",0,"electrique",[170]],["77 kWh électrique",0,"electrique",[229]],["AWD électrique",0,"electrique",[325]],["GT électrique",0,"electrique",[609]]],
"kia|ceed":[["1.0 T-GDi",998,"essence",[100,120]],["1.5 T-GDi",1482,"essence",[160]],["1.6 CRDi",1598,"diesel",[115,136]]],
"tesla|model 3":[["Propulsion électrique",0,"electrique",[283]],["Long Range électrique",0,"electrique",[498]],["Performance électrique",0,"electrique",[460]]],
"tesla|model y":[["Propulsion électrique",0,"electrique",[299]],["Long Range électrique",0,"electrique",[514]],["Performance électrique",0,"electrique",[534]]],
"volvo|xc40":[["1.5 T3",1477,"essence",[163]],["2.0 B4",1969,"hybride",[197]],["2.0 B5",1969,"hybride",[250]],["Recharge électrique",0,"electrique",[238,408]]],
"volvo|xc60":[["2.0 B4",1969,"hybride",[197]],["2.0 B5",1969,"hybride",[250]],["2.0 T8 PHEV",1969,"hybride",[455]]],
"fiat|500":[["1.0 Hybrid",999,"hybride",[70]],["500e électrique",0,"electrique",[95,118]]],
"mg|mg4":[["Standard électrique",0,"electrique",[170]],["Comfort électrique",0,"electrique",[204]],["XPower électrique",0,"electrique",[435]]],
"byd|atto 3":[["électrique",0,"electrique",[204]]],
"dacia|spring":[["Electric 45",0,"electrique",[45]],["Electric 65",0,"electrique",[65]]]
};
const POOL={peugeot:[["1.2 PureTech",1199,"essence",[82,100,110,130,155]],["1.5 BlueHDi",1499,"diesel",[100,110,130]],["2.0 BlueHDi",1997,"diesel",[150,180]],["1.6 Hybrid PHEV",1598,"hybride",[180,225]]],
renault:[["1.0 TCe",999,"essence",[90,100,110]],["1.3 TCe",1332,"essence",[130,140,160]],["1.5 Blue dCi",1461,"diesel",[95,115]],["E-Tech Hybride",1598,"hybride",[145,160]]],
volkswagen:[["1.0 TSI",999,"essence",[95,110]],["1.5 TSI",1498,"essence",[130,150]],["2.0 TDI",1968,"diesel",[115,150,200]]],
skoda:[["1.0 TSI",999,"essence",[95,110]],["1.5 TSI",1498,"essence",[130,150]],["2.0 TDI",1968,"diesel",[115,150,200]]],
citroen:[["1.2 PureTech",1199,"essence",[82,100,110,130]],["1.5 BlueHDi",1499,"diesel",[100,110,130]]],
dacia:[["1.0 TCe",999,"essence",[90,100,110]],["1.5 Blue dCi",1461,"diesel",[95,115]],["Hybride 140",1598,"hybride",[140]]],
toyota:[["1.5 Hybride",1490,"hybride",[116,130]],["1.8 Hybride",1798,"hybride",[122,140]],["2.0 Hybride",1987,"hybride",[180,196]]],
bmw:[["2.0 Essence",1998,"essence",[184,245]],["2.0 Diesel",1995,"diesel",[150,190]],["3.0 Diesel",2993,"diesel",[286]]],
"mercedes benz":[["1.3 Essence",1332,"essence",[136,163]],["2.0 Diesel",1950,"diesel",[116,190,194]]],
audi:[["1.5 TFSI",1498,"essence",[150]],["2.0 TFSI",1984,"essence",[190,204]],["2.0 TDI",1968,"diesel",[150,190,204]]],
ford:[["1.0 EcoBoost",999,"essence",[100,125,155]],["1.5 EcoBlue",1499,"diesel",[95,120]],["2.0 EcoBlue",1997,"diesel",[150,190]]],
kia:[["1.6 T-GDi",1598,"essence",[150,180]],["1.6 CRDi",1598,"diesel",[115,136]],["1.6 Hybride",1598,"hybride",[230]]],
hyundai:[["1.0 T-GDi",998,"essence",[100,120]],["1.6 T-GDi",1598,"essence",[150,180]],["1.6 CRDi",1598,"diesel",[115,136]]],
opel:[["1.2 Turbo",1199,"essence",[100,130]],["1.5 Diesel",1499,"diesel",[110,130]]]};
const BRANDS=Object.keys(EDB).map(k=>k.split("|")[0]).filter((v,i,a)=>a.indexOf(v)===i);
const MODELS={};Object.keys(EDB).forEach(k=>{const[b,m]=k.split("|");(MODELS[b]=MODELS[b]||[]).push(m);});
function titleCase(s){return s.replace(/\b\w/g,c=>c.toUpperCase());}
function energyOf(m){const t=N(m);
 if(/electrique|electric|bev|kwh|\bev\b|e-208|e-2008|e-3008|e-308|e-5008|elroq|enyaq|id ?[3-7]|ioniq|ev6|ev9|model [3sxy]|recharge|spring|atto|mg4|500e|corsa-e|mokka-e|ë-|e-c4/.test(t))return "electrique";
 if(/hybrid|hybride|phev|hev|e-tech|etech|plugin|rechargeable|\biv\b|gte|t8|\bb[456]\b/.test(t))return "hybride";
 if(/diesel|tdi|hdi|dci|crdi|cdti|multijet|d-4d|skyactiv-d|blue ?dci|bluehdi|ecoblue/.test(t))return "diesel";
 return "essence";}
function enginesFor(mk,mo){const key=N(mk)+"|"+N(mo);let src=EDB[key];
 if(!src&&N(mo))for(const k in EDB){const[b,m]=k.split("|");if(b===N(mk)&&(N(mo).startsWith(m)||m.startsWith(N(mo)))){src=EDB[k];break;}}
 if(!src)src=POOL[N(mk)]||[];
 return src.map(a=>({m:a[0],cc:a[1],en:a[2],ch:a[3],src:EDB[key]?"documenté":"gamme"}));}
function matchEngine(mk,mo,mt){if(!mt)return null;const a=N(mt);
 return enginesFor(mk,mo).find(e=>{const b=N(e.m);if(b===a||a.startsWith(b)||b.startsWith(a))return true;
  const ta=a.split(" "),tb=b.split(" ");return ta[0]===tb[0]&&ta[1]&&tb[1]&&ta[1]===tb[1];})||null;}
function powersFor(mk,mo,mt){const e=matchEngine(mk,mo,mt);return e?e.ch.slice():[];}
function autoAttribute(){const mk=D("cMarque").value,mo=D("cModele").value,mt=D("cMoteur").value;if(!mt)return;
 const en=energyOf(mt),e=matchEngine(mk,mo,mt),ps=e?e.ch:[];
 D("cEnergie").value=en;
 if(ps.length&&!ps.includes(+D("cPuiss").value))D("cPuiss").value=ps[0];
 renderPowers();renderAttrib();}
function renderEngines(){const mk=D("cMarque").value,mo=D("cModele").value,w=D("engChips");
 if(!mk||!mo){D("engCount").textContent="0";w.innerHTML='<span class="chips-loading">Sélectionne marque + modèle.</span>';return;}
 const list=enginesFor(mk,mo);D("engCount").textContent=list.length;w.__l=list;
 const ic={essence:"🟡",diesel:"⚫",hybride:"🟢",electrique:"🔵"};
 w.innerHTML=list.length?list.map((e,i)=>`<button type="button" data-eng="${i}">${ic[e.en]||""} ${E(e.m)} · ${e.en} · ${e.ch.join("/")} ch${e.cc?" · "+e.cc+" cm³":""}</button>`).join(""):'<span class="chips-loading">Aucune motorisation documentée.</span>';}
function renderPowers(){const ps=powersFor(D("cMarque").value,D("cModele").value,D("cMoteur").value);
 D("puissCount").textContent=ps.length;
 D("puissChips").innerHTML=ps.length?ps.map(p=>`<button type="button" data-ch="${p}">${p} ch</button>`).join(""):'<span class="chips-loading">Choisis une motorisation.</span>';}
function renderAttrib(){const mk=D("cMarque").value,mo=D("cModele").value,w=D("attribWrap");
 if(!mk||!mo){w.innerHTML="";return;}const l=enginesFor(mk,mo);if(!l.length){w.innerHTML="";return;}
 w.innerHTML=`<h3>🧾 Attribution — ${E(mk)} ${E(mo)}</h3><table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Cylindrée</th><th>Puissances</th><th>Source</th></tr></thead><tbody>`+
 l.map(e=>`<tr><td><b>${E(e.m)}</b></td><td>${e.en}</td><td>${e.cc?e.cc+" cm³":"—"}</td><td>${e.ch.join("/")} ch</td><td><span class="tag ${e.src==="documenté"?"ok":""}">${e.src}</span></td></tr>`).join("")+"</tbody></table>";}

/* ---------- juridique ---------- */
const LEGAL=[
{id:"vice-cache",t:"Vice caché",pro:false,mots:["vice","cache","panne","defaut","achat","occasion","moteur","boite"],r:"Un défaut caché, grave et antérieur à la vente peut relever de la garantie des vices cachés.",rep:["Code civil, art. 1641, 1644, 1648 : défaut rendant le véhicule impropre à l'usage.","L'acheteur doit établir le défaut, sa gravité, son caractère caché et son antériorité.","Action dans les 2 ans de la découverte du vice.","Restitution du prix ou réduction, selon les conditions."],dem:["Signaler le défaut au vendeur par écrit.","Faire établir un diagnostic et une expertise contradictoire avant toute dépose."],pr:["Annonce et contrat de vente","Date de découverte et kilométrage","Historique d'entretien, pièces conservées"],src:"https://www.service-public.fr/particuliers/vosdroits/F11007"},
{id:"conformite",t:"Garantie légale de conformité",pro:true,mots:["garantie","conformite","panne","achat","occasion","neuf","defaut","vendeur"],r:"Réservé à l'achat auprès d'un vendeur professionnel.",rep:["Code de la consommation, L. 217-3 et s. : défauts dans les 2 ans de la délivrance.","Présomption d'antériorité : 24 mois neuf, 12 mois occasion.","Réparation ou remplacement sans frais, délai max 30 jours (L. 217-10).","Réduction du prix ou résolution (L. 217-14)."],dem:["Demande écrite au vendeur professionnel avec justificatifs.","Conserver la date de demande et la durée d'immobilisation."],pr:["Facture et date de délivrance","Caractéristiques annoncées","Demande de mise en conformité"],src:"https://www.service-public.fr/particuliers/vosdroits/F11094"},
{id:"dol",t:"Dol et dissimulation",pro:false,mots:["dol","mensonge","dissimulation","tromperie","compteur","kilometrage","accident"],r:"Manœuvres ou dissimulation intentionnelle d'une information déterminante.",rep:["Code civil, art. 1137 : intention de tromper et caractère déterminant à établir.","Une panne seule ne démontre pas un dol.","Art. 1144 : délai de nullité à compter de la découverte."],dem:["Comparer l'annonce et l'historique documenté.","Faire examiner les éléments avant toute demande d'annulation."],pr:["Annonce, messages, déclarations","Contrôles techniques et historique kilométrique"],src:"https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036829827"},
{id:"garage",t:"Garage, malfaçons, obligation de résultat",pro:false,mots:["garage","garagiste","reparation","malfacon","resultat","facture","intervention","atelier"],r:"Une réparation défectueuse peut engager la responsabilité du garage.",rep:["L'obligation de résultat ne rend pas le garage responsable de toute panne ultérieure.","Mission confiée, défaut, lien avec l'intervention et preuves à examiner.","Devis, ordre de réparation et facture délimitent les travaux."],dem:["Demander une explication écrite et une reprise.","Faire constater contradictoirement avant nouvelle réparation.","Médiation de la consommation après réclamation infructueuse."],pr:["Ordre de réparation, devis, facture","Symptômes avant/après","Diagnostic indépendant, photos, pièces"],src:"https://www.economie.gouv.fr/dgccrf/consommation/Resoudre-un-litige-de-consommation"},
{id:"produit",t:"Incendie & produit défectueux",pro:false,sec:true,mots:["incendie","feu","flamme","brule","sinistre","assurance","expert","expertise","defectueux","securite"],r:"Un départ d'incendie lié à un défaut peut engager la responsabilité du producteur.",rep:["Code civil, art. 1245 et s. : le producteur répond du défaut de sécurité, même sans contrat.","Défaut et lien causal doivent être établis.","Assurance : déclarer le sinistre dans les délais (usuellement 5 jours ouvrés, L. 113-2).","Ne pas déplacer ni réparer avant constat ; conserver pièces et faisceaux."],dem:["Sécuriser, photographier l'état initial et le point de départ supposé.","Déclarer à l'assurance et demander une expertise contradictoire.","Faire préserver le véhicule et les pièces.","Mettre en cause le constructeur si un défaut ou rappel est documenté."],pr:["Photos/vidéos avant déplacement","Rapport pompiers / constat","Factures d'entretien et campagnes applicables au VIN","Expertise et préservation des pièces"],src:"https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070721/LEGISCTA000006136279/"},
{id:"rappel",t:"Rappel & campagne de sécurité",pro:false,mots:["rappel","campagne","securite","constructeur","vin","concession"],r:"Une campagne corrige un défaut de sécurité connu ; son applicabilité au VIN est déterminante.",rep:["Code de la consommation L. 412-1 / R. 412-1 : rappel des produits dangereux, correction à la charge du professionnel.","Vérifier l'applicabilité au VIN exact et l'exécution de la campagne.","Une campagne applicable non exécutée renforce la démonstration du défaut connu."],dem:["Relever le VIN et interroger le constructeur.","Demander l'exécution gratuite et conserver les courriers.","Croiser RappelConso, Safety Gate, NHTSA."],pr:["VIN et réponse constructeur","Numéro de campagne et preuve d'exécution","Historique d'entretien"],src:"https://rappel.conso.gouv.fr/"}];
function legalMatch(ctx,vendeur){const c=N(ctx);
 return LEGAL.filter(f=>!(f.pro&&vendeur!=="professionnel")).map(f=>({f,s:f.mots.filter(m=>c.includes(N(m))).length})).filter(x=>x.s>0).sort((a,b)=>(!!b.f.sec-!!a.f.sec)||(b.s-a.s)).slice(0,5).map(x=>x.f);}
function renderLegal(l){if(!l.length)return '<p class="small">Aucune qualification détectée — précise achat, vendeur, panne, incendie ou litige.</p>';
 return l.map(f=>`<div class="hit"><span class="tag ${f.sec?"crit":"ok"}">${f.t}</span><p class="small">${E(f.r)}</p>
 <details><summary>Repères · démarches · preuves</summary><h3>Repères</h3><ul class="small">${f.rep.map(x=>"<li>"+E(x)+"</li>").join("")}</ul>
 <h3>Démarches</h3><ul class="small">${f.dem.map(x=>"<li>"+E(x)+"</li>").join("")}</ul><h3>À conserver</h3><ul class="small">${f.pr.map(x=>"<li>"+E(x)+"</li>").join("")}</ul>
 <a class="small" href="${E(f.src)}" target="_blank" rel="noopener">📎 Source officielle</a></details></div>`).join("");}

/* ---------- base ---------- */
async function jget(u){try{const r=await fetch(u,{cache:"no-store"});return r.ok?await r.json():null;}catch(e){return null;}}
function indexBase(){BASE.forEach(e=>{e._h=N([e.marque,e.modele,e.motorisation,e.systeme,e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" "),(e.dtc||[]).join(" "),e.campagne].join(" "));});}
function mergeEntries(list){const m=new Map();BASE.forEach(e=>m.set(fid(e),e));list.forEach(e=>m.set(fid(e),e));BASE=[...m.values()];indexBase();}
async function loadBase(){
 let all=[];const idx=await jget("data/index.json?ts="+Date.now());
 if(idx&&Array.isArray(idx.chunks)){for(const f of idx.chunks){const c=await jget("data/"+f);if(Array.isArray(c))all=all.concat(c);}}
 if(!all.length){const s=await jget("data/seed.json");if(Array.isArray(s))all=s;}
 const man=await jget("data/manual.json?ts="+Date.now());if(man){const a=Array.isArray(man)?man:(man.entries||[]);all=all.concat(a);}
 mergeEntries(all.concat(OVERLAY.entries));
 const ph=await jget("data/photos.json?ts="+Date.now());
 PHOTOS={};OVERLAY.photos.forEach(p=>{(PHOTOS[p.fault]=PHOTOS[p.fault]||[]).push(p);});
 if(ph){const a=Array.isArray(ph)?ph:(ph.photos||[]);a.forEach(p=>{if(!(PHOTOS[p.fault]||[]).some(x=>x.id===p.id))(PHOTOS[p.fault]=PHOTOS[p.fault]||[]).push(p);});}
 fillFilters();renderResults();paintStats();
 if(navigator.onLine&&BASE.length<400)harvestRC();
}
async function harvestRC(){
 const base="https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records";
 let off=0,out=[];
 while(off<3000){const j=await jget(base+"?"+new URLSearchParams({where:'categorie_produit="automobiles et moyens de déplacement"',limit:100,offset:off,order_by:"date_publication desc"}));
  const res=(j&&j.results)||[];if(!res.length)break;
  res.forEach(r=>{const txt=[r.motif_rappel,r.risques_encourus,r.description_complementaire_risque].join(" ");const feu=FIRE.test(txt);
   const yr=(String(r.modeles_ou_references||"").match(/(?:19|20)\d{2}/g)||[]).map(Number);
   out.push({id:"rc-"+(r.numero_fiche||hash(JSON.stringify(r))),themes:["technique"].concat(feu?["incendie"]:[]),type:"rappel",source:"rappelconso",
    marque:titleCase(r.marque_produit||""),modele:r.modeles_ou_references||"",motorisation:"",annees:yr.length?[Math.min(...yr),Math.max(...yr)]:null,energie:"",
    systeme:r.sous_categorie_produit||"",dtc:[],symptomes:[],defaut:(r.libelle||r.motif_rappel||"Rappel").slice(0,300),mecanisme:r.motif_rappel||"",
    consequences:[r.risques_encourus||""].filter(Boolean),indices:[],risque_feu:feu,chaine_feu:feu?"Rappel officiel : "+txt.slice(0,240):"",gravite:feu?"critique":"eleve",
    campagne:r.numero_fiche||"",url:r.lien_vers_la_fiche_rappel||"",date:(r.date_publication||"").slice(0,10)});});
  off+=100;if(off>=(j.total_count||0))break;await sleep(80);}
 if(out.length){mergeEntries(out);try{localStorage.setItem("kevo_rc",JSON.stringify({ts:Date.now(),n:out.length}));}catch(e){}
  fillFilters();renderResults();paintStats();toast("🛰️ "+out.length+" rappels officiels intégrés.");}
}
function paintStats(){const nb=Object.keys(PHOTOS).reduce((a,k)=>a+PHOTOS[k].length,0);
 D("baseBadge").textContent=`🗄️ ${BASE.length} fiches · ${nb} photos`;
 D("baseStats").textContent=`${BASE.length} fiches · ${Object.keys(MODELS).length} marques catalogue · ${nb} photos rattachées · stockage ${OVERLAY.entries.length} ajouts admin`;}
function fillFilters(){const ms=[...new Set(BASE.map(e=>(e.marque||"").split("/")[0].trim()).filter(Boolean))].sort();
 D("fMarque").innerHTML='<option value="">Toutes</option>'+ms.map(m=>`<option>${E(m)}</option>`).join("");
 const ss=[...new Set(BASE.map(e=>e.systeme).filter(Boolean))].sort();
 D("fSys").innerHTML='<option value="">Tous</option>'+ss.map(s=>`<option>${E(s)}</option>`).join("");}

/* ---------- recherche & rendu ---------- */
function search(q,limit){const t=N(q).split(" ").filter(Boolean);if(!t.length)return BASE.slice(0,limit||30);
 const out=[];for(const e of BASE){if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;
  if(D("fMarque").value&&N(e.marque).indexOf(N(D("fMarque").value))<0)continue;
  if(D("fSys").value&&N(e.systeme)!==N(D("fSys").value))continue;
  if(D("fGrav").value&&e.gravite!==D("fGrav").value)continue;
  let s=0;t.forEach(x=>{if(N(e.defaut).includes(x))s+=3;else if(e._h.includes(x))s+=2;});if(s>0)out.push([s,e]);}
 return out.sort((a,b)=>b[0]-a[0]).slice(0,limit||40).map(x=>x[1]);}
function searchVehicles(q){const t=N(q).split(" ").filter(Boolean);if(!t.length)return[];const out=[];
 Object.keys(EDB).forEach(k=>{const[b,m]=k.split("|");const h=b+" "+m;let s=0;t.forEach(x=>{if(b.split(" ").includes(x))s+=5;else if(m.split(" ").includes(x))s+=5;else if(h.includes(x))s+=2;});
  if(s>=5)out.push([s,{marque:titleCase(b),modele:titleCase(m),engines:enginesFor(b,m)}]);});
 return out.sort((a,b)=>b[0]-a[0]).slice(0,8).map(x=>x[1]);}
function hitCard(e){return `<div class="hit ${e.risque_feu?"feu":""}"><b>${E(e.defaut||"Fiche")}</b>
 <div class="meta">${E(e.marque||"Multi-marques")} · ${E(e.modele||"")} ${E(e.motorisation||"")} ${e.annees?"· "+e.annees[0]+"-"+e.annees[1]:""}</div>
 <div>${(e.themes||[]).includes("incendie")?'<span class="tag feu">🔥 incendie</span>':""}<span class="tag">${E(e.systeme||"général")}</span>${e.gravite==="critique"?'<span class="tag crit">critique</span>':""}${(e.dtc||[]).map(d=>'<span class="tag">'+E(d)+"</span>").join("")}<span class="tag ok">${E(e.source||"")}</span></div>
 ${e.mecanisme?`<p class="small"><b>Mécanisme :</b> ${E(e.mecanisme)}</p>`:""}
 ${(e.consequences||[]).length?`<p class="small"><b>Conséquences :</b> ${E(e.consequences.join(" ; "))}</p>`:""}
 ${e.risque_feu&&e.chaine_feu?`<p class="small">🔥 <b>Chaîne :</b> ${E(e.chaine_feu)}</p>`:""}
 ${e.url?`<a class="small" href="${E(e.url)}" target="_blank" rel="noopener">📎 Source ${E(e.campagne||"")}</a>`:""}</div>`;}
function photoStrip(e){const ph=PHOTOS[fid(e)]||[];if(!ph.length)return "";
 return `<div class="chips" style="margin-top:6px">`+ph.slice(0,4).map(p=>`<img class="thumb" data-lb="${E(p.id)}" src="${E(p.url)}" alt="${E(p.cap||"photo")}">`).join("")+
 (ph.length>4?`<span class="tag">+${ph.length-4}</span>`:"")+`<button type="button" data-gal="${E(fid(e))}">🖼️ Photos (${ph.length})</button></div>`;}
function renderResults(){const q=D("q").value.trim(),box=D("results");
 const faults=q?search(q):BASE.filter(e=>THEME==="tous"||(e.themes||[]).includes(THEME)).slice(0,25);
 const veh=q?searchVehicles(q):[];LASTF=faults;
 const vh=veh.map(v=>`<div class="hit"><b>🚗 ${E(v.marque)} ${E(v.modele)}</b><table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Cylindrée</th><th>Puissances</th></tr></thead><tbody>`+
  v.engines.map(e=>`<tr><td>${E(e.m)}</td><td>${e.en}</td><td>${e.cc?e.cc+" cm³":"—"}</td><td>${e.ch.join("/")} ch</td></tr>`).join("")+
  `</tbody></table><button type="button" class="btn ghost small" data-use="${E(v.marque)}|${E(v.modele)}">➕ Utiliser ce véhicule</button></div>`).join("");
 box.innerHTML=(veh.length?`<h3>🚗 Véhicules &amp; motorisations (${veh.length})</h3>`+vh:"")+
  `<h3>🔧 Pannes &amp; rappels (${faults.length})</h3>`+(faults.length?faults.map(e=>`<div data-fid="${E(fid(e))}">${hitCard(e)}${photoStrip(e)}<button type="button" class="btn ghost small" data-cs="${E((e.defaut||"").slice(0,60))}">📷 Photos web</button></div>`).join(""):'<p class="empty">Aucun résultat.</p>');}
function lightbox(src,cap){const lb=D("lightbox");lb.querySelector("img").src=src;D("lbCap").textContent=cap||"";lb.classList.add("open");}

/* ---------- prédiction ---------- */
function suggest(input,provider){if(!input||input.__sg)return;input.__sg=true;
 const wrap=document.createElement("div");wrap.style.position="relative";input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
 const list=document.createElement("div");list.className="sg-list";list.style.display="none";wrap.appendChild(list);
 const open=()=>{const items=provider().slice(0,12);if(!items.length){list.style.display="none";return;}
  list.innerHTML=items.map((x,i)=>`<div data-i="${i}">${E(x.label)}${x.hint?` <span style="color:#93a0d6;font-size:.66rem">${E(x.hint)}</span>`:""}</div>`).join("");
  list.__i=items;list.style.display="block";};
 input.addEventListener("focus",open);input.addEventListener("click",open);input.addEventListener("input",open);
 list.addEventListener("mousedown",ev=>{const d=ev.target.closest("[data-i]");if(!d)return;ev.preventDefault();
  const it=list.__i[+d.dataset.i];input.value=it.value;list.style.display="none";input.dispatchEvent(new Event("change",{bubbles:true}));});
 input.addEventListener("blur",()=>setTimeout(()=>list.style.display="none",160));}
function wirePredictive(){
 suggest(D("cMarque"),()=>{const c=N(D("cMarque").value);return BRANDS.filter(b=>!c||b.includes(c)).map(b=>({value:titleCase(b),label:titleCase(b),hint:(MODELS[b]||[]).length+" modèles"}));});
 suggest(D("cModele"),()=>{const b=N(D("cMarque").value),c=N(D("cModele").value);
  const l=(MODELS[b]||Object.keys(MODELS).filter(k=>!b||k.includes(b)).flatMap(k=>MODELS[k]));
  return [...new Set(l)].filter(m=>!c||m.includes(c)).map(m=>({value:titleCase(m),label:titleCase(m)}));});
 suggest(D("cMoteur"),()=>{const l=enginesFor(D("cMarque").value,D("cModele").value),c=N(D("cMoteur").value);
  const ic={essence:"🟡",diesel:"⚫",hybride:"🟢",electrique:"🔵"};
  return l.filter(e=>!c||N(e.m).includes(c)).map(e=>({value:e.m,label:`${ic[e.en]} ${e.m} · ${e.en} · ${e.ch.join("/")} ch${e.cc?" · "+e.cc+" cm³":""}`,hint:e.src}));});
 suggest(D("cPuiss"),()=>powersFor(D("cMarque").value,D("cModele").value,D("cMoteur").value).map(p=>({value:String(p),label:p+" ch",hint:Math.round(p/1.35962)+" kW"})));
 suggest(D("q"),()=>{const c=N(D("q").value);if(c.length<2)return[];const s=new Set();
  BRANDS.forEach(b=>s.add(titleCase(b)));Object.values(MODELS).flat().forEach(m=>s.add(titleCase(m)));
  BASE.slice(0,3000).forEach(e=>{(e.dtc||[]).forEach(d=>s.add(d));if(e.systeme)s.add(e.systeme);});
  return [...s].filter(x=>N(x).includes(c)).slice(0,10).map(x=>({value:x,label:x}));});
 const feed=(ta,ch)=>{ta.addEventListener("input",()=>{const w=N(ta.value).split(" "),last=w[w.length-1]||"";
  if(last.length<3){ch.innerHTML="";return;}const s=new Set();
  BASE.slice(0,2000).forEach(e=>N(e.defaut+" "+e.systeme).split(" ").forEach(x=>{if(x.startsWith(last)&&x!==last)s.add(x);}));
  ch.innerHTML=[...s].slice(0,5).map(x=>`<button type="button" data-w="${E(x)}">${E(x)} ⏎</button>`).join("");});
  ch.addEventListener("click",e=>{const b=e.target.closest("[data-w]");if(!b)return;ta.value=ta.value.replace(/[\wÀ-ÿ-]+$/,b.dataset.w)+" ";ta.focus();});};
 feed(D("ctx"),D("predCtx"));feed(D("msgTexte"),D("predMsg"));
 D("ctx").addEventListener("input",()=>{const n=N(D("ctx").value);
  SYMPT.forEach(s=>{const key=N(s).split(" ")[0];if(n.includes(key)){const cb=[...D("qcm").querySelectorAll("input")].find(i=>i.value===s);if(cb)cb.checked=true;}});
  const dtc=(D("ctx").value.toUpperCase().match(/[PCBU]\d{4}/g)||[]);
  if(dtc.length&&!D("cDtc").value){D("cDtc").value=[...new Set(dtc)].join(", ");D("dtcLu").checked=true;D("cDtc").classList.remove("hidden");}
  const h=hypotheses(getVeh(),n.split(" ").filter(t=>t.length>3),dtc,[...D("qcm").querySelectorAll("input:checked")].map(i=>i.value)).slice(0,3);
  D("liveCorr").innerHTML=h.length?'<b style="color:var(--amber)">🔎 Corrélations :</b> '+h.map(x=>`<span class="tag ${x.e.risque_feu?"feu":""}">${E(x.e.defaut.slice(0,44))} · ${x.s}</span>`).join(""):"";});}

/* ---------- expertise ---------- */
function getVeh(){return{marque:D("cMarque").value.trim(),modele:D("cModele").value.trim(),moteur:D("cMoteur").value.trim(),puiss:+D("cPuiss").value||0,annee:+D("cAnnee").value||0,energie:D("cEnergie").value};}
function matchVehicle(e,v){let s=0;
 if(v.marque&&N(e.marque).includes(N(v.marque)))s+=4;else if(v.marque&&e.marque&&!/multi/i.test(e.marque))return -1;
 if(v.modele){const m=N(e.modele);if(m&&m.includes(N(v.modele)))s+=4;else if(m&&!/tous|multi/i.test(m))s-=2;}
 if(v.moteur&&N(e.motorisation).includes(N(v.moteur).split(" ")[0]))s+=3;
 if(v.annee&&e.annees)s+=(v.annee>=e.annees[0]&&v.annee<=e.annees[1])?3:-3;
 if(v.puiss&&Array.isArray(e.puissance_ch)&&v.puiss>=e.puissance_ch[0]*.9&&v.puiss<=e.puissance_ch[1]*1.1)s+=2;
 if(v.energie&&e.energie&&e.energie!==v.energie)s-=2;return s;}
function hypotheses(v,toks,dtcs,syms){const out=[];
 BASE.forEach(e=>{if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))return;let s=matchVehicle(e,v);if(s<0)return;s*=2;const why=[];
  if(s>=8)why.push("véhicule concordant");
  (dtcs||[]).forEach(d=>{if((e.dtc||[]).includes(d)){s+=8;why.push("DTC "+d);}});
  (syms||[]).forEach(y=>{if((e.symptomes||[]).some(x=>N(x).includes(N(y)))||N(e.defaut).includes(N(y)))s+=3;});
  (toks||[]).forEach(t=>{if(N(e.defaut).includes(t))s+=2;else if(e._h&&e._h.includes(t))s+=1;});
  if(e.type==="rappel"||e.campagne){s+=5;why.push("campagne officielle");}
  if(s>=6)out.push({e,s,why});});
 return out.sort((a,b)=>b.s-a.s).slice(0,10);}
function confidence(t){const s=t.s;let lvl,crit;
 if(s>=20&&t.why.some(w=>/DTC/.test(w))&&t.why.some(w=>/campagne/.test(w))){lvl="CERTAIN";crit="Preuves convergentes : DTC + campagne officielle + véhicule concordant.";}
 else if(s>=14){lvl="PROBABLE";crit="Faisceau cohérent ; à confirmer par mesure ou expertise.";}
 else if(s>=8){lvl="POSSIBLE";crit="Mécanisme plausible et documenté ; preuves partielles.";}
 else{lvl="INDÉTERMINÉ";crit="Données insuffisantes ; expertise physique requise.";}
 return{lvl,crit,pct:Math.max(5,Math.min(95,Math.round(s/25*100)))};}
function fireAnalysis(v,hyp){const spec=hyp.filter(h=>h.e.risque_feu).map(h=>h.e);
 const doc=BASE.filter(e=>e.risque_feu&&/multi/i.test(e.marque||"")&&(!v.energie||!e.energie||e.energie===v.energie)).slice(0,8);
 const lvl=spec.some(e=>e.type==="rappel")?"hi":spec.length?"mid":"low";
 const txt=lvl==="hi"?"ÉLEVÉ — rappel incendie concordant":lvl==="mid"?"MODÉRÉ — chaînes documentées":"GÉNÉRIQUE — doctrine applicable";
 let h=`<div class="firebox"><h3>🔥 Analyse incendie — ${E(v.marque)} ${E(v.modele)} ${E(v.moteur)}</h3><p><span class="lvl ${lvl}">${txt}</span></p>`;
 if(spec.length)h+=spec.slice(0,6).map(e=>`<div class="hit feu"><b>${E(e.defaut)}</b><p class="small">⛓️ ${E(e.chaine_feu||e.mecanisme||"")}</p><div class="meta">${E(e.source)} ${E(e.campagne||"")}</div></div>`).join("");
 if(doc.length)h+=`<details><summary class="small" style="cursor:pointer;color:var(--acc)">Doctrine applicable (${doc.length})</summary>`+doc.map(e=>`<div class="hit feu"><b>${E(e.defaut)}</b><p class="small">${E(e.mecanisme||"")}</p></div>`).join("")+"</details>";
 return h+`<p class="small">Niveau fondé sur les données documentées ; ne préjuge pas de l'origine réelle. Expertise physique nécessaire.</p></div>`;}
function quotaUse(){if(isAdmin)return{ok:true,left:"∞"};
 let q=JSON.parse(localStorage.getItem("kevo_quota")||'{"debut":0,"n":0}');const now=Date.now();
 if(now-q.debut>=7*864e5)q={debut:now,n:0};
 if(q.n>=5)return{ok:false,left:0,reset:q.debut+7*864e5};
 q.n++;localStorage.setItem("kevo_quota",JSON.stringify(q));return{ok:true,left:5-q.n,reset:q.debut+7*864e5};}
function updQuota(){if(isAdmin){D("quotaBadge").textContent="🎟️ admin ∞";return;}
 const q=JSON.parse(localStorage.getItem("kevo_quota")||'{"debut":0,"n":0}');D("quotaBadge").textContent="🎟️ "+Math.max(0,5-q.n)+"/5";}
function analyserContexte(){const ctx=D("ctx").value.trim();if(!ctx){toast("Décris la situation.");return;}
 const q=quotaUse();updQuota();if(!q.ok){toast("🚫 Quota atteint (5/7 j). Reset le "+new Date(q.reset).toLocaleDateString("fr-FR"));return;}
 const v=getVeh(),vendeur=D("cVendeur").value,toks=N(ctx).split(" ").filter(t=>t.length>3);
 const dtcs=[...new Set([...(ctx.toUpperCase().match(/[PCBU]\d{4}/g)||[]),...((D("cDtc").value.toUpperCase().match(/[PCBU]\d{4}/g))||[])])];
 const syms=[...D("qcm").querySelectorAll("input:checked")].map(i=>i.value);
 const hyp=hypotheses(v,toks,dtcs,syms),top=hyp[0],conf=top?confidence(top):{lvl:"INDÉTERMINÉ",crit:"Aucune hypothèse concordante.",pct:5};
 const feu=/incendie|feu|flamme|sinistre/.test(N(ctx))||(top&&top.e.risque_feu);
 const legal=legalMatch(ctx,vendeur);const eng=enginesFor(v.marque,v.modele);
 let h=`<div class="card"><h2>🧾 Compte rendu d'expertise — ${new Date().toLocaleString("fr-FR")}</h2>
 <h3>1. Identification</h3><table><tbody><tr><th>Véhicule</th><td><b>${E(v.marque)} ${E(v.modele)}</b></td></tr>
 <tr><th>Motorisation</th><td>${E(v.moteur||"—")}</td></tr><tr><th>Puissance / Énergie</th><td>${v.puiss||"—"} ch · ${E(v.energie||"—")}</td></tr>
 <tr><th>Millésime</th><td>${v.annee||"—"}</td></tr><tr><th>Vendeur</th><td>${E(vendeur)}</td></tr>
 <tr><th>Symptômes</th><td>${E(syms.join(", ")||"—")}</td></tr><tr><th>DTC</th><td>${dtcs.join(", ")||"—"}</td></tr></tbody></table>
 <h3>2. Origine la plus probable</h3>`;
 if(top)h+=`<div class="hit ${top.e.risque_feu?"feu":""}"><span class="tag ${conf.lvl==="CERTAIN"?"ok":conf.lvl==="PROBABLE"?"info":"crit"}">${conf.lvl} · ${conf.pct}%</span>
  <b>${E(top.e.defaut)}</b><div class="meta">${E(top.e.source)} ${E(top.e.campagne||"")}</div>
  <p class="small"><b>Critère :</b> ${E(conf.crit)}</p><p class="small"><b>Concordances :</b> ${top.why.map(E).join(" · ")||"termes du contexte"}</p>
  <p class="small"><b>Chaîne :</b> ${E(top.e.mecanisme||"—")} → ${E((top.e.consequences||[]).join(" ; ")||"—")}</p>
  ${top.e.url?`<a class="small" href="${E(top.e.url)}" target="_blank" rel="noopener">📎 Source</a>`:""}${photoStrip(top.e)}</div>`;
 else h+='<p class="small">Aucune hypothèse concordante — expertise physique requise.</p>';
 if(hyp.length>1)h+=`<h3>3. Diagnostic différentiel</h3><table><thead><tr><th>#</th><th>Hypothèse</th><th>Score</th></tr></thead><tbody>`+hyp.slice(1,5).map((x,i)=>`<tr><td>${i+2}</td><td>${E(x.e.defaut.slice(0,70))}</td><td>${x.s}</td></tr>`).join("")+"</tbody></table>";
 if(feu)h+=`<h3>4. Volet incendie</h3>`+fireAnalysis(v,hyp);
 h+=`<h3>${feu?"5":"4"}. Qualification juridique</h3>`+renderLegal(legal);
 if(eng.length)h+=`<h3>${feu?"6":"5"}. Motorisations attribuées</h3><table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Puissances</th></tr></thead><tbody>`+eng.map(e=>`<tr><td>${E(e.m)}</td><td>${e.en}</td><td>${e.ch.join("/")} ch</td></tr>`).join("")+"</tbody></table>";
 h+=`<h3>Plan d'action &amp; preuves</h3><ul class="small">`+[...new Set(legal.flatMap(f=>f.dem).concat(["Conserver factures, annonce, contrat, historique d'entretien","Diagnostic écrit avant toute réparation","Lecture OBD horodatée","Réclamation écrite puis expertise contradictoire"]))].slice(0,10).map(x=>"<li>"+E(x)+"</li>").join("")+`</ul>
 <p class="small">⚠️ Aide documentaire fondée sur les sources citées ; ne remplace ni une expertise physique ni une consultation juridique personnalisée.</p>
 <div class="no-print"><button type="button" class="btn ghost" id="crPrint">🖨️ PDF</button><button type="button" class="btn ghost" id="crJson">📤 JSON</button></div></div>`;
 D("ctxReport").innerHTML=h;
 D("crPrint").onclick=()=>window.print();
 D("crJson").onclick=()=>dl("compte-rendu.json",JSON.stringify({date:new Date().toISOString(),vehicule:v,contexte:ctx,niveau:conf,origine:top?top.e:null,juridique:legal.map(f=>f.id)},null,1));
 toast("🧾 Compte rendu généré ("+conf.lvl+").");}
function analyserEtude(){const v=getVeh();const syms=[...D("qcm").querySelectorAll("input:checked")].map(i=>i.value);
 const dtcs=(D("cDtc").value.toUpperCase().match(/[PCBU]\d{4}/g)||[]);
 const hyp=hypotheses(v,N(D("ctx").value).split(" ").filter(t=>t.length>3),dtcs,syms);
 if(!v.marque&&!v.modele){toast("Renseigne le véhicule.");return;}
 const top=hyp[0],conf=top?confidence(top):{lvl:"INDÉTERMINÉ",pct:5,crit:"—"};
 const rap=hyp.filter(h=>h.e.type==="rappel").map(h=>h.e),pan=hyp.filter(h=>h.e.type!=="rappel").map(h=>h.e);
 D("rapport").innerHTML=`<div class="card"><h2>📋 Étude de cas — ${E(v.marque)} ${E(v.modele)} ${E(v.moteur)}</h2>
 <p class="small">${new Date().toLocaleString("fr-FR")} · ${BASE.length} fiches · thème ${THEME}</p>
 <h3>🎯 Origine</h3><div class="hit"><span class="tag ${conf.lvl==="CERTAIN"?"ok":"info"}">${conf.lvl} · ${conf.pct}%</span> <b>${E(top?top.e.defaut:"Indéterminé")}</b><p class="small">${E(conf.crit)}</p></div>
 <h3>1️⃣ Rappels concordants (${rap.length})</h3>${rap.map(e=>hitCard(e)+photoStrip(e)).join("")||'<p class="small">Aucun.</p>'}
 <h3>2️⃣ Pannes connues (${pan.length})</h3>${pan.map(e=>hitCard(e)+photoStrip(e)).join("")||'<p class="small">Aucune.</p>'}
 ${fireAnalysis(v,hyp)}<h3>Conclusion</h3><p class="small">Méthode : qualifier → corréler → analyser → tester → conclure. Aide documentaire ; expertise physique indispensable.</p></div>`;
 const h=JSON.parse(localStorage.getItem("histo")||"[]");h.unshift({date:new Date().toLocaleString("fr-FR"),v,niveau:conf.lvl});localStorage.setItem("histo",JSON.stringify(h.slice(0,20)));renderHisto();}
function renderHisto(){const h=JSON.parse(localStorage.getItem("histo")||"[]");
 D("histo").innerHTML=h.length?h.map(x=>`<div class="hit"><b>${E(x.v.marque)} ${E(x.v.modele)}</b> <span class="small">${E(x.date)} — ${E(x.niveau)}</span></div>`).join(""):'<p class="small">Aucune étude.</p>';}

/* ---------- photos ---------- */
function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
async function compress(src,maxW,q){maxW=maxW||1000;q=q||.72;const img=typeof src==="string"?await loadImg(src):src;
 const sc=Math.min(1,maxW/img.width),c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
 c.getContext("2d").drawImage(img,0,0,c.width,c.height);let u=c.toDataURL("image/jpeg",q);
 while(u.length*.75>180000&&q>.3){q-=.08;u=c.toDataURL("image/jpeg",q);}return u;}
function addPending(src,cap){PENDING.push({id:"ph-"+hash(src+Date.now()+PENDING.length),src,cap:cap||"",ts:Date.now()});renderPending();}
async function intakeFiles(fl,cap){for(const f of fl){if(!/^image\//.test(f.type))continue;addPending(await compress(f),cap||f.name);}}
function renderPending(){const w=D("paPending");
 w.innerHTML=PENDING.length?PENDING.map((p,i)=>`<span style="position:relative;display:inline-block;margin:3px"><img class="thumb" src="${E(p.src)}"><button type="button" data-rm="${i}" style="position:absolute;top:-6px;right:-6px;border:0;border-radius:50%;background:#ff1744;color:#fff;width:18px;height:18px;cursor:pointer">✕</button></span>`).join(""):'<span class="chips-loading">Aucune photo en attente.</span>';
 w.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{PENDING.splice(+b.dataset.rm,1);renderPending();});}
function renderFaultPicker(){const q=N(D("paFaultQ").value);
 const l=BASE.filter(e=>!q||N(e.defaut+" "+e.marque+" "+e.modele).includes(q)).slice(0,60);
 D("paFault").innerHTML='<option value="__new__">➕ Créer une NOUVELLE panne…</option>'+l.map(e=>`<option value="${E(fid(e))}">${E((e.defaut||"").slice(0,64))} · ${E(e.marque||"")}</option>`).join("");}
function readNewFault(){const g=id=>D(id).value;const feu=D("paFeu").checked;const ch=(g("paCh").match(/\d{2,4}/g)||[]).map(Number);
 const yr=(g("paAnnees").match(/\d{4}/g)||[]).map(Number);
 return{id:"admin-"+Date.now(),themes:["technique"].concat(feu?["incendie"]:[]),type:"panne",source:"admin",marque:g("paMarque")||"Multi-marques",
  modele:g("paModele")||"Tous",motorisation:g("paMoteur"),annees:yr.length?[Math.min(...yr),Math.max(...yr)]:null,energie:g("paEnergie")||energyOf(g("paMoteur")),
  systeme:g("paSys"),dtc:(g("paDtc").toUpperCase().match(/[PCBU]\d{4}/g)||[]),symptomes:arr(g("paSympt").replace(/,/g,"\n")),defaut:g("paTitre")||"Nouvelle panne",
  mecanisme:g("paMeca"),consequences:arr(g("paConseq")),indices:arr(g("paIndices")),risque_feu:feu,chaine_feu:feu?g("paChaine"):"",gravite:g("paGrav"),
  campagne:"",url:g("paUrlSrc"),puissance_ch:ch.length?ch:null,date:new Date().toISOString().slice(0,10)};}
function attachPending(){if(!PENDING.length){toast("Ajoute d'abord des photos.");return;}
 const tid=D("paFault").value;let target=tid;
 if(tid==="__new__"){const nf=readNewFault();if(!nf.defaut){toast("Titre requis.");return;}OVERLAY.entries.push(nf);target=nf.id;mergeEntries([nf]);}
 PENDING.forEach(p=>OVERLAY.photos.push({id:p.id,fault:target,url:p.src,cap:p.cap,ts:p.ts}));
 const n=PENDING.length;PENDING=[];saveOverlay();renderPending();renderResults();renderAdminPhotos();paintStats();
 toast("✅ "+n+" photo(s) rattachée(s). Publie pour diffuser.");}
function saveOverlay(){localStorage.setItem("kevo_manual",JSON.stringify(OVERLAY));
 PHOTOS={};OVERLAY.photos.forEach(p=>{(PHOTOS[p.fault]=PHOTOS[p.fault]||[]).push(p);});}
function renderAdminPhotos(){const k=Object.keys(PHOTOS);
 D("paList").innerHTML=k.length?k.slice(0,40).map(id=>{const f=BASE.find(e=>fid(e)===id);
  return `<div class="hit"><b>${E(f?f.defaut:id)}</b><div class="meta">${PHOTOS[id].length} photo(s)</div><div class="chips">${PHOTOS[id].slice(0,8).map(p=>`<img class="thumb" data-lb="${E(p.id)}" src="${E(p.url)}">`).join("")}</div></div>`;}).join(""):'<p class="small">Aucune photo rattachée.</p>';}
const TERM=[[/courroie|distribution/,"timing belt damage delamination"],[/chaine|chaîne/,"timing chain wear"],[/turbo/,"turbocharger failure"],[/egr/,"EGR cooler leak"],[/fap|cataly/,"DPF filter clogged"],[/adblue|scr/,"AdBlue crystallization injector"],[/inject/,"fuel injector coking"],[/batterie|12v/,"car battery corrosion"],[/haute tension|pack ht/,"EV high voltage battery damage"],[/faisceau|alternat/,"wiring harness burnt"],[/frein/,"brake disc overheated"],[/huile|lubrif/,"engine oil leak"],[/incendie|feu/,"car engine fire damage"],[/surchauffe/,"engine overheating damage"]];
function enQuery(f){const t=N((f.systeme||"")+" "+(f.defaut||""));for(const[r,q]of TERM)if(r.test(t))return q;return "car engine component damage";}
async function commons(q){try{const r=await fetch("https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch="+encodeURIComponent(q)+"&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=480");
 if(!r.ok)return[];const j=await r.json(),p=j&&j.query&&j.query.pages;if(!p)return[];
 return Object.values(p).map(x=>{const i=x.imageinfo&&x.imageinfo[0];if(!i||!i.thumburl)return null;const md=i.extmetadata||{};
  return{thumb:i.thumburl,page:i.descriptionurl,title:(x.title||"").replace(/^File:/,""),lic:(md.LicenseShortName&&md.LicenseShortName.value)||""};}).filter(Boolean);}catch(e){return[];}}
async function showFaultGallery(f){const out=D("photoOut");const box=document.createElement("div");box.className="hit";out.prepend(box);
 const ph=PHOTOS[fid(f)]||[];
 box.innerHTML=`<h3>🖼️ ${E((f.defaut||"").slice(0,90))}</h3><p class="small">${E(f.marque||"")} ${E(f.modele||"")} ${E(f.motorisation||"")}</p>
 <h3>📌 Photos intégrées (${ph.length})</h3>`+(ph.length?`<div class="ph-grid">`+ph.map(p=>`<figure class="ph-item" data-lb="${E(p.id)}"><img src="${E(p.url)}" loading="lazy"><figcaption>${E(p.cap||"photo admin")}</figcaption></figure>`).join("")+"</div>":'<p class="small">Aucune photo locale. Admin → 🖼️ Photos &amp; pannes → rattacher → 📡 Publier.</p>')+
 `<h3>🌐 Photos web (Commons)</h3><p class="small" id="cw">⏳ recherche…</p>`;
 const res=await commons(enQuery(f));const cw=box.querySelector("#cw");
 cw.outerHTML=res.length?`<div class="ph-grid">`+res.map(x=>`<figure class="ph-item" data-web="${E(x.thumb)}" data-page="${E(x.page||"")}"><img src="${E(x.thumb)}" loading="lazy"><figcaption>${E(x.title.slice(0,40))} ${x.lic?'<span class="tag ok">'+E(x.lic)+"</span>":""}</figcaption></figure>`).join("")+"</div>":'<p class="small">Aucune photo libre trouvée.</p>';}
function runPhotoSearch(){const q=D("photoQ").value.trim();if(!q)return;const l=search(q,4);
 D("photoOut").innerHTML=l.length?"":'<p class="small">Aucune panne correspondante.</p>';l.forEach(f=>showFaultGallery(f));}

/* ---------- VIN ---------- */
const WMI={VF1:"Renault",VF3:"Peugeot",VF7:"Citroën",VR1:"Peugeot",VR3:"Peugeot",VR7:"Citroën",UU1:"Dacia",WVW:"Volkswagen",WV1:"Volkswagen",WV2:"Volkswagen",WAU:"Audi",TRU:"Audi",TMB:"Skoda",VSS:"SEAT",WBA:"BMW",WBS:"BMW",WBY:"BMW",WDB:"Mercedes-Benz",WDD:"Mercedes-Benz",W1K:"Mercedes-Benz",WMW:"Mini",WP0:"Porsche",WP1:"Porsche",SAJ:"Jaguar",SAL:"Land Rover",WF0:"Ford",W0L:"Opel",W0V:"Opel",ZFA:"Fiat",ZAR:"Alfa Romeo",JTD:"Toyota",SB1:"Toyota",VNK:"Toyota",JHM:"Honda",SHH:"Honda",JN1:"Nissan",SJN:"Nissan",VSK:"Nissan",KMH:"Hyundai",KM8:"Hyundai",KNA:"Kia",KNE:"Kia",JMZ:"Mazda",JM1:"Mazda",JF1:"Subaru",JF2:"Subaru",JSA:"Suzuki",JS3:"Suzuki",5YJ:"Tesla",7SA:"Tesla",LRW:"Tesla",YV1:"Volvo",YV2:"Volvo",LYV:"Volvo",1G1:"Chevrolet",1C4:"Jeep",1J4:"Jeep",LGX:"BYD",LSJ:"MG",WME:"Smart",9BW:"Volkswagen",8A1:"Renault",93H:"Honda",9BR:"Toyota",TMA:"Hyundai",U5Y:"Kia",NLH:"Hyundai",ZFF:"Ferrari",ZHW:"Lamborghini",SCA:"Rolls-Royce",SCB:"Bentley"};
const YC={A:[1980,2010],B:[1981,2011],C:[1982,2012],D:[1983,2013],E:[1984,2014],F:[1985,2015],G:[1986,2016],H:[1987,2017],J:[1988,2018],K:[1989,2019],L:[1990,2020],M:[1991,2021],N:[1992,2022],P:[1993,2023],R:[1994,2024],S:[1995,2025],T:[1996,2026],V:[1997,2027],W:[1998,2028],X:[1999,2029],Y:[2000,2030],1:[2001],2:[2002],3:[2003],4:[2004],5:[2005],6:[2006],7:[2007],8:[2008],9:[2009]};
const TR={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
const VW=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
function vinCheck(v){if(v.length!==17)return{ok:false,why:"longueur ≠ 17"};if(/[IOQ]/.test(v))return{ok:false,why:"I, O, Q interdits"};
 let s=0;for(let i=0;i<17;i++){const c=v[i],n=c>="0"&&c<="9"?+c:TR[c];if(n==null)return{ok:false,why:"caractère invalide"};s+=n*VW[i];}
 const r=s%11,cd=r===10?"X":String(r);return{ok:cd===v[8],why:cd===v[8]?"chiffre de contrôle valide":"attendu "+cd+", lu "+v[8]};}
const RECALL_URL={peugeot:"https://www.peugeot.fr/services-et-engagements/rappels-vehicules.html",citroen:"https://www.citroen.fr/services-et-engagements/rappels-vehicules.html",renault:"https://www.renault.fr/services/rappels-vehicules.html",dacia:"https://www.dacia.fr/services/rappels-vehicules.html",volkswagen:"https://www.volkswagen.fr/fr/informations-utiles/campagnes-de-rappel.html",audi:"https://www.audi.fr/fr/fr/company/rappels.html",skoda:"https://www.skoda.fr/services/rappels/",bmw:"https://www.bmw.fr/fr/topics/offres-et-services/apres-vente/rappel-bmw.html","mercedes-benz":"https://www.mercedes-benz.fr/passengercars/being-an-owner/campaigns.html",toyota:"https://www.toyota.fr/services/rappels",tesla:"https://www.tesla.com/vin-recall-search",ford:"https://www.ford.fr/support/rappels/",opel:"https://www.opel.fr/services/rappels.html",hyundai:"https://www.hyundai.com/fr/fr/e-services/rappels.html",kia:"https://www.kia.com/fr/services/rappels/",nissan:"https://www.nissan.fr/services/rappels.html",volvo:"https://www.volvocars.com/fr-fr/support/rappels/"};
async function runVin(){const raw=D("vinInput").value.trim().toUpperCase(),out=D("vinOut");if(!raw)return;
 const v=vinCheck(raw),mk=WMI[raw.slice(0,3)]||WMI[raw.slice(0,2)]||"",yc=YC[raw[9]];
 const ref=new Date().getFullYear();const year=yc?(yc.length===1?yc[0]:(ref>=yc[1]-1?yc[1]:yc[0])):0;
 D("vinState").textContent=v.ok?"VIN valide":"VIN à vérifier";D("vinState").className="badge "+(v.ok?"live":"warnb");
 const kv=(l,x)=>`<div><b>${E(l)}</b>${E(x||"—")}</div>`;
 out.innerHTML=`<h3>1. Décodage</h3><p class="small">${v.ok?"✅":"⚠️"} ${E(v.why)}</p><div class="vin-kv">${kv("WMI",raw.slice(0,3))}${kv("Marque",mk)}${kv("Millésime",year)}${kv("Usine",raw[10])}${kv("Série",raw.slice(11))}</div><p class="small">⏳ Sources officielles…</p>`;
 let make=mk,model="",yr=year,fuel="",disp="";
 const vp=await jget("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/"+encodeURIComponent(raw)+"?format=json");
 const d=vp&&vp.Results&&vp.Results[0];
 if(d){make=d.Make||make;model=d.Model||"";yr=+(d.ModelYear||0)||yr;fuel=d.FuelTypePrimary||"";disp=d.DisplacementL||"";}
 let us=[];if(make&&model&&yr){const j=await jget(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${yr}`);us=(j&&j.results)||[];}
 const loc=BASE.filter(e=>e.type==="rappel"&&N(e.marque).includes(N(make))&&(!model||N(e.modele).includes(N(model)))&&(!yr||(e.annees&&yr>=e.annees[0]&&yr<=e.annees[1]))).slice(0,10);
 let h=`<h3>1. Décodage</h3><p class="small">${v.ok?"✅":"⚠️"} ${E(v.why)}</p><div class="vin-kv">${kv("Marque",make)}${kv("Modèle",model)}${kv("Millésime",yr)}${kv("Cylindrée",disp?disp+" L":"")}${kv("Carburant",fuel)}${kv("WMI",raw.slice(0,3))}</div>
 <h3>2. Campagnes applicables</h3><p class="small"><b>🇺🇸 NHTSA :</b> ${us.length}</p>`;
 h+=us.map(r=>`<div class="hit ${/fire|flamm/i.test((r.Summary||"")+(r.Consequence||""))?"feu":""}"><b>${E(r.NHTSACampaignNumber)}</b> · ${E(r.ReportReceivedDate||"")}${r.parkIt?' <span class="tag crit">PARK IT</span>':""}<p class="small">${E(r.Component||"")}</p><p class="small">${E((r.Summary||"").slice(0,280))}</p><a class="small" href="https://www.nhtsa.gov/recalls?nhtsaId=${E(r.NHTSACampaignNumber)}" target="_blank" rel="noopener">📎 Fiche</a></div>`).join("");
 h+=`<p class="small"><b>🇫🇷/🇪🇺 Base locale :</b> ${loc.length}</p>`+loc.map(e=>hitCard(e)).join("");
 const url=RECALL_URL[N(make).replace(/ /g,"-")]||RECALL_URL[N(make)]||("https://www.google.com/search?q="+encodeURIComponent(make+" rappel campagne VIN officiel"));
 h+=`<h3>3. Statut de ce VIN</h3><p class="small">Le statut « traité / non traité » n'est publié que par le constructeur.</p>
 <button type="button" class="btn green" id="vinBrand">🏭 Page rappels ${E(make||"constructeur")}</button>
 <button type="button" class="btn ghost" id="vinFill">🚗 Remplir le sélecteur</button>`;
 out.innerHTML=h;
 D("vinBrand").onclick=async()=>{try{await navigator.clipboard.writeText(raw);}catch(e){}window.open(url,"_blank","noopener");toast("📋 VIN copié — colle-le sur la page constructeur.");};
 D("vinFill").onclick=()=>{if(make)D("cMarque").value=titleCase(make.toLowerCase());if(model)D("cModele").value=model;if(yr)D("cAnnee").value=yr;
  if(fuel)D("cEnergie").value=/electric/i.test(fuel)?"electrique":/diesel/i.test(fuel)?"diesel":/hybrid/i.test(fuel)?"hybride":"essence";
  renderEngines();renderPowers();renderAttrib();toast("✅ Sélecteur pré-rempli.");};}

/* ---------- OBD ---------- */
let obdW=null,obdBuf="";const UUID="0000fff0-0000-1000-8000-00805f9b34fb";
async function obdSend(c,w){obdBuf="";await obdW.writeValue(new TextEncoder().encode(c+"\r"));const t=Date.now();
 while(Date.now()-t<w&&obdBuf.indexOf(">")<0)await sleep(60);return obdBuf;}
function decodeDTC(h){const b=h.trim().split(/\s+/).map(x=>parseInt(x,16)).filter(n=>!isNaN(n));const i=b.findIndex(x=>x===0x43||x===0x47);if(i<0)return[];
 const o=[];for(let k=i+1;k+1<b.length;k+=2){const a=b[k],c=b[k+1];if(!a&&!c)continue;o.push("PCBU"[(a>>6)&3]+((a>>4)&3)+(a&15).toString(16).toUpperCase()+(c>>4).toString(16).toUpperCase()+(c&15).toString(16).toUpperCase());}return o;}
async function obdConnect(){if(!navigator.bluetooth){D("obdStatus").textContent="Web Bluetooth indisponible (ouvre dans Chrome Android).";return;}
 try{const dev=await navigator.bluetooth.requestDevice({filters:[{services:[UUID]}],optionalServices:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]});
  const srv=await dev.gatt.connect();let svc;try{svc=await srv.getPrimaryService(UUID);}catch(e){svc=(await srv.getPrimaryServices())[0];}
  const chs=await svc.getCharacteristics(),n=chs.find(c=>c.properties.notify||c.properties.indicate);
  obdW=chs.find(c=>c.properties.write||c.properties.writeWithoutResponse);await n.startNotifications();
  n.addEventListener("characteristicvaluechanged",ev=>{obdBuf+=new TextDecoder().decode(ev.target.value);});
  D("obdStatus").textContent="✅ Connecté : "+dev.name;D("btnObdRead").disabled=false;
  for(const c of["ATZ","ATE0","ATL0","ATSP0"])await obdSend(c,900);}catch(e){D("obdStatus").textContent="❌ "+e.message;}}
async function obdRead(){D("obdStatus").textContent="⏳ Lecture…";const a=await obdSend("03",2500),b=await obdSend("07",2500);
 const codes=[...new Set(decodeDTC(a).concat(decodeDTC(b)))];
 D("obdResult").innerHTML=codes.length?codes.map(c=>{const e=BASE.find(x=>(x.dtc||[]).includes(c));return `<div class="hit"><b>${c}</b><p class="small">${E(e?e.defaut:"Code absent de la base.")}</p></div>`;}).join(""):'<p class="small">Aucun code défaut.</p>';
 if(codes.length){D("dtcLu").checked=true;D("cDtc").classList.remove("hidden");D("cDtc").value=codes.join(", ");toast("✅ "+codes.length+" code(s) injectés.");}}

/* ---------- sync sans token ---------- */
const AD={
 kvdb:{name:"kvdb.io",keys:true,
  create:async()=>{const r=await fetch("https://kvdb.io/",{method:"POST",body:""});if(!r.ok)throw new Error("HTTP "+r.status);return (await r.text()).trim().split("/").pop();},
  read:async c=>{const r=await fetch("https://kvdb.io/"+c+"/kevtf");if(r.status===404)return null;if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();return t?JSON.parse(t):null;},
  write:async(c,o)=>(await fetch("https://kvdb.io/"+c+"/kevtf",{method:"PUT",headers:{"Content-Type":"text/plain"},body:JSON.stringify(o)})).ok,
  putPhoto:async(c,id,du)=>(await fetch("https://kvdb.io/"+c+"/ph_"+id,{method:"PUT",headers:{"Content-Type":"text/plain"},body:du})).ok,
  getPhoto:async(c,id)=>{const r=await fetch("https://kvdb.io/"+c+"/ph_"+id);return r.ok?await r.text():null;}},
 restful:{name:"restful-api.dev",keys:false,
  create:async()=>{const r=await fetch("https://api.restful-api.dev/objects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"kevtf",state:{}})});if(!r.ok)throw new Error("HTTP "+r.status);return (await r.json()).id;},
  read:async c=>{const r=await fetch("https://api.restful-api.dev/objects/"+c);if(!r.ok)return null;return (await r.json()).state||null;},
  write:async(c,o)=>(await fetch("https://api.restful-api.dev/objects/"+c,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"kevtf",state:o})})).ok},
 jsonblob:{name:"jsonblob.com",keys:false,
  create:async()=>{const r=await fetch("https://jsonblob.com/api/jsonBlob",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});if(!r.ok)throw new Error("HTTP "+r.status);
   const id=r.headers.get("x-jsonblob-id")||(r.headers.get("location")||"").split("/").pop();if(!id)throw new Error("id non exposé");return id;},
  read:async c=>{const r=await fetch("https://jsonblob.com/api/jsonBlob/"+c);return r.ok?await r.json():null;},
  write:async(c,o)=>(await fetch("https://jsonblob.com/api/jsonBlob/"+c,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).ok}};
let BE=localStorage.getItem("kevo_be")||"kvdb";
const chan=()=>localStorage.getItem("kevo_ch")||"";
function setChan(c){c?localStorage.setItem("kevo_ch",c):localStorage.removeItem("kevo_ch");D("syncBadge").textContent=c?"📡 "+c.slice(0,6)+"…":"📡 aucun canal";D("syncBadge").className="badge "+(c?"live":"");}
async function syncPublish(manual){const c=chan();if(!c){if(manual)toast("❌ Crée un canal (onglet 📡 Sync).");return false;}
 const A=AD[BE],embed={},meta=[];
 for(const p of OVERLAY.photos){
  if(A.keys&&p.url.startsWith("data:")){await A.putPhoto(c,p.id,p.url);meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"key"});}
  else if(p.url.startsWith("data:")){if(Object.keys(embed).length<4)embed[p.id]=p.url;meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"embed"});}
  else meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"url",url:p.url});}
 const st={v:1,ts:Date.now(),entries:OVERLAY.entries,photosMeta:meta,embedded:embed,visuel:VISUEL,revoques:REVOQUES,contact:CONTACT};
 let ok=false;try{ok=await A.write(c,st);}catch(e){ok=false;}
 D("syStatus").textContent=ok?"✅ "+new Date().toLocaleTimeString("fr-FR"):"❌ échec";
 if(ok&&manual)toast("📡 Publié — les tiers reçoivent sous 20 s.");return ok;}
async function syncPull(){const c=chan();if(!c)return;const A=AD[BE];let st=null;
 try{st=await A.read(c);}catch(e){return;}if(!st)return;
 if(Array.isArray(st.entries))mergeEntries(st.entries);
 for(const m of st.photosMeta||[]){if((PHOTOS[m.fault]||[]).some(x=>x.id===m.id))continue;
  let url=m.url||"";
  if(m.ref==="key"){const ca=localStorage.getItem("phc:"+m.id);if(ca)url=ca;else if(A.getPhoto){const du=await A.getPhoto(c,m.id);if(du){url=du;try{localStorage.setItem("phc:"+m.id,du);}catch(e){}}}}
  else if(m.ref==="embed")url=(st.embedded||{})[m.id]||"";
  if(url)(PHOTOS[m.fault]=PHOTOS[m.fault]||[]).push({id:m.id,url,cap:m.cap,ts:m.ts});}
 if(st.visuel){VISUEL=st.visuel;applyVisuel();}
 if(Array.isArray(st.revoques)){REVOQUES=[...new Set(REVOQUES.concat(st.revoques))];localStorage.setItem("kevo_rev",JSON.stringify(REVOQUES));checkRev();}
 if(st.contact)CONTACT=st.contact;
 renderResults();paintStats();D("syStatus").textContent="🔄 "+new Date().toLocaleTimeString("fr-FR");}
function applyVisuel(){D("wallpaper").style.backgroundImage=VISUEL.fond?`url(${VISUEL.fond})`:"";
 D("wallpaper").style.opacity=(VISUEL.opacite==null?60:VISUEL.opacite)/100;
 D("opacite").value=VISUEL.opacite==null?60:VISUEL.opacite;D("opVal").textContent=D("opacite").value+"%";
 if(VISUEL.voiture){const i=new Image();i.onload=()=>carImg=i;i.src=VISUEL.voiture;}else carImg=null;
 localStorage.setItem("kevo_visuel",JSON.stringify(VISUEL));}
function checkRev(){const a=JSON.parse(localStorage.getItem("kevo_access")||"null");
 if(a&&REVOQUES.includes(a.sig)){localStorage.removeItem("kevo_access");if(!isAdmin)gate("revoque");}}

/* ---------- accès ---------- */
async function hmac(msg){try{const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const s=await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(msg));return [...new Uint8Array(s)].map(b=>b.toString(16).padStart(2,"0")).join("");}catch(e){return hash(msg+SECRET);}}
const b64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64u=s=>decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/"))));
const SCREENS=["choice","gate","adminLogin","app","admin"];
function showOnly(id){SCREENS.forEach(x=>D(x).classList.toggle("hidden",x!==id));D("btnQuit").classList.toggle("hidden",!(id==="app"||id==="admin"));}
function gate(st,name){showOnly("gate");["gateForm","gateWait","gateOk","gateKo"].forEach(i=>D(i).classList.add("hidden"));
 if(st==="attente"){D("gateWait").classList.remove("hidden");D("waitName").textContent=name||prenom;}
 else if(st==="autorise"){D("gateOk").classList.remove("hidden");D("okName").textContent=name||prenom;}
 else if(st==="refus"||st==="revoque"){D("gateKo").classList.remove("hidden");D("koText").textContent=st==="revoque"?"🔒 Code révoqué par l'administrateur.":"❌ Code invalide ou expiré.";}
 else D("gateForm").classList.remove("hidden");}
function showApp(){showOnly("app");D("btnBackAdmin").classList.toggle("hidden",!isAdmin);renderHisto();updQuota();renderOutbox();renderResults();}
function showAdmin(){showOnly("admin");renderIssued();renderRevoke();renderFaultPicker();renderPending();renderAdminPhotos();}
function issued(){return JSON.parse(localStorage.getItem("kevo_codes")||"[]");}
function renderIssued(){const a=issued();
 D("issuedList").innerHTML=a.length?`<table><thead><tr><th>Prénom</th><th>Expire</th><th>État</th><th></th></tr></thead><tbody>`+a.map((x,i)=>{
  const rev=REVOQUES.includes(x.sig),ex=x.exp<Date.now();
  return `<tr><td>${E(x.prenom)}</td><td class="small">${new Date(x.exp).toLocaleDateString("fr-FR")}</td><td><span class="tag ${rev?"crit":ex?"":"ok"}">${rev?"révoqué":ex?"expiré":"actif"}</span></td>
  <td><button class="btn ghost small" data-copy="${i}">📋</button><button class="btn red small" data-rev="${i}" ${rev?"disabled":""}>🚫</button></td></tr>`;}).join("")+"</tbody></table>":'<p class="small">Aucun code émis.</p>';
 D("issuedList").querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>navigator.clipboard.writeText(a[+b.dataset.copy].code).then(()=>toast("📋 Copié.")));
 D("issuedList").querySelectorAll("[data-rev]").forEach(b=>b.onclick=()=>{const x=a[+b.dataset.rev];if(!REVOQUES.includes(x.sig))REVOQUES.push(x.sig);
  localStorage.setItem("kevo_rev",JSON.stringify(REVOQUES));renderIssued();renderRevoke();toast("🚫 Révoqué — publie pour diffuser.");});}
function renderRevoke(){D("revokeList").innerHTML=`<p class="small">${REVOQUES.length} code(s) révoqué(s).</p>`;}
function renderOutbox(){const o=JSON.parse(localStorage.getItem("kevo_outbox")||"[]");
 D("outbox").innerHTML=o.length?o.map(x=>`<div class="hit"><span class="small">${new Date(x.at).toLocaleString("fr-FR")}</span><p class="small">${E(x.t.slice(0,180))}</p></div>`).join(""):'<p class="small">Aucun message.</p>';}
function sendMsg(copy){const t=D("msgTexte").value.trim();if(!t){toast("Écris ton message.");return;}
 const o=JSON.parse(localStorage.getItem("kevo_outbox")||"[]");o.unshift({t,at:Date.now()});localStorage.setItem("kevo_outbox",JSON.stringify(o.slice(0,30)));renderOutbox();
 if(copy)navigator.clipboard.writeText(t).then(()=>toast("📋 Copié."));
 else location.href="mailto:"+CONTACT+"?subject="+encodeURIComponent("Message KEV TECH & FIRE — "+prenom)+"&body="+encodeURIComponent(t);
 D("msgTexte").value="";D("predMsg").innerHTML="";}

/* ---------- autovérification ---------- */
async function selfCheck(){const r=[];const add=(l,lv,d)=>r.push({l,lv,d});
 add("Application chargée","ok","app.js consolidé, aucune dépendance externe");
 add("Service Worker",navigator.serviceWorker&&navigator.serviceWorker.controller?"ok":"warn",navigator.serviceWorker&&navigator.serviceWorker.controller?"actif":"recharge une fois");
 add("Réseau",navigator.onLine?"ok":"warn",navigator.onLine?"en ligne":"hors ligne — base locale utilisable");
 add("Base de pannes",BASE.length>=100?"ok":"warn",BASE.length+" fiches");
 add("Catalogue moteurs","ok",Object.keys(EDB).length+" couples marque/modèle documentés");
 add("Photos rattachées",Object.keys(PHOTOS).length?"ok":"warn",Object.keys(PHOTOS).reduce((a,k)=>a+PHOTOS[k].length,0)+" photo(s)");
 add("Canal de sync",chan()?"ok":"warn",chan()?AD[BE].name+" · "+chan().slice(0,8)+"…":"aucun canal (admin → 📡 Sync)");
 add("Attribution énergie","ok","dérivée de la motorisation (source de vérité)");
 add("NHTSA / vPIC","info","interrogés à la demande (VIN)");
 add("Stockage local","ok","IndexedDB non requis — localStorage + canal");
 D("selfBox").innerHTML=r.map(x=>`<div class="sc ${x.lv}"><span>${x.lv==="ok"?"✅":x.lv==="warn"?"⚠️":"ℹ️"}</span><div><b>${E(x.l)}</b><small>${E(x.d)}</small></div></div>`).join("");
 const ok=r.filter(x=>x.lv==="ok").length,w=r.filter(x=>x.lv==="warn").length;
 D("selfBadge").textContent=`🩺 ${ok}/${r.length}`+(w?" · "+w+"⚠":"");D("selfBadge").className="badge "+(w?"warnb":"live");}

/* ---------- fond animé ---------- */
const cv=D("bg"),cx=cv.getContext("2d");let W=0,H=0,stars=[],b1=[],b2=[],dash=0,run=true;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize(){const d=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
 stars=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H*.55,r:Math.random()*1.4+.3,p:Math.random()*6}));
 const mk=(n,h)=>Array.from({length:n},(_,i)=>({x:i*(W/n),w:W/n*.7,h:h+Math.random()*h}));b1=mk(14,H*.16);b2=mk(20,H*.1);}
addEventListener("resize",resize);resize();
const acc=()=>getComputedStyle(document.documentElement).getPropertyValue("--acc").trim()||"#00e676";
function car(x,y,s,t){cx.save();cx.translate(x,y+Math.sin(t/180)*1.6);cx.scale(s,s);
 if(carImg){cx.drawImage(carImg,-150,-78,300,90);cx.restore();return;}
 const a=acc();cx.shadowColor=a;cx.shadowBlur=18;cx.fillStyle="#0d1330";cx.strokeStyle=a;cx.lineWidth=2;
 cx.beginPath();cx.moveTo(-140,0);cx.quadraticCurveTo(-130,-30,-80,-36);cx.lineTo(-45,-58);cx.quadraticCurveTo(0,-72,55,-56);cx.lineTo(95,-36);cx.quadraticCurveTo(140,-30,146,-8);cx.lineTo(146,0);cx.closePath();cx.fill();cx.stroke();
 cx.shadowBlur=0;cx.fillStyle="rgba(144,202,249,.85)";cx.beginPath();cx.moveTo(-40,-54);cx.lineTo(48,-52);cx.lineTo(78,-38);cx.lineTo(-62,-38);cx.closePath();cx.fill();
 [-88,92].forEach(wx=>{cx.fillStyle="#05070f";cx.beginPath();cx.arc(wx,2,20,0,7);cx.fill();cx.strokeStyle=a;cx.stroke();
  cx.save();cx.translate(wx,2);cx.rotate(t/90);cx.strokeStyle="rgba(255,255,255,.6)";for(let k=0;k<4;k++){cx.rotate(Math.PI/2);cx.beginPath();cx.moveTo(0,0);cx.lineTo(0,-14);cx.stroke();}cx.restore();});
 cx.fillStyle="rgba(255,241,118,.9)";cx.beginPath();cx.moveTo(146,-14);cx.lineTo(230,-4);cx.lineTo(230,10);cx.lineTo(146,2);cx.closePath();cx.fill();
 cx.fillStyle="#ff1744";cx.fillRect(-146,-16,6,8);cx.restore();}
function frame(t){if(!run)return;const a=acc(),road=H*.8;
 const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#050816");g.addColorStop(.55,"#141034");g.addColorStop(1,"#070b1e");cx.fillStyle=g;cx.fillRect(0,0,W,H);
 for(let i=0;i<2;i++){const bx=W*(.3+.4*i)+Math.sin(t/4000+i*2)*W*.12;const rg=cx.createRadialGradient(bx,H*.22,0,bx,H*.22,W*.35);
  rg.addColorStop(0,i?"rgba(124,77,255,.18)":"rgba(0,229,255,.14)");rg.addColorStop(1,"transparent");cx.fillStyle=rg;cx.fillRect(0,0,W,H);}
 cx.fillStyle="#fff";stars.forEach(s=>{cx.globalAlpha=.3+.5*Math.abs(Math.sin(t/900+s.p));cx.fillRect(s.x,s.y,s.r,s.r);});cx.globalAlpha=1;
 cx.fillStyle="rgba(10,14,36,.9)";b1.forEach(b=>{const x=(b.x-t*.008)%W;cx.fillRect(x<0?x+W:x,road-b.h,b.w,b.h);});
 cx.fillStyle="rgba(16,20,52,.95)";b2.forEach(b=>{const x=(b.x-t*.02)%W;cx.fillRect(x<0?x+W:x,road-b.h,b.w,b.h);});
 cx.fillStyle=a;cx.globalAlpha=.5;cx.fillRect(0,road,W,2);cx.globalAlpha=1;cx.fillStyle="#0a0d1c";cx.fillRect(0,road,W,H-road);
 dash=(dash+6)%160;cx.fillStyle="rgba(255,215,64,.8)";for(let x=-dash;x<W;x+=160)cx.fillRect(x,road+(H-road)*.5,70,5);
 car(W*.34,road-2,Math.min(1,W/700),t);if(!reduce)requestAnimationFrame(frame);}
document.addEventListener("visibilitychange",()=>{run=!document.hidden;if(run&&!reduce)requestAnimationFrame(frame);});

/* ---------- événements ---------- */
function wire(){
 D("themeSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;THEME=b.dataset.t;
  document.documentElement.dataset.theme=THEME;[...D("themeSeg").children].forEach(x=>x.classList.toggle("on",x===b));renderResults();});
 D("appTabs").addEventListener("click",e=>{const b=e.target.closest("[data-nav]");if(!b)return;
  ["recherche","etude","photos","obd","message"].forEach(v=>D("v-"+v).classList.toggle("hidden",v!==b.dataset.nav));
  [...D("appTabs").querySelectorAll("[data-nav]")].forEach(x=>x.classList.toggle("active",x===b));});
 D("admTabs").addEventListener("click",e=>{const b=e.target.closest("[data-adm]");if(!b)return;
  ["acces","photos","visuel","sync","base"].forEach(v=>D("a-"+v).classList.toggle("hidden",v!==b.dataset.adm));
  [...D("admTabs").querySelectorAll("[data-adm]")].forEach(x=>x.classList.toggle("active",x===b));
  if(b.dataset.adm==="photos"){renderFaultPicker();renderAdminPhotos();}if(b.dataset.adm==="base")selfCheck();});
 D("btnModeAdmin").onclick=()=>{D("adminPwd").value="";showOnly("adminLogin");D("adminPwd").focus();};
 D("btnAdminBack").onclick=()=>showOnly("choice");
 D("btnAdminLogin").onclick=()=>{const p=D("adminPwd").value;D("adminPwd").value="";if(!p)return;
  let ok=false;try{ok=btoa(p)===ADMIN_B64;}catch(e){ok=p==="Kevin83600";}
  if(ok){isAdmin=true;showAdmin();toast("🛡️ Mode admin.");}else toast("❌ Mot de passe incorrect.");};
 D("btnModeTiers").onclick=()=>{localStorage.setItem("mode","tiers");const a=JSON.parse(localStorage.getItem("kevo_access")||"null");
  if(a&&!REVOQUES.includes(a.sig)){prenom=a.prenom;showApp();}else gate("form");};
 D("btnGateBack").onclick=()=>{localStorage.removeItem("mode");showOnly("choice");};
 D("btnBackForm").onclick=()=>gate("form");D("btnReDemande").onclick=()=>gate("form");D("btnEntrer").onclick=showApp;
 D("btnQuit").onclick=()=>{isAdmin=false;showOnly("choice");};
 D("btnLogout").onclick=()=>{isAdmin=false;showOnly("choice");};
 D("btnBackAdmin").onclick=()=>isAdmin&&showAdmin();D("btnAdminToApp").onclick=showApp;
 D("btnDemande").onclick=async()=>{const p=D("prenom").value.trim(),c=D("accessCode").value.trim();
  if(!p||!c){toast("Prénom + code requis.");return;}
  try{const[pl,sg]=c.split(".");const pay=JSON.parse(unb64u(pl));
   if(await hmac(pl)!==sg)throw 0;if(pay.exp&&Date.now()>pay.exp)throw 0;if(REVOQUES.includes(sg)){gate("revoque");return;}
   prenom=p;localStorage.setItem("prenom",p);localStorage.setItem("kevo_access",JSON.stringify({prenom:p,sig}));gate("autorise",p);}
  catch(e){gate("refus");}};
 D("lnkAskCode").onclick=e=>{e.preventDefault();const p=D("prenom").value.trim()||"(prénom)";
  location.href="mailto:"+CONTACT+"?subject="+encodeURIComponent("Demande de code KEV TECH & FIRE")+"&body="+encodeURIComponent("Bonjour,\n\nPrénom : "+p+"\nJe souhaite un code d'accès.\n\nMerci !");gate("attente",p);};
 D("chGo").onclick=()=>{setChan(D("chCode").value.trim());syncPull();toast(chan()?"✅ Canal rejoint.":"Canal effacé.");};
 ["cMarque","cModele"].forEach(id=>D(id).addEventListener("change",()=>{renderEngines();
  const l=enginesFor(D("cMarque").value,D("cModele").value);
  if(D("cMoteur").value&&!l.some(e=>N(e.m)===N(D("cMoteur").value))){D("cMoteur").value="";D("cPuiss").value="";}
  renderPowers();renderAttrib();}));
 D("cMoteur").addEventListener("change",autoAttribute);
 D("engChips").addEventListener("click",e=>{const b=e.target.closest("[data-eng]");if(!b)return;
  const en=D("engChips").__l[+b.dataset.eng];D("cMoteur").value=en.m;autoAttribute();});
 D("puissChips").addEventListener("click",e=>{const b=e.target.closest("[data-ch]");if(!b)return;D("cPuiss").value=b.dataset.ch;});
 D("q").addEventListener("input",renderResults);["fMarque","fSys","fGrav"].forEach(id=>D(id).addEventListener("change",renderResults));
 D("results").addEventListener("click",e=>{
  const lb=e.target.closest("[data-lb]");if(lb){for(const k in PHOTOS){const p=PHOTOS[k].find(x=>x.id===lb.dataset.lb);if(p){lightbox(p.url,p.cap);return;}}return;}
  const g=e.target.closest("[data-gal]");if(g){const f=BASE.find(x=>fid(x)===g.dataset.gal);D("appTabs").querySelector('[data-nav="photos"]').click();D("photoOut").innerHTML="";if(f)showFaultGallery(f);return;}
  const cs=e.target.closest("[data-cs]");if(cs){D("appTabs").querySelector('[data-nav="photos"]').click();D("photoQ").value=cs.dataset.cs;runPhotoSearch();return;}
  const u=e.target.closest("[data-use]");if(u){const[mk,mo]=u.dataset.use.split("|");D("cMarque").value=mk;D("cModele").value=mo;renderEngines();renderPowers();renderAttrib();toast("✅ Véhicule chargé.");window.scrollTo({top:0,behavior:"smooth"});}});
 D("paList").addEventListener("click",e=>{const im=e.target.closest("[data-lb]");if(!im)return;
  for(const k in PHOTOS){const p=PHOTOS[k].find(x=>x.id===im.dataset.lb);if(p){lightbox(p.url,p.cap);return;}}});
 D("photoOut").addEventListener("click",e=>{const l=e.target.closest("[data-lb]");
  if(l){for(const k in PHOTOS){const p=PHOTOS[k].find(x=>x.id===l.dataset.lb);if(p){lightbox(p.url,p.cap);return;}}return;}
  const w=e.target.closest("[data-web]");if(w)lightbox(w.dataset.web,w.dataset.page||"");});
 D("lbClose").onclick=()=>D("lightbox").classList.remove("open");
 D("lightbox").addEventListener("click",e=>{if(e.target===D("lightbox"))D("lightbox").classList.remove("open");});
 D("photoGo").onclick=runPhotoSearch;D("photoQ").addEventListener("keydown",e=>{if(e.key==="Enter")runPhotoSearch();});
 D("btnCtx").onclick=analyserContexte;D("btnCtxPrint").onclick=()=>window.print();
 D("btnCtxExport").onclick=()=>dl("analyse.json",JSON.stringify({vehicule:getVeh(),contexte:D("ctx").value},null,1));
 D("btnAnalyser").onclick=analyserEtude;D("btnPrint").onclick=()=>window.print();
 D("btnExportEtude").onclick=()=>dl("etude.json",JSON.stringify({vehicule:getVeh()},null,1));
 D("dtcLu").addEventListener("change",()=>D("cDtc").classList.toggle("hidden",!D("dtcLu").checked));
 D("btnObd").onclick=obdConnect;D("btnObdRead").onclick=obdRead;
 D("btnMsg").onclick=()=>sendMsg(false);D("btnMsgCopy").onclick=()=>sendMsg(true);
 D("vinGo").onclick=runVin;D("vinInput").addEventListener("keydown",e=>{if(e.key==="Enter")runVin();});
 D("vinPaste").onclick=async()=>{try{D("vinInput").value=(await navigator.clipboard.readText()).trim().slice(0,17);runVin();}catch(e){toast("Colle manuellement.");}};
 D("btnGenCode").onclick=async()=>{const p=D("gcPrenom").value.trim();if(!p){toast("Prénom requis.");return;}
  const days=Math.max(1,+D("gcJours").value||365),pay={p,n:hash(p+Date.now()),exp:Date.now()+days*864e5};
  const pl=b64u(JSON.stringify(pay)),sg=await hmac(pl),code=pl+"."+sg;
  D("genOut").textContent=code;D("genOut").classList.remove("hidden");
  const a=issued();a.unshift({prenom:p,exp:pay.exp,sig:sg,code});localStorage.setItem("kevo_codes",JSON.stringify(a));renderIssued();toast("🎟️ Code généré.");};
 D("btnCopyCode").onclick=()=>navigator.clipboard.writeText(D("genOut").textContent).then(()=>toast("📋 Copié."));
 D("btnShareCode").onclick=()=>{const t="Code d'accès KEV TECH & FIRE :\n"+D("genOut").textContent;
  if(navigator.share)navigator.share({title:"Code d'accès",text:t}).catch(()=>{});else navigator.clipboard.writeText(t).then(()=>toast("📋 Copié."));};
 D("btnPublishRevoke").onclick=()=>syncPublish(true);
 document.addEventListener("paste",async e=>{if(!isAdmin)return;const it=[...(e.clipboardData&&e.clipboardData.items||[])].filter(i=>/^image\//.test(i.type));
  if(!it.length)return;e.preventDefault();for(const i of it){const f=i.getAsFile();if(f)addPending(await compress(f),"photo collée");}toast("📷 Photo(s) en attente.");});
 const dz=D("paDrop");["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("drag");}));
 ["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("drag");}));
 dz.addEventListener("drop",e=>{if(e.dataTransfer.files.length)intakeFiles([...e.dataTransfer.files],D("paCap").value);});
 dz.addEventListener("click",()=>D("paFile").click());
 D("paFile").addEventListener("change",e=>{if(e.target.files.length)intakeFiles([...e.target.files],D("paCap").value);e.target.value="";});
 D("paUrlGo").onclick=async()=>{const u=D("paUrl").value.trim();if(!u)return;
  try{addPending(await compress(u),D("paCap").value||u);}catch(e){addPending(u,D("paCap").value||u);}D("paUrl").value="";};
 D("paFaultQ").addEventListener("input",renderFaultPicker);
 D("paFault").addEventListener("change",()=>D("paNewForm").classList.toggle("hidden",D("paFault").value!=="__new__"));
 D("paAttach").onclick=attachPending;D("paPubSync").onclick=()=>syncPublish(true);
 D("paExport").onclick=()=>dl("manual-photos.json",JSON.stringify(OVERLAY,null,1));
 D("fileFond").addEventListener("change",async e=>{if(!e.target.files[0])return;VISUEL.fond=await compress(e.target.files[0],1600,.85);applyVisuel();});
 D("fileVoiture").addEventListener("change",async e=>{if(!e.target.files[0])return;VISUEL.voiture=await compress(e.target.files[0],900,.85);applyVisuel();});
 D("opacite").addEventListener("input",()=>{D("opVal").textContent=D("opacite").value+"%";D("wallpaper").style.opacity=D("opacite").value/100;});
 D("btnOp").onclick=()=>{VISUEL.opacite=+D("opacite").value;applyVisuel();toast("💾 Appliqué.");};
 D("btnVisuelReset").onclick=()=>{VISUEL={opacite:60};applyVisuel();};
 D("btnPublishVisuel").onclick=()=>{CONTACT=D("contactEmail").value.trim()||CONTACT;localStorage.setItem("kevo_contact",CONTACT);syncPublish(true);};
 D("syBackend").addEventListener("change",()=>{BE=D("syBackend").value;localStorage.setItem("kevo_be",BE);});
 D("syCreate").onclick=async()=>{toast("⏳ Création du canal…");try{const id=await AD[BE].create();setChan(id);D("syChannel").value=id;await syncPublish(false);toast("✅ Canal créé : "+id);}catch(e){toast("❌ "+AD[BE].name+" : "+e.message+" — change de backend.");}};
 D("sySave").onclick=()=>{setChan(D("syChannel").value.trim());syncPull();};
 D("syShare").onclick=()=>{const c=chan();if(!c){toast("Aucun canal.");return;}const t="Code canal KEV TECH & FIRE : "+c;
  if(navigator.share)navigator.share({title:"Canal",text:t}).catch(()=>{});else navigator.clipboard.writeText(t).then(()=>toast("📋 Copié."));};
 D("syTest").onclick=async()=>{const c=D("syChannel").value.trim()||chan();if(!c){toast("Renseigne un canal.");return;}
  try{const s=await AD[BE].read(c);toast(s?"✅ Canal joignable":"⚠️ Canal vide mais joignable");}catch(e){toast("❌ "+e.message);}};
 D("syAuto").addEventListener("change",()=>localStorage.setItem("kevo_auto",D("syAuto").checked?"1":"0"));
 D("syPub").onclick=()=>syncPublish(true);D("syPull").onclick=syncPull;
 D("btnReloadBase").onclick=async()=>{await loadBase();await syncPull();toast("✅ Base rechargée.");};
 D("btnSelfCheck").onclick=selfCheck;D("selfBadge").onclick=()=>{if(isAdmin){showAdmin();D("admTabs").querySelector('[data-adm="base"]').click();}selfCheck();};
 D("syncBadge").onclick=()=>{const c=prompt("Code canal de synchronisation :",chan());if(c===null)return;setChan(c.trim());syncPull();};
 D("fileImport").addEventListener("change",async e=>{if(!isAdmin){toast("Réservé admin.");return;}
  for(const f of [...e.target.files]){try{
   if(/\.json$/i.test(f.name)){const j=JSON.parse(await f.text());const a=Array.isArray(j)?j:(j.entries||[]);
    if(j.photos)j.photos.forEach(p=>OVERLAY.photos.push(p));mergeEntries(a);OVERLAY.entries=OVERLAY.entries.concat(a);}
   else{const t=await f.text();t.split(/\n{2,}/).filter(x=>x.trim().length>40).forEach((x,i)=>OVERLAY.entries.push({id:"doc-"+hash(f.name+i),
    themes:["technique"],type:"document",source:"import",marque:"Multi-marques",modele:"Tous",defaut:f.name+" — extrait "+(i+1),mecanisme:x.slice(0,1800),
    consequences:[],dtc:(x.toUpperCase().match(/[PCBU]\d{4}/g)||[]),risque_feu:FIRE.test(x),gravite:"modere",date:new Date().toISOString().slice(0,10)}));}
   }catch(err){toast("❌ "+f.name+" : "+err.message);}}
  saveOverlay();mergeEntries(OVERLAY.entries);fillFilters();renderResults();paintStats();e.target.value="";toast("📥 Import terminé.");});
 D("btnExportOverlay").onclick=()=>dl("manual.json",JSON.stringify(OVERLAY,null,1));
 D("ghPat").addEventListener("change",()=>localStorage.setItem("ghpat",D("ghPat").value.trim()));
 addEventListener("online",()=>{net();syncPull();});addEventListener("offline",net);
}
function net(){const c=navigator.connection||{},t=c.type==="wifi"?"WiFi":(c.effectiveType||"").toUpperCase();
 D("netBadge").textContent=navigator.onLine?"📶 "+(t||"réseau"):"📴 hors ligne";D("netBadge").className="badge "+(navigator.onLine?"live":"warnb");}

/* ---------- boot ---------- */
async function boot(){
 try{
  D("qcm").innerHTML=SYMPT.map(s=>`<label><input type="checkbox" value="${E(s)}">${E(s)}</label>`).join("");
  D("contactEmail").value=CONTACT;D("ghPat").value=localStorage.getItem("ghpat")?"••••••••":"";
  D("syBackend").value=BE;D("syChannel").value=chan();D("syAuto").checked=localStorage.getItem("kevo_auto")==="1";
  applyVisuel();net();wire();wirePredictive();renderEngines();renderPowers();updQuota();setChan(chan());
  if(!reduce)requestAnimationFrame(frame);else frame(0);
  await loadBase();await syncPull();await selfCheck();
  if(localStorage.getItem("mode")==="tiers"){const a=JSON.parse(localStorage.getItem("kevo_access")||"null");
   if(a&&!REVOQUES.includes(a.sig)){prenom=a.prenom;showApp();}else gate("form");}else showOnly("choice");
  setInterval(()=>{syncPull();if(isAdmin&&localStorage.getItem("kevo_auto")==="1")syncPublish(false);},20000);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)syncPull();});
  if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
 }catch(e){console.error(e);toast("❌ Erreur d'initialisation : "+e.message,8000);}
 finally{D("bootScreen").classList.add("done");}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.KEV={BASE:()=>BASE,PHOTOS:()=>PHOTOS,syncPublish,syncPull,selfCheck,enginesFor,energyOf};
})();
