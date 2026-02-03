// src/ops-agent/watchers/anomaly.detector.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type OpsAnomaly = {
  type: "PIPELINE_DROP" | "EMAIL_STALL";
  severity: "HIGH" | "CRITICAL";
  message: string;
  detectedAt: string;
};

async function detectAnomalies(db: SupabaseClient): Promise<OpsAnomaly[]> {
  const anomalies: OpsAnomaly[] = [];

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // ─────────────────────────────────────────
  // 📉 PIPELINE VALUE DROP (>20% / 1h)
  // ─────────────────────────────────────────
  // Assuming 'pipeline_metrics' view or table exists, or fallback to 'metrics' snapshots
  const { data: pipeline } = await db
    .from("metrics_history") // Adapted likely table name
    .select("value:total_pipeline_value, created_at") // Mapping to likely column
    .gte("created_at", oneHourAgo.toISOString())
    .order("created_at", { ascending: true });

  if (pipeline && pipeline.length >= 2) {
    const start = pipeline[0].value;
    const end = pipeline[pipeline.length - 1].value;

    if (start > 0) {
        const drop = (start - end) / start;

        if (drop > 0.2) {
        anomalies.push({
            type: "PIPELINE_DROP",
            severity: "CRITICAL",
            message: `Pipeline value dropped ${(drop * 100).toFixed(1)}% in <1h`,
            detectedAt: now.toISOString(),
        });
        }
    }
  }

  // ─────────────────────────────────────────
  // ✉️ EMAIL STALL (0 sent / 48h)
  // ─────────────────────────────────────────
  const { count: sentCount } = await db
    .from("email_queue") // Adapted to real table
    .select("*", { count: "exact", head: true })
    .eq("status", "sent") // Filter for sent
    .gte("sent_at", twoDaysAgo.toISOString());

  const { count: pendingCount } = await db
    .from("email_queue")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "scheduled"]);

  if ((sentCount ?? 0) === 0 && (pendingCount ?? 0) > 10) {
    anomalies.push({
      type: "EMAIL_STALL",
      severity: "HIGH",
      message: "No emails sent in 48h while queue is non-empty",
      detectedAt: now.toISOString(),
    });
  }

  return anomalies;
}

export class AnomalyDetector {
  static async observe() {
    const anomalies = await detectAnomalies(supabase);
    if (anomalies.length > 0) {
      console.error("🚨 [OPS] Anomalies Detected:", anomalies);
      // Trigger Notification / PagerDuty / Agent Zero Alert
    }
  }
}
