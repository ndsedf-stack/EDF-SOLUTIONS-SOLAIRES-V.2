import { test, expect } from "@playwright/test";

test("ResultsDashboard affiche les valeurs issues du moteur", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByTestId("net-gain-20y")).toBeVisible();
  await expect(page.getByTestId("solar-scenario-total-20y")).toBeVisible();

  const netGain = await page.getByTestId("net-gain-20y").textContent();
  const solarTotal = await page
    .getByTestId("solar-scenario-total-20y")
    .textContent();

  expect(Number(netGain?.replace(/[^\d]/g, ""))).toBeGreaterThan(0);
  expect(Number(solarTotal?.replace(/[^\d]/g, ""))).toBeGreaterThan(0);
});
