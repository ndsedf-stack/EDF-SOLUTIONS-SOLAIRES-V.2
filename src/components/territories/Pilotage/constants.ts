
// ============================================
// CONSTANTES
// ============================================
export const STATUS_LABELS = {
  draft: "DRAFT",
  sent: "SENT",
  signed: "SIGNED",
  cancelled: "CANCELLED",
} as const;

// ✅ TEMP_LABELS (INSTITUTIONAL)
export const TEMP_LABELS = {
  cold: {
    label: "FROID",
    class: "bg-slate-800/50 text-slate-500 border border-slate-700/50",
  },
  warm: {
    label: "TIÈDE",
    class: "bg-blue-900/10 text-blue-300/80 border border-blue-800/30",
  },
  hot: {
    label: "CHAUD",
    class: "bg-amber-900/10 text-amber-300/80 border border-amber-800/30",
  },
  signed: {
    label: "SIGNÉ",
    class: "bg-emerald-900/10 text-emerald-300/80 border border-emerald-800/30",
  },
} as const;

// ✅ NOUVEAUX LABELS COMPORTEMENTAUX (INSTITUTIONAL)
export const BEHAVIORAL_LABELS = {
  MUET: {
    label: "SILENCE",
    class: "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50",
    description: "Client inactif",
  },
  CAS_LIMITE: {
    label: "CONTACT EXCESSIF",
    class: "bg-amber-900/20 text-amber-200/80 border border-amber-800/30",
    description: "Sur-engagement",
  },
  AGITÉ: {
    label: "AGITÉ",
    class: "bg-orange-900/20 text-orange-200/80 border border-orange-800/30",
    description: "Risque annulation",
  },
  INTÉRESSÉ: {
    label: "INTÉRESSÉ",
    class: "bg-emerald-900/20 text-emerald-200/80 border border-emerald-800/30",
    description: "Opportunité",
  },
  STABLE: {
    label: "STABLE",
    class: "bg-zinc-900 text-zinc-500 border border-zinc-800",
    description: "Sous surveillance",
  },
  FATIGUE: {
    label: "INACTIF",
    class: "bg-red-900/10 text-red-300 border border-red-900/20",
    description: "Lead dormant",
  },
} as const;
