import { describe, it, expect } from "vitest";
import { calculateFinancials } from "@/utils/finance";

describe("simulation engine – stabilité", () => {
  it("ne retourne jamais NaN ou Infinity", () => {
    const result = calculateFinancials(
      {
        yearlyConsumption: 8000,
        currentAnnualBill: 2000,
        creditInterestRate: 4,
      },
      {
        projectionYears: 25,
        electricityPrice: 0.3,
        yearlyProduction: 6000,
        selfConsumptionRate: 80,
        installCost: 18000,
        creditMonthlyPayment: 120,
        insuranceMonthlyPayment: 5,
        creditDurationMonths: 180,
        cashApport: 3000,
      }
    );

    expect(Number.isFinite(result.totalSavings)).toBe(true);
    expect(Number.isFinite(result.averageYearlyGain)).toBe(true);
    expect(result.details.length).toBeGreaterThan(0);
  });
});
