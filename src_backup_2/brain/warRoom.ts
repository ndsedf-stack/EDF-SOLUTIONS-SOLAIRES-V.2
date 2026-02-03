import { Study } from "./types";
import { getDaysSince } from "../utils/dates";
import { WAR_ROOM_DAYS } from "./config";

// =========================
// WAR ROOM — SIGNÉS RÉCENTS SANS ACOMPTE
// =========================
export function isInWarRoom(study: Study): boolean {
  if (study.status !== "signed") return false;
  if (study.has_deposit !== true) return false; // ✅ clé
  if (study.deposit_paid === true) return false; // ✅ clé
  if (!study.signed_at) return false;

  const days = getDaysSince(study.signed_at);
  return days <= WAR_ROOM_DAYS;
}

// =========================
// RISQUE FINANCIER — ACOMPTE
// =========================
export function hasFinancialRisk(study: Study) {
  if (study.status !== "signed") return false;

  // ✅ Risque uniquement si acompte prévu et non payé
  if (study.has_deposit === true && study.deposit_paid === false) {
    return true;
  }

  return false;
}

export function isLateDeposit(study: Study) {
    if (study.status !== "signed") return false;
    if (study.has_deposit !== true) return false;
    if (study.deposit_paid === true) return false;
    if (!study.signed_at) return false;
  
    const days = getDaysSince(study.signed_at);
    return days > 10; // ⏰ règle métier (modifie si tu veux)
  }
