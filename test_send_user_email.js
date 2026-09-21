import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  console.log("Preparing test email sending...");

  const testEmail = "ndsedf@gmail.com";

  // 1. Check if client already exists
  let clientId;
  const { data: clients, error: errC } = await supabase
    .from("clients")
    .select("id")
    .eq("email", testEmail)
    .limit(1);

  if (errC) {
     console.error("Error finding client:", errC.message);
     return;
  }

  if (clients && clients.length > 0) {
     clientId = clients[0].id;
     console.log(`Found existing client for ${testEmail}: ${clientId}`);
  } else {
     // Create a test client
     console.log(`Creating test client for ${testEmail}...`);
     const { data: newC, error: errCreateC } = await supabase
       .from("clients")
       .insert([{
          first_name: "Nicolas",
          last_name: "Di Stefano",
          email: testEmail
       }])
       .select();

     if (errCreateC) {
        console.error("Error creating client:", errCreateC.message);
        return;
     }
     clientId = newC[0].id;
     console.log(`Created client ID: ${clientId}`);
  }

  // 2. Fetch any study ID to satisfy foreign key constraint
  const { data: studies, error: errS } = await supabase
    .from("studies")
    .select("id")
    .limit(1);

  if (errS || !studies || studies.length === 0) {
     console.error("Error finding study ID:", errS?.message || "No studies in DB");
     return;
  }
  const studyId = studies[0].id;
  console.log(`Using study ID for foreign key constraint: ${studyId}`);

  // 3. Insert into email_queue with payload = {}
  console.log("Inserting test email into email_queue...");
  const { data: queueItem, error: errQ } = await supabase
    .from("email_queue")
    .insert([{
       client_id: clientId,
       study_id: studyId,
       email_type: "test_manual_sending",
       scheduled_for: new Date().toISOString(),
       status: "pending",
       payload: {}
    }])
    .select();

  if (errQ) {
     console.error("Error inserting in queue:", errQ.message);
     return;
  }
  const qId = queueItem[0].id;
  console.log("Created queue item ID:", qId);

  // 4. Trigger send_email_resend_instrumented function
  const functionUrl = `${supabaseUrl}/functions/v1/send_email_resend_instrumented`;
  console.log(`Invoking Edge Function to trigger send... URL: ${functionUrl}`);
  try {
     const res = await axios.post(functionUrl, {}, {
        headers: {
           "Authorization": `Bearer ${key}`,
           "Content-Type": "application/json"
        }
     });
     console.log("Edge Function result:", res.status, JSON.stringify(res.data, null, 2));
  } catch (err) {
     if (err.response) {
       console.log(`❌ Edge function failed (HTTP ${err.response.status}):`, err.response.data);
     } else {
       console.log(`❌ Edge function failed:`, err.message);
     }
  }

  // 5. Let's see the queue status of the item
  const { data: queueCheck } = await supabase
    .from("email_queue")
    .select("id, status, sent_at")
    .eq("id", qId);
  console.log("Queue item status after run:", queueCheck);
}

run();
