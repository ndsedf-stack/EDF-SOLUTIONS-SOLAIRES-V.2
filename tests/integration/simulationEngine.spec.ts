import { describe, it, expect } from "vitest";
// On utilise l'import avec 4 niveaux qu'on a validé ensemble
import { calculateSolarProjection as runSimulation } from "../../src/utils/finance";

describe("simulation engine – stabilité", () => {
  it("ne retourne jamais NaN ou Infinity", () => {
    // 1. DÉFINITION DES VARIABLES (Ce qui manquait)
    const mockParams: any = {
      yearlyConsumption: 8000,
      currentAnnualBill: 2000,
      electricityPrice: 0.25,
      yearlyProduction: 7000,
      selfConsumptionRate: 70,
      installCost: 18799,
      creditInterestRate: 3.89,
      inflationRate: 5,
      creditMonthlyPayment: 147.8,
      insuranceMonthlyPayment: 4.7,
      creditDurationMonths: 180,
      cashAport: 0,
      remainingToFinance: 18799,
      taxRate: 0,
      buybackRate: 0.04,
      interestRate: 3.89,
      projectionYears: 20,
    };

    // 2. APPEL DE LA FONCTION (Avec les 2 arguments)
    const result = runSimulation(mockParams, mockParams);

    // 3. TESTS DE STABILITÉ (Les assertions)
    expect(Number.isFinite(result.totalSavingsProjected)).toBe(true);
    expect(Number.isFinite(result.averageYearlyGain)).toBe(true);
    expect(Number.isFinite(result.roiPercentageCash)).toBe(true);

    // Vérification des détails de la courbe
    expect(result.details.length).toBeGreaterThan(0);

    result.details.forEach((detail: any, i: number) => {
      expect(
        Number.isFinite(detail.cumulativeSavings),
        `NaN détecté année ${i}`
      ).toBe(true);
    });
  });
});
