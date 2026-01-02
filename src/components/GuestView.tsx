import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
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
} from "lucide-react";

// ⚙️ CONFIGURATION (intégrée)
const STUDY_CONFIG = {
  expirationDays: 7, // 👈 DURÉE D'EXPIRATION (modifiable ici)
  toleranceMarginMs: 5 * 60 * 1000, // 5 minutes
  phoneNumber: "0683623329",
};

export const GuestView: React.FC = () => {
  console.log("🔥 VERSION GUESTVIEW 02/01 17:00 - ALL-IN-ONE");

  const params = useParams<{ studyId: string }>();
  const location = useLocation();

  console.log("📍 URL params:", params);
  console.log("📍 Pathname:", window.location.pathname);

  const studyId = params.studyId;

  if (!studyId || studyId === "METS_UN_VRAI_UUID_ICI") {
    console.error("❌ studyId invalide:", studyId);
  }

  console.log("🔍 studyId utilisé:", studyId);

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

  // ✅ Chargement de l'étude
  useEffect(() => {
    const loadStudy = async () => {
      if (!studyId) {
        console.error("❌ studyId manquant");
        setError("ID d'étude manquant dans l'URL");
        setLoading(false);
        return;
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(studyId)) {
        console.error("❌ Format UUID invalide:", studyId);
        setError("Format d'ID invalide");
        setLoading(false);
        return;
      }

      console.log("✅ studyId validé:", studyId);

      try {
        console.log("🔄 Chargement depuis Supabase...");

        const { data: studyData, error: fetchError } = await supabase
          .from("studies")
          .select("*")
          .eq("id", studyId)
          .maybeSingle();

        console.log("📊 Réponse Supabase:", studyData, fetchError);

        if (fetchError) {
          console.error("❌ Erreur Supabase:", fetchError);
          throw new Error(`Erreur base de données: ${fetchError.message}`);
        }

        if (!studyData) {
          console.error("❌ Étude introuvable:", studyId);
          throw new Error("Étude introuvable - vérifiez le lien");
        }

        console.log("✅ Étude trouvée");

        const now = new Date();
        const expiresAt = new Date(studyData.expires_at);

        console.log("⏰ Vérification expiration:");
        console.log("  - Maintenant:", now.toISOString());
        console.log("  - Expire le:", expiresAt.toISOString());

        const isActuallyExpired =
          now.getTime() > expiresAt.getTime() + STUDY_CONFIG.toleranceMarginMs;

        if (isActuallyExpired) {
          console.warn("⚠️ Étude expirée");
          setIsExpired(true);
          setStudy(studyData);
          setLoading(false);
          return;
        }

        console.log("✅ Étude valide");

        try {
          await supabase
            .from("studies")
            .update({
              opened_at: studyData.opened_at || now.toISOString(),
              last_opened_at: now.toISOString(),
              opened_count: (studyData.opened_count || 0) + 1,
            })
            .eq("id", studyId);
        } catch (statsError) {
          console.warn("⚠️ Erreur stats (ignorée):", statsError);
        }

        if (!studyData.study_data) {
          console.error("❌ study_data manquant");
          throw new Error("Données d'étude corrompues");
        }

        setStudy(studyData);
        setData(studyData.study_data);
        setLoading(false);

        console.log("✅ Chargement terminé");
      } catch (err: any) {
        console.error("❌ ERREUR:", err);
        setError(err.message || "Erreur inconnue");
        setLoading(false);
      }
    };

    loadStudy();
  }, [studyId]);

  // 🔒 PROTECTIONS MAXIMALES
  useEffect(() => {
    // 1. Bloquer clic droit
    const blockContext = (e: MouseEvent) => {
      e.preventDefault();
      setCopyAttempts((prev) => prev + 1);
      return false;
    };
    document.addEventListener("contextmenu", blockContext);

    // 2. Bloquer raccourcis
    const blockKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "p" ||
          e.key === "s" ||
          e.key === "c" ||
          e.key === "u" ||
          (e.shiftKey && (e.key === "i" || e.key === "j" || e.key === "c")))
      ) {
        e.preventDefault();
        e.stopPropagation();
        alert("⚠️ Document protégé. Contactez votre conseiller EDF.");
        return false;
      }

      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener("keydown", blockKeys);

    // 3. Bloquer sélection
    const blockSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener("selectstart", blockSelection);

    // 4. Bloquer glisser-déposer
    const blockDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener("dragstart", blockDragStart);

    // 5. Bloquer copie clipboard
    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyAttempts((prev) => prev + 1);
      alert("⚠️ La copie est désactivée pour ce document protégé.");
      return false;
    };
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);

    // 6. Détecter DevTools
    let devtoolsOpen = false;
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          console.clear();
          alert("⚠️ Les outils de développement sont désactivés.");
        }
      } else {
        devtoolsOpen = false;
      }
    };
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // 7. Empêcher le zoom
    const blockZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener("wheel", blockZoom, { passive: false });

    // 8. Détecter Print Screen
    let lastActiveTime = Date.now();
    const detectPrintScreen = () => {
      const now = Date.now();
      if (now - lastActiveTime > 100 && now - lastActiveTime < 500) {
        setCopyAttempts((prev) => prev + 1);
      }
      lastActiveTime = now;
    };
    window.addEventListener("blur", detectPrintScreen);
    window.addEventListener("focus", () => {
      lastActiveTime = Date.now();
    });

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("selectstart", blockSelection);
      document.removeEventListener("dragstart", blockDragStart);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("wheel", blockZoom);
      window.removeEventListener("blur", detectPrintScreen);
      clearInterval(devToolsInterval);
    };
  }, []);

  // ⏰ Timer countdown
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
      if (remaining === 0) {
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [study?.expires_at]);

  // 💰 Compteur argent gaspillé
  useEffect(() => {
    if (!data?.conso || !data?.elecPrice) return;

    const costPerSecond = (data.conso * data.elecPrice) / 365 / 24 / 3600;

    const interval = setInterval(() => {
      setWastedCash((prev) => prev + costPerSecond);
    }, 100);

    return () => clearInterval(interval);
  }, [data?.conso, data?.elecPrice]);

  // ====== ÉCRANS D'ÉTAT ======

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="text-blue-500 animate-spin mx-auto mb-4"
          />
          <p className="text-white text-xl">Chargement de votre étude...</p>
          <p className="text-slate-400 text-sm mt-2">ID: {studyId}</p>
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
          <div className="bg-black/40 p-3 rounded-lg text-left">
            <p className="text-xs text-slate-400 mb-1">ID d'étude:</p>
            <p className="text-xs text-white font-mono break-all">
              {studyId || "Non fourni"}
            </p>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Contactez votre conseiller pour obtenir un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-red-950/60 border-2 border-red-500/40 rounded-3xl p-8 max-w-md text-center">
          <AlertTriangle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-4">
            ⏰ ÉTUDE EXPIRÉE
          </h2>
          <p className="text-red-200 mb-6">
            Cette étude a expiré le{" "}
            {new Date(study?.expires_at).toLocaleDateString("fr-FR")}.
          </p>
          <p className="text-red-300 text-sm">
            Contactez votre commercial pour obtenir une nouvelle simulation.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
          <p className="text-white text-xl">Données manquantes</p>
        </div>
      </div>
    );
  }

  // ====== DONNÉES SÉCURISÉES ======

  const safeData = {
    n: data.n || data.clientName || "Client",
    e: data.e || 32202,
    a: data.a || 70,
    m: data.m || 139,
    t: data.t || 3.89,
    d: data.d || 180,
    prod: data.prod || data.yearlyProduction || data.production || 7000,
    conso: data.conso || data.yearlyConsumption || data.consumption || 10000,
    selfCons:
      data.selfCons || data.selfConsumptionRate || data.selfConsumption || 70,
    installCost: data.installCost || 18799,
    cashApport: data.cashApport || 0,
    elecPrice:
      data.elecPrice || data.electricityPrice || data.pricePerKwh || 0.25,
    mode: data.mode || "financement",
    exp: data.exp || Date.now() + 7 * 24 * 60 * 60 * 1000,
    installedPower: data.installedPower || data.puissanceInstallee || 3.5,
    projectionYears: data.projectionYears || 20,
    ga:
      data.ga ||
      (data.warrantyMode === "performance"
        ? [
            "🏆 Garantie Performance 30 ans (matériel + production)",
            "Garantie main d'œuvre À VIE",
            "SAV et maintenance inclus",
            "Extension de garantie premium",
          ]
        : [
            "✅ Garantie Essentiel 25 ans (matériel + production)",
            "SAV et maintenance inclus",
          ]),
  };

  const handleCall = () => {
    window.location.href = `tel:${STUDY_CONFIG.phoneNumber}`;
  };

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

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

  const creditDurationMonths = safeData.d;
  const creditMonthlyPayment = safeData.m;
  const insuranceMonthlyPayment = 0;
  const elecInflation = 0.05;

  const generateYearlyDetails = (scenario: "financement" | "cash") => {
    const result = [];
    let cumulativeSavings =
      scenario === "financement" ? -safeData.cashApport : -safeData.installCost;
    const years = safeData.projectionYears || 20;

    for (let year = 1; year <= years; year++) {
      const isCreditActive =
        year <= creditDurationMonths / 12 && scenario === "financement";
      const priceWithInflation =
        safeData.elecPrice * Math.pow(1 + elecInflation, year - 1);
      const edfBillWithoutSolar = safeData.conso * priceWithInflation;
      const creditAmountYearly = isCreditActive
        ? (creditMonthlyPayment + insuranceMonthlyPayment) * 12
        : 0;
      const selfConsumedKwh = (safeData.prod * safeData.selfCons) / 100;
      const savingsInEuros = selfConsumedKwh * priceWithInflation;
      const edfResidue = Math.max(0, edfBillWithoutSolar - savingsInEuros);
      const surplusKwh = safeData.prod - selfConsumedKwh;
      const buybackRate = 0.04;
      const surplusRevenue =
        surplusKwh * buybackRate * Math.pow(1 + elecInflation, year - 1);
      const totalWithSolar = creditAmountYearly + edfResidue - surplusRevenue;
      const yearlyFlow = totalWithSolar - edfBillWithoutSolar;
      cumulativeSavings -= yearlyFlow;

      result.push({
        year,
        edfBillWithoutSolar,
        creditAmountYearly,
        edfResidue,
        totalWithSolar,
        yearlyFlow,
        cumulativeSavings,
      });
    }

    return result;
  };

  const detailsFinancement = generateYearlyDetails("financement");
  const detailsCash = generateYearlyDetails("cash");
  const currentDetails =
    tableScenario === "financement" ? detailsFinancement : detailsCash;

  const generateAmortissement = () => {
    const result = [];
    const monthlyPayment = safeData.m;
    const annualRate = safeData.t / 100;
    const monthlyRate = annualRate / 12;
    let remainingCapital = safeData.installCost - safeData.cashApport;

    for (let month = 1; month <= safeData.d && remainingCapital > 0; month++) {
      const interest = remainingCapital * monthlyRate;
      const principal = Math.min(monthlyPayment - interest, remainingCapital);
      remainingCapital -= principal;

      const isMonth1 = month === 1;
      const isYear1 = month === 12;
      const isYear5 = month === 60;
      const isYear10 = month === 120;
      const isYear15 = month === 180;
      const isLastMonth = month === safeData.d;

      if (
        isMonth1 ||
        isYear1 ||
        isYear5 ||
        isYear10 ||
        isYear15 ||
        isLastMonth
      ) {
        result.push({
          month,
          year: Math.ceil(month / 12),
          payment: monthlyPayment,
          principal,
          interest,
          remaining: Math.max(0, remainingCapital),
        });
      }
    }
    return result;
  };

  const amortissementData = generateAmortissement();

  // 🎨 CSS INTÉGRÉ
  const protectedStyles = `
    * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      -webkit-touch-callout: none !important;
    }
    @media print {
      body { display: none !important; }
      body::before {
        content: "DOCUMENT CONFIDENTIEL - IMPRESSION INTERDITE";
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 120px;
        font-weight: 900;
        color: rgba(255, 0, 0, 0.3);
        z-index: 99999;
      }
    }
  `;

  return (
    <>
      <style>{protectedStyles}</style>
      <div
        className="min-h-screen bg-[#020202] text-white p-4 md:p-6 relative overflow-hidden select-none font-sans"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* 🔒 FILIGRANE ULTRA-VISIBLE */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none flex flex-wrap gap-8 rotate-[-25deg] scale-150 justify-center items-center z-50"
          style={{ mixBlendMode: "overlay" }}
        >
          {Array(200)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="text-[8px] font-black uppercase tracking-widest text-white"
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}
              >
                CONFIDENTIEL EDF • ID: {studyId?.substring(0, 8)}
              </div>
            ))}
        </div>

        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="text-xl font-black italic text-white/20 uppercase tracking-tighter">
            EDF SOLUTIONS
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Lock size={12} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Accès Certifié
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-5xl font-black italic uppercase leading-none tracking-tighter mb-2">
            VOTRE ÉTUDE
            <br />
            SOLAIRE.
          </h1>
          <div className="h-1.5 w-20 bg-blue-600 mb-6" />
          <p className="text-slate-400 text-sm font-medium mb-8 italic uppercase">
            Préparée exclusivement pour{" "}
            <span className="text-white font-black underline underline-offset-4 decoration-blue-500">
              {safeData.n}
            </span>
          </p>

          {/* COMPTE À REBOURS */}
          <div className="bg-gradient-to-br from-red-950/80 via-orange-950/60 to-red-900/40 border-2 border-red-500/50 rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.4)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle
                  className="text-orange-400 animate-pulse"
                  size={20}
                />
                <span className="text-orange-300 text-xs font-black uppercase tracking-wider">
                  Offre Limitée
                </span>
              </div>

              <div className="text-white text-sm font-medium mb-6">
                Cette étude personnalisée expire dans :
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
                    className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-xl p-3 text-center"
                  >
                    <div className="text-3xl font-black text-red-400 tabular-nums">
                      {String(unit.val).padStart(2, "0")}
                    </div>
                    <div className="text-[8px] text-slate-500 uppercase font-bold mt-1">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-red-900/30 border-l-4 border-red-500 p-3 rounded">
                <p className="text-red-200 text-xs font-bold">
                  ⚠️ Après expiration, votre taux bloqué à {safeData.t}% sera
                  perdu définitivement.
                </p>
              </div>
            </div>
          </div>

          {/* GAIN NET */}
          <div className="relative group mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-cyan-600 rounded-[40px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-black border border-white/20 rounded-[40px] p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400/80 italic block mb-2">
                    Gain Net Projeté
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Sur 20 ans
                  </span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <TrendingUp
                    className="text-emerald-400"
                    size={24}
                    strokeWidth={3}
                  />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-6 justify-center">
                <span className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {safeData.e >= 0 ? "+" : ""}
                  {Number(safeData.e).toLocaleString("fr-FR")}€
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <span className="text-emerald-300 text-xs font-black uppercase tracking-widest">
                    {Math.round(
                      ((safeData.prod * safeData.selfCons) /
                        100 /
                        safeData.conso) *
                        100
                    )}
                    % d'autonomie garantie
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INSTALLATION & BUDGET */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 text-center shadow-inner">
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 italic">
                {safeData.mode === "cash"
                  ? "Capital Investi"
                  : "Mensualité Fixe"}
              </span>
              <div className="text-3xl font-black italic">
                {safeData.mode === "cash"
                  ? formatMoney(safeData.installCost)
                  : `${Number(safeData.m).toLocaleString("fr-FR")}€`}
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-6 text-center shadow-inner">
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 italic">
                {safeData.mode === "cash" ? "Point Mort" : "Taux Bloqué"}
              </span>
              <div className="text-3xl font-black text-blue-400 italic">
                {safeData.mode === "cash"
                  ? `${Math.ceil(safeData.installCost / (safeData.e / 20))} ans`
                  : `${safeData.t}%`}
              </div>
            </div>
          </div>

          {/* VOTRE INSTALLATION */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-6 mb-8">
            <h3 className="text-sm font-black uppercase text-blue-400 mb-4">
              Votre Installation
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Puissance
                </div>
                <div className="text-xl font-black text-white">
                  {safeData.installedPower} kWc
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Prix Total
                </div>
                <div className="text-xl font-black text-white">
                  {formatMoney(safeData.installCost)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Production
                </div>
                <div className="text-xl font-black text-white">
                  {safeData.prod.toLocaleString()} kWh/an
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Consommation
                </div>
                <div className="text-xl font-black text-white">
                  {safeData.conso.toLocaleString()} kWh/an
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Autoconsommation
                </div>
                <div className="text-xl font-black text-emerald-400">
                  {safeData.selfCons}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Prix kWh
                </div>
                <div className="text-xl font-black text-white">
                  {safeData.elecPrice.toFixed(2)}€
                </div>
              </div>
            </div>
          </div>

          {/* STRUCTURE BUDGET */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-[32px] p-6 mb-8">
            <h3 className="text-sm font-black uppercase text-blue-400 mb-4">
              Structure de votre Budget
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Mensualité crédit</span>
                  <span className="font-bold text-white">
                    {formatMoney(safeData.m)}
                  </span>
                </div>
                <div className="h-3 bg-black rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${(safeData.m / (safeData.m + 135)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">
                    Facture électricité résiduelle
                  </span>
                  <span className="font-bold text-white">
                    {formatMoney(
                      Math.round(
                        ((safeData.conso -
                          (safeData.prod * safeData.selfCons) / 100) *
                          safeData.elecPrice) /
                          12
                      )
                    )}
                  </span>
                </div>
                <div className="h-3 bg-black rounded-full overflow-hidden flex">
                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${
                        (((safeData.conso -
                          (safeData.prod * safeData.selfCons) / 100) *
                          safeData.elecPrice) /
                          12 /
                          300) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="flex justify-between">
                  <span className="text-white font-bold uppercase text-sm">
                    Total mensuel
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formatMoney(
                      Math.round(
                        safeData.m +
                          ((safeData.conso -
                            (safeData.prod * safeData.selfCons) / 100) *
                            safeData.elecPrice) /
                            12
                      )
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  vs {formatMoney((safeData.conso * safeData.elecPrice) / 12)}{" "}
                  sans solaire
                </p>
              </div>
            </div>
          </div>

          {/* COMPARAISON 20 ANS */}
          <div className="bg-gradient-to-br from-orange-950/60 to-red-950/40 border-2 border-orange-500/40 rounded-[32px] p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>

            <h3 className="text-xl font-black uppercase text-white mb-6 relative z-10">
              🔥 VOTRE SITUATION DANS {safeData.projectionYears} ANS
            </h3>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              {/* SANS SOLAIRE */}
              <div className="bg-red-950/60 border-2 border-red-500/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <X size={16} className="text-red-500" />
                  </div>
                  <span className="text-red-400 font-black text-xs uppercase">
                    Sans Solaire
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] text-red-300 uppercase mb-1">
                    Argent Parti
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-red-500">
                    -
                    {formatMoney(
                      Math.round(
                        safeData.conso *
                          safeData.elecPrice *
                          ((Math.pow(1.05, safeData.projectionYears) - 1) /
                            0.05)
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-red-200">
                  <div className="flex items-center gap-2">
                    <X size={12} className="text-red-500" />
                    Dépendance totale EDF
                  </div>
                  <div className="flex items-center gap-2">
                    <X size={12} className="text-red-500" />
                    0€ de patrimoine créé
                  </div>
                  <div className="flex items-center gap-2">
                    <X size={12} className="text-red-500" />
                    Facture qui augmente chaque année
                  </div>
                </div>
              </div>

              {/* AVEC SOLAIRE */}
              <div className="bg-emerald-950/60 border-2 border-emerald-500/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <span className="text-emerald-400 font-black text-xs uppercase">
                    Avec Solaire
                  </span>
                </div>
                <div className="mb-4">
                  <div className="text-[10px] text-emerald-300 uppercase mb-1">
                    Patrimoine Créé
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-emerald-400">
                    {detailsFinancement[safeData.projectionYears - 1]
                      ?.cumulativeSavings >= 0
                      ? "+"
                      : ""}
                    {formatMoney(
                      Math.round(
                        detailsFinancement[safeData.projectionYears - 1]
                          ?.cumulativeSavings || 0
                      )
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-xs text-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {safeData.selfCons}% d'autonomie énergétique
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Actif transmissible aux enfants
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Revenu garanti 20 ans
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-black/60 backdrop-blur-md border border-orange-500/30 p-4 rounded-xl relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-orange-300 font-bold text-sm uppercase">
                  Écart total :
                </span>
                <span className="text-3xl md:text-4xl font-black text-orange-400">
                  {formatMoney(
                    Math.round(
                      Math.abs(
                        detailsFinancement[safeData.projectionYears - 1]
                          ?.cumulativeSavings || 0
                      ) +
                        safeData.conso *
                          safeData.elecPrice *
                          ((Math.pow(1.05, safeData.projectionYears) - 1) /
                            0.05)
                    )
                  )}
                </span>
              </div>
              <p className="text-orange-200/70 text-xs mt-2">
                💰 Différence entre agir aujourd'hui ou attendre{" "}
                {safeData.projectionYears} ans
              </p>
            </div>
          </div>

          {/* PLAN DE FINANCEMENT */}
          <div className="bg-black/40 backdrop-blur-xl rounded-[32px] p-4 md:p-8 mb-8 border border-white/10 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <Table2 className="text-slate-400 w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                  Plan de Financement Détaillé
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
                <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-white/10">
                  <button
                    onClick={() => setTableScenario("financement")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                      tableScenario === "financement"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    Financement
                  </button>
                  <button
                    onClick={() => setTableScenario("cash")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
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
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                      tableMode === "annuel"
                        ? "bg-slate-700 text-white"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    Annuel
                  </button>
                  <button
                    onClick={() => setTableMode("mensuel")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
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

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] md:text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                    <th className="py-3 px-2 w-[50px]">An</th>
                    <th className="py-3 px-2 text-red-400">Sans</th>
                    <th className="py-3 px-2 text-blue-400">Crédit</th>
                    <th className="py-3 px-2 text-yellow-400">Reste</th>
                    <th className="py-3 px-2 text-white">Total</th>
                    <th className="py-3 px-2 text-slate-300">Effort</th>
                    <th className="py-3 px-2 text-emerald-400 text-right">
                      Cumul
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm font-mono text-slate-300">
                  <tr className="border-b border-white/5 bg-[#1a1505]/30">
                    <td className="py-3 px-2 text-yellow-500 font-bold">
                      An 0
                    </td>
                    <td className="py-3 px-2 opacity-50">-</td>
                    <td className="py-3 px-2 opacity-50">-</td>
                    <td className="py-3 px-2 opacity-50">-</td>
                    <td className="py-3 px-2 text-yellow-400 font-bold text-xs">
                      APPORT
                    </td>
                    <td className="py-3 px-2 text-red-400 font-bold">
                      {formatMoney(
                        tableScenario === "financement"
                          ? safeData.cashApport
                          : safeData.installCost
                      )}
                    </td>
                    <td className="py-3 px-2 text-right text-red-500 font-bold">
                      -
                      {formatMoney(
                        tableScenario === "financement"
                          ? safeData.cashApport
                          : safeData.installCost
                      )}
                    </td>
                  </tr>

                  {currentDetails.map((row) => {
                    const divider = tableMode === "mensuel" ? 12 : 1;
                    const displayNoSolar = row.edfBillWithoutSolar / divider;
                    const displayCredit = row.creditAmountYearly / divider;
                    const displayResidue = row.edfResidue / divider;
                    const displayTotalWithSolar = row.totalWithSolar / divider;
                    const yearlyEffort =
                      row.totalWithSolar - row.edfBillWithoutSolar;
                    const displayEffort = yearlyEffort / divider;

                    return (
                      <tr
                        key={row.year}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-2 text-slate-500">{row.year}</td>
                        <td className="py-3 px-2 text-red-400/80">
                          {formatMoney(displayNoSolar)}
                        </td>
                        <td className="py-3 px-2 text-blue-400/80">
                          {formatMoney(displayCredit)}
                        </td>
                        <td className="py-3 px-2 text-yellow-400/80">
                          {formatMoney(displayResidue)}
                        </td>
                        <td className="py-3 px-2 font-bold text-white">
                          {formatMoney(displayTotalWithSolar)}
                        </td>
                        <td
                          className={`py-3 px-2 font-bold ${
                            displayEffort > 0
                              ? "text-white"
                              : "text-emerald-400"
                          }`}
                        >
                          {displayEffort > 0 ? "+" : ""}
                          {formatMoney(displayEffort)}
                        </td>
                        <td
                          className={`py-3 px-2 text-right font-bold ${
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

          {/* GARANTIES */}
          <div className="bg-gradient-to-br from-blue-950/60 to-indigo-950/40 border border-blue-500/30 rounded-[32px] p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Shield size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-black uppercase text-white">
                🏆 VOS GARANTIES EDF
              </h3>
            </div>

            <div className="space-y-3">
              {safeData.ga.map((garantie: string, index: number) => (
                <div
                  key={index}
                  className="bg-black/40 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3"
                >
                  <CheckCircle2
                    size={20}
                    className="text-blue-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-white text-sm font-medium">
                    {garantie}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TÉMOIGNAGES */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-[32px] p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-emerald-400" size={20} />
              <span className="text-emerald-300 text-xs font-black uppercase">
                Ils ont signé cette semaine
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: "M. et Mme D.",
                  city: "Grasse (06)",
                  date: "Il y a 2 jours",
                },
                {
                  name: "Famille L.",
                  city: "Cannes (06)",
                  date: "Il y a 4 jours",
                },
                { name: "M. R.", city: "Antibes (06)", date: "Il y a 6 jours" },
              ].map((client, i) => (
                <div
                  key={i}
                  className="bg-black/40 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white text-sm font-bold">
                      {client.name}
                    </div>
                    <div className="text-slate-400 text-xs">{client.city}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-bold">
                      {client.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-emerald-900/20 border-l-4 border-emerald-500 p-3 rounded">
              <p className="text-emerald-200 text-xs font-bold">
                ✅ 127 installations signées ce mois-ci dans votre région
              </p>
            </div>
          </div>

          {/* ALERTE TAUX */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4 mb-8">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Calendar size={18} />
            </div>
            <p className="text-[11px] text-orange-200/80 font-bold uppercase italic leading-tight">
              Taux exceptionnel à{" "}
              <span className="text-orange-400">{safeData.t}%</span> valable
              uniquement 7 jours. Après expiration : remontée probable à 4.5%.
            </p>
          </div>

          {/* COMPTEUR ARGENT GASPILLÉ */}
          <div className="bg-gradient-to-br from-orange-950/60 to-red-950/40 border border-orange-500/30 rounded-[32px] p-6 mb-8 shadow-[0_0_40px_rgba(249,115,22,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame size={20} className="text-orange-400" />
              </div>
              <div>
                <div className="text-orange-300 text-xs font-black uppercase">
                  Argent perdu depuis l'ouverture
                </div>
              </div>
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

          {/* BOUTON APPEL */}
          <button
            onClick={handleCall}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-7 rounded-3xl uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/30 mb-4"
          >
            <Phone size={20} fill="currentColor" />
            Finaliser mon dossier MAINTENANT
          </button>

          {/* AVERTISSEMENT */}
          <div className="bg-red-950/20 border-l-4 border-red-500 p-4 rounded mb-8">
            <p className="text-red-200 text-sm font-bold">
              ⚠️ Ne laissez pas passer cette opportunité. Chaque jour qui passe
              vous coûte{" "}
              {formatMoneyPrecise((safeData.conso * safeData.elecPrice) / 365)}.
            </p>
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
                <strong className="text-slate-400">
                  Document confidentiel :
                </strong>{" "}
                Cette étude est la propriété d'EDF Solutions Solaires.
                Reproduction interdite (Art. L. 335-2 Code PI).
              </p>
              <p>
                <strong className="text-slate-400">Validité :</strong> Tarifs
                valables jusqu'au{" "}
                {new Date(safeData.exp).toLocaleDateString("fr-FR")} 23h59.
                Aides soumises à conditions.
              </p>
              <p>
                <strong className="text-slate-400">Estimations :</strong> Basées
                sur consommation actuelle et ensoleillement moyen régional.
                Performances réelles variables.
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
      </div>
    </>
  );
};
