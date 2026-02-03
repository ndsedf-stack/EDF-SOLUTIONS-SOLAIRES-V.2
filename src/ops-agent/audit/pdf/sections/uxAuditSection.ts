import { renderSectionHeader } from "../components/sectionHeader";
import { renderIssueBlock } from "../components/issueBlock";

export function renderUxAuditSection(pdf: any, audits: any[]) {
  // CRITICAL: Force new page to avoid overwriting Executive Summary
  pdf.addPage();
  
  const sections: { title: string; page: number }[] = [];
  let currentY = 30; 

  audits.forEach(chart => {
    // Capture pour le Sommaire
    const currentPage = pdf.internal.getCurrentPageInfo().pageNumber;
    sections.push({ title: chart.component, page: currentPage });

    // Gestion saut de page si on est trop bas pour commencer une section
    if (currentY > 230) {
        pdf.addPage();
        currentY = 25;
    }

    // Rendu du titre de section
    currentY = renderSectionHeader(pdf, chart.component, chart.score, currentY);
    
    // Espace après le header
    currentY += 5; // Reduced slightly, 18 spacing is between SECTIONS, not header/content

    // @ts-ignore
    chart.issues.forEach(issue => {
      // Le check de page est fait DANS renderIssueBlock via ensureSpace
      currentY = renderIssueBlock(pdf, issue, currentY);
    });
    
    currentY += 18; // Espace entre les grandes sections (User requested 18 specifically)
  });
  
  return sections;
}
