/* ============================================================================
   KEV TECH & FIRE — POWER ENGINE v1
   Fait "remonter" les puissances partout : sélecteur, recherche, rapports.
   Sources : versions embarquées/catalogue + champ puissance_ch des fiches
             + table motorisation→puissances + récolte.
   Se charge APRÈS app.js et data-engine.js ; chaîne les fonctions existantes.
   ============================================================================ */
(() => {
"use strict";
const D = id => document.getElementById(id);
const N = s => (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E = s => (s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const kw2ch = kw => Math.round(kw*1.35962);

/* ---------- Table motorisation → puissances (ch) — thermiques & hybrides ---------- */
const POWER_TABLE = {
"1.2 puretech":[82,100,110,130,136,155,180,215,225,250],
"1.6 thp":[150,155,165,170,200,205,270],
"1.5 bluehdi":[100,120,130],
"1.6 bluehdi":[100,120,150,180],
"2.0 bluehdi":[150,180,204],
"1.5 dci":[90,95,110,115],
"1.3 tce":[130,140,150,160],
"1.0 tce":[90,100,110],
"1.0 ecoboost":[100,125,140,155],
"1.5 ecoboost":[120,150,160,180],
"2.0 ecoboost":[200,245,280,350],
"1.0 tsi":[95,110,115],
"1.5 tsi":[130,150,160],
"2.0 tsi":[190,220,245,280,310,320],
"1.6 tdi":[95,115,120],
"2.0 tdi":[115,150,190,200,240],
"3.0 tdi":[218,231,286,341],
"1.4 tsi":[122,125,150],
"1.8 tsi":[152,180],
"1.6 hdi":[92,100,115,120],
"2.0 hdi":[140,150,163,180],
"1.5 cdti":[100,120,125],
"2.0 cdti":[150,170,210],
"1.6 crdi":[115,136],
"2.0 crdi":[150,185,200],
"1.5 t-gdi":[160],
"2.0 t-gdi":[240,280],
"1.6 t-gdi":[150,180,204],
"2.5 t-gdi":[304,400],
"3.5 t-gdi":[380,415],
"1.5 skyactiv":[120],
"2.0 skyactiv":[122,150,165,184,190],
"2.2 skyactiv-d":[150,184],
"1.3 multijet":[95],
"1.6 multijet":[120,130],
"2.0 multijet":[140,170,180],
"1.5 vtec":[130],
"2.0 vtec":[156,184],
"2.0 d-4d":[143,150],
"2.2 d-4d":[136,150,177],
"1.5 d-4d":[116],
"e-tech":[130,150,220],
"puretech":[82,100,110,130,136,155,180,215,225,250],
"thp":[150,155,165,170,200,205,270],
"bluehdi":[100,120,130,150,180],
"hdi":[92,100,115,120,140,150,163,180,204,240],
"dci":[90,95,110,115,130,150],
"tce":[90,100,110,130,140,150,160],
"ecoboost":[100,125,140,155,160,180,200,245,280,350],
"tsi":[95,110,115,130,150,160,190,220,245,280,310,320],
"tdi":[95,115,120,150,190,200,218,231,240,286,341],
"crdi":[115,136,150,185,200],
"skyactiv":[120,122,150,165,184,190]
};

/* ---------- Index de puissances par véhicule ---------- */
function knownPowers(marque, modele, moteur){
  const out = new Map();
  const ver = ((typeof CATALOG!=="undefined"&&CATALOG.versions)||[]).find(v => N(v.marque)===N(marque) && N(v.modele)===N(modele));
  if(ver) (ver.v||[]).forEach(r => out.set(r[2], `${r[0]||"Version"} · ${r[2]} ch (${r[1]} kW)` + (r[3]?` · ${r[3]}`:"")));
  (typeof BASE!=="undefined"?BASE:[]).forEach(e => {
    if(N(e.marque||"").includes(N(marque)) && N(e.modele||"").includes(N(modele)) && Array.isArray(e.puissance_ch))
      e.puissance_ch.forEach(p => { if(!out.has(p)) out.set(p, `Documentée (fiche) · ${p} ch`); });
  });
  const mt = N(moteur||"");
  if(mt) for(const [k,pws] of Object.entries(POWER_TABLE))
    if(mt.includes(k) || k.includes(mt)) pws.forEach(p => { if(!out.has(p)) out.set(p, `Motorisation ${k} · ${p} ch`); });
  return [...out.entries()].sort((a,b)=>a[0]-b[0]).map(([ch,label]) => ({ch, kw:Math.round(ch/1.35962), label}));
}

/* ---------- UI puissances dans le sélecteur ---------- */
function ensurePuissUI(){
  if(!D("dlPuiss")){ const dl=document.createElement("datalist"); dl.id="dlPuiss"; document.body.appendChild(dl); }
  const cp=D("cPuiss"); if(cp) cp.setAttribute("list","dlPuiss");
  if(!D("puissWrap")){
    const grid=D("topAnalyse")?.querySelector(".grid");
    if(grid){ const w=document.createElement("div"); w.id="puissWrap"; w.className="field"; w.style.marginTop="10px";
      w.innerHTML=`<label>Puissances référencées <span class="badge" id="puissCount">0</span></label><div class="chips" id="puissChips"></div>`;
      grid.insertAdjacentElement("afterend", w); }
  }
}
function majPuiss(){
  ensurePuissUI();
  const mk=D("cMarque")?.value||"", mo=D("cModele")?.value||"", mt=D("cMoteur")?.value||"";
  const powers = knownPowers(mk, mo, mt);
  const dl=D("dlPuiss"); if(dl) dl.innerHTML = powers.map(p=>`<option value="${p.ch}">`).join("");
  const chips=D("puissChips"), cnt=D("puissCount");
  if(cnt) cnt.textContent = powers.length;
  if(chips) chips.innerHTML = powers.length
    ? powers.slice(0,14).map(p=>`<button type="button" data-ch="${p.ch}" title="${E(p.label)}">${p.ch} ch</button>`).join("")
    : `<span class="chips-loading">Aucune puissance pour cette saisie — précise la motorisation (ex : 1.2 PureTech) ou lance la récolte 🛰️.</span>`;
  return powers;
}
function hookPuiss(){
  ensurePuissUI();
  ["cMarque","cModele","cMoteur"].forEach(id => { const el=D(id); if(!el) return;
    el.addEventListener("input", majPuiss); el.addEventListener("change", majPuiss); });
  D("puissChips")?.addEventListener("click", e => { const b=e.target.closest("[data-ch]"); if(!b) return;
    const cp=D("cPuiss"); if(cp){ cp.value=b.dataset.ch; cp.dispatchEvent(new Event("input")); cp.dispatchEvent(new Event("change")); } });
  majPuiss();
}

/* ---------- Note puissance sous chaque fiche de la base massive ---------- */
function powerNote(e){
  const mk=(e.marque||"").split("/")[0].trim();
  const mo=(e.modele||"").split("/")[0].trim();
  if(!mk || /multi|tous/i.test(mk)) return "";
  const p = knownPowers(mk, mo, e.motorisation||"");
  if(!p.length) return "";
  return `<div class="de-note" style="color:#93a0d6;font-size:.72rem;margin:2px 0 8px">⚙️ Puissances connues : ${p.slice(0,8).map(x=>x.ch+" ch").join(" · ")}</div>`;
}

/* ---------- Chaînage des fonctions globales ---------- */
function chain(){
  const _fill = window.fillDatalists, _majM = window.majModeles, _analyser = window.analyser, _ctx = window.analyserContexte;

  window.fillDatalists = function(){ if(_fill)_fill(); ensurePuissUI(); majPuiss(); };
  window.majModeles   = function(){ if(_majM)_majM(); majPuiss(); };
  window.majPuiss     = majPuiss;

  window.analyser = async function(){ if(_analyser) await _analyser(); appendPower("rapport"); };
  window.analyserContexte = async function(){ if(_ctx) await _ctx(); appendPower("ctxReport"); };

  /* Recherche : on reconstruit pour injecter les puissances partout */
  window.renderResults = function(){
    const q=(D("q")?.value||"").trim(), box=D("results"); if(!box) return;
    const themeOk = e => (typeof THEME==="undefined" || THEME==="tous" || (e.themes||[]).includes(THEME));
    const card = e => { try{ return hitCard(e); }catch(_){ return `<div class="hit"><b>${E(e.defaut||"")}</b></div>`; } };
    if(!q){
      const l=(typeof search==="function"?search(""):(typeof BASE!=="undefined"?BASE:[]).filter(themeOk)).slice(0,20);
      box.innerHTML = l.map(e=>card(e)+powerNote(e)).join("") || `<p class="small">Base vide.</p>`;
      return;
    }
    const veh = (typeof searchVehicles==="function") ? searchVehicles(q) : [];
    const faults = (typeof search==="function") ? search(q) : [];
    const vcard = v => {
      let h; try{ h = vehCard(v); }catch(_){ h = `<div class="hit"><b>🚗 ${E(v.marque)} ${E(v.modele)}</b></div>`; }
      if(!v.v || !v.v.length){
        const p = knownPowers(v.marque, v.modele, "");
        if(p.length) h += `<div class="de-note" style="color:#93a0d6;font-size:.72rem">⚙️ Puissances usuelles : ${p.slice(0,10).map(x=>x.ch+" ch").join(" · ")}</div>`;
      }
      return h;
    };
    box.innerHTML =
      (veh.length ? `<h3 class="de-h3" style="color:#00e5ff;margin:14px 0 6px">🚗 Véhicules · motorisations · puissances (${veh.length})</h3>` + veh.map(vcard).join("") : "") +
      `<h3 class="de-h3" style="color:#00e5ff;margin:14px 0 6px">🔧 Pannes &amp; rappels (${faults.length})</h3>` +
      (faults.length ? faults.map(e=>card(e)+powerNote(e)).join("") : `<p class="small">Aucune panne pour cette saisie.</p>`);
  };
}

/* ---------- Section puissances dans les rapports ---------- */
function appendPower(hostId){
  const host=D(hostId); if(!host) return;
  let v={}; try{ v=(typeof getVeh==="function")?getVeh():{}; }catch(_){}
  if(!v.marque && !v.modele) return;
  const powers = knownPowers(v.marque||"", v.modele||"", v.moteur||"");
  if(!powers.length) return;
  const rows = powers.map(p=>`<tr><td><b>${p.ch} ch</b></td><td>${p.kw} kW</td><td>${E(p.label)}</td></tr>`).join("");
  const sec=document.createElement("div");
  sec.innerHTML=`<h3>⚙️ Puissances &amp; versions connues pour ${E(v.marque||"")} ${E(v.modele||"")} (${powers.length})</h3>
   <table><thead><tr><th>Puissance</th><th>kW</th><th>Origine / version</th></tr></thead><tbody>${rows}</tbody></table>
   <p class="small">Si la puissance réelle du véhicule est connue, renseigne-la dans le sélecteur : elle affine la corrélation des pannes et de l'analyse incendie.</p>`;
  host.appendChild(sec);
}

/* ---------- boot ---------- */
function boot(){
  if(!D("topAnalyse")) return setTimeout(boot,120);
  chain();
  hookPuiss();
  /* re-peuple les puissances quand le moteur de données fusionne de nouvelles versions */
  setInterval(()=>{ if(document.activeElement!==D("cPuiss")) majPuiss(); }, 4000);
  console.log("⚙️ Power Engine v1 prêt");
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
window.POWER = { knownPowers, majPuiss, table: POWER_TABLE };
})();
