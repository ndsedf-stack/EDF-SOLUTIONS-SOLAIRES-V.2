import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  console.log("Initialisation des 30 leads...");

  const { data: leads, error } = await supabase
    .from("email_leads")
    .select("id, email_step, last_email_sent_at, next_email_scheduled_at")
    .is("next_email_scheduled_at", null)
    .gte("created_at", "2026-09-21T00:00:00Z");

  if (error) { console.error("Erreur:", error.message); return; }
  console.log(`${leads.length} leads à traiter`);

  const now = new Date().toISOString();
  const ids = leads.map(l => l.id);

  const { error: errUpdate } = await supabase
    .from("email_leads")
    .update({ next_email_scheduled_at: now })
    .in("id", ids);

  if (errUpdate) {
    console.error("Erreur update:", errUpdate.message);
  } else {
    console.log(`✅ ${leads.length} leads schedulés pour maintenant`);
  }

  // Vérification
  const { data: check } = await supabase
    .from("email_leads")
    .select("id, next_email_scheduled_at")
    .in("id", ids);

  const scheduled = (check || []).filter(l => l.next_email_scheduled_at);
  console.log(`Vérification: ${scheduled.length}/${ids.length} leads ont une date`);
}

run();
