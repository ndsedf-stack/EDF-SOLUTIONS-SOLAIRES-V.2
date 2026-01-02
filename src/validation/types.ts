export interface ValidationReport {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  info: string[];
}

export interface CalculationOutput {
  totalSavingsProjected: number;
  totalSavingsProjectedCash: number;
  roiPercentage: number;
  breakEvenPoint: number;
  details: Array<{ cumulativeSavings: number }>;
  detailsCash: Array<{ cumulativeSavings: number }>;
  slicedDetails?: Array<{ cumulativeSavings: number }>;
  slicedDetailsCash?: Array<{ cumulativeSavings: number }>;
  [key: string]: any;
}
