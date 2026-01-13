import React, { useState, useEffect } from "react";
import {
  TrendingDown,
  Sun,
  ArrowRight,
  MapPin,
  Loader2,
  Zap,
  Calendar,
  Shield,
  UploadCloud,
} from "lucide-react";

// --- TES FONCTIONS DE CALCUL INJECTÉES ---
const round2 = (num: number): number => Math.round(num * 100) / 100;

const safeParseFloat = (val: any, defaultVal: number = 0): number => {
  if (val === undefined || val === null || val === "") return defaultVal;
  const str = String(val).replace(",", ".").replace(/\s/g, "");
  const parsed = parseFloat(str);
  return isNaN(parsed) ? defaultVal : parsed;
};

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onTextSubmit,
  isLoading: globalLoading,
}) => {
  const [isPvgisLoading, setIsPvgisLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentBillYear: "2500",
    houseSize: "120",
    yearlyConsumption: "10000",
    inflation: "5",
    pricePerKwh: "0.2500",
    address: "",
    puissanceInstallee: "3",
    inclination: "25",
    azimuth: "0",
    production: "0",
    selfConsumption: "100",
    ratioLocal: "",
    installPrice: "18990",
    creditMonthly: "0",
    insuranceMonthly: "0",
    creditDuration: "180",
    creditRate: "5.89",
  });

  // --- TON CALCUL DE MENSUALITÉ AUTO ---
  useEffect(() => {
    const bill = safeParseFloat(formData.currentBillYear);
    const conso = safeParseFloat(formData.yearlyConsumption);
    const capital = safeParseFloat(formData.installPrice);
    const rateAnnuel = safeParseFloat(formData.creditRate);
    const duration = safeParseFloat(formData.creditDuration);

    // Calcul Prix kWh
    const newPriceKwh =
      bill > 0 && conso > 0 ? (bill / conso).toFixed(4) : "0.0000";

    // Calcul Mensualité (Ta logique de prêt amortissable)
    let newMonthly = 0;
    if (capital > 0 && duration > 0) {
      if (rateAnnuel > 0) {
        const rateMensuel = rateAnnuel / 100 / 12;
        newMonthly =
          (capital * rateMensuel) / (1 - Math.pow(1 + rateMensuel, -duration));
      } else {
        newMonthly = capital / duration;
      }
    }

    setFormData((prev) => ({
      ...prev,
      pricePerKwh: newPriceKwh,
      creditMonthly: round2(newMonthly).toString(),
    }));
  }, [
    formData.currentBillYear,
    formData.yearlyConsumption,
    formData.installPrice,
    formData.creditRate,
    formData.creditDuration,
  ]);

  const fetchProductionAuto = async () => {
    if (!formData.address || formData.address.length < 5) return;
    setIsPvgisLoading(true);

    try {
      // 1. Géolocalisation
      const geoResp = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          formData.address
        )}&limit=1`
      );

      const geoData = await geoResp.json();

      // ✅ Vérifier que l'adresse a été trouvée
      if (!geoData.features || geoData.features.length === 0) {
        console.error("❌ Adresse non trouvée");
        alert("Adresse introuvable");
        return;
      }

      const [lon, lat] = geoData.features[0].geometry.coordinates;

      // 2. Appel de ton API (pas PVGIS direct)
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        peakpower: formData.puissanceInstallee,
        angle: formData.inclination,
        aspect: formData.azimuth,
      });

      // ✅ CORRIGÉ : Parenthèse au lieu de backtick
      const res = await fetch(
        `${window.location.origin}/api/pvgis?${params.toString()}`
      );

      if (!res.ok) {
        console.error("❌ Erreur API:", res.status);
        const errorText = await res.text();
        console.error("Détails:", errorText);
        alert("Erreur lors de l'appel PVGIS");
        return;
      }

      const data = await res.json();
      console.log("✅ Données PVGIS:", data);

      if (data.outputs?.totals?.fixed?.E_y) {
        const correctedProd = Math.round(
          data.outputs.totals.fixed.E_y * 1.03128
        );

        setFormData((prev) => ({
          ...prev,
          production: correctedProd.toString(),
          ratioLocal: (
            correctedProd / safeParseFloat(prev.puissanceInstallee)
          ).toFixed(0),
        }));

        console.log(`✅ Production: ${correctedProd} kWh/an`);
      } else {
        console.error("❌ Structure de données PVGIS inattendue:", data);
        alert("Erreur dans les données PVGIS");
      }
    } catch (e: any) {
      console.error("❌ Erreur complète:", e);
      // ✅ CORRIGÉ : Parenthèse au lieu de backtick
      alert(`Erreur: ${e.message}`);
    } finally {
      setIsPvgisLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-black min-h-screen text-white font-sans selection:bg-blue-500/30">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-10 gap-4">
        <div className="flex flex-col">
          <img
            src="/edf-logo.png"
            alt="EDF"
            className="h-10 sm:h-12 w-auto object-contain mb-1"
          />
          <span className="text-[9px] sm:text-[10px] text-blue-500 font-black uppercase tracking-tighter">
            Solutions Solaires
          </span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 px-4 sm:px-6 py-2 rounded-full flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic">
            PVGIS SARAH-3 V5.2 CONNECTED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* COLONNE GAUCHE */}
        <div className="col-span-1 lg:col-span-7 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* PROFIL ÉNERGÉTIQUE */}
          <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-wider mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3 text-red-500">
              <TrendingDown size={16} className="sm:w-[18px] sm:h-[18px]" />{" "}
              Profil Énergétique
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">
                  Facture (€)
                </label>
                <div className="w-full bg-[#111] border border-zinc-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-6 focus-within:border-red-500/50 transition-all">
                  <input
                    type="number"
                    name="currentBillYear"
                    value={formData.currentBillYear}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-4xl sm:text-5xl lg:text-6xl font-black outline-none"
                  />
                  <div className="text-xs sm:text-sm text-purple-400/60 font-bold mt-2">
                    {formData.creditMonthly}€/mois
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-left sm:text-right">
                <label className="text-[9px] sm:text-[10px] font-bold text-emerald-500 uppercase block tracking-widest ml-1 sm:mr-1">
                  Prix kWh (€)
                </label>
                <div className="w-full bg-[#111] border border-zinc-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-6 text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-500 tracking-tighter tabular-nums">
                  {formData.pricePerKwh}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-zinc-800/30">
              <div className="space-y-1">
                <label className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase block italic">
                  Surface (m²)
                </label>
                <input
                  type="number"
                  name="houseSize"
                  value={formData.houseSize}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-3xl sm:text-4xl font-black text-blue-400 outline-none"
                />
              </div>
              <div className="space-y-1 sm:border-l border-zinc-800/50 sm:pl-6">
                <label className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase block italic">
                  Conso (kWh)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    name="yearlyConsumption"
                    value={formData.yearlyConsumption}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-3xl sm:text-4xl font-black text-yellow-500 outline-none"
                  />
                  <button className="bg-blue-600 p-2 rounded-full hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                    <UploadCloud size={14} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 sm:border-l border-zinc-800/50 sm:pl-6 text-left sm:text-right">
                <label className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase block italic">
                  Inflation %
                </label>
                <input
                  type="number"
                  name="inflation"
                  value={formData.inflation}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-3xl sm:text-4xl font-black text-white outline-none sm:text-right"
                />
              </div>
            </div>
          </div>

          {/* FINANCEMENT (Calculé via ton code) */}
          <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-2xl">
            <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-wider mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3 text-purple-500">
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />{" "}
              Financement & Investissement
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#111] border border-zinc-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
                <label className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase block mb-2">
                  Prix Inst. (€)
                </label>
                <input
                  type="number"
                  name="installPrice"
                  value={formData.installPrice}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-xl sm:text-2xl font-black text-white outline-none"
                />
              </div>
              <div className="bg-[#111] border-2 border-purple-500/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-purple-500/5">
                <label className="text-[8px] sm:text-[9px] font-bold text-purple-400 uppercase block mb-2 italic">
                  Mensualité (€)
                </label>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 tabular-nums">
                  {formData.creditMonthly}
                </div>
              </div>
              <div className="bg-[#111] border border-zinc-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
                <label className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase block mb-2">
                  Durée (m)
                </label>
                <input
                  type="number"
                  name="creditDuration"
                  value={formData.creditDuration}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-xl sm:text-2xl font-black outline-none"
                />
              </div>
              <div className="bg-[#111] border border-zinc-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
                <label className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase block mb-2 italic">
                  Taux %
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="creditRate"
                  value={formData.creditRate}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-xl sm:text-2xl font-black text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE EXPERTISE */}
        <div className="col-span-1 lg:col-span-5">
          <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8 flex flex-col h-full shadow-2xl">
            <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-wider mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3 text-blue-500">
              <Sun size={18} className="sm:w-5 sm:h-5" /> Expertise PVGIS
            </h3>

            <div className="space-y-4 sm:space-y-6 lg:space-y-8 flex-grow">
              <div className="relative">
                <label className="text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase mb-2 sm:mb-3 flex items-center gap-2 tracking-[0.1em]">
                  <MapPin size={12} /> Localisation
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Saisir l'adresse..."
                  className="w-full bg-[#111] border border-zinc-800 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-bold outline-none focus:border-blue-500/40 transition-all shadow-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-black/40 border border-zinc-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
                  <label className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase block mb-1">
                    Puissance (KWC)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="puissanceInstallee"
                    value={formData.puissanceInstallee}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-black text-blue-500 outline-none"
                  />
                </div>
                <div className="bg-black/40 border border-zinc-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
                  <label className="text-[8px] sm:text-[9px] font-bold text-emerald-500 uppercase block mb-1 italic">
                    Autocons %
                  </label>
                  <input
                    type="number"
                    name="selfConsumption"
                    value={formData.selfConsumption}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-black text-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#111] border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
                <span className="text-[8px] sm:text-[9px] font-black text-zinc-500 uppercase italic block mb-2 sm:mb-3 tracking-widest">
                  Production Estimée
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tabular-nums tracking-tighter">
                      {formData.production}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-zinc-700 uppercase">
                      kWh
                    </span>
                  </div>
                  <button
                    onClick={fetchProductionAuto}
                    className="bg-emerald-500 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPvgisLoading ? (
                      <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    ) : (
                      <Zap
                        size={20}
                        className="w-5 h-5 sm:w-6 sm:h-6 text-black"
                        fill="currentColor"
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 border-t border-zinc-800/50 flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[8px] sm:text-[9px] text-zinc-600 font-bold uppercase italic block tracking-widest">
                  Rendement de zone
                </span>
                <div className="text-xl sm:text-2xl font-black text-blue-500 tabular-nums">
                  {formData.ratioLocal || "—"}{" "}
                  <span className="text-[9px] sm:text-[10px] text-zinc-700">
                    kWh/kWc
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOUTON D'ANALYSE STEALTH BLACK */}
      <div className="mt-8 sm:mt-12 flex flex-col items-center gap-4 sm:gap-6">
        <button
          onClick={() => onTextSubmit(JSON.stringify(formData))}
          className="group relative bg-[#111] border border-zinc-800 hover:border-zinc-700 w-full max-w-[700px] py-3 sm:py-4 px-4 sm:px-6 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-between"
        >
          <div className="flex-1 text-center">
            <span className="uppercase tracking-[0.2em] sm:tracking-[0.4em] text-sm sm:text-base lg:text-lg font-black italic text-zinc-300 group-hover:text-white transition-colors">
              Lancer l'analyse technique
            </span>
          </div>
          <div className="bg-white rounded-full p-2 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
          </div>
        </button>
      </div>
    </div>
  );
};
