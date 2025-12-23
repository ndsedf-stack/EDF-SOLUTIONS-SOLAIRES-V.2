import React, { useState } from "react";
import { X, Calculator } from "lucide-react";

interface BanquierCoachProps {
  monthlyBill: number;
  totalWithSolar: number;
  monthlySavings: number;
  totalCost20Years: number;
  totalSavings20Years: number;
  breakEvenYear: number;
  interestRate: number;
  selfConsumptionRate: number;
}

export const BanquierCoach: React.FC<BanquierCoachProps> = ({
  monthlyBill,
  totalWithSolar,
  monthlySavings,
  totalCost20Years,
  totalSavings20Years,
  breakEvenYear,
  interestRate,
  selfConsumptionRate,
}) => {
  const [phase, setPhase] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  const fmt = (v: number) => `${Math.round(v).toLocaleString("fr-FR")}€`;
  const fmtK = (v: number) => `${Math.round(v / 1000)}k€`;

  const phases = [
    {
      title: "Cadre d'analyse",
      icon: "📋",
      objective: "Poser le raisonnement froid",
      script: `M. Dupont, on va raisonner simplement.
Sans discours commercial.

Vous avez aujourd'hui une dépense contrainte :
→ Électricité
→ Inflation moyenne 5% / an
→ Aucun actif en contrepartie

La question est :
faut-il continuer à la subir ou l'arbitrer ?

On va regarder les chiffres.
Vous conclurez vous-même.`,
    },
    {
      title: "Comparaison de scénarios",
      icon: "📊",
      objective: "Montrer 2 allocations possibles",
      script: `**Scénario A — Statu quo**
• Dépense mensuelle : ${fmt(monthlyBill)}
• Évolution : +5% / an (inflation énergétique)
• Capital final sur 20 ans : 0€
• Dépense cumulée : ${fmtK(totalCost20Years)}

**Scénario B — Avec installation**
• Dépense mensuelle : ${fmt(totalWithSolar)}
• Évolution : maîtrisée (crédit fixe)
• Capital final : actif productif valorisable
• Économie nette 20 ans : ${fmtK(totalSavings20Years)}

Ce n'est pas un achat.
C'est un arbitrage de flux.`,
    },
    {
      title: "Rendement implicite",
      icon: "💹",
      objective: "Parler ROI",
      script: `Regardons le rendement implicite.

Mensualité projet : ${fmt(totalWithSolar)}
Économie mensuelle : ${fmt(monthlySavings)}

Sur 20 ans :
→ ${fmtK(totalSavings20Years)} dégagés

C'est un rendement :
• Non fiscalisé
• Indexé sur l'inflation énergétique
• Garanti par contrat EDF (rachat surplus 20 ans)

Point mort : année ${breakEvenYear}.
Après : flux positif pur.

Aucun autre placement ne combine ces 3 critères.`,
    },
    {
      title: "Analyse de risque",
      icon: "⚖️",
      objective: "Désamorcer les objections rationnelles",
      script: `Parlons risque. Vous y pensez forcément.

**Risque technologique**
• Technologie mature (40 ans de recul)
• Garantie constructeur 25 ans
• Risque : faible

**Risque fournisseur**
• EDF ENR (filiale groupe EDF)
• Contrat rachat surplus : État français
• Risque : quasi nul

**Risque réglementaire**
• Contrat long terme
• Cadre juridique stable
• Risque : faible

**Risque principal**
• Ne rien faire
• Subir l'inflation
• Perte d'opportunité certaine`,
    },
    {
      title: "Structuration financière",
      icon: "🏦",
      objective: "Montrer la cohérence patrimoniale",
      script: `Structuration proposée :

• Financement : 100%
• Taux : ${interestRate}%
• Durée : 180 mois (15 ans)
• Apport : 0€

Votre épargne reste disponible.
Votre capacité d'emprunt n'est pas affectée.
Votre cash-flow mensuel s'améliore de ${fmt(monthlySavings)}.

En termes de bilan patrimonial :
• Actif : +1 installation productive
• Passif : dette remboursée par économies
• Cash-flow : positif dès année ${breakEvenYear}

C'est une opération blanche qui génère du rendement.`,
    },
    {
      title: "Décision rationnelle",
      icon: "✅",
      objective: "Close par logique pure",
      script: `Ce n'est pas un produit à "vendre".
C'est une décision patrimoniale à prendre ou non.

Personnellement, à ces conditions :
• Taux ${interestRate}%
• ROI ${breakEvenYear} ans
• Rendement non fiscalisé

Le dossier est cohérent.

La seule variable, c'est le timing.

Différer a un coût mesurable :
• 1 mois = -${fmt(monthlyBill)} définitifs
• 6 mois = -${fmt(monthlyBill * 6)} définitifs

À vous de décider quand vous voulez exécuter l'arbitrage.

Moi, je ne force rien.
Je vous donne les chiffres.

Vous prenez la décision qui vous semble rationnelle.`,
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-full shadow-2xl transition-all flex items-center gap-2 font-bold text-sm bottom-6 right-6"
      >
        <Calculator size={16} />
        <span>Coach Analyse</span>
      </button>

      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-zinc-900 border-l border-white/10 p-6 z-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-black text-white">
                ANALYSE PATRIMONIALE
              </h2>
            </div>
            <X
              onClick={() => setIsOpen(false)}
              className="text-slate-500 cursor-pointer hover:text-white"
              size={20}
            />
          </div>

          <div className="mb-6 bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              🧠 Profil détecté : ANALYTIQUE
            </div>
            <div className="text-slate-300 text-xs">
              Priorités : cohérence, ROI, arbitrage, zéro bullshit
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">
              PHASE {phase + 1} / {phases.length}
            </div>
            <div className="h-1.5 bg-black rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${((phase + 1) / phases.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-black/60 border border-blue-500/20 rounded-2xl p-6 shadow-inner mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{phases[phase].icon}</span>
              <div>
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
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
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                {phase === phases.length - 1 ? "Terminer" : "Suivant"}
              </button>
            </div>
          </div>

          <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 text-xs text-slate-400">
            <div className="font-bold text-blue-400 mb-2 uppercase tracking-wider">
              ⚠️ Rappels clés pour ce profil
            </div>
            <ul className="space-y-2">
              <li>• ZÉRO storytelling émotionnel</li>
              <li>• ZÉRO théâtre (appels, enveloppes)</li>
              <li>• Parler ROI, arbitrage, flux</li>
              <li>• Laisser conclure seul</li>
              <li>• Ne jamais forcer la décision</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
