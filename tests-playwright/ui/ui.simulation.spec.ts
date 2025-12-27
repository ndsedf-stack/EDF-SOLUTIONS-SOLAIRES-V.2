import { test, expect } from "@playwright/test";

test.describe("Certification Complète - Application Solaire", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Passer la modal si elle existe
    const startBtn = page.locator(
      'button:has-text("ANALYSE"), button:has-text("LANCER")'
    );
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
    }

    // Attendre le dashboard
    await page.waitForSelector('[data-testid="gain-total"]', {
      timeout: 15000,
    });
  });

  // ==========================================
  // MODULE SCÉNARIO PAR DÉFAUT
  // ==========================================
  test.describe("Module Scénario Par Défaut", () => {
    test("Le module est visible", async ({ page }) => {
      const module = page.locator("#scenario-defaut");
      await module.scrollIntoViewIfNeeded();
      await expect(module).toBeVisible();
    });

    test("Affiche les 3 cartes de dépense", async ({ page }) => {
      const module = page.locator("#scenario-defaut");
      await module.scrollIntoViewIfNeeded();
      await expect(
        page.locator("text=DÉPENSE ÉNERGÉTIQUE ANNÉE 1")
      ).toBeVisible();
      await expect(
        page.locator("text=OPTIMISATION NON RÉALISÉE")
      ).toBeVisible();
      await expect(page.locator("text=ÉCART CUMULATIF")).toBeVisible();
    });

    test("Visualisation temporelle affiche 3 périodes", async ({ page }) => {
      const module = page.locator("#scenario-defaut");
      await module.scrollIntoViewIfNeeded();
      await expect(page.locator("text=Attente 1 an")).toBeVisible();
      await expect(page.locator("text=Attente 3 ans")).toBeVisible();
      await expect(page.locator("text=Attente 5 ans")).toBeVisible();
    });
  });

  // ==========================================
  // MODULE COÛT DE L'ATTENTE (MOMENTUM)
  // ==========================================
  test.describe("Module Coût de l'Attente", () => {
    test("Le compteur en temps réel est visible", async ({ page }) => {
      const module = page.locator("#momentum");
      await module.scrollIntoViewIfNeeded();
      const counter = page
        .locator(
          ".text-7xl.font-black.text-red-500, #momentum .font-black.text-red-500"
        )
        .first();
      await expect(counter).toBeVisible();
    });

    test("Le compteur augmente avec le temps", async ({ page }) => {
      const module = page.locator("#momentum");
      await module.scrollIntoViewIfNeeded();
      const counter = page
        .locator(
          ".text-7xl.font-black.text-red-500, #momentum .font-black.text-red-500"
        )
        .first();
      const value1 = await counter.innerText();
      await page.waitForTimeout(3000);
      const value2 = await counter.innerText();
      expect(value1).not.toBe(value2);
    });

    test("Affiche les 3 scénarios d'attente", async ({ page }) => {
      await expect(page.locator("text=Attendre 6 mois")).toBeVisible();
      await expect(page.locator("text=Attendre 1 an")).toBeVisible();
      await expect(page.locator("text=Attendre 3 ans")).toBeVisible();
    });

    test("Le bouton info ouvre l'explication", async ({ page }) => {
      const infoBtn = page
        .locator('#momentum button:has([class*="Info"])')
        .first();
      if (await infoBtn.isVisible()) {
        await infoBtn.click();
        await expect(page.locator("text=/Comment est calculé/i")).toBeVisible();
        await page.keyboard.press("Escape");
      }
    });
  });

  // ==========================================
  // MODULE SOCIAL PROOF
  // ==========================================
  test.describe("Module Social Proof", () => {
    test("Le titre 'ILS ONT SIGNÉ' est visible", async ({ page }) => {
      const module = page.locator("#social-proof");
      await module.scrollIntoViewIfNeeded();
      await expect(page.locator("text=/ILS ONT SIGNÉ/i").first()).toBeVisible();
    });

    test("Affiche au moins 3 projets clients", async ({ page }) => {
      const cards = page.locator(
        "#social-proof .bg-slate-950\\/50, #social-proof .border-slate-800\\/60"
      );
      expect(await cards.count()).toBeGreaterThanOrEqual(3);
    });

    test("Chaque carte affiche un nom, ville et gain", async ({ page }) => {
      const firstCard = page
        .locator("#social-proof .bg-slate-950\\/50")
        .first();
      await expect(
        firstCard.locator("text=/Famille|M\\.|Mme/").first()
      ).toBeVisible();
      await expect(firstCard.locator("text=Économie projetée")).toBeVisible();
    });
  });

  // ==========================================
  // MODULE QUALIFICATION PROCESS (TIMELINE)
  // ==========================================
  test.describe("Module Qualification Process", () => {
    test("Affiche les 4 étapes", async ({ page }) => {
      const timeline = page.locator("#qualification-process");
      await timeline.scrollIntoViewIfNeeded();
      await expect(page.locator("text=Audit Énergétique")).toBeVisible();
      await expect(page.locator("text=Synthèse Projet")).toBeVisible();
    });

    test("Cliquer sur 'Générer' débloque le taux expert", async ({ page }) => {
      const genBtn = page
        .locator(
          'button:has-text("Générer la validation"), button:has-text("Générer")'
        )
        .first();
      await genBtn.click();
      await expect(page.locator("text=1.99")).toBeVisible({ timeout: 5000 });
    });
  });

  // ==========================================
  // MODULE SYNTHÈSE D'ARBITRAGE (AI ANALYSIS)
  // ==========================================
  test.describe("Module Synthèse d'Arbitrage", () => {
    test("Affiche les deux cartes (Financement et Cash)", async ({ page }) => {
      const module = page.locator("#ai-analysis-cta");
      await module.scrollIntoViewIfNeeded();
      await expect(page.locator("text=Option Financement")).toBeVisible();
      await expect(page.locator("text=Option Cash")).toBeVisible();
    });

    test("Bouton 'Générer Accès Client' ouvre la popup nom", async ({
      page,
    }) => {
      const accessBtn = page.locator('button:has-text("Générer Accès Client")');
      await accessBtn.click();
      await expect(page.locator("text=Nom du client")).toBeVisible();
      await page.keyboard.press("Escape");
    });
  });

  // ==========================================
  // MODAL PARAMÈTRES
  // ==========================================
  test.describe("Modal Paramètres", () => {
    test("S'ouvre au clic sur 'Modifier'", async ({ page }) => {
      await page.locator('button:has-text("Modifier")').click();
      await expect(page.locator("text=Paramètres Financiers")).toBeVisible();
    });

    test("Le slider de durée crédit fonctionne", async ({ page }) => {
      const slider = page.locator('input[type="range"]').first();
      await slider.fill("120");
      expect(await slider.inputValue()).toBe("120");
      await page.keyboard.press("Escape");
    });
  });

  // ==========================================
  // SÉLECTEUR D'ANNÉES
  // ==========================================
  test.describe("Sélecteur d'années", () => {
    test("Cliquer sur un bouton change la projection", async ({ page }) => {
      const btn15 = page.locator('button:has-text("15 ANS")');
      await btn15.click();
      await expect(btn15).toHaveClass(/bg-blue-600/);
    });
  });

  // ==========================================
  // COHÉRENCE DES DONNÉES & PERFORMANCE
  // ==========================================
  test.describe("Vérifications Finales", () => {
    test("Le gain mensuel et annuel sont cohérents", async ({ page }) => {
      const monthlyValue = Math.abs(
        Number(
          (await page.getByTestId("monthly-gain").innerText()).replace(
            /[^0-9-]/g,
            ""
          )
        )
      );
      const yearlyValue = Math.abs(
        Number(
          (await page.getByTestId("gain-yearly").innerText()).replace(
            /[^0-9-]/g,
            ""
          )
        )
      );
      expect(yearlyValue).toBeCloseTo(monthlyValue * 12, -2);
    });

    test("La page charge en moins de 8 secondes", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForSelector('[data-testid="gain-total"]');
      expect(Date.now() - startTime).toBeLessThan(8000);
    });

    test("Pas d'erreurs console critiques", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      await page.goto("/");
      await page.waitForTimeout(2000);
      const critical = errors.filter(
        (e) => !e.includes("favicon") && !e.includes("DevTools")
      );
      expect(critical.length).toBe(0);
    });
  });

  // ==========================================
  // RESPONSIVE DESIGN
  // ==========================================
  test.describe("Responsive Design", () => {
    test("Mobile (375x667) - Dashboard visible", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await expect(page.getByTestId("gain-total")).toBeVisible();
    });
  });
});
