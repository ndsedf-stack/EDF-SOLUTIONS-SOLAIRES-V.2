import { supabase } from "@/lib/supabase";
import { TemporalGuard } from "@/ops-agent/guards/temporal.guard";
import { computeBehavioralRisk } from "@/brain/intelligence/behavior";

interface EmailJob {
  studyId: string;
  emailTemplateId: string;
  clientId: string;
}

/**
 * 📧 MOTEUR D'ENVOI EMAILS
 * Ce script est destiné à être exécuté par un Worker / Cron / Edge Function.
 * Il ne doit JAMAIS être appelé directement par l'UI (React).
 */
export async function sendNextEmail(job: EmailJob) {
  const { studyId, emailTemplateId, clientId } = job;
  const now = new Date();

  // 0. 🛡️ SÉCURITÉ RGPD (OPTOUT)
  const { data: client } = await supabase
    .from("clients")
    .select("email_optout")
    .eq("id", clientId)
    .single();

  if (client?.email_optout) {
      console.warn("⛔ EMAIL BLOCKED (RGPD OPT-OUT)", { clientId });
      // Arrêt silencieux (pas d'erreur pour éviter le retry automatique du worker)
      return;
  }

  // 1. Charger l'historique (État actuel)
  const { data: lead } = await supabase
    .from("email_leads")
    .select("email_step, last_email_sent_at, send_count")
    .eq("study_id", studyId)
    .single();

  if (!lead) {
      throw new Error(`Lead not found for study ${studyId}`);
  }
  
  // 1b. 🧠 CHECK FATIGUE (Gap 4 Fixed)
  // On récupère les stats comportementales pour vérifier la saturation
  const { count: viewCount } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("study_id", studyId)
    .eq("event_type", "view");

  const { count: clickCount } = await supabase
    .from("tracking_events")
    .select("*", { count: "exact", head: true })
    .eq("study_id", studyId)
    .eq("event_type", "click");
    
  // Simulation objet Study partiellle pour le calcul
  const behaviorRisk = computeBehavioralRisk({
      views: viewCount || 0,
      clicks: clickCount || 0,
      send_count: lead.send_count || 0
  } as any);

  if (behaviorRisk === "fatigue") {
      console.warn("⛔ EMAIL BLOCKED (FATIGUE SATURATION)", { studyId });
      // On log le stop
      await logOpsIncident({
        type: "FATIGUE_STOP",
        severity: "HIGH",
        payload: { views: viewCount, sent: lead.send_count }
      });
      return; 
  }

  // 2. 🛡️ TEMPORAL GUARD CHECKS
  // "On ne fait pas confiance au statut. On regarde l'historique."
  const violation = TemporalGuard.assess({
    studyId,
    lastEmailStep: lead.last_email_sent_at ? {
        step: lead.email_step.toString(), // DB stores int, guard expects string
        executedAt: lead.last_email_sent_at
    } : null,
    nextStep: emailTemplateId,
    now
  });

  // 3. ⛔ BLOCAGE SI VIOLATION
  if (violation) {
    console.error("⛔ BLOCKED BY TEMPORAL GUARD", violation);

    // Log l'incident OPS
    await logOpsIncident({
      type: "TEMPORAL_VIOLATION",
      severity: "CRITICAL",
      payload: violation
    });

    // Stop net
    throw new Error(
      `EMAIL BLOCKED — ${violation.reason} — Study ${studyId}`
    );
  }

  // 4. ✅ SI OK : ENVOI RÉEL
  console.log("✅ TEMPORAL CHECK PASSED. SENDING...", { studyId, emailTemplateId });
  
  // Simulation envoi...
  // await provider.send(...)

  // Mise à jour DB
  await supabase.from("email_leads").update({
      email_step: parseInt(emailTemplateId), // Assuming templateId is numeric or mapped
      last_email_sent_at: now.toISOString()
  }).eq("study_id", studyId);
}

// Helper de log
async function logOpsIncident(incident: { type: string, severity: string, payload: any }) {
    await supabase.from("decision_logs").insert({
        action_performed: incident.type,
        justification: `SEVERITY: ${incident.severity} - ${JSON.stringify(incident.payload)}`
    });
}
