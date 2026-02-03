import { addTitle, addParagraph, COLORS } from "../pdf.utils";
import jsPDF from "jspdf";

// PAGE 1 — “A PROPOS DE CET AUDIT”
export function renderAboutPage(doc: jsPDF) {
  doc.addPage();
  const marginX = 15;
  let y = 20;

  addTitle(doc, "À PROPOS DE CET AUDIT", marginX, y);
  y += 15;

  addParagraph(doc, 
    "Ce document est un audit opérationnel généré automatiquement par l'Ops Agent – Revenue Assurance Engine.\n" +
    "Son but est d'évaluer l'intégrité, la lisibilité et la capacité décisionnelle des tableaux de bord opérationnels du système.",
    marginX, y
  );
  y += 20;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("L'audit repose sur trois piliers :", marginX, y);
  y += 10;

  // 1. Vérité de la Donnée
  doc.setFont("Helvetica", "bold");
  doc.text("1. Vérité de la Donnée", marginX, y);
  y += 6;
  doc.setFont("Helvetica", "normal");
  addParagraph(doc, "Vérification que les valeurs affichées reflètent la base de données sans distorsion, omission ou biais.", marginX, y);
  y += 15;

  // 2. Lisibilité UX
  doc.setFont("Helvetica", "bold");
  doc.text("2. Lisibilité UX", marginX, y);
  y += 6;
  doc.setFont("Helvetica", "normal");
  addParagraph(doc, "Évaluation de la capacité des composants visuels à permettre au décideur de comprendre risques, tendances et anomalies en quelques secondes.", marginX, y);
  y += 15;

  // 3. Intégrité Décisionnelle
  doc.setFont("Helvetica", "bold");
  doc.text("3. Intégrité Décisionnelle", marginX, y);
  y += 6;
  doc.setFont("Helvetica", "normal");
  addParagraph(doc, "Évaluation de la capacité de chaque composant à supporter une priorisation correcte, réduire l'ambiguïté et prévenir les angles morts opérationnels.", marginX, y);
  y += 20;

  addParagraph(doc, 
    "Cet audit ne remplace pas le jugement humain.\n" +
    "Il fournit une évaluation structurée, répétable et traçable pour soutenir la gouvernance et la fiabilité opérationnelle.",
    marginX, y
  );
}

// PAGE 2 — “MÉTHODOLOGIE ET PÉRIMÈTRE”
export function renderMethodologyPage(doc: jsPDF) {
  doc.addPage();
  const marginX = 15;
  let y = 20;

  addTitle(doc, "MÉTHODOLOGIE ET PÉRIMÈTRE", marginX, y);
  y += 15;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Périmètre de l'Audit", marginX, y);
  y += 8;
  doc.setFont("Helvetica", "normal");
  addParagraph(doc, 
    "L'audit couvre tous les composants actifs du tableau de bord utilisés pour la décision opérationnelle, incluant :\n" +
    "• Visualisations des risques financiers\n" +
    "• Projections de revenus\n" +
    "• Timelines comportementales client\n" +
    "• Cartographie des risques\n" +
    "• Clusters KPI",
    marginX, y
  );
  y += 35;

  doc.setFont("Helvetica", "bold");
  doc.text("Méthodologie", marginX, y);
  y += 8;
  doc.setFont("Helvetica", "normal");
  addParagraph(doc, "L'Ops Agent applique un cadre d'évaluation déterministe basé sur :", marginX, y);
  y += 10;

  const steps = [
    { t: "A. Critères Structurels", d: "Lisibilité des axes, densité des labels, contraste (WCAG), visibilité des seuils, clarté des légendes." },
    { t: "B. Critères Décisionnels", d: "Capacité à détecter le risque, prioriser les actions, identifier les anomalies, prévenir les erreurs d'interprétation." },
    { t: "C. Critères d'Intégrité", d: "Alignement avec les données source, absence de valeurs cachées, cohérence entre composants." }
  ];

  steps.forEach(s => {
      doc.setFont("Helvetica", "bold");
      doc.text(s.t, marginX, y);
      y += 6;
      doc.setFont("Helvetica", "normal");
      addParagraph(doc, s.d, marginX, y);
      y += 14;
  });

  y += 5;
  doc.setFont("Helvetica", "bold");
  doc.text("Niveaux de Sévérité", marginX, y);
  y += 8;
  
  const severities = [
      { l: "CRITIQUE", d: "Risque immédiat de mauvaise interprétation ou d'erreur opérationnelle." },
      { l: "ÉLEVÉE", d: "Dégradation significative de la qualité de décision." },
      { l: "MOYENNE", d: "Friction notable, mais non bloquante." },
      { l: "FAIBLE", d: "Problèmes cosmétiques ou mineurs." }
  ];
  
  severities.forEach(s => {
      doc.setFont("Helvetica", "bold");
      doc.text(s.l, marginX, y);
      doc.setFont("Helvetica", "normal");
      doc.text(` → ${s.d}`, marginX + 25, y);
      y += 7;
  });

  y += 10;
  doc.setFont("Helvetica", "bold");
  doc.text("Limites", marginX, y);
  y += 6;
  doc.setFont("Helvetica", "normal");
  addParagraph(doc, "L'audit évalue l'intégrité visuelle et structurelle, non la performance métier.\nLa validation humaine reste requise pour les décisions finales.", marginX, y);
}

// PAGE 4 — “CADRE D'ÉVALUATION DES RISQUES”
export function renderRiskFrameworkPage(doc: jsPDF) {
  doc.addPage();
  const marginX = 15;
  let y = 20;

  addTitle(doc, "CADRE D'ÉVALUATION DES RISQUES", marginX, y);
  y += 15;

  addParagraph(doc, "Cet audit utilise un modèle de notation standardisé pour évaluer la fiabilité opérationnelle des composants.", marginX, y);
  y += 15;

  doc.setFont("Helvetica", "bold");
  doc.text("Interprétation des Scores", marginX, y);
  y += 8;

  const scores = [
      "80–100 → Opérationnellement fiable",
      "60–79   → Acceptable mais nécessite des améliorations",
      "40–59   → Haut risque de mauvaise interprétation",
      "0–39     → Opérationnellement dangereux"
  ];
  doc.setFont("Helvetica", "normal");
  scores.forEach(s => { doc.text(s, marginX, y); y += 6; });
  y += 10;

  doc.setFont("Helvetica", "bold");
  doc.text("Dimensions du Risque", marginX, y);
  y += 8;

  const dims = [
      { t: "1. Risque de Visibilité", d: "Mesure si l'information essentielle est visible sans effort." },
      { t: "2. Risque d'Interprétation", d: "Mesure si un composant peut mener à des conclusions erronées." },
      { t: "3. Risque d'Actionnabilité", d: "Mesure si le composant guide l'utilisateur vers la bonne action suivante." },
      { t: "4. Risque d'Intégrité", d: "Mesure si le composant représente fidèlement les données sous-jacentes." }
  ];

  dims.forEach(d => {
      doc.setFont("Helvetica", "bold");
      doc.text(d.t, marginX, y);
      y += 6;
      doc.setFont("Helvetica", "normal");
      addParagraph(doc, d.d, marginX, y);
      y += 12;
  });

  y += 10;
  doc.setFillColor(245, 246, 248);
  doc.roundedRect(marginX, y, 180, 50, 2, 2, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(34, 34, 34);
  doc.text("Pourquoi est-ce important ?", marginX + 5, y + 10);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  const whyText = 
    "Un tableau de bord n'est pas un outil de reporting.\n" +
    "C'est un moteur de décision.\n\n" +
    "Toute ambiguïté, surcharge ou manque de référence augmente la probabilité de :\n" +
    "• actions retardées\n" +
    "• priorisation incorrecte\n" +
    "• perte de revenus\n" +
    "• angles morts opérationnels";
    
  doc.text(whyText, marginX + 5, y + 20);
}

// PAGE 5 — “GLOSSAIRE (INSTITUTIONNEL)”
export function renderGlossaryPage(doc: jsPDF) {
  doc.addPage();
  const marginX = 15;
  let y = 20;

  addTitle(doc, "GLOSSAIRE", marginX, y);
  y += 15;

  const terms = [
      { t: "Intégrité Décisionnelle", d: "Capacité d'un système à guider les utilisateurs vers des décisions correctes, opportunes et justifiées." },
      { t: "Risk Skyline", d: "Pattern de visualisation combinant des zones de risque en arrière-plan avec des barres style 'skyline' et lignes de tendance." },
      { t: "Corridor de Confiance", d: "Modèle de projection utilisant des bandes d'incertitude (p10/p90) autour d'une tendance centrale." },
      { t: "Radar Quadrant", d: "Matrice risque/action à quatre quadrants avec micro-actions explicites." },
      { t: "Jalons Temporels", d: "Marqueurs verticaux indiquant les jours contractuels critiques (ex: J+7)." },
      { t: "Clusters Sémantiques", d: "Regroupement des KPI par domaine logique pour réduire la surcharge cognitive." },
      { t: "Angle Mort Opérationnel", d: "Zone où un risque existe mais n'est pas visible par le décideur." }
  ];

  terms.forEach(term => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(34, 34, 34);
      doc.text(term.t, marginX, y);
      
      const textWidth = doc.getTextWidth(term.t);
      // Ligne de séparation pointillée ou simple espace ? User a mis simple.
      
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      // Petit offset pour la def
      addParagraph(doc, term.d, marginX, y + 5);
      
      y += 20;
  });
}
