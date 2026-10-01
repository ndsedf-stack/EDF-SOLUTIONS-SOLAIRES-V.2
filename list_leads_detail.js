import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  // Récupérer tous les leads avec leurs infos clients
  const { data: leads, error } = await supabase
    .from("email_leads")
    .select(`
      id, client_id, email_step, next_email_scheduled_at, last_email_sent_at, created_at, source,
      clients!inner(id, first_name, last_name, email, phone)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) { console.error("Error:", error.message); return; }

  console.log(`\n=== LEADS IMPORTÉS (${leads.length}) ===`);
  leads.forEach((l, i) => {
    const client = Array.isArray(l.clients) ? l.clients[0] : l.clients;
    console.log(`${i+1}. ${client?.first_name || ''} ${client?.last_name || ''} | ${client?.email || 'no email'} | step:${l.email_step} | next_scheduled:${l.next_email_scheduled_at?.slice(0,10) || 'NULL'} | created:${l.created_at?.slice(0,10)}`);
  });

  // Vérifier les leads qui n'ont pas encore reçu l'email J0 (email_step=1, last_email_sent_at récent)
  const noEmail = leads.filter(l => !l.next_email_scheduled_at);
  console.log(`\n=== LEADS SANS PLANIFICATION (${noEmail.length}) ===`);
  noEmail.slice(0, 10).forEach(l => {
    const client = Array.isArray(l.clients) ? l.clients[0] : l.clients;
    console.log(`  - ${client?.first_name || ''} ${client?.last_name || ''} | ${client?.email || 'no email'}`);
  });
  if (noEmail.length > 10) console.log(`  ... et ${noEmail.length - 10} autres`);
}

run();
