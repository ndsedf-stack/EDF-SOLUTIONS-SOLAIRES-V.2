import React, { useState } from 'react';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SimulationResult } from './types';

const DEFAULT_DATA: SimulationResult = {
  params: {
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
  },
  salesPitch: "Based on your high electricity bill and available roof space, a 6kWp installation could offset up to 70% of your energy needs immediately."
};

const App: React.FC = () => {
  const [simulationData, setSimulationData] = useState<SimulationResult>(DEFAULT_DATA);

  const handleReset = () => {
    setSimulationData({ ...DEFAULT_DATA });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ResultsDashboard 
        data={simulationData} 
        onReset={handleReset} 
      />
    </>
  );
};

export default App;