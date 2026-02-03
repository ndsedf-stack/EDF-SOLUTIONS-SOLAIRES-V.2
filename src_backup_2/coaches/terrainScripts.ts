export type BlocageType =
  | "client_seul"
  | "trop_tard"
  | "indecis"
  | "anti_report"
  | "appel_responsable"
  | "taux_refuse"
  | "non_a_oui"
  | "senior_peur";

export type Tone = "soft" | "neutre" | "ferme";

export const terrainScripts: Record<
  BlocageType,
  {
    label: string;
    intention: string;
    objectif: string;
    raisonnement: string;
    phrases: Record<Tone, string[]>;
  }
> = {
  client_seul: {
    label: "👤 Client seul (conjoint absent)",
    intention: "Il se protège derrière l’absence du conjoint.",
    objectif: "Verrouiller sans décider à sa place.",
    raisonnement:
      "Décider aujourd’hui ne décide pas pour l’autre. Ne rien faire, si.",
    phrases: {
      soft: [
        "Si votre conjointe voyait exactement ces chiffres, selon vous, qu’est-ce qu’elle dirait ?",
      ],
      neutre: [
        "On est d’accord que sécuriser aujourd’hui ne décide pas à sa place.",
        "Ça permet juste de ne pas perdre les conditions.",
      ],
      ferme: [
        "Donc soit vous laissez les conditions disparaître, soit vous verrouillez.",
      ],
    },
  },

  trop_tard: {
    label: "🧓 Trop tard",
    intention: "Peur du temps / de l’âge.",
    objectif: "Recentrer sur la charge, pas sur l’âge.",
    raisonnement:
      "Ce n’est pas un investissement, c’est une suppression de charge.",
    phrases: {
      soft: [
        "Ce n’est jamais trop tard quand on le fait pour se simplifier la vie.",
      ],
      neutre: [
        "Ce que vous supprimez aujourd’hui, ce sont des factures demain.",
      ],
      ferme: ["Le vrai risque, c’est de continuer à payer inutilement."],
    },
  },

  indecis: {
    label: "🧠 Indécis / calculateur",
    intention: "Sur-analyse pour retarder.",
    objectif: "Couper le faux besoin de réflexion.",
    raisonnement: "Les chiffres ne changeront pas. Les conditions, oui.",
    phrases: {
      soft: ["Je comprends que vous vouliez réfléchir."],
      neutre: ["Réfléchir ici ne change pas les chiffres."],
      ferme: ["Ce qui change, c’est la disponibilité. Pas les calculs."],
    },
  },

  anti_report: {
    label: "⏳ Anti-report",
    intention: "Report = fuite.",
    objectif: "Transformer le report en action réversible.",
    raisonnement: "Reporter, c’est laisser les autres décider.",
    phrases: {
      soft: ["Reporter n’est pas un non."],
      neutre: ["Mais ce n’est pas neutre non plus."],
      ferme: ["Vous laissez les autres prendre votre place."],
    },
  },

  appel_responsable: {
    label: "📞 Appel au responsable",
    intention: "Créer une fenêtre exceptionnelle.",
    objectif: "Justifier l’urgence réelle.",
    raisonnement: "Les enveloppes sont partagées entre conseillers.",
    phrases: {
      soft: ["Je peux regarder, sans promesse."],
      neutre: [
        "S’il reste une enveloppe, elle doit être positionnée maintenant.",
      ],
      ferme: ["Sinon elle partira sur un autre dossier."],
    },
  },

  taux_refuse: {
    label: "📉 Taux non baissé",
    intention: "Ne pas bloquer sur le taux.",
    objectif: "Recentrer sur la perte actuelle.",
    raisonnement: "Le taux n’annule pas la facture.",
    phrases: {
      soft: ["Même sans baisse, le projet reste cohérent."],
      neutre: ["La question n’est plus le taux."],
      ferme: ["C’est continuer à payer ou sécuriser."],
    },
  },

  non_a_oui: {
    label: "🔄 NON → OUI",
    intention: "Sortir du blocage binaire.",
    objectif: "Montrer la réversibilité.",
    raisonnement: "Dire non est définitif. Sécuriser est réversible.",
    phrases: {
      soft: ["Sécuriser ne vous engage pas."],
      neutre: ["C’est l’option la moins risquée."],
      ferme: ["Dire non ferme toutes les portes."],
    },
  },

  senior_peur: {
    label: "🛡️ Senior / peur",
    intention: "Besoin de sécurité absolue.",
    objectif: "Positionner le rôle du conseiller.",
    raisonnement: "Mon rôle n’est pas de convaincre mais de protéger.",
    phrases: {
      soft: ["Je comprends votre prudence."],
      neutre: ["Mon rôle est d’éviter un risque inutile."],
      ferme: ["Ne rien faire est aussi une décision."],
    },
  },
};
