import { auditFinancialRisk } from "../charts/financialRisk.audit";
import { auditProjectionCA } from "../charts/projectionCA.audit";
import { auditRiskMap } from "../charts/riskMap.audit";
import { auditClientDrift } from "../charts/clientDrift.audit";
import { auditBehaviorTimeline } from "../charts/behaviorTimeline.audit";
import { auditKPICards } from "../cards/kpiCards.audit";
import { ChartAuditResult } from "./uxAudit.types";

export type AuditFunction = (context?: any) => ChartAuditResult;

// Strict Map: ComponentID -> AuditFunction
export const UX_AUDIT_REGISTRY: Record<string, AuditFunction> = {
  FinancialRiskProofVisx: auditFinancialRisk,
  ProjectionCAVISX: auditProjectionCA,
  RiskMapVisx: auditRiskMap,
  ClientDriftVisx: auditClientDrift,
  BehaviorDriftTimelineVisx: auditBehaviorTimeline,
  KpiCardsLayout: auditKPICards,
};
