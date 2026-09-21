import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking email_leads columns...");

  const { data, error } = await supabase
    .from("email_leads")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching email_leads:", error.message);
  } else {
    console.log("Keys found in email_leads row:");
    console.log(Object.keys(data[0] || {}));
    console.log("Sample lead row:", data[0]);
  }
}

run();
