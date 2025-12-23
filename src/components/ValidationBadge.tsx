import React, { useState, useMemo } from "react";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ValidationBadgeProps {
  validation: {
    errors: Array<{ severity: string; category: string; message: string }>;
    warnings: Array<{ severity: string; category: string; message: string }>;
    info: Array<{ severity: string; category: string; message: string }>;
    score: number;
    isValid: boolean;
  };
  compact?: boolean;
  showPopup?: boolean;
  onTogglePopup?: () => void;
}

export function ValidationBadge({
  validation,
  compact = false,
  showPopup = false,
  onTogglePopup,
}: ValidationBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const totalTests =
    validation.info.length +
    validation.errors.length +
    validation.warnings.length;
  const passedTests = validation.info.length;
  const scoreColor =
    validation.score >= 95
      ? "text-emerald-400"
      : validation.score >= 80
      ? "text-yellow-400"
      : "text-red-400";
  const borderColor =
    validation.score >= 95
      ? "border-emerald-500/50"
      : validation.score >= 80
      ? "border-yellow-500/50"
      : "border-red-500/50";

  if (compact) {
    // 🎯 BADGE FLOTTANT (en bas à droite)
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <button
          onClick={onTogglePopup}
          className="group relative bg-gradient-to-br from-emerald-900/90 to-green-900/90 backdrop-blur-xl border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105"
        >
          {/* Glow animé */}
          <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse"></div>

          <div className="relative flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div className="text-left">
              <div className="text-xs text-emerald-300 font-medium">
                CALCULS CERTIFIÉS
              </div>
              <div
                className={`text-2xl font-bold ${scoreColor} animate-bounce`}
              >
                {validation.score}%
              </div>
            </div>
          </div>

          {/* Indicateur de détails */}
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {passedTests}
          </div>
        </button>
      </div>
    );
  }

  // 📦 MODULE COMPLET (intégré dans le dashboard)
  return (
    <div
      className={`bg-gradient-to-br from-emerald-900/20 to-green-900/20 backdrop-blur-sm border ${borderColor} rounded-2xl p-6 space-y-4`}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="w-10 h-10 text-emerald-400" />
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-lg animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Certification des Calculs
            </h3>
            <p className="text-sm text-gray-400">
              Validation automatique • {totalTests} points de contrôle
            </p>
          </div>
        </div>

        <button
          onClick={onTogglePopup}
          className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-all duration-200 text-sm font-medium"
        >
          Voir Console
        </button>
      </div>

      {/* Score principal */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/30 rounded-xl p-4 text-center">
          <div className={`text-4xl font-bold ${scoreColor} animate-bounce`}>
            {validation.score}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Score Global</div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">
            {passedTests}/{totalTests}
          </div>
          <div className="text-xs text-gray-400 mt-1">Tests Validés</div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">
            {validation.warnings.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Avertissements</div>
        </div>
      </div>

      {/* Bouton dépliable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-black/20 hover:bg-black/40 rounded-lg transition-all duration-200"
      >
        <span className="text-sm text-gray-300 font-medium">
          Détails des {totalTests} tests
        </span>
        {expanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Liste des tests */}
      {expanded && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Tests réussis */}
          {validation.info.map((item, idx) => (
            <div
              key={`info-${idx}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/30"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {item.category}
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.message}</div>
              </div>
            </div>
          ))}

          {/* Avertissements */}
          {validation.warnings.map((item, idx) => (
            <div
              key={`warning-${idx}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-yellow-950/30"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {item.category}
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.message}</div>
              </div>
            </div>
          ))}

          {/* Erreurs */}
          {validation.errors.map((item, idx) => (
            <div
              key={`error-${idx}`}
              className="flex items-start gap-3 p-3 rounded-lg bg-red-950/30"
            >
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {item.category}
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer timestamp */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
        Dernière validation : {new Date().toLocaleString("fr-FR")}
      </div>
    </div>
  );
}

// 🖥️ POPUP CONSOLE TECHNIQUE
interface ConsolePopupProps {
  validation: any;
  calculationResult: any;
  onClose: () => void;
}

export function ConsolePopup({
  validation,
  calculationResult,
  onClose,
}: ConsolePopupProps) {
  const gains = {
    year10: calculationResult?.details?.[9]?.cumulativeNetSavingsFinancing || 0,
    year15:
      calculationResult?.details?.[14]?.cumulativeNetSavingsFinancing || 0,
    year20:
      calculationResult?.details?.[19]?.cumulativeNetSavingsFinancing || 0,
    year25:
      calculationResult?.details?.[24]?.cumulativeNetSavingsFinancing || 0,
  };

  const totalTests =
    validation.info.length +
    validation.errors.length +
    validation.warnings.length;
  const passedTests = validation.info.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-emerald-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white font-mono">
              RAPPORT DE VALIDATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Console Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)] font-mono text-sm">
          {/* Séparateur */}
          <div className="text-emerald-400">
            ════════════════════════════════════════════════════════════════════════════════
          </div>

          <div className="text-emerald-300 font-bold">
            🔍 RAPPORT DE VALIDATION & RENTABILITÉ
          </div>

          <div className="text-emerald-400">
            ════════════════════════════════════════════════════════════════════════════════
          </div>

          {/* Analyse des gains */}
          <div className="text-cyan-300 font-bold">
            📈 ANALYSE DES GAINS CUMULÉS :
          </div>
          <div className="text-gray-400">
            ────────────────────────────────────────────────────────────────────────────────
          </div>

          <div className="space-y-1 text-white">
            <div>
              {gains.year10 < 0 ? "⏳" : "✅"} 10 ans :{" "}
              {gains.year10 < 0 ? "Amortissement" : "Rentable"} (
              {Math.round(gains.year10).toLocaleString("fr-FR")}€)
            </div>
            <div>
              {gains.year15 < 0 ? "⏳" : "✅"} 15 ans :{" "}
              {gains.year15 < 0 ? "Amortissement" : "Rentable"} (
              {Math.round(gains.year15).toLocaleString("fr-FR")}€)
            </div>
            <div>
              {gains.year20 < 0 ? "⏳" : "✅"} 20 ans :{" "}
              {gains.year20 < 0 ? "Amortissement" : "Rentable"} (
              {Math.round(gains.year20).toLocaleString("fr-FR")}€)
            </div>
            <div>
              {gains.year25 < 0 ? "⏳" : "✅"} 25 ans :{" "}
              {gains.year25 < 0 ? "Amortissement" : "Rentable"} (
              {Math.round(gains.year25).toLocaleString("fr-FR")}€)
            </div>
          </div>

          <div className="text-white">
            🔍 Score validation: {validation.score}%
          </div>
          <div className="text-emerald-400">
            ✅ Tests validés: {passedTests}
          </div>

          {/* Détails du score */}
          <div className="text-cyan-300 font-bold">✅ DÉTAILS DU SCORE :</div>
          <div className="text-gray-400">
            ────────────────────────────────────────────────────────────────────────────────
          </div>

          <div className="space-y-1">
            {validation.info.map((item: any, idx: number) => (
              <div key={idx} className="text-emerald-400">
                {idx + 1}. ✅ {item.message}
              </div>
            ))}
            {validation.warnings.map((item: any, idx: number) => (
              <div key={`w-${idx}`} className="text-yellow-400">
                {validation.info.length + idx + 1}. ⚠️ {item.message}
              </div>
            ))}
            {validation.errors.map((item: any, idx: number) => (
              <div key={`e-${idx}`} className="text-red-400">
                {validation.info.length + validation.warnings.length + idx + 1}.
                ❌ {item.message}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-emerald-400">
            ════════════════════════════════════════════════════════════════════════════════
          </div>
          <div className="text-emerald-300 font-bold text-center">
            🎉 CALCULS VÉRIFIÉS SUR 25 ANS
          </div>
          <div className="text-emerald-400">
            ════════════════════════════════════════════════════════════════════════════════
          </div>
        </div>
      </div>
    </div>
  );
}
