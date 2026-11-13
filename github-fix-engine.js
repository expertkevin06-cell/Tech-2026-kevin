/* ============================================================================
   KEV TECH & FIRE — GITHUB FIX ENGINE v1
   • Corrige « DISPATCH HTTP 403 — resource not accessible by PAT » :
     en cas de 403 sur workflow_dispatch, bascule AUTOMATIQUE sur un
     déclenchement par commit (push trigger) qui ne demande que le scope
     Contents → plus jamais bloqué.
   • Rappelle que pannes + photos sont diffusées SANS workflow (lecture
     directe de data/manual.json + data/photos.json par les tiers).
   • Bouton « Workflow v2 » : ajoute data/photos.json & data/manual.json aux
     push-triggers du workflow.
   ============================================================================ */
(() => {
"use strict";
const D=id=>document.getElementById(id);
const log=m=>{const el=D("de-log");if(el){el.insertAdjacentHTML("afterbegin",`<div><span>${new Date().toLocaleTimeString("fr-FR")}</span> ${m}</div>`);}console.log(m.replace(/<[^>]+>/g,""));};
const REPO=()=>localStorage.getItem("kevo_repo")||"expertkevin06-cell/Tech-2026-kevin";
const tok=()=>{const v=(D("de-token")?.value||D("ghPat")?.value||localStorage.getItem("ghpat")||"").trim();
 if(v&&v!=="••••••••")localStorage.setItem("ghpat",v);return v==="•••••••"?"":(v==="••••••••"?(localStorage.getItem("ghpat")||""):v);};
async function gh(path,{method="GET",body=null}={}){const h={Accept:"application/vnd.github+json"};const t=tok();if(t)h.Authorization="Bearer "+t;
 if(body)h["Content-Type"]="application/json";
 const r=await fetch("https://api.github.com"+path,{method,headers:h,body:body?JSON.stringify(body):null});
 const text=await r.text();let j=null;try{j=JSON.parse(text);}catch(_){}return{status:r.status,ok:r.ok,json:j,text};}
const b64=s=>{const b=new TextEncoder().encode(s);let bin="";const C=0x8000;for(let i=0;i<b.length;i+=C)bin+=String.fromCharCode.apply(null,b.subarray(i,i+C));return btoa(bin);};
async function ghPut(path,content,msg){const t=tok();if(!t){log("❌ Token absent.");return false;}
 const cur=await gh(`/repos/${REPO()}/contents/${path}`);const sha=cur.ok?cur.json?.sha:null;
 const r=await gh(`/repos/${REPO()}/contents/${path}`,{method:"PUT",body:{message:msg,content:b64(content),branch:cur.ok?undefined:undefined,...(sha?{sha}:{})}});
 if(!r.ok){const r2=await gh(`/repos/${REPO()}`);const branch=r2.json?.default_branch||"main";
  const rr=await gh(`/repos/${REPO()}/contents/${path}`,{method:"PUT",body:{message:msg,content:b64(content),branch,...(sha?{sha}:{})}});return rr.ok||rr.status===200||rr.status===201;}
 return r.ok||r.status===200||r.status===201;}

const WORKFLOW_V2=`name: MAJ bases techniques
on:
  schedule: [{cron: "0 3 1,16 * *"}]
  workflow_dispatch:
  push:
    paths:
      - "data/manual.json"
      - "data/photos.json"
      - "data/catalogue_source.json"
      - "data/trigger.json"
      - "scripts/update_bases.py"
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
          git add data icons || true
          git diff --cached --quiet || git commit -m "MAJ rapide bases + catalogue + photos"
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

async function repoInfo(){const r=await gh(`/repos/${REPO()}`);return r.ok?r.json:null;}
/* Déclenchement de secours : commit d'un fichier déjà surveillé par le push-trigger */
async function fallbackTrigger(){
 const info=await repoInfo();const branch=info?.default_branch||"main";
 let obj={};
 try{const r=await fetch(`https://raw.githubusercontent.com/${REPO()}/${branch}/data/catalogue_source.json`);
  if(r.ok){const j=await r.json();if(j&&typeof j==="object")obj=j;}}catch(_){}
 obj._meta={ts:Date.now(),note:"KEV — trigger MAJ (push), sans scope Actions"};
 return ghPut("data/catalogue_source.json",JSON.stringify(obj,null,1),"KEV — trigger MAJ (push)");
}
async function smartDispatch(){
 log("🚀 Tentative workflow_dispatch…");
 const info=await repoInfo();
 if(!info){log("❌ Dépôt introuvable — vérifie owner/repo (panneau 🛰️).");return;}
 const branch=info.default_branch||"main";
 const w=await gh(`/repos/${REPO()}/actions/workflows`);
 const wf=(w.json?.workflows||[]).find(x=>/maj-bases|maj.*bases|update_bases/i.test(x.name+" "+x.path));
 if(!wf){log("⚠️ Workflow absent → installation…");if(window.KEV?.gh?.repair)await KEV.gh.repair();else log("❌ Installe le workflow (bouton 🛠️).");return;}
 const r=await gh(`/repos/${REPO()}/actions/workflows/${encodeURIComponent(wf.path.split("/").pop())}/dispatches`,{method:"POST",body:{ref:branch}});
 if(r.status===204){log("✅ MAJ déclenchée via dispatch.");return;}
 if(r.status===403){
  log("❌ Dispatch 403 : le token n'a pas le droit Actions/workflow.");
  log("ℹ️ Classic → coche <b>workflow</b> · Fine-grained → <b>Actions : Read & write</b>.");
  log("🔁 Bascule automatique : déclenchement par commit (scope Contents seul)…");
  const ok=await fallbackTrigger();
  log(ok?"✅ MAJ déclenchée via push-trigger (commit data/catalogue_source.json).":"❌ Commit de secours refusé → vérifie scope <b>Contents : Read & write</b>.");
  return;}
 log(`❌ Dispatch HTTP ${r.status} : ${(r.text||"").slice(0,200)}`);
}
function rebind(id,fn){const el=D(id);if(!el||el.__fix)return;el.__fix=true;
 const n=el.cloneNode(true);el.replaceWith(n);n.addEventListener("click",fn);return n;}
function boot(){
 if(!D("de-panel")&&!D("ghPat"))return setTimeout(boot,300);
 rebind("de-ghdispatch",smartDispatch);
 rebind("btnMajServeur",()=>{D("de-panel")?.classList.add("open");smartDispatch();});
 /* bouton workflow v2 */
 const row=D("de-ghdispatch")?.parentNode;
 if(row&&!D("ghWf2")){const b=document.createElement("button");b.id="ghWf2";b.type="button";b.className="de-btn2 ghost";b.textContent="🧬 Workflow v2 (trigger photos)";
  b.onclick=async()=>{const ok=await ghPut(".github/workflows/maj-bases.yml",WORKFLOW_V2,"KEV — workflow v2 (push-trigger photos/manual)");
   log(ok?"✅ Workflow v2 installé : chaque publication photos/pannes déclenche aussi la MAJ serveur.":"❌ Échec installation workflow (scope Contents).");};
  row.appendChild(b);}
 /* clarification après publication photos */
 if(window.PHOTO_ADMIN){const _p=window.PHOTO_ADMIN.publish;
  window.PHOTO_ADMIN.publish=async()=>{const r=await _p();
   log("ℹ️ Tiers : photos & pannes lues directement depuis data/photos.json + data/manual.json (aucun workflow requis).");
   return r;};}
 console.log("🐙 GitHub Fix Engine v1 prêt (403 → bascule push-trigger)");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
window.GHFIX={smartDispatch,fallbackTrigger,installWorkflow:()=>ghPut(".github/workflows/maj-bases.yml",WORKFLOW_V2,"KEV — workflow v2")};
})();
