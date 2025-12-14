import React, { useState, useEffect, useMemo } from "react";
import { SimulationResult, YearlyDetail } from "../types";
import { InfoPopup } from "./InfoPopup";
import { calculateSolarProjection, safeParseFloat } from "../utils/finance";
import { PDFExport } from "./PDFExport";
import { printValidationReport } from "../utils/validateCalculations";
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

  // Recalculate when inflation changes
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
  }, [inflationRate, projectionYears]);

  // Tech & Finance Params
  const [electricityPrice, setElectricityPrice] = useState<number>(
    data.params?.electricityPrice || 0.25
  );
  const [yearlyProduction, setYearlyProduction] = useState<number>(
    data.params?.yearlyProduction || 7000
  );
  const [selfConsumptionRate, setSelfConsumptionRate] = useState<number>(
    data.params?.selfConsumptionRate || 70
  );
  const [yearlyConsumption, setYearlyConsumption] = useState<number>(
    data.params?.yearlyConsumption ||
      Math.round(
        data.params?.currentAnnualBill / data.params?.electricityPrice
      ) ||
      14000
  );
  const [installCost, setInstallCost] = useState<number>(
    data.params?.installCost || 18799
  );

  // Main Financing States
  const [creditMonthlyPayment, setCreditMonthlyPayment] = useState<number>(
    data.params?.creditMonthlyPayment || 147.8
  );
  const [insuranceMonthlyPayment, setInsuranceMonthlyPayment] =
    useState<number>(data.params?.insuranceMonthlyPayment || 4.7);
  const [creditDurationMonths, setCreditDurationMonths] = useState<number>(
    data.params?.creditDurationMonths || 180
  );
  const [cashApport, setCashApport] = useState<number>(
    data.params?.cashApport || 0
  );
  const [remainingToFinance, setRemainingToFinance] = useState<number>(
    data.params?.remainingToFinance || 18799
  );
  const [taxRate, setTaxRate] = useState<number>(data.params?.taxRate || 0);

  // Auto Calculation States for Modal
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);
  const [interestRate, setInterestRate] = useState<number>(
    data.params?.interestRate || 3.89
  );
  const [insuranceRate, setInsuranceRate] = useState<number>(
    data.params?.insuranceRate || 0.3
  );
  const [buybackRate, setBuybackRate] = useState<number>(
    data.params?.buybackRate || 0.04
  );

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

  // --- INITIALIZATION ---
  useEffect(() => {
    setInflationRate(safeParseFloat(data.params.inflationRate, 5));
    // Load initial data from params
    setElectricityPrice(safeParseFloat(data.params.electricityPrice, 0.25));
    setYearlyProduction(safeParseFloat(data.params.yearlyProduction, 7000));
    setSelfConsumptionRate(safeParseFloat(data.params.selfConsumptionRate, 70));
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

    // Initialize rates from params or defaults
    if (data.params.creditInterestRate)
      setInterestRate(safeParseFloat(data.params.creditInterestRate, 3.89));
    if (data.params.insuranceRate)
      setInsuranceRate(safeParseFloat(data.params.insuranceRate, 0.3));
  }, [data]);

  useEffect(() => {
    setRemainingToFinance(Math.max(0, installCost - cashApport));
  }, [installCost, cashApport]);

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
    // Simple calculation: (Capital * Rate / 100) / 12
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
    return calculateSolarProjection(data.params, {
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
      buybackRate, // ✅ AJOUTÉ
    });
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
    buybackRate, // ✅ AJOUTÉ
    data.params,
  ]);

  // Wasted Cash Counter
  useEffect(() => {
    setWastedCash(0);
    const interval = setInterval(() => {
      setWastedCash(
        (prev) => prev + calculationResult.costOfInactionPerSecond * 100
      );
    }, 100);
    return () => clearInterval(interval);
  }, [calculationResult.costOfInactionPerSecond]);

  // 🔍 VALIDATION AUTOMATIQUE COMPLÈTE
  useEffect(() => {
    // Construire l'objet SimulationResult complet pour la validation
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
        buybackRate: buybackRate, // ✅ AJOUTÉ
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
  }, [
    calculationResult,
    projectionYears, // ✅ AJOUTÉ pour éviter les recalculs inutiles
    buybackRate, // ✅ AJOUTÉ
  ]);
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
      const netCashflow = detail.cashflowDiff;

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
    let cumulativeSolarCredit = 0;
    let cumulativeSolarCash = cashApport;

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <ParamCard
                    label="Prix Électricité (€/kWh)"
                    value={electricityPrice}
                    setValue={setElectricityPrice}
                    step={0.01}
                    unit=""
                    icon={<Zap size={14} className="text-yellow-400" />}
                    sublabel="Tarif actuel du kWh"
                  />

                  {/* 🆕 NOUVEAU CHAMP : CONSOMMATION ANNUELLE */}
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
                          sublabel="Taux annuel (ex: 0.3%)"
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
                  {calculationResult.savingsRatePercent.toFixed(0)}%
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
                  {calculationResult.savingsRatePercent.toFixed(0)}%
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

        {/* 4. FINANCEMENT VS CASH - VERSION EDF */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-emerald-500">
              <Coins size={24} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              FINANCEMENT VS PAIEMENT CASH
            </h2>
          </div>
          <p className="text-slate-500 text-sm mb-8 -mt-6 ml-9">
            Quel mode de paiement optimise votre écart économique ?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Financement - OVERFLOW-HIDDEN RETIRÉ */}
            <div className="bg-black/60 backdrop-blur-md border border-blue-900/30 rounded-2xl p-6 relative group transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
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
                {/* Card visual */}
                <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                  <Wallet size={80} className="text-blue-500" />
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-8">
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
              <div className="bg-blue-950/10 border border-blue-900/20 rounded-xl p-4">
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

            {/* Card Cash - OVERFLOW-HIDDEN RETIRÉ */}
            <div className="bg-black/60 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-6 relative group transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
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
                {/* Card visual */}
                <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                  <Coins size={80} className="text-emerald-500" />
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-8">
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
              <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4">
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

          {/* Verdict */}
          <div className="mt-8 bg-indigo-950/20 border-l-4 border-indigo-500 p-4 rounded">
            <p className="text-sm text-gray-300 mb-2">
              <strong>Cash optimal</strong> si vous disposez du capital (+
              {formatMoney(
                calculationResult.totalSavingsProjectedCash -
                  calculationResult.totalSavingsProjected
              )}{" "}
              d'écart sur {projectionYears} ans).
            </p>
            <p className="text-sm text-gray-300 mb-2 flex items-center gap-2">
              <strong>Financement structuré</strong> si vous préférez conserver
              votre capital disponible.
              <InfoPopup title="Pourquoi le financement ne coûte pas plus cher ?">
                <p className="mb-3">
                  Le financement permet d'<strong>étaler dans le temps</strong>{" "}
                  une dépense énergétique déjà existante (votre facture
                  actuelle).
                </p>
                <p className="mb-3">
                  Il ne crée pas un coût nouveau : il{" "}
                  <strong>modifie la structure temporelle des flux</strong>. Au
                  lieu de payer 100% au fournisseur, vous payez : mensualité
                  crédit + facture résiduelle - revente surplus.
                </p>
                <p className="text-blue-300 text-xs">
                  L'effort mensuel année 1 (+
                  {Math.round(calculationResult.monthlyEffortYear1)}€) décroît
                  progressivement avec l'inflation. Après remboursement, vous
                  économisez 100% de la production.
                </p>
              </InfoPopup>
            </p>
            <p className="text-sm text-gray-400">
              Les deux scénarios génèrent un écart économique positif. Le
              scénario par défaut (ne rien faire) correspond à une dépense non
              optimisée.
            </p>
          </div>
        </div>

        {/* 5. WHERE WILL YOUR MONEY BE */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-blue-500">
              <HelpCircle size={28} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Où sera votre argent ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yearsToDisplay.map((year, idx) => {
              const data = getYearData(year);
              const noSolarSpend = -data.credit.cumulativeSpendNoSolar;

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
                  className={`relative bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 overflow-hidden group transition-all duration-300 hover:border-white/20 ${shadowColor}`}
                >
                  <div className="absolute top-4 right-4 text-[140px] font-black text-white opacity-[0.03] leading-none pointer-events-none select-none">
                    {year}
                  </div>

                  <h3
                    className={`${headerColor} font-bold text-sm uppercase mb-8 tracking-wider`}
                  >
                    DANS {year} ANS
                  </h3>

                  <div className="space-y-6 relative z-10">
                    {/* AVEC SOLAIRE CRÉDIT */}
                    <div className="group/tooltip relative">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                        Avec Solaire (Crédit)
                        <HelpCircle size={12} className="text-slate-600" />
                      </div>
                      <div
                        className={`text-2xl font-black ${
                          year === 20 ? "text-emerald-400" : "text-orange-400"
                        }`}
                      >
                        {formatMoney(data.credit.cumulativeSavings)}
                      </div>

                      {/* TOOLTIP */}
                      <div className="absolute left-0 top-full mt-2 w-64 bg-[#1e293b] border border-blue-500/30 p-3 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="text-xs text-blue-300 font-bold mb-2">
                          💡 CALCUL :
                        </div>
                        <div className="text-[10px] text-slate-300 space-y-1 font-mono">
                          <div>Facture sans panneaux</div>
                          <div className="text-slate-600">MOINS</div>
                          <div>(Mensualité crédit + Reste facture)</div>
                          <div className="text-slate-600">ÉGALE</div>
                          <div className="text-emerald-400 font-bold">
                            Votre gain net
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AVEC SOLAIRE CASH */}
                    <div className="group/tooltip relative">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-1">
                        Avec Solaire (Cash)
                        <HelpCircle size={12} className="text-slate-600" />
                      </div>
                      <div
                        className={`text-2xl font-black ${
                          year === 20 ? "text-emerald-400" : "text-orange-400"
                        }`}
                      >
                        {formatMoney(data.cash.cumulativeSavings)}
                      </div>

                      {/* TOOLTIP */}
                      <div className="absolute left-0 top-full mt-2 w-64 bg-[#1e293b] border border-emerald-500/30 p-3 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="text-xs text-emerald-300 font-bold mb-2">
                          💡 CALCUL :
                        </div>
                        <div className="text-[10px] text-slate-300 space-y-1 font-mono">
                          <div>Facture sans panneaux</div>
                          <div className="text-slate-600">MOINS</div>
                          <div>Reste facture réduite</div>
                          <div className="text-slate-600">MOINS</div>
                          <div>Apport initial ({formatMoney(installCost)})</div>
                          <div className="text-slate-600">ÉGALE</div>
                          <div className="text-emerald-400 font-bold">
                            Votre gain net
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SANS RIEN FAIRE */}
                    <div className="bg-[#2a0505] border border-red-900/30 p-4 rounded-xl -mx-2 group/tooltip relative">
                      <div className="text-[10px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                        Sans rien faire
                        <HelpCircle size={12} className="text-red-600" />
                      </div>
                      <div className="text-2xl font-black text-red-500">
                        {formatMoney(noSolarSpend)}
                      </div>

                      {/* TOOLTIP */}
                      <div className="absolute left-0 top-full mt-2 w-64 bg-[#1e293b] border border-red-500/30 p-3 rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="text-xs text-red-300 font-bold mb-2">
                          💡 CALCUL :
                        </div>
                        <div className="text-[10px] text-slate-300 space-y-1 font-mono">
                          <div>Facture annuelle × {year} ans</div>
                          <div className="text-slate-600">AVEC</div>
                          <div>Inflation {inflationRate}% par an</div>
                          <div className="text-slate-600">ÉGALE</div>
                          <div className="text-red-400 font-bold">
                            Argent définitivement perdu
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-6 pt-6 border-t border-white/5 text-[10px] italic ${
                      year === 20
                        ? "text-emerald-400"
                        : year === 10
                        ? "text-blue-400"
                        : "text-orange-400"
                    }`}
                  >
                    {year === 5 && "Vous commencez à voir la différence"}
                    {year === 10 && "L'écart se creuse significativement"}
                    {year === 20 && "C'est un capital transmissible"}
                  </div>
                </div>
              );
            })}
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

              {/* Info Box */}
              <div className="bg-[#1e293b]/50 border border-blue-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm">
                  <Info size={16} className="text-blue-400" />
                  <Lightbulb size={16} className="text-yellow-400" />
                  Comment est calculé cet écart ?
                </div>
                <p className="text-xs text-blue-200 mb-4 leading-relaxed">
                  C'est la différence entre{" "}
                  <span className="text-red-400 font-bold">
                    la dépense énergétique sans installation
                  </span>{" "}
                  et{" "}
                  <span className="text-blue-400 font-bold">
                    la réallocation budgétaire avec installation
                  </span>{" "}
                  (crédit + facture résiduelle).
                </p>

                <div className="bg-black/40 p-4 rounded-lg font-mono text-[10px] text-slate-400 space-y-2 border border-white/5">
                  <div className="text-slate-500 uppercase tracking-widest mb-2">
                    FORMULE :
                  </div>
                  <div className="text-red-400">
                    Dépense énergétique sans installation
                  </div>
                  <div className="text-slate-600 text-[9px] pl-2">MOINS</div>
                  <div className="text-blue-400">
                    Réallocation budgétaire avec installation
                  </div>
                  <div className="text-slate-600 text-[9px] pl-2">ÉGALE</div>
                  <div className="text-emerald-400 font-bold text-xs">
                    Écart économique net
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-yellow-500/80 italic">
                  <AlertTriangle size={12} />
                  Les premières années correspondent à une phase de réallocation
                  budgétaire. Dès l'année{" "}
                  {Math.ceil(creditDurationMonths / 12 / 2)}, vous commencez à
                  économiser. Après remboursement (
                  {Math.ceil(creditDurationMonths / 12)} ans), les économies
                  deviennent massives et permanentes.
                </div>
              </div>

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

        {/* 8. BILAN TOTAL SUR 20 ANS */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Scale className="text-white w-8 h-8" />
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  BILAN TOTAL SUR {projectionYears} ANS
                </h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <Lightbulb size={14} className="text-yellow-500" />
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
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  SANS SOLAIRE (DÉPENSE NON VALORISÉE)
                </span>
              </div>

              <div className="h-16 bg-[#1a0a0a] rounded-full border border-red-500/20 relative overflow-hidden flex items-center px-6">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500"
                  style={{ width: "100%" }}
                ></div>
                <span className="relative z-10 text-3xl font-black text-white ml-auto text-shadow-sm">
                  {formatMoney(
                    gouffreMode === "financement"
                      ? calculationResult.totalSpendNoSolar
                      : calculationResult.totalSpendNoSolarCash
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3 text-red-400 text-xs italic opacity-80">
                <Coins size={12} /> Cet argent est parti pour toujours.
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  AVEC SOLAIRE (INVESTISSEMENT PATRIMONIAL)
                </span>
              </div>

              <div className="h-16 bg-[#0a101a] rounded-full border border-blue-500/20 relative overflow-hidden flex items-center px-6">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400"
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
                ></div>
                <span className="relative z-10 text-3xl font-black text-white ml-auto text-shadow-sm">
                  {formatMoney(
                    gouffreMode === "financement"
                      ? calculationResult.totalSpendSolar
                      : calculationResult.totalSpendSolarCash
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-2 text-blue-400 text-xs italic opacity-80">
                  <Zap size={12} /> Cette dépense génère un actif qui produit
                  pendant 25+ ans.
                </div>
                <div className="bg-[#062c1e] text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/50">
                  💰 Différence :{" "}
                  {formatMoney(
                    gouffreMode === "financement"
                      ? calculationResult.totalSavingsProjected
                      : calculationResult.totalSavingsProjectedCash
                  )}
                </div>
              </div>
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

        {/* 11. STRUCTURE DU BUDGET (MENSUEL) - FIXED DIVIDER LOGIC */}
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

          <div className="space-y-8">
            {/* Situation Actuelle */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                <span>SITUATION ACTUELLE</span>
                <span className="text-red-500">
                  {formatMoney(calculationResult.oldMonthlyBillYear1)} /mois
                </span>
              </div>
              <div className="h-16 bg-red-600 rounded-lg flex items-center justify-between px-6 shadow-lg shadow-red-900/20 relative overflow-hidden group">
                <span className="relative z-10 text-white font-black text-lg uppercase tracking-wider">
                  FACTURE ACTUELLE
                </span>
                <span className="relative z-10 text-white/20 font-black text-4xl uppercase tracking-tighter group-hover:text-white/30 transition-colors">
                  100% PERTE
                </span>
              </div>
            </div>

            {/* Projet Solaire */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                <span>PROJET SOLAIRE</span>
                <span className="text-white">
                  {(
                    creditMonthlyPayment +
                    insuranceMonthlyPayment +
                    calculationResult.year1.edfResidue / 12
                  )
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  € /mois
                </span>
              </div>
              <div className="h-16 flex rounded-lg overflow-hidden shadow-lg shadow-blue-900/20">
                {/* Credit Part */}
                <div
                  className="bg-blue-600 h-full flex flex-col justify-center px-4 relative group"
                  style={{ flex: "1.5" }}
                >
                  <span className="text-[10px] font-bold text-blue-200 uppercase">
                    CRÉDIT
                  </span>
                  <span className="text-white font-bold text-lg">
                    {formatMoney(
                      creditMonthlyPayment + insuranceMonthlyPayment
                    )}
                  </span>
                </div>
                {/* Reste Part */}
                <div
                  className="bg-amber-500 h-full flex flex-col justify-center px-4 relative group"
                  style={{ flex: "1" }}
                >
                  <span className="text-[10px] font-bold text-amber-900 uppercase">
                    RESTE
                  </span>
                  <span className="text-amber-950 font-bold text-lg">
                    {formatMoney(calculationResult.year1.edfResidue / 12)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 12. ÉCONOMIES ANNUELLES CHART */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 mt-8 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-emerald-500 w-6 h-6" />
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  ÉCONOMIES ANNUELLES ({projectionYears} ans)
                </h2>
                <p className="text-slate-500 text-sm">
                  Votre cashflow année par année sur {projectionYears} ans
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase mr-4">
                <div className="flex items-center gap-1 text-slate-400">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Barres
                  rouges = Effort d'investissement
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>{" "}
                  Barres vertes = Phase d'économies nettes
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
                  <Wallet size={12} className="inline mr-1 mb-0.5" />{" "}
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
                  <Coins size={12} className="inline mr-1 mb-0.5" /> Cash
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
                    const isInvestment = data.type === "investment";

                    return (
                      <div className="bg-[#09090b] border border-white/20 rounded-xl p-4 shadow-2xl">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                          Année{" "}
                          {data.year - calculationResult.details[0].year + 1}
                        </div>
                        <div
                          className={`text-2xl font-black mb-1 ${
                            isInvestment ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {data.value > 0 ? "+" : ""}
                          {formatMoney(data.value)}
                        </div>
                        <div
                          className={`text-xs font-bold uppercase ${
                            isInvestment ? "text-red-300" : "text-emerald-300"
                          }`}
                        >
                          {isInvestment
                            ? "📉 Effort d'investissement"
                            : "📈 Phase d'économies nettes"}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {economyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.type === "investment" ? "#ef4444" : "#10b981"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 flex gap-3 text-xs text-slate-400">
            <Lightbulb size={16} className="text-yellow-500 flex-shrink-0" />
            <p>
              <strong className="text-white">Les barres rouges</strong>{" "}
              représentent les années où vous investissez (mensualités crédit).{" "}
              <strong className="text-white">Les barres vertes</strong> sont les
              années de profit pur (après fin du crédit).
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
                  LE GOUFFRE FINANCIER
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

          <div className="mt-6 bg-black/60 backdrop-blur-md border border-emerald-900/30 p-4 rounded-xl flex items-start gap-3">
            <Target size={20} className="text-emerald-500 flex-shrink-0" />
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
              . Plus vous attendez, plus le gouffre se creuse.
            </p>
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

            {/* CTA BUTTONS */}
            <div className="flex flex-col md:flex-row gap-4">
              <PDFExport
                data={data}
                calculationResult={calculationResult}
                projectionYears={projectionYears}
              />

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-xl uppercase tracking-wider text-sm flex items-center justify-center gap-3 border border-white/20 transition-all active:scale-95"
              >
                <LayoutDashboard size={20} />
                Revoir l'Analyse
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500 italic">
              💡 Les projections présentées sont des estimations basées sur vos
              données, des hypothèses de production et des scénarios d'évolution
              des prix. Elles ne constituent pas une promesse contractuelle.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsDashboard;
