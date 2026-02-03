import { ChartAuditResult } from "../engine/uxAudit.types";

export function auditRiskMap(): ChartAuditResult {
  return {
    component: "CARTOGRAPHIE DES RISQUES",
    score: 100,
    severity: "OK",
    issues: []
  };
}
