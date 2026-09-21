import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking information_schema.triggers...");

  const { data: triggers, error: errTrig } = await supabase
    .from("information_schema.triggers")
    .select("trigger_name, event_object_table, action_statement, action_timing")
    .limit(100);

  if (errTrig) {
    console.error("Error triggers:", errTrig.message);
  } else {
    console.log(`Found ${triggers.length} triggers:`);
    console.table(triggers);
  }
}

run();
