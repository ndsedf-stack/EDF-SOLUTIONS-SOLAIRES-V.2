import React, { useState, useEffect } from "react";
import {
  Lock,
  Phone,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  Flame,
  X,
  Shield,
  AlertCircle,
  Table2,
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
  HelpCircle,
  Clock,
  Wallet,
  Bot,
  MapPin,
  BarChart3,
  Lightbulb,
  Info,
  MessageCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// ⚙️ CONFIGURATION
const STUDY_CONFIG = {
  expirationDays: 7,
  toleranceMarginMs: 5 * 60 * 1000,
  phoneNumber: "0683623329",
};

// Mock Supabase
const supabase = {
  from: (table: string) => ({
    select: (fields: string) => ({
      eq: (field: string, value: string) => ({
        maybeSingle: async () => {
          // Simulation de données pour demo
          return {
            data: {
              id: value,
              expires_at: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              study_data: {
                n: "Famille Martin",
                e: 32202,
                a: 70,
                m: 139,
                t: 3.89,
                d: 180,
                prod: 7000,
                conso: 10000,
                selfCons: 70,
                installCost: 18799,
                cashApport: 0,
                elecPrice: 0.25,
                mode: "financement",
                installedPower: 3.5,
                projectionYears: 20,
                ga: [
                  "🏆 Garantie Performance 30 ans",
                  "Garantie main d'œuvre À VIE",
                  "SAV et maintenance inclus",
                ],
              },
            },
            error: null,
          };
        },
      }),
    }),
    update: (data: any) => ({
      eq: (field: string, value: string) => Promise.resolve(),
    }),
  }),
};

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

// Composant InfoPopup
const InfoPopup: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        className="text-blue-400 hover:text-blue-300"
      >
        <Info size={16} />
      </button>
      {show && (
        <div className="absolute z-50 w-72 p-4 bg-black border border-white/20 rounded-lg shadow-xl top-6 right-0">
          <div className="text-sm text-white font-bold mb-2">{title}</div>
          <div className="text-xs text-slate-300">{children}</div>
          <button
            onClick={() => setShow(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// Composant ProfitBadge
const ProfitBadge: React.FC<{
  totalSavings: number;
  paybackYear: number;
  projectionYears: number;
}> = ({ totalSavings, paybackYear, projectionYears }) => {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4">
      <div className="text-[10px] text-emerald-400 uppercase mb-1">
        Gain projeté
      </div>
      <div className="text-2xl font-black text-emerald-400">
        {formatMoney(totalSavings)}
      </div>
      <div className="text-xs text-slate-400 mt-1">
        sur {projectionYears} ans
      </div>
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
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [tableMode, setTableMode] = useState<"annuel" | "mensuel">("annuel");
  const [tableScenario, setTableScenario] = useState<"financement" | "cash">(
    "financement"
  );
  const [activeModule, setActiveModule] = useState<string>("");
  const [showCoachPanel, setShowCoachPanel] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [whereMoneyMode, setWhereMoneyMode] = useState<"financement" | "cash">(
    "financement"
  );
  const [gouffreMode, setGouffreMode] = useState<"financement" | "cash">(
    "financement"
  );

  // Simuler le chargement
  useEffect(() => {
    const loadStudy = async () => {
      try {
        const { data: studyData } = await supabase
          .from("studies")
          .select("*")
          .eq("id", "demo-id")
          .maybeSingle();

        if (studyData) {
          setStudy(studyData);
          setData(studyData.study_data);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadStudy();
  }, []);

  // Timer countdown
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

  // Compteur argent gaspillé
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

  if (!data) return null;

  const safeData = {
    n: data.n || "Client",
    e: data.e || 32202,
    prod: data.prod || 7000,
    conso: data.conso || 10000,
    selfCons: data.selfCons || 70,
    installCost: data.installCost || 18799,
    cashApport: data.cashApport || 0,
    elecPrice: data.elecPrice || 0.25,
    m: data.m || 139,
    t: data.t || 3.89,
    d: data.d || 180,
    installedPower: data.installedPower || 3.5,
    projectionYears: data.projectionYears || 20,
    ga: data.ga || [],
    mode: data.mode || "financement",
  };

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

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // Calculs financiers simplifiés
  const monthlyBill = (safeData.conso * safeData.elecPrice) / 12;
  const monthlyCredit = safeData.m;
  const monthlyResidue =
    ((safeData.conso - (safeData.prod * safeData.selfCons) / 100) *
      safeData.elecPrice) /
    12;
  const totalMensuel = monthlyCredit + monthlyResidue;
  const diffMensuel = totalMensuel - monthlyBill;

  const calculationResult = {
    oldMonthlyBillYear1: monthlyBill,
    totalSavings: 25000,
    totalSavingsProjected: 32000,
    breakEvenPoint: 8,
    paybackYear: 8,
    averageYearlyGain: 1600,
    greenValue: 5000,
    totalSpendNoSolar: 80000,
    totalSpendSolar: 55000,
    totalSpendNoSolarCash: 75000,
    totalSpendSolarCash: 50000,
    bankEquivalentCapital: 45000,
    year1: {
      creditPayment: monthlyCredit * 12,
      edfResidue: monthlyResidue * 12,
      totalWithSolar: totalMensuel * 12,
    },
    details: [],
    detailsCash: [],
  };

  const gouffreChartData = Array.from({ length: 20 }, (_, i) => ({
    year: i + 1,
    cumulativeSpendNoSolar: monthlyBill * 12 * (i + 1) * 1.05,
    cumulativeSpendSolar: totalMensuel * 12 * (i + 1),
  }));

  const handleCall = () => {
    window.location.href = `tel:${STUDY_CONFIG.phoneNumber}`;
  };

  const getYearData = (year: number) => ({
    credit: {
      cumulativeSpendSolar: -totalMensuel * 12 * year,
      cumulativeSpendNoSolar: -monthlyBill * 12 * year * Math.pow(1.05, year),
    },
    cash: {
      cumulativeSpendSolar: -safeData.installCost - monthlyResidue * 12 * year,
      cumulativeSpendNoSolar: -monthlyBill * 12 * year * Math.pow(1.05, year),
    },
  });

  const yearsToDisplay = [5, 10, 20];
  const clientCity = "Cannes";
  const projectionYears = safeData.projectionYears;
  const installCost = safeData.installCost;
  const cashApport = safeData.cashApport;
  const creditDurationMonths = safeData.d;
  const creditMonthlyPayment = safeData.m;
  const insuranceMonthlyPayment = 0;

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-xl font-black italic text-white/20 uppercase">
            EDF SOLUTIONS
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
          VOTRE ÉTUDE
          <br />
          SOLAIRE.
        </h1>
        <div className="h-1.5 w-20 bg-blue-600 mb-6" />
        <p className="text-slate-400 text-sm font-medium mb-8 italic uppercase">
          Préparée pour{" "}
          <span className="text-white font-black underline decoration-blue-500">
            {safeData.n}
          </span>
        </p>

        {/* COMPTE À REBOURS */}
        <div className="bg-gradient-to-br from-red-950/80 to-red-900/40 border-2 border-red-500/50 rounded-[32px] p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle
              className="text-orange-400 animate-pulse"
              size={20}
            />
            <span className="text-orange-300 text-xs font-black uppercase">
              Offre Limitée
            </span>
          </div>
          <div className="text-white text-sm font-medium mb-6">
            Cette étude expire dans :
          </div>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { val: days, label: "JOURS" },
              { val: hours, label: "H" },
              { val: minutes, label: "MIN" },
              { val: seconds, label: "SEC" },
            ].map((unit, i) => (
              <div
                key={i}
                className="bg-black/60 border border-red-500/20 rounded-xl p-3 text-center"
              >
                <div className="text-3xl font-black text-red-400">
                  {String(unit.val).padStart(2, "0")}
                </div>
                <div className="text-[8px] text-slate-500 uppercase font-bold mt-1">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GAIN NET */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/20 rounded-[40px] p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 block mb-2">
                Gain Net Projeté
              </span>
              <span className="text-xs text-slate-500">Sur 20 ans</span>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
          </div>
          <div className="text-6xl font-black text-emerald-400 text-center mb-6">
            +{Number(safeData.e).toLocaleString("fr-FR")}€
          </div>
        </div>

        {/* MODULE 1: PROJET SÉCURISÉ */}
        <ModuleSection
          id="projet-securise"
          title="PROJET SOLAIRE SÉCURISÉ – ZÉRO RISQUE"
          icon={<ShieldCheck className="text-blue-400" size={20} />}
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

        {/* MODULE 2: GARANTIES */}
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

        {/* MODULE 3: STRUCTURE BUDGET */}
        <ModuleSection
          id="budget"
          title="Structure du Budget (Mensuel)"
          icon={<Scale className="text-slate-400" />}
          defaultOpen={false}
          onOpen={setActiveModule}
        >
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <div className="text-[10px] text-slate-500 italic mb-4">
              On regarde simplement comment votre budget actuel se réorganise —
              sans nouvelle charge.
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold text-slate-400 uppercase">
                    Situation actuelle
                  </span>
                  <span className="text-4xl font-black text-white">
                    {formatMoney(monthlyBill)}
                  </span>
                </div>
                <div className="h-24 bg-gradient-to-b from-red-500 to-red-700 rounded-2xl" />
              </div>
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold text-slate-400 uppercase">
                    Installation EDF
                  </span>
                  <span className="text-4xl font-black text-white">
                    {formatMoney(totalMensuel)}
                  </span>
                </div>
                <div className="h-24 bg-slate-700 rounded-2xl flex">
                  <div
                    className="bg-blue-500 h-full"
                    style={{
                      width: `${(monthlyCredit / totalMensuel) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-yellow-500 h-full"
                    style={{
                      width: `${(monthlyResidue / totalMensuel) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 4: IMPACT BUDGET */}
        <ModuleSection
          id="impact"
          title="Impact sur votre budget mensuel"
          icon={<Wallet className="text-blue-400" />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
              <div className="text-red-400 text-[10px] uppercase font-bold mb-1">
                Facture actuelle
              </div>
              <div className="text-white text-3xl font-black">
                {formatMoney(monthlyBill)}
              </div>
            </div>
            <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
              <div className="text-blue-400 text-[10px] uppercase font-bold mb-1">
                Vous payez
              </div>
              <div className="text-white text-3xl font-black">
                {formatMoney(totalMensuel)}
              </div>
            </div>
            <div className="bg-slate-950/30 border border-slate-600/20 rounded-xl p-4">
              <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">
                Différence
              </div>
              <div className="text-white text-3xl font-black">
                {diffMensuel > 0 ? "+" : ""}
                {formatMoney(diffMensuel)}
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 5: PROJECTION */}
        <ModuleSection
          id="projection"
          title="Projection financière dans le temps"
          icon={<TrendingUp className="text-blue-400" />}
          defaultOpen={false}
        >
          <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gouffreChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="cumulativeSpendNoSolar"
                    stroke="#ef4444"
                    fill="rgba(239, 68, 68, 0.2)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeSpendSolar"
                    stroke="#3b82f6"
                    fill="rgba(59, 130, 246, 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ModuleSection>
        {/* MODULE 6: SÉCURITÉ JURIDIQUE */}
        <ModuleSection
          id="securite-juridique"
          title="Garanties de Sécurité"
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
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-2xl font-black uppercase text-white">
                  GROUPE EDF SOLUTIONS SOLAIRES
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-md text-xs font-bold uppercase">
                    100% Public
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-md text-xs font-bold uppercase">
                    Contrôlé par l'État
                  </span>
                  <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-md text-xs font-bold uppercase">
                    Solidité institutionnelle
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide flex items-center gap-2">
                  <FileText className="text-blue-400" size={18} /> Contrat
                  protégé
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✔ 14 jours de rétractation légale</li>
                  <li>✔ Aucun versement avant démarrage</li>
                  <li>✔ Protection Code de la consommation</li>
                </ul>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide flex items-center gap-2">
                  <Award className="text-yellow-400" size={18} /> Installateurs
                  certifiés
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✔ Certification RGE QualiPV</li>
                  <li>✔ Assurance décennale active</li>
                </ul>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide flex items-center gap-2">
                  <Zap className="text-purple-400" size={18} /> Raccordement
                  sécurisé
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✔ Contrat EDF OA garanti 20 ans</li>
                  <li>✔ Prix de rachat fixé par l'État</li>
                </ul>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide flex items-center gap-2">
                  <Coins className="text-emerald-400" size={18} /> Aides
                  sécurisées
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✔ Versement direct par l'État</li>
                  <li>✔ Prime autoconsommation garantie</li>
                  <li>✔ TVA réduite à 5,5%</li>
                </ul>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 7: PROCESSUS ADMINISTRATIF */}
        <ModuleSection
          id="securisation"
          title="Processus de Sécurisation Administrative"
          icon={<ClipboardCheck className="text-blue-500" />}
          defaultOpen={false}
          onOpen={setActiveModule}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/5 blur-[120px]" />

            <div className="mb-8 p-5 bg-gradient-to-r from-blue-950/30 to-slate-900/30 border-l-4 border-blue-500/50 rounded-r-2xl">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-blue-400 mt-1" size={22} />
                <div>
                  <p className="text-white text-sm font-bold mb-1">
                    EDF gère l'ensemble du volet administratif et réglementaire
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Vous n'avez rien à remplir, rien à suivre. Chaque étape est
                    prise en main par EDF.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Autorisations & Urbanisme
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75">
                  <li>• Dossier mairie</li>
                  <li>• Zones protégées si concerné</li>
                  <li>• Conformité locale</li>
                </ul>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Visite Technique & Sécurisation
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75">
                  <li>• Pré-validation sur place</li>
                  <li>• Vérification technique par équipes EDF</li>
                  <li>• Adaptations si besoin</li>
                </ul>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Conformité Électrique
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75">
                  <li>• Validation installation</li>
                  <li>• Attestation réglementaire</li>
                  <li>• Sécurité avant mise en service</li>
                </ul>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-black uppercase mb-3 text-sm tracking-wide">
                  Mise en Service & Raccordement
                </h4>
                <ul className="space-y-3 text-sm text-slate-300 opacity-75">
                  <li>• Raccordement ENEDIS</li>
                  <li>• Activation contrat EDF</li>
                  <li>• Passage en production</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
              <p className="text-emerald-100 text-sm leading-relaxed">
                <strong className="text-white">
                  Vous êtes guidé, accompagné et protégé.
                </strong>
                EDF assume la responsabilité du projet — vous validez simplement
                les étapes importantes.
              </p>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 8: CONTEXTE LECTURE FINANCIÈRE */}
        <ModuleSection
          id="financial-context"
          title="Comment lire les chiffres qui suivent"
          icon={<Scale className="text-blue-400" />}
          defaultOpen={true}
        >
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 space-y-6">
            <div className="bg-blue-950/30 border-l-4 border-blue-500/60 rounded-r-2xl p-6">
              <p className="text-white text-sm font-semibold leading-relaxed">
                Les éléments financiers ci-dessous ne servent pas à comparer une
                facture à une mensualité.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed mt-2">
                Ils servent à comprendre{" "}
                <strong>comment votre argent est utilisé</strong> : soit pour
                une dépense perdue, soit pour un équipement qui produit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/60 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-bold text-white mb-2">
                  1. Mensualité ≠ Dépense
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Une mensualité finance un actif qui vous appartient et produit
                  de l'énergie. Une facture est définitivement perdue.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-bold text-white mb-2">
                  2. Effort temporaire
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  L'équilibre financier s'améliore avec le temps, pendant que
                  les factures classiques augmentent chaque année.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-bold text-white mb-2">
                  3. Décision réversible
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tant que le projet n'est pas mis en service, vous restez
                  protégé par le cadre contractuel EDF.
                </p>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-200 text-sm italic text-center">
                Avec ce cadre en tête, les chiffres peuvent maintenant être
                regardés sereinement.
              </p>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 9: FINANCEMENT VS CASH */}
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

        {/* MODULE 10: SYNTHÈSE DE COHÉRENCE */}
        <ModuleSection
          id="synthese"
          title="Synthèse de cohérence du projet"
          icon={<Bot className="text-blue-400" />}
          defaultOpen={false}
        >
          <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-300 leading-relaxed">
              Cette synthèse n'est <strong>pas un outil de comparaison</strong>.
              Elle sert uniquement à vérifier que le projet est cohérent,
              raisonnable et sécurisé dans le temps.
            </p>
          </div>

          <div className="bg-[#050505] border border-white/5 rounded-[40px] p-8 md:p-10 relative overflow-hidden">
            <div className="flex items-center gap-5 mb-10">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Lecture globale du projet
                </h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                  Projection sur {projectionYears} ans — données encadrées EDF
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/40 border border-blue-500/30 rounded-[32px] p-8 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/60 p-4 rounded-2xl text-center">
                  <div className="text-2xl font-black text-emerald-400 italic">
                    0€
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase mt-2">
                    Capital immobilisé au départ
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-2xl text-center">
                  <div className="text-2xl font-black text-blue-400 italic">
                    {calculationResult.breakEvenPoint}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase mt-2">
                    Horizon d'équilibre (années)
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-2xl text-center border border-blue-500/20">
                  <div className="text-xl font-black text-white italic">
                    {formatMoney(calculationResult.totalSavingsProjected)}
                  </div>
                  <div className="text-[9px] text-slate-500 uppercase mt-2">
                    Valeur énergétique projetée
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-400 italic">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Le projet s'auto-finance dans le temps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>La dépense énergie est transformée en actif</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Aucun déséquilibre budgétaire structurel</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-5 text-center">
              <p className="text-sm text-slate-300 italic leading-relaxed">
                Si cette lecture vous semble cohérente, la suite consiste
                simplement à valider le dossier avec votre conseiller pour
                sécuriser les conditions EDF.
              </p>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 11: PREUVE SOCIALE */}
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

        {/* MODULE 12: VOTRE ARGENT DANS X ANS */}
        <ModuleSection
          id="where-money"
          title="Votre argent dans X ans"
          icon={<HelpCircle className="text-blue-500" />}
          defaultOpen={false}
          onOpen={setActiveModule}
        >
          <p className="text-[10px] text-slate-400 italic mb-3">
            Ce module est un repère visuel. Il ne sert pas à décider, seulement
            à comprendre les ordres de grandeur dans le temps.
          </p>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 md:p-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <HelpCircle size={28} className="text-blue-500" />
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    Votre argent dans {projectionYears} ans
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Visualisation factuelle — comparaison de scénarios
                    possibles.
                  </p>
                </div>
              </div>

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
                  shadowColor = "hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]";
                } else if (year === 20) {
                  headerColor = "text-emerald-500";
                  borderColor = "border-emerald-500/30";
                  shadowColor = "hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]";
                }

                return (
                  <div
                    key={year}
                    className={`relative bg-[#0b0b0b]/60 backdrop-blur-md border ${borderColor} rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-white/30 ${shadowColor}`}
                  >
                    <div className="absolute top-4 right-4 text-[120px] font-black text-white opacity-[0.03] leading-none select-none pointer-events-none">
                      {year}
                    </div>

                    <h3
                      className={`${headerColor} font-bold text-sm uppercase mb-6 tracking-wider`}
                    >
                      DANS {year} ANS
                    </h3>

                    <div className="space-y-6 relative z-10">
                      <div className="bg-gradient-to-br from-blue-950/30 to-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 size={14} className="text-blue-400" />
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                            Avec installation solaire
                          </span>
                        </div>

                        <p className="text-[9px] text-slate-500 uppercase mb-1">
                          Dépenses énergétiques cumulées
                        </p>
                        <p className="text-2xl font-black text-white tabular-nums">
                          {formatMoney(youPaid)}
                        </p>

                        {difference > 0 && (
                          <div className="mt-4 bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg">
                            <p className="text-[9px] text-emerald-400 uppercase mb-1">
                              Écart observé
                            </p>
                            <p className="text-3xl font-black text-emerald-400 tabular-nums">
                              +{formatMoney(difference)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 border border-red-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle size={14} className="text-red-400" />
                          <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                            Situation actuelle (référence)
                          </span>
                        </div>

                        <p className="text-[9px] text-red-300 uppercase mb-1">
                          Dépenses énergétiques estimées
                        </p>
                        <p className="text-2xl font-black text-red-400 tabular-nums">
                          {formatMoney(youWouldHavePaid)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 bg-gradient-to-r from-orange-950/30 to-red-950/30 border-l-4 border-orange-500 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <Clock
                  size={24}
                  className="text-orange-400 flex-shrink-0 mt-1"
                />
                <div>
                  <h4 className="text-orange-400 font-bold text-lg mb-2">
                    Repère mensuel actuel :{" "}
                    {formatMoney(calculationResult.oldMonthlyBillYear1)}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    À titre de repère, ce montant correspond à la dépense
                    énergétique moyenne observée aujourd'hui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 13: COMPARAISON AUTRES OPTIONS */}
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
              <div className="flex items-center gap-3 mb-6">
                <Landmark size={26} className="text-purple-500" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Comparaison avec vos autres options
                </h2>
              </div>

              <p className="text-[10px] text-slate-400 italic mb-4">
                Cette comparaison est présentée à titre informatif. Elle permet
                de situer différents scénarios possibles, sans objectif de
                choix.
              </p>

              <div className="mb-4 bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded text-sm text-gray-300 leading-relaxed flex items-start gap-3">
                <span className="flex-1">
                  Tous les scénarios sont calculés avec les mêmes hypothèses de
                  départ. Les écarts observés proviennent uniquement de la
                  nature de chaque option.
                </span>
                <InfoPopup title="Méthodologie de calcul">
                  <p className="mb-3">
                    Les calculs utilisent votre consommation déclarée, les
                    tarifs réglementés actuels et des hypothèses prudentes
                    d'évolution.
                  </p>
                  <p className="text-blue-400 text-xs">
                    L'objectif est de comparer des ordres de grandeur, pas de
                    prédire un rendement exact.
                  </p>
                </InfoPopup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-3">
                  <div className="bg-black/60 border border-blue-900/20 p-6 rounded-2xl">
                    <h3 className="font-bold text-white text-sm mb-2">
                      Livret A
                    </h3>
                    <div className="text-4xl font-black text-blue-500 mb-1">
                      2,7%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      Rendement annuel
                    </div>
                  </div>
                  <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl">
                    <div className="text-[10px] text-blue-400 uppercase mb-1">
                      Gain estimé sur {projectionYears} ans
                    </div>
                    <div className="text-xl font-black text-blue-400">
                      {formatMoney(
                        installCost * Math.pow(1.027, projectionYears) -
                          installCost
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-black/60 border border-purple-900/20 p-6 rounded-2xl">
                    <h3 className="font-bold text-white text-sm mb-2">
                      Assurance-vie
                    </h3>
                    <div className="text-4xl font-black text-purple-500 mb-1">
                      3,5%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      Rendement annuel
                    </div>
                  </div>
                  <div className="bg-purple-950/20 border border-purple-900/30 p-4 rounded-xl">
                    <div className="text-[10px] text-purple-400 uppercase mb-1">
                      Gain estimé sur {projectionYears} ans
                    </div>
                    <div className="text-xl font-black text-purple-400">
                      {formatMoney(
                        installCost * Math.pow(1.035, projectionYears) -
                          installCost
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-black/60 border border-orange-900/20 p-6 rounded-2xl">
                    <h3 className="font-bold text-white text-sm mb-2">
                      SCPI / Immobilier
                    </h3>
                    <div className="text-4xl font-black text-orange-500 mb-1">
                      4,5%
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      Rendement annuel
                    </div>
                  </div>
                  <div className="bg-orange-950/20 border border-orange-900/30 p-4 rounded-xl">
                    <div className="text-[10px] text-orange-400 uppercase mb-1">
                      Gain estimé sur {projectionYears} ans
                    </div>
                    <div className="text-xl font-black text-orange-400">
                      {formatMoney(
                        installCost * Math.pow(1.045, projectionYears) -
                          installCost
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-[#022c22] border border-emerald-500 p-6 rounded-2xl">
                    <h3 className="font-black text-white text-sm uppercase mb-2">
                      Solaire
                    </h3>
                    <div className="text-4xl font-black text-emerald-400 mb-1">
                      0 €
                    </div>
                    <div className="text-[10px] text-emerald-600 uppercase">
                      Capital immobilisé
                    </div>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-xl">
                    <div className="text-[10px] text-emerald-400 uppercase mb-1">
                      Écart estimé sur {projectionYears} ans
                    </div>
                    <div className="text-xl font-black text-emerald-400">
                      {formatMoney(calculationResult.totalSavingsProjected)}
                    </div>
                    <div className="text-[9px] text-emerald-300 mt-1">
                      Ordre de grandeur comparable à{" "}
                      {formatMoney(calculationResult.bankEquivalentCapital)}{" "}
                      placé
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-black/40 border border-white/10 p-4 rounded-xl flex items-start gap-3 text-sm text-slate-300">
                <Lightbulb
                  size={20}
                  className="text-yellow-500 flex-shrink-0 mt-0.5"
                />
                <p>
                  Cette comparaison illustre des mécanismes différents :
                  certains scénarios immobilisent un capital, d'autres
                  réorganisent une dépense existante.
                </p>
              </div>
            </div>
          </div>
        </ModuleSection>

        {/* MODULE 14: BILAN TOTAL */}
        <ModuleSection
          id="bilan-total"
          title={`Bilan total sur ${projectionYears} ans`}
          icon={<Scale className="text-slate-400" />}
          defaultOpen={false}
        >
          <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <Scale className="text-slate-400 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Bilan total sur {projectionYears} ans
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Comparatif objectif
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

            <div className="space-y-12">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-300 uppercase">
                    Sans solaire (dépense)
                  </span>
                  <span className="text-4xl font-black text-white">
                    {formatMoney(
                      gouffreMode === "financement"
                        ? calculationResult.totalSpendNoSolar
                        : calculationResult.totalSpendNoSolarCash
                    )}
                  </span>
                </div>
                <div className="h-24 rounded-2xl bg-gradient-to-b from-red-500 to-red-700 shadow-2xl" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-300 uppercase">
                    Avec solaire (investissement)
                  </span>
                  <span className="text-4xl font-black text-white">
                    {formatMoney(
                      gouffreMode === "financement"
                        ? calculationResult.totalSpendSolar
                        : calculationResult.totalSpendSolarCash
                    )}
                  </span>
                </div>

                <div className="relative h-24 rounded-2xl bg-slate-800 overflow-hidden">
                  {(() => {
                    const base =
                      gouffreMode === "financement"
                        ? calculationResult.totalSpendNoSolar
                        : calculationResult.totalSpendNoSolarCash;
                    const value =
                      gouffreMode === "financement"
                        ? calculationResult.totalSpendSolar
                        : calculationResult.totalSpendSolarCash;
                    const width = Math.min(
                      100,
                      Math.max(0, (value / base) * 100)
                    );

                    return (
                      <div
                        className={`h-full ${
                          gouffreMode === "cash"
                            ? "bg-gradient-to-b from-emerald-500 to-emerald-700"
                            : "bg-gradient-to-b from-blue-500 to-blue-700"
                        } transition-all duration-700`}
                        style={{ width: `${width}%` }}
                      />
                    );
                  })()}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <p
                    className={`text-sm italic ${
                      gouffreMode === "cash"
                        ? "text-emerald-400/70"
                        : "text-blue-400/70"
                    }`}
                  >
                    Investissement valorisé sur 25+ ans
                  </p>

                  <div className="bg-black/60 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                    <Coins size={14} className="text-emerald-400" />
                    <span className="text-xs uppercase text-emerald-400">
                      Différence :
                    </span>
                    <span className="text-xl font-black text-emerald-400">
                      {formatMoney(
                        gouffreMode === "financement"
                          ? calculationResult.totalSavingsProjected
                          : calculationResult.totalSavingsProjected
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-black/60 border border-white/10 rounded-xl p-6 flex gap-4">
              <Info size={16} className="text-slate-400 mt-1" />
              <p className="text-slate-400 text-sm leading-relaxed">
                Le scénario{" "}
                <strong className="text-red-400">sans solaire</strong>{" "}
                correspond à une dépense subie. Le scénario{" "}
                <strong className="text-blue-400">avec solaire</strong>{" "}
                transforme cette dépense en actif durable.
              </p>
            </div>
          </div>
        </ModuleSection>

        {/* BOUTON APPEL */}
        <button
          onClick={handleCall}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-7 rounded-3xl uppercase text-sm flex items-center justify-center gap-4 mb-8"
        >
          <Phone size={20} fill="currentColor" />
          Finaliser mon dossier MAINTENANT
        </button>

        {/* COMPTEUR ARGENT GASPILLÉ */}
        <div className="flex items-center gap-3 mb-4">
          <Flame size={20} className="text-orange-400" />
          <span className="text-orange-300 text-xs font-black uppercase tracking-wider">
            Argent perdu depuis l'ouverture
          </span>
        </div>

        <div className="text-center">
          <div className="text-5xl font-black text-red-500 tabular-nums mb-2">
            {formatMoneyPrecise(wastedCash)}
          </div>
          <div className="text-xs text-slate-400 italic">
            Ce compteur ne s'arrêtera jamais tant que vous n'agissez pas
          </div>
        </div>
      </div>

      {/* MENTIONS LÉGALES */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-slate-500" />
          <h3 className="text-xs font-black uppercase text-slate-400">
            Mentions Légales
          </h3>
        </div>
        <div className="text-[9px] text-slate-600 space-y-2 leading-relaxed">
          <p>
            <strong className="text-slate-400">Document confidentiel :</strong>{" "}
            Cette étude est la propriété d'EDF Solutions Solaires. Reproduction
            interdite.
          </p>
          <p>
            <strong className="text-slate-400">Validité :</strong> Tarifs
            valables 7 jours. Aides soumises à conditions.
          </p>
          <p>
            <strong className="text-slate-400">Estimations :</strong> Basées sur
            consommation actuelle et ensoleillement moyen régional.
          </p>
          <p>
            <strong className="text-slate-400">RGPD :</strong> Droit
            d'accès/rectification.
          </p>
          <p className="text-slate-500 font-bold mt-3">
            EDF Solutions Solaires
          </p>
        </div>
      </div>

      {/* ALERTE TENTATIVES DE COPIE */}
      {copyAttempts > 0 && (
        <div className="bg-red-950/40 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-red-200 text-xs font-bold">
            ⚠️ {copyAttempts} tentative(s) de copie détectée(s). Document
            protégé.
          </p>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center pb-8">
        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">
          DOCUMENT SÉCURISÉ EDF SOLUTIONS PRO
        </span>
      </div>
    </div>
  );
}
