import { OpsAuditReport } from "./audit.types"

export function exportAudit(report: OpsAuditReport) {
  console.log("OPS AUDIT REPORT")
  console.log(JSON.stringify(report, null, 2))
  // phase suivante : PDF / Notion API
}
