import { YearlyDetail } from "../types";

// ============================================
// TYPES CALCULATRICE
// ============================================

export interface FinancingParams {
  amount: number;
  rate: number; // en %
  duration: number; // en mois
  insuranceRate?: number; // en %
}

export interface FinancingResult {
  monthlyPayment: number;
  totalCost: number;
  totalInterests: number;
  insuranceCost: number;
  marketComparison?: {
    marketRate: number;
    marketMonthlyPayment: number;
    savings: number;
  };
}

export interface SolarProjectionParams {
  monthlyBill: number;
  annualIncrease: number; // en %
  productionKwh: number;
  selfConsumptionRatio: number; // 0-1
  kwhPrice: number;
  resalePrice: number;
  years: number;
}

// ============================================
// 1. CALCULS FINANCEMENT / CREDIT
// ============================================

/**
 * Calcule la mensualité d'un crédit amortissable classique.
 * Formule: M = P * (r/12) / (1 - (1 + r/12)^-n)
 */
export function computeMonthlyPayment(amount: number, ratePercent: number, durationMonths: number): number {
  if (ratePercent === 0) return amount / durationMonths;
  const monthlyRate = ratePercent / 100 / 12;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths));
}

/**
 * Calcul complet du financement avec comparaison marché (si taux bonifié).
 */
export function computeFinancing(params: FinancingParams): FinancingResult {
  const { amount, rate, duration, insuranceRate = 0 } = params;
  
  const monthlyPayment = computeMonthlyPayment(amount, rate, duration);
  const totalInsurance = amount * (insuranceRate / 100) * (duration / 12); // approx
  const totalCostWithInsurance = (monthlyPayment * duration) + totalInsurance;
  const totalInterests = (monthlyPayment * duration) - amount;

  // Comparaison marché (hardcoded rates pour l'instant, could be params)
  const MARKET_RATE = 5.89;
  let marketComparison;
  
  if (rate < MARKET_RATE) {
    const marketPayment = computeMonthlyPayment(amount, MARKET_RATE, duration);
    marketComparison = {
      marketRate: MARKET_RATE,
      marketMonthlyPayment: marketPayment,
      savings: (marketPayment - monthlyPayment) * duration
    };
  }

  return {
    monthlyPayment,
    totalCost: totalCostWithInsurance,
    totalInterests,
    insuranceCost: totalInsurance / duration, // coût mensuel
    marketComparison
  };
}


// ============================================
// 2. PROJECTIONS SOLAIRES & ROI
// ============================================

/**
 * Projette les économies sur X années.
 */
export function computeSolarProjection(params: SolarProjectionParams): YearlyDetail[] {
  const { monthlyBill, annualIncrease, productionKwh, selfConsumptionRatio, kwhPrice, resalePrice, years } = params;
  const yearlyBill = monthlyBill * 12;
  const details: YearlyDetail[] = [];

  let currentKwhPrice = kwhPrice;
  let currentBill = yearlyBill;

  for (let year = 1; year <= years; year++) {
    // Calcul Production Valeur
    const consumedKwh = productionKwh * selfConsumptionRatio;
    const resoldKwh = productionKwh * (1 - selfConsumptionRatio);
    
    // Économie sur facture (énergie non achetée)
    const savings = consumedKwh * currentKwhPrice;
    
    // Gain revente
    const resaleIncome = resoldKwh * resalePrice;
    
    // Facture théorique sans solaire (ce qu'on aurait payé)
    const billWithoutSolar = currentBill;
    
    // Facture réelle avec solaire
    const billWithSolar = Math.max(0, billWithoutSolar - savings);

    details.push({
      year,
      savings,
      resaleIncome,
      totalGain: savings + resaleIncome,
      cumulativeGain: (details[details.length - 1]?.cumulativeGain || 0) + savings + resaleIncome,
      billWithoutSolar,
      billWithSolar,
      energyPrice: currentKwhPrice,
      // Compatibility fields for YearlyDetail type
      edfBillWithoutSolar: billWithoutSolar,
      creditPayment: 0,
      edfResidue: billWithSolar,
      totalWithSolar: billWithSolar,
      
      // Missing Accumulators
      cumulativeSavings: (details[details.length - 1]?.cumulativeGain || 0) + savings + resaleIncome, // Alias for gain
      cumulativeSpendNoSolar: (details[details.length - 1]?.cumulativeSpendNoSolar || 0) + billWithoutSolar,
      cumulativeSpendSolar: (details[details.length - 1]?.cumulativeSpendSolar || 0) + billWithSolar,
      cashflowDiff: savings + resaleIncome, // Positive impact
      solarSavingsValue: savings // Pure solar savings
    });

    // Inflation pour l'année suivante
    currentKwhPrice *= (1 + annualIncrease / 100);
    currentBill *= (1 + annualIncrease / 100);
  }

  return details;
}

/**
 * Calcule le total du cash-flow net sur la période (Gains cumulés - Coût crédit).
 */
export function computeNetCashFlow(projection: YearlyDetail[], financing: FinancingResult, durationMonths: number): number {
  const totalGains = projection[projection.length - 1].cumulativeGain;
  const creditCost = financing.monthlyPayment * durationMonths; // On compte tout le crédit comme une sortie
  // Attention: simpliste, ne prend pas en compte cash-flow année par année.
  return totalGains - creditCost;
}
