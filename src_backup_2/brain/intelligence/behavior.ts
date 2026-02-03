import { Study } from "../types";

export function computeBehavioralRisk(
  study: Study
): "muet" | "cas_limite" | "agite" | "interesse" | "stable" | "fatigue" {
  const views = study.views || 0;
  const clicks = study.clicks || 0;
  const sendCount = study.send_count || 0;

  // 🚀 RAJOUT : FATIGUE (Plus de 4 envois sans aucune vue)
  if (views === 0 && clicks === 0 && sendCount >= 4) return "fatigue";
  
  // MUET : aucune interaction
  if (views === 0 && clicks === 0) return "muet";

  // CAS LIMITE : trop d'engagement (> 10 views)
  if (views > 10) return "cas_limite";

  // AGITÉ : beaucoup de vues sans clic
  if (views >= 3 && clicks === 0) return "agite";

  // INTÉRESSÉ : au moins 1 clic
  if (clicks >= 1) return "interesse";

  // STABLE : engagement normal
  return "stable";
}
