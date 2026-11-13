/* ============================================================================
   KEV TECH & FIRE — VIN ENGINE v1
   Case « Recherche campagne par VIN » :
   • Validation VIN (17 car., alphabet ISO, chiffre de contrôle ISO 3779)
   • Décodage local immédiat (WMI→marque, 10ᵉ car.→millésime, usine, type)
   • Décodage officiel vPIC NHTSA (CORS ouvert) → marque/modèle/année/moteur
   • Recherche AUTOMATISÉE des campagnes de rappel :
       – NHTSA (recallsByVehicle sur make/model/year décodés, CORS ouvert)
       – Base massive locale (RappelConso / Safety Gate / NHTSA déjà récoltés)
         croisée par modèle + millésime
   • Bouton « Page rappels officielle <Marque> » : ouvre le BON site constructeur,
     VIN copié dans le presse-papier prêt à coller (le statut « traité / non
     traité » d'un VIN précis n'est publié que par le constructeur/concession)
   • Pré-remplit Marque / Modèle / Année / Énergie du sélecteur véhicule
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T=(m,ms=4000)=>{try{if(typeof toast==="function")toast(m,ms);else console.log(m);}catch(_){console.log(m);}};

/* ---------- WMI (3 premiers car.) → marque, hors ligne ---------- */
const WMI={
VF1:"Renault",VF2:"Renault",VF6:"Renault",VF8:"Renault",UU1:"Dacia",U1Y:"Dacia",
VF3:"Peugeot",VF7:"Citroën",VF9:"Citroën",VR1:"Peugeot",VR2:"Citroën",VF4:"Talbot",VF5:"Talbot",
W0L:"Opel",W0V:"Opel",VF6O:"Opel",ZFA:"Fiat",ZAR:"Alfa Romeo",ZAM:"Maserati",
WVW:"Volkswagen",WV1:"Volkswagen",WV2:"Volkswagen",WV3:"Volkswagen",VW1:"Volkswagen",
WAU:"Audi",TRU:"Audi",WUA:"Audi",VSS:"SEAT",VSL:"SEAT",TMB:"Skoda",TM9:"Skoda",
WBA:"BMW",WBS:"BMW",WBY:"BMW",WDB:"Mercedes-Benz",WDD:"Mercedes-Benz",W1K:"Mercedes-Benz",W1V:"Mercedes-Benz",W1W:"Mercedes-Benz",
WMW:"Mini",WP0:"Porsche",WP1:"Porsche",SAJ:"Jaguar",SAL:"Land Rover",SUF:"Land Rover",
WF0:"Ford",VS6:"Ford",FA7:"Ford",JHM:"Honda",SHH:"Honda",SHJ:"Honda",
JTD:"Toyota",SB1:"Toyota",VNK:"Toyota",JT5:"Toyota",JN1:"Nissan",SJN:"Nissan",VSK:"Nissan",
KMH:"Hyundai",KM8:"Hyundai",KMU:"Hyundai",KNA:"Kia",KNE:"Kia",KN1:"Kia",
JMZ:"Mazda",JM1:"Mazda",JMB:"Mitsubishi",MMB:"Mitsubishi",JF1:"Subaru",JF2:"Subaru",JS3:"Suzuki",JSA:"Suzuki",
5YJ:"Tesla",7SA:"Tesla",LRW:"Tesla",XP7:"Tesla",
YV1:"Volvo",YV2:"Volvo",YSM:"Volvo",LYV:"Volvo",
1G1:"Chevrolet",1GC:"Chevrolet",KL1:"Chevrolet",1GT:"GMC",1GY:"Cadillac",1C3:"Chrysler",1B3:"Dodge",2C3:"Dodge",1C4:"Jeep",1J4:"Jeep",1C6:"RAM",3C4:"Jeep",
LS5:"Chery",LZW:"Wuling",LGX:"BYD",LC0:"BYD",LSJ:"MG",LSV:"MG",L6T:"Geely",
VIN:"VinFast",RL8:"VinFast",MNB:"Ford",MRH:"Honda",MMT:"Mitsubishi",PE1:"Ford",
HES:"Baic",LFV:"Volkswagen",LGB:"Dongfeng",LBE:"Hyundai",LFM:"Toyota",LVS:"Ford",LZW2:"Wuling",
Z8N:"Nissan",AFA:"Ford",MGA:"MG",ML3:"Mitsubishi",MP1:"Isuzu",J8B:"Isuzu",
WA1:"Audi",WVG:"Volkswagen",W1Y:"Mercedes-Benz",XUF:"Peugeot",XUF3:"Peugeot",VNV:"Nissan",
U5Y:"Kia",U6Y:"Kia",KMH2:"Hyundai",KMHD:"Hyundai",KND:"Kia",KN2:"Kia",
TDM:"Toyota",MHK:"Toyota",MHT:"Toyota",JTE:"Toyota",4T1:"Toyota",5TF:"Toyota",
1FT:"Ford",1FA:"Ford",1FM:"Ford",2F":"Ford",3FA:"Ford",
1HG:"Honda",2HG:"Honda",5FN:"Honda",JHL:"Honda",
1N4:"Nissan",1N6:"Nissan",5N1:"Nissan",JN8:"Nissan",
4S3:"Subaru",4S4:"Subaru",KMHD5:"Hyundai",
WME:"Smart",W4B:"Smart",
9BW:"Volkswagen",8AW:"Volkswagen",93V:"Audi",93H:"Honda",9BR:"Toyota",8GD:"Peugeot",9FB:"Renault",8A1:"Renault",
LHB:"Beijing",LSG:"Chevrolet",LSG2:"Chevrolet",LZWAD:"Wuling",
MMS:"Suzuki",MA3:"Suzuki",MBH:"Toyota",MK2:"Nissan",
X9F:"Renault",X97:"Renault",V1V:"Renault",V1W:"Renault",
Z94:"Chevrolet",Z96:"Chevrolet",
G1W:"SsangYong",KPT:"SsangYong",
NLH:"Hyundai",TMA:"Hyundai",
LUX:"Luxgen",RFH:"Nissan",
SCA:"Rolls-Royce",SCB:"Bentley",SCF:"Aston Martin",ZFF:"Ferrari",ZHW:"Lamborghini",ZDF:"Ferrari",
JDA:"Daihatsu",JD1:"Daihatsu",
1G6:"Cadillac",1G8:"Saturn",2G1:"Chevrolet",2G2:"Pontiac",1G3:"Oldsmobile",1G8:"Saturn",
3GY:"Cadillac",1GY:"Cadillac",
W0L6:"Opel",W0V6:"Opel",
VN1:"Peugeot",V10:"Peugeot",
};
/* ---------- 10ᵉ car. → millésime ---------- */
const YEAR_CODE={"A":[1980,2010],"B":[1981,2011],"C":[1982,2012],"D":[1983,2013],"E":[1984,2014],"F":[1985,2015],"G":[1986,2016],"H":[1987,2017],"J":[1988,2018],"K":[1989,2019],"L":[1990,2020],"M":[1991,2021],"N":[1992,2022],"P":[1993,2023],"R":[1994,2024],"S":[1995,2025],"T":[1996,2026],"V":[1997,2027],"W":[1998,2028],"X":[1999,2029],"Y":[2000,2030],"1":[2001],"2":[2002],"3":[2003],"4":[2004],"5":[2005],"6":[2006],"7":[2007],"8":[2008],"9":[2009]};
function yearFromCode(c,refYear){const o=YEAR_CODE[c];if(!o)return null;if(o.length===1)return o[0];
 return (refYear-o[1]<=o[1]-o[0]&&refYear>=o[1]-1)?o[1]:o[0];}
/* ---------- chiffre de contrôle ISO 3779 ---------- */
const TR={"A":1,"B":2,"C":3,"D":4,"E":5,"F":6,"G":7,"H":8,"J":1,"K":2,"L":3,"M":4,"N":5,"P":7,"R":9,"S":2,"T":3,"U":4,"V":5,"W":6,"X":7,"Y":8,"Z":9};
const W=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
function checkDigit(vin){let s=0;for(let i=0;i<17;i++){const c=vin[i];const val=c>="0"&&c<="9"?+c:TR[c];if(val==null)return null;s+=val*W[i];}
 const r=s%11;return r===10?"X":String(r);}
function validVin(v){const u=(v||"").toUpperCase().replace(/\s/g,"");
 if(u.length!==17)return{ok:false,why:"longueur ≠ 17"};
 if(/[IOQ]/.test(u))return{ok:false,why:"caractères I, O, Q interdits"};
 if(!/^[A-HJ-NPR-Z0-9]{17}$/.test(u))return{ok:false,why:"caractères invalides"};
 const cd=checkDigit(u);const ok=cd===u[8];
 return{ok,cd,why:ok?"chiffre de contrôle valide":`chiffre de contrôle attendu ${cd}, lu ${u[8]}`};}
function decodeLocal(vin){const u=vin.toUpperCase();const ref=new Date().getFullYear();
 const wmi3=u.slice(0,3),wmi2=u.slice(0,2);
 const make=WMI[wmi3]||WMI[wmi2]||null;
 const year=yearFromCode(u[9],ref);
 return{make,year,plant:u.slice(10,11),serial:u.slice(11),wmi:wmi3};}

/* ---------- décodage officiel vPIC (CORS ouvert) ---------- */
async function vpicDecode(vin){
 try{const r=await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`);
  if(!r.ok)return null;const j=await r.json();const d=j?.Results?.[0];if(!d)return null;
  return{make:d.Make||"",model:d.Model||"",year:+(d.ModelYear||0)||0,series:d.Series||"",trim:d.Trim||"",
   body:d.BodyClass||"",plant:(d.PlantCity||"")+" "+(d.PlantCountry||""),cyl:d.EngineCylinders||"",
   disp:d.DisplacementL||"",fuel:d.FuelTypePrimary||"",err:d.ErrorCode||"",errText:d.ErrorText||""};}catch(e){return null;}}
/* ---------- campagnes NHTSA par make/model/year (CORS echo origin) ---------- */
async function nhtsaRecalls(make,model,year){
 try{const r=await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`);
  if(!r.ok)return[];const j=await r.json();return j.results||[];}catch(e){return[];}}
/* ---------- campagnes locales (RappelConso/SafetyGate/NHTSA récoltés) ---------- */
function localCampaigns(make,model,year){
 const out=[];const mk=N(make),mo=N(model);
 (typeof BASE!=="undefined"?BASE:[]).forEach(e=>{
  if(e.type!=="rappel"&&!e.campagne)return;
  const mOk=!mo||N(e.modele||"").includes(mo)||mo.includes(N(e.modele||"").split(" ")[0]);
  const bOk=!mk||N(e.marque||"").includes(mk);
  const yOk=!year||(e.annees&&year>=e.annees[0]&&year<=e.annees[1]);
  if(bOk&&mOk&&yOk)out.push(e);});
 return out.slice(0,12);}
/* ---------- pages rappels officielles constructeurs ---------- */
const BRAND_RECALL={
"peugeot":"https://www.peugeot.fr/services-et-engagements/rappels-vehicules.html",
"citroën":"https://www.citroen.fr/services-et-engagements/rappels-vehicules.html",
"citroen":"https://www.citroen.fr/services-et-engagements/rappels-vehicules.html",
"ds":"https://www.dsautomobiles.fr/services/rappels.html",
"renault":"https://www.renault.fr/services/rappels-vehicules.html",
"dacia":"https://www.dacia.fr/services/rappels-vehicules.html",
"opel":"https://www.opel.fr/services/rappels.html",
"volkswagen":"https://www.volkswagen.fr/fr/informations-utiles/campagnes-de-rappel.html",
"audi":"https://www.audi.fr/fr/fr/company/rappels.html",
"skoda":"https://www.skoda.fr/services/rappels/",
"seat":"https://www.seat.fr/services/rappels.html",
"cupra":"https://www.cupraofficial.fr/services/rappels.html",
"porsche":"https://www.porsche.com/france/fr/accessoiresetservice/rappels/",
"bmw":"https://www.bmw.fr/fr/topics/offres-et-services/apres-vente/rappel-bmw.html",
"mini":"https://www.mini.fr/fr_FR/home/service/rappels.html",
"mercedes-benz":"https://www.mercedes-benz.fr/passengercars/being-an-owner/campaigns.html",
"smart":"https://www.smart.com/fr/fr/recall",
"ford":"https://www.ford.fr/support/rappels/",
"fiat":"https://www.fiat.fr/services/rappels.html",
"alfa romeo":"https://www.alfaromeo.fr/services/rappels.html",
"jeep":"https://www.jeep.fr/services/rappels.html",
"maserati":"https://www.maserati.fr/services/rappels.html",
"toyota":"https://www.toyota.fr/services/rappels",
"lexus":"https://www.lexus.fr/rappels/",
"nissan":"https://www.nissan.fr/services/rappels.html",
"honda":"https://www.honda.fr/fr/automobiles/service/rappels.html",
"mazda":"https://www.mazda.fr/services/rappels/",
"mitsubishi":"https://www.mitsubishi-motors.fr/services/rappels/",
"subaru":"https://www.subaru.fr/rappels/",
"suzuki":"https://www.suzuki.fr/rappels/",
"hyundai":"https://www.hyundai.com/fr/fr/e-services/rappels.html",
"kia":"https://www.kia.com/fr/services/rappels/",
"volvo":"https://www.volvocars.com/fr-fr/support/rappels/",
"jaguar":"https://www.jaguar.fr/ownership/rappels.html",
"land rover":"https://www.landrover.fr/ownership/rappels.html",
"tesla":"https://www.tesla.com/vin-recall-search",
"chevrolet":"https://www.chevrolet.fr/rappels",
"peugeot pro":"https://www.peugeot.fr/services-et-engagements/rappels-vehicules.html"
};
function brandRecallUrl(make){return BRAND_RECALL[N(make||"")]||("https://www.google.com/search?q="+encodeURIComponent(make+" rappel campagne officielle VIN"));}

/* ---------- UI ---------- */
function inject(){
 if(D("vinCard"))return;
 const st=document.createElement("style");st.textContent=`
 .vin-box{font-family:ui-monospace,Menlo,monospace;letter-spacing:2px;text-transform:uppercase;font-size:1rem}
 .vin-ok{color:#69f0ae}.vin-ko{color:#ff8a80}
 .vin-kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:10px 0}
 .vin-kv>div{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:8px 10px}
 .vin-kv b{display:block;font-size:.66rem;color:#93a0d6;text-transform:uppercase;letter-spacing:.4px}
 .vin-camp{border-left:4px solid var(--amber);background:rgba(255,196,0,.06);border-radius:10px;padding:10px 12px;margin:8px 0}
 .vin-camp.us{border-left-color:#2979ff;background:rgba(41,121,255,.07)}
 .vin-camp b{font-size:.86rem}`;
 document.head.appendChild(st);
 const card=document.createElement("div");card.id="vinCard";card.className="card";
 card.innerHTML=`<h2>🔎 Recherche campagne par VIN <span class="badge" id="vinState">prêt</span></h2>
  <p class="small">Colle le <b>VIN (17 caractères, case E de la carte grise)</b> : décodage immédiat, puis recherche <b>automatisée</b> des campagnes de rappel (NHTSA + base massive FR/EU) et ouverture de la <b>page rappels officielle du constructeur</b> avec le VIN copié.</p>
  <div class="grid wide">
    <div class="field"><label for="vinInput">Numéro VIN</label>
      <input id="vinInput" class="vin-box" maxlength="17" placeholder="VF3xxxxxxxxxxxxxx" autocomplete="off" spellcheck="false"></div>
    <div class="field" style="justify-content:flex-end"><label>&nbsp;</label>
      <div><button type="button" class="btn" id="vinGo">⚙️ Analyser le VIN</button>
      <button type="button" class="btn ghost" id="vinPaste">📋 Coller</button></div></div>
  </div>
  <div id="vinOut"></div>`;
 const app=D("app");const top=D("topAnalyse");
 if(app&&top)app.insertBefore(card,top); else app?.appendChild(card);
 D("vinGo").addEventListener("click",()=>runVin());
 D("vinPaste").addEventListener("click",async()=>{try{const t=await navigator.clipboard.readText();D("vinInput").value=t.trim().slice(0,17);runVin();}catch(e){T("❌ Presse-papier indisponible — colle manuellement.");}});
 D("vinInput").addEventListener("keydown",e=>{if(e.key==="Enter")runVin();});
}
function kv(label,val){return `<div><b>${E(label)}</b>${E(val||"—")}</div>`;}
async function runVin(){
 const raw=(D("vinInput").value||"").trim().toUpperCase();
 const out=D("vinOut");const st=D("vinState");
 if(!raw){out.innerHTML="";return;}
 const v=validVin(raw);
 const loc=decodeLocal(raw);
 st.textContent=v.ok?"VIN valide":"VIN invalide";
 st.className="badge "+(v.ok?"live":"");
 let html=`<h3>1. Décodage du VIN</h3>
  <p class="small ${v.ok?"vin-ok":"vin-ko"}">${v.ok?"✅":"❌"} ${E(v.why)}${v.cd?` (attendu ${E(v.cd)})`:""}</p>
  <div class="vin-kv">${kv("WMI",loc.wmi)}${kv("Marque (WMI)",loc.make)}${kv("Millésime (10ᵉ car.)",loc.year)}${kv("Usine (11ᵉ)",loc.plant)}${kv("N° série",loc.serial)}</div>`;
 out.innerHTML=html+`<p class="small">⏳ Interrogation des sources officielles…</p>`;
 const vp=await vpicDecode(raw);
 let make=vp?.make||loc.make||"",model=vp?.model||"",year=vp?.year||loc.year||0;
 html=`<h3>1. Décodage du VIN</h3>
  <p class="small ${v.ok?"vin-ok":"vin-ko"}">${v.ok?"✅":"❌"} ${E(v.why)}</p>
  <div class="vin-kv">${kv("Marque",make)}${kv("Modèle",model||vp?.series)}${kv("Millésime",year)}${kv("Carrosserie",vp?.body)}${kv("Moteur",vp?.disp?vp.disp+" L "+(vp.cyl?vp.cyl+" cyl":""):"")}${kv("Carburant",vp?.fuel)}${kv("Usine",vp?.plant)}${kv("WMI",loc.wmi)}</div>`;
 if(vp&&vp.err&&vp.err!=="0")html+=`<p class="small vin-ko">⚠️ vPIC : ${E(vp.errText||"code "+vp.err)} — VIN partiellement décodable.</p>`;
 out.innerHTML=html+`<p class="small">⏳ Recherche des campagnes…</p>`;
 const us=make&&model&&year?await nhtsaRecalls(make,model,year):[];
 const fr=localCampaigns(make,model,year);
 html+=`<h3>2. Campagnes de rappel applicables (make/modèle/année)</h3>`;
 if(us.length){
  html+=`<p class="small"><b>🇺🇸 NHTSA :</b> ${us.length} campagne(s)</p>`+us.map(r=>{
   const feu=/fire|flamm|ignit|burn/i.test((r.Summary||"")+(r.Consequence||""));
   return `<div class="vin-camp us"><b>${E(r.NHTSACampaignNumber)}</b> · ${E(r.ReportReceivedDate||"")}
    ${r.parkIt?'<span class="tag crit">PARK IT</span>':""}${feu?'<span class="tag feu">🔥 incendie</span>':""}
    <p class="small">${E(r.Component||"")}</p><p class="small">${E((r.Summary||"").slice(0,300))}</p>
    <a class="small" href="https://www.nhtsa.gov/recalls?nhtsaId=${E(r.NHTSACampaignNumber)}" target="_blank" rel="noopener">📎 Fiche NHTSA</a></div>`;}).join("");
 } else html+=`<p class="small">Aucune campagne NHTSA pour ce make/modèle/année (marché US).</p>`;
 if(fr.length){
  html+=`<p class="small" style="margin-top:10px"><b>🇫/🇪 Base massive (RappelConso · Safety Gate · NHTSA récoltés) :</b> ${fr.length} fiche(s)</p>`+
   fr.map(e=>`<div class="vin-camp"><b>${E(e.campagne||e.source)}</b> · ${E(e.marque)} ${E(e.modele)}
    ${e.risque_feu?'<span class="tag feu">🔥 incendie</span>':""}<p class="small">${E(e.defaut)}</p>
    ${e.url?`<a class="small" href="${E(e.url)}" target="_blank" rel="noopener">📎 Source</a>`:""}</div>`).join("");
 } else html+=`<p class="small">Aucune campagne FR/EU référencée localement pour ce modèle/année.</p>`;
 const url=brandRecallUrl(make);
 html+=`<h3>3. Statut « traité / non traité » de CE VIN</h3>
  <p class="small">Le statut d'exécution d'un VIN précis n'est publié que par le constructeur. Ouvre sa page officielle (VIN déjà copié) :</p>
  <button type="button" class="btn green" id="vinBrand">🏭 Page rappels officielle ${E(make||"constructeur")}</button>
  <button type="button" class="btn ghost" id="vinCopy">📋 Copier le VIN</button>
  <button type="button" class="btn ghost" id="vinPrefill">🚗 Remplir le sélecteur véhicule</button>
  <p class="small" style="margin-top:8px">Lien : <a href="${E(url)}" target="_blank" rel="noopener">${E(url)}</a></p>`;
 out.innerHTML=html;
 D("vinBrand").onclick=async()=>{try{await navigator.clipboard.writeText(raw);}catch(_){}
  window.open(url,"_blank","noopener");T("📋 VIN copié — colle-le dans le champ de recherche du constructeur.");};
 D("vinCopy").onclick=async()=>{try{await navigator.clipboard.writeText(raw);T("📋 VIN copié.");}catch(_){T("❌ Copie impossible.");}};
 D("vinPrefill").onclick=()=>{
  if(make&&D("cMarque"))D("cMarque").value=make.split(" ")[0].replace(/\b\w/g,c=>c.toUpperCase());
  if(model&&D("cModele"))D("cModele").value=model;
  if(year&&D("cAnnee"))D("cAnnee").value=year;
  const fuel=N(vp?.fuel||"");
  if(D("cEnergie"))D("cEnergie").value=/electric/.test(fuel)?"electrique":/diesel/.test(fuel)?"diesel":/hybrid|plugin/.test(fuel)?"hybride":/gasoline|petrol|essence/.test(fuel)?"essence":D("cEnergie").value;
  if(vp?.disp&&D("cMoteur"))D("cMoteur").value=(parseFloat(vp.disp)||"")+" "+(vp.fuel||"");
  try{if(typeof majModeles==="function")majModeles();if(window.POWER?.reconcile)window.POWER.reconcile();if(window.POWER?.majPuiss)window.POWER.majPuiss();}catch(_){}
  T("✅ Sélecteur véhicule pré-rempli depuis le VIN.");};
 window._vin={vin:raw,valid:v.ok,make,model,year,us,fr};
}

function boot(){ if(!D("app"))return setTimeout(boot,120); inject(); console.log("🔎 VIN Engine v1 prêt"); }
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.VIN={validVin,decodeLocal,vpicDecode,nhtsaRecalls,localCampaigns,run:runVin};
})();
