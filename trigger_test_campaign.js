import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  console.log("Selecting a test lead from email_leads...");

  const { data: leads, error: errLeads } = await supabase
    .from("email_leads")
    .select("id, client_id, email_step, next_email_scheduled_at, last_email_sent_at, source")
    .eq("email_step", 1)
    .limit(1);

  if (errLeads || !leads || leads.length === 0) {
     console.error("No test lead found:", errLeads?.message || "empty");
     return;
  }

  const testLead = leads[0];
  console.log("Selected test lead:", testLead);

  // Update its next_email_scheduled_at to now
  const now = new Date().toISOString();
  console.log(`Updating next_email_scheduled_at to ${now}...`);
  const { data: updated, error: errUpdate } = await supabase
    .from("email_leads")
    .update({ next_email_scheduled_at: now })
    .eq("id", testLead.id)
    .select();

  if (errUpdate) {
     console.error("Error updating lead schedule:", errUpdate.message);
     return;
  }

  console.log("Updated lead:", updated);

  // Invoke send_email_engine Edge function
  const functionUrl = `${supabaseUrl}/functions/v1/send_email_engine`;
  console.log("Invoking Edge function send_email_engine...");
  try {
     const res = await axios.post(functionUrl, {}, {
        headers: {
           "Authorization": `Bearer ${key}`,
           "Content-Type": "application/json"
        }
     });
     console.log("Edge Function response:", res.status, JSON.stringify(res.data, null, 2));
  } catch (err) {
     if (err.response) {
       console.log(`❌ Edge function failed (HTTP ${err.response.status}):`, err.response.data);
     } else {
       console.log(`❌ Edge function failed:`, err.message);
     }
  }

  // Check the lead status again
  const { data: leadCheck } = await supabase
    .from("email_leads")
    .select("*")
    .eq("id", testLead.id);
  console.log("Test lead after Edge Function run:", leadCheck);

  // Restore next_email_scheduled_at to null so we don't mess up data if we don't want to
  const { error: errRestore } = await supabase
    .from("email_leads")
    .update({ next_email_scheduled_at: null })
    .eq("id", testLead.id);
  if (errRestore) console.log("Failed to restore test lead schedule to null");
}

run();
