import React, { useState, useEffect, useMemo } from 'react';
import { SimulationResult, YearlyDetail } from '../types';
import { calculateSolarProjection, safeParseFloat } from '../utils/finance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis, Legend } from 'recharts';
import { 
  Sun, X, ChevronUp, ChevronDown, Info, AlertTriangle, Lightbulb, Zap, TrendingUp, 
  CheckCircle2, Wallet, Coins, ArrowRight, Settings, Landmark, ShieldCheck, Home, 
  BarChart3, HelpCircle, Scale, Ban, Crown, Smartphone, Server, Table2, Eye, Flame, 
  Lock, Target, Wrench, Bot, LayoutDashboard, ThumbsUp, Timer, Shield, Award
} from 'lucide-react';
import { InputSlider } from './InputSlider';

interface ResultsDashboardProps {
  data: SimulationResult;
  onReset: () => void;
}

// --- UTILS FORMATTING ---
const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
const formatNum = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

// --- CUSTOM COMPONENTS ---

const Toggle = ({ checked, onChange, labelOn, labelOff }: { checked: boolean, onChange: (v: boolean) => void, labelOn: string, labelOff: string }) => (
  <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10">
    <button 
      onClick={() => onChange(false)}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!checked ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {labelOff}
    </button>
    <button 
      onClick={() => onChange(true)}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${checked ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
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
  disabled = false
}: { 
  label: string, 
  value: number, 
  setValue: (v: number) => void, 
  unit?: string, 
  sublabel?: string, 
  icon?: React.ReactNode,
  min?: number,
  step?: number,
  disabled?: boolean
}) => {
  return (
    <div 
      className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
       {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      </div>

      <div className="relative z-10 flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
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
        {unit && <span className="text-slate-500 font-bold text-sm mb-1">{unit}</span>}
        
        {!disabled && (
          <div className="flex flex-col gap-0.5 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1 rounded border border-white/10">
            <button onClick={() => setValue(parseFloat((value + step).toFixed(2)))} className="text-slate-500 hover:text-white"><ChevronUp size={16}/></button>
            <button onClick={() => setValue(parseFloat(Math.max(min, value - step).toFixed(2)))} className="text-slate-500 hover:text-white"><ChevronDown size={16}/></button>
          </div>
        )}
      </div>

      {sublabel && <div className="relative z-10 h-4 mt-2"><p className="text-[10px] text-slate-600 truncate">{sublabel}</p></div>}
    </div>
  );
};

const WarrantyCard = ({ years, label, tag, icon: Icon, description, isFr }: { years: number | string, label: string, tag: string, icon: any, description: string, isFr?: boolean }) => (
    <div 
      className="bg-black/40 backdrop-blur-xl border border-blue-500/20 p-6 rounded-2xl group transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/50 relative overflow-hidden h-full"
    >
         {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 pointer-events-none"></div>
        
        {/* Normal Content */}
        <div className="relative z-10 transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 transform">
            <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Icon size={20} />
            </div>
            <div className="text-3xl font-black text-white mb-1">
                {years} {typeof years === 'number' ? 'ANS' : ''}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">{label}</div>
            <div className="inline-block px-2 py-1 bg-blue-900/30 text-blue-300 text-[10px] font-bold rounded border border-blue-500/20">
                {tag}
            </div>
            
            {/* French Flag badge */}
            {isFr && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#1a2e35] px-2 py-1 rounded border border-emerald-500/20 shadow-sm">
                    <span className="text-[8px]">🇫🇷</span>
                    <span className="text-[8px] font-bold text-emerald-400">FRANÇAIS</span>
                </div>
            )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/95 p-6 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-20">
            <Icon size={24} className="text-blue-400 mb-3 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <h4 className="text-white font-bold text-sm mb-2 uppercase">{label} {years} {typeof years === 'number' ? 'ANS' : ''}</h4>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {description}
            </p>
        </div>
    </div>
);


// --- MAIN COMPONENT ---

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data, onReset }) => {
  // --- STATE ---
  const [inflationRate, setInflationRate] = useState<number>(5);
  const [projectionYears, setProjectionYears] = useState(20);
  
  // Tech & Finance Params
  const [electricityPrice, setElectricityPrice] = useState<number>(0.25);
  const [yearlyProduction, setYearlyProduction] = useState<number>(7000);
  const [selfConsumptionRate, setSelfConsumptionRate] = useState<number>(70);
  const [installCost, setInstallCost] = useState<number>(18799);
  
  // Main Financing States
  const [creditMonthlyPayment, setCreditMonthlyPayment] = useState<number>(147.8);
  const [insuranceMonthlyPayment, setInsuranceMonthlyPayment] = useState<number>(4.7);
  const [creditDurationMonths, setCreditDurationMonths] = useState<number>(180);
  const [cashApport, setCashApport] = useState<number>(0);
  const [remainingToFinance, setRemainingToFinance] = useState<number>(18799);
  const [taxRate, setTaxRate] = useState<number>(0);
  
  // Auto Calculation States for Modal
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);
  const [interestRate, setInterestRate] = useState<number>(3.89);
  const [insuranceRate, setInsuranceRate] = useState<number>(0.3);

  // UI State
  const [wastedCash, setWastedCash] = useState(0);
  const [showParamsEditor, setShowParamsEditor] = useState(false);
  const [warrantyMode, setWarrantyMode] = useState<boolean>(true); 
  const [economyChartMode, setEconomyChartMode] = useState<'financement' | 'cash'>('financement');
  const [tableMode, setTableMode] = useState<'annuel' | 'mensuel'>('mensuel');
  const [tableScenario, setTableScenario] = useState<'financement' | 'cash'>('financement');
  const [gouffreMode, setGouffreMode] = useState<'financement' | 'cash'>('financement');

  // --- INITIALIZATION ---
  useEffect(() => {
    setInflationRate(safeParseFloat(data.params.inflationRate, 5));
    // Load initial data from params
    setElectricityPrice(safeParseFloat(data.params.electricityPrice, 0.25));
    setYearlyProduction(safeParseFloat(data.params.yearlyProduction, 7000));
    setSelfConsumptionRate(safeParseFloat(data.params.selfConsumptionRate, 70));
    setInstallCost(safeParseFloat(data.params.installCost, 18799));
    setCreditMonthlyPayment(safeParseFloat(data.params.creditMonthlyPayment, 147.8));
    setInsuranceMonthlyPayment(safeParseFloat(data.params.insuranceMonthlyPayment, 4.7));
    setCreditDurationMonths(safeParseFloat(data.params.creditDurationMonths, 180));
    setCashApport(safeParseFloat(data.params.cashApport, 0));
    
    // Initialize rates from params or defaults
    if (data.params.creditInterestRate) setInterestRate(safeParseFloat(data.params.creditInterestRate, 3.89));
    if (data.params.insuranceRate) setInsuranceRate(safeParseFloat(data.params.insuranceRate, 0.3));
  }, [data]);

  useEffect(() => {
    setRemainingToFinance(Math.max(0, installCost - cashApport));
  }, [installCost, cashApport]);

  // Projected Values for Auto Calc (Modal Preview)
  const projectedMonthlyLoan = useMemo(() => {
    const r = (interestRate / 100) / 12;
    const n = creditDurationMonths;
    const P = remainingToFinance;
    if (r === 0 || n === 0) return P / (n || 1);
    const val = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
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
    setInsuranceMonthlyPayment(Math.round(projectedMonthlyInsurance * 100) / 100);
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
        taxRate
    });
  }, [
    inflationRate, projectionYears, electricityPrice, yearlyProduction,
    selfConsumptionRate, installCost, cashApport, remainingToFinance,
    creditMonthlyPayment, insuranceMonthlyPayment, creditDurationMonths,
    taxRate, data.params
  ]);

  // Wasted Cash Counter
  useEffect(() => {
    setWastedCash(0);
    const interval = setInterval(() => {
      setWastedCash(prev => prev + calculationResult.costOfInactionPerSecond * 100); 
    }, 100); 
    return () => clearInterval(interval);
  }, [calculationResult.costOfInactionPerSecond]);

  const getYearData = (year: number) => {
    const idx = year - 1;
    if (!calculationResult.details[idx]) return { credit: calculationResult.year1, cash: calculationResult.year1 };
    return { 
      credit: calculationResult.details[idx], 
      cash: calculationResult.detailsCash[idx] 
    };
  };

  // ✅ CORRECTION 1 : yearsToDisplay dynamique
  const yearsToDisplay = projectionYears === 10 ? [3, 7, 10] :
                         projectionYears === 15 ? [5, 10, 15] :
                         projectionYears === 20 ? [5, 10, 20] :
                         [8, 17, 25];  // pour 25 ans

  // ECONOMY CHART DATA - NET CASHFLOW
  const economyChartData = useMemo(() => {
    const sourceDetails = economyChartMode === 'financement' ? calculationResult.details : calculationResult.detailsCash;
    const viewData = sourceDetails.slice(0, projectionYears);

    return viewData.map((detail, index) => {
        const isCreditActive = index * 12 < creditDurationMonths && economyChartMode === 'financement';
        const netCashflow = detail.cashflowDiff;

        return {
            year: detail.year,
            value: netCashflow,
            type: isCreditActive ? 'investment' : 'profit'
        };
    });
  }, [calculationResult, economyChartMode, creditDurationMonths, projectionYears]);

  const gouffreChartData = useMemo(() => {
      const source = gouffreMode === 'financement' ? calculationResult.details : calculationResult.detailsCash;
      return source;
  }, [gouffreMode, calculationResult]);

  // Warranty Data
  const warranties = useMemo(() => {
    return warrantyMode ? [
        {
            years: "À VIE",
            label: "PANNEAUX",
            tag: "Pièces + M.O. + Déplacement",
            icon: Sun,
            description: "Garantie de productibilité à vie. Pièces, main d'œuvre et déplacement inclus."
        },
        {
            years: "À VIE",
            label: "ONDULEURS",
            tag: "Pièces + M.O. + Déplacement",
            icon: Zap,
            description: "Garantie totale : remplacement à neuf, main d'œuvre et déplacement inclus à vie."
        },
        {
            years: "À VIE",
            label: "STRUCTURE",
            tag: "Pièces + M.O. + Déplacement",
            icon: Wrench,
            description: "Garantie à vie sur le système de fixation et l'étanchéité de votre toiture."
        },
        {
            years: "À VIE",
            label: "MATÉRIEL",
            tag: "Remplacement à neuf",
            icon: ShieldCheck,
            description: "Garantie matérielle complète contre tout défaut de fabrication ou vice caché."
        }
    ] : [
        {
            years: 25,
            label: "PANNEAUX",
            tag: "Performance standard",
            icon: Sun,
            description: "Garantie de production standard de l'industrie. 80% de puissance à 25 ans.",
            isFr: true
        },
        {
            years: 25,
            label: "ONDULEURS",
            tag: "Pièces + M.O. + Déplacement",
            icon: Zap,
            description: "Garantie totale : remplacement à neuf, main d'œuvre et déplacement inclus."
        },
        {
            years: 10,
            label: "STRUCTURE",
            tag: "Matériel + M.O. + Déplacement",
            icon: Wrench,
            description: "Garantie sur le système de fixation et l'étanchéité."
        },
        {
            years: 25,
            label: "PANNEAUX",
            tag: "Matériel",
            icon: Sun,
            description: "Garantie matérielle contre tout défaut de fabrication."
        }
    ];
  }, [warrantyMode]);

  return (
    <div className="w-full">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                <Sun className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent leading-none">Solutions Solaires</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">EDF - Analyse Premium</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowParamsEditor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded border border-white/10 transition-colors"
             >
                <Settings size={14} /> Modifier
             </button>
             <button onClick={onReset} className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">
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
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Paramètres Financiers</h2>
                    </div>
                    <button onClick={() => setShowParamsEditor(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Row 1: Basic Params */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <ParamCard label="Prix Électricité (€/kWh)" value={electricityPrice} setValue={setElectricityPrice} step={0.01} unit="" icon={<Zap size={14} className="text-yellow-400" />} sublabel="Tarif actuel du kWh" />
                        <ParamCard label="Production Annuelle (kWh)" value={yearlyProduction} setValue={setYearlyProduction} step={100} unit="" icon={<Sun size={14} className="text-orange-400" />} sublabel="kWh produits par an" />
                        <ParamCard label="Taux Autoconsommation (%)" value={selfConsumptionRate} setValue={setSelfConsumptionRate} unit="" icon={<TrendingUp size={14} className="text-emerald-400" />} sublabel="% consommé directement" />
                    </div>

                    {/* Row 2: Costs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <ParamCard label="Coût Installation (€)" value={installCost} setValue={setInstallCost} step={100} unit="" icon={<Wallet size={14} className="text-purple-400" />} sublabel="Prix total TTC" />
                        <ParamCard label="Apport Cash (€)" value={cashApport} setValue={setCashApport} step={100} unit="" icon={<Coins size={14} className="text-emerald-400" />} sublabel="Montant comptant" />
                        <ParamCard label="Reste à Financer (€)" value={remainingToFinance} setValue={setRemainingToFinance} unit="" icon={<Wallet size={14} className="text-blue-400" />} sublabel="Montant financé" disabled={true} />
                    </div>

                    {/* Credit Section */}
                    <div className="bg-black/20 border border-indigo-500/20 rounded-xl p-6 relative">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="text-blue-500"><Wallet size={20} /></div>
                             <h3 className="text-sm font-black text-white uppercase tracking-wider">FINANCEMENT CRÉDIT</h3>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-lg p-4 mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white">Mode de Calcul</h3>
                                <p className="text-xs text-slate-500">{autoCalculate ? "Calcul automatique de la mensualité" : "Saisie manuelle de la mensualité"}</p>
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
                                value={autoCalculate ? Math.round(projectedMonthlyLoan*100)/100 : creditMonthlyPayment} 
                                setValue={setCreditMonthlyPayment} 
                                step={1}
                                unit=""
                                icon={<Settings size={14} className="text-blue-400" />}
                                sublabel={autoCalculate ? "Calculé automatiquement" : "Montant mensuel du prêt"}
                                disabled={autoCalculate}
                            />
                            <ParamCard 
                                label="Assurance (€/Mois)" 
                                value={autoCalculate ? Math.round(projectedMonthlyInsurance*100)/100 : insuranceMonthlyPayment} 
                                setValue={setInsuranceMonthlyPayment} 
                                step={0.1}
                                unit=""
                                icon={<ShieldCheck size={14} className="text-orange-400" />}
                                sublabel={autoCalculate ? "Calculée automatiquement" : "Assurance emprunteur mensuelle"}
                                disabled={autoCalculate}
                            />
                        </div>

                        {/* DURATION SLIDER */}
                        <div className="px-2 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <Timer size={14} className="text-red-500" />
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Durée Crédit (Mois)</label>
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {creditDurationMonths} <span className="text-sm text-slate-500 font-bold">mois</span>
                                </div>
                            </div>
                            <input 
                                type="range" 
                                min="12" 
                                max="180" 
                                step="12"
                                value={creditDurationMonths}
                                onChange={(e) => setCreditDurationMonths(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <p className="text-xs text-slate-600 mt-2 font-mono">Soit {(creditDurationMonths/12).toFixed(1)} années de remboursement</p>
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
                                        icon={<CheckCircle2 size={14} className="text-emerald-400" />}
                                        sublabel="Taux annuel du crédit (ex: 3.89%)"
                                    />
                                    <ParamCard 
                                        label="Taux Assurance (%)" 
                                        value={insuranceRate} 
                                        setValue={setInsuranceRate} 
                                        step={0.05}
                                        unit="%"
                                        icon={<ShieldCheck size={14} className="text-orange-400" />}
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
                                            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">Calcul Automatique</h4>
                                            <div className="flex gap-8">
                                                <div>
                                                    <p className="text-[10px] text-emerald-200/60 uppercase font-bold">Mensualité</p>
                                                    <p className="text-xl font-black text-white">{formatMoney(projectedMonthlyLoan)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-emerald-200/60 uppercase font-bold">Assurance</p>
                                                    <p className="text-xl font-black text-white">{formatMoney(projectedMonthlyInsurance)}</p>
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
                <span>Les graphiques et calculs se mettent à jour automatiquement.</span>
             </div>
        )}

        {/* YEAR SELECTOR */}
        <div className="flex justify-center">
            <div className="bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 inline-flex shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                {[10, 15, 20, 25].map(y => (
                    <button 
                        key={y}
                        onClick={() => setProjectionYears(y)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${projectionYears === y ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'text-slate-500 hover:text-white'}`}
                    >
                        {y} ANS
                    </button>
                ))}
            </div>
        </div>

        {/* 14. TABLEAU DÉTAILLÉ - FIXED DIVISION */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 mt-8 border border-white/10 overflow-hidden">
             <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                 <div className="flex items-center gap-3">
                    <Table2 className="text-slate-400 w-6 h-6" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Plan de Financement Détaillé</h2>
                </div>
                 <div className="flex items-center gap-4">
                     <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                        <button 
                            onClick={() => setTableScenario('financement')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${tableScenario === 'financement' ? 'bg
                                                                                                            -blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Financement
                        </button>
                        <button 
                            onClick={() => setTableScenario('cash')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${tableScenario === 'cash' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Cash
                        </button>
                    </div>
                     <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                        <button 
                            onClick={() => setTableMode('annuel')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${tableMode === 'annuel' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Annuel
                        </button>
                        <button 
                            onClick={() => setTableMode('mensuel')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${tableMode === 'mensuel' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
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
                            <th className="py-4 px-4 text-slate-300">Effort {tableMode === 'annuel' ? 'Annuel' : 'Mensuel'}</th>
                            <th className="py-4 px-4 text-emerald-400 text-right">Trésorerie Cumulée</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-mono text-slate-300">
                        {/* Year 0 Row for Cash Scenario or Down Payment */}
                        <tr className="border-b border-white/5 bg-[#1a1505]/30">
                            <td className="py-4 px-4 text-yellow-500 font-bold">Année 0</td>
                            <td className="py-4 px-4 opacity-50">-</td>
                            <td className="py-4 px-4 opacity-50">-</td>
                            <td className="py-4 px-4 opacity-50">-</td>
                            <td className="py-4 px-4 text-yellow-400 font-bold uppercase">
                                APPORT : {formatMoney(tableScenario === 'financement' ? cashApport : installCost)}
                            </td>
                             <td className="py-4 px-4 text-red-400 font-bold">
                                {formatMoney(tableScenario === 'financement' ? cashApport : installCost)}
                            </td>
                            <td className="py-4 px-4 text-right text-red-500 font-bold">
                                -{formatMoney(tableScenario === 'financement' ? cashApport : installCost)}
                            </td>
                        </tr>

                        {(tableScenario === 'financement' ? calculationResult.details : calculationResult.detailsCash).slice(0, projectionYears).map((row, i) => {
                             const isCreditActive = i < (creditDurationMonths / 12) && tableScenario === 'financement';
                             const creditAmountYearly = isCreditActive ? (creditMonthlyPayment + insuranceMonthlyPayment) * 12 : 0;
                             
                             // Calculation of displayed values based on mode
                             const divider = tableMode === 'mensuel' ? 12 : 1;
                             
                             const displayNoSolar = row.edfBillWithoutSolar / divider;
                             const displayCredit = creditAmountYearly / divider;
                             const displayResidue = row.edfResidue / divider;
                             const displayTotalWithSolar = row.totalWithSolar / divider;
                             
                             // Effort is calculated from total flow
                             const yearlyEffort = row.totalWithSolar - row.edfBillWithoutSolar;
                             const displayEffort = yearlyEffort / divider;

                            return (
                                <tr key={row.year} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-slate-500">{row.year}</td>
                                    <td className="py-4 px-4 text-red-400/80">{formatMoney(displayNoSolar)}</td>
                                    <td className="py-4 px-4 text-blue-400/80">{formatMoney(displayCredit)}</td>
                                    <td className="py-4 px-4 text-yellow-400/80">{formatMoney(displayResidue)}</td>
                                    <td className="py-4 px-4 font-bold text-white">{formatMoney(displayTotalWithSolar)}</td>
                                    <td className={`py-4 px-4 font-bold ${displayEffort > 0 ? 'text-white' : 'text-emerald-400'}`}>
                                        {displayEffort > 0 ? '+' : ''}{formatMoney(displayEffort)}
                                    </td>
                                    <td className={`py-4 px-4 text-right font-bold ${row.cumulativeSavings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {formatMoney(row.cumulativeSavings)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 15. AI & CALL TO ACTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col justify-between transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                            <Eye size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">L'IA A Analysé Votre Situation</h2>
                    </div>
                    <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                        <p>Écoutez-moi bien ! Chaque seconde qui passe, votre facture fournisseur n'est pas une dépense, c'est un <strong className="text-white">impôt volontaire</strong> que vous payez à fond perdu ! C'est une hémorragie financière qui draine votre pouvoir d'achat, une rente énergétique qui engraisse les multinationales au lieu de bâtir votre patrimoine.</p>
                        <p>Imaginez un loyer qui flambe de {inflationRate}% chaque année sans jamais vous donner de propriété ! C'est exactement ce que vous subissez, un véritable suicide financier à petit feu. Vous êtes otage, prisonnier des prix dictés par d'autres.</p>
                        <p><strong className="text-white">STOP ! Avec EDF SOLAIRES, ce n'est plus une dépense, c'est un investissement stratégique !</strong> Vous arrêtez de subir, vous commencez à PRODUIRE. Reprenez le contrôle ABSOLU de votre budget énergie, transformez ce gouffre financier en une source de richesse durable.</p>
                        <p>Ne laissez plus votre argent brûler en fumée, devenez votre propre producteur ! L'heure n'est plus à la réflexion, elle est à l'action. Chaque jour d'attente, c'est de l'argent directement jeté par la fenêtre.</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#020617] border border-blue-900/50 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors"></div>
                <div className="relative z-10 max-w-md mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-6 tracking-tight">LA SEULE VRAIE QUESTION</h2>
                    <p className="text-slate-400 mb-8 font-medium">
                        Vous avez les chiffres. Vous avez les garanties. Vous avez la preuve mathématique. <br/><br/>
                        <span className="text-white font-bold">Préférez-vous enrichir votre fournisseur ou vous enrichir vous-même ?</span>
                    </p>
                    <button className="w-full bg-white text-black hover:bg-slate-200 py-4 px-8 rounded-full font-black uppercase tracking-wider flex items-center justify-center gap-2 transform transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        <CheckCircle2 size={24} /> JE VEUX MA PROPRE CENTRALE
                    </button>
                    <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">Étude gratuite et sans engagement</p>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};
