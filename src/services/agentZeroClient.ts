import axios from "axios";

interface DetectionAlerts {
  incoherentAnswers: boolean;
  fatigueSuspected: boolean;
  fatigueCritical: boolean;
  profileUncertain: boolean;
  banquierFaible: boolean;
}

export interface ProfileDetectionResult {
  profile: string;
  modes: {
    defiance: boolean;
    opportunity: boolean;
    fatigueCognitive: boolean;
  };
  signals: {
    peurDeSeTromper: boolean;
    besoinDeChiffres: boolean;
    urgencePercue: boolean;
    indecision: boolean;
  };
  alerts: DetectionAlerts;
  neutralAnswersCount: number;
  timestamp: string;
  state: {
    currentModule: string;
    timeElapsedSec: number;
    questionsAsked: string[];
  };
}

const FALLBACK_PLAN = {
  decision: "GO",
  strategy: "STANDARD",
  modules_sequence: ["constat", "solution", "budget"],
  focus_point: "SAVINGS",
  justification: "⚠️ MODE DÉGRADÉ (Fallback Service): API injoignable ou clé invalide. Stratégie par défaut appliquée.",
  script: "Compte tenu de votre profil, nous allons nous concentrer sur la maîtrise de votre budget."
};

export async function decideWithAgentZero(
  payload: ProfileDetectionResult
) {
  try {
    const response = await axios.post(
      "https://autopilote.pythonanywhere.com/decide",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "Titanium2025!", // <--- ON ÉCRIT LA CLÉ DIRECTEMENT ICI
        },
        timeout: 5000 // Fail fast
      }
    );
    return response.data;
  } catch (error: any) {
    console.warn("⚠️ [AGENT ZERO SERVICE] Connection Failed (Fallback Mode Activated):", error.message);
    return {
      plan: FALLBACK_PLAN,
      timestamp: new Date().toISOString(),
      agent_version: "FALLBACK_V1_SERVICE"
    };
  }
}

