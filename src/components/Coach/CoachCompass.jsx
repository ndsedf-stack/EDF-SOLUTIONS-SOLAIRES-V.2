import React, { useState } from "react";
import {
  Compass,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle2,
  Calculator,
  Zap,
  Power,
} from "lucide-react";

/**
 * Boussole de navigation - CONNECTÉE AU PROFIL + COACH
 */
export function CoachCompass({
  profile,
  activeCoachPhase,
  currentStep,
  visitedModules,
  securityTime,
  silenceTime,
  activeModule,
  hasActiveAlert,
  // ✅ Ajoute ces props pour lier le bouton Power au Dashboard
  isCoachDisabled,
  setIsCoachDisabled,
}) {
  // Calcul progression
  const totalSteps = 10;
  const progress = (currentStep / totalSteps) * 100;

  // LOGIQUE ADAPTÉE AU PROFIL
  const getNextAction = () => {
    if (activeCoachPhase && coachEnabled) return null;

    if (profile === "banquier" && coachEnabled) {
      if (!visitedModules.includes("repartition")) {
        return {
          module: "Répartition Énergie",
          phrase: "Regardons où part votre argent actuellement",
          timing: "45-60s",
          objectif: "Ancrer la perte financière",
          attention: "Ne PAS mentionner le prix maintenant",
        };
      }
      if (!visitedModules.includes("locataire-proprietaire")) {
        return {
          module: "Locataire VS Propriétaire",
          phrase: "Ces 100€ que vous payez... vous les payez pour QUI?",
          timing: "30-45s",
          objectif: "Pivot mental locataire→propriétaire",
          attention: "Laisser le client conclure seul",
        };
      }
      if (!visitedModules.includes("garanties")) {
        return {
          module: "Garanties & Sécurité",
          phrase: "Parlons du cadre de sécurité",
          timing: "60-90s",
          objectif: "Rassurer sans sur-vendre",
          attention: "Ton factuel, ZÉRO storytelling émotionnel",
        };
      }
    }

    if (profile === "senior" && coachEnabled) {
      if (!visitedModules.includes("garanties")) {
        return {
          module: "Garanties & Sécurité",
          phrase: "Ce qui protège VRAIMENT votre famille",
          timing: "90-120s (CRUCIAL)",
          objectif: "Verrou émotionnel familial",
          attention: "Temps minimum ABSOLU : 90s. Ne pas précipiter.",
        };
      }
      if (!visitedModules.includes("repartition")) {
        return {
          module: "Répartition Énergie",
          phrase: "Regardons ce que vous perdez chaque mois",
          timing: "60s",
          objectif: "Montrer la perte sans anxiété",
          attention: "Ton calme, pas de pression",
        };
      }
      if (!visitedModules.includes("locataire-proprietaire")) {
        return {
          module: "Locataire VS Propriétaire",
          phrase: "Cet argent peut travailler pour vous",
          timing: "45-60s",
          objectif: "Transition douce",
          attention: "Parler transmission/enfants si pertinent",
        };
      }
    }

    if (profile === "standard" && coachEnabled) {
      if (!visitedModules.includes("repartition")) {
        return {
          module: "Répartition Énergie",
          phrase: "Regardez ce que vous PERDEZ actuellement",
          timing: "45-60s",
          objectif: "Choc de la perte",
          attention: "Laisser digérer 2-3s après les chiffres",
        };
      }
      if (!visitedModules.includes("locataire-proprietaire")) {
        return {
          module: "Locataire VS Propriétaire",
          phrase: "Ces 100€ que vous payez DÉJÀ... pour QUI?",
          timing: "30-45s",
          objectif: "Pivot mental",
          attention: "Transition agressive mais pas anxiogène",
        };
      }
      if (!visitedModules.includes("garanties")) {
        return {
          module: "Garanties & Sécurité",
          phrase: "Maintenant, parlons sécurité",
          timing: "90s+",
          objectif: "Sécuriser AVANT scarcity",
          attention: "Module CRITIQUE pour tenue décision",
        };
      }
    }

    if (activeModule === "garanties" && securityTime < 90) {
      return {
        module: "Garanties & Sécurité",
        phrase: `Reste sur Garanties (${90 - securityTime}s restantes)`,
        timing: "90s minimum",
        objectif: "Verrou sécurité obligatoire",
        attention: "NE PAS FERMER avant 90s",
      };
    }

    return { module: "Continue le parcours" };
  };

  const getSilenceStatus = () => {
    if (!activeModule) return null;
    if (silenceTime >= 60) return { level: "danger", text: "🚨 Danger" };
    if (silenceTime >= 30) return { level: "warning", text: "⚠️ Attention" };
    if (silenceTime >= 15) return { level: "caution", text: "⏳ Surveiller" };
    return null;
  };

  const silenceStatus = getSilenceStatus();
  const nextAction = getNextAction();

  const getProfileIcon = () => {
    if (!profile) return null;
    if (profile === "senior")
      return <Shield className="w-4 h-4 text-emerald-400" />;
    if (profile === "banquier")
      return <Calculator className="w-4 h-4 text-blue-400" />;
    if (profile === "standard")
      return <Zap className="w-4 h-4 text-purple-400" />;
    return null;
  };

  const getProfileLabel = () => {
    if (!profile) return null;
    if (profile === "senior") return "Profil Sécurité";
    if (profile === "banquier") return "Profil Analytique";
    if (profile === "standard") return "Profil Pragmatique";
    return null;
  };

  // ----------------------------
  // UI RENDU (AVEC MODE MINIMISÉ)
  // ----------------------------
  return (
    <>
      {/* 🟡 COACH MASQUÉ → MINI BOUTON 🧭 */}
      {isCoachDisabled && ( // ✅ Utilise isCoachDisabled
        <button
          onClick={() => setIsCoachDisabled(false)} // ✅ On repasse à false pour rallumer
          className="fixed bottom-4 right-4 z-[9999] p-4 rounded-full bg-slate-800 border border-slate-700 shadow-2xl hover:bg-slate-700 transition"
        >
          <Compass className="text-slate-400" size={22} />
        </button>
      )}

      {/* 🔵 COACH AFFICHÉ — Utilise maintenant la prop globale */}
      {!isCoachDisabled && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-blue-950/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="text-blue-400" size={20} />
                  <h3 className="font-bold text-white text-sm">
                    Coach Navigation
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bouton POWER */}
                  <button
                    onClick={() => setIsCoachDisabled(!isCoachDisabled)} // ✅ Pilote le Dashboard
                    className={`p-1.5 rounded-lg transition-all ${
                      !isCoachDisabled
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {hasActiveAlert && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="text-red-400" size={14} />
                      <span className="text-xs font-bold text-red-400">
                        ALERTE
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profil détecté */}
              {profile && coachEnabled && (
                <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-white/5 rounded-lg">
                  {getProfileIcon()}
                  <span className="text-xs font-semibold text-slate-300">
                    {getProfileLabel()}
                  </span>
                </div>
              )}

              {/* Progression */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Progression</span>
                  <span className="text-white font-bold">
                    {currentStep} / {totalSteps}
                  </span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Modules clés */}
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Modules Critiques
              </p>

              {/* Répartition */}
              <div
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  visitedModules.includes("repartition")
                    ? "bg-green-500/10"
                    : "bg-slate-800/50"
                }`}
              >
                {visitedModules.includes("repartition") ? (
                  <CheckCircle2 className="text-green-400" size={16} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    visitedModules.includes("repartition")
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}
                >
                  Répartition Énergie
                </span>
              </div>

              {/* Locataire */}
              <div
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  visitedModules.includes("locataire-proprietaire")
                    ? "bg-green-500/10"
                    : "bg-slate-800/50"
                }`}
              >
                {visitedModules.includes("locataire-proprietaire") ? (
                  <CheckCircle2 className="text-green-400" size={16} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    visitedModules.includes("locataire-proprietaire")
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}
                >
                  Locataire VS Propriétaire
                </span>
              </div>

              {/* Garanties */}
              <div
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  visitedModules.includes("garanties")
                    ? "bg-green-500/10"
                    : activeModule === "garanties"
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : "bg-slate-800/50"
                }`}
              >
                {visitedModules.includes("garanties") ? (
                  <CheckCircle2 className="text-green-400" size={16} />
                ) : activeModule === "garanties" ? (
                  <Shield className="text-blue-400 animate-pulse" size={16} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      visitedModules.includes("garanties")
                        ? "text-green-400"
                        : activeModule === "garanties"
                        ? "text-blue-400"
                        : "text-slate-400"
                    }`}
                  >
                    Garanties & Sécurité
                  </span>
                  {activeModule === "garanties" && securityTime < 90 && (
                    <span
                      className={`text-xs font-mono font-bold ${
                        securityTime < 30
                          ? "text-red-400"
                          : securityTime < 60
                          ? "text-orange-400"
                          : "text-blue-400"
                      }`}
                    >
                      {securityTime}s
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Indicateurs d'état */}
            {(silenceStatus ||
              (activeModule === "garanties" && securityTime < 90)) && (
              <div className="px-4 pb-4 space-y-2">
                {silenceStatus && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      silenceStatus.level === "danger"
                        ? "bg-red-500/10 border border-red-500/30"
                        : silenceStatus.level === "warning"
                        ? "bg-orange-500/10 border border-orange-500/30"
                        : "bg-yellow-500/10 border border-yellow-500/30"
                    }`}
                  >
                    <Clock
                      className={
                        silenceStatus.level === "danger"
                          ? "text-red-400"
                          : silenceStatus.level === "warning"
                          ? "text-orange-400"
                          : "text-yellow-400"
                      }
                      size={14}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        silenceStatus.level === "danger"
                          ? "text-red-400"
                          : silenceStatus.level === "warning"
                          ? "text-orange-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {silenceStatus.text} - {silenceTime}s silence
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Coach actif */}
            {coachEnabled && activeCoachPhase && (
              <div className="p-4 bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  {profile === "senior" && (
                    <Shield className="w-4 h-4 text-emerald-400" />
                  )}
                  {profile === "banquier" && (
                    <Calculator className="w-4 h-4 text-blue-400" />
                  )}
                  {profile === "standard" && (
                    <Zap className="w-4 h-4 text-purple-400" />
                  )}
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    {profile === "senior" && "🛡️ Coach Sécurité"}
                    {profile === "banquier" && "📊 Coach Analytique"}
                    {profile === "standard" && "💬 Coach Standard"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                      Phase {activeCoachPhase.number} - {activeCoachPhase.title}
                    </p>
                    <p className="text-sm text-white font-medium leading-snug">
                      {activeCoachPhase.keyPhrase}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      ⏱️ {activeCoachPhase.timing}
                    </span>
                    <span className="text-blue-400 font-semibold">
                      🎯 {activeCoachPhase.objective}
                    </span>
                  </div>

                  {activeCoachPhase.attention && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                      <p className="text-xs text-orange-400 font-semibold">
                        ⚠️ {activeCoachPhase.attention}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prochaine action */}
            {(!coachEnabled || !activeCoachPhase) && nextAction && (
              <div className="p-4 bg-blue-950/20 border-t border-white/10">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">
                  Prochaine Action Recommandée
                </p>

                {nextAction.module && !nextAction.phrase ? (
                  <p className="text-sm text-white font-medium">
                    {nextAction.module}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                        📂 {nextAction.module}
                      </p>
                      <p className="text-sm text-white font-medium leading-snug mb-2">
                        💬 "{nextAction.phrase}"
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          ⏱️ {nextAction.timing}
                        </span>
                        <span className="text-blue-400 font-semibold">
                          🎯 {nextAction.objectif}
                        </span>
                      </div>
                    </div>

                    {nextAction.attention && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                        <p className="text-xs text-orange-400 font-semibold">
                          ⚠️ {nextAction.attention}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
