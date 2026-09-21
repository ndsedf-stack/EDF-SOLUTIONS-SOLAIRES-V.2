import axios from "axios";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";

async function probe(name) {
  const url = `${supabaseUrl}/functions/v1/${name}`;
  try {
     console.log(`Probing ${name}...`);
     const res = await axios.post(url, {}, {
        headers: {
           "Authorization": `Bearer ${key}`,
           "Content-Type": "application/json"
        }
     });
     console.log(`✅ ${name} responded:`, res.status, res.data);
  } catch (err) {
     if (err.response) {
       console.log(`❌ ${name} failed (HTTP ${err.response.status}):`, err.response.data);
     } else {
       console.log(`❌ ${name} failed:`, err.message);
     }
  }
}

async function run() {
  const functions = [
    "send_email_from_queue",
    "send_email_engine",
    "send_email_resend_instrumented",
    "ocr-lead",
    "ocr-table",
    "import-contacts-batch"
  ];
  for (const f of functions) {
     await probe(f);
  }
}

run();
