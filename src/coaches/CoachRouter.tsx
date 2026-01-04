import React from "react";
import { SeniorCoach } from "./SeniorCoach";
import { BanquierCoach } from "./BanquierCoach";
import { CommercialCoach } from "./CommercialCoach";

interface CoachRouterProps {
  profile: "senior" | "banquier" | "standard";
  onPhaseChange?: (phase: any) => void;
  onClose?: () => void;
}

export const CoachRouter: React.FC<CoachRouterProps> = ({
  profile,
  onPhaseChange,
  onClose,
}) => {
  switch (profile) {
    case "senior":
      return <SeniorCoach onPhaseChange={onPhaseChange} onClose={onClose} />;

    case "banquier":
      return <BanquierCoach onPhaseChange={onPhaseChange} onClose={onClose} />;

    default:
      return (
        <CommercialCoach onPhaseChange={onPhaseChange} onClose={onClose} />
      );
  }
};
