import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Inspecting exposed schema methods...");

  try {
    const response = await fetch(supabaseUrl + "/rest/v1/", {
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`
      }
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Text length:", text.length);
    const data = JSON.parse(text);
    console.log("Paths keys:", data.paths ? Object.keys(data.paths).slice(0, 30) : "none");
    if (data.paths) {
      const rpcs = Object.keys(data.paths).filter(path => path.includes("rpc"));
      console.log("RPC paths found:", rpcs);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

run();
