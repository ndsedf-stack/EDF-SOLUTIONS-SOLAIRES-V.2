import { AuditIssue } from "../../../../ops-ux-audit/engine/uxAudit.types";
import { grid, COLORS } from "../pdf.utils";

export function renderIssueBlock(
  pdf: any,
  issue: AuditIssue,
  startY: number
): number {
  const marginX = 25; // 25 is close to grid(3)=24. Let's keep 25 for now as user spec.
  const contentWidth = 160;
  const pageBottom = 270;
  let currentY = startY;

  // Helper to ensure space exists before writing
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageBottom) {
      pdf.addPage();
      currentY = 30; // Reset to top margin
    }
  };

  // @ts-ignore
  const sevColor = COLORS[issue.severity] || COLORS.LOW;

  /* ───────────────── HEADER ───────────────── */

  ensureSpace(grid(2)); // ~16

  // @ts-ignore
  pdf.setDrawColor(...sevColor);
  pdf.setLineWidth(0.6);
  // Line height = grid(2) approx? User said 14. grid(1.5) = 12. grid(2) = 16.
  // User code: line(..., currentY + 14).
  pdf.line(marginX - 6, currentY, marginX - 6, currentY + 14);

  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(8); // grid(1)
  // @ts-ignore
  pdf.setTextColor(...sevColor);
  pdf.text(issue.severity.toUpperCase(), marginX, currentY + 5);

  pdf.setFontSize(7);
  // @ts-ignore
  pdf.setTextColor(...COLORS.TEXT_MUTED);
  pdf.text(
    `ID: ${issue.code}`,
    marginX + contentWidth,
    currentY + 5,
    { align: "right" }
  );

  currentY += 14; 

  /* ──────────────── FIELD RENDER ─────────────── */

  const renderField = (label: string, value?: string | string[] | any) => {
    if (!value) return;

    let text = "";
    if (Array.isArray(value)) text = value.join(", ");
    else if (typeof value === 'object') {
        // @ts-ignore
        text = `${value.name} — ${value.description}`;
    } else {
        text = value;
    }

    const lines = pdf.splitTextToSize(text, contentWidth);
    
    // Label(5) + Text(lines*4.8) + Spacing(6)
    // 4.8 is roughly grid(0.6).
    const blockHeight = 5 + (lines.length * 4.8) + 6;

    ensureSpace(blockHeight);

    // Label
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(7);
    // @ts-ignore
    pdf.setTextColor(...COLORS.TEXT_MUTED);
    pdf.text(label.toUpperCase(), marginX, currentY);

    currentY += 5; 

    // Content
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(9); // grid(1) + 1
    // @ts-ignore
    pdf.setTextColor(...COLORS.TEXT_MAIN);
    pdf.text(lines, marginX, currentY);

    currentY += (lines.length * 4.8) + 6;
  };

  renderField("Problème détecté", issue.description);
  
  if (issue.impact) {
      renderField("Impact opérationnel", issue.impact);
  }
  
  const remediationVal = Array.isArray(issue.remediation) ? issue.remediation.map((r: string) => `• ${r}`) : `• ${issue.remediation}`;
  renderField("Action corrective", remediationVal);

  if (issue.suggestedPattern) {
      renderField("Pattern Requis", issue.suggestedPattern);
  }

  return currentY + grid(1); // Small buffer at end
}
