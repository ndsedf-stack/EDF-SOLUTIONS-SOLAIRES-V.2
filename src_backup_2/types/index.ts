export interface SimulationParams {
  yearlyConsumption: number;
  currentAnnualBill: number;
  electricityPrice: number;
  yearlyProduction: number;
  selfConsumptionRate: number;
  installCost: number;
  creditInterestRate: number;
  creditDurationMonths: number;
  creditMonthlyPayment: number;
  insuranceMonthlyPayment: number;
  insuranceRate?: number;
  cashAport?: number;
  remainingToFinance: number;
  projectionYears: number;
  inflationRate: number;
  buybackRate?: number;
  taxRate?: number;
  interestRate?: number;
}

export interface YearDetail {
  year: number;
  edfBillWithoutSolar: number;
  edfBillWithSolar: number;
  savings: number;
  cumulativeSavings: number;
  cumulativeSpendNoSolar: number;
  cumulativeSpendSolar: number;
}

export interface SimulationResult {
  // Paramètres d'entrée
  params: SimulationParams;

  // Résultats principaux
  totalSavingsProjected: number;
  totalSavingsProjectedCash: number;
  roiPercentage: number;
  roiPercentageCash: number;
  breakEvenPoint: number;
  breakEvenPointCash: number;
  averageYearlyGain: number;
  savingsRatePercent?: number;

  // Détails année par année
  details: YearDetail[];
  detailsCash?: YearDetail[];

  // Versions pour graphiques
  slicedDetails?: YearDetail[];
  slicedDetailsCash?: YearDetail[];
}

// Types pour validateSimulation
export interface ValidationError {
  severity: "ERROR" | "WARNING" | "INFO";
  category: string;
  message: string;
  expected?: any;
  actual?: any;
}

export interface DetailedValidationReport {
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  isValid: boolean;
  score: number;
}

// Types pour validateAll
export interface ValidationReport {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  info: string[];
}
