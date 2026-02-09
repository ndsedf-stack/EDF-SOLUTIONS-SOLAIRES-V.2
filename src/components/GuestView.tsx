import React, { useState, useEffect } from "react";
import {
  Lock,
  Phone,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  Flame,
  X,
  Shield,
  AlertCircle,
  Loader,
  ShieldCheck,
  Home,
  Landmark,
  FileSearch,
  Wrench,
  Zap,
  FileText,
  Sun,
  Award,
  Coins,
  ClipboardCheck,
  Scale,
  Wallet,
  Bot,
  MapPin,
  BarChart3,
  Info,
  Table2,
  Building2,
  FileCheck,
  Target,
  TrendingDown,
  CheckCircle,
  Calendar,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "react-router-dom";

// ⚙️ CONFIGURATION
const STUDY_CONFIG = {
  expirationDays: 7,
  toleranceMarginMs: 5 * 60 * 1000,
  phoneNumber: "0683623329",
};

// ✅ VRAIE connexion Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// 🔍 LOGS DE DÉBOGAGE - À SUPPRIMER APRÈS
console.log("🔑 URL Supabase:", import.meta.env.VITE_SUPABASE_URL);
console.log("🔑 Clé existe:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("🔌 Client créé:", !!supabase);

// Exposer pour tests console (temporaire)
if (typeof window !== "undefined") {
  (window as any).supabaseClient = supabase;
}

// Composant ModuleSection
const ModuleSection: React.FC<{
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onOpen?: (id: string) => void;
}> = ({ id, title, icon, defaultOpen = false, children, onOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && onOpen) onOpen(id);
  };

  return (
    <div className="mb-6 bg-zinc-900/50 border border-white/10 rounded-[32px] overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <div
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      {isOpen && <div className="p-6 pt-0">{children}</div>}
    </div>
  );
};

export default function GuestView() {
  const [data, setData] = useState<any>(null);
  const [study, setStudy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [wastedCash, setWastedCash] = useState(0.5);
  const [gouffreMode, setGouffreMode] = useState<"financement" | "cash">(
    "financement"
  );
  const [tableScenario, setTableScenario] = useState<"financement" | "cash">(
    "financement"
  );
  const [tableMode, setTableMode] = useState<"annuel" | "mensuel">("mensuel");
  const [showDetails, setShowDetails] = useState(false);
  const { token } = useParams<{ token: string }>();
  const studyId = token; // ✅ ALIAS pour compatibilité avec le reste du code
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    const loadStudy = async () => {
      try {
        if (!token) {
          throw new Error("Lien invalide (Token manquant)");
        }

        // 1️⃣ ESSAI 1 : Recherche par TOKEN
        let { data, error } = await supabase
          .from("studies")
          .select("id, status, study_data, expires_at, created_at")
          .eq("guest_view_token", token)
          .single();

        // 2️⃣ ESSAI 2 : Fallback sur ID (Anciens liens)
        if (!data || error) {
             const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
             if (isUUID) {
                console.log("🔄 Fallback: recherche par ID pour", token);
                const { data: dataById, error: errorById } = await supabase
                    .from("studies")
                    .select("id, status, study_data, expires_at, created_at")
                    .eq("id", token)
                    .single();
                
                if (dataById && !errorById) {
                    data = dataById;
                    error = null;
                }
             }
        }

        if (error) throw error;
        if (!data) throw new Error("Étude introuvable");

        if (error) throw error;
        if (!data) throw new Error("Étude introuvable");
        if (data.status === "signed") {
          setIsSigned(true);
        }

        // 👁️ TRACKING DE LA VUE
        try {
          // 1. Incrémenter opened_count
          await supabase.rpc('increment_opened_count', { study_uuid: data.id });
          
          // 2. Logger l'événement
          await supabase.from("tracking_events").insert({
            study_id: data.id,
            event_type: "view_study",
          });
        } catch (e) {
          console.error("View tracking error:", e);
        }

        setStudy(data);
        setData(data.study_data);
        console.log("🔥 DATA LOADED:", data.study_data);
        console.log("🔥 PROD:", data.study_data?.prod);
        console.log("🔥 CONSO:", data.study_data?.conso);
        console.log("🔥 AUTOCONSO %:", data.study_data?.a);
        console.log("🔥 TOUTES LES PROPRIÉTÉS:", Object.keys(data.study_data));
        setLoading(false);
      } catch (e: any) {
        console.error("Erreur chargement étude:", e);
        setError(e.message || "Erreur inconnue");
        setLoading(false);
      }
    };

    loadStudy();
  }, [studyId]);

  useEffect(() => {
    if (!study?.expires_at) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const expirationTime = new Date(study.expires_at).getTime();
      const difference = expirationTime - now;
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === 0) setIsExpired(true);
    }, 1000);

    return () => clearInterval(timer);
  }, [study?.expires_at]);

  useEffect(() => {
    if (!data?.conso || !data?.elecPrice) return;

    const costPerSecond = (data.conso * data.elecPrice) / 365 / 24 / 3600;

    const interval = setInterval(() => {
      setWastedCash((prev) => prev + costPerSecond);
    }, 100);

    return () => clearInterval(interval);
  }, [data?.conso, data?.elecPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="text-blue-500 animate-spin mx-auto mb-4"
          />
          <p className="text-white text-xl">Chargement de votre étude...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-950/60 border-2 border-red-500/40 rounded-3xl p-8 max-w-md text-center">
          <X size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-4">❌ ERREUR</h2>
          <p className="text-red-200 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Données manquantes
          </h2>
          <p className="text-slate-400">
            L'étude n'a pas pu être chargée correctement.
          </p>
        </div>
      </div>
    );
  }

  if (!data.details || !data.detailsCash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Étude incomplète
          </h2>
          <p className="text-slate-400">
            Cette étude ne contient pas les données nécessaires pour un
            affichage certifié.
          </p>
        </div>
      </div>
    );
  }
  const safeData = {
    n: data.n || "Client",
    e: data.e || 0,
    installCost: data.installCost || data.ic || 0,
    cashApport: data.cashApport || data.ca || 0,
    m: data.m || 0,
    t: data.t || 0,
    d: data.d || 0,
    prod: data.prod || data.p || 0,
    conso: Number(data.conso || data.c || 0),
    selfCons: data.selfCons || data.a || 0,
    installedPower: data.installedPower || data.kWc || 0,
    elecPrice: data.elecPrice || data.pe || 0.25,
    projectionYears: data.projectionYears || data.py || 25,
    ga: data.ga || [],
    mode: data.mode || "financement",
    warrantyMode: data.warrantyMode || "performance",
    breakEven: data.breakEven || null,
    averageYearlyGain: data.averageYearlyGain || null,
    totalSpendNoSolar: data.totalSpendNoSolar || null,
    totalSpendSolar: data.totalSpendSolar || null,
    greenValue: data.greenValue || null,
    details: data.details || [],
    roiPercent: data.roiPercent ?? null,
    detailsCash: data.detailsCash || [],
  };

  const rows =
    tableScenario === "financement" ? safeData.details : safeData.detailsCash;

  const certifiedBreakEvenYear = safeData.breakEven;
  const certifiedFinalGain =
    rows[safeData.projectionYears - 1]?.cumulativeSavings || null;
  const certifiedROI = safeData.roiPercent || null;
  const certifiedAverageGain = safeData.averageYearlyGain || null;
  const certifiedTotalNoSolar = safeData.totalSpendNoSolar || null;
  const certifiedTotalSolar = safeData.totalSpendSolar || null;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(val);

  const formatMoneyPrecise = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat("fr-FR").format(val);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const firstYearRow =
    (tableScenario === "financement"
      ? safeData.details
      : safeData.detailsCash)?.[0] || null;

  const monthlyBill = firstYearRow
    ? firstYearRow.edfBillWithoutSolar / 12
    : null;

  const monthlyCredit = firstYearRow?.creditPayment
    ? firstYearRow.creditPayment / 12
    : 0;

  const monthlyResidue = firstYearRow ? firstYearRow.edfResidue / 12 : null;

  const totalMensuel = firstYearRow
    ? tableScenario === "cash"
      ? firstYearRow.totalWithSolar / 12
      : monthlyCredit + monthlyResidue
    : null;

  const diffMensuel = firstYearRow ? totalMensuel - monthlyBill : null;

  const gouffreChartData = rows?.map((r) => ({
    year: r.year,
    cumulativeSpendNoSolar: r.cumulativeSpendNoSolar,
    cumulativeSpendSolar: r.cumulativeSpendSolar,
  }));

  const handleCall = () => {
    window.location.href = `tel:${STUDY_CONFIG.phoneNumber}`;
  };

  const clientCity = "Cannes";
  const projectionYears = safeData.projectionYears;

  const phone = "+336683623329";
  const isMobile = /iPhone|Android/i.test(navigator.userAgent);

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
        <div className="max-w-xl text-center">
          <div className="text-5xl mb-6">⏳</div>
          <h1 className="text-3xl font-black mb-4">Offre expirée</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Le délai de validité de cette étude est dépassé.
            <br />
            Les conditions tarifaires ne sont plus garanties.
          </p>
          <p className="text-white/40 text-sm mt-6">
            Merci de contacter votre conseiller pour actualiser l'offre.
          </p>
        </div>
      </div>
    );
  }

  if (isSigned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
        <div className="max-w-xl text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-3xl font-black mb-4">Dossier sécurisé</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Ce projet a déjà été validé avec votre conseiller.
            <br />
            Votre dossier est en cours de traitement administratif.
          </p>
          <p className="text-white/40 text-sm mt-6">
            Vous serez contacté prochainement pour la suite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-xl font-black italic text-white/20 uppercase">
            EDF SOLUTIONS SOLAIRES
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Lock size={12} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase text-blue-400">
              Accès Certifié
            </span>
          </div>
        </div>
        {/* TITRE */}
        <h1 className="text-5xl font-black italic uppercase leading-none mb-2">
          VOTRE ÉTUDE SOLAIRE.
        </h1>
        <div className="h-1.5 w-20 bg-blue-600 mb-6" />
        <p className="text-slate-400 text-sm font-medium mb-8 italic uppercase">
          Préparée pour{" "}
          <span className="text-white font-black underline decoration-blue-500">
            {safeData.n}
          </span>
        </p>
        {/* COMPTE À REBOURS */}
        <div className="bg-gradient-to-br from-orange-950/60 to-orange-900/40 border border-orange-500/40 rounded-[32px] p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-orange-400" size={20} />
            <span className="text-orange-300 text-xs font-black uppercase">
              Validité du cadre tarifaire
            </span>
          </div>
          <div className="text-white text-sm font-medium mb-6">
            Conditions actuelles valables jusqu'au :
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { val: days, label: "JOURS" },
              { val: hours, label: "H" },
              { val: minutes, label: "MIN" },
              { val: seconds, label: "SEC" },
            ].map((unit, i) => (
              <div
                key={i}
                className="bg-black/60 border border-orange-500/20 rounded-xl p-3 text-center"
              >
                <div className="text-3xl font-black text-orange-400">
                  {String(unit.val).padStart(2, "0")}
                </div>
                <div className="text-[8px] text-slate-500 uppercase font-bold mt-1">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-orange-200/70 italic text-center">
            Paramètres tarifaires garantis dans ce cadre
          </div>
        </div>
        {/* GAIN NET */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/20 rounded-[40px] p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 block mb-2">
                Gain Net Projeté
              </span>
              <span className="text-xs text-slate-500">
                Sur {data?.projectionYears || 20} ans
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
          </div>
          <div className="text-6xl font-black text-emerald-400 text-center mb-6">
            {safeData.e > 0 ? "+" : ""}
            {Number(safeData.e).toLocaleString("fr-FR")}€
          </div>
        </div>
        {/* 🔵 BLOC 1 — SÉCURITÉ & CADRE */}
        {/* Module 1: Sécurité juridique EDF */}
        <ModuleSection
          id="securite-juridique"
          title="Sécurité EDF — Groupe d'État"
          icon={<Shield className="text-blue-400" />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border-2 border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Vous êtes accompagné par EDF SOLUTIONS SOLAIRES
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Filiale à 100% du groupe EDF, entreprise publique française.
                    Capital social de 36 millions d'euros, garanties
                    institutionnelles, pérennité assurée par l'État français.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/40 border-2 border-emerald-500/30 rounded-lg p-5 hover:border-emerald-400 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <h4 className="font-bold text-white">
                    Garantie décennale obligatoire
                  </h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Assurance sur 10 ans couvrant tout vice ou défaut affectant la
                  solidité de l'installation ou la rendant impropre à sa
                  destination.
                </p>
              </div>

              <div className="bg-black/40 border-2 border-blue-500/30 rounded-lg p-5 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <Lock className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <h4 className="font-bold text-white">
                    Garantie de rendement panneau
                  </h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Minimum 87% de rendement garanti après 30 ans d'exploitation.
                  Remplacement gratuit en cas de non-conformité.
                </p>
              </div>

              <div className="bg-black/40 border-2 border-purple-500/30 rounded-lg p-5 hover:border-purple-400 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <Zap className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                  <h4 className="font-bold text-white">
                    Garantie panneaux, onduleur à vie, piéces, main d'oeuvre et
                    déplacement
                  </h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Remplacement ou réparation gratuite à vie
                </p>
              </div>

              <div className="bg-black/40 border-2 border-orange-500/30 rounded-lg p-5 hover:border-orange-400 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <FileCheck className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                  <h4 className="font-bold text-white">
                    Garantie de rachat État
                  </h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Obligation d'achat par EDF OA pendant 20 ans, tarif fixe
                  garanti par arrêté ministériel.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">Important :</span>{" "}
                Ces garanties sont des obligations légales ou contractuelles
                fermes, pas des engagements commerciaux. Elles sont opposables
                juridiquement.
              </p>
            </div>
          </div>
        </ModuleSection>

        {/* Module 2: Origine de l'électricité */}
        <ModuleSection
          id="repartition"
          title="Origine de l'électricité de votre maison"
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
                Ce module montre concrètement comment se répartit l'électricité
                consommée par votre maison une fois l'installation en service.
              </p>
            </div>

            {/* TAUX DE COUVERTURE */}
            <div className="bg-[#050505] border border-white/10 rounded-3xl p-6 sm:p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                Taux de couverture énergétique
              </p>

              <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                {Math.round(((data?.prod || 0) / (data?.conso || 1)) * 100)} %
              </div>

              <p className="text-slate-300 mt-2 text-sm">
                de votre consommation électrique est produite directement par
                votre maison.
              </p>

              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mt-5">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${Math.round(
                      ((data?.prod || 0) / (data?.conso || 1)) * 100
                    )}%`,
                  }}
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
                  {(data?.conso || 0).toLocaleString("fr-FR")} kWh/an
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
                  {(
                    (data?.conso || 0) * (data?.elecPrice || 0.25)
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}{" "}
                  / an
                </div>
              </div>

              {/* AUTOCONSOMMATION */}
              <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">
                  Production Solaire autoconsommée
                </p>
                <p className="text-3xl font-black text-emerald-400">
                  {(
                    (data?.prod || 0) *
                    ((data?.selfCons || 0) / 100)
                  ).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}{" "}
                  kWh/an
                </p>
                {/* BARRE AUTOCONSOMMATION */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${Math.round(
                          ((data?.prod || 0) / (data?.conso || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    {Math.round(((data?.prod || 0) / (data?.conso || 1)) * 100)}
                    % de votre consommation couverte
                  </p>
                </div>

                <p className="text-slate-500 text-xs mt-1">
                  Ce que vous produisez et consommez directement.
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 text-emerald-400 text-sm font-bold">
                  ≈{" "}
                  {(
                    (data?.prod || 0) *
                    ((data?.selfCons || 0) / 100) *
                    (data?.elecPrice || 0.25)
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}{" "}
                  / an économisés
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
                  {(
                    (data?.prod || 0) *
                    (1 - (data?.selfCons || 0) / 100)
                  ).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}{" "}
                  kWh/an
                </p>
                {/* BARRE SURPLUS */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-700"
                      style={{
                        width: `${100 - (data?.selfCons || 0)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Part de la production automatiquement valorisée par EDF
                  </p>
                </div>

                <p className="text-slate-500 text-xs mt-1">
                  Non consommé, vendu automatiquement. <br />
                  Contrat d'Obligation d'Achat 20 ans — cadre légal. <br />
                  Tarif réglementé : 0.04€/kWh
                </p>

                <div className="mt-3 pt-3 border-t border-white/5 text-blue-400 text-sm font-bold">
                  ≈{" "}
                  {(
                    (data?.prod || 0) *
                    (1 - (data?.selfCons || 0) / 100) *
                    0.04
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}{" "}
                  / an
                </div>
              </div>
            </div>

            {/* BLOC EDF */}
            <div className="bg-blue-950/20 border-l-4 border-blue-500 rounded-xl p-5">
              <p className="text-slate-200 text-sm leading-relaxed">
                <strong className="text-white">Fonctionnement réseau :</strong>
                <br />
                L'électricité produite est consommée automatiquement dans votre
                maison. Le surplus est injecté et racheté par EDF dans le cadre
                du contrat d'Obligation d'Achat (État, 20 ans). Lorsque la
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
                Seule l'origine de votre électricité change.
              </p>
            </div>
          </div>
        </ModuleSection>
        {/* Module 2: Synthèse */}
        <ModuleSection
          id="synthese"
          title="Vue d'ensemble — Votre projet en 10 secondes"
          icon={<FileText className="text-indigo-400" />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-2 border-indigo-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Cohérence globale du projet
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/40 rounded-lg p-4 border border-indigo-500/20">
                  <div className="text-sm text-slate-400 mb-1">
                    Production annuelle
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(safeData.prod)} kWh
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">
                    ✓ Certifiée
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-4 border border-indigo-500/20">
                  <div className="text-sm text-slate-400 mb-1">
                    Couverture besoins
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(
                      ((safeData.prod || 0) / (safeData.conso || 1)) * 100
                    )}
                    %
                  </div>
                  <div className="text-xs text-blue-400 mt-1">
                    de votre consommation
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-4 border border-indigo-500/20">
                  <div className="text-sm text-slate-400 mb-1">
                    Retour investissement
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {certifiedBreakEvenYear} ans
                  </div>
                  <div className="text-xs text-purple-400 mt-1">
                    puis gain net
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border-l-4 border-emerald-500">
                <p className="text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Verdict :</span>{" "}
                  Installation dimensionnée pour couvrir{" "}
                  {Math.round(
                    ((safeData.prod || 0) / (safeData.conso || 1)) * 100
                  )}
                  % de vos besoins annuels. Budget mensuel inférieur à votre
                  facture actuelle dès la première année, puis économies nettes
                  après {certifiedBreakEvenYear} ans. Projet économiquement
                  cohérent et techniquement sécurisé.
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>
        {/* Module 3: Projet sécurisé */}
        <ModuleSection
          id="projet-securise"
          title="Votre projet solaire est sécurisé — Zéro risque client"
          icon={<ShieldCheck className="text-blue-400" />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <h4 className="text-xl font-black text-white uppercase mb-3">
                TOUTES LES DÉMARCHES PRISES EN CHARGE
              </h4>
              <p className="text-sm text-slate-400 italic mb-4">
                Ces démarches existent dans tous les projets solaires. La
                différence EDF : vous n'en gérez aucune.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: "1",
                    title: "Urbanisme & Mairie",
                    desc: "Déclaration préalable",
                    icon: Home,
                  },
                  {
                    step: "2",
                    title: "ABF",
                    desc: "Validation zone protégée",
                    icon: Landmark,
                  },
                  {
                    step: "3",
                    title: "Diagnostic Amiante",
                    desc: "Inclus si nécessaire",
                    icon: FileSearch,
                  },
                  {
                    step: "4",
                    title: "Installation",
                    desc: "Pose par installateurs RGE",
                    icon: Wrench,
                  },
                  {
                    step: "5",
                    title: "Consuel",
                    desc: "Conformité électrique",
                    icon: ShieldCheck,
                  },
                  {
                    step: "6",
                    title: "ENEDIS",
                    desc: "Raccordement & Linky",
                    icon: Zap,
                  },
                  {
                    step: "7",
                    title: "Contrat OA",
                    desc: "EDF Obligation d'Achat",
                    icon: FileText,
                  },
                  {
                    step: "8",
                    title: "Mise en production",
                    desc: "Suivi et monitoring",
                    icon: Sun,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-black/20 border border-white/5 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Icon className="text-blue-400" size={18} />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">
                            ÉTAPE {item.step}
                          </span>
                          <h5 className="text-sm font-bold text-white">
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
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6">
              <h4 className="text-2xl font-black text-white mb-3">
                ENGAGEMENT EDF – ZÉRO RISQUE ADMINISTRATIF
              </h4>
              <p className="text-lg text-emerald-300 font-bold">
                Si un blocage administratif empêche l'installation,
                <span className="text-white">
                  {" "}
                  aucun paiement n'est exigible
                </span>
                .
              </p>
            </div>
          </div>
        </ModuleSection>
        {/* Module 4: Sécurisation administrative */}
        <ModuleSection
          id="securisation"
          title="Administratif pris en charge — Vous n'avez rien à gérer"
          icon={<FileCheck className="text-blue-400" />}
          defaultOpen={true}
        >
          <div className="space-y-6">
            <div className="bg-blue-950/40 border-2 border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Zéro démarche administrative de votre côté
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                EDF SOLUTIONS SOLAIRES prend en charge l'intégralité des
                démarches administratives, de la déclaration préalable de
                travaux jusqu'au raccordement Enedis.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Déclaration préalable mairie",
                  status: "EDF SOLUTIONS SOLAIRES",
                },
                {
                  label: "Dossier raccordement Enedis",
                  status: "EDF SOLUTIONS SOLAIRES",
                },
                {
                  label: "Convention autoconsommation",
                  status: "EDF SOLUTIONS SOLAIRES",
                },
                {
                  label: "Contrat obligation d'achat",
                  status: "EDF SOLUTIONS SOLAIRES",
                },
                {
                  label: "Certificat Consuel",
                  status: "EDF SOLUTIONS SOLAIRES",
                },
                { label: "Mise en service compteur", status: "Automatique" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-black/40 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                >
                  <span className="text-slate-300 font-medium">
                    {item.label}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-400">
                  Important :
                </span>{" "}
                Vous recevrez uniquement les notifications de suivi par email.
                Aucune signature, aucun déplacement, aucun appel administratif
                requis de votre part.
              </p>
            </div>
          </div>
        </ModuleSection>
        {/* 🟢 BLOC 2 — CADRAGE FINANCIER */}
        {/* Module 5: Contexte financier */}
        <ModuleSection
          id="financial-context"
          title="Comment lire les chiffres qui suivent"
          icon={<Info className="text-blue-400" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="bg-blue-950/40 border-l-4 border-blue-500 rounded-r-lg p-5">
              <p className="text-slate-300 leading-relaxed mb-3">
                Les chiffres ci-dessous comparent votre situation{" "}
                <strong className="text-white">AVEC</strong> et{" "}
                <strong className="text-white">SANS</strong> solaire.
              </p>
              <p className="text-slate-300 leading-relaxed font-medium">
                Ce n'est pas un coût supplémentaire : c'est un arbitrage entre
                deux façons de payer votre électricité.
              </p>
            </div>

            <div className="bg-black/40 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Principe :</strong> Votre
                  mensualité solaire remplace progressivement votre facture EDF
                  traditionnelle. Après remboursement, vous ne payez plus que
                  les quelques kWh résiduels que vous achetez au réseau.
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>
        {/* 🟡 BLOC 3 — DÉTAIL FINANCIER */}
        {/* Module 6: Budget */}
        <ModuleSection
          id="budget"
          title="Structure du Budget (Mensuel)"
          icon={<Scale className="text-slate-400" />}
          defaultOpen={false}
        >
          <div className="bg-black/40 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl">
            <div className="text-[10px] text-slate-500 italic mb-4">
              On regarde simplement comment votre budget actuel se réorganise —
              sans nouvelle charge.
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Scale className="text-slate-400 w-6 h-6" />
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  STRUCTURE DU BUDGET (MENSUEL)
                </h2>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded text-[10px] font-bold text-slate-400 border border-white/10 uppercase">
                Année 1 — Comparatif
              </div>
            </div>

            <div className="space-y-12">
              {/* --- BLOC ROUGE : SITUATION ACTUELLE --- */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                    Situation actuelle
                  </span>
                  <span className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {formatMoney(monthlyBill || 0)}{" "}
                    <span className="text-2xl opacity-50">/MOIS</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 italic mb-4 max-w-2xl">
                  Concrètement, on ne rajoute rien dans votre budget. On ne paie
                  rien en plus : on remplace une dépense existante par quelque
                  chose qui vous reste.
                </p>
                <div className="relative h-28 bg-gradient-to-r from-[#e14d4d] via-[#d92d2d] to-[#b32424] rounded-2xl shadow-2xl overflow-hidden flex items-center px-8 border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                  <span className="relative text-white font-black text-2xl uppercase tracking-wider">
                    FACTURE ACTUELLE
                  </span>
                  <span className="ml-auto relative text-white/30 font-black text-xl uppercase tracking-tight">
                    100% DÉPENSES — SANS RETOUR
                  </span>
                </div>
              </div>

              {/* --- BLOC GRIS : INSTALLATION EDF --- */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                    Installation EDF — Mise en place
                  </span>
                  <span className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {formatMoney(totalMensuel || 0)}{" "}
                    <span className="text-2xl opacity-50">/MOIS</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 italic mb-4">
                  Montant fixe — identique à ce que vous validez déjà
                  aujourd'hui. Rien ne change dans votre quotidien : c'est
                  simplement organisé autrement.
                </p>

                {/* LA BARRE DOUBLE GRIS (Look Capture) */}
                <div className="relative h-28 bg-[#1a1f2e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex">
                  {/* Bloc Financement (Gris plus clair / bleuté) */}
                  <div
                    className="relative bg-gradient-to-b from-[#3a445e] to-[#232a3d] flex flex-col justify-center px-6 transition-all duration-700"
                    style={{
                      width: `${
                        ((monthlyCredit || 0) / (totalMensuel || 1)) * 100
                      }%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/5"></div>
                    <span className="relative text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">
                      Financement EDF
                    </span>
                    <span className="relative text-white font-black text-2xl">
                      {formatMoney(monthlyCredit || 0)}
                    </span>
                  </div>

                  {/* Séparateur noir épais comme sur la capture */}
                  <div className="w-1.5 bg-black/60 shadow-[1px_0_0_rgba(255,255,255,0.1)]"></div>

                  {/* Bloc Reste à Charge (Gris plus sombre) */}
                  <div className="relative bg-gradient-to-b from-[#1e2536] to-[#141a26] flex-1 flex flex-col justify-center px-6 transition-all duration-700">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/5"></div>
                    <span className="relative text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Reste à charge
                    </span>
                    <span className="relative text-slate-300 font-black text-2xl">
                      {formatMoney(monthlyResidue || 0)}
                    </span>
                  </div>
                </div>

                {/* LÉGENDES EN BAS */}
                <div className="grid grid-cols-2 gap-12 mt-10 px-2">
                  <div className="border-l-[3px] border-slate-500 pl-5">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">
                      Patrimoine personnel
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      C'est de l'épargne : cet argent rembourse votre matériel
                      et valorise votre maison.
                    </p>
                  </div>
                  <div className="border-l-[3px] border-slate-700 pl-5">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Service réseau
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      La part minime versée à EDF pour l'abonnement et la
                      sécurité du réseau.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>
        <ModuleSection
          id="calendrier"
          title="Calendrier de Mise en Service"
          icon={<Calendar className="text-blue-400" />}
          defaultOpen={false}
        >
          <div className="bg-black/40 border border-white/10 rounded-[32px] p-6 sm:p-8">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Délai de mise en route — Installation sous 6-8 semaines
                </h2>
                <p className="text-xs text-slate-500 mt-1 italic">
                  À partir de cette date, l'installation est opérationnelle.
                </p>
              </div>
            </div>

            {/* 4 CARTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Card 1 - Coût énergétique actuel */}
              <div className="bg-slate-900/40 border border-white/10 rounded-xl p-5">
                <div className="text-slate-400 text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Coût énergétique actuel
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatMoney(safeData.totalSpendNoSolar || 0)}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Sur {safeData.projectionYears} ans
                </div>
              </div>

              {/* Card 2 - Économie BRUTE disponible année 1 */}
              <div className="bg-slate-900/40 border border-white/10 rounded-xl p-5">
                <div className="text-slate-400 text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Production année 1
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {formatMoney(
                    (safeData.prod || 0) * (safeData.elecPrice || 0.25)
                  )}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Valeur de l'électricité produite
                </div>
              </div>

              {/* Card 3 - Économie BRUTE période */}
              <div className="bg-slate-900/40 border border-emerald-500/20 rounded-xl p-5">
                <div className="text-slate-400 text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Production {safeData.projectionYears} ans
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {formatMoney(
                    (safeData.prod || 0) *
                      (safeData.elecPrice || 0.25) *
                      safeData.projectionYears
                  )}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Énergie produite totale
                </div>
              </div>

              {/* Card 4 - Gain NET période */}
              <div className="bg-slate-900/40 border border-blue-500/20 rounded-xl p-5">
                <div className="text-slate-400 text-[10px] font-medium mb-2 uppercase tracking-wider">
                  Gain net {safeData.projectionYears} ans
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {formatMoney(safeData.e || 0)}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Après remboursement crédit
                </div>
              </div>
            </div>

            {/* MESSAGE FACTUEL */}
            <div className="bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-xl mb-6">
              <p className="text-slate-300 text-[11px] leading-relaxed italic">
                Une fois le dossier validé, le projet entre dans le processus de
                mise en service. Les délais observés sont en moyenne de six à
                huit semaines.
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed italic mt-2">
                Durant cette période, l'ensemble des démarches techniques,
                administratives et de planification est pris en charge par EDF
                et ses partenaires.
              </p>
            </div>

            {/* VISUALISATION TEMPORELLE */}
            <div className="p-5 bg-black/30 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-4 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Impact du calendrier sur le début des économies :
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-lg">
                    {formatMoney(
                      (safeData.prod || 0) * (safeData.elecPrice || 0.25)
                    )}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Production année 1
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-lg">
                    {formatMoney(
                      (safeData.prod || 0) * (safeData.elecPrice || 0.25) * 3
                    )}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Cumul 3 ans
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-300 font-bold text-lg">
                    {formatMoney(
                      (safeData.prod || 0) * (safeData.elecPrice || 0.25) * 5
                    )}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Cumul 5 ans
                  </div>
                </div>
              </div>
            </div>

            {/* PHRASE FINALE */}
            <p className="text-[10px] text-slate-500 italic mt-6 text-center">
              C'est juste du calendrier. La décision vous appartient.
            </p>
          </div>
        </ModuleSection>
        <ModuleSection
          id="effet-calendrier"
          title="Lecture du Temps"
          icon={<Calendar className="text-slate-400" />}
          defaultOpen={false}
        >
          <div className="bg-[#0b0d10] border border-white/10 rounded-2xl p-6 md:p-8">
            {/* TITRE */}
            <h3 className="text-xl font-black text-white mb-2">
              Impact d'une mise en service différée de 6 mois
            </h3>
            <p className="text-sm text-slate-400 mb-8">
              Comparaison objective de deux calendriers de démarrage.
            </p>

            {/* 2 SCÉNARIOS */}
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
                      Production valorisée sur 6 mois
                    </div>
                    <div className="text-3xl font-black text-white">
                      {formatMoney(
                        ((safeData.prod || 0) * (safeData.elecPrice || 0.25)) /
                          2
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
                      Production valorisée sur 6 mois
                    </div>
                    <div className="text-3xl font-black text-white">0 €</div>
                  </div>
                </div>
              </div>
            </div>

            {/* DIFFÉRENTIEL */}
            <div className="bg-black/60 border border-white/10 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Différentiel économique entre les deux scénarios
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Le scénario A permet d'activer la production pendant ~4-5
                    mois sur cette période, générant de la valeur. Le scénario B
                    maintient la situation actuelle pendant 6 mois
                    supplémentaires.
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-4xl font-black text-white">
                    {formatMoney(
                      ((safeData.prod || 0) * (safeData.elecPrice || 0.25)) / 2
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    d'écart sur 6 mois
                  </div>
                </div>
              </div>
            </div>

            {/* NOTE FINALE */}
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
        {/* Module 7: Impact budget */}
        <ModuleSection
          id="impact"
          title="Impact sur votre budget mensuel"
          icon={<Wallet className="text-blue-400" />}
          defaultOpen={false}
        >
          <div className="space-y-6">
            {/* PHRASE D'INTRODUCTION */}
            <div className="text-[10px] sm:text-[11px] text-slate-500 italic leading-relaxed">
              Voici comment votre budget mensuel se réorganise la première
              année.
              <br />
              <span className="text-slate-400">
                On ne parle pas d'un coût, mais d'une phase de transition avant
                un modèle durablement plus léger.
              </span>
            </div>

            {/* 3 CARDS - RESPONSIVE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* CARD 1 - FACTURE ACTUELLE */}
              <div className="bg-gradient-to-br from-red-950/30 to-black/40 border border-red-500/20 rounded-xl p-4 sm:p-5">
                <div className="text-red-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wide flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></span>
                  <span>Facture actuelle</span>
                </div>
                <div className="text-white text-2xl sm:text-3xl font-black break-words">
                  {(
                    ((data?.conso || 0) * (data?.elecPrice || 0.25)) /
                    12
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs mt-1">
                  /mois
                </div>
              </div>

              {/* CARD 2 - AVEC INSTALLATION */}
              <div className="bg-gradient-to-br from-blue-950/30 to-black/40 border border-blue-500/20 rounded-xl p-4 sm:p-5">
                <div className="text-blue-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wide flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                  <span>Vous payez</span>
                </div>
                <div className="text-white text-2xl sm:text-3xl font-black break-words">
                  {(
                    (data?.m || 0) +
                    (((data?.conso || 0) -
                      (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                      (data?.elecPrice || 0.25)) /
                      12
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs mt-1 leading-tight">
                  /mois (crédit + reste facture)
                </div>
              </div>

              {/* CARD 3 - DIFFÉRENCE */}
              <div className="bg-gradient-to-br from-slate-950/30 to-black/40 border border-slate-600/20 rounded-xl p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
                <div className="text-slate-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wide flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0"></span>
                  <span>Différence — 1ère année</span>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-black break-words ${
                    (data?.m || 0) +
                      (((data?.conso || 0) -
                        (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                        (data?.elecPrice || 0.25)) /
                        12 -
                      ((data?.conso || 0) * (data?.elecPrice || 0.25)) / 12 >
                    0
                      ? "text-orange-400"
                      : "text-emerald-400"
                  }`}
                >
                  {(data?.m || 0) +
                    (((data?.conso || 0) -
                      (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                      (data?.elecPrice || 0.25)) /
                      12 -
                    ((data?.conso || 0) * (data?.elecPrice || 0.25)) / 12 >
                  0
                    ? "+"
                    : ""}
                  {(
                    (data?.m || 0) +
                    (((data?.conso || 0) -
                      (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                      (data?.elecPrice || 0.25)) /
                      12 -
                    ((data?.conso || 0) * (data?.elecPrice || 0.25)) / 12
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs mt-1 leading-tight">
                  Puis → économies dès fin crédit
                </div>
              </div>
            </div>

            {/* SLIDER VISUEL */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-[9px] sm:text-[10px] text-slate-500 uppercase mb-3">
                <span>Alignement avec votre budget actuel</span>
                <span className="text-white font-bold text-sm sm:text-base">
                  {(
                    (((data?.m || 0) +
                      (((data?.conso || 0) -
                        (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                        (data?.elecPrice || 0.25)) /
                        12) /
                      (((data?.conso || 0) * (data?.elecPrice || 0.25)) / 12)) *
                    100
                  ).toFixed(0)}
                  %
                </span>
              </div>
              <div className="h-3 sm:h-4 bg-slate-800/40 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-700 ${
                    ((data?.m || 0) +
                      (((data?.conso || 0) -
                        (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                        (data?.elecPrice || 0.25)) /
                        12) /
                      (((data?.conso || 0) * (data?.elecPrice || 0.25)) / 12) >
                    1
                      ? "bg-gradient-to-r from-orange-500 to-orange-600"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      (((data?.m || 0) +
                        (((data?.conso || 0) -
                          (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                          (data?.elecPrice || 0.25)) /
                          12) /
                        (((data?.conso || 0) * (data?.elecPrice || 0.25)) /
                          12)) *
                        100,
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

            {/* ÉVOLUTION APRÈS CRÉDIT */}
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
                    {(
                      (((data?.conso || 0) -
                        (data?.prod || 0) * ((data?.selfCons || 0) / 100)) *
                        (data?.elecPrice || 0.25)) /
                      12
                    ).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
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
                    {(
                      ((data?.prod || 0) *
                        ((data?.selfCons || 0) / 100) *
                        (data?.elecPrice || 0.25)) /
                      12
                    ).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Par rapport à votre facture actuelle
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-slate-400 italic leading-relaxed">
                À ce stade, le financement disparaît.
                <br />
                Ce qu'il reste, c'est un système qui travaille pour votre
                budget.
              </div>
            </div>

            {/* FOOTER */}
            <p className="text-center text-[10px] sm:text-[11px] text-slate-500 italic leading-relaxed">
              Ces montants sont ceux de la 1ère année.
            </p>
          </div>
        </ModuleSection>
        {/* Module 9: Tableau détaillé */}
        <ModuleSection
          id="tableau-detaille"
          title="Projection Financière — 25 ans"
          icon={<Table2 className="text-slate-400" />}
          defaultOpen={false}
        >
          <p className="text-[10px] text-slate-400 italic mb-3">
            Ce qui suit ne sert pas à choisir — juste à vérifier qu'on ne fait
            pas une erreur.
          </p>

          <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                  <th className="py-3 px-4">Année</th>
                  <th className="py-3 px-4 text-red-400">Sans Solaire</th>
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
                        ? safeData.cashApport
                        : safeData.installCost
                    )}
                  </td>
                  <td className="py-4 px-4 text-red-400 font-bold">
                    {formatMoney(
                      (tableScenario === "financement"
                        ? safeData.cashApport
                        : safeData.installCost) /
                        (tableMode === "mensuel" ? 12 : 1)
                    )}
                  </td>
                  <td className="py-4 px-4 text-right text-red-500 font-bold">
                    -
                    {formatMoney(
                      tableScenario === "financement"
                        ? safeData.cashApport
                        : safeData.installCost
                    )}
                  </td>
                </tr>

                {(tableScenario === "financement"
                  ? safeData.details
                  : safeData.detailsCash
                )
                  .slice(0, safeData.projectionYears)
                  .map((row) => {
                    const divider = tableMode === "mensuel" ? 12 : 1;
                    const noSolar = row.edfBillWithoutSolar / divider;
                    const credit = (row.creditPayment || 0) / divider;
                    const residue = row.edfResidue / divider;
                    const totalWithSolar =
                      tableScenario === "cash"
                        ? row.totalWithSolar / divider
                        : credit + residue;
                    const eff = totalWithSolar - noSolar;

                    return (
                      <tr
                        key={row.year}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-500">{row.year}</td>
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

              <tfoot className="sticky bottom-0 bg-black/95 backdrop-blur-xl border-t-2 border-emerald-500/30">
                <tr>
                  <td
                    colSpan={showDetails ? 6 : 4}
                    className="py-3 px-4 text-right text-xs font-bold text-slate-400 uppercase"
                  >
                    Gain total sur {safeData.projectionYears} ans
                  </td>
                  <td className="py-3 px-4 text-right text-xl font-black text-emerald-400">
                    {formatMoney(
                      (tableScenario === "financement"
                        ? safeData.details
                        : safeData.detailsCash)[safeData.projectionYears - 1]
                        ?.cumulativeSavings || 0
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showDetails ? "Vue globale" : "Vue complète"}
          </button>
        </ModuleSection>

        {/* 🟠 BLOC 4 — AJUSTEMENT */}
        {/* Module 10: Financement vs Cash */}
        <ModuleSection
          id="financement-vs-cash"
          title="Ajustement de financement"
          icon={<Coins className="text-emerald-500" />}
          defaultOpen={false}
        >
          <div className="relative bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10">
            <div className="flex items-start gap-3 mb-6">
              <Coins className="text-emerald-400 w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  Ajustement de financement
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Le projet est validé sur le principe. Ici, on vérifie
                  simplement la solution la plus confortable pour vous.
                </p>
              </div>
            </div>

            <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 mb-8">
              <p className="text-sm text-slate-300 leading-relaxed">
                Les deux options ci-dessous sont{" "}
                <strong>équivalentes sur le projet</strong>. Le choix n'impacte
                ni la qualité, ni les garanties, ni la validation finale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/60 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="text-blue-400" size={20} />
                  <h4 className="text-blue-300 font-bold uppercase text-sm tracking-wider">
                    Financement structuré
                  </h4>
                </div>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-400" />
                    Capital personnel conservé
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-400" />
                    Effort réparti dans le temps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-400" />
                    Flexibilité maximale
                  </li>
                </ul>
              </div>

              <div className="bg-black/60 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="text-emerald-400" size={20} />
                  <h4 className="text-emerald-300 font-bold uppercase text-sm tracking-wider">
                    Paiement comptant
                  </h4>
                </div>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Tranquillité immédiate
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Aucun engagement bancaire
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Sujet clos rapidement
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-slate-300 italic">
                Ce choix peut être ajusté avec votre conseiller. Il n'engage pas
                la validation du projet.
              </p>
            </div>
          </div>
        </ModuleSection>
        {/* 🟣 BLOC 5 — PREUVE SOCIALE */}
        {/* Module 11: Garanties (ancien doublon conservé) */}
        <ModuleSection
          id="garanties"
          title="Garanties de Sécurité"
          icon={<Shield className="text-emerald-500" />}
          defaultOpen={false}
        >
          <div className="space-y-6">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Garantie totale à vie
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Matériel, main-d'œuvre et déplacements garantis{" "}
                    <span className="text-white font-semibold">à vie</span>.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Garantie de performance 30 ans
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Production contractuelle. Si non atteinte,{" "}
                    <span className="text-white font-semibold">
                      EDF rembourse la différence
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>
        {/* Module 12: Réalisations */}
        <ModuleSection
          id="realisations"
          title="Réalisations EDF — Familles accompagnées"
          icon={<Users className="text-blue-400" />}
          defaultOpen={false}
        >
          <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8">
            <div className="mb-5 flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="text-blue-400" size={16} />
              <span>
                Projets EDF accompagnés à proximité de{" "}
                <strong className="text-white">
                  {clientCity || "votre secteur"}
                </strong>
              </span>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  name: "Mme T.",
                  city: "Le Cannet",
                  status: "Production active",
                  kWc: "3.5 kWc",
                },
                {
                  name: "M. B.",
                  city: "Mougins",
                  status: "Installation raccordée",
                  kWc: "4.5 kWc",
                },
                {
                  name: "Famille D.",
                  city: "Grasse",
                  status: "Production active",
                  kWc: "6 kWc",
                },
                {
                  name: "M. & Mme L.",
                  city: "Cannes",
                  status: "Raccordement validé Enedis",
                  kWc: "9 kWc",
                },
              ].map((client, i) => (
                <div
                  key={i}
                  className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/40 transition-all duration-300"
                >
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

                  <div className="text-white font-semibold text-sm mb-0.5">
                    {client.name}
                  </div>
                  <div className="text-slate-500 text-xs mb-4">
                    {client.city}
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      Projet validé et suivi par EDF
                    </div>
                    <div className="text-sm font-semibold text-slate-300">
                      Installation conforme — production encadrée
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-slate-800/40 to-transparent border-l-4 border-blue-500 p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <BarChart3 className="text-blue-400" size={20} />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  <strong className="text-white">127 dossiers validés</strong>{" "}
                  ce mois-ci dans le 06, selon les mêmes standards EDF.
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>
        {/* BOUTON APPEL – UI ORIGINALE */}
        {isMobile ? (
          <a
            href={`tel:${phone}`}
            onClick={async () => {
              try {
                await supabase.from("tracking_events").insert({
                  study_id: studyId,
                  event_type: "email_click",
                });
              } catch (e) {
                console.error("Tracking error:", e);
              }
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-7 rounded-3xl uppercase text-sm flex items-center justify-center gap-4 mb-8 hover:from-blue-500 hover:to-blue-400 transition-all no-underline shadow-xl active:opacity-80"
          >
            <Phone size={20} fill="currentColor" />
            <span>On sécurise le projet ensemble</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={async () => {
              try {
                await supabase.from("tracking_events").insert({
                  study_id: studyId,
                  event_type: "call_click",
                });
              } catch (e) {
                console.error("Tracking error:", e);
              }

              navigator.clipboard.writeText(phone);
              alert("Numéro copié : " + phone);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-7 rounded-3xl uppercase text-sm flex items-center justify-center gap-4 mb-8 hover:from-blue-500 hover:to-blue-400 transition-all shadow-xl active:opacity-80"
          >
            <Phone size={20} fill="currentColor" />
            <span>On sécurise le projet ensemble</span>
          </button>
        )}

        {/* FOOTER */}
        <div className="text-center pb-8">
          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">
            DOCUMENT SÉCURISÉ EDF SOLUTIONS PRO
          </span>
        </div>
      </div>
    </div>
  );
}
