import React from "react";
import { Trophy, CheckCircle2, TrendingUp, Star } from "lucide-react";

/**
 * Écran de félicitations - Fin du parcours Coach
 */
export function CompletionScreen({ onClose }) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150]" />

      {/* Écran de succès centré */}
      <div className="fixed inset-0 z-[151] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-green-500 rounded-3xl p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-500">
          {/* Trophée animé */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Titre */}
          <h2 className="text-4xl font-black text-center text-white mb-4">
            🎉 Parcours Terminé !
          </h2>

          <p className="text-center text-slate-300 text-lg mb-8">
            Tu as complété toutes les étapes du protocole Coach NET avec succès.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white mb-1">10/10</p>
              <p className="text-xs text-slate-400">Étapes complétées</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white mb-1">100%</p>
              <p className="text-xs text-slate-400">Taux de réussite</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white mb-1">Expert</p>
              <p className="text-xs text-slate-400">Niveau atteint</p>
            </div>
          </div>

          {/* Résumé des modules */}
          <div className="bg-black/40 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-green-400 uppercase tracking-wide mb-4">
              ✅ Modules Critiques Validés
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={20} />
                <span className="text-white font-medium">
                  Répartition Énergie
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={20} />
                <span className="text-white font-medium">
                  Locataire VS Propriétaire
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={20} />
                <span className="text-white font-medium">
                  Garanties & Sécurité (90s+)
                </span>
              </div>
            </div>
          </div>

          {/* Message de félicitations */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
            <p className="text-center text-white font-semibold text-lg">
              Le client est maintenant{" "}
              <span className="text-green-400">sécurisé émotionnellement</span>{" "}
              et prêt à signer.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-green-500/50"
            >
              Fermer
            </button>
          </div>

          {/* Note */}
          <p className="text-center text-slate-500 text-xs mt-6">
            Ce parcours a été optimisé par le système Coach NET pour maximiser
            les taux de closing.
          </p>
        </div>
      </div>
    </>
  );
}
