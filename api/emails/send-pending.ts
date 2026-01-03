import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { data: queue, error } = await supabase
      .from("email_queue")
      .select(
        `
        id,
        email_type,
        studies (
          id,
          client_name,
          client_email
        )
      `
      )
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString());

    if (error) throw error;
    if (!queue || queue.length === 0) {
      return res.status(200).json({ message: "Aucun email à envoyer." });
    }

    const results = [];

    for (const item of queue) {
      // FIX ICI : On récupère l'objet étude à l'intérieur du tableau renvoyé par Supabase
      const study = Array.isArray(item.studies)
        ? item.studies[0]
        : (item.studies as any);

      if (!study || !study.client_email) continue;

      const { data, error: sendError } = await resend.emails.send({
        from: "EDF Solutions <noreply@tondomaine.com>",
        to: [study.client_email], // On utilise 'study' au lieu de 'item.studies'
        subject: `Suite à votre étude : ${item.email_type}`,
        html: `<strong>Bonjour ${study.client_name},</strong><p>Nous revenons vers vous concernant votre étude...</p>`,
      });

      if (!sendError) {
        await supabase
          .from("email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            resend_id: data?.id,
          })
          .eq("id", item.id);

        results.push({ id: item.id, status: "success" });
      }
    }

    return res.status(200).json({ success: true, emails_sent: results.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
