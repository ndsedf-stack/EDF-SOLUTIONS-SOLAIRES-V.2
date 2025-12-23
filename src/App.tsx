import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { FileUpload } from "./components/FileUpload";
import { GuestView } from "./components/GuestView";

// Valeurs de secours pour éviter le NaN
const DEFAULT_PARAMS = {
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
  creditInterestRate: 4.45,
  insuranceRate: 0.3,
};

const MainApp: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);

  // --- MOTEUR DE CALCUL SÉCURISÉ ---
  const getComputedData = (params: any) => {
    const p = params || DEFAULT_PARAMS;

    // On force la conversion en nombre pour éviter le NaN€
    const bill =
      Number(p.currentAnnualBill) || DEFAULT_PARAMS.currentAnnualBill;
    const selfRate =
      Number(p.selfConsumptionRate) || DEFAULT_PARAMS.selfConsumptionRate;
    const loan =
      Number(p.creditMonthlyPayment) || DEFAULT_PARAMS.creditMonthlyPayment;
    const insurance =
      Number(p.insuranceMonthlyPayment) ||
      DEFAULT_PARAMS.insuranceMonthlyPayment;

    return {
      monthlyBill: bill / 12,
      projectedMonthlyLoan: loan + insurance,
      monthlySavings: (bill / 12) * (selfRate / 100),
      remainingBill: (bill / 12) * (1 - selfRate / 100),
      totalWithSolar: loan + insurance + (bill / 12) * (1 - selfRate / 100),
      totalCost20Years: bill * 33,
      totalCost40Years: bill * 120,
      totalSavings20Years: bill * 0.7 * 20,
      breakEvenYear: 8,
    };
  };

  const handleUploadSuccess = (rawData: any) => {
    const cleanParams = rawData?.params || rawData;
    setSimulationData({
      params: cleanParams,
      computed: getComputedData(cleanParams), // Si ça c'est vide, le coach affichera 0
      profile: "standard",
    });
    setHasData(true);
  };

  const handleProfileChange = (newProfile: string) => {
    const p = newProfile.toLowerCase().trim();

    // Utiliser une fonction de mise à jour (prev) garantit qu'on travaille
    // sur la version la plus fraîche de tes données de simulation.
    setSimulationData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: p,
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {!hasData ? (
        <FileUpload
          onTextSubmit={(jsonString: string) => {
            try {
              const data =
                typeof jsonString === "string"
                  ? JSON.parse(jsonString)
                  : jsonString;
              handleUploadSuccess(data);
            } catch (e) {
              handleUploadSuccess(jsonString);
            }
          }}
        />
      ) : (
        /* ON N'AFFICHE QUE LE DASHBOARD ICI */
        /* ResultsDashboard gère lui-même l'affichage du CoachRouter ou du SpeechView */
        <ResultsDashboard
          data={{
            ...simulationData,
            params: {
              ...simulationData.params,
              // On force le passage de la valeur 4.45
              interestRate:
                simulationData.params.interestRate ||
                simulationData.params.creditInterestRate ||
                4.45,
            },
          }}
          onReset={() => setHasData(false)}
          onProfileChange={handleProfileChange}
        />
      )}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/guest/:studyId" element={<GuestView />} />
    </Routes>
  </BrowserRouter>
);

export default App;
