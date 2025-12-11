import { CalculationOutput, SimulationParams, YearlyDetail } from '../types';

export const safeParseFloat = (val: any, defaultVal: number = 0): number => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const str = String(val).replace(',', '.').replace(/\s/g, '');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? defaultVal : parsed;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const calculateSolarProjection = (
  params: SimulationParams,
  overrides: {
    inflationRate: number;
    projectionYears: number;
    electricityPrice: number;
    yearlyProduction: number;
    selfConsumptionRate: number;
    installCost: number;
    cashApport: number;
    remainingToFinance: number;
    creditMonthlyPayment: number;
    insuranceMonthlyPayment: number;
    creditDurationMonths: number;
    taxRate?: number;
  }
): CalculationOutput => {
  const currentAnnualBill = safeParseFloat(params.currentAnnualBill, 0);
  const yearlyConsumption = safeParseFloat(params.yearlyConsumption, 0);

  // Destructure overrides for cleaner access
  const {
    inflationRate,
    projectionYears,
    electricityPrice,
    yearlyProduction,
    selfConsumptionRate,
    installCost,
    remainingToFinance,
    creditMonthlyPayment,
    insuranceMonthlyPayment,
    creditDurationMonths,
    taxRate = 0
  } = overrides;

  // Normalized inputs (Double precision safety)
  const localInflation = Math.round(inflationRate * 10) / 10;
  const localInstallCost = Math.round(installCost);

  // --- BASE CALCULATIONS ---
  // 1. Consumption Base
  const baseConsumptionKwh = yearlyConsumption > 0 
    ? yearlyConsumption 
    : (electricityPrice > 0 ? currentAnnualBill / electricityPrice : 0);

  // 2. Production Split
  const selfConsumedKwh = yearlyProduction * (selfConsumptionRate / 100);
  const surplusKwh = yearlyProduction * (1 - selfConsumptionRate / 100);
  
  // Tax calculation on surplus revenue
  // Assuming taxRate is the percentage of tax on the revenue
  const grossSurplusRevenue = surplusKwh * 0.13;
  const netSurplusRevenue = grossSurplusRevenue * (1 - (taxRate / 100));
  
  const surplusRevenuePerYear = Math.round(netSurplusRevenue * 100) / 100; // Resale at 0.13€ net of tax
  const savingsRatePercent = baseConsumptionKwh > 0 ? (selfConsumedKwh / baseConsumptionKwh) * 100 : 0;

  // --- SIMULATION LOOPS ---
  const startYear = new Date().getFullYear();
  
  // Storage for Credit Scenario
  const details: YearlyDetail[] = [];
  let cumulativeSpendNoSolar = 0;
  let cumulativeSpendSolar = localInstallCost > 0 ? overrides.cashApport : 0; // Initial outlay is just the cash apport
  let cumulativeSavings = -overrides.cashApport; // Initial hole is the cash apport

  // Storage for Cash Scenario
  const detailsCash: YearlyDetail[] = [];
  let cumulativeSpendNoSolarCash = 0;
  let cumulativeSpendSolarCash = localInstallCost; // Initial outlay is full cost
  let cumulativeSavingsCash = -localInstallCost; // Initial hole is full cost

  // Run projection for 30 years (standard lifetime)
  for (let i = 0; i < 30; i++) {
    const year = startYear + i;
    
    // Inflation factor
    const priceMultiplier = Math.pow(1 + localInflation / 100, i);
    const currentPrice = electricityPrice * priceMultiplier;

    // A. SCENARIO: NO SOLAR
    const billWithoutSolar = Math.round(baseConsumptionKwh * currentPrice * 100) / 100;

    // B. SCENARIO: WITH SOLAR (COMMON)
    const savingsInEuros = Math.round(selfConsumedKwh * currentPrice * 100) / 100;
    const residuaryBill = Math.max(0, Math.round((billWithoutSolar - savingsInEuros) * 100) / 100);

    // C. CREDIT SPECIFICS
    const isCreditActive = i * 12 < creditDurationMonths;
    const creditCostYearly = isCreditActive 
      ? Math.round((creditMonthlyPayment + insuranceMonthlyPayment) * 12 * 100) / 100
      : 0;

    // Cashflow Credit
    // Total Decaissé = Bill residue + Loan + Insurance - Resale Revenue
    const totalDecaisse = Math.round((residuaryBill + creditCostYearly - surplusRevenuePerYear) * 100) / 100;
    const yearlyCashflow = Math.round((billWithoutSolar - totalDecaisse) * 100) / 100;

    cumulativeSpendNoSolar = Math.round((cumulativeSpendNoSolar + billWithoutSolar) * 100) / 100;
    cumulativeSpendSolar = Math.round((cumulativeSpendSolar + totalDecaisse) * 100) / 100;
    cumulativeSavings = Math.round((cumulativeSavings + yearlyCashflow) * 100) / 100;

    details.push({
      year,
      edfBillWithoutSolar: billWithoutSolar,
      creditPayment: creditCostYearly,
      edfResidue: residuaryBill,
      totalWithSolar: totalDecaisse,
      cumulativeSavings,
      cumulativeSpendNoSolar,
      cumulativeSpendSolar,
      cashflowDiff: yearlyCashflow
    });

    // D. CASH SPECIFICS
    // Cashflow Cash = Bill residue - Resale Revenue (No Loan)
    const totalDecaisseCash = Math.round((residuaryBill - surplusRevenuePerYear) * 100) / 100;
    const yearlyCashflowCash = Math.round((billWithoutSolar - totalDecaisseCash) * 100) / 100;

    cumulativeSpendNoSolarCash = Math.round((cumulativeSpendNoSolarCash + billWithoutSolar) * 100) / 100;
    cumulativeSpendSolarCash = Math.round((cumulativeSpendSolarCash + totalDecaisseCash) * 100) / 100;
    cumulativeSavingsCash = Math.round((cumulativeSavingsCash + yearlyCashflowCash) * 100) / 100;

    detailsCash.push({
      year,
      edfBillWithoutSolar: billWithoutSolar,
      creditPayment: 0,
      edfResidue: residuaryBill,
      totalWithSolar: totalDecaisseCash,
      cumulativeSavings: cumulativeSavingsCash,
      cumulativeSpendNoSolar: cumulativeSpendNoSolarCash,
      cumulativeSpendSolar: cumulativeSpendSolarCash,
      cashflowDiff: yearlyCashflowCash
    });
  }

  // --- AGGREGATES ---
  const slicedDetails = details.slice(0, projectionYears);
  const slicedDetailsCash = detailsCash.slice(0, projectionYears);

  // Projections Credit
  const totalSavingsProjected = slicedDetails.length > 0 ? slicedDetails[slicedDetails.length - 1].cumulativeSavings : 0;
  const totalSpendNoSolar = slicedDetails.length > 0 ? slicedDetails[slicedDetails.length - 1].cumulativeSpendNoSolar : 0;
  const totalSpendSolar = slicedDetails.length > 0 ? slicedDetails[slicedDetails.length - 1].cumulativeSpendSolar : 0;
  const breakEvenYearIndex = details.findIndex(d => d.cumulativeSavings > 0);
  const breakEvenPoint = breakEvenYearIndex !== -1 ? breakEvenYearIndex + 1 : 30;

  // Projections Cash
  const totalSavingsProjectedCash = slicedDetailsCash.length > 0 ? slicedDetailsCash[slicedDetailsCash.length - 1].cumulativeSavings : 0;
  const totalSpendNoSolarCash = slicedDetailsCash.length > 0 ? slicedDetailsCash[slicedDetailsCash.length - 1].cumulativeSpendNoSolar : 0;
  const totalSpendSolarCash = slicedDetailsCash.length > 0 ? slicedDetailsCash[slicedDetailsCash.length - 1].cumulativeSpendSolar : 0;
  const breakEvenYearIndexCash = detailsCash.findIndex(d => d.cumulativeSavings > 0);
  const breakEvenPointCash = breakEvenYearIndexCash !== -1 ? breakEvenYearIndexCash + 1 : 30;

  // KPIs
  const year1 = details.length > 0 ? details[0] : { totalWithSolar: 0, edfBillWithoutSolar: 0, creditPayment: 0, edfResidue: 0, cumulativeSavings: 0, cumulativeSpendNoSolar: 0, cumulativeSpendSolar: 0, cashflowDiff: 0, year: startYear };
  
  const newMonthlyBillYear1 = Math.round((year1.totalWithSolar / 12) * 100) / 100;
  const oldMonthlyBillYear1 = Math.round((year1.edfBillWithoutSolar / 12) * 100) / 100;
  const monthlyEffortYear1 = Math.round((newMonthlyBillYear1 - oldMonthlyBillYear1) * 100) / 100;

  const averageYearlyGain = projectionYears > 0 ? Math.round((totalSavingsProjected / projectionYears) * 100) / 100 : 0;
  const averageYearlyGainCash = projectionYears > 0 ? Math.round((totalSavingsProjectedCash / projectionYears) * 100) / 100 : 0;

  // Cost of Inaction
  const costOfInactionPerSecond = Math.max(0.0001, averageYearlyGain / (365 * 24 * 3600));
  
  // ROI
  const effectiveCost = localInstallCost > 0 ? localInstallCost : 20000;
  const roiPercentage = effectiveCost > 0 
    ? Math.round(((totalSavingsProjected / projectionYears) / effectiveCost) * 1000) / 10
    : 0;
  const roiPercentageCash = effectiveCost > 0 
    ? Math.round(((totalSavingsProjectedCash / projectionYears) / effectiveCost) * 1000) / 10
    : 0;

  // Bank Equivalent (How much capital needed at 2.7% to match these gains)
  const bankEquivalentCapital = Math.round((averageYearlyGain / 0.027) * 100) / 100;
  const bankEquivalentCapitalCash = Math.round((averageYearlyGainCash / 0.027) * 100) / 100;

  // Next Year Loss
  const priceNextYear = electricityPrice * Math.pow(1 + localInflation / 100, 1);
  const lossIfWait1Year = Math.round(baseConsumptionKwh * priceNextYear * 100) / 100;
  const savingsLostIfWait1Year = Math.round(selfConsumedKwh * priceNextYear * 100) / 100;

  return {
    details,
    slicedDetails,
    detailsCash,
    slicedDetailsCash,
    
    totalSavingsProjected,
    totalSpendNoSolar,
    totalSpendSolar,
    
    totalSavingsProjectedCash,
    totalSpendNoSolarCash,
    totalSpendSolarCash,

    breakEvenPoint,
    breakEvenPointCash,

    costOfInactionPerSecond,
    averageYearlyGain,
    averageYearlyGainCash,

    newMonthlyBillYear1,
    oldMonthlyBillYear1,
    monthlyEffortYear1,

    roiPercentage,
    roiPercentageCash,
    
    bankEquivalentCapital,
    bankEquivalentCapitalCash,

    savingsRatePercent,
    baseConsumptionKwh,
    lossIfWait1Year,
    savingsLostIfWait1Year,
    surplusRevenuePerYear,
    year1
  };
};
