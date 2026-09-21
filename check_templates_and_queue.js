import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking email templates...");
  const { data: templates, error: errTpl } = await supabase
    .from("email_templates")
    .select("template_key, subject");
  
  if (errTpl) {
    console.error("Error templates:", errTpl.message);
  } else {
    console.log("Exposed templates:");
    console.table(templates);
  }

  console.log("Checking last 15 email queue records...");
  const { data: queue, error: errQueue } = await supabase
    .from("email_queue")
    .select("id, client_id, email_type, status, scheduled_for, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(15);

  if (errQueue) {
    console.error("Error queue:", errQueue.message);
  } else {
    console.log("Last 15 queue records:");
    console.table(queue);
  }
}

run();
