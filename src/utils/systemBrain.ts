// =======================================================
// ⚠️ DEPRECATED: This file is a wrapper around src/brain
// Use src/brain/Engine.ts instead.
// =======================================================

export type { Metrics, FinancialStats, Study } from "../brain/types";
export { buildSystemBrain } from "../brain/Engine";
export { computeFinancialStats } from "../brain/intelligence/finance";
export { detectAnomalies } from "../brain/intelligence/anomalies";
export { computeBehavioralRisk } from "../brain/intelligence/behavior";
