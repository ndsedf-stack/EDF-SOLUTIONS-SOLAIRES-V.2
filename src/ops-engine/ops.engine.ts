import * as RULES from './ops.rules';

/**
 * OPS DECISION ENGINE
 * Gouvernance interne – aucun impact client
 */

export type OpsContext = {
  daysSinceSignature: number;
  depositReceived: boolean;
  interactionScore: number;
  amount: number;
};

export type OpsDecision = {
  riskScore: number;
  status: 'LOCKED' | 'DANGER' | 'EXPOSED';
  warRoom: boolean;
  reasons: string[];
};

export function evaluateOpsDecision(ctx: OpsContext): OpsDecision {
  let riskScore = 0;
  const reasons: string[] = [];

  // === Temps SRU
  if (ctx.daysSinceSignature >= RULES.SRU_MAX_DAYS - 2) {
    riskScore += RULES.RISK_PENALTY.SRU_DANGER_ZONE;
    reasons.push('SRU danger zone');
  }

  // === Acompte
  if (!ctx.depositReceived) {
    riskScore +=
      ctx.daysSinceSignature > RULES.SILENCE_THRESHOLD_DAYS
        ? RULES.RISK_PENALTY.NO_DEPOSIT_LATE
        : RULES.RISK_PENALTY.NO_DEPOSIT_EARLY;
    reasons.push('Deposit not received');
  } else {
    riskScore += RULES.RISK_BONUS.DEPOSIT_RECEIVED;
  }

  // === Interaction
  if (ctx.interactionScore < 20) {
    riskScore += RULES.RISK_PENALTY.SILENCE_CRITICAL;
    reasons.push('Client silent');
  } else if (ctx.interactionScore < 40) {
    riskScore += RULES.RISK_PENALTY.SILENCE_LOW;
  } else if (ctx.interactionScore > 60) {
    riskScore += RULES.RISK_BONUS.HIGH_INTERACTION;
  }

  // === Montant
  if (ctx.amount > RULES.HIGH_AMOUNT_THRESHOLD) {
    riskScore += RULES.RISK_PENALTY.HIGH_AMOUNT;
    reasons.push('High amount');
  }

  const warRoom = riskScore >= RULES.WAR_ROOM_RISK_SCORE;

  return {
    riskScore,
    warRoom,
    status:
      ctx.depositReceived || ctx.daysSinceSignature > RULES.SRU_MAX_DAYS
        ? 'LOCKED'
        : warRoom
        ? 'DANGER'
        : 'EXPOSED',
    reasons,
  };
}
