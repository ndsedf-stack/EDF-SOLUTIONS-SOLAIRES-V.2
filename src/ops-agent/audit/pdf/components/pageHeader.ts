import { grid, COLORS } from "../pdf.utils";

/**
 * 1 FONCTION HEADER, appelée une seule fois par page.
 * Renvoie la position Y sûre pour commencer le contenu.
 */
export function renderPageHeader(
  pdf: any,
  title: string,
  subtitle: string
): number {
  const x = 25; // Standard margin
  let y = 32;   // Fixed start

  // Title
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(14);
  // @ts-ignore
  pdf.setTextColor(...COLORS.TEXT_DARK);
  pdf.text(title.toUpperCase(), x, y);

  y += grid(1); // +8

  // Subtitle
  pdf.setFontSize(9);
  // @ts-ignore
  pdf.setTextColor(...COLORS.TEXT_MUTED);
  pdf.text(subtitle, x, y);

  return y + grid(2); // +16 Espace réservé (Safe Y start)
}
