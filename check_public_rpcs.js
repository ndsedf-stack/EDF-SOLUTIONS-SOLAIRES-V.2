import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function tryRpc(rpcName, params) {
  try {
     const { data, error } = await supabase.rpc(rpcName, params);
     if (error) {
        // If the function doesn't exist, PostgREST returns a specific code (PGRST202 or 404/405/400)
        console.log(`❌ RPC ${rpcName}: ${error.code} - ${error.message}`);
        return false;
     } else {
        console.log(`✅ RPC ${rpcName} exists! Response:`, data);
        return true;
     }
  } catch (err) {
     console.log(`❌ RPC ${rpcName} failed:`, err.message);
     return false;
  }
}

async function run() {
  console.log("Checking common SQL RPC names...");
  
  // Try simple SQL query execution RPCs
  await tryRpc("exec_sql", { query: "SELECT 1" });
  await tryRpc("run_sql", { sql: "SELECT 1" });
  await tryRpc("execute_sql", { query_text: "SELECT 1" });
  await tryRpc("sql", { query: "SELECT 1" });
  await tryRpc("query", { sql: "SELECT 1" });
}

run();
