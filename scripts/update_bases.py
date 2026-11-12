#!/usr/bin/env python3
# KEV TECH & FIRE — v2 : moisson catalogue + pannes (5 sites) + RappelConso + Safety Gate + NHTSA
# PHASE=rapide (défaut) : catalogue + fusion sites + RappelConso + Safety Gate  (~2 min)
# PHASE=nhtsa           : rappels NHTSA incrémentaux (long, reprenable)
import json, re, time, gzip, os, hashlib, urllib.request, urllib.parse, urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]; DATA = ROOT/"data"; DATA.mkdir(exist_ok=True)
PHASE = os.environ.get("PHASE", "rapide").lower()
YEAR_START, YEAR_END = 2010, 2027
BUDGET = (280 if PHASE == "nhtsa" else 12) * 60
T0 = time.time()

SITES = [
 "https://expertkevin06-cell.github.io/techkevin2026/",
 "https://expertkevin06-cell.github.io/my-tech-by-kevin/",
 "https://expertkevin06-cell.github.io/etude-incendie-by-kevin/",
 "https://expertkevin06-cell.github.io/kev-diag-incendie/",
 "https://expertkevin06-cell.github.io/auto-diagnostic/",
]
JSON_PROBES = ["data/catalogue.json","catalogue.json","data/vehicules.json","vehicules.json",
 "data/base.json","base.json","data/pannes.json","pannes.json","data/db.json","db.json",
 "asset-manifest.json","data/index.json"]

FIRE_EN = re.compile("\\bfire\\b|flamm|ignit|burn|thermal (runaway|event)", re.I)
FIRE_FR = re.compile("incendie|feu\\b|flamme|embras|brûlure|inflamm", re.I)
ENGINE_RE = re.compile(r"^\d[.,]\d|^\d{3}\s?(?:ch|kw)|kwh|e-?tech|e-?tron|electric|électri|hybrid|phev|tce|tsi|tfsi|tdi|hdi|dci|cdti|crdi|gdi|puretech|ecoboost|skyactiv|thp|jtd|multijet|d-4d|e-power|dm-i|bev|hev", re.I)
POWER_RE  = re.compile(r"^\d{2,4}\s?(?:ch|kw|cv)?$")
BRAND_REF = set("""Abarth Aiways Alfa Romeo Alpine Aston Martin Audi Bentley BMW BYD Cadillac Chery Chevrolet Chrysler Citroën Cupra Dacia Daihatsu Dodge DS Ferrari Fiat Fisker Ford Geely Genesis GMC Honda Hongqi Hyundai Infiniti Isuzu Jaecoo Jaguar Jeep Kia KTM Lada Lamborghini Lancia Land Rover Leapmotor Lexus Lincoln Lotus Lucid Mahindra Maserati Mazda McLaren Mercedes-Benz MG Mini Mitsubishi Nio Nissan Omoda Opel Ora Peugeot Polestar Porsche RAM Renault Rivian Rolls-Royce Saab SEAT Seres Skoda Smart SsangYong Subaru Suzuki Tata Tesla Toyota VinFast Volkswagen Volvo Xpeng Zeekr""".lower().split())

STATE_F = DATA/"state.json"
state = json.loads(STATE_F.read_text(encoding="utf-8")) if STATE_F.exists() else {"nhtsa_done":[],"sg_last_key":0}
done = set(tuple(x) for x in state.get("nhtsa_done", []))

def http(url, timeout=60, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"KevTechFire/2.0","Accept-Encoding":"gzip"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                d = r.read()
                if r.headers.get("Content-Encoding") == "gzip": d = gzip.decompress(d)
                return d
        except urllib.error.HTTPError as ex:
            if ex.code in (400,404): return b""
            if i == tries-1: return b""
            time.sleep(3*(i+1))
        except Exception:
            if i == tries-1: return b""
            time.sleep(3*(i+1))
    return b""

def jget(u):
    b = http(u)
    try: return json.loads(b) if b else {}
    except Exception: return {}

def iso(d, fmt):
    try: return datetime.strptime(d.strip(), fmt).strftime("%Y-%m-%d")
    except Exception: return ""

def aslist(v):
    if isinstance(v, list): return [str(x).strip() for x in v if str(x).strip()]
    if isinstance(v, str): return [x.strip() for x in v.replace(";","\n").splitlines() if x.strip()]
    return []

def sid(p, o): return p + hashlib.sha1(json.dumps(o, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]

def entry(**kw):
    e = {"id":"","themes":["technique"],"type":"rappel","source":"","marque":"","modele":"","motorisation":"",
         "annees":None,"energie":"","systeme":"","dtc":[],"symptomes":[],"defaut":"","mecanisme":"",
         "consequences":[],"indices":[],"risque_feu":False,"chaine_feu":"","gravite":"eleve",
         "campagne":"","url":"","date":""}
    e.update(kw); return e

def left(): return time.time()-T0 < BUDGET

# ---------- découverte d'assets ----------
def assets(site):
    urls, blobs = set(), []
    html = http(site).decode("utf-8","ignore")
    if html: blobs.append(html)
    for m in re.finditer(r'(?:src|href)="([^"]+\.(?:js|json)[^"]*)"', html):
        urls.add(urllib.parse.urljoin(site, m.group(1)))
    for p in JSON_PROBES:
        u = urllib.parse.urljoin(site, p)
        b = http(u, timeout=25)
        if b and b[:1] in (b"{", b"["):
            blobs.append(b.decode("utf-8","ignore")); urls.discard(u)
    seen, queue = set(), list(urls)
    while queue and len(seen) < 40 and left():
        u = queue.pop(0)
        if u in seen: continue
        seen.add(u)
        txt = http(u, timeout=45).decode("utf-8","ignore")
        if not txt: continue
        blobs.append(txt)
        for m in re.finditer(r'["\'`]((?:\./)?(?:assets/)?[A-Za-z0-9_.\-]+\.(?:js|json))["\'`]', txt):
            nu = urllib.parse.urljoin(u, m.group(1))
            if nu not in seen and nu.startswith("https://expertkevin06-cell.github.io/"):
                queue.append(nu)
    return blobs

# ---------- extraction tableaux JSON ----------
def arrays(js):
    for m in re.finditer(r"\[\s*[\{\"]", js):
        i, depth, instr, escp = m.start(), 0, False, False
        for k in range(i, min(i+3_000_000, len(js))):
            c = js[k]
            if instr:
                if escp: escp = False
                elif c == "\\": escp = True
                elif c == '"': instr = False
            else:
                if c == '"': instr = True
                elif c in "[{": depth += 1
                elif c in "]}":
                    depth -= 1
                    if depth == 0:
                        try: yield json.loads(js[i:k+1])
                        except Exception: pass
                        break

FKEYS = {"defaut","titre","title","panne","libelle","mecanisme","mechanisme","cause","consequences",
         "marque","brand","modele","model","motorisation","engine","dtc","symptomes","indices"}

def harvest():
    marques, modeles, mots, versions, pannes = set(), {}, set(), [], []
    def addM(k, v):
        k, v = (k or "").strip(), (v or "").strip()
        if k and v and len(v) < 45: modeles.setdefault(k, set()).add(v)
    for site in SITES:
        if not left(): break
        nb_v = nb_p = 0
        for blob in assets(site):
            for arr in arrays(blob):
                if not arr or not isinstance(arr, list): continue
                # tableau de chaînes -> catalogue
                if all(isinstance(x, str) for x in arr) and len(arr) >= 5:
                    brands = [x for x in arr if x.strip().lower() in BRAND_REF]
                    engines = [x for x in arr if ENGINE_RE.search(x)]
                    powers  = [x for x in arr if POWER_RE.match(x.strip())]
                    if len(brands) >= max(3, len(arr)*0.5):
                        marques.update(x.strip() for x in brands)
                    elif len(engines) >= max(3, len(arr)*0.4):
                        mots.update(x.strip() for x in engines)
                    elif len(powers) >= max(3, len(arr)*0.6):
                        pass
                    else:
                        for x in arr:
                            x = x.strip()
                            if x and len(x) < 40 and not POWER_RE.match(x):
                                modeles.setdefault("_import", set()).add(x)
                    continue
                # tableau d'objets
                for o in arr:
                    if not isinstance(o, dict): continue
                    low = {k.lower(): k for k in o}
                    g = lambda *ks: next((o[low[k]] for k in ks if k in low and o[low[k]] not in (None,"")), "")
                    mk, md = str(g("marque","brand","make")), str(g("modele","model","modèle"))
                    mt = str(g("motorisation","engine","moteur","version"))
                    pw = str(g("puissance","power","ch","kw","puissance_ch"))
                    if mk and md:
                        marques.add(mk.split("/")[0].strip()); addM(mk.split("/")[0], md)
                        if mt or pw:
                            nums = re.findall(r"\d{2,4}", pw)
                            ch = int(nums[0]) if nums else 0
                            versions.append({"marque":mk,"modele":md,"energie":str(g("energie","energy","fuel")).lower(),
                                             "annees":None,"v":[[mt or "version", round(ch/1.36) if ch else 0, ch, ""]]})
                            nb_v += 1
                        if mt: mots.add(mt)
                    if len(set(low) & FKEYS) >= 2 and (g("defaut","titre","title","panne","libelle") or g("mecanisme","mechanisme","cause")):
                        feu = bool(FIRE_FR.search(json.dumps(o, ensure_ascii=False)))
                        an = re.findall(r"(?:19|20)\d{2}", str(g("annees","years","annee")))
                        pannes.append(entry(id=sid("fusion-", o), source="fusion-kevin", type="panne",
                            themes=["technique"]+(["incendie"] if feu else []),
                            marque=mk, modele=md, motorisation=mt,
                            annees=[int(an[0]), int(an[-1])] if an else None,
                            systeme=str(g("systeme","system","organe")),
                            dtc=aslist(g("dtc","codes")), defaut=str(g("defaut","titre","title","panne","libelle"))[:400],
                            mecanisme=str(g("mecanisme","mechanisme","cause","mécanisme")),
                            consequences=aslist(g("consequences","conséquences")),
                            symptomes=aslist(g("symptomes","symptômes","symptoms")),
                            indices=aslist(g("indices","preuves")),
                            risque_feu=feu, gravite="eleve", url=str(g("url","source","lien")), date=""))
                        nb_p += 1
        print("Moisson", site, "→ versions:", nb_v, "pannes:", nb_p)
    # réaffectation des modèles orphelins via correspondance nom de marque
    orphan = modeles.pop("_import", set())
    if orphan:
        modeles.setdefault("Tous modèles importés", set()).update(orphan)
    return marques, modeles, mots, versions, pannes

def rappelconso():
    out, offset = [], 0
    base = "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records"
    where = 'categorie_produit="automobiles et moyens de déplacement"'
    while left():
        j = jget(base+"?"+urllib.parse.urlencode({"where":where,"limit":100,"offset":offset,"order_by":"date_publication desc"}))
        res = j.get("results", [])
        if not res: break
        for r in res:
            txt = " ".join(str(r.get(k) or "") for k in ("motif_rappel","risques_encourus","description_complementaire_risque"))
            feu = bool(FIRE_FR.search(txt))
            out.append(entry(id="rc-"+r.get("numero_fiche",""), source="rappelconso",
                themes=["technique"]+(["incendie"] if feu else []),
                marque=(r.get("marque_produit") or "").title(), modele=r.get("modeles_ou_references") or "",
                systeme=r.get("sous_categorie_produit") or "",
                defaut=(r.get("libelle") or r.get("motif_rappel") or "")[:400],
                mecanisme=r.get("motif_rappel") or "",
                consequences=[r.get("risques_encourus") or "", r.get("conduites_a_tenir_par_le_consommateur") or ""],
                risque_feu=feu, chaine_feu=("Rappel : "+txt[:300]) if feu else "",
                gravite="critique" if feu else "eleve", campagne=r.get("numero_fiche",""),
                url=r.get("lien_vers_la_fiche_rappel") or "", date=(r.get("date_publication") or "")[:10]))
        offset += 100
        if offset >= j.get("total_count", 0): break
        time.sleep(0.25)
    print("RappelConso:", len(out)); return out

def safetygate():
    out = []
    b = b""
    for lang in ("fr","en"):
        b = http(f"https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/{lang}")
        if b: break
    if not b: return out
    reports = []
    for wr in ET.fromstring(b).iter("weeklyReport"):
        y, w = int(wr.findtext("year","0") or 0), int(wr.findtext("week","0") or 0)
        u = wr.findtext("URL","")
        if u: reports.append((y, w, wr.findtext("reference",""), u))
    reports.sort(key=lambda x:(x[0],x[1]))
    last = state.get("sg_last_key", 0)
    todo = [r for r in reports if r[0]*100+r[1] > last] if last else reports[-104:]
    for y, w, ref, url in todo:
        if not left(): break
        raw = http(url.replace("&amp;","&"))
        if not raw: continue
        try: det = ET.fromstring(raw)
        except Exception: continue
        for n in det.iter("notifications"):
            cat = (n.findtext("category") or "").lower()
            if "motor vehicle" not in cat and "véhicule" not in cat: continue
            danger, risk = n.findtext("danger") or "", n.findtext("riskType") or ""
            feu = bool(FIRE_FR.search(danger+risk)) or bool(FIRE_EN.search(danger+risk))
            out.append(entry(id="sg-"+(n.findtext("caseNumber") or ref), source="safetygate",
                themes=["technique"]+(["incendie"] if feu else []),
                marque=n.findtext("brand") or "",
                modele=(n.findtext("type_numberOfModel") or "")+" "+(n.findtext("name") or ""),
                systeme=n.findtext("product") or "", defaut=(n.findtext("product") or "")+" — "+risk,
                mecanisme=danger, consequences=[risk, n.findtext("measures") or ""],
                risque_feu=feu, chaine_feu=("Alerte UE : "+danger[:300]) if feu else "",
                gravite="critique" if feu else "eleve", campagne=n.findtext("caseNumber") or "",
                url=n.findtext("reference") or "", date=iso(n.findtext("publicationDate",""), "%d-%m-%Y")))
        state["sg_last_key"] = y*100+w
        time.sleep(0.3)
    print("Safety Gate:", len(out)); return out

def nhtsa(existing):
    out = []
    makes = sorted({(e.get("marque") or "").split("/")[0].strip().upper() for e in existing
                    if e.get("marque") and "multi" not in e["marque"].lower() and len(e.get("marque",""))>1})
    makes = sorted(set(makes) | {"PEUGEOT","CITROEN","RENAULT","DACIA","OPEL","VOLKSWAGEN","BMW","MERCEDES-BENZ",
        "AUDI","SKODA","SEAT","FORD","TOYOTA","HONDA","NISSAN","HYUNDAI","KIA","MAZDA","SUZUKI","SUBARU","LEXUS",
        "TESLA","VOLVO","JAGUAR","LAND ROVER","PORSCHE","MINI","FIAT","ALFA ROMEO","JEEP","CHEVROLET","GMC",
        "CADILLAC","BYD","MG","POLESTAR","GENESIS","CUPRA","RAM","DODGE","CHRYSLER","LINCOLN","ACURA","INFINITI"})
    seen = {(e.get("campagne"), e.get("modele"), str(e.get("annees"))) for e in existing if e.get("source")=="nhtsa"}
    for mk in makes:
        for yr in range(YEAR_START, YEAR_END+1):
            if not left(): print("NHTSA: budget atteint → reprise au prochain run"); return out
            ml = jget(f"https://api.nhtsa.gov/products/vehicle/models?modelYear={yr}&make={urllib.parse.quote(mk)}&issueType=r&max=1000")
            models = sorted({m["model"] for m in ml.get("results", [])})
            time.sleep(0.3)
            for md in models:
                if not left(): return out
                key = (mk, md, yr)
                if key in done and yr < YEAR_END-1: continue
                j = jget(f"https://api.nhtsa.gov/recalls/recallsByVehicle?make={urllib.parse.quote(mk)}&model={urllib.parse.quote(md)}&modelYear={yr}")
                time.sleep(0.3); done.add(key)
                for r in j.get("results", []):
                    camp = r.get("NHTSACampaignNumber","")
                    dk = (camp, md, str([yr,yr]))
                    if dk in seen: continue
                    seen.add(dk)
                    txt = r.get("Summary","")+" "+r.get("Consequence","")
                    feu = bool(FIRE_EN.search(txt)) or r.get("parkIt") is True
                    out.append(entry(id=f"nhtsa-{camp}-{md}-{yr}".replace(" ","_"), source="nhtsa",
                        themes=["technique"]+(["incendie"] if feu else []), marque=mk.title(), modele=md,
                        annees=[yr,yr], systeme=r.get("Component",""), defaut=r.get("Summary","")[:400],
                        mecanisme=r.get("Summary",""), consequences=[r.get("Consequence","")],
                        risque_feu=feu, chaine_feu=("Défaut rappel → "+r.get("Consequence","")) if feu else "",
                        gravite="critique" if (feu or r.get("parkIt")) else "eleve", campagne=camp,
                        url="https://www.nhtsa.gov/recalls?nhtsaId="+camp,
                        date=iso(r.get("ReportReceivedDate",""), "%d/%m/%Y")))
        print("NHTSA", mk, "→", len(out))
    return out

def main():
    seed = json.loads((DATA/"seed.json").read_text(encoding="utf-8"))
    manual = json.loads((DATA/"manual.json").read_text(encoding="utf-8")) if (DATA/"manual.json").exists() else []
    prev = []
    for f in DATA.glob("base-*.json"): prev += json.loads(f.read_text(encoding="utf-8"))
    cat_old = json.loads((DATA/"catalogue.json").read_text(encoding="utf-8")) if (DATA/"catalogue.json").exists() else {}
    src = json.loads((DATA/"catalogue_source.json").read_text(encoding="utf-8")) if (DATA/"catalogue_source.json").exists() else {}

    entries = seed + manual + prev
    marques, modeles, mots, versions, pannes = ({}, {}, set(), [], [])
    if PHASE == "rapide":
        marques, modeles, mots, versions, pannes = harvest()
        entries += pannes + rappelconso() + safetygate()
    else:
        entries += nhtsa(entries)

    uniq = {}
    for e in entries:
        uniq[e.get("id") or (e.get("source","")+e.get("campagne","")+e.get("modele","")+str(e.get("annees")))] = e
    entries = sorted(uniq.values(), key=lambda e:(e.get("source",""), e.get("id","")))

    MQ = set(marques) | set(cat_old.get("marques",[])) | set(src.get("marques",[]))
    MO = {}
    for d in (cat_old.get("modeles",{}), src.get("modeles",{}), {k:sorted(v) for k,v in modeles.items()}):
        for k, v in d.items(): MO.setdefault(k, set()).update(v)
    for e in entries:
        for m in re.split(r"[/,]", e.get("marque") or ""):
            m = m.strip()
            if m and "multi" not in m.lower(): MQ.add(m)
        md = (e.get("modele") or "").strip()
        if md and len(md) < 40:
            MO.setdefault((e.get("marque") or "").split("/")[0].strip(), set()).add(md)
    MT = set(mots) | set(cat_old.get("motorisations",[])) | set(src.get("motorisations",[]))
    MT.update(e["motorisation"] for e in entries if e.get("motorisation"))
    VS = (cat_old.get("versions",[]) or []) + (src.get("versions",[]) or src.get("vehicules",[]) or []) + versions
    vseen, VU = set(), []
    for v in VS:
        if not isinstance(v, dict) or not v.get("marque") or not v.get("modele"): continue
        k = (v["marque"].lower(), v["modele"].lower())
        if k in vseen: continue
        vseen.add(k); VU.append(v)

    catalogue = {"marques":sorted(MQ), "modeles":{k:sorted(v) for k,v in sorted(MO.items())},
                 "motorisations":sorted(MT), "versions":VU,
                 "maj":datetime.now(timezone.utc).isoformat()}
    (DATA/"catalogue.json").write_text(json.dumps(catalogue, ensure_ascii=False), encoding="utf-8")

    for f in DATA.glob("base-*.json"): f.unlink()
    chunks = []
    for i in range(0, len(entries), 1500):
        name = f"base-{i//1500:03d}.json"; chunks.append(name)
        (DATA/name).write_text(json.dumps(entries[i:i+1500], ensure_ascii=False), encoding="utf-8")

    version = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")+"-"+PHASE
    (DATA/"index.json").write_text(json.dumps({"version":version,"chunks":chunks,"catalogue":catalogue,
        "stats":{"fiches":len(entries),"marques":len(catalogue["marques"]),
                 "modeles":sum(len(v) for v in catalogue["modeles"].values()),
                 "motorisations":len(catalogue["motorisations"]),"versions":len(VU),
                 "feu":sum(1 for e in entries if e.get("risque_feu"))}}, ensure_ascii=False), encoding="utf-8")

    state["nhtsa_done"] = [list(x) for x in sorted(done)]
    STATE_F.write_text(json.dumps(state), encoding="utf-8")
    print("✅", PHASE, "→", len(entries), "fiches •", len(catalogue["marques"]), "marques •",
          sum(len(v) for v in catalogue["modeles"].values()), "modèles •", len(VU), "versions")

if __name__ == "__main__":
    main()
