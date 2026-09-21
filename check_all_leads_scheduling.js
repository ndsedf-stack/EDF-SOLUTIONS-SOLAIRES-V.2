import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Analyzing next_email_scheduled_at in email_leads...");

  // 1. Count total leads
  const { count: totalCount, error: errTotal } = await supabase
    .from("email_leads")
    .select("*", { count: "exact", head: true });

  // 2. Count null next_email_scheduled_at
  const { count: nullCount, error: errNull } = await supabase
    .from("email_leads")
    .select("*", { count: "exact", head: true })
    .is("next_email_scheduled_at", null);

  // 3. Get first 10 non-null records
  const { data: nonNullLeads, error: errNonNull } = await supabase
    .from("email_leads")
    .select("id, client_id, email_step, last_email_sent_at, next_email_scheduled_at")
    .not("next_email_scheduled_at", "is", null)
    .limit(10);

  console.log(`Total email_leads: ${totalCount}`);
  console.log(`Null next_email_scheduled_at count: ${nullCount}`);
  console.log(`Non-null next_email_scheduled_at count: ${totalCount - nullCount}`);

  if (nonNullLeads && nonNullLeads.length > 0) {
    console.log("Sample non-null elements:");
    console.table(nonNullLeads);
  } else {
    console.log("No non-null records found.");
  }
}

run();
