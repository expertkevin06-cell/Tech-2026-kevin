/* ============================================================================
   KEV TECH & FIRE — DATA ENGINE v3
   Correctifs : HTTP 404 GitHub · imports multi-projets · récolte automatique
   ============================================================================ */
(() => {
"use strict";

const SITES = [
  { id:"techkevin",   name:"TechKevin 2026",        url:"https://expertkevin06-cell.github.io/techkevin2026/" },
  { id:"mytech",      name:"My Tech by Kevin",      url:"https://expertkevin06-cell.github.io/my-tech-by-kevin/" },
  { id:"incendie",    name:"Étude incendie",        url:"https://expertkevin06-cell.github.io/etude-incendie-by-kevin/" },
  { id:"kevdiag",     name:"Kev Diag Incendie",     url:"https://expertkevin06-cell.github.io/kev-diag-incendie/" },
  { id:"autodiag",    name:"Auto Diagnostic",       url:"https://expertkevin06-cell.github.io/auto-diagnostic/" }
];
const LEGAL_URL = "https://auto-legal-by-kevin.lovable.app/";
const PROBES = [
  "data/catalogue.json","catalogue.json","data/vehicules.json","vehicules.json",
  "data/base.json","base.json","data/pannes.json","pannes.json","data/db.json","db.json",
  "data/index.json","asset-manifest.json","data/fiches.json","fiches.json",
  "data/export.json","export.json","data/manual.json","manual.json"
];
const WORKFLOW_YAML = `name: MAJ bases techniques
on:
  schedule: [{cron: "0 3 1,16 * *"}]
  workflow_dispatch:
  push:
    paths: ["data/catalogue_source.json","data/manual.json","scripts/update_bases.py"]
permissions: {contents: write}
concurrency: {group: maj-bases, cancel-in-progress: false}
jobs:
  rapide:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: pip install pillow -q && python scripts/make_icon.py || true
      - env: {PHASE: rapide}
        run: python scripts/update_bases.py
      - run: |
          git config user.name "kev-bot"
          git config user.email "actions@users.noreply.github.com"
          git add data
          git add icons || true
          git diff --cached --quiet || git commit -m "MAJ rapide bases + catalogue"
          git pull --rebase origin main || true
          git push
  nhtsa:
    needs: rapide
    runs-on: ubuntu-latest
    timeout-minutes: 320
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
        with: {ref: main}
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - env: {PHASE: nhtsa}
        run: python scripts/update_bases.py
      - run: |
          git config user.name "kev-bot"
          git config user.email "actions@users.noreply.github.com"
          git add data
          git diff --cached --quiet || git commit -m "MAJ NHTSA"
          git pull --rebase origin main || true
          git push
`;

/* ---------------------------------------------------- utils ---------------------------------------------------- */
const D = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = s => (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E = s => (s||"").toString().replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T = (m, ms=4200) => { try { if (typeof toast==="function") toast(m, ms); else console.log(m); } catch(_) { console.log(m); } };
const arr = v => Array.isArray(v) ? v.map(x=>String(x).trim()).filter(Boolean)
               : typeof v==="string" ? v.replace(/;/g,"\n").split(/\r?\n/).map(x=>x.trim()).filter(Boolean) : [];
const hash = s => { let h=2166136261; for (let i=0;i<s.length;i++){ h^s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); };
const sig = e => e.id || hash([e.source,e.campagne,e.marque,e.modele,e.motorisation,e.defaut].map(N).join("|"));
const years = v => { const m=String(v??"").match(/(?:19|20)\d{2}/g); return m ? [Math.min(...m.map(Number)), Math.max(...m.map(Number))] : null; };
const power = v => {
  const t=String(v??"").toLowerCase(); const n=Number((t.match(/\d{2,4}/)||[])[0]);
  if(!n) return {ch:0,kw:0};
  return /kw/.test(t) ? {ch:Math.round(n*1.35962),kw:n} : {ch:n,kw:Math.round(n/1.35962)};
};
const energy = o => {
  const t=N(typeof o==="string"?o:JSON.stringify(o||{}));
  if(/electrique|electric|bev|kwh|e tron|e tech electric|bev/.test(t)) return "electrique";
  if(/hybrid|phev|hev|e tech hybrid|recharge/.test(t)) return "hybride";
  if(/diesel|tdi|hdi|dci|crdi|bluehdi|cdti|jtd|multijet|d 4d/.test(t)) return "diesel";
  if(/essence|tsi|tfsi|thp|puretech|ecoboost|gdi|skyactiv g/.test(t)) return "essence";
  return "";
};
const FIRE = /incendie|feu\b|flamme|embras|brulure|inflamm|\bfire\b|flamm|ignit|burn|thermal runaway/i;
const ENGINE = /^\d[.,]\d|kwh|e-?tech|e-?tron|electric|electri|hybrid|phev|hev\b|tce|tsi|tfsi|tdi|hdi|dci|cdti|crdi|gdi|puretech|ecoboost|skyactiv|thp|jtd|multijet|d-4d|e-power|dm-i|bev/i;
const BRANDS = new Set("abarth|aiways|alfa romeo|alpine|ariel|aston martin|audi|bentley|bmw|byd|cadillac|caterham|chery|chevrolet|chrysler|citroen|cupra|dacia|daihatsu|dodge|ds|ferrari|fiat|fisker|ford|geely|genesis|gmc|honda|hongqi|hyundai|infiniti|isuzu|jaecoo|jaguar|jeep|kia|ktm|lada|lamborghini|lancia|land rover|leapmotor|lexus|lincoln|lotus|lucid|lynk co|mahindra|maserati|mazda|mclaren|mercedes benz|mg|mini|mitsubishi|nio|nissan|omoda|opel|ora|peugeot|polestar|porsche|ram|renault|rivian|rolls royce|rover|saab|seat|seres|skoda|smart|ssangyong|subaru|suzuki|tata|tesla|toyota|vinfast|volkswagen|volvo|xpeng|zeekr".split("|"));
const get = (o,...ks) => { for(const k of ks){ const f=Object.keys(o||{}).find(x=>N(x).replace(/ /g,"")===N(k).replace(/ /g,"")); if(f && o[f]!=null && o[f]!=="") return o[f]; } return ""; };

/* ---------------------------------------------------- IndexedDB ---------------------------------------------------- */
const IDB = {
  db:null,
  open(){ return new Promise((res)=>{
    if(this.db) return res(this.db);
    if(!window.indexedDB) return res(null);
    const r=indexedDB.open("kevtf-data-engine",3);
    r.onupgradeneeded=()=>{ const d=r.result; if(!d.objectStoreNames.contains("kv")) d.createObjectStore("kv"); };
    r.onsuccess=()=>{ this.db=r.result; res(this.db); };
    r.onerror=()=>res(null);
  });},
  async get(k){ const d=await this.open(); if(!d) return null; return new Promise(res=>{ const t=d.transaction("kv").objectStore("kv").get(k); t.onsuccess=()=>res(t.result||null); t.onerror=()=>res(null); }); },
  async set(k,v){ const d=await this.open(); if(!d) return false; return new Promise(res=>{ const t=d.transaction("kv","readwrite").objectStore("kv").set(v,k); t.onsuccess=()=>res(true); t.onerror=()=>res(false); }); },
  async del(k){ const d=await this.open(); if(!d) return false; return new Promise(res=>{ const t=d.transaction("kv","readwrite").objectStore("kv").delete(k); t.onsuccess=()=>res(true); t.onerror=()=>res(false); }); }
};

/* ---------------------------------------------------- catalogue minimal de secours ---------------------------------------------------- */
const FALLBACK = {
  marques:"Abarth|Alfa Romeo|Alpine|Audi|Bentley|BMW|BYD|Cadillac|Chevrolet|Chrysler|Citroën|Cupra|Dacia|Dodge|DS|Ferrari|Fiat|Ford|Genesis|GMC|Honda|Hyundai|Infiniti|Isuzu|Jaecoo|Jaguar|Jeep|Kia|Lamborghini|Lancia|Land Rover|Leapmotor|Lexus|Lincoln|Lotus|Maserati|Mazda|McLaren|Mercedes-Benz|MG|Mini|Mitsubishi|Nio|Nissan|Omoda|Opel|Peugeot|Polestar|Porsche|RAM|Renault|Rivian|Rolls-Royce|SEAT|Skoda|Smart|SsangYong|Subaru|Suzuki|Tata|Tesla|Toyota|VinFast|Volkswagen|Volvo|Xpeng|Zeekr".split("|"),
  modeles:{
    "Skoda":["Citigo","Elroq","Enyaq","Enyaq Coupé","Fabia","Kamiq","Karoq","Kodiaq","Octavia","Octavia Combi","Rapid","Roomster","Scala","Superb","Superb Combi","Yeti"],
    "Volkswagen":["Amarok","Arteon","Caddy","Crafter","Golf","ID.3","ID.4","ID.5","ID.7","ID.Buzz","Passat","Polo","T-Cross","T-Roc","Tiguan","Touareg","Touran","Transporter","Up","e-Golf"],
    "Peugeot":["107","108","2008","206","207","208","3008","301","307","308","308 SW","408","5008","508","508 SW","Boxer","Expert","Partner","Rifter","RCZ","Traveller","e-208","e-2008","e-3008","e-5008"],
    "Renault":["Arkana","Austral","Captur","Clio","Espace","Kadjar","Kangoo","Koleos","Megane","Megane E-Tech","Rafale","R5","Scenic","Symbioz","Trafic","Twingo","Zoe"],
    "Citroën":["Berlingo","C1","C2","C3","C3 Aircross","C4","C4 Cactus","C4 Picasso","C5","C5 Aircross","C5 X","DS3","DS4","DS5","Jumpy","SpaceTourer","e-C4","ë-C3"],
    "Dacia":["Bigster","Duster","Jogger","Logan","Sandero","Sandero Stepway","Spring"],
    "Tesla":["Model 3","Model S","Model X","Model Y","Cybertruck"],
    "BMW":["i3","i4","i5","i7","iX","iX1","iX2","iX3","Serie 1","Serie 2","Serie 3","Serie 4","Serie 5","Serie 7","X1","X2","X3","X4","X5","X6","X7","Z4"],
    "Mercedes-Benz":["Classe A","Classe B","Classe C","Classe E","Classe S","CLA","CLS","EQA","EQB","EQC","EQE","EQS","GLA","GLB","GLC","GLE","GLS","SL","AMG GT","Vito","Sprinter"],
    "Audi":["A1","A3","A4","A5","A6","A7","A8","e-tron","e-tron GT","Q2","Q3","Q4 e-tron","Q5","Q6 e-tron","Q7","Q8","R8","TT"],
    "Kia":["Ceed","EV3","EV6","EV9","Niro","Optima","Picanto","ProCeed","Rio","Sorento","Soul","Sportage","Stinger","Stonic","XCeed"],
    "Hyundai":["Bayon","i10","i20","i30","Ioniq","Ioniq 5","Ioniq 6","Ioniq 9","Kona","Nexo","Santa Fe","Tucson","Inster"],
    "Toyota":["Auris","Aygo","Aygo X","bZ4X","C-HR","Camry","Corolla","Corolla Cross","Hilux","Land Cruiser","Mirai","Prius","RAV4","Supra","Yaris","Yaris Cross"],
    "Nissan":["Ariya","Juke","Leaf","Micra","Navara","Qashqai","Qashqai e-Power","Townstar","X-Trail"],
    "Ford":["EcoSport","Fiesta","Focus","Kuga","Mustang","Mustang Mach-E","Puma","Ranger","Transit","Transit Custom","Explorer Electric"],
    "Opel":["Astra","Corsa","Corsa-e","Crossland","Grandland","Grandland Electric","Insignia","Mokka","Vivaro","Zafira"],
    "MG":["MG4","MG4 XPower","MG5","HS","E-HS9","Marvel R","ZS","ZS EV","Cyberster"],
    "BYD":["Atto 3","Dolphin","Han","Seal","Seal U","Seagull","Tang"],
    "Volvo":["EC40","EX30","EX40","EX90","S60","S90","V60","V90","XC40","XC60","XC90"],
    "Cupra":["Born","Formentor","Leon","Tavascan","Terramar"],
    "DS":["DS3","DS3 Crossback","DS4","DS5","DS7 Crossback","DS7 E-Tense 4x4","DS9"]
  },
  motorisations:"1.0 EcoBoost|1.0 MPI|1.0 TSI|1.2 PureTech|1.2 TCe|1.5 BlueHDi|1.5 dCi|1.6 BlueHDi|1.6 HDi|1.6 THP|1.6 TDI|2.0 BlueHDi|2.0 TDI|2.0 TSI|2.0 TFSI|E-Tech Hybrid|E-Tech Electric|e-Power|DM-i PHEV|T8 Recharge|Électrique 50 kWh|Électrique 52 kWh|Électrique 58 kWh|Électrique 59 kWh|Électrique 60 kWh|Électrique 64 kWh|Électrique 77 kWh|Électrique 82 kWh|Électrique 84 kWh|Électrique 99 kWh".split("|"),
  versions:[
    {marque:"Skoda",modele:"Elroq",energie:"electrique",annees:[2024,2027],v:[["Elroq 50",125,170,"52 kWh utiles"],["Elroq 60",150,204,"59 kWh utiles"],["Elroq 85",210,286,"77 kWh utiles"],["Elroq 85x AWD",210,286,"77 kWh utiles"],["Elroq RS",250,340,"79 kWh utiles"]]},
    {marque:"Skoda",modele:"Enyaq",energie:"electrique",annees:[2020,2027],v:[["iV 50",109,148,"52 kWh"],["iV 60",132,180,"58 kWh"],["iV 80",150,204,"77 kWh"],["80x AWD",195,265,"77 kWh"],["85",210,286,"77 kWh"],["85x AWD",210,286,"77 kWh"],["RS",250,340,"79 kWh"]]},
    {marque:"Volkswagen",modele:"ID.3",energie:"electrique",annees:[2019,2027],v:[["Pure",125,170,"52 kWh"],["Pro",150,204,"58 kWh"],["Pro S",150,204,"77 kWh"],["GTX",240,326,"79 kWh"]]},
    {marque:"Volkswagen",modele:"ID.4",energie:"electrique",annees:[2020,2027],v:[["Pure",125,170,"52 kWh"],["Pro",150,204,"77 kWh"],["Pro 4MOTION",195,265,"77 kWh"],["GTX",250,340,"79 kWh"]]},
    {marque:"Renault",modele:"Megane E-Tech",energie:"electrique",annees:[2022,2027],v:[["EV40",96,130,"40 kWh"],["EV60",160,220,"60 kWh"]]},
    {marque:"Renault",modele:"R5",energie:"electrique",annees:[2024,2027],v:[["EV40",90,120,"40 kWh"],["EV52",110,150,"52 kWh"]]},
    {marque:"Tesla",modele:"Model 3",energie:"electrique",annees:[2017,2027],v:[["Propulsion",208,283,"~60 kWh"],["Long Range AWD",366,498,"~75 kWh"],["Performance",340,460,"~75 kWh"]]},
    {marque:"Tesla",modele:"Model Y",energie:"electrique",annees:[2020,2027],v:[["Propulsion",220,299,"~60 kWh"],["Long Range AWD",378,514,"~75 kWh"],["Performance",393,534,"~75 kWh"]]},
    {marque:"Hyundai",modele:"Ioniq 5",energie:"electrique",annees:[2021,2027],v:[["58 kWh RWD",125,170,"58 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"],["N",478,650,"84 kWh"]]},
    {marque:"Kia",modele:"EV6",energie:"electrique",annees:[2021,2027],v:[["58 kWh RWD",125,170,"58 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"],["GT",448,609,"77 kWh"]]},
    {marque:"MG",modele:"MG4",energie:"electrique",annees:[2022,2027],v:[["Standard",125,170,"51 kWh"],["Comfort/Luxury",150,204,"64 kWh"],["Trophy ER",180,245,"77 kWh"],["XPower",320,435,"64 kWh"]]},
    {marque:"BMW",modele:"i4",energie:"electrique",annees:[2021,2027],v:[["eDrive35",210,286,"66 kWh"],["eDrive40",250,340,"81 kWh"],["M50",400,544,"81 kWh"]]},
    {marque:"Volvo",modele:"EX30",energie:"electrique",annees:[2023,2027],v:[["Single Motor",200,272,"51 kWh"],["Single Motor ER",200,272,"69 kWh"],["Twin Performance",315,428,"69 kWh"]]}
  ]
};

/* ---------------------------------------------------- structure catalogue ---------------------------------------------------- */
function newCat(){ return {marques:new Set(), modeles:new Map(), motorisations:new Set(), versions:new Map(), powers:new Set()}; }
function addModel(c,b,m){ b=String(b||"").trim(); m=String(m||"").trim(); if(!b||!m||m.length>60) return; if(!c.modeles.has(b)) c.modeles.set(b,new Set()); c.modeles.get(b).add(m); c.marques.add(b); }
function addVersion(c,o){
  const b=String(get(o,"marque","brand","make")||"").split("/")[0].trim();
  const m=String(get(o,"modele","model","modèle")||"").trim();
  if(!b||!m) return;
  addModel(c,b,m);
  const mot=String(get(o,"motorisation","engine","moteur","version","trim")||"").trim();
  const p=power(get(o,"puissance","power","ch","kw","puissance_ch","puissance_kw"));
  const note=String(get(o,"batterie","battery","note","kwh")||"").trim();
  const en=String(get(o,"energie","energy","fuel")||"").toLowerCase() || energy(o);
  const key=N(b)+"|"+N(m);
  if(!c.versions.has(key)) c.versions.set(key,{marque:b,modele:m,energie:en,annees:years(get(o,"annees","years","annee","modelYear")),v:[]});
  const v=c.versions.get(key);
  if(en && !v.energie) v.energie=en;
  if(mot||p.ch){ const row=[mot||"Version",p.kw,p.ch,note]; if(!v.v.some(x=>N(x[0])===N(row[0])&&x[2]===row[2])) v.v.push(row); }
  if(mot) c.motorisations.add(mot);
  if(p.ch) c.powers.add(p.ch);
}
function catPlain(c){
  const modeles={}; for(const [k,v] of c.modeles) modeles[k]=[...v].sort();
  const versions=[...c.versions.values()].map(v=>({...v,v:v.v.slice()}));
  return {marques:[...c.marques].sort(), modeles, motorisations:[...c.motorisations].sort(), powers:[...c.powers].sort((a,b)=>a-b), versions};
}
function catFrom(o){
  const c=newCat();
  (o?.marques||[]).forEach(x=>c.marques.add(String(x).trim()));
  for(const [k,v] of Object.entries(o?.modeles||{})){
    if(Array.isArray(v)) v.forEach(m=>addModel(c,k,m));
    else if(v && typeof v==="object") Object.keys(v).forEach(m=>addModel(c,k,m));
  }
  (o?.motorisations||[]).forEach(x=>c.motorisations.add(String(x).trim()));
  (o?.powers||o?.puissances||[]).forEach(x=>{const p=power(x); if(p.ch) c.powers.add(p.ch);});
  (o?.versions||o?.vehicules||[]).forEach(v=>{
    if(!v||typeof v!=="object") return;
    if(Array.isArray(v.v)){
      const key=N(v.marque)+"|"+N(v.modele);
      c.versions.set(key,{marque:v.marque,modele:v.modele,energie:v.energie||"",annees:v.annees||null,v:v.v.filter(Array.isArray)});
      addModel(c,v.marque,v.modele);
    } else addVersion(c,v);
  });
  return c;
}
function catMerge(a,b){
  const c=newCat();
  for(const x of [a,b]){
    x.marques.forEach(v=>c.marques.add(v));
    x.motorisations.forEach(v=>c.motorisations.add(v));
    x.powers.forEach(v=>c.powers.add(v));
    for(const [k,v] of x.modeles) v.forEach(m=>addModel(c,k,m));
    for(const [k,v] of x.versions){
      if(!c.versions.has(k)) c.versions.set(k,{...v,v:[]});
      const t=c.versions.get(k);
      if(v.energie&&!t.energie) t.energie=v.energie;
      if(v.annees&&!t.annees) t.annees=v.annees;
      (v.v||[]).forEach(r=>{ if(!t.v.some(z=>N(z[0])===N(r[0])&&z[2]===r[2])) t.v.push(r); });
    }
  }
  return c;
}

/* ---------------------------------------------------- normalisation universelle ---------------------------------------------------- */
const FKEYS = ["defaut","titre","title","panne","libelle","fault","failure","nom","mecanisme","mechanisme","cause","consequences","symptomes","indices","systeme","dtc","campagne"];
function isFault(o){
  const k=Object.keys(o).map(x=>N(x));
  const hasTitle=!!get(o,"defaut","titre","title","panne","libelle","fault","failure","nom","summary");
  const hasTech=!!get(o,"mecanisme","mechanisme","cause","causes","consequences","symptomes","indices","systeme","dtc","campagne");
  return hasTitle && hasTech && k.length>2;
}
function isVehicle(o){
  return !!get(o,"marque","brand","make") && !!get(o,"modele","model","modèle") &&
         !!get(o,"motorisation","engine","moteur","version","trim","puissance","power","ch","kw");
}
function normFault(o,src){
  const raw=JSON.stringify(o);
  const feu=FIRE.test(raw);
  const an=years(get(o,"annees","years","annee","modelYear","year")) || years(get(o,"defaut","titre","title","summary"));
  const dtc=[...new Set([...arr(get(o,"dtc","codes","codesDefaut","dtcCodes")), ...(String(raw).toUpperCase().match(/[PCBU]\d{4}/g)||[])])];
  const camp=String(get(o,"campagne","campaign","recall","numero_fiche","caseNumber","NHTSACampaignNumber")||"");
  const source=String(get(o,"source")||src||"import").trim();
  const e={
    id:String(get(o,"id")||"imp-"+hash(N(source+camp+String(get(o,"marque","brand","make"))+String(get(o,"modele","model"))+String(get(o,"defaut","titre","title","panne","libelle","summary")))),
    themes:Array.isArray(o.themes)?o.themes:["technique",...(feu?["incendie"]:[])],
    type:String(get(o,"type")||(camp?"rappel":"panne")),
    source, marque:String(get(o,"marque","brand","make")||"Multi-marques"),
    modele:String(get(o,"modele","model","modèle")||"Tous"),
    motorisation:String(get(o,"motorisation","engine","moteur","version")||""),
    annees:an, energie:String(get(o,"energie","energy","fuel")||"").toLowerCase()||energy(o),
    systeme:String(get(o,"systeme","system","organe","component")||""),
    dtc, symptomes:arr(get(o,"symptomes","symptômes","symptoms","indices")),
    defaut:String(get(o,"defaut","titre","title","panne","libelle","fault","failure","nom","summary")||"Fiche importée").slice(0,400),
    mecanisme:String(get(o,"mecanisme","mécanisme","mechanisme","cause","causes","description","summary","motif_rappel","danger")||""),
    consequences:arr(get(o,"consequences","conséquences","consequence","risques_encourus","risques")),
    indices:arr(get(o,"indices","preuves","evidence")),
    risque_feu:o.risque_feu===true||feu,
    chaine_feu:String(get(o,"chaine_feu","chaineFeu","fireChain")||(feu?"Défaut documenté → mécanisme à expertiser → risque d'incendie à confirmer":"")),
    gravite:String(get(o,"gravite","severity")||(feu?"critique":"eleve")),
    campagne:camp, url:String(get(o,"url","source_url","lien","link","lien_vers_la_fiche_rappel")||""),
    date:String(get(o,"date","date_publication","publicationDate","ReportReceivedDate")||"").slice(0,10)
  };
  return e;
}
function classifyStrings(a,ctx,c){
  const key=N(ctx.key||"");
  const vals=a.map(x=>String(x).trim()).filter(Boolean);
  if(/marque|brand|make/.test(key)){ vals.forEach(x=>c.marques.add(x)); return; }
  if(/modele|model/.test(key)){ vals.forEach(x=>addModel(c,ctx.marque||"Modèles importés",x)); return; }
  if(/motorisation|moteur|engine|version|trim/.test(key)){ vals.forEach(x=>c.motorisations.add(x)); return; }
  if(/puissance|power|ch\b|kw/.test(key)){ vals.forEach(x=>{const p=power(x); if(p.ch)c.powers.add(p.ch);}); return; }
  const brands=vals.filter(x=>BRANDS.has(N(x)));
  const engines=vals.filter(x=>ENGINE.test(x));
  const powers=vals.filter(x=>/^\d{2,4}\s?(ch|kw|cv)?$/i.test(x));
  if(brands.length>=Math.max(3,vals.length*.4)) brands.forEach(x=>c.marques.add(x));
  else if(engines.length>=Math.max(3,vals.length*.35)) engines.forEach(x=>c.motorisations.add(x));
  else if(powers.length>=Math.max(3,vals.length*.5)) powers.forEach(x=>{const p=power(x); if(p.ch)c.powers.add(p.ch);});
  else vals.forEach(x=>{ if(x.length<45) addModel(c,ctx.marque||"Modèles importés",x); });
}
function normalizeAny(input,src){
  const c=newCat(), entries=[], seen=new Set();
  const push=e=>{ const k=sig(e); if(seen.has(k))return; seen.add(k); entries.push(e); };
  const walk=(node,ctx,depth)=>{
    if(depth>7 || node==null) return;
    if(Array.isArray(node)){
      if(node.length && node.every(x=>typeof x==="string")){ classifyStrings(node,ctx,c); return; }
      node.forEach(x=>walk(x,ctx,depth+1)); return;
    }
    if(typeof node!=="object") return;
    const mk=get(node,"marque","brand","make"); const my={...ctx};
    if(mk) my.marque=String(mk).split("/")[0].trim();
    if(isFault(node)) push(normFault(node,src));
    if(isVehicle(node)) addVersion(c,node);
    for(const [k,v] of Object.entries(node)){
      if(Array.isArray(v) && v.length && v.every(x=>typeof x==="string")){ classifyStrings(v,{...my,key:k},c); continue; }
      if(v && typeof v==="object") walk(v,{...my,key:k},depth+1);
    }
  };
  walk(input,{},0);
  return {entries,cat:c};
}

/* ---------------------------------------------------- extraction depuis bundles JS ---------------------------------------------------- */
function* jsonArrays(txt){
  const limit=Math.min(txt.length, 4_000_000);
  let count=0;
  for(let i=0;i<limit-1;i++){
    if(txt[i]!=="[" || (txt[i+1]!=="{" && txt[i+1]!=='"' && txt[i+1]!=="[")) continue;
    let depth=0, str=false, escp=false;
    for(let j=i;j<limit;j++){
      const ch=txt[j];
      if(str){ if(escp)escp=false; else if(ch==="\\")escp=true; else if(ch==='"')str=false; }
      else{ if(ch==='"')str=true; else if(ch==="["||ch==="{")depth++; else if(ch==="]"||ch==="}"){ depth--; if(depth===0){ const raw=txt.slice(i,j+1); if(raw.length>40){ let v=null; try{ v=JSON.parse(raw); }catch(_){ try{ v=JSON.parse(raw.replace(/`/g,'"')); }catch(__){} } if(Array.isArray(v)){ yield v; count++; } } break; } } }
    }
    if(count>600) return;
  }
}
async function fetchText(url,ms=20000){
  const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),ms);
  try{ const r=await fetch(url,{cache:"no-store",signal:ctrl.signal}); clearTimeout(to); return r.ok ? await r.text() : ""; }
  catch(_){ clearTimeout(to); return ""; }
}
async function harvestSite(site){
  const blobs=[]; const html=await fetchText(site.url);
  if(!html) throw new Error("HTML inaccessible (CORS ou réseau)");
  blobs.push(html);
  const urls=new Set();
  for(const m of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|json)[^"']*)["']/g)) urls.add(new URL(m[1],site.url).href);
  for(const p of PROBES){ const u=new URL(p,site.url).href; const t=await fetchText(u,9000); if(t && /^[\s]*[{\[]/.test(t)) blobs.push(t); }
  let bytes=html.length, n=0;
  const queue=[...urls];
  while(queue.length && n<26 && bytes<9_000_000){
    const u=queue.shift();
    if(!/^https:\/\/expertkevin06-cell\.github\.io\//.test(u)) continue;
    const t=await fetchText(u,20000); if(!t) continue;
    blobs.push(t); bytes+=t.length; n++;
    for(const m of t.matchAll(/["'`]((?:\.\/)?(?:assets\/)?[A-Za-z0-9_.\-]+\.(?:js|json))["'`]/g)){
      const nu=new URL(m[1],u).href;
      if(/^https:\/\/expertkevin06-cell\.github\.io\//.test(nu)) queue.push(nu);
    }
    await sleep(10);
  }
  const c=newCat(), entries=[];
  for(const b of blobs){
    let parsed=null; try{ parsed=JSON.parse(b); }catch(_){}
    if(parsed){ const r=normalizeAny(parsed,site.id); r.entries.forEach(x=>entries.push(x)); catMerge(c,r.cat); }
    for(const a of jsonArrays(b)){ const r=normalizeAny(a,site.id); entries.forEach; r.entries.forEach(x=>entries.push(x)); for(const [k,v] of r.cat.modeles) v.forEach(m=>addModel(c,k,m)); r.cat.marques.forEach(x=>c.marques.add(x)); r.cat.motorisations.forEach(x=>c.motorisations.add(x)); for(const v of r.cat.versions.values()) addVersion(c,{marque:v.marque,modele:v.modele,motorisation:(v.v[0]||[])[0],puissance:(v.v[0]||[])[2]}); }
    await sleep(0);
  }
  return {entries,cat:c};
}

/* ---------------------------------------------------- fusion + application ---------------------------------------------------- */
let ENGINE_CAT=newCat(), ENGINE_ENTRIES=[], LAST_LOG=[], SRC_STATE={};
function log(msg){ LAST_LOG.unshift({t:new Date().toLocaleTimeString("fr-FR"),m:msg}); LAST_LOG=LAST_LOG.slice(0,160); paintLog(); }
function paintLog(){ const el=D("de-log"); if(el) el.innerHTML=LAST_LOG.map(x=>`<div><span>${E(x.t)}</span> ${E(x.m)}</div>`).join(""); }
function paintStats(){
  const nbM=Object.values(CATALOG?.modeles||{}).flat().length;
  const nbV=CATALOG?.versions?.length||0;
  const el=D("de-stats"); if(el) el.innerHTML=`
    <div><b>${BASE.length}</b><small>fiches</small></div>
    <div><b>${CATALOG.marques.length}</b><small>marques</small></div>
    <div><b>${nbM}</b><small>modèles</small></div>
    <div><b>${CATALOG.motorisations.length}</b><small>motorisations</small></div>
    <div><b>${nbV}</b><small>véhicules chiffrés</small></div>
    <div><b>${(CATALOG.powers||[]).length}</b><small>puissances</small></div>`;
  const badge=D("baseBadge"); if(badge) badge.textContent=`🗄️ ${BASE.length} fiches • ${CATALOG.marques.length} marques • ${nbM} modèles • ${VERSION}`;
  const st=D("baseStats"); if(st) st.textContent=`Version ${VERSION} • ${BASE.length} fiches • ${CATALOG.marques.length} marques • ${nbM} modèles • ${CATALOG.motorisations.length} motorisations • ${nbV} versions`;
}
function applyData(entries,cat,versionLabel){
  const map=new Map();
  (typeof BASE!=="undefined"?BASE:[]).forEach(e=>map.set(sig(e),e));
  entries.forEach(e=>map.set(sig(e),e));
  BASE=[...map.values()];
  ENGINE_ENTRIES=BASE.slice();
  ENGINE_CAT=catMerge(catFrom(typeof CATALOG!=="undefined"?CATALOG:{}),cat);
  CATALOG=catPlain(ENGINE_CAT);
  VERSION=versionLabel||VERSION;
  try{ indexBase(); }catch(_){}
  try{ fillFilters(); fillDatalists(); renderResults(); }catch(_){}
  buildVehicleIndex();
  paintStats();
}
async function persist(){ await IDB.set("snapshot",{entries:BASE,catalogue:CATALOG,version:VERSION,ts:Date.now()}); }
async function loadSnapshot(){
  const s=await IDB.get("snapshot");
  if(s?.entries?.length){
    applyData(s.entries,catFrom(s.catalogue||{}),s.version||"cache-local");
    log(`💾 Cache local restauré : ${s.entries.length} fiches`);
  }
}

/* ---------------------------------------------------- récolte officielle ---------------------------------------------------- */
async function rappelConso(){
  const base="https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records";
  const where='categorie_produit="automobiles et moyens de déplacement"';
  let offset=0, out=[];
  while(offset<6000){
    const u=base+"?"+new URLSearchParams({where,limit:100,offset,order_by:"date_publication desc"});
    const txt=await fetchText(u,25000); if(!txt) break;
    let j; try{ j=JSON.parse(txt); }catch(_){ break; }
    const res=j.results||[]; if(!res.length) break;
    for(const r of res){
      const txt2=[r.motif_rappel,r.risques_encourus,r.description_complementaire_risque].join(" ");
      const feu=FIRE.test(txt2);
      out.push({id:"rc-"+(r.numero_fiche||hash(JSON.stringify(r))),themes:["technique",...(feu?["incendie"]:[])],type:"rappel",source:"rappelconso",
        marque:r.marque_produit||"",modele:r.modeles_ou_references||"",motorisation:"",annees:years(r.modeles_ou_references),energie:"",
        systeme:r.sous_categorie_produit||"",dtc:[],symptomes:[],defaut:(r.libelle||r.motif_rappel||"Rappel").slice(0,400),
        mecanisme:r.motif_rappel||"",consequences:[r.risques_encourus||"",r.conduites_a_tenir_par_le_consommateur||""].filter(Boolean),indices:[],
        risque_feu:feu,chaine_feu:feu?"Rappel officiel : "+txt2.slice(0,300):"",gravite:feu?"critique":"eleve",campagne:r.numero_fiche||"",
        url:r.lien_vers_la_fiche_rappel||"",date:(r.date_publication||"").slice(0,10)});
    }
    offset+=100; if(offset>=(j.total_count||0)) break;
    setProgress(offset/Math.max(1,j.total_count||1)*100);
    await sleep(120);
  }
  return out;
}
async function nhtsaVehicle(v){
  if(!v.marque||!v.modele||!navigator.onLine) return [];
  const mk=v.marque.split("/")[0].trim(), md=v.modele.trim(), yr=v.annee||new Date().getFullYear();
  const u=`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(mk)}&model=${encodeURIComponent(md)}&modelYear=${yr}`;
  const txt=await fetchText(u,20000); if(!txt) return [];
  let j; try{ j=JSON.parse(txt); }catch(_){ return []; }
  const out=[];
  for(const r of j.results||[]){
    const feu=FIRE.test((r.Summary||"")+" "+(r.Consequence||""))||r.parkIt===true;
    out.push({id:`nhtsa-${r.NHTSACampaignNumber}-${N(md)}-${yr}`,themes:["technique",...(feu?["incendie"]:[])],type:"rappel",source:"nhtsa",
      marque:mk,modele:md,motorisation:v.moteur||"",annees:[yr,yr],energie:v.energie||"",systeme:r.Component||"",dtc:[],symptomes:[],
      defaut:(r.Summary||"").slice(0,400),mecanisme:r.Summary||"",consequences:[r.Consequence||""].filter(Boolean),indices:[],
      risque_feu:feu,chaine_feu:feu?"Rappel NHTSA : "+(r.Consequence||""):"",gravite:feu||r.parkIt?"critique":"eleve",
      campagne:r.NHTSACampaignNumber||"",url:"https://www.nhtsa.gov/recalls?nhtsaId="+(r.NHTSACampaignNumber||""),date:(r.ReportReceivedDate||"").split("/").reverse().join("-")});
  }
  return out;
}

/* ---------------------------------------------------- GitHub : détection + réparation 404 ---------------------------------------------------- */
function ghTarget(){
  const manual=(D("de-repo")?.value||localStorage.getItem("kevo_repo")||"").trim();
  if(manual.includes("/")) return {owner:manual.split("/")[0],repo:manual.split("/")[1]};
  const host=location.hostname, path=location.pathname.split("/").filter(Boolean);
  const owner=host.endsWith(".github.io")?host.split(".")[0]:"expertkevin06-cell";
  const repo=path[0]||owner+".github.io";
  return {owner,repo};
}
function ghToken(){
  const v=(D("de-token")?.value||D("ghPat")?.value||localStorage.getItem("ghpat")||"").trim();
  if(v && v!=="••••••••") localStorage.setItem("ghpat",v);
  return v==="••••••••"?(localStorage.getItem("ghpat")||"" ):v;
}
async function ghFetch(path,{method="GET",token="",body=null}={}){
  const h={Accept:"application/vnd.github+json"};
  if(token) h.Authorization="Bearer "+token;
  if(body) h["Content-Type"]="application/json";
  const r=await fetch("https://api.github.com"+path,{method,headers:h,body:body?JSON.stringify(body):null});
  const text=await r.text(); let j=null; try{ j=JSON.parse(text); }catch(_){}
  return {ok:r.ok,status:r.status,json:j,text};
}
function b64utf8(s){ const bytes=new TextEncoder().encode(s); let bin=""; const CH=0x8000; for(let i=0;i<bytes.length;i+=CH) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH)); return btoa(bin); }
async function ghDetect(){
  const {owner,repo}=ghTarget(); const token=ghToken();
  localStorage.setItem("kevo_repo",owner+"/"+repo);
  log(`🔎 GitHub : ${owner}/${repo}`);
  const r=await ghFetch(`/repos/${owner}/${repo}`,{token});
  if(!r.ok){ log(`❌ Repo ${owner}/${repo} → HTTP ${r.status}. Vérifie le nom exact du dépôt.`); return null; }
  const branch=r.json.default_branch||"main";
  log(`✅ Dépôt trouvé · branche par défaut : ${branch}`);
  const w=await ghFetch(`/repos/${owner}/${repo}/actions/workflows`,{token});
  if(!w.ok){ log(`⚠️ Workflows HTTP ${w.status} (token scope workflow/Actions requis)`); return {owner,repo,branch,workflow:null}; }
  const list=w.json.workflows||[];
  log(`📋 ${list.length} workflow(s) : ${list.map(x=>x.path).join(", ")||"aucun"}`);
  const wf=list.find(x=>/maj.*bases|maj-bases|update_bases|bases.*techniques/i.test(x.name+" "+x.path)) || list[0] || null;
  if(wf) log(`🎯 Workflow cible : ${wf.path} (${wf.state})`);
  return {owner,repo,branch,workflow:wf};
}
async function ghRepairWorkflow(){
  const token=ghToken(); if(!token){ log("❌ Token GitHub manquant"); return; }
  const d=await ghDetect(); if(!d) return;
  const path=".github/workflows/maj-bases.yml";
  const cur=await ghFetch(`/repos/${d.owner}/${d.repo}/contents/${path}?ref=${encodeURIComponent(d.branch)}`,{token});
  const sha=cur.ok?cur.json.sha:null;
  const put=await ghFetch(`/repos/${d.owner}/${d.repo}/contents/${path}`,{method:"PUT",token,body:{message:"KEV — installe/répare le workflow MAJ bases",content:b64utf8(WORKFLOW_YAML),branch:d.branch,...(sha?{sha}:{})}});
  if(!put.ok){ log(`❌ Écriture workflow HTTP ${put.status} : ${put.text.slice(0,200)}`); return; }
  log("✅ Workflow installé/réparé sur "+d.branch);
  await sleep(2200);
  await ghDispatch();
}
async function ghDispatch(){
  const token=ghToken(); if(!token){ log("❌ Token GitHub manquant (classic : repo + workflow · fine-grained : Contents R/W + Actions R/W)"); return; }
  const d=await ghDetect(); if(!d) return;
  if(!d.workflow){ log("⚠️ Aucun workflow détecté — clique « Réparer le workflow »."); return; }
  const r=await ghFetch(`/repos/${d.owner}/${d.repo}/actions/workflows/${encodeURIComponent(d.workflow.path.split("/").pop())}/dispatches`,{method:"POST",token,body:{ref:d.branch}});
  if(r.status===204){ log("🚀 MAJ déclenchée. Suivi : GitHub → Actions → « MAJ bases techniques »."); pollRuns(d); }
  else log(`❌ Dispatch HTTP ${r.status} : ${r.text.slice(0,240)}`);
}
async function pollRuns(d){
  for(let i=0;i<20;i++){
    await sleep(15000);
    const r=await ghFetch(`/repos/${d.owner}/${d.repo}/actions/workflows/${encodeURIComponent(d.workflow.path.split("/").pop())}/runs?per_page=1`,{token:ghToken()});
    if(r.ok){ const run=(r.json.workflow_runs||[])[0]; if(run){ log(`⏳ Run ${run.status} · ${run.conclusion||"en cours"} · ${run.html_url}`); if(run.status==="completed"){ if(run.conclusion==="success"){ log("✅ MAJ terminée — rechargement de la base"); await bootData(true); } return; } } }
  }
}

/* ---------------------------------------------------- récolte complète ---------------------------------------------------- */
let harvesting=false;
function setProgress(p){ const el=D("de-prog"); if(el) el.style.width=Math.max(0,Math.min(100,p))+"%"; const t=D("de-prog-txt"); if(t) t.textContent=Math.round(p)+"%"; }
async function harvestAll(force=false){
  if(harvesting) return;
  const last=await IDB.get("lastHarvest");
  if(!force && last && Date.now()-last.ts<6*3600*1000){ log("⏭️ Récolte ignorée (déjà faite il y a moins de 6 h)"); return; }
  harvesting=true; setProgress(2);
  log("🛰️ Récolte automatique démarrée");
  const c=newCat(); let all=[];
  for(let i=0;i<SITES.length;i++){
    const s=SITES[i];
    try{
      log(`→ ${s.name}`);
      const r=await harvestSite(s);
      all=all.concat(r.entries);
      catMerge(c,r.cat);
      SRC_STATE[s.id]={ok:true,entries:r.entries.length,marques:r.cat.marques.size,modeles:[...r.cat.modeles.values()].reduce((a,v)=>a+v.size,0)};
      log(`✅ ${s.name} : ${r.entries.length} fiches · ${r.cat.marques.size} marques · ${[...r.cat.modeles.values()].reduce((a,v)=>a+v.size,0)} modèles`);
    }catch(err){ SRC_STATE[s.id]={ok:false,error:err.message}; log(`⚠️ ${s.name} : ${err.message}`); }
    setProgress(5+(i+1)/SITES.length*55); await sleep(50);
  }
  if(navigator.onLine){
    try{ log("→ RappelConso (source officielle)"); const rc=await rappelConso(); all=all.concat(rc); log(`✅ RappelConso : ${rc.length} fiches`); }
    catch(err){ log("⚠️ RappelConso : "+err.message); }
  }
  setProgress(80);
  applyData(all,c,"auto-harvest-"+new Date().toISOString().slice(0,10));
  await persist(); await IDB.set("lastHarvest",{ts:Date.now()});
  setProgress(100);
  log(`🎉 Base fusionnée : ${BASE.length} fiches · ${CATALOG.marques.length} marques · ${Object.values(CATALOG.modeles).flat().length} modèles`);
  harvesting=false;
  T("🛰️ Récolte terminée : "+BASE.length+" fiches disponibles.");
}

/* ---------------------------------------------------- import universel ---------------------------------------------------- */
async function importFiles(files){
  const c=newCat(); let all=[], count=0;
  for(const f of files){
    log(`📥 Import ${f.name} (${Math.round(f.size/1024)} Ko)`);
    const ext=(f.name.split(".").pop()||"").toLowerCase();
    try{
      if(ext==="json"){
        const j=JSON.parse(await f.text());
        const r=normalizeAny(j,f.name.replace(/\.json$/i,""));
        all=all.concat(r.entries); catMerge(c,r.cat); count+=r.entries.length;
        log(`✅ ${f.name} : ${r.entries.length} fiches · ${r.cat.marques.size} marques · ${[...r.cat.modeles.values()].reduce((a,v)=>a+v.size,0)} modèles`);
      } else if(["txt","md","csv"].includes(ext)){
        const txt=await f.text();
        const chunks=txt.split(/\n{2,}/).filter(x=>x.trim().length>40);
        const rows=chunks.map((x,i)=>({id:"doc-"+hash(f.name+i),themes:["technique",...(FIRE.test(x)?["incendie"]:[])],type:"document",source:"import-document",
          marque:"Multi-marques",modele:"Tous",motorisation:"",annees:null,energie:"",systeme:"Documentation",dtc:(x.toUpperCase().match(/[PCBU]\d{4}/g)||[]),
          symptomes:[],defaut:(f.name+" — extrait "+(i+1)).slice(0,200),mecanisme:x.slice(0,2000),consequences:[],indices:[],risque_feu:FIRE.test(x),
          chaine_feu:FIRE.test(x)?"Document importé : mécanisme incendie à expertiser":"",gravite:"modere",campagne:"",url:"",date:new Date().toISOString().slice(0,10)}));
        all=all.concat(rows); count+=rows.length;
        log(`✅ ${f.name} : ${rows.length} extraits indexés`);
      } else if(ext==="pdf"){
        log("⏳ Extraction PDF…");
        await new Promise((res,rej)=>{ if(window.pdfjsLib) return res(); const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf=await window.pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;
        let txt=""; for(let p=1;p<=Math.min(pdf.numPages,250);p++){ const pg=await pdf.getPage(p); const tc=await pg.getTextContent(); txt+=tc.items.map(x=>x.str).join(" ")+"\n"; setProgress(p/Math.min(pdf.numPages,250)*100); }
        const r=await importFiles([new File([txt],f.name.replace(/\.pdf$/i,".txt"),{type:"text/plain"})]);
        all=all.concat(r.entries); catMerge(c,r.cat); count+=r.count;
      } else { log(`⚠️ Format non pris en charge : ${ext}`); continue; }
    }catch(err){ log(`❌ ${f.name} : ${err.message}`); }
    setProgress((files.indexOf(f)+1)/files.length*100);
  }
  applyData(all,c,"import-"+new Date().toISOString().slice(0,10));
  await persist();
  T(`📥 Import terminé : ${count} éléments ajoutés.`);
  return {entries:all,cat:c,count};
}

/* ---------------------------------------------------- recherche véhicules + fiches ---------------------------------------------------- */
let VEH_INDEX=[];
function buildVehicleIndex(){
  const c=ENGINE_CAT; const seen=new Set(); VEH_INDEX=[];
  for(const v of c.versions.values()){ const k=N(v.marque)+"|"+N(v.modele); if(seen.has(k))continue; seen.add(k); VEH_INDEX.push({...v,_h:N([v.marque,v.modele,v.energie,(v.v||[]).map(x=>x[0]).join(" ")].join(" "))}); }
  for(const [b,ms] of c.modeles){ for(const m of ms){ const k=N(b)+"|"+N(m); if(seen.has(k))continue; seen.add(k); VEH_INDEX.push({marque:b,modele:m,energie:"",annees:null,v:[],_h:N(b+" "+m)}); } }
}
function searchVehicles(q,limit=14){
  const toks=N(q).split(" ").filter(Boolean); if(!toks.length)return[];
  const out=[];
  for(const v of VEH_INDEX){
    let s=0;
    for(const t of toks){
      if(N(v.marque).split(" ").includes(t)) s+=5;
      else if(N(v.modele).split(" ").includes(t)) s+=5;
      else if(N(v.marque).includes(t)) s+=3;
      else if(N(v.modele).includes(t)) s+=3;
      else if(v._h.includes(t)) s+=2;
      else if((v.v||[]).some(x=>N(x[0]).includes(t)||String(x[2])===t||String(x[1])===t)) s+=3;
    }
    if(s>=Math.min(5,toks.length*3)) out.push([s,v]);
  }
  return out.sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>x[1]);
}
function vehCard(v){
  const rows=(v.v||[]).map(x=>`<tr><td>${E(x[0]||"—")}</td><td><b>${x[2]||"—"} ch</b></td><td>${x[1]||"—"} kW</td><td>${E(x[3]||"")}</td><td><button class="de-use" data-veh='${E(JSON.stringify({m:v.marque,mo:v.modele,mt:x[0],p:x[2],e:v.energie}))}'>Utiliser</button></td></tr>`).join("");
  const veh={marque:v.marque,modele:v.modele,moteur:"",puiss:0,annee:0,energie:v.energie||""};
  let dispo=[]; try{ dispo=BASE.filter(e=>matchVehicle(e,veh)>=4); }catch(_){}
  const feu=dispo.filter(e=>e.risque_feu);
  return `<article class="de-veh"><header><b>🚗 ${E(v.marque)} ${E(v.modele)}</b><span>${v.energie?E(v.energie):"énergie à préciser"}${v.annees?" · "+v.annees[0]+"-"+v.annees[1]:""} · ${(v.v||[]).length} version(s)</span></header>
  ${rows?`<table><thead><tr><th>Version</th><th>ch</th><th>kW</th><th>Batterie</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<p class="de-note">Puissances non détaillées pour ce modèle — importées à la récolte ou via ton export.</p>`}
  <p class="de-note">🔧 ${dispo.length} fiche(s) corrélée(s)${feu.length?` dont ${feu.length} à risque d'incendie`:""}.</p>
  ${dispo.slice(0,5).map(e=>{try{return hitCard(e);}catch(_){return `<div class="hit">${E(e.defaut)}</div>`;}}).join("")}
  <button class="de-use" data-veh='${E(JSON.stringify({m:v.marque,mo:v.modele,mt:"",p:"",e:v.energie}))}'>➕ Charger ce véhicule dans l'étude</button></article>`;
}
function overrideSearch(){
  if(typeof window.renderResults!=="function") return;
  window.renderResults=function(){
    const q=(D("q")?.value||"").trim(), box=D("results"); if(!box)return;
    if(!q){ let l=[]; try{ l=(typeof search==="function"?search(""):BASE.filter(e=>THEME==="tous"||(e.themes||[]).includes(THEME))).slice(0,20);}catch(_){ l=BASE.slice(0,20); } box.innerHTML=l.map(e=>{try{return hitCard(e);}catch(_){return "";}}).join(""); return; }
    const veh=searchVehicles(q);
    let faults=[]; try{ faults=(typeof search==="function"?search(q):[]); }catch(_){}
    box.innerHTML=(veh.length?`<h3 class="de-h3">🚗 Véhicules · motorisations · puissances (${veh.length})</h3>`+veh.map(vehCard).join(""):"")+
      `<h3 class="de-h3">🔧 Pannes &amp; rappels (${faults.length})</h3>`+(faults.length?faults.map(e=>{try{return hitCard(e);}catch(_){return `<div class="hit">${E(e.defaut)}</div>`;}}).join(""):`<p class="de-note">Aucune panne pour cette saisie.</p>`);
  };
  D("results")?.addEventListener("click",e=>{
    const b=e.target.closest("[data-veh]"); if(!b)return;
    try{ const d=JSON.parse(b.dataset.veh);
      D("cMarque").value=d.m||""; D("cModele").value=d.mo||""; D("cMoteur").value=d.mt||""; D("cPuiss").value=d.p||""; if(d.e)D("cEnergie").value=d.e;
      try{ majModeles(); majPuiss?.(); }catch(_){}
      document.querySelector('[data-nav="etude"]')?.click();
      T("✅ Véhicule chargé dans l'étude de cas.");
    }catch(err){ T("❌ "+err.message); }
  });
  window.suggest=function(q){
    const box=D("qList"), n=N(q); if(!box)return;
    if(n.length<2){ box.classList.add("hidden"); return; }
    const terms=new Set();
    CATALOG.marques.forEach(x=>terms.add(x));
    for(const [b,ms] of Object.entries(CATALOG.modeles)) ms.forEach(m=>{terms.add(m);terms.add(b+" "+m);});
    CATALOG.motorisations.forEach(x=>terms.add(x));
    VEH_INDEX.forEach(v=>(v.v||[]).forEach(x=>{terms.add(v.marque+" "+v.modele+" "+x[0]);terms.add(x[0]);}));
    const hits=[...terms].filter(x=>N(x).startsWith(n)||N(x).includes(n)).slice(0,10);
    box.innerHTML=hits.map(x=>`<div data-v="${E(x)}">${E(x)}</div>`).join("");
    box.classList.toggle("hidden",!hits.length);
  };
}

/* ---------------------------------------------------- chargement distant du dépôt ---------------------------------------------------- */
async function loadRemoteRepo(){
  for(const u of ["data/index.json","data/catalogue.json","data/catalogue_source.json"]){
    const t=await fetchText(u+"?ts="+Date.now(),15000); if(!t)continue;
    let j; try{ j=JSON.parse(t); }catch(_){ continue; }
    if(u.includes("index.json") && j.chunks){
      let all=[];
      for(const f of j.chunks){ const x=await fetchText("data/"+f+"?ts="+Date.now(),25000); if(x){ try{ all=all.concat(JSON.parse(x)); }catch(_){} } }
      applyData(all,catFrom(j.catalogue||{}),j.version||"repo");
      log(`📦 Base dépôt chargée : ${all.length} fiches (${j.version})`);
    } else {
      const r=normalizeAny(j,u);
      applyData(r.entries,r.cat,"catalogue-"+new Date().toISOString().slice(0,10));
      log(`📚 Catalogue ${u} : ${r.cat.marques.size} marques`);
    }
  }
}

/* ---------------------------------------------------- UI console ---------------------------------------------------- */
function injectUI(){
  const st=document.createElement("style");
  st.textContent=`
  :root{--de1:#00e5ff;--de2:#7c4dff;--de3:#ff6d00;--de4:#00e676;--de5:#ff1744;--de6:#ffd740}
  #de-btn{border:1px solid rgba(255,255,255,.25);background:linear-gradient(135deg,var(--de1),var(--de2));color:#04102a;font-weight:900;border-radius:12px;padding:8px 12px;cursor:pointer;box-shadow:0 6px 22px rgba(0,229,255,.28)}
  #de-panel{position:fixed;inset:0;z-index:200;display:none;place-items:center;background:rgba(3,5,16,.72);backdrop-filter:blur(10px)}
  #de-panel.open{display:grid}
  #de-card{width:min(960px,96vw);max-height:92vh;overflow:auto;background:linear-gradient(160deg,rgba(11,16,44,.98),rgba(20,12,48,.98));border:1px solid rgba(255,255,255,.18);border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.6);padding:18px;scrollbar-width:thin;scrollbar-color:var(--de1) rgba(255,255,255,.06)}
  #de-card::-webkit-scrollbar{width:10px}#de-card::-webkit-scrollbar-track{background:rgba(255,255,255,.06);border-radius:10px}#de-card::-webkit-scrollbar-thumb{background:linear-gradient(var(--de1),var(--de2));border-radius:10px}
  #de-card h2{margin:0 0 4px;font-size:1.15rem;background:linear-gradient(90deg,var(--de1),var(--de3));-webkit-background-clip:text;background-clip:text;color:transparent}
  .de-sub{color:#93a0d6;font-size:.78rem;margin-bottom:14px}
  .de-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px}
  .de-grid>div{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:10px;text-align:center}
  .de-grid b{display:block;font-size:1.35rem;color:var(--de1)} .de-grid small{color:#93a0d6;font-size:.7rem}
  .de-section{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px;margin:10px 0}
  .de-section h3{margin:0 0 8px;font-size:.9rem;color:var(--de6)}
  .de-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .de-row input{flex:1;min-width:200px;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(6,10,28,.9);color:#eef2ff}
  .de-btn2{border:0;border-radius:10px;padding:10px 13px;font-weight:800;cursor:pointer;background:linear-gradient(90deg,var(--de1),var(--de2));color:#04102a}
  .de-btn2.ghost{background:rgba(255,255,255,.08);color:#eef2ff;border:1px solid rgba(255,255,255,.2)}
  .de-btn2.warn{background:linear-gradient(90deg,var(--de3),var(--de5));color:#fff}
  .de-btn2.ok{background:linear-gradient(90deg,var(--de4),var(--de1));color:#04102a}
  #de-drop{border:2px dashed rgba(0,229,255,.5);border-radius:14px;padding:18px;text-align:center;color:#93a0d6;cursor:pointer;background:rgba(0,229,255,.04)}
  #de-drop.drag{border-color:var(--de4);background:rgba(0,230,118,.1);color:#eef2ff}
  #de-log{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.72rem;background:rgba(3,6,20,.85);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;max-height:230px;overflow:auto;color:#c8d2ff;scrollbar-width:thin;scrollbar-color:var(--de2) rgba(255,255,255,.06)}
  #de-log::-webkit-scrollbar{width:8px}#de-log::-webkit-scrollbar-thumb{background:var(--de2);border-radius:8px}
  #de-log span{color:var(--de4);margin-right:6px}
  .de-prog{height:9px;background:rgba(255,255,255,.1);border-radius:8px;overflow:hidden;margin:8px 0}
  .de-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--de1),var(--de4),var(--de6));transition:width .3s}
  .de-h3{margin:14px 0 6px;color:var(--de1);font-size:.95rem}
  .de-veh{background:rgba(9,13,34,.85);border:1px solid rgba(255,255,255,.14);border-left:4px solid var(--de1);border-radius:14px;padding:12px;margin:10px 0}
  .de-veh header{display:flex;flex-direction:column;gap:2px;margin-bottom:8px}.de-veh header span{color:#93a0d6;font-size:.72rem}
  .de-veh table{width:100%;border-collapse:collapse;font-size:.76rem}.de-veh td,.de-veh th{padding:6px;border-bottom:1px solid rgba(255,255,255,.1);text-align:left}
  .de-use{border:1px solid rgba(0,229,255,.5);background:rgba(0,229,255,.12);color:var(--de1);border-radius:8px;padding:5px 9px;font-size:.72rem;cursor:pointer;font-weight:700}
  .de-note{color:#93a0d6;font-size:.74rem;margin:6px 0}
  .de-close{position:absolute;top:14px;right:16px;border:0;background:rgba(255,255,255,.1);color:#fff;border-radius:10px;padding:6px 10px;cursor:pointer}
  @media(max-width:600px){#de-card{padding:14px}.de-grid{grid-template-columns:repeat(2,1fr)}}
  `;
  document.head.appendChild(st);
  const btn=document.createElement("button"); btn.id="de-btn"; btn.textContent="🛰️ Intégration";
  document.querySelector("header")?.appendChild(btn);
  const panel=document.createElement("div"); panel.id="de-panel";
  panel.innerHTML=`<div id="de-card" style="position:relative">
    <button class="de-close" id="de-close">✕</button>
    <h2>🛰️ Console d'intégration des bases</h2>
    <div class="de-sub">Récupération automatique au lancement · imports multi-projets · réparation GitHub 404</div>
    <div class="de-grid" id="de-stats"></div>
    <div class="de-prog"><i id="de-prog"></i></div><div class="de-sub" id="de-prog-txt">0%</div>
    <div class="de-section">
      <h3>⚡ Actions</h3>
      <div class="de-row">
        <button class="de-btn2 ok" id="de-harvest">🔄 Relancer la récolte complète</button>
        <button class="de-btn2 ghost" id="de-reload">📦 Recharger le dépôt</button>
        <button class="de-btn2 ghost" id="de-export">📤 Exporter la base fusionnée</button>
        <button class="de-btn2 warn" id="de-clear">🗑️ Vider le cache local</button>
      </div>
    </div>
    <div class="de-section">
      <h3>📥 Import universel (JSON · TXT · MD · CSV · PDF)</h3>
      <div id="de-drop">Glisse tes exports ici ou <b>clique pour choisir</b><br><small>Accepte les exports de tes 5 projets :.catalogue, fiches, pannes, véhicules, versions, puissances…</small></div>
      <input type="file" id="de-file" multiple accept=".json,.txt,.md,.csv,.pdf,application/json,text/plain,application/pdf" style="display:none">
    </div>
    <div class="de-section">
      <h3>🐙 GitHub — détection &amp; réparation du 404</h3>
      <div class="de-row"><input id="de-repo" placeholder="owner/repo (auto-détecté)"><input id="de-token" type="password" placeholder="Token GitHub (repo + workflow)" autocomplete="off"></div>
      <div class="de-row" style="margin-top:8px">
        <button class="de-btn2 ghost" id="de-ghdetect">🔎 Tester le dépôt</button>
        <button class="de-btn2" id="de-ghrepair">🛠️ Installer/réparer le workflow</button>
        <button class="de-btn2 ok" id="de-ghdispatch">🚀 Déclencher la MAJ</button>
      </div>
      <div class="de-sub" style="margin-top:8px">Token classic : <b>repo + workflow</b> · Fine-grained : <b>Contents R/W + Actions R/W + Metadata R</b>. Le 404 vient almost toujours d'un dépôt mal nommé ou d'un workflow absent.</div>
    </div>
    <div class="de-section"><h3>📜 Journal temps réel</h3><div id="de-log"></div></div>
  </div>`;
  document.body.appendChild(panel);
  const open=()=>{ panel.classList.add("open"); paintStats(); paintLog(); };
  const close=()=>panel.classList.remove("open");
  btn.onclick=open; D("de-close").onclick=close;
  panel.addEventListener("click",e=>{ if(e.target===panel) close(); });
  D("de-repo").value=localStorage.getItem("kevo_repo")||(()=>{const t=ghTarget();return t.owner+"/"+t.repo;})();
  D("de-token").value=localStorage.getItem("ghpat")?"••••••••":"";
  D("de-harvest").onclick=()=>harvestAll(true);
  D("de-reload").onclick=async()=>{ await bootData(true); };
  D("de-export").onclick=async()=>{
    const payload={version:VERSION,exported:new Date().toISOString(),entries:BASE,catalogue:CATALOG,marques:CATALOG.marques,modeles:CATALOG.modeles,motorisations:CATALOG.motorisations,versions:CATALOG.versions,powers:CATALOG.powers};
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,1)],{type:"application/json"})); a.download="catalogue_source.json"; a.click();
    log("📤 Export catalogue_source.json généré (à déposer dans data/ du dépôt).");
  };
  D("de-clear").onclick=async()=>{ await IDB.del("snapshot"); await IDB.del("lastHarvest"); localStorage.removeItem("overlay"); location.reload(); };
  const drop=D("de-drop"), file=D("de-file");
  drop.onclick=()=>file.click();
  file.onchange=()=>{ if(file.files.length) importFiles([...file.files]); file.value=""; };
  ["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{ e.preventDefault(); drop.classList.add("drag"); }));
  ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{ e.preventDefault(); drop.classList.remove("drag"); }));
  drop.addEventListener("drop",e=>{ if(e.dataTransfer.files.length) importFiles([...e.dataTransfer.files]); });
  D("de-ghdetect").onclick=ghDetect;
  D("de-ghrepair").onclick=ghRepairWorkflow;
  D("de-ghdispatch").onclick=ghDispatch;
}

/* ---------------------------------------------------- reprise des boutons existants ---------------------------------------------------- */
function rebind(id,ev,fn){ const el=D(id); if(!el)return; const n=el.cloneNode(true); el.replaceWith(n); n.addEventListener(ev,fn); return n; }
function takeOverButtons(){
  rebind("fileImport","change",async e=>{ if(e.target.files.length) await importFiles([...e.target.files]); e.target.value=""; });
  rebind("btnReloadBase","click",async()=>{ await bootData(true); });
  rebind("btnMajServeur","click",()=>D("de-panel").classList.add("open")||ghDispatch());
  rebind("btnExportOverlay","click",()=>{
    const payload={entries:BASE,catalogue:CATALOG,marques:CATALOG.marques,modeles:CATALOG.modeles,motorisations:CATALOG.motorisations,versions:CATALOG.versions,powers:CATALOG.powers};
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,1)],{type:"application/json"})); a.download="catalogue_source.json"; a.click();
  });
  rebind("btnAnalyser","click",async()=>{
    let v={}; try{ v=getVeh(); }catch(_){}
    if(navigator.onLine && v.marque && v.modele){ log("→ NHTSA direct : "+v.marque+" "+v.modele+" "+(v.annee||"")); const r=await nhtsaVehicle(v); if(r.length){ applyData(r,newCat(),"live-nhtsa"); await persist(); log("✅ NHTSA : "+r.length+" rappel(s) ajouté(s)"); } }
    try{ analyser(); }catch(err){ T("❌ "+err.message); }
  });
  rebind("btnCtx","click",async()=>{
    let v={}; try{ v=getVeh(); }catch(_){}
    if(navigator.onLine && v.marque && v.modele){ const r=await nhtsaVehicle(v); if(r.length){ applyData(r,newCat(),"live-nhtsa"); await persist(); } }
    try{ analyserContexte(); }catch(err){ T("❌ "+err.message); }
  });
}

/* ---------------------------------------------------- boot data engine ---------------------------------------------------- */
async function bootData(force=false){
  setProgress(3);
  applyData([],catFrom(FALLBACK),"fallback-"+new Date().toISOString().slice(0,10));
  await loadSnapshot();
  await loadRemoteRepo();
  buildVehicleIndex();
  overrideSearch();
  paintStats();
  setProgress(35);
  if(navigator.onLine) harvestAll(force);
  setProgress(100);
}
function boot(){
  if(!document.querySelector("header")) return setTimeout(boot,100);
  injectUI();
  takeOverButtons();
  bootData(false);
  addEventListener("online",()=>{ log("📶 Réseau revenu → récolte"); harvestAll(false); });
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden) harvestAll(false); });
  setInterval(()=>harvestAll(false),6*3600*1000);
  log("🛰️ Data Engine v3 prêt");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();

})();
