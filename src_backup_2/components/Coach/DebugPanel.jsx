import React from "react";
import { Activity } from "lucide-react";

/**
 * Panel de debug pour voir l'état du coach en temps réel
 * À RETIRER une fois Phase 2 terminée (ou laisser en mode dev)
 */
export function DebugPanel({
  currentStep,
  securityTime,
  visitedModules,
  silenceTime,
}) {
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 border border-green-500/30 rounded-xl p-4 text-xs font-mono z-50 max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="text-green-400" size={20} />
        <h3 className="text-green-400 font-bold uppercase">Coach Debug</h3>
      </div>

      {/* Étape actuelle */}
      <div className="mb-3">
        <p className="text-slate-500 mb-1">Étape actuelle :</p>
        <div className="bg-black/40 rounded-lg p-3">
          <p className="text-white text-2xl font-bold">
            {currentStep === 0 ? "—" : currentStep} / 10
          </p>
        </div>
      </div>

      {/* Temps Sécurité */}
      <div className="mb-3">
        <p className="text-slate-500 mb-1">Temps Sécurité :</p>
        <div className="bg-black/40 rounded-lg p-3">
          <p
            className={`text-2xl font-bold ${
              securityTime < 90 ? "text-red-400" : "text-green-400"
            }`}
          >
            {securityTime}s
          </p>
        </div>
      </div>

      {/* ✅ NOUVEAU : Temps Silence */}
      <div className="mb-3">
        <p className="text-slate-500 mb-1">Temps Silence :</p>
        <div className="bg-black/40 rounded-lg p-3">
          <p
            className={`text-2xl font-bold ${
              silenceTime >= 60
                ? "text-red-400"
                : silenceTime >= 30
                ? "text-orange-400"
                : "text-slate-400"
            }`}
          >
            {silenceTime}s
          </p>
        </div>
      </div>

      {/* Modules visités */}
      <div>
        <p className="text-slate-500 mb-1">
          Modules visités ({visitedModules.length}) :
        </p>
        <div className="bg-black/40 rounded-lg p-3 space-y-1">
          {visitedModules.length === 0 ? (
            <p className="text-slate-600">Aucun</p>
          ) : (
            visitedModules.map((mod) => (
              <p key={mod} className="text-green-400">
                ✓ {mod}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
