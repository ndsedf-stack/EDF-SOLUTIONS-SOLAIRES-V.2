// src/ops-agent/axes/axisC.ts

import { OpsSnapshotRow } from "../../ops-engine/ops.types";

export type AxisCStatus =
  | "A_APPELER"
  | "A_OBSERVER"
  | "A_ABANDONNER"
  | "HORS_PERIMETRE";

export interface AxisCResult {
  studyId: string;
  status: AxisCStatus;
  reasons: string[];
  recommendation: string;
}

const ABANDON_DELAY_DAYS = 30;
const HOT_DELAY_DAYS = 7;

/**
 * AXE C — LEADS JAMAIS JOINTS
 * Analyse pure. Aucun effet de bord.
 */
export function analyzeAxisC(row: OpsSnapshotRow): AxisCResult | null {
  // @ts-ignore — champs pas encore dans le type strict
  const status = row.status;

  // 1. Hors périmètre
  if (status === "signed") return null;

  // @ts-ignore
  if (row.email_optout === true) {
    return {
      studyId: row.study_id,
      status: "A_ABANDONNER",
      reasons: ["Client opt-out (RGPD)"],
      recommendation: "STOP — aucun contact autorisé",
    };
  }

  const reasons: string[] = [];
  const daysSinceLastEvent = row.days_since_last_event ?? null;

  // 2. Abandon total
  if (daysSinceLastEvent !== null && daysSinceLastEvent >= ABANDON_DELAY_DAYS) {
    reasons.push("Aucune interaction depuis plus de 30 jours");
    return {
      studyId: row.study_id,
      status: "A_ABANDONNER",
      reasons,
      recommendation: "STOP — lead froid, désengager",
    };
  }

  // 3. Chaud → appel humain
  if (daysSinceLastEvent !== null && daysSinceLastEvent <= HOT_DELAY_DAYS) {
    reasons.push("Interaction récente détectée");
    return {
      studyId: row.study_id,
      status: "A_APPELER",
      reasons,
      recommendation: "APPEL HUMAIN PRIORITAIRE",
    };
  }

  // 4. Zone grise
  reasons.push("Lead passif sans signal fort");
  return {
    studyId: row.study_id,
    status: "A_OBSERVER",
    reasons,
    recommendation: "Surveiller sans relance agressive",
  };
}
