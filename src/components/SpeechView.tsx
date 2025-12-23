import React, { useState } from "react";
import { Brain, Shield, Calculator, Zap } from "lucide-react";
import { SeniorCoach } from "./coaches/SeniorCoach";
import { BanquierCoach } from "./coaches/BanquierCoach";

/* =======================
   TYPES & LOGIQUE
======================= */
type BaseProfile = "senior" | "banquier" | "standard";
type BrainProfile = BaseProfile | "hybride";
type ScoreMap = Record<BaseProfile, number>;

const questions = [
  {
    q: "Quand vous investissez, vous êtes plutôt :",
    answers: [
      {
        text: "Très prudent, zéro risque",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "Tout analyser en détail",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Impact immédiat sur mon budget",
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
    ],
  },
  {
    q: "Concernant votre maison :",
    answers: [
      {
        text: "Sécurité et transmission",
        scores: { senior: 2, banquier: 0, standard: 1 },
      },
      {
        text: "Valeur patrimoniale",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Réduire les charges",
        scores: { senior: 1, banquier: 0, standard: 2 },
      },
    ],
  },
  {
    q: "Ce qui vous ferait dire OUI :",
    answers: [
      {
        text: "Être rassuré à 100%",
        scores: { senior: 2, banquier: 1, standard: 0 },
      },
      {
        text: "Une logique financière claire",
        scores: { senior: 0, banquier: 2, standard: 1 },
      },
      {
        text: "Économies immédiates",
        scores: { senior: 0, banquier: 1, standard: 2 },
      },
    ],
  },
];

const profileInfo = {
  senior: { icon: Shield, title: "Profil Sécurité", color: "emerald" },
  banquier: { icon: Calculator, title: "Profil Analytique", color: "blue" },
  standard: { icon: Zap, title: "Profil Pragmatique", color: "purple" },
  hybride: { icon: Brain, title: "Profil Équilibré", color: "indigo" },
};

function detectProfile(scores: ScoreMap): BrainProfile {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] - sorted[1][1] <= 1) return "hybride";
  return sorted[0][0] as BrainProfile;
}

/* =======================
   COMPOSANT PRINCIPAL
======================= */
export function SpeechView({
  monthlyBill = 0,
  projectedMonthlyLoan = 0,
  remainingBill = 0,
  totalWithSolar = 0,
  monthlySavings = 0,
  onProfileDetected,
}: any) {
  const [step, setStep] = useState<"quiz" | "result">("quiz");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<ScoreMap>({
    senior: 0,
    banquier: 0,
    standard: 0,
  });
  const [profile, setProfile] = useState<BrainProfile>("standard");

  function handleAnswer(s: ScoreMap) {
    const next = {
      senior: scores.senior + s.senior,
      banquier: scores.banquier + s.banquier,
      standard: scores.standard + s.standard,
    };
    setScores(next);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setProfile(detectProfile(next));
      setStep("result");
    }
  }

  const p = profileInfo[profile] || profileInfo.standard;
  const Icon = p.icon;

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
      {/* ÉTAPE 1 : LE QUIZ */}
      {step === "quiz" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2 italic">
            ANALYSE DE VOTRE LOGIQUE
          </p>
          <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
            {questions[questionIndex].q}
          </h2>
          <div className="space-y-4">
            {questions[questionIndex].answers.map((a, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(a.scores)}
                className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white rounded-2xl transition-all"
              >
                {a.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ÉTAPE 2 : LE RÉSULTAT AVANT COACH */}
      {step === "result" && (
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                Analyse terminée
              </p>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                {p.title}
              </h1>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-2 tracking-widest">
              Facture actuelle (Perte sèche) :
            </p>
            <div className="text-white text-5xl font-black">
              {Math.round(monthlyBill)}€
              <span className="text-xl font-light text-slate-500 ml-2">
                / mois
              </span>
            </div>
            <p className="text-sm text-red-400/80 mt-4 italic">
              Cette somme est injectée à fonds perdus chaque mois. L'analyse qui
              suit va vous montrer comment la transformer en capital.
            </p>
          </div>

          <button
            onClick={() => {
              // On envoie le profil final au parent (App.tsx)
              // C'est ce qui va faire disparaître le quiz et afficher le CoachRouter
              if (typeof onProfileDetected === "function") {
                onProfileDetected(profile);
              }
            }}
            className="w-full py-6 bg-white text-black rounded-2xl font-black text-xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
          >
            LANCER MON ANALYSE PERSONNALISÉE →
          </button>
        </div>
      )}
    </div>
  );
}
