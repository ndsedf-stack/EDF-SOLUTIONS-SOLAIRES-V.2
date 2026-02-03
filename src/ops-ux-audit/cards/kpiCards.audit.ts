import { ChartAuditResult } from "../engine/uxAudit.types";

export function auditKPICards(): ChartAuditResult {
  return {
    component: "AGENCEMENT CARTES KPI",
    score: 100,
    severity: "OK",
    issues: []
  };
}
