import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Ajusté selon ton arborescence (tests-playwright et non tests-e2e)
  testDir: "./tests-playwright",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  /* Serveur local automatique pour les tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
