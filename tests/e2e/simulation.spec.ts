import { test, expect } from "@playwright/test";
import { validateAll } from "../../src/validation/validateAll"; // Import direct du moteur

test.describe("Simulation – Certification Totale", () => {
  test("Le Dashboard passe la certification de cohérence financière", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/simulation");

    // 1️⃣ Extraire la donnée brute de la mémoire du navigateur
    const simulationData = await page.evaluate(() => {
      return (window as any).__SIMULATION_RESULT__;
    });

    // 2️⃣ Exécuter le moteur de certification sur ces données réelles
    const report = validateAll(simulationData);

    // 3️⃣ Assertion de certification
    if (!report.isValid) {
      console.error("❌ ÉCHEC DE CERTIFICATION DANS L'UI :", report.errors);
    }

    expect(report.isValid).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(90); // Seuil de confiance élevé
  });

  test("Vérité utilisateur : UI vs Calcul", async ({ page }) => {
    await page.goto("http://localhost:3000/simulation");

    const periods = [10, 15, 20, 25];
    for (const years of periods) {
      const text = await page
        .locator(`[data-testid="gain-${years}"]`)
        .innerText();
      const uiValue = Number(text.replace(/[^\d-]/g, ""));

      const calcValue = await page.evaluate((y) => {
        return Math.round(
          (window as any).__SIMULATION_RESULT__.details[y - 1].cumulativeSavings
        );
      }, years);

      expect(uiValue).toBe(calcValue);
    }
  });
});
