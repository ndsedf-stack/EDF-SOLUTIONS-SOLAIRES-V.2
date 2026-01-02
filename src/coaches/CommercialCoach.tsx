import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { standardPhases } from "./StandardCoachPhases";

interface CommercialCoachProps {
  onPhaseChange?: (phase: any) => void;
}

export const CommercialCoach: React.FC<CommercialCoachProps> = ({
  onPhaseChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const phase = standardPhases[currentPhase];

  useEffect(() => {
    if (onPhaseChange && isOpen) onPhaseChange(phase);
  }, [currentPhase, isOpen]);

  return (
    <>
      {/* BOUTON DISCRET - Reste visible quand panneau ouvert */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[9999] bottom-6 right-6 flex items-center gap-1.5 px-2 py-1 
          bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 
          rounded-md transition-all
          ${
            isOpen
              ? "opacity-100 bg-indigo-600/20 border-indigo-500/30"
              : "opacity-40 hover:opacity-100"
          }`}
      >
        <span className="text-xs">💬</span>
        <span className="text-[10px] text-slate-500">
          {isOpen ? "Fermer" : "Coach"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-[460px] bg-zinc-900 border-l border-white/10 p-6 z-[9998] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">
              🧱 Pragmatique — Standard
            </h2>
            <X
              onClick={() => setIsOpen(false)}
              className="text-slate-500 cursor-pointer hover:text-white"
              size={20}
            />
          </div>

          <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">
            Phase {phase.number} / {standardPhases.length}
          </div>

          <div className="h-1 bg-black rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-indigo-500"
              style={{
                width: `${(phase.number / standardPhases.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl mb-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              💬 Phrase clé
            </p>
            <p className="text-white font-semibold">{phase.keyPhrase}</p>
          </div>

          <div className="flex gap-3">
            <button
              disabled={currentPhase === 0}
              onClick={() => setCurrentPhase((p) => p - 1)}
              className="flex-1 bg-zinc-800 text-white py-3 rounded-xl disabled:opacity-30"
            >
              Précédent
            </button>
            <button
              onClick={() => {
                if (currentPhase < standardPhases.length - 1)
                  setCurrentPhase((p) => p + 1);
                else setIsOpen(false);
              }}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl"
            >
              {currentPhase === standardPhases.length - 1
                ? "Terminer"
                : "Suivant"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
