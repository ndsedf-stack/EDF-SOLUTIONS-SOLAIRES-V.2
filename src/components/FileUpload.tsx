import React, { useRef, useState, useEffect } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Search,
  TrendingDown,
  Sun,
  ArrowRight,
  Zap,
} from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onTextSubmit,
  isLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<"upload" | "form">("form");
  const inputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    currentBillYear: "2500",
    yearlyConsumption: "10000",
    inflation: "5",
    pricePerKwh: "0.25",

    installPrice: "18990",
    production: "7000",
    selfConsumption: "100",

    creditMonthly: "0",
    insuranceMonthly: "0",
    creditDuration: "180",
    creditRate: "5.89",
  });

  // Calcul automatique du prix kWh quand facture ou conso change
  useEffect(() => {
    const facture = parseFloat(formData.currentBillYear);
    const conso = parseFloat(formData.yearlyConsumption);

    if (facture > 0 && conso > 0) {
      const calculatedPrice = (facture / conso).toFixed(4);
      setFormData((prev) => ({ ...prev, pricePerKwh: calculatedPrice }));
    }
  }, [formData.currentBillYear, formData.yearlyConsumption]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    const calculationData = {
      currentAnnualBill: parseFloat(formData.currentBillYear) || 0,
      yearlyConsumption: parseFloat(formData.yearlyConsumption) || 0,
      electricityPrice: parseFloat(formData.pricePerKwh) || 0.25,
      inflationRate: parseFloat(formData.inflation) || 5,

      installCost: parseFloat(formData.installPrice) || 18799,
      yearlyProduction: parseFloat(formData.production) || 7000,
      selfConsumptionRate: parseFloat(formData.selfConsumption) || 70,

      cashApport: 0,
      remainingToFinance: parseFloat(formData.installPrice) || 18799,
      creditMonthlyPayment: parseFloat(formData.creditMonthly) || 0,
      insuranceMonthlyPayment: parseFloat(formData.insuranceMonthly) || 0,
      creditDurationMonths: parseFloat(formData.creditDuration) || 180,
      creditInterestRate: parseFloat(formData.creditRate) || 3.89,
      insuranceRate: 0.3,
    };

    onTextSubmit(JSON.stringify(calculationData));
  };

  const isFormValid = formData.currentBillYear && formData.production;
  const monthlyBill = formData.currentBillYear
    ? (parseFloat(formData.currentBillYear) / 12).toFixed(2)
    : "0.00";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 pt-8 md:pt-16">
      {/* Brand Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo EDF en haut à gauche */}
        <div className="absolute top-8 left-8">
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="10"
              y1="10"
              x2="90"
              y2="90"
              stroke="#FCD34D"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="90"
              y1="10"
              x2="10"
              y2="90"
              stroke="#FCD34D"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">
            ● Solution Énergétique Premium
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">
          EDF{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-300">
            Solutions Solaires
          </span>
        </h1>
        <p className="text-zinc-400 text-sm font-medium">Groupe EDF</p>
      </div>

      {/* Mode Switcher - Style iOS Glassmorphism */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode("form")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 backdrop-blur-xl border ${
            mode === "form"
              ? "bg-blue-500/20 border-blue-400/30 text-white shadow-[0_8px_32px_rgba(59,130,246,0.3)]"
              : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
          }`}
        >
          🏷️ Saisie Manuelle
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 backdrop-blur-xl border ${
            mode === "upload"
              ? "bg-blue-500/20 border-blue-400/30 text-white shadow-[0_8px_32px_rgba(59,130,246,0.3)]"
              : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Fichier Excel
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative w-full transition-all duration-500">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md rounded-[32px] flex flex-col items-center justify-center border border-blue-500/30">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-2 border-zinc-800 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <Search className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">
              ANALYSE EN COURS
            </h3>
            <p className="text-sm text-blue-400 font-mono animate-pulse">
              Calcul de rentabilité...
            </p>
          </div>
        )}

        {mode === "upload" ? (
          <div
            className={`relative aspect-[16/9] md:aspect-[21/9] flex flex-col items-center justify-center transition-all duration-500 border border-dashed rounded-[32px] cursor-pointer overflow-hidden group backdrop-blur-sm ${
              dragActive
                ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleChange}
              disabled={isLoading}
            />

            <div className="relative z-10 flex flex-col items-center p-8 text-center">
              <div className="w-20 h-20 bg-zinc-900/80 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-black transition-all duration-500 border border-zinc-800 group-hover:border-blue-500/50">
                <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Déposer le Fichier Client
              </h3>
              <p className="text-zinc-500 text-sm">Excel (.xlsx) ou CSV</p>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/60 border border-zinc-800/50 rounded-[32px] p-8 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* COLONNE GAUCHE : FOURNISSEUR */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-red-900/20 rounded-xl border border-red-900/30">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                    Fournisseur (Actuel)
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* FACTURE */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Facture / An (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="currentBillYear"
                        value={formData.currentBillYear}
                        onChange={handleInputChange}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white text-3xl font-bold focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                      />
                      {formData.currentBillYear && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                          ~{monthlyBill}/m
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONSO */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider flex items-center gap-1.5">
                      Conso (kWh){" "}
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    </label>
                    <input
                      type="number"
                      name="yearlyConsumption"
                      value={formData.yearlyConsumption}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-yellow-400 text-3xl font-bold focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 outline-none transition-all"
                    />
                  </div>

                  {/* INFLATION + PRIX KWH (CALCULÉ) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                        Inflation (%)
                      </label>
                      <input
                        type="number"
                        name="inflation"
                        value={formData.inflation}
                        onChange={handleInputChange}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-2xl font-bold focus:border-zinc-600 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                        Prix kWh (€)
                      </label>
                      <input
                        type="number"
                        name="pricePerKwh"
                        step="0.0001"
                        value={formData.pricePerKwh}
                        readOnly
                        className="w-full bg-zinc-900 border border-emerald-700/50 rounded-xl px-4 py-3.5 text-emerald-400 text-2xl font-bold outline-none cursor-not-allowed"
                        title="Calculé automatiquement : Facture ÷ Consommation"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* COLONNE DROITE : EDF SOLAIRES */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-900/20 rounded-xl border border-blue-900/30">
                    <Sun className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                    EDF Solaires
                  </h3>
                </div>

                {/* MENSUALITÉ + ASSURANCE - VALEURS ENTOURÉES */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Mensualité Crédit (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="creditMonthly"
                        step="0.01"
                        value={formData.creditMonthly}
                        onChange={handleInputChange}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-emerald-400 text-2xl font-bold focus:border-emerald-500/50 outline-none transition-all"
                      />
                      {/* Cercle jaune autour */}
                      <div className="absolute inset-0 border-2 border-yellow-400 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Assurance (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="insuranceMonthly"
                        step="0.01"
                        value={formData.insuranceMonthly}
                        onChange={handleInputChange}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-2xl font-bold focus:border-zinc-600 outline-none transition-all"
                      />
                      {/* Cercle jaune autour */}
                      <div className="absolute inset-0 border-2 border-yellow-400 rounded-xl pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* PRODUCTION + AUTOCONSO */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Production (kWh)
                    </label>
                    <input
                      type="number"
                      name="production"
                      value={formData.production}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-2xl font-bold focus:border-zinc-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Autoconsommation (%)
                    </label>
                    <input
                      type="number"
                      name="selfConsumption"
                      value={formData.selfConsumption}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-2xl font-bold focus:border-zinc-600 outline-none"
                    />
                  </div>
                </div>

                {/* PRIX INSTALL + DURÉE + TAUX */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Prix Install (€)
                    </label>
                    <input
                      type="number"
                      name="installPrice"
                      value={formData.installPrice}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-3 text-white text-xl font-bold focus:border-zinc-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Durée (mois)
                    </label>
                    <input
                      type="number"
                      name="creditDuration"
                      value={formData.creditDuration}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-3 text-white text-xl font-bold focus:border-zinc-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                      Taux (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="creditRate"
                      value={formData.creditRate}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-3 text-white text-xl font-bold focus:border-zinc-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA BUTTON - Style iOS Glassmorphism avec croix jaune */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={handleFormSubmit}
                disabled={!isFormValid || isLoading}
                className="relative group bg-gradient-to-r from-blue-500/90 to-cyan-500/90 backdrop-blur-xl border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg px-10 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_48px_rgba(59,130,246,0.6)] hover:scale-[1.02] overflow-hidden"
              >
                {/* Effet glassmorphism */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <span className="relative z-10">LANCER L'ANALYSE</span>
                <ArrowRight className="w-5 h-5 relative z-10" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
