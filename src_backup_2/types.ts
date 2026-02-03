export interface YearlyDetail {
  year: number;
  edfBillWithoutSolar: number;
  creditPayment: number;
  edfResidue: number;
  totalWithSolar: number;
  cumulativeSavings: number;
  cumulativeSpendNoSolar: number;
  cumulativeSpendSolar: number;
  cashflowDiff: number;
  solarSavingsValue: number;
  // Index signature pour permettre l'accès dynamique dans les boucles
  [key: string]: any;
}

export interface SimulationResult {
  // --- Données d'Entrée (Inputs) ---
  installCost?: number | string;
  remainingToFinance?: number | string;
  interestRate?: number | string;
  creditDurationMonths?: number | string;
  insuranceRate?: number | string;
  yearlyProduction?: number | string;
  selfConsumptionRate?: number | string;
  inflationRate?: number | string;
  savingsRatePercent?: number | string;

  // --- Résultats de Synthèse ---
  breakEvenPoint?: number | string;
  breakEvenPointCash?: number | string;
  roiPercentage?: number | string;
  roiPercentageCash?: number | string;
  totalSavingsProjected?: number | string;
  totalSavingsProjectedCash?: number | string;
  heritageNet?: number | string;
  totalInvestment?: number | string;
  monthlySavingsAverage?: number | string;

  // --- Objets Spécifiques (Année 1, etc.) ---
  year1?: {
    loanMonthly?: number | string;
    edfBillWithoutSolar?: number | string;
    edfResidue?: number | string;
    totalWithSolar?: number | string;
    savings?: number | string;
    [key: string]: any;
  };

  creditMonthlyPayment?: number | string;

  // --- Tableaux de données ---
  details?: YearlyDetail[];

  // --- Champs Techniques / Metadata ---
  id?: string;
  createdAt?: string;
  clientName?: string;
  location?: string;

  // --- LIBERTÉ TOTALE POUR ÉVITER LES ERREURS TS ---
  // Cette ligne permet à n'importe quelle propriété d'exister sans erreur
  [key: string]: any;
}

// Interfaces pour la Validation (utilisées dans validateCalculations.ts)
export interface ValidationError {
  severity: "ERROR" | "WARNING" | "INFO";
  category: string;
  message: string;
  expected?: any;
  actual?: any;
}

export interface ValidationReport {
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  isValid: boolean;
  score: number;
}
// Interface pour les paramètres d'entrée de la simulation
export interface SimulationParams {
  currentAnnualBill?: number;
  yearlyConsumption?: number;
  electricityPrice?: number;
  yearlyProduction?: number;
  selfConsumptionRate?: number;
  installCost?: number;
  creditInterestRate?: number;
  creditMonthlyPayment?: number;
  insuranceMonthlyPayment?: number;
  creditDurationMonths?: number;
  cashApport?: number;
  buybackRate?: number;
  houseSize?: number;
  address?: string;
  [key: string]: any;
}

// Interface pour le résultat des calculs financiers
export interface CalculationOutput {
  details: YearlyDetail[];
  slicedDetails: YearlyDetail[];
  detailsCash: YearlyDetail[];
  slicedDetailsCash: YearlyDetail[];
  totalSavingsProjected: number;
  totalSavings: number;
  totalSpendNoSolar: number;
  totalSpendSolar: number;
  totalSavingsProjectedCash: number;
  totalSpendNoSolarCash: number;
  totalSpendSolarCash: number;
  breakEvenPoint: number;
  breakEvenPointCash: number;
  paybackYear: number;
  costOfInactionPerSecond: number;
  averageYearlyGain: number;
  averageYearlyGainCash: number;
  newMonthlyBillYear1: number;
  oldMonthlyBillYear1: number;
  monthlyEffortYear1: number;
  roiPercentage: number;
  roiPercentageCash: number;
  bankEquivalentCapital: number;
  bankEquivalentCapitalCash: number;
  savingsRatePercent: number;
  baseConsumptionKwh: number;
  lossIfWait1Year: number;
  savingsLostIfWait1Year: number;
  surplusRevenuePerYear: number;
  interestRate: number;
  year1: YearlyDetail;
  [key: string]: any;
}

// Legacy types for backward compatibility with unused components
export interface LoanParams {
  amount: number;
  rate: number;
  duration: number;
  [key: string]: any;
}

export interface CalculationResult {
  monthlyPayment?: number;
  totalInterest?: number;
  totalCost?: number;
  [key: string]: any;
}

export interface AIAnalysisState {
  isAnalyzing?: boolean;
  result?: string;
  [key: string]: any;
}

export interface AmortizationPoint {
  month: number;
  principal: number;
  interest: number;
  balance: number;
  [key: string]: any;
}
