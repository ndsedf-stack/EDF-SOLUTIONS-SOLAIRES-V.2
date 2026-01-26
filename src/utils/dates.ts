/**
 * Calcule le nombre de jours écoulés depuis une date donnée
 * @param dateStr - Date au format ISO string (ex: "2025-01-15T10:30:00Z")
 * @returns Nombre de jours écoulés (arrondi à l'entier inférieur)
 */
export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calcule le nombre de jours entre deux dates
 * @param startDateStr - Date de début
 * @param endDateStr - Date de fin (optionnel, par défaut = maintenant)
 * @returns Nombre de jours écoulés
 */
export function getDaysBetween(
  startDateStr: string,
  endDateStr?: string
): number {
  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formate une date en format lisible (ex: "15 jan. 2025")
 * @param dateStr - Date au format ISO string
 * @returns Date formatée
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("fr-FR", options);
}

/**
 * Formate une date relative (ex: "il y a 3 jours")
 * @param dateStr - Date au format ISO string
 * @returns Date formatée en relatif
 */
export function formatRelativeDate(dateStr: string): string {
  const days = getDaysSince(dateStr);

  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days === 2) return "Avant-hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 14)
    return `Il y a ${Math.floor(days / 7)} semaine${days >= 14 ? "s" : ""}`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
  if (days < 60) return `Il y a ${Math.floor(days / 30)} mois`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  const years = Math.floor(days / 365);
  return `Il y a ${years} an${years > 1 ? "s" : ""}`;
}

/**
 * Retourne une couleur selon l'ancienneté (pour UI)
 * @param dateStr - Date au format ISO string
 * @returns Classe Tailwind de couleur
 */
export function getAgeColor(dateStr: string): string {
  const days = getDaysSince(dateStr);

  if (days === 0) return "text-green-400";
  if (days <= 3) return "text-blue-400";
  if (days <= 7) return "text-yellow-400";
  if (days <= 14) return "text-orange-400";
  return "text-red-400";
}
