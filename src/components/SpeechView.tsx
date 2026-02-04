// ═══════════════════════════════════════════════════════════
//  SPEECHVIEW v1.1 — SAFE (Compatible Bible Agent Zero)
//  
//  RÈGLES ABSOLUES (NON NÉGOCIABLES) :
//  - SPEECHVIEW ne décide JAMAIS
//  - Il détecte + alerte
//  - Agent Zero a le dernier mot
//  - Un profil peut devenir plus prudent, jamais plus agressif
//  - En cas de doute → bascule Senior (protection J+7)
// ═══════════════════════════════════════════════════════════

import React, { useState } from "react";

// ═══════════════════════════════════════════════════════════
//                 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════

export type BaseProfile = "senior" | "banquier" | "standard";
type BrainProfile = BaseProfile | "hybride";
type ScoreMap = Record<BaseProfile, number>;

/**
 * Alertes de détection (NON des décisions)
 * Ces alertes sont transmises à Agent Zero qui décide quoi en faire
 */
export interface DetectionAlerts {
  incoherentAnswers: boolean;      // Contradictions déclaratives
  fatigueSuspected: boolean;       // ≥2 réponses "Je ne sais pas"
  fatigueCritical: boolean;        // ≥3 réponses "Je ne sais pas"
  profileUncertain: boolean;       // Écart faible entre profils
  banquierFaible: boolean;         // Score banquier <4 → suspect
}

/**
 * Signaux psychologiques détectés
 */
export interface PsychoSignals {
  peurDeSeTromper: boolean;      // Score Senior élevé
  besoinDeChiffres: boolean;     // Score Banquier élevé
  urgencePercue: boolean;        // Score Standard élevé
  indecision: boolean;           // Écart faible entre profils
  profilDominant: BaseProfile;   // Profil final normalisé
  scoreMax: number;              // Score le plus élevé
  ecartProfils: number;          // Différence entre 1er et 2ème
}

/**
 * Résultat final transmis à Agent Zero
 */
export interface ProfileDetectionResult {
  profile: BaseProfile;
  signals: PsychoSignals;
  alerts: DetectionAlerts;
  rawScores: ScoreMap;
  neutralAnswersCount: number;    // Nombre de "Je ne sais pas"
  timestamp: string;               // Pour audit
}

// ═══════════════════════════════════════════════════════════
//                 QUESTIONS DU QUIZ
// ═══════════════════════════════════════════════════════════

/**
 * 4 QUESTIONS PRINCIPALES + Option "Je ne sais pas"
 */
const questions = [
  {
    q: "Pour bien comprendre un projet, vous préférez :",
    answers: [
      {
        text: "Être rassuré sur tous les aspects",
        scores: { senior: 2, banquier: 0, standard: 1 },
      },
      {
        text: "Voir les chiffres en détail",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Partir d'exemples concrets",
        scores: { senior: 1, banquier: 0, standard: 2 },
      },
      {
        text: "Je ne sais pas / Ça dépend",
        scores: { senior: 1, banquier: 1, standard: 1 },
        neutral: true,
      },
    ],
  },
  {
    q: "Ce qui compte le plus pour vous dans ce projet :",
    answers: [
      {
        text: "La fiabilité et la tranquillité",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "La cohérence financière",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Des bénéfices concrets visibles rapidement", // AJUSTEMENT SÉCURITÉ
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
      {
        text: "Je ne sais pas / Ça dépend",
        scores: { senior: 1, banquier: 1, standard: 1 },
        neutral: true,
      },
    ],
  },
  {
    q: "Si vous deviez avancer aujourd'hui, ce serait parce que :",
    answers: [
      {
        text: "Vous êtes certain de votre décision",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "Tout est clair et vérifié",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Le contexte est aligné pour avancer", // AJUSTEMENT NEUTRE
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
      {
        text: "Je ne sais pas / Ça dépend",
        scores: { senior: 1, banquier: 1, standard: 1 },
        neutral: true,
      },
    ],
  },
  {
    q: "Quand vous prenez une décision importante :",
    answers: [
      {
        text: "Vous prenez le temps de tout vérifier",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "Vous comparez toutes les options",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Vous agissez quand c'est évident",
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
      {
        text: "Je ne sais pas / Ça dépend",
        scores: { senior: 1, banquier: 1, standard: 1 },
        neutral: true,
      },
    ],
  },
];

/**
 * QUESTION BONUS (déclenchée si profil hybride)
 */
const bonusQuestion = {
  q: "Une dernière chose : face à une nouveauté, vous êtes plutôt :",
  answers: [
    {
      text: "Prudent — vous attendez de voir",
      scores: { senior: 3, banquier: 0, standard: 0 },
    },
    {
      text: "Analytique — vous voulez comprendre",
      scores: { senior: 0, banquier: 3, standard: 0 },
    },
    {
      text: "Pragmatique — si ça marche, pourquoi pas",
      scores: { senior: 0, banquier: 0, standard: 3 },
    },
    {
      text: "Je ne sais pas / Ça dépend",
      scores: { senior: 1, banquier: 1, standard: 1 },
      neutral: true,
    },
  ],
};

/**
 * ⚠️ QUESTION VALIDATION FINALE (OPTIONNELLE)
 * À activer UNIQUEMENT si erreurs terrain fréquentes
 * Commentée par défaut
 */
/*
const validationQuestion = {
  q: "Pour résumer, vous êtes plutôt :",
  answers: [
    {
      text: "Quelqu'un qui prend son temps",
      profile: "senior" as BaseProfile,
    },
    {
      text: "Quelqu'un qui vérifie tout",
      profile: "banquier" as BaseProfile,
    },
    {
      text: "Quelqu'un qui sait ce qu'il veut",
      profile: "standard" as BaseProfile,
    },
  ],
};
*/

// ═══════════════════════════════════════════════════════════
//                 LOGIQUE DE DÉTECTION
// ═══════════════════════════════════════════════════════════

/**
 * Détecte le profil brut (avant normalisation)
 */
function detectProfile(scores: ScoreMap): BrainProfile {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const ecart = sorted[0][1] - sorted[1][1];
  
  // Si écart ≤1 → hybride (indécision)
  if (ecart <= 1) return "hybride";
  
  return sorted[0][0] as BrainProfile;
}

/**
 * Détection des contradictions déclaratives
 * Exemple : Senior élevé + Standard élevé = incohérent
 */
function detectIncoherence(scores: ScoreMap): boolean {
  const seniorHigh = scores.senior >= 5;
  const standardHigh = scores.standard >= 5;
  
  // Sécurité + Opportunité en même temps = suspect
  return seniorHigh && standardHigh;
}

/**
 * Détection fatigue cognitive
 */
function detectFatigue(neutralCount: number): boolean {
  return neutralCount >= 2;
}

/**
 * Détection fatigue CRITIQUE
 */
function detectFatigueCritical(neutralCount: number): boolean {
  return neutralCount >= 3;
}

/**
 * Détection "Banquier faible" (score <4)
 * Un faux banquier est plus dangereux qu'un faux senior
 */
function detectBanquierFaible(profile: BrainProfile, scores: ScoreMap): boolean {
  return profile === "banquier" && scores.banquier < 4;
}

/**
 * Normalisation du profil (priorité prudence)
 * 
 * RÈGLE ABSOLUE :
 * Un profil peut devenir plus prudent, JAMAIS plus agressif
 */
function normalizeProfile(
  p: BrainProfile,
  scores: ScoreMap,
  neutralCount: number
): BaseProfile {
  // 1. Si hybride → Senior (sécurisation)
  if (p === "hybride") return "senior";
  
  // 2. Si Banquier MAIS score faible (<4) → Senior
  if (p === "banquier" && scores.banquier < 4) {
    return "senior";
  }
  
  // 3. Si Senior proche du gagnant (≤2 points) → Senior
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][0];
  const scoreWinner = sorted[0][1];
  const scoreSenior = scores.senior;
  
  if (winner !== "senior" && scoreWinner - scoreSenior <= 2) {
    return "senior";
  }
  
  // 4. Si fatigue critique (≥3 neutres) → Senior
  if (neutralCount >= 3) {
    return "senior";
  }
  
  return p as BaseProfile;
}

/**
 * Calcul des signaux psychologiques
 */
function calculateSignals(
  finalProfile: BaseProfile,
  scores: ScoreMap
): PsychoSignals {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const scoreMax = sorted[0][1];
  const ecart = sorted[0][1] - sorted[1][1];

  return {
    peurDeSeTromper: scores.senior >= 6,
    besoinDeChiffres: scores.banquier >= 6,
    urgencePercue: scores.standard >= 6,
    indecision: ecart <= 2,
    profilDominant: finalProfile,
    scoreMax,
    ecartProfils: ecart,
  };
}

/**
 * Calcul des alertes (GARDE-FOUS)
 */
function calculateAlerts(
  scores: ScoreMap,
  neutralCount: number,
  profile: BrainProfile,
  signals: PsychoSignals
): DetectionAlerts {
  return {
    incoherentAnswers: detectIncoherence(scores),
    fatigueSuspected: detectFatigue(neutralCount),
    fatigueCritical: detectFatigueCritical(neutralCount),
    profileUncertain: signals.indecision,
    banquierFaible: detectBanquierFaible(profile, scores),
  };
}

// ═══════════════════════════════════════════════════════════
//                 COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════

interface SpeechViewProps {
  onProfileDetected: (result: ProfileDetectionResult) => void;
}

export function SpeechView({ onProfileDetected }: SpeechViewProps) {
  const [step, setStep] = useState<"quiz" | "bonus" | "done">("quiz");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<ScoreMap>({
    senior: 0,
    banquier: 0,
    standard: 0,
  });
  const [neutralCount, setNeutralCount] = useState(0);

  /**
   * Gestion réponse question principale
   */
  function handleAnswer(score: Partial<ScoreMap>, isNeutral: boolean = false) {
    const nextScores = {
      senior: scores.senior + (score.senior || 0),
      banquier: scores.banquier + (score.banquier || 0),
      standard: scores.standard + (score.standard || 0),
    };
    setScores(nextScores);
    
    const nextNeutralCount = neutralCount + (isNeutral ? 1 : 0);
    setNeutralCount(nextNeutralCount);

    // Dernière question des 4 principales
    if (questionIndex === questions.length - 1) {
      const detected = detectProfile(nextScores);

      // Si hybride → question bonus
      if (detected === "hybride") {
        setStep("bonus");
      } else {
        // Sinon → finalisation
        finalizeDetection(nextScores, nextNeutralCount);
      }
    } else {
      // Question suivante
      setQuestionIndex(questionIndex + 1);
    }
  }

  /**
   * Gestion réponse question bonus
   */
  function handleBonusAnswer(score: Partial<ScoreMap>, isNeutral: boolean = false) {
    const finalScores = {
      senior: scores.senior + (score.senior || 0),
      banquier: scores.banquier + (score.banquier || 0),
      standard: scores.standard + (score.standard || 0),
    };
    const finalNeutralCount = neutralCount + (isNeutral ? 1 : 0);
    finalizeDetection(finalScores, finalNeutralCount);
  }

  /**
   * Finalisation : calcul profil + signaux + alertes + transmission
   */
  function finalizeDetection(finalScores: ScoreMap, finalNeutralCount: number) {
    // 1. Détection brute
    const detected = detectProfile(finalScores);
    
    // 2. Normalisation (priorité prudence)
    const normalizedProfile = normalizeProfile(detected, finalScores, finalNeutralCount);
    
    // 3. Signaux psychologiques
    const signals = calculateSignals(normalizedProfile, finalScores);
    
    // 4. Alertes (garde-fous)
    const alerts = calculateAlerts(finalScores, finalNeutralCount, detected, signals);

    // 5. 🔒 GARDE-FOU MAJEUR : Bascule prudente si doute
    const finalProfile: BaseProfile =
      alerts.incoherentAnswers || alerts.fatigueCritical || alerts.banquierFaible
        ? "senior"
        : normalizedProfile;

    setStep("done");

    // 6. Transmission à Agent Zero
    if (typeof onProfileDetected === "function") {
      onProfileDetected({
        profile: finalProfile,
        signals,
        alerts,
        rawScores: finalScores,
        neutralAnswersCount: finalNeutralCount,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  //                 RENDU
  // ═══════════════════════════════════════════════════════════

  if (step === "done") return null;

  // Question bonus
  if (step === "bonus") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 w-full">
        <div className="w-full max-w-2xl mx-auto bg-zinc-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
          {/* Progression : 100% (5/5) */}
          <div className="flex gap-2 mb-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full bg-blue-500"
              />
            ))}
          </div>

          <p className="text-xs text-zinc-400 mb-4 italic">
            Une dernière pour affiner — toujours sans bonne ou mauvaise réponse.
          </p>

          <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-wide mb-2">
            QUESTION BONUS
          </p>

          <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
            {bonusQuestion.q}
          </h2>

          <div className="space-y-4">
            {bonusQuestion.answers.map((a, i) => (
              <button
                key={i}
                onClick={() => {
                  setTimeout(() => handleBonusAnswer(a.scores, a.neutral), 600);
                }}
                className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white rounded-2xl transition-all"
              >
                {a.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Questions principales (1-4)
  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full">
      <div className="w-full max-w-2xl mx-auto bg-zinc-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
        {/* Progression visuelle */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= questionIndex ? "bg-blue-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Phrase neutralisante */}
        <p className="text-xs text-zinc-400 mb-4 italic">
          Aucune bonne ou mauvaise réponse — juste pour adapter la manière dont on vous explique les choses.
        </p>

        {/* Titre */}
        <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-wide mb-2">
          4 QUESTIONS — VOTRE SITUATION
        </p>

        {/* Question */}
        <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
          {questions[questionIndex].q}
        </h2>

        {/* Réponses */}
        <div className="space-y-4">
          {questions[questionIndex].answers.map((a, i) => (
            <button
              key={i}
              onClick={() => {
                setTimeout(() => handleAnswer(a.scores, a.neutral), 800);
              }}
              className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white rounded-2xl transition-all"
            >
              {a.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
