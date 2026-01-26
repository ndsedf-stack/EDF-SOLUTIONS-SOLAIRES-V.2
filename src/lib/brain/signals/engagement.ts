import { BrainEntity } from "../types";
import { BrainSignal } from "./types";
import { Study } from "@/brain/types";

// Helper to check anomalies logic locally without import loop
// Logic from existing detectAnomalies: 
// sent && views > 5 && clicks == 0 -> View Threshold 5
// signed && diffDays > 3 && views < 2 -> Day Threshold 3

import { SIGNALS_CATALOG } from "./signalsRegistry";

export function detectEngagementSignals(study: Study): BrainSignal[] {
  const signals: BrainSignal[] = [];
  const now = new Date().toISOString();
  
  const views = study.views || 0;
  const clicks = study.clicks || 0;
  const sendCount = study.send_count || 0;

  // 1. COMPORTEMENT : MUET
  if (views === 0 && clicks === 0) {
      const def = SIGNALS_CATALOG.ENGAGEMENT_MUTED;
      signals.push({
          id: `SIG-ENG-MUET-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 1.0,
          label: def.label,
          description: "Aucune interaction détectée.",
          detectedAt: now,
          source: "behavior_engine"
      });
  }

  // 2. COMPORTEMENT : FATIGUE
  if (views === 0 && clicks === 0 && sendCount >= 4) {
      const def = SIGNALS_CATALOG.ENGAGEMENT_FATIGUE;
      signals.push({
          id: `SIG-ENG-FATIGUE-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 0.9,
          label: def.label,
          description: "4+ relances sans ouverture.",
          detectedAt: now,
          source: "behavior_engine"
      });
  }

  // 3. COMPORTEMENT : AGITÉ
  if (views >= 3 && clicks === 0) {
      const def = SIGNALS_CATALOG.ENGAGEMENT_AGITATED;
      signals.push({
          id: `SIG-ENG-AGITE-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 0.8,
          label: def.label,
          description: "Consulte le dossier sans agir.",
          detectedAt: now,
          source: "behavior_engine",
          metadata: { views }
      });
  }

  // 4. ANOMALIE : Sent + High Views + No Clicks
  if (study.status === 'sent' && views > 5 && clicks === 0) {
       const def = SIGNALS_CATALOG.ENGAGEMENT_ANOMALY_HIGH_VIEWS;
       signals.push({
          id: `SIG-ENG-ANOMALY-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 0.85,
          label: def.label,
          description: "Nombre de vues élevé sans clic.",
          detectedAt: now,
          source: "anomaly_detector"
      });
  }

   // 5. ANOMALIE : Signed + Low Views + Time Passed
   if (study.status === 'signed' && study.diffDays > 3 && views < 2) {
      const def = SIGNALS_CATALOG.ENGAGEMENT_ANOMALY_LOW_VIEWS;
      signals.push({
          id: `SIG-ENG-ANOMALY-LOW-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 0.85,
          label: def.label,
          description: "Signé mais ne consulte pas le suivi.",
          detectedAt: now,
          source: "anomaly_detector"
      });
  }

   // 6. INTENTION : Gold Rush (Vues fréquentes)
   if (views >= 10) {
       const def = SIGNALS_CATALOG.ENGAGEMENT_VIEW_FREQUENT;
       signals.push({
           id: `SIG-ENG-GOLDRUSH-${study.id}`,
           code: def.code,
           domain: def.domain,
           severity: def.defaultSeverity,
           confidence: 0.95,
           label: def.label,
           description: "Fréquence de consultation extrême - Intention d'achat imminente.",
           detectedAt: now,
           source: "intent_engine",
           metadata: { views }
       });
   }

   // 7. COMPORTEMENT : POWER USER (Ambassadeur)
   if (views >= 15 && study.status === 'signed' && study.deposit_paid) {
       const def = SIGNALS_CATALOG.ENGAGEMENT_ACTIVE_POWER_USER;
       signals.push({
           id: `SIG-ENG-POWER-${study.id}`,
           code: def.code,
           domain: def.domain,
           severity: def.defaultSeverity,
           confidence: 0.9,
           label: def.label,
           description: "Client hyper-actif sur le suivi. Candidat au parrainage.",
           detectedAt: now,
           source: "behavior_engine"
       });
   }

   // 8. ALERTE : STAGNATION (Pipe froid)
   if (study.status === 'sent' && study.diffDays > 14 && views < 3) {
       const def = SIGNALS_CATALOG.ENGAGEMENT_STAGNATION;
       signals.push({
           id: `SIG-ENG-STAG-${study.id}`,
           code: def.code,
           domain: def.domain,
           severity: def.defaultSeverity,
           confidence: 0.8,
           label: def.label,
           description: "Offre stagnante depuis 14j+ sans interaction.",
           detectedAt: now,
           source: "behavior_engine"
       });
   }

   // 9. ALERTE : GHOSTING (Signé mais muet)
   if (study.status === 'signed' && study.diffDays > 3 && views === 0) {
       const def = SIGNALS_CATALOG.ENGAGEMENT_ANOMALY_GHOSTING;
       signals.push({
           id: `SIG-ENG-GHOST-${study.id}`,
           code: def.code,
           domain: def.domain,
           severity: def.defaultSeverity,
           confidence: 0.9,
           label: def.label,
           description: "Signé mais aucune consultation depuis 72h+.",
           detectedAt: now,
           source: "anomaly_detector"
       });
   }

   // 10. OPPORTUNITÉ : REAWAKENED (Réveil Phoenix)
   if (study.views > 2 && study.diffDays > 30) {
        const def = SIGNALS_CATALOG.ENGAGEMENT_REAWAKENED;
        signals.push({
            id: `SIG-ENG-PHOENIX-${study.id}`,
            code: def.code,
            domain: def.domain,
            severity: def.defaultSeverity,
            confidence: 0.85,
            label: def.label,
            description: "Ancienne offre consultée après une longue période d'inactivité.",
            detectedAt: now,
            source: "intent_engine"
        });
   }

   // 11. BAISSE D'ACTIVITÉ
   if (study.status === 'signed' && study.diffDays > 2 && study.views < 2) {
        const def = SIGNALS_CATALOG.ENGAGEMENT_LOW_ACTIVITY;
        signals.push({
            id: `SIG-ENG-LOW-${study.id}`,
            code: def.code,
            domain: def.domain,
            severity: def.defaultSeverity,
            confidence: 0.7,
            label: def.label,
            description: "Activité faible sur le suivi du dossier.",
            detectedAt: now,
            source: "behavior_engine"
        });
   }

  return signals;
}
