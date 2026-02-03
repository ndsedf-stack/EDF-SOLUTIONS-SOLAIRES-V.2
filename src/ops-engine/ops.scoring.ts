import { OpsSnapshotRow, OpsScoringResult } from './ops.types';

// 🎯 SCORING PUR (ZÉRO SIDE EFFECT)

/**
 * 🟠 Score 1 — risk_score_ops (0 → 100)
 * Probabilité opérationnelle de perte / annulation.
 * Basé sur une pondération précise (SRU, Retard, Silence).
 */
export function computeRiskScore(row: OpsSnapshotRow): number {
  let score = 0;

  const daysSinceSignature = row.days_since_signature ?? 0;
  const daysSinceLastEvent = row.days_since_last_event ?? 0;
  
  // Facteurs aggravants
  if (row.status === 'signed' && daysSinceSignature > 14 && !row.deposit_paid) score += 60;
  if (row.status === 'signed' && daysSinceSignature >= 8 && daysSinceSignature <= 14 && !row.deposit_paid) score += 40;
  
  if (daysSinceLastEvent > 10) score += 25;
  else if (daysSinceLastEvent >= 6) score += 15;
  
  if (row.email_optout) score += 100; // Hard stop

  // Facteurs rassurants
  if (row.deposit_paid) score -= 40;
  if (daysSinceLastEvent <= 2) score -= 15;

  return Math.max(0, Math.min(100, score));
}

/**
 * 🔵 Score 2 — inertia_score (0 → 100)
 * Temps mort / absence de mouvement.
 */
export function computeInertiaScore(row: OpsSnapshotRow): number {
  let score = 0;
  
  // Si jamais d'interaction connue
  if (row.days_since_last_event == null) return 60; // Considéré comme "Aucune interaction"
  
  const days = row.days_since_last_event;

  if (days > 14) score += 50;
  else if (days >= 7) score += 35;
  else if (days >= 4) score += 20;
  
  // Bonus activité récente
  if (days <= 2) score -= 25;

  return Math.max(0, Math.min(100, score));
}

/**
 * 🟢 Score 3 — ops_health_score (0 → 100)
 * Qualité globale du dossier (l’inverse du chaos).
 * Formule composite : 100 - (RISK * 0.6) - (INERTIA * 0.4)
 */
export function computeOpsHealthScore(row: OpsSnapshotRow): number {
  const risk = computeRiskScore(row);
  const inertia = computeInertiaScore(row);
  
  const penalty = (risk * 0.6) + (inertia * 0.4);
  const health = 100 - penalty;

  return Math.max(0, Math.round(health));
}

/**
 * 4️⃣ Sortie consolidée (contrat moteur)
 */
export function scoreOpsRow(row: OpsSnapshotRow): OpsScoringResult {
  return {
    study_id: row.study_id,
    risk_score_ops: computeRiskScore(row),
    inertia_score: computeInertiaScore(row),
    ops_health_score: computeOpsHealthScore(row),
  };
}
