import { FullUXAuditReport } from "../../../../ops-ux-audit/engine/uxAudit.types";
import { COLORS } from "../pdf.utils";

// Adapter to match existing file structure but use User's Logic
export function renderSynthesisPage(pdf: any, report: FullUXAuditReport) {
  // Add page is handled here per existing contract, or logic inside?
  // User's code starts with margin definitions, doesn't show 'pdf.addPage()'.
  // But usually this starts a new page (Page 2).
  pdf.addPage();
  
  // Calculate Stats for the User's Logic
  const allIssues = [
      ...(report.charts || []).flatMap(c => c.issues),
      ...(report.cards || []).flatMap(c => c.issues)
  ];
  const criticalCount = allIssues.filter(i => i.severity === 'CRITICAL').length;
  // Unique patterns count
  const patternCount = new Set(allIssues.map(i => i.suggestedPattern?.name).filter(Boolean)).size;

  const stats = {
      health: Math.round(report.globalScore || 0),
      criticalCount: criticalCount,
      patternCount: patternCount
  };

  renderExecutiveSummary(pdf, stats);
}

// USER PROVIDED LOGIC
export function renderExecutiveSummary(pdf: any, stats: any) {
  const marginX = 15;
  let y = 20;

  // --- TITRE DE SECTION ---
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(34, 34, 34);
  pdf.text("EXECUTIVE SUMMARY", marginX, y);
  y += 12;

  // --- GRILLE DE CARTES (Row 1) ---
  const cardW = 88;
  const cardH = 45;

  const isPerfect = stats.health >= 98;

  // CARD 1 : GLOBAL HEALTH
  renderStatCard(
    pdf, 
    marginX, 
    y, 
    cardW, 
    cardH, 
    "GLOBAL HEALTH", 
    `${stats.health}%`, 
    isPerfect ? "Système stable" : "Risque de biais élevé", 
    isPerfect ? [27, 94, 32] : [179, 38, 30]
  );

  // CARD 2 : CRITICAL ISSUES
  renderStatCard(
    pdf, 
    marginX + cardW + 4, 
    y, 
    cardW, 
    cardH, 
    "CRITICAL RISKS", 
    stats.criticalCount.toString(), 
    isPerfect ? "Aucun blocage" : "Blocages immédiats", 
    isPerfect ? [27, 94, 32] : [230, 81, 0]
  );

  y += cardH + 4;

  // --- GRILLE DE CARTES (Row 2) ---
  // CARD 3 : PATTERNS REQUIRED
  // Si tout est déployé (patternCount = 0 restant ou logic inversée selon ce que renvoie le moteur)
  // Le moteur renvoie les patterns "suggérés" donc manquants. Si 0 => Tout est bon.
  const allDeployed = stats.patternCount === 0;
  
  renderStatCard(
    pdf, 
    marginX, 
    y, 
    cardW, 
    cardH, 
    "STRATEGIC PATTERNS", 
    allDeployed ? "OK" : stats.patternCount.toString(), 
    allDeployed ? "Tous déployés" : "Actifs à implémenter", 
    allDeployed ? [21, 101, 192] : [8, 12, 32] // Blue if deployed, Dark Blue if needed
  );

  // CARD 4 : DECISION READINESS
  const isReady = stats.health > 80;
  renderStatCard(
    pdf, 
    marginX + cardW + 4, 
    y, 
    cardW, 
    cardH, 
    "DECISION READINESS", 
    isReady ? "READY" : "UNSAFE", 
    isReady ? "Signal fiable" : "Fiabilité compromise", 
    isReady ? [27, 94, 32] : [179, 38, 30]
  );

  y += cardH + 15;

  // --- SECTION RISQUES OPÉRATIONNELS (Bandeau gris) ---
  pdf.setFillColor(245, 246, 248);
  pdf.roundedRect(marginX, y, 180, 35, 2, 2, "F");
  
  pdf.setFontSize(10);
  pdf.setTextColor(8, 12, 32);
  pdf.setFont("Helvetica", "bold");
  pdf.text("RISQUES OPÉRATIONNELS", marginX + 8, y + 8);
  
  pdf.setFont("Helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(60, 60, 60);

  // isPerfect already defined above
  if (isPerfect) {
      const riskText = "• Aucun risque critique détecté.\n• Latence décisionnelle nulle.\n• Intégrité des données vérifiée.";
      pdf.text(riskText, marginX + 8, y + 16);
  } else {
      const riskText = "• Perte de visibilité sur l'exposition financière réelle (> $500k).\n• Retard de réaction sur les signaux de rupture client à J+7.\n• Paralysie décisionnelle des Risk Officers due à la densité cognitive.";
      pdf.text(riskText, marginX + 8, y + 16);
  }
  
  y += 45;

  // --- RECOMMANDATION EXÉCUTIVE (High Impact) ---
  if (isPerfect) {
      pdf.setFillColor(27, 94, 32); // GREEN
      pdf.roundedRect(marginX, y, 180, 15, 1, 1, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("Helvetica", "bold");
      pdf.text(`RECOMMANDATION : DÉPLOIEMENT AUTORISÉ. SYSTÈME NOMINAL.`, marginX + 5, y + 9.5);
  } else {
      pdf.setFillColor(179, 38, 30); // RED
      pdf.roundedRect(marginX, y, 180, 15, 1, 1, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("Helvetica", "bold");
      pdf.text(`RECOMMANDATION : SUSPENDRE LES DÉPLOIEMENTS ET APPLIQUER LES PATTERNS CRITIQUES.`, marginX + 5, y + 9.5);
  }
}

// Helper pour dessiner une carte
function renderStatCard(pdf: any, x: number, y: number, w: number, h: number, label: string, value: string, sub: string, color: number[]) {
  // @ts-ignore
  pdf.setDrawColor(230, 230, 230);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(x, y, w, h, 2, 2, "FD");

  // Border accent
  // @ts-ignore
  pdf.setFillColor(...color);
  pdf.rect(x, y, 2, h, "F");

  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont("Helvetica", "bold");
  pdf.text(label, x + 8, y + 10);

  pdf.setFontSize(22);
  // @ts-ignore
  pdf.setTextColor(...color);
  pdf.text(value, x + 8, y + 26);

  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont("Helvetica", "normal");
  pdf.text(sub, x + 8, y + 36);
}
