export type AuditCategory =
  | 'DATA_INTEGRITY'
  | 'UX_READABILITY'
  | 'COSMETIC_DETECTION';

export interface UxAuditLog {
  chartId: string;
  category: AuditCategory;
  score: number;
  criticalIssues: number;
  timestamp: string;
}
