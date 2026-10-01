import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  // Récupérer les IDs des 30 leads (tous créés le 21 sept)
  const { data: leads, error } = await supabase
    .from("email_leads")
    .select("id, next_email_scheduled_at, email_step, last_email_sent_at")
    .gte("created_at", "2026-09-21T00:00:00Z");

  if (error) { console.error("Erreur:", error.message); return; }
  console.log(`Leads trouvés: ${leads.length}`);
  
  const withDate = leads.filter(l => l.next_email_scheduled_at);
  const withoutDate = leads.filter(l => !l.next_email_scheduled_at);
  console.log(`  - Avec next_email_scheduled_at: ${withDate.length}`);
  console.log(`  - Sans next_email_scheduled_at: ${withoutDate.length}`);

  // Essayer de mettre à jour 1 par 1 pour identifier l'erreur
  if (withoutDate.length > 0) {
    const testLead = withoutDate[0];
    const { error: singleErr } = await supabase
      .from("email_leads")
      .update({ next_email_scheduled_at: new Date().toISOString() })
      .eq("id", testLead.id)
      .select();
    
    if (singleErr) {
      console.error("Erreur update unique:", singleErr.message, singleErr.code, singleErr.details);
    } else {
      // Vérifier si l'update a marché
      const { data: verify } = await supabase
        .from("email_leads")
        .select("id, next_email_scheduled_at")
        .eq("id", testLead.id)
        .single();
      console.log("Résultat test update:", verify);
    }
  }
}

run();
