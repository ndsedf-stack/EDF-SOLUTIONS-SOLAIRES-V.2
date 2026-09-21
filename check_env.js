console.log("Environment variables check:");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "EXISTS (length " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "MISSING");
console.log("VITE_SUPABASE_SERVICE_ROLE_KEY:", process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? "EXISTS" : "MISSING");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "EXISTS" : "MISSING");
