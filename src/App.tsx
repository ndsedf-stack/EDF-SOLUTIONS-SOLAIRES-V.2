import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResultsDashboard from "./components/ResultsDashboard.REFONTE2";
import { FileUpload } from "./components/FileUpload";
import { SpeechView } from "./components/SpeechView";
import { supabase } from "./lib/supabase";
import GuestView from "./components/GuestView";
import { calculateGreenPositioningFromAddress } from "./greenValueEngine.ts";

const MainApp: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [profileDetected, setProfileDetected] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [study, setStudy] = useState<any>(null);
  const [greenPositioning, setGreenPositioning] = useState<any>(null);

  console.log("🔥 MainApp monté");
  console.log("hasData:", hasData);
  console.log("profileDetected:", profileDetected);
  console.log("simulationData:", simulationData);
  console.log("study:", study);

  const handleUploadSuccess = async (data: any) => {
    console.log("✅ handleUploadSuccess appelé avec:", data);
    let parsedData = typeof data === "string" ? JSON.parse(data) : data;

    setSimulationData(parsedData);

    // 🔥 MOTEUR PATRIMONIAL — ICI
    try {
      if (parsedData.address && parsedData.houseSize) {
        const green = await calculateGreenPositioningFromAddress(
          parsedData.address,
          Number(parsedData.houseSize)
        );
        console.log("🌿 Green positioning:", green);
        setGreenPositioning(green);
      }
    } catch (e) {
      console.error("❌ Green engine error:", e);
      setGreenPositioning(null);
    }

    setHasData(true);
  };

  const applyProfile = (profile: string) => {
    console.log("✅ Profil détecté:", profile);
    setProfileDetected(profile);
  };

  return (
    <div className="min-h-screen bg-[#020202]">
      {!hasData ? (
        <FileUpload
          onFileSelect={(file: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const parsed = JSON.parse(e.target?.result as string);
                handleUploadSuccess(parsed);
              } catch {
                console.error("Erreur lecture fichier");
              }
            };
            reader.readAsText(file);
          }}
          onTextSubmit={handleUploadSuccess}
          isLoading={false}
        />
      ) : !profileDetected ? (
        <SpeechView onProfileDetected={applyProfile} />
      ) : (
        <ResultsDashboard
          data={{
            profile: profileDetected,
            greenPositioning: greenPositioning, // ✅ AJOUT UNIQUE ICI
            params: {
              // ✅ MAPPING CORRECT FileUpload → ResultsDashboard
              inflationRate: parseFloat(simulationData.inflation) || 5,
              electricityPrice: parseFloat(simulationData.pricePerKwh) || 0.25,
              yearlyProduction: parseFloat(simulationData.production) || 7000,
              selfConsumptionRate:
                parseFloat(simulationData.selfConsumption) || 70,
              yearlyConsumption:
                parseFloat(simulationData.yearlyConsumption) || 10000,
              installCost: parseFloat(simulationData.installPrice) || 18990,
              creditMonthlyPayment:
                parseFloat(simulationData.creditMonthly) || 147.8,
              insuranceMonthlyPayment:
                parseFloat(simulationData.insuranceMonthly) || 4.7,
              creditDurationMonths:
                parseFloat(simulationData.creditDuration) || 180,
              creditInterestRate: parseFloat(simulationData.creditRate) || 5.89,
              address: simulationData.address || "",
              houseSize: parseFloat(simulationData.houseSize) || 120,
              installedPower:
                parseFloat(simulationData.puissanceInstallee) || 3,
              currentBillYear:
                parseFloat(simulationData.currentBillYear) || 2500,
              annualBill: parseFloat(simulationData.currentBillYear) || 2500,
              monthlyBill:
                parseFloat(simulationData.currentBillYear) / 12 || 208,
              cashApport: 0, // Par défaut
              taxRate: 0, // Par défaut
              buybackRate: 0.04, // Par défaut
            },
          }}
          studyId={study?.id}
          projectionYears={25}
          onReset={() => {
            setHasData(false);
            setProfileDetected(null);
            setSimulationData(null);
            setStudy(null);
          }}
          onProfileChange={(newProfile: string) => {
            setProfileDetected(newProfile);
          }}
        />
      )}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainApp />} />
      {/* ✅ CORRECTION: Changé de :id à :studyId pour correspondre au composant */}
      <Route path="/guest/:studyId" element={<GuestView />} />
    </Routes>
  </BrowserRouter>
);

export default App;
