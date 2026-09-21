import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking backup_all_functions_20260105...");

  try {
    const { data, error } = await supabase
      .from("backup_all_functions_20260105")
      .select("*")
      .limit(10);

    if (error) {
      console.log("Table backup_all_functions_20260105 failed:", error.message);
    } else {
      console.log(`Found ${data.length} functions in backup table.`);
      console.log("Columns:", Object.keys(data[0] || {}));
      
      // Let's filter by names containing email or queue
      const { data: matched } = await supabase
        .from("backup_all_functions_20260105")
        .select("function_name, function_definition")
        .or("function_name.ilike.%email%,function_name.ilike.%lead%,function_name.ilike.%cron%");
      
      console.log("Matched functions:");
      console.table(matched?.map(m => ({ name: m.function_name, len: m.function_definition?.length })));
      
      for (const m of (matched || [])) {
         console.log(`\n==================\nFUNCTION: ${m.function_name}\n==================\n`);
         console.log(m.function_definition);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
