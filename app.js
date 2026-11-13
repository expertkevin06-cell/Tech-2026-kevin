/* KEV TECH & FIRE — app consolidée v11 : boot non bloquant, timeouts, cache, autovérification */
"use strict";
(function(){
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const arr=v=>Array.isArray(v)?v.map(x=>String(x).trim()).filter(Boolean):typeof v==="string"?v.replace(/;/g,"\n").split(/\r?\n/).map(x=>x.trim()).filter(Boolean):[];
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(36);};
const fid=e=>e.id||hash([e.source,e.campagne,e.marque,e.modele,e.motorisation,e.defaut].map(N).join("|"));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function toast(m,ms){const d=document.createElement("div");d.className="toast";d.innerHTML=m;D("toasts").appendChild(d);setTimeout(()=>d.remove(),ms||4000);}
function dl(n,t){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"application/json"}));a.download=n;a.click();}
/* ---- fetch avec timeout : AUCUNE requête ne peut suspendre l'app ---- */
async function fetchT(url,ms,opt){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms||6000);
 try{const r=await fetch(url,Object.assign({signal:c.signal,cache:"no-store"},opt||{}));clearTimeout(t);return r;}
 catch(e){clearTimeout(t);throw e;}}
async function jget(url,ms){try{const r=await fetchT(url,ms||6000);return r.ok?await r.json():null;}catch(e){return null;}}
const ADMIN_B64="S2V2aW44MzYwMA==",SECRET="KEVTF-"+ADMIN_B64;
let BASE=[],PHOTOS={},THEME="tous",isAdmin=false,prenom=localStorage.getItem("prenom")||"",READY=false;
let OVERLAY=JSON.parse(localStorage.getItem("kevo_manual")||'{"entries":[],"photos":[]}');
let VISUEL=JSON.parse(localStorage.getItem("kevo_visuel")||'{"opacite":60}');
let REVOQUES=JSON.parse(localStorage.getItem("kevo_rev")||"[]");
let PENDING=[],carImg=null,CONTACT=localStorage.getItem("kevo_contact")||"contact@kev-tech-fire.fr";
let STAGES={},harvesting=false;
const FIRE=/incendie|feu\b|flamme|embras|brulure|inflamm|\bfire\b|flamm|ignit|burn/i;
const SYMPT=["voyant allumé","perte de puissance","à-coups moteur","à-coups boîte","bruit anormal","claquement","fumée","odeur carburant","odeur brûlé","surchauffe","fuite visible","démarrage difficile","incendie / départ de feu","véhicule immobilisé","après entretien / réparation","après choc","après immersion"];
function stage(k,lv,d){STAGES[k]={lv,d};paintStages();}
function paintStages(){
 const order=[["boot","Ouverture de l'application"],["cache","Base locale (cache)"],["seed","Base embarquée"],["repo","Base du dépôt"],["manual","Pannes & photos admin"],["sync","Canal temps réel"],["upd","Mises à jour"],["sw","Service Worker"],["net","Réseau"]];
 const html=order.filter(o=>STAGES[o[0]]).map(o=>{const s=STAGES[o[0]];
  return `<div class="sc ${s.lv}"><span>${s.lv==="ok"?"✅":s.lv==="warn"?"⚠️":s.lv==="bad"?"❌":"ℹ️"}</span><div><b>${E(o[1])}</b><small>${E(s.d)}</small></div></div>`;}).join("");
 D("diagBox").innerHTML=html;D("selfBox").innerHTML=html;
 const v=Object.values(STAGES),ok=v.filter(x=>x.lv==="ok").length,bad=v.filter(x=>x.lv==="bad").length,warn=v.filter(x=>x.lv==="warn").length;
 D("selfBadge").textContent=`🩺 ${ok}/${v.length}`+(bad?" · "+bad+"❌":warn?" · "+warn+"⚠":"");
 D("selfBadge").className="badge "+(bad?"bad":warn?"warnb":"live");
 const p=v.length?Math.round(ok/v.length*100):0;D("diagProg").style.width=p+"%";D("loadProg").style.width=p+"%";}

/* ---- seed embarqué : l'app n'est JAMAIS vide ---- */
const SEED=[
{id:"f01",themes:["incendie"],type:"panne",source:"doctrine",marque:"Multi-marques",modele:"Tous",motorisation:"",annees:[2010,2027],energie:"",systeme:"Lubrification",dtc:[],symptomes:["odeur brûlé","fumée"],defaut:"Huile moteur sur organes chauds",mecanisme:"Film d'huile sur surface > auto-inflammation 300-350°C (collecteur 400-800°C, turbo 600-1000°C, FAP 600-1200°C)",consequences:["Feu baie moteur"],indices:["Vernis brun","coulures verticales"],risque_feu:true,chaine_feu:"Fuite huile → organe > 300°C → auto-inflammation → feu",gravite:"critique",campagne:"",url:"",date:"2026-01-01"},
{id:"f02",themes:["incendie"],type:"panne",source:"doctrine",marque:"Multi-marques",modele:"Tous",motorisation:"GDI / CR diesel",annees:[2010,2027],energie:"",systeme:"Injection",dtc:[],symptomes:["odeur carburant","fuite visible"],defaut:"Fuite carburant BP & HP",mecanisme:"Rampe GDI 150-350 bar, CR 1600-2500 bar — essence auto-infl. ~280°C",consequences:["Flash immédiat","feu compartiment moteur"],indices:["Suintement injecteur","durite marquée"],risque_feu:true,chaine_feu:"Fuite → aérosol/vapeurs → point chaud ou arc → flash",gravite:"critique",campagne:"",url:"",date:"2026-01-01"},
{id:"f03",themes:["technique","incendie"],type:"panne",source:"doctrine",marque:"Multi-marques",modele:"Tous",motorisation:"",annees:[2010,2027],energie:"",systeme:"Faisceau électrique",dtc:[],symptomes:["voyant allumé","odeur brûlé"],defaut:"Faisceau : frottement, rongeurs, aftermarket",mecanisme:"B+ énergisé 100-250 A, gaines, épissures — arc franc > 2000°C",consequences:["Feu baie / habitacle"],indices:["Gaine percée","perles de cuivre"],risque_feu:true,chaine_feu:"Usure gaine → court-circuit B+ → arc → inflammation",gravite:"critique",campagne:"",url:"",date:"2026-01-01"},
{id:"f04",themes:["incendie"],type:"panne",source:"doctrine",marque:"Multi-marques",modele:"Tous diesel",motorisation:"FAP",annees:[2010,2027],energie:"diesel",systeme:"FAP / cata",dtc:["P2463"],symptomes:["odeur brûlé","fumée"],defaut:"Échappement / FAP : inflammation externe",mecanisme:"FAP regen 600-1200°C, végétation sèche auto-infl. 250-300°C",consequences:["Feu sous caisse"],indices:["FAP coloré","pare-chaleur déformé"],risque_feu:true,chaine_feu:"Régénération → rayonnement → inflammation végétation",gravite:"critique",campagne:"",url:"",date:"2026-01-01"},
{id:"f05",themes:["incendie"],type:"panne",source:"doctrine",marque:"Multi-marques VE",modele:"Tous VE",motorisation:"Pack HT",annees:[2015,2027],energie:"electrique",systeme:"Pack HT",dtc:["P0AA6"],symptomes:["incendie / départ de feu","après choc"],defaut:"Court-circuit interne cellule → emballement thermique",mecanisme:"SEI 90-120°C → séparateur 130-170°C → cathode 180-250°C → jet-fire 800-1400°C",consequences:["Propagation modules","gaz HF/CO"],indices:["Point chaud","gonflement"],risque_feu:true,chaine_feu:"Défaut interne → emballement → jet-fire → propagation",gravite:"critique",campagne:"",url:"",date:"2026-01-01"},
{id:"t01",themes:["technique","incendie"],type:"panne",source:"fusion-kevin",marque:"Peugeot / Citroën / DS / Opel",modele:"208 / 2008 / 308 / 3008 / 5008 / C3 / C4",motorisation:"1.2 PureTech",annees:[2013,2023],energie:"essence",systeme:"Distribution",dtc:["P0016","P0521"],symptomes:["claquement","voyant allumé","perte de puissance"],defaut:"Courroie de distribution humide — délamination",mecanisme:"Délamination → débris → obstruction crépine → chute pression huile",consequences:["Casse moteur","fuite huile sur chaud"],indices:["Courroie effilochée","crépine colmatée"],risque_feu:true,chaine_feu:"Débris → crépine → pression huile → fuite sur échappement → feu possible",gravite:"critique",campagne:"",url:"https://rappel.conso.gouv.fr/",date:"2026-01-01",puissance_ch:[75,131]},
{id:"t02",themes:["technique","incendie"],type:"panne",source:"fusion-kevin",marque:"Peugeot / Citroën",modele:"3008 / 5008 / C4 / C5 Aircross",motorisation:"1.5 BlueHDi",annees:[2017,2024],energie:"diesel",systeme:"AdBlue / SCR",dtc:["P20EE","P204F"],symptomes:["voyant allumé","perte de puissance","démarrage difficile"],defaut:"AdBlue : cristallisation réservoir & injecteur",mecanisme:"Cristallisation de l'urée → obstruction injecteur/pompe → défaut dosage NOx",consequences:["Mode dégradé","démarrage interdit","remplacement réservoir"],indices:["Cristaux blancs","dépôts injecteur"],risque_feu:false,chaine_feu:"",gravite:"eleve",campagne:"",url:"https://rappel.conso.gouv.fr/",date:"2026-01-01",puissance_ch:[100,130]},
{id:"t03",themes:["technique","incendie"],type:"panne",source:"fusion-kevin",marque:"BMW",modele:"Série 1 / Série 3 / X3",motorisation:"N47 diesel",annees:[2007,2018],energie:"diesel",systeme:"Distribution",dtc:["P0016","P0017"],symptomes:["claquement","bruit anormal"],defaut:"Chaîne N47 — allongement / casse",mecanisme:"Usure chaîne + tendeur → allongement → saut de dent / casse",consequences:["Décalage calage","casse moteur"],indices:["Claquement froid côté boîte"],risque_feu:true,chaine_feu:"Casse chaîne → casse moteur → huile sur chaud",gravite:"critique",campagne:"",url:"",date:"2026-01-01"},
{id:"t04",themes:["technique","incendie"],type:"panne",source:"fusion-kevin",marque:"Hyundai / Kia",modele:"Sonata / Tucson / Optima / Santa Fe",motorisation:"Theta II 2.0/2.4 GDi",annees:[2011,2019],energie:"essence",systeme:"Bloc moteur",dtc:[],symptomes:["claquement","perte de puissance","fumée"],defaut:"Grippage coussinets de bielles → carter percé",mecanisme:"Débris d'usinage → grippage → bielle au travers du carter → huile sous pression sur échappement",consequences:["Casse moteur","feu compartiment moteur"],indices:["Carter percé"],risque_feu:true,chaine_feu:"Grippage → carter percé → huile sur échappement → feu",gravite:"critique",campagne:"",url:"https://www.nhtsa.gov/recalls",date:"2026-01-01"},
{id:"t05",themes:["technique","incendie"],type:"panne",source:"fusion-kevin",marque:"BMW / Mercedes-Benz / Volkswagen / Audi",modele:"6 cylindres diesel",motorisation:"N57 / OM642 / V6 TDI",annees:[2012,2021],energie:"diesel",systeme:"EGR",dtc:["P0400"],symptomes:["odeur brûlé","fumée","perte de puissance"],defaut:"Refroidisseur EGR fuyard — couvaison",mecanisme:"Fuite glycol + suies → dépôts incandescents → feu collecteur",consequences:["Feu baie moteur"],indices:["Suies humides"],risque_feu:true,chaine_feu:"Fuite EGR → glycol + suies → couvaison → inflammation",gravite:"critique",campagne:"",url:"https://www.nhtsa.gov/recalls",date:"2026-01-01"},
{id:"t06",themes:["technique","incendie"],type:"panne",source:"fusion-kevin",marque:"Hyundai / Kia",modele:"Ioniq 5 / EV6 / Niro",motorisation:"E-GMP ICCU",annees:[2021,2025],energie:"electrique",systeme:"Charge",dtc:[],symptomes:["voyant allumé","véhicule immobilisé"],defaut:"ICCU défaillante (charge 12V)",mecanisme:"Défaut ICCU → panne 12V + échauffement puissance",consequences:["Immobilisation","risque thermique"],indices:["Codes P1Axx"],risque_feu:true,chaine_feu:"ICCU → échauffement → risque feu local",gravite:"critique",campagne:"",url:"https://www.nhtsa.gov/recalls",date:"2026-01-01"},
{id:"t07",themes:["technique","incendie"],type:"panne",source:"fusion-kevin",marque:"Ford",modele:"Fiesta / Focus / Puma",motorisation:"1.0 EcoBoost",annees:[2012,2023],energie:"essence",systeme:"Distribution / Injection",dtc:[],symptomes:["perte de puissance","odeur carburant"],defaut:"Courroie humide + durite carburant",mecanisme:"Dégradation courroie ; durite fissurée → fuite baie → vapeurs",consequences:["Casse moteur","risque feu baie"],indices:["Courroie glacée","durite marquée"],risque_feu:true,chaine_feu:"Fuite durite → vapeurs → point chaud → feu",gravite:"critique",campagne:"",url:"https://rappel.conso.gouv.fr/",date:"2026-01-01",puissance_ch:[95,155]},
{id:"t08",themes:["technique"],type:"panne",source:"fusion-kevin",marque:"Volkswagen / Audi / Seat / Skoda",modele:"Golf / Polo / Ibiza / Fabia",motorisation:"DQ200 DSG7",annees:[2008,2019],energie:"",systeme:"Boîte",dtc:["P0700"],symptomes:["à-coups boîte","bruit anormal"],defaut:"Mécatronique DQ200 + embrayage sec",mecanisme:"Surchauffe embrayage + défaut mécatronique → mode dégradé",consequences:["Perte motricité"],indices:["Disques bleuis"],risque_feu:false,chaine_feu:"",gravite:"eleve",campagne:"",url:"",date:"2026-01-01"},
{id:"t09",themes:["technique"],type:"panne",source:"fusion-kevin",marque:"Multi-marques",modele:"Tous",motorisation:"",annees:[2010,2027],energie:"",systeme:"Batterie 12V",dtc:["P0562"],symptomes:["démarrage difficile","voyant allumé"],defaut:"Décharge parasite / batterie AGM fatiguée",mecanisme:"Sulfatation, décharge profonde → tension insuffisante",consequences:["Immobilisation","défauts calculateurs"],indices:["Tension repos basse"],risque_feu:false,chaine_feu:"",gravite:"eleve",campagne:"",url:"",date:"2026-01-01"}
];

/* ---- moteurs ---- */
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
"dacia|spring":[["Electric 45",0,"electrique",[45]],["Electric 65",0,"electrique",[65]]],
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
"byd|atto 3":[["électrique",0,"electrique",[204]]]};
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
const tc=s=>s.replace(/\b\w/g,c=>c.toUpperCase());
function energyOf(m){const t=N(m);
 if(/electrique|electric|bev|kwh|\bev\b|e-208|e-2008|e-3008|e-308|e-5008|elroq|enyaq|id ?[3-7]|ioniq|ev6|ev9|model [3sxy]|recharge|spring|atto|mg4|500e|corsa-e|mokka-e|ë-/.test(t))return "electrique";
 if(/hybrid|hybride|phev|hev|e-tech|etech|plugin|rechargeable|\biv\b|gte|t8|\bb[456]\b/.test(t))return "hybride";
 if(/diesel|tdi|hdi|dci|crdi|cdti|multijet|d-4d|skyactiv-d|blue ?dci|bluehdi|ecoblue/.test(t))return "diesel";
 return "essence";}
function enginesFor(mk,mo){const key=N(mk)+"|"+N(mo);let src=EDB[key],doc=!!src;
 if(!src&&N(mo))for(const k in EDB){const[b,m]=k.split("|");if(b===N(mk)&&(N(mo).startsWith(m)||m.startsWith(N(mo)))){src=EDB[k];doc=true;break;}}
 if(!src)src=POOL[N(mk)]||[];
 return src.map(a=>({m:a[0],cc:a[1],en:a[2],ch:a[3],src:doc?"documenté":"gamme"}));}
function matchEngine(mk,mo,mt){if(!mt)return null;const a=N(mt);
 return enginesFor(mk,mo).find(e=>{const b=N(e.m);if(b===a||a.startsWith(b)||b.startsWith(a))return true;
  const x=a.split(" "),y=b.split(" ");return x[0]===y[0]&&x[1]&&y[1]&&x[1]===y[1];})||null;}
function powersFor(mk,mo,mt){const e=matchEngine(mk,mo,mt);return e?e.ch.slice():[];}
function autoAttribute(){const mk=D("cMarque").value,mo=D("cModele").value,mt=D("cMoteur").value;if(!mt)return;
 const en=energyOf(mt),e=matchEngine(mk,mo,mt),ps=e?e.ch:[];
 D("cEnergie").value=en;if(ps.length&&!ps.includes(+D("cPuiss").value))D("cPuiss").value=ps[0];
 renderPowers();renderAttrib();}
function renderEngines(){const mk=D("cMarque").value,mo=D("cModele").value,w=D("engChips");
 if(!mk||!mo){D("engCount").textContent="0";w.innerHTML='<span class="chips-loading">Sélectionne marque + modèle.</span>';return;}
 const l=enginesFor(mk,mo);D("engCount").textContent=l.length;w.__l=l;
 const ic={essence:"🟡",diesel:"⚫",hybride:"🟢",electrique:"🔵"};
 w.innerHTML=l.length?l.map((e,i)=>`<button type="button" data-eng="${i}">${ic[e.en]||""} ${E(e.m)} · ${e.en} · ${e.ch.join("/")} ch${e.cc?" · "+e.cc+" cm³":""}</button>`).join(""):'<span class="chips-loading">Aucune motorisation documentée.</span>';}
function renderPowers(){const ps=powersFor(D("cMarque").value,D("cModele").value,D("cMoteur").value);
 D("puissCount").textContent=ps.length;
 D("puissChips").innerHTML=ps.length?ps.map(p=>`<button type="button" data-ch="${p}">${p} ch</button>`).join(""):'<span class="chips-loading">Choisis une motorisation.</span>';}
function renderAttrib(){const mk=D("cMarque").value,mo=D("cModele").value,w=D("attribWrap");
 if(!mk||!mo){w.innerHTML="";return;}const l=enginesFor(mk,mo);if(!l.length){w.innerHTML="";return;}
 w.innerHTML=`<h3>🧾 Attribution — ${E(mk)} ${E(mo)}</h3><table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Cylindrée</th><th>Puissances</th><th>Source</th></tr></thead><tbody>`+
 l.map(e=>`<tr><td><b>${E(e.m)}</b></td><td>${e.en}</td><td>${e.cc?e.cc+" cm³":"—"}</td><td>${e.ch.join("/")} ch</td><td><span class="tag ${e.src==="documenté"?"ok":""}">${e.src}</span></td></tr>`).join("")+"</tbody></table>";}

/* ---- juridique ---- */
const LEGAL=[
{id:"vice",t:"Vice caché",pro:false,mots:["vice","cache","panne","defaut","achat","occasion","moteur","boite"],r:"Défaut caché, grave et antérieur à la vente.",rep:["C. civ. 1641, 1644, 1648 : défaut rendant le véhicule impropre à l'usage.","Établir défaut, gravité, caractère caché, antériorité.","Action dans les 2 ans de la découverte.","Restitution du prix ou réduction."],dem:["Signaler par écrit au vendeur.","Diagnostic + expertise contradictoire avant dépose."],pr:["Annonce, contrat","Date de découverte, km","Historique entretien, pièces"],src:"https://www.service-public.fr/particuliers/vosdroits/F11007"},
{id:"conf",t:"Garantie légale de conformité",pro:true,mots:["garantie","conformite","panne","achat","occasion","neuf","defaut","vendeur"],r:"Achat auprès d'un vendeur professionnel uniquement.",rep:["C. conso. L.217-3 et s. : défauts dans les 2 ans.","Présomption 24 mois neuf / 12 mois occasion.","Réparation ou remplacement sans frais, max 30 jours (L.217-10).","Réduction ou résolution (L.217-14)."],dem:["Demande écrite avec justificatifs.","Conserver date de demande et immobilisation."],pr:["Facture, date de délivrance","Caractéristiques annoncées"],src:"https://www.service-public.fr/particuliers/vosdroits/F11094"},
{id:"dol",t:"Dol et dissimulation",pro:false,mots:["dol","mensonge","dissimulation","tromperie","compteur","kilometrage","accident"],r:"Manœuvres ou dissimulation intentionnelle déterminante.",rep:["C. civ. 1137 : intention + caractère déterminant.","Une panne seule ne prouve pas un dol.","1144 : nullité à compter de la découverte."],dem:["Comparer annonce et historique.","Faire examiner avant demande d'annulation."],pr:["Annonce, messages","CT, historique km"],src:"https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036829827"},
{id:"garage",t:"Garage, malfaçons",pro:false,mots:["garage","garagiste","reparation","malfacon","resultat","facture","intervention","atelier"],r:"Réparation défectueuse : responsabilité selon la mission.",rep:["Obligation de résultat ≠ responsabilité automatique.","Mission, défaut, lien, preuves à examiner.","Devis / OR / facture délimitent les travaux."],dem:["Explication écrite + reprise.","Constat contradictoire avant nouvelle réparation.","Médiation après réclamation."],pr:["OR, devis, facture","Symptômes avant/après","Diagnostic indépendant"],src:"https://www.economie.gouv.fr/dgccrf/consommation/Resoudre-un-litige-de-consommation"},
{id:"produit",t:"Incendie & produit défectueux",pro:false,sec:true,mots:["incendie","feu","flamme","brule","sinistre","assurance","expert","expertise","defectueux","securite"],r:"Un incendie lié à un défaut engage le producteur.",rep:["C. civ. 1245 et s. : défaut de sécurité, même sans contrat.","Défaut et lien causal à établir.","Assurance : déclaration sous 5 jours ouvrés (L.113-2).","Ne pas déplacer ni réparer avant constat."],dem:["Sécuriser, photographier.","Déclarer + expertise contradictoire.","Préserver véhicule et pièces.","Mettre en cause le constructeur si défaut documenté."],pr:["Photos avant déplacement","Rapport pompiers","Factures + campagnes VIN","Pièces préservées"],src:"https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006070721/LEGISCTA000006136279/"},
{id:"rappel",t:"Rappel & campagne",pro:false,mots:["rappel","campagne","securite","constructeur","vin","concession"],r:"Campagne = défaut de sécurité connu ; applicabilité VIN déterminante.",rep:["C. conso. L.412-1 / R.412-1 : correction à la charge du professionnel.","Vérifier applicabilité VIN et exécution.","Campagne non exécutée = défaut connu."],dem:["Relever le VIN, interroger le constructeur.","Demander l'exécution gratuite.","Croiser RappelConso / Safety Gate / NHTSA."],pr:["VIN + réponse","N° campagne + preuve","Historique entretien"],src:"https://rappel.conso.gouv.fr/"}];
function legalMatch(c,v){const n=N(c);return LEGAL.filter(f=>!(f.pro&&v!=="professionnel")).map(f=>({f,s:f.mots.filter(m=>n.includes(N(m))).length})).filter(x=>x.s>0).sort((a,b)=>(!!b.f.sec-!!a.f.sec)||(b.s-a.s)).slice(0,5).map(x=>x.f);}
function renderLegal(l){if(!l.length)return '<p class="small">Aucune qualification détectée.</p>';
 return l.map(f=>`<div class="hit"><span class="tag ${f.sec?"crit":"ok"}">${f.t}</span><p class="small">${E(f.r)}</p><details><summary>Repères · démarches · preuves</summary>
 <ul class="small">${f.rep.map(x=>"<li>"+E(x)+"</li>").join("")}</ul><h3>Démarches</h3><ul class="small">${f.dem.map(x=>"<li>"+E(x)+"</li>").join("")}</ul>
 <h3>À conserver</h3><ul class="small">${f.pr.map(x=>"<li>"+E(x)+"</li>").join("")}</ul><a class="small" href="${E(f.src)}" target="_blank" rel="noopener">📎 Source</a></details></div>`).join("");}

/* ---- cache IndexedDB (repli localStorage) ---- */
const IDB={db:null,ok:false,
 open(){return new Promise(r=>{if(this.db)return r(this.db);if(!window.indexedDB)return r(null);
  try{const q=indexedDB.open("kevtf",1);q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains("kv"))d.createObjectStore("kv");};
   q.onsuccess=()=>{this.db=q.result;this.ok=true;r(this.db);};q.onerror=()=>r(null);q.onblocked=()=>r(null);}catch(e){r(null);}});},
 async get(k){const d=await this.open();if(!d){try{return JSON.parse(localStorage.getItem("c:"+k)||"null");}catch(e){return null;}}
  return new Promise(r=>{try{const t=d.transaction("kv").objectStore("kv").get(k);t.onsuccess=()=>r(t.result||null);t.onerror=()=>r(null);}catch(e){r(null);}});},
 async set(k,v){const d=await this.open();if(!d){try{localStorage.setItem("c:"+k,JSON.stringify(v));}catch(e){}return;}
  return new Promise(r=>{try{const t=d.transaction("kv","readwrite").objectStore("kv").set(v,k);t.onsuccess=()=>r();t.onerror=()=>r();}catch(e){r();}});},
 async del(k){const d=await this.open();if(!d){localStorage.removeItem("c:"+k);return;}
  return new Promise(r=>{try{const t=d.transaction("kv","readwrite").objectStore("kv").delete(k);t.onsuccess=()=>r();t.onerror=()=>r();}catch(e){r();}});}};

/* ---- base ---- */
function indexBase(){BASE.forEach(e=>{e._h=N([e.marque,e.modele,e.motorisation,e.systeme,e.defaut,e.mecanisme,(e.consequences||[]).join(" "),(e.symptomes||[]).join(" "),(e.dtc||[]).join(" "),e.campagne].join(" "));});}
function merge(list){const m=new Map();BASE.forEach(e=>m.set(fid(e),e));(list||[]).forEach(e=>{if(e&&e.defaut)m.set(fid(e),e);});BASE=[...m.values()];indexBase();}
function paintStats(){const nb=Object.keys(PHOTOS).reduce((a,k)=>a+PHOTOS[k].length,0);
 D("baseBadge").textContent=`🗄️ ${BASE.length} fiches · ${nb} 📷`;
 D("baseStats").textContent=`${BASE.length} fiches · ${Object.keys(EDB).length} couples moteur documentés · ${nb} photos · ${OVERLAY.entries.length} ajouts admin · cache ${IDB.ok?"IndexedDB":"localStorage"}`;}
function fillFilters(){const ms=[...new Set(BASE.map(e=>(e.marque||"").split("/")[0].trim()).filter(Boolean))].sort();
 D("fMarque").innerHTML='<option value="">Toutes</option>'+ms.map(m=>`<option>${E(m)}</option>`).join("");
 const ss=[...new Set(BASE.map(e=>e.systeme).filter(Boolean))].sort();
 D("fSys").innerHTML='<option value="">Tous</option>'+ss.map(s=>`<option>${E(s)}</option>`).join("");}
async function saveCache(){await IDB.set("base",{ts:Date.now(),entries:BASE.slice(0,4000)});}
async function loadCache(){const c=await IDB.get("base");
 if(c&&Array.isArray(c.entries)&&c.entries.length){merge(c.entries);return c.entries.length;}return 0;}

/* ---- recherche ---- */
function search(q,limit){const t=N(q).split(" ").filter(Boolean);if(!t.length)return BASE.slice(0,limit||30);
 const out=[];for(const e of BASE){if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;
  if(D("fMarque").value&&N(e.marque).indexOf(N(D("fMarque").value))<0)continue;
  if(D("fSys").value&&N(e.systeme)!==N(D("fSys").value))continue;
  if(D("fGrav").value&&e.gravite!==D("fGrav").value)continue;
  let s=0;t.forEach(x=>{if(N(e.defaut).includes(x))s+=3;else if(e._h&&e._h.includes(x))s+=2;});if(s>0)out.push([s,e]);}
 return out.sort((a,b)=>b[0]-a[0]).slice(0,limit||40).map(x=>x[1]);}
function searchVehicles(q){const t=N(q).split(" ").filter(Boolean);if(!t.length)return[];const o=[];
 Object.keys(EDB).forEach(k=>{const[b,m]=k.split("|"),h=b+" "+m;let s=0;
  t.forEach(x=>{if(b.split(" ").includes(x))s+=5;else if(m.split(" ").includes(x))s+=5;else if(h.includes(x))s+=2;});
  if(s>=5)o.push([s,{marque:tc(b),modele:tc(m),engines:enginesFor(b,m)}]);});
 return o.sort((a,b)=>b[0]-a[0]).slice(0,8).map(x=>x[1]);}
function hitCard(e){return `<div class="hit ${e.risque_feu?"feu":""}"><b>${E(e.defaut||"Fiche")}</b>
 <div class="meta">${E(e.marque||"Multi-marques")} · ${E(e.modele||"")} ${E(e.motorisation||"")} ${e.annees?"· "+e.annees[0]+"-"+e.annees[1]:""}</div>
 <div>${(e.themes||[]).includes("incendie")?'<span class="tag feu">🔥 incendie</span>':""}<span class="tag">${E(e.systeme||"général")}</span>${e.gravite==="critique"?'<span class="tag crit">critique</span>':""}${(e.dtc||[]).map(d=>'<span class="tag">'+E(d)+"</span>").join("")}<span class="tag ok">${E(e.source||"")}</span></div>
 ${e.mecanisme?`<p class="small"><b>Mécanisme :</b> ${E(e.mecanisme)}</p>`:""}
 ${(e.consequences||[]).length?`<p class="small"><b>Conséquences :</b> ${E(e.consequences.join(" ; "))}</p>`:""}
 ${e.risque_feu&&e.chaine_feu?`<p class="small">🔥 <b>Chaîne :</b> ${E(e.chaine_feu)}</p>`:""}
 ${e.url?`<a class="small" href="${E(e.url)}" target="_blank" rel="noopener">📎 Source ${E(e.campagne||"")}</a>`:""}</div>`;}
function photoStrip(e){const ph=PHOTOS[fid(e)]||[];if(!ph.length)return "";
 return `<div class="chips" style="margin-top:6px">`+ph.slice(0,4).map(p=>`<img class="thumb" data-lb="${E(p.id)}" src="${E(p.url)}" alt="">`).join("")+
 (ph.length>4?`<span class="tag">+${ph.length-4}</span>`:"")+`<button type="button" data-gal="${E(fid(e))}">🖼️ Photos (${ph.length})</button></div>`;}
function renderResults(){const q=D("q").value.trim(),box=D("results");
 const f=q?search(q):BASE.filter(e=>THEME==="tous"||(e.themes||[]).includes(THEME)).slice(0,25);
 const v=q?searchVehicles(q):[];
 const vh=v.map(x=>`<div class="hit"><b>🚗 ${E(x.marque)} ${E(x.modele)}</b><table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Cylindrée</th><th>Puissances</th></tr></thead><tbody>`+
  x.engines.map(e=>`<tr><td>${E(e.m)}</td><td>${e.en}</td><td>${e.cc?e.cc+" cm³":"—"}</td><td>${e.ch.join("/")} ch</td></tr>`).join("")+
  `</tbody></table><button type="button" class="btn ghost small" data-use="${E(x.marque)}|${E(x.modele)}">➕ Utiliser</button></div>`).join("");
 box.innerHTML=(v.length?`<h3>🚗 Véhicules (${v.length})</h3>`+vh:"")+`<h3>🔧 Pannes &amp; rappels (${f.length})</h3>`+
  (f.length?f.map(e=>`<div data-fid="${E(fid(e))}">${hitCard(e)}${photoStrip(e)}<button type="button" class="btn ghost small" data-cs="${E((e.defaut||"").slice(0,60))}">📷 Photos web</button></div>`).join(""):'<p class="empty">Aucun résultat.</p>');}
function lightbox(s,c){const l=D("lightbox");l.querySelector("img").src=s;D("lbCap").textContent=c||"";l.classList.add("open");}

/* ---- prédiction ---- */
function suggest(inp,prov){if(!inp||inp.__sg)return;inp.__sg=true;
 const w=document.createElement("div");w.className="sg-wrap";inp.parentNode.insertBefore(w,inp);w.appendChild(inp);
 const l=document.createElement("div");l.className="sg-list";l.style.display="none";w.appendChild(l);
 const open=()=>{let it=[];try{it=prov().slice(0,12);}catch(e){}if(!it.length){l.style.display="none";return;}
  l.innerHTML=it.map((x,i)=>`<div data-i="${i}">${E(x.label)}${x.hint?` <span style="color:#93a0d6;font-size:.66rem">${E(x.hint)}</span>`:""}</div>`).join("");
  l.__i=it;l.style.display="block";};
 inp.addEventListener("focus",open);inp.addEventListener("click",open);inp.addEventListener("input",open);
 l.addEventListener("mousedown",ev=>{const d=ev.target.closest("[data-i]");if(!d)return;ev.preventDefault();
  inp.value=l.__i[+d.dataset.i].value;l.style.display="none";inp.dispatchEvent(new Event("change",{bubbles:true}));});
 inp.addEventListener("blur",()=>setTimeout(()=>l.style.display="none",160));}
function wirePredictive(){
 suggest(D("cMarque"),()=>{const c=N(D("cMarque").value);return BRANDS.filter(b=>!c||b.includes(c)).map(b=>({value:tc(b),label:tc(b),hint:(MODELS[b]||[]).length+" modèles"}));});
 suggest(D("cModele"),()=>{const b=N(D("cMarque").value),c=N(D("cModele").value);
  const l=MODELS[b]||Object.keys(MODELS).filter(k=>!b||k.includes(b)).flatMap(k=>MODELS[k]);
  return [...new Set(l)].filter(m=>!c||m.includes(c)).map(m=>({value:tc(m),label:tc(m)}));});
 suggest(D("cMoteur"),()=>{const l=enginesFor(D("cMarque").value,D("cModele").value),c=N(D("cMoteur").value);
  const ic={essence:"🟡",diesel:"⚫",hybride:"🟢",electrique:"🔵"};
  return l.filter(e=>!c||N(e.m).includes(c)).map(e=>({value:e.m,label:`${ic[e.en]} ${e.m} · ${e.en} · ${e.ch.join("/")} ch${e.cc?" · "+e.cc+" cm³":""}`,hint:e.src}));});
 suggest(D("cPuiss"),()=>powersFor(D("cMarque").value,D("cModele").value,D("cMoteur").value).map(p=>({value:String(p),label:p+" ch",hint:Math.round(p/1.35962)+" kW"})));
 suggest(D("q"),()=>{const c=N(D("q").value);if(c.length<2)return[];const s=new Set();
  BRANDS.forEach(b=>s.add(tc(b)));Object.values(MODELS).flat().forEach(m=>s.add(tc(m)));
  BASE.slice(0,2000).forEach(e=>{(e.dtc||[]).forEach(d=>s.add(d));if(e.systeme)s.add(e.systeme);});
  return [...s].filter(x=>N(x).includes(c)).slice(0,10).map(x=>({value:x,label:x}));});
 const feed=(ta,ch)=>{ta.addEventListener("input",()=>{const w=N(ta.value).split(" "),last=w[w.length-1]||"";
  if(last.length<3){ch.innerHTML="";return;}const s=new Set();
  BASE.slice(0,1500).forEach(e=>N(e.defaut+" "+e.systeme).split(" ").forEach(x=>{if(x.startsWith(last)&&x!==last)s.add(x);}));
  ch.innerHTML=[...s].slice(0,5).map(x=>`<button type="button" data-w="${E(x)}">${E(x)} ⏎</button>`).join("");});
  ch.addEventListener("click",e=>{const b=e.target.closest("[data-w]");if(!b)return;ta.value=ta.value.replace(/[\wÀ-ÿ-]+$/,b.dataset.w)+" ";ta.focus();});};
 feed(D("ctx"),D("predCtx"));feed(D("msgTexte"),D("predMsg"));
 D("ctx").addEventListener("input",()=>{const n=N(D("ctx").value);
  SYMPT.forEach(s=>{if(n.includes(N(s).split(" ")[0])){const cb=[...D("qcm").querySelectorAll("input")].find(i=>i.value===s);if(cb)cb.checked=true;}});
  const dtc=(D("ctx").value.toUpperCase().match(/[PCBU]\d{4}/g)||[]);
  if(dtc.length&&!D("cDtc").value){D("cDtc").value=[...new Set(dtc)].join(", ");D("dtcLu").checked=true;D("cDtc").classList.remove("hidden");}
  const h=hyp(getVeh(),n.split(" ").filter(t=>t.length>3),dtc,[...D("qcm").querySelectorAll("input:checked")].map(i=>i.value)).slice(0,3);
  D("liveCorr").innerHTML=h.length?'<b style="color:var(--amber)">🔎 Corrélations :</b> '+h.map(x=>`<span class="tag ${x.e.risque_feu?"feu":""}">${E(x.e.defaut.slice(0,44))} · ${x.s}</span>`).join(""):"";});}

/* ---- expertise ---- */
function getVeh(){return{marque:D("cMarque").value.trim(),modele:D("cModele").value.trim(),moteur:D("cMoteur").value.trim(),puiss:+D("cPuiss").value||0,annee:+D("cAnnee").value||0,energie:D("cEnergie").value};}
function matchVehicle(e,v){let s=0;
 if(v.marque&&N(e.marque).includes(N(v.marque)))s+=4;else if(v.marque&&e.marque&&!/multi/i.test(e.marque))return -1;
 if(v.modele){const m=N(e.modele);if(m&&m.includes(N(v.modele)))s+=4;else if(m&&!/tous|multi/i.test(m))s-=2;}
 if(v.moteur&&N(e.motorisation).includes(N(v.moteur).split(" ")[0]))s+=3;
 if(v.annee&&e.annees)s+=(v.annee>=e.annees[0]&&v.annee<=e.annees[1])?3:-3;
 if(v.puiss&&Array.isArray(e.puissance_ch)&&v.puiss>=e.puissance_ch[0]*.9&&v.puiss<=e.puissance_ch[1]*1.1)s+=2;
 if(v.energie&&e.energie&&e.energie!==v.energie)s-=2;return s;}
function hyp(v,toks,dtcs,syms){const o=[];
 BASE.forEach(e=>{if(THEME!=="tous"&&!(e.themes||[]).includes(THEME))return;let s=matchVehicle(e,v);if(s<0)return;s*=2;const why=[];
  if(s>=8)why.push("véhicule concordant");
  (dtcs||[]).forEach(d=>{if((e.dtc||[]).includes(d)){s+=8;why.push("DTC "+d);}});
  (syms||[]).forEach(y=>{if((e.symptomes||[]).some(x=>N(x).includes(N(y)))||N(e.defaut).includes(N(y)))s+=3;});
  (toks||[]).forEach(t=>{if(N(e.defaut).includes(t))s+=2;else if(e._h&&e._h.includes(t))s+=1;});
  if(e.type==="rappel"||e.campagne){s+=5;why.push("campagne officielle");}
  if(s>=6)o.push({e,s,why});});
 return o.sort((a,b)=>b.s-a.s).slice(0,10);}
function conf(t){const s=t.s;let lvl,crit;
 if(s>=20&&t.why.some(w=>/DTC/.test(w))&&t.why.some(w=>/campagne/.test(w))){lvl="CERTAIN";crit="DTC + campagne officielle + véhicule concordant.";}
 else if(s>=14){lvl="PROBABLE";crit="Faisceau cohérent ; à confirmer par mesure.";}
 else if(s>=8){lvl="POSSIBLE";crit="Mécanisme plausible ; preuves partielles.";}
 else{lvl="INDÉTERMINÉ";crit="Données insuffisantes ; expertise physique requise.";}
 return{lvl,crit,pct:Math.max(5,Math.min(95,Math.round(s/25*100)))};}
function fireAnalysis(v,h){const sp=h.filter(x=>x.e.risque_feu).map(x=>x.e);
 const doc=BASE.filter(e=>e.risque_feu&&/multi/i.test(e.marque||"")&&(!v.energie||!e.energie||e.energie===v.energie)).slice(0,6);
 const lvl=sp.some(e=>e.type==="rappel")?"hi":sp.length?"mid":"low";
 const txt=lvl==="hi"?"ÉLEVÉ — rappel incendie concordant":lvl==="mid"?"MODÉRÉ — chaînes documentées":"GÉNÉRIQUE — doctrine applicable";
 let s=`<div class="firebox"><h3>🔥 Analyse incendie — ${E(v.marque)} ${E(v.modele)} ${E(v.moteur)}</h3><p><span class="lvl ${lvl}">${txt}</span></p>`;
 if(sp.length)s+=sp.slice(0,5).map(e=>`<div class="hit feu"><b>${E(e.defaut)}</b><p class="small">⛓️ ${E(e.chaine_feu||e.mecanisme||"")}</p></div>`).join("");
 if(doc.length)s+=`<details><summary class="small" style="cursor:pointer;color:var(--acc)">Doctrine (${doc.length})</summary>`+doc.map(e=>`<div class="hit feu"><b>${E(e.defaut)}</b><p class="small">${E(e.mecanisme||"")}</p></div>`).join("")+"</details>";
 return s+`<p class="small">Ne préjuge pas de l'origine réelle ; expertise physique nécessaire.</p></div>`;}
function quotaUse(){if(isAdmin)return{ok:true,left:"∞"};
 let q=JSON.parse(localStorage.getItem("kevo_quota")||'{"debut":0,"n":0}');const now=Date.now();
 if(now-q.debut>=7*864e5)q={debut:now,n:0};
 if(q.n>=5)return{ok:false,left:0,reset:q.debut+7*864e5};
 q.n++;localStorage.setItem("kevo_quota",JSON.stringify(q));return{ok:true,left:5-q.n};}
function updQuota(){if(isAdmin){D("quotaBadge").textContent="🎟️ admin ∞";return;}
 const q=JSON.parse(localStorage.getItem("kevo_quota")||'{"debut":0,"n":0}');D("quotaBadge").textContent="🎟️ "+Math.max(0,5-q.n)+"/5";}
function analyserContexte(){const ctx=D("ctx").value.trim();if(!ctx){toast("Décris la situation.");return;}
 const q=quotaUse();updQuota();if(!q.ok){toast("🚫 Quota atteint (5/7 j).");return;}
 const v=getVeh(),vd=D("cVendeur").value,toks=N(ctx).split(" ").filter(t=>t.length>3);
 const dtcs=[...new Set([...(ctx.toUpperCase().match(/[PCBU]\d{4}/g)||[]),...(D("cDtc").value.toUpperCase().match(/[PCBU]\d{4}/g)||[])])];
 const syms=[...D("qcm").querySelectorAll("input:checked")].map(i=>i.value);
 const h=hyp(v,toks,dtcs,syms),top=h[0],c=top?conf(top):{lvl:"INDÉTERMINÉ",crit:"Aucune hypothèse.",pct:5};
 const feu=/incendie|feu|flamme|sinistre/.test(N(ctx))||(top&&top.e.risque_feu);
 const legal=legalMatch(ctx,vd),eng=enginesFor(v.marque,v.modele);
 let s=`<div class="card"><h2>🧾 Compte rendu d'expertise — ${new Date().toLocaleString("fr-FR")}</h2>
 <h3>1. Identification</h3><table><tbody><tr><th>Véhicule</th><td><b>${E(v.marque)} ${E(v.modele)}</b></td></tr>
 <tr><th>Motorisation</th><td>${E(v.moteur||"—")}</td></tr><tr><th>Puissance / Énergie</th><td>${v.puiss||"—"} ch · ${E(v.energie||"—")}</td></tr>
 <tr><th>Millésime</th><td>${v.annee||"—"}</td></tr><tr><th>Vendeur</th><td>${E(vd)}</td></tr>
 <tr><th>Symptômes</th><td>${E(syms.join(", ")||"—")}</td></tr><tr><th>DTC</th><td>${dtcs.join(", ")||"—"}</td></tr></tbody></table>
 <h3>2. Origine la plus probable</h3>`;
 if(top)s+=`<div class="hit ${top.e.risque_feu?"feu":""}"><span class="tag ${c.lvl==="CERTAIN"?"ok":c.lvl==="PROBABLE"?"info":"crit"}">${c.lvl} · ${c.pct}%</span> <b>${E(top.e.defaut)}</b>
  <div class="meta">${E(top.e.source)} ${E(top.e.campagne||"")}</div><p class="small"><b>Critère :</b> ${E(c.crit)}</p>
  <p class="small"><b>Concordances :</b> ${top.why.map(E).join(" · ")||"termes du contexte"}</p>
  <p class="small"><b>Chaîne :</b> ${E(top.e.mecanisme||"—")} → ${E((top.e.consequences||[]).join(" ; ")||"—")}</p>${photoStrip(top.e)}</div>`;
 else s+='<p class="small">Aucune hypothèse concordante.</p>';
 if(h.length>1)s+=`<h3>3. Diagnostic différentiel</h3><table><tbody>`+h.slice(1,5).map((x,i)=>`<tr><td>${i+2}</td><td>${E(x.e.defaut.slice(0,70))}</td><td>${x.s}</td></tr>`).join("")+"</tbody></table>";
 if(feu)s+=`<h3>4. Volet incendie</h3>`+fireAnalysis(v,h);
 s+=`<h3>${feu?"5":"4"}. Qualification juridique</h3>`+renderLegal(legal);
 if(eng.length)s+=`<h3>Motorisations attribuées</h3><table><tbody>`+eng.map(e=>`<tr><td>${E(e.m)}</td><td>${e.en}</td><td>${e.ch.join("/")} ch</td></tr>`).join("")+"</tbody></table>";
 s+=`<h3>Plan d'action &amp; preuves</h3><ul class="small">`+[...new Set(legal.flatMap(f=>f.dem).concat(["Conserver factures, annonce, contrat, historique","Diagnostic écrit avant réparation","Lecture OBD horodatée","Réclamation écrite puis expertise contradictoire"]))].slice(0,10).map(x=>"<li>"+E(x)+"</li>").join("")+`</ul>
 <p class="small">⚠️ Aide documentaire ; ne remplace ni expertise physique ni consultation juridique.</p>
 <div class="no-print"><button type="button" class="btn ghost" id="crPrint">🖨️ PDF</button><button type="button" class="btn ghost" id="crJson">📤 JSON</button></div></div>`;
 D("ctxReport").innerHTML=s;
 D("crPrint").onclick=()=>window.print();
 D("crJson").onclick=()=>dl("compte-rendu.json",JSON.stringify({date:new Date().toISOString(),vehicule:v,contexte:ctx,niveau:c,origine:top?top.e:null},null,1));
 toast("🧾 Compte rendu généré ("+c.lvl+").");}
function analyserEtude(){const v=getVeh();if(!v.marque&&!v.modele){toast("Renseigne le véhicule.");return;}
 const syms=[...D("qcm").querySelectorAll("input:checked")].map(i=>i.value);
 const dtcs=(D("cDtc").value.toUpperCase().match(/[PCBU]\d{4}/g)||[]);
 const h=hyp(v,N(D("ctx").value).split(" ").filter(t=>t.length>3),dtcs,syms),top=h[0],c=top?conf(top):{lvl:"INDÉTERMINÉ",pct:5,crit:"—"};
 const rap=h.filter(x=>x.e.type==="rappel").map(x=>x.e),pan=h.filter(x=>x.e.type!=="rappel").map(x=>x.e);
 D("rapport").innerHTML=`<div class="card"><h2>📋 Étude — ${E(v.marque)} ${E(v.modele)} ${E(v.moteur)}</h2>
 <h3>🎯 Origine</h3><div class="hit"><span class="tag ${c.lvl==="CERTAIN"?"ok":"info"}">${c.lvl} · ${c.pct}%</span> <b>${E(top?top.e.defaut:"Indéterminé")}</b><p class="small">${E(c.crit)}</p></div>
 <h3>1️⃣ Rappels (${rap.length})</h3>${rap.map(e=>hitCard(e)+photoStrip(e)).join("")||'<p class="small">Aucun.</p>'}
 <h3>2️⃣ Pannes connues (${pan.length})</h3>${pan.map(e=>hitCard(e)+photoStrip(e)).join("")||'<p class="small">Aucune.</p>'}
 ${fireAnalysis(v,h)}</div>`;
 const hi=JSON.parse(localStorage.getItem("histo")||"[]");hi.unshift({date:new Date().toLocaleString("fr-FR"),v,niveau:c.lvl});
 localStorage.setItem("histo",JSON.stringify(hi.slice(0,20)));renderHisto();}
function renderHisto(){const h=JSON.parse(localStorage.getItem("histo")||"[]");
 D("histo").innerHTML=h.length?h.map(x=>`<div class="hit"><b>${E(x.v.marque)} ${E(x.v.modele)}</b> <span class="small">${E(x.date)} — ${E(x.niveau)}</span></div>`).join(""):'<p class="small">Aucune étude.</p>';}

/* ---- photos ---- */
function loadImg(s){return new Promise((r,j)=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>r(i);i.onerror=j;i.src=s;});}
async function compress(src,mw,q){mw=mw||1000;q=q||.72;const im=typeof src==="string"?await loadImg(src):src;
 const sc=Math.min(1,mw/im.width),c=document.createElement("canvas");c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);
 c.getContext("2d").drawImage(im,0,0,c.width,c.height);let u=c.toDataURL("image/jpeg",q);
 while(u.length*.75>170000&&q>.3){q-=.08;u=c.toDataURL("image/jpeg",q);}return u;}
function addPending(s,c){PENDING.push({id:"ph-"+hash(s+Date.now()+PENDING.length),src:s,cap:c||"",ts:Date.now()});renderPending();}
async function intakeFiles(fl,c){for(const f of fl){if(!/^image\//.test(f.type))continue;addPending(await compress(f),c||f.name);}}
function renderPending(){const w=D("paPending");
 w.innerHTML=PENDING.length?PENDING.map((p,i)=>`<span style="position:relative;display:inline-block;margin:3px"><img class="thumb" src="${E(p.src)}"><button type="button" data-rm="${i}" style="position:absolute;top:-6px;right:-6px;border:0;border-radius:50%;background:#ff1744;color:#fff;width:18px;height:18px;cursor:pointer">✕</button></span>`).join(""):'<span class="chips-loading">Aucune photo en attente.</span>';
 w.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{PENDING.splice(+b.dataset.rm,1);renderPending();});}
function renderFaultPicker(){const q=N(D("paFaultQ").value);
 const l=BASE.filter(e=>!q||N(e.defaut+" "+e.marque+" "+e.modele).includes(q)).slice(0,60);
 D("paFault").innerHTML='<option value="__new__">➕ Créer une NOUVELLE panne…</option>'+l.map(e=>`<option value="${E(fid(e))}">${E((e.defaut||"").slice(0,64))} · ${E(e.marque||"")}</option>`).join("");}
function readNewFault(){const g=i=>D(i).value,feu=D("paFeu").checked,ch=(g("paCh").match(/\d{2,4}/g)||[]).map(Number),yr=(g("paAnnees").match(/\d{4}/g)||[]).map(Number);
 return{id:"admin-"+Date.now(),themes:["technique"].concat(feu?["incendie"]:[]),type:"panne",source:"admin",marque:g("paMarque")||"Multi-marques",
  modele:g("paModele")||"Tous",motorisation:g("paMoteur"),annees:yr.length?[Math.min(...yr),Math.max(...yr)]:null,energie:g("paEnergie")||energyOf(g("paMoteur")),
  systeme:g("paSys"),dtc:(g("paDtc").toUpperCase().match(/[PCBU]\d{4}/g)||[]),symptomes:arr(g("paSympt").replace(/,/g,"\n")),defaut:g("paTitre")||"Nouvelle panne",
  mecanisme:g("paMeca"),consequences:arr(g("paConseq")),indices:arr(g("paIndices")),risque_feu:feu,chaine_feu:feu?g("paChaine"):"",gravite:g("paGrav"),
  campagne:"",url:g("paUrlSrc"),puissance_ch:ch.length?ch:null,date:new Date().toISOString().slice(0,10)};}
function saveOverlay(){localStorage.setItem("kevo_manual",JSON.stringify(OVERLAY));
 PHOTOS={};OVERLAY.photos.forEach(p=>{(PHOTOS[p.fault]=PHOTOS[p.fault]||[]).push(p);});}
function attachPending(){if(!PENDING.length){toast("Ajoute des photos.");return;}
 let t=D("paFault").value;
 if(t==="__new__"){const nf=readNewFault();if(!nf.defaut){toast("Titre requis.");return;}OVERLAY.entries.push(nf);t=nf.id;merge([nf]);}
 PENDING.forEach(p=>OVERLAY.photos.push({id:p.id,fault:t,url:p.src,cap:p.cap,ts:p.ts}));
 const n=PENDING.length;PENDING=[];saveOverlay();renderPending();renderResults();renderAdminPhotos();paintStats();saveCache();
 toast("✅ "+n+" photo(s) rattachée(s).");}
function renderAdminPhotos(){const k=Object.keys(PHOTOS);
 D("paList").innerHTML=k.length?k.slice(0,40).map(id=>{const f=BASE.find(e=>fid(e)===id);
  return `<div class="hit"><b>${E(f?f.defaut:id)}</b><div class="meta">${PHOTOS[id].length} photo(s)</div><div class="chips">${PHOTOS[id].slice(0,8).map(p=>`<img class="thumb" data-lb="${E(p.id)}" src="${E(p.url)}">`).join("")}</div></div>`;}).join(""):'<p class="small">Aucune photo rattachée.</p>';}
const TERM=[[/courroie|distribution/,"timing belt damage delamination"],[/chaine|chaîne/,"timing chain wear"],[/turbo/,"turbocharger failure"],[/egr/,"EGR cooler leak"],[/fap|cataly/,"DPF filter clogged"],[/adblue|scr/,"AdBlue crystallization injector"],[/inject/,"fuel injector coking"],[/batterie|12v/,"car battery corrosion"],[/haute tension|pack ht/,"EV high voltage battery damage"],[/faisceau|alternat/,"wiring harness burnt"],[/frein/,"brake disc overheated"],[/huile|lubrif/,"engine oil leak"],[/incendie|feu/,"car engine fire damage"],[/surchauffe/,"engine overheating damage"]];
function enQuery(f){const t=N((f.systeme||"")+" "+(f.defaut||""));for(const[r,q]of TERM)if(r.test(t))return q;return "car engine component damage";}
async function commons(q){try{const r=await fetchT("https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch="+encodeURIComponent(q)+"&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=480",8000);
 if(!r.ok)return[];const j=await r.json(),p=j&&j.query&&j.query.pages;if(!p)return[];
 return Object.values(p).map(x=>{const i=x.imageinfo&&x.imageinfo[0];if(!i||!i.thumburl)return null;const md=i.extmetadata||{};
  return{thumb:i.thumburl,page:i.descriptionurl,title:(x.title||"").replace(/^File:/,""),lic:(md.LicenseShortName&&md.LicenseShortName.value)||""};}).filter(Boolean);}catch(e){return[];}}
async function showFaultGallery(f){const out=D("photoOut"),box=document.createElement("div");box.className="hit";out.prepend(box);
 const ph=PHOTOS[fid(f)]||[];
 box.innerHTML=`<h3>🖼️ ${E((f.defaut||"").slice(0,90))}</h3><p class="small">${E(f.marque||"")} ${E(f.modele||"")} ${E(f.motorisation||"")}</p>
 <h3>📌 Photos intégrées (${ph.length})</h3>`+(ph.length?`<div class="ph-grid">`+ph.map(p=>`<figure class="ph-item" data-lb="${E(p.id)}"><img src="${E(p.url)}" loading="lazy"><figcaption>${E(p.cap||"photo admin")}</figcaption></figure>`).join("")+"</div>":'<p class="small">Aucune photo locale.</p>')+
 `<h3>🌐 Photos web</h3><p class="small" id="cw">⏳ recherche…</p>`;
 const res=await commons(enQuery(f)),cw=box.querySelector("#cw");
 if(cw)cw.outerHTML=res.length?`<div class="ph-grid">`+res.map(x=>`<figure class="ph-item" data-web="${E(x.thumb)}" data-page="${E(x.page||"")}"><img src="${E(x.thumb)}" loading="lazy"><figcaption>${E(x.title.slice(0,40))}</figcaption></figure>`).join("")+"</div>":'<p class="small">Aucune photo libre trouvée.</p>';}
function runPhotoSearch(){const q=D("photoQ").value.trim();if(!q)return;const l=search(q,4);
 D("photoOut").innerHTML=l.length?"":'<p class="small">Aucune panne correspondante.</p>';l.forEach(f=>showFaultGallery(f));}

/* ---- VIN ---- */
const WMI={VF1:"Renault",VF3:"Peugeot",VF7:"Citroën",VR1:"Peugeot",VR3:"Peugeot",VR7:"Citroën",UU1:"Dacia",WVW:"Volkswagen",WV1:"Volkswagen",WV2:"Volkswagen",WAU:"Audi",TRU:"Audi",TMB:"Skoda",VSS:"SEAT",WBA:"BMW",WBS:"BMW",WBY:"BMW",WDB:"Mercedes-Benz",WDD:"Mercedes-Benz",W1K:"Mercedes-Benz",WMW:"Mini",WP0:"Porsche",WP1:"Porsche",SAJ:"Jaguar",SAL:"Land Rover",WF0:"Ford",W0L:"Opel",W0V:"Opel",ZFA:"Fiat",ZAR:"Alfa Romeo",JTD:"Toyota",SB1:"Toyota",VNK:"Toyota",JHM:"Honda",SHH:"Honda",JN1:"Nissan",SJN:"Nissan",VSK:"Nissan",KMH:"Hyundai",KM8:"Hyundai",KNA:"Kia",KNE:"Kia",JMZ:"Mazda",JM1:"Mazda",JF1:"Subaru",JF2:"Subaru",JSA:"Suzuki",JS3:"Suzuki",5YJ:"Tesla",7SA:"Tesla",LRW:"Tesla",YV1:"Volvo",YV2:"Volvo",LYV:"Volvo",1G1:"Chevrolet",1C4:"Jeep",1J4:"Jeep",LGX:"BYD",LSJ:"MG",WME:"Smart",9BW:"Volkswagen",8A1:"Renault",TMA:"Hyundai",U5Y:"Kia"};
const YC={A:[1980,2010],B:[1981,2011],C:[1982,2012],D:[1983,2013],E:[1984,2014],F:[1985,2015],G:[1986,2016],H:[1987,2017],J:[1988,2018],K:[1989,2019],L:[1990,2020],M:[1991,2021],N:[1992,2022],P:[1993,2023],R:[1994,2024],S:[1995,2025],T:[1996,2026],V:[1997,2027],W:[1998,2028],X:[1999,2029],Y:[2000,2030],1:[2001],2:[2002],3:[2003],4:[2004],5:[2005],6:[2006],7:[2007],8:[2008],9:[2009]};
const TR={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9},VW=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
function vinCheck(v){if(v.length!==17)return{ok:false,why:"longueur ≠ 17"};if(/[IOQ]/.test(v))return{ok:false,why:"I, O, Q interdits"};
 let s=0;for(let i=0;i<17;i++){const c=v[i],n=c>="0"&&c<="9"?+c:TR[c];if(n==null)return{ok:false,why:"caractère invalide"};s+=n*VW[i];}
 const r=s%11,cd=r===10?"X":String(r);return{ok:cd===v[8],why:cd===v[8]?"chiffre de contrôle valide":"attendu "+cd+", lu "+v[8]};}
const RURL={peugeot:"https://www.peugeot.fr/services-et-engagements/rappels-vehicules.html",citroen:"https://www.citroen.fr/services-et-engagements/rappels-vehicules.html",renault:"https://www.renault.fr/services/rappels-vehicules.html",dacia:"https://www.dacia.fr/services/rappels-vehicules.html",volkswagen:"https://www.volkswagen.fr/fr/informations-utiles/campagnes-de-rappel.html",audi:"https://www.audi.fr/fr/fr/company/rappels.html",skoda:"https://www.skoda.fr/services/rappels/",bmw:"https://www.bmw.fr/fr/topics/offres-et-services/apres-vente/rappel-bmw.html","mercedes-benz":"https://www.mercedes-benz.fr/passengercars/being-an-owner/campaigns.html",toyota:"https://www.toyota.fr/services/rappels",tesla:"https://www.tesla.com/vin-recall-search",ford:"https://www.ford.fr/support/rappels/",opel:"https://www.opel.fr/services/rappels.html",hyundai:"https://www.hyundai.com/fr/fr/e-services/rappels.html",kia:"https://www.kia.com/fr/services/rappels/"};
async function runVin(){const raw=D("vinInput").value.trim().toUpperCase(),out=D("vinOut");if(!raw)return;
 const v=vinCheck(raw),mk=WMI[raw.slice(0,3)]||WMI[raw.slice(0,2)]||"",yc=YC[raw[9]],ref=new Date().getFullYear();
 const year=yc?(yc.length===1?yc[0]:(ref>=yc[1]-1?yc[1]:yc[0])):0;
 D("vinState").textContent=v.ok?"VIN valide":"à vérifier";D("vinState").className="badge "+(v.ok?"live":"warnb");
 const kv=(l,x)=>`<div><b>${E(l)}</b>${E(x||"—")}</div>`;
 out.innerHTML=`<h3>1. Décodage</h3><p class="small">${v.ok?"✅":"⚠️"} ${E(v.why)}</p><div class="vin-kv">${kv("WMI",raw.slice(0,3))}${kv("Marque",mk)}${kv("Millésime",year)}</div><p class="small">⏳ Sources officielles (8 s max)…</p>`;
 let make=mk,model="",yr=year,fuel="",disp="";
 const vp=await jget("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/"+encodeURIComponent(raw)+"?format=json",8000);
 const d=vp&&vp.Results&&vp.Results[0];
 if(d){make=d.Make||make;model=d.Model||"";yr=+(d.ModelYear||0)||yr;fuel=d.FuelTypePrimary||"";disp=d.DisplacementL||"";}
 let us=[];if(make&&model&&yr){const j=await jget(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${yr}`,8000);us=(j&&j.results)||[];}
 const loc=BASE.filter(e=>e.type==="rappel"&&N(e.marque).includes(N(make))&&(!model||N(e.modele).includes(N(model)))&&(!yr||(e.annees&&yr>=e.annees[0]&&yr<=e.annees[1]))).slice(0,8);
 let h=`<h3>1. Décodage</h3><p class="small">${v.ok?"✅":"⚠️"} ${E(v.why)}</p><div class="vin-kv">${kv("Marque",make)}${kv("Modèle",model)}${kv("Millésime",yr)}${kv("Cylindrée",disp?disp+" L":"")}${kv("Carburant",fuel)}</div>
 <h3>2. Campagnes</h3><p class="small"><b>🇺🇸 NHTSA :</b> ${us.length}</p>`+
 us.map(r=>`<div class="hit ${/fire|flamm/i.test((r.Summary||"")+(r.Consequence||""))?"feu":""}"><b>${E(r.NHTSACampaignNumber)}</b> · ${E(r.ReportReceivedDate||"")}${r.parkIt?' <span class="tag crit">PARK IT</span>':""}<p class="small">${E(r.Component||"")}</p><p class="small">${E((r.Summary||"").slice(0,260))}</p></div>`).join("")+
 `<p class="small"><b>🇫🇷/🇪🇺 Base locale :</b> ${loc.length}</p>`+loc.map(e=>hitCard(e)).join("")+
 `<h3>3. Statut de ce VIN</h3><p class="small">Publié uniquement par le constructeur.</p>
 <button type="button" class="btn green" id="vinBrand">🏭 Page rappels ${E(make||"constructeur")}</button>
 <button type="button" class="btn ghost" id="vinFill">🚗 Remplir le sélecteur</button>`;
 out.innerHTML=h;
 const url=RURL[N(make).replace(/ /g,"-")]||RURL[N(make)]||("https://www.google.com/search?q="+encodeURIComponent(make+" rappel campagne VIN officiel"));
 D("vinBrand").onclick=async()=>{try{await navigator.clipboard.writeText(raw);}catch(e){}window.open(url,"_blank","noopener");toast("📋 VIN copié.");};
 D("vinFill").onclick=()=>{if(make)D("cMarque").value=tc(make.toLowerCase());if(model)D("cModele").value=model;if(yr)D("cAnnee").value=yr;
  if(fuel)D("cEnergie").value=/electric/i.test(fuel)?"electrique":/diesel/i.test(fuel)?"diesel":/hybrid/i.test(fuel)?"hybride":"essence";
  renderEngines();renderPowers();renderAttrib();toast("✅ Sélecteur pré-rempli.");};}

/* ---- OBD ---- */
let obdW=null,obdBuf="";const UUID="0000fff0-0000-1000-8000-00805f9b34fb";
async function obdSend(c,w){obdBuf="";await obdW.writeValue(new TextEncoder().encode(c+"\r"));const t=Date.now();
 while(Date.now()-t<w&&obdBuf.indexOf(">")<0)await sleep(60);return obdBuf;}
function decodeDTC(h){const b=h.trim().split(/\s+/).map(x=>parseInt(x,16)).filter(n=>!isNaN(n)),i=b.findIndex(x=>x===0x43||x===0x47);if(i<0)return[];
 const o=[];for(let k=i+1;k+1<b.length;k+=2){const a=b[k],c=b[k+1];if(!a&&!c)continue;o.push("PCBU"[(a>>6)&3]+((a>>4)&3)+(a&15).toString(16).toUpperCase()+(c>>4).toString(16).toUpperCase()+(c&15).toString(16).toUpperCase());}return o;}
async function obdConnect(){if(!navigator.bluetooth){D("obdStatus").textContent="Web Bluetooth indisponible (Chrome Android requis).";return;}
 try{const dev=await navigator.bluetooth.requestDevice({filters:[{services:[UUID]}],optionalServices:["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]});
  const srv=await dev.gatt.connect();let svc;try{svc=await srv.getPrimaryService(UUID);}catch(e){svc=(await srv.getPrimaryServices())[0];}
  const chs=await svc.getCharacteristics(),n=chs.find(c=>c.properties.notify||c.properties.indicate);
  obdW=chs.find(c=>c.properties.write||c.properties.writeWithoutResponse);await n.startNotifications();
  n.addEventListener("characteristicvaluechanged",ev=>{obdBuf+=new TextDecoder().decode(ev.target.value);});
  D("obdStatus").textContent="✅ Connecté : "+dev.name;D("btnObdRead").disabled=false;
  for(const c of["ATZ","ATE0","ATL0","ATSP0"])await obdSend(c,900);}catch(e){D("obdStatus").textContent="❌ "+e.message;}}
async function obdRead(){D("obdStatus").textContent="⏳ Lecture…";const a=await obdSend("03",2500),b=await obdSend("07",2500);
 const codes=[...new Set(decodeDTC(a).concat(decodeDTC(b)))];
 D("obdResult").innerHTML=codes.length?codes.map(c=>{const e=BASE.find(x=>(x.dtc||[]).includes(c));return `<div class="hit"><b>${c}</b><p class="small">${E(e?e.defaut:"Code absent de la base.")}</p></div>`;}).join(""):'<p class="small">Aucun code.</p>';
 if(codes.length){D("dtcLu").checked=true;D("cDtc").classList.remove("hidden");D("cDtc").value=codes.join(", ");}}

/* ---- sync ---- */
const AD={
 kvdb:{name:"kvdb.io",keys:true,
  create:async()=>{const r=await fetchT("https://kvdb.io/",6000,{method:"POST",body:""});if(!r.ok)throw new Error("HTTP "+r.status);return (await r.text()).trim().split("/").pop();},
  read:async c=>{const r=await fetchT("https://kvdb.io/"+c+"/kevtf",6000);if(r.status===404)return null;if(!r.ok)throw new Error("HTTP "+r.status);const t=await r.text();return t?JSON.parse(t):null;},
  write:async(c,o)=>(await fetchT("https://kvdb.io/"+c+"/kevtf",8000,{method:"PUT",headers:{"Content-Type":"text/plain"},body:JSON.stringify(o)})).ok,
  putPhoto:async(c,i,d)=>(await fetchT("https://kvdb.io/"+c+"/ph_"+i,8000,{method:"PUT",headers:{"Content-Type":"text/plain"},body:d})).ok,
  getPhoto:async(c,i)=>{const r=await fetchT("https://kvdb.io/"+c+"/ph_"+i,8000);return r.ok?await r.text():null;}},
 restful:{name:"restful-api.dev",keys:false,
  create:async()=>{const r=await fetchT("https://api.restful-api.dev/objects",8000,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"kevtf",state:{}})});if(!r.ok)throw new Error("HTTP "+r.status);return (await r.json()).id;},
  read:async c=>{const r=await fetchT("https://api.restful-api.dev/objects/"+c,6000);return r.ok?((await r.json()).state||null):null;},
  write:async(c,o)=>(await fetchT("https://api.restful-api.dev/objects/"+c,8000,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"kevtf",state:o})})).ok},
 jsonblob:{name:"jsonblob.com",keys:false,
  create:async()=>{const r=await fetchT("https://jsonblob.com/api/jsonBlob",8000,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});if(!r.ok)throw new Error("HTTP "+r.status);
   const i=r.headers.get("x-jsonblob-id")||(r.headers.get("location")||"").split("/").pop();if(!i)throw new Error("id non exposé");return i;},
  read:async c=>{const r=await fetchT("https://jsonblob.com/api/jsonBlob/"+c,6000);return r.ok?await r.json():null;},
  write:async(c,o)=>(await fetchT("https://jsonblob.com/api/jsonBlob/"+c,8000,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).ok}};
let BE=localStorage.getItem("kevo_be")||"kvdb";
const chan=()=>localStorage.getItem("kevo_ch")||"";
function setChan(c){c?localStorage.setItem("kevo_ch",c):localStorage.removeItem("kevo_ch");
 D("syncBadge").textContent=c?"📡 "+c.slice(0,6)+"…":"📡 aucun canal";D("syncBadge").className="badge "+(c?"live":"");}
async function syncPublish(manual){const c=chan();if(!c){if(manual)toast("❌ Crée un canal (📡 Sync).");return false;}
 const A=AD[BE],embed={},meta=[];
 for(const p of OVERLAY.photos){
  if(A.keys&&p.url.startsWith("data:")){await A.putPhoto(c,p.id,p.url);meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"key"});}
  else if(p.url.startsWith("data:")){if(Object.keys(embed).length<4)embed[p.id]=p.url;meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"embed"});}
  else meta.push({id:p.id,fault:p.fault,cap:p.cap,ts:p.ts,ref:"url",url:p.url});}
 let ok=false;try{ok=await A.write(c,{v:1,ts:Date.now(),entries:OVERLAY.entries,photosMeta:meta,embedded:embed,visuel:VISUEL,revoques:REVOQUES,contact:CONTACT});}catch(e){ok=false;}
 D("syStatus").textContent=ok?"✅ "+new Date().toLocaleTimeString("fr-FR"):"❌ échec";
 if(ok&&manual)toast("📡 Publié.");return ok;}
async function syncPull(){const c=chan();if(!c){stage("sync","warn","aucun canal configuré");return;}
 const A=AD[BE];let st=null;try{st=await A.read(c);}catch(e){stage("sync","warn",A.name+" injoignable : "+e.message);return;}
 if(!st){stage("sync","warn","canal vide");return;}
 if(Array.isArray(st.entries))merge(st.entries);
 for(const m of st.photosMeta||[]){if((PHOTOS[m.fault]||[]).some(x=>x.id===m.id))continue;
  let url=m.url||"";
  if(m.ref==="key"){const ca=localStorage.getItem("phc:"+m.id);if(ca)url=ca;else if(A.getPhoto){const du=await A.getPhoto(c,m.id);if(du){url=du;try{localStorage.setItem("phc:"+m.id,du);}catch(e){}}}}
  else if(m.ref==="embed")url=(st.embedded||{})[m.id]||"";
  if(url)(PHOTOS[m.fault]=PHOTOS[m.fault]||[]).push({id:m.id,url,cap:m.cap,ts:m.ts});}
 if(st.visuel){VISUEL=st.visuel;applyVisuel();}
 if(Array.isArray(st.revoques)){REVOQUES=[...new Set(REVOQUES.concat(st.revoques))];localStorage.setItem("kevo_rev",JSON.stringify(REVOQUES));checkRev();}
 if(st.contact)CONTACT=st.contact;
 stage("sync","ok",A.name+" · "+new Date(st.ts||Date.now()).toLocaleTimeString("fr-FR"));
 renderResults();paintStats();}
function applyVisuel(){D("wallpaper").style.backgroundImage=VISUEL.fond?`url(${VISUEL.fond})`:"";
 D("wallpaper").style.opacity=(VISUEL.opacite==null?60:VISUEL.opacite)/100;
 D("opacite").value=VISUEL.opacite==null?60:VISUEL.opacite;D("opVal").textContent=D("opacite").value+"%";
 if(VISUEL.voiture){const i=new Image();i.onload=()=>carImg=i;i.src=VISUEL.voiture;}else carImg=null;
 localStorage.setItem("kevo_visuel",JSON.stringify(VISUEL));}
function checkRev(){const a=JSON.parse(localStorage.getItem("kevo_access")||"null");
 if(a&&REVOQUES.includes(a.sig)){localStorage.removeItem("kevo_access");if(!isAdmin)gate("revoque");}}

/* ---- accès ---- */
async function hmac(m){try{const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const s=await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(m));return [...new Uint8Array(s)].map(b=>b.toString(16).padStart(2,"0")).join("");}catch(e){return hash(m+SECRET);}}
const b64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64u=s=>decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/"))));
const SCREENS=["choice","gate","adminLogin","app","admin"];
function showOnly(id){SCREENS.forEach(x=>D(x).classList.toggle("hidden",x!==id));D("btnQuit").classList.toggle("hidden",!(id==="app"||id==="admin"));}
function gate(st,n){showOnly("gate");["gateForm","gateWait","gateOk","gateKo"].forEach(i=>D(i).classList.add("hidden"));
 if(st==="attente"){D("gateWait").classList.remove("hidden");D("waitName").textContent=n||prenom;}
 else if(st==="autorise"){D("gateOk").classList.remove("hidden");D("okName").textContent=n||prenom;}
 else if(st==="refus"||st==="revoque"){D("gateKo").classList.remove("hidden");D("koText").textContent=st==="revoque"?"🔒 Code révoqué.":"❌ Code invalide ou expiré.";}
 else D("gateForm").classList.remove("hidden");}
function showApp(){showOnly("app");D("btnBackAdmin").classList.toggle("hidden",!isAdmin);renderHisto();updQuota();renderOutbox();renderResults();}
function showAdmin(){showOnly("admin");renderIssued();renderRevoke();renderFaultPicker();renderPending();renderAdminPhotos();paintStages();}
const issued=()=>JSON.parse(localStorage.getItem("kevo_codes")||"[]");
function renderIssued(){const a=issued();
 D("issuedList").innerHTML=a.length?`<table><tbody>`+a.map((x,i)=>{const rv=REVOQUES.includes(x.sig),ex=x.exp<Date.now();
  return `<tr><td>${E(x.prenom)}</td><td class="small">${new Date(x.exp).toLocaleDateString("fr-FR")}</td><td><span class="tag ${rv?"crit":ex?"":"ok"}">${rv?"révoqué":ex?"expiré":"actif"}</span></td>
  <td><button class="btn ghost small" data-copy="${i}">📋</button><button class="btn red small" data-rev="${i}" ${rv?"disabled":""}>🚫</button></td></tr>`;}).join("")+"</tbody></table>":'<p class="small">Aucun code.</p>';
 D("issuedList").querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>navigator.clipboard.writeText(a[+b.dataset.copy].code).then(()=>toast("📋 Copié.")));
 D("issuedList").querySelectorAll("[data-rev]").forEach(b=>b.onclick=()=>{const x=a[+b.dataset.rev];if(!REVOQUES.includes(x.sig))REVOQUES.push(x.sig);
  localStorage.setItem("kevo_rev",JSON.stringify(REVOQUES));renderIssued();renderRevoke();});}
function renderRevoke(){D("revokeList").innerHTML=`<p class="small">${REVOQUES.length} code(s) révoqué(s).</p>`;}
function renderOutbox(){const o=JSON.parse(localStorage.getItem("kevo_outbox")||"[]");
 D("outbox").innerHTML=o.length?o.map(x=>`<div class="hit"><span class="small">${new Date(x.at).toLocaleString("fr-FR")}</span><p class="small">${E(x.t.slice(0,160))}</p></div>`).join(""):'<p class="small">Aucun message.</p>';}
function sendMsg(copy){const t=D("msgTexte").value.trim();if(!t){toast("Écris ton message.");return;}
 const o=JSON.parse(localStorage.getItem("kevo_outbox")||"[]");o.unshift({t,at:Date.now()});localStorage.setItem("kevo_outbox",JSON.stringify(o.slice(0,30)));renderOutbox();
 if(copy)navigator.clipboard.writeText(t).then(()=>toast("📋 Copié."));
 else location.href="mailto:"+CONTACT+"?subject="+encodeURIComponent("Message KEV TECH & FIRE — "+prenom)+"&body="+encodeURIComponent(t);
 D("msgTexte").value="";D("predMsg").innerHTML="";}

/* ---- mises à jour ---- */
async function checkUpdates(force){
 const idx=await jget("data/index.json?ts="+Date.now(),6000);
 if(!idx){stage("upd","warn","index.json injoignable — base locale conservée");D("updBadge").textContent="⬆️ hors ligne";D("updBadge").className="badge warnb";return;}
 const local=localStorage.getItem("kevo_ver")||"";
 if(!force&&idx.version===local){stage("upd","ok","à jour ("+idx.version+")");D("updBadge").textContent="⬆️ à jour";D("updBadge").className="badge live";return;}
 D("updBadge").textContent="⬆️ MAJ…";D("updBadge").className="badge warnb";
 let all=[];for(const f of (idx.chunks||[])){const c=await jget("data/"+f,8000);if(Array.isArray(c))all=all.concat(c);}
 if(all.length){merge(all);localStorage.setItem("kevo_ver",idx.version||"");await saveCache();fillFilters();renderResults();paintStats();
  stage("upd","ok","MAJ appliquée : "+all.length+" fiches ("+idx.version+")");D("updBadge").textContent="⬆️ "+(idx.version||"").slice(0,10);D("updBadge").className="badge live";toast("⬆️ Base mise à jour.");}
 else{stage("upd","warn","chunks vides");D("updBadge").textContent="⬆️ vide";D("updBadge").className="badge warnb";}}
async function harvestRC(){
 if(harvesting)return;harvesting=true;
 const base="https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records";
 let off=0,out=[];
 try{while(off<1500){const j=await jget(base+"?"+new URLSearchParams({where:'categorie_produit="automobiles et moyens de déplacement"',limit:100,offset:off,order_by:"date_publication desc"}),8000);
  const res=(j&&j.results)||[];if(!res.length)break;
  res.forEach(r=>{const txt=[r.motif_rappel,r.risques_encourus].join(" "),feu=FIRE.test(txt);
   const yr=(String(r.modeles_ou_references||"").match(/(?:19|20)\d{2}/g)||[]).map(Number);
   out.push({id:"rc-"+(r.numero_fiche||hash(JSON.stringify(r))),themes:["technique"].concat(feu?["incendie"]:[]),type:"rappel",source:"rappelconso",
    marque:tc(r.marque_produit||""),modele:r.modeles_ou_references||"",motorisation:"",annees:yr.length?[Math.min(...yr),Math.max(...yr)]:null,energie:"",
    systeme:r.sous_categorie_produit||"",dtc:[],symptomes:[],defaut:(r.libelle||r.motif_rappel||"Rappel").slice(0,300),mecanisme:r.motif_rappel||"",
    consequences:[r.risques_encourus||""].filter(Boolean),indices:[],risque_feu:feu,chaine_feu:feu?"Rappel : "+txt.slice(0,200):"",gravite:feu?"critique":"eleve",
    campagne:r.numero_fiche||"",url:r.lien_vers_la_fiche_rappel||"",date:(r.date_publication||"").slice(0,10)});});
  off+=100;if(off>=(j.total_count||0))break;await sleep(60);}}catch(e){}
 if(out.length){merge(out);await saveCache();fillFilters();renderResults();paintStats();
  localStorage.setItem("kevo_rc_ts",String(Date.now()));toast("🛰️ "+out.length+" rappels officiels intégrés.");}
 harvesting=false;}

/* ---- fond animé ---- */
const cv=D("bg"),cx=cv.getContext("2d");let W=0,H=0,stars=[],b1=[],b2=[],dash=0,run=true;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize(){const d=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
 stars=Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*H*.55,r:Math.random()*1.4+.3,p:Math.random()*6}));
 const mk=(n,h)=>Array.from({length:n},(_,i)=>({x:i*(W/n),w:W/n*.7,h:h+Math.random()*h}));b1=mk(14,H*.16);b2=mk(20,H*.1);}
addEventListener("resize",resize);
const acc=()=>getComputedStyle(document.documentElement).getPropertyValue("--acc").trim()||"#00e676";
function car(x,y,s,t){cx.save();cx.translate(x,y+Math.sin(t/180)*1.6);cx.scale(s,s);
 if(carImg){cx.drawImage(carImg,-150,-78,300,90);cx.restore();return;}
 const a=acc();cx.shadowColor=a;cx.shadowBlur=16;cx.fillStyle="#0d1330";cx.strokeStyle=a;cx.lineWidth=2;
 cx.beginPath();cx.moveTo(-140,0);cx.quadraticCurveTo(-130,-30,-80,-36);cx.lineTo(-45,-58);cx.quadraticCurveTo(0,-72,55,-56);cx.lineTo(95,-36);cx.quadraticCurveTo(140,-30,146,-8);cx.lineTo(146,0);cx.closePath();cx.fill();cx.stroke();
 cx.shadowBlur=0;cx.fillStyle="rgba(144,202,249,.85)";cx.beginPath();cx.moveTo(-40,-54);cx.lineTo(48,-52);cx.lineTo(78,-38);cx.lineTo(-62,-38);cx.closePath();cx.fill();
 [-88,92].forEach(wx=>{cx.fillStyle="#05070f";cx.beginPath();cx.arc(wx,2,20,0,7);cx.fill();cx.strokeStyle=a;cx.stroke();});
 cx.fillStyle="rgba(255,241,118,.9)";cx.fillRect(140,-14,10,8);cx.fillStyle="#ff1744";cx.fillRect(-146,-16,6,8);cx.restore();}
function frame(t){if(!run)return;const a=acc(),road=H*.8;
 const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#050816");g.addColorStop(.55,"#141034");g.addColorStop(1,"#070b1e");cx.fillStyle=g;cx.fillRect(0,0,W,H);
 cx.fillStyle="#fff";stars.forEach(s=>{cx.globalAlpha=.3+.5*Math.abs(Math.sin(t/900+s.p));cx.fillRect(s.x,s.y,s.r,s.r);});cx.globalAlpha=1;
 cx.fillStyle="rgba(10,14,36,.9)";b1.forEach(b=>{const x=(b.x-t*.008)%W;cx.fillRect(x<0?x+W:x,road-b.h,b.w,b.h);});
 cx.fillStyle="rgba(16,20,52,.95)";b2.forEach(b=>{const x=(b.x-t*.02)%W;cx.fillRect(x<0?x+W:x,road-b.h,b.w,b.h);});
 cx.fillStyle=a;cx.globalAlpha=.5;cx.fillRect(0,road,W,2);cx.globalAlpha=1;cx.fillStyle="#0a0d1c";cx.fillRect(0,road,W,H-road);
 dash=(dash+6)%160;cx.fillStyle="rgba(255,215,64,.8)";for(let x=-dash;x<W;x+=160)cx.fillRect(x,road+(H-road)*.5,70,5);
 car(W*.34,road-2,Math.min(1,W/700),t);if(!reduce)requestAnimationFrame(frame);}
document.addEventListener("visibilitychange",()=>{run=!document.hidden;if(run&&!reduce)requestAnimationFrame(frame);});
function net(){const c=navigator.connection||{},t=c.type==="wifi"?"WiFi":(c.effectiveType||"").toUpperCase();
 D("netBadge").textContent=navigator.onLine?"📶 "+(t||"réseau"):"📴 hors ligne";D("netBadge").className="badge "+(navigator.onLine?"live":"warnb");
 stage("net",navigator.onLine?"ok":"warn",navigator.onLine?"en ligne":"hors ligne — base locale utilisable");}

/* ---- événements ---- */
function wire(){
 D("themeSeg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;THEME=b.dataset.t;
  document.documentElement.dataset.theme=THEME;[...D("themeSeg").children].forEach(x=>x.classList.toggle("on",x===b));renderResults();});
 D("appTabs").addEventListener("click",e=>{const b=e.target.closest("[data-nav]");if(!b)return;
  ["recherche","etude","photos","obd","message"].forEach(v=>D("v-"+v).classList.toggle("hidden",v!==b.dataset.nav));
  [...D("appTabs").querySelectorAll("[data-nav]")].forEach(x=>x.classList.toggle("active",x===b));});
 D("admTabs").addEventListener("click",e=>{const b=e.target.closest("[data-adm]");if(!b)return;
  ["acces","photos","visuel","sync","base"].forEach(v=>D("a-"+v).classList.toggle("hidden",v!==b.dataset.adm));
  [...D("admTabs").querySelectorAll("[data-adm]")].forEach(x=>x.classList.toggle("active",x===b));
  if(b.dataset.adm==="photos"){renderFaultPicker();renderAdminPhotos();}if(b.dataset.adm==="base")paintStages();});
 D("btnModeAdmin").onclick=()=>{D("adminPwd").value="";showOnly("adminLogin");D("adminPwd").focus();};
 D("btnAdminBack").onclick=()=>showOnly("choice");
 D("btnAdminLogin").onclick=()=>{const p=D("adminPwd").value;D("adminPwd").value="";if(!p)return;
  let ok=false;try{ok=btoa(p)===ADMIN_B64;}catch(e){ok=p==="Kevin83600";}
  if(ok){isAdmin=true;showAdmin();toast("🛡️ Mode admin.");}else toast("❌ Mot de passe incorrect.");};
 D("btnModeTiers").onclick=()=>{localStorage.setItem("mode","tiers");const a=JSON.parse(localStorage.getItem("kevo_access")||"null");
  if(a&&!REVOQUES.includes(a.sig)){prenom=a.prenom;showApp();}else gate("form");};
 D("btnGateBack").onclick=()=>{localStorage.removeItem("mode");showOnly("choice");};
 D("btnBackForm").onclick=()=>gate("form");D("btnReDemande").onclick=()=>gate("form");D("btnEntrer").onclick=showApp;
 D("btnQuit").onclick=()=>{isAdmin=false;showOnly("choice");};D("btnLogout").onclick=()=>{isAdmin=false;showOnly("choice");};
 D("btnBackAdmin").onclick=()=>isAdmin&&showAdmin();D("btnAdminToApp").onclick=showApp;
 D("btnDemande").onclick=async()=>{const p=D("prenom").value.trim(),c=D("accessCode").value.trim();
  if(!p||!c){toast("Prénom + code requis.");return;}
  try{const[pl,sg]=c.split(".");const pay=JSON.parse(unb64u(pl));
   if(await hmac(pl)!==sg)throw 0;if(pay.exp&&Date.now()>pay.exp)throw 0;if(REVOQUES.includes(sg)){gate("revoque");return;}
   prenom=p;localStorage.setItem("prenom",p);localStorage.setItem("kevo_access",JSON.stringify({prenom:p,sig}));gate("autorise",p);}catch(e){gate("refus");}};
 D("lnkAskCode").onclick=e=>{e.preventDefault();const p=D("prenom").value.trim()||"(prénom)";
  location.href="mailto:"+CONTACT+"?subject="+encodeURIComponent("Demande de code KEV TECH & FIRE")+"&body="+encodeURIComponent("Bonjour,\n\nPrénom : "+p+"\nJe souhaite un code d'accès.\n\nMerci !");gate("attente",p);};
 D("chGo").onclick=()=>{setChan(D("chCode").value.trim());syncPull();};
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
  const u=e.target.closest("[data-use]");if(u){const[mk,mo]=u.dataset.use.split("|");D("cMarque").value=mk;D("cModele").value=mo;renderEngines();renderPowers();renderAttrib();window.scrollTo({top:0,behavior:"smooth"});}});
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
  const a=issued();a.unshift({prenom:p,exp:pay.exp,sig:sg,code});localStorage.setItem("kevo_codes",JSON.stringify(a));renderIssued();};
 D("btnCopyCode").onclick=()=>navigator.clipboard.writeText(D("genOut").textContent).then(()=>toast("📋 Copié."));
 D("btnShareCode").onclick=()=>{const t="Code d'accès KEV TECH & FIRE :\n"+D("genOut").textContent;
  if(navigator.share)navigator.share({title:"Code",text:t}).catch(()=>{});else navigator.clipboard.writeText(t).then(()=>toast("📋 Copié."));};
 D("btnPublishRevoke").onclick=()=>syncPublish(true);
 document.addEventListener("paste",async e=>{if(!isAdmin)return;const it=[...(e.clipboardData&&e.clipboardData.items||[])].filter(i=>/^image\//.test(i.type));
  if(!it.length)return;e.preventDefault();for(const i of it){const f=i.getAsFile();if(f)addPending(await compress(f),"photo collée");}});
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
 D("btnOp").onclick=()=>{VISUEL.opacite=+D("opacite").value;applyVisuel();};
 D("btnVisuelReset").onclick=()=>{VISUEL={opacite:60};applyVisuel();};
 D("btnPublishVisuel").onclick=()=>{CONTACT=D("contactEmail").value.trim()||CONTACT;localStorage.setItem("kevo_contact",CONTACT);syncPublish(true);};
 D("syBackend").addEventListener("change",()=>{BE=D("syBackend").value;localStorage.setItem("kevo_be",BE);});
 D("syCreate").onclick=async()=>{toast("⏳ Création…");try{const id=await AD[BE].create();setChan(id);D("syChannel").value=id;await syncPublish(false);toast("✅ Canal : "+id);}catch(e){toast("❌ "+e.message+" — change de backend.");}};
 D("sySave").onclick=()=>{setChan(D("syChannel").value.trim());syncPull();};
 D("syShare").onclick=()=>{const c=chan();if(!c){toast("Aucun canal.");return;}const t="Code canal KEV TECH & FIRE : "+c;
  if(navigator.share)navigator.share({title:"Canal",text:t}).catch(()=>{});else navigator.clipboard.writeText(t).then(()=>toast("📋 Copié."));};
 D("syTest").onclick=async()=>{const c=D("syChannel").value.trim()||chan();if(!c){toast("Renseigne un canal.");return;}
  try{const s=await AD[BE].read(c);toast(s?"✅ Canal joignable":"⚠️ Canal vide mais joignable");}catch(e){toast("❌ "+e.message);}};
 D("syAuto").addEventListener("change",()=>localStorage.setItem("kevo_auto",D("syAuto").checked?"1":"0"));
 D("syPub").onclick=()=>syncPublish(true);D("syPull").onclick=syncPull;
 D("btnReloadBase").onclick=async()=>{await initBackground(true);toast("✅ Rechargé.");};
 D("btnCheckUpd").onclick=()=>checkUpdates(true);
 D("btnSelfCheck").onclick=()=>D("diag").classList.add("open");
 D("selfBadge").onclick=()=>D("diag").classList.add("open");
 D("updBadge").onclick=()=>checkUpdates(true);
 D("syncBadge").onclick=()=>{const c=prompt("Code canal :",chan());if(c===null)return;setChan(c.trim());syncPull();};
 D("diagClose").onclick=()=>D("diag").classList.remove("open");
 D("diagRetry").onclick=()=>initBackground(true);
 D("diagReload").onclick=()=>checkUpdates(true);
 D("diagClear").onclick=async()=>{await IDB.del("base");localStorage.removeItem("kevo_ver");location.reload();};
 D("fileImport").addEventListener("change",async e=>{if(!isAdmin){toast("Réservé admin.");return;}
  for(const f of [...e.target.files]){try{
   if(/\.json$/i.test(f.name)){const j=JSON.parse(await f.text());const a=Array.isArray(j)?j:(j.entries||[]);
    if(j.photos)j.photos.forEach(p=>OVERLAY.photos.push(p));OVERLAY.entries=OVERLAY.entries.concat(a);}
   else{const t=await f.text();t.split(/\n{2,}/).filter(x=>x.trim().length>40).forEach((x,i)=>OVERLAY.entries.push({id:"doc-"+hash(f.name+i),
    themes:["technique"],type:"document",source:"import",marque:"Multi-marques",modele:"Tous",defaut:f.name+" — extrait "+(i+1),mecanisme:x.slice(0,1800),
    consequences:[],dtc:(x.toUpperCase().match(/[PCBU]\d{4}/g)||[]),risque_feu:FIRE.test(x),gravite:"modere",date:new Date().toISOString().slice(0,10)}));}
   }catch(err){toast("❌ "+f.name);}}
  saveOverlay();merge(OVERLAY.entries);fillFilters();renderResults();paintStats();saveCache();e.target.value="";toast("📥 Import terminé.");});
 D("btnExportOverlay").onclick=()=>dl("manual.json",JSON.stringify(OVERLAY,null,1));
 addEventListener("online",()=>{net();syncPull();checkUpdates(false);});addEventListener("offline",net);
}

/* ---- démarrage : SYNCHRONE puis arrière-plan ---- */
function bootSync(){
 D("qcm").innerHTML=SYMPT.map(s=>`<label><input type="checkbox" value="${E(s)}">${E(s)}</label>`).join("");
 D("contactEmail").value=CONTACT;D("syBackend").value=BE;D("syChannel").value=chan();
 D("syAuto").checked=localStorage.getItem("kevo_auto")==="1";
 resize();applyVisuel();net();wire();wirePredictive();renderEngines();renderPowers();updQuota();setChan(chan());
 merge(SEED);merge(OVERLAY.entries);saveOverlay();fillFilters();renderResults();paintStats();
 stage("boot","ok","interface prête, aucun blocage réseau");
 stage("seed","ok",SEED.length+" fiches embarquées (hors ligne garanti)");
 if(!reduce)requestAnimationFrame(frame);else frame(0);
 READY=true;window.__KEV_READY=true;
 D("bootScreen").classList.add("done");D("fatal").classList.add("hidden");
 if(localStorage.getItem("mode")==="tiers"){const a=JSON.parse(localStorage.getItem("kevo_access")||"null");
  if(a&&!REVOQUES.includes(a.sig)){prenom=a.prenom;showApp();}else gate("form");}else showOnly("choice");
 if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").then(()=>stage("sw","ok","enregistré")).catch(e=>stage("sw","warn",e.message));
 else stage("sw","warn","non supporté");
}
async function initBackground(force){
 try{const n=await loadCache();stage("cache",n?"ok":"warn",n?n+" fiches restaurées du cache":"cache vide (1er lancement)");}catch(e){stage("cache","warn",e.message);}
 fillFilters();renderResults();paintStats();
 const s=await jget("data/seed.json",5000);
 if(Array.isArray(s)&&s.length){merge(s);stage("repo","ok","seed.json : "+s.length+" fiches");}else stage("repo","warn","seed.json absent — seed embarqué utilisé");
 const man=await jget("data/manual.json",5000);
 if(man){const a=Array.isArray(man)?man:(man.entries||[]);merge(a);stage("manual","ok",a.length+" pannes admin");}else stage("manual","warn","manual.json absent");
 const ph=await jget("data/photos.json",5000);
 if(ph){const a=Array.isArray(ph)?ph:(ph.photos||[]);a.forEach(p=>{if(!(PHOTOS[p.fault]||[]).some(x=>x.id===p.id))(PHOTOS[p.fault]=PHOTOS[p.fault]||[]).push(p);});}
 fillFilters();renderResults();paintStats();await saveCache();
 await checkUpdates(!!force);
 await syncPull();
 const rcTs=+(localStorage.getItem("kevo_rc_ts")||0);
 if(navigator.onLine&&(force||BASE.length<400||Date.now()-rcTs>7*864e5))harvestRC();
 paintStages();
}
function boot(){
 try{bootSync();}catch(e){console.error(e);D("bootScreen").classList.add("done");
  D("fatal").classList.remove("hidden");D("fatalErr").textContent=e.message;return;}
 setTimeout(()=>{initBackground(false).catch(e=>stage("repo","bad",e.message));},300);
 setInterval(()=>{syncPull();checkUpdates(false);if(isAdmin&&localStorage.getItem("kevo_auto")==="1")syncPublish(false);},60000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden){syncPull();checkUpdates(false);}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.KEV={BASE:()=>BASE,PHOTOS:()=>PHOTOS,stages:()=>STAGES,syncPublish,syncPull,checkUpdates,enginesFor,energyOf};
})();
