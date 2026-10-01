import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  // Total leads dans email_leads
  const { data: allLeads, error } = await supabase
    .from("email_leads")
    .select("id, client_id, email_step, next_email_scheduled_at, last_email_sent_at, created_at, source")
    .order("created_at", { ascending: false });

  if (error) { console.error("Error:", error.message); return; }

  console.log(`Total leads in email_leads: ${allLeads.length}`);

  // Grouper par date
  const byDate = {};
  allLeads.forEach(l => {
    const d = l.created_at?.slice(0, 10);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(l);
  });

  console.log("\nLeads by creation date:");
  Object.entries(byDate).sort().forEach(([date, leads]) => {
    console.log(`  ${date}: ${leads.length} leads`);
  });

  // Email_queue: vérifier combien d'emails ont été envoyés
  const { data: queue } = await supabase
    .from("email_queue")
    .select("id, status, email_type, scheduled_for, sent_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  console.log(`\nLast 20 items in email_queue:`);
  (queue || []).forEach(q => {
    console.log(`  [${q.status}] ${q.email_type} - scheduled: ${q.scheduled_for?.slice(0,10)} - sent: ${q.sent_at?.slice(0,10) || 'not sent'}`);
  });

  // Leads avec next_email_scheduled_at null
  const nullSchedule = allLeads.filter(l => !l.next_email_scheduled_at);
  console.log(`\nLeads with null next_email_scheduled_at: ${nullSchedule.length}`);

  // Leads prêts à recevoir email (scheduled <= now)
  const now = new Date().toISOString();
  const ready = allLeads.filter(l => l.next_email_scheduled_at && l.next_email_scheduled_at <= now);
  console.log(`Leads ready to receive email (scheduled <= now): ${ready.length}`);
}

run();
