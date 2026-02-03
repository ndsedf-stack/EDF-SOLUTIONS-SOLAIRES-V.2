import React, { useEffect } from 'react';
import { assembleOpsAudit } from '@/ops-agent/audit/auditAssembler';
import { generateAuditPdf } from '@/ops-agent/audit/audit.pdf';

const MOCK_DECISIONS = [
  { study_id: 'S-29381', priority: 'WAR_ROOM', axis: 'A', justification: 'SRU Expiration in 2 days' },
  { study_id: 'S-77492', priority: 'WAR_ROOM', axis: 'C', justification: 'Critical data mismatch detected' },
  { study_id: 'S-93821', priority: 'WATCH', axis: 'B', justification: 'Silent for 10 days' },
  { study_id: 'S-19283', priority: 'PRIORITY_ACTION', axis: 'A', justification: 'High value at risk' },
  { study_id: 'S-44821', priority: 'STOP', axis: 'B', justification: 'Non-compliant project structure' },
];

export const OpsAuditApi = ({ mode }: { mode: 'json' | 'download' }) => {
  useEffect(() => {
    // Simulate API Processing
    const report = assembleOpsAudit({
        // @ts-ignore global access for demo
      decisions: (globalThis as any).__OPS_DECISIONS__ || MOCK_DECISIONS,
      uxScore: 62, // Lower score to show issues in PDF
      dataBreaches: 0,
      uxDetails: {
        globalScore: 62,
        dataIntegrityIssues: [],
        cards: [],
        charts: [
           {
             component: 'FinancialRiskProofVisx',
             score: 62,
             issues: [
                { severity: 'CRITICAL', message: 'No visible danger zone', recommendation: 'Add background risk zones' },
                { severity: 'HIGH', message: 'X-axis overloaded (30 labels)', recommendation: 'Display 1 label every 3 days' },
                { severity: 'HIGH', message: 'Font size below 12px', recommendation: 'Increase label font size to ≥12px' }
             ]
           }
        ]
      }
    });

    if (mode === 'download') {
      const pdfDataUri = generateAuditPdf(report);
      const link = document.createElement('a');
      link.href = pdfDataUri;
      link.download = `ops_audit_report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Optional: Close window or show success message
    }
  }, [mode]);

  const report = assembleOpsAudit({
      // @ts-ignore
    decisions: (globalThis as any).__OPS_DECISIONS__ || MOCK_DECISIONS,
    uxScore: 93,
    dataBreaches: 0
  });

  if (mode === 'download') {
    return (
      <div style={{ padding: 40, background: '#111', color: '#fff', fontFamily: 'monospace' }}>
        <h1>📄 Generating PDF...</h1>
        <p>Your download should start automatically.</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  // JSON Mode
  return (
    <pre style={{ padding: 20, background: '#0d1117', color: '#c9d1d9', fontSize: 14, overflow: 'auto' }}>
      {JSON.stringify(report, null, 2)}
    </pre>
  );
};
