import React, { useState, useEffect, useMemo } from "react";
import { SimulationResult, YearlyDetail } from "../types";
import { InfoPopup } from "./InfoPopup";
import { calculateSolarProjection, safeParseFloat } from "../utils/finance";
import { PDFExport } from "./PDFExport";
import { printValidationReport } from "../utils/validateCalculations";
import { supabase } from "../lib/supabase";
import QRCode from "qrcode";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Legend,
} from "recharts";
import {
  Download,
  Sun,
  X,
  ChevronUp,
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle2,
  Wallet,
  Coins,
  ArrowRight,
  Settings,
  Landmark,
  ShieldCheck,
  Home,
  BarChart3,
  HelpCircle,
  Scale,
  Ban,
  Crown,
  Smartphone,
  Server,
  Table2,
  Eye,
  Flame,
  Lock,
  Target,
  Wrench,
  Bot,
  LayoutDashboard,
  ThumbsUp,
  Timer,
  Shield,
  Award,
  Calendar,
  Users,
} from "lucide-react";
import { InputSlider } from "./InputSlider";

interface ResultsDashboardProps {
  data: SimulationResult;
  onReset: () => void;
  projectionYears: number;
  onRecalculate?: (newParams: any, newYears: number) => void;
}

// --- UTILS FORMATTING ---
const formatMoney = (val: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(val);
const formatNum = (val: number) => new Intl.NumberFormat("fr-FR").format(val);

const formatMoneyPrecise = (val: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

// --- CUSTOM COMPONENTS ---

const Toggle = ({
  checked,
  onChange,
  labelOn,
  labelOff,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
}) => (
  <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10">
    <button
      onClick={() => onChange(false)}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
        !checked
          ? "bg-slate-700 text-white shadow-sm"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {labelOff}
    </button>
    <button
      onClick={() => onChange(true)}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
        checked
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {labelOn}
    </button>
  </div>
);

const ParamCard = ({
  label,
  value,
  setValue,
  unit,
  sublabel,
  icon,
  min = 0,
  step = 1,
  disabled = false,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  unit?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  min?: number;
  step?: number;
  disabled?: boolean;
}) => {
  return (
    <div
      className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="relative z-10 flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-end gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-2xl font-bold text-white outline-none w-full appearance-none m-0 p-0 leading-none placeholder-slate-700"
          step={step}
          min={min}
          disabled={disabled}
        />
        {unit && (
          <span className="text-slate-500 font-bold text-sm mb-1">{unit}</span>
        )}

        {!disabled && (
          <div className="flex flex-col gap-0.5 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1 rounded border border-white/10">
            <button
              onClick={() => setValue(parseFloat((value + step).toFixed(2)))}
              className="text-slate-500 hover:text-white"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() =>
                setValue(parseFloat(Math.max(min, value - step).toFixed(2)))
              }
              className="text-slate-500 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>

      {sublabel && (
        <div className="relative z-10 h-4 mt-2">
          <p className="text-[10px] text-slate-600 truncate">{sublabel}</p>
        </div>
      )}
    </div>
  );
};

const WarrantyCard = ({
  years,
  label,
  tag,
  icon: Icon,
  description,
  isFr,
}: {
  years: number | string;
  label: string;
  tag: string;
  icon: any;
  description: string;
  isFr?: boolean;
}) => (
  <div className="bg-black/40 backdrop-blur-xl border border-blue-500/20 p-6 rounded-2xl group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/50 relative overflow-hidden h-full">
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 pointer-events-none"></div>

    {/* Normal Content */}
    <div className="relative z-10 transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 transform">
      <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
        <Icon size={20} />
      </div>
      <div className="text-3xl font-black text-white mb-1">
        {years} {typeof years === "number" ? "ANS" : ""}
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
        {label}
      </div>
      <div className="inline-block px-2 py-1 bg-blue-900/30 text-blue-300 text-[10px] font-bold rounded border border-blue-500/20">
        {tag}
      </div>

      {/* French Flag badge */}
      {isFr && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#1a2e35] px-2 py-1 rounded border border-emerald-500/20 shadow-sm">
          <span className="text-[8px]">🇫🇷</span>
          <span className="text-[8px] font-bold text-emerald-400">
            FRANÇAIS
          </span>
        </div>
      )}
    </div>

    {/* Hover Overlay */}
    <div className="absolute inset-0 bg-black/95 p-6 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-20">
      <Icon
        size={24}
        className="text-blue-400 mb-3 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
      />
      <h4 className="text-white font-bold text-sm mb-2 uppercase">
        {label} {years} {typeof years === "number" ? "ANS" : ""}
      </h4>
      <p className="text-xs text-slate-200 font-medium leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  data,
  onReset,
  projectionYears: initialProjectionYears,
  onRecalculate,
}) => {
  // --- STATE ---
  const [inflationRate, setInflationRate] = useState<number>(5);
  const [projectionYears, setProjectionYears] = useState(
    initialProjectionYears || 20
  );
  const [commercialEmail, setCommercialEmail] = useState(
    import.meta.env.VITE_COMMERCIAL_EMAIL || ""
  );
  const [commercialName, setCommercialName] = useState(
    import.meta.env.VITE_COMMERCIAL_NAME || ""
  );
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Tech & Finance Params
  const [electricityPrice, setElectricityPrice] = useState<number>(
    data?.params?.electricityPrice || 0.25
  );
  const [yearlyProduction, setYearlyProduction] = useState<number>(
    data?.params?.yearlyProduction || 7000
  );
  const [selfConsumptionRate, setSelfConsumptionRate] = useState<number>(
    data?.params?.selfConsumptionRate || 70
  );
  const [yearlyConsumption, setYearlyConsumption] = useState<number>(
    data?.params?.yearlyConsumption || 14000
  );
  const [installCost, setInstallCost] = useState<number>(
    data?.params?.installCost || 18799
  );
  const [showCompteurExplanation, setShowCompteurExplanation] = useState(false);
  const [clientName, setClientName] = useState("");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [installedPower, setInstalledPower] = useState<number>(
    data?.params?.installedPower || 3.5
  );

  // Main Financing States
  const [creditMonthlyPayment, setCreditMonthlyPayment] =
    useState<number>(147.8);
  const [insuranceMonthlyPayment, setInsuranceMonthlyPayment] =
    useState<number>(4.7);
  const [creditDurationMonths, setCreditDurationMonths] = useState<number>(180);
  const [cashApport, setCashApport] = useState<number>(0);
  const [remainingToFinance, setRemainingToFinance] = useState<number>(18799);
  const [taxRate, setTaxRate] = useState<number>(0);

  // Auto Calculation States for Modal
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);
  const [interestRate, setInterestRate] = useState<number>(3.89);
  // ✅ AJOUTE CES 3 LIGNES
  useEffect(() => {
    console.log("🔥 interestRate a changé:", interestRate);
  }, [interestRate]);
  const [insuranceRate, setInsuranceRate] = useState<number>(0);
  const [buybackRate, setBuybackRate] = useState<number>(0.04);
  const [showQRCode, setShowQRCode] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // ✅ AJOUTE CETTE LIGNE
  const handleGenerateStudy = async () => {
    // Vérifications
    if (!clientName.trim()) {
      alert("⚠️ Veuillez entrer le nom du client");
      return;
    }

    if (!commercialEmail) {
      alert("⚠️ Email commercial manquant");
      return;
    }

    try {
      console.log("🚀 Génération de l'étude...");

      // Prépare le payload
      const payload = {
        n: clientName,
        e: Math.round(calculationResult.totalSavingsProjected || 0),
        a: Math.round(selfConsumptionRate || 70),
        m: Math.round(
          (creditMonthlyPayment || 0) + (insuranceMonthlyPayment || 0)
        ),
        t: interestRate || 3.89,
        d: creditDurationMonths || 180,
        prod: yearlyProduction || 7000,
        conso: yearlyConsumption || 10000,
        selfCons: selfConsumptionRate || 70,
        installCost: installCost || 18799,
        cashApport: cashApport || 0,
        elecPrice: electricityPrice || 0.25,
        installedPower: installedPower || 3.5,
        projectionYears: projectionYears,
        mode: "financement",
        warrantyMode: warrantyMode ? "performance" : "essential",
      };

      console.log("📦 PAYLOAD GÉNÉRÉ:");
      console.log("payload.t (taux) =", payload.t);
      console.log("payload.m (mensualité) =", payload.m);
      console.log("payload.e (gain) =", payload.e);
      console.log("payload.projectionYears =", payload.projectionYears);
      console.log("════════════════════════════════════");

      // Calcule la date d'expiration (15 jours)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 15);

      console.log("📤 Sauvegarde dans Supabase...");

      // Sauvegarde dans Supabase
      const { data: study, error } = await supabase
        .from("studies")
        .insert({
          study_data: payload,
          expires_at: expiresAt.toISOString(),
          client_name: clientName,
          client_email: clientEmail || null,
          client_phone: clientPhone || null,
          commercial_email: commercialEmail,
          commercial_name: commercialName || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Erreur Supabase:", error);
        throw error;
      }

      console.log("✅ Étude sauvegardée:", study.id);
      console.log("📅 Expire le:", expiresAt.toLocaleDateString("fr-FR"));

      // Génère l'URL avec l'ID Supabase
      const guestUrl = `https://edf-solutions-solaires-v-2-4yiz-fzqtp3mrk.vercel.app/guest/${study.id}`;
      console.log("🔗 URL générée:", guestUrl);

      // Met à jour l'état
      setEncodedUrl(guestUrl);
      setShowNamePopup(false);
      setShowQRCode(true);

      // Message de succès
      alert(
        `✅ Étude générée avec succès !\n\nID: ${
          study.id
        }\nExpire le: ${expiresAt.toLocaleDateString("fr-FR")}`
      );
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      alert(`❌ Erreur lors de la génération de l'étude.\n\n${error.message}`);
      setShowNamePopup(false);
    }
  };

  // --- LE CODE QUI FORCE LA MISE À JOUR (NE PAS OUBLIER) ---
  useEffect(() => {
    if (data && data.params) {
      const p = data.params;
      if (p.inflationRate !== undefined)
        setInflationRate(Number(p.inflationRate));
      if (p.electricityPrice !== undefined)
        setElectricityPrice(Number(p.electricityPrice));
      if (p.yearlyProduction !== undefined)
        setYearlyProduction(Number(p.yearlyProduction));
      if (p.selfConsumptionRate !== undefined)
        setSelfConsumptionRate(Number(p.selfConsumptionRate));

      // AJOUTE CETTE LIGNE ICI POUR VIRER LE 14000
      if (p.yearlyConsumption !== undefined)
        setYearlyConsumption(Number(p.yearlyConsumption));

      if (p.installedPower !== undefined || p.puissanceInstallee !== undefined)
        setInstalledPower(
          Number(p.installedPower || p.puissanceInstallee || 3.5)
        );

      if (p.installCost !== undefined) setInstallCost(Number(p.installCost));
      if (p.creditMonthlyPayment !== undefined)
        setCreditMonthlyPayment(Number(p.creditMonthlyPayment));
      if (p.insuranceMonthlyPayment !== undefined)
        setInsuranceMonthlyPayment(Number(p.insuranceMonthlyPayment));
      if (p.creditDurationMonths !== undefined)
        setCreditDurationMonths(Number(p.creditDurationMonths));
      if (p.cashApport !== undefined) setCashApport(Number(p.cashApport));
      if (p.interestRate !== undefined || p.creditInterestRate !== undefined)
        setInterestRate(Number(p.interestRate || p.creditInterestRate));
    }
  }, [data]);

  // --- RECALCULATE TRIGGER ---
  useEffect(() => {
    if (onRecalculate) {
      onRecalculate(
        {
          inflationRate,
          electricityPrice,
          yearlyProduction,
          selfConsumptionRate,
          installCost,
          cashApport,
          remainingToFinance,
          creditMonthlyPayment,
          insuranceMonthlyPayment,
          creditDurationMonths,
          taxRate,
        },
        projectionYears
      );
    }
  }, [
    inflationRate,
    projectionYears,
    electricityPrice,
    yearlyProduction,
    selfConsumptionRate,
    installCost,
    cashApport,
    creditMonthlyPayment,
  ]);

  // UI State
  const [wastedCash, setWastedCash] = useState(0);
  const [showParamsEditor, setShowParamsEditor] = useState(false);
  const [warrantyMode, setWarrantyMode] = useState<boolean>(true);
  const [economyChartMode, setEconomyChartMode] = useState<
    "financement" | "cash"
  >("financement");
  const [tableMode, setTableMode] = useState<"annuel" | "mensuel">("mensuel");
  const [tableScenario, setTableScenario] = useState<"financement" | "cash">(
    "financement"
  );
  const [gouffreMode, setGouffreMode] = useState<"financement" | "cash">(
    "financement"
  );
  const [whereMoneyMode, setWhereMoneyMode] = useState<"financement" | "cash">(
    "financement"
  );

  // --- INITIALIZATION ---
  useEffect(() => {
    if (data?.params) {
      setInflationRate(safeParseFloat(data.params.inflationRate, 5));
      setElectricityPrice(safeParseFloat(data.params.electricityPrice, 0.25));
      setYearlyProduction(safeParseFloat(data.params.yearlyProduction, 7000));
      setSelfConsumptionRate(
        safeParseFloat(data.params.selfConsumptionRate, 70)
      );
      setInstallCost(safeParseFloat(data.params.installCost, 18799));
      setCreditMonthlyPayment(
        safeParseFloat(data.params.creditMonthlyPayment, 147.8)
      );
      setInsuranceMonthlyPayment(
        safeParseFloat(data.params.insuranceMonthlyPayment, 4.7)
      );
      setCreditDurationMonths(
        safeParseFloat(data.params.creditDurationMonths, 180)
      );
      setCashApport(safeParseFloat(data.params.cashApport, 0));

      if (data.params.creditInterestRate)
        setInterestRate(safeParseFloat(data.params.creditInterestRate, 3.89));
      if (data.params.insuranceRate)
        setInterestRate(safeParseFloat(data.params.insuranceRate, 0));
    }
  }, [data]);

  useEffect(() => {
    setRemainingToFinance(Math.max(0, installCost - cashApport));
  }, [installCost, cashApport]);

  useEffect(() => {
    const params = data?.params || {};
    const conso = params.yearlyConsumption || 10000;
    const price = params.electricityPrice || 0.25;
    const costPerSecond = (conso * price) / 365 / 24 / 3600;

    const interval = setInterval(() => {
      setWastedCash((prev) => prev + costPerSecond);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Projected Values for Auto Calc (Modal Preview)
  const projectedMonthlyLoan = useMemo(() => {
    const r = interestRate / 100 / 12;
    const n = creditDurationMonths;
    const P = remainingToFinance;
    if (r === 0 || n === 0) return P / (n || 1);
    const val = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    return isNaN(val) ? 0 : val;
  }, [remainingToFinance, interestRate, creditDurationMonths]);

  const projectedMonthlyInsurance = useMemo(() => {
    const val = (remainingToFinance * (insuranceRate / 100)) / 12;
    return isNaN(val) ? 0 : val;
  }, [remainingToFinance, insuranceRate]);

  // Apply Auto Values
  const applyAutoValues = () => {
    setCreditMonthlyPayment(Math.round(projectedMonthlyLoan * 100) / 100);
    setInsuranceMonthlyPayment(
      Math.round(projectedMonthlyInsurance * 100) / 100
    );
  };

  // --- CALCULATION ENGINE ---
  const calculationResult = useMemo(() => {
    const result = calculateSolarProjection(data.params, {
      inflationRate,
      projectionYears,
      electricityPrice,
      yearlyProduction,
      selfConsumptionRate,
      installCost,
      cashApport,
      remainingToFinance,
      creditMonthlyPayment,
      insuranceMonthlyPayment,
      creditDurationMonths,
      taxRate,
      buybackRate,
    });

    return result;
  }, [
    inflationRate,
    projectionYears,
    electricityPrice,
    yearlyProduction,
    selfConsumptionRate,
    installCost,
    cashApport,
    remainingToFinance,
    creditMonthlyPayment,
    insuranceMonthlyPayment,
    creditDurationMonths,
    taxRate,
    buybackRate,
    data.params,
  ]);

  // Wasted Cash Counter
  useEffect(() => {
    const params = data?.params || {};
    const conso = params.yearlyConsumption || 10000;
    const price = params.electricityPrice || 0.25;
    const costPerSecond = (conso * price) / 365 / 24 / 3600;

    const interval = setInterval(() => {
      setWastedCash((prev) => prev + costPerSecond); // ✅ PAS de *100
    }, 1000); // ✅ 1000ms = 1 seconde

    return () => clearInterval(interval);
  }, []); // ✅ Tableau vide

  // 🔍 VALIDATION AUTOMATIQUE COMPLÈTE
  useEffect(() => {
    const simulationResult = {
      params: {
        ...data.params,
        electricityPrice: electricityPrice,
        yearlyProduction: yearlyProduction,
        selfConsumptionRate: selfConsumptionRate,
        yearlyConsumption: yearlyConsumption,
        installCost: installCost,
        cashApport: cashApport,
        remainingToFinance: remainingToFinance,
        creditMonthlyPayment: creditMonthlyPayment,
        insuranceMonthlyPayment: insuranceMonthlyPayment,
        creditDurationMonths: creditDurationMonths,
        creditInterestRate: interestRate,
        insuranceRate: insuranceRate,
        inflationRate: inflationRate,
        buybackRate: buybackRate,
      },
      details: calculationResult.details,
      detailsCash: calculationResult.detailsCash,
      breakEvenPoint: calculationResult.breakEvenPoint,
      breakEvenPointCash: calculationResult.breakEvenPointCash,
      roiPercentage: calculationResult.roiPercentage,
      roiPercentageCash: calculationResult.roiPercentageCash,
      totalSavingsProjected: calculationResult.totalSavingsProjected,
      totalSavingsProjectedCash: calculationResult.totalSavingsProjectedCash,
    };

    printValidationReport(simulationResult);
  }, [calculationResult, projectionYears, buybackRate]);
  // ECONOMY CHART DATA - NET CASHFLOW
  const economyChartData = useMemo(() => {
    const sourceDetails =
      economyChartMode === "financement"
        ? calculationResult.details
        : calculationResult.detailsCash;
    const viewData = sourceDetails.slice(0, projectionYears);

    return viewData.map((detail, index) => {
      const isCreditActive =
        index * 12 < creditDurationMonths && economyChartMode === "financement";

      // ⚠️ REMPLACE CE CALCUL :
      // const netCashflow = detail.cashflowDiff; // ANCIEN (donne -404€)

      // ✅ PAR CE CALCUL (le même que le tableau) :
      const netCashflow = detail.totalWithSolar - detail.edfBillWithoutSolar;
      // Ça donne +34€ pour l'année 1 (cohérent avec le tableau)

      return {
        year: detail.year,
        value: netCashflow,
        type: isCreditActive ? "investment" : "profit",
      };
    });
  }, [
    calculationResult,
    economyChartMode,
    creditDurationMonths,
    projectionYears,
  ]);
  // Warranty Data - VERSION FINALE CORRIGÉE COMPLÈTE
  const warranties = useMemo(() => {
    return warrantyMode
      ? [
          {
            years: "À VIE",
            label: "PANNEAUX",
            tag: "Pièces + M.O. + Déplacement",
            icon: Sun,
            description:
              "Garantie de performance 30 ans avec indemnisation. Garantie matériel, main d'œuvre et déplacement à vie.",
          },
          {
            years: "À VIE",
            label: "ONDULEURS",
            tag: "Pièces + M.O. + Déplacement",
            icon: Zap,
            description:
              "Garantie de performance 30 ans avec indemnisation. Remplacement à neuf, main d'œuvre et déplacement à vie.",
          },
          {
            years: "À VIE",
            label: "STRUCTURE",
            tag: "Pièces + M.O. + Déplacement",
            icon: Wrench,
            description:
              "Garantie à vie sur le système de fixation et l'étanchéité de votre toiture.",
          },
          {
            years: "À VIE",
            label: "MATÉRIEL",
            tag: "Remplacement à neuf",
            icon: ShieldCheck,
            description:
              "Garantie matérielle complète contre tout défaut de fabrication ou vice caché, à vie.",
          },
        ]
      : [
          {
            years: 25,
            label: "PANNEAUX",
            tag: "Performance standard",
            icon: Sun,
            description:
              "Garantie de performance 25 ans avec indemnisation si production inférieure à 80% de la puissance nominale.",
            isFr: true,
          },
          {
            years: 25,
            label: "ONDULEURS",
            tag: "Pièces + M.O. + Déplacement",
            icon: Zap,
            description:
              "Garantie totale 25 ans : remplacement à neuf, main d'œuvre et déplacement inclus.",
          },
          {
            years: 10,
            label: "STRUCTURE",
            tag: "Matériel + M.O. + Déplacement",
            icon: Wrench,
            description:
              "Garantie 10 ans sur le système de fixation et l'étanchéité.",
          },
          {
            years: 25,
            label: "PANNEAUX",
            tag: "Matériel",
            icon: Sun,
            description:
              "Garantie matérielle 25 ans contre tout défaut de fabrication.",
          },
        ];
  }, [warrantyMode]);

  const getYearData = (year: number) => {
    const idx = year - 1;
    if (!calculationResult.details[idx])
      return { credit: calculationResult.year1, cash: calculationResult.year1 };
    return {
      credit: calculationResult.details[idx],
      cash: calculationResult.detailsCash[idx],
    };
  };

  const yearsToDisplay = [5, 10, 20];

  // Gouffre Financier Data - Calcul dynamique
  const gouffreChartData = useMemo(() => {
    let cumulativeNoSolar = 0;
    let cumulativeSolarCredit = cashApport; // ✅ MODIFIÉ
    let cumulativeSolarCash = installCost; // ✅ MODIFIÉ

    return calculationResult.details.slice(0, projectionYears).map((detail) => {
      // Cumul Sans Solaire
      cumulativeNoSolar += detail.edfBillWithoutSolar;

      // Cumul Avec Solaire (Financement) = totalWithSolar
      cumulativeSolarCredit += detail.totalWithSolar;

      // Cumul Avec Solaire (Cash) = juste le reste de facture
      const detailCash = calculationResult.detailsCash.find(
        (d) => d.year === detail.year
      );
      if (detailCash) {
        cumulativeSolarCash += detailCash.totalWithSolar;
      }

      return {
        year: detail.year,
        cumulativeSpendNoSolar: Math.round(cumulativeNoSolar),
        cumulativeSpendSolar:
          gouffreMode === "cash"
            ? Math.round(cumulativeSolarCash)
            : Math.round(cumulativeSolarCredit),
      };
    });
  }, [
    calculationResult.details,
    calculationResult.detailsCash,
    gouffreMode,
    cashApport,
    installCost,
    projectionYears,
  ]);

  return (
    <div className="w-full">
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.5)]">
            <Sun className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent leading-none">
              Solutions Solaires
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              EDF - Analyse Premium
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowParamsEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded border border-white/10 transition-colors"
          >
            <Settings size={14} /> Modifier
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
          >
            <TrendingUp size={14} /> Nouvelle Analyse
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-8">
        {/* PARAMS EDITOR MODAL */}
        {showParamsEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-blue-500/10 text-blue-500">
                    <Settings size={20} />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Paramètres Financiers
                  </h2>
                </div>
                <button
                  onClick={() => setShowParamsEditor(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {/* Row 1: Basic Params */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <ParamCard
                    label="Puissance Installée (kWc)"
                    value={installedPower}
                    setValue={setInstalledPower}
                    step={0.1}
                    unit="kWc"
                    icon={<Zap size={14} className="text-blue-500" />}
                    sublabel="Puissance des panneaux"
                  />

                  <ParamCard
                    label="Prix Électricité (€/kWh)"
                    value={electricityPrice}
                    setValue={setElectricityPrice}
                    step={0.01}
                    unit=""
                    icon={<Zap size={14} className="text-yellow-400" />}
                    sublabel="Tarif actuel du kWh"
                  />

                  <ParamCard
                    label="Consommation Annuelle (kWh)"
                    value={yearlyConsumption}
                    setValue={setYearlyConsumption}
                    step={100}
                    unit=""
                    icon={<Home size={14} className="text-blue-400" />}
                    sublabel="Votre consommation totale"
                  />

                  <ParamCard
                    label="Production Annuelle (kWh)"
                    value={yearlyProduction}
                    setValue={setYearlyProduction}
                    step={100}
                    unit=""
                    icon={<Sun size={14} className="text-orange-400" />}
                    sublabel="kWh produits par an"
                  />
                </div>

                {/* Row 1bis: Autoconsommation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <ParamCard
                    label="Taux d'Autoconsommation (%)"
                    value={selfConsumptionRate}
                    setValue={setSelfConsumptionRate}
                    step={1}
                    min={0}
                    unit="%"
                    icon={<TrendingUp size={14} className="text-emerald-400" />}
                    sublabel={`${Math.round(
                      yearlyProduction * (selfConsumptionRate / 100)
                    )} kWh autoconsommés sur ${formatNum(
                      yearlyProduction
                    )} kWh produits`}
                  />

                  <div className="bg-black/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
                        Taux d'Autonomie
                      </p>
                      <p className="text-2xl font-black text-white">
                        {Math.round(
                          ((yearlyProduction * (selfConsumptionRate / 100)) /
                            yearlyConsumption) *
                            100
                        )}
                        %
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {Math.round(
                          yearlyProduction * (selfConsumptionRate / 100)
                        )}{" "}
                        kWh / {formatNum(yearlyConsumption)} kWh
                      </p>
                    </div>
                  </div>
                </div>
                {/* 🆕 NOUVEAU : Prix de rachat EDF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <ParamCard
                    label="Prix rachat EDF"
                    value={buybackRate}
                    setValue={setBuybackRate}
                    unit="€/kWh"
                    sublabel="Tarif réglementé actuel"
                    icon={<Coins size={14} className="text-yellow-400" />}
                    step={0.01}
                    min={0}
                  />

                  <div className="bg-black/20 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-400">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-1">
                        Revenu Surplus
                      </p>
                      <p className="text-2xl font-black text-white">
                        {formatMoney(
                          Math.round(
                            yearlyProduction *
                              (1 - selfConsumptionRate / 100) *
                              buybackRate
                          )
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {Math.round(
                          yearlyProduction * (1 - selfConsumptionRate / 100)
                        )}{" "}
                        kWh vendus
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Costs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <ParamCard
                    label="Coût Installation (€)"
                    value={installCost}
                    setValue={setInstallCost}
                    step={100}
                    unit=""
                    icon={<Wallet size={14} className="text-purple-400" />}
                    sublabel="Prix total TTC"
                  />
                  <ParamCard
                    label="Apport Cash (€)"
                    value={cashApport}
                    setValue={setCashApport}
                    step={100}
                    unit=""
                    icon={<Coins size={14} className="text-emerald-400" />}
                    sublabel="Montant comptant"
                  />
                  <ParamCard
                    label="Reste à Financer (€)"
                    value={remainingToFinance}
                    setValue={setRemainingToFinance}
                    unit=""
                    icon={<Wallet size={14} className="text-blue-400" />}
                    sublabel="Montant financé"
                    disabled={true}
                  />
                </div>

                {/* Credit Section */}
                <div className="bg-black/20 border border-indigo-500/20 rounded-xl p-6 relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="text-blue-500">
                      <Wallet size={20} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      FINANCEMENT CRÉDIT
                    </h3>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-lg p-4 mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Mode de Calcul
                      </h3>
                      <p className="text-xs text-slate-500">
                        {autoCalculate
                          ? "Calcul automatique de la mensualité"
                          : "Saisie manuelle de la mensualité"}
                      </p>
                    </div>
                    <Toggle
                      checked={autoCalculate}
                      onChange={setAutoCalculate}
                      labelOff="Manuel"
                      labelOn="Auto"
                    />
                  </div>

                  {/* INPUTS ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <ParamCard
                      label="Mensualité Crédit (€)"
                      value={
                        autoCalculate
                          ? Math.round(projectedMonthlyLoan * 100) / 100
                          : creditMonthlyPayment
                      }
                      setValue={setCreditMonthlyPayment}
                      step={1}
                      unit=""
                      icon={<Settings size={14} className="text-blue-400" />}
                      sublabel={
                        autoCalculate
                          ? "Calculé automatiquement"
                          : "Montant mensuel du prêt"
                      }
                      disabled={autoCalculate}
                    />
                    <ParamCard
                      label="Assurance (€/Mois)"
                      value={
                        autoCalculate
                          ? Math.round(projectedMonthlyInsurance * 100) / 100
                          : insuranceMonthlyPayment
                      }
                      setValue={setInsuranceMonthlyPayment}
                      step={0.1}
                      unit=""
                      icon={
                        <ShieldCheck size={14} className="text-orange-400" />
                      }
                      sublabel={
                        autoCalculate
                          ? "Calculée automatiquement"
                          : "Assurance emprunteur mensuelle"
                      }
                      disabled={autoCalculate}
                    />
                  </div>

                  {/* DURATION SLIDER */}
                  <div className="px-2 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Timer size={14} className="text-red-500" />
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Durée Crédit (Mois)
                        </label>
                      </div>
                      <div className="text-3xl font-black text-white">
                        {creditDurationMonths}{" "}
                        <span className="text-sm text-slate-500 font-bold">
                          mois
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="180"
                      step="12"
                      value={creditDurationMonths}
                      onChange={(e) =>
                        setCreditDurationMonths(Number(e.target.value))
                      }
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <p className="text-xs text-slate-600 mt-2 font-mono">
                      Soit {(creditDurationMonths / 12).toFixed(1)} années de
                      remboursement
                    </p>
                  </div>

                  {/* AUTO MODE : RATES INPUTS & APPLY BUTTON */}
                  {autoCalculate && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-white/5 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <ParamCard
                          label="Taux d'intérêt (%)"
                          value={interestRate}
                          setValue={setInterestRate}
                          step={0.01}
                          unit="%"
                          icon={
                            <CheckCircle2
                              size={14}
                              className="text-emerald-400"
                            />
                          }
                          sublabel="Taux annuel du crédit (ex: 3.89%)"
                        />
                        <ParamCard
                          label="Taux Assurance (%)"
                          value={insuranceRate}
                          setValue={setInsuranceRate}
                          step={0.05}
                          unit="%"
                          icon={
                            <ShieldCheck
                              size={14}
                              className="text-orange-400"
                            />
                          }
                          sublabel="Taux annuel (ex: 0%)"
                        />
                      </div>

                      {/* Green Apply Box */}
                      <div className="bg-[#022c22] border border-emerald-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-500/10 p-2 rounded-full text-emerald-400">
                            <CheckCircle2 size={20} />
                          </div>
                          <div>
                            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">
                              Calcul Automatique
                            </h4>
                            <div className="flex gap-8">
                              <div>
                                <p className="text-[10px] text-emerald-200/60 uppercase font-bold">
                                  Mensualité
                                </p>
                                <p className="text-xl font-black text-white">
                                  {formatMoney(projectedMonthlyLoan)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-emerald-200/60 uppercase font-bold">
                                  Assurance
                                </p>
                                <p className="text-xl font-black text-white">
                                  {formatMoney(projectedMonthlyInsurance)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={applyAutoValues}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
                        >
                          <ArrowRight size={16} /> Appliquer Ces Valeurs
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INFO NOTICE IF NO MODAL */}
        {!showParamsEditor && (
          <div className="bg-black/40 backdrop-blur-xl border border-blue-900/30 p-4 rounded-xl flex items-center gap-3 text-blue-200 text-sm hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500">
            <Info size={18} />
            <span>
              Les graphiques et calculs se mettent à jour automatiquement.
            </span>
          </div>
        )}

        {/* YEAR SELECTOR */}
        <div className="flex justify-center">
          <div className="bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 inline-flex shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            {[10, 15, 20, 25].map((y) => (
              <button
                key={y}
                onClick={() => setProjectionYears(y)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  projectionYears === y
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {y} ANS
              </button>
            ))}
          </div>
        </div>

        {/* 2. SECTION AUTONOMY */}
        <div className="bg-black/40 backdrop-blur-xl border border-emerald-500/20 rounded-[24px] p-8 md:p-12 relative overflow-hidden shadow-2xl transition-all duration-500 hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          {/* Subtle ambient light behind */}
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="relative w-48 h-48 flex-shrink-0">
              {/* Cercle autonomie */}
              <svg
                width="192"
                height="192"
                viewBox="0 0 192 192"
                className="absolute"
              >
                {/* Track */}
                <circle
                  cx="96"
                  cy="96"
                  r="75"
                  fill="none"
                  stroke="#022c22"
                  strokeWidth="15"
                />
                {/* Value */}
                <circle
                  cx="96"
                  cy="96"
                  r="75"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="15"
                  strokeDasharray={`${
                    (calculationResult.savingsRatePercent / 100) *
                    2 *
                    Math.PI *
                    75
                  } ${2 * Math.PI * 75}`}
                  strokeDashoffset={0}
                  transform="rotate(-90 96 96)"
                  style={{
                    filter: "drop-shadow(0 0 10px #34d399)",
                    transition: "stroke-dasharray 0.5s ease",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <Zap className="text-emerald-400 w-8 h-8 mb-1 fill-emerald-400/20 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-5xl font-black text-white leading-none text-shadow-neon">
                  {Math.round(
                    ((yearlyProduction * (selfConsumptionRate / 100)) /
                      yearlyConsumption) *
                      100
                  )}
                  %
                </span>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1">
                  Autonomie
                </span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                Autonomie Énergétique
              </h2>
              <p className="text-emerald-200 text-xl font-medium">
                Vous effacez{" "}
                <span className="text-white font-bold">
                  {Math.round(
                    ((yearlyProduction * (selfConsumptionRate / 100)) /
                      yearlyConsumption) *
                      100
                  )}
                  %
                </span>{" "}
                de votre facture d'électricité.
              </p>
              <div className="inline-flex items-center gap-3 bg-emerald-900/40 px-4 py-2 rounded-full border border-emerald-500/30 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse box-shadow-[0_0_10px_#34d399]"></span>
                <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">
                  Sur une consommation de{" "}
                  {formatNum(safeParseFloat(data.params.yearlyConsumption))}{" "}
                  kWh/an
                </span>
              </div>
              <div className="text-emerald-400/80 text-xs italic flex items-center justify-center md:justify-start gap-2">
                <Lightbulb size={12} /> Pendant que vos voisins regardent leur
                facture grimper, la vôtre fond.
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-emerald-500/20 p-8 rounded-3xl min-w-[240px] text-center shadow-xl hover:border-emerald-500/40 transition-colors">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">
                Gain Total Projeté ({projectionYears} ans)
              </div>
              <div className="text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {formatMoney(calculationResult.totalSavingsProjected)}
              </div>
            </div>
          </div>
        </div>

        {/* 3. SECTION REPARTITION - ACTIVITY RINGS STYLE */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 transition-all duration-500 hover:border-violet-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="text-yellow-500" />
            <h2 className="text-xl font-bold uppercase tracking-wide">
              Répartition Énergie
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* NEW ACTIVITY RINGS CHART - FIXED & ANIMATED */}
            <div className="h-[320px] w-full relative flex items-center justify-center">
              {/* Cercle Autoconsommation (extérieur) */}
              <svg
                width="220"
                height="220"
                viewBox="0 0 220 220"
                className="absolute"
              >
                {/* Track */}
                <circle
                  cx="110"
                  cy="110"
                  r="95"
                  fill="none"
                  stroke="#1a1405"
                  strokeWidth="15"
                />
                {/* Value */}
                <circle
                  cx="110"
                  cy="110"
                  r="95"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="15"
                  strokeDasharray={`${
                    (selfConsumptionRate / 100) * 2 * Math.PI * 95
                  } ${2 * Math.PI * 95}`}
                  strokeDashoffset={0}
                  transform="rotate(-90 110 110)"
                  style={{
                    filter: "drop-shadow(0 0 10px #f59e0b)",
                    transition: "stroke-dasharray 0.5s ease",
                  }}
                />
              </svg>

              {/* Cercle Vente (intérieur) */}
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                className="absolute"
              >
                {/* Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#140c1f"
                  strokeWidth="15"
                />
                {/* Value */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="15"
                  strokeDasharray={`${
                    ((100 - selfConsumptionRate) / 100) * 2 * Math.PI * 70
                  } ${2 * Math.PI * 70}`}
                  strokeDashoffset={0}
                  transform="rotate(-90 80 80)"
                  style={{
                    filter: "drop-shadow(0 0 10px #8b5cf6)",
                    transition: "stroke-dasharray 0.5s ease",
                  }}
                />
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Production
                </span>
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {yearlyProduction}
                </span>
                <span className="text-xs text-slate-400">kWh/an</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/60 backdrop-blur-md border border-amber-500/20 p-6 rounded-2xl hover:border-amber-500/40 transition-all hover:translate-x-1 group cursor-default">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] group-hover:animate-pulse"></div>
                  <span className="font-bold text-white">
                    Autoconsommation ({selfConsumptionRate}%)
                  </span>
                </div>
                <div className="text-4xl font-black text-amber-500 mb-1 text-shadow-neon">
                  {formatNum(yearlyProduction * (selfConsumptionRate / 100))}{" "}
                  kWh
                </div>
                <p className="text-xs text-slate-400">
                  Énergie consommée directement chez vous.{" "}
                  <span className="text-amber-500 font-bold">
                    Économie maximale
                  </span>{" "}
                  car aucun coût réseau.
                </p>
              </div>

              <div className="bg-black/60 backdrop-blur-md border border-violet-500/20 p-6 rounded-2xl hover:border-violet-500/40 transition-all hover:translate-x-1 group cursor-default">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6] group-hover:animate-pulse"></div>
                  <span className="font-bold text-white">
                    Vente surplus ({(100 - selfConsumptionRate).toFixed(0)}%)
                  </span>
                </div>
                <div className="text-4xl font-black text-violet-500 mb-1 text-shadow-neon">
                  {formatNum(
                    yearlyProduction * ((100 - selfConsumptionRate) / 100)
                  )}{" "}
                  kWh
                </div>
                <p className="text-xs text-slate-400">
                  Surplus revendu à EDF OA.{" "}
                  <span className="text-violet-400 font-bold">
                    Revenu garanti
                  </span>{" "}
                  pendant 20 ans.
                </p>
              </div>

              <div className="bg-black/60 backdrop-blur-md border border-emerald-900/30 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="font-bold text-emerald-500 uppercase text-xs">
                    OPTIMISATION
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Modifiez le{" "}
                  <span
                    className="text-emerald-400 font-bold cursor-pointer hover:underline"
                    onClick={() => setShowParamsEditor(true)}
                  >
                    taux d'autoconsommation
                  </span>{" "}
                  dans les paramètres pour voir l'impact sur votre rentabilité.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FINANCEMENT VS CASH - VERSION CORRIGÉE */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-emerald-500">
              <Coins size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                FINANCEMENT VS PAIEMENT CASH
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Quel mode de paiement optimise votre écart économique ?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Card Financement */}
            <div className="bg-black/60 backdrop-blur-md border border-blue-900/30 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              {/* Icône background subtile */}
              <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                <Wallet size={120} className="text-blue-500" />
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-400">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase">
                    AVEC FINANCEMENT
                  </h3>
                  <p className="text-blue-300 text-xs">
                    Réallocation budgétaire
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    ÉCART TOTAL ({projectionYears} ANS)
                  </span>
                  <span className="text-xl font-black text-white">
                    {formatMoney(calculationResult.totalSavingsProjected)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    POINT MORT
                  </span>
                  <span className="text-xl font-black text-blue-400">
                    {calculationResult.breakEvenPoint === 1
                      ? "1 an"
                      : `${calculationResult.breakEvenPoint} ans`}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    CAPITAL IMMOBILISÉ
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    0€
                  </span>
                </div>
              </div>

              {/* Avantages */}
              <div className="bg-blue-950/10 border border-blue-900/20 rounded-xl p-4 relative z-10">
                <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-bold uppercase">
                  <CheckCircle2 size={14} /> AVANTAGES
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={12} className="text-blue-500" />
                    Aucun capital immobilisé - Épargne disponible
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={12} className="text-blue-500" />
                    Effort année 1 :{" "}
                    {formatMoney(
                      Math.abs(calculationResult.monthlyEffortYear1)
                    )}{" "}
                    (puis décroissant)
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={12} className="text-blue-500" />
                    Réallocation progressive d'une dépense existante
                  </li>
                </ul>
              </div>
            </div>

            {/* Card Cash */}
            <div className="bg-black/60 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              {/* Icône background subtile */}
              <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                <Coins size={120} className="text-emerald-500" />
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Coins size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase">
                    PAIEMENT CASH
                  </h3>
                  <p className="text-emerald-300 text-xs">
                    Performance maximale
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    ÉCART TOTAL ({projectionYears} ANS)
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {formatMoney(calculationResult.totalSavingsProjectedCash)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    POINT MORT
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {calculationResult.breakEvenPointCash === 1
                      ? "1 an"
                      : `${calculationResult.breakEvenPointCash} ans`}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    PERFORMANCE ANNUELLE
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {calculationResult.roiPercentageCash >= 0 ? "+" : ""}
                    {calculationResult.roiPercentageCash}%
                  </span>
                </div>
              </div>

              {/* Avantages */}
              <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4 relative z-10">
                <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-bold uppercase">
                  <CheckCircle2 size={14} /> AVANTAGES
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Performance supérieure (+
                    {(
                      calculationResult.roiPercentageCash -
                      calculationResult.roiPercentage
                    ).toFixed(1)}
                    % vs crédit)
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Point mort plus rapide (
                    {calculationResult.breakEvenPointCash} ans vs{" "}
                    {calculationResult.breakEvenPoint})
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Pas d'intérêts bancaires - 100% des économies pour vous
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ✅ Badge "Différence" APRÈS les cards (pas superposé) */}
          <div className="flex justify-center mt-8 mb-8">
            <div className="bg-gradient-to-r from-emerald-950/60 to-emerald-900/60 border border-emerald-500/40 px-8 py-4 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 text-center flex items-center gap-2 justify-center">
                <Lock size={12} /> ÉCART CASH VS FINANCEMENT
              </div>
              <div className="text-4xl font-black text-emerald-400 text-center">
                +
                {formatMoney(
                  calculationResult.totalSavingsProjectedCash -
                    calculationResult.totalSavingsProjected
                )}
              </div>
              <div className="text-xs text-emerald-300 mt-1 text-center">
                sur {projectionYears} ans
              </div>
            </div>
          </div>

          {/* ✅ Verdict en 2 blocs - BON ORDRE CETTE FOIS BORDEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GAUCHE = FINANCEMENT STRUCTURÉ (BLEU) */}
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Wallet className="text-blue-400" size={20} />
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wider">
                  FINANCEMENT STRUCTURÉ
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Si vous préférez{" "}
                  <strong className="text-white">
                    conserver votre capital disponible
                  </strong>{" "}
                  (0€ immobilisé).
                </p>
              </div>
            </div>

            {/* DROITE = CASH OPTIMAL (VERT) */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0">
                <CheckCircle2 className="text-emerald-400" size={20} />
              </div>
              <div>
                <h4 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider">
                  CASH OPTIMAL
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Si vous disposez du capital :{" "}
                  <strong className="text-white">
                    +
                    {formatMoney(
                      calculationResult.totalSavingsProjectedCash -
                        calculationResult.totalSavingsProjected
                    )}
                  </strong>{" "}
                  d'écart sur {projectionYears} ans.
                </p>
              </div>
            </div>
          </div>

          {/* Message final */}
          <div className="mt-6 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-slate-400 text-center">
            Les deux scénarios génèrent un écart économique positif. Le scénario
            par défaut (ne rien faire) correspond à une dépense non optimisée.
          </div>
        </div>

        {/* 5. WHERE WILL YOUR MONEY BE - VERSION PERSUASIVE */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-500">
                <HelpCircle size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Votre argent dans {projectionYears} ans
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Où finira chaque euro que vous dépensez aujourd'hui ?
                </p>
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
              <button
                onClick={() => setWhereMoneyMode("financement")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  whereMoneyMode === "financement"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Financement
              </button>
              <button
                onClick={() => setWhereMoneyMode("cash")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  whereMoneyMode === "cash"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Cash
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yearsToDisplay.map((year, idx) => {
              const data = getYearData(year);
              const selectedData =
                whereMoneyMode === "financement" ? data.credit : data.cash;

              // Calculs clairs
              const youPaid = Math.abs(selectedData.cumulativeSpendSolar);
              const youWouldHavePaid = Math.abs(
                selectedData.cumulativeSpendNoSolar
              );
              const difference = youWouldHavePaid - youPaid;

              let headerColor = "text-orange-500";
              let borderColor = "border-orange-500/30";
              let shadowColor = "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]";

              if (year === 10) {
                headerColor = "text-blue-500";
                borderColor = "border-blue-500/30";
                shadowColor = "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]";
              } else if (year === 20) {
                headerColor = "text-emerald-500";
                borderColor = "border-emerald-500/30";
                shadowColor = "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]";
              }

              return (
                <div
                  key={year}
                  className={`relative bg-black/60 backdrop-blur-md border ${borderColor} rounded-2xl p-6 overflow-hidden group transition-all duration-300 hover:border-white/30 ${shadowColor}`}
                >
                  {/* Background année */}
                  <div className="absolute top-4 right-4 text-[140px] font-black text-white opacity-[0.03] leading-none pointer-events-none select-none">
                    {year}
                  </div>

                  <h3
                    className={`${headerColor} font-bold text-sm uppercase mb-6 tracking-wider`}
                  >
                    DANS {year} ANS
                  </h3>

                  <div className="space-y-6 relative z-10">
                    {/* ✅ SCÉNARIO SOLAIRE */}
                    <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 border border-blue-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={14} className="text-blue-400" />
                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                          AVEC INSTALLATION SOLAIRE
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-[9px] text-slate-500 uppercase mb-1">
                            Vous aurez payé
                          </div>
                          <div className="text-xl font-black text-white">
                            {formatMoney(youPaid)}
                          </div>
                        </div>

                        {difference > 0 ? (
                          <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg">
                            <div className="text-[9px] text-emerald-400 uppercase mb-1">
                              💰 Économie réalisée
                            </div>
                            <div className="text-2xl font-black text-emerald-400">
                              {formatMoney(difference)}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-orange-950/40 border border-orange-500/30 p-3 rounded-lg">
                            <div className="text-[9px] text-orange-400 uppercase mb-1">
                              ⏳ Phase d'investissement
                            </div>
                            <div className="text-lg font-black text-orange-400">
                              Rentable dans{" "}
                              {calculationResult.breakEvenPoint - year} ans
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ❌ SCÉNARIO SANS RIEN FAIRE */}
                    <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 border border-red-500/20 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-8 -mt-8">
                        <div className="w-24 h-24 bg-red-500/10 rounded-full blur-xl"></div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 relative z-10">
                        <AlertTriangle size={14} className="text-red-400" />
                        <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                          SANS RIEN FAIRE (STATU QUO)
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className="text-[9px] text-red-300 uppercase mb-1">
                          Argent définitivement perdu
                        </div>
                        <div className="text-2xl font-black text-red-400">
                          {formatMoney(youWouldHavePaid)}
                        </div>
                      </div>

                      {difference > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-900/30 relative z-10">
                          <div className="text-[9px] text-red-500 uppercase mb-1">
                            💸 Manque à gagner
                          </div>
                          <div className="text-xl font-black text-red-500">
                            {formatMoney(difference)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ COMPARAISON VISUELLE CLAIRE */}
                    {year === 20 && difference > 0 && (
                      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/40 p-4 rounded-xl backdrop-blur-md">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase mb-2 text-center">
                          🎯 RÉSULTAT FINAL
                        </div>
                        <div className="text-3xl font-black text-emerald-400 text-center">
                          +{formatMoney(difference)}
                        </div>
                        <div className="text-[9px] text-emerald-300 text-center mt-1">
                          dans votre patrimoine au lieu de 0€
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message psychologique */}
                  <div
                    className={`mt-6 pt-6 border-t border-white/5 text-xs font-medium ${
                      year === 20
                        ? "text-emerald-400"
                        : year === 10
                        ? "text-blue-400"
                        : "text-orange-400"
                    }`}
                  >
                    {year === 5 &&
                      "⏱️ Chaque mois compte - l'écart commence à se creuser"}
                    {year === 10 && "📈 L'effet boule de neige est lancé"}
                    {year === 20 && "🏆 Un capital transmissible à vos enfants"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ⚠️ URGENCE PSYCHOLOGIQUE */}
          <div className="mt-8 bg-gradient-to-r from-orange-950/40 to-red-950/40 border-l-4 border-orange-500 p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <Clock className="text-orange-400 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-orange-400 font-bold text-lg mb-2">
                  ⏰ Chaque mois d'attente coûte{" "}
                  {formatMoney(calculationResult.oldMonthlyBillYear1)}
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Pendant que vous réfléchissez, votre compteur tourne.{" "}
                  <strong className="text-white">Attendre 1 an</strong> ={" "}
                  <strong className="text-red-400">
                    {formatMoney(calculationResult.lossIfWait1Year)}
                  </strong>{" "}
                  partis définitivement. Ces euros auraient pu{" "}
                  <strong className="text-emerald-400">
                    travailler pour vous pendant {projectionYears} ans
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. COMPARISON WITH OTHER OPTIONS - VERSION EDF */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Landmark size={120} className="text-purple-500" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="text-purple-500">
                <Landmark size={28} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Comparaison avec vos autres options
              </h2>
            </div>

            {/* MESSAGE MÉTHODOLOGIQUE + 2 POP-UPS */}
            <div className="mb-6 bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start gap-3 mb-3">
                <p className="flex-1 text-sm text-gray-300">
                  Les deux scénarios sont présentés de manière strictement
                  symétrique. La différence observée provient uniquement du mode
                  de production de l'énergie.
                </p>
                <InfoPopup title="D'où viennent ces chiffres ?">
                  <p className="mb-3">
                    Les calculs sont basés sur{" "}
                    <strong>votre consommation déclarée</strong>, les tarifs
                    réglementés en vigueur et des hypothèses d'évolution
                    prudentes (inflation énergétique{" "}
                    {calculationResult.year1?.edfBillWithoutSolar
                      ? "5%"
                      : "standard"}
                    ).
                  </p>
                  <p className="mb-3">
                    <strong>Les mêmes paramètres</strong> sont appliqués à tous
                    les scénarios (avec solaire, sans solaire, Livret A, SCPI).
                  </p>
                  <p className="text-blue-300 text-xs">
                    Cette symétrie méthodologique garantit que la différence
                    observée provient uniquement du mode de production, pas d'un
                    biais de calcul.
                  </p>
                </InfoPopup>
              </div>

              {/* POP-UP ROBUSTESSE AJOUTÉE ICI */}
              <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                <p className="flex-1 text-sm text-gray-300">
                  Même avec une stagnation des prix de l'énergie, l'installation
                  reste pertinente car elle remplace une dépense par une
                  autoproduction à coût marginal quasi nul.
                </p>
                <InfoPopup title="Et si les prix n'augmentent pas ?">
                  <p className="mb-3">
                    Si les prix de l'énergie{" "}
                    <strong>restaient constants</strong>, l'écart économique
                    serait réduit, mais{" "}
                    <strong>la hiérarchie resterait identique</strong>
                    (solaire {">"} pas de solaire).
                  </p>
                  <p className="mb-3">
                    Le solaire agit en <strong>réduisant une dépendance</strong>
                    , pas en spéculant sur une hausse. Vous produisez une partie
                    de votre énergie plutôt que de l'acheter intégralement au
                    réseau.
                  </p>
                  <p className="text-blue-300 text-xs">
                    Même avec une inflation énergétique nulle, vous économisez
                    sur votre facture dès la première année grâce à
                    l'autoconsommation.
                  </p>
                </InfoPopup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* LIVRET A */}
              <div className="flex flex-col gap-3">
                <div className="bg-black/60 backdrop-blur-md border border-blue-900/20 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400">
                        <Landmark size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          Livret A
                        </h3>
                        <p className="text-[10px] text-blue-300">
                          Capital bloqué
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-blue-500 mb-2">
                      2.7%
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Performance annuelle
                    </div>
                  </div>
                </div>
                {/* GAIN CARD */}
                <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl">
                  <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">
                    Gain sur {projectionYears} ans
                  </div>
                  <div className="text-xl font-black text-blue-400">
                    {formatMoney(
                      installCost * Math.pow(1.027, projectionYears) -
                        installCost
                    )}
                  </div>
                </div>
              </div>

              {/* ASSURANCE VIE */}
              <div className="flex flex-col gap-3">
                <div className="bg-black/60 backdrop-blur-md border border-purple-900/20 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-900/30 p-2 rounded-lg text-purple-400">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          Assurance Vie
                        </h3>
                        <p className="text-[10px] text-purple-300">
                          Frais de gestion
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-purple-500 mb-2">
                      3.5%
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Performance annuelle
                    </div>
                  </div>
                </div>
                {/* GAIN CARD */}
                <div className="bg-purple-950/20 border border-purple-900/30 p-4 rounded-xl">
                  <div className="text-[10px] text-purple-400 font-bold uppercase mb-1">
                    Gain sur {projectionYears} ans
                  </div>
                  <div className="text-xl font-black text-purple-400">
                    {formatMoney(
                      installCost * Math.pow(1.035, projectionYears) -
                        installCost
                    )}
                  </div>
                </div>
              </div>

              {/* SCPI */}
              <div className="flex flex-col gap-3">
                <div className="bg-black/60 backdrop-blur-md border border-orange-900/20 p-6 rounded-2xl flex flex-col justify-between group transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-orange-900/30 p-2 rounded-lg text-orange-400">
                        <Home size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          SCPI/Immobilier
                        </h3>
                        <p className="text-[10px] text-orange-300">Illiquide</p>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-orange-500 mb-2">
                      4.5%
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Performance annuelle
                    </div>
                  </div>
                </div>
                {/* GAIN CARD */}
                <div className="bg-orange-950/20 border border-orange-900/30 p-4 rounded-xl">
                  <div className="text-[10px] text-orange-400 font-bold uppercase mb-1">
                    Gain sur {projectionYears} ans
                  </div>
                  <div className="text-xl font-black text-orange-400">
                    {formatMoney(
                      installCost * Math.pow(1.045, projectionYears) -
                        installCost
                    )}
                  </div>
                </div>
              </div>

              {/* SOLAIRE - VERSION EDF CORRIGÉE */}
              <div className="flex flex-col gap-3">
                <div className="bg-[#022c22] border border-emerald-500 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] transform md:scale-105 transition-all duration-300 hover:scale-[1.07] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                  <div className="absolute top-3 right-3 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase shadow-lg">
                    Meilleur Choix
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                        <Sun size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm uppercase">
                          Solaire
                        </h3>
                        <p className="text-[10px] text-emerald-300">
                          Sans immobiliser de capital
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-emerald-400 mb-2 text-shadow-neon">
                      0€
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4">
                      Capital bloqué
                    </div>
                    <div className="border-t border-emerald-500/30 pt-3 text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      Vous réduisez votre dépendance au réseau
                    </div>
                  </div>
                </div>
                {/* GAIN CARD */}
                <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                    Écart sur {projectionYears} ans
                  </div>
                  <div className="text-xl font-black text-emerald-400">
                    {formatMoney(calculationResult.totalSavingsProjected)}
                  </div>
                  <div className="text-[9px] text-emerald-300 mt-1">
                    Équivalent à{" "}
                    {formatMoney(calculationResult.bankEquivalentCapital)} sur
                    un Livret A
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-3">
              <Lightbulb
                size={20}
                className="text-yellow-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-slate-300">
                <strong className="text-white">La différence ?</strong> Les
                placements classiques{" "}
                <span className="text-red-400">immobilisent votre capital</span>
                . Le solaire permet de{" "}
                <span className="text-emerald-400">
                  redistribuer dans le temps une dépense énergétique existante
                </span>
                , tout en conservant votre épargne disponible pour d'autres
                opportunités.
              </p>
            </div>
          </div>
        </div>

        {/* 7. CAPITAL PATRIMONIAL & SIDE CARDS - VERSION EDF */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* LEFT: CAPITAL PATRIMONIAL */}
          <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-40 pointer-events-none">
              <Wallet size={200} className="text-blue-500/20" />
            </div>

            <div className="relative z-10">
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <div className="bg-black/40 backdrop-blur-md border border-blue-500/30 text-blue-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Lock size={12} /> PROJECTION {projectionYears} ANS
                </div>
                <div className="bg-[#062c1e] border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={12} /> 0€ D'APPORT
                </div>
              </div>
              <h2 className="text-xl text-slate-400 font-medium mb-1">
                Écart Économique Cumulé
              </h2>
              <div className="text-7xl font-black text-white tracking-tighter mb-8">
                {formatMoney(calculationResult.totalSavingsProjected)}
              </div>
              {/* Info Box - VERSION ÉPURÉE ET VISUELLE */}
              <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Comment est calculé cet écart ?
                  </h3>
                </div>

                {/* Visuel simple avec 3 cartes */}
                <div className="space-y-3">
                  {/* Carte 1 : Sans solaire */}
                  <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-red-400 font-bold uppercase">
                          Scénario sans solaire
                        </div>
                        <div className="text-xs text-slate-300">
                          Dépense énergétique totale sur {projectionYears} ans
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-red-400">
                      {Math.round(calculationResult.totalSpendNoSolar / 1000)}k€
                    </div>
                  </div>

                  {/* Flèche MOINS */}
                  <div className="flex items-center justify-center">
                    <div className="text-slate-500 text-sm font-bold">
                      MOINS
                    </div>
                  </div>

                  {/* Carte 2 : Avec solaire */}
                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-blue-400 font-bold uppercase">
                          Scénario avec solaire
                        </div>
                        <div className="text-xs text-slate-300">
                          Réorganisation budget + facture résiduelle
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-blue-400">
                      {Math.round(calculationResult.totalSpendSolar / 1000)}k€
                    </div>
                  </div>

                  {/* Flèche ÉGALE */}
                  <div className="flex items-center justify-center">
                    <div className="text-slate-500 text-sm font-bold">=</div>
                  </div>

                  {/* Carte 3 : Résultat */}
                  <div className="bg-emerald-950/30 border-2 border-emerald-500/40 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-emerald-400 font-bold uppercase">
                          Votre gain net
                        </div>
                        <div className="text-xs text-slate-300">
                          Écart économique cumulé
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400">
                      +
                      {Math.round(
                        calculationResult.totalSavingsProjected / 1000
                      )}
                      k€
                    </div>
                  </div>
                </div>

                {/* Note en bas */}
                <div className="mt-4 bg-yellow-950/20 border-l-4 border-yellow-500 rounded p-3 flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className="text-yellow-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-yellow-200/90 leading-relaxed">
                    <span className="font-bold">Les premières années</span>{" "}
                    correspondent à une phase de réorganisation budgétaire. Dès
                    l'année {Math.ceil(creditDurationMonths / 12 / 2)}, vous
                    commencez à économiser. Après remboursement (
                    {Math.ceil(creditDurationMonths / 12)} ans), les économies
                    deviennent massives et permanentes.
                  </p>
                </div>
              </div>
              {/* AJOUTE CES IMPORTS EN HAUT DU FICHIER SI PAS DÉJÀ PRÉSENTS */}
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">
                    CAPITAL IMMOBILISÉ
                  </div>
                  <div className="text-2xl font-black text-emerald-400">0€</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Épargne disponible
                  </div>
                </div>

                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                  <div className="text-[10px] font-bold text-blue-500 uppercase mb-1">
                    ÉCART MOYEN
                  </div>
                  <div className="text-2xl font-black text-white">
                    +
                    {Math.round(
                      calculationResult.totalSavingsProjected / projectionYears
                    )}{" "}
                    €/an
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Performance annuelle
                  </div>
                </div>

                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl relative group cursor-help">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase mb-1">
                    POINT MORT <HelpCircle size={10} />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {calculationResult.breakEvenPoint === 1
                      ? "1 an"
                      : `${calculationResult.breakEvenPoint} ans`}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Écart cumulatif positif
                  </div>

                  {/* Tooltip Point Mort */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1e293b] border border-emerald-500/30 p-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase">
                      <Target size={14} /> C'est quoi le point mort ?
                    </div>
                    <p className="text-xs text-white mb-2 font-bold">
                      C'EST L'ANNÉE OÙ L'ÉCART CUMULATIF DEVIENT POSITIF.
                    </p>
                    <div className="space-y-1 text-[10px] font-mono border-t border-white/10 pt-2">
                      <div className="flex justify-between text-slate-400">
                        <span>
                          AVANT{" "}
                          {calculationResult.breakEvenPoint === 1
                            ? "1 AN"
                            : `${calculationResult.breakEvenPoint} ANS`}
                        </span>
                        <span>= RÉALLOCATION</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>
                          APRÈS{" "}
                          {calculationResult.breakEvenPoint === 1
                            ? "1 AN"
                            : `${calculationResult.breakEvenPoint} ANS`}
                        </span>
                        <span>= ÉCONOMIES NETTES</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                    ÉQUIVALENT LIVRET A
                  </div>
                  <div className="text-2xl font-black text-yellow-400">
                    {Math.round(calculationResult.bankEquivalentCapital / 1000)}
                    k€
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Capital à bloquer
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SIDE CARDS */}
          <div className="space-y-6 flex flex-col">
            {/* 1. EQUIVALENT BANCAIRE */}
            <div className="flex-1 bg-black/40 backdrop-blur-xl border border-blue-900/30 rounded-[32px] p-8 flex flex-col justify-center shadow-lg shadow-blue-900/10 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <div className="flex items-center gap-3 mb-6">
                <Landmark className="text-blue-500 w-6 h-6" />
                <h3 className="text-sm font-bold text-blue-100 uppercase tracking-widest">
                  ÉQUIVALENT BANCAIRE
                </h3>
              </div>

              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Pour générer{" "}
                <span className="text-white font-bold">
                  {Math.round(
                    calculationResult.totalSavingsProjected / projectionYears
                  )}{" "}
                  €/an
                </span>{" "}
                avec un Livret A, il vous faudrait bloquer :
              </p>

              <div className="text-5xl font-black text-white mb-6">
                {formatMoney(calculationResult.bankEquivalentCapital)}
              </div>

              <div className="inline-block bg-[#172554] border border-blue-500/30 px-3 py-1.5 rounded text-[10px] font-bold text-blue-300 uppercase tracking-wide w-fit">
                ICI, VOUS NE BLOQUEZ RIEN.
              </div>

              <div className="mt-8 flex gap-2 text-[10px] text-slate-500 italic border-t border-white/5 pt-4">
                <Coins size={12} className="text-yellow-500" />
                Avec le solaire, votre capital reste disponible pendant que vous
                optimisez une dépense existante.
              </div>
            </div>

            {/* 2. EFFORT D'EPARGNE */}
            <div className="bg-black/40 backdrop-blur-xl border border-orange-900/30 rounded-[32px] p-8 flex flex-col justify-center shadow-lg shadow-orange-900/10 transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  </div>
                  <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest">
                    RÉALLOCATION ANNÉE 1
                  </h3>
                </div>
                <HelpCircle size={16} className="text-slate-600" />
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <div className="text-5xl font-black text-white">
                  +{formatMoney(Math.abs(calculationResult.monthlyEffortYear1))}
                </div>
                <div className="text-sm text-slate-500 font-medium">/mois</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs font-medium border-b border-white/5 pb-2">
                  <span className="text-slate-400">DÉTAIL :</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Nouveau Budget :</span>
                  <span className="text-white">
                    {formatMoney(calculationResult.newMonthlyBillYear1)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">Ancien Budget :</span>
                  <span className="text-red-400">
                    -{formatMoney(calculationResult.oldMonthlyBillYear1)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-black pt-2 border-t border-white/10">
                  <span className="text-orange-500">= Réallocation</span>
                  <span className="text-white">
                    {formatMoney(
                      Math.abs(calculationResult.monthlyEffortYear1)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 text-[10px] text-orange-400/80 italic">
                <Zap size={12} className="text-orange-500 flex-shrink-0" />
                Cet effort décroît progressivement avec l'inflation (voir
                tableau détaillé). Après remboursement, vous économisez{" "}
                {formatMoney(calculationResult.oldMonthlyBillYear1)}/mois.
              </div>
            </div>
          </div>
        </div>

        {/* 8. BILAN TOTAL SUR 20 ANS - VERSION BARRES 3D MASSIVES */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 mt-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <Scale className="text-slate-400 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  BILAN TOTAL SUR {projectionYears} ANS
                </h2>
                <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                  <Lightbulb size={12} className="text-yellow-500/70" />
                  Imaginez ces barres comme deux comptes bancaires...
                </div>
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
              <button
                onClick={() => setGouffreMode("financement")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  gouffreMode === "financement"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Financement
              </button>
              <button
                onClick={() => setGouffreMode("cash")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  gouffreMode === "cash"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Cash
              </button>
            </div>
          </div>

          <div className="space-y-12">
            {/* BARRE ROUGE - Sans Solaire */}
            <div className="relative group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                    Sans Solaire (Dépense non valorisée)
                  </span>
                </div>
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {formatMoney(
                    gouffreMode === "financement"
                      ? calculationResult.totalSpendNoSolar
                      : calculationResult.totalSpendNoSolarCash
                  )}
                </span>
              </div>

              {/* BARRE MASSIVE 3D - ROUGE */}
              <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-red-900/40 overflow-hidden shadow-2xl">
                {/* Barre de progression avec gradient vertical */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)]">
                  {/* Effet shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                  {/* Highlight top */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>

                  {/* Shadow bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-red-400/70 text-sm italic">
                <Flame size={14} />
                Cet argent est parti pour toujours.
              </div>
            </div>

            {/* BARRE BLEUE/VERTE - Avec Solaire */}
            <div className="relative group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full shadow-[0_0_12px] animate-pulse ${
                      gouffreMode === "cash"
                        ? "bg-emerald-500 shadow-emerald-500"
                        : "bg-blue-500 shadow-blue-500"
                    }`}
                  ></div>
                  <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                    Avec Solaire (Investissement patrimonial)
                  </span>
                </div>
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {formatMoney(
                    gouffreMode === "financement"
                      ? calculationResult.totalSpendSolar
                      : calculationResult.totalSpendSolarCash
                  )}
                </span>
              </div>

              {/* BARRE MASSIVE 3D - BLEUE/VERTE PROPORTIONNELLE */}
              <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Fond grisé pour la partie vide */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-slate-900/30"></div>

                {/* Barre de progression proportionnelle avec gradient vertical */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-1000 ${
                    gouffreMode === "cash"
                      ? "bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700"
                      : "bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700"
                  }`}
                  style={{
                    width: `${
                      gouffreMode === "financement"
                        ? (calculationResult.totalSpendSolar /
                            calculationResult.totalSpendNoSolar) *
                          100
                        : (calculationResult.totalSpendSolarCash /
                            calculationResult.totalSpendNoSolarCash) *
                          100
                    }%`,
                  }}
                >
                  {/* Effet shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                  {/* Highlight top */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>

                  {/* Shadow bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div
                  className={`flex items-center gap-2 text-sm italic ${
                    gouffreMode === "cash"
                      ? "text-emerald-400/70"
                      : "text-blue-400/70"
                  }`}
                >
                  <Zap size={14} />
                  Cette dépense génère un actif qui produit pendant 25+ ans.
                </div>

                {/* Badge différence - style cohérent */}
                <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105">
                  <Coins size={16} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400/70 font-bold uppercase tracking-wider">
                    Différence :
                  </span>
                  <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    {formatMoney(
                      gouffreMode === "financement"
                        ? calculationResult.totalSavingsProjected
                        : calculationResult.totalSavingsProjectedCash
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Message explicatif - style cohérent */}
          <div className="mt-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 flex items-start gap-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex-shrink-0">
              <Info size={16} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">
                Pourquoi cette différence ?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Le scénario{" "}
                <strong className="text-red-400">sans solaire</strong>{" "}
                représente une dépense pure qui n'a aucune contrepartie. Le
                scénario <strong className="text-blue-400">avec solaire</strong>{" "}
                transforme cette dépense en investissement patrimonial qui
                génère de la valeur pendant plus de 25 ans.
              </p>
            </div>
          </div>
        </div>

        {/* 9. LOCATAIRE VS PROPRIETAIRE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Locataire */}
          <div className="bg-black/40 backdrop-blur-xl border border-red-900/30 rounded-[24px] p-8 relative overflow-hidden transition-all duration-300 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="absolute top-4 right-4 bg-red-950/50 text-red-500 text-[10px] font-bold px-3 py-1 rounded border border-red-900/50 uppercase">
              Modèle Dépassé
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#1a0505] border border-red-900/30 flex items-center justify-center text-red-500">
                <Ban size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase">
                  LOCATAIRE ÉNERGÉTIQUE
                </h3>
              </div>
            </div>

            <p className="text-red-200 text-sm font-medium mb-6">
              Vous louez l'électricité que vous consommez. Chaque euro payé
              disparaît.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                Vous subissez 100% des hausses (inflation sans fin)
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                0€ de capital créé après {projectionYears} ans (facture
                éternelle)
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                Dépendance totale aux décisions politiques
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                Votre facture finance les profits des actionnaires
              </li>
            </ul>

            <div className="mt-8 h-1.5 bg-red-900/20 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 w-3/4"></div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-red-500/60 italic">
              <TrendingUp size={12} className="transform rotate-180" /> Pendant
              que vous payez, votre pouvoir d'achat s'érode.
            </div>
          </div>

          {/* Proprietaire */}
          <div className="bg-black/40 backdrop-blur-xl border border-blue-600/30 rounded-[24px] p-8 relative overflow-hidden shadow-2xl shadow-blue-900/10 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg uppercase">
              Votre Liberté
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Crown size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase">
                  PROPRIÉTAIRE PRODUCTEUR
                </h3>
              </div>
            </div>

            <p className="text-blue-100 text-sm font-medium mb-6">
              Vous possédez votre centrale. Chaque kWh produit vous appartient.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white">
                <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                Prix stabilisé par autoproduction pendant 30 ans
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                Vous créez un patrimoine transmissible et valorisable
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                Indépendance face aux crises énergétiques
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                Vous êtes la banque : vous financez avec vos économies futures
              </li>
            </ul>

            <div className="mt-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-2/3"></div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-400 italic font-medium">
              <TrendingUp size={12} /> Pendant que vous économisez, votre
              patrimoine grandit.
            </div>
          </div>
        </div>

        {/* 10. GARANTIES & SECURITE */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 mt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-orange-500 w-6 h-6" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                GARANTIES & SÉCURITÉ
              </h2>
            </div>
            <Toggle
              checked={warrantyMode}
              onChange={setWarrantyMode}
              labelOff="Essentielle (TVA 5.5%)"
              labelOn="Performance (TVA 20%)"
            />
          </div>

          {/* INFO BANNER - Dynamic */}
          {!warrantyMode ? (
            // MODE ESSENTIEL
            <div className="bg-[#021c15] border border-emerald-500/30 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  OFFRE ESSENTIELLE - TVA RÉDUITE 5.5%
                </span>
              </div>
              <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Panneaux - 25 ANS
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Production garantie -0.4%/an
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Fabrication française
                </div>
              </div>
            </div>
          ) : (
            // MODE PERFORMANCE
            <div className="bg-black/60 backdrop-blur-md border border-blue-900/30 rounded-xl p-4 mb-8 flex items-center gap-3">
              <Award className="text-blue-400 w-4 h-4" />
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                OFFRE PERFORMANCE - TVA 20%
              </span>
              <span className="text-xs text-slate-500 ml-auto hidden md:block">
                Garantie maximale avec autopilote IA, afficheur temps réel et
                production garantie À VIE.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {warranties.map((w, i) => (
              <WarrantyCard
                key={i}
                years={w.years}
                label={w.label}
                tag={w.tag}
                icon={w.icon}
                description={w.description}
                isFr={!warrantyMode && w.label === "PANNEAUX" && i === 0}
              />
            ))}
          </div>

          {/* Bloc explicatif garanties avec pop-up */}
          <div className="mt-6 bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded flex items-start gap-3">
            <p className="text-sm text-gray-300 flex-1">
              <strong>Garantie de performance</strong> : Indemnisation si
              production annuelle inférieure aux engagements contractuels.
              <strong>Garantie matériel</strong> : Remplacement pièces, main
              d'œuvre et déplacement selon les conditions de l'offre{" "}
              {warrantyMode ? "Performance" : "Essentiel"}.
            </p>
            <InfoPopup title="Garantie - ce que ça veut dire exactement">
              <p className="mb-3">
                <strong>Garantie de performance :</strong> Maintenue tant que
                l'installation reste la propriété du client, conformément aux
                engagements EDF Solutions Solaires (
                {warrantyMode ? "30 ans" : "25 ans"}).
              </p>
              <p className="mb-3">
                Si la production annuelle est{" "}
                <strong>inférieure aux seuils contractuels</strong>, EDF verse
                une indemnisation financière pour compenser l'écart.
              </p>
              <p className="mb-3">
                <strong>Garantie matériel :</strong>
                {warrantyMode
                  ? " À vie pour les clients Performance (pièces, M.O., déplacement)."
                  : " 10 à 25 ans selon composants (voir détails par élément)."}
              </p>
              <p className="text-blue-300 text-xs">
                Les paramètres contractuels sont encadrés et documentés dans le
                contrat EDF Solutions Solaires signé.
              </p>
            </InfoPopup>
          </div>

          {/* Difference Block (Only if Warranty Mode is OFF/Essentielle) */}
          {!warrantyMode && (
            <div className="mt-6 bg-[#0f0505] border border-red-900/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-orange-500" size={20} />
                <h3 className="font-bold text-white text-sm">
                  Différences avec l'offre Performance
                </h3>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs text-slate-400">
                  <X size={14} className="text-red-500" /> Garantie standard (25
                  ans) vs Garantie À VIE (Performance)
                </li>
                <li className="flex items-center gap-2 text-xs text-white font-bold">
                  <CheckCircle2 size={14} className="text-emerald-500" /> TVA
                  réduite à 5.5% (économie immédiate de ~2700€)
                </li>
                <li className="flex items-center gap-2 text-xs text-white font-bold">
                  <CheckCircle2 size={14} className="text-emerald-500" />{" "}
                  Panneaux fabriqués en France
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={14} className="text-slate-500" />{" "}
                  Autopilote IA & Afficheur inclus (comme Performance)
                </li>
              </ul>
              <button
                onClick={() => setWarrantyMode(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider hover:from-blue-500 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} /> PASSER À L'OFFRE PERFORMANCE (GARANTIE
                À VIE)
              </button>
            </div>
          )}

          {/* Autopilote YUZE - VERSION OPTIMISÉE (SHOWN FOR BOTH MODES NOW) */}

          <div className="bg-[#110e1c] border border-indigo-500/20 rounded-2xl p-6 mt-6 flex flex-col md:flex-row items-start gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Bot size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white uppercase">
                  SYSTÈME YUZE - SUPERVISION INTELLIGENTE EDF
                </h3>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">
                  Inclus
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-6 flex items-start gap-2">
                Système développé par les ingénieurs EDF Solutions Solaires
                (Limonest - Lyon). Surveillance continue par algorithmes IA.
                Détection des écarts de performance et déclenchement des
                interventions selon les procédures EDF.
                <InfoPopup title="Organisation industrielle EDF">
                  <p className="mb-3">
                    Le système de supervision EDF Solutions Solaires{" "}
                    <strong>surveille en continu</strong>
                    la production de votre installation.
                  </p>
                  <p className="mb-3">
                    En cas d'écart significatif entre production réelle et
                    production théorique (météo, ensoleillement), le système{" "}
                    <strong>détecte l'anomalie</strong> et génère une alerte
                    automatique.
                  </p>
                  <p className="mb-3">
                    Les équipes techniques EDF{" "}
                    <strong>déclenchent alors les interventions</strong>
                    selon les procédures du groupe : diagnostic à distance,
                    planification intervention, remplacement pièces si
                    nécessaire.
                  </p>
                  <p className="text-blue-300 text-xs">
                    Cette organisation industrielle s'appuie sur les standards
                    et l'infrastructure technique du groupe EDF, avec historique
                    des interventions et traçabilité complète.
                  </p>
                </InfoPopup>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0b0d14] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-blue-200 uppercase">
                      SURVEILLANCE CONTINUE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Monitoring temps réel de chaque panneau. Analyse des
                    performances vs données météo et production théorique.
                  </p>
                </div>
                <div className="bg-[#0b0d14] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-bold text-blue-200 uppercase">
                      ALGORITHMES IA
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Apprentissage automatique de vos habitudes de consommation
                    pour optimiser l'autoconsommation et maximiser vos
                    économies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AFFICHEUR CONNECTE (SHOWN FOR BOTH MODES) */}
          <div className="bg-[#150a15] border border-pink-900/30 rounded-2xl p-6 mt-6 flex flex-col md:flex-row items-start gap-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
            <div className="w-12 h-12 bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-400 flex-shrink-0">
              <Eye size={24} />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white uppercase">
                  AFFICHEUR CONNECTÉ EN TEMPS RÉEL
                </h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Suivez votre production, votre consommation et vos économies
                depuis votre smartphone ou tablette.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <Zap size={20} className="text-yellow-400 mb-2" />
                  <div className="text-xs font-bold text-white mb-1">
                    Production Live
                  </div>
                  <div className="text-[10px] text-slate-500">
                    kW actuels + Cumul jour
                  </div>
                </div>
                <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <Home size={20} className="text-orange-400 mb-2" />
                  <div className="text-xs font-bold text-white mb-1">
                    Consommation Live
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Appareil par appareil
                  </div>
                </div>
                <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <Coins size={20} className="text-emerald-400 mb-2" />
                  <div className="text-xs font-bold text-white mb-1">
                    Économies Temps Réel
                  </div>
                  <div className="text-[10px] text-slate-500">
                    € économisés aujourd'hui
                  </div>
                </div>
              </div>

              <div className="bg-[#2a1020] border border-pink-500/20 p-3 rounded-lg flex items-center gap-3 text-xs text-pink-200">
                <Info size={16} className="text-pink-500 flex-shrink-0" />
                Optimisez vos consommations : l'afficheur vous suggère les
                meilleurs moments pour lancer lave-linge, lave-vaisselle, etc.
              </div>
            </div>
          </div>

          {/* RESULTAT BANNER */}
          <div className="bg-[#040912] border border-blue-900/40 p-4 rounded-xl mt-6 flex items-center gap-3 shadow-lg shadow-blue-900/10 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
            <ShieldCheck size={20} className="text-orange-400 flex-shrink-0" />
            <p className="text-sm text-blue-200 font-bold">
              RÉSULTAT : Vous dormez tranquille. Nous surveillons tout 24/7. Si
              problème, on intervient gratuitement. Si sous-production, on paie
              la différence.
            </p>
          </div>
        </div>

        {/* 11. STRUCTURE DU BUDGET (MENSUEL) - VERSION DYNAMIQUE 3D */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 mt-8 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Scale className="text-slate-400 w-6 h-6" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                STRUCTURE DU BUDGET (MENSUEL)
              </h2>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded text-xs font-bold text-slate-400 border border-white/10">
              Année 1 - Comparatif
            </div>
          </div>

          <div className="space-y-12">
            {/* Situation Actuelle */}
            <div>
              <div className="flex justify-between text-sm font-bold uppercase text-slate-400 mb-6">
                <span>SITUATION ACTUELLE</span>
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {formatMoney(calculationResult.oldMonthlyBillYear1)} /mois
                </span>
              </div>

              {/* BARRE ROUGE MASSIVE 3D */}
              <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-red-900/40 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)]">
                  {/* Effet shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                  {/* Highlight top */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>

                  {/* Shadow bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>

                  {/* Texte à l'intérieur */}
                  <div className="absolute inset-0 flex items-center justify-between px-8">
                    <span className="text-white font-black text-2xl uppercase tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                      FACTURE ACTUELLE
                    </span>
                    <span className="text-white/30 font-black text-5xl uppercase tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                      100% PERTE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projet Solaire */}
            <div>
              <div className="flex justify-between text-sm font-bold uppercase text-slate-400 mb-6">
                <span>PROJET SOLAIRE</span>
                <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {formatMoney(calculationResult.year1.totalWithSolar / 12)}{" "}
                  /mois
                </span>
              </div>

              {/* BARRE DOUBLE MASSIVE 3D - CRÉDIT + RESTE - PROPORTIONS DYNAMIQUES */}
              <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex">
                {/* PARTIE CRÉDIT (BLEUE) - LARGEUR DYNAMIQUE */}
                <div
                  className="relative bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500"
                  style={{
                    width: `${
                      (calculationResult.year1.creditPayment /
                        12 /
                        (calculationResult.year1.totalWithSolar / 12)) *
                      100
                    }%`,
                  }}
                >
                  {/* Effet shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                  {/* Highlight top */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>

                  {/* Shadow bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>

                  {/* Texte */}
                  <div className="absolute inset-0 flex flex-col justify-center px-6">
                    <span className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">
                      CRÉDIT
                    </span>
                    <span className="text-white font-black text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                      {formatMoney(calculationResult.year1.creditPayment / 12)}
                    </span>
                  </div>
                </div>

                {/* SÉPARATEUR */}
                <div className="w-1 bg-black/40"></div>

                {/* PARTIE RESTE (ORANGE) - LARGEUR DYNAMIQUE */}
                <div
                  className="relative bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500"
                  style={{
                    width: `${
                      (calculationResult.year1.edfResidue /
                        12 /
                        (calculationResult.year1.totalWithSolar / 12)) *
                      100
                    }%`,
                  }}
                >
                  {/* Effet shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                  {/* Highlight top */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>

                  {/* Shadow bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>

                  {/* Texte */}
                  <div className="absolute inset-0 flex flex-col justify-center px-6">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                      RESTE
                    </span>
                    <span className="text-amber-950 font-black text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                      {formatMoney(calculationResult.year1.edfResidue / 12)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 12. SURCOÛT MENSUEL CHART */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 mt-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-emerald-500 w-6 h-6" />
              <div>
                {/* TITRE CORRIGÉ */}
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  SURCOÛT MENSUEL ({projectionYears} ans)
                </h2>
                <p className="text-slate-500 text-sm">
                  Différence mensuelle vs situation sans panneaux
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* LÉGENDE CORRIGÉE */}
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase mr-4">
                <div className="flex items-center gap-1 text-slate-400">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  Surcoût
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  Économie
                </div>
              </div>
              <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                <button
                  onClick={() => setEconomyChartMode("financement")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    economyChartMode === "financement"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <Wallet size={12} className="inline mr-1 mb-0.5" />
                  Financement
                </button>
                <button
                  onClick={() => setEconomyChartMode("cash")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    economyChartMode === "cash"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <Coins size={12} className="inline mr-1 mb-0.5" />
                  Cash
                </button>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              key={`economy-${economyChartMode}-${projectionYears}`}
              minHeight={400}
            >
              <BarChart
                data={economyChartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#27272a"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    `${val - calculationResult.details[0].year + 1}`
                  }
                />
                <YAxis hide />
                <RechartsTooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;

                    const data = payload[0].payload;
                    // LOGIQUE CORRIGÉE : + = surcoût, - = économie
                    const isSurcout = data.value > 0;

                    return (
                      <div className="bg-[#09090b] border border-white/20 rounded-xl p-4 shadow-2xl">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                          Année{" "}
                          {data.year - calculationResult.details[0].year + 1}
                        </div>
                        <div
                          className={`text-2xl font-black mb-1 ${
                            isSurcout ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {data.value > 0 ? "+" : ""}
                          {formatMoney(data.value)}
                        </div>
                        {/* TEXTE CORRIGÉ */}
                        <div
                          className={`text-xs font-bold uppercase ${
                            isSurcout ? "text-red-300" : "text-emerald-300"
                          }`}
                        >
                          {isSurcout
                            ? "📉 Surcoût mensuel"
                            : "📈 Économie mensuelle"}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {/* COULEURS : rouge = surcoût, vert = économie */}
                  {economyChartData.map((entry, index) => {
                    const color = entry.value > 0 ? "#ef4444" : "#10b981";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TEXTE D'AIDE CORRIGÉ */}
          <div className="mt-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex gap-3 text-xs text-slate-400">
            <Lightbulb size={16} className="text-yellow-500 flex-shrink-0" />
            <p>
              <strong className="text-white">Les barres rouges</strong>{" "}
              représentent les mois où vous avez un <strong>surcoût</strong> par
              rapport à votre ancienne facture.{" "}
              <strong className="text-white">Les barres vertes</strong>{" "}
              représentent les mois où vous réalisez des{" "}
              <strong>économies</strong>.
            </p>
          </div>
        </div>

        {/* 13. LE GOUFFRE FINANCIER */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 mt-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Flame className="text-orange-500 w-6 h-6" />
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  ÉCART DE DÉPENSES ÉNERGÉTIQUES
                </h2>
                <p className="text-slate-500 text-sm">
                  Visualisez l'écart sur {projectionYears} ans entre agir
                  maintenant ou ne rien faire
                </p>
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
              <button
                onClick={() => setGouffreMode("financement")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  gouffreMode === "financement"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Financement
              </button>
              <button
                onClick={() => setGouffreMode("cash")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  gouffreMode === "cash"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                Cash
              </button>
            </div>
          </div>

          <div className="h-[500px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              key={`gouffre-${gouffreMode}-${projectionYears}`}
              minHeight={500}
            >
              <AreaChart
                data={gouffreChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorNoSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorSolarFinancement"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorSolarCash"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="year"
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Années",
                    position: "insideBottom",
                    offset: -10,
                    style: { fill: "#71717a", fontSize: 12 },
                  }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k€`}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#09090b] border border-white/20 rounded-xl p-4 shadow-2xl">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-3">
                          Année {data.year}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="text-[10px] text-red-400 uppercase font-bold mb-0.5">
                              Sans Solaire
                            </div>
                            <div className="text-xl font-black text-red-500">
                              {formatMoney(data.cumulativeSpendNoSolar)}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`text-[10px] uppercase font-bold mb-0.5 ${
                                gouffreMode === "cash"
                                  ? "text-emerald-400"
                                  : "text-blue-400"
                              }`}
                            >
                              Avec Solaire (
                              {gouffreMode === "cash" ? "Cash" : "Financement"})
                            </div>
                            <div
                              className={`text-xl font-black ${
                                gouffreMode === "cash"
                                  ? "text-emerald-500"
                                  : "text-blue-500"
                              }`}
                            >
                              {formatMoney(data.cumulativeSpendSolar)}
                            </div>
                          </div>
                          <div className="border-t border-white/10 pt-2 mt-2">
                            <div className="text-[10px] text-emerald-400 uppercase font-bold mb-0.5">
                              Écart (Votre Gain)
                            </div>
                            <div className="text-2xl font-black text-emerald-400">
                              {formatMoney(
                                data.cumulativeSpendNoSolar -
                                  data.cumulativeSpendSolar
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeSpendNoSolar"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="url(#colorNoSolar)"
                  name="Sans Solaire"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeSpendSolar"
                  stroke={gouffreMode === "cash" ? "#10b981" : "#3b82f6"}
                  strokeWidth={3}
                  fill={
                    gouffreMode === "cash"
                      ? "url(#colorSolarCash)"
                      : "url(#colorSolarFinancement)"
                  }
                  name={
                    gouffreMode === "cash"
                      ? "Avec Solaire (Cash)"
                      : "Avec Solaire (Financement)"
                  }
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                  formatter={(value) => (
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {value}
                    </span>
                  )}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ TEXTE CORRIGÉ - 3 BLOCS BIEN SÉPARÉS */}
          <div className="mt-6 space-y-4">
            {/* BLOC 1 : Point de croisement */}
            <div className="bg-black/60 backdrop-blur-md border border-emerald-900/30 p-4 rounded-xl flex items-start gap-3">
              <Target
                size={20}
                className="text-emerald-500 flex-shrink-0 mt-1"
              />
              <p className="text-sm text-slate-300">
                <strong className="text-white">Le point de croisement</strong>{" "}
                marque votre{" "}
                <span className="text-emerald-400 font-bold">
                  retour sur investissement
                </span>
                . Après ce point, chaque euro économisé correspond à des{" "}
                <span className="text-emerald-400 font-bold">
                  économies nettes
                </span>
                .
              </p>
            </div>

            {/* BLOC 2 : Important avec barre orange */}
            <div className="bg-orange-950/20 border-l-4 border-orange-500 p-4 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle
                  size={18}
                  className="text-orange-400 flex-shrink-0 mt-1"
                />
                <p className="text-sm text-slate-300">
                  <strong className="text-orange-400">Important :</strong>{" "}
                  L'investissement initial (ligne bleue/verte) crée un{" "}
                  <strong className="text-white">actif patrimonial</strong> qui
                  produit pendant 30 ans. La dépense sans solaire (ligne rouge)
                  n'a{" "}
                  <strong className="text-red-400">aucune contrepartie</strong>.
                </p>
              </div>

              {/* BLOC 3 : Les 2 InfoPopup en bas */}
              <div className="flex items-center gap-4 ml-9">
                <InfoPopup title="Robustesse du scénario">
                  <p className="mb-3">
                    Ce graphique est basé sur une hypothèse d'inflation
                    énergétique de <strong>{inflationRate}%</strong>.
                  </p>
                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-200 mb-2 font-bold">
                      📊 DONNÉES HISTORIQUES :
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li>2019-2024 : +40% (soit ~7%/an)</li>
                      <li>2022-2023 : +25% en un an</li>
                      <li>Hypothèse {inflationRate}% = prudente</li>
                    </ul>
                  </div>
                  <p className="mb-3 text-sm">
                    <strong>Même avec une inflation énergétique nulle</strong>,
                    l'installation reste pertinente car elle remplace une
                    dépense par une autoproduction à coût marginal quasi nul.
                  </p>
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-xs text-emerald-200 mb-2 font-bold">
                      ✅ SCÉNARIO INFLATION 0% :
                    </p>
                    <p className="text-xs text-slate-300">
                      Écart réduit mais toujours positif. Vous économisez dès
                      l'année 1 grâce à l'autoconsommation (
                      {Math.round(
                        yearlyProduction * (selfConsumptionRate / 100)
                      )}{" "}
                      kWh/an).
                    </p>
                  </div>
                </InfoPopup>

                <InfoPopup title="Et si je déménage ?">
                  <p className="mb-3">
                    L'installation solaire est un{" "}
                    <strong>actif immobilier valorisable</strong>.
                  </p>
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-emerald-200 mb-2 font-bold">
                      💰 VALORISATION À LA REVENTE :
                    </p>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      <li>DPE amélioré (étiquette énergétique)</li>
                      <li>
                        Facture d'électricité réduite = argument commercial
                      </li>
                      <li>
                        Installation récente = plus-value immobilière estimée à
                        5-15k€
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm mb-3">
                    Selon l'étude NotairesdefFrance (2021), les maisons avec
                    installation solaire se vendent{" "}
                    <strong>+3% à +8% plus cher</strong>.
                  </p>
                  <p className="text-blue-300 text-xs">
                    En cas de déménagement avant remboursement, le crédit peut
                    être transféré au nouveau propriétaire ou soldé par
                    anticipation.
                  </p>
                </InfoPopup>
              </div>
            </div>
          </div>
        </div>

        {/* 14. TABLEAU DÉTAILLÉ - FIXED DIVISION */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 mt-8 border border-white/10 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Table2 className="text-slate-400 w-6 h-6" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Plan de Financement Détaillé
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                <button
                  onClick={() => setTableScenario("financement")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    tableScenario === "financement"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Financement
                </button>
                <button
                  onClick={() => setTableScenario("cash")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    tableScenario === "cash"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Cash
                </button>
              </div>
              <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                <button
                  onClick={() => setTableMode("annuel")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    tableMode === "annuel"
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Annuel
                </button>
                <button
                  onClick={() => setTableMode("mensuel")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    tableMode === "mensuel"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Mensuel
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                  <th className="py-4 px-4">Année</th>
                  <th className="py-4 px-4 text-red-400">Sans Solaire</th>
                  <th className="py-4 px-4 text-blue-400">Crédit</th>
                  <th className="py-4 px-4 text-yellow-400">Reste Facture</th>
                  <th className="py-4 px-4 text-white">Total Avec Solaire</th>
                  <th className="py-4 px-4 text-slate-300">
                    Effort {tableMode === "annuel" ? "Annuel" : "Mensuel"}
                  </th>
                  <th className="py-4 px-4 text-emerald-400 text-right">
                    Trésorerie Cumulée
                    {/* ✅ Supprimé "(annuel/mensuel)" car c'est toujours annuel */}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono text-slate-300">
                {/* Year 0 Row for Cash Scenario or Down Payment */}
                <tr className="border-b border-white/5 bg-[#1a1505]/30">
                  <td className="py-4 px-4 text-yellow-500 font-bold">
                    Année 0
                  </td>
                  <td className="py-4 px-4 opacity-50">-</td>
                  <td className="py-4 px-4 opacity-50">-</td>
                  <td className="py-4 px-4 opacity-50">-</td>
                  <td className="py-4 px-4 text-yellow-400 font-bold uppercase">
                    APPORT :{" "}
                    {formatMoney(
                      tableScenario === "financement" ? cashApport : installCost
                    )}
                  </td>
                  <td className="py-4 px-4 text-red-400 font-bold">
                    {formatMoney(
                      tableScenario === "financement" ? cashApport : installCost
                    )}
                  </td>
                  <td className="py-4 px-4 text-right text-red-500 font-bold">
                    -
                    {formatMoney(
                      tableScenario === "financement" ? cashApport : installCost
                    )}
                  </td>
                </tr>

                {(tableScenario === "financement"
                  ? calculationResult.details
                  : calculationResult.detailsCash
                )
                  .slice(0, 20)
                  .map((row, i) => {
                    const isCreditActive =
                      i < creditDurationMonths / 12 &&
                      tableScenario === "financement";
                    const creditAmountYearly = isCreditActive
                      ? (creditMonthlyPayment + insuranceMonthlyPayment) * 12
                      : 0;

                    // Calculation of displayed values based on mode
                    const divider = tableMode === "mensuel" ? 12 : 1;

                    const displayNoSolar = row.edfBillWithoutSolar / divider;
                    const displayCredit = creditAmountYearly / divider;
                    const displayResidue = row.edfResidue / divider;
                    const displayTotalWithSolar = row.totalWithSolar / divider;

                    // Effort is calculated from total flow
                    const yearlyEffort =
                      row.totalWithSolar - row.edfBillWithoutSolar;
                    const displayEffort = yearlyEffort / divider;

                    return (
                      <tr
                        key={row.year}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4 text-slate-500">{row.year}</td>
                        <td className="py-4 px-4 text-red-400/80">
                          {formatMoney(displayNoSolar)}
                        </td>
                        <td className="py-4 px-4 text-blue-400/80">
                          {formatMoney(displayCredit)}
                        </td>
                        <td className="py-4 px-4 text-yellow-400/80">
                          {formatMoney(displayResidue)}
                        </td>
                        <td className="py-4 px-4 font-bold text-white">
                          {formatMoney(displayTotalWithSolar)}
                        </td>
                        <td
                          className={`py-4 px-4 font-bold ${
                            displayEffort > 0
                              ? "text-white"
                              : "text-emerald-400"
                          }`}
                        >
                          {displayEffort > 0 ? "+" : ""}
                          {formatMoney(displayEffort)}
                        </td>
                        <td
                          className={`py-4 px-4 text-right font-bold ${
                            row.cumulativeSavings >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {/* ✅ CORRECTION: Ne plus diviser par 12 la trésorerie cumulée */}
                          {formatMoney(row.cumulativeSavings)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
        {/* 3. SECTION "ÉCART DU SCÉNARIO PAR DÉFAUT" (ex "Et si je ne fais rien ?") */}
        <div className="bg-gradient-to-br from-red-950/40 via-orange-950/40 to-black border border-red-500/20 rounded-[32px] p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                ÉCART DU SCÉNARIO PAR DÉFAUT
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Ne pas agir correspond à conserver une dépendance complète au
                fournisseur d'énergie
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Card 1 - Dépense Année 1 */}
            <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6">
              <div className="text-red-400 text-sm font-medium mb-2">
                DÉPENSE ÉNERGÉTIQUE ANNÉE 1
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatMoney(calculationResult.lossIfWait1Year || 0)}
              </div>
              <div className="text-gray-400 text-xs">
                Facture annuelle fournisseur
              </div>
            </div>

            {/* Card 2 - Optimisation Non Réalisée */}
            <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6">
              <div className="text-red-400 text-sm font-medium mb-2">
                OPTIMISATION NON RÉALISÉE
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                -{formatMoney(calculationResult.savingsLostIfWait1Year || 0)}
              </div>
              <div className="text-gray-400 text-xs">
                Écart potentiel année 1
              </div>
            </div>

            {/* Card 3 - Écart sur 20 ans */}
            <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6">
              <div className="text-red-400 text-sm font-medium mb-2">
                ÉCART CUMULATIF ({projectionYears} ANS)
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                -{formatMoney(calculationResult.totalSavingsProjected || 0)}
              </div>
              <div className="text-gray-400 text-xs">
                Optimisation non captée
              </div>
            </div>
          </div>

          {/* Message de contexte SANS pop-up (pop-up déplacée plus bas) */}
          <div className="bg-orange-950/20 border-l-4 border-orange-500 p-4 rounded">
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="font-semibold text-orange-400">
                Le scénario par défaut
              </span>{" "}
              ne nécessite aucune décision, mais correspond à une{" "}
              <span className="font-semibold">
                exposition intégrale aux évolutions tarifaires
              </span>
              . Plus la décision est prise tard, plus l'écart cumulatif augmente
              mécaniquement.
            </p>
          </div>

          {/* Visualisation temporelle */}
          <div className="mt-6 p-4 bg-black/20 rounded-xl border border-red-500/10">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-400">
                <Clock className="inline w-4 h-4 mr-2" />
                Écart cumulatif par période d'attente :
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">
                  -
                  {formatMoney(
                    (calculationResult.totalSavingsProjected || 0) * 0.05
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-1">Attente 1 an</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">
                  -
                  {formatMoney(
                    (calculationResult.totalSavingsProjected || 0) * 0.15
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-1">Attente 3 ans</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-lg">
                  -
                  {formatMoney(
                    (calculationResult.totalSavingsProjected || 0) * 0.3
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-1">Attente 5 ans</div>
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGE D'URGENCE RATIONNELLE AVEC POP-UP "SCÉNARIO PAR DÉFAUT" */}
        <div className="bg-orange-950/20 border-l-4 border-orange-500 rounded-xl p-6 mt-8 mb-8 flex items-start gap-3">
          <AlertTriangle
            className="text-orange-500 flex-shrink-0 mt-1"
            size={24}
          />
          <div className="flex-1">
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              <span className="font-bold text-orange-400">
                Chaque année d'attente accroît l'écart économique
              </span>{" "}
              par effet cumulatif. Le scénario par défaut (ne rien faire)
              correspond à une
              <span className="font-semibold">
                {" "}
                exposition intégrale aux évolutions tarifaires
              </span>
              , sans optimisation de la dépense énergétique existante.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                Plus la décision est tardive, plus l'écart augmente
                mécaniquement.
              </span>
              <InfoPopup title="Et si je ne fais rien ?">
                <p className="mb-3">
                  Ne pas agir correspond à{" "}
                  <strong>conserver une dépendance complète</strong> au
                  fournisseur d'énergie, avec une exposition intégrale aux
                  évolutions de prix.
                </p>
                <p className="mb-3">
                  Ce scénario <strong>ne nécessite aucune décision</strong>,
                  mais n'est pas neutre financièrement : chaque année sans
                  optimisation accroît l'écart cumulatif avec le scénario
                  solaire.
                </p>
                <p className="mb-3">
                  Attendre 1 an = -
                  {formatMoney(calculationResult.totalSavingsProjected * 0.05)}{" "}
                  d'écart
                  <br />
                  Attendre 3 ans = -
                  {formatMoney(
                    calculationResult.totalSavingsProjected * 0.15
                  )}{" "}
                  d'écart
                  <br />
                  Attendre 5 ans = -
                  {formatMoney(
                    calculationResult.totalSavingsProjected * 0.3
                  )}{" "}
                  d'écart
                </p>
                <p className="text-blue-300 text-xs">
                  Plus la décision est prise tard, plus l'écart augmente
                  mécaniquement (effet cumulatif + inflation).
                </p>
              </InfoPopup>
            </div>
          </div>
        </div>

        {/* 🔴 NOUVEAU : MOMENTUM DÉCISIONNEL */}
        <div className="bg-gradient-to-br from-red-950/60 via-orange-950/40 to-black border-2 border-orange-500/40 rounded-[32px] p-8 mt-8 relative overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Badge urgence clignotant */}
          <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full animate-pulse">
            <AlertTriangle size={16} className="text-white" />
            <span className="text-white text-xs font-black uppercase">
              DÉCISION ATTENDUE
            </span>
          </div>

          <div className="flex items-start gap-6 mb-8">
            <div className="p-4 bg-orange-500/20 rounded-2xl">
              <Clock size={32} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase mb-2">
                COÛT DE L'ATTENTE
              </h2>
              <p className="text-orange-200 text-sm">
                Pendant que vous lisez cette étude, votre compteur tourne
              </p>
            </div>
          </div>

          {/* Compteur en temps réel - MASSIF */}
          <div className="bg-black/60 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-[10px] text-red-400 font-bold uppercase">
                  💸 ARGENT PERDU DEPUIS L'OUVERTURE DE CETTE PAGE
                </div>
                <button
                  onClick={() =>
                    setShowCompteurExplanation(!showCompteurExplanation)
                  }
                  className="p-1 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
                >
                  <Info size={14} className="text-red-400" />
                </button>
              </div>

              <div className="text-6xl font-black text-red-500 tabular-nums">
                {formatMoneyPrecise(wastedCash)}
              </div>

              <div className="text-xs text-slate-500 mt-2">
                Ce compteur ne s'arrêtera jamais tant que vous n'agissez pas
              </div>

              {/* Explication dépliable */}
              {showCompteurExplanation && (
                <div className="mt-4 bg-orange-950/40 border border-orange-500/20 rounded-xl p-4 text-left animate-in fade-in slide-in-from-top-2">
                  <div className="text-xs text-orange-200 space-y-2">
                    <p className="font-bold text-orange-300">
                      💡 Comment est calculé ce compteur ?
                    </p>
                    <div className="bg-black/40 p-3 rounded font-mono text-[10px]">
                      <div>
                        Consommation annuelle : {formatNum(yearlyConsumption)}{" "}
                        kWh
                      </div>
                      <div>Prix du kWh : {electricityPrice.toFixed(4)}€</div>
                      <div className="border-t border-orange-500/20 mt-2 pt-2">
                        Coût annuel :{" "}
                        {formatMoney(yearlyConsumption * electricityPrice)}
                        <br />
                        Coût par jour :{" "}
                        {formatMoney(
                          (yearlyConsumption * electricityPrice) / 365
                        )}
                        <br />
                        Coût par seconde :{" "}
                        {(
                          (yearlyConsumption * electricityPrice) /
                          365 /
                          24 /
                          3600
                        ).toFixed(6)}
                        €
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Ce compteur représente l'argent que vous dépensez en
                      électricité pendant que vous consultez cette étude, basé
                      sur votre consommation actuelle.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grille impact temporel */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-950/40 border border-orange-500/20 p-6 rounded-xl text-center">
              <div className="text-2xl font-black text-orange-400 mb-1">
                {formatMoney(calculationResult.oldMonthlyBillYear1 * 6)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                Attendre 6 mois
              </div>
            </div>
            <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-xl text-center">
              <div className="text-2xl font-black text-red-400 mb-1">
                {formatMoney(calculationResult.lossIfWait1Year)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                Attendre 1 an
              </div>
            </div>
            <div className="bg-red-950/60 border border-red-500/40 p-6 rounded-xl text-center">
              <div className="text-2xl font-black text-red-500 mb-1">
                {formatMoney(calculationResult.totalSavingsProjected * 0.2)}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                Attendre 3 ans
              </div>
            </div>
          </div>

          {/* Message psychologique final */}
          <div className="mt-6 bg-gradient-to-r from-red-950/60 to-orange-950/40 border-l-4 border-orange-500 p-6 rounded-xl">
            <p className="text-white text-lg font-bold mb-2">
              ⏰ La question n'est plus "Est-ce que je dois le faire ?"
            </p>
            <p className="text-orange-200 text-sm">
              La question est :{" "}
              <strong className="text-white">
                "Combien vais-je encore perdre avant de me décider ?"
              </strong>
            </p>
          </div>
        </div>

        {/* 👥 SOCIAL PROOF - CLIENTS RÉCENTS */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-[32px] p-8 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-emerald-400" size={28} />
            <h2 className="text-2xl font-black text-white uppercase">
              ILS ONT SIGNÉ CETTE SEMAINE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "M. et Mme D.",
                city: "Grasse (06)",
                gain: 47000,
                date: "Il y a 2 jours",
              },
              {
                name: "Famille L.",
                city: "Cannes (06)",
                gain: 52000,
                date: "Il y a 4 jours",
              },
              {
                name: "M. R.",
                city: "Antibes (06)",
                gain: 39000,
                date: "Il y a 6 jours",
              },
            ].map((client, i) => (
              <div
                key={i}
                className="bg-black/40 border border-emerald-500/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-bold uppercase">
                    {client.date}
                  </span>
                </div>
                <div className="text-white font-bold mb-1">{client.name}</div>
                <div className="text-slate-400 text-xs mb-3">{client.city}</div>
                <div className="text-2xl font-black text-emerald-400">
                  +{formatMoney(client.gain)}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">
                  Gain 20 ans
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded">
            <p className="text-emerald-200 text-sm">
              <strong>127 installations</strong> signées ce mois-ci dans votre
              région.
              <strong className="text-white">
                {" "}
                Pourquoi pas vous aujourd'hui ?
              </strong>
            </p>
          </div>
        </div>

        {/* ============================================
    PARTIE 15 : AI ANALYSIS + CTA FINAL - VERSION EDF SOLUTIONS SOLAIRES
    ============================================ */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-black border border-purple-500/20 rounded-[32px] p-8 mt-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  SYNTHÈSE AUTOMATISÉE - VOS DONNÉES
                </h2>
                <p className="text-purple-300 text-sm">
                  Projection basée sur vos paramètres réels
                </p>
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 mb-6">
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white text-base">
                    Après projection sur {projectionYears} ans selon vos données
                    réelles
                  </strong>
                  , voici l'écart observé :
                </p>

                {/* MÉTRIQUES PRINCIPALES - FINANCEMENT VS CASH */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
                  {/* AVEC FINANCEMENT */}
                  <div className="bg-gradient-to-br from-blue-950/60 to-blue-900/40 border-2 border-blue-500/40 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Wallet className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg uppercase">
                          Avec Financement
                        </h3>
                        <p className="text-blue-300 text-xs">
                          Réallocation budgétaire
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/40 rounded-xl p-3 text-center">
                        <div className="text-3xl font-black text-emerald-400">
                          0€
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase">
                          Capital immobilisé
                        </div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-3 text-center">
                        <div className="text-3xl font-black text-blue-400">
                          {calculationResult.breakEvenPoint}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase">
                          Point Mort (ans)
                        </div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-3 text-center">
                        <div className="text-3xl font-black text-purple-400">
                          {Math.round(
                            calculationResult.totalSavingsProjected / 1000
                          )}
                          k€
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase">
                          Écart {projectionYears} ans
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-300 space-y-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>
                          Aucun capital immobilisé - Épargne disponible
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>
                          Effort année 1 : +
                          {Math.abs(
                            Math.round(calculationResult.monthlyEffortYear1)
                          )}
                          €/mois (puis décroissant)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>
                          Équivalent Livret A :{" "}
                          {formatMoney(calculationResult.bankEquivalentCapital)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PAIEMENT CASH */}
                  <div className="bg-gradient-to-br from-emerald-950/60 to-emerald-900/40 border-2 border-emerald-500/40 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg uppercase">
                          Paiement Cash
                        </h3>
                        <p className="text-emerald-300 text-xs">
                          Performance maximale
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/40 rounded-xl p-3 text-center">
                        <div className="text-3xl font-black text-emerald-400">
                          {Math.round(
                            calculationResult.slicedDetailsCash[0]
                              ?.cumulativeSpendSolar / 1000
                          )}
                          k€
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase">
                          Capital investi
                        </div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-3 text-center">
                        <div className="text-3xl font-black text-blue-400">
                          {calculationResult.breakEvenPointCash}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase">
                          Point Mort (ans)
                        </div>
                      </div>
                      <div className="bg-black/40 rounded-xl p-3 text-center">
                        <div className="text-3xl font-black text-purple-400">
                          {Math.round(
                            calculationResult.totalSavingsProjectedCash / 1000
                          )}
                          k€
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase">
                          Écart {projectionYears} ans
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-300 space-y-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>
                          Performance : {calculationResult.roiPercentageCash}%
                          par an
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>
                          Point mort plus rapide (+
                          {calculationResult.breakEvenPoint -
                            calculationResult.breakEvenPointCash}{" "}
                          ans vs crédit)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>
                          Écart supérieur : +
                          {Math.round(
                            (calculationResult.totalSavingsProjectedCash -
                              calculationResult.totalSavingsProjected) /
                              1000
                          )}
                          k€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p>
                  <strong className="text-emerald-400">
                    Vous n'immobilisez aucun capital initial.
                  </strong>{" "}
                  Pendant{" "}
                  {Math.ceil(
                    calculationResult.slicedDetails.findIndex(
                      (d) => d.creditPayment === 0
                    ) || 15
                  )}{" "}
                  ans, le financement redistribue dans le temps une dépense
                  énergétique déjà existante (réallocation budgétaire de{" "}
                  <span className="text-blue-400 font-bold">
                    +
                    {Math.abs(Math.round(calculationResult.monthlyEffortYear1))}
                    €/mois année 1
                  </span>
                  , puis décroissante).
                </p>

                <p>
                  <strong className="text-white">
                    Après{" "}
                    {Math.ceil(
                      calculationResult.slicedDetails.findIndex(
                        (d) => d.creditPayment === 0
                      ) || 15
                    )}{" "}
                    ans
                  </strong>
                  , le crédit est remboursé et vous économisez{" "}
                  <span className="text-emerald-400 font-bold">
                    {Math.round(
                      calculationResult.slicedDetails[
                        calculationResult.slicedDetails.length - 1
                      ]?.solarSavingsValue / 12 || 150
                    )}
                    € par mois
                  </span>{" "}
                  pendant au minimum 10 ans supplémentaires, soit{" "}
                  <span className="text-purple-400 font-bold">
                    ~
                    {Math.round(
                      calculationResult.slicedDetails[
                        calculationResult.slicedDetails.length - 1
                      ]?.solarSavingsValue / 1000 || 1.8
                    )}
                    k€ par an
                  </span>
                  .
                </p>

                <p>
                  Cet écart économique correspond à l'équivalent d'un capital de{" "}
                  <span className="text-yellow-400 font-bold">
                    {formatMoney(calculationResult.bankEquivalentCapital)}
                  </span>{" "}
                  placé sur un Livret A à 2,7%. Avec le solaire,{" "}
                  <span className="text-white font-bold">
                    vous ne bloquez aucun capital et conservez votre épargne
                    disponible pour d'autres opportunités
                  </span>
                  .
                </p>

                <div className="bg-purple-950/20 border-l-4 border-purple-500 p-4 my-4">
                  <p className="text-purple-200 font-bold text-base">
                    🎯 SYNTHÈSE TECHNIQUE : ÉCART ÉCONOMIQUE SIGNIFICATIF
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    Avec un écart économique moyen de{" "}
                    {Math.round(calculationResult.averageYearlyGain)}€ par an,
                    ce scénario optimise une dépense énergétique existante, tout
                    en réduisant votre dépendance au réseau et en conservant
                    votre trésorerie intacte pour d'autres projets.
                  </p>
                </div>
              </div>
            </div>

            {/* PHRASE FINALE + POP-UP RÉVERSIBILITÉ */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-slate-300 text-sm leading-relaxed flex-1 flex items-start gap-2">
                  À ce stade, la décision ne porte plus sur l'installation, mais
                  sur le choix de
                  <strong className="text-white"> continuer à subir</strong> ou
                  d'
                  <strong className="text-emerald-400">
                    {" "}
                    optimiser une dépense existante
                  </strong>
                  .
                  <InfoPopup title="Est-ce réversible ?">
                    <p className="mb-3">
                      La décision porte sur l'
                      <strong>installation d'un équipement productif</strong>
                      qui devient votre propriété (panneaux, onduleurs,
                      structure).
                    </p>
                    <p className="mb-3">
                      Les{" "}
                      <strong>
                        paramètres contractuels sont encadrés et documentés
                      </strong>{" "}
                      : durée de financement (
                      {Math.ceil(creditDurationMonths / 12)} ans), garanties (30
                      ans Performance / 25 ans Essentiel), conditions de rachat
                      surplus (0,04€/kWh).
                    </p>
                    <p className="mb-3">
                      Il n'y a <strong>aucun mécanisme spéculatif</strong> :
                      vous produisez de l'énergie pour votre consommation, avec
                      revente du surplus au tarif réglementé.
                    </p>
                    <p className="text-blue-300 text-xs">
                      L'installation reste votre propriété et continue de
                      produire après remboursement du financement (durée de vie
                      panneaux : +30 ans).
                    </p>
                  </InfoPopup>
                </p>
              </div>
            </div>

            {/* CTA BUTTONS - FULL HARMONISATION STYLE CARDS */}
            <div className="flex flex-col md:flex-row gap-6 mt-8 relative z-10">
              {/* BOUTON EXPORTER (STYLE BLUE CARD COMME "AVEC FINANCEMENT") */}
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-blue-500/30 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative h-full bg-gradient-to-br from-blue-950/60 to-blue-900/40 border-2 border-blue-500/40 group-hover:border-blue-400/60 rounded-2xl p-5 transition-all shadow-2xl">
                  <PDFExport
                    data={data}
                    calculationResult={calculationResult}
                    projectionYears={projectionYears}
                    customStyled={true}
                  />
                </div>
              </div>

              {/* BOUTON GÉNÉRER ACCÈS (STYLE PURPLE CARD) */}
              <button
                onClick={() => setShowNamePopup(true)}
                className="flex-1 relative group overflow-hidden rounded-[30px] transition-all active:scale-95"
              >
                {/* Effet de lueur violette en arrière-plan */}
                <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                <div className="relative h-full bg-zinc-900/80 border-2 border-purple-500/40 group-hover:border-purple-400/60 p-5 flex items-center gap-5 transition-all">
                  <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform duration-500">
                    <Smartphone size={28} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-black text-lg uppercase italic leading-none tracking-tighter">
                      Générer Accès Client
                    </h3>
                    <p className="text-purple-400 text-[10px] font-bold uppercase mt-1 tracking-widest opacity-80">
                      Espace Sécurisé & Chiffré
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500 italic">
              💡 Les projections présentées sont des estimations basées sur vos
              données, des hypothèses de production et des scénarios d'évolution
              des prix. Elles ne constituent pas une promesse contractuelle.
            </div>
          </div>
        </div>

        {/* ================ POPUP NOM CLIENT ================ */}
        {showNamePopup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-2">
                Nom du client
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Ce nom apparaîtra sur l'étude personnalisée
              </p>

              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: M. et Mme Dupont"
                className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white mb-6 focus:border-blue-500 focus:outline-none transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && clientName.trim()) {
                    e.preventDefault();
                    // Désactivé - utilisez le bouton
                  }
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNamePopup(false);
                    setClientName("");
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (!clientName.trim()) {
                      alert("⚠️ Veuillez saisir un nom");
                      return;
                    }

                    if (!commercialEmail) {
                      alert("⚠️ Email commercial manquant");
                      return;
                    }

                    try {
                      // 🔍 DEBUG COMPLET (garde tes logs)
                      console.log("════════════════════════════════════");
                      console.log("🔍 DEBUG PAYLOAD GENERATION");
                      console.log("════════════════════════════════════");
                      console.log("interestRate (state) =", interestRate);
                      console.log(
                        "params.creditInterestRate =",
                        data?.params?.creditInterestRate
                      );
                      console.log(
                        "creditMonthlyPayment =",
                        creditMonthlyPayment
                      );
                      console.log(
                        "insuranceMonthlyPayment =",
                        insuranceMonthlyPayment
                      );
                      console.log("selfConsumptionRate =", selfConsumptionRate);
                      console.log(
                        "totalSavingsProjected =",
                        calculationResult.totalSavingsProjected
                      );
                      console.log("projectionYears =", projectionYears);
                      console.log("════════════════════════════════════");

                      const payload = {
                        n: clientName,
                        e: Math.round(
                          calculationResult.totalSavingsProjected || 0
                        ),
                        a: Math.round(selfConsumptionRate || 70),
                        m: Math.round(
                          (creditMonthlyPayment || 0) +
                            (insuranceMonthlyPayment || 0)
                        ),
                        t: interestRate || 3.89,
                        d: creditDurationMonths || 180,
                        prod: yearlyProduction || 7000,
                        conso: yearlyConsumption || 10000,
                        selfCons: selfConsumptionRate || 70,
                        installCost: installCost || 18799,
                        cashApport: cashApport || 0,
                        elecPrice: electricityPrice || 0.25,
                        installedPower: installedPower || 3.5,
                        projectionYears: projectionYears,
                        mode: "financement",
                        warrantyMode: warrantyMode
                          ? "performance"
                          : "essential",
                      };

                      console.log("📦 PAYLOAD GÉNÉRÉ:");
                      console.log("payload.t (taux) =", payload.t);
                      console.log("payload.m (mensualité) =", payload.m);
                      console.log("payload.e (gain) =", payload.e);
                      console.log(
                        "payload.projectionYears =",
                        payload.projectionYears
                      );
                      console.log("════════════════════════════════════");

                      // ✅ CALCULE LA DATE D'EXPIRATION (15 jours)
                      const expiresAt = new Date();
                      expiresAt.setDate(expiresAt.getDate() + 15);

                      console.log("📤 Sauvegarde dans Supabase...");

                      // ✅ SAUVEGARDE DANS SUPABASE
                      const { data: study, error } = await supabase
                        .from("studies")
                        .insert({
                          study_data: payload,
                          expires_at: expiresAt.toISOString(),
                          client_name: clientName,
                          client_email: clientEmail || null,
                          client_phone: clientPhone || null,
                          commercial_email: commercialEmail,
                          commercial_name: commercialName || null,
                          is_active: true,
                        })
                        .select()
                        .single();

                      if (error) {
                        console.error("❌ Erreur Supabase:", error);
                        throw error;
                      }

                      console.log("✅ Étude sauvegardée:", study.id);
                      console.log(
                        "📅 Expire le:",
                        expiresAt.toLocaleDateString("fr-FR")
                      );

                      // ✅ GÉNÈRE L'URL AVEC L'ID SUPABASE
                      const guestUrl = `https://edf-solutions-solaires.vercel.app/guest/${study.id}`;
                      console.log("🔗 URL générée:", guestUrl);

                      const qrCodeDataUrl = await QRCode.toDataURL(guestUrl, {
                        width: 300,
                        margin: 2,
                        color: {
                          dark: "#000000",
                          light: "#FFFFFF",
                        },
                      });

                      setQrCodeUrl(qrCodeDataUrl);

                      // ✅ MET À JOUR L'ÉTAT
                      setEncodedUrl(guestUrl);
                      setShowNamePopup(false);
                      setShowQRCode(true);

                      // ✅ MESSAGE DE SUCCÈS
                      alert(
                        `✅ Étude générée avec succès !\n\nID: ${
                          study.id
                        }\nExpire le: ${expiresAt.toLocaleDateString("fr-FR")}`
                      );
                    } catch (error: any) {
                      console.error("❌ Erreur:", error);
                      alert(`❌ Erreur: ${error.message}`);
                    }
                  }}
                  disabled={!clientName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Générer l'étude
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL QR CODE - DESIGN PREMIUM CORRIGÉ */}
        {showQRCode && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in zoom-in duration-300">
            <div className="bg-zinc-900 border border-white/10 p-1 rounded-[45px] max-w-sm w-full shadow-[0_0_80px_rgba(168,85,247,0.2)] overflow-hidden">
              {/* Header de la Modal */}
              <div className="bg-gradient-to-b from-white/5 to-transparent p-10 text-center relative">
                <button
                  onClick={() => setShowQRCode(false)}
                  className="absolute top-8 right-8 text-slate-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-6 relative inline-block">
                  <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative p-5 bg-purple-500/10 rounded-3xl border border-purple-500/20 text-purple-400">
                    <Smartphone size={36} strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight">
                  Accès Mobile <br />
                  <span className="text-purple-500 not-italic font-black">
                    Sécurisé
                  </span>
                </h3>

                <p className="text-slate-400 text-[11px] mt-4 font-medium leading-relaxed px-6">
                  Scanner ce code pour transférer l'étude interactive sur le
                  smartphone du client.
                </p>
              </div>

              {/* Zone QR Code - AVEC API EXTERNE (pas de lib) */}
              <div className="px-10 pb-10 text-center">
                <div className="bg-white p-7 rounded-[40px] inline-block shadow-[0_0_50px_rgba(168,85,247,0.4)] border-4 border-purple-500/20">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-[200px] h-[200px]"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-slate-800 rounded flex items-center justify-center">
                      <div className="text-slate-500 text-xs">
                        Génération...
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer avec bouton test et cadenas */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2 justify-center text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] bg-emerald-400/5 py-3 px-6 rounded-2xl border border-emerald-400/10">
                    <Lock size={14} />
                    Lien Chiffré AES-256
                  </div>

                  <button
                    onClick={() => window.open(encodedUrl, "_blank")}
                    className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-purple-400 transition-colors py-2 underline underline-offset-4"
                  >
                    Tester l'aperçu client (ordinateur)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsDashboard;
