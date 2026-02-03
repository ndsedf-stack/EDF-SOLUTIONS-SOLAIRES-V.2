import { OpsAuditReport } from "./audit.types";

export type AuditComparison = {
  globalDelta: number;
  uxDelta: number;
  breachesDelta: number;
  status: 'IMPROVED' | 'REGRESSED' | 'STAGNANT' | 'MIXED';
};

export function compareAudits(
  prev: OpsAuditReport | null | undefined, 
  current: OpsAuditReport
): AuditComparison {
  if (!prev) {
    return {
      globalDelta: 0,
      uxDelta: 0,
      breachesDelta: 0,
      status: 'STAGNANT' // Or 'NEW' concept if needed, but STAGNANT/neutral works for 0 delta
    };
  }

  const globalDelta = current.globalScore - prev.globalScore;
  const uxDelta = current.uxScore - prev.uxScore;
  const breachesDelta = current.dataIntegrityBreaches - prev.dataIntegrityBreaches; // Positive means MORE breaches (bad)

  let status: AuditComparison['status'] = 'STAGNANT';

  // Determine High Level Status
  const isBetter = globalDelta > 0 || uxDelta > 0 || breachesDelta < 0;
  const isWorse = globalDelta < 0 || uxDelta < 0 || breachesDelta > 0;

  if (isBetter && !isWorse) status = 'IMPROVED';
  else if (isWorse && !isBetter) status = 'REGRESSED';
  else if (isBetter && isWorse) status = 'MIXED'; // e.g. Better UX but more breaches

  return {
    globalDelta,
    uxDelta,
    breachesDelta,
    status
  };
}
