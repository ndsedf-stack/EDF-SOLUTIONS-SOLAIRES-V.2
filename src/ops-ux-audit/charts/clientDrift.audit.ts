import { ChartAuditResult } from "../engine/uxAudit.types";

export function auditClientDrift(): ChartAuditResult {
  return {
    component: "DÉRIVE CLIENT (DRIFT)",
    score: 100,
    severity: "OK",
    issues: []
  };
}
