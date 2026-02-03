import { COCKPIT_COMPONENTS } from "../../cockpit/cockpit.components";
import { UX_AUDIT_REGISTRY } from "./auditRegistry";
import { AuditIssue, ChartAuditResult, FullUXAuditReport } from "./uxAudit.types";

export function runUXAudit(input: {
  // Input parameters kept for compatibility
  dataIntegrityIssues: AuditIssue[];
}): FullUXAuditReport {
  
  const charts: ChartAuditResult[] = [];
  const cards: ChartAuditResult[] = [];

  // EXHAUSTIVE GOVERNANCE LOOP
  // We iterate over the COCKPIT_COMPONENTS (Source of Truth)
  // If a component is in the cockpit but not in the registry -> CRASH.
  
  for (const componentName of COCKPIT_COMPONENTS) {
      const auditor = UX_AUDIT_REGISTRY[componentName];

      if (!auditor) {
          throw new Error(
            `GOVERNANCE BREACH: Component "${componentName}" is visible in Cockpit but has NO UX auditor.`
          );
      }

      let result: ChartAuditResult;
      try {
          // In a real system, we would inject specific context props here.
          // The auditors handle their own mocks for this phase.
          result = auditor();
      } catch (e) {
          throw new Error(`AUDIT CRASHED for ${componentName}: ${e}`);
      }

      if (!result) {
           throw new Error(`AUDIT FAILURE: Auditor for "${componentName}" returned no result.`);
      }

      // Add component name for tracing
      const finalResult = {
          component: componentName,
          ...result // Override score/issues
      };

      // Categorize roughly for the report structure
      if (componentName.includes('Cards') || componentName.includes('KPI')) {
          cards.push(finalResult);
      } else {
          charts.push(finalResult);
      }
  }

  const allScores = [
    ...charts.map(c => c.score),
    ...cards.map(c => c.score),
    input.dataIntegrityIssues.length ? 40 : 100 // Penalty for data integrity
  ];

  const globalScore = allScores.length > 0 
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 100;

  return {
    globalScore: Math.round(globalScore),
    charts,
    cards,
    dataIntegrityIssues: input.dataIntegrityIssues
  };
}
