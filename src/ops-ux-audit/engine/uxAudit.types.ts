import { DesignPatternParams } from "./designPatterns";

export type AuditSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuditIssue = {
  code: string;
  severity: AuditSeverity;
  description: string;
  impact: string;
  remediation: string;
  suggestedPattern?: DesignPatternParams;
};

export type ChartAuditResult = {
  component: string;
  score: number;
  severity: "OK" | "WARNING" | "CRITICAL";
  issues: AuditIssue[];
};


export type FullUXAuditReport = {
  globalScore: number;
  charts: ChartAuditResult[];
  cards: ChartAuditResult[];
  dataIntegrityIssues: any[]; // Keeping generic to avoid breaking other files temporarily
};

export type ChartMeta = {
  id?: string; // Often needed for identification
  dataPoints: number;
  xLabelsCount: number;
  minFontSize: number;
  hasLegend: boolean;
  hasThresholds: boolean;
  hasZones: boolean;
  contrastRatio?: number;
  rendersAllData?: boolean;
  avgOpacity?: number; // Legacy compatibility
};
