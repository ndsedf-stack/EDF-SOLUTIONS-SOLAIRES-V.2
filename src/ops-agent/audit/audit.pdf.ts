import jsPDF from "jspdf";
import { FullUXAuditReport } from "../../ops-ux-audit/engine/uxAudit.types";
import { OpsAuditReport } from "./audit.types";
import { renderCoverPage } from "./pdf/pages/coverPage";
import { renderTableOfContents } from "./pdf/components/tableOfContents";
import { renderUxAuditSection } from "./pdf/sections/uxAuditSection";
import { renderSynthesisPage } from "./pdf/pages/synthesisPage";
import { renderSystemSynthesis } from "./pdf/pages/systemSynthesisPage";
import { renderAboutPage, renderMethodologyPage, renderRiskFrameworkPage, renderGlossaryPage } from "./pdf/pages/staticPages";

/**
 * Generates the "Consulting-Grade" PDF Report.
 * ADAPTER: Accepts OpsAuditReport (Legacy Wrapper) -> Extracts FullUXAuditReport -> Returns Data URI
 */
export function generateAuditPdf(wrapperReport: OpsAuditReport): string {
  const doc = new jsPDF();
  
  // EXTRACT DATA
  // The OpsAuditReport contains 'uxDetails' which IS the FullUXAuditReport structure we need.
  const uxReport: FullUXAuditReport = wrapperReport.uxDetails || {
      globalScore: wrapperReport.uxScore,
      charts: [],
      cards: [],
      dataIntegrityIssues: []
  };

  // 1. DATA PREP
  const allComponents = [
      ...(uxReport.charts || []),
      ...(uxReport.cards || [])
  ];

  // 2. RENDER COVER PAGE (Page 1)
  renderCoverPage(doc, {
      systemName: "EDF COCKPIT / AGENT ZERO",
      version: "7.0 (UX INTELLIGENCE)",
      generatedAt: wrapperReport.generatedAt || new Date().toISOString(),
      fingerprint: process.env.NEXT_PUBLIC_OPS_FINGERPRINT || "DEV-BUILD-NO-SIG"
  });
  
  // 3. RENDER STATIC PAGES (User Request: About, Methodology)
  renderAboutPage(doc);
  renderMethodologyPage(doc);

  // 4. RENDER SYNTHESIS (Executive Summary)
  renderSynthesisPage(doc, uxReport);

  // 5. RENDER RISK FRAMEWORK
  renderRiskFrameworkPage(doc);

  // 6. RENDER SYSTEM SYNTHESIS (Legacy Page 3 - Keep or Drop? Keeping as extra detail)
  renderSystemSynthesis(doc);

  // 4. RENDER CONTENT (Starts on Page 4)
  // Reset font for content
  doc.setFont("Helvetica", "normal");
  
  const sections = renderUxAuditSection(doc, allComponents);
  
  // 5. GENERATE TOC (New Page)
  renderTableOfContents(doc, sections);

  // 8. RENDER GLOSSARY (Last Page)
  renderGlossaryPage(doc);
  
  // 6. REORDER PAGES
  // Moves TOC (currently Last) to position 4 (after System Synthesis).
  const totalPages = doc.getNumberOfPages();
  if (totalPages > 4) {
      doc.movePage(totalPages, 4);
  }
  
  // 7. ADD FOOTER PAGE NUMBERS
  const finalPageCount = doc.getNumberOfPages();
  for(let i = 1; i <= finalPageCount; i++) {
      if (i === 1) continue; // Skip cover
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${finalPageCount} — OPS INTEGRITY AUDIT`, 190, 290, { align: "right" });
  }

  // RETURN DATA URI STRING (as expected by OpsAuditApi and UI)
  return doc.output('datauristring');
}
