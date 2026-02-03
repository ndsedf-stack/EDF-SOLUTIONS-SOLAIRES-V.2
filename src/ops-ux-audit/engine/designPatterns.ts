export const DESIGN_PATTERNS = [
  "Risk Skyline",
  "Confidence Corridor Chart",
  "Quadrant Radar Map",
  "Behavior Heat Bars",
  "Behavior Trend Ribbon",
  "Timeline Milestones",
  "Semantic Clusters",
  "KPI Ticker",
  "Timeline Milestones",
  "Sparse Temporal Axis",
  "Standard Bar/Line" // Fallback
] as const;

export type DesignPatternParams = {
  id: string;
  name: string; // Changed from strict union to string to allow French Localization
  description: string;
};
