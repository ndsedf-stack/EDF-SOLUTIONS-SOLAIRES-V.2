import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { to, subject, html } = await req.json();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${Deno.env.get('RESEND_API_KEY')}",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: to || "ndsedf@gmail.com",
      subject: subject || "Test",
      html: html || "Marche enfin !",
    }),
  });
  const data = await res.json();
  return new Response(JSON.stringify({ ok: true, result: data }), { headers: { "Content-Type": "application/json" } });
})
