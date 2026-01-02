// src/coaches/closingScripts.ts

export type ClosingKey =
  | "ouverture"
  | "client_seul"
  | "trop_tard"
  | "indecis"
  | "anti_report"
  | "appel_responsable"
  | "taux_refuse"
  | "non_a_oui"
  | "verrou_final";

export const closingScripts: Record<
  ClosingKey,
  {
    label: string;
    phrases: string[];
  }
> = {
  ouverture: {
    label: "🎯 Ouverture cadrage",
    phrases: [
      "Mon rôle n’est pas de vous convaincre.",
      "Mon rôle est de vous montrer ce qui est possible aujourd’hui, et ce qui ne le sera peut-être plus demain.",
    ],
  },

  client_seul: {
    label: "👤 Client seul (conjoint absent)",
    phrases: [
      "On ne décide jamais à la place de quelqu’un.",
      "Ce que l’on peut faire en revanche, c’est sécuriser pendant que tout est ouvert.",
    ],
  },

  trop_tard: {
    label: "🧓 Trop tard",
    phrases: [
      "Trop tard, ce serait de continuer à payer sans rien faire.",
      "Ici, on supprime un problème, on n’en crée pas un nouveau.",
    ],
  },

  indecis: {
    label: "🧠 Indécis / sur-analyse",
    phrases: [
      "Les chiffres ne changeront pas en y réfléchissant plus longtemps.",
      "Ce qui change, ce sont les conditions d’accès.",
    ],
  },

  anti_report: {
    label: "⏳ Anti-report",
    phrases: [
      "Reporter, ce n’est pas dire non.",
      "C’est laisser la décision se faire sans vous.",
    ],
  },

  appel_responsable: {
    label: "📞 Appel au responsable",
    phrases: [
      "Je peux tenter un appel, mais je ne promets rien.",
      "S’il reste une enveloppe, elle se positionne maintenant.",
    ],
  },

  taux_refuse: {
    label: "📉 Taux non baissé",
    phrases: [
      "Donc la question n’est plus le taux.",
      "La question, c’est continuer à perdre ou sécuriser.",
    ],
  },

  non_a_oui: {
    label: "🔄 Transformer un NON",
    phrases: ["Dire non est définitif.", "Sécuriser reste réversible."],
  },

  verrou_final: {
    label: "🔒 Verrou final",
    phrases: [
      "On verrouille aujourd’hui, vous gardez le contrôle.",
      "Rien n’est lancé sans validation écrite.",
    ],
  },
};
