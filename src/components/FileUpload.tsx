import React, { useState, useEffect } from "react";
import {
  TrendingDown,
  Sun,
  ArrowRight,
  MapPin,
  Loader2,
  ShieldCheck,
  Zap,
  Euro,
  Percent,
  Calendar,
  Shield,
} from "lucide-react";

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

  // Calcul automatique du coût du kWh
  useEffect(() => {
    const facture = parseFloat(formData.currentBillYear);
    const conso = parseFloat(formData.yearlyConsumption);
    if (facture > 0 && conso > 0) {
      setFormData((prev) => ({
        ...prev,
        pricePerKwh: (facture / conso).toFixed(4),
      }));
    }
  }, [formData.currentBillYear, formData.yearlyConsumption]);

  const fetchProductionAuto = async () => {
    if (!formData.address || formData.address.length < 5) return;
    setIsPvgisLoading(true);
    try {
      const geoResp = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          formData.address
        )}&limit=1`
      );
      const geoData = await geoResp.json();
      const [lon, lat] = geoData.features[0].geometry.coordinates;

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        peakpower: formData.puissanceInstallee,
        loss: "0",
        mountingplace: "free",
        usehorizon: "1",
        angle: formData.inclination,
        aspect: formData.azimuth,
        raddatabase: "PVGIS-SARAH3",
        pvtechchoice: "crystSi",
        outputformat: "json",
      });

      const res = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(
          "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?" + params.toString()
        )}`
      );
      const data = await res.json();

      if (data.outputs?.totals) {
        const correctedProd = Math.round(
          data.outputs.totals.fixed.E_y * 1.03128
        );
        setFormData((prev) => ({
          ...prev,
          production: correctedProd.toString(),
          ratioLocal: (
            correctedProd / parseFloat(prev.puissanceInstallee)
          ).toFixed(0),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPvgisLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-12 pt-8 bg-black min-h-screen text-white font-sans">
      {/* HEADER AVEC LOGO EDF AGRANDI */}
      <div className="flex items-center justify-between mb-10">
        <img
          src="/edf-logo.png"
          alt="EDF solutions solaires"
          className="h-32 w-auto object-contain"
        />
        <div className="bg-zinc-900/80 border border-zinc-800 px-5 py-2 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="text-blue-500 w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            OFFICIEL PVGIS SARAH-3 v5.3
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* LIGNE 1 : BLOCS PRINCIPAUX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-red-500">
              <TrendingDown /> Consommation & Coût
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">
                  Facture Annuelle (€)
                </label>
                <input
                  type="number"
                  name="currentBillYear"
                  value={formData.currentBillYear}
                  onChange={handleInputChange}
                  className="w-full bg-black border-2 border-zinc-900 rounded-2xl px-6 py-4 text-4xl font-black focus:border-red-600 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">
                  Coût du kWh (€)
                </label>
                <div className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-4xl font-black text-emerald-500">
                  {formData.pricePerKwh}
                </div>
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block tracking-tighter">
                  Conso annuelle (kWh)
                </label>
                <input
                  type="number"
                  name="yearlyConsumption"
                  value={formData.yearlyConsumption}
                  onChange={handleInputChange}
                  className="w-full bg-black border-2 border-zinc-900 rounded-2xl px-4 py-3 text-2xl font-bold text-yellow-400 outline-none"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block flex items-center gap-1">
                  <Percent size={10} /> Inflation (%)
                </label>
                <input
                  type="number"
                  name="inflation"
                  value={formData.inflation}
                  onChange={handleInputChange}
                  className="w-full bg-black border-2 border-zinc-900 rounded-2xl px-4 py-3 text-2xl font-bold text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-blue-500">
              <Sun /> Simulation PVGIS Sarah-3 v5.3
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-blue-500 uppercase mb-2 block flex items-center gap-2">
                  <MapPin size={12} /> Adresse du projet
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Saisir l'adresse..."
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-3 text-lg font-bold outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black border border-zinc-800 p-4 rounded-2xl">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1 block">
                    Puissance (kWc)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="puissanceInstallee"
                    value={formData.puissanceInstallee}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-2xl font-black text-blue-500 outline-none"
                  />
                </div>
                <div className="bg-black border border-zinc-800 p-4 rounded-2xl relative">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1 block">
                    Production (kWh)
                  </label>
                  <input
                    type="number"
                    name="production"
                    value={formData.production}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-2xl font-black text-white outline-none"
                  />
                  <button
                    onClick={fetchProductionAuto}
                    disabled={isPvgisLoading}
                    className="absolute right-2 top-2 bg-emerald-500 text-black p-1.5 rounded-lg hover:bg-emerald-400"
                  >
                    {isPvgisLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LIGNE 2 : INPUTS DU BAS AVEC LÉGENDES CLAIRES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-emerald-500 border-b border-zinc-900 pb-3 uppercase text-[10px] font-black italic">
              <Euro size={16} /> Budget & Usage
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">
                  Prix de l'installation (€)
                </span>
                <input
                  type="number"
                  name="installPrice"
                  value={formData.installPrice}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xl font-black text-white outline-none"
                />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">
                  Part d'autoconsommation (%)
                </span>
                <input
                  type="number"
                  name="selfConsumption"
                  value={formData.selfConsumption}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xl font-black text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-purple-500 border-b border-zinc-900 pb-3 uppercase text-[10px] font-black italic">
              <Calendar size={16} /> Financement
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">
                  Mensualité du crédit (€)
                </span>
                <input
                  type="number"
                  name="creditMonthly"
                  value={formData.creditMonthly}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xl font-black outline-none"
                />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">
                  Durée (mois)
                </span>
                <input
                  type="number"
                  name="creditDuration"
                  value={formData.creditDuration}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-lg font-bold outline-none"
                />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">
                  Taux (%)
                </span>
                <input
                  type="number"
                  name="creditRate"
                  value={formData.creditRate}
                  onChange={handleInputChange}
                  className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-lg font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6 text-orange-500 border-b border-zinc-900 pb-3 uppercase text-[10px] font-black italic">
                <Shield size={16} /> Maintenance & Ratio
              </div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">
                Assurance annuelle (€/mois)
              </span>
              <input
                type="number"
                name="insuranceMonthly"
                value={formData.insuranceMonthly}
                onChange={handleInputChange}
                className="w-full bg-black border border-zinc-900 rounded-xl px-4 py-3 text-xl font-black outline-none"
              />
            </div>
            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 mt-4">
              <span className="text-[9px] text-zinc-600 font-bold uppercase block">
                Rendement local
              </span>
              <div className="text-xl font-black text-blue-500">
                {formData.ratioLocal || "—"}{" "}
                <span className="text-[10px]">kWh/kWc</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOUTON LANCER L'ANALYSE GLASSMORPHISM TRANSPARENT */}
        <div className="pt-8 flex justify-center">
          <button
            onClick={() => onTextSubmit(JSON.stringify(formData))}
            className="group relative backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/20 px-16 py-6 rounded-2xl flex items-center gap-6 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            <span className="uppercase tracking-[0.4em] text-xl font-black italic text-white/90 group-hover:text-white">
              Lancer l'analyse
            </span>
            <div className="bg-blue-600/20 p-2 rounded-lg group-hover:bg-blue-600/40 transition-colors">
              <ArrowRight className="w-6 h-6 text-blue-400" />
            </div>
            {/* Lueur subtile sous le bouton */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl -z-10 group-hover:bg-blue-500/20 transition-all"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
