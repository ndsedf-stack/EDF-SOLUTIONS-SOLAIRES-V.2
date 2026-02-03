import { OpsSnapshotRow } from "../../ops-engine/ops.types";

export type AxisAStatus =
  | "WAR_ROOM"
  | "A_SECURISER"
  | "SOUS_CONTROLE"
  | "HORS_PERIMETRE";

export interface AxisAResult {
  studyId: string;
  status: AxisAStatus;
  reasons: string[];
  recommendation: string;
}

const SRU_MAX_DAYS = 14;
const SECURING_SOFT_LIMIT = 7;

/**
 * AXE A — DOSSIERS SIGNÉS
 * Analyse pure. Aucun effet de bord.
 */
export function analyzeAxisA(row: OpsSnapshotRow): AxisAResult | null {
  // 1. Hors périmètre
  if (row.status !== "signed") {
    return null;
  }

  const reasons: string[] = [];

  const daysSinceSignature = row.days_since_signature ?? 0;
  const daysSinceLastEvent = row.days_since_last_event ?? null;

  const depositPaid = row.deposit_paid === true;
  const installCost = row.install_cost ?? 0;

  // ⚠️ règle métier : acompte NON obligatoire dans tous les cas
  const requiresDeposit = installCost > 0;

  // 2. SRU dépassé → danger absolu
  if (daysSinceSignature > SRU_MAX_DAYS && !depositPaid && requiresDeposit) {
    reasons.push("Délai SRU dépassé sans sécurisation financière");
    return {
      studyId: row.study_id,
      status: "WAR_ROOM",
      reasons,
      recommendation: "INTERVENTION IMMÉDIATE — sécuriser ou stopper",
    };
  }

  // 3. Zone dangereuse proche SRU
  if (
    daysSinceSignature >= SECURING_SOFT_LIMIT &&
    !depositPaid &&
    requiresDeposit
  ) {
    reasons.push("Signature ancienne sans acompte");
  }

  // 4. Silence post-signature
  if (daysSinceLastEvent !== null && daysSinceLastEvent >= 5) {
    reasons.push("Aucune interaction récente après signature");
  }

  // 5. Classification finale
  if (reasons.length >= 2) {
    return {
      studyId: row.study_id,
      status: "WAR_ROOM",
      reasons,
      recommendation: "SÉCURISER EN URGENCE",
    };
  }

  if (reasons.length === 1) {
    return {
      studyId: row.study_id,
      status: "A_SECURISER",
      reasons,
      recommendation: "Relance ciblée pour sécurisation",
    };
  }

  return {
    studyId: row.study_id,
    status: "SOUS_CONTROLE",
    reasons: [],
    recommendation: "RAS — dossier sain",
  };
}
