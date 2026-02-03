import { OpsAuditReport } from "./audit.types"

export function assembleOpsAudit(input: {
  decisions: any[]
  uxScore: number
  dataBreaches: number
  uxDetails?: any // Pass through for detailed reporting
}): OpsAuditReport {
  return {
    generatedAt: new Date().toISOString(),
    globalScore: Math.max(
      0,
      100 - input.dataBreaches * 20 - (100 - input.uxScore)
    ),
    warRoomCount: input.decisions.filter(d => d.priority === "WAR_ROOM").length,
    dataIntegrityBreaches: input.dataBreaches,
    uxScore: input.uxScore,
    uxDetails: input.uxDetails, // ✅ PLUMBING FIX
    decisions: input.decisions
  }
}
