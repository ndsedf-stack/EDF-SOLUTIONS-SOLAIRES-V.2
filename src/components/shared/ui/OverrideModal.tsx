
import React, { useState } from 'react';

// ============================================
// MODAL COLORS (pour Override Modal)
// ============================================
const MODAL_COLORS = {
  green: {
    header: "bg-green-500/20 border-green-500/50",
    warn: "bg-green-500/10 border-green-500/30",
    text: "text-green-400",
    softText: "text-green-300/70",
    button: "bg-green-600 hover:bg-green-500",
  },
  red: {
    header: "bg-red-500/20 border-red-500/50",
    warn: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    softText: "text-red-300/70",
    button: "bg-red-600 hover:bg-red-500",
  },
  orange: {
    header: "bg-orange-500/20 border-orange-500/50",
    warn: "bg-orange-500/10 border-orange-500/30",
    text: "text-orange-400",
    softText: "text-orange-300/70",
    button: "bg-orange-600 hover:bg-orange-500",
  },
  blue: {
    header: "bg-blue-500/20 border-blue-500/50",
    warn: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
    softText: "text-blue-300/70",
    button: "bg-blue-600 hover:bg-blue-500",
  },
};

interface OverrideModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  studyName?: string;
  actionType?: "force_sign" | "delete" | "override";
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  title,
  message,
  studyName,
  actionType,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const color =
    actionType === "force_sign"
      ? "green"
      : actionType === "delete"
      ? "red"
      : actionType === "override"
      ? "orange"
      : "blue";

  // NOUVEAU : Mapping pour les styles de boutons et bordures
  const styles = {
    green: {
      border: "border-green-500/50",
      btn: "bg-green-600 hover:bg-green-500 shadow-green-500/20",
      icon: "✅",
    },
    red: {
      border: "border-red-500/50",
      btn: "bg-red-600 hover:bg-red-500 shadow-red-500/20",
      icon: "🗑️",
    },
    orange: {
      border: "border-orange-500/50",
      btn: "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20",
      icon: "⚠️",
    },
    blue: {
      border: "border-blue-500/50",
      btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
      icon: "ℹ️",
    },
  }[color];

  // ✅ NOUVEAU : Templates de justification
  const templates = [
    "Trop cher / Budget",
    "Raison Technique / Toiture",
    "Concurrent moins cher",
    "Refus Client / Ne répond plus",
    "Projet Abandonné",
    "Erreur de saisie / Doublon"
  ];
  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert("⚠️ Veuillez fournir une justification");
      return;
    }
    if (reason.trim().length < 10) {
      alert("⚠️ La justification doit contenir au moins 10 caractères");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } catch (error) {
      console.error("Error confirming override:", error);
      alert("❌ Erreur lors de la confirmation");
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setReason("");
    onCancel();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`
          glass-panel w-full max-w-lg rounded-2xl overflow-hidden border-2 ${styles.border} 
          shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all animate-slideUp
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-2xl">{styles.icon}</span>
                {title}
              </h3>
              {studyName && (
                <div className="text-sm text-slate-300 ml-9">
                  Dossier :{" "}
                  <span className="font-bold text-white">{studyName}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {message && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-300 leading-relaxed text-sm">
                {message}
              </p>
            </div>
          )}

          <div
            className={`rounded-xl p-4 ${
              color === "red"
                ? "bg-red-500/10 border border-red-500/20"
                : "bg-orange-500/10 border border-orange-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <div
                  className={`font-bold text-sm mb-0.5 ${
                    color === "red" ? "text-red-400" : "text-orange-400"
                  }`}
                >
                  Action critique - Justification requise
                </div>
                <div className="text-xs text-slate-400">
                  Cette action sera enregistrée de manière immuable dans les
                  logs de sécurité.
                </div>
              </div>
            </div>
          </div>

          {/* Justification & Templates */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Justification
              </label>
              <span className="text-[10px] text-slate-500">
                Requis pour valider
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {templates.map((template) => (
                <button
                  key={template}
                  onClick={() => setReason(template)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-md text-[10px] text-slate-300 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Expliquez la raison de cette action exceptionnelle..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none resize-none text-sm transition-all"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-[10px] ${
                  reason.trim().length < 10
                    ? "text-orange-400"
                    : "text-emerald-400"
                }`}
              >
                {reason.trim().length}/10 caractères
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg font-bold text-sm transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || reason.trim().length < 10}
            className={`px-4 py-2 text-white rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 ${styles.btn} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Confirmer Action
          </button>
        </div>
      </div>
    </div>
  );
};
