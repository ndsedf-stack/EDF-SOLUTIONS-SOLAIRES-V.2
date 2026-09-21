import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";

async function run() {
  console.log("Fetching REST schema definition...");

  try {
    const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`;
    const response = await fetch(url);
    console.log("Status:", response.status);
    const data = await response.json();
    
    if (data && data.paths) {
      const paths = Object.keys(data.paths);
      console.log(`Found ${paths.length} paths.`);
      const rpcs = paths.filter(p => p.startsWith("/rpc/"));
      console.log("Exposed RPCs:", rpcs);
    } else {
      console.log("No paths found. Response:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
