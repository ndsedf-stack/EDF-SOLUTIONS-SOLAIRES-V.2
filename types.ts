export interface SimulationParams {
  inflationRate: number | string;
  electricityPrice: number | string;
  yearlyProduction: number | string;
  selfConsumptionRate: number | string;
  installCost: number | string;
  creditMonthlyPayment: number | string;
  insuranceMonthlyPayment: number | string;
  creditDurationMonths: number | string;
  cashApport: number | string;
  remainingToFinance: number | string;
  currentAnnualBill: number | string;
  yearlyConsumption: number | string;
  taxRate?: number | string;
}

export interface SimulationResult {
  params: SimulationParams;
  salesPitch: string;
}

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
}

export interface CalculationOutput {
  details: YearlyDetail[];
  slicedDetails: YearlyDetail[];
  detailsCash: YearlyDetail[];
  slicedDetailsCash: YearlyDetail[];
  
  totalSavingsProjected: number;
  totalSpendNoSolar: number;
  totalSpendSolar: number;
  
  totalSavingsProjectedCash: number;
  totalSpendNoSolarCash: number;
  totalSpendSolarCash: number;

  breakEvenPoint: number;
  breakEvenPointCash: number;

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
  
  year1: YearlyDetail;
}

// New types to fix errors
export interface AmortizationPoint {
  year: number;
  balance: number;
  interest: number;
  principal: number;
}

export interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationPoint[];
}

export interface LoanParams {
  amount: number;
  rate: number;
  years: number;
}

export interface AIAnalysisState {
  loading: boolean;
  response: string | null;
  error: string | null;
}