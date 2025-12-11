import React, { useState, useEffect, useMemo } from 'react';
import { SimulationResult, YearlyDetail } from '../types';
import { calculateSolarProjection, safeParseFloat } from '../utils/finance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar } from 'recharts';
import { 
  Sun, X, ChevronUp, ChevronDown, Info, AlertTriangle, Lightbulb, Zap, TrendingUp, 
  CheckCircle2, Wallet, Coins, ArrowRight, Settings, Landmark, ShieldCheck, Home, 
  BarChart3, HelpCircle, Scale, Ban, Crown, Smartphone, Server, Table2, Eye, Flame, 
  Lock, Target, Wrench, Bot, LayoutDashboard, ThumbsUp, Timer, Shield
} from 'lucide-react';
import { InputSlider } from './InputSlider';

interface ResultsDashboardProps {
  data: SimulationResult;
  onReset: () => void;
}

// Custom Toggle Component
const Toggle = ({ checked, onChange, labelOn, labelOff }: { checked: boolean, onChange: (v: boolean) => void, labelOn: string, labelOff: string }) => (
  <div className="flex items-center gap-3 bg-[#0f111a] p-1 rounded-full border border-white/5">
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

// Custom Input Card Component for Parameters
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
    <div className={`bg-[#0B0F19] border border-slate-800/50 rounded-xl p-4 flex flex-col justify-between relative group hover:border-slate-700 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
      </div>
      
      <div className="flex items-end gap-2 relative">
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
          <div className="flex flex-col gap-0.5 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0B0F19] p-1">
            <button onClick={() => setValue(parseFloat((value + step).toFixed(2)))} className="text-slate-500 hover:text-white"><ChevronUp size={16}/></button>
            <button onClick={() => setValue(parseFloat(Math.max(min, value - step).toFixed(2)))} className="text-slate-500 hover:text-white"><ChevronDown size={16}/></button>
          </div>
        )}
      </div>

      {sublabel && <div className="h-4 mt-2"><p className="text-[10px] text-slate-600 truncate">{sublabel}</p></div>}
    </div>
  );
};

// Warranty Card Component
const WarrantyCard = ({ years, label, tag, icon: Icon, description, isFr }: { years: number, label: string, tag: string, icon: any, description: string, isFr?: boolean }) => (
    <div className="bg-[#0b101b] border border-white/5 p-6 rounded-2xl group hover:border-blue-500/30 transition-all relative overflow-hidden h-full">
        {/* Normal Content */}
        <div className="transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 transform">
            <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center mb-4">
                <Icon size={20} />
            </div>
            <div className="text-3xl font-black text-white mb-1">{years} ANS</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">{label}</div>
            <div className="inline-block px-2 py-1 bg-blue-900/30 text-blue-300 text-[10px] font-bold rounded">
                {tag}
            </div>
            
            {/* French Flag badge */}
            {isFr && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#1a2e35] px-2 py-1 rounded border border-emerald-500/20">
                    <span className="text-[8px]">🇫🇷</span>
                    <span className="text-[8px] font-bold text-emerald-400">FRANÇAIS</span>
                </div>
            )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#0f172a]/95 p-6 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-10">
            <Icon size={24} className="text-blue-400 mb-3" />
            <h4 className="text-white font-bold text-sm mb-2 uppercase">{label} {years} ANS</h4>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {description}
            </p>
        </div>
    </div>
);


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

  const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  const formatNum = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  const getYearData = (year: number) => {
    const idx = year - 1;
    if (!calculationResult.details[idx]) return { credit: calculationResult.year1, cash: calculationResult.year1 };
    return { 
      credit: calculationResult.details[idx], 
      cash: calculationResult.detailsCash[idx] 
    };
  };

  const yearsToDisplay = [5, 10, 20];

  // ECONOMY CHART DATA - NET CASHFLOW
  const economyChartData = useMemo(() => {
    const sourceDetails = economyChartMode === 'financement' ? calculationResult.details : calculationResult.detailsCash;
    
    // Slice data to match current projection years (e.g., 20)
    const viewData = sourceDetails.slice(0, projectionYears);

    return viewData.map((detail, index) => {
        // Is credit active this year?
        const isCreditActive = index * 12 < creditDurationMonths && economyChartMode === 'financement';
        
        // We use 'cashflowDiff' which is the Net Gain (Bill Savings - Loan Payment)
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
            years: 30,
            label: "PANNEAUX",
            tag: "Performance garantie",
            icon: Sun,
            description: "Garantie linéaire. Vos panneaux produiront encore 87% de leur puissance initiale après 30 ans."
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
            description: "Garantie sur le système de fixation et l'étanchéité de votre toiture."
        },
        {
            years: 25,
            label: "PANNEAUX",
            tag: "Matériel uniquement",
            icon: Sun,
            description: "Garantie matérielle contre tout défaut de fabrication ou vice caché."
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
    <div className="min-h-screen bg-[#020204] text-white font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#020204]/90 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-lg">
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
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1D26] hover:bg-[#252936] text-slate-300 text-xs font-bold uppercase tracking-wider rounded border border-white/10 transition-colors"
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
            <div className="bg-[#050810] border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080B14]">
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
                        <ParamCard 
                            label="Prix Électricité (€/kWh)" 
                            value={electricityPrice} 
                            setValue={setElectricityPrice} 
                            step={0.01}
                            unit=""
                            icon={<Zap size={14} className="text-yellow-400" />}
                            sublabel="Tarif actuel du kWh chez votre fournisseur"
                        />
                        <ParamCard 
                            label="Production Annuelle (kWh)" 
                            value={yearlyProduction} 
                            setValue={setYearlyProduction} 
                            step={100}
                            unit=""
                            icon={<Sun size={14} className="text-orange-400" />}
                            sublabel="kWh produits par vos panneaux/an"
                        />
                         <ParamCard 
                            label="Taux Autoconsommation (%)" 
                            value={selfConsumptionRate} 
                            setValue={setSelfConsumptionRate} 
                            unit=""
                            icon={<TrendingUp size={14} className="text-emerald-400" />}
                            sublabel="% de production consommée directement"
                        />
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
                            sublabel="Prix total TTC du projet"
                        />
                        <ParamCard 
                            label="Apport Cash (€)" 
                            value={cashApport} 
                            setValue={setCashApport} 
                            step={100}
                            unit=""
                            icon={<Coins size={14} className="text-emerald-400" />}
                            sublabel="Montant payé comptant"
                        />
                         <ParamCard 
                            label="Reste à Financer (€)" 
                            value={remainingToFinance} 
                            setValue={setRemainingToFinance} 
                            unit=""
                            icon={<Wallet size={14} className="text-blue-400" />}
                            sublabel="Montant financé par crédit"
                            disabled={true}
                        />
                    </div>

                    {/* Credit Section */}
                    <div className="bg-[#0b0e17] border border-indigo-500/20 rounded-xl p-6 relative">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="text-blue-500"><Wallet size={20} /></div>
                             <h3 className="text-sm font-black text-white uppercase tracking-wider">FINANCEMENT CRÉDIT</h3>
                        </div>

                        <div className="bg-[#050810] border border-white/5 rounded-lg p-4 mb-6 flex items-center justify-between">
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
                                        sublabel="Taux assurance annuel (ex: 0.3%)"
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
             <div className="bg-[#0B101E] border border-blue-900/30 p-4 rounded-xl flex items-center gap-3 text-blue-200 text-sm">
                <Info size={18} />
                <span>Les graphiques et calculs se mettent à jour automatiquement.</span>
             </div>
        )}

        {/* 1. SECTION INACTION */}
        <div className="bg-gradient-to-r from-[#2a0505] to-[#1a0303] border border-red-900/30 rounded-[24px] p-8 relative overflow-hidden group shadow-2xl shadow-red-900/10">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]"></div>
            
            <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-stretch">
                <div className="flex-1 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-red-500">
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Et si je ne fais rien ?</h2>
                            <p className="text-red-200/60 font-medium text-sm">Voici ce qui se passe si vous attendez "juste" 1 an de plus...</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#0f0303]/80 border border-red-900/30 p-6 rounded-xl hover:border-red-500/30 transition-colors">
                            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
                                <Wallet size={12} /> Facture Perdue (1 An)
                            </div>
                            <div className="text-4xl font-black text-white">{formatMoney(calculationResult.lossIfWait1Year)}</div>
                            <div className="text-xs text-red-400 mt-2 font-medium">Argent parti chez votre fournisseur</div>
                        </div>
                        <div className="bg-[#0f0303]/80 border border-red-900/30 p-6 rounded-xl hover:border-yellow-500/30 transition-colors">
                            <div className="flex items-center gap-2 text-yellow-500/70 text-[10px] font-bold uppercase tracking-widest mb-2">
                                <Zap size={12} /> Économies Ratées
                            </div>
                            <div className="text-4xl font-black text-white">{formatMoney(calculationResult.savingsLostIfWait1Year)}</div>
                            <div className="text-xs text-slate-400 mt-2 font-medium">Ce que vous auriez économisé</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#120505] border border-red-500/10 rounded-2xl p-8 min-w-[320px] flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-2 text-red-100 text-[10px] font-bold uppercase tracking-widest mb-3">
                        <Timer size={14} className="text-red-500"/> Chaque seconde d'hésitation
                    </div>
                    <div className="text-6xl font-black text-red-500 font-mono tracking-tighter mb-2">
                        -{wastedCash.toFixed(2)} €
                    </div>
                    <p className="text-xs text-red-200/40 mb-6">...s'envole pendant que vous lisez cette page</p>

                    <button className="px-5 py-3 bg-[#2a0a0a] border border-red-500/20 rounded-lg text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                        Le meilleur moment ? C'était hier.
                    </button>
                </div>
            </div>
        </div>

        {/* YEAR SELECTOR */}
        <div className="flex justify-center">
            <div className="bg-[#121212] p-1 rounded-xl border border-white/10 inline-flex">
                {[10, 15, 20, 25].map(y => (
                    <button 
                        key={y}
                        onClick={() => setProjectionYears(y)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${projectionYears === y ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-500 hover:text-white'}`}
                    >
                        {y} ANS
                    </button>
                ))}
            </div>
        </div>

        {/* 2. SECTION AUTONOMY */}
        <div className="bg-gradient-to-r from-[#022c22] to-[#064e3b] border border-emerald-500/20 rounded-[24px] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
             <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="relative w-48 h-48 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                             {/* Background Track Circle */}
                             <Pie
                                data={[{ value: 100 }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={85}
                                startAngle={180}
                                endAngle={-180}
                                dataKey="value"
                                stroke="none"
                                isAnimationActive={false}
                             >
                                <Cell fill="#065f46" opacity={0.3} />
                             </Pie>
                             {/* Foreground Value Circle */}
                             <Pie
                                 data={[{ value: calculationResult.savingsRatePercent }]}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={70}
                                 outerRadius={85}
                                 startAngle={180}
                                 endAngle={180 - (360 * calculationResult.savingsRatePercent / 100)}
                                 dataKey="value"
                                 stroke="none"
                                 cornerRadius={10}
                             >
                                 <Cell fill="#34d399" />
                             </Pie>
                         </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <Zap className="text-emerald-400 w-8 h-8 mb-1 fill-emerald-400/20" />
                        <span className="text-5xl font-black text-white leading-none">{calculationResult.savingsRatePercent.toFixed(0)}%</span>
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1">Autonomie</span>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Autonomie Énergétique</h2>
                    <p className="text-emerald-200 text-xl font-medium">Vous effacez <span className="text-white font-bold">{calculationResult.savingsRatePercent.toFixed(0)}%</span> de votre facture d'électricité.</p>
                    <div className="inline-flex items-center gap-3 bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-500/20">
                         <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                         <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
                            Sur une consommation de {formatNum(safeParseFloat(data.params.yearlyConsumption))} kWh/an
                         </span>
                    </div>
                    <div className="text-emerald-400/80 text-xs italic flex items-center justify-center md:justify-start gap-2">
                        <Lightbulb size={12} /> Pendant que vos voisins regardent leur facture grimper, la vôtre fond.
                    </div>
                </div>

                <div className="bg-[#062c1e] border border-emerald-500/20 p-8 rounded-3xl min-w-[240px] text-center shadow-xl">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Gain Total Projeté</div>
                    <div className="text-5xl font-black text-white tracking-tight">{formatMoney(calculationResult.totalSavingsProjected)}</div>
                </div>
             </div>
        </div>

        {/* 3. SECTION REPARTITION */}
        <div className="bg-[#050505] border border-white/5 rounded-[24px] p-8">
            <div className="flex items-center gap-3 mb-8">
                <Zap className="text-yellow-500" />
                <h2 className="text-xl font-bold uppercase tracking-wide">Répartition Énergie</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Fixed Height Container for Chart */}
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Autoconso', value: yearlyProduction * (selfConsumptionRate/100), fill: '#f59e0b' }, 
                                    { name: 'Surplus', value: yearlyProduction * ((100-selfConsumptionRate)/100), fill: '#8b5cf6' }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#f59e0b" /> 
                                <Cell fill="#8b5cf6" />
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                                formatter={(val: number) => `${formatNum(val)} kWh`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total</span>
                        <span className="text-3xl font-black text-white">{yearlyProduction}</span>
                        <span className="text-xs text-slate-400">kWh/an</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#1a0e05] border border-amber-900/30 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="font-bold text-white">Autoconso.</span>
                        </div>
                        <div className="text-4xl font-black text-amber-500 mb-1">
                            {formatNum(yearlyProduction * (selfConsumptionRate/100))} kWh
                        </div>
                        <p className="text-xs text-slate-400">Énergie consommée directement chez vous. <span className="text-amber-500 font-bold">Économie maximale</span> car aucun coût réseau.</p>
                    </div>

                    <div className="bg-[#0f0a1a] border border-violet-900/30 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                            <span className="font-bold text-white">Vente surplus</span>
                        </div>
                        <div className="text-4xl font-black text-violet-500 mb-1">
                            {formatNum(yearlyProduction * ((100-selfConsumptionRate)/100))} kWh
                        </div>
                        <p className="text-xs text-slate-400">Surplus revendu à EDF OA. <span className="text-violet-400 font-bold">Revenu garanti</span> pendant 20 ans.</p>
                    </div>

                     <div className="bg-[#021a12] border border-emerald-900/30 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp size={16} className="text-emerald-500" />
                            <span className="font-bold text-emerald-500 uppercase text-xs">OPTIMISATION</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Modifiez le <span className="text-emerald-400 font-bold cursor-pointer hover:underline" onClick={() => setShowParamsEditor(true)}>taux d'autoconsommation</span> dans les paramètres pour voir l'impact sur votre rentabilité.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. FINANCEMENT VS CASH */}
        <div className="bg-[#050505] rounded-[32px] p-8 border border-white/5 mt-8">
            <div className="flex items-center gap-3 mb-8">
                 <div className="text-emerald-500"><Coins size={24} /></div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight">FINANCEMENT VS PAIEMENT CASH</h2>
            </div>
            <p className="text-slate-500 text-sm mb-8 -mt-6 ml-9">Quel mode de paiement maximise votre retour sur investissement ?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Card Financement */}
                 <div className="bg-[#0b101b] border border-blue-900/30 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-400">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase">AVEC FINANCEMENT</h3>
                            <p className="text-blue-300 text-xs">Étalement de la charge</p>
                        </div>
                         {/* Card visual */}
                        <div className="absolute top-4 right-4 opacity-10">
                            <Wallet size={80} className="text-blue-500" />
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center p-3 bg-[#050810] rounded-lg border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">GAIN TOTAL (20 ANS)</span>
                            <span className="text-xl font-black text-white">{formatMoney(calculationResult.totalSavingsProjected)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#050810] rounded-lg border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">POINT MORT</span>
                            <span className="text-xl font-black text-blue-400">{calculationResult.breakEvenPoint} ans</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#050810] rounded-lg border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">ROI ANNUEL</span>
                            <span className="text-xl font-black text-emerald-400">+{calculationResult.roiPercentage}%</span>
                        </div>
                    </div>

                    {/* Avantages */}
                    <div className="bg-blue-950/10 border border-blue-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-bold uppercase">
                            <CheckCircle2 size={14} /> AVANTAGES
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-blue-500" /> Aucun cash bloqué - Vous gardez votre épargne liquide
                            </li>
                             <li className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-blue-500" /> Effort mensuel maîtrisé ({formatMoney(calculationResult.monthlyEffortYear1)})
                            </li>
                             <li className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-blue-500" /> Vous profitez immédiatement des économies
                            </li>
                        </ul>
                    </div>
                 </div>

                 {/* Card Cash */}
                 <div className="bg-[#05110e] border border-emerald-900/30 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                     {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400">
                            <Coins size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase">PAIEMENT CASH</h3>
                            <p className="text-emerald-300 text-xs">Rentabilité maximale</p>
                        </div>
                         {/* Card visual */}
                         <div className="absolute top-4 right-4 opacity-10">
                            <Coins size={80} className="text-emerald-500" />
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center p-3 bg-[#020604] rounded-lg border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">GAIN TOTAL (20 ANS)</span>
                            <span className="text-xl font-black text-emerald-400">{formatMoney(calculationResult.totalSavingsProjectedCash)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#020604] rounded-lg border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">POINT MORT</span>
                            <span className="text-xl font-black text-emerald-400">{calculationResult.breakEvenPointCash} ans</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#020604] rounded-lg border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">ROI ANNUEL</span>
                            <span className="text-xl font-black text-emerald-400">+{calculationResult.roiPercentageCash}%</span>
                        </div>
                    </div>

                    {/* Avantages */}
                    <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-bold uppercase">
                            <CheckCircle2 size={14} /> AVANTAGES
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-emerald-500" /> ROI supérieur (+{(calculationResult.roiPercentageCash - calculationResult.roiPercentage).toFixed(1)}% vs crédit)
                            </li>
                             <li className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-emerald-500" /> Point mort plus rapide ({calculationResult.breakEvenPointCash} ans vs {calculationResult.breakEvenPoint})
                            </li>
                             <li className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-emerald-500" /> Pas d'intérêts bancaires - 100% des économies pour vous
                            </li>
                        </ul>
                    </div>
                 </div>
            </div>

            {/* Verdict */}
            <div className="mt-8 bg-[#180a15] border border-purple-900/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                   <Target className="text-purple-400 w-6 h-6" />
                   <Lightbulb className="text-yellow-400 w-6 h-6" />
                   <h3 className="text-lg font-black text-white uppercase">LE VERDICT DU CONSEILLER</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="text-emerald-400 font-bold">Cash optimal</span> si vous avez l'épargne disponible (+{formatMoney(calculationResult.totalSavingsProjectedCash - calculationResult.totalSavingsProjected)} de gain sur 20 ans). 
                    <span className="text-blue-400 font-bold ml-1">Financement intelligent</span> si vous préférez garder votre trésorerie liquide pour d'autres projets.
                    <span className="block mt-2 font-bold text-white">Dans les deux cas, vous gagnez. <span className="text-slate-400 font-normal">La vraie perte ? C'est de ne rien faire.</span></span>
                </p>
            </div>
        </div>

        {/* 5. WHERE WILL YOUR MONEY BE */}
        <div className="bg-[#020204] rounded-2xl p-4 md:p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="text-blue-500"><HelpCircle size={28} /></div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Où sera votre argent ?</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {yearsToDisplay.map((year, idx) => {
                    const data = getYearData(year);
                    const noSolarSpend = -data.credit.cumulativeSpendNoSolar;
                    
                    let headerColor = "text-orange-500";
                    
                    if (year === 10) {
                        headerColor = "text-blue-500";
                    } else if (year === 20) {
                        headerColor = "text-emerald-500";
                    }

                    return (
                        <div key={year} className={`relative bg-[#080B14] border border-slate-800 rounded-2xl p-8 overflow-hidden group transition-colors ${year === 10 ? 'hover:border-blue-900/30' : year === 20 ? 'hover:border-emerald-900/30' : 'hover:border-orange-900/30'}`}>
                            <div className="absolute top-4 right-4 text-[140px] font-black text-white opacity-[0.03] leading-none pointer-events-none select-none">
                                {year}
                            </div>
                            
                            <h3 className={`${headerColor} font-bold text-sm uppercase mb-8 tracking-wider`}>DANS {year} ANS</h3>
                            
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Avec Solaire (Crédit)</div>
                                    <div className={`text-2xl font-black ${year === 20 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                        {formatMoney(data.credit.cumulativeSavings)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Avec Solaire (Cash)</div>
                                     <div className={`text-2xl font-black ${year === 20 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                        {formatMoney(data.cash.cumulativeSavings)}
                                    </div>
                                </div>
                                <div className="bg-[#2a0505] border border-red-900/30 p-4 rounded-xl -mx-2">
                                    <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Sans rien faire</div>
                                    <div className="text-2xl font-black text-red-500">
                                        {formatMoney(noSolarSpend)}
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`mt-6 pt-6 border-t border-white/5 text-[10px] italic ${year === 20 ? 'text-emerald-400' : year === 10 ? 'text-blue-400' : 'text-orange-400'}`}>
                                {year === 5 && "Vous commencez à voir la différence"}
                                {year === 10 && "L'écart se creuse significativement"}
                                {year === 20 && "C'est un capital transmissible"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 6. COMPARISON WITH OTHER OPTIONS */}
        <div className="bg-[#050505] border border-white/5 rounded-[32px] p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Landmark size={120} className="text-purple-500" />
             </div>
             
             <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="text-purple-500"><Landmark size={28} /></div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Comparaison avec vos autres options</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* LIVRET A */}
                    <div className="bg-[#0F121E] border border-blue-900/20 p-6 rounded-2xl flex flex-col justify-between h-full group hover:border-blue-500/40 transition-colors">
                        <div>
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400"><Landmark size={20} /></div>
                                 <div>
                                     <h3 className="font-bold text-white text-sm">Livret A</h3>
                                     <p className="text-[10px] text-blue-300">Capital bloqué</p>
                                 </div>
                             </div>
                             <div className="text-4xl font-black text-blue-500 mb-2">2.7%</div>
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rendement annuel moyen</div>
                        </div>
                    </div>

                    {/* ASSURANCE VIE */}
                    <div className="bg-[#160b16] border border-purple-900/20 p-6 rounded-2xl flex flex-col justify-between h-full group hover:border-purple-500/40 transition-colors">
                        <div>
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="bg-purple-900/30 p-2 rounded-lg text-purple-400"><ShieldCheck size={20} /></div>
                                 <div>
                                     <h3 className="font-bold text-white text-sm">Assurance Vie</h3>
                                     <p className="text-[10px] text-purple-300">Frais de gestion</p>
                                 </div>
                             </div>
                             <div className="text-4xl font-black text-purple-500 mb-2">3.5%</div>
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rendement annuel moyen</div>
                        </div>
                    </div>

                     {/* SCPI */}
                     <div className="bg-[#1a1005] border border-orange-900/20 p-6 rounded-2xl flex flex-col justify-between h-full group hover:border-orange-500/40 transition-colors">
                        <div>
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="bg-orange-900/30 p-2 rounded-lg text-orange-400"><Home size={20} /></div>
                                 <div>
                                     <h3 className="font-bold text-white text-sm">SCPI/Immobilier</h3>
                                     <p className="text-[10px] text-orange-300">Illiquide</p>
                                 </div>
                             </div>
                             <div className="text-4xl font-black text-orange-500 mb-2">4.5%</div>
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rendement annuel moyen</div>
                        </div>
                    </div>

                    {/* SOLAIRE */}
                    <div className="bg-[#022c22] border border-emerald-500 p-6 rounded-2xl flex flex-col justify-between h-full relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] transform md:scale-105">
                         <div className="absolute top-3 right-3 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase shadow-lg">Meilleur Choix</div>
                        <div>
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400"><Sun size={20} /></div>
                                 <div>
                                     <h3 className="font-black text-white text-sm uppercase">Solaire</h3>
                                     <p className="text-[10px] text-emerald-300">Sans bloquer de cash</p>
                                 </div>
                             </div>
                             <div className="text-4xl font-black text-emerald-400 mb-2">{calculationResult.roiPercentage}%</div>
                             <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4">Rendement annuel moyen</div>
                             <div className="border-t border-emerald-500/30 pt-3 text-xs font-bold text-white flex items-center gap-2">
                                 <CheckCircle2 size={14} className="text-emerald-400"/>
                                 + Vous produisez votre propre énergie
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 bg-[#050505] border border-white/10 p-4 rounded-xl flex items-start gap-3">
                    <Lightbulb size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">
                        <strong className="text-white">La différence ?</strong> Les placements classiques <span className="text-red-400">immobilisent votre capital</span>. Le solaire vous permet de <span className="text-emerald-400">financer l'installation avec vos économies futures</span>, tout en gardant votre épargne disponible pour d'autres opportunités.
                    </p>
                </div>
             </div>
        </div>

        {/* 7. CAPITAL PATRIMONIAL & SIDE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* LEFT: CAPITAL PATRIMONIAL */}
            <div className="lg:col-span-2 bg-[#0d121f] border border-white/5 rounded-[32px] p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                {/* Background elements */}
                <div className="absolute top-0 right-0 p-8 opacity-40 pointer-events-none">
                     <Wallet size={200} className="text-blue-500/20" />
                </div>

                <div className="relative z-10">
                    {/* Badges */}
                    <div className="flex gap-2 mb-4">
                        <div className="bg-[#0f172a] border border-blue-500/30 text-blue-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                            <Lock size={12} /> PROJECTION 20 ANS
                        </div>
                        <div className="bg-[#062c1e] border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={12} /> ROI {calculationResult.roiPercentage}%/AN
                        </div>
                    </div>

                    <h2 className="text-xl text-slate-400 font-medium mb-1">Capital Patrimonial Sécurisé</h2>
                    <div className="text-7xl font-black text-white tracking-tighter mb-8">
                        {formatMoney(calculationResult.totalSavingsProjected)}
                    </div>

                    {/* Info Box */}
                    <div className="bg-[#1e293b]/50 border border-blue-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm">
                            <Info size={16} className="text-blue-400" />
                            <Lightbulb size={16} className="text-yellow-400" />
                            Comment est calculé ce gain ?
                        </div>
                        <p className="text-xs text-blue-200 mb-4 leading-relaxed">
                            C'est la différence entre <span className="text-red-400 font-bold">ce que vous auriez payé au fournisseur</span> (sans panneaux) et <span className="text-blue-400 font-bold">ce que vous payez réellement</span> (crédit + reste de facture).
                        </p>
                        
                        <div className="bg-[#0f172a] p-4 rounded-lg font-mono text-[10px] text-slate-400 space-y-2 border border-white/5">
                            <div className="text-slate-500 uppercase tracking-widest mb-2">FORMULE :</div>
                            <div className="text-red-400">Facture Sans Panneaux (inflation comprise)</div>
                            <div className="text-slate-600 text-[9px] pl-2">MOINS</div>
                            <div className="text-blue-400">(Mensualité Crédit + Reste Facture Réduite)</div>
                            <div className="text-slate-600 text-[9px] pl-2">ÉGALE</div>
                            <div className="text-emerald-400 font-bold text-xs">Votre Gain Net</div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-yellow-500/80 italic">
                            <AlertTriangle size={12} /> Les premières années, le gain peut être négatif (effort d'investissement). Après le crédit, il devient massif et permanent.
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#0f1420] border border-white/5 p-4 rounded-xl">
                            <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">RENTABILITÉ</div>
                            <div className="text-2xl font-black text-emerald-400">+{calculationResult.roiPercentage}%</div>
                            <div className="text-[10px] text-slate-500 mt-1">Vs Livret A (2.7%)</div>
                        </div>
                        
                        <div className="bg-[#0f1420] border border-white/5 p-4 rounded-xl">
                            <div className="text-[10px] font-bold text-blue-500 uppercase mb-1">GAIN MOYEN</div>
                            <div className="text-2xl font-black text-white">+{Math.round(calculationResult.totalSavingsProjected / projectionYears)} €/an</div>
                            <div className="text-[10px] text-slate-500 mt-1">Pouvoir d'achat</div>
                        </div>

                        <div className="bg-[#0f1420] border border-white/5 p-4 rounded-xl relative group">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase mb-1 cursor-help">
                                POINT MORT <HelpCircle size={10}/>
                            </div>
                            <div className="text-2xl font-black text-white">{calculationResult.breakEvenPoint} ans</div>
                            <div className="text-[10px] text-slate-500 mt-1">Vous récupérez votre mise</div>
                            
                            {/* Tooltip Point Mort */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1e293b] border border-emerald-500/30 p-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase">
                                    <Target size={14} /> C'est quoi le point mort ?
                                </div>
                                <p className="text-xs text-white mb-2 font-bold">
                                    C'EST L'ANNÉE OÙ VOUS COMMENCEZ À GAGNER DE L'ARGENT.
                                </p>
                                <div className="space-y-1 text-[10px] font-mono border-t border-white/10 pt-2">
                                    <div className="flex justify-between text-slate-400">
                                        <span>AVANT {calculationResult.breakEvenPoint} ANS</span>
                                        <span>= INVESTISSEMENT</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-400 font-bold">
                                        <span>APRÈS {calculationResult.breakEvenPoint} ANS</span>
                                        <span>= PROFIT PUR</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0f1420] border border-white/5 p-4 rounded-xl">
                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">INVESTISSEMENT</div>
                            <div className="text-2xl font-black text-slate-400">{formatNum(installCost)} €</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: SIDE CARDS */}
            <div className="space-y-6 flex flex-col">
                {/* 1. EQUIVALENT BANCAIRE */}
                <div className="flex-1 bg-[#0b0e1e] border border-blue-900/30 rounded-[32px] p-8 flex flex-col justify-center shadow-lg shadow-blue-900/10">
                    <div className="flex items-center gap-3 mb-6">
                         <Landmark className="text-blue-500 w-6 h-6" />
                         <h3 className="text-sm font-bold text-blue-100 uppercase tracking-widest">ÉQUIVALENT BANCAIRE</h3>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        Pour générer <span className="text-white font-bold">{Math.round(calculationResult.totalSavingsProjected / projectionYears)} €/an</span> avec un Livret A, il vous faudrait bloquer :
                    </p>
                    
                    <div className="text-5xl font-black text-white mb-6">
                        {formatMoney(calculationResult.bankEquivalentCapital)}
                    </div>
                    
                    <div className="inline-block bg-[#172554] border border-blue-500/30 px-3 py-1.5 rounded text-[10px] font-bold text-blue-300 uppercase tracking-wide w-fit">
                        ICI, VOUS NE BLOQUEZ RIEN.
                    </div>
                    
                    <div className="mt-8 flex gap-2 text-[10px] text-slate-500 italic border-t border-white/5 pt-4">
                        <Coins size={12} className="text-yellow-500" />
                        Avec le solaire, votre argent reste libre pendant que vous générez des revenus.
                    </div>
                </div>

                {/* 2. EFFORT D'EPARGNE */}
                <div className="bg-[#1a0f05] border border-orange-900/30 rounded-[32px] p-8 flex flex-col justify-center shadow-lg shadow-orange-900/10">
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            </div>
                            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest">EFFORT D'ÉPARGNE</h3>
                         </div>
                         <HelpCircle size={16} className="text-slate-600"/>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                         <div className="text-5xl font-black text-white">+{formatMoney(calculationResult.monthlyEffortYear1)}</div>
                         <div className="text-sm text-slate-500 font-medium">/mois</div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-xs font-medium border-b border-white/5 pb-2">
                             <span className="text-slate-400">DÉTAIL :</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                             <span className="text-slate-300">Nouveau Budget :</span>
                             <span className="text-white">{formatMoney(calculationResult.newMonthlyBillYear1)}</span>
                        </div>
                         <div className="flex justify-between text-xs font-bold">
                             <span className="text-slate-300">Ancien Budget :</span>
                             <span className="text-red-400">-{formatMoney(calculationResult.oldMonthlyBillYear1)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black pt-2 border-t border-white/10">
                             <span className="text-orange-500">= Effort</span>
                             <span className="text-orange-500">+{formatMoney(calculationResult.monthlyEffortYear1)}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 text-[10px] text-orange-400/80 italic">
                        <Zap size={12} className="text-orange-500 flex-shrink-0" />
                        Cet effort est TEMPORAIRE (durée du crédit). Après, vous économisez {formatMoney(calculationResult.oldMonthlyBillYear1)}/mois à vie.
                    </div>
                </div>
            </div>
        </div>

        {/* 8. BILAN TOTAL SUR 20 ANS */}
        <div className="bg-[#050505] border border-white/10 rounded-[32px] p-8 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <Scale className="text-white w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">BILAN TOTAL SUR {projectionYears} ANS</h2>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                            <Lightbulb size={14} className="text-yellow-500" />
                            Imaginez ces barres comme deux comptes bancaires...
                        </div>
                    </div>
                </div>
                <div className="bg-[#121212] p-1 rounded-lg flex gap-1 border border-white/10">
                    <button 
                        onClick={() => setGouffreMode('financement')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${gouffreMode === 'financement' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        Financement
                    </button>
                    <button 
                        onClick={() => setGouffreMode('cash')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${gouffreMode === 'cash' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        Cash
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">SANS SOLAIRE (ARGENT PERDU)</span>
                    </div>
                    
                    <div className="h-16 bg-[#1a0a0a] rounded-full border border-red-500/20 relative overflow-hidden flex items-center px-6">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500" style={{ width: '100%' }}></div>
                         <span className="relative z-10 text-3xl font-black text-white ml-auto text-shadow-sm">
                             {formatMoney(gouffreMode === 'financement' ? calculationResult.totalSpendNoSolar : calculationResult.totalSpendNoSolarCash)}
                         </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 text-red-400 text-xs italic opacity-80">
                         <Coins size={12} /> Cet argent est parti pour toujours.
                    </div>
                </div>

                 <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">AVEC SOLAIRE (INVESTISSEMENT PATRIMONIAL)</span>
                    </div>
                    
                    <div className="h-16 bg-[#0a101a] rounded-full border border-blue-500/20 relative overflow-hidden flex items-center px-6">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400" 
                            style={{ width: `${((calculationResult.totalSpendNoSolar - calculationResult.totalSavingsProjected) / calculationResult.totalSpendNoSolar) * 100}%` }}
                        ></div>
                        <span className="relative z-10 text-3xl font-black text-white ml-auto text-shadow-sm">
                            {formatMoney((gouffreMode === 'financement' ? calculationResult.totalSpendNoSolar : calculationResult.totalSpendNoSolarCash) - (gouffreMode === 'financement' ? calculationResult.totalSavingsProjected : calculationResult.totalSavingsProjectedCash))}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2 text-blue-400 text-xs italic opacity-80">
                             <Zap size={12} /> Cette dépense génère un actif qui produit pendant 25+ ans.
                        </div>
                        <div className="bg-[#062c1e] text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20 text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/50">
                            💰 Différence : {formatMoney(gouffreMode === 'financement' ? calculationResult.totalSavingsProjected : calculationResult.totalSavingsProjectedCash)}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 9. LOCATAIRE VS PROPRIETAIRE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Locataire */}
            <div className="bg-[#0f0303] border border-red-900/30 rounded-[24px] p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-red-950/50 text-red-500 text-[10px] font-bold px-3 py-1 rounded border border-red-900/50 uppercase">
                    Modèle Dépassé
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#1a0505] border border-red-900/30 flex items-center justify-center text-red-500">
                        <Ban size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase">LOCATAIRE ÉNERGÉTIQUE</h3>
                    </div>
                </div>
                
                <p className="text-red-200 text-sm font-medium mb-6">
                    Vous louez l'électricité que vous consommez. Chaque euro payé disparaît.
                </p>

                <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                        Vous subissez 100% des hausses (inflation sans fin)
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <AlertTriangle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                        0€ de capital créé après 20 ans (facture éternelle)
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
                    <TrendingUp size={12} className="transform rotate-180"/> Pendant que vous payez, votre pouvoir d'achat s'érode.
                </div>
            </div>

            {/* Proprietaire */}
            <div className="bg-[#020617] border border-blue-600/30 rounded-[24px] p-8 relative overflow-hidden shadow-2xl shadow-blue-900/10">
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg uppercase">
                    Votre Liberté
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                        <Crown size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase">PROPRIÉTAIRE PRODUCTEUR</h3>
                    </div>
                </div>

                <p className="text-blue-100 text-sm font-medium mb-6">
                    Vous possédez votre centrale. Chaque kWh produit vous appartient.
                </p>

                <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm text-white">
                        <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                        Prix du kWh bloqué et garanti pendant 30 ans
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
                    <TrendingUp size={12}/> Pendant que vous économisez, votre patrimoine grandit.
                </div>
            </div>
        </div>

        {/* 10. GARANTIES & SECURITE */}
        <div className="bg-[#050505] border border-white/10 rounded-[32px] p-8 mt-8">
            <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="text-orange-500 w-6 h-6" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">GARANTIES & SÉCURITÉ</h2>
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
                         <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">OFFRE ESSENTIELLE - TVA RÉDUITE 5.5%</span>
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
                <div className="bg-[#080B14] border border-blue-900/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                     <Zap className="text-yellow-400 w-4 h-4" />
                     <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">OFFRE PERFORMANCE - TVA 20%</span>
                     <span className="text-xs text-slate-500 ml-auto hidden md:block">Garantie maximale avec autopilote IA, afficheur temps réel et production garantie 30 ans.</span>
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

            {/* Difference Block (Only if Warranty Mode is OFF/Essentielle) */}
            {!warrantyMode && (
                 <div className="mt-6 bg-[#0f0505] border border-red-900/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                         <AlertTriangle className="text-orange-500" size={20} />
                         <h3 className="font-bold text-white text-sm">Différences avec l'offre Performance</h3>
                    </div>
                    <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-xs text-slate-400"><X size={14} className="text-red-500"/> Pas d'autopilote IA (surveillance à distance)</li>
                        <li className="flex items-center gap-2 text-xs text-slate-400"><X size={14} className="text-red-500"/> Pas d'afficheur connecté temps réel</li>
                        <li className="flex items-center gap-2 text-xs text-slate-400"><X size={14} className="text-red-500"/> Garantie performance 25 ans au lieu de 30 ans</li>
                        <li className="flex items-center gap-2 text-xs text-white font-bold"><CheckCircle2 size={14} className="text-emerald-500"/> TVA réduite à 5.5% (économie immédiate de ~2700€)</li>
                        <li className="flex items-center gap-2 text-xs text-white font-bold"><CheckCircle2 size={14} className="text-emerald-500"/> Panneaux fabriqués en France</li>
                    </ul>
                    <button 
                        onClick={() => setWarrantyMode(true)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider hover:from-blue-500 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowRight size={16} /> PASSER À L'OFFRE PERFORMANCE
                    </button>
                 </div>
            )}

            {/* Autopilote (Only if Warranty Mode is ON/Performance) */}
            {warrantyMode && (
                <>
                <div className="bg-[#110e1c] border border-indigo-500/20 rounded-2xl p-6 mt-6 flex flex-col md:flex-row items-start gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <Bot size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white uppercase">AUTOPILOTE INTELLIGENT EDF</h3>
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase">Exclusif</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Votre installation est pilotée 24/7 par intelligence artificielle. Nous détectons les pannes à distance AVANT que vous ne les remarquiez.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#0b0d14] p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-blue-200 uppercase">SURVEILLANCE EN TEMPS RÉEL</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Chaque panneau est surveillé individuellement. Détection instantanée des anomalies (ombre, salissure, défaillance).
                                </p>
                            </div>
                            <div className="bg-[#0b0d14] p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-bold text-blue-200 uppercase">OPTIMISATION AUTOMATIQUE</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    L'IA ajuste en permanence les paramètres pour maximiser votre production et vos économies.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* AFFICHEUR CONNECTE */}
                <div className="bg-[#150a15] border border-pink-900/30 rounded-2xl p-6 mt-6 flex flex-col md:flex-row items-start gap-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                    <div className="w-12 h-12 bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-400 flex-shrink-0">
                        <Eye size={24} />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white uppercase">AFFICHEUR CONNECTÉ EN TEMPS RÉEL</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Suivez votre production, votre consommation et vos économies depuis votre smartphone ou tablette.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                                <Zap size={20} className="text-yellow-400 mb-2"/>
                                <div className="text-xs font-bold text-white mb-1">Production Live</div>
                                <div className="text-[10px] text-slate-500">kW actuels + Cumul jour</div>
                            </div>
                            <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                                <Home size={20} className="text-orange-400 mb-2"/>
                                <div className="text-xs font-bold text-white mb-1">Consommation Live</div>
                                <div className="text-[10px] text-slate-500">Appareil par appareil</div>
                            </div>
                            <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                                <Coins size={20} className="text-emerald-400 mb-2"/>
                                <div className="text-xs font-bold text-white mb-1">Économies Temps Réel</div>
                                <div className="text-[10px] text-slate-500">€ économisés aujourd'hui</div>
                            </div>
                        </div>
                        
                        <div className="bg-[#2a1020] border border-pink-500/20 p-3 rounded-lg flex items-center gap-3 text-xs text-pink-200">
                            <Info size={16} className="text-pink-500 flex-shrink-0" />
                            Optimisez vos consommations : l'afficheur vous suggère les meilleurs moments pour lancer lave-linge, lave-vaisselle, etc.
                        </div>
                    </div>
                </div>

                {/* RESULTAT BANNER */}
                <div className="bg-[#040912] border border-blue-900/40 p-4 rounded-xl mt-6 flex items-center gap-3 shadow-lg shadow-blue-900/10 animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
                    <ShieldCheck size={20} className="text-orange-400 flex-shrink-0" />
                    <p className="text-sm text-blue-200 font-bold">
                        RÉSULTAT : Vous dormez tranquille. Nous surveillons tout 24/7. Si problème, on intervient gratuitement. Si sous-production, on paie la différence.
                    </p>
                </div>
                </>
            )}
        </div>

        {/* 11. STRUCTURE DU BUDGET (MENSUEL) */}
        <div className="bg-[#050505] border border-white/10 rounded-[32px] p-8 mt-8">
            <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <Scale className="text-slate-400 w-6 h-6" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">STRUCTURE DU BUDGET (MENSUEL)</h2>
                </div>
                 <div className="bg-[#121212] px-4 py-1.5 rounded text-xs font-bold text-slate-400 border border-white/10">
                     Année 1 - Comparatif
                 </div>
            </div>

            <div className="space-y-8">
                {/* Situation Actuelle */}
                <div>
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                        <span>SITUATION ACTUELLE</span>
                        <span className="text-red-500">{formatMoney(calculationResult.oldMonthlyBillYear1)} /mois</span>
                    </div>
                    <div className="h-16 bg-red-600 rounded-lg flex items-center justify-between px-6 shadow-lg shadow-red-900/20 relative overflow-hidden group">
                        <span className="relative z-10 text-white font-black text-lg uppercase tracking-wider">FACTURE ACTUELLE</span>
                        <span className="relative z-10 text-white/20 font-black text-4xl uppercase tracking-tighter group-hover:text-white/30 transition-colors">100% PERTE</span>
                    </div>
                </div>

                {/* Projet Solaire */}
                <div>
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                        <span>PROJET SOLAIRE</span>
                        <span className="text-white">{(creditMonthlyPayment + insuranceMonthlyPayment + (calculationResult.year1.edfResidue/12)).toFixed(2).replace('.', ',')} € /mois</span>
                    </div>
                    <div className="h-16 flex rounded-lg overflow-hidden shadow-lg shadow-blue-900/20">
                        {/* Credit Part */}
                        <div className="bg-blue-600 h-full flex flex-col justify-center px-4 relative group" style={{ flex: '1.5' }}>
                            <span className="text-[10px] font-bold text-blue-200 uppercase">CRÉDIT</span>
                            <span className="text-white font-bold text-lg">{formatMoney(creditMonthlyPayment + insuranceMonthlyPayment)}</span>
                        </div>
                        {/* Reste Part */}
                        <div className="bg-amber-500 h-full flex flex-col justify-center px-4 relative group" style={{ flex: '1' }}>
                             <span className="text-[10px] font-bold text-amber-900 uppercase">RESTE</span>
                             <span className="text-amber-950 font-bold text-lg">{formatMoney(calculationResult.year1.edfResidue / 12)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 12. ÉCONOMIES ANNUELLES CHART */}
        <div className="bg-[#050505] rounded-[32px] p-8 mt-8 border border-white/5">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-emerald-500 w-6 h-6" />
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">ÉCONOMIES ANNUELLES</h2>
                        <p className="text-slate-500 text-sm">Votre cashflow année par année</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase mr-4">
                         <div className="flex items-center gap-1 text-slate-400">
                             <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Barres rouges = Effort d'investissement
                         </div>
                         <div className="flex items-center gap-1 text-slate-400">
                             <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Barres vertes = Rentabilité pure
                         </div>
                    </div>
                     <div className="bg-[#121212] p-1 rounded-lg flex gap-1 border border-white/10">
                        <button 
                            onClick={() => setEconomyChartMode('financement')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${economyChartMode === 'financement' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Wallet size={12} className="inline mr-1 mb-0.5"/> Financement
                        </button>
                        <button 
                            onClick={() => setEconomyChartMode('cash')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${economyChartMode === 'cash' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Coins size={12} className="inline mr-1 mb-0.5"/> Cash
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={economyChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                        <XAxis 
                            dataKey="year" 
                            tick={{ fontSize: 12, fill: '#6b7280' }} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${val - calculationResult.details[0].year + 1}`}
                        />
                        <YAxis hide />
                        <RechartsTooltip 
                             cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                             contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                             formatter={(value: number) => [formatMoney(value), "Net Cashflow"]}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {economyChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.type === 'investment' ? '#ef4444' : '#10b981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 bg-[#1a1d26] p-4 rounded-xl border border-white/5 flex gap-3 text-xs text-slate-400">
                <Lightbulb size={16} className="text-yellow-500 flex-shrink-0" />
                <p><strong className="text-white">Lecture du graphique :</strong> Les premières années, vous payez le crédit (barres rouges = effort temporaire). Après la fin du crédit, vous économisez plein pot (barres vertes = profit permanent). <span className="text-emerald-400 font-bold">Plus vous attendez, plus les barres vertes deviennent grandes !</span></p>
            </div>
        </div>

        {/* 13. LE GOUFFRE FINANCIER */}
        <div className="bg-[#050505] rounded-[32px] p-8 mt-8 border border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                 <div className="flex items-center gap-3">
                    <TrendingUp className="text-red-500 w-6 h-6 transform rotate-180" />
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">LE GOUFFRE FINANCIER</h2>
                        <p className="text-slate-500 text-sm">Rouge : Argent donné au fournisseur. Bleu : Investissement patrimonial.</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                     <div className="bg-[#121212] px-4 py-2 rounded-lg border border-white/10 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
                            <Flame size={14} /> INFLATION
                        </div>
                        <input 
                            type="range" 
                            min="0" max="10" step="0.5"
                            value={inflationRate}
                            onChange={(e) => setInflationRate(Number(e.target.value))}
                            className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="text-lg font-bold text-white w-10 text-right">{inflationRate}%</div>
                     </div>
                     <div className="bg-[#121212] p-1 rounded-lg flex gap-1 border border-white/10">
                        <button 
                            onClick={() => setGouffreMode('financement')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${gouffreMode === 'financement' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Financement
                        </button>
                        <button 
                            onClick={() => setGouffreMode('cash')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${gouffreMode === 'cash' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            Cash
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full bg-[#080808] rounded-2xl p-4 border border-white/5 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gouffreChartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                        <defs>
                            <linearGradient id="colorNoSolar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                            </linearGradient>
                             <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                        <XAxis 
                            dataKey="year" 
                            tick={{ fontSize: 12, fill: '#6b7280' }} 
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            tick={{ fontSize: 12, fill: '#6b7280' }} 
                            tickFormatter={(value) => `${value / 1000} k€`}
                            tickLine={false}
                            axisLine={false}
                        />
                        <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                            formatter={(value: number, name: string) => [formatMoney(value), name === 'cumulativeSpendNoSolar' ? 'Argent Brûlé' : 'Argent Investi']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="cumulativeSpendNoSolar" 
                            stroke="#ef4444" 
                            strokeWidth={3}
                            fill="url(#colorNoSolar)" 
                        />
                         <Area 
                            type="monotone" 
                            dataKey="cumulativeSpendSolar" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fill="url(#colorSolar)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8">
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500"></div>
                         <span className="text-xs text-red-400 font-bold">Argent Brûlé (Fournisseur)</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                         <span className="text-xs text-blue-400 font-bold">Argent Investi (Solaire)</span>
                     </div>
                </div>
            </div>
        </div>

        {/* 14. TABLEAU DÉTAILLÉ */}
        <div className="bg-[#050505] rounded-[32px] p-8 mt-8 border border-white/5 overflow-hidden">
             <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                 <div className="flex items-center gap-3">
                    <Table2 className="text-slate-400 w-6 h-6" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Plan de Financement Détaillé</h2>
                </div>
                
                 <div className="flex items-center gap-4">
                     <div className="bg-[#121212] p-1 rounded-lg flex gap-1 border border-white/10">
                        <button 
                            onClick={() => setTableScenario('financement')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${tableScenario === 'financement' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
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
                     <div className="bg-[#121212] p-1 rounded-lg flex gap-1 border border-white/10">
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

                        {(tableScenario === 'financement' ? calculationResult.details : calculationResult.detailsCash).slice(0, 20).map((row, i) => {
                             const isCreditActive = i * 12 < creditDurationMonths && tableScenario === 'financement';
                             const creditAmount = isCreditActive ? (creditMonthlyPayment + insuranceMonthlyPayment) * 12 : 0;
                             
                             const monthlyEffort = (row.totalWithSolar - row.edfBillWithoutSolar) / 12;
                             const yearlyEffort = row.totalWithSolar - row.edfBillWithoutSolar;
                             const displayEffort = tableMode === 'annuel' ? yearlyEffort : monthlyEffort;

                            return (
                                <tr key={row.year} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4 text-slate-500">{row.year}</td>
                                    <td className="py-4 px-4 text-red-400/80">{formatMoney(row.edfBillWithoutSolar)}</td>
                                    <td className="py-4 px-4 text-blue-400/80">
                                        {formatMoney(creditAmount)}
                                    </td>
                                    <td className="py-4 px-4 text-yellow-400/80">{formatMoney(row.edfResidue)}</td>
                                    <td className="py-4 px-4 font-bold text-white">{formatMoney(row.totalWithSolar)}</td>
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
            {/* AI Analysis */}
            <div className="bg-[#050505] border border-white/10 rounded-[32px] p-8 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                             <Eye size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">L'IA A Analysé Votre Situation</h2>
                    </div>
                    
                    <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                        <p>
                            Écoutez-moi bien ! Chaque seconde qui passe, votre facture fournisseur n'est pas une dépense, 
                            c'est un <strong className="text-white">impôt volontaire</strong> que vous payez à fond perdu ! 
                            C'est une hémorragie financière qui draine votre pouvoir d'achat, une rente énergétique qui engraisse 
                            les multinationales au lieu de bâtir votre patrimoine.
                        </p>
                        <p>
                            Imaginez un loyer qui flambe de {inflationRate}% chaque année sans jamais vous donner de propriété ! 
                            C'est exactement ce que vous subissez, un véritable suicide financier à petit feu. 
                            Vous êtes otage, prisonnier des prix dictés par d'autres.
                        </p>
                        <p>
                            <strong className="text-white">STOP ! Avec EDF SOLAIRES, ce n'est plus une dépense, c'est un investissement stratégique !</strong> 
                            Vous arrêtez de subir, vous commencez à PRODUIRE. Reprenez le contrôle ABSOLU de votre budget énergie, 
                            transformez ce gouffre financier en une source de richesse durable.
                        </p>
                        <p>
                            Ne laissez plus votre argent brûler en fumée, devenez votre propre producteur ! 
                            L'heure n'est plus à la réflexion, elle est à l'action. Chaque jour d'attente, c'est de l'argent directement jeté par la fenêtre.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-[#020617] border border-blue-900/50 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                 <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors"></div>
                 <div className="relative z-10 max-w-md mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase mb-6 tracking-tight">
                        LA SEULE VRAIE QUESTION
                    </h2>
                    <p className="text-slate-400 mb-8 font-medium">
                        Vous avez les chiffres. Vous avez les garanties. Vous avez la preuve mathématique. <br/><br/>
                        <span className="text-white font-bold">Préférez-vous enrichir votre fournisseur ou vous enrichir vous-même ?</span>
                    </p>

                    <button className="w-full bg-white text-black hover:bg-slate-200 py-4 px-8 rounded-full font-black uppercase tracking-wider flex items-center justify-center gap-2 transform transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                        <CheckCircle2 size={24} />
                        JE SÉCURISE MON TARIF MAINTENANT
                        <ArrowRight size={20} />
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                        <Coins size={12} className="text-red-400"/>
                        Chaque jour d'attente = {formatMoney(calculationResult.costOfInactionPerSecond * 3600 * 24)} perdus
                    </div>
                 </div>
            </div>
        </div>

      </main>
    </div>
  );
};