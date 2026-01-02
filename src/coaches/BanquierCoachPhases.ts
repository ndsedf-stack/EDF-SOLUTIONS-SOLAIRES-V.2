import { CoachPhase } from "../types/coach";

export const banquierPhases: CoachPhase[] = [
  {
    id: "bnq-1",
    number: 1,
    title: "Cadre d'analyse",
    moduleId: null,
    autoOpen: false,
    minDuration: 45,
    keyPhrase: "Ce n'est pas un achat. C'est un arbitrage.",
    currentAction: "Poser structure ROI, zéro émotion",
  },

  {
    id: "bnq-2",
    number: 2,
    title: "Comparaison Scénarios",
    moduleId: "comparateur",
    autoOpen: true,
    minDuration: 75,
    keyPhrase: "Perte actuelle vs actif",
    currentAction: "Faire calculer le client lui-même",
    transitionBeforeNextModule: {
      silence: 1,
      phrase: "Projection long terme",
      instruction: "Ouvrir Projection",
    },
  },

  {
    id: "bnq-3",
    number: 3,
    title: "Projection 20 ans",
    moduleId: "projection",
    autoOpen: true,
    minDuration: 60,
    keyPhrase: "Cash flow — actif — rendement",
    currentAction: "Pointer non fiscalisé + indexé énergie",
  },

  {
    id: "bnq-4",
    number: 4,
    title: "Analyse de risque",
    moduleId: "risque",
    autoOpen: true,
    minDuration: 60,
    keyPhrase: "Le vrai risque = ne rien faire",
    currentAction: "Tableau risque technique / réglementaire",
    transitionBeforeNextModule: {
      silence: 1,
      phrase: "Structuration financière",
      instruction: "Ouvrir Taux + simulateur",
    },
  },

  {
    id: "bnq-5",
    number: 5,
    title: "Structuration financière",
    moduleId: "taux",
    autoOpen: true,
    minDuration: 60,
    keyPhrase: "Opération blanche — financée par économies",
    currentAction: "Pointer mensualité vs économies",
  },

  {
    id: "bnq-6",
    number: 6,
    title: "Décision",
    moduleId: "decision",
    autoOpen: true,
    minDuration: 45,
    keyPhrase: "Timing = seule variable",
    currentAction: "Poser silence, laisser conclure",
  },
];
