import { test, expect } from "@playwright/test";

// ✅ Ajout de la fonction manquante pour extraire les nombres du texte (ex: "1 200 €" -> 1200)
const extractNumber = (text: string): number | null => {
  const cleaned = text.replace(/[^0-9.,-]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

test("Loi des 20 ans : Certification de la trajectoire cumulative", async ({
  page,
}) => {
  // On attend que la page soit bien chargée
  await page.goto("/");

  const cumulativeModules = [
    "economies-cumulees",
    "bilan-patrimonial-20y",
    "valeur-immobiliere",
  ];

  for (const id of cumulativeModules) {
    // On cible les éléments via data-testid
    const dataPoints = page.locator(`[data-testid="${id}-point"]`);
    const count = await dataPoints.count();

    if (count > 0) {
      let previousValue = -Infinity;

      for (let i = 0; i < count; i++) {
        const text = await dataPoints.nth(i).innerText();
        const currentValue = extractNumber(text);

        if (currentValue !== null) {
          // ✅ Vérification de croissance (Loi des 20 ans)
          expect(
            currentValue,
            `Anomalie de trajectoire sur ${id} à l'année ${i} : ${currentValue} est inférieur à ${previousValue}`
          ).toBeGreaterThanOrEqual(previousValue);

          previousValue = currentValue;
        }
      }
    }
  }
});
