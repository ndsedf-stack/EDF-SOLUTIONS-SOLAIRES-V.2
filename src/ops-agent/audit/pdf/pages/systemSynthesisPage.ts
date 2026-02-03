export function renderSystemSynthesis(pdf: any, data?: any) {
  pdf.addPage();
  const marginX = 15;
  let y = 30;

  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(34, 34, 34);
  pdf.text("SYNTHÈSE SYSTÈME", marginX, y);
  
  y += 15;

  // --- TOP 3 PATTERNS (Les assets intellectuels) ---
  pdf.setFillColor(248, 249, 250);
  pdf.rect(marginX, y, 180, 60, "F");
  
  pdf.setFontSize(11);
  pdf.text("PATTERNS STRATÉGIQUES À DÉPLOYER", marginX + 8, y + 10);

  const patterns = [
    { name: "Risk Skyline", impact: "Visualisation immédiate des seuils de danger." },
    { name: "Confidence Corridor", impact: "Suppression du biais d'optimisme sur les projections." },
    { name: "Semantic Clusters", impact: "Réduction de la charge mentale (Miller's Limit)." }
  ];

  y += 20;
  patterns.forEach(p => {
    pdf.setFillColor(8, 12, 32);
    // Draw circle manually or use built-in if available. Using user snippet instructions.
    // pdf.circle(x, y, r, style)
    pdf.circle(marginX + 12, y - 1, 1, "F");
    
    pdf.setFont("Helvetica", "bold");
    pdf.setTextColor(34, 34, 34);
    pdf.text(p.name, marginX + 18, y);
    
    pdf.setFont("Helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`— ${p.impact}`, marginX + 55, y);
    y += 10;
  });

  // --- ORDRE DE PRIORITÉ (Roadmap) ---
  y += 15;
  pdf.setFont("Helvetica", "bold");
  pdf.setTextColor(34, 34, 34);
  pdf.text("ORDRE DE PRIORITÉ DE CORRECTION", marginX, y);

  const priorities = [
    { step: "01", task: "Intégrité Financière", desc: "Composants RiskProof & ProjectionCA" },
    { step: "02", task: "Rupture Client", desc: "Composants ClientDrift & BehaviorDrift" },
    { step: "03", task: "Hygiène Cognitive", desc: "Réorganisation des KPI Cards" }
  ];

  y += 12;
  priorities.forEach(p => {
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(marginX, y, 180, 12, 1, 1, "F");
    
    pdf.setTextColor(8, 12, 32);
    pdf.setFont("Helvetica", "bold");
    pdf.text(p.step, marginX + 5, y + 8);
    pdf.text(p.task, marginX + 18, y + 8);
    
    pdf.setFont("Helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(p.desc, marginX + 70, y + 8);
    
    y += 15;
  });
}
