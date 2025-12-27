import { describe, it, expect } from "vitest";
import { validateAll } from "../../../src/validation/validateAll";

describe("Système de Certification - Tests de Robustesse", () => {
  it("doit valider un CalculationOutput conforme", () => {
    const validData = {
      // Données de base
      totalSavingsProjected: 1000,
      totalSavingsProjectedCash: 800,
      roiPercentage: 15,
      breakEvenPoint: 1,

      // Séries détaillées (pour validateTotals et validateCumulative)
      details: [{ cumulativeSavings: 500 }, { cumulativeSavings: 1000 }],
      detailsCash: [{ cumulativeSavings: 400 }, { cumulativeSavings: 800 }],

      // Séries graphiques (pour validateGraphs)
      // Elles doivent être présentes et contenir des nombres finis
      slicedDetails: [{ cumulativeSavings: 500 }, { cumulativeSavings: 1000 }],
      slicedDetailsCash: [
        { cumulativeSavings: 400 },
        { cumulativeSavings: 800 },
      ],
    };

    const report = validateAll(validData);

    // Diagnostic en cas d'échec : on affiche les erreurs pour debug
    if (!report.isValid) {
      console.log("Erreurs de validation détectées:", report.errors);
    }

    expect(report.isValid).toBe(true);
    expect(report.score).toBe(100);
    expect(report.errors).toHaveLength(0);
  });

  it("doit détecter une incohérence de total (Échec Totals)", () => {
    const corruptedData = {
      totalSavingsProjected: 5000, // Total annoncé faux
      details: [{ cumulativeSavings: 1000 }], // Dernier cumul réel = 1000
    };

    const report = validateAll(corruptedData);
    expect(report.isValid).toBe(false);
    expect(report.errors.some((e) => e.includes("totalSavingsProjected"))).toBe(
      true
    );
  });

  it("doit détecter une chute de rentabilité (Échec Monotonie)", () => {
    const sinkingData = {
      details: [
        { cumulativeSavings: 1000 },
        { cumulativeSavings: 800 }, // Impossible en cumulé
      ],
    };

    const report = validateAll(sinkingData);
    expect(report.isValid).toBe(false);
    expect(report.errors.some((e) => e.includes("Décroissance"))).toBe(true);
  });

  it("doit rester stable si les données sont partiellement manquantes", () => {
    const emptyData = {};
    const report = validateAll(emptyData);

    // Le système ne doit pas crash, il doit juste invalider
    expect(report.isValid).toBe(false);
    expect(typeof report.score).toBe("number");
  });
});
