export function renderCoverPage(pdf: any, meta: any) {
  // Fond sombre bleu nuit (Navy)
  pdf.setFillColor(10, 15, 30);
  pdf.rect(0, 0, 210, 297, "F");

  // Accent graphique (Ligne orange tech)
  pdf.setFillColor(230, 81, 0);
  pdf.rect(20, 50, 5, 40, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text("AUDIT D'INTÉGRITÉ", 35, 65); // Textes FR conservés
  pdf.setFontSize(14);
  pdf.setFont("Helvetica", "normal");
  pdf.text("RAPPORT DE RISQUE OPS & UX", 35, 75);

  // Pied de page metadata
  pdf.setDrawColor(255, 255, 255, 0.2);
  pdf.line(20, 240, 190, 240);

  const infoY = 255;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  // Labels translated to French or kept technical/English?
  // Previous request asked for French report.
  pdf.text("SYSTEM ID", 20, infoY);
  pdf.text("GÉNÉRÉ LE", 80, infoY); 
  pdf.text("VERSION", 160, infoY);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.text(meta.systemName || "EDF COCKPIT", 20, infoY + 5);
  pdf.text(meta.generatedAt || new Date().toISOString(), 80, infoY + 5);
  pdf.text(meta.version || "1.0", 160, infoY + 5);

  pdf.addPage();
}
