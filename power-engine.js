/* ============================================================================
   KEV TECH & FIRE — POWER & MOTORISATION ENGINE v5
   • ÉNERGIE déduite de la chaîne motorisation (energyOf) = source de vérité,
     jamais d'une liste → plus aucune attribution erronée.
   • Réconciliateur 1,5 s : force Énergie + Puissance cohérentes en continu,
     quel que soit le module qui tente de les modifier.
   • Correspondance moteur STRICTE (égalité / préfixe / 2 tokens) → plus de
     croisement 1.5 TSI ↔ 1.5 BlueHDi.
   • Puissance auto = documentée pour le modèle > version catalogue > principale.
   • Puissances affichées = celles du moteur choisi uniquement.
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T=(m,ms=3500)=>{try{if(typeof toast==="function")toast(m,ms);else console.log(m);}catch(_){console.log(m);}};
const EN_BADGE={essence:"🟡",diesel:"⚫",hybride:"🟢",electrique:"🔵"};
const EN_OPTIONS=["essence","diesel","hybride","electrique"];

/* ============ BASE MOTEURS DOCUMENTÉE ============ */
const ENGINE_DB={
"skoda|fabia":[{m:"1.0 MPI",cc:999,en:"essence",ch:[75,80]},{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]}],
"skoda|octavia":[{m:"1.0 TSI",cc:999,en:"essence",ch:[110]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[130,150]},{m:"2.0 TSI",cc:1984,en:"essence",ch:[190,204,245]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,200]},{m:"1.4 TSI iV PHEV",cc:1395,en:"hybride",ch:[204,245]}],
"skoda|superb":[{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 TSI",cc:1984,en:"essence",ch:[190,272]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[150,190,200]},{m:"1.4 TSI iV PHEV",cc:1395,en:"hybride",ch:[218]}],
"skoda|kodiaq":[{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 TSI",cc:1984,en:"essence",ch:[190,245]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[150,190,200]}],
"skoda|karoq":[{m:"1.0 TSI",cc:999,en:"essence",ch:[110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,190]}],
"skoda|kamiq":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"1.6 TDI",cc:1598,en:"diesel",ch:[115]}],
"skoda|scala":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]}],
"volkswagen|golf":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[130,150]},{m:"2.0 TSI GTI",cc:1984,en:"essence",ch:[245,300]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,200]},{m:"1.4 TSI eHybrid",cc:1395,en:"hybride",ch:[204,245]}],
"volkswagen|polo":[{m:"1.0 MPI",cc:999,en:"essence",ch:[80]},{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[95]}],
"volkswagen|passat":[{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 TSI",cc:1984,en:"essence",ch:[190,272]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[150,190,200,240]},{m:"1.4 TSI GTE",cc:1395,en:"hybride",ch:[218]}],
"volkswagen|tiguan":[{m:"1.5 TSI",cc:1498,en:"essence",ch:[130,150]},{m:"2.0 TSI",cc:1984,en:"essence",ch:[190,245,320]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[150,190,200,240]}],
"volkswagen|t-roc":[{m:"1.0 TSI",cc:999,en:"essence",ch:[110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,190]}],
"volkswagen|t-cross":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[150]},{m:"1.6 TDI",cc:1598,en:"diesel",ch:[95]}],
"peugeot|208":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[75,100,130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100]},{m:"Électrique e-208",cc:0,en:"electrique",ch:[136,156]}],
"peugeot|2008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[100,130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[110,130]},{m:"Électrique e-2008",cc:0,en:"electrique",ch:[136,156]}],
"peugeot|308":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[110,130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225]},{m:"Électrique e-308",cc:0,en:"electrique",ch:[156]}],
"peugeot|3008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"1.6 BlueHDi",cc:1560,en:"diesel",ch:[120]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[150,180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225,300]},{m:"Électrique e-3008",cc:0,en:"electrique",ch:[210,230,325]}],
"peugeot|5008":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[150,180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225]},{m:"Électrique e-5008",cc:0,en:"electrique",ch:[210,230]}],
"peugeot|508":[{m:"1.6 PureTech",cc:1598,en:"essence",ch:[180,225]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225,360]}],
"citroen|c3":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[82,100,110]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100]},{m:"Électrique ë-C3",cc:0,en:"electrique",ch:[113]}],
"citroen|c4":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[100,130,155]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[110,130]},{m:"1.6 Hybrid",cc:1598,en:"hybride",ch:[145]},{m:"Électrique e-C4",cc:0,en:"electrique",ch:[136,156]}],
"citroen|c5 aircross":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[130]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[130]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225]}],
"renault|clio":[{m:"1.0 SCe",cc:999,en:"essence",ch:[65,75]},{m:"1.0 TCe",cc:999,en:"essence",ch:[90,100,110]},{m:"1.3 TCe",cc:1332,en:"essence",ch:[130,140]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[85,100,115]},{m:"E-Tech Hybride",cc:1598,en:"hybride",ch:[140,145]}],
"renault|captur":[{m:"1.0 TCe",cc:999,en:"essence",ch:[90,100,110]},{m:"1.3 TCe",cc:1332,en:"essence",ch:[130,140,150]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[95,115]},{m:"E-Tech Hybride",cc:1598,en:"hybride",ch:[145,160]}],
"renault|megane":[{m:"1.3 TCe",cc:1332,en:"essence",ch:[140,160]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[115]},{m:"1.6 E-Tech PHEV",cc:1598,en:"hybride",ch:[160]},{m:"Électrique E-Tech",cc:0,en:"electrique",ch:[130,220]}],
"renault|kadjar":[{m:"1.3 TCe",cc:1332,en:"essence",ch:[140,160]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[115]},{m:"1.7 Blue dCi",cc:1749,en:"diesel",ch:[150]}],
"renault|austral":[{m:"1.2 E-Tech Hybride",cc:1199,en:"hybride",ch:[130,160,200]},{m:"1.3 TCe",cc:1332,en:"essence",ch:[140,160]}],
"renault|arkana":[{m:"1.3 TCe",cc:1332,en:"essence",ch:[140,160]},{m:"1.6 E-Tech Hybride",cc:1598,en:"hybride",ch:[145,160]}],
"renault|scenic":[{m:"1.3 TCe",cc:1332,en:"essence",ch:[140,160]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[110,115]},{m:"1.7 Blue dCi",cc:1749,en:"diesel",ch:[150]},{m:"Électrique E-Tech",cc:0,en:"electrique",ch:[170,220]}],
"dacia|duster":[{m:"1.0 TCe",cc:999,en:"essence",ch:[90,100,110]},{m:"1.3 TCe",cc:1332,en:"essence",ch:[130,150]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[95,115]},{m:"Hybride 140",cc:1598,en:"hybride",ch:[140]}],
"dacia|sandero":[{m:"1.0 SCe",cc:999,en:"essence",ch:[65,75]},{m:"1.0 TCe",cc:999,en:"essence",ch:[90,100,110]}],
"dacia|jogger":[{m:"1.0 TCe",cc:999,en:"essence",ch:[100,110]},{m:"Hybride 140",cc:1598,en:"hybride",ch:[140]}],
"toyota|yaris":[{m:"1.0 VVT-i",cc:998,en:"essence",ch:[72]},{m:"1.5 Hybride",cc:1490,en:"hybride",ch:[116,130]}],
"toyota|corolla":[{m:"1.8 Hybride",cc:1798,en:"hybride",ch:[140]},{m:"2.0 Hybride",cc:1987,en:"hybride",ch:[180,196]}],
"toyota|c-hr":[{m:"1.8 Hybride",cc:1798,en:"hybride",ch:[122,140]},{m:"2.0 Hybride",cc:1987,en:"hybride",ch:[180,198]}],
"toyota|rav4":[{m:"2.5 Hybride",cc:2487,en:"hybride",ch:[218,222]},{m:"2.5 PHEV",cc:2487,en:"hybride",ch:[306]}],
"ford|fiesta":[{m:"1.1 Ti-VCT",cc:1084,en:"essence",ch:[75,85]},{m:"1.0 EcoBoost",cc:999,en:"essence",ch:[85,95,100,125,140,155]},{m:"1.5 EcoBlue",cc:1499,en:"diesel",ch:[85,95]}],
"ford|focus":[{m:"1.0 EcoBoost",cc:999,en:"essence",ch:[100,125,155]},{m:"1.5 EcoBlue",cc:1499,en:"diesel",ch:[95,120]},{m:"2.0 EcoBlue",cc:1997,en:"diesel",ch:[150]}],
"ford|puma":[{m:"1.0 EcoBoost",cc:999,en:"essence",ch:[95,125,155,170]},{m:"1.5 EcoBlue",cc:1499,en:"diesel",ch:[95,120]}],
"ford|kuga":[{m:"1.5 EcoBoost",cc:1499,en:"essence",ch:[120,150]},{m:"2.0 EcoBlue",cc:1997,en:"diesel",ch:[150,190]},{m:"2.5 Hybride",cc:2488,en:"hybride",ch:[190,225]},{m:"2.5 PHEV",cc:2488,en:"hybride",ch:[225]}],
"bmw|serie 1":[{m:"1.5 118i",cc:1499,en:"essence",ch:[136,140]},{m:"2.0 120i",cc:1998,en:"essence",ch:[178,192]},{m:"2.0 118d",cc:1995,en:"diesel",ch:[150]},{m:"2.0 120d",cc:1995,en:"diesel",ch:[190]}],
"bmw|serie 3":[{m:"2.0 320i",cc:1998,en:"essence",ch:[184,190]},{m:"2.0 330i",cc:1998,en:"essence",ch:[245,258]},{m:"2.0 318d",cc:1995,en:"diesel",ch:[150]},{m:"2.0 320d",cc:1995,en:"diesel",ch:[190]},{m:"3.0 330d",cc:2993,en:"diesel",ch:[286]},{m:"2.0 330e PHEV",cc:1998,en:"hybride",ch:[292]}],
"bmw|x1":[{m:"1.5 18i",cc:1499,en:"essence",ch:[136,140]},{m:"2.0 20i",cc:1998,en:"essence",ch:[192,204]},{m:"2.0 18d",cc:1995,en:"diesel",ch:[150]},{m:"2.0 23d",cc:1995,en:"diesel",ch:[211]}],
"bmw|x3":[{m:"2.0 20i",cc:1998,en:"essence",ch:[184,190]},{m:"2.0 30i",cc:1998,en:"essence",ch:[245,252]},{m:"2.0 20d",cc:1995,en:"diesel",ch:[190]},{m:"3.0 30d",cc:2993,en:"diesel",ch:[286]}],
"mercedes-benz|classe a":[{m:"1.3 A180",cc:1332,en:"essence",ch:[136]},{m:"1.3 A200",cc:1332,en:"essence",ch:[163]},{m:"2.0 A220",cc:1991,en:"essence",ch:[190]},{m:"2.0 A180d",cc:1950,en:"diesel",ch:[116]},{m:"2.0 A220d",cc:1950,en:"diesel",ch:[190]}],
"mercedes-benz|classe c":[{m:"1.5 C180",cc:1496,en:"essence",ch:[170]},{m:"2.0 C200",cc:1999,en:"essence",ch:[204]},{m:"2.0 C220d",cc:1993,en:"diesel",ch:[194]},{m:"2.0 C300e PHEV",cc:1999,en:"hybride",ch:[313]}],
"mercedes-benz|gla":[{m:"1.3 GLA180",cc:1332,en:"essence",ch:[136]},{m:"1.3 GLA200",cc:1332,en:"essence",ch:[163]},{m:"2.0 GLA220d",cc:1950,en:"diesel",ch:[190]},{m:"Électrique EQA",cc:0,en:"electrique",ch:[190,228,292]}],
"audi|a3":[{m:"1.0 30 TFSI",cc:999,en:"essence",ch:[110]},{m:"1.5 35 TFSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 40 TFSI",cc:1984,en:"essence",ch:[190]},{m:"2.0 30 TDI",cc:1968,en:"diesel",ch:[116]},{m:"2.0 35 TDI",cc:1968,en:"diesel",ch:[150]}],
"audi|a4":[{m:"2.0 35 TFSI",cc:1984,en:"essence",ch:[150]},{m:"2.0 40 TFSI",cc:1984,en:"essence",ch:[190,204]},{m:"2.0 35 TDI",cc:1968,en:"diesel",ch:[163]},{m:"2.0 40 TDI",cc:1968,en:"diesel",ch:[190,204]}],
"audi|q3":[{m:"1.5 35 TFSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 40 TFSI",cc:1984,en:"essence",ch:[190]},{m:"2.0 35 TDI",cc:1968,en:"diesel",ch:[150]},{m:"2.0 40 TDI",cc:1968,en:"diesel",ch:[193,200]}],
"hyundai|i20":[{m:"1.2 MPI",cc:1197,en:"essence",ch:[84]},{m:"1.0 T-GDi",cc:998,en:"essence",ch:[84,100,120]}],
"hyundai|i30":[{m:"1.0 T-GDi",cc:998,en:"essence",ch:[100,120]},{m:"1.5 T-GDi",cc:1482,en:"essence",ch:[160]},{m:"1.6 CRDi",cc:1598,en:"diesel",ch:[115,136]}],
"hyundai|tucson":[{m:"1.6 T-GDi",cc:1598,en:"essence",ch:[150,180]},{m:"1.6 CRDi",cc:1598,en:"diesel",ch:[115,136]},{m:"1.6 Hybride",cc:1598,en:"hybride",ch:[230]},{m:"1.6 PHEV",cc:1598,en:"hybride",ch:[265]}],
"kia|ceed":[{m:"1.0 T-GDi",cc:998,en:"essence",ch:[100,120]},{m:"1.5 T-GDi",cc:1482,en:"essence",ch:[160]},{m:"1.6 CRDi",cc:1598,en:"diesel",ch:[115,136]},{m:"1.6 Hybride",cc:1580,en:"hybride",ch:[141]}],
"kia|sportage":[{m:"1.6 T-GDi",cc:1598,en:"essence",ch:[150,180]},{m:"1.6 CRDi",cc:1598,en:"diesel",ch:[115,136]},{m:"1.6 Hybride",cc:1598,en:"hybride",ch:[230]},{m:"1.6 PHEV",cc:1598,en:"hybride",ch:[265]}],
"opel|corsa":[{m:"1.2",cc:1199,en:"essence",ch:[75,100,130]},{m:"1.5 Diesel",cc:1499,en:"diesel",ch:[100,110]},{m:"Électrique Corsa-e",cc:0,en:"electrique",ch:[136,156]}],
"opel|mokka":[{m:"1.2 Turbo",cc:1199,en:"essence",ch:[100,130]},{m:"1.5 Diesel",cc:1499,en:"diesel",ch:[110]},{m:"Électrique Mokka-e",cc:0,en:"electrique",ch:[136,156]}],
"fiat|500":[{m:"1.0 Hybrid",cc:999,en:"hybride",ch:[70]},{m:"Électrique 500e",cc:0,en:"electrique",ch:[95,118]}],
"volvo|xc40":[{m:"1.5 T3",cc:1477,en:"essence",ch:[163]},{m:"2.0 B4",cc:1969,en:"hybride",ch:[197]},{m:"2.0 B5",cc:1969,en:"hybride",ch:[250]},{m:"Électrique Recharge",cc:0,en:"electrique",ch:[238,408]}],
"volvo|xc60":[{m:"2.0 B4",cc:1969,en:"hybride",ch:[197]},{m:"2.0 B5",cc:1969,en:"hybride",ch:[250]},{m:"2.0 B6 PHEV",cc:1969,en:"hybride",ch:[350]},{m:"2.0 T8 PHEV",cc:1969,en:"hybride",ch:[455,462]}]
};
const MARQUE_POOL={
"skoda":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[130,150]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,200]}],
"volkswagen":[{m:"1.0 TSI",cc:999,en:"essence",ch:[95,110,115]},{m:"1.5 TSI",cc:1498,en:"essence",ch:[130,150]},{m:"2.0 TSI",cc:1984,en:"essence",ch:[190,245,320]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[115,150,200,240]}],
"peugeot":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[82,100,110,130,155]},{m:"1.6 PureTech",cc:1598,en:"essence",ch:[180,225]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100,110,130]},{m:"2.0 BlueHDi",cc:1997,en:"diesel",ch:[150,180]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225,300]}],
"citroen":[{m:"1.2 PureTech",cc:1199,en:"essence",ch:[82,100,110,130,155]},{m:"1.5 BlueHDi",cc:1499,en:"diesel",ch:[100,110,130]},{m:"1.6 Hybrid PHEV",cc:1598,en:"hybride",ch:[180,225]}],
"renault":[{m:"1.0 TCe",cc:999,en:"essence",ch:[90,100,110]},{m:"1.3 TCe",cc:1332,en:"essence",ch:[130,140,150,160]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[85,95,100,115]},{m:"1.7 Blue dCi",cc:1749,en:"diesel",ch:[150]},{m:"E-Tech Hybride",cc:1598,en:"hybride",ch:[140,145,160,200]}],
"dacia":[{m:"1.0 TCe",cc:999,en:"essence",ch:[90,100,110]},{m:"1.3 TCe",cc:1332,en:"essence",ch:[130,150]},{m:"1.5 Blue dCi",cc:1461,en:"diesel",ch:[95,115]},{m:"Hybride 140",cc:1598,en:"hybride",ch:[140]}],
"toyota":[{m:"1.0 VVT-i",cc:998,en:"essence",ch:[72]},{m:"1.5 Hybride",cc:1490,en:"hybride",ch:[116,130]},{m:"1.8 Hybride",cc:1798,en:"hybride",ch:[122,140]},{m:"2.0 Hybride",cc:1987,en:"hybride",ch:[180,196]},{m:"2.5 Hybride",cc:2487,en:"hybride",ch:[218,222,306]}],
"ford":[{m:"1.0 EcoBoost",cc:999,en:"essence",ch:[85,95,100,125,140,155,170]},{m:"1.5 EcoBoost",cc:1499,en:"essence",ch:[120,150]},{m:"2.0 EcoBoost",cc:1999,en:"essence",ch:[200,245,280]},{m:"1.5 EcoBlue",cc:1499,en:"diesel",ch:[85,95,120]},{m:"2.0 EcoBlue",cc:1997,en:"diesel",ch:[150,190]}],
"bmw":[{m:"1.5 Essence",cc:1499,en:"essence",ch:[136,140]},{m:"2.0 Essence",cc:1998,en:"essence",ch:[184,190,245,258]},{m:"3.0 Essence",cc:2998,en:"essence",ch:[286,340]},{m:"2.0 Diesel",cc:1995,en:"diesel",ch:[150,190,211]},{m:"3.0 Diesel",cc:2993,en:"diesel",ch:[286,341]}],
"mercedes-benz":[{m:"1.3 Essence",cc:1332,en:"essence",ch:[136,163]},{m:"1.5 Essence",cc:1496,en:"essence",ch:[170]},{m:"2.0 Essence",cc:1991,en:"essence",ch:[190,204]},{m:"2.0 Diesel",cc:1950,en:"diesel",ch:[116,190,194]}],
"audi":[{m:"1.0 TFSI",cc:999,en:"essence",ch:[110]},{m:"1.5 TFSI",cc:1498,en:"essence",ch:[150]},{m:"2.0 TFSI",cc:1984,en:"essence",ch:[190,204,245]},{m:"2.0 TDI",cc:1968,en:"diesel",ch:[116,150,163,190,200,204]}],
"hyundai":[{m:"1.0 T-GDi",cc:998,en:"essence",ch:[84,100,120]},{m:"1.5 T-GDi",cc:1482,en:"essence",ch:[160]},{m:"1.6 T-GDi",cc:1598,en:"essence",ch:[150,180]},{m:"1.6 CRDi",cc:1598,en:"diesel",ch:[115,136]},{m:"1.6 Hybride",cc:1598,en:"hybride",ch:[141,230,265]}],
"kia":[{m:"1.0 T-GDi",cc:998,en:"essence",ch:[100,120]},{m:"1.5 T-GDi",cc:1482,en:"essence",ch:[160]},{m:"1.6 T-GDi",cc:1598,en:"essence",ch:[150,180]},{m:"1.6 CRDi",cc:1598,en:"diesel",ch:[115,136]},{m:"1.6 Hybride",cc:1580,en:"hybride",ch:[141,230,265]}],
"opel":[{m:"1.2 Turbo",cc:1199,en:"essence",ch:[75,100,130]},{m:"1.5 Diesel",cc:1499,en:"diesel",ch:[100,110,130]}],
"fiat":[{m:"1.0 Hybrid",cc:999,en:"hybride",ch:[70]},{m:"1.2",cc:1242,en:"essence",ch:[69,75]},{m:"1.3 Multijet",cc:1248,en:"diesel",ch:[95]}],
"volvo":[{m:"1.5 T3",cc:1477,en:"essence",ch:[163]},{m:"2.0 B4",cc:1969,en:"hybride",ch:[197]},{m:"2.0 B5",cc:1969,en:"hybride",ch:[250]},{m:"2.0 T8 PHEV",cc:1969,en:"hybride",ch:[455,462]}]
};
const POWER_TABLE={
"1.2 puretech":[82,100,110,130,136,155,180,215,225,250],"1.6 thp":[150,155,165,170,200,205,270],
"1.5 bluehdi":[100,120,130],"1.6 bluehdi":[100,120,150,180],"2.0 bluehdi":[150,180,204],
"1.5 dci":[90,95,110,115],"1.3 tce":[130,140,150,160],"1.0 tce":[90,100,110],
"1.0 ecoboost":[100,125,140,155],"1.5 ecoboost":[120,150,160,180],"2.0 ecoboost":[200,245,280,350],
"1.0 tsi":[95,110,115],"1.5 tsi":[130,150,160],"2.0 tsi":[190,220,245,280,310,320],
"1.6 tdi":[95,115,120],"2.0 tdi":[115,150,190,200,240],"3.0 tdi":[218,231,286,341],
"1.4 tsi":[122,125,150],"1.8 tsi":[152,180],"1.6 hdi":[92,100,115,120],"2.0 hdi":[140,150,163,180],
"1.5 cdti":[100,120,125],"2.0 cdti":[150,170,210],"1.6 crdi":[115,136],"2.0 crdi":[150,185,200],
"1.5 t-gdi":[160],"2.0 t-gdi":[240,280],"1.6 t-gdi":[150,180,204],"2.5 t-gdi":[304,400],"3.5 t-gdi":[380,415],
"1.5 skyactiv":[120],"2.0 skyactiv":[122,150,165,184,190],"2.2 skyactiv-d":[150,184],
"1.3 multijet":[95],"1.6 multijet":[120,130],"2.0 multijet":[140,170,180],
"1.5 vtec":[130],"2.0 vtec":[156,184],"2.0 d-4d":[143,150],"2.2 d-4d":[136,150,177],"1.5 d-4d":[116],
"e-tech":[130,150,220],"puretech":[82,100,110,130,136,155,180,215,225,250],"thp":[150,155,165,170,200,205,270],
"bluehdi":[100,120,130,150,180],"hdi":[92,100,115,120,140,150,163,180,204,240],"dci":[90,95,110,115,130,150],
"tce":[90,100,110,130,140,150,160],"ecoboost":[100,125,140,155,160,180,200,245,280,350],
"tsi":[95,110,115,130,150,160,190,220,245,280,310,320],"tdi":[95,115,120,150,190,200,218,231,240,286,341],
"crdi":[115,136,150,185,200],"skyactiv":[120,122,150,165,184,190]
};

/* ============ ÉNERGIE = source de vérité par la chaîne motorisation ============ */
function energyOf(m){const t=N(m||"");
 if(/electrique|electric|bev|ev\b|kwh|e-|zero emission|elroq|enyaq|e-208|e-2008|e-3008|e-308|e-24|e-4|e-500/.test(t))return "electrique";
 if(/hybrid|phev|hev|e-tech|etech|plugin|rechargeable|hybride|iv\b|gte|b4|b5|b6|t8/.test(t))return "hybride";
 if(/diesel|tdi|hdi|dci|crdi|cdti|multijet|d-4d|skyactiv-d|blue dci|bluehdi|ecoblue|ecoflex/.test(t))return "diesel";
 return "essence";}
const ccOf=m=>{const f=parseFloat(String(m||""));return f?Math.round(f*1000):0;};
function powersOfMotor(m){const t=N(m||"");for(const[k,v]of Object.entries(POWER_TABLE))if(t.includes(k)||k.includes(t))return v;return [];}
const fmtCC=cc=>cc?cc+" cm³":"";

/* ============ Attribution réelle + correspondance STRICTE ============ */
function enginesFor(mk,mo){
  const out=[];const seen=new Set();
  const push=(e,src)=>{if(!e||!e.m)return;const k=N(e.m)+"|"+e.en;if(seen.has(k))return;seen.add(k);
    out.push({m:e.m,cc:e.cc||0,en:energyOf(e.m)||e.en,ch:(e.ch&&e.ch.length?e.ch:powersOfMotor(e.m)),src});};
  ((typeof CATALOG!=="undefined"&&CATALOG.versions)||[]).forEach(v=>{
    if(N(v.marque)===N(mk)&&N(v.modele)===N(mo))(v.v||[]).forEach(r=>push({m:r[0]||"Électrique",cc:0,en:v.energie||"electrique",ch:[r[2]]},"catalogue"));});
  const key=N(mk)+"|"+N(mo);
  (ENGINE_DB[key]||[]).forEach(e=>push(e,"documenté"));
  if(!ENGINE_DB[key])for(const[k,arr]of Object.entries(ENGINE_DB)){const[bm,bmo]=k.split("|");
    if(bm===N(mk)&&N(mo)&&bmo&&(N(mo)===bmo||N(mo).startsWith(bmo)||bmo.startsWith(N(mo))))arr.forEach(e=>push(e,"documenté"));}
  if(out.length<2)(MARQUE_POOL[N(mk)]||[]).forEach(e=>push(e,"gamme"));
  const order={catalogue:0,documenté:1,gamme:2};
  return out.sort((a,b)=>(order[a.src]??3)-(order[b.src]??3)||a.m.localeCompare(b.m));
}
function matchEngine(mk,mo,mt){ if(!mt)return null; const a=N(mt);
  return enginesFor(mk,mo).find(e=>{const b=N(e.m);
    if(b===a)return true;
    if(a.startsWith(b)||b.startsWith(a))return true;
    const ta=a.split(" "),tb=b.split(" ");
    return ta[0]===tb[0]&&ta[1]&&tb[1]&&ta[1]===tb[1];})||null; }
function isAttributable(mk,mo,mt){return !mt||!!matchEngine(mk,mo,mt);}

/* ============ Puissances ============ */
function knownPowers(mk,mo,mt){
  const out=new Map();const mtN=N(mt||"");
  if(mtN){
    const hit=matchEngine(mk,mo,mt);
    if(hit)(hit.ch||[]).forEach(p=>out.set(p,`${hit.m} · ${hit.en} · ${p} ch`+(hit.cc?` · ${fmtCC(hit.cc)}`:"")));
    for(const[k,v]of Object.entries(POWER_TABLE))if(mtN.includes(k)||k.includes(mtN))v.forEach(p=>{if(!out.has(p))out.set(p,`Motorisation ${k} · ${p} ch`);});
    (typeof BASE!=="undefined"?BASE:[]).forEach(e=>{
      if(!N(e.marque||"").includes(N(mk))||!N(e.modele||"").includes(N(mo)))return;
      const lab=N(e.motorisation||"");
      if(lab&&(N(mtN).includes(lab)||lab.includes(mtN.split(" ")[0])))
        (Array.isArray(e.puissance_ch)?e.puissance_ch:[]).forEach(p=>{if(!out.has(p))out.set(p,`Documentée (fiche) · ${p} ch`);});});
  } else {
    enginesFor(mk,mo).forEach(e=>(e.ch||[]).forEach(p=>{if(!out.has(p))out.set(p,`${e.m} · ${e.en} · ${p} ch`);}));
  }
  return [...out.entries()].sort((a,b)=>a[0]-b[0]).map(([ch,label])=>({ch,kw:Math.round(ch/1.35962),label}));
}
function representativePower(eng,mk,mo,mt){
  if(eng){
    const scores=new Map();
    (typeof BASE!=="undefined"?BASE:[]).forEach(e=>{
      if(!N(e.marque||"").includes(N(mk))||!N(e.modele||"").includes(N(mo)))return;
      const lab=N(e.motorisation||"");
      const labOk=!lab||N(eng.m).includes(lab.split(" ")[0])||lab.includes(N(eng.m).split(" ")[0]);
      (Array.isArray(e.puissance_ch)?e.puissance_ch:[]).forEach(p=>{if((eng.ch||[]).includes(p))scores.set(p,(scores.get(p)||0)+(labOk?2:1));});});
    if(scores.size)return [...scores.entries()].sort((a,b)=>b[1]-a[1])[0][0];
    const ver=((typeof CATALOG!=="undefined"&&CATALOG.versions)||[]).find(v=>N(v.marque)===N(mk)&&N(v.modele)===N(mo));
    if(ver){const hit=(ver.v||[]).find(r=>N(r[0]||"").includes(N(eng.m).split(" ")[0])||N(eng.m).includes(N(r[0]||"").split(" ")[0]));if(hit&&hit[2])return hit[2];}
    if(eng.ch&&eng.ch.length)return eng.ch[0];
  }
  const kp=knownPowers(mk,mo,mt);return kp.length?kp[0].ch:null;
}

/* ============ Badges ============ */
function setBadges(en,rp){
  let b=D("autoAttrBadge");
  const anchor=D("cPuiss")?.parentNode;
  if(anchor){ if(!b){b=document.createElement("span");b.id="autoAttrBadge";b.className="badge live";b.style.marginLeft="6px";anchor.appendChild(b);}
    b.textContent=`⚙️ auto : ${EN_BADGE[en]||""} ${en} · ${rp??"—"} ch`; }
  let c=D("energyAuto");
  const eAnchor=D("cEnergie")?.parentNode;
  if(eAnchor){ if(!c){c=document.createElement("span");c.id="energyAuto";c.className="badge live";c.style.marginLeft="6px";eAnchor.appendChild(c);}
    c.textContent=`${EN_BADGE[en]||""} énergie auto : ${en}`; }
}

/* ============ ATTRIBUTION AUTO (énergie par la chaîne + puissance cohérente) ============ */
function autoAttribute(opts={}){
  const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"",mt=D("cMoteur")?.value||"";
  if(!mt)return false;
  const en=energyOf(mt);                 // ← vérité : la chaîne motorisation
  const eng=matchEngine(mk,mo,mt);
  const rp=representativePower(eng,mk,mo,mt);
  let changed=false;
  const ce=D("cEnergie");
  if(ce&&EN_OPTIONS.includes(en)&&ce.value!==en){ce.value=en;changed=true;}
  const cp=D("cPuiss");
  if(cp&&rp!=null&&String(cp.value)!==String(rp)){cp.value=rp;changed=true;}
  majPuiss();renderEnginePanel();setBadges(en,rp);
  if(window.CATALOG_ENGINE?.verifyAttribution)window.CATALOG_ENGINE.verifyAttribution();
  if(changed&&opts.toast!==false)T(`⚙️ Attribution auto : ${mt} → ${en} · ${rp??"?"} ch`);
  return changed;
}
/* Réconciliateur : force la cohérence en continu, quel que soit le module auteur */
function reconcile(){
  const mt=D("cMoteur")?.value||"";if(!mt)return;
  const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"";
  const en=energyOf(mt);
  const ce=D("cEnergie");let changed=false;
  if(ce&&EN_OPTIONS.includes(en)&&ce.value!==en){ce.value=en;changed=true;}
  const allowed=knownPowers(mk,mo,mt).map(p=>p.ch);
  const cp=D("cPuiss");
  if(cp&&allowed.length){
    const cur=+cp.value;
    if(!cur||!allowed.includes(cur)){const rp=representativePower(matchEngine(mk,mo,mt),mk,mo,mt)??allowed[0];
      if(String(cp.value)!==String(rp)){cp.value=rp;changed=true;}}
  }
  if(changed){majPuiss();setBadges(en,+cp?.value||null);
    if(window.CATALOG_ENGINE?.verifyAttribution)window.CATALOG_ENGINE.verifyAttribution();}
  else setBadges(en,+cp?.value||null);
}

/* ============ UI ============ */
function ensureUI(){
  if(!D("dlPuiss")){const dl=document.createElement("datalist");dl.id="dlPuiss";document.body.appendChild(dl);}
  const cp=D("cPuiss");if(cp)cp.setAttribute("list","dlPuiss");
  const cm=D("cMoteur");if(cm){cm.removeAttribute("list");cm.placeholder="Choisis une motorisation du modèle…";}
  if(!D("puissWrap")){const g=D("topAnalyse")?.querySelector(".grid");if(g){const w=document.createElement("div");w.id="puissWrap";w.className="field";w.style.marginTop="10px";
    w.innerHTML=`<label>Puissances du moteur choisi <span class="badge" id="puissCount">0</span></label><div class="chips" id="puissChips"></div>`;g.insertAdjacentElement("afterend",w);}}
  if(!D("engineWrap")){const a=D("puissWrap")||D("topAnalyse")?.querySelector(".grid");if(a){const w=document.createElement("div");w.id="engineWrap";w.className="field";w.style.marginTop="10px";
    w.innerHTML=`<label>Motorisations réelles du modèle <span class="badge" id="engCount">0</span></label><div class="chips" id="engChips"></div>`;a.insertAdjacentElement("afterend",w);}}
}
function majPuiss(){
  ensureUI();
  const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"",mt=D("cMoteur")?.value||"";
  const powers=knownPowers(mk,mo,mt);
  const dl=D("dlPuiss");if(dl)dl.innerHTML=powers.map(p=>`<option value="${p.ch}">`).join("");
  const chips=D("puissChips"),cnt=D("puissCount");if(cnt)cnt.textContent=powers.length;
  if(chips)chips.innerHTML=powers.length
    ?powers.slice(0,16).map(p=>`<button type="button" data-ch="${p.ch}" title="${E(p.label)}">${p.ch} ch</button>`).join("")
    :`<span class="chips-loading">${mt?"Aucune puissance pour ce moteur.":"Choisis d'abord une motorisation du modèle (ci-dessus)."}</span>`;
  return powers;
}
function renderEnginePanel(){
  ensureUI();
  const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"";
  const chips=D("engChips"),cnt=D("engCount");if(!chips)return;
  if(!mk||!mo){if(cnt)cnt.textContent=0;chips.innerHTML=`<span class="chips-loading">Sélectionne marque + modèle : motorisations réelles (essence·diesel·hybride·élec.) avec cylindrée et puissances.</span>`;return;}
  const list=enginesFor(mk,mo);if(cnt)cnt.textContent=list.length;chips.__list=list;
  chips.innerHTML=list.length
    ?list.map((e,i)=>`<button type="button" data-eng="${i}" title="source : ${E(e.src)}">${EN_BADGE[e.en]||""} ${E(e.m)} · ${e.en} · ${(e.ch||[]).join("/")} ch${e.cc?` · ${fmtCC(e.cc)}`:""}</button>`).join("")
    :`<span class="chips-loading">Aucune motorisation documentée pour ce couple.</span>`;
}
function selectEngine(e){D("cMoteur").value=e.m;autoAttribute({toast:false});D("cMoteur").dispatchEvent(new Event("change",{bubbles:true}));}
function sanitizeMotor(){
  const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"",mt=D("cMoteur")?.value||"";
  if(!mt||!mo)return;
  if(!isAttributable(mk,mo,mt)){D("cMoteur").value="";D("cPuiss").value="";
    D("autoAttrBadge")?.remove();D("energyAuto")?.remove();majPuiss();}
}
function hookUI(){
  ensureUI();
  ["cMarque","cModele"].forEach(id=>{const el=D(id);if(!el)return;
    el.addEventListener("input",()=>{renderEnginePanel();sanitizeMotor();majPuiss();reconcile();});
    el.addEventListener("change",()=>{renderEnginePanel();sanitizeMotor();majPuiss();reconcile();});});
  const cm=D("cMoteur");
  if(cm){cm.addEventListener("change",()=>{sanitizeMotor();autoAttribute();});
         cm.addEventListener("input",()=>{clearTimeout(cm.__t);cm.__t=setTimeout(()=>{sanitizeMotor();autoAttribute({toast:false});},250);});}
  D("engChips")?.addEventListener("click",e=>{const b=e.target.closest("[data-eng]");if(!b)return;
    const eng=D("engChips").__list?.[+b.dataset.eng];if(eng)selectEngine(eng);});
  D("puissChips")?.addEventListener("click",e=>{const b=e.target.closest("[data-ch]");if(!b)return;
    const cp=D("cPuiss");if(cp){cp.value=b.dataset.ch;cp.dispatchEvent(new Event("input"));cp.dispatchEvent(new Event("change"));}});
  renderEnginePanel();majPuiss();
}

/* ============ Menu riche Motorisation ============ */
function provMoteursRich(){
  const mk=D("cMarque")?.value||"",mo=D("cModele")?.value||"",cur=N(D("cMoteur")?.value||"");
  return enginesFor(mk,mo)
    .filter(e=>!cur||N(e.m).includes(cur)||cur.includes(N(e.m).split(" ")[0]))
    .map(e=>({value:e.m,label:`${EN_BADGE[e.en]||""} ${e.m} · ${e.en} · ${(e.ch||[]).join("/")} ch${e.cc?` · ${fmtCC(e.cc)}`:""}`,hint:e.src,engine:e}));
}
function attachSuggest(input,provider){
  if(!input||input.__sgDone)return;input.__sgDone=true;
  const wrap=document.createElement("div");wrap.style.position="relative";
  input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
  const list=document.createElement("div");
  list.style.cssText="position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:80;max-height:260px;overflow:auto;background:rgba(8,12,32,.98);border:1px solid var(--acc,#00e5ff);border-radius:12px;display:none;box-shadow:0 16px 44px rgba(0,0,0,.55)";
  wrap.appendChild(list);
  const open=()=>{let items=[];try{items=provider().slice(0,12);}catch(_){}
    if(!items.length){list.innerHTML=`<div style="padding:9px 11px;font-size:.76rem;color:#93a0d6">Aucune motorisation réelle pour ce modèle — vérifie marque/modèle.</div>`;list.style.display="block";return;}
    list.innerHTML=items.map((x,i)=>`<div data-i="${i}" style="padding:9px 11px;cursor:pointer;font-size:.8rem;border-bottom:1px solid rgba(255,255,255,.07)">${E(x.label)} <span style="color:#93a0d6;font-size:.66rem">[${E(x.hint)}]</span></div>`).join("");
    list.__items=items;list.style.display="block";};
  input.addEventListener("focus",open);input.addEventListener("click",open);input.addEventListener("input",open);
  list.addEventListener("mousedown",e=>{const d=e.target.closest("[data-i]");if(!d)return;e.preventDefault();
    const it=list.__items[+d.dataset.i];list.style.display="none";
    if(it.engine)selectEngine(it.engine);else{input.value=it.value;input.dispatchEvent(new Event("change",{bubbles:true}));}});
  input.addEventListener("blur",()=>setTimeout(()=>list.style.display="none",160));
}

/* ============ Notes + rapports ============ */
function powerNote(e){
  const mk=(e.marque||"").split("/")[0].trim(),mo=(e.modele||"").split("/")[0].trim();
  if(!mk||/multi|tous/i.test(mk))return "";
  const p=knownPowers(mk,mo,e.motorisation||"");
  if(!p.length)return "";
  return `<div class="de-note" style="color:#93a0d6;font-size:.72rem;margin:2px 0 8px">⚙️ Puissances : ${p.slice(0,8).map(x=>x.ch+" ch").join(" · ")}</div>`;
}
function appendPower(hostId){
  const host=D(hostId);if(!host)return;
  let v={};try{v=(typeof getVeh==="function")?getVeh():{};}catch(_){}
  if(!v.marque&&!v.modele)return;
  const eng=enginesFor(v.marque||"",v.modele||"");
  const powers=knownPowers(v.marque||"",v.modele||"",v.moteur||"");
  if(!eng.length&&!powers.length)return;
  const sec=document.createElement("div");
  sec.innerHTML=`<h3>⚙️ Motorisations &amp; puissances attribuées (${eng.length} moteurs · ${powers.length} puissances)</h3>
   ${eng.length?`<table><thead><tr><th>Motorisation</th><th>Énergie</th><th>Cylindrée</th><th>Puissances</th><th>Source</th></tr></thead><tbody>`+
     eng.slice(0,12).map(e=>`<tr><td><b>${E(e.m)}</b></td><td>${EN_BADGE[e.en]||""} ${e.en}</td><td>${fmtCC(e.cc)||"—"}</td><td>${(e.ch||[]).join("/")} ch</td><td class="small">${E(e.src)}</td></tr>`).join("")+`</tbody></table>`:""}
   ${powers.length?`<p class="small"><b>Puissances retenues :</b> ${powers.slice(0,12).map(x=>x.ch+" ch").join(" · ")}</p>`:""}`;
  host.appendChild(sec);
}

/* ============ Chaînage ============ */
function chain(){
  const _fill=window.fillDatalists,_majM=window.majModeles,_an=window.analyser,_cx=window.analyserContexte;
  window.fillDatalists=function(){if(_fill)_fill();ensureUI();renderEnginePanel();majPuiss();};
  window.majModeles=function(){if(_majM)_majM();renderEnginePanel();sanitizeMotor();majPuiss();reconcile();};
  window.majPuiss=majPuiss;
  window.analyser=async function(){if(_an)await _an();appendPower("rapport");};
  window.analyserContexte=async function(){if(_cx)await _cx();appendPower("ctxReport");};
  if(window.CATALOG_ENGINE)window.CATALOG_ENGINE.syncEnergy=()=>autoAttribute({toast:false});
}

/* ============ boot ============ */
function boot(){
  if(!D("topAnalyse"))return setTimeout(boot,120);
  chain();hookUI();
  attachSuggest(D("cMoteur"),provMoteursRich);
  setInterval(()=>{if(D("de-panel")?.classList.contains("open"))return;renderEnginePanel();reconcile();},1500);
  reconcile();
  console.log("⚙️ Power & Motorisation Engine v5 prêt (énergie par la chaîne + réconciliateur)");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.POWER={knownPowers,majPuiss,enginesFor,matchEngine,isAttributable,representativePower,autoAttribute,reconcile,energyOf,table:POWER_TABLE,db:ENGINE_DB,pool:MARQUE_POOL};
})();
