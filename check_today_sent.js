import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking emails sent/logged today (2026-07-02)...");

  // 1. Query email_queue for sent_at >= today UTC
  const { data: queueSentToday, error: errQueue } = await supabase
    .from("email_queue")
    .select("id, client_id, email_type, status, scheduled_for, sent_at")
    .gte("sent_at", "2026-07-02T00:00:00Z");

  if (errQueue) {
    console.error("Error email_queue:", errQueue.message);
  } else {
    console.log(`Emails sent today in email_queue: ${queueSentToday.length}`);
    if (queueSentToday.length > 0) {
      console.table(queueSentToday);
    }
  }

  // 2. Query email_logs for created_at >= today UTC
  const { data: logsToday, error: errLogs } = await supabase
    .from("email_logs")
    .select("id, client_id, client_email, success, created_at, error_message")
    .gte("created_at", "2026-07-02T00:00:00Z");

  if (errLogs) {
    console.error("Error email_logs:", errLogs.message);
  } else {
    console.log(`Logs created today in email_logs: ${logsToday.length}`);
    if (logsToday.length > 0) {
      console.table(logsToday.slice(0, 20));
    }
  }
}

run();
