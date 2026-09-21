import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, key);

async function run() {
  console.log("Cleaning up any existing test records first...");
  
  // 1. Clean up queue for our test_manual_sending
  const { error: errCleanupQ } = await supabase
    .from("email_queue")
    .delete()
    .eq("email_type", "test_manual_sending");
  if (errCleanupQ) console.warn("Cleanup queue warning:", errCleanupQ.message);

  // 2. Clean up template
  const { error: errCleanupT } = await supabase
    .from("email_templates")
    .delete()
    .eq("template_key", "test_manual_sending");
  if (errCleanupT) console.warn("Cleanup template warning:", errCleanupT.message);

  console.log("Creating temporary template 'test_manual_sending' without 'name' column...");
  // Try to insert template
  const { data: tpl, error: errT } = await supabase
    .from("email_templates")
    .insert([{
       template_key: "test_manual_sending",
       subject: "Test de réception - EDF Solutions",
       body_html: "<p>Bonjour {{first_name}},</p><p>Ceci est un e-mail de test envoyé pour valider le bon fonctionnement du moteur d'envoi de leads.</p><p>Nicolas Di Stefano</p>",
    }])
    .select();

  if (errT) {
     console.error("❌ Error inserting template:", errT.message);
     return;
  }
  console.log("Template created:", tpl);

  const testEmail = "ndsedf@gmail.com";

  // Get Client
  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("email", testEmail);
  const clientId = clients[0].id;

  // Get Study
  const { data: studies } = await supabase
    .from("studies")
    .select("id")
    .limit(1);
  const studyId = studies[0].id;

  // Insert Queue Item
  console.log("Inserting queue item...");
  const { data: queueItem, error: errQ } = await supabase
    .from("email_queue")
    .insert([{
       client_id: clientId,
       study_id: studyId,
       email_type: "test_manual_sending",
       scheduled_for: new Date(Date.now() - 1000 * 60).toISOString(), // 1 minute in the past
       status: "pending",
       payload: {}
    }])
    .select();

  if (errQ) {
     console.error("Error inserting queue item:", errQ.message);
     return;
  }
  const qId = queueItem[0].id;
  console.log("Created queue item ID:", qId);

  // Trigger send_email_resend_instrumented
  const functionUrl = `${supabaseUrl}/functions/v1/send_email_resend_instrumented`;
  console.log(`Invoking Edge Function: ${functionUrl}`);
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

  // Check queue status
  const { data: finalStatus } = await supabase
    .from("email_queue")
    .select("id, status, sent_at, last_error")
    .eq("id", qId);
  console.log("Queue item status in DB after run:", finalStatus);

  // Clean up
  console.log("Cleaning up temporary records...");
  await supabase.from("email_templates").delete().eq("template_key", "test_manual_sending");
}

run();
