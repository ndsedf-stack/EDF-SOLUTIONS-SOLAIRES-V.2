import React, { useState } from "react";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { FileUpload } from "./components/FileUpload";
import { SimulationResult, SimulationParams } from "./types";

// SCENARIO "GOLDEN" VALIDÉ - VALEURS EXACTES
// Capital: 18799€
// Taux: 3.89%
// Durée: 180 mois
// Mensualité calculée: 138.01€ (avec formule PMT)
// Assurance: 4.70€ (0.3% de 18799 / 12)
const DEFAULT_PARAMS: SimulationParams = {
  inflationRate: 5,
  electricityPrice: 0.25,
  yearlyProduction: 7000,
  selfConsumptionRate: 70,
  installCost: 18799,
  creditMonthlyPayment: 138.01,
  insuranceMonthlyPayment: 4.7,
  creditDurationMonths: 180,
  cashApport: 0,
  remainingToFinance: 18799,
  currentAnnualBill: 2500,
  yearlyConsumption: 10000,
  creditInterestRate: 3.89,
  insuranceRate: 0.3,
};

const App: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationResult>({
    params: DEFAULT_PARAMS,
    salesPitch: "Analyse standard",
  });
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = (jsonText: string) => {
    setLoading(true);
    // Simulate a small delay for "Analysis" effect
    setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonText);
        const newParams: SimulationParams = {
          ...DEFAULT_PARAMS,
          ...parsed,
        };
        setSimulationData({
          params: newParams,
          salesPitch: "Analyse personnalisée",
        });
        setHasData(true);
      } catch (e) {
        console.error("Error parsing submission", e);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleFileSelect = (file: File) => {
    // For now, we'll just acknowledge the file but not process it deeply as the logic wasn't provided for Excel parsing in the prompt.
    // We can fallback to manual or mock it.
    alert(
      "L'import fichier est en cours de développement. Veuillez utiliser la saisie manuelle pour le moment."
    );
  };

  const handleReset = () => {
    setHasData(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-yellow-500 selection:text-black relative overflow-hidden">
      {/* Fixed Background Blur Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Noise Texture Overlay - 3% opacity */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      ></div>

      <div className="relative z-10">
        {!hasData ? (
          <div className="min-h-screen flex items-center justify-center">
            <FileUpload
              onFileSelect={handleFileSelect}
              onTextSubmit={handleTextSubmit}
              isLoading={loading}
            />
          </div>
        ) : (
          <ResultsDashboard data={simulationData} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default App;
