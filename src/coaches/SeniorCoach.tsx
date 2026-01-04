import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { seniorPhases } from "./SeniorCoachPhases";

interface SeniorCoachProps {
  onPhaseChange?: (phase: any) => void;
  onClose?: () => void;
}

export const SeniorCoach: React.FC<SeniorCoachProps> = ({
  onPhaseChange,
  onClose,
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const phase = seniorPhases[currentPhase];

  useEffect(() => {
    if (onPhaseChange) onPhaseChange(phase);
  }, [currentPhase, phase, onPhaseChange]);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[460px] bg-zinc-900 border-l border-white/10 p-6 z-[9998] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">👴 Sécurité — Senior</h2>

        <X
          onClick={onClose}
          className="text-slate-500 cursor-pointer hover:text-white"
          size={20}
        />
      </div>

      <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">
        Phase {phase.number} / {seniorPhases.length}
      </div>

      <div className="h-1 bg-black rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{
            width: `${(phase.number / seniorPhases.length) * 100}%`,
          }}
        />
      </div>

      <div className="bg-white/5 p-4 rounded-xl mb-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
          ⚡ Phrase clé
        </p>
        <p className="text-white font-semibold">{phase.keyPhrase}</p>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          disabled={currentPhase === 0}
          onClick={() => setCurrentPhase((p) => p - 1)}
          className="flex-1 bg-zinc-800 text-white py-3 rounded-xl disabled:opacity-30"
        >
          Précédent
        </button>

        <button
          onClick={() => {
            if (currentPhase < seniorPhases.length - 1) {
              setCurrentPhase((p) => p + 1);
            }
          }}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};
