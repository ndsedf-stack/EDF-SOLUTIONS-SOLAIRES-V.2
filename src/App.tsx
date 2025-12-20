import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { FileUpload } from "./components/FileUpload";
import { GuestView } from "./components/GuestView";
import { SimulationResult, SimulationParams } from "./types";

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

const MainApp: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationResult>({
    params: DEFAULT_PARAMS,
    salesPitch: "Analyse standard",
  });
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = (jsonText: string) => {
    setLoading(true);
    setTimeout(() => {
      try {
        const formData = JSON.parse(jsonText);
        const newParams: SimulationParams = {
          ...DEFAULT_PARAMS,
          inflationRate:
            parseFloat(formData.inflation) || DEFAULT_PARAMS.inflationRate,
          electricityPrice:
            parseFloat(formData.pricePerKwh) || DEFAULT_PARAMS.electricityPrice,
          yearlyProduction:
            parseFloat(formData.production) || DEFAULT_PARAMS.yearlyProduction,
          selfConsumptionRate:
            parseFloat(formData.selfConsumption) ||
            DEFAULT_PARAMS.selfConsumptionRate,
          installCost:
            parseFloat(formData.installPrice) || DEFAULT_PARAMS.installCost,
          creditMonthlyPayment:
            parseFloat(formData.creditMonthly) ||
            DEFAULT_PARAMS.creditMonthlyPayment,
          insuranceMonthlyPayment:
            parseFloat(formData.insuranceMonthly) ||
            DEFAULT_PARAMS.insuranceMonthlyPayment,
          creditDurationMonths:
            parseInt(formData.creditDuration) ||
            DEFAULT_PARAMS.creditDurationMonths,
          yearlyConsumption:
            parseFloat(formData.yearlyConsumption) ||
            DEFAULT_PARAMS.yearlyConsumption,
          creditInterestRate:
            parseFloat(formData.creditRate) ||
            DEFAULT_PARAMS.creditInterestRate,
          currentAnnualBill:
            parseFloat(formData.currentBillYear) ||
            DEFAULT_PARAMS.currentAnnualBill,
          remainingToFinance:
            parseFloat(formData.installPrice) || DEFAULT_PARAMS.installCost,
          clientName: formData.clientName || "Client",
        };

        setSimulationData({
          params: newParams,
          salesPitch: "Analyse personnalisée",
        });
        setHasData(true);
      } catch (e) {
        alert("Erreur lors de l'analyse.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setHasData(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10">
        {!hasData ? (
          <div className="min-h-screen flex items-center justify-center">
            <FileUpload
              onFileSelect={() => {}}
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

// --- COMPOSANT CLIENT CORRIGÉ ---
const ClientRoute = () => {
  const { encodedData } = useParams();
  const [data, setData] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (encodedData) {
      try {
        // Décodage sécurisé UTF-8 (Le miroir du bouton QR Code)
        const decoded = JSON.parse(
          decodeURIComponent(escape(atob(encodedData)))
        );
        setData(decoded);
        setIsValid(true);
      } catch (e) {
        try {
          // Fallback ancien format
          const decodedFallback = JSON.parse(atob(encodedData));
          setData(decodedFallback);
          setIsValid(true);
        } catch (err) {
          console.error("Lien mort");
          setIsValid(false);
        }
      }
    }
  }, [encodedData]);

  if (isValid === null) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-blue-500 font-black italic uppercase animate-pulse text-2xl">
        Vérification de l'accès...
      </div>
    );
  }

  if (isValid === false) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-red-500 font-black text-6xl mb-4 italic uppercase tracking-tighter text-center">
          Lien Invalide
        </h1>
        <p className="text-slate-500 text-lg max-w-md">
          Ce lien est expiré. Veuillez générer un nouveau QR Code.
        </p>
      </div>
    );
  }

  // On injecte enfin les données dans la vue client
  return <GuestView data={data} />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/guest/:encodedData" element={<ClientRoute />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
