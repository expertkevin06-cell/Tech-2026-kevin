/* ============================================================================
   KEV TECH & FIRE — DATA ENGINE v5
   • window.KEV_BOOTED posé à la 1ʳ ligne (watchdog index.html)
   • Ré-assertion toutes les 1,2 s : aucune course ne peut écraser la base fusionnée
   • Catalogue massif embarqué + auto-construction (RappelConso + 5 sites + cache IndexedDB)
   • Autovérification APK (badge 🩺) + réparation GitHub 404
   ============================================================================ */
window.KEV_BOOTED = true;
(() => {
"use strict";
window.addEventListener("error", e => { try { if (window.KEV_BOOTED && typeof log === "function") log("❌ Runtime : " + e.message); } catch (_) {} });

const EMB={
marques:"Abarth|Aiways|Alfa Romeo|Alpine|Aston Martin|Audi|Bentley|BMW|BYD|Cadillac|Chery|Chevrolet|Chrysler|Citroën|Cupra|Dacia|Daihatsu|Dodge|DS|Ferrari|Fiat|Fisker|Ford|Geely|Genesis|GMC|Honda|Hongqi|Hyundai|Infiniti|Isuzu|Jaecoo|Jaguar|Jeep|Kia|KTM|Lada|Lamborghini|Lancia|Land Rover|Leapmotor|Lexus|Lincoln|Lotus|Lucid|Mahindra|Maserati|Mazda|McLaren|Mercedes-Benz|MG|Mini|Mitsubishi|Nio|Nissan|Omoda|Opel|Ora|Peugeot|Polestar|Porsche|RAM|Renault|Rivian|Rolls-Royce|Saab|SEAT|Seres|Skoda|Smart|SsangYong|Subaru|Suzuki|Tata|Tesla|Toyota|VinFast|Volkswagen|Volvo|Xpeng|Zeekr".split("|"),
modeles:{
"Skoda":["Citigo","Elroq","Enyaq","Enyaq Coupé","Fabia","Kamiq","Karoq","Kodiaq","Octavia","Octavia Combi","Rapid","Roomster","Scala","Superb","Superb Combi","Yeti"],
"Volkswagen":["Amarok","Arteon","Beetle","Caddy","Crafter","Eos","Golf","Golf SW","ID.3","ID.4","ID.5","ID.7","ID.7 GTX","ID.Buzz","Passat","Phaeton","Polo","Polo GTI","Scirocco","Sharan","T-Cross","T-Roc","Tiguan","Touareg","Touran","Transporter","Up","e-Golf"],
"Peugeot":["1007","107","108","2008","206","207","208","3008","301","307","308","308 SW","408","5008","508","508 SW","607","807","Bipper","Boxer","Expert","Partner","Rifter","RCZ","Traveller","e-208","e-2008","e-3008","e-5008","e-Expert","e-Partner","e-Rifter"],
"Citroën":["Berlingo","C-Crosser","C-Elysee","C1","C2","C3","C3 Aircross","C3 Picasso","C4","C4 Cactus","C4 Picasso","C4 SpaceTourer","C5","C5 Aircross","C5 X","DS3","DS4","DS5","Jumper","Jumpy","Nemo","Saxo","SpaceTourer","Xsara","e-Berlingo","e-C4","e-C4 X","e-Jumpy","e-SpaceTourer","ë-C3"],
"Renault":["Arkana","Austral","Captur","Clio","Espace","Fluence","Grand Scenic","Kadjar","Kangoo","Koleos","Laguna","Latitude","Master","Megane","Megane E-Tech","Modus","Rafale","R5","Scenic","Symbioz","Talisman","Trafic","Twingo","Twingo Electric","Twizy","Wind","Zoe"],
"Dacia":["Bigster","Dokker","Duster","Duster Hybride","Jogger","Lodgy","Logan","Sandero","Sandero Stepway","Spring"],
"DS":["DS3","DS3 Crossback","DS4","DS5","DS7 Crossback","DS7 E-Tense 4x4","DS9"],
"BMW":["i3","i4","i5","i7","iX","iX1","iX2","iX3","Serie 1","Serie 2","Serie 3","Serie 3 Touring","Serie 4","Serie 5","Serie 5 Touring","Serie 6","Serie 7","Serie 8","X1","X2","X3","X4","X5","X6","X7","Z4","M2","M3","M4","M5"],
"Mercedes-Benz":["Classe A","Classe B","Classe C","Classe C Break","Classe E","Classe E Break","Classe G","Classe S","Classe V","CLA","CLS","EQA","EQB","EQC","EQE","EQS","GLA","GLB","GLC","GLE","GLS","SL","AMG GT","Sprinter","Vito","eVito","eSprinter","EQV"],
"Audi":["A1","A3","A4","A4 Allroad","A5","A6","A7","A8","e-tron","e-tron GT","Q2","Q3","Q4 e-tron","Q5","Q6 e-tron","Q7","Q8","R8","TT","SQ6","SQ8"],
"SEAT":["Alhambra","Arona","Ateca","Exeo","Ibiza","Leon","Leon ST","Mii","Tarraco","Toledo"],
"Cupra":["Ateca","Born","Formentor","Formentor VZ","Leon","Terramar","Tavascan","Tavascan VZ"],
"Tesla":["Model 3","Model S","Model X","Model Y","Model Y Performance","Cybertruck"],
"Hyundai":["Bayon","i10","i20","i30","Ioniq","Ioniq 5","Ioniq 5 N","Ioniq 6","Ioniq 9","ix20","ix35","Kona","Nexo","Santa Fe","Sonata","Staria","Tucson","Tucson Hybrid","Veloster","Inster"],
"Kia":["Carens","Ceed","Ceed SW","EV3","EV6","EV9","EV9 GT","Niro","Optima","Picanto","ProCeed","Rio","Sorento","Soul","Sportage","Sportage Hybrid","Stinger","Stonic","Venga","XCeed"],
"Toyota":["Auris","Avensis","Aygo","Aygo X","bZ4X","C-HR","Camry","Corolla","Corolla Cross","Corolla Touring Sports","GR86","Highlander","Hilux","Land Cruiser","Mirai","Prius","Proace","Proace City","RAV4","RAV4 PHEV","Supra","Swace","Verso","Yaris","Yaris Cross"],
"Nissan":["Ariya","Juke","Leaf","Micra","Navara","Note","Pulsar","Qashqai","Qashqai e-Power","Townstar","X-Trail"],
"Ford":["B-Max","C-Max","EcoSport","Explorer","Explorer Electric","Fiesta","Fiesta ST","Focus","Focus SW","Galaxy","Ka","Kuga","Mondeo","Mustang","Mustang Mach-E","Puma","Ranger","S-Max","Tourneo","Transit","Transit Custom","E-Transit"],
"Opel":["Adam","Ampera","Astra","Astra Sports Tourer","Cascada","Combo","Corsa","Corsa-e","Crossland","Grandland","Grandland Electric","Insignia","Karl","Meriva","Mokka","Movano","Vivaro","Zafira"],
"Fiat":["124 Spider","500","500e","500L","500X","600","600e","Bravo","Croma","Doblo","Ducato","Freemont","Grande Panda","Panda","Punto","Qubo","Sedici","Stilo","Tipo","Ulysse"],
"Volvo":["C30","EC40","EX30","EX40","EX90","S60","S90","V40","V60","V60 Cross Country","V90","XC40","XC60","XC60 Recharge","XC90"],
"MG":["MG4","MG4 XPower","MG5","HS","E-HS9","Marvel R","ZS","ZS EV","Cyberster"],
"BYD":["Atto 3","Dolphin","Han","Seal","Seal AWD","Seal U","Seal U DM-i","Seagull","Tang"],
"Mini":["Clubman","Cooper","Cooper SE","Countryman","Aceman","Paceman"],
"Mazda":["CX-3","CX-30","CX-5","CX-60","CX-80","MX-30","MX-5","Mazda2","Mazda3","Mazda6","RX-8"],
"Suzuki":["Across","Baleno","Ignis","Jimny","S-Cross","Swift","SX4","Vitara","Vitara Hybrid"],
"Jeep":["Avenger","Avenger Electric","Cherokee","Compass","Gladiator","Grand Cherokee","Renegade","Wrangler"],
"Land Rover":["Defender","Defender 110","Discovery","Discovery Sport","Freelander","Range Rover","Range Rover Evoque","Range Rover Sport","Range Rover Velar"],
"Jaguar":["E-Pace","F-Pace","F-Type","I-Pace","XE","XF"],
"Porsche":["718 Boxster","718 Cayman","911","Cayenne","Macan","Macan Electric","Panamera","Taycan"],
"Lexus":["CT","IS","LC","LS","NX","NX 450h+","RC","RX","RZ","UX"],
"Honda":["Accord","Civic","Civic e:HEV","CR-V","CR-Z","e:Ny1","HR-V","Insight","Jazz","ZR-V"],
"Alfa Romeo":["Giulia","Giulietta","Junior","MiTo","Stelvio","Tonale","Tonale PHEV"],
"Alpine":["A110","A290","A390"],
"Smart":["forfour","fortwo","#1","#3","#5"],
"Polestar":["2","3","4"],
"Nio":["EL7","ES6","ES8","ET5","ET7"],
"Xpeng":["G6","G9","P7"],
"Leapmotor":["C10","T03"],
"VinFast":["VF6","VF7","VF8","VF9"],
"Subaru":["Crosstrek","Forester","Impreza","Levorg","Outback","Solterra","WRX","XV"],
"Mitsubishi":["ASX","Eclipse Cross","Outlander","Outlander PHEV","Space Star"],
"Genesis":["G70","G80","GV60","GV70","GV80"],
"SsangYong":["Korando","Rexton","Tivoli","Torres"],
"Lancia":["Delta","Ypsilon","Ypsilon Elettrica"],
"Abarth":["500","595","695","500e","600e"],
"Lotus":["Eletre","Emira","Evija"],
"Maserati":["Ghibli","Grecale","GranTurismo","Levante","MC20","Quattroporte"],
"Rolls-Royce":["Cullinan","Ghost","Phantom","Spectre"],
"Bentley":["Bentayga","Continental GT","Flying Spur"],
"Lucid":["Air","Gravity"],
"Rivian":["R1S","R1T","R2"],
"Zeekr":["001","009","X"],
"Ora":["Funky Cat","03","07"],
"Jaecoo":["5","7"],
"Omoda":["5","9"],
"Fisker":["Ocean"],
"Aiways":["U5","U6"]},
motorisations:"0.9 TCe|1.0 DIG-T|1.0 EcoBoost|1.0 EcoBoost Hybrid|1.0 MPI|1.0 T-GDi|1.0 TCe|1.0 TSI|1.0 VTi|1.2 DIG-T|1.2 PureTech|1.2 TCe|1.2 TSI|1.3 DIG-T|1.3 TCE|1.3 TCe|1.4 TSI|1.5 Blue dCi|1.5 BlueHDi|1.5 EcoBlue|1.5 EcoBoost|1.5 eTSI|1.5 T-GDi|1.5 TSI|1.6 BlueHDi|1.6 CDTI|1.6 CRDi|1.6 dCi|1.6 E-Tech Hybrid|1.6 GDi|1.6 HDi|1.6 T-GDi|1.6 TCe|1.6 TDCi|1.6 TDI|1.6 THP|2.0 Blue dCi|2.0 BlueHDi|2.0 CDTI|2.0 CRDi|2.0 dCi|2.0 EcoBlue|2.0 EcoBoost|2.0 HDi|2.0 TDI|2.0 TFSI|2.0 TSI|2.2 BlueHDi|2.2 dCi|3.0 TDI|3.0 TFSI|E-Tech Hybrid|E-Tech Electric|e-Power|DM-i PHEV|T8 Recharge|Électrique 40 kWh|Électrique 50 kWh|Électrique 52 kWh|Électrique 55 kWh|Électrique 58 kWh|Électrique 59 kWh|Électrique 60 kWh|Électrique 62 kWh|Électrique 64 kWh|Électrique 70 kWh|Électrique 77 kWh|Électrique 79 kWh|Électrique 82 kWh|Électrique 84 kWh|Électrique 90 kWh|Électrique 99 kWh".split("|"),
versions:[
{marque:"Skoda",modele:"Elroq",energie:"electrique",annees:[2024,2027],v:[["Elroq 50",125,170,"52 kWh utiles"],["Elroq 60",150,204,"59 kWh utiles"],["Elroq 85",210,286,"77 kWh utiles"],["Elroq 85x AWD",210,286,"77 kWh utiles"],["Elroq RS",250,340,"79 kWh utiles"]]},
{marque:"Skoda",modele:"Enyaq",energie:"electrique",annees:[2020,2027],v:[["iV 50",109,148,"52 kWh"],["iV 60",132,180,"58 kWh"],["iV 80",150,204,"77 kWh"],["80x AWD",195,265,"77 kWh"],["85",210,286,"77 kWh"],["85x AWD",210,286,"77 kWh"],["RS",250,340,"79 kWh"]]},
{marque:"Volkswagen",modele:"ID.3",energie:"electrique",annees:[2019,2027],v:[["Pure",125,170,"52 kWh"],["Pro",150,204,"58 kWh"],["Pro S",150,204,"77 kWh"],["GTX",240,326,"79 kWh"]]},
{marque:"Volkswagen",modele:"ID.4",energie:"electrique",annees:[2020,2027],v:[["Pure",125,170,"52 kWh"],["Pro",150,204,"77 kWh"],["Pro 4MOTION",195,265,"77 kWh"],["GTX",250,340,"79 kWh"]]},
{marque:"Volkswagen",modele:"ID.5",energie:"electrique",annees:[2021,2027],v:[["Pro",150,204,"77 kWh"],["Pro 4MOTION",195,265,"77 kWh"],["GTX",250,340,"79 kWh"]]},
{marque:"Volkswagen",modele:"ID.7",energie:"electrique",annees:[2023,2027],v:[["Pro",210,286,"77 kWh"],["Pro S",210,286,"86 kWh"],["GTX",250,340,"86 kWh"]]},
{marque:"Volkswagen",modele:"ID.Buzz",energie:"electrique",annees:[2022,2027],v:[["Pro",150,204,"77 kWh"],["GTX",250,340,"86 kWh"]]},
{marque:"Cupra",modele:"Born",energie:"electrique",annees:[2021,2027],v:[["150 kW",150,204,"58 kWh"],["170 kW e-Boost",170,231,"77 kWh"],["VZ",240,326,"79 kWh"]]},
{marque:"Cupra",modele:"Tavascan",energie:"electrique",annees:[2024,2027],v:[["V1",210,286,"77 kWh"],["V2 AWD",250,340,"77 kWh"],["VZ",250,340,"79 kWh"]]},
{marque:"Audi",modele:"Q4 e-tron",energie:"electrique",annees:[2021,2027],v:[["35",125,170,"52 kWh"],["40",150,204,"77 kWh"],["50 quattro",220,299,"77 kWh"]]},
{marque:"Audi",modele:"Q6 e-tron",energie:"electrique",annees:[2024,2027],v:[["RWD",215,292,"83 kWh"],["quattro",285,387,"94 kWh"],["SQ6",360,489,"94 kWh"]]},
{marque:"Renault",modele:"Megane E-Tech",energie:"electrique",annees:[2022,2027],v:[["EV40",96,130,"40 kWh"],["EV60",160,220,"60 kWh"]]},
{marque:"Renault",modele:"R5",energie:"electrique",annees:[2024,2027],v:[["EV40",90,120,"40 kWh"],["EV52",110,150,"52 kWh"]]},
{marque:"Renault",modele:"Scenic",energie:"electrique",annees:[2024,2027],v:[["EV60",125,170,"60 kWh"],["EV87",160,220,"87 kWh"]]},
{marque:"Renault",modele:"Zoe",energie:"electrique",annees:[2012,2024],v:[["R90",65,88,"41 kWh"],["R110",80,108,"41 kWh"],["R135",100,136,"52 kWh"]]},
{marque:"Peugeot",modele:"e-208",energie:"electrique",annees:[2019,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"51 kWh utiles"]]},
{marque:"Peugeot",modele:"e-2008",energie:"electrique",annees:[2019,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"51 kWh utiles"]]},
{marque:"Peugeot",modele:"e-3008",energie:"electrique",annees:[2024,2027],v:[["210 ch",157,210,"73 kWh utiles"],["230 ch Long Range",170,230,"96 kWh utiles"],["Dual Motor",240,325,"73 kWh utiles"]]},
{marque:"Citroën",modele:"ë-C3",energie:"electrique",annees:[2024,2027],v:[["83 kW",83,113,"44 kWh"]]},
{marque:"Citroën",modele:"e-C4",energie:"electrique",annees:[2020,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"54 kWh"]]},
{marque:"Opel",modele:"Corsa-e",energie:"electrique",annees:[2019,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"51 kWh utiles"]]},
{marque:"Opel",modele:"Mokka",energie:"electrique",annees:[2020,2027],v:[["Electric 100 kW",100,136,"50 kWh"],["Electric 115 kW",115,156,"54 kWh"]]},
{marque:"Fiat",modele:"500e",energie:"electrique",annees:[2020,2027],v:[["24 kWh",70,95,"24 kWh"],["42 kWh",87,118,"42 kWh"]]},
{marque:"Dacia",modele:"Spring",energie:"electrique",annees:[2021,2027],v:[["Electric 45",33,45,"26,8 kWh"],["Electric 65",48,65,"26,8 kWh"]]},
{marque:"Tesla",modele:"Model 3",energie:"electrique",annees:[2017,2027],v:[["Propulsion",208,283,"~60 kWh"],["Long Range AWD",366,498,"~75 kWh"],["Performance",340,460,"~75 kWh"]]},
{marque:"Tesla",modele:"Model Y",energie:"electrique",annees:[2020,2027],v:[["Propulsion",220,299,"~60 kWh"],["Long Range AWD",378,514,"~75 kWh"],["Performance",393,534,"~75 kWh"]]},
{marque:"Hyundai",modele:"Ioniq 5",energie:"electrique",annees:[2021,2027],v:[["58 kWh RWD",125,170,"58 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"],["N",478,650,"84 kWh"]]},
{marque:"Hyundai",modele:"Ioniq 6",energie:"electrique",annees:[2022,2027],v:[["53 kWh RWD",111,151,"53 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"]]},
{marque:"Hyundai",modele:"Kona",energie:"electrique",annees:[2018,2027],v:[["39 kWh",100,136,"39 kWh"],["64 kWh",150,204,"64 kWh"],["65 kWh",160,218,"65 kWh"]]},
{marque:"Kia",modele:"EV6",energie:"electrique",annees:[2021,2027],v:[["58 kWh RWD",125,170,"58 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"],["GT",448,609,"77 kWh"]]},
{marque:"Kia",modele:"EV9",energie:"electrique",annees:[2023,2027],v:[["RWD",150,204,"99,8 kWh"],["AWD",283,385,"99,8 kWh"],["GT",374,508,"99,8 kWh"]]},
{marque:"Kia",modele:"EV3",energie:"electrique",annees:[2024,2027],v:[["Standard",125,170,"58 kWh"],["Long Range",150,204,"81 kWh"]]},
{marque:"Kia",modele:"Niro",energie:"electrique",annees:[2018,2027],v:[["e-Niro 39 kWh",100,136,"39 kWh"],["e-Niro 64 kWh",150,204,"64 kWh"],["EV 65 kWh",150,204,"65 kWh"]]},
{marque:"MG",modele:"MG4",energie:"electrique",annees:[2022,2027],v:[["Standard",125,170,"51 kWh"],["Comfort/Luxury",150,204,"64 kWh"],["Trophy ER",180,245,"77 kWh"],["XPower",320,435,"64 kWh"]]},
{marque:"MG",modele:"ZS",energie:"electrique",annees:[2019,2027],v:[["EV Standard",105,143,"51 kWh"],["EV Long Range",115,156,"72 kWh"]]},
{marque:"BYD",modele:"Atto 3",energie:"electrique",annees:[2022,2027],v:[["Design/Comfort",150,204,"60,5 kWh"]]},
{marque:"BYD",modele:"Dolphin",energie:"electrique",annees:[2023,2027],v:[["Active/Boost",70,95,"44,9 kWh"],["Comfort/Design",150,204,"60,4 kWh"]]},
{marque:"BYD",modele:"Seal",energie:"electrique",annees:[2023,2027],v:[["RWD",230,313,"82,5 kWh"],["AWD",390,530,"82,5 kWh"]]},
{marque:"Volvo",modele:"EX30",energie:"electrique",annees:[2023,2027],v:[["Single Motor",200,272,"51 kWh"],["Single Motor ER",200,272,"69 kWh"],["Twin Performance",315,428,"69 kWh"]]},
{marque:"Volvo",modele:"EX40",energie:"electrique",annees:[2023,2027],v:[["Single Motor",175,238,"69 kWh"],["Twin Motor",300,408,"82 kWh"]]},
{marque:"Volvo",modele:"XC40",energie:"electrique",annees:[2020,2027],v:[["Recharge Single",175,238,"69 kWh"],["Recharge Twin",300,408,"78 kWh"]]},
{marque:"BMW",modele:"i4",energie:"electrique",annees:[2021,2027],v:[["eDrive35",210,286,"66 kWh"],["eDrive40",250,340,"81 kWh"],["M50",400,544,"81 kWh"]]},
{marque:"BMW",modele:"iX1",energie:"electrique",annees:[2022,2027],v:[["eDrive20",150,204,"64,7 kWh"],["xDrive30",230,313,"64,7 kWh"]]},
{marque:"BMW",modele:"i5",energie:"electrique",annees:[2023,2027],v:[["eDrive40",250,340,"81 kWh"],["M60 xDrive",442,601,"81 kWh"]]},
{marque:"Mercedes-Benz",modele:"EQA",energie:"electrique",annees:[2021,2027],v:[["250",140,190,"66,5 kWh"],["250+",140,190,"70,5 kWh"],["300 4MATIC",168,228,"66,5 kWh"],["350 4MATIC",215,292,"66,5 kWh"]]},
{marque:"Mercedes-Benz",modele:"EQB",energie:"electrique",annees:[2021,2027],v:[["250+",140,190,"70,5 kWh"],["300 4MATIC",168,228,"66,5 kWh"],["350 4MATIC",215,292,"66,5 kWh"]]},
{marque:"Nissan",modele:"Leaf",energie:"electrique",annees:[2010,2027],v:[["24 kWh",80,109,"24 kWh"],["40 kWh",110,150,"40 kWh"],["e+ 62 kWh",160,217,"62 kWh"]]},
{marque:"Nissan",modele:"Ariya",energie:"electrique",annees:[2022,2027],v:[["63 kWh",160,218,"63 kWh"],["87 kWh",178,242,"87 kWh"],["e-4ORCE 87 kWh",225,306,"87 kWh"]]},
{marque:"Toyota",modele:"bZ4X",energie:"electrique",annees:[2022,2027],v:[["FWD",150,204,"71,4 kWh"],["AWD",160,218,"71,4 kWh"]]},
{marque:"Porsche",modele:"Taycan",energie:"electrique",annees:[2019,2027],v:[["",300,408,"79 kWh"],["4S",390,530,"93 kWh"],["Turbo",650,884,"93 kWh"]]},
{marque:"Polestar",modele:"2",energie:"electrique",annees:[2020,2027],v:[["Standard Range",200,272,"69 kWh"],["Long Range",220,299,"82 kWh"],["Long Range Dual",350,476,"82 kWh"]]}]};

const SITES=[
 {id:"techkevin",name:"TechKevin 2026",url:"https://expertkevin06-cell.github.io/techkevin2026/"},
 {id:"mytech",name:"My Tech by Kevin",url:"https://expertkevin06-cell.github.io/my-tech-by-kevin/"},
 {id:"incendie",name:"Étude incendie",url:"https://expertkevin06-cell.github.io/etude-incendie-by-kevin/"},
 {id:"kevdiag",name:"Kev Diag Incendie",url:"https://expertkevin06-cell.github.io/kev-diag-incendie/"},
 {id:"autodiag",name:"Auto Diagnostic",url:"https://expertkevin06-cell.github.io/auto-diagnostic/"}];
const PROBES=["data/catalogue.json","catalogue.json","data/vehicules.json","data/base.json","base.json","data/pannes.json","data/db.json","data/index.json","asset-manifest.json","data/export.json","export.json"];
const WORKFLOW_YAML="name: MAJ bases techniques\non:\n  schedule: [{cron: \"0 3 1,16 * *\"}]\n  workflow_dispatch:\n  push:\n    paths: [\"data/catalogue_source.json\",\"data/manual.json\",\"scripts/update_bases.py\"]\npermissions: {contents: write}\nconcurrency: {group: maj-bases, cancel-in-progress: false}\njobs:\n  rapide:\n    runs-on: ubuntu-latest\n    timeout-minutes: 25\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: {python-version: \"3.12\"}\n      - run: pip install pillow -q && python scripts/make_icon.py || true\n      - env: {PHASE: rapide}\n        run: python scripts/update_bases.py\n      - run: |\n          git config user.name \"kev-bot\"\n          git config user.email \"actions@users.noreply.github.com\"\n          git add data\n          git add icons || true\n          git diff --cached --quiet || git commit -m \"MAJ rapide bases + catalogue\"\n          git pull --rebase origin main || true\n          git push\n  nhtsa:\n    needs: rapide\n    runs-on: ubuntu-latest\n    timeout-minutes: 320\n    continue-on-error: true\n    steps:\n      - uses: actions/checkout@v4\n        with: {ref: main}\n      - uses: actions/setup-python@v5\n        with: {python-version: \"3.12\"}\n      - env: {PHASE: nhtsa}\n        run: python scripts/update_bases.py\n      - run: |\n          git config user.name \"kev-bot\"\n          git config user.email \"actions@users.noreply.github.com\"\n          git add data\n          git diff --cached --quiet || git commit -m \"MAJ NHTSA\"\n          git pull --rebase origin main || true\n          git push\n";

const D=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const N=s=>(s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const E=s=>(s||"").toString().replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T=(m,ms=4200)=>{try{if(typeof toast==="function")toast(m,ms);else console.log(m);}catch(_){console.log(m);}};
const arr=v=>Array.isArray(v)?v.map(x=>String(x).trim()).filter(Boolean):typeof v==="string"?v.replace(/;/g,"\n").split(/\r?\n/).map(x=>x.trim()).filter(Boolean):[];
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
const sig=e=>e.id||hash([e.source,e.campagne,e.marque,e.modele,e.motorisation,e.defaut].map(N).join("|"));
const years=v=>{const m=String(v??"").match(/(?:19|20)\d{2}/g);return m?[Math.min(...m.map(Number)),Math.max(...m.map(Number))]:null;};
const power=v=>{const t=String(v??"").toLowerCase();const n=Number((t.match(/\d{2,4}/)||[])[0]);if(!n)return{ch:0,kw:0};return /kw/.test(t)?{ch:Math.round(n*1.35962),kw:n}:{ch:n,kw:Math.round(n/1.35962)};};
const energy=o=>{const t=N(typeof o==="string"?o:JSON.stringify(o||{}));if(/electrique|electric|bev|kwh/.test(t))return "electrique";if(/hybrid|phev|hev|recharge/.test(t))return "hybride";if(/diesel|tdi|hdi|dci|crdi|bluehdi|cdti|jtd|multijet/.test(t))return "diesel";if(/essence|tsi|tfsi|thp|puretech|ecoboost|gdi/.test(t))return "essence";return "";};
const FIRE=/incendie|feu\b|flamme|embras|brulure|inflamm|\bfire\b|flamm|ignit|burn|thermal runaway/i;
const ENGINE=/^\d[.,]\d|kwh|e-?tech|e-?tron|electric|electri|hybrid|phev|hev\b|tce|tsi|tfsi|tdi|hdi|dci|cdti|crdi|gdi|puretech|ecoboost|skyactiv|thp|jtd|multijet|d-4d|e-power|dm-i|bev/i;
const BRANDS=new Set(EMB.marques.map(N));
const get=(o,...ks)=>{for(const k of ks){const f=Object.keys(o||{}).find(x=>N(x).replace(/ /g,"")===N(k).replace(/ /g,""));if(f&&o[f]!=null&&o[f]!=="")return o[f];}return "";};

const IDB={db:null,
 open(){return new Promise(res=>{if(this.db)return res(this.db);if(!window.indexedDB)return res(null);
  const r=indexedDB.open("kevtf-engine",5);
  r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains("kv"))d.createObjectStore("kv");};
  r.onsuccess=()=>{this.db=r.result;res(this.db);};r.onerror=()=>res(null);});},
 async get(k){const d=await this.open();if(!d)return null;return new Promise(res=>{const t=d.transaction("kv").objectStore("kv").get(k);t.onsuccess=()=>res(t.result||null);t.onerror=()=>res(null);});},
 async set(k,v){const d=await this.open();if(!d)return false;return new Promise(res=>{const t=d.transaction("kv","readwrite").objectStore("kv").set(v,k);t.onsuccess=()=>res(true);t.onerror=()=>res(false);});},
 async del(k){const d=await this.open();if(!d)return false;return new Promise(res=>{const t=d.transaction("kv","readwrite").objectStore("kv").delete(k);t.onsuccess=()=>res(true);t.onerror=()=>res(false);});}};

function newCat(){return{marques:new Set(),modeles:new Map(),motorisations:new Set(),versions:new Map(),powers:new Set()};}
function addModel(c,b,m){b=String(b||"").trim();m=String(m||"").trim();if(!b||!m||m.length>60)return;if(!c.modeles.has(b))c.modeles.set(b,new Set());c.modeles.get(b).add(m);c.marques.add(b);}
function addVersion(c,o){const b=String(get(o,"marque","brand","make")||"").split("/")[0].trim();const m=String(get(o,"modele","model","modèle")||"").trim();if(!b||!m)return;addModel(c,b,m);
 const mot=String(get(o,"motorisation","engine","moteur","version","trim")||"").trim();
 const p=power(get(o,"puissance","power","ch","kw","puissance_ch","puissance_kw"));
 const note=String(get(o,"batterie","battery","note","kwh")||"").trim();
 const en=String(get(o,"energie","energy","fuel")||"").toLowerCase()||energy(o);
 const key=N(b)+"|"+N(m);
 if(!c.versions.has(key))c.versions.set(key,{marque:b,modele:m,energie:en,annees:years(get(o,"annees","years","annee","modelYear")),v:[]});
 const v=c.versions.get(key);if(en&&!v.energie)v.energie=en;
 if(mot||p.ch){const row=[mot||"Version",p.kw,p.ch,note];if(!v.v.some(x=>N(x[0])===N(row[0])&&x[2]===row[2]))v.v.push(row);}
 if(mot)c.motorisations.add(mot);if(p.ch)c.powers.add(p.ch);}
function catPlain(c){const modeles={};for(const[k,v]of c.modeles)modeles[k]=[...v].sort();
 return{marques:[...c.marques].sort(),modeles,motorisations:[...c.motorisations].sort(),powers:[...c.powers].sort((a,b)=>a-b),versions:[...c.versions.values()].map(v=>({...v,v:v.v.slice()}))};}
function catFrom(o){const c=newCat();
 (o?.marques||[]).forEach(x=>c.marques.add(String(x).trim()));
 for(const[k,v]of Object.entries(o?.modeles||{})){if(Array.isArray(v))v.forEach(m=>addModel(c,k,m));else if(v&&typeof v==="object")Object.keys(v).forEach(m=>addModel(c,k,m));}
 (o?.motorisations||[]).forEach(x=>c.motorisations.add(String(x).trim()));
 (o?.powers||o?.puissances||[]).forEach(x=>{const p=power(x);if(p.ch)c.powers.add(p.ch);});
 (o?.versions||o?.vehicules||[]).forEach(v=>{if(!v||typeof v!=="object")return;
  if(Array.isArray(v.v)){const key=N(v.marque)+"|"+N(v.modele);c.versions.set(key,{marque:v.marque,modele:v.modele,energie:v.energie||"",annees:v.annees||null,v:v.v.filter(Array.isArray)});addModel(c,v.marque,v.modele);}else addVersion(c,v);});
 return c;}
function catMerge(a,b){const c=newCat();
 for(const x of[a,b]){x.marques.forEach(v=>c.marques.add(v));x.motorisations.forEach(v=>c.motorisations.add(v));x.powers.forEach(v=>c.powers.add(v));
  for(const[k,v]of x.modeles)v.forEach(m=>addModel(c,k,m));
  for(const[k,v]of x.versions){if(!c.versions.has(k))c.versions.set(k,{...v,v:[]});const t=c.versions.get(k);
   if(v.energie&&!t.energie)t.energie=v.energie;if(v.annees&&!t.annees)t.annees=v.annees;
   (v.v||[]).forEach(r=>{if(!t.v.some(z=>N(z[0])===N(r[0])&&z[2]===r[2]))t.v.push(r);});}}
 return c;}

function isFault(o){const hasT=!!get(o,"defaut","titre","title","panne","libelle","fault","failure","nom","summary");
 const hasK=!!get(o,"mecanisme","mechanisme","cause","causes","consequences","symptomes","indices","systeme","dtc","campagne");
 return hasT&&hasK&&Object.keys(o).length>2;}
function isVehicle(o){return !!get(o,"marque","brand","make")&&!!get(o,"modele","model","modèle")&&!!get(o,"motorisation","engine","moteur","version","trim","puissance","power","ch","kw");}
function normFault(o,src){const raw=JSON.stringify(o);const feu=FIRE.test(raw);
 const an=years(get(o,"annees","years","annee","modelYear"))||years(get(o,"defaut","titre","title","summary"));
 const dtc=[...new Set([...arr(get(o,"dtc","codes")),...(String(raw).toUpperCase().match(/[PCBU]\d{4}/g)||[])])];
 const camp=String(get(o,"campagne","campaign","numero_fiche","caseNumber","NHTSACampaignNumber")||"");
 const source=String(get(o,"source")||src||"import").trim();
 return{id:String(get(o,"id")||"imp-"+hash(N(source+camp+get(o,"marque","brand","make")+get(o,"modele","model")+get(o,"defaut","titre","title","panne","libelle","summary")))),
  themes:Array.isArray(o.themes)?o.themes:["technique",...(feu?["incendie"]:[])],
  type:String(get(o,"type")||(camp?"rappel":"panne")),source,
  marque:String(get(o,"marque","brand","make")||"Multi-marques"),modele:String(get(o,"modele","model","modèle")||"Tous"),
  motorisation:String(get(o,"motorisation","engine","moteur","version")||""),annees:an,
  energie:String(get(o,"energie","energy","fuel")||"").toLowerCase()||energy(o),
  systeme:String(get(o,"systeme","system","organe","component")||""),dtc,
  symptomes:arr(get(o,"symptomes","symptômes","symptoms")),
  defaut:String(get(o,"defaut","titre","title","panne","libelle","fault","failure","nom","summary")||"Fiche importée").slice(0,400),
  mecanisme:String(get(o,"mecanisme","mécanisme","mechanisme","cause","causes","description","summary","motif_rappel","danger")||""),
  consequences:arr(get(o,"consequences","conséquences","consequence","risques_encourus","risques")),
  indices:arr(get(o,"indices","preuves")),risque_feu:o.risque_feu===true||feu,
  chaine_feu:String(get(o,"chaine_feu","chaineFeu","fireChain")||(feu?"Défaut documenté → mécanisme à expertiser → risque incendie à confirmer":"")),
  gravite:String(get(o,"gravite","severity")||(feu?"critique":"eleve")),campagne:camp,
  url:String(get(o,"url","source_url","lien","link","lien_vers_la_fiche_rappel")||""),
  date:String(get(o,"date","date_publication","publicationDate","ReportReceivedDate")||"").slice(0,10)};}
function classifyStrings(a,ctx,c){const key=N(ctx.key||"");const vals=a.map(x=>String(x).trim()).filter(Boolean);
 if(/marque|brand|make/.test(key)){vals.forEach(x=>c.marques.add(x));return;}
 if(/modele|model/.test(key)){vals.forEach(x=>addModel(c,ctx.marque||"Modèles importés",x));return;}
 if(/motorisation|moteur|engine|version|trim/.test(key)){vals.forEach(x=>c.motorisations.add(x));return;}
 if(/puissance|power/.test(key)){vals.forEach(x=>{const p=power(x);if(p.ch)c.powers.add(p.ch);});return;}
 const br=vals.filter(x=>BRANDS.has(N(x))),en=vals.filter(x=>ENGINE.test(x)),pw=vals.filter(x=>/^\d{2,4}\s?(ch|kw|cv)?$/i.test(x));
 if(br.length>=Math.max(3,vals.length*.4))br.forEach(x=>c.marques.add(x));
 else if(en.length>=Math.max(3,vals.length*.35))en.forEach(x=>c.motorisations.add(x));
 else if(pw.length>=Math.max(3,vals.length*.5))pw.forEach(x=>{const p=power(x);if(p.ch)c.powers.add(p.ch);});
 else vals.forEach(x=>{if(x.length<45)addModel(c,ctx.marque||"Modèles importés",x);});}
function normalizeAny(input,src){const c=newCat(),entries=[],seen=new Set();
 const push=e=>{const k=sig(e);if(seen.has(k))return;seen.add(k);entries.push(e);};
 const walk=(node,ctx,depth)=>{if(depth>7||node==null)return;
  if(Array.isArray(node)){if(node.length&&node.every(x=>typeof x==="string")){classifyStrings(node,ctx,c);return;}node.forEach(x=>walk(x,ctx,depth+1));return;}
  if(typeof node!=="object")return;
  const mk=get(node,"marque","brand","make");const my={...ctx};if(mk)my.marque=String(mk).split("/")[0].trim();
  if(isFault(node))push(normFault(node,src));
  if(isVehicle(node))addVersion(c,node);
  for(const[k,v]of Object.entries(node)){
   if(Array.isArray(v)&&v.length&&v.every(x=>typeof x==="string")){classifyStrings(v,{...my,key:k},c);continue;}
   if(v&&typeof v==="object")walk(v,{...my,key:k},depth+1);}};
 walk(input,{},0);return{entries,cat:c};}

function* jsonArrays(txt){const lim=Math.min(txt.length,4_000_000);let n=0;
 for(let i=0;i<lim-1;i++){if(txt[i]!=="["||(txt[i+1]!=="{"&&txt[i+1]!=='"'&&txt[i+1]!=="["))continue;
  let depth=0,str=false,esc=false;
  for(let j=i;j<lim;j++){const ch=txt[j];
   if(str){if(esc)esc=false;else if(ch==="\\")esc=true;else if(ch==='"')str=false;}
   else{if(ch==='"')str=true;else if(ch==="["||ch==="{")depth++;else if(ch==="]"||ch==="}"){depth--;
    if(depth===0){const raw=txt.slice(i,j+1);if(raw.length>40){let v=null;try{v=JSON.parse(raw);}catch(_){try{v=JSON.parse(raw.replace(/`/g,'"'));}catch(__){}}if(Array.isArray(v)){yield v;n++;}}break;}}}}
  if(n>600)return;}}
async function fetchText(url,ms=20000){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);
 try{const r=await fetch(url,{cache:"no-store",signal:c.signal});clearTimeout(t);return r.ok?await r.text():"";}catch(_){clearTimeout(t);return "";}}
async function harvestSite(site){const blobs=[];const html=await fetchText(site.url);
 if(!html)throw new Error("HTML inaccessible (CORS/réseau)");
 blobs.push(html);
 const urls=new Set();
 for(const m of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|json)[^"']*)["']/g))urls.add(new URL(m[1],site.url).href);
 for(const p of PROBES){const t=await fetchText(new URL(p,site.url).href,9000);if(t&&/^[\s]*[{\[]/.test(t))blobs.push(t);}
 let bytes=html.length,n=0;const q=[...urls];
 while(q.length&&n<26&&bytes<9e6){const u=q.shift();
  if(!/^https:\/\/expertkevin06-cell\.github\.io\//.test(u))continue;
  const t=await fetchText(u,20000);if(!t)continue;blobs.push(t);bytes+=t.length;n++;
  for(const m of t.matchAll(/["'`]((?:\.\/)?(?:assets\/)?[A-Za-z0-9_.\-]+\.(?:js|json))["'`]/g)){const nu=new URL(m[1],u).href;if(/^https:\/\/expertkevin06-cell\.github\.io\//.test(nu))q.push(nu);}
  await sleep(8);}
 const c=newCat(),entries=[];
 for(const b of blobs){let p=null;try{p=JSON.parse(b);}catch(_){}
  if(p){const r=normalizeAny(p,site.id);entries.push(...r.entries);catMerge(c,r.cat);}
  for(const a of jsonArrays(b)){const r=normalizeAny(a,site.id);entries.push(...r.entries);
   for(const[k,v]of r.cat.modeles)v.forEach(m=>addModel(c,k,m));
   r.cat.marques.forEach(x=>c.marques.add(x));r.cat.motorisations.forEach(x=>c.motorisations.add(x));
   for(const v of r.cat.versions.values())addVersion(c,{marque:v.marque,modele:v.modele,motorisation:(v.v[0]||[])[0],puissance:(v.v[0]||[])[2]});}
  await sleep(0);}
 return{entries,cat:c};}

let ENGINE_CAT=newCat(),ENGINE_ENTRIES=[],VEH_INDEX=[],LOG=[],SRC={};
function log(m){LOG.unshift({t:new Date().toLocaleTimeString("fr-FR"),m});LOG=LOG.slice(0,200);paintLog();}
function paintLog(){const el=D("de-log");if(el)el.innerHTML=LOG.map(x=>`<div><span>${E(x.t)}</span> ${E(x.m)}</div>`).join("");}
function counts(){return{fiches:(typeof BASE!=="undefined"?BASE:[]).length,marques:(typeof CATALOG!=="undefined"?CATALOG.marques:[]).length,modeles:Object.values((typeof CATALOG!=="undefined"?CATALOG.modeles:{})||{}).flat().length,mot:(typeof CATALOG!=="undefined"?CATALOG.motorisations:[]).length,ver:((typeof CATALOG!=="undefined"?CATALOG.versions:[])||[]).length,pow:((typeof CATALOG!=="undefined"?CATALOG.powers:[])||[]).length};}
function paintStats(){const c=counts();
 const s=D("de-stats");if(s)s.innerHTML=`<div><b>${c.fiches}</b><small>fiches</small></div><div><b>${c.marques}</b><small>marques</small></div><div><b>${c.modeles}</b><small>modèles</small></div><div><b>${c.mot}</b><small>motorisations</small></div><div><b>${c.ver}</b><small>versions</small></div><div><b>${c.pow}</b><small>puissances</small></div>`;
 const b=D("baseBadge");if(b)b.textContent=`🗄️ ${c.fiches} fiches • ${c.marques} marques • ${c.modeles} modèles • ${typeof VERSION!=="undefined"?VERSION:""}`;
 const st=D("baseStats");if(st)st.textContent=`Version ${typeof VERSION!=="undefined"?VERSION:""} • ${c.fiches} fiches • ${c.marques} marques • ${c.modeles} modèles • ${c.mot} motorisations • ${c.ver} versions • ${c.pow} puissances`;}
function applyData(entries,cat,ver){const map=new Map();
 (typeof BASE!=="undefined"?BASE:[]).forEach(e=>map.set(sig(e),e));
 entries.forEach(e=>map.set(sig(e),e));
 BASE=[...map.values()];ENGINE_ENTRIES=BASE.slice();
 ENGINE_CAT=catMerge(catFrom(typeof CATALOG!=="undefined"?CATALOG:{}),cat);
 CATALOG=catPlain(ENGINE_CAT);VERSION=ver||VERSION;
 try{indexBase();}catch(_){}
 try{fillFilters();fillDatalists();renderResults();}catch(_){}
 buildVehicleIndex();paintStats();}
async function persist(){await IDB.set("snapshot",{entries:BASE,catalogue:CATALOG,version:VERSION,ts:Date.now()});}

/* Ré-assertion : empêche TOUT écrasement par une charge async concurrente */
function reassert(){try{
 if(typeof CATALOG==="undefined"||!ENGINE_CAT||!ENGINE_CAT.marques.size)return;
 const curM=CATALOG.marques.length,wantM=ENGINE_CAT.marques.size;
 const curB=(typeof BASE!=="undefined"?BASE:[]).length,wantB=ENGINE_ENTRIES.length;
 if(curM<wantM||curB<wantB){
   CATALOG=catPlain(ENGINE_CAT);
   if(curB<wantB)BASE=ENGINE_ENTRIES.slice();
   try{indexBase();}catch(_){}
   try{fillFilters();fillDatalists();}catch(_){}
   buildVehicleIndex();
 }}catch(_){}
 paintStats();}

async function rappelConso(){const base="https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records";
 const where='categorie_produit="automobiles et moyens de déplacement"';let off=0,out=[];
 while(off<6000){const u=base+"?"+new URLSearchParams({where,limit:100,offset:off,order_by:"date_publication desc"});
  const t=await fetchText(u,25000);if(!t)break;let j;try{j=JSON.parse(t);}catch(_){break;}
  const res=j.results||[];if(!res.length)break;
  for(const r of res){const txt2=[r.motif_rappel,r.risques_encourus,r.description_complementaire_risque].join(" ");const feu=FIRE.test(txt2);
   out.push({id:"rc-"+(r.numero_fiche||hash(JSON.stringify(r))),themes:["technique",...(feu?["incendie"]:[])],type:"rappel",source:"rappelconso",
    marque:r.marque_produit||"",modele:r.modeles_ou_references||"",motorisation:"",annees:years(r.modeles_ou_references),energie:"",
    systeme:r.sous_categorie_produit||"",dtc:[],symptomes:[],defaut:(r.libelle||r.motif_rappel||"Rappel").slice(0,400),
    mecanisme:r.motif_rappel||"",consequences:[r.risques_encourus||"",r.conduites_a_tenir_par_le_consommateur||""].filter(Boolean),indices:[],
    risque_feu:feu,chaine_feu:feu?"Rappel officiel : "+txt2.slice(0,300):"",gravite:feu?"critique":"eleve",campagne:r.numero_fiche||"",
    url:r.lien_vers_la_fiche_rappel||"",date:(r.date_publication||"").slice(0,10)});}
  off+=100;setProgress(off/Math.max(1,j.total_count||1)*60);if(off>=(j.total_count||0))break;await sleep(100);}
 return out;}
async function nhtsaVehicle(v){if(!v.marque||!v.modele||!navigator.onLine)return[];
 const mk=v.marque.split("/")[0].trim(),md=v.modele.trim(),yr=v.annee||new Date().getFullYear();
 const t=await fetchText(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(mk)}&model=${encodeURIComponent(md)}&modelYear=${yr}`,20000);
 if(!t)return[];let j;try{j=JSON.parse(t);}catch(_){return[];}
 return (j.results||[]).map(r=>{const feu=FIRE.test((r.Summary||"")+" "+(r.Consequence||""))||r.parkIt===true;
  return{id:`nhtsa-${r.NHTSACampaignNumber}-${N(md)}-${yr}`,themes:["technique",...(feu?["incendie"]:[])],type:"rappel",source:"nhtsa",
   marque:mk,modele:md,motorisation:v.moteur||"",annees:[yr,yr],energie:v.energie||"",systeme:r.Component||"",dtc:[],symptomes:[],
   defaut:(r.Summary||"").slice(0,400),mecanisme:r.Summary||"",consequences:[r.Consequence||""].filter(Boolean),indices:[],
   risque_feu:feu,chaine_feu:feu?"Rappel NHTSA : "+(r.Consequence||""):"",gravite:feu||r.parkIt?"critique":"eleve",
   campagne:r.NHTSACampaignNumber||"",url:"https://www.nhtsa.gov/recalls?nhtsaId="+(r.NHTSACampaignNumber||""),
   date:(r.ReportReceivedDate||"").split("/").reverse().join("-")};});}

function ghTarget(){const m=(D("de-repo")?.value||localStorage.getItem("kevo_repo")||"").trim();
 if(m.includes("/"))return{owner:m.split("/")[0],repo:m.split("/")[1]};
 const host=location.hostname,path=location.pathname.split("/").filter(Boolean);
 const owner=host.endsWith(".github.io")?host.split(".")[0]:"expertkevin06-cell";
 return{owner,repo:path[0]||owner+".github.io"};}
function ghToken(){const v=(D("de-token")?.value||D("ghPat")?.value||localStorage.getItem("ghpat")||"").trim();
 if(v&&v!=="••••••••")localStorage.setItem("ghpat",v);return v==="••••••••"?(localStorage.getItem("ghpat")||""):v;}
async function ghFetch(p,{method="GET",token="",body=null}={}){const h={Accept:"application/vnd.github+json"};if(token)h.Authorization="Bearer "+token;if(body)h["Content-Type"]="application/json";
 const r=await fetch("https://api.github.com"+p,{method,headers:h,body:body?JSON.stringify(body):null});
 const text=await r.text();let j=null;try{j=JSON.parse(text);}catch(_){}return{ok:r.ok,status:r.status,json:j,text};}
function b64(s){const b=new TextEncoder().encode(s);let bin="";const C=0x8000;for(let i=0;i<b.length;i+=C)bin+=String.fromCharCode.apply(null,b.subarray(i,i+C));return btoa(bin);}
async function ghDetect(){const{owner,repo}=ghTarget();const token=ghToken();localStorage.setItem("kevo_repo",owner+"/"+repo);
 log(`🔎 GitHub : ${owner}/${repo}`);
 const r=await ghFetch(`/repos/${owner}/${repo}`,{token});
 if(!r.ok){log(`❌ Dépôt ${owner}/${repo} → HTTP ${r.status}`);return null;}
 const branch=r.json.default_branch||"main";log(`✅ Dépôt OK · branche ${branch}`);
 const w=await ghFetch(`/repos/${owner}/${repo}/actions/workflows`,{token});
 if(!w.ok){log(`⚠️ Workflows HTTP ${w.status} (scope workflow/Actions requis)`);return{owner,repo,branch,workflow:null};}
 const list=w.json.workflows||[];log(`📋 ${list.length} workflow(s) : ${list.map(x=>x.path).join(", ")||"aucun"}`);
 const wf=list.find(x=>/maj.*bases|maj-bases|update_bases/i.test(x.name+" "+x.path))||list[0]||null;
 if(wf)log(`🎯 Cible : ${wf.path} (${wf.state})`);
 return{owner,repo,branch,workflow:wf};}
async function ghRepair(){const token=ghToken();if(!token){log("❌ Token manquant");return;}
 const d=await ghDetect();if(!d)return;
 const path=".github/workflows/maj-bases.yml";
 const cur=await ghFetch(`/repos/${d.owner}/${d.repo}/contents/${path}?ref=${encodeURIComponent(d.branch)}`,{token});
 const sha=cur.ok?cur.json.sha:null;
 const put=await ghFetch(`/repos/${d.owner}/${d.repo}/contents/${path}`,{method:"PUT",token,body:{message:"KEV — installe/répare le workflow MAJ",content:b64(WORKFLOW_YAML),branch:d.branch,...(sha?{sha}:{})}});
 if(!put.ok){log(`❌ Écriture workflow HTTP ${put.status} : ${put.text.slice(0,200)}`);return;}
 log("✅ Workflow installé sur "+d.branch);await sleep(2200);await ghDispatch();}
async function ghDispatch(){const token=ghToken();if(!token){log("❌ Token manquant (classic repo+workflow · fine-granted Contents R/W + Actions R/W)");return;}
 const d=await ghDetect();if(!d)return;
 if(!d.workflow){log("⚠️ Aucun workflow — clique « Réparer le workflow »");return;}
 const r=await ghFetch(`/repos/${d.owner}/${d.repo}/actions/workflows/${encodeURIComponent(d.workflow.path.split("/").pop())}/dispatches`,{method:"POST",token,body:{ref:d.branch}});
 if(r.status===204){log("🚀 MAJ déclenchée");pollRuns(d);}else log(`❌ Dispatch HTTP ${r.status} : ${r.text.slice(0,240)}`);}
async function pollRuns(d){for(let i=0;i<20;i++){await sleep(15000);
 const r=await ghFetch(`/repos/${d.owner}/${d.repo}/actions/workflows/${encodeURIComponent(d.workflow.path.split("/").pop())}/runs?per_page=1`,{token:ghToken()});
 if(r.ok){const run=(r.json.workflow_runs||[])[0];if(run){log(`⏳ Run ${run.status} · ${run.conclusion||"…"}`);if(run.status==="completed"){if(run.conclusion==="success"){log("✅ MAJ terminée — rechargement");await bootData(true);}return;}}}}}

let harvesting=false;
function setProgress(p){const e=D("de-prog");if(e)e.style.width=Math.max(0,Math.min(100,p))+"%";const t=D("de-prog-txt");if(t)t.textContent=Math.round(p)+"%";}
async function harvestAll(force=false){if(harvesting)return;
 const last=await IDB.get("lastHarvest");
 if(!force&&last&&Date.now()-last.ts<6*3600*1000){log("⏭️ Récolte ignorée (< 6 h)");return;}
 harvesting=true;setProgress(2);log("🛰️ Récolte automatique démarrée");
 const c=newCat();let all=[];
 for(let i=0;i<SITES.length;i++){const s=SITES[i];
  try{log("→ "+s.name);const r=await harvestSite(s);all.push(...r.entries);catMerge(c,r.cat);SRC[s.id]={ok:true,n:r.entries.length};log(`✅ ${s.name} : ${r.entries.length} fiches`);}
  catch(err){SRC[s.id]={ok:false,error:err.message};log(`⚠️ ${s.name} : ${err.message}`);}
  setProgress(5+(i+1)/SITES.length*45);await sleep(40);}
 if(navigator.onLine){try{log("→ RappelConso (officiel)");const rc=await rappelConso();all.push(...rc);SRC.rappelconso={ok:true,n:rc.length};log(`✅ RappelConso : ${rc.length} fiches`);}catch(e){SRC.rappelconso={ok:false,error:e.message};log("⚠️ RappelConso : "+e.message);}}
 setProgress(85);
 applyData(all,c,"auto-"+new Date().toISOString().slice(0,10));
 await persist();await IDB.set("lastHarvest",{ts:Date.now()});setProgress(100);
 const k=counts();log(`🎉 Base fusionnée : ${k.fiches} fiches · ${k.marques} marques · ${k.modeles} modèles`);
 harvesting=false;T(`🛰️ Base massive prête : ${k.fiches} fiches · ${k.marques} marques.`);runSelfCheck();}

async function importFiles(files){const c=newCat();let all=[],count=0;
 for(const f of files){log(`📥 Import ${f.name}`);const ext=(f.name.split(".").pop()||"").toLowerCase();
  try{
   if(ext==="json"){const j=JSON.parse(await f.text());const r=normalizeAny(j,f.name);all.push(...r.entries);catMerge(c,r.cat);count+=r.entries.length;log(`✅ ${f.name} : ${r.entries.length} fiches`);}
   else if(["txt","md","csv"].includes(ext)){const txt=await f.text();
    const chunks=txt.split(/\n{2,}/).filter(x=>x.trim().length>40);
    const rows=chunks.map((x,i)=>({id:"doc-"+hash(f.name+i),themes:["technique",...(FIRE.test(x)?["incendie"]:[])],type:"document",source:"import-document",
     marque:"Multi-marques",modele:"Tous",motorisation:"",annees:null,energie:"",systeme:"Documentation",dtc:(x.toUpperCase().match(/[PCBU]\d{4}/g)||[]),
     symptomes:[],defaut:(f.name+" — extrait "+(i+1)).slice(0,200),mecanisme:x.slice(0,2000),consequences:[],indices:[],risque_feu:FIRE.test(x),
     chaine_feu:FIRE.test(x)?"Document : mécanisme incendie à expertiser":"",gravite:"modere",campagne:"",url:"",date:new Date().toISOString().slice(0,10)}));
    all.push(...rows);count+=rows.length;log(`✅ ${f.name} : ${rows.length} extraits`);}
   else if(ext==="pdf"){log("⏳ Extraction PDF…");
    await new Promise((res,rej)=>{if(window.pdfjsLib)return res();const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf=await window.pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let txt="";
    for(let p=1;p<=Math.min(pdf.numPages,250);p++){const pg=await pdf.getPage(p);const tc=await pg.getTextContent();txt+=tc.items.map(x=>x.str).join(" ")+"\n";setProgress(p/Math.min(pdf.numPages,250)*100);}
    const r=await importFiles([new File([txt],f.name.replace(/\.pdf$/i,".txt"),{type:"text/plain"})]);all.push(...r.entries);catMerge(c,r.cat);count+=r.count;}
   else{log(`⚠️ Format non géré : ${ext}`);continue;}
  }catch(err){log(`❌ ${f.name} : ${err.message}`);}
  setProgress((files.indexOf(f)+1)/files.length*100);}
 applyData(all,c,"import-"+new Date().toISOString().slice(0,10));await persist();
 T(`📥 Import terminé : ${count} éléments.`);return{entries:all,cat:c,count};}

function buildVehicleIndex(){const c=ENGINE_CAT;const seen=new Set();VEH_INDEX=[];
 for(const v of c.versions.values()){const k=N(v.marque)+"|"+N(v.modele);if(seen.has(k))continue;seen.add(k);VEH_INDEX.push({...v,_h:N([v.marque,v.modele,v.energie,(v.v||[]).map(x=>x[0]).join(" ")].join(" "))});}
 for(const[b,ms]of c.modeles)for(const m of ms){const k=N(b)+"|"+N(m);if(seen.has(k))continue;seen.add(k);VEH_INDEX.push({marque:b,modele:m,energie:"",annees:null,v:[],_h:N(b+" "+m)});}}
function searchVehicles(q,limit=14){const toks=N(q).split(" ").filter(Boolean);if(!toks.length)return[];const out=[];
 for(const v of VEH_INDEX){let s=0;
  for(const t of toks){if(N(v.marque).split(" ").includes(t))s+=5;else if(N(v.modele).split(" ").includes(t))s+=5;
   else if(N(v.marque).includes(t))s+=3;else if(N(v.modele).includes(t))s+=3;else if(v._h.includes(t))s+=2;
   else if((v.v||[]).some(x=>N(x[0]).includes(t)||String(x[2])===t||String(x[1])===t))s+=3;}
  if(s>=Math.min(5,toks.length*3))out.push([s,v]);}
 return out.sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>x[1]);}
function vehCard(v){const rows=(v.v||[]).map(x=>`<tr><td>${E(x[0]||"—")}</td><td><b>${x[2]||"—"} ch</b></td><td>${x[1]||"—"} kW</td><td>${E(x[3]||"")}</td><td><button class="de-use" data-veh='${E(JSON.stringify({m:v.marque,mo:v.modele,mt:x[0],p:x[2],e:v.energie}))}'>Utiliser</button></td></tr>`).join("");
 const veh={marque:v.marque,modele:v.modele,moteur:"",puiss:0,annee:0,energie:v.energie||""};
 let dispo=[];try{dispo=BASE.filter(e=>matchVehicle(e,veh)>=4);}catch(_){}
 const feu=dispo.filter(e=>e.risque_feu);
 return `<article class="de-veh"><header><b>🚗 ${E(v.marque)} ${E(v.modele)}</b><span>${v.energie?E(v.energie):"énergie à préciser"}${v.annees?" · "+v.annees[0]+"-"+v.annees[1]:""} · ${(v.v||[]).length} version(s)</span></header>
 ${rows?`<table><thead><tr><th>Version</th><th>ch</th><th>kW</th><th>Batterie</th><th></th></tr></thead><tbody>${rows}</tbody></table>`:`<p class="de-note">Puissances non détaillées — importées à la récolte ou via ton export.</p>`}
 <p class="de-note">🔧 ${dispo.length} fiche(s) corrélée(s)${feu.length?` dont ${feu.length} incendie`:""}.</p>
 ${dispo.slice(0,5).map(e=>{try{return hitCard(e);}catch(_){return `<div class="hit">${E(e.defaut)}</div>`;}}).join("")}
 <button class="de-use" data-veh='${E(JSON.stringify({m:v.marque,mo:v.modele,mt:"",p:"",e:v.energie}))}'>➕ Charger dans l'étude</button></article>`;}
function overrideSearch(){if(typeof window.renderResults!=="function")return;
 window.renderResults=function(){const q=(D("q")?.value||"").trim(),box=D("results");if(!box)return;
  if(!q){let l=[];try{l=(typeof search==="function"?search(""):BASE.filter(e=>THEME==="tous"||(e.themes||[]).includes(THEME))).slice(0,20);}catch(_){l=BASE.slice(0,20);}box.innerHTML=l.map(e=>{try{return hitCard(e);}catch(_){return "";}}).join("");return;}
  const veh=searchVehicles(q);let faults=[];try{faults=typeof search==="function"?search(q):[];}catch(_){}
  box.innerHTML=(veh.length?`<h3 class="de-h3">🚗 Véhicules · motorisations · puissances (${veh.length})</h3>`+veh.map(vehCard).join(""):"")+
   `<h3 class="de-h3">🔧 Pannes &amp; rappels (${faults.length})</h3>`+(faults.length?faults.map(e=>{try{return hitCard(e);}catch(_){return `<div class="hit">${E(e.defaut)}</div>`;}}).join(""):`<p class="de-note">Aucune panne pour cette saisie.</p>`);};
 D("results")?.addEventListener("click",e=>{const b=e.target.closest("[data-veh]");if(!b)return;
  try{const d=JSON.parse(b.dataset.veh);D("cMarque").value=d.m||"";D("cModele").value=d.mo||"";D("cMoteur").value=d.mt||"";D("cPuiss").value=d.p||"";if(d.e)D("cEnergie").value=d.e;
   try{majModeles();if(typeof majPuiss==="function")majPuiss();}catch(_){}
   document.querySelector('[data-nav="etude"]')?.click();T("✅ Véhicule chargé dans l'étude.");}catch(err){T("❌ "+err.message);}});
 window.suggest=function(q){const box=D("qList"),n=N(q);if(!box)return;
  if(n.length<2){box.classList.add("hidden");return;}
  const terms=new Set();CATALOG.marques.forEach(x=>terms.add(x));
  for(const[b,ms]of Object.entries(CATALOG.modeles))ms.forEach(m=>{terms.add(m);terms.add(b+" "+m);});
  CATALOG.motorisations.forEach(x=>terms.add(x));
  VEH_INDEX.forEach(v=>(v.v||[]).forEach(x=>{terms.add(v.marque+" "+v.modele+" "+x[0]);terms.add(x[0]);}));
  const hits=[...terms].filter(x=>N(x).startsWith(n)||N(x).includes(n)).slice(0,10);
  box.innerHTML=hits.map(x=>`<div data-v="${E(x)}">${E(x)}</div>`).join("");box.classList.toggle("hidden",!hits.length);};}

let SELFCHECK=[];
async function probe(url,ms=9000){try{const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);const r=await fetch(url,{cache:"no-store",signal:c.signal});clearTimeout(t);return{ok:r.ok,status:r.status};}catch(e){return{ok:false,error:e.message};}}
async function runSelfCheck(){SELFCHECK=[];const add=(id,label,ok,detail,fix)=>SELFCHECK.push({id,label,ok,detail,fix});
 const swOk=!!(navigator.serviceWorker&&navigator.serviceWorker.controller);
 add("sw","Service Worker actif",swOk,swOk?"contrôle la page":"non contrôleur","Recharge l'app ou 🧹 Forcer");
 let idbOk=false;try{await IDB.set("__t",1);idbOk=(await IDB.get("__t"))===1;}catch(_){}
 add("idb","Stockage IndexedDB",idbOk,idbOk?"lecture/écriture OK":"indisponible","Mode mémoire automatique");
 add("net","Réseau",navigator.onLine,navigator.onLine?"en ligne":"hors ligne","Base embarquée utilisable hors ligne");
 const own=await probe("data/index.json");add("repo-data","Données du dépôt (data/)",own.ok,own.ok?"index.json accessible":"HTTP "+(own.status||own.error),"Lance la MAJ serveur puis recharge");
 const site=await probe(SITES[0].url);add("cors-sites","CORS tes sites Pages",site.ok,site.ok?"lecture cross-origin OK":"bloqué","Récolte sites partielle ; RappelConso compense");
 const rc=await probe("https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records?limit=1");
 add("cors-rc","CORS RappelConso",rc.ok,rc.ok?"API joignable":"bloqué","Source officielle indisponible côté client");
 const nh=await probe("https://api.nhtsa.gov/recalls/recallsByVehicle?make=SKODA&model=ELROQ&modelYear=2025");
 add("cors-nhtsa","CORS NHTSA",nh.ok,nh.ok?"API joignable":"bloqué","Rappels US via workflow serveur");
 const fb=typeof FB_READY!=="undefined"?FB_READY:false;
 add("firebase","Config Firebase",fb,fb?"config présente":"À_REMPLACER","Renseigne FIREBASE_CONFIG + ADMIN_UID (app.js)");
 const uidOk=typeof ADMIN_UID!=="undefined"&&!String(ADMIN_UID).includes("REMPLACER");
 add("rules","UID admin (rules)",uidOk,uidOk?"UID défini":"placeholder","Remplace UID_ADMIN_A_REMPLACER (Firestore → Rules)");
 const gh=await ghFetch(`/repos/${ghTarget().owner}/${ghTarget().repo}`);
 add("gh-repo","Dépôt GitHub joignable",gh.ok,gh.ok?ghTarget().owner+"/"+ghTarget().repo:"HTTP "+gh.status,"Corrige le nom du repo (panneau Intégration)");
 const k=counts();
 add("mass","Base massive chargée",k.fiches>=200&&k.marques>=40,`${k.fiches} fiches · ${k.marques} marques · ${k.modeles} modèles`,"« Relancer la récolte » ou importe ton export");
 paintSelfCheck();return SELFCHECK;}
function paintSelfCheck(){const s=SELFCHECK.filter(x=>x.ok).length,total=SELFCHECK.length;
 const badge=D("de-self");if(badge){badge.textContent=`🩺 ${s}/${total} checks`;badge.className="badge "+(s===total?"live":"");badge.title=SELFCHECK.map(x=>(x.ok?"✅":"❌")+" "+x.label+" — "+x.detail+(x.ok?"":" · Fix : "+x.fix)).join("\n");}
 const box=D("de-selfbox");if(box)box.innerHTML=SELFCHECK.map(x=>`<div class="de-sc ${x.ok?"ok":"ko"}"><span>${x.ok?"✅":"❌"}</span><div><b>${E(x.label)}</b><small>${E(x.detail)}${x.ok?"":" · <i>Fix : "+E(x.fix)+"</i>"}</small></div></div>`).join("");}

function injectUI(){if(D("de-panel"))return;
 const st=document.createElement("style");st.textContent=`
#de-btn{border:1px solid rgba(255,255,255,.25);background:linear-gradient(135deg,#00e5ff,#7c4dff);color:#04102a;font-weight:900;border-radius:12px;padding:8px 12px;cursor:pointer;box-shadow:0 6px 22px rgba(0,229,255,.28)}
#de-panel{position:fixed;inset:0;z-index:200;display:none;place-items:center;background:rgba(3,5,16,.72);backdrop-filter:blur(10px)}
#de-panel.open{display:grid}
#de-card{position:relative;width:min(980px,96vw);max-height:92vh;overflow:auto;background:linear-gradient(160deg,rgba(11,16,44,.98),rgba(20,12,48,.98));border:1px solid rgba(255,255,255,.18);border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.6);padding:18px}
#de-card h2{margin:0 0 4px;font-size:1.15rem;background:linear-gradient(90deg,#00e5ff,#ff6d00);-webkit-background-clip:text;background-clip:text;color:transparent}
.de-sub{color:#93a0d6;font-size:.78rem;margin-bottom:14px}
.de-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:12px}
.de-grid>div{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:10px;text-align:center}
.de-grid b{display:block;font-size:1.3rem;color:#00e5ff}.de-grid small{color:#93a0d6;font-size:.68rem}
.de-section{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px;margin:10px 0}
.de-section h3{margin:0 0 8px;font-size:.9rem;color:#ffd740}
.de-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.de-row input{flex:1;min-width:190px;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(6,10,28,.9);color:#eef2ff}
.de-btn2{border:0;border-radius:10px;padding:10px 13px;font-weight:800;cursor:pointer;background:linear-gradient(90deg,#00e5ff,#7c4dff);color:#04102a}
.de-btn2.ghost{background:rgba(255,255,255,.08);color:#eef2ff;border:1px solid rgba(255,255,255,.2)}
.de-btn2.warn{background:linear-gradient(90deg,#ff6d00,#ff1744);color:#fff}
.de-btn2.ok{background:linear-gradient(90deg,#00e676,#00e5ff);color:#04102a}
#de-drop{border:2px dashed rgba(0,229,255,.5);border-radius:14px;padding:16px;text-align:center;color:#93a0d6;cursor:pointer;background:rgba(0,229,255,.04)}
#de-drop.drag{border-color:#00e676;background:rgba(0,230,118,.1);color:#eef2ff}
#de-log{font-family:ui-monospace,Menlo,monospace;font-size:.72rem;background:rgba(3,6,20,.85);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;max-height:210px;overflow:auto;color:#c8d2ff}
#de-log span{color:#00e676;margin-right:6px}
.de-prog{height:9px;background:rgba(255,255,255,.1);border-radius:8px;overflow:hidden;margin:8px 0}
.de-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#00e5ff,#00e676,#ffd740);transition:width .3s}
.de-h3{margin:14px 0 6px;color:#00e5ff;font-size:.95rem}
.de-veh{background:rgba(9,13,34,.85);border:1px solid rgba(255,255,255,.14);border-left:4px solid #00e5ff;border-radius:14px;padding:12px;margin:10px 0}
.de-veh header{display:flex;flex-direction:column;gap:2px;margin-bottom:8px}.de-veh header span{color:#93a0d6;font-size:.72rem}
.de-veh table{width:100%;border-collapse:collapse;font-size:.76rem}.de-veh td,.de-veh th{padding:6px;border-bottom:1px solid rgba(255,255,255,.1);text-align:left}
.de-use{border:1px solid rgba(0,229,255,.5);background:rgba(0,229,255,.12);color:#00e5ff;border-radius:8px;padding:5px 9px;font-size:.72rem;cursor:pointer;font-weight:700}
.de-note{color:#93a0d6;font-size:.74rem;margin:6px 0}
.de-close{position:absolute;top:14px;right:16px;border:0;background:rgba(255,255,255,.1);color:#fff;border-radius:10px;padding:6px 10px;cursor:pointer}
.de-sc{display:flex;gap:9px;align-items:flex-start;padding:8px 10px;border-radius:10px;margin:5px 0;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)}
.de-sc.ok{border-color:rgba(0,230,118,.3)}.de-sc.ko{border-color:rgba(255,23,68,.35);background:rgba(255,23,68,.06)}
.de-sc b{font-size:.8rem}.de-sc small{display:block;color:#93a0d6;font-size:.7rem}
@media(max-width:600px){#de-card{padding:14px}.de-grid{grid-template-columns:repeat(2,1fr)}}`;
 document.head.appendChild(st);
 const btn=document.createElement("button");btn.id="de-btn";btn.type="button";btn.textContent="🛰️ Intégration";
 (document.querySelector("header")||document.body).appendChild(btn);
 const badge=document.createElement("span");badge.id="de-self";badge.className="badge";badge.textContent="🩺 …";
 (document.querySelector(".status-strip")||document.querySelector("header")||document.body).appendChild(badge);
 const panel=document.createElement("div");panel.id="de-panel";
 panel.innerHTML=`<div id="de-card"><button class="de-close" id="de-close" type="button">✕</button>
 <h2>🛰️ Console d'intégration &amp; autovérification</h2>
 <div class="de-sub">Base massive auto-construite au lancement · imports multi-projets · réparation GitHub 404 · self-check APK</div>
 <div class="de-grid" id="de-stats"></div>
 <div class="de-prog"><i id="de-prog"></i></div><div class="de-sub" id="de-prog-txt">0%</div>
 <div class="de-section"><h3>🩺 Autovérification de l'APK</h3><div id="de-selfbox"></div>
  <div class="de-row" style="margin-top:8px"><button class="de-btn2 ghost" id="de-selfrun" type="button">🔁 Relancer les checks</button><button class="de-btn2 ok" id="de-fix" type="button">🛠️ Tout réparer</button></div></div>
 <div class="de-section"><h3>⚡ Actions</h3><div class="de-row">
  <button class="de-btn2 ok" id="de-harvest" type="button">🔄 Relancer la récolte complète</button>
  <button class="de-btn2 ghost" id="de-reload" type="button">📦 Recharger le dépôt</button>
  <button class="de-btn2 ghost" id="de-export" type="button">📤 Exporter la base fusionnée</button>
  <button class="de-btn2 warn" id="de-clear" type="button">🗑️ Vider le cache local</button></div></div>
 <div class="de-section"><h3>📥 Import universel (JSON · TXT · MD · CSV · PDF)</h3>
  <div id="de-drop">Glisse tes exports ici ou <b>clique pour choisir</b><br><small>Exports de tes 5 projets : catalogue, fiches, pannes, véhicules, versions, puissances…</small></div>
  <input type="file" id="de-file" multiple accept=".json,.txt,.md,.csv,.pdf,application/json,text/plain,application/pdf" style="display:none"></div>
 <div class="de-section"><h3>🐙 GitHub — détection &amp; réparation du 404</h3>
  <div class="de-row"><input id="de-repo" placeholder="owner/repo (auto)"><input id="de-token" type="password" placeholder="Token GitHub" autocomplete="off"></div>
  <div class="de-row" style="margin-top:8px"><button class="de-btn2 ghost" id="de-ghdetect" type="button">🔎 Tester</button><button class="de-btn2" id="de-ghrepair" type="button">🛠️ Réparer le workflow</button><button class="de-btn2 ok" id="de-ghdispatch" type="button">🚀 Déclencher la MAJ</button></div></div>
 <div class="de-section"><h3>📜 Journal</h3><div id="de-log"></div></div></div>`;
 document.body.appendChild(panel);
 btn.onclick=()=>{panel.classList.add("open");paintStats();paintLog();paintSelfCheck();};
 D("de-close").onclick=()=>panel.classList.remove("open");
 panel.addEventListener("click",e=>{if(e.target===panel)panel.classList.remove("open");});
 D("de-repo").value=localStorage.getItem("kevo_repo")||(()=>{const t=ghTarget();return t.owner+"/"+t.repo;})();
 D("de-token").value=localStorage.getItem("ghpat")?"••••••••":"";
 D("de-selfrun").onclick=()=>runSelfCheck();
 D("de-fix").onclick=async()=>{log("🛠️ Réparation automatique…");
  try{if(navigator.serviceWorker?.controller)navigator.serviceWorker.controller.postMessage("PURGE");}catch(_){}
  await bootData(true);await ghRepair();await runSelfCheck();};
 D("de-harvest").onclick=()=>harvestAll(true);
 D("de-reload").onclick=()=>bootData(true);
 D("de-export").onclick=()=>{const p={version:VERSION,exported:new Date().toISOString(),entries:BASE,catalogue:CATALOG,marques:CATALOG.marques,modeles:CATALOG.modeles,motorisations:CATALOG.motorisations,versions:CATALOG.versions,powers:CATALOG.powers};
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,1)],{type:"application/json"}));a.download="catalogue_source.json";a.click();log("📤 Export généré (à committer dans data/).");};
 D("de-clear").onclick=async()=>{await IDB.del("snapshot");await IDB.del("lastHarvest");location.reload();};
 const drop=D("de-drop"),file=D("de-file");
 drop.onclick=()=>file.click();file.onchange=()=>{if(file.files.length)importFiles([...file.files]);file.value="";};
 ["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("drag");}));
 ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("drag");}));
 drop.addEventListener("drop",e=>{if(e.dataTransfer.files.length)importFiles([...e.dataTransfer.files]);});
 D("de-ghdetect").onclick=ghDetect;D("de-ghrepair").onclick=ghRepair;D("de-ghdispatch").onclick=ghDispatch;}

function rebind(id,ev,fn){const el=D(id);if(!el)return;const n=el.cloneNode(true);el.replaceWith(n);n.addEventListener(ev,fn);return n;}
function takeOver(){
 rebind("fileImport","change",async e=>{if(e.target.files.length)await importFiles([...e.target.files]);e.target.value="";});
 rebind("btnReloadBase","click",()=>bootData(true));
 rebind("btnMajServeur","click",()=>{D("de-panel").classList.add("open");ghDispatch();});
 rebind("btnExportOverlay","click",()=>{const p={entries:BASE,catalogue:CATALOG,marques:CATALOG.marques,modeles:CATALOG.modeles,motorisations:CATALOG.motorisations,versions:CATALOG.versions,powers:CATALOG.powers};
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(p,null,1)],{type:"application/json"}));a.download="catalogue_source.json";a.click();});
 rebind("btnAnalyser","click",async()=>{let v={};try{v=getVeh();}catch(_){}
  if(navigator.onLine&&v.marque&&v.modele){const r=await nhtsaVehicle(v);if(r.length){applyData(r,newCat(),"live-nhtsa");await persist();log("✅ NHTSA : "+r.length+" rappel(s)");}}
  try{analyser();}catch(e){T("❌ "+e.message);}});
 rebind("btnCtx","click",async()=>{let v={};try{v=getVeh();}catch(_){}
  if(navigator.onLine&&v.marque&&v.modele){const r=await nhtsaVehicle(v);if(r.length){applyData(r,newCat(),"live-nhtsa");await persist();}}
  try{analyserContexte();}catch(e){T("❌ "+e.message);}});
 document.addEventListener("click",e=>{if(e.target.closest("[data-adm]"))setTimeout(paintStats,60);},true);}

async function loadRemoteRepo(){for(const u of["data/index.json","data/catalogue.json","data/catalogue_source.json"]){
 const t=await fetchText(u+"?ts="+Date.now(),15000);if(!t)continue;let j;try{j=JSON.parse(t);}catch(_){continue;}
 if(u.includes("index.json")&&j.chunks){let all=[];for(const f of j.chunks){const x=await fetchText("data/"+f+"?ts="+Date.now(),25000);if(x){try{all=all.concat(JSON.parse(x));}catch(_){}}}
  applyData(all,catFrom(j.catalogue||{}),j.version||"repo");log(`📦 Base dépôt : ${all.length} fiches (${j.version})`);}
 else{const r=normalizeAny(j,u);applyData(r.entries,r.cat,"catalogue");log(`📚 ${u} : ${r.cat.marques.size} marques`);}}}

async function bootData(force=false){setProgress(3);
 applyData([],catFrom(EMB),"embarqué-"+new Date().toISOString().slice(0,10));
 const snap=await IDB.get("snapshot");
 if(snap?.entries?.length){applyData(snap.entries,catFrom(snap.catalogue||{}),snap.version||"cache");log(`💾 Cache restauré : ${snap.entries.length} fiches`);}
 await loadRemoteRepo();
 buildVehicleIndex();overrideSearch();paintStats();setProgress(30);
 if(navigator.onLine){ if(counts().fiches<100){ log("⚠️ Base trop petite → récolte forcée"); harvestAll(true); } else harvestAll(force); }
 setProgress(100);runSelfCheck();}

function boot(){
 const start=()=>{
  injectUI();takeOver();
  setInterval(reassert,1200);
  if(typeof window.loadBase==="function"){const orig=window.loadBase;window.loadBase=async function(f){const r=await orig(f);reassert();return r;};}
  bootData(false);
  addEventListener("online",()=>harvestAll(false));
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)harvestAll(false);});
  setInterval(()=>harvestAll(false),6*3600*1000);
  log("🛰️ Data Engine v5 prêt (catalogue embarqué + ré-assertion + autovérification)");
 };
 if(!document.querySelector("header")){let n=0;const w=setInterval(()=>{n++;if(document.querySelector("header")||n>50){clearInterval(w);start();}},100);}else start();
}
window.KEV={booted:true,selfcheck:runSelfCheck,harvest:()=>harvestAll(true),counts,cat:()=>CATALOG,base:()=>BASE,gh:{detect:ghDetect,repair:ghRepair,dispatch:ghDispatch},import:importFiles,reassert};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
