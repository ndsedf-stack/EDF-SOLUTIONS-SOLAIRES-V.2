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

export async function decide(profile: ProfileDetectionResult) {
  const res = await axios.post(
    "https://autopilote.pythonanywhere.com/decide",
    profile,
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": import.meta.env.VITE_AGENT_ZERO_API_KEY || "Titanium2025!",
      },
    }
  );
  return res.data;
}
