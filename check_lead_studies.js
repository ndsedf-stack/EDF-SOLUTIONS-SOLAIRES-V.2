import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking if imported leads have studies...");

  // 1. Fetch clients created today
  const { data: newClients, error: errClients } = await supabase
    .from("clients")
    .select("id, email, created_at")
    .gte("created_at", "2026-07-02T00:00:00Z");

  if (errClients) {
    console.error("Error fetching today's clients:", errClients);
    return;
  }

  const clientIds = newClients.map(c => c.id);
  console.log(`Found ${clientIds.length} clients created today.`);

  // 2. Query studies for these clients
  const { data: studies, error: errStudies } = await supabase
    .from("studies")
    .select("id, client_id, status")
    .in("client_id", clientIds);

  if (errStudies) {
    console.error("Error fetching studies:", errStudies.message);
  } else {
    console.log(`Found ${studies.length} studies for these clients.`);
    console.table(studies.slice(0, 10));
  }
}

run();
