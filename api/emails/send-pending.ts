import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  // 1. Vérification de sécurité pour le Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 2. Récupérer les emails en attente (status = 'pending') dont la date est passée
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
      return res
        .status(200)
        .json({ message: "Aucun email à envoyer pour le moment." });
    }

    const results = [];

    // 3. Boucle d'envoi
    for (const item of queue) {
      const { data, error: sendError } = await resend.emails.send({
        from: "EDF Solutions <noreply@tondomaine.com>",
        to: [item.studies.client_email],
        subject: `Suite à votre étude : ${item.email_type}`,
        html: `<strong>Bonjour ${item.studies.client_name},</strong><p>Nous revenons vers vous concernant votre étude...</p>`,
      });

      if (!sendError) {
        // 4. Marquer comme envoyé dans Supabase
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

    return res.status(200).json({
      success: true,
      emails_sent: results.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
