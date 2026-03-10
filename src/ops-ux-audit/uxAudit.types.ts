export type ChartType =
  | 'TIME_SERIES'
  | 'STACKED_BAR'
  | 'RISK_MATRIX'
  | 'DISTRIBUTION'
  | 'PROJECTION';

export interface ChartSpec {
  id: string;
  type: ChartType;
  dataPoints: number;
  seriesCount: number;
  xAxisLabelsCount: number;
  minLabelFontPx: number;
  avgOpacity: number;
  hasLegend: boolean;
  hasThresholds: boolean;
  hasCriticalZones: boolean;
}

export interface UxAuditIssue {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  code: string;
  message: string;
  recommendation: string;
}

export interface UxAuditResult {
  chartId: string;
  score: number; // 0–100
  issues: UxAuditIssue[];
}
