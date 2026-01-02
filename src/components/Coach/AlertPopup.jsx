import React from "react";
import { AlertTriangle, AlertCircle, X } from "lucide-react";

/**
 * Alerte rouge/orange plein écran
 */
export function AlertPopup({ alert, onDismiss, onAction }) {
  if (!alert) return null;

  const isRed = alert.level === "RED";
  const isOrange = alert.level === "ORANGE";

  if (!isRed && !isOrange) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[100] backdrop-blur-sm ${
          isRed ? "bg-black/80" : "bg-black/60"
        }`}
      />

      {/* Popup centré */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className={`rounded-2xl p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300 ${
            isRed
              ? "bg-zinc-900 border-2 border-red-500"
              : "bg-zinc-900 border-2 border-orange-500"
          }`}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`p-3 rounded-xl ${
                isRed ? "bg-red-500/10" : "bg-orange-500/10"
              }`}
            >
              {isRed ? (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {alert.title}
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                {alert.message}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Impact */}
          <div
            className={`border rounded-xl p-4 mb-6 ${
              isRed
                ? "bg-red-500/5 border-red-500/20"
                : "bg-orange-500/5 border-orange-500/20"
            }`}
          >
            <p
              className={`text-sm font-semibold mb-1 ${
                isRed ? "text-red-400" : "text-orange-400"
              }`}
            >
              {isRed ? "❌ Impact Closing NET :" : "⚠️ Impact potentiel :"}
            </p>
            <p className="text-sm text-slate-300">{alert.impact}</p>
          </div>

          {/* Détail (si présent) */}
          {alert.detail && (
            <div className="bg-white/5 rounded-lg p-3 mb-6">
              <p className="text-sm text-slate-400 font-mono">{alert.detail}</p>
            </div>
          )}

          {/* Action */}
          <div className="flex gap-3">
            <button
              onClick={() => onAction(alert.action)}
              className={`flex-1 text-white py-3 px-6 rounded-xl font-bold text-base transition-colors ${
                isRed
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-orange-600 hover:bg-orange-500"
              }`}
            >
              {alert.action.label}
            </button>
            <button
              onClick={onDismiss}
              className="px-6 bg-zinc-800 hover:bg-zinc-700 text-slate-300 py-3 rounded-xl font-semibold transition-colors"
            >
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
