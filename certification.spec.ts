test("Loi des 20 ans : Certification de la trajectoire cumulative", async ({
  page,
}) => {
  await page.goto("/");

  // Les modules qui doivent obligatoirement être croissants (Loi des 20 ans)
  const cumulativeModules = [
    "economies-cumulees",
    "bilan-patrimonial-20y",
    "valeur-immobiliere",
  ];

  for (const id of cumulativeModules) {
    // 1. On récupère toutes les valeurs de la série (via les tooltips ou les points du graph)
    // Ici, on part du principe que tu as une série de données accessible ou des data-points
    const dataPoints = page.locator(`[data-testid="${id}-point"]`);
    const count = await dataPoints.count();

    if (count > 0) {
      let previousValue = -Infinity;

      for (let i = 0; i < count; i++) {
        const text = await dataPoints.nth(i).innerText();
        const currentValue = extractNumber(text);

        if (currentValue !== null) {
          // CERTIFICATION : La valeur de l'année N ne peut pas être < Année N-1
          expect(
            currentValue,
            `Anomalie de trajectoire sur ${id} à l'année ${i}`
          ).toBeGreaterThanOrEqual(previousValue);

          previousValue = currentValue;
        }
      }
    }
  }
});
