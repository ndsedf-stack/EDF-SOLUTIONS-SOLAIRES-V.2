import { Study } from "../types";
import { computeBehavioralRisk } from "../intelligence/behavior";
import { getDaysSince } from "../../utils/dates";

// =========================
// ACTION RECOMMANDÉE
// =========================
export function recommendAction(study: Study & { dangerScore?: number }) {
  const behavior = computeBehavioralRisk(study);

  if (behavior === "fatigue") return "STOP_AUTO_CALL"; // 🚀 RAJOUT
  if (behavior === "muet") return "CALL";
  if (behavior === "agite") return "RELANCE";
  if (behavior === "interesse") return "ACCELERER";

  if ((study.dangerScore || 0) > 70) return "CALL";

  return "SURVEILLER";
}

// =========================
// DOSSIER PRIORITAIRE
// =========================
export function computePriorityCase(
  warRoomWithPrediction: (Study & { dangerScore: number })[]
) {
  if (warRoomWithPrediction.length === 0) return null;

  const top = warRoomWithPrediction[0];
  const behavior = computeBehavioralRisk(top);
  const action = recommendAction(top);

  let reason = "Dossier prioritaire";

  if (behavior === "muet")
    reason = "Client muet après signature, risque de décrochage";
  else if (behavior === "fatigue") reason = "Lead brûlé : 0 interaction après relances multiples"; // 🚀 RAJOUT
  else if (behavior === "agite") reason = "Client agité, consulte sans avancer";
  else if (behavior === "interesse")
    reason = "Client intéressé, moment clé pour conclure";

  if (top.dangerScore > 70)
    reason = "Risque critique (temps + argent + comportement)";

  return {
    id: top.id,
    name: top.name,
    email: top.email,
    phone: top.phone,
    dangerScore: top.dangerScore,
    behavior,
    action,
    reason,
    daysSinceSigned: top.signed_at ? getDaysSince(top.signed_at) : null,
    total_price: top.total_price || 0,
    requiresDeposit: top.requiresDeposit || false,
    // ✅ FIX: Passer les champs de contexte pour l'UI
    status: top.status,
    signed_at: top.signed_at,
    created_at: top.created_at, 
    last_view: top.last_view
  };
}

// =========================
// TOP PRIORITÉS — ACTIONS
// =========================
export function computePriorityActions(
    warRoomWithPrediction: (Study & { dangerScore: number })[]
  ) {
    return warRoomWithPrediction.slice(0, 3).map((s, index) => {
      const behavior = computeBehavioralRisk(s);
      const action = recommendAction(s);
  
      let reason = "Suivi standard";
  
      if (behavior === "muet") reason = "Client muet, risque de décrochage";
      else if (behavior === "agite") reason = "Client agité, bloque mentalement";
      else if (behavior === "interesse") reason = "Client intéressé, moment clé";
  
      if (s.dangerScore > 70)
        reason = "Risque critique (temps + argent + comportement)";
  
      return {
        rank: index + 1,
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        dangerScore: s.dangerScore,
        behavior,
        action,
        reason,
        total_price: s.total_price || 0,
        requiresDeposit: s.requiresDeposit || false,
        // ✅ FIX: Passer les champs de contexte pour l'UI
        status: s.status,
        signed_at: s.signed_at,
        created_at: s.created_at, 
        last_view: s.last_view
      };
    });
  }
