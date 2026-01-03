import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResultsDashboard from "./components/ResultsDashboard.REFONTE2";
import { FileUpload } from "./components/FileUpload";
import { SpeechView } from "./components/SpeechView";
import { supabase } from "./lib/supabase";
import GuestView from "./components/GuestView";

const MainApp: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [profileDetected, setProfileDetected] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [study, setStudy] = useState<any>(null);

  console.log("🔥 MainApp monté");
  console.log("hasData:", hasData);
  console.log("profileDetected:", profileDetected);
  console.log("simulationData:", simulationData);
  console.log("study:", study);

  const handleUploadSuccess = async (data: any) => {
    console.log("✅ handleUploadSuccess appelé avec:", data);
    let parsedData = typeof data === "string" ? JSON.parse(data) : data;
    setSimulationData(parsedData);

    // TEMPORAIREMENT COMMENTÉ POUR TESTER
    /*
    try {
      const { data: insertedStudy, error } = await supabase
        .from("studies")
        .insert([
          {
            simulation_data: parsedData,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Erreur Supabase:", error);
      } else {
        console.log("✅ Étude créée dans Supabase:", insertedStudy);
        setStudy(insertedStudy);
      }
    } catch (err) {
      console.error("❌ Erreur lors de l'insertion:", err);
    }
    */

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
            params: simulationData,
            profile: profileDetected,
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
