import { Study } from "../types";
import { getDaysSince } from "../../utils/dates";
import { computeBehavioralRisk } from "../intelligence/behavior";

// =========================
// SCORE DE DANGER — WAR ROOM
// =========================
export function computeDangerScore(study: Study): number {
  // Poids Manifeste (Ajustables)
  const W_TIME = 0.5;
  const W_VALUE = 0.3;
  const W_BEHAVIOR = 0.2;

  // 1. TIME SCORE (0-100)
  // Plus on s'éloigne de la signature, plus c'est grave.
  // Cap à 14 jours (délai rétractation)
  let timeScore = 0;
  if (study.signed_at) {
    const days = getDaysSince(study.signed_at);
    timeScore = Math.min((days / 14) * 100, 100);
  }

  // 2. VALUE SCORE (0-100)
  // Plus c'est cher, plus le stress est haut.
  // Cap à 30k€
  const amount = study.total_price || 0;
  const valueScore = Math.min((amount / 30000) * 100, 100);

  // 3. BEHAVIOR SCORE (0-100)
  // Impact psychologique direct
  const behavior = computeBehavioralRisk(study);
  let behaviorScore = 0;
  if (behavior === "stable") behaviorScore = 0;
  if (behavior === "interesse") behaviorScore = 20;
  if (behavior === "agite") behaviorScore = 60;
  if (behavior === "muet") behaviorScore = 80;
  if (behavior === "fatigue") behaviorScore = 100;

  // 🚀 CVI PRESSURE BOOST (Send Count)
  const sendCount = study.send_count || 0;
  if (sendCount > 5) behaviorScore = Math.min(behaviorScore + 20, 100);


  // FORMULE MANIFESTE : PONDÉRATION
  const rawScore = (timeScore * W_TIME) + (valueScore * W_VALUE) + (behaviorScore * W_BEHAVIOR);

  // CLAMP 0-100
  return Math.min(100, Math.round(rawScore));
}
