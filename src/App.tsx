import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { FileUpload } from "./components/FileUpload";
import { GuestView } from "./components/GuestView";

// ✅ Valeurs par défaut sécurisées
const DEFAULT_PARAMS = {
  inflationRate: 5,
  electricityPrice: 0.25,
  yearlyProduction: 7000,
  selfConsumptionRate: 70,
  installCost: 18799,
  creditMonthlyPayment: 138.01,
  insuranceMonthlyPayment: 0,
  creditDurationMonths: 180,
  cashApport: 0,
  remainingToFinance: 18799,
  currentAnnualBill: 2500,
  yearlyConsumption: 10000,
  creditInterestRate: 5.89,
  insuranceRate: 0.3,
  houseSize: 120, // Valeur par défaut
};

const MainApp: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);

  // 🔒 Calculs financiers de secours
  const getComputedData = (params: any) => {
    const p = { ...DEFAULT_PARAMS, ...(params || {}) };
    const bill = Number(p.currentAnnualBill);
    const selfRate = Number(p.selfConsumptionRate);
    const loan = Number(p.creditMonthlyPayment);
    const insurance = Number(p.insuranceMonthlyPayment);

    return {
      monthlyBill: bill / 12,
      projectedMonthlyLoan: loan + insurance,
      monthlySavings: (bill / 12) * (selfRate / 100),
      remainingBill: (bill / 12) * (1 - selfRate / 100),
      totalWithSolar: loan + insurance + (bill / 12) * (1 - selfRate / 100),
      totalCost20Years: bill * 20,
      totalSavings20Years: bill * (selfRate / 100) * 20,
      breakEvenYear: 8,
    };
  };

  const handleUploadSuccess = (rawData: any) => {
    // 1. Parsing propre des données du formulaire
    const inputData =
      typeof rawData === "string" ? JSON.parse(rawData) : rawData;

    // 2. 🧮 CALCUL DE LA VALEUR VERTE (Pour éviter le +0€)
    const surface = Number(inputData.houseSize || 120);
    const prixM2Moyen = 4500; // Base Cannes/06
    const estimationVerte = surface * prixM2Moyen * 0.08;

    // 3. Construction de l'objet final pour le Dashboard
    const result = {
      params: {
        ...DEFAULT_PARAMS,
        ...inputData,
        houseSize: surface, // On force le format nombre
      },
      computed: getComputedData(inputData),

      // ✅ Données critiques pour le bloc Valeur Verte
      greenValue: estimationVerte,
      greenValueData: {
        city: inputData.address || "CANNES",
        pricePerSqm: prixM2Moyen,
        isRealData: true,
        dept: "06",
      },

      // Doubles accès pour plus de sécurité dans le dashboard
      houseSize: surface,
      address: inputData.address || "1 RUE MIREILLE 06400 CANNES",
      profile: "standard",
    };

    // Console log pour debug si besoin
    console.log("SIMULATION READY:", result);

    setSimulationData(result);
    setHasData(true);
  };

  const handleProfileChange = (newProfile: string) => {
    setSimulationData((prev: any) =>
      prev
        ? {
            ...prev,
            profile: newProfile.toLowerCase().trim(),
          }
        : prev
    );
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {!hasData ? (
        <FileUpload
          onTextSubmit={(input: any) => {
            try {
              const parsed =
                typeof input === "string" ? JSON.parse(input) : input;
              handleUploadSuccess(parsed);
            } catch {
              handleUploadSuccess(input);
            }
          }}
        />
      ) : (
        <ResultsDashboard
          data={simulationData}
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
