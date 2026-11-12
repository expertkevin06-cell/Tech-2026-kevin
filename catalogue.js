/* ===== KEV TECH & FIRE — CATALOGUE VÉHICULES + RECHERCHE UNIFIÉE ===== */
/* Catalogue embarqué (hors ligne). Étend app.js : marques / modèles / motorisations / puissances.
   Les puissances des versions sont INDICATIVES (kW×1,36) : à confirmer par millésime/VIN.
   Le catalogue complet (4080 puissances) est importé via data/catalogue.json + data/catalogue_source.json */
"use strict";

const CAT_KEVIN = {
marques:["Abarth","Aiways","Alfa Romeo","Alpine","Aston Martin","Audi","Bentley","BMW","BYD","Cadillac","Chery","Chevrolet","Chrysler","Citroën","Cupra","Dacia","Daihatsu","Dodge","DS","Ferrari","Fiat","Fisker","Ford","Geely","Genesis","GMC","Honda","Hongqi","Hyundai","Infiniti","Isuzu","Jaecoo","Jaguar","Jeep","Kia","KTM","Lada","Lamborghini","Lancia","Land Rover","Leapmotor","Lexus","Lincoln","Lotus","Lucid","Lynk & Co","Mahindra","Maserati","Mazda","McLaren","Mercedes-Benz","MG","Mini","Mitsubishi","Nio","Nissan","Omoda","Opel","Ora","Peugeot","Polestar","Porsche","RAM","Renault","Rivian","Rolls-Royce","Saab","SEAT","Seres","Skoda","Smart","SsangYong","Subaru","Suzuki","Tata","Tesla","Toyota","VinFast","Volkswagen","Volvo","Xpeng","Zeekr"],
modeles:{
"Skoda":["Citigo","Elroq","Enyaq","Enyaq Coupé","Fabia","Kamiq","Karoq","Kodiaq","Octavia","Octavia Combi","Rapid","Roomster","Scala","Superb","Superb Combi","Yeti"],
"Volkswagen":["Amarok","Arteon","Beetle","Caddy","Crafter","Eos","Golf","Golf SW","ID.3","ID.4","ID.5","ID.7","ID.7 GTX","ID.Buzz","Passat","Phaeton","Polo","Polo GTI","Scirocco","Sharan","T-Cross","T-Roc","Tiguan","Touareg","Touran","Transporter","Up","e-Golf"],
"Peugeot":["1007","107","108","2008","206","207","208","3008","301","307","308","308 SW","408","5008","508","508 SW","607","807","Bipper","Boxer","Expert","Partner","Rifter","RCZ","Traveller","e-2008","e-208","e-3008","e-5008","e-Expert","e-Partner","e-Rifter"],
"Citroën":["Berlingo","C-Crosser","C-Elysee","C1","C2","C3","C3 Aircross","C3 Picasso","C4","C4 Cactus","C4 Picasso","C4 SpaceTourer","C5","C5 Aircross","C5 X","DS3","DS4","DS5","Jumper","Jumpy","Nemo","Saxo","SpaceTourer","Xsara","e-Berlingo","e-C4","e-C4 X","e-Jumpy","e-SpaceTourer","ë-C3"],
"Renault":["Arkana","Austral","Captur","Clio","Espace","Fluence","Grand Scenic","Kadjar","Kangoo","Koleos","Laguna","Latitude","Master","Megane","Megane E-Tech","Modus","Rafale","R5","Scenic","Symbioz","Talisman","Trafic","Twingo","Twingo Electric","Twizy","Wind","Zoe"],
"Dacia":["Bigster","Dokker","Duster","Duster Hybride","Jogger","Lodgy","Logan","Sandero","Sandero Stepway","Spring"],
"DS":["DS3","DS3 Crossback","DS4","DS5","DS7 Crossback","DS7 E-Tense 4x4","DS9","e-Tense"],
"BMW":["i3","i4","i5","i7","iX","iX2","iX3","Serie 1","Serie 2","Serie 3","Serie 3 Touring","Serie 4","Serie 5","Serie 5 Touring","Serie 6","Serie 7","Serie 8","X1","X2","X3","X4","X5","X6","X7","Z4","M2","M3","M4","M5","iX1"],
"Mercedes-Benz":["Classe A","Classe B","Classe C","Classe E","Classe G","Classe S","Classe V","CLA","CLS","EQA","EQB","EQC","EQE","EQS","GLA","GLB","GLC","GLE","GLS","SL","AMG GT","Sprinter","Vito","eVito","eSprinter","EQV"],
"Audi":["A1","A3","A4","A4 Allroad","A5","A6","A7","A8","e-tron","e-tron GT","Q2","Q3","Q4 e-tron","Q5","Q6 e-tron","Q7","Q8","R8","TT","SQ6","SQ8"],
"SEAT":["Alhambra","Arona","Ateca","Exeo","Ibiza","Leon","Leon ST","Mii","Tarraco","Toledo"],
"Cupra":["Ateca","Born","Formentor","Formentor VZ","Leon","Terramar","Tavascan","Tavascan VZ"],
"Tesla":["Model 3","Model S","Model X","Model Y","Model Y Performance","Cybertruck"],
"Hyundai":["Bayon","i10","i20","i30","Ioniq","Ioniq 5","Ioniq 5 N","Ioniq 6","Ioniq 9","ix20","ix35","Kona","Nexo","Santa Fe","Sonata","Staria","Tucson","Tucson Hybrid","Veloster","Inster"],
"Kia":["Carens","Ceed","Ceed SW","EV3","EV6","EV9","EV9 GT","Niro","Optima","Picanto","ProCeed","Rio","Sorento","Soul","Sportage","Sportage Hybrid","Stinger","Stonic","Venga","XCeed"],
"Toyota":["Auris","Avensis","Aygo","Aygo X","bZ4X","C-HR","Camry","Corolla","Corolla Cross","Corolla Touring Sports","GR86","Highlander","Hilux","Land Cruiser","Mirai","Prius","Proace","Proace City","RAV4","RAV4 PHEV","Supra","Swace","Verso","Yaris","Yaris Cross"],
"Nissan":["Ariya","Juke","Leaf","Micra","Navara","Note","NV200","Pulsar","Qashqai","Qashqai e-Power","Townstar","X-Trail"],
"Ford":["B-Max","C-Max","EcoSport","Explorer","Explorer Electric","Fiesta","Fiesta ST","Focus","Focus SW","Galaxy","Ka","Kuga","Mondeo","Mustang","Mustang Mach-E","Puma","Ranger","S-Max","Tourneo","Transit","Transit Custom","E-Transit"],
"Opel":["Adam","Ampera","Astra","Astra Sports Tourer","Cascada","Combo","Corsa","Corsa-e","Crossland","Grandland","Grandland Electric","Insignia","Karl","Meriva","Mokka","Movano","Vivaro","Zafira"],
"Fiat":["124 Spider","500","500e","500L","500X","600","600e","Bravo","Croma","Doblo","Ducato","Freemont","Grande Panda","Panda","Punto","Qubo","Sedici","Stilo","Tipo","Ulysse"],
"Volvo":["C30","EC40","EX30","EX40","EX90","S60","S90","V40","V60","V60 Cross Country","V90","XC40","XC60","XC60 Recharge","XC90"],
"MG":["MG4","MG4 XPower","MG5","HS","E-HS9","Marvel R","ZS","ZS EV","Cyberster"],
"BYD":["Atto 3","Dolphin","Han","Seal","Seal AWD","Seal U","Seal U DM-i","Seagull","Tang","Yangwang"],
"Mini":["Clubman","Cooper","Cooper SE","Countryman","Aceman","Paceman","John Cooper Works"],
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
"Xpeng":["G6","G9","P7","P7+"],
"Leapmotor":["C10","T03"],
"VinFast":["VF6","VF7","VF8","VF9"],
"Subaru":["Crosstrek","Forester","Impreza","Levorg","Outback","Solterra","WRX","XV"],
"Mitsubishi":["ASX","Eclipse Cross","Outlander","Outlander PHEV","Space Star"],
"Chevrolet":["Aveo","Bolt","Camaro","Corvette","Cruze","Equinox","Spark"],
"Chery":["Tiggo 4","Tiggo 7","Tiggo 8","Omoda 5"],
"Genesis":["G70","G80","G90","GV60","GV70","GV80"],
"SsangYong":["Korando","Rexton","Tivoli","Torres"],
"Dodge":["Challenger","Charger","Durango","RAM 1500"],
"Lancia":["Delta","Ypsilon","Ypsilon Elettrica"],
"Abarth":["500","595","695","500e","600e"],
"Lotus":["Eletre","Emira","Evija"],
"Maserati":["Ghibli","Grecale","GranTurismo","Levante","MC20","Quattroporte"],
"Rolls-Royce":["Cullinan","Ghost","Phantom","Spectre"],
"Bentley":["Bentayga","Continental GT","Flying Spur"],
"Ferrari":["296","488","F8","Roma","SF90","Purosangue","Revuelto"],
"Lamborghini":["Huracan","Revuelto","Urus"],
"McLaren":["570","720","750","Artura"],
"Aston Martin":["DB11","DB12","DBX","Vantage"],
"Isuzu":["D-Max"],
"Tata":["Nexon","XUV300","XUV700"],
"Mahindra":["XUV700","XEV 9e"],
"Ora":["Funky Cat","03","07"],
"Seres":["3","5"],
"Jaecoo":["5","7"],
"Omoda":["5","9"],
"Zeekr":["001","009","X"],
"Hongqi":["E-HS9","H9"],
"Lucid":["Air","Gravity"],
"Rivian":["R1S","R1T","R2"],
"GMC":["Hummer EV","Sierra","Canyon"],
"Cadillac":["CT4","CT5","Escalade","Lyriq"],
"Lincoln":["Aviator","Corsair","Nautilus","Navigator"],
"Chrysler":["Pacifica","300C"],
"RAM":["1500","ProMaster"],
"Infiniti":["Q30","Q50","Q60","Q70","QX50","QX70"],
"Daihatsu":["Sirion","Terios"],
"Lada":["Niva","Vesta"],
"Saab":["9-3","9-5"],
"KTM":["X-Bow"],
"Fisker":["Ocean"],
"Aiways":["U5","U6"],
"Geely":["Coolray","EX5","Starray"],
"Leapmotor ":["C10","T03"]
},
motorisations:["0.9 TCe","1.0 DIG-T","1.0 EcoBoost","1.0 EcoBoost Hybrid","1.0 MPI","1.0 SCe","1.0 T-GDi","1.0 TCe","1.0 TSI","1.0 VTi","1.0 VVT-i","1.1 CRDi","1.2 DIG-T","1.2 Dualjet","1.2 Hybrid","1.2 PureTech","1.2 TCe","1.2 TSI","1.2 VTi","1.3 DIG-T","1.3 MultiJet","1.3 TCE","1.3 TCe","1.4 CRDi","1.4 D-4D","1.4 HDi","1.4 MPI","1.4 MultiAir","1.4 T-Jet","1.4 TSI","1.4 VTi","1.5 Blue dCi","1.5 BlueHDi","1.5 dCi","1.5 D-4D","1.5 EcoBlue","1.5 EcoBoost","1.5 eTSI","1.5 Hybrid","1.5 Skyactiv-D","1.5 Skyactiv-G","1.5 T-GDi","1.5 TSI","1.5 VTEC Turbo","1.6 BlueHDi","1.6 CDTI","1.6 CRDi","1.6 D-4D","1.6 dCi","1.6 e-HDi","1.6 E-Tech Hybrid","1.6 GDi","1.6 HDi","1.6 i-DTEC","1.6 JTDm","1.6 MultiJet","1.6 PureTech","1.6 T-GDi","1.6 T-GDi Hybrid","1.6 TCe","1.6 TDCi","1.6 TDI","1.6 THP","1.6 VTi","1.7 CRDi","1.7 dCi","1.8 Hybrid","1.8 Skyactiv-G","1.8 TFSI","1.8 TSI","2.0 Blue dCi","2.0 BlueHDi","2.0 CDTI","2.0 CRDi","2.0 D-4D","2.0 dCi","2.0 EcoBlue","2.0 EcoBoost","2.0 HDi","2.0 Hybrid","2.0 JTDm","2.0 MultiJet","2.0 Skyactiv-G","2.0 Skyactiv-X","2.0 T-GDi","2.0 TDCi","2.0 TDI","2.0 TFSI","2.0 TSI","2.2 BlueHDi","2.2 CRDi","2.2 D-4D","2.2 dCi","2.2 Skyactiv-D","2.2 TDCi","2.3 EcoBoost","2.4 D-4D","2.5 Hybrid","2.5 Skyactiv-G","2.7 TDI","3.0 CRD","3.0 D-4D","3.0 dCi","3.0 EcoBoost","3.0 TDI","3.0 TFSI","3.0 V6","3.5 V6","4.0 TDI","4.0 TFSI","4.4 V8","5.0 V8","6.0 W12","e-Power","E-Tech Hybrid","E-Tech Electric","e-THP","e-Hybrid","DM-i PHEV","T8 Recharge","B4","B5","B6","D3","D4","T4","T5","T6","TDI","dCi","BlueHDi","PureTech","EcoBoost","Skyactiv","THP","TSI","TFSI","GDi","CRDi","JTD","HDi","CDTI","Mild Hybrid 48V","Hybride rechargeable","Électrique 40 kWh","Électrique 50 kWh","Électrique 52 kWh","Électrique 55 kWh","Électrique 58 kWh","Électrique 59 kWh","Électrique 60 kWh","Électrique 62 kWh","Électrique 64 kWh","Électrique 70 kWh","Électrique 77 kWh","Électrique 79 kWh","Électrique 82 kWh","Électrique 84 kWh","Électrique 90 kWh","Électrique 100 kWh","Électrique 111 kWh"],
/* versions = motorisation + puissance réelle par modèle (indicatif, à confirmer millésime/VIN) */
versions:[
{marque:"Skoda",modele:"Elroq",energie:"electrique",annees:[2024,2027],v:[["Elroq 50",125,170,"52 kWh utiles"],["Elroq 60",150,204,"59 kWh utiles"],["Elroq 85",210,286,"77 kWh utiles"],["Elroq 85x (AWD)",210,286,"77 kWh utiles"],["Elroq RS",250,340,"79 kWh utiles"]]},
{marque:"Skoda",modele:"Enyaq",energie:"electrique",annees:[2020,2027],v:[["iV 50",109,148,"52 kWh utiles"],["iV 60",132,180,"58 kWh utiles"],["iV 80",150,204,"77 kWh utiles"],["80x (AWD)",195,265,"77 kWh utiles"],["85",210,286,"77 kWh utiles"],["85x (AWD)",210,286,"77 kWh utiles"],["RS",250,340,"79 kWh utiles"]]},
{marque:"Volkswagen",modele:"ID.3",energie:"electrique",annees:[2019,2027],v:[["Pure",125,170,"52 kWh utiles"],["Pro",150,204,"58 kWh utiles"],["Pro S",150,204,"77 kWh utiles"],["GTX",240,326,"79 kWh utiles"]]},
{marque:"Volkswagen",modele:"ID.4",energie:"electrique",annees:[2020,2027],v:[["Pure",125,170,"52 kWh utiles"],["Pro",150,204,"77 kWh utiles"],["Pro 4MOTION",195,265,"77 kWh utiles"],["GTX",250,340,"79 kWh utiles"]]},
{marque:"Volkswagen",modele:"ID.5",energie:"electrique",annees:[2021,2027],v:[["Pro",150,204,"77 kWh utiles"],["Pro 4MOTION",195,265,"77 kWh utiles"],["GTX",250,340,"79 kWh utiles"]]},
{marque:"Volkswagen",modele:"ID.7",energie:"electrique",annees:[2023,2027],v:[["Pro",210,286,"77 kWh utiles"],["Pro S",210,286,"86 kWh utiles"],["GTX",250,340,"86 kWh utiles"]]},
{marque:"Volkswagen",modele:"ID.Buzz",energie:"electrique",annees:[2022,2027],v:[["Pro",150,204,"77 kWh utiles"],["GTX",250,340,"86 kWh utiles"]]},
{marque:"Cupra",modele:"Born",energie:"electrique",annees:[2021,2027],v:[["150 kW",150,204,"58 kWh utiles"],["170 kW e-Boost",170,231,"77 kWh utiles"],["VZ",240,326,"79 kWh utiles"]]},
{marque:"Cupra",modele:"Tavascan",energie:"electrique",annees:[2024,2027],v:[["V1",210,286,"77 kWh utiles"],["V2 (AWD)",250,340,"77 kWh utiles"],["VZ",250,340,"79 kWh utiles"]]},
{marque:"Audi",modele:"Q4 e-tron",energie:"electrique",annees:[2021,2027],v:[["35",125,170,"52 kWh utiles"],["40",150,204,"77 kWh utiles"],["50 quattro",220,299,"77 kWh utiles"]]},
{marque:"Audi",modele:"Q6 e-tron",energie:"electrique",annees:[2024,2027],v:[["",215,292,"83 kWh utiles"],["quattro",285,387,"94 kWh utiles"],["SQ6",360,489,"94 kWh utiles"]]},
{marque:"Renault",modele:"Megane E-Tech",energie:"electrique",annees:[2022,2027],v:[["EV40",96,130,"40 kWh utiles"],["EV60",160,220,"60 kWh utiles"]]},
{marque:"Renault",modele:"R5",energie:"electrique",annees:[2024,2027],v:[["EV40",90,120,"40 kWh utiles"],["EV52",110,150,"52 kWh utiles"]]},
{marque:"Renault",modele:"Scenic",energie:"electrique",annees:[2024,2027],v:[["EV60",125,170,"60 kWh utiles"],["EV87",160,220,"87 kWh utiles"]]},
{marque:"Renault",modele:"Zoe",energie:"electrique",annees:[2012,2024],v:[["R90",65,88,"41 kWh"],["R110",80,108,"41 kWh"],["R135",100,136,"52 kWh"]]},
{marque:"Peugeot",modele:"e-208",energie:"electrique",annees:[2019,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"51 kWh utiles"]]},
{marque:"Peugeot",modele:"e-2008",energie:"electrique",annees":[2019,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"51 kWh utiles"]]},
{marque:"Peugeot",modele:"e-3008",energie:"electrique",annees":[2024,2027],v:[["210 ch",157,210,"73 kWh utiles"],["230 ch Long Range",170,230,"96 kWh utiles"],["Dual Motor",240,325,"73 kWh utiles"]]},
{marque:"Peugeot",modele:"e-308",energie:"electrique",annees":[2023,2027],v:[["115 kW",115,156,"54 kWh"]]},
{marque:"Citroën",modele:"ë-C3",energie:"electrique",annees:[2024,2027],v:[["83 kW",83,113,"44 kWh"]]},
{marque:"Citroën",modele:"e-C4",energie:"electrique",annees":[2020,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"54 kWh"]]},
{marque:"Opel",modele:"Corsa-e",energie:"electrique",annees:[2019,2027],v:[["100 kW",100,136,"50 kWh"],["115 kW",115,156,"51 kWh utiles"]]},
{marque:"Opel",modele:"Mokka",energie:"electrique",annees:[2020,2027],v:[["Electric 100 kW",100,136,"50 kWh"],["Electric 115 kW",115,156,"54 kWh"]]},
{marque:"Fiat",modele:"500e",energie:"electrique",annees":[2020,2027],v:[["24 kWh",70,95,"24 kWh"],["42 kWh",87,118,"42 kWh"]]},
{marque:"Dacia",modele:"Spring",energie:"electrique",annees":[2021,2027],v:[["Electric 45",33,45,"26,8 kWh"],["Electric 65",48,65,"26,8 kWh"]]},
{marque:"Tesla",modele:"Model 3",energie:"electrique",annees:[2017,2027],v:[["Propulsion",208,283,"~60 kWh"],["Long Range AWD",366,498,"~75 kWh"],["Performance",340,460,"~75 kWh"]]},
{marque:"Tesla",modele:"Model Y",energie:"electrique",annees:[2020,2027],v:[["Propulsion",220,299,"~60 kWh"],["Long Range AWD",378,514,"~75 kWh"],["Performance",393,534,"~75 kWh"]]},
{marque:"Hyundai",modele:"Ioniq 5",energie:"electrique",annees:[2021,2027],v:[["58 kWh RWD",125,170,"58 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"],["N",478,650,"84 kWh"]]},
{marque:"Hyundai",modele:"Ioniq 6",energie:"electrique",annees:[2022,2027],v:[["53 kWh RWD",111,151,"53 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"]]},
{marque:"Hyundai",modele:"Kona",energie:"electrique",annees:[2018,2027],v:[["Electric 39 kWh",100,136,"39 kWh"],["Electric 64 kWh",150,204,"64 kWh"],["Electric 65 kWh",160,218,"65 kWh"]]},
{marque:"Kia",modele:"EV6",energie:"electrique",annees:[2021,2027],v:[["58 kWh RWD",125,170,"58 kWh"],["77 kWh RWD",168,229,"77 kWh"],["77 kWh AWD",239,325,"77 kWh"],["GT",448,609,"77 kWh"]]},
{marque:"Kia",modele:"EV9",energie:"electrique",annees:[2023,2027],v:[["RWD",150,204,"99,8 kWh"],["AWD",283,385,"99,8 kWh"],["GT",374,508,"99,8 kWh"]]},
{marque:"Kia",modele:"EV3",energie:"electrique",annees:[2024,2027],v:[["Standard",125,170,"58 kWh"],["Long Range",150,204,"81 kWh"]]},
{marque:"Kia",modele:"Niro",energie:"electrique",annees:[2018,2027],v:[["e-Niro 39 kWh",100,136,"39 kWh"],["e-Niro 64 kWh",150,204,"64 kWh"],["EV 65 kWh",150,204,"65 kWh"]]},
{marque:"MG",modele:"MG4",energie:"electrique",annees":[2022,2027],v:[["Standard",125,170,"51 kWh"],["Comfort/Luxury",150,204,"64 kWh"],["Trophy ER",180,245,"77 kWh"],["XPower",320,435,"64 kWh"]]},
{marque:"MG",modele:"ZS",energie:"electrique",annees":[2019,2027],v:[["EV Standard",105,143,"51 kWh"],["EV Long Range",115,156,"72 kWh"]]},
{marque:"BYD",modele:"Atto 3",energie:"electrique",annees:[2022,2027],v:[["",150,204,"60,5 kWh"]]},
{marque:"BYD",modele:"Dolphin",energie:"electrique",annees:[2023,2027],v:[["Active/Boost",70,95,"44,9 kWh"],["Comfort/Design",150,204,"60,4 kWh"]]},
{marque:"BYD",modele:"Seal",energie:"electrique",annees:[2023,2027],v:[["RWD",230,313,"82,5 kWh"],["AWD",390,530,"82,5 kWh"]]},
{marque:"Volvo",modele:"EX30",energie:"electrique",annees:[2023,2027],v:[["Single Motor",200,272,"51 kWh"],["Single Motor ER",200,272,"69 kWh"],["Twin Motor Performance",315,428,"69 kWh"]]},
{marque:"Volvo",modele:"EX40",energie:"electrique",annees:[2023,2027],v:[["Single Motor",175,238,"69 kWh"],["Twin Motor",300,408,"82 kWh"]]},
{marque:"Volvo",modele:"XC40",energie:"electrique",annees:[2020,2027],v:[["Recharge Single",175,238,"69 kWh"],["Recharge Twin",300,408,"78 kWh"]]},
{marque:"BMW",modele:"i4",energie:"electrique",annees:[2021,2027],v:[["eDrive35",210,286,"66 kWh"],["eDrive40",250,340,"81 kWh"],["M50",400,544,"81 kWh"]]},
{marque:"BMW",modele:"iX1",energie:"electrique",annees:[2022,2027],v:[["eDrive20",150,204,"64,7 kWh"],["xDrive30",230,313,"64,7 kWh"]]},
{marque:"BMW",modele:"i5",energie:"electrique",annees:[2023,2027],v:[["eDrive40",250,340,"81 kWh"],["M60 xDrive",442,601,"81 kWh"]]},
{marque:"Mercedes-Benz",modele:"EQA",energie:"electrique",annees:[2021,2027],v:[["250",140,190,"66,5 kWh"],["250+",140,190,"70,5 kWh"],["300 4MATIC",168,228,"66,5 kWh"],["350 4MATIC",215,292,"66,5 kWh"]]},
{marque:"Mercedes-Benz",modele:"EQB",energie:"electrique",annees:[2021,2027],v:[["250+",140,190,"70,5 kWh"],["300 4MATIC",168,228,"66,5 kWh"],["350 4MATIC",215,292,"66,5 kWh"]]},
{marque:"Nissan",modele:"Leaf",energie:"electrique",annees:[2010,2027],v:[["24 kWh",80,109,"24 kWh"],["30 kWh",80,109,"30 kWh"],["40 kWh",110,150,"40 kWh"],["e+ 62 kWh",160,217,"62 kWh"]]},
{marque:"Nissan",modele:"Ariya",energie:"electrique",annees:[2022,2027],v:[["63 kWh",160,218,"63 kWh"],["87 kWh",178,242,"87 kWh"],["e-4ORCE 87 kWh",225,306,"87 kWh"]]},
{marque:"Toyota",modele:"bZ4X",energie:"electrique",annees":[2022,2027],v:[["FWD",150,204,"71,4 kWh"],["AWD",160,218,"71,4 kWh"]]},
{marque:"Porsche",modele:"Taycan",energie:"electrique",annees":[2019,2027],v:[["",300,408,"79 kWh"],["4S",390,530,"93 kWh"],["Turbo",650,884,"93 kWh"]]},
{marque:"Polestar",modele:"2",energie:"electrique",annees:[2020,2027],v:[["Standard Range",200,272,"69 kWh"],["Long Range",220,299,"82 kWh"],["Long Range Dual",350,476,"82 kWh"]]}
]
};

/* ---------- fusion catalogue (embarqué + data/catalogue.json + index.json + base) ---------- */
function _nrm(s){return (s||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();}
let CAT_EXTRA={marques:[],modeles:{},motorisations:[],versions:[]};
let VEH_INDEX=[];

function mergeCatalogue(){
  const marques=new Set(CAT_KEVIN.marques), modeles={}, mots=new Set(CAT_KEVIN.motorisations), vers=[];
  const addM=(k,v)=>{k=(k||"").trim();v=(v||"").trim();if(!k||!v)return;(modeles[k]=modeles[k]||new Set()).add(v);};
  for(const k in CAT_KEVIN.modeles)CAT_KEVIN.modeles[k].forEach(m=>addM(k,m));
  CAT_KEVIN.versions.forEach(v=>vers.push(v));
  const sources=[CAT_EXTRA,(typeof CATALOG!=="undefined"&&CATALOG)||{}];
  sources.forEach(src=>{
    (src.marques||[]).forEach(m=>marques.add(m));
    for(const k in (src.modeles||{}))(src.modeles[k]||[]).forEach(m=>addM(k,m));
    (src.motorisations||[]).forEach(m=>mots.add(m));
    (src.versions||[]).forEach(v=>{if(v&&v.marque&&v.modele)vers.push(v);});
  });
  (typeof BASE!=="undefined"?BASE:[]).forEach(e=>{
    (e.marque||"").split(/[\/,]/).forEach(m=>{m=m.trim();if(m&&!/multi/i.test(m))marques.add(m);});
    const k=(e.marque||"").split("/")[0].trim();
    (e.modele||"").split(/[\/,]/).forEach(m=>{m=m.trim();if(m&&k&&!/tous|multi/i.test(m))addM(k,m);});
    if(e.motorisation)mots.add(e.motorisation);
  });
  const mo={};Object.keys(modeles).sort().forEach(k=>mo[k]=[...modeles[k]].sort());
  CATALOG={marques:[...marques].sort(),modeles:mo,motorisations:[...mots].sort()};
  VEH_INDEX=[];
  const seen=new Set();
  vers.forEach(v=>{const k=_nrm(v.marque)+"|"+_nrm(v.modele);if(seen.has(k))return;seen.add(k);
    VEH_INDEX.push({...v,_h:_nrm([v.marque,v.modele,v.energie,(v.v||[]).map(x=>x[0]).join(" ")].join(" "))});});
  for(const k in mo)mo.forEach;
  for(const k in mo){if(seen.has(_nrm(k)))continue;
    mo[k].forEach(m=>{const key=_nrm(k)+"|"+_nrm(m);if(seen.has(key))return;seen.add(key);
      VEH_INDEX.push({marque:k,modele:m,energie:"",annees:null,v:[],_h:_nrm(k+" "+m)});});}
  buildVehIndex();
}
function buildVehIndex(){
  const badge=document.getElementById("baseBadge");
  if(badge)badge.textContent="🗄️ "+BASE.length+" fiches • "+CATALOG.marques.length+" marques • "+Object.values(CATALOG.modeles).flat().length+" modèles • "+VEH_INDEX.filter(v=>v.v&&v.v.length).length+" versions • "+VERSION;
}

/* ---------- chargement catalogue distant (produit par le workflow) ---------- */
async function loadCatalogueDistant(){
  for(const u of ["data/catalogue.json","data/catalogue_source.json"]){
    try{
      const r=await fetch(u+"?ts="+Date.now(),{cache:"no-store"});
      if(!r.ok)continue;
      const j=await r.json();
      const norm=(x)=>({marques:x.marques||[],modeles:x.modeles||{},motorisations:x.motorisations||[],versions:x.versions||x.vehicules||[]});
      const a=norm(Array.isArray(j)?{versions:j}:j);
      CAT_EXTRA={marques:CAT_EXTRA.marques.concat(a.marques),
        modeles:Object.assign({},CAT_EXTRA.modeles,a.modeles),
        motorisations:CAT_EXTRA.motorisations.concat(a.motorisations),
        versions:CAT_EXTRA.versions.concat(a.versions)};
    }catch(e){}
  }
  mergeCatalogue();fillFilters();fillDatalists();renderResults();
}

/* ---------- recherche VÉHICULES (marque / modèle / motorisation / puissance) ---------- */
function searchVehicles(q,limit=12){
  const toks=_nrm(q).split(" ").filter(Boolean);if(!toks.length)return[];
  const out=[];
  for(const v of VEH_INDEX){
    let s=0;
    for(const t of toks){
      if(_nrm(v.marque).split(" ").some(w=>w===t||w.startsWith(t)))s+=4;
      else if(_nrm(v.modele).split(" ").some(w=>w===t||w.startsWith(t)))s+=4;
      else if(v._h.includes(t))s+=2;
      else if((v.v||[]).some(x=>_nrm(x[0]).includes(t)||String(x[2])===t||String(x[1])===t))s+=3;
    }
    if(s>0)out.push([s,v]);
  }
  return out.sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>x[1]);
}
function vehCard(v){
  const rows=(v.v||[]).map(x=>`<tr><td>${esc(x[0]||"—")}</td><td><b>${x[2]} ch</b></td><td>${x[1]} kW</td><td>${esc(x[3]||"")}</td>
    <td><button class="btn ghost" data-veh='${esc(JSON.stringify({m:v.marque,mo:v.modele,mt:x[0],p:x[2],e:v.energie}))}'>➕ Utiliser</button></td></tr>`).join("");
  const dispo=BASE.filter(e=>matchVehicle(e,{marque:v.marque,modele:v.modele,moteur:"",puiss:0,annee:0,energie:v.energie||""})>=4);
  const feu=dispo.filter(e=>e.risque_feu);
  return `<div class="hit"><b>🚗 ${esc(v.marque)} ${esc(v.modele)}</b>
   <div class="meta">${v.energie?("énergie : "+esc(v.energie)):"énergie : à préciser"}${v.annees?(" • "+v.annees[0]+"-"+v.annees[1]):""} • ${(v.v||[]).length} version(s) référencée(s)</div>
   ${rows?`<table><tr><th>Motorisation / version</th><th>Puissance</th><th>kW</th><th>Batterie / note</th><th></th></tr>${rows}</table>`
        :'<p class="small">Versions/puissances non encore détaillées — importées par la moisson du catalogue (ou ton export).</p>'}
   <p class="small">🔧 <b>${dispo.length}</b> fiche(s) technique(s) corrélée(s)${feu.length?` dont <b>${feu.length}</b> à risque d'incendie`:""}.</p>
   ${dispo.length?dispo.slice(0,6).map(hitCard).join("")
     :`<p class="small">Aucune panne spécifique documentée pour ce modèle à ce jour. Doctrine applicable à son énergie :</p>`+
      BASE.filter(e=>e.risque_feu&&/multi/i.test(e.marque||"")&&energyOK(e,{energie:v.energie||""})).slice(0,4).map(hitCard).join("")}
   <button class="btn ghost" data-veh='${esc(JSON.stringify({m:v.marque,mo:v.modele,mt:"",p:"",e:v.energie}))}'>➕ Utiliser ce véhicule</button></div>`;
}

/* ---------- surcharge des fonctions d'app.js ---------- */
const _renderResultsBase=renderResults;
renderResults=function(){
  const q=document.getElementById("q").value.trim();
  const box=document.getElementById("results");
  if(!q){_renderResultsBase();return;}
  const veh=searchVehicles(q), faults=search(q);
  let h="";
  if(veh.length)h+=`<h3>🚗 Véhicules &amp; motorisations (${veh.length})</h3>`+veh.map(vehCard).join("");
  h+=`<h3>🔧 Pannes &amp; rappels (${faults.length})</h3>`+(faults.length?faults.map(hitCard).join(""):'<p class="small">Aucune fiche pour cette saisie.</p>');
  box.innerHTML=h;
};
document.getElementById("results").addEventListener("click",e=>{
  const b=e.target.closest("button[data-veh]");if(!b)return;
  try{const d=JSON.parse(b.dataset.veh);
    document.getElementById("cMarque").value=d.m||"";
    majModeles();
    document.getElementById("cModele").value=d.mo||"";
    document.getElementById("cMoteur").value=d.mt||"";
    document.getElementById("cPuiss").value=d.p||"";
    if(d.e)document.getElementById("cEnergie").value=d.e;
    toast("✅ Véhicule chargé dans l'étude de cas : "+d.m+" "+d.mo+" "+(d.mt||""));
    document.querySelector('[data-nav="etude"]').click();
  }catch(err){toast("❌ "+err.message);}
});

const _fillFiltersBase=fillFilters;
fillFilters=function(){
  _fillFiltersBase();
  const add=v=>{if(v)SUGTERMS.push({v,n:_nrm(v)});};
  CATALOG.marques.forEach(add);
  for(const k in CATALOG.modeles){add(k);CATALOG.modeles[k].forEach(m=>{add(m);add(k+" "+m);});}
  CATALOG.motorisations.forEach(add);
  VEH_INDEX.forEach(v=>(v.v||[]).forEach(x=>{add(v.marque+" "+v.modele+" "+x[0]);add(x[0]);}));
  const seen=new Set();SUGTERMS=SUGTERMS.filter(t=>t.n&&!seen.has(t.n)&&seen.add(t.n));
};
fillDatalists=function(){
  document.getElementById("dlMarques").innerHTML=CATALOG.marques.map(m=>`<option value="${esc(m)}">`).join("");
  document.getElementById("dlMoteurs").innerHTML=CATALOG.motorisations.map(m=>`<option value="${esc(m)}">`).join("");
  if(!document.getElementById("dlPuiss")){
    const dl=document.createElement("datalist");dl.id="dlPuiss";document.body.appendChild(dl);
    document.getElementById("cPuiss").setAttribute("list","dlPuiss");
  }
  majModeles();majPuiss();
};
majModeles=function(){
  const m=document.getElementById("cMarque").value;let l=[];
  for(const k in CATALOG.modeles)if(!m||_nrm(k).includes(_nrm(m)))l=l.concat(CATALOG.modeles[k]);
  document.getElementById("dlModeles").innerHTML=[...new Set(l)].sort().map(x=>`<option value="${esc(x)}">`).join("");
  majPuiss();
};
function majPuiss(){
  const m=_nrm(document.getElementById("cMarque").value),mo=_nrm(document.getElementById("cModele").value);
  let ps=[],mots=[];
  VEH_INDEX.forEach(v=>{
    if((!m||_nrm(v.marque).includes(m))&&(!mo||_nrm(v.modele).includes(m))){
      (v.v||[]).forEach(x=>{ps.push(x[2]);if(x[0])mots.push(x[0]);});
    }});
  const dl=document.getElementById("dlPuiss");
  if(dl)dl.innerHTML=[...new Set(ps)].sort((a,b)=>a-b).map(p=>`<option value="${p}">`).join("");
  if(mots.length){
    const cur=document.getElementById("dlMoteurs");
    cur.innerHTML=[...new Set(mots.concat(CATALOG.motorisations))].map(x=>`<option value="${esc(x)}">`).join("");
  }
  const hit=VEH_INDEX.find(v=>_nrm(v.marque)===m&&_nrm(v.modele)===mo);
  if(hit&&hit.energie&&!document.getElementById("cEnergie").value)document.getElementById("cEnergie").value=hit.energie;
}
["cMarque","cModele"].forEach(id=>document.getElementById(id).addEventListener("change",majPuiss));
document.getElementById("cModele").addEventListener("input",majPuiss);

/* ---------- panneau DIAGNOSTIC + MAJ serveur avec erreur réelle ---------- */
function repoCible(){return localStorage.getItem("repo_gh")||REPO;}
function injectDiag(){
  const host=document.getElementById("a-base");if(!host||document.getElementById("diagBox"))return;
  const d=document.createElement("div");d.id="diagBox";d.className="hit";
  d.innerHTML=`<h3>🩺 Diagnostic chargement</h3>
   <div id="diagTxt" class="small">…</div>
   <input id="repoGh" placeholder="owner/repo (ex : expertkevin06-cell/kev-tech-fire)">
   <button class="btn" id="btnMaj2">🚀 MAJ serveur (diagnostic détaillé)</button>
   <button class="btn ghost" id="btnRecharge2">🔄 Recharger base + catalogue</button>
   <div id="majLog" class="small"></div>`;
  host.prepend(d);
  document.getElementById("repoGh").value=repoCible();
  document.getElementById("btnRecharge2").addEventListener("click",async()=>{
    await loadBase(true);await loadCatalogueDistant();majDiag();toast("✅ Rechargé.");});
  document.getElementById("btnMaj2").addEventListener("click",async()=>{
    const repo=document.getElementById("repoGh").value.trim()||REPO;
    localStorage.setItem("repo_gh",repo);
    const tk=(document.getElementById("ghPat").value.trim())||localStorage.getItem("ghpat")||"";
    const log=document.getElementById("majLog");
    if(!tk){log.textContent="❌ Token GitHub manquant (scope workflow).";return;}
    if(tk!=="••••••••")localStorage.setItem("ghpat",tk);
    log.textContent="⏳ Envoi…";
    try{
      const r=await fetch(`https://api.github.com/repos/${repo}/actions/workflows/maj-bases.yml/dispatches`,
        {method:"POST",headers:{Authorization:"Bearer "+tk,Accept:"application/vnd.github+json"},body:JSON.stringify({ref:"main"})});
      const t=await r.text();
      log.innerHTML=r.status===204?"✅ Déclenché. Suivi : GitHub → Actions → « MAJ bases techniques »."
        :`❌ HTTP ${r.status} — ${esc(t).slice(0,300)}<br>404 = repo/workflow introuvable (vérifie le nom + présence de <code>.github/workflows/maj-bases.yml</code> sur <b>main</b>) · 401 = token invalide · 403 = scope <b>workflow</b> manquant · 422 = branche ≠ main.`;
    }catch(e){log.textContent="❌ Réseau : "+e.message;}
  });
  majDiag();
}
function majDiag(){
  const el=document.getElementById("diagTxt");if(!el)return;
  el.innerHTML=`Version base : <b>${esc(VERSION)}</b> • fiches : <b>${BASE.length}</b><br>
   Marques : <b>${CATALOG.marques.length}</b> • Modèles : <b>${Object.values(CATALOG.modeles).flat().length}</b> • Motorisations : <b>${CATALOG.motorisations.length}</b> • Versions chiffrées : <b>${VEH_INDEX.filter(v=>v.v&&v.v.length).length}</b><br>
   Repo ciblé : <b>${esc(repoCible())}</b><br>
   ${VERSION.indexOf("seed")===0?"⚠️ Base encore en SEED : le workflow n'a pas publié de données. Lance la MAJ (phase rapide ≈ 2 min) ou dépose ton export dans <code>data/catalogue_source.json</code>.":"✅ Base publiée par le workflow."}`;
}
const _showAdminBase=showAdmin;
showAdmin=function(){_showAdminBase();setTimeout(()=>{injectDiag();majDiag();},50);};

/* ---------- boot ---------- */
mergeCatalogue();fillFilters();fillDatalists();renderResults();
loadCatalogueDistant();
setTimeout(()=>{mergeCatalogue();fillFilters();fillDatalists();majDiag();},2500);
setInterval(loadCatalogueDistant,6*3600*1000);
