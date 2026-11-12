#!/usr/bin/env python3
# KEV TECH & FIRE — MAJ massive : NHTSA + RappelConso + Safety Gate + fusion des 4 sites Kevin + manual.json
# 100% stdlib Python. Endpoints vérifiés le 12/11/2026.
import json, re, time, gzip, urllib.request, urllib.parse, urllib.error, xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]; DATA = ROOT/"data"; DATA.mkdir(exist_ok=True)
YEAR_START = 2010; YEAR_END = 2027            # modèles 2026 et 2027 inclus dès publication
SITES = ["https://expertkevin06-cell.github.io/auto-diagnostic/",
         "https://expertkevin06-cell.github.io/etude-incendie-by-kevin/",
         "https://expertkevin06-cell.github.io/kev-diag-incendie/",
         "https://expertkevin06-cell.github.io/my-tech-by-kevin/"]
FIRE_EN = re.compile(r"\bfire\b|flamm|ignit|burn|thermal (runaway|event)", re.I)
FIRE_FR = re.compile(r"incendie|feu\b|flamme|embras|brûlure|inflamm", re.I)
STATE_F = DATA/"state.json"
state = json.loads(STATE_F.read_text()) if STATE_F.exists() else {"nhtsa_done": [], "sg_last": ""}
done = set(tuple(x) for x in state["nhtsa_done"])

def http(url, timeout=90, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"KevTechFire/1.0 (+github)", "Accept-Encoding":"gzip"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                d = r.read()
                if r.headers.get("Content-Encoding") == "gzip": d = gzip.decompress(d)
                return d
        except urllib.error.HTTPError as e:
            if e.code in (400, 404): return b""
            if i == tries-1: raise
            time.sleep(4*(i+1))
        except Exception:
            if i == tries-1: raise
            time.sleep(4*(i+1))

def jget(url):
    b = http(url)
    return json.loads(b) if b else {}

def iso(d, fmt):
    try: return datetime.strptime(d.strip(), fmt).strftime("%Y-%m-%d")
    except Exception: return ""

def entry(**kw):
    e = {"id":"","themes":["technique"],"type":"rappel","source":"","marque":"","modele":"","motorisation":"",
         "annees":None,"energie":"","systeme":"","dtc":[],"symptomes":[],"defaut":"","mecanisme":"",
         "consequences":[],"indices":[],"risque_feu":False,"chaine_feu":"","gravite":"eleve",
         "campagne":"","url":"","date":""}
    e.update(kw); return e

# ---------------- 1) NHTSA (API officielle, sans clé) ----------------
def nhtsa(existing):
    out = []; makes = sorted({(e.get("marque") or "").split("/")[0].strip().upper()
        for e in existing if e.get("marque") and "multi" not in e["marque"].lower()})
    makes = [m for m in makes if m and len(m) > 1]
    extra = ["PEUGEOT","CITROEN","RENAULT","DACIA","DS","OPEL","VOLKSWAGEN","BMW","MERCEDES-BENZ","AUDI",
             "SKODA","SEAT","FORD","TOYOTA","HONDA","NISSAN","HYUNDAI","KIA","MAZDA","SUZUKI","MITSUBISHI",
             "SUBARU","LEXUS","INFINITI","ACURA","TESLA","VOLVO","JAGUAR","LAND ROVER","PORSCHE","MINI",
             "FIAT","ALFA ROMEO","JEEP","CHRYSLER","DODGE","RAM","CHEVROLET","GMC","CADILLAC","BUICK",
             "LINCOLN","BYD","MG","POLESTAR","GENESIS","CUPRA","SMART","SSANGYONG","ISUZU","LANCIA"]
    makes = sorted(set(makes) | set(extra))
    seen = {(e.get("campagne"), e.get("modele"), str(e.get("annees"))) for e in existing if e.get("source")=="nhtsa"}
    for mk in makes:
        for yr in range(YEAR_START, YEAR_END+1):
            try:
                ml = jget(f"https://api.nhtsa.gov/products/vehicle/models?modelYear={yr}&make={urllib.parse.quote(mk)}&issueType=r&max=1000")
                models = sorted({m["model"] for m in ml.get("results", [])})
            except Exception as ex:
                print("NHTSA models", mk, yr, ex); continue
            time.sleep(0.35)
            for md in models:
                key = (mk, md, yr)
                if key in done and yr < YEAR_END-1: continue
                try:
                    j = jget(f"https://api.nhtsa.gov/recalls/recallsByVehicle?make={urllib.parse.quote(mk)}&model={urllib.parse.quote(md)}&modelYear={yr}")
                except Exception as ex:
                    print("NHTSA recall", key, ex); continue
                time.sleep(0.35)
                done.add(key)
                for r in j.get("results", []):
                    camp = r.get("NHTSACampaignNumber","")
                    if (camp, md, str([yr,yr])) in seen: continue
                    seen.add((camp, md, str([yr,yr])))
                    txt = (r.get("Summary","")+" "+r.get("Consequence",""))
                    feu = bool(FIRE_EN.search(txt)) or r.get("parkIt") is True
                    out.append(entry(
                        id=f"nhtsa-{camp}-{md}-{yr}".replace(" ","_"), source="nhtsa",
                        themes=["technique"]+(["incendie"] if feu else []),
                        marque=mk.title(), modele=md, annees=[yr,yr],
                        systeme=r.get("Component",""), defaut=r.get("Summary","")[:400],
                        mecanisme=r.get("Summary",""), consequences=[r.get("Consequence","")],
                        risque_feu=feu,
                        chaine_feu=("Défaut rappel → "+r.get("Consequence","")) if feu else "",
                        gravite="critique" if (feu or r.get("parkIt")) else "eleve",
                        campagne=camp, url="https://www.nhtsa.gov/recalls?nhtsaId="+camp,
                        date=iso(r.get("ReportReceivedDate",""), "%d/%m/%Y")))
        print("NHTSA", mk, "→ total neuf:", len(out))
    return out

# ---------------- 2) RAPPELCONSO (open data DGCCRF) ----------------
def rappelconso():
    out = []; base = "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records"
    where = 'categorie_produit="automobiles et moyens de déplacement"'
    offset = 0
    while True:
        u = base+"?"+urllib.parse.urlencode({"where":where,"limit":100,"offset":offset,"order_by":"date_publication desc"})
        j = jget(u); res = j.get("results", [])
        if not res: break
        for r in res:
            txt = " ".join(str(r.get(k) or "") for k in ("motif_rappel","risques_encourus","description_complementaire_risque"))
            feu = bool(FIRE_FR.search(txt))
            out.append(entry(id="rc-"+r.get("numero_fiche",""), source="rappelconso",
                themes=["technique"]+(["incendie"] if feu else []),
                marque=(r.get("marque_produit") or "").title(),
                modele=r.get("modeles_ou_references") or "", annees=None,
                systeme=r.get("sous_categorie_produit") or "",
                defaut=(r.get("libelle") or r.get("motif_rappel") or "")[:400],
                mecanisme=r.get("motif_rappel") or "",
                consequences=[r.get("risques_encourus") or "", r.get("conduites_a_tenir_par_le_consommateur") or ""],
                risque_feu=feu, chaine_feu=("Rappel : "+txt[:300]) if feu else "",
                gravite="critique" if feu else "eleve",
                campagne=r.get("numero_fiche",""), url=r.get("lien_vers_la_fiche_rappel") or "",
                date=(r.get("date_publication") or "")[:10]))
        offset += 100
        if offset >= j.get("total_count", 0): break
        time.sleep(0.3)
    print("RappelConso:", len(out)); return out

# ---------------- 3) SAFETY GATE (XML hebdo officiel, FR si dispo) ----------------
def safetygate():
    out = []
    for lang in ("fr","en"):
        b = http(f"https://ec.europa.eu/safety-gate-alerts/api/download/weeklyReport/list/xml/{lang}")
        if b: break
    root = ET.fromstring(b)
    reports = []
    for wr in root.iter("weeklyReport"):
        ref = wr.findtext("reference",""); url = wr.findtext("URL","")
        y = int(wr.findtext("year","0") or 0); w = int(wr.findtext("week","0") or 0)
        reports.append((y, w, ref, url))
    reports.sort()
    last = state.get("sg_last","")
    todo = [r for r in reports if r[2] > last] if last else reports[-104:]  # 1er run : 2 ans ; ensuite : nouveautés
    for y, w, ref, url in todo:
        try: det = ET.fromstring(http(url.replace("&amp;","&")))
        except Exception as ex: print("SG", ref, ex); continue
        for n in det.iter("notifications"):
            cat = (n.findtext("category") or "").lower()
            if "motor vehicle" not in cat and "véhicule" not in cat: continue
            danger = n.findtext("danger") or ""; risk = n.findtext("riskType") or ""
            feu = bool(FIRE_FR.search(danger+risk)) or bool(FIRE_EN.search(danger+risk))
            out.append(entry(id="sg-"+(n.findtext("caseNumber") or ref), source="safetygate",
                themes=["technique"]+(["incendie"] if feu else []),
                marque=n.findtext("brand") or "", modele=(n.findtext("type_numberOfModel") or "")+" "+(n.findtext("name") or ""),
                systeme=n.findtext("product") or "", defaut=(n.findtext("product") or "")+" — "+risk,
                mecanisme=danger, consequences=[risk, n.findtext("measures") or ""],
                risque_feu=feu, chaine_feu=("Alerte UE : "+danger[:300]) if feu else "",
                gravite="critique" if feu else "eleve",
                campagne=n.findtext("caseNumber") or "", url=n.findtext("reference") or "",
                date=iso(n.findtext("publicationDate",""), "%d-%m-%Y")))
        state["sg_last"] = ref; time.sleep(0.4)
    print("Safety Gate:", len(out)); return out

# ---------------- 4) FUSION des 4 sites Kevin (tableaux JSON embarqués) ----------------
KEYS = {"defaut","titre","title","mecanisme","mecanisme","conséquences","consequences","marque","modele","motorisation","dtc","symptomes","indices"}
def arrays(js):
    for m in re.finditer(r'\[\s*\{', js):
        i = m.start(); depth = 0; instr = False; escp = False
        for k in range(i, min(i+2_000_000, len(js))):
            c = js[k]
            if instr:
                if escp: escp = False
                elif c == "\\": escp = True
                elif c == '"': instr = False
            else:
                if c == '"': instr = True
                elif c == "[": depth += 1
                elif c == "]":
                    depth -= 1
                    if depth == 0:
                        try: yield json.loads(js[i:k+1])
                        except Exception: pass
                        break
def fusion():
    out = []
    for site in SITES:
        try:
            html = http(site).decode("utf-8","ignore")
            srcs = re.findall(r'src="([^"]+\.js[^"]*)"', html)
            blobs = [html] + [http(urllib.parse.urljoin(site, s)).decode("utf-8","ignore") for s in srcs[:8]]
            n = 0
            for js in blobs:
                for arr in arrays(js):
                    for o in arr:
                        if not isinstance(o, dict): continue
                        keys = {k.lower() for k in o}
                        if len(keys & KEYS) < 2: continue
                        g = lambda *ks: next((o[k] for k in ks if k in o and o[k]), "")
                        feu = bool(FIRE_FR.search(json.dumps(o, ensure_ascii=False)))
                        an = re.findall(r"(19|20)\d{2}", str(g("annees","years","annee")))
                        out.append(entry(id="fusion-"+str(abs(hash(json.dumps(o,sort_keys=True)))%10**12),
                            source="fusion-kevin", type="panne",
                            themes=["technique"]+(["incendie"] if feu else []),
                            marque=str(g("marque","marques","brand")), modele=str(g("modele","modeles","model")),
                            motorisation=str(g("motorisation","motorisations","engine")),
                            annees=[int(an[0]),int(an[-1])] if an else None,
                            systeme=str(g("systeme","system")), dtc=g("dtc","DTC") or [],
                            defaut=str(g("defaut","titre","title"))[:400], mecanisme=str(g("mecanisme","mécanisme","mechanisme")),
                            consequences=g("consequences","conséquences") or [],
                            symptomes=g("symptomes","symptômes") or [], indices=g("indices") or [],
                            risque_feu=feu, gravite="eleve", url=str(g("url","source_url")), date=""))
                        n += 1
            print("Fusion", site, "→", n)
        except Exception as ex: print("Fusion", site, "ignoré:", ex)
    return out

# ---------------- 5) assemblage, catalogue, chunks ----------------
def main():
    seed = json.loads((DATA/"seed.json").read_text(encoding="utf-8"))
    manual = json.loads((DATA/"manual.json").read_text(encoding="utf-8")) if (DATA/"manual.json").exists() else []
    prev = []
    for f in DATA.glob("base-*.json"): prev += json.loads(f.read_text(encoding="utf-8"))
    entries = seed + manual + prev
    entries += fusion() + rappelconso() + safetygate() + nhtsa(entries)
    # dédoublonnage
    uniq = {}; 
    for e in entries:
        k = e.get("id") or (e.get("source","")+e.get("campagne","")+e.get("modele","")+str(e.get("annees")))
        uniq[k] = e
    entries = list(uniq.values())
    # catalogue auto (marques / modèles / motorisations réels, 2026-2027 inclus dès publication)
    marques, modeles, moteurs = set(), {}, set()
    for e in entries:
        for m in re.split(r"[/,]", e.get("marque") or ""):
            m = m.strip()
            if m and "multi" not in m.lower(): marques.add(m)
        md = (e.get("modele") or "").strip()
        if md and len(md) < 40:
            k = (e.get("marque") or "").split("/")[0].strip()
            modeles.setdefault(k, set()).add(md)
        if e.get("motorisation"): moteurs.add(e["motorisation"])
    cat = {"marques": sorted(marques), "modeles": {k: sorted(v) for k, v in sorted(modeles.items())},
           "motorisations": sorted(moteurs)}
    # écriture chunks (~1500 fiches / fichier)
    for f in DATA.glob("base-*.json"): f.unlink()
    chunks = []
    for i in range(0, len(entries), 1500):
        name = f"base-{i//1500:03d}.json"; chunks.append(name)
        (DATA/name).write_text(json.dumps(entries[i:i+1500], ensure_ascii=False), encoding="utf-8")
    version = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M")
    (DATA/"index.json").write_text(json.dumps({"version":version,"chunks":chunks,"catalogue":cat,
        "stats":{"fiches":len(entries),"marques":len(cat["marques"]),
                 "modeles":sum(len(v) for v in cat["modeles"].values()),
                 "feu":sum(1 for e in entries if e.get("risque_feu"))}}, ensure_ascii=False), encoding="utf-8")
    state["nhtsa_done"] = [list(x) for x in done]
    STATE_F.write_text(json.dumps(state), encoding="utf-8")
    print("✅ TOTAL", len(entries), "fiches •", len(cat["marques"]), "marques • version", version)

if __name__ == "__main__": main()
