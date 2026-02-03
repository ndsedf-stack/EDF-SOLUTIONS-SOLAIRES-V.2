import { ChartSpec } from './uxAudit.types';

export function isCosmeticGraph(spec: ChartSpec): boolean {
  return (
    !spec.hasThresholds &&
    !spec.hasCriticalZones &&
    spec.type !== 'RISK_MATRIX'
  );
}
