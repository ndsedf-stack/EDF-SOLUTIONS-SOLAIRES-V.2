import { CalculationOutput, SimulationParams, YearlyDetail } from "../types";

// ============================================================================
// HELPERS
// ============================================================================
const round2 = (num: number): number => Math.round(num * 100) / 100;

export const safeParseFloat = (val: any, defaultVal: number = 0): number => {
  if (val === undefined || val === null || val === "") return defaultVal;
  const str = String(val).replace(",", ".").replace(/\s/g, "");
  const parsed = parseFloat(str);
  return isNaN(parsed) ? defaultVal : parsed;
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const validateMonthlyVsAnnual = (
  monthly: number, 
  annual: number,
  tolerance: number = 0.5 // Increased tolerance for rounding
): boolean => {
  const calculatedAnnual = monthly * 12;
  return Math.abs(calculatedAnnual - annual) < tolerance;
};

export const getAnnualFromMonthly = (monthly: number): number => {
  return parseFloat((monthly * 12).toFixed(2));
};

// ============================================================================
// 🔥 AJOUTER CETTE FONCTION ICI — extraction ville
// ============================================================================
export const extractCity = (fullAddress: string): string | null => {
  if (!fullAddress) return null;

  // Si l'adresse a une virgule → ex: "12 rue du Soleil, Nice"
  const commaSplit = fullAddress.split(",");
  if (commaSplit.length > 1) {
    return commaSplit[commaSplit.length - 1].trim().toUpperCase();
  }

  // Fallback → dernier mot seulement
  const parts = fullAddress.trim().split(" ");
  return parts.length > 0 ? parts[parts.length - 1].toUpperCase() : null;
};

// ============================================================================
// MOTEUR PRINCIPAL
// ============================================================================

export const calculateSolarProjection = (
  params: SimulationParams,
  overrides: {
    inflationRate?: number;
    projectionYears: number;
    electricityPrice: number;
    yearlyProduction: number;
    selfConsumptionRate: number;
    installCost: number;
    cashApport: number;
    remainingToFinance?: number;
    creditMonthlyPayment: number;
    insuranceMonthlyPayment: number;
    creditDurationMonths: number;
    taxRate?: number;
    buybackRate?: number;
    interestRate?: number;
    primeAmount?: number;
  }
): CalculationOutput => {
  const currentAnnualBill = safeParseFloat(params.currentAnnualBill, 0);
  const yearlyConsumption = safeParseFloat(params.yearlyConsumption, 0);

  const {
    inflationRate = 5,
    projectionYears = 20,
    electricityPrice = 0.25,
    yearlyProduction = 7000,
    selfConsumptionRate = 70,
    installCost = 18799,
    creditMonthlyPayment = 0,
    insuranceMonthlyPayment = 0,
    creditDurationMonths = 0,
    buybackRate = 0.04,
    cashApport = 0,
    interestRate: overrideInterestRate,
    primeAmount = 0,
  } = overrides;

  const localInflation = round2(inflationRate);
  const localInstallCost = round2(installCost);

  // --------------------------------------------------------------------------
  // CONSOMMATION & PRODUCTION
  // --------------------------------------------------------------------------

  const baseConsumptionKwh =
    yearlyConsumption > 0
      ? yearlyConsumption
      : electricityPrice > 0
      ? currentAnnualBill / electricityPrice
      : 0;

  const selfConsumedKwh = round2(
    yearlyProduction * (selfConsumptionRate / 100)
  );
  const surplusKwh = round2(yearlyProduction - selfConsumedKwh);
  const surplusRevenueBase = round2(surplusKwh * buybackRate);

  const savingsRatePercent =
    baseConsumptionKwh > 0
      ? round2((selfConsumedKwh / baseConsumptionKwh) * 100)
      : 0;

  // --------------------------------------------------------------------------
  // BOUCLE ANNUELLE
  // --------------------------------------------------------------------------

  const now = new Date();
  const startYear =
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();

  let cumulativeNoSolar = 0;
  let cumulativeSolar = cashApport;
  let cumulativeNoSolarCash = 0;
  let cumulativeSolarCash = localInstallCost;

  const details: YearlyDetail[] = [];
  const detailsCash: YearlyDetail[] = [];

  // ✅ AJOUTER ANNÉE 0 (investissement initial) SI apport > 0
  if (cashApport > 0) {
    details.push({
      year: startYear,
      edfBillWithoutSolar: 0,
      creditPayment: 0,
      edfResidue: 0,
      totalWithSolar: 0,
      cumulativeSavings: -cashApport,
      cumulativeSpendNoSolar: 0,
      cumulativeSpendSolar: cashApport,
      cashflowDiff: -cashApport,
      solarSavingsValue: 0,
    });
  }

  // ✅ AJOUTER ANNÉE 0 pour le mode CASH (investissement complet)
  detailsCash.push({
    year: startYear,
    edfBillWithoutSolar: 0,
    creditPayment: 0,
    edfResidue: 0,
    totalWithSolar: 0,
    cumulativeSavings: -localInstallCost,
    cumulativeSpendNoSolar: 0,
    cumulativeSpendSolar: localInstallCost,
    cashflowDiff: -localInstallCost,
    solarSavingsValue: 0,
  });

  for (let i = 0; i < 30; i++) {
    const year = startYear + i;
    const inflationCoef = Math.pow(1 + localInflation / 100, i);
    const price = electricityPrice * inflationCoef;
    const surplusRevenue = round2(surplusRevenueBase * inflationCoef);

    const billWithoutSolar = round2(baseConsumptionKwh * price);
    const savingsValue = round2(selfConsumedKwh * price);
    const residuaryBill = Math.max(0, billWithoutSolar - savingsValue);

    const monthsStart = i * 12;
    const monthsEnd = (i + 1) * 12;
    const monthsActive = Math.max(
      0,
      Math.min(monthsEnd, creditDurationMonths) - Math.max(monthsStart, 0)
    );

    const creditCost =
      monthsActive > 0
        ? round2(
            (creditMonthlyPayment + insuranceMonthlyPayment) * monthsActive
          )
        : 0;

    // --- PRIME (payée dans 12 mois = année 1) ---
    const primeReceived = i === 0 ? round2(primeAmount || 0) : 0;

    // --- CREDIT ---
    const totalWithSolar = round2(residuaryBill + creditCost - surplusRevenue - primeReceived);

    cumulativeNoSolar += billWithoutSolar;
    cumulativeSolar += totalWithSolar;

    details.push({
      year,
      edfBillWithoutSolar: billWithoutSolar,
      creditPayment: creditCost,
      edfResidue: residuaryBill,
      prime: primeReceived,
      totalWithSolar,
      cumulativeSavings: round2(cumulativeNoSolar - cumulativeSolar),
      cumulativeSpendNoSolar: round2(cumulativeNoSolar),
      cumulativeSpendSolar: round2(cumulativeSolar),
      cashflowDiff: round2(billWithoutSolar - totalWithSolar),
      solarSavingsValue: round2(savingsValue + surplusRevenue + primeReceived),
    });

    // --- CASH ---
    const totalWithSolarCash = round2(residuaryBill - surplusRevenue - primeReceived);

    cumulativeNoSolarCash += billWithoutSolar;
    cumulativeSolarCash += totalWithSolarCash;

    detailsCash.push({
      year,
      edfBillWithoutSolar: billWithoutSolar,
      creditPayment: 0,
      edfResidue: residuaryBill,
      prime: primeReceived,
      totalWithSolar: totalWithSolarCash,
      cumulativeSavings: round2(cumulativeNoSolarCash - cumulativeSolarCash),
      cumulativeSpendNoSolar: round2(cumulativeNoSolarCash),
      cumulativeSpendSolar: round2(cumulativeSolarCash),
      cashflowDiff: round2(billWithoutSolar - totalWithSolarCash),
      solarSavingsValue: round2(savingsValue + surplusRevenue + primeReceived),
    });
  }

  // --------------------------------------------------------------------------
  // KPI FINALS
  // --------------------------------------------------------------------------

  const hasYear0Financing = details.length > 0 && details[0].edfBillWithoutSolar === 0;
  const hasYear0Cash = detailsCash.length > 0 && detailsCash[0].edfBillWithoutSolar === 0;

  const slicedDetails = details.slice(0, (hasYear0Financing ? 1 : 0) + projectionYears);
  const slicedDetailsCash = detailsCash.slice(0, (hasYear0Cash ? 1 : 0) + projectionYears);

  const totalSavingsProjected = slicedDetails.at(-1)?.cumulativeSavings ?? 0;
  const totalSavingsProjectedCash =
    slicedDetailsCash.at(-1)?.cumulativeSavings ?? 0;

  const operationalDetails = details.filter((d) => d.edfBillWithoutSolar > 0);
  const operationalDetailsCash = detailsCash.filter((d) => d.edfBillWithoutSolar > 0);

  const breakEvenIndex = operationalDetails.findIndex((d) => d.cumulativeSavings > 0);
  const breakEvenPoint = breakEvenIndex === -1 ? 30 : breakEvenIndex + 1;

  const breakEvenIndexCash = operationalDetailsCash.findIndex(
    (d) => d.cumulativeSavings > 0
  );
  const breakEvenPointCash =
    breakEvenIndexCash === -1 ? projectionYears : breakEvenIndexCash + 1;

  // ✅ Année 1 opérationnelle (avec facturation et production solaire)
  const year1 = operationalDetails[0] || details[0];
  const year1Cash = operationalDetailsCash[0] || detailsCash[0];

  return {
    details,
    slicedDetails,
    detailsCash,
    slicedDetailsCash,

    totalSavingsProjected,
    totalSavings: Math.max(0, totalSavingsProjected),

    totalSpendNoSolar: slicedDetails.at(-1)?.cumulativeSpendNoSolar ?? 0,
    totalSpendSolar: slicedDetails.at(-1)?.cumulativeSpendSolar ?? 0,

    totalSavingsProjectedCash,
    totalSpendNoSolarCash:
      slicedDetailsCash.at(-1)?.cumulativeSpendNoSolar ?? 0,
    totalSpendSolarCash: slicedDetailsCash.at(-1)?.cumulativeSpendSolar ?? 0,

    breakEvenPoint,
    breakEvenPointCash,
    paybackYear: Math.max(0, breakEvenPoint),

    costOfInactionPerSecond: Math.max(
      0.0001,
      totalSavingsProjected / projectionYears / (365 * 24 * 3600)
    ),

    averageYearlyGain: round2(
      Math.max(0, totalSavingsProjected / projectionYears)
    ),
    averageYearlyGainCash: round2(
      Math.max(0, totalSavingsProjectedCash / projectionYears)
    ),

    newMonthlyBillYear1: round2((year1.creditPayment + year1.edfResidue) / 12),
    oldMonthlyBillYear1: round2(year1.edfBillWithoutSolar / 12),
    monthlyEffortYear1: round2(
      (year1.creditPayment + year1.edfResidue) / 12 -
        year1.edfBillWithoutSolar / 12
    ),

    newMonthlyBillYear1Cash: round2(year1Cash.edfResidue / 12),
    oldMonthlyBillYear1Cash: round2(year1Cash.edfBillWithoutSolar / 12),
    monthlyEffortYear1Cash: round2(
      year1Cash.edfResidue / 12 - year1Cash.edfBillWithoutSolar / 12
    ),

    year1,
    year1Cash,

    roiPercentage:
      localInstallCost > 0
        ? round2(
            Math.max(
              0,
              (totalSavingsProjected / projectionYears / localInstallCost) * 100
            )
          )
        : 0,

    roiPercentageCash:
      localInstallCost > 0
        ? round2(
            Math.max(
              0,
              (totalSavingsProjectedCash / projectionYears / localInstallCost) *
                100
            )
          )
        : 0,

    bankEquivalentCapital: round2(
      Math.max(0, totalSavingsProjected / projectionYears / 0.017)
    ),
    bankEquivalentCapitalCash: round2(
      Math.max(0, totalSavingsProjectedCash / projectionYears / 0.017)
    ),

    savingsRatePercent,
    baseConsumptionKwh,
    lossIfWait1Year: round2(baseConsumptionKwh * electricityPrice),
    savingsLostIfWait1Year: round2(selfConsumedKwh * electricityPrice),
    surplusRevenuePerYear: surplusRevenueBase,
    interestRate:
      overrideInterestRate ?? safeParseFloat(params.creditInterestRate || 0),
    primeAmount,
  };
};

// Alias compat
export const calculateFinancials = calculateSolarProjection;

export const printSimpleReport = (_: CalculationOutput) => {};
