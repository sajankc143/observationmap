// parse-observations.js
// Fetches butterflyexplorers.com and parses all observation images into JSON
// Mirrors the browser-side parseImagesFromHTML logic

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://www.butterflyexplorers.com/p/new-butterflies.html';
const OUTPUT_FILE = path.join(__dirname, 'observations.json');

// ── Taxonomy ──────────────────────────────────────────────────────────────────

const BUTTERFLY_FAMILIES = {
    'Papilionidae': [
        'Baronia', 'Parnassius', 'Eurytides', 'Battus', 'Euryades', 'Parides', 'Heraclides', 
        'Pterourus', 'Papilio', 'Praepapilio', 'Graphium', 'Lamproptera', 'Meandrusa', 
        'Teinopalpus', 'Atrophaneura', 'Byasa', 'Pachliopta', 'Losaria', 'Troides', 'Bhutanitis', 'Pathysa', 'Neographium'
    ],
    'Pieridae': [
        'Nathalis', 'Kricogonia', 'Prestonia', 'Eurema', 'Pyrisitia', 'Abaeis', 'Teriocolias', 
        'Colias', 'Zerene', 'Anteos', 'Phoebis', 'Aphrissa', 'Anthocharis', 'Euchloe', 'Eroessa', 
        'Hesperocharis', 'Mathania', 'Ganyra', 'Ascia', 'Phulia', 'Pontia', 'Pieris', 'Glennia', 
        'Leptophobia', 'Itaballia', 'Pieriballia', 'Perrhybris', 'Charonias', 'Archonias', 
        'Eucheira', 'Neophasia', 'Pereute', 'Leodonta', 'Melete', 'Glutophrissa', 'Pseudopieris', 
        'Lieinix', 'Dismorphia', 'Patia', 'Enantia', 'Moschoneura', 'Catopsilia', 'Dercas', 
        'Gandaca', 'Gonepteryx', 'Colotis', 'Ixias', 'Hebomoia', 'Leptosia', 'Pareronia', 
        'Aporia', 'Appias', 'Saletara', 'Baltia', 'Belenois', 'Cepora', 'Delias', 'Talbotia', 
        'Sinopieris', 'Rhabdodryas', 'Prioneris'
    ],
    'Nymphalidae': [
        'Libytheana', 'Prolibythea', 'Archaeolycorea', 'Anetia', 'Lycorea', 'Danaus', 'Elzunia', 
        'Tithorea', 'Aeria', 'Athesis', 'Eutresis', 'Athyrtis', 'Paititia', 'Olyras', 'Patricia', 
        'Melinaea', 'Methona', 'Thyridia', 'Scada', 'Sais', 'Forbestra', 'Mechanitis', 'Epityches', 
        'Hyalyris', 'Napeogenes', 'Hypothyris', 'Pagyris', 'Ithomia', 'Megoleria', 'Hyposcada', 
        'Oleria', 'Ollantaya', 'Ceratinia', 'Callithomia', 'Dircenna', 'Hyalenna', 'Episcada', 
        'Haenschia', 'Pteronymia', 'Velamysta', 'Godyris', 'Pachacutia', 'Veladyris', 'Hypoleria', 
        'Brevioleria', 'Mcclungia', 'Greta', 'Hypomenitis', 'Heterosais', 'Pseudoscada', 'Actinote', 
        'Dione', 'Podotricha', 'Dryadula', 'Dryas', 'Philaethria', 'Neruda', 'Eueides', 'Heliconius', 
        'Euptoieta', 'Yramea', 'Boloria', 'Argynnis', 'Limenitis', 'Adelpha', 'Asterocampa', 
        'Doxocopa', 'Biblis', 'Vila', 'Mestra', 'Archimestra', 'Catonephele', 'Nessaea', 'Myscelia', 
        'Cybdelis', 'Sea', 'Eunica', 'Batesia', 'Ectima', 'Hamadryas', 'Panacea', 'Asterope', 
        'Bolboneura', 'Epiphile', 'Lucinia', 'Nica', 'Peria', 'Pyrrhogyra', 'Temenis', 'Callicorina', 
        'Dynamine', 'Haematera', 'Antigonis', 'Callicore', 'Catagramma', 'Archaeogramma', 'Diaethria', 
        'Perisama', 'Marpesia', 'Pycina', 'Historis', 'Baeotus', 'Colobura', 'Tigridia', 'Smyrna', 
        'Hypanartia', 'Vanessa', 'Aglais', 'Nymphalis', 'Polygonia', 'Jupitellia', 'Anartia', 
        'Metamorpha', 'Napeocles', 'Siproeta', 'Hypolimnas', 'Junonia', 'Euphydryas', 'Poladryas', 
        'Chlosyne', 'Microtia', 'Gnathotriche', 'Higginsius', 'Antillea', 'Atlantea', 'Phystis', 
        'Mazia', 'Tisona', 'Ortilia', 'Notilia', 'Levinata', 'Anthanassa', 'Castilia', 'Telenassa', 
        'Ithra', 'Dagon', 'Eresia', 'Janatella', 'Tegosa', 'Phyciodes', 'Prodryas', 'Coenophlebia', 
        'Consul', 'Hypna', 'Polygrapha', 'Siderone', 'Phantos', 'Zaretis', 'Anaea', 'Fountainea', 
        'Memphis', 'Anaeomorpha', 'Archaeoprepona', 'Mesoprepona', 'Prepona', 'Antirrhea', 'Caerois', 
        'Morpho', 'Bia', 'Blepolenis', 'Brassolis', 'Caligo', 'Caligopsis', 'Catoblepia', 
        'Dasyophthalma', 'Dynastor', 'Eryphanis', 'Mielkella', 'Opoptera', 'Opsiphanes', 
        'Orobrassolis', 'Penetes', 'Selenophanes', 'Aponarope', 'Narope', 'Neorinella', 'Cithaerias', 
        'Dulcedo', 'Haetera', 'Pierella', 'Pseudohaetera', 'Manataria', 'Lethe', 'Calisto', 
        'Gyrocheilus', 'Pronophila', 'Corades', 'Daedalma', 'Thiemeia', 'Junea', 'Oxeoschistus', 
        'Mygona', 'Proboscis', 'Apexacuta', 'Lasiophila', 'Drucina', 'Druphila', 'Foetterleia', 
        'Pseudomaniola', 'Arhuaco', 'Cheimas', 'Steroma', 'Steremnia', 'Eteona', 'Eretris', 
        'Manerebia', 'Diaphanos', 'Idioneurula', 'Lymanopoda', 'Ianussiusa', 'Redonda', 'Dangond', 
        'Altopedaliodes', 'Punapedaliodes', 'Antopedaliodes', 'Corderopedaliodes', 'Panyapedaliodes', 
        'Paramo', 'Parapedaliodes', 'Pherepedaliodes', 'Physcopedaliodes', 'Praepedaliodes', 
        'Praepronophila', 'Steromapedaliodes', 'Neopedaliodes', 'Argyrophorus', 'Auca', 'Cosmosatyrus', 
        'Elina', 'Faunula', 'Haywardella', 'Homoeonympha', 'Nelia', 'Neomaenas', 'Pampasatyrus', 
        'Quilaphoetosus', 'Spinantenna', 'Tetraphlebia', 'Chillanella', 'Archeuptychia', 
        'Caeruleuptychia', 'Capronnieria', 'Carminda', 'Cepheuptychia', 'Chloreuptychia', 'Lazulina', 
        'Amiga', 'Cissia', 'Vareuptychia', 'Vanima', 'Cyllopsis', 'Erichthodes', 'Stephenympha', 
        'Atlanteuptychia', 'Euptychia', 'Euptychoides', 'Cisandina', 'Optimandes', 'Graphita', 
        'Godartiana', 'Hermeuptychia', 'Huberonympha', 'Inbio', 'Magneuptychia', 'Modica', 'Deltaya', 
        'Occulta', 'Xenovena', 'Trico', 'Scriptor', 'Modestia', 'Colombeia', 'Omacha', 'Megeuptychia', 
        'Megisto', 'Llorenteana', 'Neonympha', 'Moneuptychia', 'Paramacera', 'Pareuptychia', 
        'Paryphthimoides', 'Emeryus', 'Pharneuptychia', 'Pindis', 'Pseudeuptychia', 'Satyrotaygetis', 
        'Splendeuptychia', 'Argentaria', 'Saurona', 'Nhambikuara', 'Stegosatyrus', 'Stevenaria', 
        'Taydebis', 'Sepona', 'Harjesia', 'Parataygetis', 'Posttaygetis', 'Forsterinaria', 
        'Orotaygetis', 'Pseudodebis', 'Taguaiba', 'Taygetina', 'Taygetis', 'Yphthimoides', 
        'Malaveria', 'Koutalina', 'Zischkaia', 'Amphidecta', 'Oressinoma', 'Coenonympha', 
        'Cercyonis', 'Erebia', 'Oeneis', 'Libythea', 'Euploea', 'Idea', 'Ideopsis', 'Parantica', 
        'Tirumala', 'Acraea', 'Cethosia', 'Issoria', 'Algia', 'Cirrochroa', 'Cupha', 'Phalanta', 
        'Vagrans', 'Vindula', 'Chitoria', 'Dilipa', 'Eulaceura', 'Euripus', 'Helcyra', 'Herona', 
        'Hestinalis', 'Hestina', 'Mimathyma', 'Rohana', 'Sasakia', 'Sephisa', 'Ariadne', 'Byblia', 
        'Laringa', 'Chersonesia', 'Cyrestis', 'Dichorragia', 'Pseudergolis', 'Stibochiona', 'Abrota', 
        'Bassarona', 'Dophla', 'Euthalia', 'Symphaedra', 'Tanaecia', 'Lexias', 'Neurosigma', 'Athyma', 
        'Auzakia', 'Bhagadatta', 'Moduza', 'Parasarpa', 'Sumalia', 'Lasippa', 'Neptis', 'Pantoporia', 
        'Phaedyma', 'Lebadea', 'Parthenos', 'Yoma', 'Doleschallia', 'Kallima', 'Melitaea', 'Araschnia', 
        'Kaniska', 'Symbrenthia', 'Rhinopalpa', 'Charaxes', 'Polyura', 'Prothoe', 'Calinaga', 'Aemona', 
        'Amathusia', 'Amathuxidia', 'Discophora', 'Enispe', 'Faunis', 'Melanocyma', 'Stichophthalma', 
        'Thaumantis', 'Thauria', 'Elymnias', 'Cyllogenes', 'Parantirrhoea', 'Aulocera', 'Callerebia', 
        'Paralasa', 'Chazara', 'Pseudochazara', 'Chonala', 'Coelites', 'Erites', 'Hipparchia', 
        'Hyponephele', 'Karanasa', 'Kanetisa', 'Satyrus', 'Kirinia', 'Lasiommata', 'Neope', 'Telinga', 
        'Mycalesis', 'Paroeneis', 'Orinoma', 'Orsotriaena', 'Ragadia', 'Rhaphicera', 'Ypthima', 
        'Zipaetis', 'Ethope', 'Neorina', 'Penthema', 'Texola', 'Thessalia', 'Apatura', 'Melanitis', 'Heteropsis', 'Neominois', 'Dymasia'
    ],
    'Riodinidae': [
        'Styx', 'Corrachia', 'Methone', 'Eurylasia', 'Myselasia', 'Erythia', 'Pelolasia', 'Marmessus', 
        'Maculasia', 'Euselasia', 'Eugelasia', 'Alesa', 'Eurybia', 'Eunogyra', 'Teratophthalma', 
        'Ectosemia', 'Endosemia', 'Mesosemia', 'Semomesia', 'Leucochimona', 'Mesophthalma', 
        'Perophthalma', 'Hyphilaria', 'Eucorna', 'Cremna', 'Napaea', 'Ithomiola', 'Dianesia', 
        'Lucillella', 'Esthemopsis', 'Mesene', 'Mesenopsis', 'Xynias', 'Xenandra', 'Symmachia', 
        'Stichelia', 'Tigria', 'Asymma', 'Pirascca', 'Pterographium', 'Phaenochitonia', 
        'Argyrogrammana', 'Helicopis', 'Sarota', 'Ourocnemis', 'Anteros', 'Callistium', 'Echydna', 
        'Calydna', 'Echenais', 'Befrostia', 'Xanthosa', 'Sertania', 'Baeotis', 'Dachetola', 
        'Cariomothis', 'Inkana', 'Pheles', 'Syrmatia', 'Parcella', 'Notheme', 'Riodina', 'Siseme', 
        'Monethe', 'Themone', 'Paraphthonia', 'Brachyglenis', 'Isapis', 'Melanis', 'Lyropteryx', 
        'Ancyluris', 'Cyrenia', 'Rhetus', 'Ithomeis', 'Chorinea', 'Panara', 'Amarynthis', 'Chalodeta', 
        'Crocozona', 'Calephelis', 'Amphiselenis', 'Charis', 'Chadia', 'Detritivora', 'Putridivora', 
        'Lasaia', 'Exoplisia', 'Metacharis', 'Astraeodes', 'Cartea', 'Oco', 'Chamaelimnas', 
        'Barbicornis', 'Seco', 'Caria', 'Curvie', 'Apodemia', 'Emesis', 'Zabuella', 'Catocyclotis', 
        'Nymphidium', 'Minotauros', 'Parvospila', 'Periplacis', 'Livendula', 'Adelotypa', 'Calociasma', 
        'Joiceya', 'Ahrenholzia', 'Pandemos', 'Zelotaea', 'Dysmathia', 'Pseudolivendula', 'Diminutiva', 
        'Rodinia', 'Hypophylla', 'Argyraspila', 'Calospila', 'Calliona', 'Sanguinea', 'Catagrammina', 
        'Setabis', 'Aricoris', 'Ariconias', 'Lemonias', 'Thisbe', 'Juditha', 'Synargis', 'Thenpea', 
        'Annulata', 'Calicosama', 'Behemothia', 'Archaeonympha', 'Theope', 'Pseudotinea', 'Petrocerus', 
        'Pachythone', 'Pseudonymphidia', 'Minstrellus', 'Protonymphidia', 'Stalachtis', 'Riodinella', 
        'Lithopsyche', 'Dodona', 'Stiboges', 'Zemeros', 'Taxila', 'Abisara'
    ],
    'Lycaenidae': [
        'Feniseca', 'Lycaena', 'Tharsalea', 'Iophanus', 'Hypaurotis', 'Eumaeus', 'Theorema', 'Paiwarria', 
        'Mithras', 'Dabreras', 'Brangas', 'Thaeides', 'Enos', 'Lamasina', 'Airamanna', 'Evenus', 
        'Atlides', 'Arcas', 'Pseudolycaena', 'Lucilda', 'Aveexcrenota', 'Theritas', 'Denivia', 
        'Johnsonita', 'Brevianta', 'Ianusanta', 'Micandra', 'Rhamma', 'Phothecla', 'Salazaria', 
        'Timaeta', 'Temecla', 'Ipidecla', 'Penaincisalia', 'Lathecla', 'Podanotum', 'Busbiina', 
        'Thereus', 'Rekoa', 'Arawacus', 'Contrafacia', 'Kolana', 'Satyrium', 'Ocaria', 'Chlorostrymon', 
        'Magnastigma', 'Cyanophrys', 'Callophrys', 'Bistonina', 'Megathecla', 'Cupathecla', 'Thestius', 
        'Allosmaitia', 'Laothus', 'Janthecla', 'Lamprospilus', 'Badecla', 'Arzecla', 'Arumecla', 
        'Camissecla', 'Electrostrymon', 'Pendantus', 'Rubroserrata', 'Ziegleria', 'Kisutam', 'Calycopis', 
        'Strymon', 'Tmolus', 'Nicolaea', 'Ministrymon', 'Exorbaetta', 'Gargina', 'Siderus', 'Theclopsis', 
        'Grishinata', 'Ostrinotes', 'Strephonota', 'Panthiades', 'Oenomaus', 'Porthecla', 'Thepytus', 
        'Parrhasius', 'Michaelus', 'Ignata', 'Olynthus', 'Hypostrymon', 'Marachina', 'Apuecla', 
        'Nesiostrymon', 'Balintus', 'Aubergina', 'Terenthina', 'Iaspis', 'Celmia', 'Dicya', 'Trichonis', 
        'Erora', 'Semonina', 'Chalybs', 'Symbiopsis', 'Udara', 'Celastrina', 'Zizina', 'Lampides', 
        'Glaucopsyche', 'Philotes', 'Euphilotes', 'Zizula', 'Brephidium', 'Leptotes', 'Elkalyce', 
        'Cupido', 'Pseudochrysops', 'Itylos', 'Pseudolucia', 'Nabokovia', 'Hemiargus', 'Echinargus', 
        'Cyclargus', 'Icaricia', 'Agriades', 'Plebejus', 'Polyommatus', 'Poritia', 'Simiskina', 
        'Liphyra', 'Miletus', 'Allotinus', 'Logania', 'Spalgis', 'Taraka', 'Curetis', 'Cigaritis', 
        'Talicada', 'Castalius', 'Discolampa', 'Caleta', 'Tarucus', 'Azanus', 'Pithecops', 'Neopithecops', 
        'Everes', 'Tongeia', 'Shijimia', 'Bothrinia', 'Megisba', 'Acytolepis', 'Oreolyce', 'Callenya', 
        'Celatoxia', 'Lestranicus', 'Monodontides', 'Notarthrinus', 'Phengaris', 'Pseudophilotes', 
        'Albulina', 'Patricius', 'Aricia', 'Turanana', 'Eumedonia', 'Iolana', 'Kretania', 'Plebejidea', 
        'Freyeria', 'Pseudozizeeria', 'Zizeeria', 'Euchrysops', 'Chilades', 'Catochrysops', 'Jamides', 
        'Orthomiella', 'Una', 'Catopyrops', 'Ionolyce', 'Nacaduba', 'Prosotas', 'Petrelaea', 'Niphanda', 
        'Anthene', 'Heliophorus', 'Ahlbergia', 'Superflua', 'Amblopala', 'Chaetoprocta', 'Euaspa', 
        'Chrysozephyrus', 'Esakiozephyrus', 'Fujiokaozephyrus', 'Inomataozephyrus', 'Iwaseozephyrus', 
        'Neozephyrus', 'Shirozuozephyrus', 'Shizuyaozephyrus', 'Thermozephyrus', 'Yamamotozephyrus', 
        'Leucantigius', 'Iraota', 'Amblypodia', 'Thaduka', 'Mahathala', 'Apporasa', 'Arhopala', 'Flos', 
        'Surendra', 'Zinaspa', 'Mota', 'Loxura', 'Yasoda', 'Drina', 'Zesius', 'Ancema', 'Remelana', 
        'Dacalana', 'Pratapa', 'Creon', 'Maneca', 'Britomartis', 'Bullis', 'Tajuria', 'Rachana', 
        'Charana', 'Neocheritra', 'Suasa', 'Cheritrella', 'Cheritra', 'Ticherra', 'Drupadia', 'Rathinda', 
        'Horaga', 'Catapaecilma', 'Acupicta', 'Hypolycaena', 'Zeltus', 'Artipe', 'Deudorix', 'Virachola', 
        'Rapala', 'Sinthusa', 'Pamela', 'Bindahara', 'Araotes', 'Spindasis', 'Luthrodes', 'Chliaria', 'Syntarucus'
    ],
    'Hesperiidae': [
        'Udranomia', 'Drephalys', 'Phanus', 'Hyalothyrus', 'Entheus', 'Augiades', 'Tarsoctenus', 
        'Phocides', 'Nascus', 'Aurina', 'Emmelus', 'Porphyrogenes', 'Nicephellus', 'Salatis', 
        'Salantoia', 'Ornilius', 'Adina', 'Sarmientoia', 'Fulvatis', 'Bungalotis', 'Dyscophellus', 
        'Euriphellus', 'Phareas', 'Cecropterus', 'Spicauda', 'Urbanus', 'Telegonus', 'Autochton', 
        'Spathilepia', 'Astraptes', 'Narcosius', 'Proteides', 'Epargyreus', 'Chioides', 'Aguna', 
        'Zeutus', 'Lobocla', 'Lobotractus', 'Codatractus', 'Zestusa', 'Ridens', 'Venada', 'Cephise', 
        'Ectomis', 'Telemiades', 'Polygonus', 'Oileides', 'Flattoides', 'Typhedanus', 'Oechydrus', 
        'Cogia', 'Nerula', 'Marela', 'Azonax', 'Zonia', 'Granila', 'Aspitha', 'Myscelus', 'Agara', 
        'Passova', 'Pyrrhopyge', 'Guyanna', 'Gunayan', 'Yanguna', 'Apyrrothrix', 'Creonpyge', 
        'Jonaspyge', 'Ardaris', 'Mysoria', 'Mimoniades', 'Jemadia', 'Nosphistia', 'Croniades', 
        'Protelbella', 'Parelbella', 'Microceris', 'Oxynetra', 'Jera', 'Livida', 'Pythonides', 'Lirra', 
        'Gindanes', 'Quadrus', 'Haemactis', 'Milanion', 'Paramimus', 'Charidia', 'Cabirus', 
        'Pseudodrephalys', 'Eantis', 'Aethilla', 'Achlyodes', 'Doberes', 'Spioniades', 'Eracon', 
        'Mimia', 'Xispia', 'Myrinia', 'Grais', 'Morvina', 'Cyclosemia', 'Cornuphallus', 'Iliana', 
        'Tiana', 'Arteurotia', 'Conognathus', 'Ocella', 'Sophista', 'Polyctor', 'Viola', 'Viuria', 
        'Pellicia', 'Nisoniades', 'Burca', 'Gorgopas', 'Incisus', 'Clytius', 'Perus', 'Bolla', 
        'Staphylus', 'Pholisora', 'Noctuana', 'Windia', 'Pyrgus', 'Chirgus', 'Burnsius', 'Heliopetes', 
        'Celotes', 'Systaspes', 'Trina', 'Antina', 'Antigonus', 'Diaeus', 'Onenses', 'Systasea', 
        'Zobera', 'Xenophanes', 'Canesia', 'Carrhenes', 'Santa', 'Paches', 'Plumbago', 'Zopyrion', 
        'Anisochoria', 'Bralus', 'Clito', 'Anastrus', 'Mylon', 'Hoodus', 'Echelatus', 'Tolius', 
        'Anaxas', 'Potamanaxas', 'Festivia', 'Sostrata', 'Gorgythion', 'Chiothion', 'Theagenes', 
        'Helias', 'Ebrietas', 'Cycloglypha', 'Camptopleura', 'Timochares', 'Chiomara', 'Crenda', 
        'Neomorphuncus', 'Ephyriades', 'Gesta', 'Erynnis', 'Celaenorrhinus', 'Carterocephalus', 
        'Dalla', 'Ladda', 'Freemaniana', 'Dardarina', 'Piruna', 'Butleria', 'Argopteron', 'Erionota', 
        'Euphyes', 'Mnaseas', 'Serdis', 'Pompe', 'Cyclosma', 'Caligulana', 'Chloeria', 'Tirynthoides', 
        'Testia', 'Oxynthes', 'Lindra', 'Noxys', 'Metrocles', 'Metron', 'Phemiades', 'Notamblyscirtes', 
        'Holguinia', 'Onespa', 'Neposa', 'Buzyges', 'Buzella', 'Librita', 'Decinea', 'Tirynthia', 
        'Quasimellana', 'Atrytone', 'Zariaspes', 'Anatrytone', 'Hylephila', 'Pompeius', 'Hedone', 
       'Limochores', 'Polites', 'Nyctelius', 'Conga', 'Vernia', 'Atalopedes', 'Hesperia', 
       'Pseudocopaeodes', 'Parachoranthus', 'Neochlodes', 'Ochlodes', 'Stinga', 'Poanes', 'Lon', 
       'Evansiella', 'Paratrytone', 'Megaleas', 'Tisias', 'Xeniades', 'Vacerra', 'Oligoria', 
       'Atrytonopsis', 'Thespieus', 'Gracilata', 'Psoralis', 'Hermio', 'Alychna', 'Zalomes', 
       'Wahydra', 'Adlerodea', 'Mucia', 'Ralis', 'Vinius', 'Rhinthon', 'Cynea', 'Onophas', 
       'Chitta', 'Gufa', 'Eutus', 'Godmia', 'Thoon', 'Halotus', 'Curva', 'Alerema', 'Crinifemur', 
       'Rhomba', 'Niconiades', 'Joanna', 'Vinpeius', 'Pares', 'Bruna', 'Paracarystus', 'Viridina', 
       'Moeris', 'Tricrista', 'Lancephallus', 'Vettius', 'Tigasis', 'Inglorius', 'Gallio', 
       'Mnasicles', 'Amblyscirtes', 'Vidius', 'Rectava', 'Cobalopsis', 'Artonia', 'Lurida', 'Corra', 
       'Nastra', 'Lerodea', 'Fidius', 'Cymaenes', 'Monca', 'Troyus', 'Lerema', 'Contrastia', 
       'Vehilius', 'Papias', 'Veadda', 'Duroca', 'Saturnus', 'Parphorus', 'Picova', 'Cantha', 
       'Haza', 'Vistigma', 'Gemmia', 'Phlebodes', 'Dubia', 'Mnasitheus', 'Naevolus', 'Sodalia', 
       'Metiscus', 'Lychnuchus', 'Mit', 'Eutychide', 'Dion', 'Venas', 'Eprius', 'Peba', 'Radiatus', 
       'Lattus', 'Tarmia', 'Panca', 'Ginungagapus', 'Lucida', 'Eutocus', 'Artines', 'Phanes', 
       'Pheraeus', 'Lamponia', 'Molla', 'Rufocumbre', 'Cumbre', 'Tava', 'Callimormus', 'Gubrus', 
       'Lento', 'Virga', 'Mnestheus', 'Ludens', 'Rigga', 'Misius', 'Anthoptus', 'Corticea', 
       'Choranthus', 'Racta', 'Igapophilus', 'Flaccilla', 'Turesis', 'Mnasinous', 'Methion', 
       'Thargella', 'Propapias', 'Synapte', 'Koria', 'Justinia', 'Mnasalcas', 'Barrolla', 'Falga', 
       'Apaustus', 'Ancyloxypha', 'Adopaeoides', 'Thymelicus', 'Oarisma', 'Panoquina', 'Zenis', 
       'Calpodes', 'Corta', 'Orthos', 'Turmosa', 'Dubiella', 'Carystina', 'Aides', 'Thracides', 
       'Vertica', 'Calvetta', 'Cobalus', 'Carystus', 'Aroma', 'Molo', 'Tellona', 'Talides', 'Ebusus', 
       'Zetka', 'Coolus', 'Mielkeus', 'Neoxeniades', 'Daron', 'Damas', 'Tromba', 'Pseudosarbia', 
       'Pyrrhopygopsis', 'Nyctus', 'Oz', 'Orses', 'Perichares', 'Lycas', 'Oenides', 'Orphe', 
       'Pseudorphe', 'Carystoides', 'Aegiale', 'Turnerina', 'Agathymus', 'Stallingsia', 'Megathymus', 
       'Badamia', 'Bibasis', 'Burara', 'Choaspes', 'Hasora', 'Pseudocoladenia', 'Sarangesa', 'Capila', 
       'Satarupa', 'Seseria', 'Coladenia', 'Tagiades', 'Odina', 'Pintara', 'Mooreana', 'Gerosis', 
       'Darpa', 'Tapena', 'Ctenoptilum', 'Odontoptilum', 'Caprona', 'Chamunda', 'Gomalia', 'Spialia', 
       'Carcharodus', 'Apostictopterus', 'Astictopterus', 'Baracus', 'Ampittia', 'Aeromachus', 
       'Pedesta', 'Arnetta', 'Iambrix', 'Suastus', 'Scobura', 'Suada', 'Koruthaialos', 'Psolos', 
       'Stimula', 'Ancistroides', 'Udaspes', 'Notocrypta', 'Gangara', 'Pudicitia', 'Matapa', 
       'Hyarotis', 'Quedara', 'Isma', 'Pyroneura', 'Salanoemia', 'Plastingia', 'Lotongus', 'Zela', 
       'Unkana', 'Hidari', 'Pirdana', 'Creteus', 'Pithauria', 'Halpemorpha', 'Sovia', 'Thoressa', 
       'Halpe', 'Sebastonyma', 'Actinor', 'Cupitha', 'Zographetus', 'Taractrocera', 'Oriens', 
       'Potanthus', 'Telicota', 'Cephrenes', 'Baoris', 'Borbo', 'Caltoris', 'Gegenes', 'Iton', 
       'Parnara', 'Pelopidas', 'Achalarus', 'Polytremis', 'Zenonoida', 'Wallengrenia', 'Morys', 'Ochus', 'Sebastronyma', 'Copaeodes'
   ],
   'Hedylidae': [
       'Macrosoma'
   ]
};

const TAXON_SYNONYMS = [
  { old: 'Asterocampa clyton', name: 'Asterocampa louisa', commonName: 'Tawny Emperor', onlyInLocation: 'Texas' },
  { old: 'Libytheana carinenta', name: 'Libytheana bachmanii', commonName: 'Eastern American Snout', onlyInLocation: 'Florida' },
  { old: 'Libytheana carinenta', name: 'Libytheana larvata', commonName: 'Western American Snout', onlyInLocation: 'Texas' },
  { old: 'Libytheana carinenta', name: 'Libytheana larvata', commonName: 'Western American Snout', onlyInLocation: 'New Mexico' },
  { old: 'Libytheana carinenta', name: 'Libytheana larvata', commonName: 'Western American Snout', onlyInLocation: 'Arizona' },
  { old: 'Polites otho', name: 'Polites jobrea', commonName: 'Mexican Broken-Dash', onlyInLocation: 'Texas' },
  { old: 'Polites otho', name: 'Polites jobrea', commonName: 'Mexican Broken-Dash', onlyInLocation: 'Costa Rica' },
  { old: 'Polites otho', name: 'Polites jobrea', commonName: 'Mexican Broken-Dash', onlyInLocation: 'Panama' },
  { old: 'Wallengrenia otho', name: 'Polites jobrea', commonName: 'Mexican Broken-Dash', onlyInLocation: 'Texas' },
  { old: 'Wallengrenia otho', name: 'Polites jobrea', commonName: 'Mexican Broken-Dash', onlyInLocation: 'Costa Rica' },
  { old: 'Wallengrenia otho', name: 'Polites jobrea', commonName: 'Mexican Broken-Dash', onlyInLocation: 'Panama' },
  { old: 'Wallengrenia', name: 'Polites' },
  { old: 'Cecropterus dorantes', name: 'Cecropterus cramptoni', commonName: "Crampton's Longtail", onlyInLocation: 'Puerto Rico' },
  { old: 'Adelpha gelania', name: 'Adelpha arecosa', commonName: 'Puerto Rican Sister', onlyInLocation: 'Puerto Rico' },
  { old: 'Anaea troglodyta', name: 'Anaea astina', commonName: 'Astina Leafwing', onlyInLocation: 'Puerto Rico' },
  { old: 'Eunica tatila', name: 'Eunica tatilista', commonName: 'Florida Leafwing', onlyInLocation: 'Florida' },
  { old: 'Eunica tatila', name: 'Eunica tatilista', commonName: 'Florida Leafwing', onlyInLocation: 'Puerto Rico' },
  { old: 'Hamadryas februa', name: 'Hamadryas ferox', commonName: 'Caribbean Cracker', onlyInLocation: 'Puerto Rico' },
];

function extractGenusFromSpecies(speciesName) {
  if (!speciesName || typeof speciesName !== 'string') return '';
  const cleaned = speciesName.replace(/[<>]/g, '').trim();
  return cleaned.split(/\s+/)[0] || '';
}

function getButterflyFamily(genus) {
  if (!genus) return null;
  for (const [family, genera] of Object.entries(BUTTERFLY_FAMILIES)) {
    if (genera.includes(genus)) return family;
  }
  return null;
}

function applyTaxonSynonyms(species, commonName, location) {
  for (const rule of TAXON_SYNONYMS) {
    if (species === rule.old || species.startsWith(rule.old)) {
      if (rule.onlyInLocation) {
        if (!location || !location.toLowerCase().includes(rule.onlyInLocation.toLowerCase())) continue;
      }
      return {
        species: species.replace(rule.old, rule.name),
        commonName: rule.commonName || commonName
      };
    }
  }
  return { species, commonName };
}

// ── Parsing helpers ───────────────────────────────────────────────────────────

function extractDateFromTitle(title) {
  if (!title) return null;
  const patterns = [
    /(\d{4})\/(\d{2})\/(\d{2})/,
    /(\d{2})\/(\d{2})\/(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})-(\d{2})-(\d{4})/
  ];
  for (const pattern of patterns) {
    const m = title.match(pattern);
    if (m) {
      if (pattern.toString().startsWith('/(\\ d{4})')) {
        return new Date(m[1], m[2] - 1, m[3]);
      }
      // year-first patterns
      if (m[1].length === 4) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
      return new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
    }
  }
  return null;
}

function extractLocationFromTitle(title) {
  if (!title) return '';
  const patterns = [
    /<br\/?>([^<]+?)\s*\([^)]*\)\s*\d{4}\/\d{2}\/\d{2}/,
    /<br\/?>([^<]+?)\s*\d{4}\/\d{2}\/\d{2}/,
    /<br\/>([^<]+?)\s*(?:\d|©|$)/,
    /<br\/>([^<]+)/
  ];
  for (const pattern of patterns) {
    const m = title.match(pattern);
    if (m && m[1]) {
      let loc = m[1].trim()
        .replace(/\s*\([^)]*\)\s*$/, '')
        .replace(/^[A-Z]{2,}\d+\s*/, '');
      if (loc.length > 5) return loc;
    }
  }
  return '';
}

// Simple djb2 hash — matches browser-side generateUrlHash
function generateUrlHash(url) {
  if (!url) return '00000000';
  let hash = 5381;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) + hash) + url.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(8, '0').substring(0, 8).toUpperCase();
}

// ── HTML fetch ────────────────────────────────────────────────────────────────

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ButterflyExplorersBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    };
    client.get(url, options, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ── Main parse ────────────────────────────────────────────────────────────────

function parseHTML(html, sourceUrl) {
  const images = [];
  const seenUrls = new Set();
  const observationMap = new Map(); // hash → observationId (collision handling)

  // Match all <a data-lightbox ...> blocks containing an <img>
  // We use regex instead of a DOM parser to avoid a dependency
  const linkPattern = /<a\s[^>]*data-lightbox="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;

  while ((linkMatch = linkPattern.exec(html)) !== null) {
    const lightboxValue = linkMatch[1];
    const innerHtml = linkMatch[2];
    const fullTag = linkMatch[0];

    // Extract href from the <a>
    const hrefMatch = fullTag.match(/href="([^"]+)"/i);
    if (!hrefMatch) continue;
    const fullImageUrl = hrefMatch[1];

    // Skip duplicates
    if (seenUrls.has(fullImageUrl)) continue;
    seenUrls.add(fullImageUrl);

    // Extract data-title
    const titleMatch = fullTag.match(/data-title="((?:[^"\\]|\\.)*)"/i);
    const title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"') : '';

    // Extract <img src and alt
    const imgSrcMatch = innerHtml.match(/<img[^>]+src="([^"]+)"/i);
    const imgAltMatch = innerHtml.match(/<img[^>]+alt="([^"]*)"/i);
    if (!imgSrcMatch) continue;

    const thumbnailUrl = imgSrcMatch[1];
    const altText = imgAltMatch ? imgAltMatch[1] : '';

    // Parse species and common name from title
    let species = '';
    let commonName = '';

    if (title) {
      const speciesMatch = title.match(/<i>([^<]+)<\/i>/i);
      if (speciesMatch) {
        species = speciesMatch[1].trim();
        const afterSpecies = title.substring(title.indexOf('</i>') + 4);
        const nameMatch = afterSpecies.match(/^\s*[-–—−]\s*([^<]+?)(?:<\/p4>|<\/a>|<br|$)/i);
        if (nameMatch) {
          commonName = nameMatch[1].trim()
            .replace(/\s+(?:Wildlife|Management|Area|Park|Reserve|County|Co\.|State|National|Forest|Beach)\b.*$/i, '')
            .replace(/\s+\d{4}\/.*$/, '')
            .trim();
        }
      }
    }

    if ((!species || !commonName) && altText && altText.includes('-')) {
      const altMatch = altText.match(/^(.*?)\s*[-–]\s*(.*?)$/);
      if (altMatch) {
        if (!species) species = altMatch[1].trim();
        if (!commonName) commonName = altMatch[2].trim();
      }
    }

    if (!species || species.length < 2) species = 'Unknown Species';
    if (!commonName || commonName.length < 2) commonName = 'Unknown';

    const date = extractDateFromTitle(title);
    const location = extractLocationFromTitle(title);

    const corrected = applyTaxonSynonyms(species, commonName, location);
    species = corrected.species;
    commonName = corrected.commonName;

    const genus = extractGenusFromSpecies(species);
    const family = getButterflyFamily(genus);
    const isFeatured = lightboxValue === 'butterflies2';

    // Generate stable observation ID (mirrors browser logic)
    const urlHash = generateUrlHash(fullImageUrl);
    let observationId = urlHash;
    let suffix = 0;
    while (observationMap.has(observationId)) {
      suffix++;
      observationId = `${urlHash}${suffix.toString(36).toUpperCase()}`;
    }
    observationMap.set(observationId, fullImageUrl);

  // parse coordinates at build time instead of storing the raw title
const coordMatch = title.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:,\s*([^)]+))?\)/);
const lat = coordMatch ? coordMatch[1] : null;
const lon = coordMatch ? coordMatch[2] : null;
const elevation = coordMatch ? coordMatch[3]?.trim() : null;

images.push({
  species,
  commonName,
  family,
  fullTitle: title.replace(/"/g, '&quot;'),
  fullImageUrl,
  thumbnailUrl,
  alt: altText || `${species} - ${commonName}`,
  date: date ? date.toISOString() : null,
  location,
  lat,
  lon,
  elevation,
  timestamp: date ? date.getTime() : null,
  hasValidDate: !!date,
  isFeatured,
  observationId
});
  }

  return images;
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const html = await fetchPage(SOURCE_URL);
  console.log(`Fetched ${Math.round(html.length / 1024)}KB`);

  const images = parseHTML(html, SOURCE_URL);
  console.log(`Parsed ${images.length} observations`);

  // Sort: dated images newest-first, undated alphabetically at end
  images.sort((a, b) => {
    if (a.hasValidDate && b.hasValidDate) return b.timestamp - a.timestamp;
    if (a.hasValidDate) return -1;
    if (b.hasValidDate) return 1;
    return a.species.localeCompare(b.species);
  });

  const output = {
    generated: new Date().toISOString(),
    count: images.length,
    observations: images
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
  console.log(`Written to ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
