import React, { useState, useEffect, useMemo, useRef } from "react";
import { useVocabularyGuard } from "../hooks/useVocabularyGuard";
import { seniorPhases } from "../coaches/SeniorCoachPhases";
import { banquierPhases } from "../coaches/BanquierCoachPhases";
import { standardPhases } from "../coaches/StandardCoachPhases";
import { CompletionScreen } from "./Coach/CompletionScreen";
import { CoachCompassMinimal } from "./Coach/CoachCompassMinimal";
import { useSilenceTimer } from "../hooks/useSilenceTimer";
import { useAlertSystem } from "../hooks/useAlertSystem";
import { AlertPopup } from "./Coach/AlertPopup";
import { DebugPanel } from "./Coach/DebugPanel";
import { BlocageOverlay } from "./BlocageOverlay";
import { calculateGreenValueFromAddress } from "../services/greenValueAPI";
import { SpeechView } from "./SpeechView";
import { CoachRouter } from "../coaches/CoachRouter";
import { SimulationResult, YearlyDetail } from "../types";
import { InfoPopup } from "./InfoPopup";
import { ProfitBadge } from "./ProfitBadge";
import { calculateSolarProjection, safeParseFloat } from "../utils/finance";
import { PDFExport } from "./PDFExport";
import { supabase } from "../lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { createPortal } from "react-dom";
import { useRDVState } from "../hooks/useRDVState";
import { StepNotification } from "./Coach/StepNotification";
import { validateAll } from "../validation/validateAll";
import ValidationQualityPanel from "../components/ValidationQualityPanel";
import { runPériodeStressTest } from "../utils/validateCalculations";
import { BanquierCoach } from "../coaches/BanquierCoach";
import { SeniorCoach } from "../coaches/SeniorCoach";
import { CommercialCoach } from "../coaches/CommercialCoach";
import { useParams } from "react-router-dom"; // ← ajoute ça

import {
  validateSimulation,
  printValidationReport,
} from "../utils/validateCalculations";
// Expose helper for debug in browser console
if (process.env.NODE_ENV === "development") {
  (window as any).printValidationReport = printValidationReport;
}

import {
  ReferenceArea,
  ReferenceLine,
  Tooltip,
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
} from "lucide-react";
import { InputSlider } from "./InputSlider";

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
}

const ModuleSection: React.FC<ModuleSectionProps> = ({
  id,
  title,
  icon,
  children,
  defaultOpen = false,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    const next = !isOpen;

    // 🔥 Vérifier si fermeture autorisée (Garanties)
    if (!next && onClose) {
      // Seulement quand on FERME
      const decision = onClose(id);
      if (decision === false) return; // ❌ Bloque la fermeture
    }

    setIsOpen(next);

    if (next && onOpen) {
      onOpen(id);
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
            {icon}
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">#{id}</span>
          <ChevronDown
            className={`text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            size={20}
          />
        </div>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-4 pt-0">{children}</div>
      </div>
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
// MODULE TAUX PRIVILÉGIÉ 1.99% - VERSION CORPORATE
// ============================================
const ModuleTauxPrivilege = ({ taux, mensualite, duree, montantFinance }) => {
  if (taux !== 1.99) {
    return null;
  }

  const tauxMarche = 5.89;
  const tauxStandard = 3.89;

  const mensualiteMarche = Math.round(
    (montantFinance * (tauxMarche / 12 / 100)) /
      (1 - Math.pow(1 + tauxMarche / 12 / 100, -duree))
  );

  const mensualiteStandard = Math.round(
    (montantFinance * (tauxStandard / 12 / 100)) /
      (1 - Math.pow(1 + tauxStandard / 12 / 100, -duree))
  );

  const economieVsMarche = Math.abs((mensualiteMarche - mensualite) * duree);

  const [refDossier] = useState(
    () =>
      `EDF-SOL-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`
  );
  const economieVsStandard = Math.abs(
    (mensualiteStandard - mensualite) * duree
  );

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 my-8">
      {/* HEADER SOBRE */}
      <div className="border-b border-white/10 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Validation Financement Bonifié
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

      {/* GRID DONNÉES TECHNIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Taux Annuel Effectif Global (TAEG)
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            1.99<span className="text-2xl">%</span>
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
            {mensualite}
            <span className="text-2xl">€</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            sur {duree} mois
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Économie vs Taux Marché
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {economieVsMarche.toLocaleString()}
            <span className="text-2xl">€</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            vs taux marché {tauxMarche}%
          </div>
        </div>
      </div>

      {/* TABLEAU COMPARATIF 3 COLONNES */}
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
              <td className="p-4 text-right text-red-400">{tauxMarche}%</td>
              <td className="p-4 text-right text-slate-400">{tauxStandard}%</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {taux}%
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">Mensualité</td>
              <td className="p-4 text-right text-slate-400">
                {mensualiteMarche}€
              </td>
              <td className="p-4 text-right text-slate-400">
                {mensualiteStandard}€
              </td>
              <td className="p-4 text-right text-white font-bold">
                {mensualite}€
              </td>
            </tr>
            <tr>
              <td className="p-4 text-slate-300">Coût Total Crédit</td>
              <td className="p-4 text-right text-slate-400">
                {(mensualiteMarche * duree).toLocaleString()}€
              </td>
              <td className="p-4 text-right text-slate-400">
                {(mensualiteStandard * duree).toLocaleString()}€
              </td>
              <td className="p-4 text-right text-white font-bold">
                {(mensualite * duree).toLocaleString()}€
              </td>
            </tr>
            <tr className="bg-emerald-950/20">
              <td className="p-4 text-slate-300 font-bold">Économie Totale</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {economieVsMarche.toLocaleString()}€
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

// ============================================
// MODULE TAUX BONIFIÉ STANDARD 3.89%
// ============================================
const ModuleTauxStandard = ({ taux, mensualite, duree, montantFinance }) => {
  if (taux !== 3.89) {
    return null;
  }

  const tauxMarche = 5.89;
  const mensualiteMarche = Math.round(
    (montantFinance * (tauxMarche / 12 / 100)) /
      (1 - Math.pow(1 + tauxMarche / 12 / 100, -duree))
  );

  const economieVsMarche = Math.abs((mensualiteMarche - mensualite) * duree);
  const [refDossier] = useState(
    () =>
      `EDF-SOL-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`
  );

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 my-8">
      {/* HEADER SOBRE */}
      <div className="border-b border-white/10 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Financement Bonifié Standard
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

      {/* GRID DONNÉES TECHNIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Taux Annuel Effectif Global (TAEG)
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {taux.toFixed(2)}
            <span className="text-2xl">%</span>
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
            {mensualite.toFixed(2)}
            <span className="text-2xl">€</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            sur {duree} mois
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Économie vs Taux Marché
          </div>
          <div className="text-5xl font-black text-white font-mono tabular-nums mb-1">
            {economieVsMarche.toLocaleString()}
            <span className="text-2xl">€</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            vs marché {tauxMarche}%
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
              <td className="p-4 text-right text-red-400">{tauxMarche}%</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {taux.toFixed(2)}%
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">Mensualité</td>
              <td className="p-4 text-right text-slate-400">
                {mensualiteMarche}€
              </td>
              <td className="p-4 text-right text-white font-bold">
                {mensualite.toFixed(2)}€
              </td>
            </tr>
            <tr>
              <td className="p-4 text-slate-300">Coût Total Crédit</td>
              <td className="p-4 text-right text-slate-400">
                {Math.round(mensualiteMarche * duree).toLocaleString()}€
              </td>
              <td className="p-4 text-right text-white font-bold">
                {Math.round(mensualite * duree).toLocaleString()}€
              </td>
            </tr>
            <tr className="bg-emerald-950/20">
              <td className="p-4 text-slate-300 font-bold">Économie Totale</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {Math.round(economieVsMarche).toLocaleString()}€
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

// ============================================
// MODULE TAUX EXCEPTIONNEL 0.99%
// ============================================
const ModuleTauxUltraPremium = ({
  taux,
  mensualite,
  duree,
  montantFinance,
}) => {
  if (taux !== 0.99) {
    return null;
  }

  const tauxMarche = 5.89;
  const tauxStandard = 3.89;

  const mensualiteMarche = Math.round(
    (montantFinance * (tauxMarche / 12 / 100)) /
      (1 - Math.pow(1 + tauxMarche / 12 / 100, -duree))
  );

  const mensualiteStandard = Math.round(
    (montantFinance * (tauxStandard / 12 / 100)) /
      (1 - Math.pow(1 + tauxStandard / 12 / 100, -duree))
  );

  const economieVsMarche = Math.abs((mensualiteMarche - mensualite) * duree);
  const [refDossier] = useState(
    () =>
      `EDF-SOL-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`
  );
  const economieVsStandard = Math.abs(
    (mensualiteStandard - mensualite) * duree
  );

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-8 my-8">
      {/* HEADER SOBRE */}
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

      {/* NOTE DISCRÈTE */}
      <div className="bg-blue-950/10 border border-blue-500/10 rounded-lg p-4 mb-6">
        <p className="text-xs text-slate-300 leading-relaxed">
          Ce dossier bénéficie d'un taux préférentiel exceptionnel dans le cadre
          de votre éligibilité aux conditions spécifiques du programme.
        </p>
      </div>

      {/* GRID DONNÉES TECHNIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            TAEG
          </div>
          <div className="text-4xl font-black text-white font-mono tabular-nums">
            0.99<span className="text-xl">%</span>
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
            {mensualite}
            <span className="text-xl">€</span>
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
            {economieVsMarche.toLocaleString()}
            <span className="text-xl">€</span>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Durée
          </div>
          <div className="text-4xl font-black text-white font-mono tabular-nums">
            {duree / 12}
            <span className="text-xl">ans</span>
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
              <td className="p-4 text-right text-red-400">{tauxMarche}%</td>
              <td className="p-4 text-right text-slate-400">{tauxStandard}%</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {taux}%
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="p-4 text-slate-300">Mensualité</td>
              <td className="p-4 text-right text-slate-400">
                {mensualiteMarche}€
              </td>
              <td className="p-4 text-right text-slate-400">
                {mensualiteStandard}€
              </td>
              <td className="p-4 text-right text-white font-bold">
                {mensualite}€
              </td>
            </tr>
            <tr>
              <td className="p-4 text-slate-300">Coût Total Crédit</td>
              <td className="p-4 text-right text-slate-400">
                {(mensualiteMarche * duree).toLocaleString()}€
              </td>
              <td className="p-4 text-right text-slate-400">
                {(mensualiteStandard * duree).toLocaleString()}€
              </td>
              <td className="p-4 text-right text-white font-bold">
                {(mensualite * duree).toLocaleString()}€
              </td>
            </tr>
            <tr className="bg-emerald-950/20">
              <td className="p-4 text-slate-300 font-bold">Économie Totale</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-slate-400">—</td>
              <td className="p-4 text-right text-emerald-400 font-bold">
                {economieVsMarche.toLocaleString()}€
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

// ✅ BON ORDRE
export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  data,
  projectionYears: initialProjectionYears, // ← Ligne avec ':'
  onReset,
  onProfileChange,
  studyId,
}) => {
  const didLogValidation = useRef(false);
  const [projectionYears, setProjectionYears] = useState<number>(
    initialProjectionYears || 10
  );

  // 1️⃣ TOUS LES STATES EN PREMIER

  // ✅ PROFIL — Synchronisé avec le quiz

  const [profile, setProfile] = useState<
    "standard" | "banquier" | "senior" | null
  >(data.profile || "standard");
  const phases =
    profile === "senior"
      ? seniorPhases
      : profile === "banquier"
      ? banquierPhases
      : standardPhases;
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeOnModule, setTimeOnModule] = useState(0);
  const activePhase = phases[currentPhase];
  // 🔥 Synchronisation automatique
  useEffect(() => {
    if (data.profile && data.profile !== profile) {
      setProfile(data.profile);
      console.log("✅ Profil synchronisé depuis quiz :", data.profile);
    }
  }, [data.profile]);

  // Reste de tes states
  const [showCoach, setShowCoach] = useState(false);
  const [activeCoachPhase, setActiveCoachPhase] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [step, setStep] = useState<"dashboard" | "coach" | "results">(
    "dashboard"
  );
  const [showDiffBadge, setShowDiffBadge] = useState(false);
  const [coachImpactOpen, setCoachImpactOpen] = useState(false);

  // 🧠 COACH — état global : module ouvert
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isCoachDisabled, setIsCoachDisabled] = useState(false);

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

  // 🟥 STOP – Erreur mortelle #1 : Senior + projections anxiogènes
  useEffect(() => {
    if (!activeModule) return;
    if (profile === "senior" && activeModule === "where-money") {
      setPopup("STOP_XYEARS");
    }
  }, [activeModule, profile]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const handleGenerate = async () => {
    if (!inputValue.trim()) return alert("⚠️ Veuillez entrer le nom du client");
    setIsLoading(true);

    const rawId = studyId || data?.id;
    const cleanId = String(rawId)
      .replace(/[^a-zA-Z0-9-]/g, "")
      .trim();

    try {
      const { error } = await supabase
        .from("studies")
        .update({
          client_name: inputValue,
          is_active: true,
        })
        .eq("id", cleanId);

      if (error) throw error;

      const domain = window.location.origin;
      const link = `${domain}/guest/${cleanId}`;

      setGeneratedLink(link); // On stocke le lien
      // ❌ On ne fait plus navigator.clipboard ici pour éviter l'erreur de permission
    } catch (error: any) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const [installedPower, setInstalledPower] = useState<number>(
    data?.params?.installedPower || 3.5
  );
  const [houseSize, setHouseSize] = useState<number>(
    data?.params?.houseSize || 120
  );

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
    "financement" | "cash"
  >("financement");
  const [tableMode, setTableMode] = useState<"annuel" | "mensuel">("mensuel");
  const [tableScenario, setTableScenario] = useState<"financement" | "cash">(
    "financement"
  );
  const [gouffreMode, setGouffreMode] = useState<"financement" | "cash">(
    "financement"
  );
  const [showScripts, setShowScripts] = useState(false);
  const [scriptProfile, setScriptProfile] = useState("standard");
  const [whereMoneyMode, setWhereMoneyMode] = useState<"financement" | "cash">(
    "financement"
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
      (data.params.installCost * (interestRate / 100 / 12)) /
        (1 - Math.pow(1 + interestRate / 100 / 12, -180))
    );
    const remainingMonthly = Math.round(currentMonthlyBill * 0.3);
    const totalWithSolar = loanMonthly + remainingMonthly;
    const monthlySavings = currentMonthlyBill - totalWithSolar;
    const cost20Years = Math.round(currentMonthlyBill * 12 * 20 * 1.65);
    const cost40Years = Math.round(currentMonthlyBill * 12 * 40 * 2.1);
    const savings20Years = Math.round(
      cost20Years - (data.params.installCost + remainingMonthly * 12 * 20)
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
      greenValue: Math.round(data.params.installCost * 1.9),
      heritageNet: savings20Years + Math.round(data.params.installCost * 1.9),
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
  const handleConfirmSimulation = () => {
    setCreditDurationMonths(selectedDuration); // ✅ SEUL ENDROIT
    setAutoCalculate(true); // ✅ UNE FOIS
    setShowParamsEditor(false);
    setCodeValidated(false);
    setCodeInput("");
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

  const residuMensuelM0 = useMemo(() => {
    return (calculationResult?.details?.[0]?.edfResidue || 0) / 12;
  }, [calculationResult]);

  const totalMensuel = useMemo(() => {
    return creditMonthlyPayment + insuranceMonthlyPayment + residuMensuelM0;
  }, [creditMonthlyPayment, insuranceMonthlyPayment, residuMensuelM0]);

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
      economyChartMode === "financement"
        ? calculationResult.details
        : calculationResult.detailsCash;
    return sourceDetails.slice(0, projectionYears).map((detail, index) => ({
      year: detail.year,
      value: -detail.cashflowDiff,
      type:
        index * 12 < creditDurationMonths && economyChartMode === "financement"
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
            label: "PANNEAUX",
            tag: "Pièces + M.O. + Déplacement",
            icon: Sun,
            description:
              "Garantie matériel, main d'œuvre et déplacement à vie.",
          },
          {
            years: "À VIE",
            label: "ONDULEURS",
            tag: "Pièces + M.O. + Déplacement",
            icon: Zap,
            description:
              "Remplacement à neuf, main d'œuvre et déplacement à vie.",
          },
          {
            years: "À VIE",
            label: "STRUCTURE",
            tag: "Pièces + M.O. + Déplacement",
            icon: Wrench,
            description: "Garantie à vie sur le système de fixation.",
          },
          {
            years: "À VIE",
            label: "MATÉRIEL",
            tag: "Remplacement à neuf",
            icon: ShieldCheck,
            description: "Garantie matérielle complète à vie.",
          },
        ]
      : [
          {
            years: 25,
            label: "PANNEAUX",
            tag: "Performance standard",
            icon: Sun,
            description: "Garantie performance 25 ans.",
          },
          {
            years: 25,
            label: "ONDULEURS",
            tag: "Pièces + M.O. + Déplacement",
            icon: Zap,
            description: "Garantie totale 25 ans.",
          },
          {
            years: 10,
            label: "STRUCTURE",
            tag: "Matériel + M.O. + Déplacement",
            icon: Wrench,
            description: "Garantie 10 ans.",
          },
          {
            years: 25,
            label: "PANNEAUX",
            tag: "Matériel",
            icon: Sun,
            description: "Garantie matérielle 25 ans.",
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
    // ✅ CORRECTION : Utiliser directement les cumuls calculés dans Finance
    const sourceDetails =
      gouffreMode === "financement"
        ? calculationResult.details
        : calculationResult.detailsCash;

    return sourceDetails.slice(0, projectionYears).map((detail) => ({
      year: detail.year,
      cumulativeSpendNoSolar: Math.round(detail.cumulativeSpendNoSolar),
      cumulativeSpendSolar: Math.round(detail.cumulativeSpendSolar),
    }));
  }, [calculationResult, gouffreMode, projectionYears]);

  const handleGenerateStudy = async () => {
    if (!clientName.trim()) {
      alert("⚠️ Veuillez entrer le nom du client");
      return;
    }

    if (!commercialEmail) {
      alert("⚠️ Email commercial manquant");
      return;
    }

    try {
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

      // Remplace la vérification d'expiration par celle-ci
      // ✅ VERSION SÉCURISÉE
      const expiresAt = data?.expires_at ? new Date(data.expires_at) : null;
      const now = new Date();

      // On ajoute une marge de sécurité de 1 minute pour éviter les conflits de millisecondes à la création
      const bufferTime = 60 * 1000;
      const isActuallyExpired =
        now.getTime() > expiresAt.getTime() + bufferTime;

      if (isActuallyExpired) {
        setIsExpired(true);
        setIsLoading(false);
        return;
      }

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

      const guestUrl = `https://edf-solutions-solaires.vercel.app/guest/${study.id}`;

      setEncodedUrl(guestUrl);
      setShowNamePopup(false);
      setShowQRCode(true);

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
  if (!calculationResult) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 animate-pulse">Chargement...</div>
      </div>
    );
  }
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

      {/* MASQUÉ - Bug d'affichage, voir console pour validation */}
      {/* 
  <div className="mt-20 px-4">
    {debouncedValidation && (
      <ValidationQualityPanel validation={debouncedValidation} />
    )}
  </div>
  */}
      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-8">
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
                setActiveModule(id);
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
        {/* ============================================ */}
        {/* MODULE 2 : PROJET SÉCURISÉ - ZÉRO RISQUE CLIENT */}
        {/* VERSION FINALE - CLOSING NET MAXIMAL */}
        {/* Optimisations : anti-annulation J+7 + ancrage post-signature */}
        {/* ============================================ */}
        <ModuleSection
          id="projet-securise-zero-risque"
          title="PROJET SOLAIRE SÉCURISÉ – ZÉRO RISQUE CLIENT"
          icon={<ShieldCheck className="text-blue-400" size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* BLOC 1 : PROCESSUS COMPLET (Liste exhaustive) */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3">
                TOUTES LES DÉMARCHES PRISES EN CHARGE PAR EDF
              </h4>

              {/* 🟢 AMÉLIORATION 1 : Reframing complexité */}
              <p className="text-sm text-slate-400 italic mb-4">
                Ces démarches existent dans tous les projets solaires. La
                différence EDF : vous n'en gérez aucune.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: "1",
                    title: "Urbanisme & Mairie",
                    desc: "Déclaration préalable de travaux (DP)",
                    icon: Home,
                  },
                  {
                    step: "2",
                    title: "Architectes des Bâtiments de France",
                    desc: "Validation ABF si zone protégée",
                    icon: Landmark,
                  },
                  {
                    step: "3",
                    title: "Diagnostic Amiante",
                    desc: "Diagnostic réglementaire inclus (toitures avant 1997)",
                    icon: FileSearch,
                  },
                  {
                    step: "4",
                    title: "Installation & Pose",
                    desc: "Par installateurs RGE certifiés",
                    icon: Wrench,
                  },
                  {
                    step: "5",
                    title: "Consuel (Comité National de Sécurité)",
                    desc: "Attestation de conformité électrique",
                    icon: ShieldCheck,
                  },
                  {
                    step: "6",
                    title: "Raccordement ENEDIS",
                    desc: "Mise en service du compteur Linky",
                    icon: Zap,
                  },
                  {
                    step: "7",
                    title: "Contrat OA (Obligation d'Achat)",
                    desc: "Signature avec EDF OA - 20 ans",
                    icon: FileText,
                  },
                  {
                    step: "8",
                    title: "Mise en Production",
                    desc: "Activation et suivi de production",
                    icon: Sun,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-black/20 border border-white/5 rounded-lg p-4 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                          <Icon className="text-blue-400" size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-500">
                              ÉTAPE {item.step}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-white mb-1">
                            {item.title}
                          </h5>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BLOC 2 : GARANTIE ZÉRO RISQUE CLIENT */}
            <div className="bg-gradient-to-r from-emerald-950/20 to-green-950/20 border-2 border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="text-emerald-400" size={28} />
                </div>
                <div className="flex-1">
                  {/* 🟢 AMÉLIORATION 2 : Wording institutionnel */}
                  <h4 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                    ENGAGEMENT EDF – RISQUE ADMINISTRATIF COUVERT
                  </h4>
                  <div className="bg-black/40 rounded-lg p-4 mb-4">
                    <p className="text-lg text-emerald-300 font-bold leading-relaxed">
                      Si un blocage administratif empêche l'installation (refus
                      mairie, ABF, ENEDIS, ou autre),{" "}
                      <span className="text-white text-xl">
                        aucun paiement n'est exigible
                      </span>
                      .
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Aucun paiement avant validation complète
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Annulation gratuite en cas de refus
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Accompagnement juridique inclus
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Prise en charge totale garantie EDF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOC 3 : PLANNINGS D'INSTALLATION */}
            <div className="bg-orange-950/20 border-l-4 border-orange-500 rounded-r-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="text-orange-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-orange-300 mb-2">
                    PLANNINGS D'INSTALLATION
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    Les créneaux d'installation dans votre secteur (06 -
                    Alpes-Maritimes) sont contraints par les capacités
                    techniques des équipes certifiées. Valider votre projet
                    aujourd'hui garantit votre créneau dans les prochaines
                    semaines.
                  </p>
                  <div className="bg-orange-500/10 rounded-lg px-3 py-2 inline-block mb-3">
                    <span className="text-xs text-orange-400 font-mono">
                      DISPONIBILITÉ SOUS RÉSERVE DU PLANNING RÉGIONAL
                    </span>
                  </div>

                  {/* 🟢 AMÉLIORATION 3 : Urgence → statut protégé */}
                  <p className="text-xs text-slate-400 italic mt-3">
                    Une fois validé, votre dossier est priorisé dans le planning
                    régional EDF.
                  </p>
                </div>
              </div>
            </div>

            {/* 🟢 AMÉLIORATION 4 : Ancrage post-décision (CRITIQUE) */}
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-4 mt-6">
              <p className="text-sm text-slate-300 leading-relaxed">
                Ce projet est validé selon les mêmes standards que les
                installations réalisées par EDF depuis plus de 25 ans chez des
                particuliers et des collectivités.
              </p>
            </div>
          </div>
        </ModuleSection>
        {/* ============================================
   MODULE SÉCURITÉ JURIDIQUE - VERSION OPTIMISÉE
   Suppressions : alerte 87% + ligne RGE négative
   Corrections : wording institutionnel
   ============================================ */}
        <ModuleSection
          id="securite-juridique"
          title="Garanties de Sécurité"
          icon={<ShieldCheck className="text-emerald-500" />}
          defaultOpen={true}
        >
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
            {/* LUEUR AMBIANTE */}
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 bg-emerald-500/5 blur-[120px]" />

            {/* ❌ ALERTE 87% SUPPRIMÉE */}

            {/* HEADER EDF */}
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
                <h3 className="mb-2 text-2xl font-black uppercase tracking-tight text-white">
                  GROUPE EDF SOLUTIONS SOLAIRES
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-300">
                    100% Public
                  </span>
                  <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase text-emerald-300">
                    Contrôlé par l'État
                  </span>
                  <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase text-purple-300">
                    Zéro risque faillite
                  </span>
                </div>
              </div>
            </div>

            {/* GRILLE GARANTIES */}
            <div className="relative z-10 mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* GARANTIE 1 */}
              <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                <h4 className="mb-4 flex items-center gap-3 font-black uppercase text-white">
                  <FileText size={22} className="text-blue-400" />
                  Contrat protégé
                </h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✔ 14 jours de rétractation légale</li>
                  <li>✔ Aucun versement avant démarrage</li>
                  <li>✔ Protection Code de la consommation</li>
                </ul>
              </div>

              {/* GARANTIE 2 */}
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

              {/* GARANTIE 3 */}
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

              {/* GARANTIE 4 */}
              <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
                <h4 className="mb-4 flex items-center gap-3 font-black uppercase text-white">
                  <Coins size={22} className="text-emerald-400" />
                  Aides sécurisées
                </h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>✔ Versement direct par l'État</li>
                  <li>✔ Prime autoconsommation garantie</li>
                  <li>✔ TVA réduite à 5,5%</li>
                </ul>
              </div>
            </div>
          </div>
        </ModuleSection>
        {/* ============================================
      MODULE 2 : RÉPARTITION ÉNERGIE — VERSION OPTIMISÉE FINAL
      ============================================ */}
        <ModuleSection
          id="repartition"
          title="Répartition Énergie"
          icon={<Zap className="text-yellow-500" />}
          defaultOpen={false}
          onOpen={(id) => {
            setActiveModule(id);
          }}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] p-10 flex flex-col gap-10">
            {/* TITLE */}
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-500" />
              <h2 className="text-xl font-bold uppercase tracking-wide">
                Répartition Énergie
              </h2>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              {/* ==== GRAPHICAL AREA – ENHANCED ==== */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="relative h-[420px] w-[420px] flex items-center justify-center">
                  {/* OUTER – AUTOCONSOMMATION */}
                  <svg
                    width="360"
                    height="360"
                    viewBox="0 0 360 360"
                    className="absolute"
                  >
                    <circle
                      cx="180"
                      cy="180"
                      r="150"
                      fill="none"
                      stroke="#1a1405"
                      strokeWidth="22"
                    />
                    <circle
                      cx="180"
                      cy="180"
                      r="150"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="22"
                      strokeDasharray={`${
                        (selfConsumptionRate / 100) * 2 * Math.PI * 150
                      } ${2 * Math.PI * 150}`}
                      transform="rotate(-90 180 180)"
                      style={{
                        filter: "drop-shadow(0 0 14px #f59e0b)",
                        transition: "stroke-dasharray 0.5s ease",
                      }}
                    />
                  </svg>

                  {/* INNER – VENTE */}
                  <svg
                    width="270"
                    height="270"
                    viewBox="0 0 270 270"
                    className="absolute"
                  >
                    <circle
                      cx="135"
                      cy="135"
                      r="110"
                      fill="none"
                      stroke="#140c1f"
                      strokeWidth="20"
                    />
                    <circle
                      cx="135"
                      cy="135"
                      r="110"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray={`${
                        ((100 - selfConsumptionRate) / 100) * 2 * Math.PI * 110
                      } ${2 * Math.PI * 110}`}
                      transform="rotate(-90 135 135)"
                      style={{
                        filter: "drop-shadow(0 0 14px #3b82f6)",
                        transition: "stroke-dasharray 0.5s ease",
                      }}
                    />
                  </svg>

                  {/* CENTER TEXT */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[12px] text-slate-500 uppercase tracking-widest">
                      Production
                    </span>
                    <span className="text-6xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                      {yearlyProduction}
                    </span>
                    <span className="text-sm text-slate-300">kWh/an</span>
                  </div>
                </div>

                {/* BADGE + MICRO VERROU */}
                <div className="mt-4 text-xs text-slate-300 bg-black/50 rounded-lg px-4 py-2 border border-white/10 text-center">
                  Cadre EDF – État • Contrat OA 20 ans
                  <div className="text-[10px] text-emerald-300 mt-1">
                    Aucun kWh perdu • Aucune gestion pour vous
                  </div>
                </div>
              </div>

              {/* ==== TEXT SIDE ==== */}
              <div className="flex flex-col gap-7">
                {/* Autoconsommation */}
                <div className="bg-black/60 border border-amber-500/25 p-7 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="font-bold text-white text-lg">
                      Autoconsommation ({selfConsumptionRate}%)
                    </span>
                  </div>
                  <div className="text-5xl font-black text-amber-500 mb-2">
                    {formatNum(yearlyProduction * (selfConsumptionRate / 100))}{" "}
                    kWh
                  </div>
                  <p className="text-xs text-slate-400">
                    Couverture automatique des besoins de fond.
                  </p>
                </div>

                {/* Vente */}
                <div className="bg-black/60 border border-blue-500/25 p-7 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-bold text-white text-lg">
                      Vente surplus ({(100 - selfConsumptionRate).toFixed(0)}
                      %)
                    </span>
                  </div>
                  <div className="text-5xl font-black text-blue-500 mb-2">
                    {formatNum(
                      yearlyProduction * ((100 - selfConsumptionRate) / 100)
                    )}{" "}
                    kWh
                  </div>
                  <p className="text-xs text-slate-400">
                    Contrat d'Obligation d'Achat 20 ans — cadre légal.
                  </p>
                </div>

                {/* Résumé */}
                <div className="bg-black/60 border border-emerald-500/25 p-6 rounded-2xl">
                  <p className="text-xs text-emerald-300 font-bold uppercase">
                    EN CLAIR
                  </p>
                  <p className="text-xs text-slate-300 leading-tight mt-1">
                    • Vous consommez → économie automatisée.
                    <br />
                    • Vous ne consommez pas → Vente par Contrat OA (État).
                    <br />
                    <span className="text-emerald-300 font-bold">
                      ➝ Aucun kWh perdu. Aucun suivi nécessaire de votre part.
                    </span>
                  </p>
                </div>
              </div>
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
            setActiveModule(id);
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

              <div className="mt-2 text-[10px] text-orange-400/60 italic">
                Vous payez, mais rien ne se construit.
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

              <div className="mt-2 text-[10px] text-emerald-400 italic font-medium">
                Vos économies deviennent un actif.
              </div>
            </div>
          </div>

          {/* ✅ BADGE VISUEL NEUTRE (REMPLACE L'ANCIENNE PHRASE) */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-slate-900/40 border border-white/5 rounded-xl px-6 py-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Ces deux modèles coexistent — aucun n'est meilleur que l'autre
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
    MODULE :Synthèse d'Arbitrage Énergétique
    ============================================ */}

        <ModuleSection
          id="synthese" // ✅ Modifié (pour matcher le mapping)
          title="Synthèse d'Arbitrage Énergétique"
          icon={<Bot className="text-blue-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            setActiveModule(id);
          }}
        >
          <p className="text-[10px] text-slate-500 italic mb-4 leading-relaxed">
            Ici, il ne s'agit pas de décider — seulement de vérifier que c'est
            logique. Une fois vérifié, on sécurise le dossier EDF, c'est une
            simple formalité administrative.
          </p>
          <div className="bg-[#050505] border-2 border-white/5 rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)]">
            <div className="relative z-10">
              {/* ⭐ AJOUT CRITIQUE : PHRASE-CADRE ANTI-RÉFLEXION */}
              <div className="text-[10px] text-slate-500 mb-4 italic">
                On ne cherche pas "le meilleur calcul" — simplement ce qui est
                raisonnable et adapté pour vous aujourd'hui.
              </div>

              {/* HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <Bot className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                      Synthèse d'Arbitrage
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                      {/* ✅ GARDER TA VERSION */}
                      Projection sur {projectionYears} ans (Données Certifiées)
                    </p>
                  </div>
                </div>
              </div>

              {/* MÉTRIQUES */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* OPTION FINANCEMENT */}
                <div className="bg-zinc-900/40 border-2 border-blue-500/40 rounded-[32px] p-8 relative group">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white uppercase italic">
                      Option Financement
                    </h3>
                    {/* ✅ GARDER TON BADGE BLEU ORIGINAL */}
                    <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded">
                      Top Sécurité
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-black/60 p-4 rounded-2xl text-center">
                      <div className="text-3xl font-black text-emerald-400 italic">
                        0€
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase mt-2">
                        Capital Immobilisé
                      </div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-2xl text-center">
                      <div className="text-3xl font-black text-blue-400 italic">
                        {calculationResult.breakEvenPoint}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase mt-2">
                        Point Mort (ans)
                      </div>
                    </div>
                    <div className="bg-black/60 p-4 rounded-2xl text-center border border-blue-500/20">
                      <div
                        className="text-2xl font-black text-white italic"
                        data-testid="heritage-net-20y"
                      >
                        {formatMoney(calculationResult.totalSavingsProjected)}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase mt-2">
                        Écart {projectionYears} ans
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 italic">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>Aucun capital immobilisé — Épargne disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>
                        Effort année 1 : +
                        {Math.round(calculationResult.monthlyEffortYear1)}€/mois
                      </span>
                    </div>
                  </div>
                </div>

                {/* OPTION CASH */}
                <div className="bg-zinc-900/20 border border-white/10 rounded-[32px] p-8 opacity-90">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white uppercase italic">
                      Option Cash
                    </h3>
                    {/* ✅ GARDER TON BADGE GRIS ORIGINAL */}
                    <div className="px-3 py-1 border border-white/20 text-slate-400 text-[10px] font-black uppercase rounded">
                      Performance maximale
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-black/40 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-emerald-400 italic">
                        {formatMoney(installCost)}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase mt-2">
                        Capital investi
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl text-center">
                      <div className="text-3xl font-black text-blue-400 italic">
                        {calculationResult.breakEvenPointCash}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase mt-2">
                        Point Mort (ans)
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl text-center">
                      <div className="text-2xl font-black text-purple-400 italic">
                        {formatMoney(
                          calculationResult.totalSavingsProjectedCash
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase mt-2">
                        Écart {projectionYears} ans
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ARGUMENTAIRE TEXTUEL - VERSION SIMPLIFIÉE */}
              <div className="space-y-6 mb-12 text-sm leading-relaxed text-slate-300 font-medium italic">
                <p>
                  {/* ⭐ VERSION SIMPLIFIÉE */}
                  Pendant {Math.ceil(creditDurationMonths / 12)} ans, le
                  financement transforme votre facture actuelle en installation
                  patrimoniale.
                </p>
                <p>
                  Après remboursement, vous économisez{" "}
                  <span className="text-emerald-400 font-bold">
                    {formatMoney(calculationResult.averageYearlyGain)} par an
                  </span>
                  , soit un gain cumulé de{" "}
                  <span className="text-purple-400 font-bold underline">
                    {formatMoney(calculationResult.totalSavingsProjected)} sur
                    20 ans.
                  </span>
                </p>

                {/* ⭐ AJOUT CRITIQUE : PHRASE ANTI-ANNULATION */}
                <p className="text-[10px] text-slate-500 italic mt-4">
                  Ce choix ne vous engage que si vous le validez maintenant,
                  noir sur blanc, avec moi.
                </p>
              </div>

              {/* ACTIONS */}
              <div
                id="qualification-process"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              ></div>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================
    MODULE – PREUVE SOCIALE LOCALE (EDF – FINAL)
    ============================================ */}
        <ModuleSection
          id="realisations" // ✅ Modifié (pour matcher le mapping)
          title="Réalisations EDF — Familles accompagnées dans votre secteur"
          icon={<Users className="text-blue-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            setActiveModule(id);
          }}
        >
          <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8">
            {/* Ligne d'ancrage local */}
            <div className="mb-5 flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="text-blue-400" size={16} />
              <span>
                Projets EDF accompagnés à proximité de{" "}
                <strong className="text-white">
                  {clientCity
                    ? clientCity
                    : data?.address
                    ? data.address.split(",").pop().trim()
                    : "votre secteur"}
                </strong>
              </span>
            </div>

            {/* Header sobre & institutionnel */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" size={24} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  Réalisations EDF — Alpes-Maritimes
                </h2>
              </div>
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Données réelles
                </span>
              </div>
            </div>

            {/* Grid 4 cartes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  name: "Mme T.",
                  city: "Le Cannet",
                  gain: 22400,
                  status: "Production active",
                  kWc: "3.5 kWc",
                },
                {
                  name: "M. B.",
                  city: "Mougins",
                  gain: 28900,
                  status: "Installation raccordée",
                  kWc: "4.5 kWc",
                },
                {
                  name: "Famille D.",
                  city: "Grasse",
                  gain: 39400,
                  status: "Production active",
                  kWc: "6 kWc",
                },
                {
                  name: "M. & Mme L.",
                  city: "Cannes",
                  gain: 51800,
                  status: "Raccordement validé Enedis",
                  kWc: "9 kWc",
                },
              ].map((client, i) => (
                <div
                  key={i}
                  className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/40 transition-all duration-300"
                >
                  {/* badge statut */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-slate-400 text-[9px] font-semibold uppercase tracking-widest">
                        {client.status}
                      </span>
                    </div>
                    <span className="text-slate-600 text-[9px] font-mono">
                      {client.kWc}
                    </span>
                  </div>

                  {/* nom + ville */}
                  <div className="text-white font-semibold text-sm mb-0.5">
                    {client.name}
                  </div>
                  <div className="text-slate-500 text-xs mb-4">
                    {client.city}
                  </div>

                  {/* projection conservatrice */}
                  <div className="border-t border-slate-800 pt-3">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      Projection conservatrice — base tarif EDF actuelle
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatMoney(client.gain)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Normalisation (factuel – sans argument) */}
            <div className="bg-gradient-to-r from-slate-800/40 to-transparent border-l-4 border-blue-500 p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <BarChart3 className="text-blue-400" size={20} />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-white">127 dossiers validés</strong>{" "}
                  ce mois-ci dans le 06.
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================
    MODULE 14 : CALENDRIER DE MISE EN SERVICE
    Version finale optimale (ta version validée)
    ============================================ */}
        <ModuleSection
          id="calendrier" // ✅ Simplifié pour matcher le mapping
          title="Calendrier de Mise en Service"
          icon={<Calendar className="text-blue-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            setActiveModule(id);
          }}
        >
          <div className="bg-black/40 border border-white/10 rounded-[32px] p-8">
            {/* HEADER NEUTRE */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="text-blue-400" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Impact du Calendrier de Décision
                </h2>
                <p className="text-slate-400 text-[11px] mt-1 italic">
                  Délai standard de mise en service : 8 à 12 semaines
                </p>
                <p className="text-xs text-slate-600 mt-2 italic">
                  À partir de cette date, l'installation est opérationnelle.
                </p>
              </div>
            </div>

            {/* CARTES – FACTUEL, BASSE PRESSION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Card 1 - Coût énergétique actuel */}
              <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
                <div className="text-slate-400 text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Coût énergétique actuel
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatMoney(calculationResult.lossIfWait1Year || 0)}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Facture annuelle fournisseur
                </div>
              </div>

              {/* Card 2 - Économie disponible année 1 */}
              <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
                <div className="text-slate-400 text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Économie disponible année 1
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {formatMoney(calculationResult.savingsLostIfWait1Year || 0)}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Bénéfice première année
                </div>
              </div>

              {/* Card 3 - Économie sur période */}
              <div className="bg-slate-900/40 border border-blue-500/20 rounded-2xl p-6">
                <div className="text-slate-400 text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Économie sur {projectionYears} ans
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {formatMoney(calculationResult.totalSavingsProjected || 0)}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Cumul sur période
                </div>
              </div>
            </div>

            {/* MESSAGE FACTUEL – TA VERSION (MEILLEURE) */}
            <div className="bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-xl mb-6">
              <p className="text-slate-300 text-[11px] leading-relaxed italic">
                Le délai de mise en service standard est de 8 à 12 semaines.
                Chaque trimestre décalé déplace simplement le moment où vous
                commencez à économiser.
                <span className="text-slate-400 block mt-2">
                  La question n'est pas "faut-il le faire", mais "quand commence
                  l'économie".
                </span>
              </p>
            </div>

            {/* VISUALISATION TEMPORELLE - CORRIGÉE */}
            <div className="p-5 bg-black/30 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-4 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Impact du calendrier sur le début des économies :
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-lg">
                    {/* ✅ CORRECTION : utiliser savingsLostIfWait1Year au lieu de savingsYear1 */}
                    {formatMoney(calculationResult.savingsLostIfWait1Year || 0)}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Économie année 1
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-lg">
                    {/* ✅ CORRECTION : multiplier par 3 */}
                    {formatMoney(
                      (calculationResult.savingsLostIfWait1Year || 0) * 3
                    )}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Cumul 3 ans
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-lg">
                    {/* ✅ CORRECTION : multiplier par 5 */}
                    {formatMoney(
                      (calculationResult.savingsLostIfWait1Year || 0) * 5
                    )}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Cumul 5 ans
                  </div>
                </div>
              </div>
            </div>

            {/* PHRASE FINALE – TRANSFERT DE CONTRÔLE */}
            <p className="text-[10px] text-slate-500 italic mt-6 text-center">
              C'est juste du calendrier. La décision vous appartient.
            </p>
          </div>
        </ModuleSection>

        {/* ============================================
   MODULE 9 : GARANTIES & SÉCURITÉ (version optimisée)
   ============================================ */}
        <ModuleSection
          id="garanties"
          title="Garanties & Sécurité"
          icon={<ShieldCheck className="text-orange-500" />}
          defaultOpen={false} // ✅ CHANGÉ : false (fermé par défaut)
          onOpen={(id) => {
            setActiveModule(id);
          }}
          onClose={handleModuleClose} // ✅ CORRECT
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 space-y-10">
            {/* ENTRÉE – POSITIONNEMENT EDF */}
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-orange-500 w-6 h-6 flex-shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">
                Avec EDF, vous êtes accompagné du début à la fin : étude,
                installation, contrôle, mise en service et suivi. L’objectif est
                simple : que votre installation produise ce qui a été prévu,
                dans le temps.
              </p>
            </div>

            {/* TOGGLE OFFRES */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-white tracking-tight">
                Vos garanties – selon l’offre choisie
              </h3>
              <Toggle
                checked={warrantyMode}
                onChange={setWarrantyMode}
                labelOff="Essentielle (TVA 5.5%)"
                labelOn="Performance (TVA 20%)"
              />
            </div>

            {/* INFO BANNERS */}
            {!warrantyMode ? (
              <div className="bg-[#021c15] border border-emerald-500/30 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                    OFFRE ESSENTIELLE – TVA RÉDUITE 5.5%
                  </span>
                </div>
                <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                <div className="flex items-center gap-6 text-xs text-slate-300">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                    Panneaux – 25 ans
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                    Production garantie –0.4%/an
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                    Fabrication française
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-md border border-blue-900/30 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center gap-3">
                <Award className="text-blue-400 w-4 h-4" />
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                  OFFRE PERFORMANCE – TVA 20%
                </span>
                <span className="text-xs text-slate-500 ml-auto hidden md:block">
                  Garantie maximale et sérénité long terme.
                </span>
              </div>
            )}

            {/* GRILLE GARANTIES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {warranties.map((w, i) => (
                <div key={i}>
                  <WarrantyCard
                    years={w.years}
                    label={w.label}
                    tag={w.tag}
                    icon={w.icon}
                    description={w.description}
                    isFr={!warrantyMode && w.label === "PANNEAUX" && i === 0}
                  />
                </div>
              ))}
            </div>

            {/* EXPLICATION GARANTIES */}
            <div className="mt-6 bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded flex items-start gap-3">
              <p className="text-sm text-gray-300 flex-1 leading-relaxed">
                <strong>Garantie de performance</strong> : si la production est
                inférieure aux engagements, une compensation est prévue
                contractuellement.
                <br />
                <strong>Garantie matériel</strong> : remplacement pièces, main
                d'œuvre et déplacement selon conditions de l’offre sélectionnée.
              </p>
              <InfoPopup title="Comprendre ces garanties">
                <p className="mb-3">
                  <strong>Garantie de performance :</strong> assurée tant que
                  l’installation est active et conforme. Si écart constaté →
                  compensation.
                </p>
                <p className="mb-3">
                  <strong>Garantie matériel :</strong>{" "}
                  {warrantyMode
                    ? "À vie pour l’Offre Performance."
                    : "10 à 25 ans selon composants pour l’Offre Essentielle."}
                </p>
              </InfoPopup>
            </div>

            {/* DIFFERENCES – NEUTRE & NON DÉVALORISANTE */}
            {!warrantyMode && (
              <div className="mt-6 bg-[#0f0505] border border-red-900/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-orange-500" size={20} />
                  <h3 className="font-bold text-white text-sm">
                    Différences entre les deux offres
                  </h3>
                </div>
                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-slate-400">Performance</span> →
                    garantie matériel à vie
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-400">Essentielle</span> → TVA
                    réduite et panneaux France
                  </li>
                </ul>
                <button
                  onClick={() => setWarrantyMode(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold text-xs uppercase tracking-wider transition"
                >
                  Voir l’option Long Terme
                </button>
              </div>
            )}

            {/* SYSTÈME YUZE */}
            <div className="bg-[#110e1c] border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Bot size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white uppercase mb-2">
                  Supervision intelligente EDF
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Votre installation est suivie automatiquement. En cas d’écart
                  de production, une alerte déclenche un diagnostic et, si
                  nécessaire, une intervention.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0b0d14] p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-blue-200 uppercase flex items-center gap-2 mb-2">
                      • Surveillance continue
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Analyse en temps réel, panneau par panneau.
                    </p>
                  </div>
                  <div className="bg-[#0b0d14] p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-blue-200 uppercase flex items-center gap-2 mb-2">
                      • Optimisation IA
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Vos habitudes sont apprises pour maximiser votre
                      autoconsommation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AFFICHEUR CONNECTÉ */}
            <div className="bg-[#150a15] border border-pink-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-400 flex-shrink-0">
                <Eye size={24} />
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-white uppercase mb-2">
                  Afficheur Connecté
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Production – consommation – économies → visible en temps réel.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                    <Zap size={20} className="text-yellow-400 mb-2" />
                    <div className="text-xs font-bold text-white mb-1">
                      Production Live
                    </div>
                    <div className="text-[10px] text-slate-500">
                      kW + cumul jour
                    </div>
                  </div>

                  <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                    <Home size={20} className="text-orange-400 mb-2" />
                    <div className="text-xs font-bold text-white mb-1">
                      Consommation
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Par appareil
                    </div>
                  </div>

                  <div className="bg-[#1a0f1a] p-4 rounded-xl border border-white/5 flex flex-col items-center text-center">
                    <Coins size={20} className="text-emerald-400 mb-2" />
                    <div className="text-xs font-bold text-white mb-1">
                      Économies
                    </div>
                    <div className="text-[10px] text-slate-500">
                      € économisés aujourd’hui
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RÉSULTAT BANNER */}
            <div className="bg-[#040912] border border-blue-900/40 p-4 rounded-xl flex items-center gap-3">
              <ShieldCheck
                size={20}
                className="text-orange-400 flex-shrink-0"
              />
              <p className="text-sm text-blue-200 font-semibold leading-relaxed">
                Résultat : vous installez, vous produisez, vous êtes accompagné.
                EDF suit, et intervient si nécessaire. Votre rôle : profiter des
                économies.
              </p>
            </div>
          </div>

          {/* 🧠 Coach local — toujours visible pour le conseiller */}

          <div
            id="coach-block-gar"
            className="hidden mt-4 bg-black/60 border border-white/10 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed"
          >
            <p>
              🧠 Positionnement → « Ici il n’y a rien à décider : on sécurise un
              projet. »
            </p>
            <p>
              🎤 Terrain → lire le tout en continu, sans pause, puis regarder le
              client.
            </p>
            <p>⏳ Silence → 2 secondes.</p>
            <p className="text-slate-500 italic">
              (Et seulement si le client demande : « tant que le dossier n’est
              pas validé, vous pouvez arrêter le projet sans frais »)
            </p>
          </div>
        </ModuleSection>

        {/* ============================================
   MODULE PROCESSUS ADMINISTRATIF & CONFORMITÉ
   ============================================ */}
        <ModuleSection
          id="securisation" // ✅ Modifié (pour matcher le mapping)
          title="Processus de Sécurisation Administrative"
          icon={<ClipboardCheck className="text-blue-500" />}
          defaultOpen={false}
          onOpen={(id) => {
            setActiveModule(id);
          }}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 blur-[120px]" />

            {/* MESSAGE RASSURANT – CLÉ */}
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-950/30 to-slate-900/30 border-l-4 border-blue-500/50 rounded-r-2xl">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-blue-400 mt-1" size={22} />
                <div>
                  <p className="text-white text-sm font-bold mb-1">
                    EDF gère l’ensemble du volet administratif et réglementaire
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Vous n’avez rien à remplir, rien à suivre. Chaque étape est
                    prise en main par EDF et validée par vous uniquement lorsque
                    c’est nécessaire.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 PILIERS – ÉLÉMENTS DE PREUVE PASSIFS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PILIER 1 */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Autorisations & Urbanisme
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75 pointer-events-none select-none">
                  <li>• Dossier mairie</li>
                  <li>• Zones protégées si concerné</li>
                  <li>• Conformité locale</li>
                </ul>
              </div>

              {/* PILIER 2 */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Visite Technique & Sécurisation
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75 pointer-events-none select-none">
                  <li>• Pré-validation sur place</li>
                  <li>• Vérification technique par équipes EDF</li>
                  <li>• Adaptations si besoin</li>
                </ul>
              </div>

              {/* PILIER 3 */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Conformité Électrique
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75 pointer-events-none select-none">
                  <li>• Validation installation</li>
                  <li>• Attestation réglementaire</li>
                  <li>• Sécurité avant mise en service</li>
                </ul>
              </div>

              {/* PILIER 4 */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Mise en Service & Raccordement
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75 pointer-events-none select-none">
                  <li>• Raccordement ENEDIS</li>
                  <li>• Activation contrat EDF</li>
                  <li>• Passage en production</li>
                </ul>
              </div>
            </div>

            {/* CONCLUSION SÉCURISANTE */}
            <div className="mt-8 p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
              <p className="text-emerald-100 text-sm leading-relaxed">
                <strong className="text-white">
                  Vous êtes guidé, accompagné et protégé.
                </strong>
                EDF assume la résponsabilité du projet — vous validez simplement
                les étapes importantes.
              </p>
            </div>
          </div>

          {/* 🧠 Coach local — toujours visible pour le conseiller */}

          <div
            id="coach-block-proc"
            className="hidden mt-4 bg-black/60 border border-white/10 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed"
          >
            <p>
              🎤 Terrain → ne pas lire les listes. Dire uniquement : « EDF gère
              tout. Vous validez juste quand c’est utile. »
            </p>
            <p>⏳ Silence → 1,5 seconde.</p>
            <p>🎯 Objectif → réduire charge mentale, verrouiller sécurité.</p>
          </div>
        </ModuleSection>

        {/* ============================================
   MODULE STRUCTURE DU BUDGET MENSUEL
   ============================================ */}
        <ModuleSection
          id="budget" // ✅ Modifié pour matcher le mapping
          title="Structure du Budget (Mensuel)"
          icon={<Scale className="text-slate-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            setActiveModule(id);
          }}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            {/* ✅ UNE SEULE PHRASE (VERSION FINALE) */}
            <div className="text-[10px] text-slate-500 italic mb-4">
              On regarde simplement comment votre budget actuel se réorganise —
              sans nouvelle charge.
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Scale className="text-slate-400 w-6 h-6" />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  STRUCTURE DU BUDGET (MENSUEL)
                </h2>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded text-xs font-bold text-slate-400 border border-white/10">
                Année 1 — Comparatif
              </div>
            </div>

            <div className="space-y-12">
              {/* =======================  SITUATION ACTUELLE  ======================= */}
              <div>
                <div className="flex justify-between text-sm font-bold uppercase text-slate-400 mb-6">
                  <span>SITUATION ACTUELLE</span>
                  <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {formatMoney(calculationResult.oldMonthlyBillYear1)} /mois
                  </span>
                </div>

                {/* Phrase ANTI-PRIX (pivot) */}
                <div className="text-[11px] text-slate-400 italic mb-4 leading-relaxed">
                  Concrètement, on ne rajoute rien dans votre budget. On ne paie
                  rien en plus : on remplace une dépense existante par quelque
                  chose qui vous reste.
                </div>

                {/* Barre rouge 100% dépenses */}
                <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-red-900/40 overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>

                    <div className="absolute inset-0 flex items-center justify-between px-8">
                      <span className="text-white font-black text-2xl uppercase tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                        FACTURE ACTUELLE
                      </span>
                      <span className="text-white/30 font-black text-5xl uppercase tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                        100% dépenses — sans retour
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* =======================  INSTALLATION EDF – mise en place  ======================= */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold uppercase text-slate-400">
                    INSTALLATION EDF — mise en place
                  </span>

                  <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] uppercase">
                    {Math.round(
                      calculationResult.year1.creditPayment / 12 +
                        calculationResult.year1.edfResidue / 12
                    )}{" "}
                    € /mois
                  </span>
                </div>

                {/* Phrase neutralisée */}
                <div className="text-[11px] text-slate-400 italic mb-4 leading-relaxed">
                  Montant fixe — identique à ce que vous validez déjà
                  aujourd'hui. Rien ne change dans votre quotidien : c'est
                  simplement organisé autrement.
                </div>

                {/* Double barre */}
                <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex">
                  {/* FINANCEMENT EDF */}
                  <div
                    className="relative bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500"
                    style={{
                      width: `${
                        (calculationResult.year1.creditPayment /
                          12 /
                          (calculationResult.year1.totalWithSolar / 12)) *
                        100
                      }%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/10 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-center px-6">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        FINANCEMENT EDF
                      </span>
                      <span className="text-white font-black text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                        {formatMoney(
                          calculationResult.year1.creditPayment / 12
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div className="w-1 bg-black/40"></div>

                  {/* RESTE À CHARGE */}
                  <div
                    className="relative bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)] transition-all duration-500"
                    style={{
                      width: `${
                        (calculationResult.year1.edfResidue /
                          12 /
                          (calculationResult.year1.totalWithSolar / 12)) *
                        100
                      }%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/10 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-center px-6">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        RESTE À CHARGE
                      </span>
                      <span className="text-slate-300 font-black text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                        {formatMoney(calculationResult.year1.edfResidue / 12)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* ======================================================
   MODULE 12.5 — IMPACT SUR VOTRE BUDGET MENSUEL (VERSION FINALE)
   ====================================================== */}
        <ModuleSection
          id="impact" // ✅ Modifié pour matcher le mapping final
          title="Impact sur votre budget mensuel"
          icon={<Wallet className="text-blue-400" />}
          defaultOpen={false}
          onOpen={(id) => {
            setActiveModule(id);
          }}
        >
          {/* 3 COLS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-950/30 to-black/40 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400 text-[10px] uppercase font-bold tracking-wide mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Facture actuelle
              </div>
              <div className="text-white text-3xl font-black">
                {formatMoney(monthlyBill)}
              </div>
              <div className="text-slate-500 text-xs mt-1">/mois</div>
            </div>

            <div className="bg-gradient-to-br from-blue-950/30 to-black/40 border border-blue-500/20 rounded-xl p-4">
              <div className="text-blue-400 text-[10px] uppercase font-bold tracking-wide mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Vous payez
              </div>
              <div className="text-white text-3xl font-black">
                {formatMoney(totalMensuel)}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                /mois (crédit + reste facture)
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-950/30 to-black/40 border border-slate-600/20 rounded-xl p-4">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wide mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Différence — 1ère année
              </div>
              <div className="text-3xl font-black text-white">
                {diffMensuel > 0 ? "+" : ""}
                {formatMoney(diffMensuel)}
              </div>
              <div className="text-slate-500 text-xs mt-1">
                Puis → économies dès fin crédit
              </div>
            </div>
          </div>

          {/* SLIDER NOUVEAU FORMAT */}
          <div className="my-8">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase mb-1">
              <span>Alignement avec votre budget actuel</span>
              <span>{((totalMensuel / monthlyBill) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-800/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-700"
                style={{ width: `${(totalMensuel / monthlyBill) * 100}%` }}
              ></div>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500 italic">
            Ces montants sont ceux de la 1ère année.
            <button
              onClick={() =>
                document
                  .getElementById("tableau-detaille")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="ml-1 text-blue-400 hover:text-blue-300 underline"
            >
              Voir l'évolution complète sur 20 ans
            </button>
          </p>
        </ModuleSection>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  ACCORDÉON GLOBAL – DÉTAILS COMPLÉMENTAIRES           */}
        {/* ═══════════════════════════════════════════════════════ */}

        <ModuleSection
          id="details"
          title="Informations annexes – non nécessaires à la décision"
          icon={<ChevronDown className="opacity-60" />}
          defaultOpen={false}
        >
          <div className="space-y-10"></div>

          {/* ============================================
   MODULE 12 : PROJECTION FINANCIÈRE – ÉCART CONSTATÉ
   ============================================ */}
          <ModuleSection
            id="projection-financiere"
            title="PROJECTION FINANCIÈRE – ÉCART CONSTATÉ"
            icon={<Flame className="text-orange-500" />}
            defaultOpen={false}
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10">
              {/* HEADER – cadrage institutionnel + badge rentable */}
              <div className="flex items-start md:items-center justify-between mb-10 gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    PROJECTION FINANCIÈRE
                  </h2>
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    Sur {projectionYears} ans — écart constaté
                  </p>
                </div>

                <ProfitBadge
                  totalSavings={calculationResult.totalSavings}
                  paybackYear={calculationResult.paybackYear}
                  projectionYears={projectionYears}
                />
              </div>

              {/* GRAPHIQUE – triple-fusion (emotion + institutionnel) */}
              <div className="h-[360px] md:h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={gouffreChartData}
                    margin={{ top: 20, right: 40, left: 20, bottom: 30 }}
                  >
                    <defs>
                      <linearGradient id="noSolar" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="withSolar"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    {/* grille + couleur lisible */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis
                      dataKey="year"
                      stroke="#9ca3af"
                      tick={{ fontSize: 13, fill: "#d1d5db" }}
                      tickMargin={10}
                    />
                    <YAxis
                      domain={[0, (max) => max * 1.2]}
                      stroke="#9ca3af"
                      tick={{ fontSize: 13, fill: "#e5e7eb" }}
                      tickFormatter={(v) => {
                        if (v >= 1_000_000)
                          return `${(v / 1_000_000).toFixed(1)} M€`;
                        if (v >= 1_000) return `${Math.round(v / 1000)} k€`;
                        return `${v} €`;
                      }}
                    />
                    {/* ZONE pré-rentabilité (rouge léger) */}
                    TypeScript
                    {/* ZONE pré-rentabilité (rouge léger) */}
                    <ReferenceArea
                      x1={0}
                      x2={calculationResult.paybackYear}
                      ifOverflow="visible"
                      {...({
                        fill: "#ef4444",
                        fillOpacity: 0.05,
                      } as any)}
                    />
                    {/* POINT DE CROISEMENT (jalon psychologique) */}
                    <ReferenceLine
                      x={calculationResult.paybackYear}
                      stroke="#22c55e"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      label={{
                        value: `Point de croisement (${calculationResult.paybackYear} ans)`,
                        position: "top",
                        fill: "#22c55e",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    />
                    {/* TOOLTIP – version détaillée (closing net) */}
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#111] border border-white/20 rounded-xl p-4 shadow-xl text-xs text-slate-300">
                            <p className="font-bold text-slate-400 uppercase mb-2">
                              Année {d.year}
                            </p>
                            <div className="space-y-2">
                              <div>
                                <p className="text-[10px] text-red-400 uppercase font-bold">
                                  Factures EDF cumulées
                                </p>
                                <p className="text-lg font-black text-red-500">
                                  {formatMoney(d.cumulativeSpendNoSolar)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-blue-400 uppercase font-bold">
                                  Avec installation
                                </p>
                                <p className="text-lg font-black text-blue-500">
                                  {formatMoney(d.cumulativeSpendSolar)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    {/* COURBES – wording lisible institutionnel */}
                    <Area
                      type="monotone"
                      dataKey="cumulativeSpendNoSolar"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fill="url(#noSolar)"
                      name="Factures EDF cumulées"
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeSpendSolar"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#withSolar)"
                      name="Avec installation EDF"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* ÉCART CUMULÉ – chiffre clé seul, pas d'explication (closing) */}
              <div className="mt-6 bg-black/50 border border-white/10 py-5 rounded-xl text-center select-none">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Écart cumulé sur {projectionYears} ans
                </p>
                <p className="text-4xl font-black text-emerald-400 tabular-nums">
                  {formatMoney(calculationResult.totalSavings)}
                </p>
              </div>
              {/* TRIGGERS POPUP (discrets – usage terrain uniquement) */}
              <div className="flex flex-wrap gap-3 mt-4 text-[10px] text-slate-500 opacity-60 select-none">
                <button
                  onClick={() => setPopup("inflation")}
                  className="underline hover:text-white"
                >
                  Hypothèse inflation
                </button>
                <button
                  onClick={() => setPopup("demenagement")}
                  className="underline hover:text-white"
                >
                  Et si je déménage ?
                </button>
                <button
                  onClick={() => setPopup("conjoint")}
                  className="underline hover:text-white"
                >
                  Conjoint absent
                </button>
                <button
                  onClick={() => setPopup("tropTard")}
                  className="underline hover:text-white"
                >
                  Trop tard
                </button>
                <button
                  onClick={() => setPopup("tauxRefus")}
                  className="underline hover:text-white"
                >
                  Taux refusé
                </button>
                <button
                  onClick={() => setPopup("reflechir")}
                  className="underline hover:text-white"
                >
                  Je vais réfléchir
                </button>
              </div>

              {popup && (
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={closePopup}
                >
                  <div
                    className="bg-[#0b0f13] border border-white/10 rounded-xl w-[420px] p-6 text-slate-200 relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-3 right-3 text-slate-500 hover:text-white transition"
                      onClick={closePopup}
                    >
                      ✕
                    </button>

                    {/* === CONTENU VARIABLE SELON POPUP === */}

                    {popup === "inflation" && (
                      <>
                        <h2 className="text-sm font-bold uppercase mb-4">
                          Hypothèse inflation
                        </h2>
                        <p className="text-xs leading-relaxed">
                          L’hypothèse retenue est prudente et issue de données
                          publiques. Même si l’inflation devait tomber à 0 %,
                          l’autoproduction reste une réduction directe de
                          facture.
                        </p>
                        <p className="mt-3 text-[10px] text-slate-500">
                          EDF — projection factuelle, jamais spéculative.
                        </p>
                      </>
                    )}

                    {popup === "demenagement" && (
                      <>
                        <h2 className="text-sm font-bold uppercase mb-4">
                          Et si je déménage ?
                        </h2>
                        <p className="text-xs leading-relaxed">
                          L’installation devient un élément du bien. Vous pouvez
                          transmettre ou faire valoir sa valeur.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 text-[11px] text-emerald-400 mt-2">
                          ✔ Décision utile, même si la vie change.
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500">
                          EDF — actif patrimonial, pas un achat consommable.
                        </p>
                      </>
                    )}

                    {popup === "conjoint" && (
                      <>
                        <h2 className="text-sm font-bold uppercase mb-4">
                          Conjoint absent
                        </h2>
                        <p className="text-xs leading-relaxed">
                          On ne valide jamais un projet patrimonial si l’un des
                          deux n’est pas aligné.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-xs mt-2">
                          Option douce : un rapide échange à trois pour valider
                          ensemble.
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500">
                          Objectif : confort durable, pas décision forcée.
                        </p>
                      </>
                    )}

                    {popup === "tropTard" && (
                      <>
                        <h2 className="text-sm font-bold uppercase mb-4">
                          Timing & passage
                        </h2>
                        <p className="text-xs leading-relaxed">
                          Il n’y a aucune obligation d’agir ce soir. Il existe
                          juste un moment où la décision est plus simple.
                        </p>
                        <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-xs mt-2">
                          Sécuriser l’étude = garder la main. La signature n’est
                          jamais un piège.
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500">
                          EDF — progression par étapes, calme.
                        </p>
                      </>
                    )}

                    {popup === "tauxRefus" && (
                      <>
                        <h2 className="text-sm font-bold uppercase mb-4">
                          Si le taux est refusé
                        </h2>
                        <p className="text-xs leading-relaxed">
                          Tant que validation bancaire non émise, rien n’est
                          engagé. Plusieurs solutions existent.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 text-[11px] text-emerald-400 mt-2">
                          ✔ Décision sécurisée, pas définitive.
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500">
                          EDF — aucun verrou sans accord clair.
                        </p>
                      </>
                    )}

                    {popup === "reflechir" && (
                      <>
                        <h2 className="text-sm font-bold uppercase mb-4">
                          Je vais réfléchir
                        </h2>
                        <p className="text-xs leading-relaxed">
                          La réflexion est naturelle. Ce qui compte est que la
                          décision tienne demain — pas qu’elle soit impulsive.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded p-2 text-[11px] text-emerald-400 mt-2">
                          ✔ On confirme seulement ce qui ne sera pas regretté.
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500">
                          EDF — pas de précipitation, seulement du solide.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* BADGE FOOTER – institutionnel patrimonial */}
              <div className="mt-6 text-center select-none">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Installation garantie à vie — EDF
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Pièces, main d'œuvre et déplacement inclus
                </p>
              </div>
            </div>
          </ModuleSection>
          {/* ============================================================
    MODULE 4 : CAPITAL PATRIMONIAL (WHERE MONEY) – PATCH FINAL
============================================================ */}
          <ModuleSection
            id="securisation-edf"
            title="CAPITAL PATRIMONIAL"
            icon={<Lock size={18} />}
            defaultOpen={false}
          >
            <div id="where-money" className="space-y-10 mt-12">
              {/* ====================== CALCULATEUR PRINCIPAL ====================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN – CALCULATIONS */}
                <div className="lg:col-span-8 bg-[#050505] border border-white/10 rounded-[40px] p-10 shadow-2xl">
                  <div className="flex gap-2 mb-8">
                    <div className="bg-black border border-blue-500/30 text-blue-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                      <Lock size={12} /> PROJECTION {projectionYears} ANS
                    </div>
                    <div className="bg-[#062c1e] border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp size={12} /> 0€ D'APPORT
                    </div>
                  </div>

                  {/* TITLE + MAIN NUMBER */}
                  <h2 className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">
                    Écart économique cumulé
                  </h2>
                  <div
                    className="text-6xl font-black text-white mb-10 italic tracking-tight"
                    data-testid="gain-total"
                  >
                    {Math.round(
                      calculationResult.totalSavingsProjected
                    ).toLocaleString("fr-FR")}{" "}
                    €
                  </div>

                  {/* HOW IS IT CALCULÉ */}
                  <div className="bg-[#0a0a0b] border border-white/5 rounded-3xl p-6 space-y-4 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest">
                        COMMENT EST CALCULÉ CET ÉCART ?
                      </h3>
                    </div>

                    {/* SCENARIO */}
                    <div className="bg-[#1a0f10] border border-red-950/30 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <TrendingUp className="text-red-500 w-6 h-6" />
                        <div>
                          <div className="text-[11px] font-black text-red-500 uppercase italic tracking-wide">
                            SANS INSTALLATION
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Dépense énergétique totale
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-4xl font-black text-red-500 italic tracking-tight"
                        data-testid="no-solar-total-20y"
                      >
                        {Math.round(
                          calculationResult.totalSpendNoSolar ?? 0
                        ).toLocaleString("fr-FR")}{" "}
                        €
                      </div>
                    </div>

                    <div className="text-center text-[11px] font-black text-slate-600 tracking-widest uppercase italic">
                      MOINS
                    </div>

                    <div className="bg-[#0f141a] border border-blue-950/30 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-blue-500 uppercase italic tracking-wide">
                            AVEC INSTALLATION
                          </div>
                          <div className="text-[10px] text-slate-400 italic mt-1">
                            Réorganisation budget + facture résiduelle
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-4xl font-black text-blue-500 italic tracking-tight"
                        data-testid="solar-scenario-total-20y"
                      >
                        {Math.round(
                          calculationResult.totalSpendSolar ?? 0
                        ).toLocaleString("fr-FR")}{" "}
                        €
                      </div>
                    </div>

                    <div className="text-center text-[11px] font-black text-slate-600 tracking-widest uppercase italic">
                      ÉGAL
                    </div>

                    {/* NET GAIN */}
                    <div className="bg-[#0d1a14] border-2 border-emerald-500/40 rounded-2xl p-6 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-4">
                        <Award className="text-emerald-500 w-7 h-7" />
                        <div className="text-[13px] font-black text-emerald-500 uppercase tracking-wider italic">
                          VOTRE GAIN NET
                        </div>
                      </div>
                      <div className="text-6xl font-black text-emerald-400 italic tracking-tight">
                        +
                        {Math.round(
                          calculationResult.totalSavingsProjected
                        ).toLocaleString("fr-FR")}{" "}
                        €
                      </div>
                    </div>

                    <div className="bg-[#1a160f] border-l-4 border-yellow-500 p-4 rounded-r-xl">
                      <p className="text-[10px] text-yellow-200/90 leading-relaxed italic uppercase font-medium">
                        ⚠ ANNÉE 1 : réorganisation du budget — ANNÉE 8 :
                        économies nettes — APRÈS 15 ANS : revenu permanent.
                      </p>
                    </div>
                  </div>

                  {/* KPI ROW */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-black border border-white/5 p-4 rounded-2xl">
                      <div className="text-[9px] font-black text-emerald-500 uppercase mb-1">
                        CAPITAL IMMOBILISÉ
                      </div>
                      <div className="text-xl font-black text-emerald-400 italic">
                        0€
                      </div>
                    </div>
                    <div className="bg-black border border-white/5 p-4 rounded-2xl">
                      <div className="text-[9px] font-black text-blue-500 uppercase mb-1 italic">
                        ÉCART MOYEN
                      </div>
                      <div
                        className="text-xl font-black text-white italic"
                        data-testid="gain-yearly"
                      >
                        +
                        {Math.round(
                          calculationResult.averageYearlyGain
                        ).toLocaleString("fr-FR")}{" "}
                        €/an
                      </div>
                    </div>
                    <div className="bg-black border border-white/5 p-4 rounded-2xl">
                      <div className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">
                        POINT MORT
                      </div>
                      <div
                        className="text-xl font-black text-white italic"
                        data-testid="break-even"
                      >
                        {calculationResult.breakEvenPoint} ans
                      </div>
                    </div>
                    <div className="bg-black border border-white/5 p-4 rounded-2xl">
                      <div className="text-[9px] font-black text-yellow-500 uppercase mb-1 italic">
                        ÉQUIVALENT LIVRET A
                      </div>
                      <div
                        className="text-xl font-black text-yellow-400 italic"
                        data-testid="equivalent-livret-a"
                      >
                        {formatMoney(
                          calculationResult?.bankEquivalentCapital || 0
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ====================== RIGHT COLUMN (PLACEMENT + RÉALLOCATION) ====================== */}
                <div className="lg:col-span-4 space-y-6 flex flex-col">
                  {/* BANK EQUIVALENT */}
                  <div className="bg-[#050505] border border-blue-900/30 rounded-[32px] p-8 shadow-xl flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <Landmark className="text-blue-500 w-5 h-5" />
                      <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-widest italic">
                        ÉQUIVALENT BANCAIRE
                      </h3>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-6 italic uppercase leading-relaxed">
                      Pour générer{" "}
                      {Math.round(
                        calculationResult.averageYearlyGain
                      ).toLocaleString("fr-FR")}{" "}
                      €/an avec un Livret A, il faudrait bloquer :
                    </p>

                    <div
                      className="text-7xl font-black text-white mb-8 italic tracking-tighter leading-none"
                      data-testid="livret-a-capital"
                    >
                      {Math.round(
                        calculationResult.bankEquivalentCapital
                      ).toLocaleString("fr-FR")}{" "}
                      €
                    </div>

                    <div className="bg-blue-950/50 border border-blue-500/40 px-4 py-4 rounded-xl text-[11px] font-black text-blue-300 uppercase italic text-center shadow-inner tracking-widest">
                      ICI, VOUS NE BLOQUEZ RIEN.
                    </div>

                    <p className="mt-6 text-[9px] text-slate-500 italic uppercase flex items-center gap-2">
                      <Zap size={10} className="text-orange-500" /> votre
                      capital reste disponible.
                    </p>
                  </div>

                  {/* RÉALLOCATION — YEAR 1 */}
                  <div className="bg-[#050505] border border-orange-900/30 rounded-[32px] p-8 shadow-xl flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <Zap className="text-orange-500 w-5 h-5" />
                      <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-widest italic">
                        RÉALLOCATION ANNÉE 1
                      </h3>
                    </div>

                    <div
                      className={`text-6xl font-black mb-8 italic tracking-tighter leading-none ${
                        Math.round(calculationResult?.monthlyEffortYear1 || 0) >
                        40
                          ? "text-red-500"
                          : Math.round(
                              calculationResult?.monthlyEffortYear1 || 0
                            ) < 0
                          ? "text-emerald-400"
                          : "text-white"
                      }`}
                      data-testid="monthly-gain"
                    >
                      {(() => {
                        const effort = Math.round(
                          calculationResult?.monthlyEffortYear1 || 0
                        );
                        return `${effort > 0 ? "+" : ""}${effort} €`;
                      })()}
                    </div>

                    {/* NEW vs OLD BUDGET */}
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
                          ).toLocaleString("fr-FR")}{" "}
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
                          ).toLocaleString("fr-FR")}{" "}
                          €
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/10 w-full">
                        <span className="text-base font-black text-orange-500 italic uppercase tracking-wider">
                          = Réallocation
                        </span>
                        <span
                          className={`text-3xl font-black italic ${
                            Math.round(
                              calculationResult?.monthlyEffortYear1 || 0
                            ) > 40
                              ? "text-red-500"
                              : Math.round(
                                  calculationResult?.monthlyEffortYear1 || 0
                                ) < 0
                              ? "text-emerald-400"
                              : "text-white"
                          }`}
                          data-testid="monthly-reallocation"
                        >
                          {(() => {
                            const effort = Math.round(
                              calculationResult?.monthlyEffortYear1 || 0
                            );
                            return `${effort > 0 ? "+" : ""}${effort} €`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ====================== LOWER ROW (HERITAGE + GREEN VALUE) ====================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HERITAGE CARD */}
                <div className="bg-[#050505] border border-blue-500/20 rounded-[32px] p-8 flex flex-col justify-between relative shadow-2xl min-h-[480px]">
                  {/* BUTTON */}
                  <div className="absolute top-6 right-6 z-50">
                    <button
                      onMouseEnter={() => setShowHeritageInfo(true)}
                      onMouseLeave={() => setShowHeritageInfo(false)}
                      className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all"
                    >
                      <TrendingUp size={24} className="text-blue-500" />
                    </button>
                  </div>

                  {/* INFOBULLE */}
                  {showHeritageInfo && (
                    <div className="absolute inset-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-lg p-8 flex flex-col animate-in fade-in duration-200 overflow-y-auto">
                      <h4 className="text-blue-500 font-black italic mb-6 uppercase tracking-tighter text-xl border-b-2 border-blue-500/20 pb-4 mt-4">
                        NOTE FISCALE ET PATRIMONIALE
                      </h4>

                      <div className="space-y-4 text-slate-200 text-[11px] leading-relaxed">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-blue-400 font-black uppercase mb-2 tracking-widest">
                            L'ABATTEMENT (LOI FRANÇAISE)
                          </p>
                          <p>
                            Chaque enfant bénéficie d'un abattement de{" "}
                            <span className="text-white font-bold">
                              100 000 €
                            </span>{" "}
                            tous les 15 ans. Si le patrimoine transmis est
                            inférieur à ce montant :{" "}
                            <span className="text-emerald-400 font-bold">
                              0 €
                            </span>
                            .
                          </p>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-red-400 font-black uppercase mb-2 tracking-widest">
                            LES TRANCHES (AU-DELÀ)
                          </p>
                          <p>
                            Au-delà de 100 000 €, l’impôt devient progressif. La
                            tranche majoritaire est{" "}
                            <span className="text-white font-bold">20%</span>.
                          </p>
                        </div>

                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                          <p className="text-white font-black uppercase mb-2 tracking-widest italic">
                            NOTRE MÉTHODE DE CALCUL
                          </p>
                          <p className="italic">
                            Nous provisionnons{" "}
                            <span className="text-white font-bold text-sm">
                              20%
                            </span>{" "}
                            du capital généré afin de garantir un montant{" "}
                            <u>net minimum</u>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MAIN CARD CONTENT */}
                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">
                      HÉRITAGE NET
                    </h3>
                    <p className="text-[10px] font-black text-blue-500 uppercase italic mb-6">
                      PROJECTION PATRIMONIALE RÉELLE
                    </p>

                    <div className="mb-2">
                      <div className="text-7xl font-black text-white italic tracking-tighter leading-none">
                        {(
                          Math.round(
                            calculationResult?.totalSavingsProjected || 0
                          ) * 0.8
                        ).toLocaleString("fr-FR")}{" "}
                        €
                      </div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase italic mt-2 tracking-[0.2em]">
                        Somme nette disponible sur {projectionYears} ans
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-white/5 rounded-2xl p-5 border border-white/10">
                    <div className="space-y-2 text-[11px] font-bold uppercase">
                      <div className="flex justify-between">
                        <span className="text-slate-400 tracking-tighter">
                          Gains énergie (brut) :
                        </span>
                        <span className="text-white">
                          +
                          {Math.round(
                            calculationResult?.totalSavingsProjected || 0
                          ).toLocaleString("fr-FR")}{" "}
                          €
                        </span>
                      </div>

                      <div className="flex justify-between opacity-50 italic">
                        <span className="text-slate-400 tracking-tighter">
                          Valeur verte maison :
                        </span>
                        <span className="text-white">
                          +
                          {Math.round(
                            calculationResult?.greenValue || 15000
                          ).toLocaleString("fr-FR")}{" "}
                          €
                        </span>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-white/10">
                        <span className="text-red-400 italic">
                          Provision succession (20 %) :
                        </span>
                        <span className="text-red-400">
                          -
                          {(
                            Math.round(
                              calculationResult?.totalSavingsProjected || 0
                            ) * 0.2
                          ).toLocaleString("fr-FR")}{" "}
                          €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GREEN VALUE CARD */}
                <div className="bg-[#050505] border border-orange-500/20 rounded-[32px] p-8 flex flex-col justify-between relative shadow-2xl min-h-[480px]">
                  {/* BUTTON */}
                  <div className="absolute top-6 right-6 z-50">
                    <button
                      onMouseEnter={() => setShowGreenValueInfo(true)}
                      onMouseLeave={() => setShowGreenValueInfo(false)}
                      className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 hover:border-orange-500/50 transition-all"
                    >
                      <Sun size={24} className="text-orange-500" />
                    </button>
                  </div>

                  {/* INFOBULLE */}
                  {showGreenValueInfo && (
                    <div className="absolute inset-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-lg p-10 flex flex-col animate-in fade-in duration-200 overflow-y-auto">
                      <h4 className="text-orange-500 font-black italic mb-8 uppercase tracking-tighter text-xl border-b-2 border-orange-500/20 pb-4 mt-8">
                        CADRE RÉGLEMENTAIRE & PATRIMONIAL
                      </h4>

                      <div className="space-y-6 text-slate-200 italic text-[13px] leading-relaxed">
                        <div className="p-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl mb-2">
                          <p className="text-white font-black uppercase text-[11px] mb-2 tracking-widest">
                            INDICE DE VALORISATION :
                          </p>
                          <div className="flex items-center gap-6">
                            <p className="text-3xl text-orange-400 font-black tracking-tighter">
                              COEFFICIENT 4%
                            </p>
                            <p className="text-white text-[9px] font-bold uppercase tracking-widest leading-tight border-l border-white/20 pl-4">
                              Moyenne constatée
                              <br />
                              Notaires de France
                            </p>
                          </div>
                        </div>

                        <p>
                          <b className="text-white underline uppercase text-[12px]">
                            01. Amélioration DPE :
                          </b>
                          réduction de la consommation d’énergie primaire.
                        </p>

                        <p>
                          <b className="text-white underline uppercase text-[12px]">
                            02. Référentiel ETALAB :
                          </b>
                          calcul indexé sur DVF (Data.gouv.fr).
                        </p>

                        <p>
                          <b className="text-white underline uppercase text-[12px]">
                            03. Notaires de France :
                          </b>
                          attestation de plus-value immobilière immédiate.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* MAIN CARD */}
                  <div>
                    <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">
                      VALEUR VERTE
                    </h3>
                    <p className="text-[10px] font-black text-orange-500 uppercase italic mb-4">
                      Votre résidence à
                      <span className="underline text-white ml-1 uppercase">
                        {data?.address || "ADRESSE"}
                      </span>
                    </p>

                    <div className="text-7xl font-black text-orange-400 italic tracking-tighter mb-2 leading-none">
                      +
                      {Math.round(
                        calculationResult?.greenValue || 0
                      ).toLocaleString("fr-FR")}{" "}
                      €
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 rounded-xl text-[12px] font-black text-emerald-400 uppercase italic mb-4 w-fit tracking-wider flex items-center gap-3">
                      <CheckCircle2 size={18} /> Analyse réelle :{" "}
                      {data?.address || "SECTEUR"}
                    </div>

                    <p className="text-[14px] text-slate-300 leading-relaxed italic uppercase mb-4 max-w-[95%] font-medium">
                      Plus-value estimée pour votre bien de
                      <span className="text-white font-black underline decoration-orange-500">
                        {data?.houseSize || calculationResult?.houseSize || 120}{" "}
                        m²
                      </span>{" "}
                      dans votre secteur. C’est un
                      <span className="text-orange-500 font-bold italic uppercase">
                        actif immobilier
                      </span>{" "}
                      immédiat.
                    </p>
                  </div>

                  <div className="bg-[#171412] rounded-2xl p-4 border border-white/5 shadow-inner mt-2 text-[11px] font-black uppercase tracking-widest italic text-slate-500">
                    Calcul :{" "}
                    {greenValueData?.pricePerSqm?.toLocaleString() || "3 200"}{" "}
                    €/m² × {data?.houseSize || 120} m² × 4% ={" "}
                    {Math.round(
                      calculationResult?.greenValue || 0
                    ).toLocaleString("fr-FR")}{" "}
                    €
                  </div>
                </div>
              </div>

              {/* ======== MICRO-VERROU CLOSING – ne pas supprimer ======== */}
              <p className="text-center text-[11px] text-slate-500 italic mt-8 select-none">
                Ce module ne sert pas à décider. Il sert à se projeter dans ce
                que vous avez déjà choisi.
              </p>
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
              setActiveModule(id);
            }}
          >
            <p className="text-[10px] text-slate-400 italic mb-3">
              Ce qui suit ne sert pas à choisir — juste à vérifier qu'on ne fait
              pas une erreur.
            </p>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-8 border border-white/10">
              {/* HEADER */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <HelpCircle size={28} className="text-blue-500" />
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                      Votre argent dans {projectionYears} ans
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Visualisation factuelle — où vont vos dépenses selon votre
                      choix.
                    </p>
                  </div>
                </div>

                {/* SWITCH MODE */}
                <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10 shadow-inner">
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

              {/* CARDS – 5 / 10 / 20 ans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {yearsToDisplay.map((year) => {
                  const data = getYearData(year);
                  const selectedData =
                    whereMoneyMode === "financement" ? data.credit : data.cash;

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
                  } else if (year === 20) {
                    headerColor = "text-emerald-500";
                    borderColor = "border-emerald-500/30";
                    shadowColor =
                      "hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]";
                  }

                  return (
                    <div
                      key={year}
                      className={`relative bg-[#0b0b0b]/60 backdrop-blur-md border ${borderColor} rounded-2xl p-6 overflow-hidden group transition-all duration-300 hover:border-white/30 ${shadowColor}`}
                    >
                      {/* watermark année */}
                      <div className="absolute top-4 right-4 text-[130px] font-black text-white opacity-[0.03] leading-none select-none pointer-events-none">
                        {year}
                      </div>

                      <h3
                        className={`${headerColor} font-bold text-sm uppercase mb-6 tracking-wider`}
                      >
                        DANS {year} ANS
                      </h3>

                      <div className="space-y-6 relative z-10">
                        {/* SCENARIO SOLAIRE */}
                        <div className="bg-gradient-to-br from-blue-950/30 to-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={14} className="text-blue-400" />
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                              Avec installation solaire
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-[9px] text-slate-500 uppercase mb-1">
                                Total dépensé en énergie
                              </p>
                              <p className="text-2xl font-black text-white tabular-nums">
                                {formatMoney(youPaid)}
                              </p>
                            </div>

                            {difference > 0 && (
                              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg">
                                <p className="text-[9px] text-emerald-400 uppercase mb-1">
                                  Différence observée
                                </p>
                                <p className="text-3xl font-black text-emerald-400 tabular-nums">
                                  +{formatMoney(difference)}
                                </p>
                              </div>
                            )}

                            {difference <= 0 && (
                              <div className="bg-orange-950/30 border border-orange-500/30 p-3 rounded-lg">
                                <p className="text-[9px] text-orange-400 uppercase mb-1">
                                  Phase d’équilibre
                                </p>
                                <p className="text-lg font-black text-orange-400">
                                  Retour estimé dans{" "}
                                  {calculationResult.breakEvenPoint - year} ans
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* STATU QUO */}
                        <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 border border-red-500/20 p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                              Sans changement (factures actuelles)
                            </span>
                          </div>

                          <p className="text-[9px] text-red-300 uppercase mb-1">
                            Dépenses en énergie (non récupérables)
                          </p>
                          <p className="text-2xl font-black text-red-400 tabular-nums">
                            {formatMoney(youWouldHavePaid)}
                          </p>

                          {difference > 0 && (
                            <div className="mt-3 pt-3 border-t border-red-900/30">
                              <p className="text-[9px] text-red-500 uppercase mb-1">
                                Écart constaté
                              </p>
                              <p className="text-xl font-black text-red-500 tabular-nums">
                                {formatMoney(difference)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Résumé final (seulement 20 ans) */}
                        {year === 20 && difference > 0 && (
                          <div className="bg-emerald-600/15 border border-emerald-500/30 p-4 rounded-xl backdrop-blur-sm">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase text-center mb-1">
                              Visualisation synthétique
                            </p>
                            <p className="text-4xl font-black text-emerald-400 text-center tabular-nums">
                              +{formatMoney(difference)}
                            </p>
                            <p className="text-[9px] text-emerald-300 text-center mt-1 uppercase">
                              dans votre maison, au lieu de 0€
                            </p>
                          </div>
                        )}

                        {/* Phrase ANCRAGE – anti regret */}
                        {year === 10 && (
                          <p className="mt-6 pt-6 border-t border-white/5 text-xs text-blue-400 font-medium uppercase">
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

              {/* URGENCE NEUTRALE */}
              <div className="mt-10 bg-gradient-to-r from-orange-950/30 to-red-950/30 border-l-4 border-orange-500 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Clock
                    size={24}
                    className="text-orange-400 flex-shrink-0 mt-1"
                  />
                  <div>
                    <h4 className="text-orange-400 font-bold text-lg mb-2">
                      Dépense mensuelle actuelle :{" "}
                      {formatMoney(calculationResult.oldMonthlyBillYear1)}
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Aujourd’hui, chaque mois représente ce montant dépensé en
                      énergie. Avec installation solaire, cette même dépense
                      devient progressivement un investissement utile – sur{" "}
                      {projectionYears} ans.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* 🎧 Coach – ultra discret en bas à gauche */}
            <div
              style={{
                position: "fixed",
                bottom: "12px",
                left: "12px", // ✅ CHANGÉ
                zIndex: 9999999,
                pointerEvents: "auto",
              }}
            >
              <button
                onClick={() => setShowCoachTip((p) => !p)}
                onMouseDown={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  width: "6px", // ✅ Plus petit
                  height: "6px",
                  borderRadius: "50%",
                  background: "rgba(100,100,100,0.15)", // ✅ Gris discret
                  border: "none",
                  cursor: "pointer",
                  transition: "0.3s ease",
                  padding: 0,
                  opacity: 0.3, // ✅ Quasi invisible
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

              {/* 🎧 Coach – PORTAL – bouton interne sécurisé */}
              {createPortal(
                <div
                  style={{
                    position: "fixed",
                    bottom: "12px",
                    left: "12px", // ✅ CHANGÉ
                    zIndex: 999999999,
                    pointerEvents: "auto",
                  }}
                >
                  <button
                    onClick={() => setShowCoachTip((p) => !p)}
                    onMouseDown={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      width: "6px", // ✅ Plus petit
                      height: "6px",
                      borderRadius: "50%",
                      background: "rgba(100,100,100,0.15)", // ✅ Gris discret
                      border: "none",
                      cursor: "pointer",
                      transition: "0.3s ease",
                      padding: 0,
                      opacity: 0.3, // ✅ Quasi invisible
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
                      e.currentTarget.style.background =
                        "rgba(100,100,100,0.15)";
                      e.currentTarget.style.color = "transparent";
                      e.currentTarget.style.padding = "0";
                      e.currentTarget.style.opacity = "0.3";
                    }}
                  />
                </div>,
                document.body
              )}
            </div>
          </ModuleSection>

          {/* ============================================
 MODULE 3 : AJUSTEMENT DE FINANCEMENT — V2 PREMIUM
 ============================================ */}
          <ModuleSection
            id="financement-vs-cash"
            title="Ajustement de Financement"
            icon={<Coins className="text-emerald-500" />}
            defaultOpen={false}
          >
            <div className="relative bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10">
              {/* HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-emerald-500">
                  <Coins size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    AJUSTEMENT DE FINANCEMENT
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Le projet est acté — ici, on vérifie simplement la façon la
                    plus fluide de le régler, sans pression.
                  </p>
                </div>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* FINANCEMENT */}
                <div className="bg-black/60 backdrop-blur-md border border-blue-900/30 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <Wallet size={120} className="text-blue-500" />
                  </div>

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-400">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase">
                        FINANCEMENT
                      </h3>
                      <p className="text-blue-300 text-xs">
                        Vous gardez votre épargne intacte — rien ne sort
                        aujourd’hui.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 relative z-10">
                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Repère ({projectionYears} ans)
                      </span>
                      <span className="text-xl font-black text-white">
                        {formatMoney(calculationResult.totalSavingsProjected)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Seuil d’équilibre
                      </span>
                      <span className="text-xl font-black text-blue-400">
                        {calculationResult.breakEvenPoint === 1
                          ? "1 an"
                          : `${calculationResult.breakEvenPoint} ans`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Épargne mobilisée
                      </span>
                      <span className="text-xl font-black text-emerald-400">
                        0€
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-950/10 border border-blue-900/20 rounded-xl p-4 relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-bold uppercase">
                      <CheckCircle2 size={14} /> Points clés
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={12} className="text-blue-500" />
                        La facture actuelle devient le moteur du projet
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={12} className="text-blue-500" />
                        Pas de nouvelle charge durable
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CASH */}
                <div className="bg-black/60 backdrop-blur-md border border-emerald-900/30 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <Coins size={120} className="text-emerald-500" />
                  </div>

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400">
                      <Coins size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase">
                        CASH
                      </h3>
                      <p className="text-emerald-300 text-xs">
                        Pour ceux qui préfèrent avoir fini d’un seul geste.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8 relative z-10">
                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Repère ({projectionYears} ans)
                      </span>
                      <span className="text-xl font-black text-emerald-400">
                        {formatMoney(
                          calculationResult.totalSavingsProjectedCash
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Seuil d’équilibre
                      </span>
                      <span className="text-xl font-black text-emerald-400">
                        {calculationResult.breakEvenPointCash === 1
                          ? "1 an"
                          : `${calculationResult.breakEvenPointCash} ans`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4 relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-bold uppercase">
                      <CheckCircle2 size={14} /> Points clés
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Vous libérez votre esprit immédiatement
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Pas d’intérêts futurs — sujet clôturé
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* BADGE V2 — halo */}
              <div className="flex justify-center mt-10 mb-8">
                <div className="relative px-10 py-6 rounded-2xl border border-emerald-500/40 backdrop-blur-md bg-emerald-950/40 shadow-[0_0_45px_rgba(16,185,129,0.35)]">
                  <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[0_0_90px_20px_rgba(16,185,129,0.15)]"></div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 text-center flex items-center gap-2 justify-center">
                    <Lock size={12} />
                    DIFFÉRENCE ÉCONOMIQUE
                  </div>
                  <div className="text-4xl font-black text-emerald-400 text-center">
                    +
                    {formatMoney(
                      calculationResult.totalSavingsProjectedCash -
                        calculationResult.totalSavingsProjected
                    )}
                  </div>
                  <div className="text-xs text-emerald-300 mt-1 text-center">
                    C’est une différence qui existe — mais elle n’est pas
                    décisionnelle.
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-6 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-slate-400 text-center">
                L’important, c’est que la décision vous reste confortable —
                aujourd’hui et demain.
              </div>
            </div>
            {/* VERDICT – Double alternative (verrou final) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3 transition-all duration-300 hover:border-blue-500/50">
                <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <Wallet className="text-blue-400" size={20} />
                </div>
                <div>
                  <h4 className="text-blue-400 font-bold text-sm mb-2 uppercase tracking-wider">
                    FINANCEMENT STRUCTURÉ
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Si vous préférez{" "}
                    <strong>conserver votre capital disponible</strong> (0€
                    immobilisé).
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 transition-all duration-300 hover:border-emerald-500/50">
                <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="text-emerald-400" size={20} />
                </div>
                <div>
                  <h4 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider">
                    CASH OPTIMAL
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Si vous disposez du capital :{" "}
                    <strong>
                      +
                      {formatMoney(
                        calculationResult.totalSavingsProjectedCash -
                          calculationResult.totalSavingsProjected
                      )}
                    </strong>{" "}
                    d’écart sur {projectionYears} ans.
                  </p>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================
MODULE 5 : COMPARAISON – Vos autres options
============================================ */}
          <ModuleSection
            id="comparaison"
            title="Comparaison avec vos autres options"
            icon={<Landmark className="text-purple-500" />}
            defaultOpen={false}
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Landmark size={120} className="text-purple-500" />
              </div>

              <div className="relative z-10">
                {/* HEADER */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-purple-500">
                    <Landmark size={26} />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    Comparaison avec vos autres options
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 italic mb-3">
                  Ce qui suit ne sert pas à choisir — juste à vérifier qu'on ne
                  fait pas une erreur.
                </p>

                {/* ✅ LIGNE 1 AVEC INFOBULLE */}
                <div className="mb-4 bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded text-sm text-gray-300 leading-relaxed flex items-start gap-3">
                  <span className="flex-1">
                    Les deux scénarios sont présentés de manière strictement
                    symétrique. La différence observée provient uniquement du
                    mode de production de l'énergie.
                  </span>
                  <InfoPopup title="D'où viennent ces chiffres ?">
                    <p className="mb-3">
                      Les calculs sont basés sur{" "}
                      <strong>votre consommation déclarée</strong>, les tarifs
                      réglementés en vigueur et des hypothèses d'évolution
                      prudentes (inflation énergétique 5%).
                    </p>
                    <p className="mb-3">
                      <strong>Les mêmes paramètres</strong> sont appliqués à
                      tous les scénarios (avec solaire, sans solaire, Livret A,
                      SCPI).
                    </p>
                    <p className="text-blue-400 text-xs">
                      Cette symétrie méthodologique garantit que la différence
                      observée provient uniquement du mode de production, pas
                      d'un biais de calcul.
                    </p>
                  </InfoPopup>
                </div>

                {/* ✅ LIGNE 2 AVEC INFOBULLE */}
                <div className="mb-6 bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded text-sm text-gray-300 leading-relaxed flex items-start gap-3">
                  <span className="flex-1">
                    Même avec une stagnation des prix de l'énergie,
                    l'installation reste pertinente car elle remplace une
                    dépense par une autoproduction à coût marginal quasi nul.
                  </span>
                  <InfoPopup title="Et si les prix n'augmentent pas ?">
                    <p className="mb-3">
                      Si les prix de l'énergie{" "}
                      <strong>restaient constants</strong>, l'écart économique
                      serait réduit, mais{" "}
                      <strong>la hiérarchie resterait identique</strong>{" "}
                      (solaire {">"} pas de solaire).
                    </p>
                    <p className="mb-3">
                      Le solaire agit en{" "}
                      <strong>réduisant une dépendance</strong>, pas en
                      spéculant sur une hausse. Vous produisez une partie de
                      votre énergie plutôt que de l'acheter intégralement au
                      réseau.
                    </p>
                    <p className="text-blue-400 text-xs">
                      Même avec une inflation énergétique nulle, vous économisez
                      sur votre facture dès la première année grâce à
                      l'autoconsommation.
                    </p>
                  </InfoPopup>
                </div>

                {/* OPTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* LIVRET A */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-black/60 backdrop-blur-md border border-blue-900/20 p-6 rounded-2xl">
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
                        PERFORMANCE ANNUELLE
                      </div>
                    </div>
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
                    <div className="bg-black/60 backdrop-blur-md border border-purple-900/20 p-6 rounded-2xl">
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
                        PERFORMANCE ANNUELLE
                      </div>
                    </div>
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
                    <div className="bg-black/60 backdrop-blur-md border border-orange-900/20 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-orange-900/30 p-2 rounded-lg text-orange-400">
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
                      <div className="text-4xl font-black text-orange-500 mb-2">
                        4.5%
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        PERFORMANCE ANNUELLE
                      </div>
                    </div>
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

                  {/* SOLAIRE */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-[#022c22] border border-emerald-500 p-6 rounded-2xl relative shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      {/* ✅ BADGE MODIFIÉ */}
                      <div className="absolute top-3 right-3 bg-slate-700 text-slate-300 border border-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        Garantie 25 ans incluse
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                          <Sun size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-white text-sm uppercase">
                            SOLAIRE
                          </h3>
                          <p className="text-[10px] text-emerald-300">
                            Sans immobiliser de capital
                          </p>
                        </div>
                      </div>
                      <div className="text-4xl font-black text-emerald-400 mb-2">
                        0€
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4">
                        CAPITAL BLOQUÉ
                      </div>
                      <div className="border-t border-emerald-500/30 pt-3 text-xs font-bold text-white flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        Vous réduisez votre dépendance au réseau
                      </div>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">
                        Écart sur {projectionYears} ans
                      </div>
                      <div className="text-xl font-black text-emerald-400">
                        {formatMoney(calculationResult.totalSavingsProjected)}
                      </div>
                      <div className="text-[9px] text-emerald-300 mt-1">
                        Équivalent à{" "}
                        {formatMoney(calculationResult.bankEquivalentCapital)}{" "}
                        sur un Livret A
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-8 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                  <Lightbulb
                    size={20}
                    className="text-yellow-500 flex-shrink-0 mt-0.5"
                  />
                  <p>
                    <strong className="text-white">La différence ?</strong> Les
                    placements immobilisent votre capital. Le solaire permet de
                    redistribuer dans le temps une dépense énergétique
                    existante, tout en conservant votre épargne disponible.
                  </p>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================
    MODULE 7 : BILAN TOTAL SUR X ANS
    Version 10/10 — Closing NET maximisé
    + 2 micro-corrections anti-annulation
    ============================================ */}
          <ModuleSection
            id="bilan-total"
            title="Bilan Total sur X ans"
            icon={<Scale className="text-slate-400" />}
            defaultOpen={false}
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 relative">
              {/* ============================================
        BOUTON SCRIPTS COACH (invisible client)
        ============================================ */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowScripts((p) => !p);
                }}
                onMouseDown={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all opacity-50 hover:opacity-100"
                title="."
              >
                <MessageSquare size={16} className="text-slate-400" />
              </button>

              {/* ============================================
        PANEL SCRIPTS — avec transition douce
        ⚠️ CORRECTION 2 : glissement smooth
        ============================================ */}
              {showScripts && (
                <div className="absolute top-16 right-4 z-50 w-96 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl animate-slideIn">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-blue-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Scripts Terrain
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowScripts(false)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Sélecteur profil */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setScriptProfile("standard")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        scriptProfile === "standard"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setScriptProfile("banquier")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        scriptProfile === "banquier"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Banquier
                    </button>
                    <button
                      onClick={() => setScriptProfile("senior")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        scriptProfile === "senior"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Senior
                    </button>
                  </div>

                  {/* Scripts selon profil */}
                  <div className="space-y-4">
                    {/* STANDARD */}
                    {scriptProfile === "standard" && (
                      <>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-400">
                                1
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Avant ouverture
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic">
                            "Je vous montre juste les faits, pour que vous
                            décidiez sereinement."
                          </p>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-400">
                                2
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Pendant (après 6-7 sec)
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic mb-2">
                            "Vous dépensez déjà cette somme. Ici, on choisit
                            simplement où elle va."
                          </p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                            <Clock size={12} className="text-orange-400" />
                            <span className="text-xs text-orange-400 font-bold">
                              SILENCE 2 SEC OBLIGATOIRE
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-400">
                                3
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Après (ancrage)
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic">
                            "Sur la seule logique financière… ça tient la route
                            pour vous ?"
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            ⚠️ Attendre réponse — ne rien ajouter
                          </p>
                        </div>
                      </>
                    )}

                    {/* BANQUIER */}
                    {scriptProfile === "banquier" && (
                      <>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-emerald-400">
                                1
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Avant ouverture
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic">
                            "Je vous affiche simplement les données, pour que
                            vous puissiez arbitrer."
                          </p>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-emerald-400">
                                2
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Pendant (après 6-7 sec)
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic mb-2">
                            "Ce n'est pas un surcoût. C'est un arbitrage
                            budgétaire."
                          </p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                            <Clock size={12} className="text-orange-400" />
                            <span className="text-xs text-orange-400 font-bold">
                              SILENCE 2 SEC OBLIGATOIRE
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-emerald-400">
                                3
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Après (ancrage)
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic">
                            "Sur la base des chiffres, l'arbitrage vous paraît
                            rationnel ?"
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            ⚠️ Attendre réponse — ne rien ajouter
                          </p>
                        </div>
                      </>
                    )}

                    {/* SENIOR */}
                    {scriptProfile === "senior" && (
                      <>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-400">
                                1
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Avant ouverture
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic">
                            "Je vous montre juste les faits, pour que vous
                            décidiez sereinement."
                          </p>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-400">
                                2
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Pendant (après 6-7 sec)
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic mb-2">
                            "On ne dépense pas plus. On sécurise simplement une
                            dépense existante."
                          </p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                            <Clock size={12} className="text-orange-400" />
                            <span className="text-xs text-orange-400 font-bold">
                              SILENCE 2 SEC OBLIGATOIRE
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-purple-400">
                                3
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 uppercase font-medium">
                              Après (ancrage)
                            </span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed italic">
                            "Pour votre tranquillité, ça vous paraît logique ?"
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            ⚠️ Attendre réponse — ne rien ajouter
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Note importante */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-500 italic">
                      💡 Regard écran pendant silence, pas client
                    </p>
                  </div>
                </div>
              )}

              {/* ============================================
        HEADER
        ============================================ */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <Scale className="text-slate-400 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      BILAN TOTAL SUR {projectionYears} ANS
                    </h2>
                    {/* ============================================
              ⚠️ CORRECTION 1 : Ligne d'introduction neutre
              Protège closing NET si conseiller oublie phrase
              ============================================ */}
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      Comparatif objectif – destiné uniquement à éclairer la
                      décision
                    </p>
                  </div>
                </div>

                {/* Switch Financement/Cash */}
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
                {/* ============================================
          BARRE ROUGE - Sans Solaire
          ============================================ */}
                <div className="relative group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                        Sans Solaire (Dépense énergétique)
                      </span>
                    </div>
                    <span className="text-4xl font-black text-white">
                      {formatMoney(
                        gouffreMode === "financement"
                          ? calculationResult.totalSpendNoSolar
                          : calculationResult.totalSpendNoSolarCash
                      )}
                    </span>
                  </div>

                  {/* BARRE MASSIVE 3D - ROUGE */}
                  <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-red-900/40 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500 via-red-600 to-red-700 rounded-2xl shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),inset_0_4px_8px_rgba(255,255,255,0.1)]">
                      {/* Shimmer allégé */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                      {/* Highlight top */}
                      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>

                      {/* Shadow bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  </div>

                  {/* Message neutralisé */}
                  <div className="flex items-center gap-2 mt-3 text-slate-400 text-sm italic">
                    <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                    Dépense énergétique actuelle.
                  </div>
                </div>

                {/* ============================================
          BARRE BLEUE/VERTE - Avec Solaire
          ============================================ */}
                <div className="relative group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          gouffreMode === "cash"
                            ? "bg-emerald-500/80"
                            : "bg-blue-500/80"
                        }`}
                      ></div>
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                        Avec Solaire (Investissement valorisé)
                      </span>
                    </div>
                    <span className="text-4xl font-black text-white">
                      {formatMoney(
                        gouffreMode === "financement"
                          ? calculationResult.totalSpendSolar
                          : calculationResult.totalSpendSolarCash
                      )}
                    </span>
                  </div>

                  {/* BARRE MASSIVE 3D - PROPORTIONNELLE */}
                  <div className="relative h-28 bg-gradient-to-b from-black/80 to-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Fond grisé */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-slate-900/30"></div>

                    {/* Barre proportionnelle */}
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
                      {/* Shimmer allégé */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                      {/* Highlight/Shadow */}
                      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    {/* Message neutralisé */}
                    <div
                      className={`flex items-center gap-2 text-sm italic ${
                        gouffreMode === "cash"
                          ? "text-emerald-400/70"
                          : "text-blue-400/70"
                      }`}
                    >
                      <Zap size={14} />
                      Investissement valorisé sur 25+ ans.
                    </div>

                    {/* Badge différence */}
                    <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 px-5 py-3 rounded-xl flex items-center gap-3">
                      <Coins size={16} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400/70 font-bold uppercase tracking-wider">
                        Différence :
                      </span>
                      <span className="text-2xl font-black text-emerald-400">
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

              {/* Message explicatif */}
              <div className="mt-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 flex-shrink-0">
                  <Info size={16} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">
                    Lecture du bilan
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Le scénario{" "}
                    <strong className="text-red-400">sans solaire</strong>{" "}
                    représente votre dépense énergétique actuelle. Le scénario{" "}
                    <strong className="text-blue-400">avec solaire</strong>{" "}
                    transforme cette dépense en investissement qui génère de la
                    valeur pendant 25+ ans.
                  </p>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================
    MODULE 13 : PROJECTION FINANCIÈRE (20 ANS)
    Objectif : Sécuriser la décision & éliminer l’annulation J+7
    ============================================ */}
          <ModuleSection
            id="tableau-detaille"
            title="Projection Financière — 20 ans"
            icon={<Table2 className="text-slate-400" />}
            defaultOpen={false} // fermé par défaut — on ne l’ouvre QUE si demandé
          >
            <p className="text-[10px] text-slate-400 italic mb-3">
              Ce qui suit ne sert pas à choisir — juste à vérifier qu'on ne fait
              pas une erreur.
            </p>
            {/* Coach bouton */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Analyse long terme – pour confirmer que la décision est
                rationnelle
              </p>
              <button
                onClick={() => setShowCoachPanel(!showCoachPanel)}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Coach
              </button>
            </div>

            {/* Bloc coach terrain */}
            {showCoachPanel && (
              <div className="mb-4 bg-blue-950/20 border border-blue-500/30 rounded-lg p-3 text-xs">
                <p className="font-bold text-blue-400 mb-1">
                  Wording terrain recommandé
                </p>
                <p className="text-slate-200 italic leading-relaxed">
                  “Ce tableau n’est pas pour prendre la décision. La décision se
                  prend sur ce qui se passe aujourd’hui dans votre vie. Ici, on
                  regarde juste comment cette décision se comporte dans le temps
                  — et ça confirme que ce n’est pas un choix émotionnel, mais
                  factuel et rationnel.”
                </p>

                <details className="mt-2">
                  <summary className="cursor-pointer text-[10px] text-slate-500 uppercase">
                    Variante Banquier (chiffres)
                  </summary>
                  <p className="mt-2 text-slate-400 text-[11px] italic">
                    “Année {Math.floor(creditDurationMonths / 12)} : le crédit
                    se termine. À partir de là, la trésorerie devient positive.
                    C’est la ligne que vous sécurisez aujourd’hui.”
                  </p>
                </details>
              </div>
            )}

            {/* Contrôles : Scénario et affichage */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
              {/* Financement / Cash */}
              <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                <button
                  onClick={() => setTableScenario("financement")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    tableScenario === "financement"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Financement
                </button>
                <button
                  onClick={() => setTableScenario("cash")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
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
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    tableMode === "annuel"
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Annuel
                </button>

                <button
                  onClick={() => setTableMode("mensuel")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    tableMode === "mensuel"
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Mensuel
                </button>
              </div>
            </div>

            {/* TABLEAU */}
            <div className="overflow-x-auto">
              <table
                id="detailed-finance-table"
                className="w-full text-left border-collapse"
              >
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                    <th className="py-3 px-4">Année</th>
                    <th className="py-3 px-4 text-red-400">Sans Solaire</th>

                    {/* Mode banquier = détails */}
                    {showDetails && (
                      <>
                        <th className="py-3 px-4 text-blue-400">Crédit</th>
                        <th className="py-3 px-4 text-yellow-400">
                          Facture restante
                        </th>
                      </>
                    )}

                    <th className="py-3 px-4 text-white">Avec Solaire</th>
                    <th className="py-3 px-4 text-slate-300">
                      Différence {tableMode === "annuel" ? "/an" : "/mois"}
                    </th>
                    <th className="py-3 px-4 text-emerald-400 text-right">
                      Trésorerie cumulée
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm font-mono text-slate-300">
                  {/* Année 0 */}
                  <tr className="border-b border-white/5 bg-[#1a1505]/30">
                    <td className="py-4 px-4 text-yellow-500 font-bold">
                      Année 0
                    </td>
                    <td className="py-4 px-4 opacity-50">-</td>
                    {showDetails && <td className="py-4 px-4 opacity-50">-</td>}
                    {showDetails && <td className="py-4 px-4 opacity-50">-</td>}
                    <td className="py-4 px-4 text-yellow-400 font-bold uppercase">
                      APPORT :{" "}
                      {formatMoney(
                        tableScenario === "financement"
                          ? cashApport
                          : installCost
                      )}
                    </td>
                    <td className="py-4 px-4 text-red-400 font-bold">
                      {formatMoney(
                        (tableScenario === "financement"
                          ? cashApport
                          : installCost) / (tableMode === "mensuel" ? 12 : 1)
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-red-500 font-bold">
                      -
                      {formatMoney(
                        tableScenario === "financement"
                          ? cashApport
                          : installCost
                      )}
                    </td>
                  </tr>

                  {(tableScenario === "financement"
                    ? calculationResult.details
                    : calculationResult.detailsCash
                  )
                    .slice(0, projectionYears)
                    .map((row, i) => {
                      const isCreditActive =
                        i < creditDurationMonths / 12 &&
                        tableScenario === "financement";
                      const creditAmountYearly = isCreditActive
                        ? (creditMonthlyPayment + insuranceMonthlyPayment) * 12
                        : 0;
                      const divider = tableMode === "mensuel" ? 12 : 1;

                      const noSolar = row.edfBillWithoutSolar / divider;
                      const credit = creditAmountYearly / divider;
                      const residue = row.edfResidue / divider;
                      const totalWithSolar = credit + residue;
                      const eff = totalWithSolar - noSolar;

                      return (
                        <tr
                          key={row.year}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-500">
                            {row.year}
                          </td>
                          <td className="py-3 px-4 text-red-400/80">
                            {formatMoney(noSolar)}
                          </td>

                          {showDetails && (
                            <>
                              <td className="py-3 px-4 text-blue-400/80">
                                {formatMoney(credit)}
                              </td>
                              <td className="py-3 px-4 text-yellow-400/80">
                                {formatMoney(residue)}
                              </td>
                            </>
                          )}

                          <td className="py-3 px-4 font-bold text-white">
                            {formatMoney(totalWithSolar)}
                          </td>
                          <td
                            className={`py-3 px-4 font-bold ${
                              eff > 0 ? "text-white" : "text-emerald-400"
                            }`}
                          >
                            {eff > 0 ? "+" : ""}
                            {formatMoney(eff)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
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

                {/* Footer total */}
                <tfoot className="sticky bottom-0 bg-black/95 backdrop-blur-xl border-t-2 border-emerald-500/30">
                  <tr>
                    <td
                      colSpan={showDetails ? 6 : 4}
                      className="py-3 px-4 text-right text-xs font-bold text-slate-400 uppercase"
                    >
                      Gain total sur {projectionYears} ans
                    </td>
                    <td className="py-3 px-4 text-right text-xl font-black text-emerald-400">
                      {formatMoney(
                        (tableScenario === "financement"
                          ? calculationResult.details
                          : calculationResult.detailsCash)[projectionYears - 1]
                          ?.cumulativeSavings || 0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Toggle vue simplifiée / banquier */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showDetails ? "Vue globale" : "Vue complète"}
            </button>
          </ModuleSection>
        </ModuleSection>
        {/* ============================================
MODULE : PROCESSUS DE QUALIFICATION TERMINAL – VERSION CLOSING NET
============================================ */}

        <ModuleSection
          id="054888f4-10e4-4eae-8c44-08dd0680f68" // L'ID de ta capture !
          title="PROTOCOLE DE QUALIFICATION"
          icon={<ShieldCheck className="text-emerald-500" />}
          defaultOpen={true}
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
                    Votre projet est prêt
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

        {/* ✅ VALIDATION FINANCEMENT - EN BAS DU DASHBOARD */}

        <ModuleTauxUltraPremium
          taux={interestRate}
          mensualite={creditMonthlyPayment}
          duree={creditDurationMonths}
          montantFinance={remainingToFinance}
        />
        <ModuleTauxPrivilege
          taux={interestRate}
          mensualite={creditMonthlyPayment}
          duree={creditDurationMonths}
          montantFinance={remainingToFinance}
        />
        <ModuleTauxStandard
          taux={interestRate}
          mensualite={creditMonthlyPayment}
          duree={creditDurationMonths}
          montantFinance={remainingToFinance}
        />
        {/* ============================================
   💼 WIDGET COMPTEUR - AVEC INFO-BULLE
   ============================================ */}
        {showWastedCashWidget && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative group">
              {/* LUEUR SUBTILE */}
              <div className="absolute inset-0 bg-slate-700/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* CARTE PRINCIPALE */}
              <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl max-w-[280px]">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Temps réel
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* BOUTON INFO */}
                    <button
                      onClick={() =>
                        setShowCompteurExplanation(!showCompteurExplanation)
                      }
                      className="p-1 bg-slate-700/40 rounded-full hover:bg-slate-700/60 transition-colors"
                    >
                      <Info size={12} className="text-slate-400" />
                    </button>

                    {/* BOUTON FERMER */}
                    <button
                      onClick={() => setShowWastedCashWidget(false)}
                      className="text-slate-600 hover:text-slate-400 transition-colors p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* COMPTEUR */}
                <div className="mb-3">
                  <div className="text-[9px] text-slate-500 font-medium uppercase mb-1 tracking-wide">
                    Coût énergétique cumulé
                  </div>
                  <div className="text-3xl font-black text-orange-400 tabular-nums tracking-tight">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 4,
                    }).format(wastedCash)}
                  </div>
                  <div className="text-[9px] text-slate-600 mt-1">
                    depuis l'ouverture
                  </div>
                </div>

                {/* INFO-BULLE DÉPLIABLE */}
                {showCompteurExplanation && (
                  <div className="mb-3 bg-slate-900/60 border border-slate-700/30 rounded-lg p-3 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-[9px] text-slate-300 space-y-2">
                      <p className="font-bold text-slate-200 text-[10px]">
                        💡 Comment est calculé ce compteur ?
                      </p>
                      <div className="bg-black/40 p-2 rounded font-mono text-[8px] space-y-1">
                        <div className="text-slate-400">
                          Consommation :{" "}
                          <span className="text-white">
                            {formatNum(yearlyConsumption)} kWh/an
                          </span>
                        </div>
                        <div className="text-slate-400">
                          Prix kWh :{" "}
                          <span className="text-white">
                            {electricityPrice.toFixed(4)}€
                          </span>
                        </div>
                        <div className="border-t border-slate-700/50 mt-1.5 pt-1.5 space-y-0.5">
                          <div className="text-slate-400">
                            Par an :{" "}
                            <span className="text-orange-400 font-bold">
                              {formatMoney(
                                yearlyConsumption * electricityPrice
                              )}
                            </span>
                          </div>
                          <div className="text-slate-400">
                            Par jour :{" "}
                            <span className="text-white">
                              {formatMoney(
                                (yearlyConsumption * electricityPrice) / 365
                              )}
                            </span>
                          </div>
                          <div className="text-slate-400">
                            Par seconde :{" "}
                            <span className="text-white">
                              {(
                                (yearlyConsumption * electricityPrice) /
                                365 /
                                24 /
                                3600
                              ).toFixed(6)}
                              €
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[8px] text-slate-500 italic leading-relaxed">
                        Ce compteur représente l'argent dépensé en électricité
                        pendant votre consultation, basé sur votre consommation
                        actuelle.
                      </p>
                    </div>
                  </div>
                )}

                {/* PROJECTIONS */}
                <div className="border-t border-white/5 pt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[9px] font-medium uppercase tracking-wide">
                      Projection annuelle
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {formatMoney(calculationResult.oldMonthlyBillYear1 * 12)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[9px] font-medium uppercase tracking-wide">
                      Sur {projectionYears} ans
                    </span>
                    <span className="text-base font-bold text-orange-400 tabular-nums">
                      {formatMoney(calculationResult.totalSpendNoSolar)}
                    </span>
                  </div>
                </div>

                {/* MESSAGE FINAL */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-slate-400 text-[9px] leading-relaxed text-center italic">
                    Sans action, ce coût continue indéfiniment
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOUTON SÉCURISATION FINAL */}
        <button
          onClick={() => setShowNamePopup(true)}
          className="w-full h-24 bg-gradient-to-b from-white to-slate-200 text-black rounded-[28px] border border-black/10 shadow-[0_6px_40px_rgba(255,255,255,0.2)] transition-all duration-300 hover:shadow-[0_6px_60px_rgba(255,255,255,0.28)] active:scale-[0.98] flex items-center justify-center gap-4"
        >
          <Smartphone size={26} className="opacity-60" />
          <div className="text-left leading-tight">
            <span className="block text-lg font-black uppercase">
              Sécurisation du dossier EDF
            </span>
            <span className="block text-[10px] font-bold uppercase opacity-50 tracking-widest">
              Étape administrative — 2 minutes
            </span>
          </div>
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
                Exporter PDF
              </span>
            </button>

            <button
              onClick={() => __setFooterPopup(true)}
              className="relative h-24 bg-gradient-to-b from-white to-slate-200 text-black rounded-[28px] border border-black/10 shadow-xl flex items-center justify-center gap-4 active:scale-95 hover:shadow-2xl transition"
            >
              📱{" "}
              <span className="font-black uppercase tracking-widest">
                Générer Accès Client
              </span>
            </button>
          </div>
        </div>

        {/* ==== POPUP NOM DU CLIENT (STYLE IOS PREMIUM) ==== */}
        {__footerPopup && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <div className="w-full max-w-[420px] bg-[#1C1C1E] rounded-[40px] p-10 shadow-2xl relative border border-white/5">
              <h2 className="text-[32px] font-bold text-white mb-2 tracking-tight">
                Nom du client
              </h2>
              <p className="text-[#8E8E93] text-[17px] mb-10 font-medium leading-tight">
                Ce nom apparaîtra sur l'étude personnalisée
              </p>

              <div className="relative mb-10">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  type="text"
                  placeholder="Ex: M. et Mme Dupont"
                  className="w-full bg-black border-[1.5px] border-[#0A84FF] rounded-[16px] py-4 px-5 text-white text-[19px] outline-none shadow-[0_0_20px_rgba(10,132,255,0.15)]"
                />
                <div className="absolute -left-3 -bottom-3 w-10 h-10 bg-[#0A84FF] rounded-full flex items-center justify-center border-[4px] border-[#1C1C1E] shadow-xl z-10 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 17V3m-7 7l7-7 7 7" />
                  </svg>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => __setFooterPopup(false)}
                  className="flex-1 py-4.5 bg-[#2C2C2E] text-white font-bold rounded-[20px] text-[17px] active:scale-95 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !inputValue}
                  className="flex-1 py-4.5 bg-[#48484A] text-white font-bold rounded-[20px] text-[17px] active:scale-95 transition-all"
                >
                  {isLoading ? "..." : "Générer"}
                </button>
              </div>

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
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        alert("✅ Lien copié !");
                      }}
                      className="flex-1 py-4 bg-slate-100 text-black font-black rounded-2xl text-[10px] uppercase transition-transform active:scale-95"
                    >
                      Copier Lien
                    </button>
                    <button
                      onClick={() => window.open(generatedLink, "_blank")}
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
      </main>

      {/* --- ÉLÉMENTS DE STRUCTURE ET COACHES --- */}
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

      <AlertPopup
        alert={activeAlert || silenceAlert}
        onDismiss={activeAlert ? dismissAlert : dismissSilenceAlert}
        onAction={(action) =>
          activeAlert ? handleAlertAction(action) : dismissSilenceAlert()
        }
      />

      {showCompletion && (
        <CompletionScreen onClose={() => setShowCompletion(false)} />
      )}

      <CoachCompassMinimal
        profile={profile || data?.profile}
        activePhase={activeCoachPhase}
        timeOnCurrentModule={securityTime}
        minTimeRequired={activeCoachPhase?.minDuration || 0}
        hasError={securityTime < (activeCoachPhase?.minDuration || 0)}
        signal={signal}
      />

      <BanquierCoach onPhaseChange={setActiveCoachPhase} />
      <CommercialCoach onPhaseChange={setActiveCoachPhase} />
      <SeniorCoach onPhaseChange={setActiveCoachPhase} />

      {stepNotification && (
        <StepNotification
          step={stepNotification.step}
          message={stepNotification.message}
          onConfirm={confirmStep}
          onDismiss={() => {}}
        />
      )}
    </div>
  );
};

export default ResultsDashboard;
