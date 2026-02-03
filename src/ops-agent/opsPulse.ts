import { TemporalGuard } from "./guards/temporal.guard"
import { IntegrityGuard } from "./guards/integrity.guard"
import { ProcessGuard, ProcessGuardError } from "./guards/process.guard"
import { AnomalyDetector } from "./watchers/anomaly.detector"
import { supabase } from "@/lib/supabase"

export async function runOpsPulse(context: {
  study?: any
  emailQueue?: any[]
}) {
  try {
    // 🛑 BLOQUANTS (hard stop)
    if (context.study) {
      ProcessGuard.enforce(context.study)
      TemporalGuard.check(context.study)
    }

    // 👁️ OBSERVATION (alerting only)
    await AnomalyDetector.observe()

    // 🧹 NETTOYAGE (asynchrone / nightly)
    await IntegrityGuard.scan()
    
  } catch (error: any) {
    // 📝 AUDIT TRAIL (Gap 1 Fixed)
    // On persiste le blocage pour preuve.
    if (context.study?.id) {
       await supabase.from("decision_logs").insert({
         study_id: context.study.id,
         action_performed: "BLOCKED_BY_GUARD",
         justification: error.message || "Unknown Ops Error",
         agent_source: "OpsPulse"
       });
    }

    // On relance l'erreur pour bloquer l'appelant
    throw error;
  }
}
