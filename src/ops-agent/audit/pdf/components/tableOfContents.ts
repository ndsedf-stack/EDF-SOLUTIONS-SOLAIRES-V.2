const COLORS = {
  TEXT: [34, 34, 34],
};

export function renderTableOfContents(pdf: any, sections: { title: string; page: number }[]) {
  pdf.addPage(); // Force new page for TOC as requested (dedier sa propre page)
  
  // Reset style pour la page
  // @ts-ignore
  pdf.setTextColor(...COLORS.TEXT);
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Sommaire", 20, 40);

  let currentY = 60;
  pdf.setFontSize(11);
  pdf.setFont("Helvetica", "normal");

  sections.forEach(sec => {
    // @ts-ignore
    pdf.setTextColor(...COLORS.TEXT);
    pdf.text(sec.title, 20, currentY);
    
    // Ligne de points pour le style "Audit"
    const dots = ".".repeat(70);
    pdf.setTextColor(200, 200, 200);
    pdf.text(dots, 80, currentY);
    
    // @ts-ignore
    pdf.setTextColor(...COLORS.TEXT);
    pdf.text(`${sec.page}`, 190, currentY, { align: "right" });
    currentY += 10;
  });
}
