
import { Study } from "@/brain/types";

// ============================================
// UTILITAIRES - FORMATAGE & DATES
// ============================================
export function getTimeSince(date: string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  const interval = seconds / 3600;
  if (interval > 24) return `ACTIF IL Y A ${Math.floor(interval / 24)}J`;
  if (interval >= 1) return `ACTIF IL Y A ${Math.floor(interval)}H`;
  return `ACTIF IL Y A ${Math.floor(seconds / 60)}MIN`;
}

export function getTimeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
  return new Date(date).toLocaleDateString("fr-FR");
}

export function getDaysSince(date: string): number {
  return Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 86400000
  );
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR") + " €";
}

export function formatPercentage(value: number): string {
  return Math.round(value) + "%";
}

// ============================================
// UTILITAIRES - DÉTECTION RISQUES WAR ROOM
// ============================================
export function getRiskLabel(risk: string): string {
  const labels: Record<string, string> = {
    muet: "🧊 SILENCE — client inactif",
    agité: "🔥 RUMINATION — risque d'annulation",
    interesse: "🟢 INTÉRÊT ACTIF — opportunité",
    stable: "⚪ STABLE — surveillance",
  };
  return labels[risk] || labels.stable;
}

// ✅ LECTURE SUPABASE : Acompte requis
export function requiresDeposit(study: Study): boolean {
  // ✅ Lire directement has_deposit de Supabase
  return study.has_deposit === true && !study.deposit_paid;
}

// ✅ NOUVEAU : Calcul retard acompte
export function isDepositLate(study: Study): boolean {
  if (!study.signed_at || study.status !== "signed") return false;
  if (study.deposit_paid) return false;
  if (!requiresDeposit(study)) return false;
  const signedDate = new Date(study.signed_at);
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - signedDate.getTime()) / 86400000
  );
  return diffDays > 0;
}

// ============================================
// UTILITAIRES - CALCUL PROCHAINE RELANCE EMAIL
// ============================================
export function getNextFollowup(lead: {
  created_at: string;
  last_email_sent: string | null;
}): string {
  if (!lead.last_email_sent) return "Immédiat";
  const created = new Date(lead.created_at);
  const lastSent = new Date(lead.last_email_sent);
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - created.getTime()) / 86400000
  );

  if (daysSinceCreation > 120) return "Terminé";

  // Intervalle : 3 jours (si < 2 mois) ou 7 jours (si > 2 mois)
  const interval = daysSinceCreation <= 60 ? 3 : 7;

  const next = new Date(lastSent);
  next.setDate(next.getDate() + interval);

  return next.toLocaleDateString("fr-FR");
}

// ============================================
// UTILITAIRES - SÉCURITÉ
// ============================================
export function escapeHtml(text: string): string {
  if (typeof window === "undefined") return text;
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
