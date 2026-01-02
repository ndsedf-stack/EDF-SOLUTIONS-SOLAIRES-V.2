// types/coach.ts

export interface CoachSilence {
  duration: number; // durée seconds
  instruction: string; // ex: "regarder client"
}

export interface TransitionConfig {
  silence: number; // durée seconds
  phrase: string; // mini phrase intention / pas discours
  instruction: string; // ce que TOI tu dois faire
}

export interface CoachPhase {
  id: string;
  number: number;
  title: string;
  moduleId: string | null;
  autoOpen: boolean;
  minDuration: number;
  maxDuration?: number;
  keyPhrase: string;
  currentAction: string;
  doList?: string[];
  dontList?: string[];
  successSignals?: string[];
  silences?: CoachSilence[];
  transitionBeforeNextModule?: TransitionConfig;
}
