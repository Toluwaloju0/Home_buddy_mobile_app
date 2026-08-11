""" a module to define a list of all the states in nigeria """

from typing import List, Dict

States_list: List[str] = [
    "abia", "adamawa", "akwa ibom", "anambra", "bauchi", "bayelsa", 
    "benue", "borno", "cross river", "delta", "ebonyi", "edo", 
    "ekiti", "enugu", "fct", "gombe", "imo", "jigawa", 
    "kaduna", "kano", "katsina", "kebbi", "kogi", "kwara", 
    "lagos", "nasarawa", "niger", "ogun", "ondo", "osun", 
    "oyo", "plateau", "rivers", "sokoto", "taraba", "yobe", "zamfara"
]

States_with_lgas: Dict[str, List[str]] = {
  "abia": [
    "aba north", "aba south", "arochukwu", "bende", "ikwuano", "isiala ngwa north",
    "isiala ngwa south", "isuikwuato", "oboma ngwa", "ohafia", "osisioma", "ugwunagbo",
    "ukwa east", "ukwa west", "umu-nneochi", "umuahia north", "umuahia south"
  ],
  "federal capital territory": [
    "abaji", "bwari", "gwagwalada", "kuje", "kwali", "municipal"
  ],
  "adamawa": [
    "demsa", "fufore", "ganye", "girie", "gombi", "guyuk", "hong", "jada", "lamurde", "madagali",
    "maiha", "mayo-belwa", "michika", "mubi north", "mubi south", "numan", "shelleng", "song",
    "teungo", "yola north", "yola south"
  ],
  "akwa ibom": [
    "abak", "eastern obolo", "eket", "esit eket", "essien udim", "etim ekpo", "etinan", "ibeno",
    "ibesikpo asutan", "ibiono ibom", "ika", "ikono", "ikot abasi", "ikot ekpene", "ini", "itu",
    "mbo", "mkpat enin", "nsit atai", "nsit ibom", "nsit ubium", "obot akara", "okobo", "onna",
    "oron", "oruk anam", "udung uko", "ukanafun", "uruan", "urue offong|oruko", "uyo"
  ],
  "anambra": [
    "aguata", "anambra east", "anambra west", "anaocha", "awka north", "awka south", "ayamelum",
    "dunukofia", "ekwusigo", "idemili north", "idemili south", "ihiala", "njikoka", "nnewi north",
    "nnewi south", "ogbaru", "onitsha north", "onitsha south", "orumba north", "orumba south", "oyi"
  ],
  "bauchi": [
    "alkaleri", "bauchi", "bogoro", "damban", "darazo", "dass", "gamawa", "gamjuwa", "giade",
    "itas/gadau", "jama'are", "katagum", "kirfi", "misau", "ningi", "shira", "tafawa-balewa",
    "toro", "warji", "zaki"
  ],
  "bayelsa": [
    "brass", "ekeremor", "kolokuma-opokuma", "nembe", "ogbia", "sagbama", "southern ijaw",
    "yenagoa"
  ],
  "benue": [
    "ado", "agatu", "apa", "buruku", "gboko", "guma", "gwer east", "gwer west", "katsina- ala",
    "konshisha", "kwande", "logo", "makurdi", "obi", "ogbadibo", "ohimini", "oju", "okpokwu",
    "oturkpo", "tarka", "ukum", "ushongo", "vandeikya"
  ],
  "borno": [
    "abadam", "askira/uba", "bama", "bayo", "biu", "chibok", "damboa", "dikwa", "gubio",
    "guzamala", "gwoza", "hawul", "jere", "kaga", "kala/balge", "konduga", "kukawa",
    "kwaya kusar", "mafa", "magumeri", "maiduguri", "marte", "mobbar", "monguno", "ngala",
    "nganzai", "shani"
  ],
  "cross river": [
    "abi", "akamkpa", "akpabuyo", "bakassi", "bekwarra", "biase", "boki", "calabar municipality",
    "calabar south", "etung", "ikom", "obanliku", "obubra", "obudu", "odukpani", "ogoja", "yakurr",
    "yala"
  ],
  "delta": [
    "aniochan", "aniochas", "bomadi", "burutu", "ethiope west", "ethiopee", "ikanorth", "ikasouth",
    "isokonor", "isokosou", "ndokwa east", "ndokwa west", "okpe", "oshimili north", "oshimili south",
    "patani", "sapele", "udu", "ughelli north", "ughelli south", "ukwuani", "uvwie", "warri north",
    "warri south", "warri south-west"
  ],
  "ebonyi": [
    "abakalik", "afikpo north", "afikpo south", "ebonyi", "ezza north", "ezza south", "ikwo",
    "ishielu", "ivo", "izzi", "ohaozara", "ohaukwu", "onicha"
  ],
  "edo": [
    "akoko edo", "egor", "esan centtral", "esan north east", "esan south east", "esan west",
    "etsako central", "etsako east", "etsako west", "igueben", "ikpoba-okha", "oredo", "orhionmw",
    "ovia north east", "ovia south west", "owan east", "owan west", "uhunmwonde"
  ],
  "ekiti": [
    "ado-ekiti", "efon", "ekiti east", "ekiti south west", "ekiti west", "emure", "gboyin",
    "ido-osi", "ijero", "ikere", "ikole", "ilejemeje", "irepodun-ifelodun", "ise-orun", "moba",
    "oye"
  ],
  "enugu": [
    "aninri", "awgu", "enugu east", "enugu north", "enugusou", "ezeagu", "igbo-eti",
    "igbo-eze north", "igbo-eze south", "isi-uzo", "nkanu east", "nkanu west", "nsukka",
    "oji-river", "udenu", "udi", "uzo-uwani"
  ],
  "gombe": [
    "akko", "balanga", "billiri", "dukku", "funakaye", "gombe", "kaltungo", "kwami", "nafada",
    "shomgom", "yalmatu / deba"
  ],
  "imo": [
    "aboh-mbaise", "ahiazu-mbaise", "ehime-mbano", "ezinihitte mbaise", "ideato north",
    "ideato south", "ihitte-uboma isinweke", "ikeduru", "isiala mbano", "isu", "mbaitoli",
    "ngor-okpala", "njaba", "nkwerre", "nwangele", "obowo", "oguta", "ohaji-egbema", "okigwe",
    "orlu", "orsu", "oru-east", "oru-west", "owerri municipal", "owerri north", "owerri west",
    "unuimo"
  ],
  "jigawa": [
    "auyo", "babura", "biriniwa", "birnin kudu", "buji", "dutse", "gagarawa", "garki", "gumel",
    "guri", "gwaram", "gwiwa", "hadejia", "jahun", "kafin hausa", "kaugama", "kazaure",
    "kirika samma", "kiyawa", "maigatari", "malam mado", "miga", "ringim", "roni", "sule tankarkar",
    "taura", "yankwashi"
  ],
  "kaduna": [
    "birnin gwari", "chikun", "giwa", "igabi", "ikara", "jaba", "jema'a", "kachia", "kaduna north",
    "kaduna south", "kagarko", "kajuru", "kaura", "kauru", "kubau", "kudan", "lere", "makarfi",
    "sabon gari", "sanga", "soba", "zangon kataf", "zaria"
  ],
  "kano": [
    "ajingi", "albasu", "bagwai", "bebeji", "bichi", "bunkure", "dala", "dambatta", "dawakin kudu",
    "dawakin tofa", "doguwa", "fagge", "gabasawa", "garko", "garum mallam", "gaya", "gezawa",
    "gwale", "gwarzo", "kabo", "kano municipal", "karaye", "kibiya", "kiru", "kumbotso", "kunchi",
    "kura", "madobi", "makoda", "minjibir", "nasarawa", "rano", "rimin gado", "rogo", "shanono",
    "sumaila", "takai", "tarauni", "tofa", "tsanyawa", "tundun wada", "ungogo", "warawa", "wudil"
  ],
  "katsina": [
    "bakori", "batagarawa", "batsari", "baure", "bindawa", "charanchi", "dandume", "danja",
    "danmusa", "daura", "dutsi", "dutsin-m", "faskari", "funtua", "ingawa", "jibia", "kafur",
    "kaita", "kankara", "kankiya", "katsina (k)", "kurfi", "kusada", "mai'adua", "malumfashi",
    "mani", "mashi", "matazu", "musawa", "rimi", "sabuwa", "safana", "sandamu", "zango"
  ],
  "kebbi": [
    "aleiro", "arewa", "argungu", "augie", "bagudo", "birnin kebbi", "bunza", "dandi",
    "danko wasagu", "fakai", "gwandu", "jega", "kalgo", "koko/bes", "maiyama", "ngaski", "sakaba",
    "shanga", "suru", "yauri", "zuru"
  ],
  "kogi": [
    "adavi", "ajaokuta", "ankpa", "bassa", "dekina", "ibaji", "idah", "igalamela-odolu", "ijumu",
    "kabba-bunu", "koton-karfe", "lokoja", "mopa-muro", "ofu", "ogori magongo", "okehi", "okene",
    "olamaboro", "omala", "yagba east", "yagba west"
  ],
  "kwara": [
    "asa", "baruten", "edu", "ekiti", "ifelodun", "ilorin east", "ilorin south", "ilorin west",
    "irepodun", "isin", "kaiama", "moro", "offa", "oke-ero", "oyun", "pategi"
  ],
  "lagos": [
    "agege", "ajeromi/ifelodun", "alimosho", "amuwo odofin", "apapa", "badagary", "epe", "eti-osa",
    "ibeju/lekki", "ifako/ijaye", "ikeja", "ikorodu", "kosofe", "lagos island", "lagos mainland",
    "mushin", "ojo", "oshodi/isolo", "shomolu", "surulere"
  ],
  "nassarawa": [
    "akwanga", "awe", "doma", "karu", "keana", "keffi", "kokona", "lafia", "nasarawa",
    "nassarawa egon", "obi", "toto", "wamba"
  ],
  "niger": [
    "agaie", "agwara", "bida", "borgu", "bosso", "chanchaga", "edati", "gbako", "gurara", "katcha",
    "kontogur", "lapai", "lavun", "magama", "mariga", "mashegu", "mokwa", "muya", "paikoro", "rafi",
    "rijau", "shiroro", "suleja", "tafa", "wushishi"
  ],
  "ogun": [
    "abeokuta north", "abeokuta south", "ado odo-ota", "egbado north", "egbado south", "ewekoro",
    "ifo", "ijebu east", "ijebu north", "ijebu north-east", "ijebu-ode", "ikenne", "imeko-afon",
    "ipokia", "obafemi-owode", "odeda", "odogbolu", "ogun waterside", "remo north", "shagamu"
  ],
  "ondo": [
    "akoko north-east", "akoko south-east", "akoko south-west", "akoko north west", "akure north",
    "akure south", "ese-odo", "idanre", "ifedore", "ilaje", "ileoluji/okeigbo", "irele", "odigbo",
    "okitipupa", "ondo east", "ondo west", "ose", "owo"
  ],
  "osun": [
    "atakumosa east", "atakumosa west", "ayedaade", "ayedire", "boluwaduro", "boripe", "ede north",
    "ede south", "egbedore", "ejigbo", "ife east", "ife north", "ife south", "ife central",
    "ifedayo", "ifelodun", "ila", "ilesha east", "ilesha west", "irepodun", "irewole", "isokan",
    "iwo", "obokun", "odo otin", "ola-oluwa", "olorunda", "oriade", "orolu", "osogbo"
  ],
  "oyo": [
    "afijio", "akinyele", "atiba", "atisbo", "egbeda", "ibadan north", "ibadan north east",
    "ibadan north west", "ibadan south east", "ibadan south west", "ibarapa central", "ibarapa east",
    "ibarapa north", "ido", "irepo", "iseyin", "itesiwaju", "iwajowa", "kajola", "lagelu",
    "ogbomosho north", "ogbomosho south", "ogo-oluwa", "olorunsogo", "oluyole", "ona-ara", "orelope",
    "ori-ire", "oyo east", "oyo west", "saki east", "saki west", "surulere"
  ],
  "plateau": [
    "barkin ladi", "bassa", "bokkos", "jos east", "jos north", "jos south", "kanam", "kanke",
    "langtang north", "langtang south", "mangu", "mikang", "pankshin", "qua'anpa", "riyom",
    "shendam", "wase"
  ],
  "rivers": [
    "abua/odu", "ahoada east", "ahoada west", "akukutor", "andoni/odual", "asari-toru", "bonny",
    "degema", "eleme", "emuoha", "etche", "gokana", "ikwerre", "khana", "obio/akpor",
    "ogba/egbema/andoni", "ogu/bolo", "okrika", "omumma", "opobo/nkoro", "oyigbo", "port harcourt",
    "tai"
  ],
  "sokoto": [
    "binji", "bodinga", "dange-shuni", "gada", "goronyo", "gudu", "gwadabaw", "illela", "isa",
    "kebbe", "kware", "rabah", "sabon birni", "shagari", "silame", "sokoto north", "sokoto south",
    "tambawal", "tangazar", "tureta", "wamakko", "wurno", "yabo"
  ],
  "taraba": [
    "ardo-kola", "bali", "donga", "gashaka", "gassol", "ibi", "jalingo", "karim-lamido", "kurmi",
    "lau", "sardauna", "takum", "ussa", "wukari", "yorro", "zing"
  ],
  "yobe": [
    "bade", "borsari", "damaturu", "fika", "fune", "geidam", "gujba", "gulani", "jakusko",
    "karasuwa", "machina", "nangere", "nguru", "potiskum", "tarmuwa", "yunusari", "yusufari"
  ],
  "zamfara": [
    "anka", "bakura", "birnin magaji", "bukkuyum", "bungudu", "gummi", "gusau", "kaura-namoda",
    "maradun", "maru", "shinkafi", "talata-mafara", "tsafe", "zurmi"
  ]
}
 