import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.email_id) {
      return new Response(JSON.stringify({ error: "email_id required" }), { status: 400 });
    }

    const { email_id } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

    const { data: emailRow, error } = await supabase
      .from("email_queue")
      .select(`
        id,
        email_type,
        payload,
        status,
        clients(email, first_name, last_name),
        studies(client_name, commercial_name, commercial_email)
      `)
      .eq("id", email_id)
      .single();

    if (error || !emailRow) {
      return new Response(JSON.stringify({ error: "Email not found" }), { status: 404 });
    }

    if (emailRow.status !== "processing") {
      return new Response(JSON.stringify({ error: "Email not in processing state" }), { status: 409 });
    }

    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("subject, body_html")
      .eq("template_key", emailRow.email_type)
      .single();

    if (templateError || !template) {
      await supabase.from("email_queue").update({
        status: "error",
        last_error: `Template not found: ${emailRow.email_type}`,
      }).eq("id", email_id);

      return new Response(JSON.stringify({ error: "Template not found" }), { status: 500 });
    }

    const clientEmail = emailRow.clients?.email;
    if (!clientEmail) {
      return new Response(JSON.stringify({ error: "Client email missing" }), { status: 500 });
    }

    const variables: Record<string, string> = {
      first_name: emailRow.clients?.first_name || "",
      last_name: emailRow.clients?.last_name || "",
      client_name:
        emailRow.clients?.first_name ||
        emailRow.studies?.client_name ||
        "Client",
      commercial_name:
        emailRow.studies?.commercial_name || "Nicolas Di Stefano",
      commercial_email:
        emailRow.studies?.commercial_email || "ndi-stefano@edf-solutions-solaires.com",
      ...(emailRow.payload ?? {}),
    };

    const render = (tpl: string) =>
      tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? "");

    const subject = render(template.subject);
    const html = render(template.body_html);

    const sendResult = await resend.emails.send({
      from: `${variables.commercial_name} <${variables.commercial_email}>`,
      to: [clientEmail],
      subject,
      html,
    });

    await supabase.from("email_queue").update({
      status: "sent",
      sent_at: new Date().toISOString(),
      resend_id: sendResult.id ?? null,
      last_error: null,
    }).eq("id", email_id);

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
});

