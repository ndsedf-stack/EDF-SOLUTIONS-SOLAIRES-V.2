import React, { useState, useEffect } from "react";

type BaseProfile = "senior" | "banquier" | "standard";
type BrainProfile = BaseProfile | "hybride";
type ScoreMap = Record<BaseProfile, number>;

const questions = [
  {
    q: "Quand vous investissez, vous êtes plutôt :",
    answers: [
      {
        text: "Sécurité avant tout",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "Comprendre les chiffres en détail",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Économies concrètes rapides",
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
    ],
  },
  {
    q: "Concernant votre maison :",
    answers: [
      {
        text: "Protéger son patrimoine",
        scores: { senior: 2, banquier: 0, standard: 1 },
      },
      {
        text: "Valeur patrimoniale",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Réduire mes factures",
        scores: { senior: 1, banquier: 0, standard: 2 },
      },
    ],
  },
  {
    q: "Ce qui vous ferait dire OUI :",
    answers: [
      {
        text: "Être complètement rassuré",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "Une logique financière claire",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Un gain dès la première année",
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
    ],
  },
  {
    q: "Dans un projet long terme, vous voulez surtout :",
    answers: [
      {
        text: "Être certain de ma décision",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "Avoir vérifié tous les détails",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Maîtriser l'impact sur mon budget",
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
    ],
  },
];

function detectProfile(scores: ScoreMap): BrainProfile {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] - sorted[1][1] <= 1) return "hybride";
  return sorted[0][0] as BrainProfile;
}

function normalizeProfile(p: BrainProfile, scores: ScoreMap): BaseProfile {
  if (p === "hybride") return "senior";

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][0] !== "senior" && sorted[0][1] - scores.senior <= 2) {
    return "senior";
  }

  return p as BaseProfile;
}

export function SpeechView({ onProfileDetected }: any) {
  const [step, setStep] = useState<"quiz" | "done">("quiz");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<ScoreMap>({
    senior: 0,
    banquier: 0,
    standard: 0,
  });

  function handleAnswer(score: ScoreMap) {
    const next = {
      senior: scores.senior + score.senior,
      banquier: scores.banquier + score.banquier,
      standard: scores.standard + score.standard,
    };
    setScores(next);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      const detected = detectProfile(next);
      const finalProfile = normalizeProfile(detected, next);

      setStep("done");
      if (typeof onProfileDetected === "function")
        onProfileDetected(finalProfile);
    }
  }

  if (step === "done") return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
      {/* Progression visuelle */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= questionIndex ? "bg-blue-500" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Phrase neutralisante */}
      <p className="text-xs text-zinc-400 mb-4 italic">
        Aucune bonne ou mauvaise réponse — juste pour adapter notre
        présentation.
      </p>

      {/* Titre */}
      <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-wide mb-2">
        4 QUESTIONS — VOTRE SITUATION
      </p>

      {/* Question */}
      <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
        {questions[questionIndex].q}
      </h2>

      {/* Réponses */}
      <div className="space-y-4">
        {questions[questionIndex].answers.map((a, i) => (
          <button
            key={i}
            onClick={() => {
              setTimeout(() => handleAnswer(a.scores), 800);
            }}
            className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white rounded-2xl transition-all"
          >
            {a.text}
          </button>
        ))}
      </div>
    </div>
  );
}
