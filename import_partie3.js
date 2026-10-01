import axios from "axios";

const EDGE_FUNCTION_URL = "https://ugwqfvwclwctzgtxcakp.supabase.co/functions/v1/import-contacts-batch";

// 30 leads extraits des 3 captures d'écran - Partie 3
const contacts = [
  // === IMAGE 1 (10 leads) ===
  { nom: "HUTCHINSON Claudia",    email: "cldasilva55@hotmail.com",        telephone: "0612448856" },
  { nom: "NOSBE PROTAT Vanessa",  email: "vanessa-protat@hotmail.fr",      telephone: "0672669020" },
  { nom: "DEQUET Ludovic",        email: "triskele01@gmail.com",           telephone: "0660951975" },
  { nom: "COURAUT Lyonel",        email: "lyonel.kouro@gmail.com",         telephone: "0660119950" },
  { nom: "ARTS Emile",            email: "suna19890699@gmail.com",         telephone: "0662985186" },
  { nom: "CUCHET Olivier",        email: "ol.cuchet@gmail.com",            telephone: "0616095419" },
  { nom: "SCHIVO Gerard",         email: "hostellerieduloup@gmail.com",    telephone: "0771699554" },
  { nom: "GUELLIM Lotfi",         email: "lotgue1@gmail.com",              telephone: "0665910203" },
  { nom: "ROMIEU Pascal",         email: "romieup23@gmail.com",            telephone: "0610462341" },
  { nom: "BALLESTER Lionel",      email: "ballesterlionel@yahoo.fr",       telephone: "0769916412" },

  // === IMAGE 2 (10 leads) ===
  { nom: "ABELA Jacques",         email: "jabela@wanadoo.fr",              telephone: "0603443362" },
  { nom: "SCHNEIDER Peoude",      email: "ad.schneider@me.com",            telephone: "0670206035" },
  { nom: "TOUMELIN Loic",         email: "loicletoumelin06@gmail.com",     telephone: "0607037444" },
  { nom: "STELLA",                email: "sakura.studio@outlook.fr",       telephone: "0650300170" },
  { nom: "GEOFFROY Kaele",        email: "kaelegeoffroy@hotmail.fr",       telephone: "0649829955" },
  { nom: "PIRREAU Jean",          email: "pirreau.jean@gmail.com",         telephone: "0625325368" },
  { nom: "CLOUS Francois",        email: "francoismegane2012@gmail.com",   telephone: "0634643613" },
  { nom: "DEMAREST Michel",       email: "michel.demarest1947@gmail.com",  telephone: "0685531975" },
  { nom: "BERTHEOL Francoise",    email: "francoise.bertheol@laposte.net", telephone: "0677116011" },
  { nom: "PAULETTE",              email: "sylvaindiscours@hotmail.fr",     telephone: "0768882568" },

  // === IMAGE 3 (10 leads) ===
  { nom: "RABOUILLE Marianne",    email: "marianne.rabouille@gmail.com",   telephone: "0682835242" },
  { nom: "CAVALLERA Fabrice",     email: "fcava@orange.fr",                telephone: "0673730235" },
  { nom: "GASTALDY Georges",      email: "ggastaldy@yahoo.fr",             telephone: "0607867676" },
  { nom: "LE LION Ruban",         email: "krishlion@msn.com",              telephone: "0671717023" },
  { nom: "BOF Ben",               email: "benji.bof@gmail.com",            telephone: "0658311096" },
  { nom: "CAROL Moreno",          email: "albert.moreno@wanadoo.fr",       telephone: "0668572412" },
  { nom: "VERMOREL Frederic",     email: "fred.vermorel@icloud.com",       telephone: "0611121708" },
  { nom: "FARALDO Cedric",        email: "amcsarl0721@gmail.com",          telephone: "0661781682" },
  { nom: "AILLAUD Gaston",        email: "aillaud.gaston@gmail.com",       telephone: "0684339889" },
  { nom: "DECHAVANNE Alfred",     email: "dechavanne.alfred@gmail.com",    telephone: "0652832519" },
];

async function run() {
  console.log(`\n🚀 Import + envoi de ${contacts.length} leads (Partie 3)`);
  console.log("=".repeat(60));

  // Envoyer en 1 seul batch
  try {
    const res = await axios.post(
      EDGE_FUNCTION_URL,
      { contacts },
      { headers: { "Content-Type": "application/json" }, timeout: 60000 }
    );

    const data = res.data;
    console.log("\n✅ RÉSULTAT:");
    console.log(`  Importés  : ${data.imported}`);
    console.log(`  Emails envoyés : ${data.emails_sent}`);
    console.log(`  Message   : ${data.message}`);

    if (data.details) {
      console.log("\nDétails:");
      (data.details || []).forEach(d => {
        console.log(`  - ${d.email}: ${d.status || d.error || 'ok'}`);
      });
    }

  } catch (err) {
    if (err.response) {
      console.error(`\n❌ Erreur HTTP ${err.response.status}:`, err.response.data);
    } else {
      console.error(`\n❌ Erreur réseau:`, err.message);
    }
  }
}

run();
