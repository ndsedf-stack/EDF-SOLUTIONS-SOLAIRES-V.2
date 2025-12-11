import React, { useState } from 'react';
import { ResultsDashboard } from './components/ResultsDashboard';
import { FileUpload } from './components/FileUpload';
import { SimulationResult, SimulationParams } from './types';

const DEFAULT_PARAMS: SimulationParams = {
    inflationRate: 5,
    electricityPrice: 0.25,
    yearlyProduction: 4500,
    selfConsumptionRate: 70,
    installCost: 20000,
    creditMonthlyPayment: 0,
    insuranceMonthlyPayment: 0,
    creditDurationMonths: 180,
    cashApport: 0,
    remainingToFinance: 20000,
    currentAnnualBill: 2500,
    yearlyConsumption: 10000
};

const App: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationResult>({
    params: DEFAULT_PARAMS,
    salesPitch: "Analyse standard"
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
                ...parsed
            };
            setSimulationData({
                params: newParams,
                salesPitch: "Analyse personnalisée"
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
      alert("L'import fichier est en cours de développement. Veuillez utiliser la saisie manuelle pour le moment.");
  };

  const handleReset = () => {
    setHasData(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {!hasData ? (
          <div className="min-h-screen bg-[#020202] flex items-center justify-center">
            <FileUpload 
                onFileSelect={handleFileSelect} 
                onTextSubmit={handleTextSubmit} 
                isLoading={loading}
            />
          </div>
      ) : (
          <ResultsDashboard 
            data={simulationData} 
            onReset={handleReset} 
          />
      )}
    </>
  );
};

export default App;
