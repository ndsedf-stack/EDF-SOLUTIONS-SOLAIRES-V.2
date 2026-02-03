// components/SilentTransition.tsx

import React, { useState, useEffect } from "react";

interface SilentTransitionProps {
  intention: string; // "respire — regarde" (PAS phrase complète)
  duration: number; // secondes
  onComplete: () => void;
  onClientSpeaks?: () => void; // Callback si client parle
}

export function SilentTransition({
  intention,
  duration,
  onComplete,
  onClientSpeaks,
}: SilentTransitionProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (elapsed >= duration) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => setElapsed(elapsed + 0.1), 100);
    return () => clearTimeout(timer);
  }, [elapsed, duration, onComplete]);

  // 🔥 NOUVEAU : Détection si client parle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Touche espace = "client a parlé"
      if (e.key === " " && onClientSpeaks) {
        onClientSpeaks();
        onComplete(); // Fermer immédiatement
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onClientSpeaks, onComplete]);

  const progress = Math.min((elapsed / duration) * 100, 100);

  return (
    <div className="fixed top-6 right-6 opacity-60 pointer-events-none z-[9999]">
      <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/10 rounded-lg px-3 py-2 shadow-lg">
        {/* Intention — ICÔNE + 2 MOTS MAX */}
        <div className="flex items-center gap-2 text-[11px] text-white/90 font-medium mb-1.5">
          <span>🫶</span>
          <span>{intention}</span>
        </div>

        {/* Barre progression (PAS countdown numérique) */}
        <div className="h-1 bg-slate-700/30 rounded overflow-hidden">
          <div
            className="h-full bg-blue-400/40 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Hint discret (optionnel) */}
        <p className="text-[9px] text-slate-500 text-right mt-1 opacity-50">
          (espace si client parle)
        </p>
      </div>
    </div>
  );
}
