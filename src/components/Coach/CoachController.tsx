import React, { useState } from "react";
import { CoachRouter } from "../../coaches/CoachRouter";
import { CoachCompassMinimal } from "./CoachCompassMinimal";

interface CoachControllerProps {
  profile: "standard" | "banquier" | "senior";
  activeCoachPhase: any | null;
  securityTime: number;
  isCoachDisabled: boolean;
  signal?: boolean;
}

export const CoachController: React.FC<CoachControllerProps> = ({
  profile,
  activeCoachPhase,
  securityTime,
  isCoachDisabled,
  signal,
}) => {
  // État local : HUD (fermé) ou Panel (ouvert)
  const [isOpen, setIsOpen] = useState(false);

  // 🔒 OFF = RIEN
  if (isCoachDisabled) return null;

  // 🧭 HUD DISCRET
  if (!isOpen) {
    return (
      <>
        <CoachCompassMinimal
          profile={profile}
          activePhase={activeCoachPhase}
          timeOnCurrentModule={securityTime}
          minTimeRequired={activeCoachPhase?.minDuration || 0}
          hasError={
            !!activeCoachPhase &&
            securityTime < (activeCoachPhase?.minDuration || 0)
          }
          signal={signal}
        />

        {/* Bouton discret pour ouvrir le panel */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[9999]
                     px-3 py-1.5 rounded-lg text-xs font-bold
                     bg-black/50 backdrop-blur-md
                     text-slate-300 border border-white/10
                     hover:bg-white/10 transition"
        >
          Assistant
        </button>
      </>
    );
  }

  // 📋 PANEL COMPLET
  return (
    <>
      <CoachRouter profile={profile} onPhaseChange={() => {}} />

      {/* Bouton fermeture panel */}
      <button
        onClick={() => setIsOpen(false)}
        className="fixed bottom-4 right-4 z-[9999]
                   px-3 py-1.5 rounded-lg text-xs font-bold
                   bg-black/60 backdrop-blur-md
                   text-slate-300 border border-white/10
                   hover:bg-white/10 transition"
      >
        Réduire
      </button>
    </>
  );
};
