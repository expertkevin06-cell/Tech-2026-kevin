/* ============================================================================
   KEV TECH & FIRE — EXPERT ENGINE v1  (mode ingénieur / expert / juriste)
   • Compte rendu d'expertise orienté : détermination de l'origine la plus
     probable (marque + modèle + motorisation + puissance), niveau de certitude
     (CERTAIN / PROBABLE / POSSIBLE / INDÉTERMINÉ), diagnostic différentiel,
     chaîne causale technique, volet incendie, qualification juridique, plan
     d'action & preuves, réserves de méthode, sources.
   • Prédiction de remplissage CORRÉLÉE AUX BASES sur tous les champs :
     marque, modèle, motorisation, puissance, DTC, recherche, contexte, message.
   • Détection auto des symptômes + DTC depuis le texte du contexte.
   • Corrélation live (top hypothèses) pendant la saisie du contexte.
   Se charge EN DERNIER (après power-engine.js). Chaîne/remplace les globaux.
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SYMPT_FALLBACK=["voyant allumé","perte de puissance","à-coups moteur","à-coups boîte","bruit anormal","claquement","fumée","odeur carburant","odeur brûlé","surchauffe","fuite visible","démarrage difficile","incendie / départ de feu","véhicule immobilisé","après entretien / réparation","après choc","après immersion"];
const SYMPT=(typeof SYMPT!=="undefined"?SYMPT:SYMPT_FALLBACK);

/* ================= 1. MOTEUR DE DÉTERMINATION (scoring pondéré) ================= */
function scoreHypothesis(e,v,ctxToks,dtcs,symSet){
  let s=0; const why=[];
  const vm=(typeof matchVehicle==="function")?matchVehicle(e,v):0;
  if(vm<0) return {s:-1,why:[]};
  s+=vm*2; if(vm>=4) why.push("véhicule concordant (marque/modèle)");
  if(v.moteur && N(e.motorisation||"").includes(N(v.moteur).split(" ")[0])){s+=4;why.push("motorisation concordante");}
  if(v.puiss){
    const pc=e.puissance_ch;
    if(Array.isArray(pc)&&v.puiss>=pc[0]*0.9&&v.puiss<=pc[1]*1.1){s+=4;why.push("puissance dans la plage documentée");}
    else{const kp=(window.POWER&&POWER.knownPowers)?POWER.knownPowers(v.marque,v.modele,v.moteur):[];
      if(kp.some(p=>p.ch===+v.puiss)){s+=2;why.push("puissance référencée pour ce véhicule");}}
  }
  if(v.annee&&e.annees){ if(v.annee>=e.annees[0]&&v.annee<=e.annees[1]){s+=3;why.push("millésime dans la période");} else s-=3; }
  if(v.energie&&e.energie){ if(e.energie===v.energie){s+=2;why.push("énergie concordante");} else s-=2; }
  for(const d of dtcs) if((e.dtc||[]).includes(d)){s+=8;why.push("DTC "+d+" documenté");}
  let symHit=0; for(const sy of symSet){ if((e.symptomes||[]).some(x=>N(x).includes(N(sy)))||N(e.defaut).includes(N(sy))) symHit++; }
  if(symHit){s+=symHit*3;why.push(symHit+" symptôme(s) concordant(s)");}
  let tok=0; for(const t of ctxToks){ if(N(e.defaut).includes(t))tok+=2; else if(e._h&&e._h.includes(t))tok+=1; }
  s+=tok; if(tok)why.push("termes du contexte retrouvés dans la base");
  if(e.type==="rappel"||e.campagne){s+=5;why.push("campagne officielle ("+(e.source||"")+")");}
  return {s,why};
}
function confidence(top){
  const s=top.s; let lvl,crit;
  if(s>=20 && top.why.some(w=>/DTC/.test(w)) && top.why.some(w=>/campagne/.test(w))){lvl="CERTAIN";crit="Preuves convergentes : DTC documenté + campagne officielle + véhicule/symptômes concordants ; alternatives écartées par le scoring.";}
  else if(s>=14 || (top.why.some(w=>/campagne/.test(w))&&s>=10)){lvl="PROBABLE";crit="Faisceau cohérent (véhicule + motorisation/puissance + symptômes ou campagne) ; à confirmer par mesure, lecture OBD ou expertise.";}
  else if(s>=8){lvl="POSSIBLE";crit="Mécanisme plausible et documenté pour ce véhicule ; preuves partielles, hypothèse à vérifier physiquement.";}
  else{lvl="INDÉTERMINÉ";crit="Données insuffisantes pour conclure ; expertise physique, lectures et essais requis.";}
  const pct=Math.max(5,Math.min(95,Math.round(s/25*100)));
  return {lvl,crit,pct};
}
function hypotheses(v,ctxToks,dtcs,symSet,limit=12){
  const out=[];
  for(const e of (typeof BASE!=="undefined"?BASE:[])){
    if(typeof THEME!=="undefined"&&THEME!=="tous"&&!(e.themes||[]).includes(THEME))continue;
    const r=scoreHypothesis(e,v,ctxToks,dtcs,symSet);
    if(r.s>=3)out.push({e,...r});
  }
  return out.sort((a,b)=>b.s-a.s).slice(0,limit);
}

/* ================= 2. Détection auto symptômes + DTC depuis le contexte ================= */
const SYMPT_RE={
 "voyant allumé":/voyant|témoin|warning|check engine/,
 "perte de puissance":/perte de puissance|manque de puissance|mollesse|bridé/,
 "à-coups moteur":/à-?coups|moteur.*(saccade|tressaute)|ratés/,
 "à-coups boîte":/boîte.*(à-?coups|saccade)|passages.*(brutaux|durs)/,
 "bruit anormal":/bruit|ronflement|sifflement|grincement/,
 "claquement":/claquement|cliquetis|cogne/,
 "fumée":/fumée|fume|vapeur/,
 "odeur carburant":/odeur.*(essence|gazole|carburant)|sent.*carburant/,
 "odeur brûlé":/odeur.*(brûlé|chaud|plastique)|sent.*brûlé/,
 "surchauffe":/surchauffe|température.*(monte|haute)|aiguille.*chaud/,
 "fuite visible":/fuite|flaque|suintement|goutte/,
 "démarrage difficile":/démarre.*(mal|pas)|démarrage difficile|ne part pas/,
 "incendie / départ de feu":/incendie|feu|flamme|embras|sinistre|brûlé.*véhicule/,
 "véhicule immobilisé":/immobilis|ne roule plus|panne totale|remorqu/,
 "après entretien / réparation":/après.*(entretien|réparation|garage|vidange|intervention)/,
 "après choc":/après.*(choc|accident|collision)|suite.*choc/,
 "après immersion":/immersion|inond|eau.*entrée|crue/
};
function detectSymptoms(ctx){const n=N(ctx);return SYMPT.filter(s=>{const re=SYMPT_RE[s];return re&&re.test(n);});}
function extractDTC(ctx){return [...new Set((ctx.toUpperCase().match(/[PCBU]\d{4}/g)||[]))];}

/* ================= 3. PRÉDICTION DE REMPLISSAGE corrélée aux bases ================= */
function rankMap(list){const m=new Map();list.forEach(x=>{const k=N(x);if(!k)return;m.set(k,(m.get(k)||0)+1);});return m;}
function provMarques(){const cnt=rankMap((typeof BASE!=="undefined"?BASE:[]).map(e=>(e.marque||"").split("/")[0]));
 const set=new Set([...(typeof CATALOG!=="undefined"?CATALOG.marques:[]),...cnt.keys()]);
 return [...set].map(m=>({value:m,label:m,hint:(cnt.get(N(m))||0)?cnt.get(N(m))+" fiche(s)":""}))
   .sort((a,b)=>(parseInt(b.hint)||0)-(parseInt(a.hint)||0));}
function provModeles(mk){const src=(typeof CATALOG!=="undefined"&&CATALOG.modeles)?(CATALOG.modeles[mk]||Object.entries(CATALOG.modeles).find(([k])=>N(k)===N(mk))?.[1]||[]):[];
 const cnt=rankMap((typeof BASE!=="undefined"?BASE:[]).filter(e=>N(e.marque||"").includes(N(mk))).map(e=>(e.modele||"").split("/")[0]));
 const set=new Set([...src,...cnt.keys()]);
 return [...set].map(m=>({value:m,label:m,hint:(cnt.get(N(m))||0)?cnt.get(N(m))+" fiche(s)":""}))
   .sort((a,b)=>(parseInt(b.hint)||0)-(parseInt(a.hint)||0));}
function provMoteurs(mk,mo){const cnt=rankMap((typeof BASE!=="undefined"?BASE:[]).filter(e=>N(e.marque||"").includes(N(mk))&&(!mo||N(e.modele||"").includes(N(mo)))).map(e=>e.motorisation).filter(Boolean));
 const ver=((typeof CATALOG!=="undefined"&&CATALOG.versions)||[]).filter(v=>N(v.marque).includes(N(mk))&&(!mo||N(v.modele).includes(N(mo)))).flatMap(v=>(v.v||[]).map(x=>x[0])).filter(Boolean);
 const base=(typeof CATALOG!=="undefined"?CATALOG.motorisations:[]);
 const set=new Set([...ver,...cnt.keys(),...base]);
 return [...set].map(m=>({value:m,label:m,hint:(cnt.get(N(m))||0)?cnt.get(N(m))+" fiche(s)":""}));}
function provPuiss(mk,mo,mt){const p=(window.POWER&&POWER.knownPowers)?POWER.knownPowers(mk,mo,mt):[];return p.map(x=>({value:String(x.ch),label:x.ch+" ch",hint:x.kw+" kW · "+x.label}));}
function provDTC(){const cnt=rankMap((typeof BASE!=="undefined"?BASE:[]).flatMap(e=>e.dtc||[]));
 return [...cnt.entries()].map(([k,c])=>({value:k.toUpperCase(),label:k.toUpperCase(),hint:c+" fiche(s)"})).sort((a,b)=>b.hint.localeCompare(a.hint));}
function attachSuggest(input,provider){
  if(!input||input.__sgDone)return; input.__sgDone=true;
  const wrap=document.createElement("div");wrap.style.position="relative";
  input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
  const list=document.createElement("div");
  list.style.cssText="position:absolute;top:calc(100% + 3px);left:0;right:0;z-index:70;max-height:230px;overflow:auto;background:rgba(8,12,32,.98);border:1px solid var(--acc,#00e5ff);border-radius:12px;display:none;box-shadow:0 16px 44px rgba(0,0,0,.55)";
  wrap.appendChild(list);
  input.addEventListener("input",()=>{
    let items=[];try{items=provider().slice(0,9);}catch(_){}
    if(!items.length){list.style.display="none";return;}
    list.innerHTML=items.map((x,i)=>`<div data-i="${i}" style="padding:8px 11px;cursor:pointer;font-size:.8rem;border-bottom:1px solid rgba(255,255,255,.07)">${E(x.label)}${x.hint?` <span style="color:#93a0d6;font-size:.66rem">${E(x.hint)}</span>`:""}</div>`).join("");
    list.__items=items;list.style.display="block";});
  list.addEventListener("mousedown",e=>{const d=e.target.closest("[data-i]");if(!d)return;e.preventDefault();
    const it=list.__items[+d.dataset.i];input.value=it.value;list.style.display="none";
    input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));});
  input.addEventListener("blur",()=>setTimeout(()=>list.style.display="none",160));
}
function wirePredictive(){
  attachSuggest(D("cMarque"),()=>provMarques().filter(x=>!D("cMarque").value||N(x.value).includes(N(D("cMarque").value))));
  attachSuggest(D("cModele"),()=>provModeles(D("cMarque")?.value||"").filter(x=>!D("cModele").value||N(x.value).includes(N(D("cModele").value))));
  attachSuggest(D("cMoteur"),()=>provMoteurs(D("cMarque")?.value||"",D("cModele")?.value||"").filter(x=>!D("cMoteur").value||N(x.value).includes(N(D("cMoteur").value))));
  attachSuggest(D("cPuiss"),()=>provPuiss(D("cMarque")?.value||"",D("cModele")?.value||"",D("cMoteur")?.value||""));
  attachSuggest(D("cDtc"),()=>provDTC().filter(x=>!D("cDtc").value||x.value.includes(D("cDtc").value.toUpperCase().slice(-4))||true));
}

/* ================= 4. Corrélation live pendant la saisie du contexte ================= */
let liveTimer=null;
function wireLive(){
  const ctx=D("ctx");if(!ctx)return;
  if(!D("liveCorr")){const wrap=document.createElement("div");wrap.id="liveCorr";wrap.className="small";wrap.style.marginTop="8px";
    (D("predCtx")||ctx).insertAdjacentElement("afterend",wrap);}
  ctx.addEventListener("input",()=>{clearTimeout(liveTimer);liveTimer=setTimeout(()=>{
    const v=(typeof getVeh==="function")?getVeh():{};
    const sym=detectSymptoms(ctx.value);const dtc=extractDTC(ctx.value);
    // auto-coche symptômes détectés
    sym.forEach(s=>{const cb=[...D("qcm").querySelectorAll("input")].find(i=>i.value===s);if(cb&&!cb.checked){cb.checked=true;cb.closest("label").style.borderColor="var(--amber)";}});
    // auto-remplit DTC si vide
    if(dtc.length&&D("cDtc")&&!D("cDtc").value){D("cDtc").value=dtc.join(", ");if(D("dtcLu"))D("dtcLu").checked=true;D("cDtc").classList.remove("hidden");}
    const toks=N(ctx.value).split(" ").filter(t=>t.length>3);
    const hyp=hypotheses(v,toks,dtc,new Set(sym),3);
    D("liveCorr").innerHTML=hyp.length
      ? `<b style="color:var(--amber)">🔎 Corrélations détectées en direct :</b> `+hyp.map(h=>`<span class="tag ${h.e.risque_feu?"feu":""}">${E(h.e.defaut.slice(0,48))} · score ${h.s}</span>`).join("")
      : `<span style="color:var(--mut2)">Saisis marque/modèle/motorisation + symptômes pour activer la corrélation live.</span>`;
  },350);});
}

/* ================= 5. COMPTE RENDU D'EXPERTISE (remplace analyserContexte) ================= */
function legalExtra(top,feu){
  const extra=[];
  if(typeof LEGAL_BASE!=="undefined"){
    if(top&&(top.e.type==="rappel"||top.e.campagne)){const f=LEGAL_BASE.find(x=>x.id==="rappel-securite");if(f)extra.push(f);}
    if(feu){const f=LEGAL_BASE.find(x=>x.id==="incendie-produit");if(f)extra.push(f);}
  }
  return extra;
}
async function expertContextReport(){
  const ctx=D("ctx").value.trim();
  if(!ctx){toast("Décris ta situation dans la case contexte.");return;}
  let q={ok:true,left:"∞"};
  if(typeof quotaUse==="function"){q=quotaUse();if(typeof updQuota==="function")updQuota(q);}
  if(!q.ok){toast("🚫 Quota atteint (5/7 jours). Réinitialisation le "+new Date(q.reset).toLocaleDateString("fr-FR")+".",6000);return;}
  const v=(typeof getVeh==="function")?getVeh():{};
  const vendeur=D("cVendeur")?.value||"inconnu";
  const sym=new Set([...detectSymptoms(ctx),...[...D("qcm").querySelectorAll("input:checked")].map(i=>i.value)]);
  const dtcs=[...new Set([...extractDTC(ctx),...((D("dtcLu")?.checked&&D("cDtc")?.value)?(D("cDtc").value.toUpperCase().match(/[PCBU]\d{4}/g)||[]):[])])];
  const ctxToks=N(ctx).split(" ").filter(t=>t.length>3);
  const hyp=hypotheses(v,ctxToks,dtcs,sym,8);
  const top=hyp[0]||null;
  const conf=top?confidence(top):{lvl:"INDÉTERMINÉ",crit:"Aucune hypothèse concordante ; expertise physique requise.",pct:5};
  const feuDetected=/incendie|feu|flamme|embras|sinistre/.test(N(ctx))||!!(top&&top.e.risque_feu);
  const legal=[...((typeof legalMatch==="function")?legalMatch(ctx,vendeur):[]),...legalExtra(top,feuDetected)];
  const date=new Date().toLocaleString("fr-FR");
  const kp=(window.POWER&&POWER.knownPowers)?POWER.knownPowers(v.marque||"",v.modele||"",v.moteur||""):[];

  let html=`<div class="card" id="crExpert">
   <h2>🧾 COMPTE RENDU D'EXPERTISE — ${date}</h2>
   <p class="small"><b>Mode :</b> ingénieur / expert / juriste · <b>Quota :</b> ${q.left==="∞"?"admin ∞":q.left+"/5 restantes"}</p>
   <h3>1. Identification du véhicule</h3>
   <table><tbody>
    <tr><th>Marque / Modèle</th><td><b>${E(v.marque||"non renseignée")} ${E(v.modele||"")}</b></td></tr>
    <tr><th>Motorisation</th><td>${E(v.moteur||"non renseignée")}</td></tr>
    <tr><th>Puissance</th><td>${v.puiss?("<b>"+v.puiss+" ch</b>"+(kp.length?` · référencée : ${kp.map(x=>x.ch+" ch").join(", ")}`:"")):"non renseignée"+(kp.length?` · puissances connues : ${kp.slice(0,8).map(x=>x.ch+" ch").join(", ")}`:"")}</td></tr>
    <tr><th>Millésime / Énergie</th><td>${v.annee||"—"} · ${v.energie||"—"}</td></tr>
    <tr><th>Vendeur</th><td>${E(vendeur)}</td></tr>
    <tr><th>Symptômes retenus</th><td>${[...sym].map(E).join(", ")||"—"}</td></tr>
    <tr><th>DTC</th><td>${dtcs.join(", ")||"—"}</td></tr>
   </tbody></table>
   <h3>2. Détermination de l'origine la plus probable</h3>`;
  if(top){
    html+=`<div class="hit ${top.e.risque_feu?"feu":""}">
      <span class="tag ${conf.lvl==="CERTAIN"?"ok":conf.lvl==="PROBABLE"?"info":conf.lvl==="POSSIBLE"?"":"crit"}">Niveau : ${conf.lvl} · indice ${conf.pct}%</span>
      <b>${E(top.e.defaut)}</b>
      <div class="meta">${E(top.e.marque)} · ${E(top.e.modele)} ${E(top.e.motorisation)} ${top.e.annees?("· "+top.e.annees[0]+"-"+top.e.annees[1]):""} · ${E(top.e.source)} ${E(top.e.campagne||"")}</div>
      <p class="small"><b>Critère :</b> ${E(conf.crit)}</p>
      <p class="small"><b>Éléments concordants :</b> ${top.why.map(E).join(" · ")}</p>
      <p class="small"><b>Chaîne causale :</b> symptôme(s) rapporté(s) → <b>mécanisme / cause racine :</b> ${E(top.e.mecanisme||"—")} → <b>conséquences :</b> ${E((top.e.consequences||[]).join(" ; ")||"—")}${top.e.risque_feu&&top.e.chaine_feu?` → <b>volet incendie :</b> ${E(top.e.chaine_feu)}`:""}</p>
      ${top.e.url?`<a class="small" href="${E(top.e.url)}" target="_blank" rel="noopener">📎 Source officielle</a>`:""}
     </div>`;
    if(hyp.length>1){
      html+=`<h3>3. Diagnostic différentiel (hypothèses concurrentes)</h3><table><thead><tr><th>#</th><th>Hypothèse</th><th>Score</th><th>Éléments</th></tr></thead><tbody>`+
       hyp.slice(1,5).map((h,i)=>`<tr><td>${i+2}</td><td>${E(h.e.defaut.slice(0,70))}</td><td><b>${h.s}</b></td><td class="small">${h.why.slice(0,3).map(E).join(" · ")}</td></tr>`).join("")+`</tbody></table>`;
    }
  } else {
    html+=`<p class="small">Aucune hypothèse concordante dans la base pour ces critères. Niveau : <b>INDÉTERMINÉ</b> — expertise physique et lectures ODB/essais requis.</p>`;
  }
  if(feuDetected&&typeof fireAnalysis==="function"){
    html+=`<h3>${hyp.length>1?"4":"3"}. Volet incendie renforcé</h3>`+fireAnalysis(v,hyp.map(h=>h.e),ctxToks,[...sym]).html;
  }
  html+=`<h3>${feuDetected?"5":"4"}. Qualification juridique (volet juriste)</h3>`+((typeof renderLegal==="function")?renderLegal(legal):"");
  html+=`<h3>${feuDetected?"6":"5"}. Plan d'action &amp; conservation des preuves</h3><ul class="small">`+
   [...new Set([...legal.flatMap(f=>f.demarches),...(top?(top.e.indices||[]).map(x=>"Contrôler / photographier : "+x):[]),
     "Conserver factures, annonce, contrat, historique d'entretien et kilomètres",
     "Faire établir un diagnostic écrit avant toute réparation ou dépose",
     dtcs.length?"Conserver la lecture DTC horodatée (capture + outil)":"Réaliser une lecture OBD et consigner les codes",
     "En cas de litige : réclamation écrite puis médiation / expertise contradictoire"])].slice(0,12).map(x=>`<li>${E(x)}</li>`).join("")+`</ul>`;
  html+=`<h3>${feuDetected?"7":"6"}. Réserves &amp; méthode</h3>
   <p class="small">Méthode : qualifier → inférer (marque/modèle/motorisation/puissance) → corréler (base fusionnée + rappels + DTC) → analyser (mécanisme/conséquences) → tester (mesures/lectures) → conclure (niveau de certitude).
   Le présent compte rendu est une <b>aide documentaire fondée sur les sources citées</b> ; il ne remplace ni une expertise physique du véhicule ni une consultation juridique personnalisée.
   Les puissances et versions sont indicatives : confirmer par millésime / VIN.</p>
   <div class="no-print" style="margin-top:10px">
     <button type="button" class="btn ghost" id="crPrint">🖨️ Imprimer / PDF</button>
     <button type="button" class="btn ghost" id="crCopy">📋 Copier le compte rendu</button>
     <button type="button" class="btn ghost" id="crJson">📤 Export JSON</button>
   </div></div>`;
  D("ctxReport").innerHTML=html;
  D("crPrint").onclick=()=>{document.body.classList.add("print-ctx");window.print();};
  D("crCopy").onclick=()=>{navigator.clipboard?.writeText(D("crExpert").innerText).then(()=>toast("📋 Compte rendu copié."));};
  D("crJson").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({date,vehicule:v,vendeur,symptomes:[...sym],dtc:dtcs,contexte:ctx,niveau:conf,origine:top?{defaut:top.e.defaut,source:top.e.source,campagne:top.e.campagne,why:top.why,score:top.s}:null,differentiel:hyp.slice(1,5).map(h=>({defaut:h.e.defaut,score:h.s})),juridique:legal.map(f=>f.id)},null,1)],{type:"application/json"}));a.download="compte-rendu-expertise.json";a.click();};
  window._ctx={date,vehicule:v,vendeur,contexte:ctx,niveau:conf,origine:top?top.e.defaut:null,juridique:legal.map(f=>f.id)};
  toast("🧾 Compte rendu d'expertise généré ("+conf.lvl+", indice "+conf.pct+"%).");
}

/* ================= 6. Renfort de l'étude de cas (ajoute la détermination) ================= */
function augmentEtude(){
  const host=D("rapport");if(!host||!host.innerHTML)return;
  const v=(typeof getVeh==="function")?getVeh():{};
  const sym=new Set([...D("qcm").querySelectorAll("input:checked")].map(i=>i.value));
  const dtcs=(D("dtcLu")?.checked&&D("cDtc")?.value)?(D("cDtc").value.toUpperCase().match(/[PCBU]\d{4}/g)||[]):[];
  const toks=N(D("ctx")?.value||"").split(" ").filter(t=>t.length>3);
  const hyp=hypotheses(v,toks,dtcs,sym,5);
  if(!hyp.length)return;
  const top=hyp[0],conf=confidence(top);
  const sec=document.createElement("div");
  sec.innerHTML=`<h3>🎯 Détermination de l'origine (mode expert)</h3>
   <div class="hit ${top.e.risque_feu?"feu":""}"><span class="tag ${conf.lvl==="CERTAIN"?"ok":conf.lvl==="PROBABLE"?"info":""}">${conf.lvl} · ${conf.pct}%</span>
   <b>${E(top.e.defaut)}</b><div class="meta">${E(top.e.source)} ${E(top.e.campagne||"")}</div>
   <p class="small"><b>Concordances :</b> ${top.why.map(E).join(" · ")}</p>
   <p class="small"><b>Chaîne :</b> ${E(top.e.mecanisme||"—")} → ${E((top.e.consequences||[]).join(" ; ")||"—")}</p></div>
   ${hyp.length>1?`<p class="small"><b>Différentiel :</b> ${hyp.slice(1,4).map(h=>E(h.e.defaut.slice(0,44))+" ("+h.s+")").join(" · ")}</p>`:""}`;
  host.appendChild(sec);
}

/* ================= 7. boot & chaînage ================= */
function boot(){
  if(!D("topAnalyse"))return setTimeout(boot,120);
  wirePredictive();
  wireLive();
  window.analyserContexte=expertContextReport;
  const _analyser=window.analyser;
  window.analyser=async function(){ if(_analyser)await _analyser(); augmentEtude(); };
  // re-prédiction quand le moteur de données fusionne de nouvelles entrées
  setInterval(()=>{ if(D("de-panel")?.classList.contains("open"))return; },5000);
  console.log("🧠 Expert Engine v1 prêt (compte rendu + prédiction corrélée)");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.EXPERT={hypotheses,confidence,scoreHypothesis,detectSymptoms,extractDTC,knownPowers:()=>(window.POWER?POWER.knownPowers:null)};
})();
