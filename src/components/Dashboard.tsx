
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSystemBrain } from "@/brain/useSystemBrain";
import { Metrics, DashboardFilters, Study, EmailLead } from "@/brain/types";
import { calculateSystemMetrics } from "@/brain/intelligence/stats";
import { buildSystemBrain } from "@/brain/Engine";

// ✅ CORE COMPONENTS
// ✅ TERRITORIES
import { CockpitScreen } from "./territories/Cockpit/CockpitScreen";
import { WarRoomScreen } from "./territories/WarRoom/WarRoomScreen";
import { PilotageScreen } from "./territories/Pilotage/PilotageScreen";
import { SalesActivityScreen } from "./territories/Sales/SalesActivityScreen";
import { LeadsAndROIScreen } from "./territories/Sales/LeadsAndROIScreen";
import { RegistryView } from "./territories/Registries/RegistryView";
import { SystemView } from "./territories/System/SystemView";

// ✅ CORE / SHARED UI
import { Header } from "./shared/Layout/Header";
import { LoadingScreen } from "./dashboard/LoadingScreen";
import { OverrideModal } from "./shared/ui/OverrideModal";
import { CriticalAlert } from "./territories/WarRoom/ExecutionDesk";

export default function Dashboard() {
  const {
    // State
    studies,
    emailLeads: leads,
    logs,
    metrics,
    financialStats,
    loading,
    loadingProgress,
    loadingStep,
    error,
    trafficData,
    emailFlowByClient,
    antiAnnulationByStudy,
    postRefusByStudy,
    
    // Actions are nested in hook return
    actions: {
      refresh,
      signStudy,
      cancelStudy,
      deleteStudy,
      markDepositPaid,
      markRibSent,
      deleteLeadPermanently: deleteLead,
      setOptOut,
      logForceAction
    }
  } = useSystemBrain();

  // ============================================
  // UI STATE (View-only state)
  // ============================================
  const [activeSection, setActiveSection] = useState<"dashboard" | "cockpit" | "leads" | "war_room" | "pilotage" | "registry" | "sales" | "roi">("cockpit");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [filters, setFilters] = useState<DashboardFilters>({
    search: "",
    views: null,
    clicks: null,
    status: null,
    optout: false,
  });

  const [zenMode, setZenMode] = useState(false);
  const [priorityMode, setPriorityMode] = useState(false);
  
  // Strategic Charts State (Legacy - can stay or move to Pilotage if needed)
  const [activeChartTab, setActiveChartTab] = useState("performance");

  // Modal State
  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    title: string;
    message?: string;
    studyName?: string;
    actionType?: "force_sign" | "delete" | "override";
    onConfirm: (reason: string) => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    onConfirm: async () => {},
  });

  // Main refresh handler
  const handleRefresh = useCallback(() => {
    refresh();
    setLastRefresh(new Date());
  }, [refresh]);

  const systemMetrics = useMemo(() => calculateSystemMetrics(studies, leads, metrics), [studies, leads, metrics]);



  // ============================================
  // EFFECTS & NAVIGATION LOGIC
  // ============================================
  
  // No longer forcing section switch on urgency to let user navigate freely

  // Scroll to War Room helper (Legacy - keeping for compatibility if referenced)
  const scrollToWarRoom = useCallback(() => {
    setActiveSection("war_room");
  }, []);

  // ============================================
  // HANDLERS (Proxy to brain actions with UI confirmation)
  // ============================================
  
  const handleOverrideCancel = () => {
    setOverrideModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSignStudy = async (id: string, name: string) => {
    setOverrideModal({
      isOpen: true,
      title: "Forcer la signature ?",
      message: "Cette action va contourner les vérifications automatiques.",
      studyName: name,
      actionType: "force_sign",
      onConfirm: async (reason) => {
        await signStudy(id, name); // Adjusted signature
        setOverrideModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCancelStudy = async (id: string, name: string) => {
    setOverrideModal({
      isOpen: true,
      title: "Confirmer l'annulation",
      message: "Le dossier sera marqué comme annulé. Irréversible.",
      studyName: name,
      actionType: "delete",
      onConfirm: async (reason) => {
        await cancelStudy(id, name, reason); // ✅ Pass Reason to Brain
        setOverrideModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteStudy = async (id: string, name: string) => {
    setOverrideModal({
      isOpen: true,
      title: "Supprimer définitivement ?",
      message: "Toutes les données associées seront perdues.",
      studyName: name,
      actionType: "delete",
      onConfirm: async (reason) => {
        await deleteStudy(id, name);
        setOverrideModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleMarkDepositPaid = async (id: string, name: string) => {
     await markDepositPaid(id, name);
  };

  const handleMarkRibSent = async (id: string, name: string) => {
      await markRibSent(id, name);
  };
  
  const handleSetOptOut = async (email: string) => {
    await setOptOut(email);
  };
  
  const handleDeleteLead = async (clientId: string, email: string, name: string) => {
      await deleteLead(clientId, email, name);
  };

  const handleStatClick = (type: string) => {
      // Simple switch to chart tab or filter
      if (type === 'signatures') setActiveChartTab('performance');
      if (type === 'revenue') setActiveChartTab('revenue');
  };

  // ============================================
  // RENDER
  // ============================================



  // ============================================
  // GLOBAL DATE FILTER (NEW 🔥)
  // ============================================
  const [globalDateFilter, setGlobalDateFilter] = useState<'current_month' | 'all_time'>('current_month');

  // Filter Logic wrapped in useMemo to prevent unnecessary rebuilds
  const { filteredStudies, filteredLeads, filteredMetrics, filteredFinancialStats } = useMemo(() => {
    // 1. Pass-through if "all_time"
    if (globalDateFilter === 'all_time') {
      return { 
        filteredStudies: studies, 
        filteredLeads: leads, 
        filteredMetrics: metrics, 
        filteredFinancialStats: financialStats 
      };
    }

    // 2. Filter for "current_month"
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isCurrentMonth = (dateStr?: string | null) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    // Filter Studies (Created OR Signed OR Paid in current month - Activity based)
    // STRICT REQUEST: "Dossiers du mois en cours" => Created At OR Signed At to capture new business closed this month from old leads.
    const fStudies = studies.filter(s => 
      isCurrentMonth(s.created_at) || 
      (s.signed_at && isCurrentMonth(s.signed_at)) || 
      (s.deposit_paid_at && isCurrentMonth(s.deposit_paid_at))
    );

    // Filter Leads (Created this month)
    const fLeads = leads.filter(l => isCurrentMonth(l.created_at));

    // 3. Re-calculate Brain (Metrics & Financials)
    // We import buildSystemBrain to get consistent stats
    const newBrain = buildSystemBrain(fStudies);

    return {
      filteredStudies: fStudies,
      filteredLeads: fLeads,
      filteredMetrics: newBrain,
      filteredFinancialStats: newBrain.financialStats
    };
  }, [studies, leads, metrics, financialStats, globalDateFilter]);


  // ✅ CORRECTION MAJEURE :
  // 1. On utilise useMemo pour ne pas recalculer à chaque milliseconde (Performance)
  // 2. On connecte les VRAIS agents via 'actions'
  // 3. On passe les DONNÉES FILTRÉES au système
  const systemSnapshot = useMemo(() => ({
      studies: filteredStudies, 
      emailLeads: filteredLeads, 
      logs, 
      metrics: filteredMetrics, 
      financialStats: filteredFinancialStats, 
      loading, 
      systemInitialized: true,
      loadingProgress: 100, 
      loadingStep: "Ready", 
      error: null,
      emailFlowByClient, 
      antiAnnulationByStudy, 
      postRefusByStudy, 
      trafficData, // Traffic data is complex to filter day-by-day, keeping as is for trend context or TODO: filter trafficData needs deep dive
      zenMode, 
      setActiveSection, 
      
      actions: { 
        refresh, 
        // 🔒 UTILISATION DES HANDLERS SÉCURISÉS (Avec Modales)
        signStudy: handleSignStudy, 
        cancelStudy: handleCancelStudy, 
        deleteStudy: handleDeleteStudy,
        
        // Actions directes
        markDepositPaid: handleMarkDepositPaid, 
        markRibSent: handleMarkRibSent, 
        setOptOut: handleSetOptOut, 
        deleteLeadPermanently: handleDeleteLead, 
        
        // 🧠 CONNEXION AGENTS : On passe la vraie fonction, pas une fonction vide !
        // @ts-ignore
        logForceAction: logForceAction || (async (id, action) => console.warn(`Agent Log System inactive: ${action} on ${id}`)), 
        
        // Si cette fonction manque dans useSystemBrain, on met un placeholder propre
        updateStudyStatus: async () => console.warn("Update Study Status: Not connected to Agent yet") 
      }
  }), [
    // Dépendances critiques pour le re-render
    filteredStudies, filteredLeads, logs, filteredMetrics, filteredFinancialStats, loading, 
    emailFlowByClient, antiAnnulationByStudy, postRefusByStudy, trafficData, 
    zenMode, refresh, logForceAction
  ]);

  if (loading) return <LoadingScreen progress={loadingProgress} step={loadingStep} />;
  
  if (error) return <div className="text-red-500 p-10 text-center text-xl font-bold bg-slate-900 h-screen flex items-center justify-center">🛑 {error}</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* GLOBAL MODALS */}
      <OverrideModal
        isOpen={overrideModal.isOpen}
        title={overrideModal.title}
        message={overrideModal.message}
        studyName={overrideModal.studyName}
        actionType={overrideModal.actionType}
        onConfirm={overrideModal.onConfirm}
        onCancel={handleOverrideCancel}
      />

      <Header 
        zenMode={zenMode}
        priorityMode={priorityMode}
        onToggleZenMode={() => setZenMode(!zenMode)}
        onTogglePriorityMode={() => setPriorityMode(!priorityMode)}
        onRefresh={handleRefresh}
        lastRefresh={lastRefresh}
        systemStatus={metrics?.systemState === 'stable' ? 'normal' : metrics?.systemState as any}
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        unsubscribedCount={systemMetrics.unsubscribedCount}
        unsubscribeRate={systemMetrics.unsubscribeRate}
        totalStudies={systemMetrics.totalStudies}
        totalClients={systemMetrics.totalStudies}
        signedClients={systemMetrics.signedStudies}
        globalDateFilter={globalDateFilter}
        onSetDateFilter={setGlobalDateFilter}
      />

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-12 mt-20">
        
        {/* ALERTES CRITIQUES - In-flow below Header */}
        
        {/* ALERTES CRITIQUES - In-flow below Header */}
        {/* Redondance supprimée selon Audit UX - L'alerte est gérée dans le CockpitView ou ExecutionDesk */}
        
        {/* TERRITORIES ROUTING */}
        {activeSection === "cockpit" && <CockpitScreen system={systemSnapshot} />}
        {activeSection === "war_room" && <WarRoomScreen system={systemSnapshot} />}
        {activeSection === "pilotage" && <PilotageScreen system={systemSnapshot} />}
        {activeSection === "sales" && <SalesActivityScreen system={systemSnapshot} />}
        {activeSection === "roi" && <LeadsAndROIScreen system={systemSnapshot} />}
        {activeSection === "registry" && <RegistryView system={systemSnapshot} />}
        {(activeSection as string) === "system" && <SystemView system={systemSnapshot} />}
        
        {/* FALLBACK DASHBOARD (LEGACY) */}
        {activeSection === "dashboard" && (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-500">Le Monolithe a été démantelé.</h2>
                <p className="text-slate-600 mt-2">Veuillez utiliser le Cockpit comme point d'entrée.</p>
                <button 
                    onClick={() => setActiveSection("cockpit")}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
                >
                    Retour au Cockpit
                </button>
            </div>
        )}

      </main>
    </div>
  );
}
