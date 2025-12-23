import React, { useState } from "react";
import { X, Shield } from "lucide-react";

interface SeniorCoachProps {
  monthlyBill: number;
  totalWithSolar: number;
  monthlySavings: number;
  totalCost40Years: number;
  totalSavings20Years: number;
  breakEvenYear: number;
  interestRate: number;
}

export const SeniorCoach: React.FC<SeniorCoachProps> = ({
  monthlyBill,
  totalWithSolar,
  monthlySavings,
  totalCost40Years,
  totalSavings20Years,
  breakEvenYear,
  interestRate,
}) => {
  const [phase, setPhase] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const fmt = (v: number) => `${Math.round(v).toLocaleString("fr-FR")}€`;
  const fmtK = (v: number) => `${Math.round(v / 1000)}k€`;

  const phases = [
    {
      title: "Sécurité avant tout",
      icon: "🛡️",
      objective: "Rassurer sur la fiabilité",
      script: `M. Dupont, avant de parler chiffres, une chose importante.

Votre priorité aujourd'hui, ce n'est pas de spéculer.
C'est de sécuriser votre maison et vos charges.

L'électricité, vous en aurez besoin toute votre vie.
Ce qu'on regarde ici, c'est comment la figer.

Avec EDF derrière, c'est pas un pari.
C'est une sécurisation.`,
    },
    {
      title: "Stabilité des dépenses",
      icon: "📊",
      objective: "Montrer la maîtrise des charges",
      script: `Aujourd'hui, votre situation :
→ ${fmt(monthlyBill)} / mois
→ Ça augmente tous les ans
→ Vous subissez

Avec l'installation :
→ ${fmt(totalWithSolar)} / mois
→ Montant maîtrisé sur 15 ans
→ Vous décidez

Vous ne gagnez pas de l'argent pour gagner de l'argent.
Vous ARRÊTEZ d'en perdre.

C'est une décision de tranquillité.`,
    },
    {
      title: "Transmission familiale",
      icon: "🏠",
      objective: "Parler héritage sans pression",
      script: `Question simple, sans tabou.

Le jour où vous ne serez plus là,
vous laissez :

• une maison avec une charge qui augmente ?
• ou une maison qui produit son électricité ?

Les panneaux continuent de fonctionner 25, 30 ans.
Vos enfants héritent d'un actif, pas d'un problème.

C'est pas de l'optimisation fiscale.
C'est de la protection familiale.`,
    },
    {
      title: "Temps long et fiabilité",
      icon: "⏳",
      objective: "Rassurer sur la durée",
      script: `Point important pour vous.

Le système est amorti vers l'année ${breakEvenYear}.
Mais il produit encore 10, 15, 20 ans après.

Sur 20 ans :
→ ${fmtK(totalSavings20Years)} sécurisés.

Sans stress.
Sans pari.
Sans dépendre des prix du marché.

Et si demain vous devez vendre la maison,
l'installation valorise le bien.

Les notaires le savent : maison avec panneaux = plus-value.`,
    },
    {
      title: "Garanties et accompagnement",
      icon: "✅",
      objective: "Lever les dernières peurs",
      script: `Vous allez me demander : "Et si ça tombe en panne ?"

Garantie constructeur : 25 ans sur les panneaux.
Garantie production : contractuelle.
Maintenance : incluse les 2 premières années.

Vous n'êtes pas seul.

EDF ENR, c'est pas une startup qui ferme dans 3 ans.
C'est EDF. Filiale du groupe.

Si un problème arrive, vous avez un interlocuteur.
Un vrai.`,
    },
    {
      title: "Décision sereine",
      icon: "🤝",
      objective: "Close sans pression",
      script: `Vous n'avez aucune urgence artificielle ici.

Je ne vais pas vous mettre la pression avec un quota qui disparaît dans 2h.

La seule vraie question, c'est simple :

Est-ce que vous préférez continuer à subir l'inflation,
ou sécuriser maintenant pour être tranquille ensuite ?

Taux proposé : ${interestRate}%.
Conditions valables 15 jours.

Quand vous êtes prêt, on formalise.
Sans précipitation.

Vous voulez en parler avec vos enfants avant ?
Pas de souci. Je vous laisse le dossier complet.

Ils verront les chiffres. Ils vous diront la même chose que moi.`,
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl transition-all flex items-center gap-2 font-bold text-sm bottom-6 right-6"
      >
        <Shield size={16} />
        <span>Coach Sécurité</span>
      </button>

      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-zinc-900 border-l border-white/10 p-6 z-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-black text-white">
                COACH SÉCURITÉ & TRANSMISSION
              </h2>
            </div>
            <X
              onClick={() => setIsOpen(false)}
              className="text-slate-500 cursor-pointer hover:text-white"
              size={20}
            />
          </div>

          <div className="mb-6 bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4">
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              ✅ Profil détecté : SÉCURITÉ
            </div>
            <div className="text-slate-300 text-xs">
              Priorités : tranquillité, fiabilité, transmission, zéro risque
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">
              PHASE {phase + 1} / {phases.length}
            </div>
            <div className="h-1.5 bg-black rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${((phase + 1) / phases.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-6 shadow-inner mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{phases[phase].icon}</span>
              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  {phases[phase].title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  🎯 {phases[phase].objective}
                </p>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
              <div className="text-sm text-white whitespace-pre-line leading-relaxed">
                {phases[phase].script}
              </div>
            </div>

            <div className="flex gap-3">
              {phase > 0 && (
                <button
                  onClick={() => setPhase(phase - 1)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Précédent
                </button>
              )}
              <button
                onClick={() => {
                  if (phase < phases.length - 1) {
                    setPhase(phase + 1);
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                {phase === phases.length - 1 ? "Terminer" : "Suivant"}
              </button>
            </div>
          </div>

          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-slate-400">
            <div className="font-bold text-emerald-400 mb-2 uppercase tracking-wider">
              ⚠️ Rappels clés pour ce profil
            </div>
            <ul className="space-y-2">
              <li>• Jamais de pression temporelle agressive</li>
              <li>• Toujours mentionner les garanties</li>
              <li>• Parler transmission / enfants</li>
              <li>• Insister sur EDF = sécurité État</li>
              <li>• Proposer de revoir avec la famille</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
