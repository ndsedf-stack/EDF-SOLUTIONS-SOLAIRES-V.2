import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  console.log("Searching for studies linked to ndsedf@gmail.com...");

  // Search clients
  const { data: clients } = await supabase
    .from("clients")
    .select("id, email, first_name")
    .eq("email", "ndsedf@gmail.com");

  console.log("Clients matching email:", clients);

  if (clients && clients.length > 0) {
     const clientIds = clients.map(c => c.id);
     const { data: studies } = await supabase
       .from("studies")
       .select("id, client_id, status")
       .in("client_id", clientIds);
     console.log("Studies matching client:", studies);
  }
}

run();
