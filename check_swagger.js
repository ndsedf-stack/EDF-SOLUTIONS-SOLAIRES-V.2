import axios from "axios";

const supabaseUrl = "https://ugwqfvwclwctzgtxcakp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3FmdndjbHdjdHpndHhjYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDg4OTgsImV4cCI6MjA4MTgyNDg5OH0.sx9z3p3svG5V6djfzUXtzdOwbUU3wjIVaAyIjRoFzaE";

async function run() {
  const endpoints = [
    `${supabaseUrl}/rest/v1`,
    `${supabaseUrl}/rest/v1/`,
    `${supabaseUrl}/`,
    `${supabaseUrl}/rest/v1/rpc`
  ];

  for (const url of endpoints) {
     try {
        console.log(`Fetching OpenAPI spec from: ${url}`);
        const res = await axios.get(url, {
           headers: {
              "apikey": key,
              "Authorization": `Bearer ${key}`
           }
        });
        console.log(`✅ Success (HTTP ${res.status}): keys:`, Object.keys(res.data).slice(0, 10));
        if (res.data.paths) {
          const rpcs = Object.keys(res.data.paths).filter(p => p.includes("rpc"));
          console.log(`Found RPC paths:`, rpcs);
        }
     } catch (err) {
        if (err.response) {
          console.log(`❌ Failed (HTTP ${err.response.status}):`, typeof err.response.data === 'string' ? err.response.data.slice(0, 100) : err.response.data);
        } else {
          console.log(`❌ Failed:`, err.message);
        }
     }
  }
}

run();
