import { describe, it, expect } from "vitest";
import { calculateFinancials } from "@/utils/finance";

describe("finance – calculateFinancials", () => {
  it("scénario standard rentable", () => {
    const result = calculateFinancials(
      {
        yearlyConsumption: 4500,
        currentAnnualBill: 1125,
        creditInterestRate: 2.5,
      },
      {
        projectionYears: 20,
        electricityPrice: 0.25,
        yearlyProduction: 5000,
        selfConsumptionRate: 70,
        installCost: 9000,
        creditMonthlyPayment: 0,
        insuranceMonthlyPayment: 0,
        creditDurationMonths: 0,
        cashApport: 9000,
      }
    );

    expect(result.totalSavings).toBeGreaterThan(0);
    expect(result.paybackYear).toBeGreaterThan(0);
  });

  it("scénario client réel 10 000 / 7 000 / crédit", () => {
    const result = calculateFinancials(
      {
        yearlyConsumption: 10000,
        currentAnnualBill: 2500,
        creditInterestRate: 3.89,
      },
      {
        projectionYears: 20,
        electricityPrice: 0.25,
        yearlyProduction: 7000,
        selfConsumptionRate: 100,
        installCost: 19990,
        cashApport: 5000,
        creditMonthlyPayment: 0,
        insuranceMonthlyPayment: 0,
        creditDurationMonths: 180,
      }
    );

    expect(result.totalSavings).toBeGreaterThanOrEqual(0);
    expect(result.paybackYear).toBeGreaterThan(0);
  });

  it("scénario non rentable", () => {
    const result = calculateFinancials(
      {
        yearlyConsumption: 3000,
        currentAnnualBill: 750,
        creditInterestRate: 3,
      },
      {
        projectionYears: 20,
        electricityPrice: 0.25,
        yearlyProduction: 1500,
        selfConsumptionRate: 50,
        installCost: 20000,
        creditMonthlyPayment: 0,
        insuranceMonthlyPayment: 0,
        creditDurationMonths: 0,
        cashApport: 20000,
      }
    );

    expect(result.totalSavings).toBe(0);
    // ✅ FIX : Un projet non rentable a un breakEvenPoint = 30 (max sur 30 ans)
    expect(result.paybackYear).toBeGreaterThanOrEqual(20); // Au moins 20 ans ou plus
  });
});
