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

export async function decideWithAgentZero(
  payload: ProfileDetectionResult
) {
  const response = await axios.post(
    "https://autopilote.pythonanywhere.com/decide",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "Titanium2025!", // <--- ON ÉCRIT LA CLÉ DIRECTEMENT ICI
      },
    }
  );

  return response.data;
}

