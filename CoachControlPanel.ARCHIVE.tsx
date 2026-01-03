// @ts-nocheck

import { terrainScripts, BlocageType } from "./src/coaches/terrainScripts";
import { useState } from "react";

export function BlocageButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BlocageType | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* BOUTON */}
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-3 bg-red-600 text-white font-black rounded-xl shadow-xl"
      >
        🚨 Blocage détecté
      </button>

      {/* PANNEAU */}
      {open && (
        <div className="mt-4 w-96 bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-3">
          {!selected ? (
            Object.entries(terrainScripts).map(([key, v]) => (
              <button
                key={key}
                onClick={() => setSelected(key as BlocageType)}
                className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white"
              >
                {v.label}
              </button>
            ))
          ) : (
            <div className="space-y-3">
              {terrainScripts[selected].phrases.map((p, i) => (
                <div
                  key={i}
                  className="p-3 bg-black/40 rounded-lg text-white text-sm font-semibold"
                >
                  {p}
                </div>
              ))}
              <button
                onClick={() => setSelected(null)}
                className="text-xs text-slate-400 underline"
              >
                ← revenir
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
