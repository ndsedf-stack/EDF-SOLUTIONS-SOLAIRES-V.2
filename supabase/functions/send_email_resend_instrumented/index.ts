import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const { to, subject, html } = await req.json();
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      from: "Nicolas Di Stefano <nicolas@nicolas-distefano-edf.fr>",
      to: to || "ndsedf@gmail.com",
      subject: subject || "Votre étude solaire EDF — Synthèse de notre échange",
      html: html || "Bonjour, merci pour notre échange concernant votre projet solaire.",
    }),
  });
  
  const data = await res.json();
  return new Response(JSON.stringify({ ok: true, result: data }), { headers: { "Content-Type": "application/json" } });
})
