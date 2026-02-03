import { OpsSnapshotRow } from '../../ops-engine/ops.types';

/**
 * AXE B
 * Dossiers après RDV, sans signature
 * Rôle : vérifier flows, inertie, comportement
 */

export type AxisBStatus = 
  | 'A_RELANCER' 
  | 'A_SURVEILLER' 
  | 'HORS_PERIMETRE';

export interface AxisBResult {
  studyId: string;
  status: AxisBStatus;
  reasons: string[];
  recommendation: string;
}

export function isAxisB(study: OpsSnapshotRow): boolean {
  return (
    study.status === 'sent' &&
    !study.signed_at &&
    !study.deposit_paid
  )
}

export function analyzeAxisB(study: OpsSnapshotRow): AxisBResult | null {
  if (!isAxisB(study)) return null;

  const reasons: string[] = [];

  // 1. Détection inertie
  const daysSinceInteraction = study.days_since_last_event ?? null
  const isSilent = daysSinceInteraction !== null && daysSinceInteraction > 7

  // 2. Détection intérêt (basique pour l’instant)
  let behavior: 'INTERESSE' | 'AGITE' | 'MUET' | 'NEUTRE' = 'NEUTRE'

  const interactionScore = study.interaction_score ?? 0;

  if (interactionScore >= 60) behavior = 'INTERESSE'
  else if (interactionScore >= 30) behavior = 'AGITE'
  else if (isSilent) behavior = 'MUET'

  // 3. Décision Ops
  if (behavior === 'INTERESSE' && isSilent) {
    reasons.push('Client intéressé mais silencieux');
    return {
      studyId: study.study_id,
      status: 'A_RELANCER',
      reasons,
      recommendation: 'APPELER_EN_PRIORITE'
    }
  }

  if (behavior === 'MUET') {
    reasons.push('Client silencieux, risque fatigue');
    return {
      studyId: study.study_id,
      status: 'A_SURVEILLER', // Was INFO/NE_PAS_RELANCER, mapping to WATCH strategy
      reasons,
      recommendation: 'NE_PAS_RELANCER'
    }
  }

  reasons.push('Situation normale');
  return {
    studyId: study.study_id,
    status: 'A_SURVEILLER',
    reasons,
    recommendation: 'AUCUNE_ACTION'
  }
}
