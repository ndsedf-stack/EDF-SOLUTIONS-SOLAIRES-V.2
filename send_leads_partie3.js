import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  console.log("=== INITIALISATION ET ENVOI DES 30 LEADS (21 sept) ===\n");

  // 1. Récupérer tous les leads du 21 sept avec next_email_scheduled_at = null
  const { data: leads, error } = await supabase
    .from("email_leads")
    .select("id, client_id, email_step, last_email_sent_at, next_email_scheduled_at, created_at")
    .is("next_email_scheduled_at", null)
    .gte("created_at", "2026-09-21T00:00:00Z");

  if (error) { console.error("Erreur lecture leads:", error.message); return; }
  console.log(`Leads à initialiser: ${leads.length}`);

  const now = new Date();

  // 2. Séparer les leads qui ont déjà reçu un email de ceux qui n'en ont pas eu
  const neverEmailed = leads.filter(l => !l.last_email_sent_at);
  const alreadyEmailed = leads.filter(l => l.last_email_sent_at);

  console.log(`  - Jamais emailés (J0 à envoyer): ${neverEmailed.length}`);
  console.log(`  - Déjà emailés (relance prochaine): ${alreadyEmailed.length}`);

  // 3. Pour ceux jamais emailés → next_email_scheduled_at = maintenant (J0 immédiat)
  if (neverEmailed.length > 0) {
    const ids = neverEmailed.map(l => l.id);
    const { error: errUpdate1 } = await supabase
      .from("email_leads")
      .update({ 
        next_email_scheduled_at: now.toISOString(),
        email_step: 1
      })
      .in("id", ids);

    if (errUpdate1) {
      console.error("Erreur update leads jamais emailés:", errUpdate1.message);
    } else {
      console.log(`✅ ${neverEmailed.length} leads initialisés pour envoi J0 immédiat`);
    }
  }

  // 4. Pour ceux déjà emailés → next_email_scheduled_at = maintenant (forcer la prochaine relance)
  if (alreadyEmailed.length > 0) {
    const ids = alreadyEmailed.map(l => l.id);
    const { error: errUpdate2 } = await supabase
      .from("email_leads")
      .update({ 
        next_email_scheduled_at: now.toISOString()
      })
      .in("id", ids);

    if (errUpdate2) {
      console.error("Erreur update leads déjà emailés:", errUpdate2.message);
    } else {
      console.log(`✅ ${alreadyEmailed.length} leads initialisés pour relance immédiate`);
    }
  }

  // 5. Déclencher le moteur d'envoi send_email_engine
  console.log("\nDéclenchement du moteur d'envoi...");
  try {
    const res = await axios.post(
      `${supabaseUrl}/functions/v1/send_email_engine`,
      {},
      { headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" } }
    );
    console.log("✅ Moteur déclenché:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error("❌ Erreur moteur:", err.response.status, err.response.data);
    } else {
      console.error("❌ Erreur réseau:", err.message);
    }
  }

  // 6. Vérification finale
  console.log("\n=== VÉRIFICATION FINALE ===");
  const { data: finalCheck } = await supabase
    .from("email_leads")
    .select("id, email_step, next_email_scheduled_at, last_email_sent_at")
    .gte("created_at", "2026-09-21T00:00:00Z");

  const nowScheduled = (finalCheck || []).filter(l => l.next_email_scheduled_at);
  const stillNull = (finalCheck || []).filter(l => !l.next_email_scheduled_at);
  console.log(`Leads avec date planifiée: ${nowScheduled.length}`);
  console.log(`Leads encore sans planification: ${stillNull.length}`);

  // Email queue - compter les nouveaux pending
  const { data: queueCount } = await supabase
    .from("email_queue")
    .select("id, status, email_type")
    .eq("status", "pending");
  console.log(`\nEmails pending dans la queue: ${(queueCount || []).length}`);

  const byType = {};
  (queueCount || []).forEach(q => {
    byType[q.email_type] = (byType[q.email_type] || 0) + 1;
  });
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

run();
