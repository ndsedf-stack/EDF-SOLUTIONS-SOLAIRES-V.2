import { Study, Metrics, WarRoomStudy } from "./types";
import { getDaysSince } from "../utils/dates";
import { computeDangerScore } from "./cvi";
import { computeBehavioralRisk } from "./intelligence/behavior";
import { computeCancellationRisk } from "./intelligence/cancellation";
import { isInWarRoom, hasFinancialRisk, isLateDeposit } from "./warRoom";
import { computePriorityCase, computePriorityActions } from "./decision/recommendations";
import { computeTensionLevel, computeSystemState } from "./intelligence/tension";
import { computeUrgencyMode } from "./decision/urgency";
import { computeFinancialStats } from "./intelligence/finance";
import { CRITICAL_CASES, WARNING_CASES, CRITICAL_CASH, WARNING_CASH } from "./config";

export function buildSystemBrain(studies: Study[]): Metrics & { financialStats: any } {
  // =========================
  // 1. BASES
  // =========================
  const signed = studies.filter((s) => s.status === "signed");
  const sent = studies.filter((s) => s.status === "sent");

  // =========================
  // 2. WAR ROOM (SIGNÉS < 14J SANS ACOMPTE)
  // =========================
  const warRoomBase = signed
    .filter(isInWarRoom)
    .map((s) => {
      const dangerScore = computeDangerScore(s);
      const behavior = computeBehavioralRisk(s);
      const daysLate = s.signed_at ? getDaysSince(s.signed_at) : 0;

      return {
        ...s,
        dangerScore,
        behavior,
        daysLate,
        cancellationRisk: 0,
      };
    })
    .sort((a, b) => b.dangerScore - a.dangerScore);

  const warRoomIds = warRoomBase.map((s) => s.id);

  const warRoomCA = warRoomBase.reduce(
    (sum, s) => sum + (s.total_price || 0),
    0
  );
  
  // =========================
  // 3. RISQUES FINANCIERS
  // =========================
  const riskyDeposits = signed.filter(hasFinancialRisk);
  const lateDeposits = signed.filter(isLateDeposit);

  const cashAtRisk = riskyDeposits.reduce(
    (sum, s) => sum + (s.total_price || 0),
    0
  );
  
  const tensionLevel = computeTensionLevel(warRoomBase as (WarRoomStudy & { dangerScore: number })[], cashAtRisk);

  const warRoomWithPrediction = warRoomBase.map((s) => ({
    ...s,
    cancellationRisk: computeCancellationRisk({
      dangerScore: s.dangerScore,
      tensionLevel,
      behavior: s.behavior,
    }),
  }));

  const priorityCase = computePriorityCase(warRoomWithPrediction as (WarRoomStudy & { dangerScore: number })[]);
  const priorityActions = computePriorityActions(warRoomWithPrediction as (WarRoomStudy & { dangerScore: number })[]);

  // =========================
  // 4. ACTION IMMÉDIATE
  // =========================
  const actionNow = [
    ...warRoomWithPrediction,
    ...riskyDeposits.filter((r) => !warRoomIds.includes(r.id)),
    ...lateDeposits.filter(
      (l) =>
        !warRoomIds.includes(l.id) && !riskyDeposits.find((r) => r.id === l.id)
    ),
  ];

  // =========================
  // 5. TEMPÉRATURE COMPORTEMENTALE (GLOBALE)
  // =========================
  const allStudiesWithBehavior = studies.map((s) => {
    const risk = computeBehavioralRisk(s);
    return { ...s, risk };
  });

  const muets = allStudiesWithBehavior.filter((s) => s.risk === "muet");
  const agites = allStudiesWithBehavior.filter((s) => s.risk === "agite");
  const interesses = allStudiesWithBehavior.filter((s) => s.risk === "interesse");
  const fatigues = allStudiesWithBehavior.filter((s) => s.risk === "fatigue");

  // =========================
  // 6. SAINS
  // =========================
  const healthy = studies.filter(
    (s) =>
      !warRoomIds.includes(s.id) && !riskyDeposits.find((r) => r.id === s.id)
  );

  // =========================
  // 7. ÉTAT SYSTÈME
  // =========================
  const systemState = computeSystemState({
    actionNowCount: actionNow.length,
    cashAtRisk,
    sentCount: sent.length,
    signedCount: signed.length,
    lateDepositCount: lateDeposits.length,
  });

  const urgencyMode = computeUrgencyMode({
    tensionLevel,
    systemState,
    priorityActions,
  });
  

  // =========================
  // 8. RETURN
  // =========================
  const metrics: Metrics = {
    // Bases
    signed,
    sent,
    healthy,
    lateDeposits,

    // War Room
    warRoom: {
      studies: warRoomWithPrediction,
      count: warRoomWithPrediction.length,
      ca: warRoomCA,
    },

    // Financier
    finance: {
      riskyDeposits,
      cashAtRisk,
    },

    // Action immédiate
    actionNow,

    // Comportement
    behavioral: {
      muets,
      agites,
      interesses,
      fatigues,
    },

    // État global
    systemState,
    // Décision principale
    priorityCase,
    tensionLevel,
    priorityActions,
    urgencyMode,
  };

  const financialStats = computeFinancialStats(studies, metrics);

  return {
    ...metrics,
    financialStats,
  };
}
