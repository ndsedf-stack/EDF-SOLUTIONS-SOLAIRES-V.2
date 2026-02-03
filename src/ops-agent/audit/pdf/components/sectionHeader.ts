export function renderSectionHeader(pdf: any, title: string, score: number, y: number): number {
  const marginX = 20;
  
  // Ligne de séparation supérieure
  pdf.setDrawColor(34, 34, 34);
  pdf.setLineWidth(0.8);
  pdf.line(marginX, y, marginX + 40, y);

  y += 10;
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(34, 34, 34);
  pdf.text(title.toUpperCase(), marginX, y);

  // Score Badge à droite
  const badgeColor = score >= 80 ? [27, 94, 32] : score >= 60 ? [230, 81, 0] : [179, 38, 30];
  // @ts-ignore
  pdf.setFillColor(...badgeColor);
  pdf.roundedRect(165, y - 6, 25, 8, 1, 1, "F");
  
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`SANTÉ: ${score}%`, 177.5, y - 0.5, { align: "center" }); // Translated HEALTH -> SANTÉ

  return y + 15;
}
