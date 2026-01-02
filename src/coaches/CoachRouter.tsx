import React from "react";
import { SeniorCoach } from "./SeniorCoach";
import { BanquierCoach } from "./BanquierCoach";
import { CommercialCoach } from "./CommercialCoach";

interface CoachRouterProps {
  profile: "senior" | "banquier" | "standard";
  calculatorProps: any;
  onPhaseChange?: (phase: any) => void; // ← NOUVEAU
}

export const CoachRouter: React.FC<CoachRouterProps> = ({
  profile,
  calculatorProps,
  onPhaseChange, // ← NOUVEAU
}) => {
  // Route vers le bon coach selon profil
  switch (profile) {
    case "senior":
      return <SeniorCoach {...calculatorProps} onPhaseChange={onPhaseChange} />;

    case "banquier":
      return (
        <BanquierCoach {...calculatorProps} onPhaseChange={onPhaseChange} />
      );

    case "standard":
    default:
      return (
        <CommercialCoach {...calculatorProps} onPhaseChange={onPhaseChange} />
      );
  }
};
