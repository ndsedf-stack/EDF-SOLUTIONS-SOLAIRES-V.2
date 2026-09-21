import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Counting tables...");

  const { count: logCount, error: errLogs } = await supabase
    .from("email_logs")
    .select("*", { count: "exact", head: true });

  if (errLogs) {
    console.error("Error logs count:", errLogs.message);
  } else {
    console.log("email_logs count:", logCount);
  }

  const { data: queueCounts, error: errQueue } = await supabase
    .from("email_queue")
    .select("status");

  if (errQueue) {
    console.error("Error queue count:", errQueue.message);
  } else {
    const counts = {};
    queueCounts.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    console.log("email_queue status counts:", counts);
  }
}

run();
