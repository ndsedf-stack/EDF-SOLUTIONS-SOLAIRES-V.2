import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Resend } from "https://esm.sh/resend";

serve(async (_req) => {
  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

    const result = await resend.emails.send({
      from: "Nicolas Di Stefano <nicolas@nicolas-distefano-edf.fr>",
      to: ["ndsedf@gmail.com"],
      subject: "🔥 TEST RESEND EDGE FUNCTION",
      html: "<h1>Si tu lis ça, Resend fonctionne.</h1>",
    });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
    });
  }
});
