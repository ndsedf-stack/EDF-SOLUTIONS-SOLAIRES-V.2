import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking email_queue for today's clients...");

  // 1. Fetch clients created today (Paris time, let's say after 2026-07-02T00:00:00Z)
  const { data: newClients, error: errClients } = await supabase
    .from("clients")
    .select("id, email, first_name, last_name, created_at")
    .gte("created_at", "2026-07-02T00:00:00Z");

  if (errClients) {
    console.error("Error fetching today's clients:", errClients);
    return;
  }

  console.log(`Found ${newClients.length} clients created today.`);

  if (newClients.length === 0) return;

  const clientIds = newClients.map(c => c.id);

  // 2. Fetch email_queue records for these clientIds
  const { data: queueRecords, error: errQueue } = await supabase
    .from("email_queue")
    .select("id, client_id, email_type, status, scheduled_for, created_at, sent_at")
    .in("client_id", clientIds);

  if (errQueue) {
    console.error("Error fetching email_queue for today's clients:", errQueue);
  } else {
    console.log(`Found ${queueRecords.length} queue records for today's clients.`);
    console.table(queueRecords.slice(0, 20));

    // Stats by status
    const statusCounts = {};
    queueRecords.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    console.log("Status distribution:", statusCounts);

    // Stats by email_type
    const typeCounts = {};
    queueRecords.forEach(r => {
      typeCounts[r.email_type] = (typeCounts[r.email_type] || 0) + 1;
    });
    console.log("Email types distribution:", typeCounts);
  }
}

run();
