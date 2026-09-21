import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking if we can insert into email_queue...");

  const testQueueItem = {
     client_id: "c74e37f2-2c88-4424-ad8f-6f8435d454bd", // Test lead client ID
     email_type: "test_from_anon",
     scheduled_for: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 mins from now
     status: "pending"
  };

  const { data, error } = await supabase
    .from("email_queue")
    .insert([testQueueItem])
    .select();

  if (error) {
     console.error("❌ Insert failed:", error.message);
  } else {
     console.log("✅ Insert succeeded! Row created:", data);
     
     // Clean up
     const { error: errDel } = await supabase
       .from("email_queue")
       .delete()
       .eq("id", data[0].id);
     if (errDel) console.log("Failed to clean up test item:", errDel.message);
  }
}

run();
