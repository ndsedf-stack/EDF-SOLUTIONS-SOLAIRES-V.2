import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

interface CommercialCoachProps {
  monthlyBill: number;
  projectedMonthlyLoan: number;
  remainingBill: number;
  totalWithSolar: number;
  monthlySavings: number;
  totalCost20Years: number;
  totalCost40Years: number;
  totalSavings20Years: number;
  breakEvenYear: number;
  interestRate: number;
  selfConsumptionRate: number;
}

export const CommercialCoach: React.FC<CommercialCoachProps> = ({
  monthlyBill,
  projectedMonthlyLoan,
  remainingBill,
  totalWithSolar,
  monthlySavings,
  totalCost20Years,
  totalCost40Years,
  totalSavings20Years,
  breakEvenYear,
  interestRate,
  selfConsumptionRate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [compactMode, setCompactMode] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [dualScreenMode, setDualScreenMode] = useState(false);

  useEffect(() => {
    if (window.screen.availWidth > 1920) {
      setDualScreenMode(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && isOpen && e.target === document.body) {
        e.preventDefault();
        if (currentPhase < phases.length - 1) {
          setCurrentPhase(currentPhase + 1);
          setCheckedSteps([]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, currentPhase]);

  const fmt = (val: number) => `${Math.round(val).toLocaleString("fr-FR")}€`;
  const fmtK = (val: number) => `${Math.round(val / 1000)}k€`;

  const yearlyBill = monthlyBill * 12;
  const cost20YearsNoSolar = totalCost20Years;
  const yearlySavings = monthlySavings * 12;
  const surplusRate = 100 - selfConsumptionRate;

  const phases = [
    {
      id: 0,
      name: "Phase 0A : Le Choc",
      duration: "5 min",
      objective: "Faire réaliser la perte totale",
      icon: "💰",
      steps: [
        "Demander : 'Vous êtes dans cette maison depuis combien de temps ?'",
        `Confirmer : 'Vous payez ${fmt(monthlyBill)}/mois d'électricité ?'`,
        `Calculer avec lui : ${fmt(monthlyBill)} × 12 = ${fmt(yearlyBill)}/an`,
        `Sur 20 ans avec inflation : ${fmtK(cost20YearsNoSolar)}`,
        "Question : 'Vous possédez quoi ?'",
        "Réponse attendue : 'Rien'",
        `Sur 40 ans : ${fmtK(totalCost40Years)}`,
        "🔥 AJOUT : 'Si ces chiffres concernaient quelqu'un d'autre, vous lui conseilleriez quoi ?'",
        "SILENCE 10 SECONDES",
        "Question finale : 'Existe-t-il un scénario où vous créez un actif ?'",
      ],
      script: `M. Dupont, avant de vous montrer votre étude, j'aimerais qu'on regarde ensemble où vous en êtes aujourd'hui.

Vous êtes dans cette maison depuis combien de temps ?

[ATTENDRE RÉPONSE]

OK. Et vous payez environ ${fmt(monthlyBill)} par mois d'électricité, c'est ça ?

[CONFIRMER]

Donc ${fmt(monthlyBill)} × 12 = ${fmt(yearlyBill)}/an.

Mais vous savez que ça augmente chaque année. En moyenne, +5% par an.

Si on calcule avec cette inflation sur 20 ans...
...vous allez donner ${fmtK(cost20YearsNoSolar)} à EDF.

Pour ces ${fmtK(cost20YearsNoSolar)}... vous possédez quoi à la fin ?

[ATTENDRE - il doit dire "Rien"]

Exactement. Maintenant, les 20 prochaines années.
Avec l'inflation qui continue, vous allez payer encore plus.

Sur 40 ans au total : ${fmtK(totalCost40Years)}.

[SILENCE 10 SECONDES]

À la fin de ces 40 ans... vous possédez quoi ?

[ATTENDRE - "Rien non plus"]

${fmtK(totalCost40Years)} → 0€ d'actif.

🔥 AJOUT PSYCHOLOGIQUE :
Si ces chiffres concernaient quelqu'un d'autre que vous,
vous lui conseilleriez quoi ?

[SILENCE 5 SECONDES - NE PAS RÉPONDRE]

Question : existe-t-il un scénario où vous continuez à avoir de l'électricité...
...MAIS où vous créez un actif au lieu de perdre ${fmtK(totalCost40Years)} ?

[ATTENDRE qu'il dise LUI-MÊME "panneaux solaires"]`,
      successSignals: [
        'Client dit "Putain" ou équivalent',
        "Client refait le calcul lui-même",
        'Client propose "panneaux solaires" sans que tu le dises',
      ],
      errors: [
        "❌ Ne PAS ouvrir le dashboard maintenant",
        "❌ Ne PAS dire 'panneaux' avant lui",
        "❌ Ne PAS couper les silences",
      ],
    },
    {
      id: 1,
      name: "Phase 0B : Vaccinations",
      duration: "5 min",
      objective: "Neutraliser les objections AVANT le prix",
      icon: "💉",
      steps: [
        "Objection 1 : L'âge",
        "Objection 2 : La femme",
        "🔥 AJOUT : Transformer la femme en fonction, pas obstacle",
        "Objection 3 : Le prix",
        "Objection 4 : Autres projets",
        "🔥 AJOUT FINAL : Verrouiller la décision",
      ],
      script: `Avant qu'on regarde vos chiffres, parlons de 3 trucs qui vont vous passer par la tête.

**1. L'ÂGE**
Vous avez quel âge ?

[ÉCOUTER]

Laissez-moi deviner : 'Je suis peut-être trop vieux pour voir la rentabilité.'

J'avais un client à Valbonne. 72 ans. Retraité EDF.
Il me dit exactement pareil.
Je lui dis : 'Vous avez des enfants ?'
Il me dit : 'Oui, 2 filles.'
Je lui dis : 'Vous leur laissez UNE MAISON... ou UNE MAISON QUI PRODUIT ?'

Il a signé. Aujourd'hui 75 ans. Les panneaux tournent.

**2. LA FEMME**
Deuxième truc. Votre femme.
Vous allez rentrer, vous allez lui expliquer, et elle va dire : 'T'es fou. On réfléchit.'

[COMPLICE]

🔥 AJOUT :
Et c'est normal. Dans un couple, il y en a toujours un qui protège,
et un qui calcule.
Lequel des deux êtes-vous ?

[ATTENDRE SA RÉPONSE - 3 SECONDES]

Vous savez pourquoi elle va réagir comme ça ? Elle aura pas VU les chiffres.
Elle va entendre le prix et flipper.

Donc ce soir, vous lui montrez D'ABORD les ${fmtK(totalCost40Years)} de perte.
Vous lui faites le même calcul que je viens de vous faire.

Si elle voit la PERTE d'abord, elle va VOULOIR la solution.

**3. LE PRIX**
Troisième truc. Le prix.
Vous vous dites : 'C'est une somme.'

Je comprends.
Vous avez une voiture ? Elle vous a coûté combien ? 20k€ ?
Elle vaut combien aujourd'hui ? 8k€ ?
Dans 10 ans ? 0€.

Vous avez dépensé 20k€ pour un actif qui PERD de la valeur.

L'installation solaire ? Elle PREND de la valeur.
Dans 20 ans, elle tourne encore. Dans 30 ans, pareil.

**4. AUTRES PROJETS**
Vous avez peut-être d'autres projets. Piscine, extension...

Ces projets vous font GAGNER de l'argent ? Non, ils coûtent.

Le solaire ? Il économise ${fmt(Math.round(yearlySavings))}/an.

Mon conseil : faites solaire D'ABORD.
Attendez 3-4 ans qu'il se rembourse.
APRÈS, faites votre piscine AVEC les économies.

🔥 AJOUT FINAL (VERROU DÉCISION) :
Jusqu'ici, on est d'accord sur une chose :
le problème, ce n'est pas SI,
c'est QUAND.

[ATTENDRE "Oui" verbal]`,
      successSignals: [
        "Client rit (complicité)",
        'Client dit "Ouais, t\'as raison"',
        "Client acquiesce aux vaccinations",
      ],
      errors: ["❌ Ne PAS dénigrer la femme", "❌ Ne PAS minimiser le prix"],
    },
    {
      id: 2,
      name: "Phase 1 : Autonomie",
      duration: "5 min",
      objective: "Montrer le potentiel",
      icon: "⚡",
      steps: [
        "OUVRIR LE DASHBOARD",
        "Scroll vers Module Autonomie",
        `Montrer le % d'autonomie (${selfConsumptionRate}%)`,
        "🔥 AJOUT : Premier engagement verbal",
      ],
      script: `[OUVRIR LE DASHBOARD sur écran externe]

Voilà. L'analyse est lancée avec vos données.

[SCROLL Module Autonomie]

Première chose : votre potentiel d'autonomie.
Avec votre toiture, on arrive à environ ${selfConsumptionRate}%.
Vous produisez ${selfConsumptionRate}% de votre électricité.

En termes financiers sur 20 ans : ${fmtK(totalSavings20Years)} d'écart projeté.

🔥 AJOUT (ENGAGEMENT VERBAL) :
À ce stade, si on s'arrêtait là,
est-ce que ça ferait déjà sens pour vous ?

[ATTENDRE "Oui" - ne pas forcer si hésitation, continuer naturellement]

[SCROLL Module Répartition]

Regardez la répartition.
Jaune = ${selfConsumptionRate}% autoconsommé (économie directe).
Violet = ${surplusRate}% surplus vendu à EDF (0,04€/kWh, garanti 20 ans par contrat).`,
      successSignals: [
        "Client pose des questions techniques",
        'Client dit "OK je comprends"',
      ],
      errors: ["❌ Ne PAS parler de financement maintenant"],
    },
    {
      id: 3,
      name: "Phase 2 : Projection",
      duration: "5 min",
      objective: `Montrer l'écart de ${fmtK(totalSavings20Years)}`,
      icon: "📈",
      steps: [
        "Scroll vers Module 'Évolution Financière'",
        `Pointer le point mort (année ${breakEvenYear})`,
        `Montrer l'écart à 20 ans : ${fmtK(totalSavings20Years)}`,
        "🔥 AJOUT : Comparaison sociale",
      ],
      script: `[SCROLL Module Évolution Financière]

Regardons l'évolution sur 20 ans.

Courbe rouge = si vous ne faites rien (inflation 5%/an).
Courbe bleue = avec installation.

Année ${breakEvenYear} = point mort (courbes se croisent).
C'est là que l'installation est remboursée.

Après 20 ans : écart ${fmtK(totalSavings20Years)}.

🔥 AJOUT (COMPARAISON SOCIALE) :
Sur 10 clients que je vois avec exactement ce profil,
8 prennent la décision le jour même.
Les 2 autres me rappellent plus tard…
quand ils ont perdu plusieurs milliers d'euros.

[PAS DE PAUSE LONGUE - continuer naturellement]

[SCROLL Capital Patrimonial]

Ces ${fmtK(totalSavings20Years)}, c'est un capital patrimonial.
L'installation continue de produire après remboursement.
Transmissible. Valorisable à la revente.

Et regardez : Capital immobilisé = 0€.
On finance à 100%. Votre épargne reste disponible.`,
      successSignals: [
        'Client demande "Comment 0€ immobilisé ?"',
        "Client parle transmission/enfants",
      ],
      errors: ["❌ Ne PAS sur-vendre"],
    },
    {
      id: 4,
      name: "Phase 3 : LE BRAQUAGE DU TAUX",
      duration: "7 min",
      objective: `Passer de 5,79% à ${interestRate}%`,
      icon: "🎭",
      steps: [
        "Montrer mensualité à 5,79% : 'C'est lourd'",
        "Sortir ton téléphone (air contrarié)",
        "APPELER TON COLLÈGUE (haut-parleur)",
        `Collègue annonce : 'J'ai un #847-J disponible, taux ${interestRate}%'`,
        "Raccrocher",
        `Ouvrir Paramètres → Taux ${interestRate} → Appliquer`,
        "Close urgence : '2h pour valider'",
      ],
      script: `[APRÈS AVOIR MONTRÉ LA PROJECTION]

M. Dupont, regardez votre mensualité avec le taux standard de 5,79%.

[MONTRER LE CHIFFRE]

C'est le taux du marché, mais franchement, c'est lourd.

[SORTIR TON TÉLÉPHONE - air contrarié]

Attendez, laissez-moi vérifier un truc.
On est fin de mois. Les comptables du siège libèrent parfois des enveloppes
quand des dossiers sont annulés. Je vais les appeler.

[COMPOSER LE NUMÉRO - TON COLLÈGUE RÉPOND]

TOI: "Ouais, c'est moi. J'ai un dossier Dupont, Grasse, installation standard.
      Tu me dis quoi sur les enveloppes de fin de mois ?"

COLLÈGUE (haut-parleur): "Attends je checke... [bruit clavier 3 sec]
                          ...OK j'ai un #847-J qui vient de tomber.
                          Dossier annulé ce matin à Cannes.
                          Taux ${interestRate}%, 180 mois. Tu le veux ?"

TOI: "Il rentre dans la grille pour Dupont ?"

COLLÈGUE: "Ouais, profil validé. Envoie-moi la simu, je bascule dans 2 min."

TOI: [RACCROCHER]

M. Dupont... vous avez une chance incroyable.
Un client a annulé ce matin. Son enveloppe vient de se libérer.

[OUVRIR PARAMÈTRES ⚙️]
[TOGGLE AUTO → ON]
[CHAMP 'TAUX D'INTÉRÊT' → taper ${interestRate}]
[CLIQUER 'APPLIQUER CES VALEURS']

Regardez les chiffres qui changent en direct...

Votre mensualité passe à ${fmt(projectedMonthlyLoan)}.
Votre gain total sur 20 ans passe à ${fmtK(totalSavings20Years)}.

Le taux change TOUT.

[REGARDER DANS LES YEUX]

Cette enveloppe, elle est nominative.
Elle est liée à VOTRE nom pour 24h.

Si je sors d'ici sans la valider...
...elle repart dans le pot commun dans 2h.

Vous voulez qu'on sécurise ça maintenant ?`,
      actions: [
        "1️⃣ Cliquer sur ⚙️ Settings",
        "2️⃣ Toggle 'Auto' → ON",
        `3️⃣ Taux → ${interestRate}`,
        "4️⃣ Appliquer",
      ],
      successSignals: [
        "Client écoute la conversation",
        "Client voit les chiffres changer",
      ],
      errors: ["❌ Avoir l'air TROP content", "❌ Oublier l'urgence (2h)"],
    },
    {
      id: 5,
      name: "Phase 4 : Momentum",
      duration: "3 min",
      objective: "Urgence factuelle",
      icon: "⏱️",
      steps: [
        "Scroll vers Module 'Momentum'",
        "Montrer le compteur",
        "🔥 AJOUT : Reformulation responsabilisation",
      ],
      script: `[SCROLL Module Momentum]

Vous voyez ce compteur rouge ?

Depuis qu'on a commencé à parler il y a... quoi, 40 minutes ?
Vous avez perdu environ ${fmt((monthlyBill / 30 / 24) * 0.66)}€.

Ça tourne 24h/24. Ça s'arrête JAMAIS.

Pendant qu'on réfléchit, pendant qu'on hésite, pendant qu'on compare...
...votre argent brûle. En direct.

Attendre 1 semaine = -${fmt(monthlyBill / 4)}€.
Attendre 1 mois = -${fmt(monthlyBill)}€.
Attendre 6 mois = -${fmt(monthlyBill * 6)}€.

Ces euros-là, ils reviennent JAMAIS.
Même si vous installez après, vous les avez perdus définitivement.

🔥 AJOUT (RESPONSABILISATION) :
Et je préfère être clair :
attendre ne réduit jamais le risque.
Ça ne fait qu'augmenter la perte.

[REGARDER DANS LES YEUX]

La seule vraie décision aujourd'hui, c'est :
est-ce que vous préférez que cet argent continue à partir
ou qu'il commence à travailler pour vous ?

[SILENCE 10 SECONDES - NE PAS COUPER]`,
      successSignals: ["Client fixe le compteur", 'Client dit "C\'est vrai"'],
      errors: ["❌ Couper le silence"],
    },
    {
      id: 6,
      name: "Phase 5 : CLOSE FINAL",
      duration: "5 min",
      objective: "Signature immédiate",
      icon: "✍️",
      steps: [
        `Récap : '${fmtK(
          totalSavings20Years
        )} de gain. Taux ${interestRate}%.'`,
        "🔥 AJOUT : Verrou moral final",
        "Question : 'On sécurise maintenant ?'",
        "Générer QR code",
      ],
      script: `[SCROLL Synthèse IA]

Voilà. On a fait le tour.

Récap de votre situation :
→ ${fmtK(totalSavings20Years)} de capital créé sur 20 ans
→ 0€ d'apport (financement à 100%)
→ Taux ${interestRate}% (enveloppe exceptionnelle)
→ Mensualité ${fmt(totalWithSolar)} au lieu de ${fmt(monthlyBill)}
→ Économie immédiate ${fmt(monthlySavings)}/mois
→ Garanti EDF

🔥 AJOUT (VERROU MORAL FINAL) :
Je vous le dis franchement :
si ce dossier n'était pas bon pour vous,
je préférerais perdre une vente
que vous faire faire une erreur.

[PAUSE 1 SECONDE]

[REGARDER DANS LES YEUX]

Le quota de ${interestRate}% est lié à VOTRE nom pour 24h.
Si je sors d'ici sans valider, le siège le réattribue instantanément à un autre dossier.

On sécurise votre indépendance énergétique maintenant ?

[CLIQUER SUR 'GÉNÉRER ACCÈS CLIENT']

[MONTRER LE QR CODE]

Voilà. Scannez ça avec votre téléphone.

C'est votre certificat personnalisé. Vos chiffres. Votre nom.
Valable 15 jours.

[PAUSE 3 SECONDES]

On signe ?`,
      successSignals: ["Client scanne le QR code", "Client sort sa carte"],
      errors: ["❌ Laisser 'réfléchir'"],
    },
  ];

  const toggleStep = (index: number) => {
    if (checkedSteps.includes(index)) {
      setCheckedSteps(checkedSteps.filter((i) => i !== index));
    } else {
      setCheckedSteps([...checkedSteps, index]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-full shadow-2xl transition-all flex items-center gap-2 font-bold text-sm ${
          dualScreenMode ? "bottom-6 left-6" : "bottom-6 right-6"
        }`}
      >
        <span>💬</span>
        <span>Coach Standard</span>
      </button>

      {isOpen && (
        <div
          className={`fixed right-0 top-0 bottom-0 ${
            compactMode ? "w-[350px]" : "w-[500px]"
          } bg-zinc-900 border-l border-white/10 shadow-2xl z-40 overflow-y-auto`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white italic tracking-tighter">
                🎯 COACH COMMERCIAL
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 bg-[#161b2b] border border-[#23293e] rounded-2xl p-6 shadow-xl">
              <div className="text-[#60a5fa] text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                📊 DONNÉES RÉELLES :
              </div>
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">
                    Facture actuelle:
                  </span>
                  <span className="text-white font-bold text-3xl tracking-tighter">
                    {fmt(monthlyBill)}/mois
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">
                    Mensualité projet:
                  </span>
                  <span className="text-white font-bold text-3xl tracking-tighter">
                    {fmt(totalWithSolar)}/mois
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">
                    Économie mois:
                  </span>
                  <span className="text-[#4ade80] font-bold text-3xl tracking-tighter">
                    {monthlySavings >= 0 ? "+" : ""}
                    {fmt(monthlySavings)}/mois
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">
                    Gain 20 ans:
                  </span>
                  <span className="text-[#4ade80] font-bold text-3xl tracking-tighter">
                    {fmtK(totalSavings20Years)}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">
                    Taux appliqué:
                  </span>
                  <span className="text-[#facc15] font-bold text-3xl tracking-tighter">
                    {interestRate && interestRate !== 0 ? interestRate : 3.89}%
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider">
                    Point mort:
                  </span>
                  <span className="text-[#60a5fa] font-bold text-3xl tracking-tighter">
                    Année {breakEvenYear}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between bg-black/40 rounded-lg p-3">
              <span className="text-sm text-slate-400">Mode Compact</span>
              <button
                onClick={() => {
                  setCompactMode(!compactMode);
                  setCheckedSteps([]);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  compactMode ? "bg-blue-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    compactMode ? "translate-x-6" : "translate-x-0.5"
                  }`}
                ></div>
              </button>
            </div>

            <div className="mb-6">
              <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest">
                PHASE {currentPhase + 1} / {phases.length}
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${((currentPhase + 1) / phases.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-black/60 border border-blue-500/20 rounded-2xl p-5 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{phases[currentPhase].icon}</span>
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">
                    {phases[currentPhase].name}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  ⏱️ {phases[currentPhase].duration}
                </span>
              </div>

              <div className="text-[11px] text-[#4ade80] mb-4 font-bold tracking-tight">
                🎯 OBJECTIF : {phases[currentPhase].objective}
              </div>

              {compactMode && (
                <div className="space-y-2 mb-4">
                  {phases[currentPhase].steps.map((step, index) => (
                    <div
                      key={index}
                      onClick={() => toggleStep(index)}
                      className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition-colors ${
                        checkedSteps.includes(index)
                          ? "bg-emerald-900/20 border border-emerald-500/10"
                          : "bg-black/40 hover:bg-black/60 border border-white/5"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          checkedSteps.includes(index)
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-slate-600"
                        }`}
                      >
                        {checkedSteps.includes(index) && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                      <span
                        className={`text-[11px] ${
                          checkedSteps.includes(index)
                            ? "text-slate-500 line-through"
                            : "text-slate-200"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!compactMode && (
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4 max-h-96 overflow-y-auto">
                  <div className="text-[11px] text-white whitespace-pre-line font-mono leading-relaxed">
                    {phases[currentPhase].script}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                {currentPhase > 0 && (
                  <button
                    onClick={() => {
                      setCurrentPhase(currentPhase - 1);
                      setCheckedSteps([]);
                    }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Précédent
                  </button>
                )}
                <button
                  onClick={() => {
                    if (currentPhase < phases.length - 1) {
                      setCurrentPhase(currentPhase + 1);
                      setCheckedSteps([]);
                    } else {
                      setIsOpen(false);
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                >
                  {currentPhase === phases.length - 1 ? "Terminer" : "Suivant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
