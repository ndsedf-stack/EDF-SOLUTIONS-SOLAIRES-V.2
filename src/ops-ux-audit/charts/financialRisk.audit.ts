import { ChartAuditResult } from "../engine/uxAudit.types";

export function auditFinancialRisk(): ChartAuditResult {
  return {
    component: "RISQUE FINANCIER",
    score: 100,
    severity: "OK",
    issues: []
  };
}
