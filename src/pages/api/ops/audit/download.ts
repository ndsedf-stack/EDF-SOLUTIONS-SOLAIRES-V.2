import { assembleOpsAudit } from "@/ops-agent/audit/auditAssembler";
import { generateAuditPdf } from "@/ops-agent/audit/audit.pdf";

// Simulated Data for Demo Context
const MOCK_DECISIONS = [
  { study_id: 'S-29381', priority: 'WAR_ROOM', axis: 'A', justification: 'SRU Expiration in 2 days' },
  { study_id: 'S-77492', priority: 'WAR_ROOM', axis: 'C', justification: 'Critical data mismatch detected' },
  { study_id: 'S-93821', priority: 'WATCH', axis: 'B', justification: 'Silent for 10 days' },
  { study_id: 'S-19283', priority: 'PRIORITY_ACTION', axis: 'A', justification: 'High value at risk' },
  { study_id: 'S-44821', priority: 'STOP', axis: 'B', justification: 'Non-compliant project structure' },
];

export default async function handler(req: any, res: any) {
  try {
    // 1. Assemble the Report Data (Real + Mock for demo completeness)
    const report = assembleOpsAudit({
      decisions: (globalThis as any).__OPS_DECISIONS__ || MOCK_DECISIONS,
      uxScore: 78,
      dataBreaches: 1
    });

    // 2. Generate PDF
    const pdfDataUri = generateAuditPdf(report);
    
    // 3. Convert DataURI to Buffer
    const pdfBuffer = Buffer.from(pdfDataUri.split(',')[1], 'base64');

    // 4. Serve the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ops_audit_report_${Date.now()}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("PDF Generation Error", error);
    res.status(500).json({ error: "Failed to generate audit report PDF" });
  }
}
