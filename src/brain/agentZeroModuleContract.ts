// 🦅 AGENT ZERO MODULE CONTRACT
// Ce fichier définit le "dictionnaire de traduction" entre le cerveau (Agent Zero) et le corps (Dashboard).
// Il est crucial pour que l'IA puisse piloter l'UI sans connaître les détails d'implémentation locaux.

export const AGENT_ZERO_TO_LOCAL_MODULE_MAP: Record<string, string> = {
  constat: "repartition",            // Situation actuelle (Facture, Répartition)
  solution: "projection",            // Projection long terme (Solaire vs Sans Solaire)
  "garanties-long-terme": "garanties", // Garanties & Sécurité
  "prise-en-charge-admin": "garanties", // 🆕 Mapping pour le "Minimal Path" (Fatigue)
  budget: "taux",                    // Structure financière (Mensualités, Taux)
  synthese: "comparateur",           // Synthèse par arbitrage (Comparateur simple)
  
  // ✅ MAPPINGS AJOUTÉS (AUDIT 04/02)
  decision: "decision",              // Module de décision final
  autonomie: "repartition",          // Standard Coach: "Autonomie" -> Situation actuelle (Dashboard n'a pas de module 'autonomie' isolé)
  risque: "garanties",               // Banquier Coach: "Risque" -> Garanties (Risque technique/réglementaire couvert par garanties)
} as const;

export type AgentZeroModuleId = keyof typeof AGENT_ZERO_TO_LOCAL_MODULE_MAP;
