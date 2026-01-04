import React from "react";

// 🧠 Phases (data) — CORRECT IMPORT NAMES
import { seniorPhases } from "../../coaches/SeniorCoachPhases";
import { banquierPhases } from "../../coaches/BanquierCoachPhases";
import { standardPhases } from "../../coaches/StandardCoachPhases";

// 🧯 Signal visuel ultra-discret (coaching)
import { VocabularySignal } from "./VocabularySignal";

interface CoachCompassMinimalProps {
  profile: "senior" | "banquier" | "standard";
  activePhase: {
    number: number;
    title: string;
    keyPhrase: string;
    currentAction: string;
    nextSilence?: number;
  } | null;
  timeOnCurrentModule: number;
  minTimeRequired: number;
  hasError?: boolean;
  errorMessage?: string;
  signal?: boolean;
  onOpenPanel?: () => void;
}

export function CoachCompassMinimal({
  profile,
  activePhase,
  timeOnCurrentModule,
  minTimeRequired,
  hasError,
  errorMessage,
  signal = false,
  onOpenPanel, // ✅ DOIT ÊTRE LÀ
}: CoachCompassMinimalProps) {
  if (!activePhase) return null;

  // 🧠 Pick correct phase list
  const phases =
    profile === "senior"
      ? seniorPhases
      : profile === "banquier"
      ? banquierPhases
      : standardPhases;

  return (
    <>
      {/* 🧠 EXTREMELY DISCREET SIGNAL — visible only for you */}
      <VocabularySignal show={signal} />

      <div
        className="fixed bottom-4 left-4 z-[9999] cursor-pointer"
        onClick={onOpenPanel}
      >
        <div className="bg-black/60 backdrop-blur-md text-white rounded-2xl shadow-xl border border-white/10 p-4 w-[280px]">
          <div className="text-xs text-slate-400">
            Phase {activePhase.number} / {phases.length}
          </div>

          <h3 className="text-white font-bold text-sm mt-1">
            {activePhase.title}
          </h3>

          <p className="text-[11px] text-blue-300 italic mt-1">
            💬 {activePhase.keyPhrase}
          </p>

          <div className="mt-2 text-[11px] text-slate-300">
            🎯 {activePhase.currentAction}
          </div>

          {/* TIMER */}
          <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  (timeOnCurrentModule / minTimeRequired) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>

          {/* ⛔ Warning — manque temps */}
          {hasError && errorMessage && (
            <div className="mt-2 text-[10px] text-red-400 font-bold">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
