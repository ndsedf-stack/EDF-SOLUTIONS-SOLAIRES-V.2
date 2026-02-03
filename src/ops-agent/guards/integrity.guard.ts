// src/ops-agent/guards/integrity.guard.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type IntegrityIssue = {
  type: "ORPHAN_STUDY" | "ORPHAN_EMAIL";
  entityId: string;
  reason: string;
};

async function runIntegrityCheck(db: SupabaseClient): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = [];

  // ─────────────────────────────────────────
  // 🔗 STUDIES WITHOUT CLIENT
  // ─────────────────────────────────────────
  const orphanStudies = await db
    .from("studies")
    .select("id, client_id")
    .is("client_id", null);

  if (orphanStudies.data) {
    orphanStudies.data.forEach((study: any) => {
      issues.push({
        type: "ORPHAN_STUDY",
        entityId: study.id,
        reason: "Study has no linked client",
      });
    });
  }

  // ─────────────────────────────────────────
  // ✉️ EMAILS WITHOUT STUDY
  // ─────────────────────────────────────────
  // Note: Using 'email_queue' or 'tracking_events' as 'email_events' alias depending on schema
  const orphanEmails = await db
    .from("email_queue") // Adopting existing table name from system knowledge
    .select("id, study_id")
    .is("study_id", null);

  if (orphanEmails.data) {
    orphanEmails.data.forEach((email: any) => {
      issues.push({
        type: "ORPHAN_EMAIL",
        entityId: email.id,
        reason: "Email event has no linked study",
      });
    });
  }

  return issues;
}

export class IntegrityGuard {
  static async scan() {
    const issues = await runIntegrityCheck(supabase);
    if (issues.length > 0) {
      console.warn("⚠️ [OPS] Integrity Issues Found:", issues);
      // Here we could trigger auto-cleanup or alerts
    }
  }
}
