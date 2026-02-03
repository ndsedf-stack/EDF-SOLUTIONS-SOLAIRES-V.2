import axios from "axios";

interface DetectionAlerts {
  incoherentAnswers: boolean;
  fatigueSuspected: boolean;
  fatigueCritical: boolean;
  profileUncertain: boolean;
  banquierFaible: boolean;
}

export type ProfileDetectionResult = {
  profile: "senior" | "banquier" | "standard" | "hybride";
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
};

const FALLBACK_PLAN = {
  decision: "GO",
  strategy: "STANDARD",
  modules_sequence: ["constat", "solution", "budget"],
  focus_point: "SAVINGS",
  justification: "⚠️ MODE DÉGRADÉ (Fallback): API injoignable ou clé invalide. Stratégie par défaut appliquée.",
  script: "Compte tenu de votre profil, nous allons nous concentrer sur la maîtrise de votre budget."
};

export async function decide(profile: ProfileDetectionResult) {
  try {
    const res = await axios.post(
      "https://autopilote.pythonanywhere.com/decide",
      profile,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": import.meta.env.VITE_AGENT_ZERO_API_KEY || "Titanium2025!",
        },
        timeout: 5000 // Fail fast if offline
      }
    );
    return res.data;
  } catch (error: any) {
    console.warn("⚠️ [AGENT ZERO] Connection Failed (Fallback Mode Activated):", error.message);
    
    // Return Safe Structure adhering to contract
    return {
      plan: FALLBACK_PLAN,
      timestamp: new Date().toISOString(),
      agent_version: "FALLBACK_V1"
    };
  }
}
