import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Notification micro (3 sec) qui demande confirmation étape
 */
export function StepNotification({ step, message, onConfirm, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Barre progression 3 sec
    const interval = setInterval(() => {
      setProgress((p) => Math.max(0, p - 100 / 30)); // 3000ms / 100ms
    }, 100);

    // Auto-disparition
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 right-4 z-50 
                    w-80 bg-zinc-800 border border-blue-500/30 
                    rounded-xl p-4 shadow-2xl
                    animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle className="w-5 h-5 text-blue-400" />
        <div>
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
            Étape {step} détectée
          </p>
          <p className="text-sm text-white font-semibold">{message}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => {
            onConfirm(step);
            setVisible(false);
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-500 
                     text-white py-2 rounded-lg text-xs font-bold
                     uppercase tracking-wider transition-colors"
        >
          OUI
        </button>
        <button
          onClick={() => {
            onDismiss?.();
            setVisible(false);
          }}
          className="flex-1 bg-zinc-700 hover:bg-zinc-600 
                     text-white py-2 rounded-lg text-xs font-bold
                     uppercase tracking-wider transition-colors"
        >
          NON
        </button>
        <button
          onClick={() => setVisible(false)}
          className="px-3 bg-zinc-700 hover:bg-zinc-600 
                     text-slate-400 py-2 rounded-lg text-xs
                     transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Barre progression */}
      <div className="h-1 bg-black rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
