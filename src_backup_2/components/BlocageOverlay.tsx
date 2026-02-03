import React, { Dispatch, SetStateAction } from "react";

// Si SimulationResult est dans un autre fichier, importe-le aussi
import { SimulationResult } from "../types"; // ou le chemin correct
// ============================================
// INTERFACE BLOCAGE OVERLAY
// ============================================
interface BlocageOverlayProps {
  profile: "standard" | "banquier" | "senior";
  setProfile: Dispatch<SetStateAction<"standard" | "banquier" | "senior">>;
  showCoach: boolean;
  setShowCoach: Dispatch<SetStateAction<boolean>>;
  activeCoachPhase: string | null;
  setActiveCoachPhase: Dispatch<SetStateAction<string | null>>;
  isCoachDisabled: boolean;
  currentStep: number;
  visitedModules: Set<string>;
  securityTime: number;
  activeModule: string | null;
  calculatorProps: SimulationResult;
}

// ============================================
// COMPOSANT BLOCAGE OVERLAY
// ============================================
export const BlocageOverlay: React.FC<BlocageOverlayProps> = (props) => null;
