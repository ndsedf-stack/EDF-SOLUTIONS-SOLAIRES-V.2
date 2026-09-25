import React, { useState, useEffect, useMemo, useRef } from "react";
import { computeFinancing } from "../services/finance";
import COPY from "../content/copy.json";
import { decide as decideWithAgentZero } from "../brain/agentZeroClient"; // 🧠 Agent Zero Client
import { IS_DEV, IS_PROD } from "../config/env";
import { useVocabularyGuard } from "../hooks/useVocabularyGuard";
import { seniorPhases } from "../coaches/SeniorCoachPhases";
import { banquierPhases } from "../coaches/BanquierCoachPhases";
import { standardPhases } from "../coaches/StandardCoachPhases";
import { AGENT_ZERO_TO_LOCAL_MODULE_MAP } from "../brain/agentZeroModuleContract";
import contentVariants from "@/config/contentVariants.json"; // 🆕 Import Textes Dynamiques
import { CompletionScreen } from "./Coach/CompletionScreen";
import { useSilenceTimer } from "../hooks/useSilenceTimer";
import { useAgentZero } from "@/agent-zero/useAgentZero"; // 🔌 Agent Zero Hook
import { useAlertSystem } from "../hooks/useAlertSystem";
import { AlertPopup } from "./Coach/AlertPopup";
import { DebugPanel } from "./Coach/DebugPanel";
import { BlocageOverlay } from "./BlocageOverlay";
import { calculateGreenValueFromAddress } from "../services/greenValueAPI";
import { SpeechView } from "./SpeechView";

import { SimulationResult, YearlyDetail } from "../types";
import { InfoPopup } from "./InfoPopup";
import { ProfitBadge } from "./ProfitBadge";
import { calculateSolarProjection, safeParseFloat } from "../utils/finance";
import { ExpenseCards } from './dashboard/ExpenseCards';
import { FinancingCards } from './dashboard/FinancingCards';
import { Timeline } from './dashboard/Timeline';
import { PDFExport } from "./PDFExport";
import { supabase } from "../lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { createPortal } from "react-dom";
import { useRDVState } from "../hooks/useRDVState";
import { StepNotification } from "./Coach/StepNotification";
import { validateAll } from "../validation/validateAll";
import ValidationQualityPanel from "../components/ValidationQualityPanel";
import { runPériodeStressTest } from "../utils/validateCalculations";

import { useParams } from "react-router-dom"; // ← ajoute ça
import { formatCurrency, formatPercent } from "../../utils/format";
import { InfoBubble } from "../components/ui/InfoBubble";
import ModuleTransition from "@/components/ModuleTransition";
import StudyStatusBadge from "./StudyStatusBadge";
import GarantiesComparativeTable from "./GarantiesComparativeTable";

// 🧠 AGENT ZERO HELPER
// 🧠 AGENT ZERO HELPER REMOVED - MOVED INSIDE COMPONENT FOR DYNAMIC URL

import {
  validateSimulation,
  printValidationReport,
} from "../utils/validateCalculations";
// Expose helper for debug in browser console
if (process.env.NODE_ENV === "development") {
  (window as any).printValidationReport = printValidationReport;
}

// --- MOCKS RECHARTS SUPPRIMÉS (MIGRATION VISX EFFECTUÉE) ---
import {
  Plane,
  Heart,
  PenLine,
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
  TrendingDown,
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
  User,
  FileText,
  XCircle,
  Check,
  Euro,
  Loader2,
  FileCheck,
  FileSearch,
  ClipboardCheck,
  MapPin,
  MessageSquare,
  MessageCircle,
  EyeOff,
  ChevronRight,
} from "lucide-react";
import { InputSlider } from "./InputSlider";
import { FinancialRiskProofVisx } from "./territories/Cockpit/core/FinancialRiskProofVisx";

// ============================================
// COMPOSANT MODULE SECTION - REPLIABLE
// ============================================
interface ModuleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpen?: (id: string) => void;
  onClose?: (id: string) => boolean | void; // 🔥 CORRIGÉ : peut retourner boolean ou void
  forceOpen?: boolean; // 🆕 Permet d'ouvrir le module programmatiquement (ex: via Agent Zero)
}

const ModuleSection: React.FC<ModuleSectionProps> = ({
  id,
  title,
  icon,
  children,
  defaultOpen = false,
  onOpen,
  onClose,
  forceOpen, // 🆕 Prop pour forcer l'ouverture
}) => {

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen || forceOpen);

  // 🆕 Effet pour réagir à forceOpen
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setHasBeenOpened(true);
    }
  }, [forceOpen]);

  const toggle = () => {
    const next = !isOpen;

    // 🔥 Vérifier si fermeture autorisée (Garanties)
    if (!next && onClose) {
      const decision = onClose(id);
      if (decision === false) return; 
    }

    if (next) {
        setHasBeenOpened(true);
        if (onOpen) onOpen(id);
    }

    setIsOpen(next);
  };

  return (
    <div id={id} className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            {icon}
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight text-left">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* ID Hidden on mobile for cleaner look */}
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">#{id}</span>
          <ChevronDown
            className={`text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            size={20}
          />
        </div>
      </button>
      
      {/* ⚡ OPTIMIZATION: Render content only if it has been opened at least once */}
      {hasBeenOpened && (
        <div
            className={`transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
        >
            <div className="p-4 pt-0">{children}</div>
        </div>
      )}
    </div>
  );
};

interface ResultsDashboardProps {
  data: any;
  projectionYears: number;
  onReset: () => void;
  onProfileChange: (p: string) => void;
  studyId?: string;
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

// ============================================
// MODULE TAUX PRIVILÉGIÉ 1.99% - VERSION SERVICE
// ============================================
const ModuleTauxPrivilege = ({
  taux,
  mensualite,
  duree,
  montantFinance,
  hasPromoCode,
}: any) => {
  // 1. Calcul via Service pur
  const financing = computeFinancing({
    amount: montantFinance,
    rate: taux,
    duration: duree
  });

  // Guard
  if (taux !== 1.99 || !hasPromoCode) {
    return null;
  }

  // Extraction comparaison marché
  const marketRate = financing.marketComparison?.marketRate || 5.89;
  const marketSavings = financing.marketComparison?.savings || 0;
  const marketPayment = financing.marketComparison?.marketMonthlyPayment || 0;

  // Note: Taux Standard pour comparatif interne
  const standardRate = 3.89;
  const standardFinancing = computeFinancing({
    amount: montantFinance,
    rate: standardRate,
    duration: duree
  });

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 my-8">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {COPY.financial.bonified_rate_title}
            </h3>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Référence Dossier : EDF-SOL-{new Date().getFullYear()}-
              {Math.random().toString(36).substr(2, 6).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">
              Date d'Émission
            </div>
            <div className="text-sm font-mono text-white">
              {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      </div>

      {/* GRID DONNÉES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Taux Annuel Effectif Global (TAEG)
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {formatPercent(taux)}
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            ✓ Taux bonifié validé
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Mensualité (Hors Assurance)
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {formatCurrency(financing.monthlyPayment)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            sur {duree} mois
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            {COPY.financial.market_comparison_title}
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {formatCurrency(marketSavings)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            vs taux marché {formatPercent(marketRate)}
          </div>
        </div>
      </div>

      {/* TABLEAU COMPARATIF */}
      <div className="bg-black/20 border border-white/5 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Paramètre
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Marché
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Bonifié Standard
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Bonifié Privilégié
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">TAEG</td>
              <td className="p-4 text-right text-red-400">
                {formatPercent(marketRate)}
              </td>
              <td className="p-4 text-right text-slate-400">
                {formatPercent(standardRate)}
              </td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {formatPercent(taux)}
              </td>
            </tr>

            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">Mensualité</td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(marketPayment)}
              </td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(standardFinancing.monthlyPayment)}
              </td>
              <td className="p-4 text-right text-white font-bold">
                {formatCurrency(financing.monthlyPayment)}
              </td>
            </tr>

            <tr>
              <td className="p-4 text-slate-300">Coût Total Crédit</td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(marketPayment * duree)}
              </td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(standardFinancing.monthlyPayment * duree)}
              </td>
              <td className="p-4 text-right text-white font-bold">
                {formatCurrency(financing.monthlyPayment * duree)}
              </td>
            </tr>

            <tr className="bg-emerald-950/20">
              <td className="p-4 text-slate-300 font-bold">Économie Totale</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {formatCurrency(marketSavings)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/5 pt-4 flex items-start justify-between text-[10px] text-slate-600 font-mono">
        <div>
          <p className="mb-1">
            {COPY.financial.legal_mention}
          </p>
          <p>
            Offre valable jusqu'au{" "}
            {new Date(Date.now() + 3 * 86400000).toLocaleDateString("fr-FR")}{" "}
            inclus
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-500">EDF SOLUTIONS SOLAIRES</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MODULE TAUX STANDARD 3.89% - VERSION SERVICE
// ============================================
const ModuleTauxStandard = ({
  taux,
  mensualite,
  duree,
  montantFinance,
  hasPromoCode,
}: any) => {
  const financing = computeFinancing({
    amount: montantFinance,
    rate: taux,
    duration: duree
  });

  if (taux !== 3.89 || !hasPromoCode) {
    return null;
  }

  const marketRate = financing.marketComparison?.marketRate || 5.89;
  const marketSavings = financing.marketComparison?.savings || 0;
  const marketPayment = financing.marketComparison?.marketMonthlyPayment || 0;

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 my-8">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {COPY.financial.standard_rate_title}
            </h3>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Référence Dossier : EDF-SOL-{new Date().getFullYear()}-
              {Math.random().toString(36).substr(2, 6).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">
              Date d'Émission
            </div>
            <div className="text-sm font-mono text-white">
              {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      </div>

      {/* GRID DONNÉES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Taux Annuel Effectif Global (TAEG)
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {formatPercent(taux)}
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            ✓ Taux bonifié validé
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Mensualité (Hors Assurance)
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {formatCurrency(financing.monthlyPayment)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            sur {duree} mois
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            {COPY.financial.market_comparison_title}
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {formatCurrency(marketSavings)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            vs marché {formatPercent(marketRate)}
          </div>
        </div>
      </div>

      {/* TABLEAU COMPARATIF */}
      <div className="bg-black/20 border border-white/5 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Paramètre
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Marché
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Bonifié Standard
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">TAEG</td>
              <td className="p-4 text-right text-red-400">
                {formatPercent(marketRate)}
              </td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {formatPercent(taux)}
              </td>
            </tr>

            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">Mensualité</td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(marketPayment)}
              </td>
              <td className="p-4 text-right text-white font-bold">
                {formatCurrency(financing.monthlyPayment)}
              </td>
            </tr>

            <tr>
              <td className="p-4 text-slate-300">Coût Total Crédit</td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(marketPayment * duree)}
              </td>
              <td className="p-4 text-right text-white font-bold">
                {formatCurrency(financing.monthlyPayment * duree)}
              </td>
            </tr>

            <tr className="bg-emerald-950/20">
              <td className="p-4 text-slate-300 font-bold">Économie Totale</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {formatCurrency(marketSavings)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CONDITIONS */}
      <div className="bg-blue-950/10 border border-blue-500/10 rounded-lg p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck
            className="text-blue-400 flex-shrink-0 mt-0.5"
            size={18}
          />
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Conditions d'Accès Validées
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Zone géographique éligible (06 - Alpes-Maritimes)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Installation conforme RGE et normes NFC 15-100</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Dossier validé selon critères d'éligibilité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>
                  Programme actif au {new Date().toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/5 pt-4 flex items-start justify-between text-[10px] text-slate-600 font-mono">
        <div>
          <p className="mb-1">
            {COPY.financial.legal_mention}
          </p>
          <p>
            Offre valable jusqu'au{" "}
            {new Date(Date.now() + 3 * 86400000).toLocaleDateString("fr-FR")}{" "}
            inclus
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-500">EDF SOLUTIONS SOLAIRES</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MODULE TAUX EXCEPTIONNEL 0.99% - VERSION CORRIGÉE
// ============================================
const ModuleTauxUltraPremium = ({
  taux,
  mensualite,
  duree,
  montantFinance,
  hasPromoCode,
}) => {
  if (taux !== 0.99 || !hasPromoCode) {
    return null;
  }

  const tauxMarche = 5.89;
  const tauxStandard = 3.89;

  const mensualiteMarche =
    (montantFinance * (tauxMarche / 12 / 100)) /
    (1 - Math.pow(1 + tauxMarche / 12 / 100, -duree));

  const mensualiteStandard =
    (montantFinance * (tauxStandard / 12 / 100)) /
    (1 - Math.pow(1 + tauxStandard / 12 / 100, -duree));

  const economieVsMarche = Math.abs((mensualiteMarche - mensualite) * duree);

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 my-8">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Financement Exceptionnel
            </h3>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Référence Dossier : EDF-SOL-{new Date().getFullYear()}-
              {Math.random().toString(36).substr(2, 6).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">
              Date d'Émission
            </div>
            <div className="text-sm font-mono text-white">
              {new Date().toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      </div>

      {/* NOTE */}
      <div className="bg-blue-950/10 border border-blue-500/10 rounded-lg p-4 mb-6">
        <p className="text-xs text-slate-300 leading-relaxed">
          Ce dossier bénéficie d'un taux préférentiel exceptionnel dans le cadre
          de votre éligibilité aux conditions spécifiques du programme.
        </p>
      </div>

      {/* GRID DONNÉES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            TAEG
          </div>
          <div className="text-4xl font-black text-white font-mono tabular-nums">
            {formatPercent(taux)}
          </div>
          <div className="text-xs text-emerald-400 font-mono mt-1">
            ✓ Validé
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Mensualité
          </div>
          <div className="text-4xl font-black text-white font-mono tabular-nums">
            {formatCurrency(mensualite)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            sur {duree} mois
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Économie
          </div>
          <div className="text-4xl font-black text-white font-mono tabular-nums">
            {formatCurrency(economieVsMarche)}
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Durée
          </div>
          <div className="text-4xl font-black text-white font-mono tabular-nums">
            {duree / 12} ans
          </div>
        </div>
      </div>

      {/* TABLEAU COMPARATIF */}
      <div className="bg-black/20 border border-white/5 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Paramètre
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Marché
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Bonifié Standard
              </th>
              <th className="text-right p-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Taux Exceptionnel
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">TAEG</td>
              <td className="p-4 text-right text-red-400">
                {formatPercent(tauxMarche)}
              </td>
              <td className="p-4 text-right text-slate-400">
                {formatPercent(tauxStandard)}
              </td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {formatPercent(taux)}
              </td>
            </tr>

            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">Mensualité</td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(mensualiteMarche)}
              </td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(mensualiteStandard)}
              </td>
              <td className="p-4 text-right text-white font-bold">
                {formatCurrency(mensualite)}
              </td>
            </tr>

            <tr>
              <td className="p-4 text-slate-300">Coût Total Crédit</td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(mensualiteMarche * duree)}
              </td>
              <td className="p-4 text-right text-slate-400">
                {formatCurrency(mensualiteStandard * duree)}
              </td>
              <td className="p-4 text-right text-white font-bold">
                {formatCurrency(mensualite * duree)}
              </td>
            </tr>

            <tr className="bg-emerald-950/20">
              <td className="p-4 text-slate-300 font-bold">Économie Totale</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {formatCurrency(economieVsMarche)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CONDITIONS */}
      <div className="bg-blue-950/10 border border-blue-500/10 rounded-lg p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck
            className="text-blue-400 flex-shrink-0 mt-0.5"
            size={18}
          />
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Conditions d'Accès Validées
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Zone géographique éligible (06 - Alpes-Maritimes)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Installation conforme RGE et normes NFC 15-100</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>Dossier validé selon critères d'éligibilité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span>
                  Programme actif au {new Date().toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/5 pt-4 flex items-start justify-between text-[10px] text-slate-600 font-mono">
        <div>
          <p className="mb-1">
            Document non contractuel - Sous réserve d'acceptation du dossier
          </p>
          <p>
            Offre valable jusqu'au{" "}
            {new Date(Date.now() + 3 * 86400000).toLocaleDateString("fr-FR")}{" "}
            inclus
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-500">EDF SOLUTIONS SOLAIRES</p>
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    calculationResult?: any;
    printValidationReport?: () => any;
  }
}
// 👉 contenus dynamiques des infobulles MODULE 1
const INFO_MODULE1 = {
  cadreEDF: {
    senior: {
      title: "Un cadre public de confiance",
      body: (
        <>
          <p className="mb-2">EDF est détenu à 100 % par l’État français.</p>
          <p className="mb-2">
            Cela garantit stabilité, continuité et protection dans le temps.
          </p>
          <p className="text-slate-300">
            Votre projet s’inscrit dans un cadre public durable.
          </p>
        </>
      ),
    },
    banquier: {
      title: "Un acteur public structurant",
      body: (
        <>
          <p className="mb-2">
            EDF est un groupe public soumis à des obligations d’État.
          </p>
          <p className="mb-2">
            Continuité, cadre réglementaire, responsabilité long terme.
          </p>
          <p className="text-slate-300">
            Votre projet repose sur un acteur institutionnel.
          </p>
        </>
      ),
    },
    standard: {
      title: "Ce que signifie « Groupe EDF »",
      body: (
        <>
          <p className="mb-2">EDF appartient à l’État français.</p>
          <p className="mb-2">Ce n’est pas une société privée opportuniste.</p>
          <p className="text-slate-300">
            Votre projet dépend d’un cadre solide, fait pour durer.
          </p>
        </>
      ),
    },
  },

  zeroFaillite: {
    senior: {
      title: "Une continuité garantie",
      body: (
        <>
          <p className="mb-2">
            Sur un projet long terme, le risque principal est la disparition de
            l’acteur.
          </p>
          <p className="text-slate-300">
            Le cadre EDF protège votre tranquillité future.
          </p>
        </>
      ),
    },
    banquier: {
      title: "Un risque structurel neutralisé",
      body: (
        <>
          <p className="mb-2">
            Le premier risque d’un actif long terme est la contrepartie.
          </p>
          <p className="text-slate-300">
            EDF neutralise ce risque par son statut public.
          </p>
        </>
      ),
    },
    standard: {
      title: "Pourquoi c’est important",
      body: (
        <>
          <p className="mb-2">
            Sur 20 ans, le vrai risque n’est pas le matériel.
          </p>
          <p className="text-slate-300">
            C’est que l’entreprise n’existe plus. Avec EDF, ce risque n’existe
            pas.
          </p>
        </>
      ),
    },
  },

  contrat: {
    senior: {
      title: "Un cadre juridique protecteur",
      body: (
        <>
          <p className="mb-2">Votre contrat est encadré par la loi.</p>
          <p className="text-slate-300">
            Il protège vos droits et sécurise votre engagement.
          </p>
        </>
      ),
    },
    banquier: {
      title: "Un cadre contractuel normé",
      body: (
        <>
          <p className="mb-2">Contrat, délais, conditions : tout est normé.</p>
          <p className="text-slate-300">
            Vous êtes dans un cadre juridique structuré.
          </p>
        </>
      ),
    },
    standard: {
      title: "Ce que ça veut dire concrètement",
      body: (
        <>
          <p className="mb-2">Ce n’est pas un bon de commande flou.</p>
          <p className="text-slate-300">C’est un contrat protégé par la loi.</p>
        </>
      ),
    },
  },

  aides: {
    senior: {
      title: "Des aides encadrées par l’État",
      body: (
        <>
          <p className="mb-2">Les aides sont définies et versées par l’État.</p>
          <p className="text-slate-300">
            Elles ne dépendent pas d’une entreprise privée.
          </p>
        </>
      ),
    },
    banquier: {
      title: "Un cadre public national",
      body: (
        <>
          <p className="mb-2">
            Aides définies par arrêté, versées par organismes publics.
          </p>
          <p className="text-slate-300">Cadre national, non commercial.</p>
        </>
      ),
    },
    standard: {
      title: "Pourquoi elles sont fiables",
      body: (
        <>
          <p className="mb-2">Les aides viennent de l’État, pas d’EDF.</p>
          <p className="text-slate-300">
            Elles sont les mêmes partout en France.
          </p>
        </>
      ),
    },
  },
};
const INFO_MODULE2 = {
  engagement: {
    senior: {
      title: "🛡️ Engagement de protection",
      body: (
        <>
          <p>
            EDF prend contractuellement le risque administratif à sa charge.
          </p>
          <p>Si une autorisation est refusée, le projet s'arrête sans frais.</p>
          <p>Vous engagez un cadre sécurisé, pas une procédure incertaine.</p>
          <p>Vous restez protégé à chaque étape.</p>
        </>
      ),
    },
    banquier: {
      title: "⚖️ Transfert de risque",
      body: (
        <>
          <p>Le risque administratif et réglementaire est porté par EDF.</p>
          <p>
            Tant que le projet n'est pas validé, aucun engagement financier
            n'est dû.
          </p>
          <p>Le cadre est contractuel et opposable.</p>
        </>
      ),
    },
    standard: {
      title: "🔒 Zéro risque de blocage",
      body: (
        <>
          <p>
            Si l'installation ne peut pas se faire, le projet s'arrête
            simplement.
          </p>
          <p>Aucun paiement dû.</p>
          <p>Aucune perte.</p>
          <p>Aucune démarche à gérer.</p>
        </>
      ),
    },
  },

  paiement: {
    senior: {
      title: "🤍 Engagement sans pression",
      body: (
        <>
          <p>
            Vous ne payez rien tant que tout n'est pas validé, autorisé et
            planifié.
          </p>
          <p>Vous ne prenez pas de risque irréversible aujourd'hui.</p>
          <p>Vous enclenchez un cadre protégé.</p>
        </>
      ),
    },
    banquier: {
      title: "📄 Condition suspensive",
      body: (
        <>
          <p>Le contrat inclut des conditions suspensives administratives.</p>
          <p>
            Sans validation du dossier, aucune obligation financière n'est
            déclenchée.
          </p>
        </>
      ),
    },
    standard: {
      title: "💡 Paiement à la validation",
      body: (
        <>
          <p>Tant que ce n'est pas autorisé, vous ne payez rien.</p>
          <p>Vous avancez seulement quand tout est clair.</p>
        </>
      ),
    },
  },

  priseEnCharge: {
    senior: {
      title: "🧭 Accompagnement complet",
      body: (
        <>
          <p>EDF gère l'ensemble du dossier.</p>
          <p>
            Vous n'avez ni formulaires à suivre, ni démarches à coordonner, ni
            interlocuteurs à chercher.
          </p>
          <p>Vous êtes accompagné.</p>
        </>
      ),
    },
    banquier: {
      title: "📁 Pilotage EDF",
      body: (
        <>
          <p>Le projet est centralisé, piloté et suivi par EDF.</p>
          <p>Chaque étape est tracée, validée et contractualisée.</p>
        </>
      ),
    },
    standard: {
      title: "🙌 EDF s'occupe de tout",
      body: (
        <>
          <p>Mairie, ENEDIS, autorisations, suivi : EDF gère.</p>
          <p>Vous validez seulement quand c'est nécessaire.</p>
        </>
      ),
    },
  },
};
const INFO_MODULE3 = {
  // 🔹 INFOBULLE 3.1 — CADRE GLOBAL (pilotage EDF)
  cadre: {
    senior: {
      title: "🛡️ Délégation sécurisée",
      body: (
        <>
          <p>EDF prend la responsabilité complète du parcours administratif.</p>
          <p>Vous n’êtes jamais seul face aux démarches.</p>
          <p>Chaque étape est encadrée, vérifiée et sécurisée.</p>
        </>
      ),
    },
    banquier: {
      title: "📋 Pilotage administratif",
      body: (
        <>
          <p>Le processus est intégralement structuré et piloté par EDF.</p>
          <p>
            Chaque étape fait l’objet d’un contrôle et d’une validation
            formelle.
          </p>
          <p>Le projet reste sous gouvernance EDF du début à la fin.</p>
        </>
      ),
    },
    standard: {
      title: "🙌 EDF s’occupe du parcours",
      body: (
        <>
          <p>EDF gère tout le volet administratif.</p>
          <p>
            Vous n’avez pas à vous battre avec des formulaires ou des
            organismes.
          </p>
          <p>Vous validez seulement quand c’est utile.</p>
        </>
      ),
    },
  },

  // 🔹 INFOBULLE 3.2 — COMPLEXITÉ (neutraliser la peur)
  complexite: {
    senior: {
      title: "📂 Complexité maîtrisée",
      body: (
        <>
          <p>Le nombre d’étapes peut sembler important.</p>
          <p>Mais elles sont gérées, planifiées et suivies par EDF.</p>
          <p>Vous êtes accompagné à chaque moment clé.</p>
        </>
      ),
    },
    banquier: {
      title: "📑 Processus encadré",
      body: (
        <>
          <p>Le volume d’étapes correspond aux exigences réglementaires.</p>
          <p>Elles sont standardisées, suivies et documentées.</p>
          <p>Vous n’avez pas à en assurer la coordination.</p>
        </>
      ),
    },
    standard: {
      title: "🧩 Plusieurs étapes, un seul interlocuteur",
      body: (
        <>
          <p>Il y a plusieurs démarches, c’est normal.</p>
          <p>Mais tout passe par EDF.</p>
          <p>Vous n’avez rien à gérer vous-même.</p>
        </>
      ),
    },
  },

  // 🔹 INFOBULLE 3.3 — SÉCURISATION (anti-annulation)
  securisation: {
    senior: {
      title: "🤍 Continuité et protection",
      body: (
        <>
          <p>Votre projet est suivi dans le temps.</p>
          <p>Vous n’êtes pas livré à vous-même après la décision.</p>
          <p>EDF reste votre point d’appui.</p>
        </>
      ),
    },
    banquier: {
      title: "📊 Suivi long terme",
      body: (
        <>
          <p>Le projet ne s’arrête pas à la signature.</p>
          <p>Il est encadré, suivi et contrôlé dans la durée.</p>
          <p>C’est un dispositif, pas une simple prestation.</p>
        </>
      ),
    },
    standard: {
      title: "🔁 Pas un one-shot",
      body: (
        <>
          <p>Ce n’est pas “on installe et au revoir”.</p>
          <p>Le projet est suivi et accompagné.</p>
          <p>EDF reste présent après.</p>
        </>
      ),
    },
  },
};
// ═══════════════════════════════════════════════════════════
// 🔒 INFO MODULE 4 — GARANTIES LONG TERME
// Rôle : Ancrer la sécurité dans le temps (anti-annulation)
// 3 infobulles max : global / performance / matériel
// ═══════════════════════════════════════════════════════════

const INFO_MODULE4 = {
  global: {
    senior: {
      title: "🛡️ Protection dans le temps",
      body: (
        <>
          <p>Ces garanties sont là pour vous protéger durablement.</p>
          <p>Elles couvrent le matériel, la production et le suivi.</p>
          <p>Votre installation reste encadrée dans le temps.</p>
        </>
      ),
    },
    banquier: {
      title: "📑 Cadre de garantie",
      body: (
        <>
          <p>
            Les garanties encadrent contractuellement la performance et le
            matériel.
          </p>
          <p>
            Elles définissent des obligations de résultat et de remplacement.
          </p>
          <p>Le projet est sécurisé juridiquement dans la durée.</p>
        </>
      ),
    },
    standard: {
      title: "🔒 Vous êtes couvert",
      body: (
        <>
          <p>Le matériel est garanti.</p>
          <p>La production est suivie.</p>
          <p>Et EDF reste responsable dans le temps.</p>
        </>
      ),
    },
  },

  performance: {
    senior: {
      title: "☀️ Production surveillée",
      body: (
        <>
          <p>Votre installation est suivie dans le temps.</p>
          <p>Si elle ne produit pas ce qui est prévu, EDF intervient.</p>
          <p>Vous n’êtes pas laissé seul face à une baisse de production.</p>
        </>
      ),
    },
    banquier: {
      title: "📊 Garantie de performance",
      body: (
        <>
          <p>Des seuils de production sont définis contractuellement.</p>
          <p>Tout écart significatif déclenche un mécanisme de correction.</p>
          <p>La performance fait partie des engagements du projet.</p>
        </>
      ),
    },
    standard: {
      title: "⚡ Production garantie",
      body: (
        <>
          <p>Si la production baisse, c’est détecté.</p>
          <p>Et c’est pris en charge.</p>
          <p>Vous ne gérez pas ça seul.</p>
        </>
      ),
    },
  },

  materiel: {
    senior: {
      title: "🧩 Matériel protégé",
      body: (
        <>
          <p>Les équipements sont garantis sur le long terme.</p>
          <p>En cas de défaut, ils sont remplacés.</p>
          <p>Main d’œuvre et déplacement sont couverts selon l’offre.</p>
        </>
      ),
    },
    banquier: {
      title: "🔧 Garantie matériel",
      body: (
        <>
          <p>
            Les composants sont couverts par des garanties fabricant et EDF.
          </p>
          <p>Les modalités de remplacement sont contractuelles.</p>
          <p>Le risque matériel est intégré au cadre.</p>
        </>
      ),
    },
    standard: {
      title: "🔁 En cas de panne",
      body: (
        <>
          <p>Le matériel est garanti.</p>
          <p>Il est remplacé si besoin.</p>
          <p>EDF gère.</p>
        </>
      ),
    },
  },
};
const INFO_REPARTITION = {
  cadrage: {
    senior: {
      title: "🔒 Cadre EDF sécurisé",
      body: (
        <>
          <p>Votre production est automatiquement répartie.</p>
          <p>Ce qui est consommé réduit vos factures.</p>
          <p>Le surplus est repris par EDF dans un cadre d’État.</p>
        </>
      ),
    },
    banquier: {
      title: "📑 Cadre de répartition",
      body: (
        <>
          <p>La production est ventilée entre autoconsommation et OA.</p>
          <p>Les flux sont contractualisés et tracés.</p>
          <p>Le cadre est stable et réglementé.</p>
        </>
      ),
    },
    standard: {
      title: "⚡ Rien n’est perdu",
      body: (
        <>
          <p>Vous consommez → vous économisez.</p>
          <p>Vous ne consommez pas → c’est vendu.</p>
          <p>EDF gère automatiquement.</p>
        </>
      ),
    },
  },

  ancrage: {
    senior: {
      title: "🛡️ Sécurité dans le temps",
      body: (
        <>
          <p>Votre installation reste encadrée.</p>
          <p>Les kWh sont suivis, comptés et valorisés.</p>
          <p>EDF reste responsable du cadre.</p>
        </>
      ),
    },
    banquier: {
      title: "📊 Flux sécurisés",
      body: (
        <>
          <p>Les volumes sont mesurés et contractualisés.</p>
          <p>La valorisation est garantie par contrat OA.</p>
          <p>Le modèle est sécurisé dans le temps.</p>
        </>
      ),
    },
    standard: {
      title: "✅ Automatique",
      body: (
        <>
          <p>Tout est automatique.</p>
          <p>Rien à gérer.</p>
          <p>EDF s’occupe du reste.</p>
        </>
      ),
    },
  },
};
const PROJECTION_PHRASES = {
  standard:
    "Ici, on ne compare pas deux offres. On regarde simplement ce que devient votre argent dans les deux scénarios.",
  senior:
    "Ici, l’objectif n’est pas de vous faire choisir. C’est de vous montrer ce que devient votre budget dans le temps, selon que vous fassiez quelque chose… ou pas.",
  banquier:
    "Ce graphique ne présente pas une offre, mais deux trajectoires financières à partir de vos chiffres.",
};
export const WHERE_MONEY_CONTENT = {
  senior: {
    intro:
      "Ce qui suit ne fait pas de prédiction. Il montre simplement ce qui se passe si vous ne faites rien — et ce qui se passe si vous agissez.",
    titleSub:
      "Deux chemins possibles pour le même argent. Un seul vous laisse quelque chose.",
    closing:
      "L’enjeu n’est pas un chiffre. C’est de ne pas se réveiller dans dix ans en regrettant d’avoir laissé partir ce qui aurait pu rester chez vous.",
    popup: {
      title: "Pourquoi ce module ?",
      body: (
        <>
          <p>
            Ici, on ne parle ni d’offre, ni de devis. On observe simplement{" "}
            <strong>ce que deviennent vos dépenses</strong> dans le temps.
          </p>
          <p className="mt-2">
            Soit elles partent définitivement — sans aucun retour possible. Soit
            elles construisent quelque chose qui vous reste.
          </p>
          <p className="mt-2 text-orange-400 font-medium">
            La vraie question : voulez-vous garder le contrôle, ou le confier
            définitivement à votre fournisseur d’énergie ?
          </p>
        </>
      ),
    },
  },

  banquier: {
    intro:
      "Deux trajectoires financières à partir des mêmes flux. Une seule capitalise. L’autre dilue.",
    titleSub:
      "Comparaison d’allocation de capital : dépense irréversible vs actif patrimonial.",
    closing:
      "Ce module ne parle pas d’écologie. Il parle d’arbitrage entre consommation immédiate et capitalisation différée.",
    popup: {
      title: "Lecture financière",
      body: (
        <>
          <p>Ce visuel compare deux logiques :</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>
              <strong>dépense énergétique non récupérable</strong>
            </li>
            <li>
              <strong>réaffectation d’un flux vers un actif productif</strong>
            </li>
          </ul>
          <p className="mt-3 text-blue-400 font-medium">
            La différence n’est pas une économie. C’est un transfert de valeur
            vers votre patrimoine.
          </p>
        </>
      ),
    },
  },

  standard: {
    intro:
      "Ce qui suit ne cherche pas à forcer. Il montre simplement ce qui se passe si rien ne change — et ce qui se passe si vous agissez maintenant.",
    titleSub: "Où vont vos dépenses selon ce que vous décidez aujourd’hui.",
    closing:
      "Au final, soit votre argent part pour toujours. Soit il reste quelque part chez vous — et vous en profitez.",
    popup: {
      title: "Comment lire ce module",
      body: (
        <>
          <p>
            Chaque carte montre ce que vous aurez payé en énergie à différentes
            échéances.
          </p>
          <p className="mt-2">
            La différence entre les deux scénarios,{" "}
            <strong>c’est ce qui peut rester chez vous</strong> au lieu de
            partir définitivement.
          </p>
          <p className="mt-3 text-emerald-400 font-medium">
            Dans ce type de décision, on regrette rarement d’avoir agi. Mais on
            regrette très souvent d’avoir attendu.
          </p>
        </>
      ),
    },
  },
} as const;

// ✅ BON ORDRE
export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  data,
  projectionYears: initialProjectionYears, // ← Ligne avec ':'
  onReset,
  onProfileChange,
  studyId,
}) => {
  const greenPositioning = data?.greenPositioning;
  const didLogValidation = useRef(false);
  const [projectionYears, setProjectionYears] = useState<number>(
    initialProjectionYears || 10
  );

  // 🧠 AGENT ZERO STATE
  const [agentDecision, setAgentDecision] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('agent_zero_url') || "https://autopilote.pythonanywhere.com/decide");
  const [apiKey, setApiKey] = useState(localStorage.getItem('agent_zero_key') || import.meta.env.VITE_AGENT_ZERO_API_KEY || "Titanium2025!"); // 🔐 Clé API
  const [showConfig, setShowConfig] = useState(false);
  const [clickCount, setClickCount] = useState(0); // Pour le menu caché

  // ⚖️ CERTIFICATION OPÉRATEUR (LE JUGE)
  const [complianceScore, setComplianceScore] = useState(100);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [violationLogs, setViolationLogs] = useState<string[]>([]);

    // 🧠 AGENT ZERO - TEST INTÉGRATION
    // 🧠 AGENT ZERO - LOGIC
    const saveConfig = (newUrl: string) => {
        setApiUrl(newUrl);
        localStorage.setItem('agent_zero_url', newUrl);
        
        // Persistance Clé API
        localStorage.setItem('agent_zero_key', apiKey);
        
        setShowConfig(false);
        // alert("Configuration mise à jour !"); // Optionnel, évite de bloquer l'UI
    };

    const sendCertificationAudit = async () => {
        if (!agentDecision) return; // Pas d'audit si pas d'IA
        
        try {
            await fetch("https://autopilote.pythonanywhere.com/audit", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-API-KEY": "Titanium2025!" // Sécurité
                },
                body: JSON.stringify({
                    user: "Commercial_01",
                    simulationId: studyId || "sim_temp",
                    finalScore: complianceScore,
                    violations: violationLogs,
                    agentOrder: agentDecision.moduleOrder,
                    timestamp: new Date().toISOString()
                })
            });
            console.log("⚖️ Audit de certification envoyé !");
        } catch (e) {
            console.error("❌ Échec envoi audit", e);
        }
    };

    const getAgentDecision = async (data: any) => {
        try {
            console.log("🚀 Envoi vers l'API:", apiUrl); 

            // ⬇️ AJOUTE CES 3 LIGNES ICI
            const payload = {
                clientId: "EDF_RENO",
                userId: "commercial_01",
                profile: data.profile || "senior",
                modes: data.modes || {},
                signals: data.signals || {},
                alerts: data.alerts || {}, // ✅ AJOUT DES ALERTES
                state: data.state || {}
            };

            console.log("📦 PAYLOAD ENVOYÉ:", payload);
            console.log("🔑 API KEY UTILISÉE:", apiKey); // 🔍 DEBUG CLÉ
            console.log("🎭 MODES:", payload.modes);

            const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey // 🔐 Retour à X-API-KEY (CORS Safe)
            },
            body: JSON.stringify(payload), // ✅ Utilisation du payload loggué
            });

            if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur Serveur (${response.status}): ${errorText}`);
            }

            const decision = await response.json();
            
            console.log("📥 Réponse Agent Zero:", decision);
            console.log("📊 Module Order:", decision.moduleOrder);
            console.log("⏱️ Tempo:", decision.presentationTempo);
            console.log("🎚️ Enable:", decision.enable);
            console.log("💡 Tooltips:", decision.tooltipsEnabled);
            console.log("📝 Summary Style:", decision.summaryStyle);
            console.log("🧠 Reasoning:", decision.reasoning);

            return decision;

        } catch (error) {
            console.error("❌ Échec de la connexion à l'IA:", error);
            return null;
        }
    };

    // 🧠 LOGIQUE DE CONTRÔLE (LE FLIC)
    // 🧠 LOGIQUE DE CONTRÔLE (LE FLIC) - Version Intelligente
    const handleModuleChange = (targetModule: string) => {
        const idealOrder = agentDecision?.moduleOrder || [];
        const expectedModule = idealOrder[currentStepIndex];
        const targetIndex = idealOrder.indexOf(targetModule);

        // On vérifie seulement si on a une décision IA
        if (agentDecision) {
            console.log(`🔍 Vérification: Cible=${targetModule} vs Attendu=${expectedModule} (Index: ${currentStepIndex})`);
            
            if (targetModule === expectedModule) {
                 // ✅ PARFAIT : C'est le module attendu
                 setCurrentStepIndex(prev => prev + 1);
            } else if (targetIndex > currentStepIndex) {
                 // ⚠️ SAUT D'ÉTAPE : L'utilisateur brûle les étapes
                 const skippedCount = targetIndex - currentStepIndex;
                 console.warn(`⚠️ Saut d'étapes : ${skippedCount} modules ignorés.`);
                 // Pénalité moindre (-5 par module sauté au lieu de -15 bloquant)
                 setComplianceScore(prev => Math.max(0, prev - (5 * skippedCount))); 
                 setViolationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Saut : ${skippedCount} modules ignorés pour aller à ${targetModule}`]);
                 // On rattrape le fil pour la suite
                 setCurrentStepIndex(targetIndex + 1);
            } else if (targetIndex !== -1 && targetIndex < currentStepIndex) {
                 // 🔙 RAPPEL : L'utilisateur revient en arrière (pas de pénalité, c'est de la révision)
                 // Rien à faire
            } else {
                 // 🚨 HORS-PISTE : Module non prévu par l'IA
                 // Si le module n'est pas dans la liste idealOrder, c'est une vraie infraction ou une exploration libre.
                 if (expectedModule) { // On pénalise seulement si l'IA attendait quelque chose
                    setComplianceScore(prev => Math.max(0, prev - 5));
                    setViolationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Hors-piste : ${targetModule}`]);
                    console.warn("🚨 Module hors-piste détecté");
                 }
            }
        }
        
        // Navigation normale
        setActiveModule(targetModule);
    };

    // 🧠 AGENT ZERO - TEST INTÉGRATION
    useEffect(() => {
        async function fetchAgentDecision() {
          console.log("🧠 Contacting Agent Zero...");
          
          // Simulation Data from React State (or default)
          // ⚠️ IMPORTANT: Utilisation des vraies données SpeechView (si disponibles)
          // ⚠️ IMPORTANT: Utilisation des vraies données SpeechView (si disponibles)
          const profileResult = data.speechResult || { signals: {}, alerts: {}, rawScores: {} };

          // 🧠 CALCUL EXPLICITE DES MODES (OVERRIDE DU DASHBOARD)
          const modes = {
            defiance: (
              activeProfile === "senior" &&
              (profileResult.rawScores?.senior || 0) >= 6 &&
              profileResult.signals?.peurDeSeTromper
            ),
            
            opportunity: (
              activeProfile === "standard" &&
              !profileResult.signals?.peurDeSeTromper &&
              !profileResult.signals?.indecision &&
              !profileResult.alerts?.profileUncertain &&
              !profileResult.alerts?.incoherentAnswers &&
              !profileResult.alerts?.fatigueSuspected &&
              !profileResult.alerts?.fatigueCritical
            ),
            
            fatigueCognitive: profileResult.alerts?.fatigueCritical || false
          };

          // ⬇️ DEBUG OPPORTUNITY
          console.log("🔍 DEBUG OPPORTUNITY:");
          console.log("  Profile:", activeProfile);
          console.log("  peurDeSeTromper:", profileResult.signals?.peurDeSeTromper);
          console.log("  indecision:", profileResult.signals?.indecision);
          console.log("  profileUncertain:", profileResult.alerts?.profileUncertain);
          console.log("  incoherentAnswers:", profileResult.alerts?.incoherentAnswers);
          console.log("  fatigueSuspected:", profileResult.alerts?.fatigueSuspected);
          console.log("  fatigueCritical:", profileResult.alerts?.fatigueCritical);
          console.log("  → opportunity calculated:", modes.opportunity);

          const decision = await getAgentDecision({
              profile: activeProfile,
              modes: modes,
              signals: profileResult.signals || {
                peurDeSeTromper: false,
                besoinDeChiffres: false,
                urgencePercue: false,
                indecision: false,
              },
              alerts: profileResult.alerts || {},
              state: {
                currentModule: "constat",
                timeElapsedSec: 420,
                questionsAsked: ["ROI"],
              }
          });

          if (decision) {
            setAgentDecision(decision);
          }
        }
        
        fetchAgentDecision();
    }, [apiUrl]); // 🔥 Re-fetch if API URL changes

    // ⚖️ CERTIFICATION OPÉRATEUR (LE JUGE) UPDATE (Étape J)
    const generateAuditReport = () => {
        const auditData = {
            timestamp: new Date().toLocaleString(),
            auditId: agentDecision?.auditTrail?.audit_id || `AZ-${Math.random().toString(36).toUpperCase().substr(2, 9)}`,
            client: agentDecision?.auditTrail?.client || "CLIENT_PROSPECTION",
            status: "STRICT_CONFORMITY_VALIDATED",
            rules: [
            "Zéro génération de texte client (Anti-hallucination)",
            "Orchestration neutre des calculs financiers",
            "Garde-fous métier appliqués : 100%",
            "Aucune persistance de données sensibles (RGPD)"
            ]
        };

        alert(`🛡️ CERTIFICAT D'AUDIT GÉNÉRÉ\n\nID: ${auditData.auditId}\nClient: ${auditData.client}\nStatut: ${auditData.status}\n\n"Agent Zero empêche de mal décider."`);
    };

  // 1️⃣ TOUS LES STATES EN PREMIER

  // ✅ PROFIL — Synchronisé avec le quiz
  const [profile, setProfile] = useState<
    "standard" | "banquier" | "senior" | null
  >(data.profile ?? null);
  const activeProfile: "standard" | "banquier" | "senior" = profile || "senior";

  // 🧠 PHASES SELON PROFIL (Base locale)
  const localPhases =
    activeProfile === "senior"
      ? seniorPhases
      : activeProfile === "banquier"
      ? banquierPhases
      : standardPhases;

  // 🦅 AUTORITÉ AGENT ZERO (Switch)
  // Si Agent Zero a parlé, on reconstruit l'ordre. Sinon, fallback local.
  const phases = useMemo(() => {
    // 1. Fallback si pas de décision
    if (!agentDecision?.moduleOrder || agentDecision.moduleOrder.length === 0) {
      return localPhases;
    }

    // 2. Mapping Agent Zero (Ordre IA + Traduction ID + Données Locales)
    // ⚠️ CRITIQUE : On traduit l'ID Agent Zero (ex: "constat") en ID Local (ex: "repartition")
    const orderedPhases = agentDecision.moduleOrder
      .map((agentId) => {
        const localModuleId = AGENT_ZERO_TO_LOCAL_MODULE_MAP[agentId as keyof typeof AGENT_ZERO_TO_LOCAL_MODULE_MAP];
        return localPhases.find((p) => p.moduleId === localModuleId);
      })
      .filter(Boolean); // On filtre les introuvables (Sécurité)

    // 3. Sécurité : Si le mapping échoue (ex: IDs inconnus), on revient au local
    return orderedPhases.length > 0 ? orderedPhases : localPhases;
  }, [agentDecision, localPhases]);

  // 🆕 NOUVEAU — Sélection du contenu Garanties (TEXTE DYNAMIQUE)
  const garantiesContent = useMemo(() => {
    const moduleId = 'garanties';
    
    // 1. Override complet envoyé par Agent Zero
    if (agentDecision?.contentOverrides?.[moduleId]) {
      return agentDecision.contentOverrides[moduleId];
    }
    
    // 2. Variante demandée par Agent Zero
    if (agentDecision?.contentVariants?.[moduleId]) {
      const key = agentDecision.contentVariants[moduleId];
      return (
        (contentVariants as any)[moduleId]?.[key] ||
        (contentVariants as any)[moduleId]?.default
      );
    }
    
    // 3. Fallback absolu
    return (contentVariants as any)[moduleId]?.default;
  }, [agentDecision]);







  // 🧠 PHASE ACTIVE POUR LE COACH (HUD / PANEL)
  const [activeCoachPhase, setActiveCoachPhase] = useState<any>(null);

  // 🔥 INITIALISATION AUTOMATIQUE DE LA PHASE COACH
  useEffect(() => {
    if (!activeCoachPhase && phases.length > 0) {
      setActiveCoachPhase(phases[0]);
    }
  }, [phases, activeCoachPhase]);

  // 📊 PHASES DU DASHBOARD (INDÉPENDANT DU COACH)
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeOnModule, setTimeOnModule] = useState(0);
  const activePhase = phases[currentPhase];

  // 🔄 SYNCHRO PROFIL SI CHANGEMENT VIA QUIZ
  useEffect(() => {
    if (data.profile && !profile) {
      setProfile(data.profile);
    }
  }, [data.profile]);

  // Reste de tes states
  // Dans ton composant, avec les autres useState
  const [showBudgetProtectionInfo, setShowBudgetProtectionInfo] =
    useState(false);
  const [showCapitalInfo, setShowCapitalInfo] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [step, setStep] = useState<"dashboard" | "coach" | "results">(
    "dashboard"
  );
  const [showDiffBadge, setShowDiffBadge] = useState(false);
  const [coachImpactOpen, setCoachImpactOpen] = useState(false);

  // 🧠 COACH — état global : module ouvert
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isCoachDisabled, setIsCoachDisabled] = useState(true);
  const [coachView, setCoachView] = useState<"hud" | "panel">("hud");
  // 🧭 UI coach

  // 🔐 SÉCURITÉ ÉCRAN
  const [isAdvisorScreen, setIsAdvisorScreen] = useState(true);

  // 🔥 PHASE 1 : Machine à états
  const {
    currentStep,
    stepNotification,
    confirmStep,
    detectStep,
    securityTime,
    visitedModules,
  } = useRDVState();
  // 🛡️ Surveillance du vocabulaire et des interdits
  const {
    alert: vocabAlert,
    dismissAlert: dismissVocabAlert,
    checkVocabulary,
    signal,
  } = useVocabularyGuard(profile);

  // 🔥 PHASE 2 : Système d'alertes
  const { activeAlert, dismissAlert, checkSecurityTime } = useAlertSystem({
    activeModule,
    visitedModules,
    securityTime,
    currentStep,
    profile, // ✅ Maintenant synchronisé avec le quiz
  });

  // 🔥 PHASE 3 : Timer silence
  const { silenceTime, silenceAlert, resetTimer, dismissSilenceAlert } =
    useSilenceTimer({
      activeModule,
    });

  // 🔥 Handler pour actions d'alerte
  const handleAlertAction = (action: any) => {
    switch (action.type) {
      case "CLOSE_AND_OPEN":
        setActiveModule(null);
        setTimeout(() => {
          setActiveModule(action.open);
        }, 100);
        dismissAlert();
        break;

      case "CANCEL_CLOSE":
        dismissAlert();
        break;

      case "ACKNOWLEDGE":
        dismissAlert();
        resetTimer();
        break;

      default:
        dismissAlert();
    }
  };
  // 🔥 NOUVEAU : Handler fermeture module
  const handleModuleClose = (moduleId: string) => {
    // Si c'est Garanties, vérifier le temps minimum
    if (moduleId === "garanties") {
      const canClose = checkSecurityTime();
      return canClose; // false = empêche fermeture, true = autorise
    }

    // Pour les autres modules, autoriser la fermeture
    return true;
  };
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  // 2️⃣ USEEFFECTS

  // 🔥 Détection automatique des modules
  useEffect(() => {
    if (activeModule) {
      detectStep({
        moduleOpen: activeModule,
        moduleClosed: null,
      });
    }
  }, [activeModule, detectStep]);

  // Badge différentiel
  useEffect(() => {
    const t = setTimeout(() => setShowDiffBadge(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // 🔐 DÉTECTION HDMI AUTOMATIQUE
  useEffect(() => {
    const detectHDMI = () => {
      const x = window.screenX || window.screenLeft;
      const hasExternalDisplay = x > window.screen.availWidth / 2;

      if (hasExternalDisplay) {
        console.log("📺 HDMI détecté");
      }
    };

    detectHDMI();
    const interval = setInterval(detectHDMI, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🟥 STOP – Erreur mortelle #1 : Senior + projections anxiogènes
  useEffect(() => {
    if (!activeModule) return;
    if (profile === "senior" && activeModule === "where-money") {
      setPopup("STOP_XYEARS");
    }
  }, [activeModule, profile]);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // 🔥 AJOUT ICI : Détection fin de parcours (étape 10/10)
  useEffect(() => {
    if (currentStep === 10 && showCompletion === false) {
      const timer = setTimeout(() => {
        setShowCompletion(true);
        console.log("🏁 Fin de parcours détectée");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, showCompletion]);

  // 3️⃣ VARIABLES SIMPLES
  const clientCity = data?.city || null;
  const round2 = (num: number): number => Math.round(num * 100) / 100;

  // 1️⃣ TOUS LES STATES (D'abord, sans interruption)

  const [isManagerApproved, setIsManagerApproved] = useState(false);
  const [showRobustesse, setShowRobustesse] = useState<boolean>(false);
  const [showDemenagement, setShowDemenagement] = useState<boolean>(false);
  const [popup, setPopup] = useState<null | string>(null);

  // fonction générique pour fermer
  const closePopup = () => setPopup(null);

  // --- ÉTATS POUR L'ANIMATION DE L'AUDIT ---
  const [showDetails, setShowDetails] = useState(false);
  const [showCoachPanel, setShowCoachPanel] = useState(false);
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [params, setParams] = useState(data.params);
  const [inflationRate, setInflationRate] = useState<number>(5);
  const [projectionYearsState, setProjectionYearsState] = useState(
    projectionYears || 20
  );

  const [commercialEmail, setCommercialEmail] = useState(
    import.meta.env.VITE_COMMERCIAL_EMAIL || ""
  );
  const [commercialName, setCommercialName] = useState(
    import.meta.env.VITE_COMMERCIAL_NAME || ""
  );
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  // ✨ AJOUT ICI : Variables pour la Valeur Verte
  const [greenValueData, setGreenValueData] = useState<{
    value: number;
    pricePerSqm: number;
    city: string;
    dept: string;
    isRealData: boolean;
  } | null>(null);
  const [loadingGreenValue, setLoadingGreenValue] = useState(false);
  const [showGreenValueInfo, setShowGreenValueInfo] = useState(false);
  const [showHeritageInfo, setShowHeritageInfo] = useState(false);
  const [showCoachTip, setShowCoachTip] = useState(false);
  const heritageOpen = showHeritageInfo
    ? "overflow-visible"
    : "overflow-hidden";
  const greenOpen = showGreenValueInfo ? "overflow-visible" : "overflow-hidden";
  const [showCash, setShowCash] = useState(false);

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
  const [__footerPopup, __setFooterPopup] = React.useState(false);
  const [inputValue, setInputValue] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);
  const [studyStatus, setStudyStatus] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [inputClientName, setInputClientName] = useState("");
  const [inputClientEmail, setInputClientEmail] = useState("");
  const [inputClientId, setInputClientId] = useState<string | null>(
    data?.client_id || null
  );
  const [inputClientPhone, setInputClientPhone] = useState("");
  const [inputCivility, setInputCivility] = useState("M./Mme");
  const [inputCommercialName, setInputCommercialName] = useState("");
  const [inputCommercialEmail, setInputCommercialEmail] = useState("");
  const [paymentType, setPaymentType] = useState("financing");
  // 'financing' | 'cash'

  const [hasDeposit, setHasDeposit] = useState(false);

  const [depositAmount, setDepositAmount] = useState(1500);
  // ou la vraie valeur dynamique si tu l’as déjà

  // 🔌 AGENT ZERO — WIRING (ÉTAPE 4 - STRICT)
  // Re-placed here to access isSigned and visitedModules
  const agentZeroInput = useMemo(() => ({
    user: {
      profile: (profile || "prudent") as any,
      engagementLevel: 50,
      fatigueScore: 0,
    },
    session: {
      timeSpent: 0,
      scrollDepth: 0,
      openedModules: visitedModules || [],
      closedModules: [],
      idleMoments: 0,
    },
    decision: {
      hasSeenCoreProofs: (visitedModules || []).includes("repartition"),
      hasSeenBudgetModule: (visitedModules || []).includes("budget"),
      hasSeenProjection: (visitedModules || []).includes("projection"),
      hasOpenedDetailsAccordion: false,
      hasReachedDecisionAnchor: (visitedModules || []).includes("decision-anchor"),
      hasClickedSign: false,
      isSigned: isSigned,
    },
    riskSignals: {
      hesitationLoops: 0,
      backwardScrolls: 0,
      popupObjectionsOpened: [],
    },
  }), [profile, visitedModules, isSigned]);

  const agentZero = useAgentZero(agentZeroInput);

  const handleGenerate = async () => {
    // Validation
    if (!inputClientName.trim()) {
      alert("⚠️ Veuillez entrer le nom du client");
      return;
    }

    if (!inputCommercialEmail.trim()) {
      alert("⚠️ Veuillez entrer l'email du commercial");
      return;
    }

    // ✅ Synchroniser toutes les valeurs
    setClientName(inputClientName);
    setClientEmail(inputClientEmail);
    setClientPhone(inputClientPhone);
    setCommercialName(inputCommercialName);
    setCommercialEmail(inputCommercialEmail);

    setIsLoading(true);

    try {
      // 🔥 On ajoute inputClientId ici pour qu'il soit transmis à la fonction
      await handleGenerateStudy(
        inputClientName,
        inputCommercialEmail,
        inputClientId || undefined,
        inputClientEmail, // ← AJOUTÉ
        inputClientPhone, // ← AJOUTÉ
        inputCivility
      );
      // ✅ reset signature car nouvelle étude
      setIsSigned(false);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 📤 ENVOYER L'ÉTUDE (CLIENT NON SIGNÉ)
  // ═══════════════════════════════════════════════════════════
  const handleSendStudy = async () => {
    console.log("🔵 handleSendStudy APPELÉ");
    console.log("🔵 currentStudyId =", currentStudyId);
    
    if (!currentStudyId) {
      alert("❌ Aucune étude générée. Veuillez d'abord générer l'étude.");
      return;
    }



    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("studies")
        .update({
          status: "sent"
        })
        .eq("id", currentStudyId);

      if (error) {
        console.error("❌ Erreur lors de l'envoi:", error);
        alert("❌ Erreur lors de l'envoi de l'étude : " + error.message);
        return;
      }

      alert("✅ Étude envoyée ! Les emails de relance seront envoyés automatiquement.");
      console.log("✅ Étude passée en 'sent':", currentStudyId);
      setStudyStatus("sent"); // ✅ Badge status
    } catch (err) {
      console.error("❌ Erreur:", err);
      alert("❌ Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignStudy = async () => {
    console.log("🧾 SIGN PAYMENT VALUES", {
      paymentType,
      hasDeposit,
      depositAmount,
    });

    if (!confirm("⚠️ Confirmer que le client a SIGNÉ le projet ?")) return;

    if (!paymentType || hasDeposit === null || hasDeposit === undefined) {
      alert("❌ Mode de paiement non défini. Impossible de signer.");
      return;
    }

    if (hasDeposit && (!depositAmount || depositAmount <= 0)) {
      alert("❌ Montant d'acompte invalide.");
      return;
    }

    try {
      setIsLoading(true);

      // 🔎 Dernière étude
      const { data: study, error: fetchError } = await supabase
        .from("studies")
        .select("id, status, study_data")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !study) {
        alert("❌ Impossible de retrouver l'étude");
        return;
      }

      if (study.status === "signed") {
        alert("⚠️ Cette étude est déjà signée.");
        return;
      }

      // 🎯 VÉRITÉ MÉTIER - CALCUL DU MODE DE PAIEMENT RÈEL
      const totalPrice = Number(installCost || 0);
      const finalCashApport = Number(cashApport || 0);

      const isActuallyCash = finalCashApport >= totalPrice;
      const payment_mode = isActuallyCash ? "cash" : "financing";

      // ✅ MAPPING CORRECT : payment_mode → financing_mode
      let financingMode;

      if (isActuallyCash) {
        financingMode = "cash_payment";
      } else {
        // C'est un financement
        if (hasDeposit && depositAmount > 0) {
          financingMode = "financing_with_deposit";
        } else {
          financingMode = "full_financing";
        }
      }

      console.log("💡 MAPPING DÉDUIT:", {
        totalPrice,
        finalCashApport,
        isActuallyCash,
        financingMode,
      });

      console.log("SIGN MODES", {
        payment_mode,
        financingMode,
        hasDeposit,
        depositAmount,
      });

      // ✅ SIGNATURE + CONTEXTE FINANCIER (ANCIEN + NOUVEAU SYSTÈME)
      const { error: updateError } = await supabase
        .from("studies")
        .update({
          status: "signed",
          signed_at: new Date().toISOString(),

          // ✅ FORÇAGE VÉRITÉ MÉTIER
          payment_mode: payment_mode,
          payment_type: payment_mode,
          financing_mode: financingMode,

          has_deposit: hasDeposit,
          deposit_amount: hasDeposit ? depositAmount : null,

          // ✅ PERSISTANCE FRONT-END (pour Dashboard)
          study_data: {
            ...(study.study_data || {}),
            mode: payment_mode, // "cash" ou "financing"
            cashApport: finalCashApport,
          },

          contract_secured: false,
          cancellation_deadline: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("id", study.id);

      if (updateError) throw updateError;

      setIsSigned(true);
      setStudyStatus("signed"); // ✅ Badge status

      // 🧾 Log métier
      await supabase.from("decision_logs").insert({
        study_id: study.id,
        action_performed: "SIGNED_FROM_RESULTS_DASHBOARD",
        justification: `Signature client | mode=${payment_mode} | financing=${financingMode} | apport=${finalCashApport}`,
      });

      alert("✅ Client signé. Dossier figé financièrement.");
    } catch (e) {
      console.error("SIGN ERROR:", e);
      alert("❌ Erreur lors de la signature");
    } finally {
      setIsLoading(false);
    }
  };

  const [installedPower, setInstalledPower] = useState<number>(
    data?.params?.installedPower || 3.5
  );
  const [primeRatePerWatt, setPrimeRatePerWatt] = useState<number>(0.08);
  const [primeAmount, setPrimeAmount] = useState<number>(
    data?.params?.primeAmount ??
      Math.round((data?.params?.installedPower || 3.5) * 1000 * 0.08)
  );
  const [houseSize, setHouseSize] = useState<number>(
    data?.params?.houseSize || 120
  );

  useEffect(() => {
    if (installedPower) {
      setPrimeAmount(Math.round(installedPower * 1000 * primeRatePerWatt));
    }
  }, [installedPower, primeRatePerWatt]);

  const [creditMonthlyPayment, setCreditMonthlyPayment] =
    useState<number>(147.8);
  const [insuranceMonthlyPayment, setInsuranceMonthlyPayment] =
    useState<number>(4.7);
  const [creditDurationMonths, setCreditDurationMonths] = useState<number>(180);
  const [cashApport, setCashApport] = useState<number>(0);
  const [remainingToFinance, setRemainingToFinance] = useState<number>(18799);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [autoCalculate, setAutoCalculate] = useState<boolean>(false);
  const [interestRate, setInterestRate] = useState<number>(3.89);
  const [codeValidated, setCodeValidated] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(180);
  const hasInitializedRate = useRef(false);
  const hasInitializedParams = useRef(false);
  const setCreditInterestRate = setInterestRate;
  const [showTransition, setShowTransition] = useState(false);

  const [insuranceRate, setInsuranceRate] = useState<number>(0);
  const [buybackRate, setBuybackRate] = useState<number>(0.04);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [wastedCash, setWastedCash] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);
  const [showParamsEditor, setShowParamsEditor] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [showWastedCashWidget, setShowWastedCashWidget] = useState(true);
  const [warrantyMode, setWarrantyMode] = useState<boolean>(true);
  const [economyChartMode, setEconomyChartMode] = useState<
    "financing" | "cash"
  >("financing");
  const [tableMode, setTableMode] = useState<"annuel" | "mensuel">("mensuel");
  const [tableScenario, setTableScenario] = useState<"financing" | "cash">(
    "financing"
  );
  const [budgetScenario, setBudgetScenario] = useState<"financing" | "cash">(
    "financing"
  );
  const [gouffreMode, setGouffreMode] = useState<"financing" | "cash">(
    "financing"
  );
  const [showScripts, setShowScripts] = useState(false);
  const [scriptProfile, setScriptProfile] = useState("standard");
  const [whereMoneyMode, setWhereMoneyMode] = useState<"financing" | "cash">(
    "financing"
  );
  const [sessionStart] = useState(Date.now());

  const recalculateFinancing = () => {
    // 🔢 Capital à financer
    const capital = remainingToFinance;

    // 📉 Taux mensuel
    const monthlyRate = interestRate / 100 / 12;

    // ⏱️ Durée
    const months = creditDurationMonths;

    // 💳 Mensualité crédit (formule bancaire)
    const monthlyPayment =
      (capital * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

    // 🛡️ Assurance (0.3% annuel par défaut)
    const insuranceMonthly = (capital * 0.003) / 12;

    // ✅ Mise à jour des states
    setCreditMonthlyPayment(Number(monthlyPayment.toFixed(2)));
    setInsuranceMonthlyPayment(Number(insuranceMonthly.toFixed(2)));
  };

  // 2️⃣ SÉCURITÉ ABSOLUE (Placée après les Hooks pour éviter les erreurs React/Prettier)
  if (!data || !data.params) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 animate-pulse font-light italic">
          Chargement des paramètres de simulation...
        </div>
      </div>
    );
  }

  const monthlyBill = useMemo(() => {
    return (
      safeParseFloat(data?.params?.monthlyBill) ||
      safeParseFloat(data?.params?.annualBill) / 12 ||
      (yearlyConsumption * electricityPrice) / 12 ||
      150
    );
  }, [
    data?.params?.monthlyBill,
    data?.params?.annualBill,
    yearlyConsumption,
    electricityPrice,
  ]);
  useEffect(() => {
    recalculateFinancing();
  }, [interestRate, creditDurationMonths, remainingToFinance]);

  // 3️⃣ LES EFFETS ET CALCULS

  const coachData = useMemo(() => {
    const currentMonthlyBill = Math.round(
      (data.params.yearlyProduction *
        data.params.electricityPrice *
        (data.params.selfConsumptionRate / 100)) /
        12
    );
    const loanMonthly = Math.round(
      ((data.params.installCost || 0) * (interestRate / 100 / 12)) /
        (1 - Math.pow(1 + interestRate / 100 / 12, -180))
    );
    const remainingMonthly = Math.round(currentMonthlyBill * 0.3);
    const totalWithSolar = loanMonthly + remainingMonthly;
    const monthlySavings = currentMonthlyBill - totalWithSolar;
    const cost20Years = Math.round(currentMonthlyBill * 12 * 20 * 1.65);
    const cost40Years = Math.round(currentMonthlyBill * 12 * 40 * 2.1);
    const savings20Years = Math.round(
      cost20Years - ((data.params.installCost || 0) + remainingMonthly * 12 * 20)
    );

    return {
      monthlyBill: currentMonthlyBill,
      loanMonthly,
      remainingMonthly,
      totalWithSolar,
      monthlySavings,
      cost20Years,
      cost40Years,
      savings20Years,
      totalSavingsProjected: savings20Years,
      // Ajout de ces deux lignes pour que ton Patrimoine et Héritage fonctionnent
      greenValue: Math.round((data.params.installCost || 0) * 1.9),
      heritageNet: savings20Years + Math.round((data.params.installCost || 0) * 1.9),
    };
  }, [data.params, interestRate]);

  useEffect(() => {
    // ✅ N'INITIALISER QU'UNE SEULE FOIS
    if (!hasInitializedParams.current && data?.params) {
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

      hasInitializedParams.current = true; // ✅ AJOUTE JUSTE CETTE LIGNE
    }
  }, [data]);

  // ✅ INITIALISATION DU TAUX AU MONTAGE UNIQUEMENT
  useEffect(() => {
    // ✅ N'INITIALISER QU'UNE SEULE FOIS
    if (!hasInitializedRate.current && data?.params?.creditInterestRate) {
      const rate = safeParseFloat(data.params.creditInterestRate, 3.89);
      setInterestRate(rate);
      hasInitializedRate.current = true;
    }
  }, []); // ✅ JUSTE []

  useEffect(() => {
    setRemainingToFinance(Math.max(0, installCost - cashApport));
  }, [installCost, cashApport]);

  useEffect(() => {
    const params = data?.params || {};
    const conso = params.yearlyConsumption || 10000;
    const price = params.electricityPrice || 0.25;
    const costPerSecond = (conso * price) / 365 / 24 / 3600;
    const interval = setInterval(() => {
      setWastedCash((prev) => {
        const next = prev + costPerSecond;
        if (next > 1.5) setShouldShake(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const projectedMonthlyLoan = useMemo(() => {
    const r = (interestRate || 0) / 100 / 12;
    const n = creditDurationMonths || 0;
    const P = remainingToFinance || 0;
    if (r === 0 || n === 0) return P / (n || 1);
    const val = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    return isNaN(val) ? 0 : val;
  }, [remainingToFinance, interestRate, creditDurationMonths]);

  const projectedMonthlyInsurance = useMemo(
    () => data?.params?.insuranceMonthlyPayment || 0,
    [data]
  );

  const applyAutoValues = () => {
    setCreditMonthlyPayment(Math.round(projectedMonthlyLoan * 100) / 100);
    setInsuranceMonthlyPayment(
      Math.round(projectedMonthlyInsurance * 100) / 100
    );
    setShowParamsEditor(false);
  };
  const handleCodeValidation = () => {
    const upperCode = codeInput.toUpperCase();

    let newRate = interestRate;

    if (upperCode === "PREMIUM0999") {
      newRate = 0.99;
      setSelectedDuration(84); // 7 ans
    } else if (upperCode === "EDF2025") {
      newRate = 1.99;
      setSelectedDuration(72); // 6 ans
    } else if (upperCode === "STANDARD") {
      newRate = 3.89;
      setSelectedDuration(180); // 15 ans
    } else {
      alert("❌ Code invalide !");
      return;
    }

    // ✅ Mise à jour du taux
    setInterestRate(newRate);

    // ✅ Affiche le choix de durée
    setCodeValidated(true);

    // ⛔️ ON NE FAIT PLUS RIEN ICI
    // ⛔️ PAS de reset
    // ⛔️ PAS de fermeture du modal
  };
  const handleConfirmSimulation = async () => {
    setCreditDurationMonths(selectedDuration); // ✅ SEUL ENDROIT
    setAutoCalculate(true); // ✅ UNE FOIS
    setShowParamsEditor(false);
    // ❌ CORRECTION: On garde ces valeurs pour ne pas masquer les modules
    // setCodeValidated(false);
    // setCodeInput("");
    await supabase
      .from("studies")
      .update({
        status: "signed",
        signed_at: new Date().toISOString(),
        payment_mode: remainingToFinance > 0 ? "financing" : "cash",
        financing_mode:
          remainingToFinance > 0
            ? hasDeposit
              ? "financing_with_deposit"
              : "full_financing"
            : "cash_payment",
        has_deposit: hasDeposit,
        deposit_amount: hasDeposit ? depositAmount || 0 : null,
      })
      .eq("id", studyId);
  };

  useEffect(() => {
    if (!interestRate || !creditDurationMonths || !remainingToFinance) return;

    const r = interestRate / 100 / 12;
    const n = creditDurationMonths;
    const P = remainingToFinance;

    const mensualite = (P * r) / (1 - Math.pow(1 + r, -n));

    setCreditMonthlyPayment(Math.round(mensualite * 100) / 100);
  }, [interestRate, creditDurationMonths, remainingToFinance]);
  // 🔍 DEBUG UI – À GARDER POUR TEST
  useEffect(() => {}, [
    creditMonthlyPayment,
    interestRate,
    creditDurationMonths,
  ]);

  const calculationResult = useMemo((): any => {
    if (!data?.params) return null;

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
      interestRate,
      primeAmount,
    });

    if (!result) return null;

    const rawYear1 = result.details?.[0];
    if (!rawYear1) return null;

    const year1 = {
      year: rawYear1.year,
      edfBillWithoutSolar: rawYear1.edfBillWithoutSolar,
      creditPayment: rawYear1.creditPayment,
      edfResidue: rawYear1.edfResidue,
      totalWithSolar: rawYear1.totalWithSolar,
      cumulativeSavings: rawYear1.cumulativeSavings,
      solarSavingsValue: rawYear1.solarSavingsValue,
      monthlyBill: Math.round(rawYear1.edfBillWithoutSolar / 12),
      totalWithSolarMonthly: Math.round(rawYear1.totalWithSolar / 12),
      remainingMonthly: Math.round(rawYear1.edfResidue / 12),
      loanMonthly: Math.round(rawYear1.creditPayment / 12),
      monthlySavings: Math.round(
        (rawYear1.edfBillWithoutSolar - rawYear1.totalWithSolar) / 12
      ),
    };

    const greenValue = greenValueData?.value || Math.round(installCost * 1.9);
    const lastYearIndex = Math.min(19, projectionYears - 1);
    const heritageNet = Math.round(
      result.details?.[lastYearIndex]?.cumulativeSavings || 0
    );

    return {
      ...result,
      // 🧩 Ajouts ROOT nécessaires pour validateSimulation()
      interestRate,
      creditDurationMonths,
      remainingToFinance,
      creditMonthlyPayment,
      insuranceMonthlyPayment,

      year1,
      greenValue,
      heritageNet,
      greenValueData,
      houseValue:
        (data?.params?.houseSize || 100) *
        (greenValueData?.pricePerSqm || 3200),
      monthlyBill: year1.monthlyBill,
      monthlySavings: year1.monthlySavings,
      totalWithSolar: year1.totalWithSolar,
      remainingBill: year1.edfResidue,
      primeAmount,
    };
  }, [
    data,
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
    greenValueData,
    interestRate,
    primeAmount,
  ]);

  useEffect(() => {
    if (!calculationResult) return;

    const validation = validateSimulation(calculationResult);

    console.log(
      "\n════════════════════════════════════════════════════════════════════════════════"
    );
    console.log("🔍 RAPPORT DE VALIDATION");
    console.log(
      "════════════════════════════════════════════════════════════════════════════════\n"
    );
    console.log(`📊 SCORE: ${validation.score}%`);
    console.log(`❌ Erreurs: ${validation.errors.length}`);
    console.log(`⚠️  Warnings: ${validation.warnings.length}`);
    console.log(`✅ OK: ${validation.info.length}\n`);

    if (validation.errors.length > 0) {
      console.log("🚨 ERREURS:");
      console.log(
        "──────────────────────────────────────────────────────────────────────────────"
      );
      validation.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.category}: ${err.message}`);
        if (err.expected) console.log(`   Attendu: ${err.expected}`);
        if (err.actual) console.log(`   Actuel: ${err.actual}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      console.log(
        "──────────────────────────────────────────────────────────────────────────────"
      );
      validation.warnings.forEach((warn, i) => {
        console.log(`${i + 1}. ${warn.category}: ${warn.message}`);
      });
    }

    console.log("\n✅ CHECKS OK:");
    console.log(
      "──────────────────────────────────────────────────────────────────────────────"
    );
    validation.info.forEach((info, i) => {
      console.log(`${i + 1}. ${info.message}`);
    });

    console.log(
      "\n════════════════════════════════════════════════════════════════════════════════"
    );
    console.log(validation.isValid ? "🎉 VALIDÉ" : "🚨 REJETÉ");
    console.log(
      "════════════════════════════════════════════════════════════════════════════════\n"
    );

    // Garde aussi la fonction globale pour debug manuel
    if (typeof window !== "undefined") {
      window.calculationResult = calculationResult;
      window.printValidationReport = () => {
        console.log(validation);
        return validation;
      };
    }
  }, [calculationResult]);

  // 🧰 DEBUG — Dev only
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // @ts-ignore
    window.calculationResult = calculationResult;
    // @ts-ignore
    window.printValidationReport = printValidationReport;
  }, [calculationResult]);

  const isStudyCash = useMemo(() => {
    return (
      cashApport >= installCost ||
      remainingToFinance <= 0 ||
      data?.params?.mode === "cash" ||
      data?.mode === "cash" ||
      paymentType === "cash"
    );
  }, [cashApport, installCost, remainingToFinance, data, paymentType]);

  const residuMensuelM0 = useMemo(() => {
    const list = isStudyCash ? calculationResult?.detailsCash : calculationResult?.details;
    const op = list?.find((d: any) => d.edfBillWithoutSolar > 0);
    return ((op || list?.[0])?.edfResidue || 0) / 12;
  }, [calculationResult, isStudyCash]);

  const totalMensuel = useMemo(() => {
    if (isStudyCash) {
      return residuMensuelM0;
    }
    return creditMonthlyPayment + insuranceMonthlyPayment + residuMensuelM0;
  }, [isStudyCash, creditMonthlyPayment, insuranceMonthlyPayment, residuMensuelM0]);

  const diffMensuel = useMemo(() => {
    return totalMensuel - monthlyBill;
  }, [totalMensuel, monthlyBill]);

  useEffect(() => {
    const fetchGreenValue = async () => {
      const address = data?.params?.address || data?.params?.clientAddress;
      const surface = data?.params?.houseSize || 100;
      if (!address) {
        setGreenValueData({
          value: Math.round(surface * 3200 * 0.08),
          pricePerSqm: 3200,
          city: "Estimation",
          dept: "FR",
          isRealData: false,
        });
        return;
      }
      setLoadingGreenValue(true);
      try {
        const result = await calculateGreenValueFromAddress(address, surface);
        setGreenValueData({
          value: result.greenValue,
          pricePerSqm: result.pricePerSqm,
          city: result.city,
          dept: result.dept,
          isRealData: true,
        });
      } catch (e) {
        setGreenValueData({
          value: Math.round(surface * 3200 * 0.08),
          pricePerSqm: 3200,
          city: "Estimation",
          dept: "FR",
          isRealData: false,
        });
      } finally {
        setLoadingGreenValue(false);
      }
    };
    fetchGreenValue();
  }, [data?.params?.address, data?.params?.houseSize]);

  /**
   * 🔍 SYSTÈME DE VALIDATION HYBRIDE
   */
  const validation = useMemo(() => {
    if (!calculationResult) {
      return { isValid: false, score: 0, errors: [], warnings: [], info: [] };
    }
    try {
      return validateAll(calculationResult);
    } catch (e) {
      console.error("❌ Erreur critique lors de la validation :", e);
      return {
        isValid: false,
        score: 0,
        errors: [
          {
            severity: "ERROR" as const,
            category: "SYSTÈME",
            message: "Erreur système",
          },
        ],
        warnings: [],
        info: [], //
      };
    }
  }, [calculationResult]);
  const [debouncedValidation, setDebouncedValidation] = useState(null);

  useEffect(() => {
    // 🔥 Réinitialise à null d'abord pour forcer le rafraîchissement
    setDebouncedValidation(null);

    const timer = setTimeout(() => {
      setDebouncedValidation(validation);
    }, 2000); // 2 secondes au lieu de 1

    return () => clearTimeout(timer);
  }, [validation]);

  // 2️⃣ Gestion du log — anti double
  const lastLoggedResult = useRef("");

  const economyChartData = useMemo(() => {
    const sourceDetails =
      economyChartMode === "financing"
        ? calculationResult.slicedDetails // ✅ CORRECT
        : calculationResult.slicedDetailsCash; // ✅ CORRECT
    return sourceDetails.map((detail, index) => ({
      year: detail.year,
      value: -detail.cashflowDiff,
      type:
        index * 12 < creditDurationMonths && economyChartMode === "financing"
          ? "investment"
          : "profit",
    }));
  }, [
    calculationResult,
    economyChartMode,
    creditDurationMonths,
    projectionYears,
  ]);

  const warranties = useMemo(() => {
    return warrantyMode
      ? [
          {
            years: "À VIE",
            label: "ONDULEUR CENTRALISÉ",
            tag: "Matériel, main-d'œuvre et déplacement",
            icon: Zap,
            description:
              "Garantie totale à vie pièces, main-d'œuvre et déplacement.",
          },
          {
            years: "À VIE",
            label: "STRUCTURE ÉTANCHÉITÉ",
            tag: "Matériel, main-d'œuvre et déplacement",
            icon: Wrench,
            description: "Garantie à vie assurant l'étanchéité de la structure.",
          },
          {
            years: "À VIE",
            label: "MODULES (DÉFAILLANCE)",
            tag: "Matériel, main-d'œuvre et déplacement",
            icon: Sun,
            description:
              "Garantie totale à vie pièces, main-d'œuvre et déplacement.",
          },
          {
            years: "30 ANS",
            label: "MODULES (RENDEMENT)",
            tag: "Matériel",
            icon: ShieldCheck,
            description: "Garantie matérielle de 30 ans contre la sous-performance.",
          },
        ]
      : [
          {
            years: "25 ANS",
            label: "ONDULEUR CENTRALISÉ",
            tag: "Matériel, main-d'œuvre et déplacement",
            icon: Zap,
            description: "Garantie 25 ans pièces, main-d'œuvre et déplacement.",
          },
          {
            years: "10 ANS",
            label: "STRUCTURE ÉTANCHÉITÉ",
            tag: "Matériel, main-d'œuvre et déplacement",
            icon: Wrench,
            description: "Garantie 10 ans assurant l'étanchéité de la structure.",
          },
          {
            years: "25 ANS",
            label: "MODULES (DÉFAILLANCE)",
            tag: "Matériel",
            icon: Sun,
            description: "Garantie matérielle 25 ans en cas de défaillance.",
          },
          {
            years: "25 ANS",
            label: "MODULES (RENDEMENT)",
            tag: "Matériel",
            icon: ShieldCheck,
            description: "Garantie matérielle de 25 ans contre la sous-performance.",
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

  // 🔥 AJOUT : Stress Test Multi-Périodes automatique
  useEffect(() => {
    if (!data?.params || !calculationResult) return;

    // On définit la fonction de calcul pour le testeur
    const testerFn = (inputs: any, years: number) => {
      return calculateSolarProjection(inputs, {
        ...inputs,
        projectionYears: years, // On force la durée du test
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
        buybackRate,
        interestRate,
      });
    };

    // On lance le scan sur 10, 15, 20 et 25 ans
    runPériodeStressTest(data.params, testerFn);
  }, [calculationResult]); // Se relance dès que le résultat principal change
  // --- CALCULS PATRIMOINE RÉELS ---
  const houseAddress = data?.params?.address || "Votre résidence";

  // On récupère la surface saisie (ou 120 par défaut)
  const totalHouseSize = Number(data?.params?.houseSize) || 120;

  // Calculs financiers
  const pricePerM2 = 3200;
  const houseValue = houseSize * pricePerM2;
  const greenValueGain = houseValue * 0.08;

  // On récupère le résultat des économies calculées plus haut dans ton code
  const totalNetSavings = calculationResult.totalSavingsProjected;

  const yearsToDisplay = [5, 10, 20];

  // Gouffre Financier Data - Calcul dynamique
  const gouffreChartData = useMemo(() => {
    const sourceDetails =
      gouffreMode === "financing"
        ? calculationResult.slicedDetails // ✅ CORRECT
        : calculationResult.slicedDetailsCash; // ✅ CORRECT

    return sourceDetails.map((detail) => ({
      year: detail.year,
      cumulativeSpendNoSolar: Math.round(detail.cumulativeSpendNoSolar),
      cumulativeSpendSolar: Math.round(detail.cumulativeSpendSolar),
    }));
  }, [calculationResult, gouffreMode, projectionYears]);

  const handleGenerateStudy = async (
    forcedClientName?: string,
    forcedCommercialEmail?: string,
    forcedClientId?: string,
    forcedClientEmail?: string,
    forcedClientPhone?: string,
    forcedCivility?: string
  ) => {
    console.log("🟢 DÉBUT handleGenerateStudy");
    console.log("🧪 ÉTAT DES PRIX =", {
      installCost,
      remainingToFinance,
      cashApport,
      typeof_installCost: typeof installCost,
    });
    console.log("🔵 PARAMS REÇUS:", {
      forcedClientName,
      forcedCommercialEmail,
      forcedClientId,
      forcedClientEmail,
      forcedClientPhone,
    });

    // ✅ UTILISE UNIQUEMENT LES PARAMÈTRES FORCÉS
    const cleanedClientName = (forcedClientName || "")
      .trim()
      .replace(/\s+/g, " ");

    if (cleanedClientName.length < 2) {
      alert("⚠️ Veuillez entrer le nom du client");
      return;
    }

    const cleanedCommercialEmail = (forcedCommercialEmail || "").trim();

    if (!cleanedCommercialEmail) {
      alert("⚠️ Email commercial manquant");
      return;
    }

    try {
      // ═══════════════════════════════════════════════════════════
      // 🟢 CRÉER OU RÉCUPÉRER LE CLIENT
      // ═══════════════════════════════════════════════════════════
      let clientId: string | null = forcedClientId || null;
      const cleanedEmail = (forcedClientEmail || "").trim().toLowerCase();
      const cleanedPhone = (forcedClientPhone || "").trim();

      console.log("🔵 Données client:", {
        cleanedClientName,
        cleanedEmail,
        cleanedPhone,
      });

      if (!clientId && cleanedEmail) {
        const { data: existingClient, error: findError } = await supabase
          .from("clients")
          .select("id")
          .eq("email", cleanedEmail)
          .maybeSingle();

        if (findError) {
          console.error("❌ Erreur recherche client:", findError);
          alert("❌ Impossible de vérifier le client existant.");
          return;
        }

        if (existingClient?.id) {
          clientId = existingClient.id;
          console.log("✅ Client existant:", clientId);

          // ✅ MISE À JOUR DU NOM DU CLIENT EXISTANT
          const nameParts = cleanedClientName.split(" ");
          const { error: updateError } = await supabase
            .from("clients")
            .update({
              first_name: nameParts[0] || cleanedClientName,
              last_name: nameParts.slice(1).join(" ") || "",
              phone: cleanedPhone || null,
              civility: forcedCivility || "M./Mme",
            })
            .eq("id", clientId);

          if (updateError) {
            console.error("⚠️ Erreur mise à jour client:", updateError);
          } else {
            console.log("✅ Client mis à jour avec:", cleanedClientName);
          }
        } else {
          const nameParts = cleanedClientName.split(" ");
          const { data: newClient, error: clientError } = await supabase
            .from("clients")
            .insert({
              first_name: nameParts[0] || cleanedClientName,
              last_name: nameParts.slice(1).join(" ") || "",
              email: cleanedEmail,
              phone: cleanedPhone || null,
              civility: forcedCivility || "M./Mme",
            })
            .select("id")
            .single();

          if (clientError) {
            console.error("❌ Erreur création client:", clientError);
            alert("❌ Impossible de créer le client : " + clientError.message);
            return;
          }

          if (newClient) {
            clientId = newClient.id;
            console.log("✅ Nouveau client créé:", clientId);
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // 🟢 PAYLOAD ÉTUDE
      // ═══════════════════════════════════════════════════════════
      const payload = {
        n: cleanedClientName,
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
        projectionYears,
        py: projectionYears,
        mode: "financing",
        warrantyMode: warrantyMode ? "performance" : "essential",

        // ✅ Données calculées (résumé)
        breakEven:
          calculationResult.paybackYear ||
          calculationResult.breakEvenPoint ||
          12,
        averageYearlyGain: Math.round(
          (calculationResult.totalSavingsProjected || 0) / projectionYears
        ),
        totalSpendNoSolar: Math.round(calculationResult.totalSpendNoSolar || 0),
        totalSpendSolar: Math.round(calculationResult.totalSpendSolar || 0),
        greenValue: Math.round(
          (yearlyProduction || 7000) * projectionYears * 0.5
        ),
        ga: calculationResult.yearlyGains || [],

        // ✅ DÉTAILS ANNÉE PAR ANNÉE (CRITIQUE !)
        details: calculationResult.details.map((d) => ({
          year: d.year,
          cumulativeSpendNoSolar: Math.round(d.cumulativeSpendNoSolar || 0),
          cumulativeSpendSolar: Math.round(d.cumulativeSpendSolar || 0),
          edfBillWithoutSolar: Math.round(d.edfBillWithoutSolar || 0),
          creditPayment: Math.round(d.creditPayment || 0),
          edfResidue: Math.round(d.edfResidue || 0),
          totalWithSolar: Math.round(d.totalWithSolar || 0),
          cumulativeSavings: Math.round(d.cumulativeSavings || 0),
        })),

        detailsCash: calculationResult.detailsCash.map((d) => ({
          year: d.year,
          cumulativeSpendNoSolar: Math.round(d.cumulativeSpendNoSolar || 0),
          cumulativeSpendSolar: Math.round(d.cumulativeSpendSolar || 0),
          cumulativeSavings: Math.round(d.cumulativeSavings || 0),
          edfBillWithoutSolar: Math.round(d.edfBillWithoutSolar || 0),
          edfResidue: Math.round(d.edfResidue || 0),
          totalWithSolar: Math.round(d.totalWithSolar || 0),
        })),
      };

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // ═══════════════════════════════════════════════════════════
      // 📊 INSERTION ÉTUDE
      // ═══════════════════════════════════════════════════════════

      // 🔒 SÉCURITÉS AVANT INSERT (évite les erreurs SQL aléatoires)
      if (!payload || typeof payload !== "object") {
        alert("❌ Données étude invalides (payload).");
        return;
      }

      if (!cleanedClientName) {
        alert("❌ Nom client manquant.");
        return;
      }

      if (!cleanedCommercialEmail) {
        alert("❌ Email commercial manquant.");
        return;
      }

      if (!paymentType) {
        alert("❌ Mode de paiement non défini.");
        return;
      }

      if (hasDeposit === undefined || hasDeposit === null) {
        alert("❌ Statut d'acompte non défini.");
        return;
      }

      if (!Number.isFinite(Number(installCost))) {
        alert("❌ Prix total invalide.");
        return;
      }

      const safeTotalPrice = Number(installCost);
      const safeCashApport = Number(cashApport) || 0;

      let paymentMode: string;
      let financingMode: string;

      if (safeCashApport >= safeTotalPrice && safeTotalPrice > 0) {
        // Apport = Total → CASH obligatoire
        paymentMode = "cash";
        financingMode = "cash_payment";
      } else if (safeCashApport > 0) {
        // Apport partiel → FINANCING avec apport
        paymentMode = "financing";
        financingMode = "partial_financing";
      } else {
        // Pas d'apport → FINANCING complet
        paymentMode = "financing";
        financingMode = "full_financing";
      }

      console.log("🧪 INSERT FINAL =", {
        study_data: payload,
        expires_at: expiresAt,
        client_name: cleanedClientName,
        commercial_email: cleanedCommercialEmail,
        payment_type: paymentType,
        has_deposit: hasDeposit,
        total_price: safeTotalPrice,
        payment_mode: paymentMode,
        financing_mode: financingMode,
      });

      const result = await supabase
        .from("studies")
        .insert({
          // 🔴 COLONNES NOT NULL (OBLIGATOIRES)
          study_data: payload,
          expires_at: expiresAt.toISOString(),
          client_name: cleanedClientName,
          commercial_email: cleanedCommercialEmail,
          payment_type: String(paymentType),
          has_deposit: Boolean(hasDeposit),
          total_price: safeTotalPrice,

          // 🟢 AUTRES COLONNES
          client_id: clientId,
          client_email: cleanedEmail || null,
          client_phone: cleanedPhone || null,
          commercial_name: null,
          is_active: true,
          status: "draft",

          cash_apport: safeCashApport,
          payment_mode: paymentMode,
          financing_mode: financingMode,

          deposit_amount: hasDeposit ? Number(depositAmount) : null,
        })
        .select()
        .single();

      console.log("🟥 INSERT STUDY RESULT =", result);

      if (result.error || !result.data) {
        alert("❌ ERREUR SUPABASE : " + result.error?.message);
        console.error("❌ SUPABASE ERROR FULL =", result.error);
        return;
      }

      // ✅ ID OFFICIEL SUPABASE
      const realStudyId = result.data.id;

      // ✅ URL guest basée sur le TOKEN (et non l'ID) pour matcher avec GuestView
      const guestToken = result.data.guest_view_token || result.data.id;
      const guestUrl = `${window.location.origin}/guest/${guestToken}`;

      console.log("✅ ÉTUDE CRÉÉE AVEC SUCCÈS:", realStudyId);

      // ✅ on stocke l'id pour le bouton SIGNÉ
      setCurrentStudyId(realStudyId);
      setStudyStatus("draft"); // ✅ Badge status

      // ═══════════════════════════════════════════════════════════
      // 🔗 UPDATE guest_view_url (RESTE EN DRAFT)
      // ═══════════════════════════════════════════════════════════

      const { data: updateResult, error: updateError } = await supabase
        .from("studies")
        .update({
          guest_view_url: guestUrl,
          // ❌ PLUS DE status: "sent" automatique
          // ✅ L'étude reste en "draft" jusqu'à action manuelle
        })
        .eq("id", realStudyId)
        .select(); // ← AJOUTÉ pour voir le résultat

      console.log("🔵 UPDATE RESULT:", updateResult);
      console.log("🔵 UPDATE ERROR:", updateError);

      if (updateError) {
        console.error(
          "❌ ERREUR COMPLÈTE:",
          JSON.stringify(updateError, null, 2)
        );
        alert(`⚠️ L'étude a été créée mais le passage en 'sent' a échoué.

Erreur: ${updateError.message}

Changez le status manuellement en 'sent' dans Supabase.`);
      } else {
        console.log(
          "✅ Étude passée en 'sent' - Emails post-refus programmés (J+0, J+1, J+4, J+7)"
        );

        // Attendre 1 seconde pour que le trigger s'exécute
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Vérification que les emails ont bien été créés
        const { data: emailCheck, error: emailError } = await supabase
          .from("email_queue")
          .select("email_type, status, scheduled_for")
          .eq("study_id", realStudyId)
          .order("scheduled_for");

        console.log("📧 EMAILS CRÉÉS:", emailCheck);

        if (emailCheck && emailCheck.length > 0) {
          console.log(`✅ ${emailCheck.length} emails programmés avec succès`);
        } else {
          console.warn(
            "⚠️ Aucun email créé - Le trigger n'a peut-être pas fonctionné"
          );
          alert(
            "⚠️ L'étude est en 'sent' mais aucun email n'a été programmé automatiquement."
          );
        }
      }

      // ═══════════════════════════════════════════════════════════
      // 🟢 UI
      // ═══════════════════════════════════════════════════════════
      setEncodedUrl(guestUrl);
      setGeneratedLink(guestUrl);
      setShowQRCode(true);

      alert(
        `✅ Étude générée avec succès !
ID: ${realStudyId}
Client ID: ${clientId}
Expire le: ${expiresAt.toLocaleDateString("fr-FR")}

📧 4 emails post-refus programmés automatiquement`
      );
    } catch (error: any) {
      console.error("❌ Erreur catch:", error);
      alert(`❌ Erreur lors de la génération de l'étude.\n\n${error.message}`);
      setShowNamePopup(false);
    }
  };

  // --- MOTEUR DE CERTIFICATION DYNAMIQUE (Renommé pour éviter le conflit) ---
  const certificationData = useMemo(() => {
    // On définit les checks avec des valeurs de secours (fallback)
    const checks = [
      {
        id: "consos",
        label: "Cohérence des factures de référence",
        status: data?.computed?.monthlyBill > 0 ? "valid" : "error",
        detail: data?.computed?.monthlyBill
          ? `${Math.round(data.computed.monthlyBill)}€/mois analysés`
          : "Analyse en cours...",
      },
      {
        id: "meteo",
        label: "Gisement solaire (PVGIS 5.2)",
        status: yearlyProduction > 0 ? "valid" : "error",
        detail: `${yearlyProduction || 7000} kWh/an identifiés`,
      },
      {
        id: "fiscal",
        label: "Conformité fiscale (TVA & Aides)",
        status: "valid",
        detail: "TVA 5.5% & Prime Autoconsommation 2025",
      },
      {
        id: "roi",
        label: "Algorithme TRI & Rentabilité",
        status: "valid",
        detail: `Rentabilité : ${calculationResult?.roiPercentageCash || 6.5}%`,
      },
      {
        id: "technique",
        label: "Normes NFC 15-712-1",
        status: "valid",
        detail: "Conformité coffret AC/DC Protection",
      },
      {
        id: "patrimoine",
        label: "Audit Valeur Verte (DVF Notaires)",
        status: "valid",
        detail: greenValueData?.city
          ? `Localité : ${greenValueData.city}`
          : "Estimation régionale",
      },
    ];

    // On calcule le score en fonction du nombre de tests réussis
    const validCount = checks.filter((c) => c.status === "valid").length;
    const dynamicScore = Math.round((validCount / checks.length) * 100);

    return {
      allChecks: checks,
      score: dynamicScore, // Le score grimpera en même temps que tes lignes vertes
    };
  }, [data, yearlyProduction, calculationResult, greenValueData]);
  // --- ÉTAT POUR TA CASE À COCHER D'EXPERT ---
  const [expertValidated, setExpertValidated] = useState(false);
  const handleValidation = () => {
    // 1. On coche visuellement la case
    setExpertValidated(true);

    // 2. On attend 800ms (pour l'effet waouh) avant de changer d'écran
    // 2. On attend 800ms (pour l'effet waouh) avant de changer d'écran
    setTimeout(() => {
      // On change l'état ici (assurez-vous que setStep existe dans vos props ou votre état)
      setStep("coach");
    }, 800);
  };

  // 👉 profil issu de ton quiz SpeechView
  // const [profile || "senior", setProfile] = useState<"senior" | "banquier" | "standard">("standard");

  // --- LE MOTEUR DE SCAN RALENTI ---
  useEffect(() => {
    setIsScanning(true);
    setVisibleChecks(0);

    const totalTests = 7; // ✅ FIXE : toujours 7 lignes
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      setVisibleChecks(currentIndex);

      // ✅ CORRECTION : on continue jusqu'à 7 INCLUS
      if (currentIndex >= totalTests) {
        clearInterval(interval);
        // ✅ Petit délai avant de terminer le scan
        setTimeout(() => {
          setIsScanning(false);
        }, 800);
      }
    }, 1200); // ✅ 1.2 secondes entre chaque ligne (timing professionnel)

    return () => clearInterval(interval);
  }, []); // ✅ Se lance une seule fois au montage

  // ============================================
  // ROUTAGE SIMPLE QUIZZ → AUDIT → BILAN
  // ============================================
  // 🔐 Jail visuelle — coach visible uniquement sur écran conseiller
  const CoachJail = ({ children }: { children: React.ReactNode }) => {
    const params = new URLSearchParams(window.location.search);
    const isClientDisplay = params.get("display") === "client";

    // Masquer si assistance OFF OU si c'est l'écran client
    if (isCoachDisabled || isClientDisplay) return null;

    return <>{children}</>;
  };

  if (!calculationResult) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 animate-pulse">Chargement...</div>
      </div>
    );
  }
  const rows =
    tableScenario === "financing"
      ? calculationResult.details
      : calculationResult.detailsCash;

  const breakEvenRow = rows.find((r) => r.cumulativeSavings >= 0);
  const breakEvenYear = breakEvenRow?.year;

  const finalGain = rows[projectionYears - 1]?.cumulativeSavings || 0;

  const initialInvestment =
    tableScenario === "financing" ? cashApport : installCost;

  const roiPercent =
    initialInvestment > 0
      ? ((finalGain / initialInvestment) * 100).toFixed(0)
      : 0;
  // 🧭 RENDER PRINCIPAL avec étapes

  // 3️⃣ BILAN / DASHBOARD COMPLET
  // (ici on laisse ton code existant inchangé)

  // --------------------------------------------
  // 🎯 Étape 2 — Dashboard complet actif
  // --------------------------------------------
  return (
    <div className="w-full">
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div 
            onClick={() => {
                setClickCount(prev => prev + 1);
                if (clickCount >= 4) { // Au 5ème clic
                setShowConfig(true);
                setClickCount(0);
                }
            }}
            className="bg-gradient-to-br from-orange-400 to-orange-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.5)] cursor-pointer hover:scale-105 transition-transform"
          >
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
          {/* 🛡️ BADGE CERTIFICATION */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <ShieldCheck 
                size={14} 
                className={complianceScore === 100 ? "text-emerald-500" : (complianceScore > 50 ? "text-orange-500" : "text-red-500")} 
            />
            <span className={`text-xs font-bold tabular-nums ${complianceScore === 100 ? "text-emerald-500" : (complianceScore > 50 ? "text-orange-500" : "text-red-500")}`}>
              {complianceScore}%
            </span>
            {complianceScore < 100 && (
                 <AlertTriangle size={12} className="text-red-500 animate-pulse ml-1" />
            )}
             <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Certifié</span>
          </div>
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
          {/* 🛑 BOUTON PANIC — ARRÊT TOTAL DU COACH */}
          <button
            onClick={() => setIsCoachDisabled((v) => !v)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider
             text-slate-400 hover:text-white
             bg-transparent border border-white/10
             hover:border-white/30
             transition-all"
          >
            {isCoachDisabled ? "ASSISTANCE ON" : "ASSISTANCE OFF"}
          </button>
        </div>
      </nav>

      {/* MASQUÉ - Bug d'affichage, voir console pour validation */}
      {/* 
  <div className="mt-20 px-4">
    {debouncedValidation && (
      <ValidationQualityPanel validation={debouncedValidation} />
    )}
  </div>
  */}
      {/* ============================= */}
      {/* 🔐 COACH — ÉCRAN CONSEILLER UNIQUEMENT */}
      {/* ============================= */}
      <>
        {!isCoachDisabled && (
          <>
            {/* 🔴 Popups STOP */}
            {popup === "STOP_XYEARS" && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
                <div className="bg-red-600 text-white p-8 rounded-2xl shadow-2xl text-center max-w-lg w-full text-2xl font-black">
                  🚨 STOP – Zone financière anxiogène
                  <p className="text-white/80 text-sm mt-2 text-center">
                    Profil Senior → interdiction d’ouvrir ce module.
                  </p>
                  <button
                    onClick={() => setPopup(null)}
                    className="mt-6 px-6 py-3 bg-white text-red-700 font-bold rounded-xl"
                  >
                    OK – revenir
                  </button>
                </div>
              </div>
            )}

            {/* 🚨 Alertes coach */}
            <AlertPopup
              alert={activeAlert || silenceAlert}
              onDismiss={activeAlert ? dismissAlert : dismissSilenceAlert}
              onAction={(action) =>
                activeAlert ? handleAlertAction(action) : dismissSilenceAlert()
              }
            />

            {/* 🎉 Fin parcours */}
            {showCompletion && (
              <CompletionScreen onClose={() => setShowCompletion(false)} />
            )}

            {/* 🧠 HUD ou PANEL — JAMAIS LES DEUX */}
            {/* 🧹 Coach Legacy Removed */}

            {/* 🔔 Notifications étapes */}
            {stepNotification && (
              <StepNotification
                step={stepNotification.step}
                message={stepNotification.message}
                onConfirm={confirmStep}
                onDismiss={() => {}}
              />
            )}
          </>
        )}
      </>

      <main className="w-full pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-8 transition-all duration-500 overflow-x-hidden">
        {/* 🧠 AGENT ZERO STYLES */}
        {agentDecision && (
          <style>
            {`
              /* 🧠 TEMPO */
              :root { --agent-anim-speed: ${agentDecision.presentationTempo === 'slow' ? '1.2s' : '0.4s'}; }
              * { transition-duration: var(--agent-anim-speed) !important; }

              /* 🧠 SCARCITY */
              ${agentDecision.enableScarcity === false ? `
                #badge-garantie, .scarcity-element { display: none !important; }
              ` : ''}

              /* 🧠 MODULE ORDER */
              ${agentDecision.moduleOrder?.map((id: string, index: number) => `
                #${id} { order: ${index + 10}; }
              `).join('\n')}
              
              /* Default order for unlisted modules */
              .module-section { order: 999; }
            `}
          </style>
        )}
        {/* ✅ MODAL PARAMÈTRES - DÉPLACÉE ICI POUR ÊTRE TOUJOURS ACCESSIBLE */}
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
                  <div>
                    <ParamCard
                      label="Taux d'Autoconsommation (%)"
                      value={selfConsumptionRate}
                      setValue={setSelfConsumptionRate}
                      step={1}
                      min={0}
                      max={100}
                      unit="%"
                      icon={<TrendingUp size={14} className="text-emerald-400" />}
                      sublabel={`${Math.round(
                        yearlyProduction * (selfConsumptionRate / 100)
                      )} kWh autoconsommés sur ${formatNum(
                        yearlyProduction
                      )} kWh produits`}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setSelfConsumptionRate(50)}
                        className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                          selfConsumptionRate === 50
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow"
                            : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }`}
                      >
                        50% (Sans batterie)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelfConsumptionRate(100)}
                        className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                          selfConsumptionRate === 100
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow"
                            : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }`}
                      >
                        100% (Avec batterie 6,9 kWh)
                      </button>
                    </div>
                  </div>

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

                {/* Prix de rachat EDF */}
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

                {/* Prime à l'Autoconsommation (0,08 €/Wc versé à 12 mois) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <ParamCard
                    label="Taux Prime Autoconsommation (€/Wc)"
                    value={primeRatePerWatt}
                    setValue={(val) => {
                      setPrimeRatePerWatt(val);
                      setPrimeAmount(Math.round((installedPower || 0) * 1000 * val));
                    }}
                    unit="€/Wc"
                    sublabel="0,08 € / Wc (versé à 12 mois)"
                    icon={<Coins size={14} className="text-emerald-400" />}
                    step={0.01}
                    min={0}
                  />

                  <div className="bg-black/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
                          Prime versée (à 12 mois)
                        </p>
                        <p className="text-2xl font-black text-white">
                          {formatMoney(primeAmount)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {((installedPower || 0) * 1000).toLocaleString("fr-FR")} Wc × {primeRatePerWatt.toFixed(2)} €/Wc
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        Mois 12
                      </span>
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

                {/* Niveau de Garanties */}
                <div className="bg-black/20 border border-blue-500/20 rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={18} className="text-blue-400" />
                      <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                        Garanties
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        warrantyMode
                          ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/30"
                      }`}
                    >
                      {warrantyMode ? "Option Performance" : "Option Essentiel+"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option Essentiel+ */}
                    <button
                      type="button"
                      onClick={() => setWarrantyMode(false)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        !warrantyMode
                          ? "bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-950/20"
                          : "bg-black/30 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!warrantyMode}
                        onChange={() => setWarrantyMode(false)}
                        className="mt-1 w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          Essentiel+
                          {!warrantyMode && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
                              Sélectionné
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          Onduleur 25 ans, étanchéité 10 ans, modules 25 ans + Service bilan.
                        </p>
                      </div>
                    </button>

                    {/* Option Performance */}
                    <button
                      type="button"
                      onClick={() => setWarrantyMode(true)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        warrantyMode
                          ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-950/20"
                          : "bg-black/30 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={warrantyMode}
                        onChange={() => setWarrantyMode(true)}
                        className="mt-1 w-4 h-4 accent-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          Performance
                          {warrantyMode && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-semibold">
                              Sélectionné
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          À vie (onduleur, étanchéité, défaillance modules) + 30 ans rendement + Bilan.
                        </p>
                      </div>
                    </button>
                  </div>
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
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Lock
                              size={14}
                              className={
                                interestRate < 3.5
                                  ? "text-emerald-500"
                                  : "text-slate-500"
                              }
                            />
                            <span className="text-[10px] font-black uppercase text-slate-400">
                              Code de Validation
                            </span>
                          </div>
                          {interestRate < 3.5 && (
                            <span className="text-[10px] font-black text-emerald-500 animate-pulse">
                              ✓ VALIDÉ ({interestRate}%)
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={codeInput}
                            placeholder="CODE..."
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-blue-400 outline-none focus:border-blue-500 uppercase font-mono"
                            onChange={(e) => setCodeInput(e.target.value)}
                          />

                          <button
                            onClick={handleCodeValidation}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg uppercase text-xs transition-all active:scale-95 flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} />
                            VALIDER
                          </button>
                        </div>

                        {codeValidated && (
                          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 font-semibold mb-3">
                              ✅ Code validé ! Choisissez la durée :
                            </p>

                            <select
                              value={selectedDuration}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSelectedDuration(val);
                              }}
                              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white"
                            >
                              {interestRate === 0.99 && (
                                <>
                                  <option value={60}>5 ans (60 mois)</option>
                                  <option value={84}>7 ans (84 mois)</option>
                                </>
                              )}

                              {interestRate === 1.99 && (
                                <>
                                  <option value={72}>6 ans (72 mois)</option>
                                  <option value={84}>7 ans (84 mois)</option>
                                  <option value={120}>10 ans (120 mois)</option>
                                  <option value={180}>15 ans (180 mois)</option>
                                </>
                              )}

                              {interestRate === 3.89 && (
                                <>
                                  <option value={120}>10 ans (120 mois)</option>
                                  <option value={180}>15 ans (180 mois)</option>
                                  <option value={240}>20 ans (240 mois)</option>
                                </>
                              )}
                            </select>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <ParamCard
                          label="Taux d'intérêt (%)"
                          value={interestRate}
                          setValue={(val) => {
                            setInterestRate(val);
                            setCreditInterestRate(val);
                          }}
                          step={0.01}
                          unit="%"
                          icon={
                            <CheckCircle2
                              size={14}
                              className="text-emerald-400"
                            />
                          }
                          sublabel="Taux annuel du crédit"
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
                          sublabel="Taux annuel"
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
                            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1 text-left">
                              Calcul Automatique
                            </h4>
                            <div className="flex gap-8">
                              <div>
                                <p className="text-[10px] text-emerald-200/60 uppercase font-bold text-left">
                                  Mensualité
                                </p>
                                <p className="text-xl font-black text-white">
                                  {formatMoney(projectedMonthlyLoan)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-emerald-200/60 uppercase font-bold text-left">
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

        {step === "coach" ? (
          <>
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

            {/* ============================================
            MODULE 2 : PROTOCOLE D'AUDIT TECHNIQUE ET FINANCIER
            ============================================ */}

            <ModuleSection
              id="protocole"
              title="ÉTAPE 1 : PROTOCOLE D'AUDIT TECHNIQUE ET FINANCIER"
              icon={
                <ShieldCheck
                  className={
                    isScanning
                      ? "animate-spin text-emerald-500"
                      : "text-emerald-500"
                  }
                />
              }
              defaultOpen={false}
              onOpen={(id) => {
                handleModuleChange(id);
              }}
            >
              <div className="bg-[#05080a] border-2 border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                {/* HEADER : STYLE RAPPORT OFFICIEL */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-white/10 pb-6 relative z-10">
                  <div className="text-left">
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-2">
                      AUDIT DE CONFORMITÉ{" "}
                      <span className="text-emerald-500">SYSTÈME v2.4</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.3em]">
                      Certification Algorithmique EDF Solutions Solaires
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-black/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">
                        Indice de Fiabilité
                      </div>
                      <div className="text-4xl font-black text-white font-mono">
                        {Math.round((visibleChecks / 7) * 100)}%
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isScanning
                            ? "bg-orange-500 animate-ping"
                            : "bg-emerald-500 shadow-[0_0_15px_#10b981]"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* LISTE DE VÉRIFICATION EXHAUSTIVE */}
                <div className="space-y-3 mb-8 relative z-10">
                  {[
                    {
                      label: "Analyse des factures & Profil de consommation",
                      val: `${Math.round(
                        data?.computed?.monthlyBill || 208
                      )}€/mois`,
                      detail:
                        "Vérification des paliers d'abonnement et historique sur 12 mois.",
                      testStatus: "✓ 49/49 tests passed",
                      testDetail: "5 suites • 100% success",
                    },
                    {
                      label: "Gisement solaire & Masques d'ombrage",
                      val: `${yearlyProduction || 7000} kWh/an`,
                      detail:
                        "Calcul d'irradiation héliométrique via données satellites PVGIS 5.2.",
                      testStatus: "✓ Répartition OK",
                      testDetail: "Integration validated",
                    },
                    {
                      label: "Audit Patrimonial & Valeur Verte",
                      val: `+${greenValueData?.value || 30720}€`,
                      detail:
                        "Évaluation de la plus-value immobilière certifiée base DVF Notaires.",
                      testStatus: "✓ Patrimoine vérifié",
                      testDetail: "Dashboard complete",
                    },
                    {
                      label: "Rentabilité (TRI) & Cash-Flow",
                      val: `${calculationResult?.roiPercentageCash || 6.52}%`,
                      detail:
                        "Modélisation financière incluant amortissement et réinvestissement.",
                      testStatus: "✓ ROI & Break-even",
                      testDetail: "40 test cases",
                    },
                    {
                      label: "Conformité Fiscale & Éligibilité Aides",
                      val: "TVA 5.5%",
                      detail:
                        "Validation Prime à l'autoconsommation et cadre Loi de Finance 2025.",
                      testStatus: "✓ Modules admin",
                      testDetail: "Budget & Process",
                    },
                    {
                      label: "Sécurité Électrique & Normes NFC",
                      val: "NFC 15-712-1",
                      detail:
                        "Vérification des protections parafoudre et dimensionnement des câbles.",
                      testStatus: "✓ UI Components",
                      testDetail: "Open/close tested",
                    },
                    {
                      label: "Résilience Énergie & Inflation",
                      val: "Indexation 5%",
                      detail:
                        "Scénario de protection contre la hausse des tarifs régulés (25 ans).",
                      testStatus: "✓ Taux spéciaux",
                      testDetail: "0.99% conditional",
                    },
                  ].map((check, idx) => {
                    const isPast = idx < visibleChecks;
                    const isCurrent = idx === visibleChecks;

                    return (
                      <div
                        key={idx}
                        className={`group transition-all duration-700 ${
                          idx <= visibleChecks ? "opacity-100" : "opacity-10"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 px-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-sm rotate-45 transition-colors ${
                                isPast ? "bg-emerald-500" : "bg-slate-700"
                              }`}
                            />
                            <span className="text-xs font-bold text-white uppercase tracking-tight">
                              {check.label}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-black text-emerald-500">
                            {isPast ? check.val : "---"}
                          </span>
                          {idx < visibleChecks && (
                            <span className="text-[10px] text-emerald-400 font-mono ml-2">
                              ✔︎
                            </span>
                          )}
                        </div>

                        {/* BARRE TECHNIQUE */}
                        <div className="relative h-6 bg-white/5 rounded-md border border-white/5 overflow-hidden flex items-center px-3">
                          <div
                            className={`absolute left-0 top-0 h-full bg-emerald-500/10 transition-all duration-[1000ms] ${
                              isPast
                                ? "w-full border-r border-emerald-500"
                                : isCurrent
                                ? "w-1/2 animate-pulse"
                                : "w-0"
                            }`}
                          />
                          <span className="relative z-10 text-[9px] text-slate-500 font-medium italic truncate">
                            {isPast ? check.detail : "Attente de validation..."}
                          </span>
                          {isPast && (
                            <CheckCircle2
                              size={12}
                              className="ml-auto text-emerald-500 relative z-10"
                            />
                          )}
                        </div>

                        {/* LIGNE DE TEST */}
                        {isPast && (
                          <div className="mt-1.5 px-2 flex items-center justify-between text-[8px]">
                            <span className="text-emerald-400/60 font-mono">
                              {check.testStatus}
                            </span>
                            <span className="text-slate-600 font-mono italic">
                              {check.testDetail}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* VALIDATION TERRAIN */}
                {!isScanning && (
                  <div className="mt-8 p-6 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-white uppercase italic">
                          Certification de Visite Technique
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          En tant qu'expert conseil, je valide par la présente
                          la faisabilité technique du projet suite à l'examen de
                          la toiture, du tableau électrique et de l'exposition
                          réelle.
                        </p>
                      </div>

                      <button
                        onClick={handleValidation}
                        className={`flex items-center gap-4 px-8 py-5 rounded-xl font-black uppercase tracking-tighter transition-all duration-500 group ${
                          expertValidated
                            ? "bg-emerald-500 text-black scale-105 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                            : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            expertValidated
                              ? "bg-black border-black"
                              : "border-white/30"
                          }`}
                        >
                          {expertValidated && (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500"
                            />
                          )}
                        </div>
                        {expertValidated
                          ? "PROJET CERTIFIÉ PAR L'EXPERT"
                          : "VALIDER L'AUDIT SUR SITE"}
                      </button>
                    </div>
                  </div>
                )}

                {/* FOOTER TECHNIQUE */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-40 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                  <div>
                    ID_SCAN:{" "}
                    {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-emerald-500">49/49</span>
                    </div>
                    <span className="text-slate-700">|</span>
                    <span>© EDF 2025</span>
                  </div>
                </div>
              </div>
            </ModuleSection>
            {/* FIN DU STEP "COACH" */}
          </>
        ) : (
          /* --- CE QUI S'AFFICHE APRÈS LE CLIC SUR LE BOUTON --- */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="bg-[#05080a] border border-blue-500/20 p-20 rounded-[40px] text-center shadow-2xl">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <TrendingUp className="text-blue-400 w-10 h-10" />
              </div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">
                Bilan Energétique <span className="text-blue-500">Prêt</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
                L'audit est validé. Les projections d'économies sont
                disponibles.
              </p>
              <button
                onClick={() => setStep("coach")}
                className="px-8 py-3 bg-white/5 text-slate-500 rounded-xl text-xs font-bold hover:text-white"
              >
                ← REVENIR À L'AUDIT
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 🟢 TUNNEL DÉCISIONNEL — 10 MODULES                      */}
        {/* ═══════════════════════════════════════════════════════ */}

        {/* ============================================
        MODULE 1 : SÉCURITÉ EDF - GROUPE D'ÉTAT
        ============================================ */}

        <ModuleSection
          id="securite-edf-groupe"
          title="Sécurité EDF – Groupe d'État"
          icon={<ShieldCheck className="text-emerald-500" />}
          defaultOpen={false}
        >
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 bg-emerald-500/5 blur-[120px]" />

            <div className="relative z-10 mb-10 flex items-center gap-6 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950/30 to-slate-900/30 p-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-2xl">
                  <span className="text-2xl font-black text-[#00008f]">
                    EDF
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black/40 bg-emerald-600">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-white">
                    GROUPE EDF SOLUTIONS SOLAIRES
                  </h3>

                  <InfoPopup title={INFO_MODULE1.cadreEDF[activeProfile].title}>
                    {INFO_MODULE1.cadreEDF[activeProfile].body}
                  </InfoPopup>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-300">
                    100% Public
                  </span>

                  <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase text-emerald-300">
                    Contrôlé par l'État
                  </span>

                  <span className="flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase text-purple-300">
                    Continuité garantie par l'État
                    <InfoPopup
                      title={INFO_MODULE1.zeroFaillite[activeProfile].title}
                    >
                      {INFO_MODULE1.zeroFaillite[activeProfile].body}
                    </InfoPopup>
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                <h4 className="mb-4 flex items-center gap-3 font-black uppercase text-white">
                  <FileText size={22} className="text-blue-400" />
                  Contrat protégé
                  <InfoPopup title={INFO_MODULE1.contrat[activeProfile].title}>
                    {INFO_MODULE1.contrat[activeProfile].body}
                  </InfoPopup>
                </h4>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✔ 14 jours de rétractation légale</li>
                  <li>✔ Aucun versement avant démarrage</li>
                  <li>✔ Protection Code de la consommation</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                <h4 className="mb-4 flex items-center gap-3 font-black uppercase text-white">
                  <Award size={22} className="text-yellow-400" />
                  Installateurs certifiés
                </h4>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✔ Certification RGE QualiPV</li>
                  <li>✔ Assurance décennale active</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                <h4 className="mb-4 flex items-center gap-3 font-black uppercase text-white">
                  <Zap size={22} className="text-purple-400" />
                  Raccordement sécurisé
                </h4>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✔ Contrat EDF OA garanti 20 ans</li>
                  <li>✔ Inscription registre ENEDIS</li>
                  <li>✔ Prix de rachat fixé par l'État</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                <h4 className="mb-4 flex items-center gap-3 font-black uppercase text-white">
                  <Coins size={22} className="text-emerald-400" />
                  Aides sécurisées
                  <InfoPopup title={INFO_MODULE1.aides[activeProfile].title}>
                    {INFO_MODULE1.aides[activeProfile].body}
                  </InfoPopup>
                </h4>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✔ Versement direct par l'État</li>
                  <li>✔ Prime autoconsommation garantie</li>
                  <li>✔ Payable 12 mois après l'installation</li>
                </ul>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================
        MODULE 2 : ENGAGEMENT EDF - RISQUE COUVERT
        FONCTION : Couvrir le RISQUE sans pression
        TIMING : Juste après la crédibilité
        ============================================ */}

        <ModuleSection
          id="engagement-risque-admin"
          title="Engagement EDF – Risque administratif couvert"
          icon={<Lock className="text-emerald-500" />}
          defaultOpen={false}
        >
          <div className="space-y-6">
            {/* BLOC PRINCIPAL : ENGAGEMENT RISQUE */}
            <div className="bg-gradient-to-r from-emerald-950/20 to-green-950/20 border-2 border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="text-emerald-400" size={28} />
                </div>

                <div className="flex-1">
                  {/* TITRE + INFOBULLE 2.1 */}
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                      ENGAGEMENT EDF – RISQUE ADMINISTRATIF COUVERT
                    </h4>

                    <InfoPopup
                      title={INFO_MODULE2.engagement[activeProfile].title}
                    >
                      {INFO_MODULE2.engagement[activeProfile].body}
                    </InfoPopup>
                  </div>

                  {/* MESSAGE PRINCIPAL */}
                  <div className="bg-black/40 rounded-lg p-4 mb-4">
                    <p className="text-lg text-emerald-300 font-bold leading-relaxed">
                      Si un blocage administratif empêche l'installation (refus
                      mairie, ABF, ENEDIS, ou autre),{" "}
                      <span className="text-white text-xl">
                        aucun paiement n'est exigible
                      </span>
                      {/* INFOBULLE 2.2 */}
                      <InfoPopup
                        title={INFO_MODULE2.paiement[activeProfile].title}
                        className="ml-2 inline-flex"
                      >
                        {INFO_MODULE2.paiement[activeProfile].body}
                      </InfoPopup>
                    </p>
                  </div>

                  {/* 4 GARANTIES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-slate-300">
                        Aucun paiement avant validation complète du dossier
                        administratif
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-slate-300">
                        Annulation gratuite en cas de refus d'une autorisation
                        administrative
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-slate-300">
                        Accompagnement juridique inclus dans le contrat EDF
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-slate-300 flex items-center gap-1">
                        Prise en charge totale garantie EDF de toutes les
                        démarches
                        {/* INFOBULLE 2.3 */}
                        <InfoPopup
                          title={
                            INFO_MODULE2.priseEnCharge[activeProfile].title
                          }
                        >
                          {INFO_MODULE2.priseEnCharge[activeProfile].body}
                        </InfoPopup>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOC PLANNING (FACTUEL, BASSE PRESSION) */}
            <div className="bg-slate-950/40 border border-slate-700/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-700/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="text-slate-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-300 mb-2">
                    PLANNINGS D'INSTALLATION
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Votre secteur (06 - Alpes-Maritimes) : équipes RGE actives.
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Délai moyen actuel :{" "}
                    <span className="text-white font-semibold">
                      6-8 semaines
                    </span>{" "}
                    après validation administrative.
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Une fois validé, votre dossier est transmis au coordinateur
                    régional EDF.
                  </p>
                </div>
              </div>
            </div>

            {/* ANCRAGE POST-DÉCISION */}
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Ce projet est validé selon les mêmes standards que les
                installations réalisées par EDF depuis plus de 25 ans chez des
                particuliers et des collectivités.
              </p>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================
        MODULE 3 : PRISE EN CHARGE ADMINISTRATIVE
        FONCTION : Expliquer le PROCESSUS sans surcharger
        TIMING : Après crédibilité + risque
        ============================================ */}

        <ModuleSection
          id="prise-en-charge-admin"
          title="Prise en charge administrative"
          icon={<ClipboardCheck className="text-blue-500" />}
          defaultOpen={false}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 blur-[120px]" />

            {/* MESSAGE PRINCIPAL - CLÉ */}
            <div className="relative z-10 mb-8 p-6 bg-gradient-to-r from-blue-950/30 to-slate-900/30 border-l-4 border-blue-500/50 rounded-r-2xl">
              <div className="flex items-start gap-4">
                <ShieldCheck
                  className="text-blue-400 mt-1 flex-shrink-0"
                  size={24}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white text-lg font-black uppercase tracking-tight">
                      EDF GÈRE L'ENSEMBLE DU VOLET ADMINISTRATIF ET
                      RÉGLEMENTAIRE
                    </h4>

                    {/* INFOBULLE 3.1 */}
                    <InfoPopup title={INFO_MODULE3.cadre[activeProfile].title}>
                      {INFO_MODULE3.cadre[activeProfile].body}
                    </InfoPopup>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    Vous n'avez rien à remplir, rien à suivre. Chaque étape est
                    prise en main par EDF et validée par vous uniquement lorsque
                    c'est nécessaire.
                  </p>
                </div>
              </div>
            </div>

            {/* ACCORDÉON */}
            <details className="relative z-10 mb-8 bg-black/60 border border-white/10 rounded-xl overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  → Voir ce qu'EDF gère pour vous (optionnel)
                  {/* INFOBULLE 3.2 */}
                  <InfoPopup
                    title={INFO_MODULE3.complexite[activeProfile].title}
                  >
                    {INFO_MODULE3.complexite[activeProfile].body}
                  </InfoPopup>
                </span>
                <ChevronDown className="text-slate-400" size={20} />
              </summary>

              <div className="px-6 py-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      step: "1",
                      title: "Urbanisme & Mairie",
                      desc: "Déclaration préalable de travaux (DP)",
                    },
                    {
                      step: "2",
                      title: "Architectes des Bâtiments de France",
                      desc: "Validation ABF si zone protégée",
                    },
                    {
                      step: "3",
                      title: "Diagnostic Amiante",
                      desc: "Diagnostic réglementaire inclus (toitures avant 1997)",
                    },
                    {
                      step: "4",
                      title: "Installation & Pose",
                      desc: "Par installateurs RGE certifiés",
                    },
                    {
                      step: "5",
                      title: "Consuel (Comité National de Sécurité)",
                      desc: "Attestation de conformité électrique",
                    },
                    {
                      step: "6",
                      title: "Raccordement ENEDIS",
                      desc: "Mise en service du compteur Linky",
                    },
                    {
                      step: "7",
                      title: "Contrat OA (Obligation d'Achat)",
                      desc: "Signature avec EDF OA - 20 ans",
                    },
                    {
                      step: "8",
                      title: "Mise en Production",
                      desc: "Activation et suivi de production",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-black/20 border border-white/5 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 text-xs font-bold">
                            #{item.step}
                          </span>
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white mb-1">
                            {item.title}
                          </h5>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            {/* CONCLUSION */}
            <div className="relative z-10 p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-start gap-2">
              <p className="text-emerald-100 text-sm leading-relaxed">
                <strong className="text-white">
                  Vous êtes guidé, accompagné et protégé.
                </strong>{" "}
                EDF assume la responsabilité du projet — vous validez simplement
                les étapes importantes.
              </p>

              {/* INFOBULLE 3.3 */}
              <InfoPopup title={INFO_MODULE3.securisation[activeProfile].title}>
                {INFO_MODULE3.securisation[activeProfile].body}
              </InfoPopup>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================
        MODULE 4 : GARANTIES LONG TERME
        FONCTION : Sécuriser la décision dans le temps
        TIMING : Avant la signature (ancrage final)
        ============================================ */}
      <ModuleSection
        id="garanties-long-terme"
        title={garantiesContent.title}
        icon={<ShieldCheck className="text-orange-500" />}
        defaultOpen={false}
        onOpen={(id) => {
          handleModuleChange(id);
        }}
        onClose={handleModuleClose}
      >
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 space-y-10">
          {/* INTRO */}
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-orange-500 w-6 h-6 flex-shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed">
              {garantiesContent.intro?.text}
            </p>

            {garantiesContent.intro?.infobulle?.[activeProfile] && (
              <InfoPopup
                title={garantiesContent.intro.infobulle[activeProfile].title}
              >
                {garantiesContent.intro.infobulle[activeProfile].body}
              </InfoPopup>
            )}
          </div>

          {/* TOGGLE */}
          {garantiesContent.toggleLabels && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white">
                  Deux niveaux de protection
                </h3>
                <Toggle
                  checked={warrantyMode}
                  onChange={setWarrantyMode}
                  labelOff={garantiesContent.toggleLabels.off}
                  labelOn={garantiesContent.toggleLabels.on}
                />
              </div>

              {garantiesContent.toggleDisclaimer && (
                <div className="text-xs text-slate-400 bg-blue-950/20 border-l-2 border-blue-500 p-3 rounded">
                  {garantiesContent.toggleDisclaimer}
                </div>
              )}
            </>
          )}

          {/* TABLEAU COMPARATIF PERFORMANCE VS ESSENTIEL+ */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Tableau comparatif des garanties
              </span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                warrantyMode
                  ? "text-blue-300 bg-blue-500/20 border-blue-400"
                  : "text-amber-300 bg-amber-500/20 border-amber-400"
              }`}>
                {warrantyMode ? "Option Performance active" : "Option Essentiel+ active"}
              </span>
            </div>
            <GarantiesComparativeTable
              activeMode={warrantyMode}
              onSelectMode={setWarrantyMode}
              interactive={true}
            />
          </div>

          {/* SECTIONS STRUCTURANTES */}
          {garantiesContent.sections?.length > 0 && (
            <div className="space-y-6">
              {garantiesContent.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-[#0a0e14] border border-white/5 rounded-xl p-6"
                >
                  <h4 className="text-sm font-bold text-white mb-2">
                    {section.title}
                  </h4>
                  <p className="text-xs text-slate-300 mb-2">
                    {section.text}
                  </p>

                  {section.microText && (
                    <p className="text-[10px] text-slate-500 uppercase">
                      {section.microText}
                    </p>
                  )}

                  {section.infobulle?.[activeProfile] && (
                    <InfoPopup
                      title={section.infobulle[activeProfile].title}
                    >
                      {section.infobulle[activeProfile].body}
                    </InfoPopup>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SYNTHÈSE FINALE */}
          {garantiesContent.synthese?.[activeProfile] && (
            <div className="bg-[#040912] border border-blue-900/40 p-4 rounded-xl">
              <p className="text-sm text-blue-200">
                {garantiesContent.synthese[activeProfile]}
              </p>
            </div>
          )}

          {/* 🧠 Coach local — inchangé */}
          <div
            id="coach-block-gar"
            className="hidden mt-4 bg-black/60 border border-white/10 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed"
          >
            <p>
              🧠 Positionnement → « Ici il n'y a rien à décider : on sécurise un
              projet. »
            </p>
            <p>
              🎤 Terrain → lire le tout en continu, sans pause, puis regarder le
              client.
            </p>
            <p>⏳ Silence → 2 secondes.</p>
            <p className="text-slate-500 italic">
              (Et seulement si le client demande : « tant que le dossier n'est
              pas validé, vous pouvez arrêter le projet sans frais »)
            </p>
          </div>
        </div>
      </ModuleSection>

        {/* ============================================
        MODULE :Locataire VS Propriétaire Énergétique
        ============================================ */}
        <ModuleSection
          id="locataire-proprietaire"
          title="Locataire VS Propriétaire Énergétique"
          icon={<Crown className="text-blue-600" />}
          defaultOpen={false}
          onOpen={(id) => {
            handleModuleChange(id);
          }}
        >
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LOCATAIRE */}
            <div className="bg-black/40 backdrop-blur-xl border border-orange-700/30 rounded-[24px] p-8 relative overflow-hidden transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(255,152,0,0.15)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#1a0d05] border border-orange-800/30 flex items-center justify-center text-orange-400">
                  <Ban size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase">
                  Modèle Locatif
                </h3>
              </div>

              <p className="text-orange-200 text-sm font-medium mb-6">
                Vous payez chaque mois pour consommer. C'est un modèle d'usage.
              </p>

              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  Le tarif suit les évolutions du marché et des décisions
                  publiques — vous ne maîtrisez pas l'avenir de votre facture.
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  Après {projectionYears} ans, vous aurez payé… mais rien ne
                  vous appartiendra.
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  La relation reste mensuelle : vous êtes dépendant d'éléments
                  extérieurs pour votre coût énergétique.
                </li>
              </ul>

              <div className="mt-8 h-1.5 bg-orange-900/20 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-3/4"></div>
              </div>

              <div className="mt-2 text-[14px] text-orange-400/60 italic">
                Vous payez pour l'usage, sans capitaliser.
              </div>
            </div>

            {/* PROPRIÉTAIRE */}
            <div className="bg-black/40 backdrop-blur-xl border border-blue-600/30 rounded-[24px] p-8 relative overflow-hidden shadow-2xl shadow-blue-900/10 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded uppercase shadow-lg">
                Possibilité d'évolution
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                  <Crown size={28} />
                </div>
                <h3 className="text-xl font-black text-white uppercase">
                  Modèle Producteur (Propriétaire)
                </h3>
              </div>

              <p className="text-blue-100 text-sm font-medium mb-6">
                Vous devenez propriétaire de votre production. Chaque kWh
                produit vous appartient.
              </p>

              <ul className="space-y-4 text-sm text-white">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  Coût stabilisé par autoproduction, visibilité sur le long
                  terme.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  Vous créez un patrimoine valorisable (transmission, valeur
                  énergétique du bien).
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  Moins dépendant des évolutions extérieures — vous sécurisez
                  une partie de votre énergie.
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                  Le financement se fait au fil des économies générées par votre
                  production.
                </li>
              </ul>

              <div className="mt-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-2/3"></div>
              </div>

              <div className="mt-2 text-[14px] text-emerald-400 italic font-medium">
                Vos économies deviennent un actif.
              </div>
            </div>
          </div>

          {/* ✅ BADGE VISUEL NEUTRE (REMPLACE L'ANCIENNE PHRASE) */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-slate-900/40 border border-white/5 rounded-xl px-6 py-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Ces deux modèles sont légitimes. La question est : lequel
                correspond à votre situation ?
              </span>
            </div>
          </div>

          {/* 🧠 Coach local — toujours visible pour le conseiller */}

          <div
            id="coach-block-mod8"
            className="hidden mt-4 bg-black/60 border border-white/10 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed"
          >
            <p>
              🧠 EDF (neutre) → « Ici on ne parle pas d'un achat, mais d'un
              modèle de gestion énergétique. »
            </p>
            <p>
              🎯 Question → « Dans votre cas, vous penchez plutôt vers quel
              modèle ? »
            </p>
            <p className="italic text-slate-400">
              ⏳ Puis → SILENCE 3 secondes.
            </p>
          </div>
        </ModuleSection>
        {/* ============================================
   MODULE : ORIGINE DE L’ÉLECTRICITÉ
   Version EDF — compatible moteur — closing
   ============================================ */}

        <ModuleSection
          id="repartition"
          title="Origine de l’électricité de votre maison"
          icon={<Zap className="text-blue-400" />}
          defaultOpen={false}
        >
          <div className="bg-black/40 border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-10">
            {/* INTRO */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                Fonctionnement énergétique après installation
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                Ce module montre concrètement comment se répartit l’électricité
                consommée par votre maison une fois l’installation en service.
              </p>
            </div>

            {/* TAUX DE COUVERTURE */}
            <div className="bg-[#050505] border border-white/10 rounded-3xl p-6 sm:p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                Taux de couverture énergétique
              </p>

              <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                {calculationResult.savingsRatePercent.toFixed(0)} %
              </div>

              <p className="text-slate-300 mt-2 text-sm">
                de votre consommation électrique est produite directement par
                votre maison.
              </p>

              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mt-5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${calculationResult.savingsRatePercent}%` }}
                />
              </div>
            </div>

            {/* STRUCTURE DES FLUX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CONSOMMATION */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
                  Consommation actuelle
                </p>
                <p className="text-3xl font-black text-white">
                  {formatNum(calculationResult.baseConsumptionKwh)} kWh/an
                </p>
                {/* BARRE CONSOMMATION ACTUELLE */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Référence 100% — votre dépendance actuelle au réseau
                  </p>
                </div>

                <p className="text-slate-500 text-xs mt-1">
                  Ce que vous achetez au réseau chaque année aujourd'hui.
                </p>

                <div className="mt-3 pt-3 border-t border-white/5 text-slate-300 text-sm">
                  {formatMoney(calculationResult.lossIfWait1Year)} / an
                </div>
              </div>

              {/* AUTOCONSOMMATION */}
              <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
                  Production Solaire
                </p>
                <p className="text-3xl font-black text-emerald-400">
                  {formatNum(
                    calculationResult.savingsLostIfWait1Year / electricityPrice
                  )}{" "}
                  kWh/an
                </p>
                {/* BARRE AUTOCONSOMMATION */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${calculationResult.savingsRatePercent}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    {calculationResult.savingsRatePercent.toFixed(0)}% de votre
                    consommation couverte
                  </p>
                </div>

                <p className="text-slate-500 text-xs mt-1">
                  Ce que vous produisez et consommez directement.
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 text-emerald-400 text-sm font-bold">
                  ≈ {formatMoney(calculationResult.savingsLostIfWait1Year)} / an
                  économisés
                </div>

                <p className="text-slate-500 text-xs mt-1">
                  Électricité que vous ne payez plus
                </p>
              </div>

              {/* SURPLUS */}
              <div className="bg-black/60 border border-blue-500/20 rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
                  Surplus injecté réseau
                </p>

                <p className="text-3xl font-black text-blue-400">
                  {formatNum(
                    calculationResult.surplusRevenuePerYear / buybackRate
                  )}{" "}
                  kWh/an
                </p>
                {/* BARRE SURPLUS */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-700"
                      style={{
                        width: `${100 - calculationResult.savingsRatePercent}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Part de la production automatiquement valorisée par EDF
                  </p>
                </div>

                <p className="text-slate-500 text-xs mt-1">
                  Non consommé, vendu automatiquement. <br></br>Contrat
                  d'Obligation d'Achat 20 ans — cadre légal. <br></br>Tarif
                  réglementé : {buybackRate}€ / kWh
                </p>

                <div className="mt-3 pt-3 border-t border-white/5 text-blue-400 text-sm font-bold">
                  {/* FIX : Affichage cohérent avec le volume de surplus calculé */}
                  ≈ {formatMoney(calculationResult.surplusRevenuePerYear)} / an
                </div>
              </div>
            </div>

            {/* BLOC EDF */}
            <div className="bg-blue-950/20 border-l-4 border-blue-500 rounded-xl p-5">
              <p className="text-slate-200 text-sm leading-relaxed">
                <strong className="text-white">Fonctionnement réseau :</strong>
                <br />
                L’électricité produite est consommée automatiquement dans votre
                maison. Le surplus est injecté et racheté par EDF dans le cadre
                du contrat d’Obligation d’Achat (État, 20 ans). Lorsque la
                production est insuffisante, le réseau prend le relais
                instantanément.
                <br />
                <br />
                <span className="text-blue-300 font-semibold">
                  Aucun réglage. Aucun pilotage. Continuité de service garantie.
                </span>
              </p>
            </div>

            {/* CLOSING */}
            <div className="text-center pt-2">
              <p className="text-slate-400 italic text-sm">
                Vos habitudes ne changent pas.
              </p>
              <p className="text-white font-bold italic text-lg">
                Seule l’origine de votre électricité change.
              </p>
            </div>
          </div>
        </ModuleSection>

        <ModuleTransition
          label="Cadre posé"
          title="Tout ce qu’on a fait jusque-là sert à une seule chose."
          subtitle="Être sûr qu’on ne se trompe pas."
        />
        {/* ============================================
        MODULE : Synthèse d'Arbitrage Énergétique
        VERSION CORRIGÉE - RÉORGANISATION MODULES BAS
         ============================================ */}

        <ModuleSection
          id="synthese"
          title="Synthèse d’arbitrage énergétique et patrimonial"
          icon={<Calendar className="text-blue-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            handleModuleChange(id);
          }}
        >
          <div id="Synthèse d'Arbitrage Énergétique" className="space-y-6 mt-8">
            {/* RANGÉE SUPÉRIEURE : CALCULS + CARTES DROITE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* PARTIE GAUCHE - CALCULATEUR */}
              <div className="lg:col-span-8 bg-[#050505] border border-white/10 rounded-[40px] p-8 shadow-2xl">
                <div className="flex gap-2 mb-6">
                  <div className="bg-black border border-blue-500/30 text-blue-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <Lock size={18} /> PROJECTION 20 ANS
                  </div>
                  <div className="bg-[#062c1e] border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={18} /> 0€ D'APPORT
                  </div>
                </div>

                {/* ✅ TITRE + GROS CHIFFRE PRINCIPAL */}
                <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">
                  Résultat économique entre les deux trajectoires
                </h3>
                <div
                  className="text-5xl font-black text-white mb-8 italic tracking-tighter"
                  data-testid="gain-total"
                >
                  {Math.round(
                    calculationResult.totalSavingsProjected
                  ).toLocaleString()}{" "}
                  €
                </div>

                {/* TABLEAU DE CALCUL */}
                <div className="bg-[#0a0a0b] border border-white/5 rounded-3xl p-6 space-y-4 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-[14px] font-black text-white uppercase italic tracking-widest">
                      COMMENT EST CALCULÉ CET ÉCART ?
                    </h3>
                  </div>

                  {/* ✅ SCÉNARIO SANS SOLAIRE - MONTANT EXACT */}
                  <div className="bg-[#1a0f10] border border-red-950/30 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="text-red-500 w-6 h-6" />
                      <div>
                        <div className="text-[14px] font-black text-red-500 uppercase italic tracking-wide">
                          SCÉNARIO SANS SOLAIRE
                        </div>
                        <div className="text-[14px] text-slate-400 mt-1">
                          Dépense énergétique totale sur {projectionYears} ans
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-4xl font-black text-red-500 italic tracking-tight"
                      data-testid="no-solar-total-20y"
                    >
                      {Math.round(
                        calculationResult?.totalSpendNoSolar ?? 0
                      ).toLocaleString()}{" "}
                      €
                    </div>
                  </div>

                  <div className="text-center text-[14px] font-black text-slate-600 tracking-widest uppercase italic">
                    MOINS
                  </div>

                  {/* ✅ SCÉNARIO AVEC SOLAIRE - MONTANT EXACT */}
                  <div className="bg-[#0f141a] border border-blue-950/30 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-[14px] font-black text-blue-500 uppercase italic tracking-wide">
                          SCÉNARIO AVEC SOLAIRE
                        </div>
                        <div className="text-[14px] text-slate-400 italic mt-1">
                          Réorganisation des flux + facture résiduelle
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-4xl font-black text-blue-500 italic tracking-tight"
                      data-testid="solar-scenario-total-20y"
                    >
                      {Math.round(
                        calculationResult?.totalSpendSolar ?? 0
                      ).toLocaleString()}{" "}
                      €
                    </div>
                  </div>

                  <div className="text-center text-[14px] font-black text-slate-600 tracking-widest uppercase italic">
                    EGAL
                  </div>

                  {/* ✅ GAIN NET */}
                  <div className="bg-[#0d1a14] border-2 border-emerald-500/40 rounded-2xl p-6 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                      <Award className="text-emerald-500 w-7 h-7" />
                      <div className="text-[13px] font-black text-emerald-500 uppercase tracking-wider italic">
                        VOTRE GAIN NET
                      </div>
                    </div>
                    <div className="text-5xl font-black text-emerald-400 italic tracking-tight">
                      +
                      {Math.round(
                        calculationResult.totalSavingsProjected
                      ).toLocaleString("fr-FR")}
                      &nbsp;€
                    </div>
                  </div>

                  {/* 🔥 OPTIMISATION 1 : ANCRAGE COMPTABLE */}
                  <div className="mt-3 px-4">
                    <p className="text-[14px] text-slate-500 italic leading-relaxed tracking-wide">
                      Ce chiffre n’est pas une promesse. Il résulte uniquement
                      de la projection mécanique de vos flux énergétiques
                      actuels.
                    </p>
                  </div>

                  {/* 🔥 CORRECTION : NOTE NEUTRE ET POSITIVE (V2) */}
                  <div className="bg-blue-950/10 border-l-4 border-blue-500 p-4 rounded-r-xl">
                    <p className="text-[14px] text-blue-200/90 leading-relaxed italic uppercase font-medium">
                      <span className="text-blue-400 font-black">
                        ✓ TRANSITION MAÎTRISÉE
                      </span>{" "}
                      VOTRE BUDGET MENSUEL RESTE STABLE ET ÉQUILIBRÉ. <br />
                      APRÈS REMBOURSEMENT DU FINANCEMENT, les économies
                      deviennent structurelles, PERMANENTES ET MASSIVES.
                    </p>
                  </div>
                </div>

                {/* 🔥 KPI MINI GRID - VERSION V2 OPTIMISÉE */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-black border border-white/5 p-4 rounded-2xl">
                    <div className="text-[12px] font-black text-emerald-500 uppercase mb-1">
                      CAPITAL IMMOBILISÉ
                    </div>
                    <div className="text-xl font-black text-emerald-400 italic">
                      0€
                    </div>
                  </div>
                  <div className="bg-black border border-white/5 p-4 rounded-2xl">
                    <div className="text-[12px] font-black text-blue-500 uppercase mb-1 italic">
                      ÉCART MOYEN
                    </div>
                    <div
                      className="text-xl font-black text-white italic"
                      data-testid="gain-yearly"
                    >
                      +
                      {Math.round(
                        calculationResult.averageYearlyGain
                      ).toLocaleString()}{" "}
                      €/an
                    </div>
                  </div>
                  {/* 🔥 CORRECTION : AUTONOMIE ATTEINTE (V2) */}
                  <div className="bg-black border border-white/5 p-4 rounded-2xl">
                    <div className="text-[11px] font-black text-emerald-500 uppercase mb-1 italic">
                      AUTONOMIE ATTEINTE
                    </div>
                    <div
                      className="text-xl font-black text-white italic"
                      data-testid="break-even"
                    >
                      An {calculationResult.breakEvenPoint}
                    </div>
                  </div>
                  <div className="bg-black border border-white/5 p-4 rounded-2xl">
                    <div className="text-[12px] font-black text-yellow-500 uppercase mb-1 italic">
                      RENDEMENT PROJET
                    </div>
                    <div
                      className="text-xl font-black text-yellow-400 italic"
                      data-testid="project-return"
                    >
                      {(
                        (calculationResult.averageYearlyGain / installCost) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔥 DROITE : RÉORGANISATION (V2 - RÉALLOCATION EN HAUT) */}
              <div className="lg:col-span-4 space-y-6 flex flex-col">
                {/* 🔥 CARTE 1 : RÉALLOCATION ANNÉE 1 (V2 + FIX V1 : "RÉALLOCATION") */}
                <div className="bg-[#050505] border border-orange-900/30 rounded-[32px] p-8 shadow-xl flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="text-orange-500 w-5 h-5" />
                    <h3 className="text-[18px] font-black text-orange-500 uppercase tracking-widest italic">
                      NOUVEL ÉQUILIBRE BUDGÉTAIRE
                    </h3>
                    <InfoBubble title="Pourquoi cet écart évolue dans le temps ?">
                      <p>
                        Ce calcul est basé sur vos consommations actuelles et
                        sur l’évolution structurelle du prix de l’énergie.
                      </p>
                      <p>
                        Lorsque le tarif augmente, la part que vous produisez
                        vous-même évite un achat réseau de plus en plus cher.
                      </p>
                      <p>
                        Mécaniquement, l’écart entre production locale et achat
                        d’électricité s’élargit au fil du temps.
                      </p>
                    </InfoBubble>
                  </div>

                  {/* 🔥 CORRECTION V2 : TOUJOURS BLANC, JAMAIS ROUGE */}
                  <div
                    className="text-6xl font-black text-white mb-8 italic tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    data-testid="monthly-gain"
                  >
                    {(() => {
                      const monthlyReallocationYear1 = Math.round(
                        calculationResult?.monthlyEffortYear1 || 0
                      );
                      return `${
                        monthlyReallocationYear1 > 0 ? "+" : ""
                      }${monthlyReallocationYear1} €`;
                    })()}
                  </div>

                  <div className="space-y-4 border-t border-white/5 pt-6 mt-6">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-slate-400 font-medium">
                        Nouveau Budget :
                      </span>
                      <span
                        className="text-2xl font-black text-white"
                        data-testid="new-monthly-budget"
                      >
                        {Math.round(
                          calculationResult?.newMonthlyBillYear1 || 0
                        ).toLocaleString()}{" "}
                        €
                      </span>
                    </div>

                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm text-slate-400 font-medium">
                        Ancien Budget :
                      </span>
                      <span
                        className="text-2xl font-black text-red-500"
                        data-testid="old-monthly-budget"
                      >
                        {Math.round(
                          calculationResult?.oldMonthlyBillYear1 || 0
                        ).toLocaleString()}{" "}
                        €
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10 w-full">
                      {/* 🔥 OPTIMISATION 2 : "RÉALLOCATION" AU LIEU DE "RÉAJUSTEMENT" */}
                      <span className="text-base font-black text-orange-500 italic uppercase tracking-wider">
                        = Réallocation
                      </span>
                      <span
                        className="text-3xl font-black text-white italic"
                        data-testid="monthly-reallocation"
                      >
                        {(() => {
                          const monthlyReallocationYear1 = Math.round(
                            calculationResult?.monthlyEffortYear1 || 0
                          );
                          return `${
                            monthlyReallocationYear1 > 0 ? "+" : ""
                          }${monthlyReallocationYear1} €`;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl">
                    <p className="text-[14px] text-orange-500/90 italic uppercase font-bold text-center tracking-tighter leading-relaxed">
                      VOTRE CAPACITÉ D'ÉPARGNE S'ACCÉLÈRE À CHAQUE AUGMENTATION
                      DU TARIF DE L'ÉNERGIE.
                    </p>
                  </div>
                </div>

                {/* 🔥 CARTE 2 : RENDEMENT COMPARATIF (V2) */}
                <div className="bg-[#050505] border border-blue-900/30 rounded-[32px] p-8 shadow-xl flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <Landmark className="text-blue-500 w-5 h-5" />
                    <h3 className="text-[14px] font-black text-blue-400 uppercase tracking-widest italic">
                      RENDEMENT COMPARATIF
                    </h3>
                    <InfoBubble title="Comment est calculé ce rendement ?">
                      <p>
                        Ce rendement correspond au rapport entre
                        l’investissement initial et l’écart économique annuel
                        moyen généré par le système.
                      </p>
                      <p>
                        Il est calculé uniquement à partir des flux énergétiques
                        projetés.
                      </p>
                      <p>
                        Il n’intègre ni revalorisation immobilière, ni hypothèse
                        patrimoniale.
                      </p>
                    </InfoBubble>
                  </div>

                  <p className="text-[14px] text-slate-400 mb-6 italic uppercase leading-relaxed">
                    Votre investissement de{" "}
                    <span className="text-white font-black">
                      {formatMoney(installCost)}
                    </span>{" "}
                    génère l'équivalent de{" "}
                    <span className="text-white font-black">
                      {Math.round(
                        calculationResult.averageYearlyGain
                      ).toLocaleString()}{" "}
                      €/an
                    </span>
                  </p>

                  {/* 🔥 GROS CHIFFRE : RENDEMENT EN % */}
                  <div className="text-6xl font-black text-white mb-8 italic tracking-tighter">
                    {(
                      (calculationResult.averageYearlyGain / installCost) *
                      100
                    ).toFixed(1)}
                    %
                  </div>

                  {/* 🔥 COMPARAISON VISUELLE CLAIRE */}
                  <div className="bg-blue-950/50 border border-blue-500/40 px-4 py-4 rounded-xl mb-6">
                    <div className="flex items-center justify-between text-[12px] font-black uppercase">
                      <div className="text-slate-400">LIVRET A</div>
                      <div className="text-slate-500">1,70%</div>
                    </div>
                    <div className="h-px bg-white/10 my-3"></div>
                    <div className="flex items-center justify-between text-[11px] font-black uppercase">
                      <div className="text-blue-400">VOTRE PROJET</div>
                      <div className="text-blue-400">
                        {(
                          (calculationResult.averageYearlyGain / installCost) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-[12px] text-slate-500 italic uppercase flex items-center gap-2">
                    <Zap size={10} className="text-orange-500" /> RENDEMENT
                    CALCULÉ SUR LA DURÉE TOTALE DE PROJECTION
                  </p>
                </div>
              </div>
            </div>
            <ModuleTransition
              label="Changement de perspective"
              title="À partir d’ici, on ne parle plus d’installation."
              subtitle="On parle de ce que devient votre maison."
            />

            {/* RANGÉE INFÉRIEURE : CAPITAL DISPONIBLE + VALEUR VERTE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* 🔥 CARTE ACTIF ÉNERGÉTIQUE — ANTI-OBJECTIONS */}
              <div className="bg-[#050505] border border-emerald-500/20 rounded-[32px] p-8 flex flex-col justify-between relative shadow-2xl min-h-[520px] overflow-hidden">
                {/* 🔎 INFO */}
                <div className="absolute top-6 right-6 z-50">
                  <InfoBubble title="Qu’est-ce qu’un actif énergétique ?">
                    <p>
                      Un actif énergétique est un équipement qui transforme un
                      poste de dépense contrainte en capacité de production.
                    </p>
                    <p>
                      Il permet de réduire durablement les charges, de sécuriser
                      une partie des flux et d’améliorer l’autonomie énergétique
                      du logement.
                    </p>
                    <p>
                      Sa valeur repose d’abord sur son usage, indépendamment de
                      la durée de détention du bien.
                    </p>
                  </InfoBubble>
                  <button
                    onMouseEnter={() => setShowCapitalInfo(true)}
                    onMouseLeave={() => setShowCapitalInfo(false)}
                    className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all"
                  >
                    <Wallet size={24} className="text-emerald-500" />
                  </button>
                </div>

                {/* 🔥 CONTENU PRINCIPAL */}
                <div>
                  <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">
                    ACTIF ÉNERGÉTIQUE
                  </h3>

                  <p className="text-[14px] font-black text-emerald-500 uppercase italic mb-6">
                    VOTRE MAISON COMMENCE À PRODUIRE POUR VOUS
                  </p>

                  {/* ✅ GROS CHIFFRE */}
                  <div className="mb-4">
                    <div className="text-7xl font-black text-emerald-400 italic tracking-tighter leading-none">
                      {Math.round(
                        calculationResult?.savingsAfterBreakEven ||
                          calculationResult?.totalSavingsProjected * 0.6 ||
                          0
                      ).toLocaleString("fr-FR")}
                      &nbsp;€
                    </div>

                    <p className="text-[14px] font-black text-white uppercase italic mt-2 tracking-[0.2em]">
                      VALEUR D'USAGE CRÉÉE PAR VOTRE MAISON
                    </p>

                    <p className="text-[14x] text-slate-400 italic mt-1">
                      Que vous y restiez, que vous louiez ou que vous revendiez.
                    </p>
                  </div>

                  {/* EXEMPLES */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6">
                    <p className="text-[14px] font-black text-emerald-500 uppercase mb-2 tracking-widest">
                      UTILISATION LIBRE :
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[14px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <Plane size={12} className="text-emerald-400" />
                        <span>Confort / voyages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home size={12} className="text-emerald-400" />
                        <span>Amélioration habitat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart size={12} className="text-emerald-400" />
                        <span>Liberté financière</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield size={12} className="text-emerald-400" />
                        <span>Sécurité budgétaire</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔥 BLOC PSYCHOLOGIQUE ANTI-ÂGE / ANTI-VENTE */}
                <div className="mt-2 bg-[#0b1220] border border-blue-500/20 rounded-2xl p-5">
                  <p className="text-[13px] text-slate-200 italic leading-relaxed">
                    Ce projet n'est pas pensé pour "dans {projectionYears} ans".
                    <br />
                    <span className="text-white font-bold">
                      Il est pensé pour que votre maison vous coûte moins et
                      vous apporte plus dès maintenant.
                    </span>
                    <br />
                    <br />
                    La durée n'est pas une condition. C'est simplement ce qui
                    amplifie l'effet.
                  </p>
                </div>

                {/* FOOTER DÉTAIL */}
                <div className="mt-auto">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-bold uppercase">
                        <span className="text-slate-400 tracking-tight max-w-[70%]">
                          Ce que votre maison vous rapporte une fois le système
                          amorti
                        </span>
                        <span className="text-emerald-400">
                          +
                          {Math.round(
                            calculationResult?.savingsAfterBreakEven ||
                              calculationResult?.totalSavingsProjected * 0.6 ||
                              0
                          ).toLocaleString("fr-FR")}{" "}
                          €
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] font-bold uppercase pt-3 border-t border-white/10">
                        <span className="text-slate-400 tracking-tight max-w-[70%] italic">
                          Ce que votre maison vous permet déjà d'économiser
                          pendant qu'elle se rembourse
                        </span>
                        <span className="text-blue-400">
                          +
                          {Math.round(
                            calculationResult?.totalSavingsProjected * 0.4 || 0
                          ).toLocaleString("fr-FR")}{" "}
                          €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                    <p className="text-[12px] text-slate-400 italic">
                      Actif économique domestique — valeur d'usage indépendante
                      du temps de détention
                    </p>
                  </div>
                </div>
              </div>

              {/* 🔥 BOUTON POINT CENTRAL CLIQUABLE */}
              <button
                onClick={() => setShowTransition(!showTransition)}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 hidden md:flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-white/20 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:scale-110 transition-all duration-300 group"
                aria-label="Afficher la transition"
              >
                <div className="relative">
                  {showTransition ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </button>

              {/* 🔥 ÉTAPE 5 — POSITIONNEMENT PATRIMONIAL */}
              <div className="bg-[#050505] border border-orange-500/20 rounded-[32px] p-8 flex flex-col justify-between relative shadow-2xl min-h-[480px] overflow-hidden">
                {/* HEADER */}
                <div>
                  <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">
                    POSITIONNEMENT PATRIMONIAL
                  </h3>

                  <p className="text-[12px] font-black text-orange-500 uppercase italic mb-2">
                    VOTRE RÉSIDENCE À{" "}
                    <span className="underline text-white ml-1 uppercase">
                      {greenPositioning?.city?.toUpperCase() ||
                        data?.params?.address?.split(",")[0]?.toUpperCase() ||
                        "SECTEUR"}
                    </span>
                  </p>

                  <p className="text-[13px] text-slate-400 italic uppercase tracking-wide">
                    Analyse d'impact énergétique sur la valeur et l'attractivité
                    du bien
                  </p>
                </div>

                {/* 🧠 PROFIL D'IMPACT */}
                <div className="mt-8">
                  <div className="text-orange-400 font-black uppercase tracking-widest text-sm mb-2">
                    {greenPositioning?.impactProfile}
                  </div>

                  <p className="text-[15px] text-slate-200 leading-relaxed italic max-w-[95%]">
                    {greenPositioning?.impactNarrative}
                  </p>
                </div>

                {/* 📊 INDICATEURS (si pertinents) */}
                {(greenPositioning?.impactPercentRange ||
                  greenPositioning?.greenValueIndicative) && (
                  <div className="mt-8 bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
                    {greenPositioning?.impactPercentRange && (
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">
                          Impact observé marché :
                        </span>
                        <span className="text-lg font-black text-orange-400">
                          {greenPositioning.impactPercentRange}
                        </span>
                      </div>
                    )}

                    {greenPositioning?.greenValueIndicative &&
                      greenPositioning.propertyClass !== "patrimonial" && (
                        <div className="flex justify-between items-center pt-3 border-t border-white/10">
                          <span className="text-[11px] text-slate-400 uppercase font-bold">
                            Ordre de grandeur économique :
                          </span>
                          <span className="text-2xl font-black text-orange-400 italic">
                            +
                            {greenPositioning.greenValueIndicative.toLocaleString()}{" "}
                            €
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {/* 🏛️ CAS PATRIMONIAL */}
                {greenPositioning?.propertyClass === "patrimonial" && (
                  <div className="mt-8 bg-blue-950/30 border border-blue-500/30 rounded-2xl p-6">
                    <p className="text-blue-300 text-[13px] italic leading-relaxed">
                      Sur ce type de patrimoine, la performance énergétique
                      n'est pas un levier de hausse mécanique.
                      <br />
                      <strong className="text-white">
                        C'est un levier de protection de valeur, de désirabilité
                        et de conformité long terme.
                      </strong>
                    </p>
                  </div>
                )}

                {/* FOOTER SOURCE */}
                <div className="mt-6 bg-[#171412] rounded-2xl p-4 border border-white/5 shadow-inner">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-black italic">
                    Positionnement basé sur tendances notariales, DPE & marchés
                    locaux — ordre de grandeur non estimatif
                  </p>
                </div>
              </div>
            </div>

            {/* 🔥 TRANSITION PLIABLE */}
            {showTransition && (
              <div className="relative w-full py-6 flex items-center justify-center bg-gradient-to-r from-black via-emerald-950/10 to-black border-y border-emerald-500/20 animate-in slide-in-from-top duration-300">
                <div className="max-w-3xl text-center px-6">
                  <p className="text-2xl md:text-3xl font-black italic text-white leading-tight mb-3">
                    À partir d'ici, votre maison ne se contente plus de coûter.
                  </p>
                  <p className="text-xl md:text-2xl font-black italic text-emerald-400 leading-tight">
                    Elle commence concrètement à vous rapporter.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ModuleSection>

        {/* ============================================
   MODULE STRUCTURE DU BUDGET MENSUEL
   ============================================ */}
        <ModuleSection
          id="budget"
          title="Structure du Budget (Mensuel)"
          icon={<Scale className="text-slate-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            handleModuleChange(id);
          }}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            {/* PHRASE D'INTRODUCTION - RESPONSIVE */}
            <div className="text-[10px] sm:text-[11px] text-slate-500 italic mb-4 leading-relaxed">
              On regarde simplement comment votre budget actuel se réorganise —
              sans nouvelle charge.
              <br />
              <span className="text-slate-400">
                On ne parle pas de payer plus. On parle de rediriger ce qui
                existe déjà.
              </span>
            </div>

            {/* HEADER - RESPONSIVE */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <Scale className="text-slate-400 w-5 h-5 sm:w-6 sm:h-6" />
                <h2 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-tight">
                  STRUCTURE DU BUDGET (MENSUEL)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-black/60 p-1 rounded-xl border border-white/10 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setBudgetScenario("financing")}
                    className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all ${
                      budgetScenario === "financing" && !isStudyCash
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Financement
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetScenario("cash")}
                    className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all ${
                      budgetScenario === "cash" || isStudyCash
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Comptant (Cash)
                  </button>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-slate-400 border border-white/10">
                  Année 1
                </div>
              </div>
            </div>

            {(() => {
              const isCash = budgetScenario === "cash" || isStudyCash;
              const activeYear1 = isCash
                ? (calculationResult?.year1Cash || calculationResult?.year1)
                : calculationResult?.year1;

              const currentBill = (activeYear1?.edfBillWithoutSolar || 0) / 12 || monthlyBill;
              const creditMonthly = isCash ? 0 : (activeYear1?.creditPayment || 0) / 12;
              const residueMonthly = (activeYear1?.edfResidue || 0) / 12;
              const totalMonthlyAfter = isCash ? residueMonthly : (creditMonthly + residueMonthly);
              const directSavingsMonthly = Math.max(0, currentBill - residueMonthly);

              return (
                <div className="space-y-8 sm:space-y-10 md:space-y-12">
                  {/* =======================  SITUATION ACTUELLE  ======================= */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs sm:text-sm font-bold uppercase text-slate-400 mb-4 sm:mb-6">
                      <span>SITUATION ACTUELLE</span>
                      <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {formatMoney(currentBill)} /mois
                      </span>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-slate-500 italic mb-3 leading-relaxed">
                      Aujourd’hui, cette somme est entièrement consommée sans création de valeur durable.
                    </div>

                    {/* Barre rouge 100% dépenses - RESPONSIVE */}
                    <div className="relative h-20 sm:h-24 md:h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-xl sm:rounded-2xl border border-red-900/40 overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-xl sm:rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-black/40 to-transparent"></div>

                        <div className="absolute inset-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 md:px-8 gap-2 sm:gap-0">
                          <span className="text-white font-black text-sm sm:text-lg md:text-2xl uppercase tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                            FACTURE ACTUELLE
                          </span>
                          <span className="text-white/30 font-black text-xs sm:text-2xl md:text-5xl uppercase tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] text-right">
                            100% dépenses
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =======================  INSTALLATION EDF – mise en place  ======================= */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                      <span className="text-xs sm:text-sm font-bold uppercase text-slate-400">
                        STRUCTURE du budget APRÈS MISE EN SERVICE
                      </span>

                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] uppercase">
                          {formatMoney(totalMonthlyAfter)} /mois
                        </span>
                        {isCash && (
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full mt-1">
                            Paiement comptant : 0 € de crédit (+{formatMoney(directSavingsMonthly)}/mois d'économies)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-slate-400 italic mb-3 sm:mb-4 leading-relaxed">
                      {isCash
                        ? "En paiement comptant, vous ne payez aucune mensualité de crédit. Votre facture mensuelle chute drastiquement au seul reste à charge réseau."
                        : "Concrètement, on ne rajoute rien dans votre budget. On ne paie rien en plus : on remplace une dépense existante par un flux qui a une utilité durable."}
                    </div>

                    {/* Double barre */}
                    {isCash ? (
                      /* BARRE CASH : Reste à charge + Économie nette directe */
                      <div className="relative h-20 sm:h-24 md:h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex">
                        {/* RESTE À CHARGE */}
                        <div
                          className="relative bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500"
                          style={{
                            width: `${Math.max(15, Math.min(85, currentBill > 0 ? (residueMonthly / currentBill) * 100 : 30))}%`,
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                          <div className="absolute inset-0 flex flex-col justify-center px-3 sm:px-4 md:px-6">
                            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5 sm:mb-1">
                              RESTE À CHARGE EDF
                            </span>
                            <span className="text-white font-black text-sm sm:text-lg md:text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] break-words">
                              {formatMoney(residueMonthly)}
                            </span>
                          </div>
                        </div>

                        {/* Séparateur */}
                        <div className="w-1 bg-black/60 shadow-[1px_0_0_rgba(255,255,255,0.1)]"></div>

                        {/* ÉCONOMIE IMMÉDIATE */}
                        <div className="relative bg-gradient-to-b from-emerald-600 via-emerald-700 to-teal-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500 flex-1">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
                          <div className="absolute inset-0 flex flex-col justify-center px-3 sm:px-4 md:px-6">
                            <span className="text-[9px] sm:text-[10px] md:text-xs font-black text-emerald-200 uppercase tracking-wider mb-0.5 sm:mb-1">
                              ÉCONOMIE IMMÉDIATE CONSERVÉE
                            </span>
                            <span className="text-white font-black text-sm sm:text-lg md:text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] break-words">
                              +{formatMoney(directSavingsMonthly)} /mois
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* BARRE FINANCEMENT : Financement EDF + Reste à charge */
                      <div className="relative h-20 sm:h-24 md:h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex">
                        {/* FINANCEMENT EDF */}
                        <div
                          className="relative bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500"
                          style={{
                            width: `${totalMonthlyAfter > 0 ? (creditMonthly / totalMonthlyAfter) * 100 : 70}%`,
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                          <div className="absolute inset-0 flex flex-col justify-center px-3 sm:px-4 md:px-6">
                            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5 sm:mb-1">
                              FINANCEMENT EDF
                            </span>
                            <span className="text-white font-black text-sm sm:text-lg md:text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] break-words">
                              {formatMoney(creditMonthly)}
                            </span>
                          </div>
                        </div>

                        {/* Séparateur */}
                        <div className="w-1 bg-black/60 shadow-[1px_0_0_rgba(255,255,255,0.1)]"></div>

                        {/* RESTE À CHARGE */}
                        <div className="relative bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500 flex-1">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                          <div className="absolute inset-0 flex flex-col justify-center px-3 sm:px-4 md:px-6">
                            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5 sm:mb-1">
                              RESTE À CHARGE
                            </span>
                            <span className="text-slate-300 font-black text-sm sm:text-lg md:text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] break-words">
                              {formatMoney(residueMonthly)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LÉGENDES EN BAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-12 mt-6 sm:mt-10 px-2">
                      {isCash ? (
                        <>
                          <div className="border-l-[3px] border-emerald-500 pl-4 sm:pl-5">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1.5 sm:mb-2">
                              Gain de pouvoir d'achat immédiat
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                              Vous conservez {formatMoney(directSavingsMonthly)} chaque mois sur votre compte bancaire. Aucun emprunt ni mensualité de crédit.
                            </p>
                          </div>
                          <div className="border-l-[3px] border-slate-700 pl-4 sm:pl-5">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
                              Service réseau résiduel
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                              Seuls {formatMoney(residueMonthly)} /mois restent dus à EDF pour l'abonnement et l'appoint éventuel.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="border-l-[3px] border-slate-500 pl-4 sm:pl-5">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1.5 sm:mb-2">
                              Patrimoine personnel
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                              C'est de l'épargne : cet argent rembourse votre matériel et valorise votre maison.
                            </p>
                          </div>
                          <div className="border-l-[3px] border-slate-700 pl-4 sm:pl-5">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
                              Service réseau
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                              La part minime versée à EDF pour l'abonnement et la sécurité du réseau.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </ModuleSection>

        {/* ======================================================
   MODULE 12.5 — IMPACT SUR VOTRE BUDGET MENSUEL (VERSION FINALE)
   ====================================================== */}
        <ModuleSection
          id="impact"
          title="Impact sur votre budget mensuel"
          icon={<Wallet className="text-blue-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            handleModuleChange(id);
          }}
        >
          <div className="space-y-6">
            {/* PHRASE D'INTRODUCTION */}
            <div className="text-[10px] sm:text-[11px] text-slate-500 italic leading-relaxed">
              Voici comment votre budget mensuel se réorganise la première
              année.
              <br />
              <span className="text-slate-400">
                On ne parle pas d’un coût, mais d’une phase de transition avant
                un modèle durablement plus léger.
              </span>
            </div>

            {/* 3 CARDS - RESPONSIVE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* CARD 1 - FACTURE ACTUELLE */}
              <div className="bg-gradient-to-br from-red-950/30 to-black/40 border border-red-500/20 rounded-xl p-4 sm:p-5 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-red-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></span>
                    <span>Facture actuelle</span>
                  </div>
                  {/* INFOBULLE */}
                  <div className="relative flex-shrink-0">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 cursor-help transition-colors hover:text-red-400" />
                    <div className="absolute top-full right-0 mt-2 w-[260px] sm:w-[280px] bg-slate-900 border-2 border-red-500/30 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-900 border-l-2 border-t-2 border-red-500/30 transform rotate-45"></div>
                      <div className="relative z-10">
                        <div className="text-[11px] font-bold text-red-400 mb-2 uppercase">
                          💸 Facture actuelle
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed">
                          C'est ce que vous payez{" "}
                          <strong className="text-white">
                            actuellement chaque mois
                          </strong>{" "}
                          à votre fournisseur d'électricité, sans installation
                          solaire.
                        </p>
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-[9px] text-slate-500 italic">
                            Base de calcul :{" "}
                            {formatMoney(
                              calculationResult.lossIfWait1Year || 0
                            )}{" "}
                            par an
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-white text-2xl sm:text-3xl font-black break-words">
                  {formatMoney(monthlyBill)}
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs mt-1">
                  /mois
                </div>
              </div>

              {/* CARD 2 - AVEC INSTALLATION */}
              <div className="bg-gradient-to-br from-blue-950/30 to-black/40 border border-blue-500/20 rounded-xl p-4 sm:p-5 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-blue-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                    <span>Vous payez</span>
                  </div>
                  {/* INFOBULLE */}
                  <div className="relative flex-shrink-0">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 cursor-help transition-colors hover:text-blue-400" />
                    <div className="absolute top-full right-0 mt-2 w-[260px] sm:w-[280px] bg-slate-900 border-2 border-blue-500/30 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-900 border-l-2 border-t-2 border-blue-500/30 transform rotate-45"></div>
                      <div className="relative z-10">
                        <div className="text-[11px] font-bold text-blue-400 mb-2 uppercase">
                          🔵 Avec installation
                        </div>
                        <div className="space-y-2 text-[10px] text-slate-300">
                          <div className="flex justify-between pb-1 border-b border-white/10">
                            <span>Mensualité crédit</span>
                            <span className="font-bold text-white">
                              {formatMoney(
                                creditMonthlyPayment + insuranceMonthlyPayment
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between pb-1 border-b border-white/10">
                            <span>Facture résiduelle</span>
                            <span className="font-bold text-white">
                              {formatMoney(residuMensuelM0)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 bg-blue-950/30 rounded p-1.5">
                            <span className="font-bold">Total</span>
                            <span className="font-black text-blue-400">
                              {formatMoney(totalMensuel)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-[9px] text-slate-500 italic">
                            Durée crédit :{" "}
                            {Math.ceil(creditDurationMonths / 12)} ans
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-white text-2xl sm:text-3xl font-black break-words">
                  {formatMoney(totalMensuel)}
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs mt-1 leading-tight">
                  /mois (crédit + reste facture)
                </div>
              </div>

              {/* CARD 3 - DIFFÉRENCE */}
              <div className="bg-gradient-to-br from-slate-950/30 to-black/40 border border-slate-600/20 rounded-xl p-4 sm:p-5 relative group sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0"></span>
                    <span>Différence — 1ère année</span>
                  </div>
                  <div className="text-[9px] text-slate-500 italic mb-1">
                    Phase transitoire uniquement
                  </div>

                  {/* INFOBULLE */}
                  <div className="relative flex-shrink-0">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 cursor-help transition-colors hover:text-slate-300" />
                    <div className="absolute top-full right-0 mt-2 w-[260px] sm:w-[280px] bg-slate-900 border-2 border-slate-500/30 rounded-xl p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-900 border-l-2 border-t-2 border-slate-500/30 transform rotate-45"></div>
                      <div className="relative z-10">
                        <div className="text-[11px] font-bold text-slate-300 mb-2 uppercase">
                          📊 Effort mensuel
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
                          {diffMensuel > 0 ? (
                            <>
                              Vous payez{" "}
                              <strong className="text-orange-400">
                                {formatMoney(Math.abs(diffMensuel))} de plus
                              </strong>{" "}
                              par mois la première année pendant que vous
                              financez l'installation.
                            </>
                          ) : (
                            <>
                              Vous payez{" "}
                              <strong className="text-emerald-400">
                                {formatMoney(Math.abs(diffMensuel))} de moins
                              </strong>{" "}
                              par mois dès la première année !
                            </>
                          )}
                        </p>
                        <div className="bg-emerald-950/30 rounded-lg p-2">
                          <p className="text-[9px] text-emerald-300 font-bold mb-1">
                            ✨ Après remboursement :
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Vous ne payez plus que la facture résiduelle (~
                            {formatMoney(residuMensuelM0)}/mois), soit une
                            économie de{" "}
                            <strong className="text-emerald-400">
                              {formatMoney(monthlyBill - residuMensuelM0)}/mois
                            </strong>{" "}
                            !
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-black break-words ${
                    diffMensuel > 0 ? "text-orange-400" : "text-emerald-400"
                  }`}
                >
                  {diffMensuel > 0 ? "+" : ""}
                  {formatMoney(diffMensuel)}
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs mt-1 leading-tight">
                  Puis → économies dès fin crédit
                </div>
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 italic leading-relaxed">
              La première phase correspond à une période de construction.
              <br />
              <span className="text-slate-500">
                Ensuite, le système est en place : votre budget se libère.
              </span>
            </div>

            {/* SLIDER VISUEL - RESPONSIVE */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-[9px] sm:text-[10px] text-slate-500 uppercase mb-3">
                <span>Alignement avec votre budget actuel</span>
                <span className="text-white font-bold text-sm sm:text-base">
                  {((totalMensuel / monthlyBill) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-3 sm:h-4 bg-slate-800/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-700 ${
                    totalMensuel / monthlyBill > 1
                      ? "bg-gradient-to-r from-orange-500 to-orange-600"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      (totalMensuel / monthlyBill) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-600 mt-2">
                <span>0%</span>
                <span className="text-slate-500">Budget actuel</span>
                <span>150%</span>
              </div>
            </div>

            {/* ÉVOLUTION APRÈS CRÉDIT - NOUVEAU BLOC */}
            <div className="bg-gradient-to-br from-emerald-950/20 to-black/40 border border-emerald-500/20 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-emerald-400 uppercase">
                  Après remboursement du crédit
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">
                    Facture mensuelle
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {formatMoney(residuMensuelM0)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Seulement le résiduel EDF
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">
                    Économie mensuelle
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {formatMoney(monthlyBill - residuMensuelM0)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Par rapport à votre facture actuelle
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-slate-400 italic leading-relaxed">
                À ce stade, le financement disparaît.
                <br />
                Ce qu’il reste, c’est un système qui travaille pour votre
                budget.
              </div>
            </div>

            {/* LIEN VERS TABLEAU DÉTAILLÉ - RESPONSIVE */}
            <p className="text-center text-[10px] sm:text-[11px] text-slate-500 italic leading-relaxed">
              Ces montants sont ceux de la 1ère année.
            </p>
          </div>
        </ModuleSection>

        {/* ============================================
    MODULE 14 : CALENDRIER DE MISE EN SERVICE
    Version finale optimale (ta version validée)
    ============================================ */}
        <ModuleSection
          id="calendrier"
          title="Calendrier de Mise en Service"
          icon={<Calendar className="text-blue-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            handleModuleChange(id);
          }}
        >
          <div className="bg-black/40 border border-white/10 rounded-[32px] p-4 sm:p-6 md:p-8">
            {/* HEADER NEUTRE - RESPONSIVE */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Délai de mise en route — Installation sous 6-8 semaines
                </h2>

                <p className="text-[14px] sm:text-xs text-slate-600 mt-1 sm:mt-2 italic">
                  À partir de cette date, l'installation est opérationnelle.
                </p>
              </div>
            </div>

            {/* CARTES – OPTION 3 : 4 CARDS - RESPONSIVE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 md:mb-6">
              {/* Card 1 - Coût énergétique actuel */}
              <div className="bg-slate-900/40 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="text-slate-400 text-[9px] sm:text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Coût énergétique actuel
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">
                  {formatMoney(calculationResult.lossIfWait1Year || 0)}
                </div>
                <div className="text-slate-500 text-[9px] sm:text-[10px] leading-tight">
                  Facture annuelle fournisseur
                </div>
              </div>

              {/* Card 2 - Économie disponible année 1 */}
              <div className="bg-slate-900/40 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="text-slate-400 text-[9px] sm:text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Économie disponible année 1
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400 mb-1 break-words">
                  {formatMoney(
                    calculationResult.details?.[0]?.solarSavingsValue || 0
                  )}
                </div>
                <div className="text-slate-500 text-[9px] sm:text-[10px] leading-tight">
                  Bénéfice première année
                </div>
              </div>

              {/* Card 3 - Économie BRUTE période AVEC INFOBULLE */}
              <div className="bg-slate-900/40 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-400 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider flex-1">
                    Économie brute {projectionYears} ans
                  </div>
                  {/* ICÔNE INFO */}
                  <div className="relative flex-shrink-0">
                    <Info
                      className="w-4 h-4 text-slate-500 cursor-help transition-colors hover:text-emerald-400"
                      data-tooltip="economie-brute"
                    />
                    {/* INFOBULLE - POSITIONNÉE EN BAS À DROITE */}
                    <div className="absolute top-full right-0 mt-2 w-[280px] sm:w-[320px] bg-slate-900 border-2 border-emerald-500/30 rounded-xl p-3 sm:p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {/* Flèche vers le haut */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-900 border-l-2 border-t-2 border-emerald-500/30 transform rotate-45"></div>

                      {/* Contenu */}
                      <div className="relative z-10">
                        <div className="text-[11px] sm:text-xs font-bold text-emerald-400 mb-2 sm:mb-3 uppercase tracking-wide">
                          💡 Économie brute
                        </div>

                        <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-[11px] text-slate-300">
                          <p className="leading-relaxed">
                            C'est la{" "}
                            <strong className="text-white">
                              valeur totale de l'électricité produite
                            </strong>{" "}
                            par vos panneaux sur {projectionYears} ans.
                          </p>

                          <div className="bg-emerald-950/30 rounded-lg p-2 sm:p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-400">
                                Production annuelle
                              </span>
                              <span className="font-bold text-emerald-400">
                                {calculationResult.details?.[0]
                                  ?.solarSavingsValue
                                  ? formatMoney(
                                      calculationResult.details[0]
                                        .solarSavingsValue
                                    )
                                  : "0 €"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">
                                × {projectionYears} ans
                              </span>
                              <span className="font-bold text-emerald-400">
                                ≈{" "}
                                {formatMoney(
                                  calculationResult.details
                                    .slice(0, projectionYears)
                                    .reduce(
                                      (sum, d) => sum + d.solarSavingsValue,
                                      0
                                    )
                                )}
                              </span>
                            </div>
                          </div>

                          <p className="text-[9px] sm:text-[10px] text-slate-500 italic leading-relaxed">
                            Ce montant ne tient pas compte des coûts (crédit,
                            facture résiduelle). C'est l'énergie{" "}
                            <strong className="text-slate-300">
                              que vous ne payez plus
                            </strong>{" "}
                            à votre fournisseur.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-emerald-400 mb-1 break-words">
                  {formatMoney(
                    calculationResult.details
                      .slice(0, projectionYears)
                      .reduce((sum, d) => sum + d.solarSavingsValue, 0)
                  )}
                </div>
                <div className="text-slate-500 text-[9px] sm:text-[10px] leading-tight">
                  Énergie produite totale
                </div>
              </div>

              {/* Card 4 - Gain NET période AVEC INFOBULLE */}
              <div className="bg-slate-900/40 border border-blue-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-400 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider flex-1">
                    Gain net {projectionYears} ans
                  </div>
                  {/* ICÔNE INFO */}
                  <div className="relative flex-shrink-0">
                    <Info
                      className="w-4 h-4 text-slate-500 cursor-help transition-colors hover:text-blue-400"
                      data-tooltip="gain-net"
                    />
                    {/* INFOBULLE - POSITIONNÉE EN BAS À GAUCHE (pour éviter de sortir) */}
                    <div className="absolute top-full left-auto right-0 mt-2 w-[280px] sm:w-[320px] bg-slate-900 border-2 border-blue-500/30 rounded-xl p-3 sm:p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {/* Flèche vers le haut */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-900 border-l-2 border-t-2 border-blue-500/30 transform rotate-45"></div>

                      {/* Contenu */}
                      <div className="relative z-10">
                        <div className="text-[11px] sm:text-xs font-bold text-blue-400 mb-2 sm:mb-3 uppercase tracking-wide">
                          📊 Détail du calcul
                        </div>

                        <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-[11px] text-slate-300">
                          {/* Économie brute */}
                          <div className="flex justify-between items-start pb-2 border-b border-white/10">
                            <span className="text-slate-400">
                              Économie brute totale
                            </span>
                            <span className="font-bold text-emerald-400 text-right">
                              {formatMoney(
                                calculationResult.details
                                  .slice(0, projectionYears)
                                  .reduce(
                                    (sum, d) => sum + d.solarSavingsValue,
                                    0
                                  )
                              )}
                            </span>
                          </div>

                          {/* Coût du crédit */}
                          <div className="flex justify-between items-start pb-2 border-b border-white/10">
                            <span className="text-slate-400">
                              Coût du crédit
                            </span>
                            <span className="font-bold text-red-400 text-right">
                              -
                              {formatMoney(
                                calculationResult.details
                                  .slice(0, projectionYears)
                                  .reduce((sum, d) => sum + d.creditPayment, 0)
                              )}
                            </span>
                          </div>

                          {/* Facture résiduelle */}
                          <div className="flex justify-between items-start pb-2 border-b border-white/10">
                            <span className="text-slate-400">
                              Facture résiduelle EDF
                            </span>
                            <span className="font-bold text-orange-400 text-right">
                              -
                              {formatMoney(
                                calculationResult.details
                                  .slice(0, projectionYears)
                                  .reduce((sum, d) => sum + d.edfResidue, 0)
                              )}
                            </span>
                          </div>

                          {/* Résultat net */}
                          <div className="flex justify-between items-start pt-2 bg-blue-950/30 rounded-lg p-2">
                            <span className="font-bold text-white">
                              Gain net
                            </span>
                            <span className="font-black text-blue-400 text-sm sm:text-base">
                              {formatMoney(
                                calculationResult.totalSavingsProjected || 0
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Note explicative */}
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                          <p className="text-[9px] sm:text-[10px] text-slate-500 italic leading-relaxed">
                            Le gain net représente ce qu'il vous reste{" "}
                            <strong className="text-slate-300">
                              après avoir payé le crédit et la facture
                              résiduelle
                            </strong>
                            , par rapport à ne rien faire.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1 break-words">
                  {formatMoney(calculationResult.totalSavingsProjected || 0)}
                </div>
                <div className="text-slate-500 text-[9px] sm:text-[10px] leading-tight">
                  Après remboursement crédit
                </div>
              </div>
            </div>

            {/* MESSAGE FACTUEL — VERSION INSTITUTIONNELLE */}
            <div className="bg-blue-950/20 border-l-4 border-blue-500 p-3 sm:p-4 rounded-xl mb-4 md:mb-6">
              <p className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed italic">
                Une fois le dossier validé, le projet entre dans le processus de
                mise en service. Les délais observés sont en moyenne de six à
                huit semaines.
              </p>

              <p className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed italic mt-2">
                Durant cette période, l’ensemble des démarches techniques,
                administratives et de planification est pris en charge par EDF
                et ses partenaires.
              </p>

              <p className="text-slate-400 text-[10px] sm:text-[11px] italic mt-2">
                Le calendrier n’a pas d’impact sur le dimensionnement ni sur la
                logique du projet. Il fixe uniquement la date de mise en
                service.
              </p>
            </div>

            {/* VISUALISATION TEMPORELLE - RESPONSIVE */}
            <div className="p-3 sm:p-5 bg-black/30 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-400 mb-3 sm:mb-4 uppercase tracking-wider">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Impact du calendrier sur le début des économies :
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-base sm:text-lg break-words">
                    {formatMoney(
                      calculationResult.details
                        .slice(0, 1)
                        .reduce((sum, d) => sum + d.solarSavingsValue, 0)
                    )}
                  </div>
                  <div className="text-slate-500 text-[9px] sm:text-[10px] mt-1">
                    Économie année 1
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-base sm:text-lg break-words">
                    {formatMoney(
                      calculationResult.details
                        .slice(0, 3)
                        .reduce((sum, d) => sum + d.solarSavingsValue, 0)
                    )}
                  </div>
                  <div className="text-slate-500 text-[9px] sm:text-[10px] mt-1">
                    Cumul 3 ans
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-base sm:text-lg break-words">
                    {formatMoney(
                      calculationResult.details
                        .slice(0, 5)
                        .reduce((sum, d) => sum + d.solarSavingsValue, 0)
                    )}
                  </div>
                  <div className="text-slate-500 text-[9px] sm:text-[10px] mt-1">
                    Cumul 5 ans
                  </div>
                </div>
              </div>
            </div>

            {/* PHRASE FINALE – RESPONSIVE */}
            <p className="text-[9px] sm:text-[10px] text-slate-500 italic mt-4 sm:mt-6 text-center">
              C'est juste du calendrier. La décision vous appartient.
            </p>
          </div>
        </ModuleSection>
        {/* ============================================
   MODULE COUT DE L INACTION - LECTURE DU TEMPS
   ============================================ */}

        <ModuleSection
          id="effet-calendrier"
          title="Lecture du Temps"
          icon={<Calendar className="text-slate-400" />}
          defaultOpen={false}
        >
          <div className="bg-[#0b0d10] border border-white/10 rounded-2xl p-6 md:p-8">
            {/* TITRE NEUTRE */}
            <h3 className="text-xl font-black text-white mb-2">
              Impact d'une mise en service différée de 6 mois
            </h3>
            <p className="text-sm text-slate-400 mb-8">
              Comparaison objective de deux calendriers de démarrage.
            </p>

            {/* 2 COLONNES : AUJOURD'HUI vs DANS 6 MOIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* SCÉNARIO A — DÉMARRAGE MAINTENANT */}
              <div className="bg-black/40 border border-emerald-500/20 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">
                    Scénario A — Validation immédiate
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase mb-1">
                      Mise en service
                    </div>
                    <div className="text-lg font-black text-white">
                      6-8 semaines
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      délai administratif + installation
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">
                      Production active sur les 6 mois
                    </div>
                    <div className="text-3xl font-black text-emerald-400">
                      ~4-5 mois
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      d'économies générées
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">
                      Économies réalisées sur 6 mois
                    </div>
                    <div className="text-3xl font-black text-white">
                      {formatMoney(
                        calculationResult.savingsLostIfWait1Year / 2
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SCÉNARIO B — DÉMARRAGE DANS 6 MOIS */}
              <div className="bg-black/40 border border-slate-500/20 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    Scénario B — Validation différée de 6 mois
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase mb-1">
                      Mise en service
                    </div>
                    <div className="text-lg font-black text-white">
                      6 mois + 6-8 semaines
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      attente + délai administratif + installation
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">
                      Production active sur les 6 mois
                    </div>
                    <div className="text-3xl font-black text-slate-400">
                      0 mois
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      installation pas encore lancée
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">
                      Économies réalisées sur 6 mois
                    </div>
                    <div className="text-3xl font-black text-white">0 €</div>
                  </div>
                </div>
              </div>
            </div>

            {/* DIFFÉRENTIEL — TON INSTITUTIONNEL */}
            <div className="bg-black/60 border border-white/10 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Différentiel économique entre les deux scénarios
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Le scénario A permet d'activer la production pendant ~4-5
                    mois sur cette période, générant des économies. Le scénario
                    B maintient la situation actuelle pendant 6 mois
                    supplémentaires.
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-4xl font-black text-white">
                    {formatMoney(calculationResult.savingsLostIfWait1Year / 2)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    d'écart sur 6 mois
                  </div>
                </div>
              </div>
            </div>

            {/* NOTE FINALE — TON EDF */}
            <div className="mt-6 bg-black/40 border-l-2 border-slate-600 p-5 rounded-r-xl">
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Lecture :</strong> les deux
                scénarios sont viables. La seule variable est le calendrier de
                mise en service.
                <br />
                <br />
                Dans le scénario A, l'installation est active après 6-8
                semaines, puis produit pendant ~4-5 mois sur les 6 mois
                observés.
                <br />
                <br />
                Dans le scénario B, ces 6 mois maintiennent la situation
                actuelle, avant de démarrer le processus.
              </p>
            </div>
          </div>
        </ModuleSection>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  ACCORDÉON GLOBAL – DÉTAILS COMPLÉMENTAIRES           */}
        {/* ═══════════════════════════════════════════════════════ */}

          {/* ============================================
   MODULE 12 : PROJECTION FINANCIÈRE – ÉCART CONSTATÉ
   ============================================ */}
          <ModuleSection
            id="projection"
            title="PROJECTION FINANCIÈRE – ÉCART CONSTATÉ"
            icon={<Flame className="text-orange-500" />}
            defaultOpen={false}
            forceOpen={activeModule === "projection"}
            onOpen={(id) => {
              handleModuleChange(id);
            }}
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 border border-white/10">
              {/* HEADER – RESPONSIVE */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 md:mb-10 gap-3 sm:gap-4">
                <div className="space-y-1">
                  {PROJECTION_PHRASES[activeProfile] && (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 italic mb-4 leading-relaxed">
                      {PROJECTION_PHRASES[activeProfile]}
                    </p>
                  )}

                  <p className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-wide">
                    Sur {projectionYears} ans — écart constaté
                  </p>
                </div>

                <ProfitBadge
                  totalSavings={calculationResult.totalSavings}
                  paybackYear={calculationResult.paybackYear}
                  projectionYears={projectionYears}
                />
              </div>

              {/* ✅ PHRASE DE CADRAGE (AJOUT) */}
              <p className="text-[10px] sm:text-[11px] text-slate-400 italic mb-4 leading-relaxed">
                Ici, on ne compare pas deux offres. On regarde simplement ce que
                devient votre argent dans les deux scénarios.
              </p>

              {/* GRAPHIQUE – VISX */}
              <div className="h-[280px] sm:h-[340px] md:h-[360px] lg:h-[420px] w-full">
                <FinancialRiskProofVisx 
                  data={gouffreChartData.map(d => ({
                    date: new Date(d.year > 2000 ? d.year : new Date().getFullYear() + d.year, 0, 1).toISOString(),
                    securedCA: d.cumulativeSpendSolar, // Coût maîtrisé (Vert)
                    exposedCA: d.cumulativeSpendNoSolar - d.cumulativeSpendSolar // Surcoût évitale (Rouge)
                  }))} 
                />
              </div>

              {/* LÉGENDE MOBILE (si label caché) */}
              {window.innerWidth < 640 && (
                <div className="flex items-center justify-center gap-2 mt-2 text-[9px] text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span>
                    Point de croisement : {calculationResult.paybackYear} ans
                  </span>
                </div>
              )}

              {/* ÉCART CUMULÉ – RESPONSIVE */}
              <div className="mt-4 sm:mt-6 bg-black/50 border border-white/10 py-4 sm:py-5 rounded-xl text-center select-none">
                <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Écart cumulé sur {projectionYears} ans
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-400 tabular-nums break-words px-2">
                  {formatMoney(calculationResult.totalSavings)}
                </p>
              </div>

              {/* TRIGGERS POPUP - RESPONSIVE (GRID) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4 text-[9px] sm:text-[10px] text-slate-500 opacity-60 select-none">
                <button
                  onClick={() => setPopup("inflation")}
                  className="underline hover:text-white transition-colors text-left"
                >
                  Hypothèse inflation
                </button>
                <button
                  onClick={() => setPopup("demenagement")}
                  className="underline hover:text-white transition-colors text-left"
                >
                  Et si je déménage ?
                </button>
                <button
                  onClick={() => setPopup("conjoint")}
                  className="underline hover:text-white transition-colors text-left"
                >
                  Conjoint absent
                </button>
                <button
                  onClick={() => setPopup("tropTard")}
                  className="underline hover:text-white transition-colors text-left"
                >
                  Trop tard
                </button>
                <button
                  onClick={() => setPopup("tauxRefus")}
                  className="underline hover:text-white transition-colors text-left"
                >
                  Taux refusé
                </button>
                <button
                  onClick={() => setPopup("reflechir")}
                  className="underline hover:text-white transition-colors text-left"
                >
                  Je vais réfléchir
                </button>
              </div>

              {/* POPUPS - RESPONSIVE (PORTAL) */}
              {popup &&
                createPortal(
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4"
                    onClick={closePopup}
                  >
                  <div
                    className="bg-[#0b0f13] border border-white/10 rounded-xl w-full max-w-[420px] p-4 sm:p-6 text-slate-200 relative max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-3 right-3 text-slate-500 hover:text-white transition w-6 h-6 flex items-center justify-center"
                      onClick={closePopup}
                    >
                      ✕
                    </button>

                    {/* === CONTENU VARIABLE SELON POPUP === */}

                    {popup === "inflation" && (
                      <>
                        <h2 className="text-xs sm:text-sm font-bold uppercase mb-3 sm:mb-4 pr-6">
                          Hypothèse inflation
                        </h2>
                        <p className="text-[11px] sm:text-xs leading-relaxed">
                          L'hypothèse retenue est prudente et issue de données
                          publiques. Même si l'inflation devait tomber à 0 %,
                          l'autoproduction reste une réduction directe de
                          facture.
                        </p>
                        <p className="mt-3 text-[9px] sm:text-[10px] text-slate-500">
                          EDF — projection factuelle, jamais spéculative.
                        </p>
                      </>
                    )}

                    {popup === "demenagement" && (
                      <>
                        <h2 className="text-xs sm:text-sm font-bold uppercase mb-3 sm:mb-4 pr-6">
                          Et si je déménage ?
                        </h2>
                        <p className="text-[11px] sm:text-xs leading-relaxed">
                          L'installation devient un élément du bien. Vous pouvez
                          transmettre ou faire valoir sa valeur.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 text-[10px] sm:text-[11px] text-emerald-400 mt-2">
                          ✔ Décision utile, même si la vie change.
                        </div>
                        <p className="mt-3 text-[9px] sm:text-[10px] text-slate-500">
                          EDF — actif patrimonial, pas un achat consommable.
                        </p>
                      </>
                    )}

                    {popup === "conjoint" && (
                      <>
                        <h2 className="text-xs sm:text-sm font-bold uppercase mb-3 sm:mb-4 pr-6">
                          Conjoint absent
                        </h2>
                        <p className="text-[11px] sm:text-xs leading-relaxed">
                          On ne valide jamais un projet patrimonial si l'un des
                          deux n'est pas aligné.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-[11px] sm:text-xs mt-2">
                          Option douce : un rapide échange à trois pour valider
                          ensemble.
                        </div>
                        <p className="mt-3 text-[9px] sm:text-[10px] text-slate-500">
                          Objectif : confort durable, pas décision forcée.
                        </p>
                      </>
                    )}

                    {popup === "tropTard" && (
                      <>
                        <h2 className="text-xs sm:text-sm font-bold uppercase mb-3 sm:mb-4 pr-6">
                          Timing & passage
                        </h2>
                        <p className="text-[11px] sm:text-xs leading-relaxed">
                          Il n'y a aucune obligation d'agir ce soir. Il existe
                          juste un moment où la décision est plus simple.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-[11px] sm:text-xs mt-2">
                          Sécuriser l'étude = garder la main. La signature n'est
                          jamais un piège.
                        </div>
                        <p className="mt-3 text-[9px] sm:text-[10px] text-slate-500">
                          EDF — progression par étapes, calme.
                        </p>
                      </>
                    )}

                    {popup === "tauxRefus" && (
                      <>
                        <h2 className="text-xs sm:text-sm font-bold uppercase mb-3 sm:mb-4 pr-6">
                          Si le taux est refusé
                        </h2>
                        <p className="text-[11px] sm:text-xs leading-relaxed">
                          Tant que validation bancaire non émise, rien n'est
                          engagé. Plusieurs solutions existent.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 text-[10px] sm:text-[11px] text-emerald-400 mt-2">
                          ✔ Décision sécurisée, pas définitive.
                        </div>
                        <p className="mt-3 text-[9px] sm:text-[10px] text-slate-500">
                          EDF — aucun verrou sans accord clair.
                        </p>
                      </>
                    )}

                    {popup === "reflechir" && (
                      <>
                        <h2 className="text-xs sm:text-sm font-bold uppercase mb-3 sm:mb-4 pr-6">
                          Je vais réfléchir
                        </h2>
                        <p className="text-[11px] sm:text-xs leading-relaxed">
                          La réflexion est naturelle. Ce qui compte est que la
                          décision tienne demain — pas qu'elle soit impulsive.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded p-2 text-[10px] sm:text-[11px] text-emerald-400 mt-2">
                          ✔ On confirme seulement ce qui ne sera pas regretté.
                        </div>
                        <p className="mt-3 text-[9px] sm:text-[10px] text-slate-500">
                          EDF — pas de précipitation, seulement du solide.
                        </p>
                      </>
                    )}
                  </div>
                </div>,
                document.body
              )}

              {/* BADGE FOOTER – RESPONSIVE */}
              <div
                id="garanties"
                className="mt-4 sm:mt-6 text-center select-none scroll-mt-24"
              >
                <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Installation garantie à vie — EDF
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">
                  Pièces, main d'œuvre et déplacement inclus
                </p>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================
          MODULE 4 : VOTRE ARGENT DANS X ANS – PATCH EDF (version multi-cartes)
          ============================================ */}
          <ModuleSection
            id="where-money"
            title="Votre argent dans X ans"
            icon={<HelpCircle className="text-blue-500" />}
            defaultOpen={false}
            onOpen={(id) => {
              handleModuleChange(id);
            }}
          >
            <p className="text-[10px] text-slate-400 italic mb-3 px-2">
              {WHERE_MONEY_CONTENT[activeProfile].intro}
            </p>

            <div className="bg-black/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
              {/* HEADER - RESPONSIVE */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <HelpCircle
                    size={24}
                    className="sm:w-7 sm:h-7 text-blue-500 flex-shrink-0"
                  />

                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                      Votre argent dans {projectionYears} ans
                    </h2>

                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                      {WHERE_MONEY_CONTENT[activeProfile].titleSub}
                    </p>
                  </div>

                  {/* 🧠 INFO OBJECTIF */}
                  <InfoPopup
                    title={WHERE_MONEY_CONTENT[activeProfile].popup.title}
                  >
                    {WHERE_MONEY_CONTENT[activeProfile].popup.body}
                  </InfoPopup>
                </div>

                {/* SWITCH MODE - RESPONSIVE */}
                <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10 shadow-inner">
                  <button
                    onClick={() => setWhereMoneyMode("financing")}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                      whereMoneyMode === "financing"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    Financement
                  </button>
                  <button
                    onClick={() => setWhereMoneyMode("cash")}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                      whereMoneyMode === "cash"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              {/* CARDS – 5 / 10 / 20 ans - RESPONSIVE */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[5, 10, projectionYears].map((year, idx) => {
                  const data = getYearData(year);
                  const selectedData =
                    whereMoneyMode === "financing" ? data.credit : data.cash;

                  const youPaid = Math.abs(selectedData.cumulativeSpendSolar);
                  const youWouldHavePaid = Math.abs(
                    selectedData.cumulativeSpendNoSolar
                  );
                  const difference = youWouldHavePaid - youPaid;

                  let headerColor = "text-orange-500";
                  let borderColor = "border-orange-500/30";
                  let shadowColor =
                    "hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]";

                  if (year === 10) {
                    headerColor = "text-blue-500";
                    borderColor = "border-blue-500/30";
                    shadowColor =
                      "hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]";
                  } else if (year >= 20) {
                    headerColor = "text-emerald-500";
                    borderColor = "border-emerald-500/30";
                    shadowColor =
                      "hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]";
                  }

                  return (
                    <div
                      key={`card-${year}-${idx}`} // ← CHANGEMENT ICI
                      className={`relative bg-[#0b0b0b]/60 backdrop-blur-md border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden group transition-all duration-300 hover:border-white/30 ${shadowColor}`}
                    >
                      {/* watermark année - RESPONSIVE */}
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-[80px] sm:text-[100px] md:text-[130px] font-black text-white opacity-[0.03] leading-none select-none pointer-events-none">
                        {year}
                      </div>

                      <h3
                        className={`${headerColor} font-bold text-xs sm:text-sm uppercase mb-4 sm:mb-6 tracking-wider`}
                      >
                        DANS {year} ANS
                      </h3>

                      <div className="space-y-4 sm:space-y-6 relative z-10">
                        {/* SCENARIO SOLAIRE */}
                        <div className="bg-gradient-to-br from-blue-950/30 to-blue-900/10 border border-blue-500/20 p-3 sm:p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <CheckCircle2
                              size={12}
                              className="sm:w-3.5 sm:h-3.5 text-blue-400 flex-shrink-0"
                            />
                            <span className="text-[9px] sm:text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                              Avec installation solaire
                            </span>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase mb-1">
                                Total dépensé en énergie
                              </p>
                              <p className="text-xl sm:text-2xl font-black text-white tabular-nums break-words">
                                {formatMoney(youPaid)}
                              </p>
                            </div>

                            {difference > 0 && (
                              <div className="bg-emerald-950/30 border border-emerald-500/30 p-2 sm:p-3 rounded-lg">
                                <p className="text-[8px] sm:text-[9px] text-emerald-400 uppercase mb-1">
                                  Différence observée
                                </p>
                                <p className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums break-words">
                                  +{formatMoney(difference)}
                                </p>
                              </div>
                            )}

                            {/* ✅ CORRIGÉ : Utiliser le bon breakEvenPoint selon le mode */}
                            {(() => {
                              const breakEven =
                                whereMoneyMode === "financing"
                                  ? calculationResult.breakEvenPoint
                                  : calculationResult.breakEvenPointCash;

                              return (
                                difference <= 0 &&
                                year < breakEven && (
                                  <div className="bg-orange-950/30 border border-orange-500/30 p-2 sm:p-3 rounded-lg">
                                    <p className="text-[8px] sm:text-[9px] text-orange-400 uppercase mb-1">
                                      Phase d'équilibre
                                    </p>
                                    <p className="text-sm sm:text-lg font-black text-orange-400 break-words">
                                      Retour estimé dans {breakEven - year} ans
                                    </p>
                                  </div>
                                )
                              );
                            })()}
                          </div>
                        </div>

                        {/* STATU QUO */}
                        <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 border border-red-500/20 p-3 sm:p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <AlertTriangle
                              size={12}
                              className="sm:w-3.5 sm:h-3.5 text-red-400 flex-shrink-0"
                            />
                            <span className="text-[9px] sm:text-[10px] text-red-400 font-bold uppercase tracking-wider leading-tight">
                              Sans changement (factures actuelles)
                            </span>
                          </div>

                          <p className="text-[8px] sm:text-[9px] text-red-300 uppercase mb-1">
                            Dépenses en énergie (non récupérables)
                          </p>
                          <p className="text-xl sm:text-2xl font-black text-red-400 tabular-nums break-words">
                            {formatMoney(youWouldHavePaid)}
                          </p>

                          {difference > 0 && (
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-red-900/30">
                              <p className="text-[8px] sm:text-[9px] text-red-500 uppercase mb-1">
                                Écart constaté
                              </p>
                              <p className="text-lg sm:text-xl font-black text-red-500 tabular-nums break-words">
                                {formatMoney(difference)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Résumé final (seulement dernière année) */}
                        {year === projectionYears && difference > 0 && (
                          <div className="bg-emerald-600/15 border border-emerald-500/30 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                            <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase text-center mb-1">
                              Visualisation synthétique
                            </p>
                            <p className="text-3xl sm:text-4xl font-black text-emerald-400 text-center tabular-nums break-words">
                              +{formatMoney(difference)}
                            </p>
                            <p className="text-[8px] sm:text-[9px] text-emerald-300 text-center mt-1 uppercase">
                              dans votre maison, au lieu de 0€
                            </p>
                          </div>
                        )}

                        {/* Phrase ANCRAGE – anti regret */}
                        {year === 10 && (
                          <p className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/5 text-[10px] sm:text-xs text-blue-400 font-medium uppercase leading-relaxed">
                            Ce graphique est un repère. La vraie décision
                            concerne votre maison, votre confort et la maîtrise
                            durable de vos dépenses.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* URGENCE NEUTRALE - RESPONSIVE */}
              <div className="mt-6 sm:mt-8 md:mt-10 bg-gradient-to-r from-orange-950/30 to-red-950/30 border-l-4 border-orange-500 p-4 sm:p-6 rounded-xl">
                <div className="flex items-start gap-3 sm:gap-4">
                  <Clock
                    size={20}
                    className="sm:w-6 sm:h-6 text-orange-400 flex-shrink-0 mt-1"
                  />
                  <div>
                    <h4 className="text-orange-400 font-bold text-base sm:text-lg mb-2">
                      Dépense mensuelle actuelle :{" "}
                      <span className="break-words">
                        {formatMoney(calculationResult.oldMonthlyBillYear1)}
                      </span>
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Aujourd'hui, chaque mois représente ce montant dépensé en
                      énergie. Avec installation solaire, cette même dépense
                      devient progressivement un investissement utile – sur{" "}
                      {projectionYears} ans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-[10px] sm:text-[11px] text-slate-500 italic">
              {WHERE_MONEY_CONTENT[activeProfile].closing}
            </p>

            {/* ✅ CORRIGÉ : UN SEUL BOUTON COACH (Portal uniquement) */}
            {createPortal(
              <div
                style={{
                  position: "fixed",
                  bottom: "12px",
                  left: "12px",
                  zIndex: 999999999,
                  pointerEvents: "auto",
                }}
              >
                <button
                  onClick={() => setShowCoachTip((p) => !p)}
                  onMouseDown={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "rgba(100,100,100,0.15)",
                    border: "none",
                    cursor: "pointer",
                    transition: "0.3s ease",
                    padding: 0,
                    opacity: 0.3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.width = "58px";
                    e.currentTarget.style.height = "20px";
                    e.currentTarget.innerText = "coach";
                    e.currentTarget.style.borderRadius = "6px";
                    e.currentTarget.style.background = "rgba(0,0,0,0.75)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.fontSize = "10px";
                    e.currentTarget.style.fontWeight = "500";
                    e.currentTarget.style.padding = "2px 8px";
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.width = "6px";
                    e.currentTarget.style.height = "6px";
                    e.currentTarget.innerText = "";
                    e.currentTarget.style.borderRadius = "50%";
                    e.currentTarget.style.background = "rgba(100,100,100,0.15)";
                    e.currentTarget.style.color = "transparent";
                    e.currentTarget.style.padding = "0";
                    e.currentTarget.style.opacity = "0.3";
                  }}
                />
              </div>,
              document.body
            )}
          </ModuleSection>

          {/* ============================================
 MODULE 3 : VALIDATION DE MODALITÉ — V3 CLOSING NET
 ============================================ */}
          <ModuleSection
            id="financement-vs-cash"
            title="Validation de Modalité"
            icon={<Wallet className="text-blue-500" />}
            defaultOpen={false}
            onOpen={(id) => {
              handleModuleChange(id);
            }}
          >
            <div className="relative bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10">
              {/* HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-500">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    VALIDATION DE MODALITÉ
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Le projet est là. Ici, on ajuste simplement la manière la
                    plus fluide de le mettre en place.
                  </p>
                </div>
              </div>

              {/* GRID 70/30 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-8">
                {/* ============================================
          FINANCEMENT — 3/5 de l'espace (prioritaire)
          ============================================ */}
                <div className="md:col-span-3 bg-black/60 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-blue-500/70 hover:shadow-[0_0_40px_rgba(59,130,246,0.35)]">
                  {/* Watermark */}
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <Wallet size={140} className="text-blue-500" />
                  </div>

                  {/* Header card */}
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-14 h-14 bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase">
                        FINANCEMENT
                      </h3>
                      <p className="text-blue-300 text-sm mt-1">
                        Vous mettez le projet en place sans toucher à votre
                        capital.
                      </p>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="space-y-3 mb-8 relative z-10">
                    <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Repère ({projectionYears} ans)
                      </span>
                      <span className="text-2xl font-black text-white tabular-nums">
                        {formatMoney(calculationResult.totalSavingsProjected)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Seuil d'équilibre
                      </span>
                      <span className="text-2xl font-black text-blue-400 tabular-nums">
                        {calculationResult.breakEvenPoint === 1
                          ? "1 an"
                          : `${calculationResult.breakEvenPoint} ans`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Épargne mobilisée
                      </span>
                      <span className="text-2xl font-black text-emerald-400 tabular-nums">
                        0€
                      </span>
                    </div>
                  </div>

                  {/* Points clés */}
                  <div className="bg-blue-950/10 border border-blue-900/20 rounded-xl p-5 relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-blue-400 text-sm font-bold uppercase">
                      <CheckCircle2 size={16} /> Points clés
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2
                          size={14}
                          className="text-blue-500 flex-shrink-0"
                        />
                        Votre épargne reste intacte pour d'autres projets
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2
                          size={14}
                          className="text-blue-500 flex-shrink-0"
                        />
                        Échéancier fixe — pas de surprise future
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2
                          size={14}
                          className="text-blue-500 flex-shrink-0"
                        />
                        Installation sous 4 à 6 semaines (délai standard)
                      </li>
                    </ul>
                  </div>

                  {/* Badge "Modalité standard" */}
                  <div className="mt-6 bg-gradient-to-r from-blue-950/40 to-blue-900/20 border border-blue-500/30 rounded-xl p-4 relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={14} className="text-blue-400" />
                      <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                        Modalité standard EDF
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      C'est la modalité la plus courante pour ce type de projet
                      — aucune différence de service ou de garantie.
                    </p>
                  </div>
                </div>

                {/* ============================================
          CASH — 2/5 de l'espace (alternative)
          ============================================ */}
                <div className="md:col-span-2 bg-black/60 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                  {/* Watermark */}
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <Coins size={100} className="text-emerald-500" />
                  </div>

                  {/* Header card */}
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-12 h-12 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Coins size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase">
                        CASH
                      </h3>
                      <p className="text-emerald-300 text-xs mt-1">
                        Pour ceux qui veulent que le sujet soit définitivement
                        réglé.
                      </p>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="space-y-3 mb-6 relative z-10">
                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Repère ({projectionYears} ans)
                      </span>
                      <span className="text-xl font-black text-emerald-400 tabular-nums">
                        {formatMoney(
                          calculationResult.totalSavingsProjectedCash
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Seuil d'équilibre
                      </span>
                      <span className="text-xl font-black text-emerald-400 tabular-nums">
                        {calculationResult.breakEvenPointCash === 1
                          ? "1 an"
                          : `${calculationResult.breakEvenPointCash} ans`}
                      </span>
                    </div>
                  </div>

                  {/* Points clés */}
                  <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4 relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-bold uppercase">
                      <CheckCircle2 size={14} /> Points clés
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2
                          size={12}
                          className="text-emerald-500 flex-shrink-0"
                        />
                        Économie sur le coût du crédit (+
                        {formatMoney(
                          calculationResult.totalSavingsProjectedCash -
                            calculationResult.totalSavingsProjected
                        )}
                        )
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2
                          size={12}
                          className="text-emerald-500 flex-shrink-0"
                        />
                        Aucune mensualité — règlement unique
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ============================================
        BADGE DIFFÉRENCE ÉCONOMIQUE
        ============================================ */}
              <div className="flex justify-center mt-10 mb-8">
                <div className="relative px-10 py-6 rounded-2xl border border-emerald-500/40 backdrop-blur-md bg-emerald-950/40 shadow-[0_0_45px_rgba(16,185,129,0.35)]">
                  <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[0_0_90px_20px_rgba(16,185,129,0.15)]"></div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 text-center flex items-center gap-2 justify-center">
                    <Lock size={12} />
                    DIFFÉRENCE ÉCONOMIQUE
                  </div>
                  <div className="text-4xl font-black text-emerald-400 text-center tabular-nums">
                    +
                    {formatMoney(
                      calculationResult.totalSavingsProjectedCash -
                        calculationResult.totalSavingsProjected
                    )}
                  </div>
                  <div className="text-xs text-emerald-300 mt-1 text-center">
                    C'est une différence réelle — mais elle ne remet pas en
                    cause la décision.
                  </div>
                </div>
              </div>

              {/* ============================================
        FOOTER PRINCIPAL
        ============================================ */}
              <div className="mt-6 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-slate-400 text-center">
                L'important, c'est que la décision soit claire — et que sa mise
                en place vous reste confortable.
              </div>
            </div>

            {/* ============================================
      VERDICT FINAL — Version guidée (pas de remise en jeu)
      ============================================ */}
            <div className="mt-10 bg-gradient-to-r from-blue-950/40 to-black/40 border-l-4 border-blue-500 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl flex-shrink-0">
                  <Wallet className="text-blue-400" size={24} />
                </div>
                <div>
                  <h4 className="text-blue-400 font-bold text-lg mb-2 uppercase tracking-wider">
                    MODALITÉ STANDARD — FINANCEMENT STRUCTURÉ
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    Si vous choisissez de mettre le projet en place tout en
                    conservant votre capital disponible — l'installation démarre
                    dans les 4 à 6 semaines.
                  </p>
                  <div className="bg-black/40 border border-emerald-900/30 rounded-lg p-4 inline-block">
                    <div className="flex items-start gap-3">
                      <Coins
                        className="text-emerald-400 flex-shrink-0 mt-0.5"
                        size={18}
                      />
                      <p className="text-xs text-emerald-300 leading-relaxed">
                        <strong>
                          Si vous choisissez de solder le projet immédiatement
                        </strong>
                        , l'option cash reste accessible — avec +
                        {formatMoney(
                          calculationResult.totalSavingsProjectedCash -
                            calculationResult.totalSavingsProjected
                        )}{" "}
                        d'écart économique sur {projectionYears} ans.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================
        MODULE 5 : COMPARAISON – Vos autres options (CLOSING NET)
        ============================================ */}
          <ModuleSection
            id="comparateur"
            title="Comparaison avec vos autres options"
            icon={<Landmark className="text-purple-500" />}
            defaultOpen={false}
            forceOpen={activeModule === "comparateur"}
            onOpen={(id) => {
              handleModuleChange(id);
            }}
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 relative">
              <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10 pointer-events-none">
                <Landmark
                  size={80}
                  className="sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] text-purple-500"
                />
              </div>

              <div className="relative z-10">
                {/* HEADER - RESPONSIVE */}
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="text-purple-500 flex-shrink-0">
                    <Landmark size={22} className="sm:w-[26px] sm:h-[26px]" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Comparaison avec vos autres options
                  </h2>
                </div>

                {/* 🔥 INTRO CLOSING NET */}
                <p className="text-[10px] text-slate-400 italic mb-3 px-2">
                  Ici, on ne compare pas des produits. On regarde ce que devient
                  votre argent si vous le laissez partir… ou si vous le faites
                  travailler chez vous.
                </p>

                {/* ✅ LIGNE 1 */}
                <div className="mb-4 bg-blue-950/30 border-l-4 border-blue-500 p-3 sm:p-4 rounded text-xs sm:text-sm text-gray-300 leading-relaxed flex items-start gap-3">
                  <span className="flex-1">
                    Tous les scénarios sont construits avec les{" "}
                    <strong>mêmes hypothèses</strong>. La seule différence
                    observée vient d’une chose :
                    <strong>
                      {" "}
                      continuer à acheter de l’énergie, ou commencer à la
                      produire.
                    </strong>
                  </span>
                  <InfoPopup title="D'où viennent ces chiffres ?">
                    <p className="mb-3">
                      Les calculs sont basés sur{" "}
                      <strong>votre consommation réelle</strong>, les tarifs
                      réglementés en vigueur et des hypothèses prudentes
                      d'évolution.
                    </p>
                    <p className="mb-3">
                      <strong>Les mêmes paramètres</strong> sont appliqués à
                      tous les cas (sans solaire, Livret A, Assurance-vie, SCPI,
                      solaire).
                    </p>
                    <p className="text-blue-400 text-xs">
                      La différence ne vient pas du modèle. Elle vient
                      uniquement de ce que vous faites de votre argent.
                    </p>
                  </InfoPopup>
                </div>

                {/* ✅ LIGNE 2 */}
                <div className="mb-6 bg-blue-950/30 border-l-4 border-blue-500 p-3 sm:p-4 rounded text-xs sm:text-sm text-gray-300 leading-relaxed flex items-start gap-3">
                  <span className="flex-1">
                    Même sans hausse des prix, l’installation reste pertinente :
                    elle transforme une dépense définitive en une production que
                    vous contrôlez.
                  </span>
                  <InfoPopup title="Et si les prix n'augmentent pas ?">
                    <p className="mb-3">
                      Si les prix restaient constants, l’écart serait plus
                      faible, mais la logique resterait la même :
                      <strong>
                        {" "}
                        produire coûte toujours moins que racheter.
                      </strong>
                    </p>
                    <p className="mb-3">
                      Le solaire n’est pas un pari. C’est une réduction
                      structurelle de ce que vous sortez chaque mois.
                    </p>
                    <p className="text-blue-400 text-xs">
                      Vous reprenez le contrôle d’une partie de votre facture.
                    </p>
                  </InfoPopup>
                </div>
                {/* OPTIONS - RESPONSIVE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* LIVRET A */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-black/60 backdrop-blur-md border border-blue-900/20 p-4 sm:p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400 flex-shrink-0">
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
                      <div className="text-3xl sm:text-4xl font-black text-blue-500 mb-2 break-words">
                        1.7%
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        PERFORMANCE ANNUELLE
                      </div>
                    </div>
                    <div className="bg-blue-950/20 border border-blue-900/30 p-3 sm:p-4 rounded-xl">
                      <div className="text-[9px] sm:text-[10px] text-blue-400 font-bold uppercase mb-1">
                        Gain net {projectionYears} ans
                      </div>
                      <div className="text-lg sm:text-xl font-black text-blue-400 break-words">
                        {formatMoney(
                          (installCost || 0) * Math.pow(1.017, projectionYears || 20) -
                            (installCost || 0)
                        )}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 mt-1">
                        (capital de {formatMoney(installCost)} bloqué)
                      </div>
                    </div>
                  </div>

                  {/* ASSURANCE VIE */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-black/60 backdrop-blur-md border border-purple-900/20 p-4 sm:p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-900/30 p-2 rounded-lg text-purple-400 flex-shrink-0">
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
                      <div className="text-3xl sm:text-4xl font-black text-purple-500 mb-2 break-words">
                        2.7%
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        PERFORMANCE ANNUELLE
                      </div>
                    </div>
                    <div className="bg-purple-950/20 border border-purple-900/30 p-3 sm:p-4 rounded-xl">
                      <div className="text-[9px] sm:text-[10px] text-purple-400 font-bold uppercase mb-1">
                        Gain net {projectionYears} ans
                      </div>
                      <div className="text-lg sm:text-xl font-black text-purple-400 break-words">
                        {formatMoney(
                          installCost * Math.pow(1.027, projectionYears) -
                            installCost
                        )}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 mt-1">
                        (capital de {formatMoney(installCost)} bloqué)
                      </div>
                    </div>
                  </div>

                  {/* SCPI */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-black/60 backdrop-blur-md border border-orange-900/20 p-4 sm:p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-orange-900/30 p-2 rounded-lg text-orange-400 flex-shrink-0">
                          <Home size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">
                            SCPI/Immobilier
                          </h3>
                          <p className="text-[10px] text-orange-300">
                            Illiquide
                          </p>
                        </div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-orange-500 mb-2 break-words">
                        4.5%
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        PERFORMANCE ANNUELLE
                      </div>
                    </div>
                    <div className="bg-orange-950/20 border border-orange-900/30 p-3 sm:p-4 rounded-xl">
                      <div className="text-[9px] sm:text-[10px] text-orange-400 font-bold uppercase mb-1">
                        Gain net {projectionYears} ans
                      </div>
                      <div className="text-lg sm:text-xl font-black text-orange-400 break-words">
                        {formatMoney(
                          installCost * Math.pow(1.045, projectionYears) -
                            installCost
                        )}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 mt-1">
                        (capital de {formatMoney(installCost)} bloqué)
                      </div>
                    </div>
                  </div>

                  {/* SOLAIRE */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-[#022c22] border border-emerald-500 p-4 sm:p-6 rounded-2xl relative shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      {/* ✅ BADGE SCARCITY */}
                      <div id="badge-garantie" className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-emerald-900 text-emerald-300 border border-emerald-700 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        Garantie À VIE
                      </div>

                      <div className="flex items-center gap-3 mb-4 mt-2">
                        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 flex-shrink-0">
                          <Sun size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-sm uppercase">
                            SOLAIRE
                          </h3>
                          <p className="text-[10px] text-emerald-300">
                            Capital libre
                          </p>
                        </div>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-2 break-words">
                        0€
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4">
                        CAPITAL BLOQUÉ
                      </div>
                      <div className="border-t border-emerald-500/30 pt-3 text-xs font-bold text-white flex items-center gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-emerald-400 flex-shrink-0"
                        />
                        <span className="leading-tight">
                          Vous réduisez votre dépendance au réseau
                        </span>
                      </div>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 sm:p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase mb-1">
                        Écart net {projectionYears} ans
                      </div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400 break-words">
                        {formatMoney(calculationResult.totalSavingsProjected)}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-emerald-300 mt-1 leading-tight">
                        <strong>+ Votre épargne reste libre</strong> (
                        {formatMoney(installCost)} disponible)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🔥 FOOTER CLOSING NET */}
                <div className="mt-6 sm:mt-8 bg-black/40 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <Lightbulb
                    size={18}
                    className="sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                  />
                  <p>
                    <strong className="text-white">
                      La vraie différence ?
                    </strong>{" "}
                    Dans les placements classiques, votre argent est immobilisé
                    pour espérer un rendement. Ici, il{" "}
                    <strong className="text-emerald-400">
                      arrête d’être perdu
                    </strong>{" "}
                    et commence à produire quelque chose d’utile chez vous.
                    <br />
                    <span className="text-slate-400 italic">
                      Autrement dit : soit votre argent travaille ailleurs. Soit
                      il travaille chez vous.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================
          MODULE 7 : BILAN TOTAL SUR X ANS
          Version CLOSING NET — verrou décision + anti-annulation
          ============================================ */}
          <ModuleSection
            id="bilan-total"
            title={`Bilan Total sur ${projectionYears} ans`}
            icon={<Scale className="text-slate-400" />}
            defaultOpen={false}
            onOpen={(id) => {
              handleModuleChange(id);
            }}
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 md:p-8 border border-white/10 relative">
              {/* ============================================
          HEADER
          ============================================ */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 bg-white/5 rounded-xl border border-white/10 flex-shrink-0">
                    <Scale className="text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                      BILAN TOTAL SUR {projectionYears} ANS
                    </h2>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 italic">
                      Ce n’est plus une estimation. C’est ce que devient votre
                      argent si rien ne change… et si vous agissez.
                    </p>
                  </div>
                </div>

                {/* Switch Financement/Cash */}
                <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                  <button
                    onClick={() => setGouffreMode("financing")}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                      gouffreMode === "financing"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    Financement
                  </button>
                  <button
                    onClick={() => setGouffreMode("cash")}
                    className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                      gouffreMode === "cash"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              <div className="space-y-8 sm:space-y-10 md:space-y-12">
                {/* =========================
          SANS SOLAIRE
          ========================= */}
                <div className="relative group">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80 flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-widest">
                        Sans solaire — scénario de continuité
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white break-words">
                      {formatMoney(
                        gouffreMode === "financing"
                          ? calculationResult.totalSpendNoSolar
                          : calculationResult.totalSpendNoSolarCash
                      )}
                    </span>
                  </div>

                  <div className="relative h-20 sm:h-24 md:h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-xl sm:rounded-2xl border border-red-900/40 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-xl sm:rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)]"></div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-3 text-red-400 text-xs sm:text-sm italic">
                    <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0"></div>
                    Argent définitivement parti. Aucun retour possible.
                  </div>
                </div>

                {/* =========================
          AVEC SOLAIRE
          ========================= */}
                <div className="relative group">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                          gouffreMode === "cash"
                            ? "bg-emerald-500/80"
                            : "bg-blue-500/80"
                        }`}
                      ></div>
                      <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-widest">
                        Avec solaire — réaffectation de votre argent
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white break-words">
                      {formatMoney(
                        gouffreMode === "financing"
                          ? calculationResult.totalSpendSolar
                          : calculationResult.totalSpendSolarCash
                      )}
                    </span>
                  </div>

                  <div className="relative h-20 sm:h-24 md:h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-xl sm:rounded-2xl transition-all duration-1000 ${
                        gouffreMode === "cash"
                          ? "bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700"
                          : "bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700"
                      }`}
                      style={{
                        width: `${
                          gouffreMode === "financing"
                            ? (calculationResult.totalSpendSolar /
                                calculationResult.totalSpendNoSolar) *
                              100
                            : (calculationResult.totalSpendSolarCash /
                                calculationResult.totalSpendNoSolarCash) *
                              100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 sm:mt-3 gap-3">
                    <div
                      className={`flex items-center gap-2 text-xs sm:text-sm italic ${
                        gouffreMode === "cash"
                          ? "text-emerald-400/80"
                          : "text-blue-400/80"
                      }`}
                    >
                      <Zap size={12} />
                      Actif productif chez vous pendant 25+ ans.
                    </div>

                    <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 px-3 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3">
                      <Coins
                        size={14}
                        className="text-emerald-400 flex-shrink-0"
                      />
                      <span className="text-[10px] sm:text-xs text-emerald-400/70 font-bold uppercase tracking-wider">
                        Différence réelle :
                      </span>
                      <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-400 break-words">
                        {formatMoney(
                          gouffreMode === "financing"
                            ? calculationResult.totalSavingsProjected
                            : calculationResult.totalSavingsProjectedCash
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================
          LECTURE DU BILAN — VERROU
          ========================= */}
              <div className="mt-6 sm:mt-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg border border-white/10 flex-shrink-0">
                  <Info size={14} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs sm:text-sm mb-2 uppercase tracking-wider">
                    Ce que montre réellement ce bilan
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Le scénario{" "}
                    <strong className="text-red-400">sans solaire</strong> est
                    celui que vous connaissez déjà : votre argent part et ne
                    revient pas. Le scénario{" "}
                    <strong className="text-blue-400">avec solaire</strong>{" "}
                    montre ce qui se passe quand cette même somme commence à
                    construire quelque chose chez vous.
                    <br />
                    <strong className="text-white">
                      Ce n’est pas une économie. C’est un changement de
                      trajectoire.
                    </strong>
                  </p>
                </div>
              </div>
              {/* =========================
            INFO MODULE — SÉCURISATION FACTUELLE
            ========================= */}
              <div className="mt-4 sm:mt-6 bg-gradient-to-br from-slate-900/60 to-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 flex items-start gap-3">
                <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg border border-white/10 flex-shrink-0">
                  <ShieldCheck size={14} className="text-slate-400" />
                </div>

                <div>
                  <h4 className="text-white font-bold text-xs sm:text-sm mb-1 uppercase tracking-wider">
                    Cadre de lecture
                  </h4>

                  <div className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Ce module ne projette ni scénario commercial, ni hypothèse
                    optimiste. Il applique simplement les{" "}
                    <strong className="text-white">
                      mêmes règles de calcul
                    </strong>{" "}
                    à deux choix différents : continuer comme aujourd’hui, ou
                    produire une partie de votre énergie.
                    <br />
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      Le scénario{" "}
                      <strong className="text-red-400">sans solaire</strong>{" "}
                      représente votre dépense énergétique actuelle. Le scénario{" "}
                      <strong className="text-blue-400">avec solaire</strong>{" "}
                      transforme cette dépense en investissement qui génère de
                      la valeur pendant 25+ ans.
                    </p>
                    <br />
                    <strong className="text-white">
                      Ce que vous voyez n’est pas une promesse — c’est la
                      conséquence logique de votre situation actuelle.
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================
          MODULE 13 : PROJECTION FINANCIÈRE (20 ANS)
          Objectif : Sécuriser la décision & éliminer l’annulation J+7
          ============================================ */}
          <ModuleSection
            id="projection-table"
            title={`Projection Financière — ${projectionYears} ans`}
            icon={<Table2 className="text-slate-400" />}
            defaultOpen={false}
            forceOpen={activeModule === "projection"}
            onOpen={(id) => {
              handleModuleChange(id);
            }}
          >
            <p className="text-[10px] sm:text-[16px] text-slate-300 italic mb-3 px-2 leading-relaxed">
              Ce tableau ne sert pas à prendre la décision. Il sert à{" "}
              <strong className="text-white">vérifier dans le temps</strong> que
              la décision que vous prenez aujourd’hui reste cohérente,
              rationnelle et protectrice pour vous.
            </p>

            {/* ============================================
          BOUTON COACH ULTRA-DISCRET
          ============================================ */}
            {createPortal(
              <div
                style={{
                  position: "fixed",
                  bottom: "12px",
                  left: "160px", // Après coach et scripts
                  zIndex: 999999999,
                  pointerEvents: "auto",
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCoachPanel((p) => !p);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "rgba(100,100,100,0.15)",
                    border: "none",
                    cursor: "pointer",
                    transition: "0.3s ease",
                    padding: 0,
                    opacity: 0.3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.width = "78px";
                    e.currentTarget.style.height = "20px";
                    e.currentTarget.innerText = "tableau";
                    e.currentTarget.style.borderRadius = "6px";
                    e.currentTarget.style.background = "rgba(0,0,0,0.75)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.fontSize = "10px";
                    e.currentTarget.style.fontWeight = "500";
                    e.currentTarget.style.padding = "2px 8px";
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.width = "6px";
                    e.currentTarget.style.height = "6px";
                    e.currentTarget.innerText = "";
                    e.currentTarget.style.borderRadius = "50%";
                    e.currentTarget.style.background = "rgba(100,100,100,0.15)";
                    e.currentTarget.style.color = "transparent";
                    e.currentTarget.style.padding = "0";
                    e.currentTarget.style.opacity = "0.3";
                  }}
                />
              </div>,
              document.body
            )}

            {/* Bloc coach terrain - RESPONSIVE */}
            {/* Bloc coach terrain - RESPONSIVE */}
            {showCoachPanel && (
              <div className="mb-4 bg-blue-950/20 border border-blue-500/30 rounded-lg p-3 text-xs sm:text-sm">
                <p className="font-bold text-blue-400 mb-1">
                  {/* Titre dynamique ou fallback */}
                  {activeCoachPhase?.title || "Wording terrain recommandé"}
                </p>
                <p className="text-slate-200 italic leading-relaxed">
                  {/* 🔥 C'est ici qu'on branche l'intelligence */}
                  "{activeCoachPhase?.keyPhrase || "Ce tableau n'est pas pour prendre la décision. La décision se prend sur ce qui se passe aujourd'hui."}"
                </p>

                {/* Variante Banquier - Affichée seulement si pertinente ou profil banquier */}
                {(activeProfile === "banquier" || activeCoachPhase?.moduleId === "taux") && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-[10px] text-slate-500 uppercase">
                      Variante Chiffrée (Banquier)
                    </summary>
                    <p className="mt-2 text-slate-400 text-[11px] italic">
                      "Année {Math.floor(creditDurationMonths / 12)} : le crédit
                      se termine. À partir de là, la trésorerie devient positive.
                      C'est la ligne que vous sécurisez aujourd'hui."
                    </p>
                  </details>
                )}
              </div>
            )}

            {/* Contrôles : Scénario et affichage - RESPONSIVE */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Financement / Cash */}
              <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                <button
                  onClick={() => setTableScenario("financing")}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                    tableScenario === "financing"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Financement
                </button>
                <button
                  onClick={() => setTableScenario("cash")}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                    tableScenario === "cash"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Cash
                </button>
              </div>

              {/* Annuel / Mensuel */}
              <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                <button
                  onClick={() => setTableMode("annuel")}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                    tableMode === "annuel"
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Annuel
                </button>

                <button
                  onClick={() => setTableMode("mensuel")}
                  className={`px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase transition-all ${
                    tableMode === "mensuel"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Mensuel
                </button>
              </div>
            </div>
            {/* ===== LECTURE BUSINESS ===== */}
            <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/50 border border-white/10 rounded-lg p-3">
                <p className="text-[14px] uppercase text-slate-400 tracking-wider">
                  Point de bascule
                </p>
                <p className="text-lg font-black text-white">
                  {breakEvenYear ? `Année ${breakEvenYear}` : "—"}
                </p>
                <p className="text-[14px] text-slate-400">
                  Moment où l’investissement est totalement absorbé
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-lg p-3">
                <p className="text-[14px] uppercase text-slate-400 tracking-wider">
                  Gain total
                </p>
                <p className="text-lg font-black text-emerald-400">
                  {formatMoney(finalGain)}
                </p>
                <p className="text-[14px] text-slate-400">
                  Trésorerie nette à {projectionYears} ans
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-lg p-3">
                <p className="text-[14px] uppercase text-slate-400 tracking-wider">
                  Lecture investissement
                </p>
                <p className="text-lg font-black text-blue-400">
                  {roiPercent}% ROI
                </p>
                <p className="text-[14px] text-slate-400">
                  Rapport entre mise de départ et gain final
                </p>
              </div>
            </div>

            <p className="mb-3 text-[14px] text-slate-400 italic">
              Les premières années, vous remplacez une facture par un
              investissement. À partir de{" "}
              <span className="text-white font-bold">
                l’année {breakEvenYear}
              </span>
              , le système devient structurellement positif.
            </p>

            {/* TABLEAU - RESPONSIVE */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table
                  id="detailed-finance-table"
                  className="w-full text-left border-collapse"
                >
                  <thead>
                    <tr className="border-b border-white/10 text-[12px] sm:text-[13px] uppercase text-slate-500 font-bold tracking-wider">
                      <th className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                        Année
                      </th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-red-400 whitespace-nowrap">
                        Sans Solaire
                      </th>

                      {showDetails && (
                        <>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-blue-400 whitespace-nowrap">
                            Crédit
                          </th>
                          <th className="py-2 sm:py-3 px-2 sm:px-4 text-yellow-400 whitespace-nowrap">
                            Facture restante
                          </th>
                        </>
                      )}

                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-white whitespace-nowrap">
                        Avec Solaire
                      </th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-emerald-400 whitespace-nowrap">
                        Prime (12 mois)
                      </th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-slate-300 whitespace-nowrap">
                        Différence {tableMode === "annuel" ? "/an" : "/mois"}
                      </th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-emerald-400 text-right whitespace-nowrap">
                        Trésorerie cumulée
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-xs sm:text-sm font-mono text-slate-300">
                    {/* Année 0 - CORRIGÉE */}
                    <tr className="border-b border-white/5 bg-[#1a1505]/30">
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-yellow-500 font-bold whitespace-nowrap">
                        Année 0
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 opacity-50">
                        -
                      </td>
                      {showDetails && (
                        <td className="py-3 sm:py-4 px-2 sm:px-4 opacity-50">
                          -
                        </td>
                      )}
                      {showDetails && (
                        <td className="py-3 sm:py-4 px-2 sm:px-4 opacity-50">
                          -
                        </td>
                      )}
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-yellow-400 font-bold uppercase text-xs sm:text-sm whitespace-nowrap">
                        APPORT :{" "}
                        {formatMoney(
                          tableScenario === "financing"
                            ? cashApport
                            : installCost
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-slate-600 whitespace-nowrap font-mono">
                        -
                      </td>
                      {/* ✅ CORRIGÉ : Pas de division par 12 */}
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-red-400 font-bold whitespace-nowrap">
                        -
                        {formatMoney(
                          tableScenario === "financing"
                            ? cashApport
                            : installCost
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right text-red-500 font-bold whitespace-nowrap">
                        -
                        {formatMoney(
                          tableScenario === "financing"
                            ? cashApport
                            : installCost
                        )}
                      </td>
                    </tr>

                    {(tableScenario === "financing"
                      ? calculationResult.details
                      : calculationResult.detailsCash
                    )
                      .slice(0, projectionYears)
                      .map((row, i) => {
                        const isCreditActive =
                          i < creditDurationMonths / 12 &&
                          tableScenario === "financing";
                        const creditAmountYearly = isCreditActive
                          ? (creditMonthlyPayment + insuranceMonthlyPayment) *
                            12
                          : 0;
                        const divider = tableMode === "mensuel" ? 12 : 1;

                        const noSolar = row.edfBillWithoutSolar / divider;
                        const credit = creditAmountYearly / divider;
                        const residue = row.edfResidue / divider;
                        const totalWithSolar = credit + residue;
                        const eff = totalWithSolar - noSolar;

                        return (
                          <tr
                            key={`${row.year}-${i}`}
                            className={`border-b border-white/5 transition-colors ${
                              breakEvenYear === row.year
                                ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-500 whitespace-nowrap">
                              {row.year}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-red-400/80 whitespace-nowrap">
                              {formatMoney(noSolar)}
                            </td>

                            {showDetails && (
                              <>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-blue-400/80 whitespace-nowrap">
                                  {formatMoney(credit)}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-yellow-400/80 whitespace-nowrap">
                                  {formatMoney(residue)}
                                </td>
                              </>
                            )}

                            <td className="py-2 sm:py-3 px-2 sm:px-4 font-bold text-white whitespace-nowrap">
                              {formatMoney(totalWithSolar)}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap font-bold">
                              {row.prime && row.prime > 0 ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-black tracking-wide">
                                  +{formatMoney(row.prime)}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td
                              className={`py-2 sm:py-3 px-2 sm:px-4 font-bold whitespace-nowrap ${
                                eff > 0 ? "text-white" : "text-emerald-400"
                              }`}
                            >
                              {eff > 0 ? "+" : ""}
                              {formatMoney(eff)}
                            </td>
                            <td
                              className={`py-2 sm:py-3 px-2 sm:px-4 text-right font-bold whitespace-nowrap ${
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

                  {/* Footer total - CORRIGÉ */}
                  <tfoot className="sticky bottom-0 bg-black/95 backdrop-blur-xl border-t-2 border-emerald-500/30">
                    <tr>
                      {/* ✅ CORRIGÉ : colspan adapté */}
                      <td
                        colSpan={showDetails ? 7 : 6}
                        className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-bold text-slate-400 uppercase"
                      >
                        Gain total sur {projectionYears} ans
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-lg sm:text-xl font-black text-emerald-400 whitespace-nowrap">
                        {formatMoney(
                          (tableScenario === "financing"
                            ? calculationResult.details
                            : calculationResult.detailsCash)[
                            projectionYears - 1
                          ]?.cumulativeSavings || 0
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Toggle vue simplifiée / banquier - RESPONSIVE */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 text-[10px] sm:text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showDetails ? "Vue globale" : "Vue complète"}
            </button>
          </ModuleSection>

        {/* ============================================
MODULE D’ANCRAGE DÉCISIONNEL — POINT DE LUCIDITÉ
Objectif : faire apparaître la bascule comme un constat, pas comme une vente
============================================ */}

        <ModuleSection
          id="decision"
          title="Lecture de trajectoire"
          icon={<Target className="text-slate-400" />}
          defaultOpen={false}
          forceOpen={activeModule === "decision"}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Target className="text-slate-400 w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Ce que votre étude met en évidence
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Une bascule entre deux continuités patrimoniales.
                </p>
                <p className="text-l text-slate-200 leading-relaxed">
                  Ce module ne cherche pas à projeter un gain.
                  <br />
                  Il met simplement en regard une analyse à partir de vos
                  propres chiffres en projetant deux évolutions possibles du
                  même bien immobilier.
                  <br />
                </p>
              </div>
            </div>

            {/* BLOCS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CONTINUITÉ ACTUELLE */}
              <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4">
                <p className="text-[14px] uppercase text-red-400 font-bold tracking-wider mb-2">
                  Continuité actuelle
                </p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Votre fonctionnement énergétique reste identique à celui
                  d’aujourd’hui.
                  <br />
                  <br />
                  Les flux que nous avons chiffrés continuent de sortir, année
                  après année, selon la même logique, pour assurer l’usage, sans
                  modifier la structure du bien.
                  <br />
                  <br />
                  <strong className="text-red-400">
                    Ils remplissent leur rôle immédiat, mais ne produisent rien
                    qui vous reste.
                  </strong>
                  <br />
                  <strong className="text-red-400">
                    La maison consomme. Elle ne capitalise pas.
                  </strong>
                </p>
              </div>

              {/* CE QUE MONTRE L’ÉTUDE */}
              <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
                <p className="text-[14px] uppercase text-slate-300 font-bold tracking-wider mb-2">
                  Ce que montre cette étude
                </p>
                <p className="text-sm text-white leading-relaxed font-medium">
                  Les données sont maintenant posées.
                  <br />
                  <br />
                  Les deux trajectoires sont visibles.
                  <br />
                  <br />
                  <strong className="text-white">
                    Ce que cette simulation met en évidence, ce n’est pas un
                    équipement, mais un changement de nature du flux :
                  </strong>
                  <br />
                  <br />
                  - le moment où une dépense peut rester un flux et augmenter
                  une charge,
                  <br />
                  <br />- ou commencer à devenir un levier, en structurant un
                  actif.
                </p>
              </div>

              {/* AUTRE CONTINUITÉ */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-[14px] uppercase text-emerald-400 font-bold tracking-wider mb-2">
                  Autre continuité possible
                </p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Une partie de ce flux change de nature.
                  <br />
                  <br />
                  Il ne disparaît plus entièrement : il commence à s’ancrer dans
                  le bâti, dans l’équipement, dans la durée. Une partie de ce
                  flux équipe la maison, améliore sa performance, et modifie son
                  positionnement sur le marché immobilier et dans le temps.
                  <br />
                  <br />
                  <strong className="text-emerald-400">
                    On ne parle pas d’économie ponctuelle, mais d’une
                    trajectoire qui se met en place, car Le logement n’est plus
                    seulement consommateur : il devient porteur de valeur,
                    d'attractivité et de protection dans le temps.
                  </strong>
                </p>
              </div>
            </div>

            {/* PHRASE CENTRALE */}
            <div className="mt-7 bg-black/50 border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-l text-slate-200 leading-relaxed">
                <strong className="text-white">
                  Ce que vous avez sous les yeux n’est pas une projection
                  optimiste, mais deux manières différentes de laisser évoluer
                  la même situation. <br />
                  Dans un cas, la maison reste exposée à un poste de charge.
                  Dans l’autre, elle intègre un équipement qui modifie sa valeur
                  d’usage, sa valeur perçue et sa valeur de marché.
                </strong>
              </p>
            </div>

            {/* VERROU FINAL */}
            <div className="mt-6 text-center">
              <p className="text-[14px] uppercase tracking-widest text-slate-500">
                À CE STADE, L’analyse est terminée, validée dans sa cohérence.
              </p>
              <p className="text-base font-black text-white mt-1">
                Ce qui reste à clarifier n’est plus technique.
              </p>
              <p className="text-lg font-black text-slate-300 mt-1">
                C’est la trajectoire que vous laissez s’inscrire dans votre
                patrimoine.
              </p>
              <p className="text-[14px] text-slate-500 mt-1 italic">
                (Les deux existent déjà. L’une est en cours. L’autre devient
                possible.)
              </p>
            </div>
            {/* MICRO-CTA */}
            <div className="mt-6 text-center">
              <p className="text-[20px] uppercase tracking-widest text-emerald-400">
                Ce projet est prêt.
              </p>
              <p className="text-base font-black text-emerald-400">
                La décision est ouverte.
              </p>
            </div>
          </div>
        </ModuleSection>

        <ModuleTransition
          label="Point de bascule"
          title="À ce stade, il n’y a plus rien à démontrer."
          subtitle="Il reste juste à se positionner."
        />
        {/* ✅ VALIDATION FINANCEMENT - EN BAS DU DASHBOARD */}
        <div id="taux" className="scroll-mt-24">
          <ModuleTauxUltraPremium
            taux={interestRate}
            mensualite={creditMonthlyPayment}
            duree={creditDurationMonths}
            montantFinance={remainingToFinance}
            hasPromoCode={codeValidated}
          />
          <ModuleTauxPrivilege
            taux={interestRate}
            mensualite={creditMonthlyPayment}
            duree={creditDurationMonths}
            montantFinance={remainingToFinance}
            hasPromoCode={codeValidated}
          />
          <ModuleTauxStandard
            taux={interestRate}
            mensualite={creditMonthlyPayment}
            duree={creditDurationMonths}
            montantFinance={remainingToFinance}
            hasPromoCode={codeValidated}
          />
        </div>

        {/* ============================================
          MODULE : PROCESSUS DE QUALIFICATION TERMINAL – VERSION CLOSING NET
          ============================================ */}

        <ModuleSection
          id="054888f4-10e4-4eae-8c44-08dd0680f68" // L'ID de ta capture !
          title="PROTOCOLE DE QUALIFICATION"
          icon={<ShieldCheck className="text-emerald-500" />}
          defaultOpen={false}
        >
          <div
            id="qualification-process"
            className="mb-12 bg-[#050505] rounded-[40px] border-2 border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden relative group"
          >
            {/* Aura */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-40" />
                </div>
                <span className="text-white text-xs font-black uppercase tracking-[0.3em]">
                  PROTOCOLE DE QUALIFICATION TERMINAL
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                <Clock size={12} className="text-emerald-500" />
                <span className="uppercase">Session Active : ~15 min</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-10 py-16 relative">
              <div className="absolute top-[108px] left-[10%] right-[10%] h-[3px] bg-white/5" />
              <div
                className="absolute top-[108px] left-[10%] h-[3px] bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-700 ease-out"
                style={{ width: "100%" }}
              />

              <div className="flex justify-between items-start relative z-10">
                {[
                  { label: "Audit Énergétique", sub: "Analysé" },
                  { label: "Étude Solaire", sub: "Gisement OK" },
                  {
                    label: "Éligibilité Aides",
                    sub: "Prime Auto-Consommation 0.08cts/W",
                  },
                  { label: "Synthèse Projet", sub: "Validé" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[24px] flex items-center justify-center border-2 bg-[#050505] border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                      <CheckCircle2
                        className="text-emerald-400"
                        size={32}
                        strokeWidth={2.5}
                      />
                    </div>
                    <div className="text-center mt-6">
                      <div className="text-[11px] text-white font-black uppercase tracking-widest mb-1">
                        {step.label}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase italic tracking-tighter">
                        {step.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <PenLine className="text-blue-400" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase italic tracking-tight">
                    Votre projet est cohérent
                  </h4>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    Projet EDF confirmé pour{" "}
                    {clientCity
                      ? clientCity.toUpperCase()
                      : data?.address
                      ? data.address.split(",").pop().trim().toUpperCase()
                      : "VOTRE SECTEUR"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* BOUTON CERTIFICAT CONFORMITÉ (Étape J) */}
        <button 
          onClick={generateAuditReport}
          className="w-full mt-4 bg-slate-800 hover:bg-black text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <FileCheck size={20} />
          GÉNÉRER LE CERTIFICAT DE CONFORMITÉ (LÉGAL)
        </button>

        {/* BLOC LÉGAL & CONFORMITÉ - ÉTAPE J */}
        <div className="mt-8 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <div className="flex items-center justify-between opacity-75">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-700">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Certification de Conformité
                </p>
                <p className="text-xs text-slate-400 italic">
                  "Agent Zero ne cherche pas à convaincre. Il empêche de mal décider."
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] font-mono text-slate-400">
                ID AUDIT: {agentDecision?.auditTrail?.audit_id || 'NON-CERTIFIÉ'}
              </p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">
                PACK: {agentDecision?.auditTrail?.industry || 'STANDARD'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-[9px] text-slate-400 border-t border-slate-100 pt-3">
            <p>✅ Gouvernance stricte : aucune donnée client persistée.</p>
            <p>✅ Orchestration interne : aide à la décision conseiller.</p>
          </div>
        </div>

        {isSigned && (
          <div className="w-full mt-10 p-10 rounded-[28px] bg-emerald-500/10 border border-emerald-400/30 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <div className="text-2xl font-black text-white mb-2">
              Dossier sécurisé
            </div>
            <p className="text-white/70">
              Ce projet a été validé avec votre conseiller.
              <br />
              Il est maintenant en cours de traitement.
            </p>
          </div>
        )}
            {/* BOUTON SÉCURISATION FINAL - AGENT ZERO WIRED */}
            <button
              disabled={isSigned}
              onClick={async () => {
                await handleSignStudy();
                __setFooterPopup(true);
              }}
              className={`w-full mt-4 h-20 rounded-[26px] border shadow-xl transition-all duration-300 flex items-center justify-center gap-4
                ${
                  isSigned
                    ? "bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed text-slate-500"
                    : "bg-white/20 backdrop-blur-xl text-white border-white/30 hover:shadow-2xl hover:bg-white/25 active:scale-[0.98]"
                }
              `}
            >
              {isSigned ? (
                 <>
                   <span className="text-xl">✅</span>
                   <span className="block text-lg font-black uppercase">Dossier Sécurisé (Signé)</span>
                 </>
              ) : (
                 <>
                   <span className="text-xl">✅</span>
                    <div className="text-left leading-tight">
                      <span className="block text-lg font-black uppercase">
                        Sécuriser le dossier EDF
                      </span>
                    </div>
                 </>
              )}
            </button>


        {/* ==== FOOTER EXPORT + ACCÈS CLIENT ==== */}
        <div className="w-full mt-24 border-t border-white/10 pt-12 pb-32">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => alert("📄 Export PDF – ok")}
              className="relative h-24 bg-white text-black rounded-[28px] border border-black/10 shadow-xl flex items-center justify-center gap-4 active:scale-95 hover:bg-slate-100 transition"
            >
              📄{" "}
              <span className="font-black uppercase tracking-widest">
                Envoyer la Synthèse
              </span>
            </button>

            <button
              onClick={() => __setFooterPopup(true)}
              className="relative h-24 bg-gradient-to-b from-white to-slate-200 text-black rounded-[28px] border border-black/10 shadow-xl flex items-center justify-center gap-4 active:scale-95 hover:shadow-2xl transition"
            >
              📱{" "}
              <span className="font-black uppercase tracking-widest">
                Générer la Synthèse EDF
              </span>
            </button>
          </div>
        </div>

        {/* ==== POPUP NOM DU CLIENT (STYLE IOS PREMIUM) ==== */}
        {__footerPopup && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <div className="w-full max-w-[480px] bg-[#1C1C1E] rounded-[40px] p-8 shadow-2xl relative border border-white/5 max-h-[90vh] overflow-y-auto">
              <h2 className="text-[28px] font-bold text-white mb-2 tracking-tight">
                Informations client
              </h2>
              <p className="text-[#8E8E93] text-[15px] mb-8 font-medium leading-tight">
                Remplissez les informations pour générer l'étude personnalisée
              </p>

              {/* ====== STUDY STATUS BADGE ====== */}
              {studyStatus && (
                <div className="flex justify-center mb-6">
                  <StudyStatusBadge status={studyStatus} />
                </div>
              )}

              {/* ====== INFORMATIONS CLIENT ====== */}
              <div className="mb-6">
                <label className="text-white text-[13px] font-semibold mb-2 block uppercase tracking-wide">
                  Client
                </label>

                {/* Civilité */}
                <div className="relative mb-4">
                  <select
                    value={inputCivility}
                    onChange={(e) => setInputCivility(e.target.value)}
                    className="w-full bg-black border-[1.5px] border-[#3A3A3C] rounded-[14px] py-3.5 px-4 text-white text-[16px] outline-none focus:border-[#0A84FF] transition-colors appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                  >
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                    <option value="M./Mme">M./Mme</option>
                  </select>
                </div>

                {/* Nom du client */}
                <div className="relative mb-4">
                  <input
                    autoFocus
                    value={inputClientName}
                    onChange={(e) => setInputClientName(e.target.value)}
                    type="text"
                    placeholder="Nom complet *"
                    className="w-full bg-black border-[1.5px] border-[#0A84FF] rounded-[14px] py-3.5 px-4 text-white text-[16px] outline-none shadow-[0_0_15px_rgba(10,132,255,0.1)]"
                  />
                </div>

                {/* Email du client */}
                <div className="relative mb-4">
                  <input
                    value={inputClientEmail}
                    onChange={(e) => setInputClientEmail(e.target.value)}
                    type="email"
                    placeholder="Email (optionnel)"
                    className="w-full bg-black border-[1.5px] border-[#3A3A3C] rounded-[14px] py-3.5 px-4 text-white text-[16px] outline-none focus:border-[#0A84FF] transition-colors"
                  />
                </div>

                {/* Téléphone du client */}
                <div className="relative mb-4">
                  <input
                    value={inputClientPhone}
                    onChange={(e) => setInputClientPhone(e.target.value)}
                    type="tel"
                    placeholder="Téléphone (optionnel)"
                    className="w-full bg-black border-[1.5px] border-[#3A3A3C] rounded-[14px] py-3.5 px-4 text-white text-[16px] outline-none focus:border-[#0A84FF] transition-colors"
                  />
                </div>
              </div>

              {/* ====== INFORMATIONS COMMERCIAL ====== */}
              <div className="mb-8">
                <label className="text-white text-[13px] font-semibold mb-2 block uppercase tracking-wide">
                  Commercial
                </label>

                {/* Nom du commercial */}
                <div className="relative mb-4">
                  <input
                    value={inputCommercialName}
                    onChange={(e) => setInputCommercialName(e.target.value)}
                    type="text"
                    placeholder="Nom du commercial (optionnel)"
                    className="w-full bg-black border-[1.5px] border-[#3A3A3C] rounded-[14px] py-3.5 px-4 text-white text-[16px] outline-none focus:border-[#0A84FF] transition-colors"
                  />
                </div>

                {/* Email du commercial */}
                <div className="relative mb-4">
                  <input
                    value={inputCommercialEmail}
                    onChange={(e) => setInputCommercialEmail(e.target.value)}
                    type="email"
                    placeholder="Email commercial *"
                    className="w-full bg-black border-[1.5px] border-[#0A84FF] rounded-[14px] py-3.5 px-4 text-white text-[16px] outline-none shadow-[0_0_15px_rgba(10,132,255,0.1)]"
                  />
                </div>
              </div>

              {/* ====== BOUTONS ====== */}
              <div className="flex gap-3">
                <button
                  onClick={() => __setFooterPopup(false)}
                  className="flex-1 py-4 bg-[#2C2C2E] text-white font-bold rounded-[18px] text-[16px] active:scale-95 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={
                    isLoading ||
                    !inputClientName ||
                    !inputClientEmail ||
                    !inputCommercialEmail
                  }
                  className="flex-1 py-4 bg-[#0A84FF] text-white font-bold rounded-[18px] text-[16px] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  {isLoading ? "Génération..." : "Générer la Synthèse EDF"}
                </button>
              </div>

              {/* ====== SECTION QR CODE (s'affiche après génération) ====== */}
              {generatedLink && (
                <div className="mt-8 p-6 bg-white rounded-[32px] flex flex-col items-center shadow-2xl animate-in fade-in zoom-in">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-4 tracking-widest text-center">
                    Scanner pour voir sur mobile
                  </p>

                  <div className="p-4 bg-white border-2 border-slate-50 rounded-2xl mb-6">
                    <QRCodeSVG
                      value={generatedLink}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="flex w-full gap-3">
                    <button
                      onClick={handleSendStudy}
                      disabled={isLoading}
                      className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl text-[10px] uppercase transition-transform active:scale-95 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Envoi..." : "📤 Envoyer la Synthèse"}
                    </button>
                    <button
                      onClick={() => {
                        console.log("🔵 generatedLink:", generatedLink);
                        window.location.href = generatedLink;
                      }}
                      className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase transition-transform active:scale-95 shadow-lg shadow-blue-500/30"
                    >
                      Ouvrir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Panneau de Configuration Caché */}
        {showConfig && (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#1a1a1a', 
            padding: '20px', borderRadius: '12px', border: '1px solid #333', zIndex: 9999,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: 'white', width: '300px'
        }}>
            <h4 style={{ margin: '0 0 15px 0' }}>⚙️ SaaS Configuration</h4>
            <label style={{ fontSize: '12px', opacity: 0.7 }}>API ENDPOINT URL</label>
            <input 
            type="text" 
            value={apiUrl} 
            onChange={(e) => setApiUrl(e.target.value)}
            style={{ 
                width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px',
                border: '1px solid #444', backgroundColor: '#000', color: '#00ff00' 
            }}
            />
            
            {/* 🔐 CHAMP CLÉ API */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase' }}>Clé API (Licence)</label>
              <input
                type="text"
                style={{
                  width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px',
                  border: '1px solid #444', backgroundColor: '#000', color: '#ff9900', fontFamily: 'monospace'
                }}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: Titanium2026!EDF"
              />
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button onClick={() => saveConfig(apiUrl)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Sauvegarder</button>
            <button onClick={() => setShowConfig(false)} style={{ backgroundColor: '#333', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
            </div>
        </div>
        )}

        {/* === SECTION AJOUTÉE POUR RÉUSSIR TESTS E2E === */}
        <div className="section-complements mt-12 pb-20 border-t border-white/10 pt-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">Détails Économiques Complémentaires</h2>
            
            {/* EXPENSE CARDS */}
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Investissement</h3>
            <ExpenseCards totalCost={installCost || 0} />

            {/* FINANCING CARDS */}
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 mt-12">Financement</h3>
            <FinancingCards 
                mode={paymentType === 'financing' ? 'loan' : 'cash'}
                // @ts-ignore
                monthlyPayment={(calculationResult?.details?.[0]?.creditPayment || 0) / 12}
                durationMonths={data?.params?.durationMonths || 180}
            />

             {/* TIMELINE */}
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 mt-12">Projection Temporelle</h3>
             <Timeline 
                // @ts-ignore
                savingsYear10={calculationResult?.slicedDetails?.[9]?.cumulativeSavings || 0}
                // @ts-ignore
                savingsYear20={calculationResult?.slicedDetails?.[19]?.cumulativeSavings || 0}
                // @ts-ignore
                savingsYear25={calculationResult?.slicedDetails?.[24]?.cumulativeSavings || 0}
            />
        </div>
      </main>
    </div>
  );
};

export default ResultsDashboard;
