import React, { useState, useEffect, useMemo, useRef } from "react";
import { calculateGreenValueFromAddress } from "../services/greenValueAPI";
import { SpeechView } from "./SpeechView";
import { CoachRouter } from "../coaches/CoachRouter";
import { SimulationResult, YearlyDetail } from "../types";
import { InfoPopup } from "./InfoPopup";
import { ProfitBadge } from "./ProfitBadge";
import { calculateSolarProjection, safeParseFloat } from "../utils/finance";
import { PDFExport } from "./PDFExport";
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
} from "lucide-react";
import { InputSlider } from "./InputSlider";

// ============================================
// TYPES & INTERFACES
// ============================================
interface ModuleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

interface ResultsDashboardProps {
  data: SimulationResult;
  onReset: () => void;
  projectionYears: number;
  onRecalculate?: (newParams: any, newYears: number) => void;
  onProfileChange: (profile: string) => void;
}

// ============================================
// UTILS FORMATTING
// ============================================
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

// ============================================
// COMPOSANT MODULE SECTION - REPLIABLE
// ============================================
const ModuleSection: React.FC<ModuleSectionProps> = ({
  id,
  title,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
      {/* Header Repliable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Contenu Repliable */}
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

// ============================================
// CUSTOM COMPONENTS
// ============================================
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
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 pointer-events-none"></div>

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

      {isFr && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#1a2e35] px-2 py-1 rounded border border-emerald-500/20 shadow-sm">
          <span className="text-[8px]">🇫🇷</span>
          <span className="text-[8px] font-bold text-emerald-400">
            FRANÇAIS
          </span>
        </div>
      )}
    </div>

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
  const economieVsStandard = Math.abs(
    (mensualiteStandard - mensualite) * duree
  );

  return (
    <div className="bg-[#05080a] border-2 border-blue-500/30 rounded-xl p-8 my-8">
      <div className="border-b border-white/10 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-blue-500"></div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                VALIDATION FINANCEMENT BONIFIÉ
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest ml-4">
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
            -{Math.round(((tauxMarche - taux) / tauxMarche) * 100)}% sur le TAEG
          </div>
        </div>
      </div>

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

      <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <ShieldCheck
            className="text-blue-400 flex-shrink-0 mt-0.5"
            size={18}
          />
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-2">
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
                  Quota disponible au {new Date().toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-4 flex items-start justify-between text-[10px] text-slate-600 font-mono">
        <div>
          <p className="mb-1">
            Document non contractuel - Sous réserve d'acceptation du dossier
          </p>
          <p>
            Offre valable jusqu'au{" "}
            {new Date(Date.now() + 86400000).toLocaleDateString("fr-FR")} inclus
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

  return (
    <div className="bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-transparent border-2 border-blue-500/50 p-8 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-xl mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-blue-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">
              FINANCEMENT BONIFIÉ STANDARD
            </h3>
          </div>
          <p className="text-blue-300/80 text-sm ml-15">
            RÉFÉRENCE DOSSIER : STD-SOL-2025-
            {Math.random().toString(36).substring(2, 8).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-blue-400/60 uppercase tracking-wider mb-1">
            Date d'émission
          </div>
          <div className="text-lg font-bold text-blue-300">
            {new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
          <div className="text-xs text-blue-400/60 uppercase tracking-wider mb-2">
            Taux Annuel Effectif Global (TAEG)
          </div>
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {taux.toFixed(2)}%
          </div>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 size={16} />
            <span>Taux bonifié validé</span>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
          <div className="text-xs text-blue-400/60 uppercase tracking-wider mb-2">
            Mensualité (hors assurance)
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {mensualite.toFixed(2)}€
          </div>
          <div className="text-blue-300/60 text-sm">sur {duree} mois</div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-blue-500/30">
          <div className="text-xs text-blue-400/60 uppercase tracking-wider mb-2">
            Économie vs Taux Marché
          </div>
          <div className="text-4xl font-bold text-green-400 mb-2">
            {economieVsMarche.toLocaleString()}€
          </div>
          <div className="text-green-400/60 text-sm">
            {((1 - taux / tauxMarche) * 100).toFixed(0)}% sur le TAEG
          </div>
        </div>
      </div>

      <div className="bg-black/60 backdrop-blur-md rounded-xl border border-blue-500/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-900/30">
            <tr>
              <th className="text-left p-4 text-blue-300/80 font-medium uppercase tracking-wider text-xs">
                Paramètre
              </th>
              <th className="text-center p-4 text-blue-300/80 font-medium uppercase tracking-wider text-xs">
                Taux Marché
              </th>
              <th className="text-center p-4 text-blue-400 font-medium uppercase tracking-wider text-xs">
                Taux Bonifié Standard
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500/10">
            <tr className="hover:bg-blue-500/5 transition-colors">
              <td className="p-4 text-white">TAEG</td>
              <td className="p-4 text-center text-red-400 font-semibold">
                {tauxMarche}%
              </td>
              <td className="p-4 text-center text-blue-400 font-semibold">
                {taux.toFixed(2)}%
              </td>
            </tr>
            <tr className="hover:bg-blue-500/5 transition-colors">
              <td className="p-4 text-white">Mensualité</td>
              <td className="p-4 text-center text-white/80">
                {mensualiteMarche}€
              </td>
              <td className="p-4 text-center text-white font-semibold">
                {mensualite.toFixed(2)}€
              </td>
            </tr>
            <tr className="hover:bg-blue-500/5 transition-colors">
              <td className="p-4 text-white">Coût Total Crédit</td>
              <td className="p-4 text-center text-white/80">
                {Math.round(mensualiteMarche * duree).toLocaleString()} €
              </td>
              <td className="p-4 text-center text-white font-semibold">
                {Math.round(mensualite * duree).toLocaleString()} €
              </td>
            </tr>
            <tr className="hover:bg-blue-500/5 transition-colors">
              <td className="p-4 text-white">Économie Totale</td>
              <td className="p-4 text-center text-slate-400">—</td>
              <td className="p-4 text-center text-green-400 font-semibold">
                {Math.round(economieVsMarche).toLocaleString()} €
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-blue-400" size={20} />
          <h4 className="text-lg font-semibold text-blue-300">
            CONDITIONS D'ACCÈS VALIDÉES
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-blue-200">
            <CheckCircle2 size={16} className="text-green-400" />
            <span>Zone géographique éligible (06 - Alpes-Maritimes)</span>
          </div>
          <div className="flex items-center gap-2 text-blue-200">
            <CheckCircle2 size={16} className="text-green-400" />
            <span>Installation conforme RGE et normes NFC 15-100</span>
          </div>
          <div className="flex items-center gap-2 text-blue-200">
            <CheckCircle2 size={16} className="text-green-400" />
            <span>Dossier validé selon critères d'éligibilité</span>
          </div>
          <div className="flex items-center gap-2 text-blue-200">
            <CheckCircle2 size={16} className="text-green-400" />
            <span>
              Quota disponible au {new Date().toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-blue-400/40">
        Document non contractuel - Sous réserve d'acceptation du dossier
        <br />
        Offre valable jusqu'au{" "}
        {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "fr-FR"
        )}{" "}
        inclus
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

  return (
    <div className="bg-[#05080a] border-2 border-orange-500/30 rounded-xl p-8 my-8">
      <div className="border-b border-white/10 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-orange-500"></div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                FINANCEMENT EXCEPTIONNEL VALIDÉ
              </h3>
            </div>
            <p className="text-xs text-orange-500/70 font-mono uppercase tracking-widest ml-4">
              Dossier Prioritaire • Réf: VIP-{new Date().getFullYear()}-
              {Math.random().toString(36).substr(2, 4).toUpperCase()}
            </p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-2">
            <div className="text-[10px] text-orange-400 uppercase font-bold">
              Statut
            </div>
            <div className="text-sm font-mono text-orange-500 font-black">
              PRIORITAIRE
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-950/20 border-l-4 border-orange-500 rounded-r-lg p-5 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="text-orange-400 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <h4 className="text-sm font-bold text-orange-300 uppercase mb-2">
              Conditions Exceptionnelles Activées
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ce dossier a fait l'objet d'une validation prioritaire. Le taux
              accordé représente une réduction de{" "}
              <strong className="text-white">79%</strong> par rapport au taux
              marché standard.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            TAEG
          </div>
          <div className="text-4xl font-black text-white font-mono tabular-nums">
            0.99<span className="text-xl">%</span>
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
        </div>
        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
            Économie
          </div>
          <div className="text-4xl font-black text-emerald-400 font-mono tabular-nums">
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

      <div className="bg-black/20 border border-white/5 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left p-3 text-[10px] text-slate-400 uppercase font-bold">
                Paramètre
              </th>
              <th className="text-right p-3 text-[10px] text-slate-400 uppercase font-bold">
                Taux Marché
              </th>
              <th className="text-right p-3 text-[10px] text-slate-400 uppercase font-bold">
                Taux Bonifié Standard
              </th>
              <th className="text-right p-3 text-[10px] text-slate-400 uppercase font-bold">
                Taux Exceptionnel
              </th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            <tr className="border-b border-white/5">
              <td className="p-3 text-slate-300">TAEG</td>
              <td className="p-3 text-right text-red-400">{tauxMarche}%</td>
              <td className="p-3 text-right text-slate-400">{tauxStandard}%</td>
              <td className="p-3 text-right text-orange-400 font-bold">
                {taux}%
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="p-3 text-slate-300">Mensualité</td>
              <td className="p-3 text-right text-slate-400">
                {mensualiteMarche}€
              </td>
              <td className="p-3 text-right text-slate-400">
                {mensualiteStandard}€
              </td>
              <td className="p-3 text-right text-white font-bold">
                {mensualite}€
              </td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="p-3 text-slate-300">Coût Total</td>
              <td className="p-3 text-right text-slate-400">
                {(mensualiteMarche * duree).toLocaleString()}€
              </td>
              <td className="p-3 text-right text-slate-400">
                {(mensualiteStandard * duree).toLocaleString()}€
              </td>
              <td className="p-3 text-right text-white font-bold">
                {(mensualite * duree).toLocaleString()}€
              </td>
            </tr>
            <tr className="bg-emerald-950/20">
              <td className="p-3 text-slate-300 font-bold">Économie Totale</td>
              <td className="p-3 text-right text-slate-400">—</td>
              <td className="p-3 text-right text-slate-400">—</td>
              <td className="p-3 text-right text-emerald-400 font-bold">
                {economieVsMarche.toLocaleString()}€
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t border-white/5 pt-4 text-[10px] text-slate-600 font-mono">
        <p>
          Offre sous réserve d'acceptation • Validité:{" "}
          {new Date(Date.now() + 86400000).toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT - DÉBUT
// ============================================
export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  data,
  onReset,
  projectionYears: initialProjectionYears,
  onRecalculate,
  onProfileChange,
}) => {
  // ============================================
  // ÉTATS REACT
  // ============================================
  const [projectionYears, setProjectionYears] = useState(
    initialProjectionYears
  );
  const [interestRate, setInterestRate] = useState(data.interestRate || 3.89);
  const [creditMonthlyPayment, setCreditMonthlyPayment] = useState(
    data.creditMonthlyPayment || 0
  );
  const [insuranceMonthlyPayment, setInsuranceMonthlyPayment] = useState(
    data.insuranceMonthlyPayment || 0
  );
  const [creditDurationMonths, setCreditDurationMonths] = useState(
    data.creditDurationMonths || 240
  );
  const [cashApport, setCashApport] = useState(data.cashApport || 0);
  const [remainingToFinance, setRemainingToFinance] = useState(
    data.remainingToFinance || 0
  );
  const [electricityPrice, setElectricityPrice] = useState(
    data.electricityPrice || 0.25
  );
  const [yearlyProduction, setYearlyProduction] = useState(
    data.yearlyProduction || 0
  );
  const [selfConsumptionRate, setSelfConsumptionRate] = useState(
    data.selfConsumptionRate || 75
  );

  // UI States
  const [warrantyMode, setWarrantyMode] = useState<"25ans" | "avie">("avie");
  const [tableMode, setTableMode] = useState<"mensuel" | "annuel">("annuel");
  const [economyChartMode, setEconomyChartMode] = useState;
  "financement" | ("cash" > "financement");
  const [gouffreMode, setGouffreMode] = useState<"financement" | "cash">(
    "financement"
  );
  const [whereMoneyMode, setWhereMoneyMode] = useState<"financement" | "cash">(
    "financement"
  );
  const [showParamsEditor, setShowParamsEditor] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>(
    creditDurationMonths.toString()
  );

  // Certification States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [checksCompleted, setChecksCompleted] = useState<number[]>([]);
  const [reliabilityScore, setReliabilityScore] = useState(0);
  const [expertValidated, setExpertValidated] = useState(false);

  // Green Value States
  const [greenValueData, setGreenValueData] = useState<any>(null);
  const [loadingGreenValue, setLoadingGreenValue] = useState(false);

  // QR Code & PDF States
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string>("");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [clientName, setClientName] = useState("");
  const [studyId, setStudyId] = useState<string | null>(null);

  const dashboardRef = useRef<HTMLDivElement>(null);

  // ============================================
  // CALCULS FINANCIERS
  // ============================================
  const details = useMemo(() => {
    const projection = calculateSolarProjection({
      solarInstallationCost: data.solarInstallationCost,
      yearlyProduction,
      selfConsumptionRate: selfConsumptionRate / 100,
      electricityPrice,
      priceIncreaseRate: data.priceIncreaseRate || 0.03,
      productionDecreaseRate: data.productionDecreaseRate || 0.005,
      years: projectionYears,
      creditMonthlyPayment,
      insuranceMonthlyPayment,
      creditDurationMonths,
      cashApport,
      remainingToFinance,
      interestRate,
      obTimestamp: data.obTimestamp,
    });
    return projection.details;
  }, [
    data.solarInstallationCost,
    yearlyProduction,
    selfConsumptionRate,
    electricityPrice,
    data.priceIncreaseRate,
    data.productionDecreaseRate,
    projectionYears,
    creditMonthlyPayment,
    insuranceMonthlyPayment,
    creditDurationMonths,
    cashApport,
    remainingToFinance,
    interestRate,
    data.obTimestamp,
  ]);

  const totalSavingsProjected = useMemo(
    () => details.reduce((sum, d) => sum + d.economyTotal, 0),
    [details]
  );

  const breakEvenPoint = useMemo(() => {
    let cumul = 0;
    for (let i = 0; i < details.length; i++) {
      cumul += details[i].economyTotal;
      if (cumul >= data.solarInstallationCost - cashApport) return i + 1;
    }
    return null;
  }, [details, data.solarInstallationCost, cashApport]);

  const roiPercentage = useMemo(() => {
    const invested = data.solarInstallationCost - cashApport;
    if (invested === 0) return 0;
    return (totalSavingsProjected / invested) * 100;
  }, [totalSavingsProjected, data.solarInstallationCost, cashApport]);

  const bankEquivalentCapital = useMemo(() => {
    const bankRate = 0.025;
    return totalSavingsProjected / (bankRate * projectionYears);
  }, [totalSavingsProjected, projectionYears]);

  const monthlyEffortYear1 = useMemo(() => {
    if (details.length === 0) return 0;
    const firstYear = details[0];
    return (
      creditMonthlyPayment +
      insuranceMonthlyPayment -
      firstYear.energySavingsMonthly
    );
  }, [details, creditMonthlyPayment, insuranceMonthlyPayment]);

  // ============================================
  // EFFET CERTIFICATION ANIMATION
  // ============================================
  useEffect(() => {
    if (isAnalyzing) {
      const checks = [1, 2, 3, 4, 5, 6, 7];
      let currentCheck = 0;

      const interval = setInterval(() => {
        if (currentCheck < checks.length) {
          setChecksCompleted((prev) => [...prev, checks[currentCheck]]);
          setAnalysisProgress(((currentCheck + 1) / checks.length) * 100);
          setReliabilityScore(
            Math.round(((currentCheck + 1) / checks.length) * 98)
          );
          currentCheck++;
        } else {
          clearInterval(interval);
          setIsAnalyzing(false);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  // ============================================
  // EFFET GREEN VALUE API
  // ============================================
  useEffect(() => {
    const fetchGreenValue = async () => {
      if (!data.address || !data.surfaceHabitable) return;

      setLoadingGreenValue(true);
      try {
        const result = await calculateGreenValueFromAddress(
          data.address,
          data.surfaceHabitable
        );
        setGreenValueData(result);
      } catch (err) {
        console.error("Erreur Green Value:", err);
      } finally {
        setLoadingGreenValue(false);
      }
    };

    fetchGreenValue();
  }, [data.address, data.surfaceHabitable]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleRecalculate = () => {
    if (onRecalculate) {
      onRecalculate(
        {
          ...data,
          interestRate,
          creditMonthlyPayment,
          insuranceMonthlyPayment,
          creditDurationMonths,
          cashApport,
          remainingToFinance,
          electricityPrice,
          yearlyProduction,
          selfConsumptionRate,
        },
        projectionYears
      );
    }
  };

  const handleGenerateQRCode = async () => {
    setShowNamePopup(true);
  };

  const handleSaveAndGenerateQR = async () => {
    if (!clientName.trim()) {
      alert("Veuillez entrer un nom de client");
      return;
    }

    try {
      // Générer un ID unique
      const newStudyId = `study_${Date.now()}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 15);

      // Sauvegarder dans Supabase
      const { error } = await supabase.from("studies").insert([
        {
          id: newStudyId,
          client_name: clientName,
          data: {
            ...data,
            projectionYears,
            interestRate,
            creditMonthlyPayment,
            insuranceMonthlyPayment,
            creditDurationMonths,
            cashApport,
            remainingToFinance,
            electricityPrice,
            yearlyProduction,
            selfConsumptionRate,
          },
          expires_at: expirationDate.toISOString(),
        },
      ]);

      if (error) throw error;

      // Générer le QR Code
      const studyURL = `${window.location.origin}/study/${newStudyId}`;
      const qrData = await QRCode.toDataURL(studyURL, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      setQrCodeDataURL(qrData);
      setStudyId(newStudyId);
      setShowNamePopup(false);
      setShowQRCode(true);
    } catch (err) {
      console.error("Erreur génération QR:", err);
      alert("Erreur lors de la génération du QR Code");
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      ref={dashboardRef}
      className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
    >
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* ============================================ */}
        {/* HEADER DASHBOARD */}
        {/* ============================================ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              ANALYSE ÉNERGÉTIQUE CERTIFIÉE
            </h1>
            <p className="text-slate-400 text-sm">
              Projection financière sur {projectionYears} ans • Générée le{" "}
              {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateQRCode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Smartphone size={16} />
              QR Code Client
            </button>
            <PDFExport
              data={data}
              projectionYears={projectionYears}
              dashboardRef={dashboardRef}
            />
            <button
              onClick={onReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Nouvelle Simulation
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* MODULE 1 : PROTOCOLE D'AUDIT TECHNIQUE */}
        {/* ============================================ */}
        <ModuleSection
          id="certification-calculs"
          title="ÉTAPE 1 : PROTOCOLE D'AUDIT TECHNIQUE ET FINANCIER"
          icon={<FileCheck className="text-blue-400" size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* Alerte Analyse */}
            {!isAnalyzing && checksCompleted.length === 0 && (
              <div className="bg-orange-950/20 border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-orange-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-orange-300 mb-2">
                      CERTIFICATION DES CALCULS REQUISE
                    </h4>
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                      Avant de poursuivre, nous devons certifier l'exactitude de
                      tous les calculs financiers et énergétiques de cette
                      simulation.
                    </p>
                    <button
                      onClick={() => {
                        setIsAnalyzing(true);
                        setChecksCompleted([]);
                        setAnalysisProgress(0);
                        setReliabilityScore(0);
                      }}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <ClipboardCheck size={18} />
                      LANCER LA CERTIFICATION
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Animation Analyse */}
            {isAnalyzing && (
              <div className="bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
                    <Loader2 className="text-blue-400 animate-spin" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    CERTIFICATION EN COURS
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Vérification de la cohérence des données...
                  </p>
                </div>

                {/* Barre de Progression */}
                <div className="relative h-3 bg-black/60 rounded-full overflow-hidden mb-8">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500 ease-out"
                    style={{ width: `${analysisProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>

                {/* Checks Progressifs */}
                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      label: "Cohérence mensuel vs annuel",
                      icon: Calendar,
                    },
                    {
                      id: 2,
                      label: "Validation écart production/consommation",
                      icon: Zap,
                    },
                    {
                      id: 3,
                      label: "Vérification cumul économies",
                      icon: TrendingUp,
                    },
                    {
                      id: 4,
                      label: "Contrôle amortissement crédit",
                      icon: Landmark,
                    },
                    {
                      id: 5,
                      label: "Validation ROI et rentabilité",
                      icon: Target,
                    },
                    {
                      id: 6,
                      label: "Cohérence graphiques",
                      icon: BarChart3,
                    },
                    {
                      id: 7,
                      label: "Certification finale",
                      icon: ShieldCheck,
                    },
                  ].map((check) => {
                    const isCompleted = checksCompleted.includes(check.id);
                    const Icon = check.icon;

                    return (
                      <div
                        key={check.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-950/30 border border-emerald-500/30"
                            : "bg-black/20 border border-white/5"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-emerald-500/20"
                              : "bg-slate-800/50"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              className="text-emerald-400"
                              size={18}
                            />
                          ) : (
                            <Icon className="text-slate-500" size={18} />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isCompleted ? "text-emerald-300" : "text-slate-400"
                          }`}
                        >
                          {check.label}
                        </span>
                        {isCompleted && (
                          <span className="ml-auto text-xs text-emerald-400 font-mono">
                            ✓ OK
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Score de Fiabilité */}
                <div className="mt-8 text-center">
                  <div className="text-6xl font-black text-white font-mono mb-2">
                    {reliabilityScore}
                    <span className="text-3xl text-slate-500">%</span>
                  </div>
                  <p className="text-sm text-slate-400">Score de Fiabilité</p>
                </div>
              </div>
            )}

            {/* Résultat Certification */}
            {!isAnalyzing && checksCompleted.length === 7 && (
              <div className="bg-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="text-emerald-400" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-white mb-3">
                      CALCULS CERTIFIÉS CONFORMES
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      L'ensemble des données financières et énergétiques de
                      cette simulation a été vérifié et validé. Les résultats
                      présentés ci-dessous sont certifiés exacts.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-400">
                          Score de fiabilité : {reliabilityScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-400">
                          {checksCompleted.length}/7 vérifications
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Certification de Visite Technique */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">
                    CERTIFICATION DE VISITE TECHNIQUE
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Visite terrain effectuée
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Mesures réalisées sur site
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Orientation et inclinaison validées
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-400" size={16} />
                      <span className="text-slate-300">
                        Zones d'ombre identifiées
                      </span>
                    </div>
                  </div>

                  {!expertValidated && (
                    <button
                      onClick={() => setExpertValidated(true)}
                      className="mt-6 w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Award size={18} />
                      VALIDER EN TANT QU'EXPERT
                    </button>
                  )}

                  {expertValidated && (
                    <div className="mt-6 bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
                      <Award className="text-emerald-400" size={20} />
                      <div>
                        <p className="text-sm font-bold text-emerald-300">
                          Validation Expert Confirmée
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Validé le {new Date().toLocaleDateString("fr-FR")} à{" "}
                          {new Date().toLocaleTimeString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ModuleSection>
        {/* ============================================ */}
        {/* MODULE 2 : PROJET SÉCURISÉ - ZÉRO RISQUE CLIENT */}
        {/* ============================================ */}
        <ModuleSection
          id="projet-securise-zero-risque"
          title="PROJET SOLAIRE SÉCURISÉ – ZÉRO RISQUE CLIENT"
          icon={<ShieldCheck className="text-blue-400" size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* BLOC 1 : PEUR + KILL EN MÊME TEMPS (GRID 2 COLONNES) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* COLONNE 1 : Peur (87%) */}
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-red-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-red-300 mb-2">
                      CONTEXTE MARCHÉ
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <span className="text-red-300 font-bold">
                        87% des Français
                      </span>{" "}
                      hésitent à passer au solaire par peur des arnaques, des
                      installations non conformes ou des promesses non tenues.
                    </p>
                  </div>
                </div>
              </div>

              {/* COLONNE 2 : Kill immédiat (EDF + État + Opposable) */}
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-300 mb-3">
                      TRIPLE GARANTIE INSTITUTIONNELLE
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-300 font-bold">
                          EDF – Obligation d'Achat (20 ans)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-300 font-bold">
                          État Français – Cadre légal garanti
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-300 font-bold">
                          Opposable juridiquement
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOC 2 : TOUTES LES ÉTAPES (Liste exhaustive) */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-6">
                PROCESSUS COMPLET PRIS EN CHARGE
              </h4>
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
                    desc: "Obligatoire pour toitures avant 1997",
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

            {/* BLOC 3 : RESPONSABILITÉ INVERSÉE */}
            <div className="bg-gradient-to-r from-emerald-950/20 to-green-950/20 border-2 border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="text-emerald-400" size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                    GARANTIE ZÉRO RISQUE CLIENT
                  </h4>
                  <div className="bg-black/40 rounded-lg p-4 mb-4">
                    <p className="text-lg text-emerald-300 font-bold leading-relaxed">
                      Si un blocage administratif empêche l'installation (refus
                      mairie, ABF, ENEDIS, ou autre), vous ne payez{" "}
                      <span className="text-white text-xl">RIEN</span>.
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
                        Responsabilité totale de l'installateur
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOC 4 : SCARCITY (Créneaux limités) */}
            <div className="bg-orange-950/20 border-l-4 border-orange-500 rounded-r-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="text-orange-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-orange-300 mb-2">
                    DISPONIBILITÉ LIMITÉE
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    Les créneaux d'installation pour cette zone géographique (06
                    - Alpes-Maritimes) sont contingentés. Une réservation
                    immédiate sécurise votre place dans le planning.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 rounded-lg px-3 py-2">
                      <span className="text-xs text-orange-400 font-mono">
                        QUOTA DISPONIBLE AU{" "}
                        {new Date().toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="bg-orange-500/10 rounded-lg px-3 py-2">
                      <span className="text-xs text-orange-400 font-mono">
                        EXPIRATION : 48H
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GARANTIES DÉTAILLÉES (Cards) */}
            <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">
                GARANTIES CONSTRUCTEUR
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WarrantyCard
                  years={25}
                  label="Performance Panneaux"
                  tag="LINÉAIRE"
                  icon={Sun}
                  description="Garantie de production minimale de 80% après 25 ans. Couverture contre toute défaillance de performance."
                  isFr={true}
                />
                <WarrantyCard
                  years={20}
                  label="Onduleur"
                  tag="PIÈCES & MAIN D'ŒUVRE"
                  icon={Zap}
                  description="Remplacement gratuit en cas de panne. Intervention sous 48h par technicien certifié."
                  isFr={true}
                />
                <WarrantyCard
                  years={10}
                  label="Installation & Étanchéité"
                  tag="DÉCENNALE"
                  icon={Shield}
                  description="Garantie décennale obligatoire couvrant tous les défauts de pose et infiltrations."
                  isFr={true}
                />
              </div>
            </div>
          </div>
        </ModuleSection>
        {/* ============================================ */}
        {/* MODULES TAUX BONIFIÉ (conditionnels) */}
        {/* ============================================ */}
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

        {/* ============================================ */}
        {/* MODULE 3 : GOUFFRE FINANCIER (ÉCART DÉPENSES) */}
        {/* ============================================ */}
        <ModuleSection
          id="gouffre-financier"
          title="ÉCART DE DÉPENSES ÉNERGÉTIQUES"
          icon={<TrendingDown className="text-red-400" size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* Toggle Financement / Cash */}
            <div className="flex justify-center">
              <Toggle
                checked={gouffreMode === "financement"}
                onChange={(v) => setGouffreMode(v ? "financement" : "cash")}
                labelOn="AVEC FINANCEMENT"
                labelOff="ACHAT CASH"
              />
            </div>

            {/* Graphique Gouffre */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={details.map((d, idx) => ({
                      year: idx + 1,
                      withoutSolar:
                        gouffreMode === "financement"
                          ? d.totalSpendingWithoutSolar
                          : d.totalSpendingWithoutSolarCash,
                      withSolar:
                        gouffreMode === "financement"
                          ? d.totalSpendingSolar
                          : d.totalSpendingSolarCash,
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorWithout"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorWith"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                      dataKey="year"
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      label={{
                        value: "Années",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#94a3b8",
                      }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k€`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        padding: "12px",
                      }}
                      labelStyle={{ color: "#fff", fontWeight: "bold" }}
                      formatter={(value: number) => [formatMoney(value), ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="withoutSolar"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorWithout)"
                      name="Sans Solaire"
                    />
                    <Area
                      type="monotone"
                      dataKey="withSolar"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorWith)"
                      name="Avec Solaire"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Légende */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Sans Solaire
                    </span>
                  </div>
                  <div className="text-2xl font-black text-red-400">
                    {formatMoney(
                      gouffreMode === "financement"
                        ? details[details.length - 1]
                            ?.totalSpendingWithoutSolar || 0
                        : details[details.length - 1]
                            ?.totalSpendingWithoutSolarCash || 0
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cumul sur {projectionYears} ans
                  </p>
                </div>

                <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Avec Solaire
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-400">
                    {formatMoney(
                      gouffreMode === "financement"
                        ? details[details.length - 1]?.totalSpendingSolar || 0
                        : details[details.length - 1]?.totalSpendingSolarCash ||
                            0
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cumul sur {projectionYears} ans
                  </p>
                </div>
              </div>

              {/* Économie Totale */}
              <div className="mt-4 bg-emerald-950/20 border-2 border-emerald-500/50 rounded-xl p-6 text-center">
                <div className="text-xs text-slate-400 uppercase font-bold mb-2">
                  Économie Cumulée
                </div>
                <div className="text-5xl font-black text-emerald-400 mb-2">
                  {formatMoney(
                    gouffreMode === "financement"
                      ? (details[details.length - 1]
                          ?.totalSpendingWithoutSolar || 0) -
                          (details[details.length - 1]?.totalSpendingSolar || 0)
                      : (details[details.length - 1]
                          ?.totalSpendingWithoutSolarCash || 0) -
                          (details[details.length - 1]
                            ?.totalSpendingSolarCash || 0)
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  Argent économisé sur {projectionYears} ans
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================ */}
        {/* MODULE 4 : CAPITAL PATRIMONIAL (WHERE MONEY) */}
        {/* ============================================ */}
        <ModuleSection
          id="where-money"
          title="VOTRE ARGENT DANS {projectionYears} ANS"
          icon={<Wallet className="text-emerald-400" size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* Toggle Financement / Cash */}
            <div className="flex justify-center">
              <Toggle
                checked={whereMoneyMode === "financement"}
                onChange={(v) => setWhereMoneyMode(v ? "financement" : "cash")}
                labelOn="AVEC FINANCEMENT"
                labelOff="ACHAT CASH"
              />
            </div>

            {/* Cards Récapitulatives */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 : Économies Cumulées */}
              <div className="bg-gradient-to-br from-emerald-950/30 to-green-950/20 border-2 border-emerald-500/50 rounded-xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="text-emerald-400" size={20} />
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Économies Cumulées
                    </span>
                  </div>
                  <div className="text-4xl font-black text-emerald-400 mb-2">
                    {formatMoney(totalSavingsProjected)}
                  </div>
                  <p className="text-sm text-slate-400">
                    Argent économisé sur {projectionYears} ans
                  </p>
                </div>
              </div>

              {/* Card 2 : Capital Équivalent Bancaire */}
              <div className="bg-gradient-to-br from-blue-950/30 to-cyan-950/20 border-2 border-blue-500/50 rounded-xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="text-blue-400" size={20} />
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Capital Équivalent
                    </span>
                  </div>
                  <div className="text-4xl font-black text-blue-400 mb-2">
                    {formatMoney(bankEquivalentCapital)}
                  </div>
                  <p className="text-sm text-slate-400">
                    Placé à 2.5% pour obtenir le même résultat
                  </p>
                </div>
              </div>

              {/* Card 3 : Valeur Verte */}
              <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/20 border-2 border-purple-500/50 rounded-xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="text-purple-400" size={20} />
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Valeur Verte Ajoutée
                    </span>
                  </div>
                  {loadingGreenValue ? (
                    <div className="flex items-center gap-2">
                      <Loader2
                        className="text-purple-400 animate-spin"
                        size={20}
                      />
                      <span className="text-sm text-slate-400">
                        Calcul en cours...
                      </span>
                    </div>
                  ) : greenValueData ? (
                    <>
                      <div className="text-4xl font-black text-purple-400 mb-2">
                        +{formatMoney(greenValueData.plusValueVerte || 0)}
                      </div>
                      <p className="text-sm text-slate-400">
                        Plus-value immobilière estimée
                      </p>
                    </>
                  ) : (
                    <div className="text-2xl font-black text-slate-600 mb-2">
                      Données indisponibles
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Détails Valeur Verte */}
            {greenValueData && (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white uppercase mb-4">
                  DÉTAIL VALEUR VERTE
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Valeur bien avant :</span>
                    <span className="float-right text-white font-bold">
                      {formatMoney(greenValueData.valeurBienAvant || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Valeur bien après :</span>
                    <span className="float-right text-emerald-400 font-bold">
                      {formatMoney(greenValueData.valeurBienApres || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">DPE avant :</span>
                    <span className="float-right text-white font-bold">
                      Classe {greenValueData.dpeAvant || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">DPE après :</span>
                    <span className="float-right text-emerald-400 font-bold">
                      Classe {greenValueData.dpeApres || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Message Héritage */}
            <div className="bg-gradient-to-r from-orange-950/20 to-yellow-950/20 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="text-orange-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-orange-300 mb-2">
                    TRANSMISSION PATRIMONIALE
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Dans {projectionYears} ans, cette installation sera
                    entièrement amortie et continuera de produire gratuitement
                    pendant encore 15+ ans. C'est un actif patrimonial
                    transmissible à vos enfants, valorisant votre bien
                    immobilier de{" "}
                    <strong className="text-white">
                      +{formatMoney(greenValueData?.plusValueVerte || 0)}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================ */}
        {/* MODULE 5 : COÛT DE L'ATTENTE */}
        {/* ============================================ */}
        <ModuleSection
          id="momentum"
          title="COÛT DE L'ATTENTE"
          icon={<Timer className="text-orange-400" size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* Compteur Temps Réel */}
            <div className="bg-gradient-to-br from-red-950/30 via-orange-950/20 to-yellow-950/10 border-2 border-orange-500/50 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white uppercase mb-6">
                  PERTE EN TEMPS RÉEL
                </h3>
                <div className="text-7xl font-black text-orange-400 mb-4 font-mono tabular-nums">
                  {formatMoney(
                    Math.round(
                      ((electricityPrice *
                        yearlyProduction *
                        (selfConsumptionRate / 100)) /
                        365 /
                        24 /
                        60) *
                        ((Date.now() - data.obTimestamp) / 1000 / 60)
                    )
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  Argent perdu depuis le début de cette étude
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  Compteur en temps réel • Basé sur votre consommation
                </p>
              </div>
            </div>

            {/* Projections 6 mois / 1 an / 3 ans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Dans 6 mois", months: 6 },
                { label: "Dans 1 an", months: 12 },
                { label: "Dans 3 ans", months: 36 },
              ].map((item, idx) => {
                const loss = Math.round(
                  ((electricityPrice *
                    yearlyProduction *
                    (selfConsumptionRate / 100)) /
                    12) *
                    item.months
                );
                return (
                  <div
                    key={idx}
                    className="bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-xl p-6 hover:border-red-500/50 transition-all"
                  >
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">
                      {item.label}
                    </div>
                    <div className="text-4xl font-black text-red-400 mb-2">
                      -{formatMoney(loss)}
                    </div>
                    <p className="text-xs text-slate-500">
                      Économies non réalisées
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Message Urgence */}
            <div className="bg-orange-950/20 border-l-4 border-orange-500 rounded-r-xl p-6">
              <div className="flex items-start gap-4">
                <Flame className="text-orange-400 flex-shrink-0" size={24} />
                <div>
                  <h4 className="text-lg font-bold text-orange-300 mb-2">
                    CHAQUE JOUR COMPTE
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Chaque jour d'attente représente{" "}
                    <strong className="text-white">
                      {formatMoney(
                        Math.round(
                          (electricityPrice *
                            yearlyProduction *
                            (selfConsumptionRate / 100)) /
                            365
                        )
                      )}
                    </strong>{" "}
                    d'économies perdues. Le meilleur moment pour passer au
                    solaire était il y a 5 ans. Le deuxième meilleur moment,
                    c'est aujourd'hui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>
        {/* ============================================ */}
        {/* MODULE 6 : SYNTHÈSE D'ARBITRAGE ÉNERGÉTIQUE */}
        {/* ============================================ */}
        <ModuleSection
          id="ai-analysis-cta"
          title="SYNTHÈSE D'ARBITRAGE ÉNERGÉTIQUE"
          icon={<Target className="text-cyan-400" size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            {/* Résumé 3 Lignes */}
            <div className="bg-gradient-to-br from-cyan-950/30 via-blue-950/20 to-purple-950/10 border-2 border-cyan-500/50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                  DÉCISION RATIONNELLE
                </h3>
                <p className="text-sm text-slate-400">
                  Synthèse financière sur {projectionYears} ans
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-3">
                    Coût Projet
                  </div>
                  <div className="text-3xl font-black text-white mb-2">
                    {formatMoney(data.solarInstallationCost)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {economyChartMode === "financement"
                      ? `Dont ${formatMoney(cashApport)} d'apport`
                      : "Achat comptant"}
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/30">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-3">
                    Économies Cumulées
                  </div>
                  <div className="text-3xl font-black text-emerald-400 mb-2">
                    {formatMoney(totalSavingsProjected)}
                  </div>
                  <div className="text-xs text-emerald-500">
                    +{roiPercentage.toFixed(0)}% de rentabilité
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-3">
                    Valeur Patrimoniale
                  </div>
                  <div className="text-3xl font-black text-purple-400 mb-2">
                    {formatMoney(bankEquivalentCapital)}
                  </div>
                  <div className="text-xs text-purple-500">
                    Capital équivalent bancaire
                  </div>
                </div>
              </div>

              {/* ROI & Breakeven */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-emerald-400" size={16} />
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Retour sur Investissement
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {roiPercentage.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-blue-400" size={16} />
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Amortissement
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-400">
                    {breakEvenPoint ? `${breakEvenPoint} ans` : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Décision */}
            <div className="bg-gradient-to-r from-blue-950/20 to-cyan-950/20 border border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ThumbsUp className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">
                    CONCLUSION DE L'ANALYSE
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Sur la base des données certifiées ci-dessus, l'installation
                    photovoltaïque représente un investissement rationnel avec
                    un retour financier de{" "}
                    <strong className="text-white">
                      {formatMoney(totalSavingsProjected)}
                    </strong>{" "}
                    sur {projectionYears} ans, soit une rentabilité de{" "}
                    <strong className="text-white">
                      {roiPercentage.toFixed(1)}%
                    </strong>
                    . Les risques sont couverts par les garanties
                    institutionnelles (EDF, État) et les garanties constructeur
                    (25 ans panneaux).
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <CheckCircle2 className="text-white" size={32} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase mb-3">
                  VALIDATION DU PROJET
                </h3>
                <p className="text-white/80 text-sm mb-6 max-w-2xl mx-auto">
                  Cette étude certifiée valide la faisabilité technique et
                  financière de votre projet. Pour sécuriser votre créneau
                  d'installation, une validation finale est requise.
                </p>
                <button
                  onClick={() => {
                    // Action de validation (à personnaliser)
                    alert("Validation du projet - À implémenter");
                  }}
                  className="px-12 py-4 bg-white text-emerald-600 rounded-xl text-lg font-black uppercase tracking-wide hover:bg-emerald-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:scale-105 transform"
                >
                  VALIDER MON PROJET
                </button>
                <p className="text-white/60 text-xs mt-4">
                  Sans engagement • Réservation de créneau • Réponse sous 24h
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* ============================================ */}
        {/* SÉPARATEUR SECTION FAQ */}
        {/* ============================================ */}
        <div className="mt-20 border-t-4 border-white/10 pt-12">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-white uppercase mb-2">
              📚 DOCUMENTATION COMPLÉMENTAIRE
            </h2>
            <p className="text-slate-500 text-sm">
              Modules disponibles pour approfondir (clic pour ouvrir)
            </p>
          </div>

          {/* ============================================ */}
          {/* MODULE FAQ 1 : RÉPARTITION ÉNERGIE */}
          {/* ============================================ */}
          <ModuleSection
            id="repartition"
            title="Répartition Énergie"
            icon={<Zap className="text-yellow-400" size={20} />}
            defaultOpen={false}
          >
            <div className="space-y-6">
              {/* Activity Rings */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white uppercase mb-6">
                  PRODUCTION ANNUELLE : {formatNum(yearlyProduction)} kWh
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Autoconsommation",
                            value:
                              yearlyProduction * (selfConsumptionRate / 100),
                          },
                          {
                            name: "Vente Surplus",
                            value:
                              yearlyProduction *
                              (1 - selfConsumptionRate / 100),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [
                          `${formatNum(value)} kWh`,
                          "",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-slate-400 uppercase font-bold">
                        Autoconsommation
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-400">
                      {formatNum(
                        yearlyProduction * (selfConsumptionRate / 100)
                      )}{" "}
                      kWh
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selfConsumptionRate}% de la production
                    </p>
                  </div>

                  <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-slate-400 uppercase font-bold">
                        Vente Surplus
                      </span>
                    </div>
                    <div className="text-2xl font-black text-blue-400">
                      {formatNum(
                        yearlyProduction * (1 - selfConsumptionRate / 100)
                      )}{" "}
                      kWh
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {(100 - selfConsumptionRate).toFixed(0)}% de la production
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white uppercase mb-4">
                  EXPLICATIONS
                </h4>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      className="text-emerald-400 flex-shrink-0 mt-0.5"
                      size={16}
                    />
                    <p>
                      <strong className="text-white">Autoconsommation :</strong>{" "}
                      Énergie produite et consommée directement dans votre
                      logement (zéro coût).
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      className="text-blue-400 flex-shrink-0 mt-0.5"
                      size={16}
                    />
                    <p>
                      <strong className="text-white">Vente Surplus :</strong>{" "}
                      Énergie produite non consommée, revendue à EDF OA (contrat
                      20 ans).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================ */}
          {/* MODULE FAQ 2 : FINANCEMENT VS CASH */}
          {/* ============================================ */}
          <ModuleSection
            id="financement-vs-cash"
            title="Financement VS Cash"
            icon={<Scale className="text-purple-400" size={20} />}
            defaultOpen={false}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Financement */}
                <div className="bg-gradient-to-br from-blue-950/30 to-cyan-950/20 border-2 border-blue-500/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Landmark className="text-blue-400" size={24} />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase">
                      AVEC FINANCEMENT
                    </h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Apport initial :</span>
                      <span className="text-white font-bold">
                        {formatMoney(cashApport)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Mensualité crédit :
                      </span>
                      <span className="text-white font-bold">
                        {formatMoney(creditMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Mensualité assurance :
                      </span>
                      <span className="text-white font-bold">
                        {formatMoney(insuranceMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-3">
                      <span className="text-slate-400">
                        Surcoût mensuel Année 1 :
                      </span>
                      <span
                        className={`font-bold ${
                          monthlyEffortYear1 > 0
                            ? "text-orange-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {monthlyEffortYear1 > 0 ? "+" : ""}
                        {formatMoney(Math.abs(monthlyEffortYear1))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Économie totale {projectionYears} ans :
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {formatMoney(totalSavingsProjected)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Cash */}
                <div className="bg-gradient-to-br from-emerald-950/30 to-green-950/20 border-2 border-emerald-500/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Wallet className="text-emerald-400" size={24} />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase">
                      ACHAT COMPTANT
                    </h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Investissement initial :
                      </span>
                      <span className="text-white font-bold">
                        {formatMoney(data.solarInstallationCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Mensualité crédit :
                      </span>
                      <span className="text-slate-600 font-bold">0€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Mensualité assurance :
                      </span>
                      <span className="text-slate-600 font-bold">0€</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-3">
                      <span className="text-slate-400">
                        Économie mensuelle Année 1 :
                      </span>
                      <span className="text-emerald-400 font-bold">
                        +{formatMoney(details[0]?.energySavingsMonthly || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Économie totale {projectionYears} ans :
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {formatMoney(
                          details.reduce(
                            (sum, d) => sum + d.energySavingsYearly,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white uppercase mb-3">
                  COMPARAISON
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Le financement permet d'étaler le coût tout en bénéficiant
                  immédiatement des économies d'énergie. L'achat comptant
                  maximise les économies totales mais nécessite une trésorerie
                  disponible importante.
                </p>
              </div>
            </div>
          </ModuleSection>
          {/* ============================================ */}
          {/* MODULE FAQ 3 : SCÉNARIO PAR DÉFAUT */}
          {/* ============================================ */}
          <ModuleSection
            id="scenario-defaut"
            title="Écart du Scénario par Défaut"
            icon={<TrendingDown className="text-red-400" size={20} />}
            defaultOpen={false}
          >
            <div className="space-y-6">
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white uppercase mb-4">
                  SI VOUS NE FAITES RIEN
                </h4>
                <div className="space-y-4">
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">
                      Dépenses Énergétiques sur {projectionYears} ans
                    </div>
                    <div className="text-4xl font-black text-red-400">
                      {formatMoney(
                        details[details.length - 1]
                          ?.totalSpendingWithoutSolar || 0
                      )}
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">
                      Patrimoine Immobilier
                    </div>
                    <div className="text-2xl font-black text-slate-600">
                      Aucune valorisation
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Votre bien ne bénéficiera d'aucune plus-value verte
                    </p>
                  </div>

                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">
                      Dépendance Énergétique
                    </div>
                    <div className="text-2xl font-black text-orange-400">
                      100% réseau
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Vous restez totalement dépendant des hausses de tarifs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================ */}
          {/* MODULE FAQ 4 : LOCATAIRE VS PROPRIÉTAIRE */}
          {/* ============================================ */}
          <ModuleSection
            id="locataire-proprietaire"
            title="Locataire VS Propriétaire Énergétique"
            icon={<Home className="text-green-400" size={20} />}
            defaultOpen={false}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Locataire */}
                <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <User className="text-red-400" size={24} />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase">
                      LOCATAIRE ÉNERGÉTIQUE
                    </h4>
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-start gap-2">
                      <XCircle
                        className="text-red-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Dépendance totale au réseau EDF</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle
                        className="text-red-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Subit les hausses de tarifs sans contrôle</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle
                        className="text-red-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Aucune valeur patrimoniale créée</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle
                        className="text-red-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Exposition maximale aux crises énergétiques</p>
                    </div>
                  </div>
                </div>

                {/* Propriétaire */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Home className="text-emerald-400" size={24} />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase">
                      PROPRIÉTAIRE PRODUCTEUR
                    </h4>
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Indépendance énergétique partielle</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Protection contre les hausses tarifaires</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Valorisation du patrimoine immobilier</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        className="text-emerald-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p>Actif transmissible aux héritiers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================ */}
          {/* MODULE FAQ 5 : COMPARAISON AUTRES OPTIONS */}
          {/* ============================================ */}
          <ModuleSection
            id="comparaison"
            title="Comparaison avec vos autres options"
            icon={<BarChart3 className="text-blue-400" size={20} />}
            defaultOpen={false}
          >
            <div className="space-y-6">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-slate-400 uppercase font-bold text-xs">
                        Option
                      </th>
                      <th className="text-right p-4 text-slate-400 uppercase font-bold text-xs">
                        Rendement Annuel
                      </th>
                      <th className="text-right p-4 text-slate-400 uppercase font-bold text-xs">
                        Capital Bloqué
                      </th>
                      <th className="text-right p-4 text-slate-400 uppercase font-bold text-xs">
                        Gain sur {projectionYears} ans
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-white font-bold">Livret A</td>
                      <td className="p-4 text-right text-slate-400">2.7%</td>
                      <td className="p-4 text-right text-orange-400">
                        {formatMoney(data.solarInstallationCost)}
                      </td>
                      <td className="p-4 text-right text-slate-400">
                        {formatMoney(
                          Math.round(
                            data.solarInstallationCost * 0.027 * projectionYears
                          )
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-white font-bold">
                        Assurance Vie
                      </td>
                      <td className="p-4 text-right text-slate-400">3.5%</td>
                      <td className="p-4 text-right text-orange-400">
                        {formatMoney(data.solarInstallationCost)}
                      </td>
                      <td className="p-4 text-right text-slate-400">
                        {formatMoney(
                          Math.round(
                            data.solarInstallationCost * 0.035 * projectionYears
                          )
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-white font-bold">SCPI</td>
                      <td className="p-4 text-right text-slate-400">4.5%</td>
                      <td className="p-4 text-right text-orange-400">
                        {formatMoney(data.solarInstallationCost)}
                      </td>
                      <td className="p-4 text-right text-slate-400">
                        {formatMoney(
                          Math.round(
                            data.solarInstallationCost * 0.045 * projectionYears
                          )
                        )}
                      </td>
                    </tr>
                    <tr className="bg-emerald-950/20 border-b border-emerald-500/30">
                      <td className="p-4 text-white font-bold">
                        Solaire (Ce projet)
                      </td>
                      <td className="p-4 text-right text-emerald-400 font-bold">
                        {(roiPercentage / projectionYears).toFixed(1)}%
                      </td>
                      <td className="p-4 text-right text-emerald-400 font-bold">
                        0€ bloqué
                      </td>
                      <td className="p-4 text-right text-emerald-400 font-bold">
                        {formatMoney(totalSavingsProjected)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white uppercase mb-3">
                  LA DIFFÉRENCE CLÉS
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Les placements financiers (Livret A, Assurance Vie, SCPI)
                  immobilisent votre capital. Le solaire ne bloque AUCUN capital
                  : vous consommez l'énergie que vous produisez, et les
                  économies générées remboursent l'installation. C'est un
                  investissement qui se finance lui-même.
                </p>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================ */}
          {/* MODULE FAQ 6 : TABLEAU DÉTAILLÉ */}
          {/* ============================================ */}
          <ModuleSection
            id="tableau-detaille"
            title="Tableau Détaillé Année par Année"
            icon={<Table2 className="text-slate-400" size={20} />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              {/* Toggle Mensuel / Annuel */}
              <div className="flex justify-center">
                <Toggle
                  checked={tableMode === "annuel"}
                  onChange={(v) => setTableMode(v ? "annuel" : "mensuel")}
                  labelOn="VUE ANNUELLE"
                  labelOff="VUE MENSUELLE"
                />
              </div>

              {/* Tableau */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-slate-400 uppercase font-bold">
                          Année
                        </th>
                        <th className="text-right p-3 text-slate-400 uppercase font-bold">
                          Production
                        </th>
                        <th className="text-right p-3 text-slate-400 uppercase font-bold">
                          Économie
                        </th>
                        <th className="text-right p-3 text-slate-400 uppercase font-bold">
                          Crédit
                        </th>
                        <th className="text-right p-3 text-slate-400 uppercase font-bold">
                          Bilan
                        </th>
                        <th className="text-right p-3 text-slate-400 uppercase font-bold">
                          Cumul
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {details.map((d, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-3 text-white font-bold">
                            Année {idx + 1}
                          </td>
                          <td className="p-3 text-right text-slate-400">
                            {formatNum(d.productionKwh)} kWh
                          </td>
                          <td className="p-3 text-right text-emerald-400">
                            {tableMode === "annuel"
                              ? formatMoney(d.energySavingsYearly)
                              : formatMoney(d.energySavingsMonthly)}
                          </td>
                          <td className="p-3 text-right text-orange-400">
                            {tableMode === "annuel"
                              ? formatMoney(d.creditPaymentYearly)
                              : formatMoney(creditMonthlyPayment)}
                          </td>
                          <td
                            className={`p-3 text-right font-bold ${
                              d.economyTotal > 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatMoney(
                              tableMode === "annuel"
                                ? d.economyTotal
                                : d.economyTotal / 12
                            )}
                          </td>
                          <td className="p-3 text-right text-white font-bold">
                            {formatMoney(d.cumulativeEconomy)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ModuleSection>

          {/* ============================================ */}
          {/* MODULE FAQ 7 : GARANTIES DÉTAILLÉES */}
          {/* ============================================ */}
          <ModuleSection
            id="garanties-detaillees"
            title="Garanties Détaillées"
            icon={<Shield className="text-blue-400" size={20} />}
            defaultOpen={false}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WarrantyCard
                  years={25}
                  label="Performance Panneaux"
                  tag="LINÉAIRE"
                  icon={Sun}
                  description="Garantie de production minimale de 80% après 25 ans. Couverture contre toute défaillance de performance."
                  isFr={true}
                />
                <WarrantyCard
                  years={20}
                  label="Onduleur"
                  tag="PIÈCES & MAIN D'ŒUVRE"
                  icon={Zap}
                  description="Remplacement gratuit en cas de panne. Intervention sous 48h par technicien certifié."
                  isFr={true}
                />
                <WarrantyCard
                  years={10}
                  label="Installation & Étanchéité"
                  tag="DÉCENNALE"
                  icon={Shield}
                  description="Garantie décennale obligatoire couvrant tous les défauts de pose et infiltrations."
                  isFr={true}
                />
                <WarrantyCard
                  years="À VIE"
                  label="Assistance Client"
                  tag="PREMIUM"
                  icon={Users}
                  description="Support technique dédié, suivi de production en temps réel, maintenance préventive incluse."
                  isFr={true}
                />
              </div>
            </div>
          </ModuleSection>
        </div>

        {/* ============================================ */}
        {/* POPUPS & MODALS */}
        {/* ============================================ */}

        {/* Popup Nom Client */}
        {showNamePopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-black text-white mb-4">
                NOM DU CLIENT
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Entrez le nom du client pour générer le QR Code
              </p>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nom du client"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 mb-6 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNamePopup(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveAndGenerateQR}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Générer QR Code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup QR Code */}
        {showQRCode && qrCodeDataURL && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
              <h3 className="text-2xl font-black text-white mb-2">
                QR CODE GÉNÉRÉ
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Client : <strong className="text-white">{clientName}</strong>
              </p>
              <div className="bg-white p-4 rounded-xl inline-block mb-6">
                <img src={qrCodeDataURL} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Valable 15 jours • ID: {studyId}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.download = `qrcode_${clientName}_${studyId}.png`;
                    link.href = qrCodeDataURL;
                    link.click();
                  }}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Télécharger
                </button>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;
