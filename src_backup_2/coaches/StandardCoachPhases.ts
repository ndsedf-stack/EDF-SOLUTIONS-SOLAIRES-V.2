import { CoachPhase } from "../types/coach";

export const standardPhases: CoachPhase[] = [
  {
    id: "std-1",
    number: 1,
    title: "Choc de réalité",
    moduleId: null,
    autoOpen: false,
    minDuration: 45,
    keyPhrase: "40 ans → 0€ — on ne possède rien",
    currentAction: "Refaire calcul avec lui → SILENCE",
  },

  {
    id: "std-2",
    number: 2,
    title: "Autonomie",
    moduleId: "autonomie",
    autoOpen: true,
    minDuration: 60,
    keyPhrase: "Vous reprenez le contrôle",
    currentAction: "Pointer % autonomie et concret",
  },

  {
    id: "std-3",
    number: 3,
    title: "Projection",
    moduleId: "projection",
    autoOpen: true,
    minDuration: 60,
    keyPhrase: "Écart mesurable — pas opinion",
    currentAction: "Pointer différence chiffres",
  },

  {
    id: "std-4",
    number: 4,
    title: "Taux",
    moduleId: "taux",
    autoOpen: true,
    minDuration: 45,
    keyPhrase: "On voit si vous êtes éligible",
    currentAction: "Validation factuelle, pas théâtre",
  },

  {
    id: "std-5",
    number: 5,
    title: "Décision",
    moduleId: "decision",
    autoOpen: true,
    minDuration: 45,
    keyPhrase: "On sécurise si c'est oui — sinon on s'arrête",
    currentAction: "Pose directe, silence",
  },
];
