// /api/webhooks/resend.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Important: SERVICE KEY, pas la clé publique
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;
    console.log("📨 Webhook Resend reçu:", event.type);

    switch (event.type) {
      case "email.opened":
        await handleEmailOpened(event.data);
        break;

      case "email.clicked":
        await handleEmailClicked(event.data);
        break;

      case "email.complained":
        await handleEmailComplained(event.data);
        break;

      case "email.bounced":
        await handleEmailBounced(event.data);
        break;

      case "contact.updated":
        await handleContactUpdated(event.data);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Erreur webhook:", error);
    res.status(500).json({ error: error.message });
  }
}

// 👁️ GÉRER L'OUVERTURE D'EMAIL
async function handleEmailOpened(data) {
  const email = data.to[0]; // Email du destinataire

  // 1. Trouver le client
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .single();

  if (!client) return;

  // 2. Trouver l'étude
  const { data: study } = await supabase
    .from("studies")
    .select("id")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!study) return;

  // 3. Incrémenter les vues
  await supabase.rpc("increment_email_opens", { study_id: study.id });

  console.log("✅ Vue enregistrée pour:", email);
}

// 🖱️ GÉRER LE CLIC D'EMAIL
async function handleEmailClicked(data) {
  const email = data.to[0];

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .single();

  if (!client) return;

  const { data: study } = await supabase
    .from("studies")
    .select("id")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!study) return;

  await supabase.rpc("increment_email_clicks", { study_id: study.id });

  console.log("✅ Clic enregistré pour:", email);
}

// 🚫 GÉRER LE SPAM/COMPLAINT
async function handleEmailComplained(data) {
  const email = data.to[0];

  // Marquer comme opted-out automatiquement
  await supabase
    .from("clients")
    .update({
      email_optout: true,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  // Annuler les emails en attente
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .single();

  if (client) {
    await supabase
      .from("email_queue")
      .update({ status: "cancelled" })
      .eq("client_id", client.id)
      .in("status", ["pending", "scheduled"]);
  }

  console.log("✅ Client marqué spam/opted-out:", email);
}

// ⚠️ GÉRER LE BOUNCE
async function handleEmailBounced(data) {
  const email = data.to[0];

  // Marquer comme opted-out si bounce permanent
  if (data.bounce?.type === "Permanent") {
    await supabase
      .from("clients")
      .update({
        email_optout: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    console.log("✅ Email bounced (permanent):", email);
  }
}

// 📧 GÉRER LA MISE À JOUR DE CONTACT (DÉSABONNEMENT)
async function handleContactUpdated(data) {
  if (data.unsubscribed === true) {
    await supabase
      .from("clients")
      .update({
        email_optout: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", data.email);

    console.log("✅ Client désabonné depuis Resend:", data.email);
  }
}
