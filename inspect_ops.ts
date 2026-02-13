
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function inspect() {
 console.log("Inspecting studies/dossiers/projects table name...");
 // Guessing table name 'studies' based on code usage
 const { data: studiesData, error: studiesError } = await supabase
   .from("studies") // Try 'studies' first
   .select("id, created_at, status, archived")
   .limit(1);

  if (studiesError) {
    console.log("Could not find 'studies' table, trying 'dossiers'...");
    // Try 'dossiers' if studies fails
     const { data: dossiersData, error: dossiersError } = await supabase
      .from("dossiers")
      .select("id, created_at, status") 
      .limit(1);
      
      if (dossiersError) {
        console.error("Could not find 'dossiers' either.");
      } else {
        console.log("Found 'dossiers' table. Keys:", Object.keys(dossiersData[0]));
      }
  } else {
     console.log("Found 'studies' table. Keys:", Object.keys(studiesData[0]));
     console.log("Sample study:", studiesData[0]);
  }

  console.log("Attempting join ops_snapshot -> studies...");
  const { data: joinData, error: joinError } = await supabase
    .from("ops_snapshot")
    .select("*, studies!inner(created_at, status)") // Assuming FK is set up
    .limit(1);

  if (joinError) {
    console.error("Join Ops->Studies warning/error:", joinError.message);
  } else {
    console.log("Join successful!");
    console.log("Joined data sample:", JSON.stringify(joinData[0], null, 2));
  }
}

inspect();
