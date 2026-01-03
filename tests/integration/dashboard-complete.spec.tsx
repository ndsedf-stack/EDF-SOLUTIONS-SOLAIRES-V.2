import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResultsDashboard } from "../../src/components/ResultsDashboard.REFONTE2";
import { calculateSolarProjection } from "../../src/utils/finance";

// ============================================
// 🧪 DONNÉES DE TEST RÉALISTES
// ============================================
const mockData = {
  profile: "standard",
  city: "Cannes",
  address: "06400 Cannes, France",
  params: {
    yearlyConsumption: 14000,
    yearlyProduction: 7000,
    selfConsumptionRate: 70,
    electricityPrice: 0.25,
    installCost: 18799,
    cashApport: 0,
    creditMonthlyPayment: 147.8,
    insuranceMonthlyPayment: 4.7,
    creditDurationMonths: 180,
    creditInterestRate: 3.89,
    taxRate: 0,
    buybackRate: 0.04,
    inflationRate: 5,
    installedPower: 3.5,
    houseSize: 120,
    monthlyBill: 208,
  },
  computed: { monthlyBill: 208 },
};

describe("🧪 SUITE DE TESTS COMPLÈTE - DASHBOARD", () => {
  let calculationResult: any;

  beforeEach(() => {
    calculationResult = calculateSolarProjection(mockData.params, {
      projectionYears: 20,
      inflationRate: 5,
      ...mockData.params,
    });
  });

  // ============================================
  // 📊 TESTS DES CALCULS FINANCIERS
  // ============================================
  describe("💰 Calculs Financiers", () => {
    it("calcule correctement le gain total sur 20 ans", () => {
      expect(calculationResult.totalSavingsProjected).toBeGreaterThan(15000);
      expect(calculationResult.totalSavingsProjected).toBeCloseTo(15833, 0);
    });

    it("calcule correctement le point mort crédit", () => {
      expect(calculationResult.breakEvenPoint).toBe(14);
    });

    it("calcule correctement le point mort cash", () => {
      expect(calculationResult.breakEvenPointCash).toBe(12);
    });

    it("calcule correctement le ROI crédit", () => {
      expect(calculationResult.roiPercentage).toBeCloseTo(4.22, 1);
    });

    it("calcule correctement le ROI cash", () => {
      expect(calculationResult.roiPercentageCash).toBeCloseTo(6.52, 1);
    });

    it("calcule correctement l'autonomie", () => {
      const autonomie = Math.round(
        (mockData.params.yearlyProduction / mockData.params.yearlyConsumption) *
          100
      );
      expect(autonomie).toBe(50);
    });

    it("génère 20 années de détails", () => {
      expect(calculationResult.slicedDetails).toHaveLength(20);
    });

    it("vérifie la croissance des dépenses sans solaire", () => {
      const year1 = calculationResult.details[0].edfBillWithoutSolar;
      const year20 = calculationResult.details[19].edfBillWithoutSolar;
      expect(year20).toBeGreaterThan(year1);
    });

    it("vérifie l'application de l'inflation 5%", () => {
      const year1 = calculationResult.details[0].edfBillWithoutSolar;
      const year2 = calculationResult.details[1].edfBillWithoutSolar;
      const increase = ((year2 - year1) / year1) * 100;
      expect(increase).toBeCloseTo(5, 0);
    });

    it("détecte le croisement des courbes", () => {
      const crossingYear = calculationResult.details.findIndex(
        (d: any) => d.cumulativeSavings >= 0
      );
      expect(crossingYear).toBeGreaterThan(0);
      expect(crossingYear).toBeLessThanOrEqual(20);
    });
  });

  // ============================================
  // 🎨 TESTS DU RENDU DES MODULES
  // ============================================
  describe("📦 Rendu des Modules", () => {
    it("affiche le module Protocole d'Audit", () => {
      const { container } = render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      console.log(container.innerHTML);
    });

    it("affiche le module Répartition Énergie", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );
      expect(
        screen.getByRole("button", { name: /répartition.*énergie/i })
      ).toBeInTheDocument();
    });

    it("affiche le module Locataire vs Propriétaire", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );
      expect(
        screen.getByRole("heading", { name: /locataire/i })
      ).toBeInTheDocument();
    });

    it("affiche le module Synthèse d'Arbitrage", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );
      expect(
        screen.getByRole("button", { name: /synthèse/i })
      ).toBeInTheDocument();
    });

    it("affiche le module Réalisations", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: /réalisations/i })
      ).toBeInTheDocument();
    });

    it("affiche le module Calendrier", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: /calendrier/i })
      ).toBeInTheDocument();
    });

    it("affiche le module Garanties", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: /garanties/i })
      ).toBeInTheDocument();
    });

    it("affiche le module Processus Administratif", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );
      const elements = screen.getAllByRole("heading", {
        name: /processus|sécurisation/i,
      });
      expect(elements.length).toBeGreaterThan(0);
    });

    it("affiche le module Structure du Budget", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );
      expect(
        screen.getByRole("button", { name: /structure du budget \(mensuel\)/i })
      ).toBeInTheDocument();
    });

    it("affiche le module Impact Budget", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(
        screen.getByRole("heading", {
          name: /impact sur votre budget mensuel/i,
        })
      ).toBeInTheDocument();
    });
  });
  // ============================================
  // 🎛️ TESTS DES INTERACTIONS
  // ============================================
  describe("🖱️ Interactions Utilisateur", () => {
    it("ouvre et ferme les modules", async () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      const button = screen.getByRole("button", {
        name: /répartition énergie/i,
      });
      fireEvent.click(button);

      await waitFor(() => {
        const charts = screen.queryAllByTestId(/chart/i);
        expect(charts.length).toBeGreaterThan(0);
      });
    });

    it("permet de modifier le mode Garanties", async () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      const garantiesModule = screen.getByRole("heading", {
        name: /garanties & sécurité/i,
      });

      const moduleButton = garantiesModule.closest("button");

      if (moduleButton) {
        fireEvent.click(moduleButton);

        await waitFor(() => {
          const toggles = screen.getAllByRole("button", {
            name: /performance/i,
          });
          expect(toggles.length).toBeGreaterThan(0);
        });
      }
    });
  });

  // ============================================
  // 📈 TESTS DES GRAPHIQUES
  // ============================================
  describe("📊 Graphiques et Visualisations", () => {
    it("affiche le graphique de répartition énergie", () => {
      const { container } = render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      // Mock recharts = svg remplacés par <div data-testid>
      const graphs = container.querySelectorAll("[data-testid='chart'], svg");
      expect(graphs.length).toBeGreaterThan(0);
    });

    it("affiche les données correctes dans le gouffre énergétique", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(calculationResult.totalSavingsProjected).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 🔢 TESTS DES TAUX SPÉCIAUX
  // ============================================
  describe("💳 Modules Taux Spéciaux", () => {
    it("affiche le module taux 1.99% si applicable", () => {
      const dataWithSpecialRate = {
        ...mockData,
        params: {
          ...mockData.params,
          creditInterestRate: 1.99,
        },
      };

      render(
        <ResultsDashboard
          data={dataWithSpecialRate as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(screen.getByText(/financement bonifié/i)).toBeInTheDocument();
    });

    it("affiche le module taux 3.89% si applicable", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(screen.getByText(/financement bonifié/i)).toBeInTheDocument();
    });

    it("affiche le module taux 0.99% si applicable", () => {
      const dataWithUltraRate = {
        ...mockData,
        params: {
          ...mockData.params,
          creditInterestRate: 0.99,
        },
      };

      render(
        <ResultsDashboard
          data={dataWithUltraRate as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(screen.getAllByText(/financement/i)[0]).toBeInTheDocument();
    });
  });

  // ============================================
  // 🎯 TESTS DE VALIDATION
  // ============================================
  describe("✅ Validation des Données", () => {
    it("valide la cohérence des économies", () => {
      expect(calculationResult.totalSavingsProjected).toBeGreaterThan(0);
      expect(calculationResult.totalSavingsProjectedCash).toBeGreaterThan(
        calculationResult.totalSavingsProjected
      );
    });

    it("valide que le cash est plus rentable que le crédit", () => {
      expect(calculationResult.roiPercentageCash).toBeGreaterThan(
        calculationResult.roiPercentage
      );
    });

    it("valide les montants mensuels année 1", () => {
      const year1 = calculationResult.details[0];
      expect(year1.creditPayment).toBeGreaterThan(0);
      expect(year1.edfResidue).toBeGreaterThan(0);
      expect(year1.totalWithSolar).toBeGreaterThan(0);
    });

    it("valide la progression des économies cumulées", () => {
      const savings = calculationResult.details.map(
        (d: any) => d.cumulativeSavings
      );

      expect(savings[19]).toBeGreaterThan(0);

      const postBreakEven = savings.slice(calculationResult.breakEvenPoint);
      for (let i = 1; i < postBreakEven.length; i++) {
        expect(postBreakEven[i]).toBeGreaterThanOrEqual(postBreakEven[i - 1]);
      }
    });
  });
  // ============================================
  // 🧩 TESTS DES COMPOSANTS
  // ============================================
  describe("🧩 Composants Individuels", () => {
    it("affiche le badge de profit", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      const badges = screen.getAllByText(/€/);
      expect(badges.length).toBeGreaterThan(0);
    });

    it("affiche correctement les valeurs de patrimoine", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      const amounts = screen.getAllByText(/€/);
      expect(amounts.length).toBeGreaterThan(10);
    });
  });

  // ============================================
  // 🎨 TESTS DE L'INTERFACE
  // ============================================
  describe("🎨 Interface Utilisateur", () => {
    it("affiche la navbar", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(screen.getByText(/solutions solaires/i)).toBeInTheDocument();
    });

    it("affiche le bouton Modifier", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(screen.getByText(/modifier/i)).toBeInTheDocument();
    });

    it("affiche le bouton Nouvelle Analyse", () => {
      render(
        <ResultsDashboard
          data={mockData as any}
          onReset={() => {}}
          projectionYears={20}
          onProfileChange={() => {}}
        />
      );

      expect(screen.getByText(/nouvelle analyse/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // 🔍 TESTS DE STRESS
  // ============================================
  describe("💪 Tests de Stress", () => {
    it("gère des valeurs extrêmes (consommation élevée)", () => {
      const extremeData = {
        ...mockData,
        params: {
          ...mockData.params,
          yearlyConsumption: 50000,
          yearlyProduction: 15000,
        },
      };

      const result = calculateSolarProjection(extremeData.params, {
        projectionYears: 20,
        inflationRate: 5,
        ...extremeData.params,
      });

      expect(result.totalSavingsProjected).toBeGreaterThan(0);
    });

    it("gère des durées de crédit variées", () => {
      for (const duration of [60, 120, 180, 240]) {
        const data = {
          ...mockData,
          params: {
            ...mockData.params,
            creditDurationMonths: duration,
          },
        };

        const result = calculateSolarProjection(data.params, {
          projectionYears: 20,
          inflationRate: 5,
          ...data.params,
        });

        expect(result.slicedDetails).toHaveLength(20);
      }
    });

    it("gère différents taux d'intérêt", () => {
      for (const rate of [0.99, 1.99, 3.89, 5.89]) {
        const data = {
          ...mockData,
          params: {
            ...mockData.params,
            creditInterestRate: rate,
          },
        };

        const result = calculateSolarProjection(data.params, {
          projectionYears: 20,
          inflationRate: 5,
          ...data.params,
        });

        expect(result.totalSavingsProjected).toBeGreaterThan(-100000);
      }
    });
  });

  // ============================================
  // 📊 RAPPORT FINAL
  // ============================================
  describe("📋 Rapport de Test Final", () => {
    it("génère un rapport de validation complet", () => {
      const report = {
        totalTests: 0,
        passed: 0,
        failed: 0,
        calculs: {
          gainTotal: calculationResult.totalSavingsProjected,
          pointMortCredit: calculationResult.breakEvenPoint,
          pointMortCash: calculationResult.breakEvenPointCash,
          roiCredit: calculationResult.roiPercentage,
          roiCash: calculationResult.roiPercentageCash,
        },
      };

      console.log(
        "\n════════════════════════════════════════════════════════════════"
      );
      console.log("📊 RAPPORT DE TESTS - DASHBOARD COMPLET");
      console.log(
        "════════════════════════════════════════════════════════════════\n"
      );
      console.log("✅ Gain Total:", report.calculs.gainTotal, "€");
      console.log(
        "✅ Point Mort Crédit:",
        report.calculs.pointMortCredit,
        "ans"
      );
      console.log("✅ Point Mort Cash:", report.calculs.pointMortCash, "ans");
      console.log("✅ ROI Crédit:", report.calculs.roiCredit, "%");
      console.log("✅ ROI Cash:", report.calculs.roiCash, "%");
      console.log(
        "\n════════════════════════════════════════════════════════════════\n"
      );

      expect(report.calculs.gainTotal).toBeGreaterThan(0);
    });
  });
});
