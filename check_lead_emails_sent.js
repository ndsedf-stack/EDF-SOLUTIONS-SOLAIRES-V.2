import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking email logs for imported lead addresses...");

  // Muller Pierrette
  const emailToTest = "mpmuller@orange.fr";
  
  const { data: logs, error: errLogs } = await supabase
    .from("email_logs")
    .select("*")
    .eq("client_email", emailToTest);

  if (errLogs) {
    console.error("Error logs:", errLogs.message);
  } else {
    console.log(`Logs for ${emailToTest}:`, logs);
  }

  // Check any emails in email_logs matching today's format or recent emails
  const { data: recentLogs, error: errRecent } = await supabase
    .from("email_logs")
    .select("client_email, success, created_at, response_body")
    .order("created_at", { ascending: false })
    .limit(10);

  if (errRecent) {
     console.error("Error recent logs:", errRecent.message);
  } else {
     console.log("Recent email logs:");
     console.table(recentLogs);
  }
}

run();
