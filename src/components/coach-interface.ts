// ═══════════════════════════════════════════════════════════
//          INTERFACE COACH — SPEECHVIEW V1.0
// ═══════════════════════════════════════════════════════════

/**
 * Interface de communication entre SpeechView et le Coach
 * 
 * Le Coach utilise ces données pour adapter SILENCIEUSEMENT :
 * - L'ordre des modules
 * - Le wording des titres
 * - Les infobulles
 * - Les transitions
 * - La synthèse finale
 * 
 * ❌ JAMAIS les chiffres, calculs, hypothèses
 */

// ═══════════════════════════════════════════════════════════
//                     TYPES DE BASE
// ═══════════════════════════════════════════════════════════

/**
 * Profils psychologiques détectés
 */
export type BaseProfile = "senior" | "banquier" | "standard";

/**
 * Profils incluant l'état hybride (avant normalisation)
 */
export type BrainProfile = BaseProfile | "hybride";

/**
 * Scores bruts par profil
 */
export type ScoreMap = Record<BaseProfile, number>;

// ═══════════════════════════════════════════════════════════
//                  SIGNAUX PSYCHOLOGIQUES
// ═══════════════════════════════════════════════════════════

/**
 * Signaux psychologiques transmis au Coach
 * 
 * Ces signaux permettent une adaptation fine SANS modifier
 * les données factuelles (prix, production, ROI).
 */
export interface PsychoSignals {
  /**
   * Client a peur de se tromper
   * → Activer approche sécurisante
   */
  peurDeSeTromper: boolean;

  /**
   * Client a besoin de chiffres précis
   * → Activer tableaux détaillés
   */
  besoinDeChiffres: boolean;

  /**
   * Client sensible à l'urgence
   * → Peut activer scarcity (dosée)
   */
  urgencePercue: boolean;

  /**
   * Client indécis
   * → Approche progressive, validations multiples
   */
  indecision: boolean;

  /**
   * Profil dominant final (normalisé)
   */
  profilDominant: BaseProfile;

  /**
   * Score maximum atteint
   */
  scoreMax: number;

  /**
   * Écart entre 1er et 2ème profil
   * Plus l'écart est faible, plus l'indécision est forte
   */
  ecartProfils: number;
}

// ═══════════════════════════════════════════════════════════
//                  RÉSULTAT DÉTECTION
// ═══════════════════════════════════════════════════════════

/**
 * Données complètes transmises au Coach après le quiz
 */
export interface DetectionAlerts {
  incoherentAnswers: boolean;      // Contradictions déclaratives
  fatigueSuspected: boolean;       // ≥2 réponses "Je ne sais pas"
  fatigueCritical: boolean;        // ≥3 réponses "Je ne sais pas"
  profileUncertain: boolean;       // Écart faible entre profils
  banquierFaible: boolean;         // Score banquier <4 → suspect
}

export interface ProfileDetectionResult {
  /**
   * Profil normalisé final
   * C'est lui qui guide l'adaptation principale
   */
  profile: BaseProfile;

  /**
   * Signaux psychologiques détaillés
   * Permettent des micro-adaptations
   */
  signals: PsychoSignals;

  /**
   * Alertes (garde-fous)
   */
  alerts: DetectionAlerts;

  /**
   * Scores bruts (pour debug/analyse)
   */
  rawScores: ScoreMap;

  /**
   * Nombre de réponses neutres
   */
  neutralAnswersCount: number;

  /**
   * Timestamp pour audit
   */
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════
//                  CONFIGURATION COACH
// ═══════════════════════════════════════════════════════════

/**
 * Configuration adaptative du Coach selon le profil
 * 
 * Le Coach utilise cette config pour adapter la narration
 * SANS toucher aux données factuelles.
 */
export interface CoachConfiguration {
  /**
   * Ordre des modules à afficher
   * 
   * Exemple Senior : ["securite", "garanties", "technique", "roi"]
   * Exemple Banquier : ["roi", "production", "financement", "securite"]
   */
  moduleOrder: string[];

  /**
   * Vocabulaire prioritaire
   * 
   * Exemple Senior : ["garanti", "protégé", "sécurisé", "rassuré"]
   * Exemple Banquier : ["calculé", "vérifié", "précis", "cohérent"]
   */
  priorityWords: string[];

  /**
   * Mots à éviter
   * 
   * Exemple Senior : ["opportunité limitée", "dernière chance"]
   * Exemple Banquier : ["à peu près", "en gros"]
   */
  avoidWords: string[];

  /**
   * Niveau de détail technique
   * 
   * senior: "low" (juste l'essentiel)
   * banquier: "high" (tout détailler)
   * standard: "medium" (équilibré)
   */
  technicalDetail: "low" | "medium" | "high";

  /**
   * Tempo de présentation
   * 
   * senior: "slow" (laisser respirer)
   * banquier: "methodical" (progressif analytique)
   * standard: "fast" (aller à l'essentiel)
   */
  presentationTempo: "slow" | "methodical" | "fast";

  /**
   * Activation de la scarcity
   * 
   * senior: false ou très dosée
   * standard: true si urgencePercue
   */
  enableScarcity: boolean;

  /**
   * Style de synthèse finale
   * 
   * senior: Insister garanties + pérennité
   * banquier: Récap chiffré clair
   * standard: Gain net mensuel
   */
  summaryStyle: "security" | "analytical" | "concrete";
}

// ═══════════════════════════════════════════════════════════
//              CONFIGURATIONS PAR PROFIL
// ═══════════════════════════════════════════════════════════

/**
 * Configurations prédéfinies par profil
 * Le Coach sélectionne la config selon le profil détecté
 */
export const COACH_CONFIGS: Record<BaseProfile, CoachConfiguration> = {
  senior: {
    moduleOrder: ["securite", "garanties", "technique", "roi"],
    priorityWords: ["garanti", "protégé", "sécurisé", "rassuré", "pérenne"],
    avoidWords: ["opportunité limitée", "dernière chance", "rapidement"],
    technicalDetail: "low",
    presentationTempo: "slow",
    enableScarcity: false,
    summaryStyle: "security",
  },

  banquier: {
    moduleOrder: ["roi", "production", "financement", "securite"],
    priorityWords: ["calculé", "vérifié", "précis", "cohérent", "transparent"],
    avoidWords: ["à peu près", "en gros", "environ", "approximativement"],
    technicalDetail: "high",
    presentationTempo: "methodical",
    enableScarcity: false,
    summaryStyle: "analytical",
  },

  standard: {
    moduleOrder: ["economies", "financement", "roi", "securite"],
    priorityWords: ["concret", "gain", "budget", "économie", "dès l'an 1"],
    avoidWords: ["complexe", "détaillé", "technique"],
    technicalDetail: "medium",
    presentationTempo: "fast",
    enableScarcity: true, // Si urgencePercue
    summaryStyle: "concrete",
  },
};

// ═══════════════════════════════════════════════════════════
//              ADAPTATIONS MICRO (EXEMPLES)
// ═══════════════════════════════════════════════════════════

/**
 * Adaptations de wording selon le profil
 * Ces fonctions sont utilisées par le Coach pour adapter
 * les textes SANS changer les données.
 */
export const WORDING_ADAPTATIONS = {
  /**
   * Titre du module ROI
   */
  roiTitle: {
    senior: "Votre sécurité financière",
    banquier: "Analyse détaillée du retour sur investissement",
    standard: "Vos économies dès la première année",
  },

  /**
   * Titre du module Sécurité
   */
  securityTitle: {
    senior: "Votre protection complète",
    banquier: "Garanties et certifications",
    standard: "EDF : 100 ans d'expérience",
  },

  /**
   * Phrase de transition vers la signature
   */
  closingPhrase: {
    senior: "Vous êtes protégé, les garanties sont là. Vous pouvez avancer sereinement.",
    banquier: "Les chiffres sont vérifiés, tout est cohérent. Vous avez tous les éléments.",
    standard: "Vous gagnez dès l'an 1, c'est clair. On peut finaliser si vous êtes prêt.",
  },

  /**
   * Infobulle sur la production
   */
  productionTooltip: {
    senior: "Production garantie par EDF, certifiée par l'État",
    banquier: "Calcul basé sur données météo 30 ans + rendement panneaux certifié",
    standard: "Production = argent économisé chaque mois",
  },
};

// ═══════════════════════════════════════════════════════════
//                  FONCTION UTILITAIRE
// ═══════════════════════════════════════════════════════════

/**
 * Génère la configuration Coach à partir du résultat de détection
 * 
 * @param result - Résultat du quiz SpeechView
 * @returns Configuration Coach adaptée
 */
export function generateCoachConfig(
  result: ProfileDetectionResult
): CoachConfiguration {
  // Config de base selon le profil
  const baseConfig = { ...COACH_CONFIGS[result.profile] };

  // Micro-adaptations selon les signaux

  // Si indécision forte → ralentir tempo
  if (result.signals.indecision) {
    baseConfig.presentationTempo = "slow";
  }

  // Si besoin de chiffres élevé → augmenter détail
  if (result.signals.besoinDeChiffres && baseConfig.technicalDetail !== "high") {
    baseConfig.technicalDetail = "medium";
  }

  // Si urgence perçue ET profil Standard → activer scarcity
  // MAIS seulement si AUCUNE peur (garde-fou annulation)
  if (
    result.signals.urgencePercue &&
    result.profile === "standard" &&
    !result.signals.peurDeSeTromper
  ) {
    baseConfig.enableScarcity = true;
  } else {
    // Sinon désactiver (sécurité)
    baseConfig.enableScarcity = false;
  }

  return baseConfig;
}
