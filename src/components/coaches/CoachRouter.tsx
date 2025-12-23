import React from "react";
import { SeniorCoach } from "./SeniorCoach";
import { BanquierCoach } from "./BanquierCoach";
import { CommercialCoach } from "./CommercialCoach";

export const CoachRouter = ({ profile, calculatorProps }: any) => {
  const finalProps = {
    ...calculatorProps,
    // On force l'intérêt à 5.5 si jamais il arrive à 0 ou undefined
    interestRate:
      calculatorProps.interestRate || calculatorProps.creditInterestRate || 0,
  };

  switch (profile) {
    case "senior":
      return <SeniorCoach {...finalProps} />;
    case "banquier":
      return <BanquierCoach {...finalProps} />;
    default:
      return <CommercialCoach {...finalProps} />;
  }
};
