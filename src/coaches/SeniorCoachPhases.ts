import { CoachPhase } from "../types/coach";

export const seniorPhases: CoachPhase[] = [
  {
    id: "sr-1",
    number: 1,
    title: "Cadrage sécurité",
    moduleId: null,
    autoOpen: false,
    minDuration: 60,
    keyPhrase: "Avant les chiffres, parlons sécurité",
    currentAction: "Cadre EDF institutionnel, ancrer sécurité",
    doList: ["Ton calme", "Respiration lente", "Mentionner EDF 100 ans"],
    dontList: ["Parler prix", "Créer urgence", "Dire 'dernier quota'"],
    successSignals: ["Client acquiesce", "Posture se détend"],

    transitionBeforeNextModule: {
      silence: 2,
      phrase: "OK. Maintenant, voyons l'essentiel…",
      instruction: "Respirer, regarder le client, attendre son regard",
    },
  },

  {
    id: "sr-2",
    number: 2,
    title: "Garanties & Sécurité",
    moduleId: "garanties",
    autoOpen: true,
    minDuration: 90,
    maxDuration: 120,
    keyPhrase: "Ce qui protège vraiment votre famille",
    currentAction: "Pointer 'À VIE' + État français",

    silences: [
      {
        duration: 5,
        instruction: "Regarder le client laisser digérer 'à vie'",
      },
      {
        duration: 3,
        instruction: "Silence après 'EDF = État', acquiescer",
      },
    ],

    doList: ["Transmission enfants", "État français", "Certifications"],
    dontList: ["Fermer module avant 90s"],
    successSignals: ["Client demande garanties", "Mention enfants"],

    transitionBeforeNextModule: {
      silence: 2,
      phrase: "On a sécurisé. Maintenant votre situation…",
      instruction: "Regard → mini pause → ouvrir module Répartition",
    },
  },

  {
    id: "sr-3",
    number: 3,
    title: "Situation actuelle",
    moduleId: "repartition",
    autoOpen: true,
    minDuration: 60,
    keyPhrase: "Aujourd’hui vous payez et vous ne possédez rien",
    currentAction: "Refaire calcul avec le client",

    transitionBeforeNextModule: {
      silence: 1,
      phrase: "OK. Maintenant projection concrète.",
      instruction: "Ouvrir module Projection",
    },
  },

  {
    id: "sr-4",
    number: 4,
    title: "Projection 20 ans",
    moduleId: "projection",
    autoOpen: true,
    minDuration: 60,
    keyPhrase: "Dans 20 ans : actif vs rien",
    currentAction: "Pointer valeur vs perte",

    transitionBeforeNextModule: {
      silence: 1,
      phrase: "OK. Parlons du taux calmement.",
      instruction: "Ouvrir module Taux",
    },
  },

  {
    id: "sr-5",
    number: 5,
    title: "Taux",
    moduleId: "taux",
    autoOpen: true,
    minDuration: 45,
    keyPhrase: "On vérifie, pas on force",
    currentAction: "Ne rien théâtraliser, factuel seulement",

    dontList: ["Appel théâtral", "Ultimatum 2h"],
    successSignals: ["Client demande validation"],

    transitionBeforeNextModule: {
      silence: 2,
      phrase: "OK. Décision à votre rythme.",
      instruction: "Regarder – Silence",
    },
  },

  {
    id: "sr-6",
    number: 6,
    title: "Décision",
    moduleId: "decision",
    autoOpen: true,
    minDuration: 45,
    keyPhrase: "C’est oui / c’est non — mais prenez-la pour vous",
    currentAction: "Laisser client parler",

    transitionBeforeNextModule: {
      silence: 1,
      phrase: "On sécurise ?",
      instruction: "Présenter signature lentement",
    },
  },
];
