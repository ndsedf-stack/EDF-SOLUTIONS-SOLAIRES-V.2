import { describe, it, expect } from "vitest"; // ✅ Fix: Importe les fonctions de test
import { calculateSolarProjection } from "../../../../src/utils/finance";

describe("simulation engine – stabilité", () => {
  it("ne retourne jamais NaN ou Infinity", () => {
    // On crée un objet de paramètres complet pour satisfaire TypeScript
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
    };

    // On appelle la fonction avec 'as any' pour éviter les erreurs de type strict
    const result = calculateSolarProjection(mockParams, mockParams);

    // ✅ Tests de stabilité
    expect(Number.isFinite(result.totalSavingsProjected)).toBe(true);
    expect(Number.isFinite(result.averageYearlyGain)).toBe(true);
    expect(Number.isFinite(result.roiPercentageCash)).toBe(true);
    expect(result.details.length).toBeGreaterThan(0);

    // ✅ Test anti-NaN sur tous les points de la courbe
    result.details.forEach((detail: any, i: number) => {
      expect(
        Number.isFinite(detail.cumulativeSavings),
        `NaN détecté année ${i}`
      ).toBe(true);
    });
  });
});
