import { FullUXAuditReport } from "@/ops-ux-audit/engine/uxAudit.types";

export type OpsAuditReport = {
  generatedAt: string
  globalScore: number
  warRoomCount: number
  dataIntegrityBreaches: number
  uxScore: number
  uxDetails?: FullUXAuditReport;
  comparison?: {
      globalDelta: number;
      uxDelta: number;
      breachesDelta: number;
      status: string;
  };
  decisions: Array<{
    study_id: string
    priority: "WAR_ROOM" | "PRIORITY" | "WATCH" | "STOP"
    axis: "A" | "B" | "C"
    justification: string
  }>
}
