import { Study, SystemState } from "../types";
import { CRITICAL_CASES, WARNING_CASES, CRITICAL_CASH, WARNING_CASH } from "../config";

// =========================
// TENSION GLOBALE DU SYSTÈME
// =========================
export function computeTensionLevel(
  warRoomWithPrediction: (Study & { dangerScore: number })[],
  cashAtRisk: number
) {
  if (warRoomWithPrediction.length === 0 && cashAtRisk === 0) return 0;

  const avgDanger =
    warRoomWithPrediction.length > 0
      ? warRoomWithPrediction.reduce((s, w) => s + w.dangerScore, 0) /
        warRoomWithPrediction.length
      : 0;

  let tension = avgDanger;

  // pression volume
  tension += warRoomWithPrediction.length * 5;

  // pression financière
  tension += Math.min(cashAtRisk / 5000, 30);

  return Math.min(100, Math.round(tension));
}

// =========================
// ÉTAT GLOBAL DU SYSTÈME
// =========================
export function computeSystemState(params: {
  actionNowCount: number;
  cashAtRisk: number;
  sentCount: number;
  signedCount: number;
  lateDepositCount: number;
}): SystemState {
  if (params.lateDepositCount > 0) {
    return "critical";
  }

  const { actionNowCount, cashAtRisk, sentCount, signedCount } = params;

  if (actionNowCount >= CRITICAL_CASES || cashAtRisk > CRITICAL_CASH) {
    return "critical";
  }

  if (actionNowCount >= WARNING_CASES || cashAtRisk > WARNING_CASH) {
    return "warning";
  }

  if (sentCount >= 5 || signedCount >= 3) {
    return "active";
  }

  return "stable";
}
