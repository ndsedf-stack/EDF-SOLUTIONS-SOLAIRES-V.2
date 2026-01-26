import { Study } from "../types";
import { getDaysSince } from "../../utils/dates";
import { computeBehavioralRisk } from "../intelligence/behavior";

// =========================
// SCORE DE DANGER — WAR ROOM
// =========================
export function computeDangerScore(study: Study): number {
  let score = 0;

  // 🧠 Comportement
  const behavior = computeBehavioralRisk(study);
  if (behavior === "muet") score += 40;
  if (behavior === "fatigue") score += 60; // 🚀 RAJOUT (Risque de perte totale)
  if (behavior === "agite") score += 25;
  if (behavior === "interesse") score += 10;

  // 🚀 RAJOUT : CVI PRESSURE (Poids de la relance acharnée)
  const sendCount = study.send_count || 0;
  score += Math.min(sendCount * 8, 40); 

  // ⏱️ Temps depuis signature
  if (study.signed_at) {
    const days = getDaysSince(study.signed_at);
    score += Math.min(days * 2, 30); // max 30 pts
  }

  // 💰 Argent exposé
  const amount = study.total_price || 0;
  if (amount > 0) {
    score += Math.min(amount / 1000, 30); // 30k€ = 30 pts
  }

  return Math.round(score);
}
