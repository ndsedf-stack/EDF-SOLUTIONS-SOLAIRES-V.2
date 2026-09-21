import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching schema entities from PostgREST...");

  // PostgREST exposes the openapi spec under '/' without '/rest/v1/' in modern Supabase, 
  // but let's try direct REST requests to see what is readable in public.
  const fields = [
    "cron_jobs", "cron_job_run_details", "decision_logs", "email_queue", 
    "email_leads", "email_logs", "email_templates", "app_config", "system_settings"
  ];

  for (const f of fields) {
     console.log(`Checking table or view: ${f}`);
     const { data, error } = await supabase.from(f).select("*").limit(1);
     if (error) {
       console.log(`❌ ${f}: ${error.message}`);
     } else {
       console.log(`✅ ${f} exists and is readable! Sample keys:`, Object.keys(data[0] || {}));
     }
  }
}

run();
