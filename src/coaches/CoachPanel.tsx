import React, { useState } from "react";
import { MessageSquare, X, Clock, Shield } from "lucide-react";

interface Script {
  text: string;
  instruction?: string;
}

interface CoachPanelProps {
  profile: "standard" | "banquier" | "senior";
  setProfile: (p: "standard" | "banquier" | "senior") => void;
  activeModuleId: string;
  scripts: {
    [moduleId: string]: {
      standard: Script[];
      banquier: Script[];
      senior: Script[];
    };
  };
}

export const CoachPanel = ({
  profile,
  setProfile,
  activeModuleId,
  scripts,
}: CoachPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // On récupère les scripts du module actif
  const currentModuleScripts = scripts[activeModuleId];
  if (!currentModuleScripts) return null;

  const activeScripts = currentModuleScripts[profile];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Bouton ultra-discret type "Ghost" */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-slate-900/40 hover:bg-slate-800 border border-white/5 rounded-full transition-all backdrop-blur-md group"
      >
        <MessageSquare
          size={18}
          className="text-white/20 group-hover:text-blue-400 transition-colors"
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header avec rappel du profil */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Coach Terrain — {activeModuleId}
              </span>
            </div>
            <X
              size={14}
              className="text-slate-600 cursor-pointer hover:text-white"
              onClick={() => setIsOpen(false)}
            />
          </div>

          {/* Sélecteur de profil (Sync global) */}
          <div className="flex gap-1 mb-4 bg-white/5 p-1 rounded-xl">
            {(["standard", "banquier", "senior"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProfile(p)}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                  profile === p
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Affichage des scripts du module en cours */}
          <div className="space-y-3">
            {activeScripts.map((s, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/5 rounded-xl p-4"
              >
                <p className="text-sm text-slate-100 italic leading-relaxed">
                  "{s.text}"
                </p>
                {s.instruction && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                    <Clock size={12} className="text-orange-500" />
                    <span className="text-[10px] text-orange-500 font-black uppercase tracking-tighter">
                      {s.instruction}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
