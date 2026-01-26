import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck as LucideShieldCheck,
  Activity as LucideActivity,
  AlertTriangle as LucideAlertTriangle,
  CreditCard as LucideCreditCard,
} from "lucide-react";

import {
  buildSystemBrain,
} from "@/brain/Engine";
import { 
  Metrics, 
  FinancialStats,
  Client,
  Study,
  StudyData,
  EmailLead,
  DecisionLog,
  EmailQueue,
  EmailFlow,
  WarRoomStudy,
  TensionMetrics,
  DashboardFilters,
  LeadFilters
} from "@/brain/types";
import { 
  mapStudyToDisplay, 
  mapEmailLeadToDisplay, 
  getBehavioralState, 
  getLeadTemperature 
} from "@/brain/signals/mappers";

import { computeCancellationRisk } from "@/brain/intelligence/cancellation";
import { Header } from "./dashboard/Header";
import { LoadingScreen } from "./dashboard/LoadingScreen";
import { StrategicCharts } from "./StrategicCharts";
import { MonthlyRevenueChart } from "./MonthlyRevenueChart";
import { SteeringCharts } from "./dashboard/SteeringCharts";

// ============================================
// CONFIGURATION SUPABASE
// ============================================
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
import { supabase } from "../lib/supabase";
// ============================================
// TYPES BASE DE DONNÉES (STRUCTURES AUGMENTÉES)
// ============================================



// ============================================
// CONSTANTES
// ============================================
export const STATUS_LABELS = {
  draft: "DRAFT",
  sent: "SENT",
  signed: "SIGNED",
  cancelled: "CANCELLED",
} as const;
// ✅ TEMP_LABELS (INSTITUTIONAL)
export const TEMP_LABELS = {
  cold: {
    label: "FROID",
    class: "bg-slate-800/50 text-slate-500 border border-slate-700/50",
  },
  warm: {
    label: "TIÈDE",
    class: "bg-blue-900/10 text-blue-300/80 border border-blue-800/30",
  },
  hot: {
    label: "CHAUD",
    class: "bg-amber-900/10 text-amber-300/80 border border-amber-800/30",
  },
  signed: {
    label: "SIGNÉ",
    class: "bg-emerald-900/10 text-emerald-300/80 border border-emerald-800/30",
  },
} as const;
// ✅ NOUVEAUX LABELS COMPORTEMENTAUX (PREMIUM NEON)
// ✅ NOUVEAUX LABELS COMPORTEMENTAUX (INSTITUTIONAL)
export const BEHAVIORAL_LABELS = {
  MUET: {
    label: "SILENCE",
    class:
      "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50",
    description: "Client inactif",
  },
  CAS_LIMITE: {
    label: "CONTACT EXCESSIF",
    class:
      "bg-amber-900/20 text-amber-200/80 border border-amber-800/30",
    description: "Sur-engagement",
  },
  AGITÉ: {
    label: "AGITÉ",
    class:
      "bg-orange-900/20 text-orange-200/80 border border-orange-800/30",
    description: "Risque annulation",
  },
  INTÉRESSÉ: {
    label: "INTÉRESSÉ",
    class:
      "bg-emerald-900/20 text-emerald-200/80 border border-emerald-800/30",
    description: "Opportunité",
  },
  STABLE: {
    label: "STABLE",
    class: "bg-zinc-900 text-zinc-500 border border-zinc-800",
    description: "Sous surveillance",
  },
  FATIGUE: {
    label: "INACTIF",
    class: "bg-red-900/10 text-red-300 border border-red-900/20",
    description: "Lead dormant",
  },
} as const;
// ============================================
// UTILITAIRES - CALCUL MÉTRIQUES AUGMENTÉ
// ============================================

// ============================================
// UTILITAIRES - FORMATAGE & DATES
// ============================================
export function getTimeSince(date: string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  const interval = seconds / 3600;
  if (interval > 24) return `ACTIF IL Y A ${Math.floor(interval / 24)}J`;
  if (interval >= 1) return `ACTIF IL Y A ${Math.floor(interval)}H`;
  return `ACTIF IL Y A ${Math.floor(seconds / 60)}MIN`;
}
export function getTimeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
  return new Date(date).toLocaleDateString("fr-FR");
}
export function getDaysSince(date: string): number {
  return Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 86400000
  );
}
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR") + " €";
}
export function formatPercentage(value: number): string {
  return Math.round(value) + "%";
}
// ============================================
// UTILITAIRES - DÉTECTION TEMPÉRATURE LEAD
// ============================================
// ============================================
// UTILITAIRES - DÉTECTION RISQUES WAR ROOM
// ============================================
export function getRiskLabel(risk: string): string {
  const labels: Record<string, string> = {
    muet: "🧊 SILENCE — client inactif",
    agité: "🔥 RUMINATION — risque d'annulation",
    interesse: "🟢 INTÉRÊT ACTIF — opportunité",
    stable: "⚪ STABLE — surveillance",
  };
  return labels[risk] || labels.stable;
}
// ✅ LECTURE SUPABASE : Acompte requis
export function requiresDeposit(study: Study): boolean {
  // ✅ Lire directement has_deposit de Supabase
  return study.has_deposit === true && !study.deposit_paid;
}
// ✅ NOUVEAU : Calcul retard acompte
export function isDepositLate(study: Study): boolean {
  if (!study.signed_at || study.status !== "signed") return false;
  if (study.deposit_paid) return false;
  if (!requiresDeposit(study)) return false;
  const signedDate = new Date(study.signed_at);
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - signedDate.getTime()) / 86400000
  );
  return diffDays > 0;
}
// ============================================
// UTILITAIRES - CALCUL PROCHAINE RELANCE EMAIL
// ============================================
export function getNextFollowup(lead: {
  created_at: string;
  last_email_sent: string | null;
}): string {
  if (!lead.last_email_sent) return "Immédiat";
  const created = new Date(lead.created_at);
  const lastSent = new Date(lead.last_email_sent);
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - created.getTime()) / 86400000
  );

  if (daysSinceCreation > 120) return "Terminé";

  // Intervalle : 3 jours (si < 2 mois) ou 7 jours (si > 2 mois)
  const interval = daysSinceCreation <= 60 ? 3 : 7;

  const next = new Date(lastSent);
  next.setDate(next.getDate() + interval);

  return next.toLocaleDateString("fr-FR");
}
// ============================================
// UTILITAIRES - SÉCURITÉ
// ============================================
export function escapeHtml(text: string): string {
  if (typeof window === "undefined") return text;
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
// ============================================
// UTILITAIRES - DÉTECTION ANOMALIES
// ============================================


// ============================================
// HOOK useDashboard - GESTION COMPLÈTE DES DONNÉES
// ============================================
export function useDashboard() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [emailLeads, setEmailLeads] = useState<EmailLead[]>([]);
  const [logs, setLogs] = useState<DecisionLog[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(
    null
  ); // ✅ NOUVEAU
  const [systemInitialized, setSystemInitialized] = useState(false); // ✅ NOUVEAU
  const [error, setError] = useState<string | null>(null);
  // États avancés pour email automation
  const [emailFlowByClient, setEmailFlowByClient] = useState<
    Record<string, any>
  >({});

  ({});
  const [antiAnnulationByStudy, setAntiAnnulationByStudy] = useState<
    Record<string, any>
  >({});
  const [postRefusByStudy, setPostRefusByStudy] = useState<Record<string, any>>(
    {}
  );

  // ✅ NOUVEAU : État pour le système de progression
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("");
  // ============================================
  // ✅ NOUVEAU : ANIMATION DE CHARGEMENT PREMIUM
  // ============================================
  const initializeSystem = useCallback(async () => {
    if (systemInitialized) return;
    const steps = [
      { progress: 15, text: "Connexion Supabase...", duration: 600 },
      { progress: 35, text: "Chargement dossiers...", duration: 800 },
      { progress: 60, text: "Analyse métriques...", duration: 700 },
      { progress: 85, text: "Calcul risques...", duration: 600 },
      { progress: 100, text: "Système prêt !", duration: 500 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await new Promise((resolve) => setTimeout(resolve, step.duration));

      setLoadingProgress(step.progress);
      setLoadingStep(step.text);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    setSystemInitialized(true);
  }, [systemInitialized]);
  // ============================================
  // CHARGEMENT DONNÉES PRINCIPALES AUGMENTÉ
  // ============================================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Charger études avec clients
      const { data: studiesData, error: studiesError } = await supabase.from(
        "studies"
      ).select(`
            id,
            client_id,
            status,
            created_at,
            signed_at,
            study_data,
            deposit_amount,
            deposit_paid,
            deposit_paid_at,
            has_deposit,
            payment_type,
            payment_mode,
            cash_apport,
            total_price: install_cost,
            financing_mode,
            contract_secured,
            cancellation_deadline,
            clients (
              id,
              first_name,
              last_name,
              email,
              phone,
              email_optout
            )
          `);

      console.log("🧬 RAW STUDIES FROM DB:", studiesData);

      if (studiesError) throw studiesError;

      // 2️⃣ Charger stats d'activité - DIRECT depuis tracking_events
      let stats: any[] = [];

      // ✅ MÉTHODE DIRECTE : Agréger depuis tracking_events (le plus fiable)
      const { data: events } = await supabase
        .from("tracking_events")
        .select("study_id, event_type, created_at");

      if (events && events.length > 0) {
        // Agréger manuellement
        const statsMap = new Map<string, any>();

        events.forEach((event) => {
          if (!event.study_id) return;
          if (!statsMap.has(event.study_id)) {
            statsMap.set(event.study_id, {
              id: event.study_id,
              email_opens: 0,
              interactions: 0,
              last_open_at: null,
              last_click_at: null,
            });
          }

          const stat = statsMap.get(event.study_id)!;

          if (
            event.event_type === "email_open" ||
            event.event_type === "view"
          ) {
            stat.email_opens++;
            if (!stat.last_open_at || event.created_at > stat.last_open_at) {
              stat.last_open_at = event.created_at;
            }
          } else if (
            event.event_type === "email_click" ||
            event.event_type === "click"
          ) {
            stat.interactions++;
            if (!stat.last_click_at || event.created_at > stat.last_click_at) {
              stat.last_click_at = event.created_at;
            }
          }
        });

        stats = Array.from(statsMap.values());
        console.log("✅ Stats calculés depuis tracking_events:", stats.length);
      } else {
        console.warn("⚠️ Aucun événement dans tracking_events");
      }

      // ✅ FALLBACK : Créer des stats vides pour tous les studies
      const studyIds = new Set(studiesData?.map((s) => s.id) || []);
      studyIds.forEach((id) => {
        const existing = stats.find((s) => s.id === id);
        if (!existing) {
          stats.push({
            id,
            email_opens: 0,
            interactions: 0,
            last_open_at: null,
            last_click_at: null,
          });
        }
      });

      console.log("📊 STATS FINAL:", stats.length, "entries");

      // 3️⃣ Charger logs de décisions
      const { data: logsData, error: logsError } = await supabase
        .from("decision_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!logsError) setLogs(logsData || []);

      // 4️⃣ Charger queue emails
      const { data: queueData, error: queueError } = await supabase
        .from("email_queue")
        .select(
          "study_id, client_id, email_type, status, sent_at, scheduled_for"
        );

      if (queueError) {
        console.error("❌ ERREUR EMAIL QUEUE:", queueError);
        setAntiAnnulationByStudy({});
        return; // Arrêter ici si erreur
      }

      console.log("📧 EMAIL QUEUE CHARGÉ:", queueData?.length, "emails");

      const queueEmails = queueData || [];

      // ✅ 4.5️⃣ Créer mapping client_id -> study_id
      const studyIdByClientId: Record<string, string> = {};
      (studiesData || []).forEach((s) => {
        if (s.client_id) studyIdByClientId[s.client_id] = s.id;
      });

      // ✅ NOUVEAU : Charger TOUS les tracking events
      const allStudyIds = Array.from(
        new Set([
          ...queueEmails.map((e) => e.study_id).filter(Boolean),
          ...Object.values(studyIdByClientId),
        ])
      );

      const { data: trackingData } = await supabase
        .from("tracking_events")
        .select("study_id, event_type, created_at")
        .in("study_id", allStudyIds);

      console.log(
        "📧 TRACKING EVENTS CHARGÉS:",
        trackingData?.length,
        "events"
      );

      // ✅ Créer un index des ouvertures par study_id
      const trackingByStudy: Record<
        string,
        { last_open?: string; last_click?: string; total_opens: number }
      > = {};
      (trackingData || []).forEach((event) => {
        if (!trackingByStudy[event.study_id]) {
          trackingByStudy[event.study_id] = { total_opens: 0 };
        }

        if (event.event_type === "email_open") {
          trackingByStudy[event.study_id].total_opens++; // ✅ COMPTEUR
          const existing = trackingByStudy[event.study_id].last_open;
          if (!existing || event.created_at > existing) {
            trackingByStudy[event.study_id].last_open = event.created_at;
          }
        }

        if (event.event_type === "email_click") {
          const existing = trackingByStudy[event.study_id].last_click;
          if (!existing || event.created_at > existing) {
            trackingByStudy[event.study_id].last_click = event.created_at;
          }
        }
      });

      console.log("📊 TRACKING INDEX:", {
        studies_with_opens: Object.keys(trackingByStudy).filter(
          (id) => trackingByStudy[id].last_open
        ).length,
        studies_with_clicks: Object.keys(trackingByStudy).filter(
          (id) => trackingByStudy[id].last_click
        ).length,
        robin_kaiser_id: "ca0e3619-2622-469a-808c-bcac549b60cc",
        robin_kaiser_tracking:
          trackingByStudy["ca0e3619-2622-469a-808c-bcac549b60cc"],
      });

      // 5️⃣ & 6️⃣ REFORTE INDEXATION EMAILS UNIFIÉE (Catch-all)
      const antiAnnulation: Record<string, any> = {};
      const postRefus: Record<string, any> = {};

      queueEmails.forEach((e) => {
        const sId = e.study_id || (e.client_id ? studyIdByClientId[e.client_id] : null);
        if (!sId) return;

        const enrichedEmail = {
          ...e,
          opened_at: trackingByStudy[sId]?.last_open || null,
          clicked_at: trackingByStudy[sId]?.last_click || null,
        };

        // Classification large : Si c'est de la relance/prospection -> postRefus, sinon -> antiAnnulation
        const isPostRefusType = 
            e.email_type?.startsWith("post_refus") || 
            e.email_type?.includes("relance") || 
            e.email_type?.includes("prospecting") ||
            e.email_type?.includes("lead");

        const targetMap = isPostRefusType ? postRefus : antiAnnulation;

        if (!targetMap[sId]) {
          targetMap[sId] = { 
            sent: [], 
            next: null, 
            total_opens: trackingByStudy[sId]?.total_opens || 0 
          };
        }
        
        const isSent = ["sent", "SUCCESS", "success", "delivered", "processed"].includes(e.status?.toLowerCase() || "");
        const isPending = ["pending", "scheduled", "PENDING"].includes(e.status || "");
        
        if (isSent) {
          targetMap[sId].sent.push(enrichedEmail);
        } else if (isPending) {
          const current = targetMap[sId].next;
          if (!current || new Date(e.scheduled_for!) < new Date(current.scheduled_for!)) {
            targetMap[sId].next = enrichedEmail;
          }
        }

        // Assurer le lookup par les deux IDs
        if (e.client_id) {
          targetMap[String(e.client_id)] = targetMap[sId];
        }
      });

      // Trier les emails envoyés par date pour tous les flows
      [antiAnnulation, postRefus].forEach(map => {
        Object.keys(map).forEach(id => {
          map[id].sent.sort((a: any, b: any) => 
            new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
          );
        });
      });

      setAntiAnnulationByStudy(antiAnnulation);
      setPostRefusByStudy(postRefus);

      console.log("📧 INDEXATION UNIFIÉE TERMINÉE:", {
        antiAnnulCount: Object.keys(antiAnnulation).length,
        postRefusCount: Object.keys(postRefus).length,
        guyotId: (studiesData || []).find(s => {
            const client = Array.isArray(s.clients) ? s.clients[0] : s.clients;
            return client?.last_name?.toUpperCase().includes("GUYOT");
        })?.id
      });

      // 🎯 DEBUG SPÉCIFIQUE GUYOT
      const guyotRaw = (studiesData || []).find(s => {
          const client = Array.isArray(s.clients) ? s.clients[0] : s.clients;
          return client?.last_name?.toUpperCase().includes("GUYOT");
      });
      if (guyotRaw) {
          const gId = guyotRaw.id;
          const gClientId = String((guyotRaw as any).client_id);
          console.log("🎯 RAW GUYOT DATA:", {
              id: gId,
              clientId: gClientId,
              status: guyotRaw.status,
              views: (guyotRaw as any).views,
              antiAnnul: antiAnnulation[gId] || antiAnnulation[gClientId] ? "FOUND" : "MISSING",
              postRefus: postRefus[gId] || postRefus[gClientId] ? "FOUND" : "MISSING",
              antiAnnulSent: (antiAnnulation[gId] || antiAnnulation[gClientId])?.sent?.length || 0,
              postRefusSent: (postRefus[gId] || postRefus[gClientId])?.sent?.length || 0
          });
      }


      // 7️⃣ Mapper études avec stats augmentés
      const mappedStudies: Study[] = (studiesData || []).map((s) => {
        const mapped = mapStudyToDisplay(s, stats, antiAnnulation, postRefus);
        
        // FORCER GUYOT EN SIGNÉ POUR TEST (Axe A)
        if (mapped.name?.toUpperCase().includes("GUYOT")) {
          mapped.status = "signed";
          console.log("🎯 GUYOT FORCÉ EN AXE A (SIGNÉ)");
        }
        
        return mapped;
      });

      setStudies(mappedStudies);

      console.log("🏁 CHARGEMENT DASHBOARD TERMINÉ:", {
        total: mappedStudies.length,
        guyotFound: mappedStudies.some(s => s.name?.toUpperCase().includes("GUYOT"))
      });

      // 🧠 9️⃣ UTILISER LE CERVEAU
      const brain = buildSystemBrain(mappedStudies);

      setMetrics(brain);
      setFinancialStats(brain.financialStats);
    } catch (err: any) {
      console.error("❌ Erreur chargement données:", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);
  // ============================================
  // CHARGEMENT EMAIL LEADS
  // ============================================
  const loadEmailLeads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("email_leads")
        .select(
          `
          id, client_id, created_at, last_email_sent_at, next_email_scheduled_at,
          email_step, total_opens, total_clicks, last_opened_at, last_clicked_at,
          clients!inner(id, first_name, last_name, email, email_optout)
        `
        )
        .order("next_email_scheduled_at", { ascending: true });

      if (error) throw error;

      const clientIds = data.map((l) => l.client_id).filter(Boolean);

      // Récupérer study_id par client_id
      const { data: studiesData } = await supabase
        .from("studies")
        .select("id, client_id")
        .in("client_id", clientIds);

      const studyIdByClientId: Record<string, string> = {};
      (studiesData || []).forEach((s) => {
        if (s.client_id) studyIdByClientId[s.client_id] = s.id;
      });

      const studyIds = Object.values(studyIdByClientId).filter(Boolean);

      let lastOpenByStudyId: Record<string, string> = {};
      let lastClickByStudyId: Record<string, string> = {};

      // Charger tracking_events pour dates précises
      if (studyIds.length > 0) {
        const { data: openEvents } = await supabase
          .from("tracking_events")
          .select("study_id, created_at")
          .in("study_id", studyIds)
          .eq("event_type", "email_open")
          .order("created_at", { ascending: false });

        (openEvents || []).forEach((event) => {
          if (!lastOpenByStudyId[event.study_id]) {
            lastOpenByStudyId[event.study_id] = event.created_at;
          }
        });

        const { data: clickEvents } = await supabase
          .from("tracking_events")
          .select("study_id, created_at")
          .in("study_id", studyIds)
          .eq("event_type", "email_click")
          .order("created_at", { ascending: false });

        (clickEvents || []).forEach((event) => {
          if (!lastClickByStudyId[event.study_id]) {
            lastClickByStudyId[event.study_id] = event.created_at;
          }
        });
      }

      // Mapper leads (utilise la fonction déjà définie dans ton fichier)
      const mappedLeads: EmailLead[] = (data || []).map((l) =>
        mapEmailLeadToDisplay(
          l,
          studyIdByClientId,
          lastOpenByStudyId,
          lastClickByStudyId
        )
      );

      setEmailLeads(mappedLeads);

      // Indexer email flow par client
      const flowByClient: Record<string, any> = {};
      mappedLeads.forEach((l) => {
        flowByClient[l.client_id] = {
          step: l.email_sequence_step,
          last: l.last_email_sent,
          next: l.next_email_date,
          opens: l.total_opens,
          clicks: l.total_clicks,
          opted_out: l.opted_out,
        };
      });
      setEmailFlowByClient(flowByClient);
    } catch (err: any) {
      console.error("❌ Erreur chargement email leads:", err);
    }
  }, []);
  // ============================================
  // ACTIONS - GESTION ÉTUDES
  // ============================================
  const updateStudyStatus = useCallback(
    async (
      id: string,
      status: string,
      name: string,
      reason: string = "Manuel"
    ) => {
      const { error } = await supabase
        .from("studies")
        .update({
          status,
          signed_at: status === "signed" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (!error) {
        await supabase.from("decision_logs").insert({
          study_id: id,
          client_name: name,
          action_performed: `STATUS_CHANGE_${status.toUpperCase()}`,
          justification: reason,
        });
        loadData();
      }
    },
    [loadData]
  );
  const signStudy = useCallback(
    async (
      id: string,
      name: string,
      forced = false,
      justification: string | null = null
    ) => {
      const { data, error } = await supabase
        .from("studies")
        .update({
          status: "signed",
          signed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .neq("status", "signed")
        .select()
        .single();
      if (error || !data) {
        alert("❌ Impossible de signer : déjà signé ou erreur.");
        return;
      }

      await supabase.from("decision_logs").insert({
        study_id: id,
        client_name: name,
        action_performed: forced ? "FORCED_TO_SIGNED" : "SIGNED",
        justification: forced ? justification : "Signature depuis dashboard",
      });

      alert("✅ Dossier signé. Automatisations déclenchées.");
      loadData();
    },
    [loadData]
  );
  const cancelStudy = useCallback(
    async (id: string, name: string) => {
      await supabase
        .from("studies")
        .update({ status: "cancelled" })
        .eq("id", id);
      // Annuler tous les emails en attente
      await supabase
        .from("email_queue")
        .update({ status: "cancelled" })
        .eq("study_id", id)
        .in("status", ["pending", "scheduled"]);

      await supabase.from("decision_logs").insert({
        study_id: id,
        client_name: name,
        action_performed: "CANCELLED",
        justification: "Annulation depuis dashboard",
      });

      alert("✅ Dossier annulé. Emails stoppés.");
      loadData();
    },
    [loadData]
  );
  const markDepositPaid = useCallback(
    async (id: string, name: string) => {
      const { error } = await supabase
        .from("studies")
        .update({
          deposit_paid: true,
          deposit_paid_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) {
        alert("❌ Erreur : " + error.message);
        return;
      }

      await supabase.from("decision_logs").insert({
        study_id: id,
        client_name: name,
        action_performed: "DEPOSIT_PAID_CONFIRMED",
        justification: "Acompte validé depuis dashboard",
      });

      alert("✅ Acompte validé !");
      loadData();
    },
    [loadData]
  );
  // ✅ NOUVEAU : Marquer RIB envoyé
  const markRibSent = useCallback(
    async (id: string, name: string) => {
      const { error } = await supabase
        .from("studies")
        .update({
          rib_sent: true,
          rib_sent_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) {
        alert("❌ Erreur : " + error.message);
        return;
      }

      await supabase.from("decision_logs").insert({
        study_id: id,
        client_name: name,
        action_performed: "RIB_SENT_CONFIRMED",
        justification: "RIB marqué comme envoyé depuis dashboard",
      });

      alert("✅ RIB marqué comme envoyé !");
      loadData();
    },
    [loadData]
  );
  // ============================================
  // ACTIONS - GESTION LEADS
  // ============================================
  const setOptOut = useCallback(
    async (email: string) => {
      const { data } = await supabase
        .from("clients")
        .update({ email_optout: true })
        .eq("email", email)
        .select();
      if (!data || data.length === 0) {
        alert("❌ ERREUR : Aucun client trouvé avec cet email");
        return;
      }

      // Annuler tous les emails en attente pour ce client
      await supabase
        .from("email_queue")
        .update({ status: "cancelled" })
        .eq("client_id", data[0].id)
        .in("status", ["pending", "scheduled"]);

      await supabase.from("decision_logs").insert({
        client_name: `${data[0].first_name} ${data[0].last_name}`,
        action_performed: "EMAIL_OPTOUT",
        justification: "Désabonnement depuis dashboard",
      });

      alert("✅ Client désabonné avec succès !");
      loadEmailLeads();
      loadData();
    },
    [loadData, loadEmailLeads]
  );
  const deleteLeadPermanently = useCallback(
    async (clientId: string, email: string, name: string) => {
      // Suppression cascade complète
      await supabase.from("studies").delete().eq("client_id", clientId);
      await supabase.from("email_queue").delete().eq("client_id", clientId);
      await supabase.from("email_leads").delete().eq("client_id", clientId);
      await supabase.from("clients").delete().eq("id", clientId);
      await supabase.from("decision_logs").insert({
        action_performed: "LEAD_DELETED_PERMANENTLY",
        client_name: name,
        justification: `Suppression définitive ${email}`,
      });

      alert("✅ Lead supprimé définitivement");
      loadData();
      loadEmailLeads();
    },
    [loadData, loadEmailLeads]
  );
  const deleteStudy = useCallback(
    async (id: string, name: string) => {
      await supabase.from("studies").delete().eq("id", id);
      await supabase.from("decision_logs").insert({
        client_name: name,
        action_performed: "DELETE_STUDY",
        justification: "Suppression définitive",
      });
      loadData();
    },
    [loadData]
  );
  // ============================================
  // ACTIONS - LOGS
  // ============================================
  const logForceAction = useCallback(
    async (
      studyId: string,
      clientName: string,
      action: string,
      justification: string
    ) => {
      await supabase.from("decision_logs").insert({
        study_id: studyId,
        client_name: clientName,
        action_performed: action,
        justification,
      });
    },
    []
  );
  // ============================================
  // REFRESH MANUEL
  // ============================================
  const refresh = useCallback(() => {
    loadData();
    loadEmailLeads();
  }, [loadData, loadEmailLeads]);

  // ============================================
  // HELPER : MAPPER EMAIL LEAD
  // ============================================
  function mapEmailLeadToDisplay(
    l: any,
    studyIdByClientId: Record<string, string>,
    lastOpenByStudyId: Record<string, string>,
    lastClickByStudyId: Record<string, string>
  ): EmailLead {
    const studyId = studyIdByClientId[l.client_id] || null;
    const lastOpen = studyId ? lastOpenByStudyId[studyId] : l.last_opened_at;
    const lastClick = studyId ? lastClickByStudyId[studyId] : l.last_clicked_at;

    return {
      id: l.id,
      client_id: l.client_id,
      study_id: studyId,
      client_name: `${l.clients?.first_name || ""} ${
        l.clients?.last_name || ""
      }`.trim(),
      client_email: l.clients?.email || "",
      opted_out: l.clients?.email_optout || false,
      email_sequence_step: l.email_step || 0,
      last_email_sent: l.last_email_sent_at,
      next_email_date: l.next_email_scheduled_at,
      total_opens: l.total_opens || 0,
      total_clicks: l.total_clicks || 0,
      last_opened_at: lastOpen,
      last_clicked_at: lastClick,
      created_at: l.created_at,
    };
  }
  // ============================================
  // CHARGEMENT INITIAL + AUTO-REFRESH
  // ============================================
  useEffect(() => {
    // Lancer animation de chargement
    initializeSystem();
    // Charger données
    loadData();
    loadEmailLeads();

    // Auto-refresh toutes les 60 secondes
    const interval = setInterval(() => {
      loadData();
      loadEmailLeads();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadData, loadEmailLeads, initializeSystem]);
  if (!metrics) return null;

  const systemStatus: "active" | "warning" | "critical" | "normal" =
    metrics.urgencyMode.level === "critical"
      ? "critical"
      : metrics.urgencyMode.level === "high"
      ? "warning"
      : metrics.urgencyMode.level === "medium"
      ? "active"
      : "normal";

  // ============================================
  // RETOUR DU HOOK AUGMENTÉ
  // ============================================
  return {
    // Données
    studies,
    emailLeads,
    logs,
    metrics,
    financialStats, // ✅ NOUVEAU
    loading,
    systemInitialized, // ✅ NOUVEAU
    loadingProgress, // ✅ NOUVEAU
    loadingStep, // ✅ NOUVEAU
    error,
    // Indexations avancées
    emailFlowByClient,
    antiAnnulationByStudy,
    postRefusByStudy,

    // Actions
    actions: {
      updateStudyStatus,
      signStudy,
      cancelStudy,
      markDepositPaid,
      markRibSent, // ✅ NOUVEAU
      setOptOut,
      deleteLeadPermanently,
      deleteStudy,
      logForceAction,
      refresh,
    },
  };
}
// ============================================
// HEADER - NAVIGATION PRINCIPALE AUGMENTÉE
// ============================================
// ============================================
// HEADER - NAVIGATION PRINCIPALE AUGMENTÉE
// ============================================
// ============================================
export const NextActionIndicator: React.FC<{ metrics: Metrics }> = ({
  metrics,
}) => {
  const urgency = metrics.urgencyMode;

  return (
    <div
      className={`
      relative overflow-hidden glass-panel p-4 rounded-2xl flex items-center gap-4 transition-all duration-500
      ${
        urgency.active
          ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          : "border-white/5"
      }
    `}
    >
      {/* Animation de scan si urgent (comme dans ton loading) */}
      {urgency.active && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-scan-line pointer-events-none"
          style={{ width: "200%", animationDuration: "2s" }}
        ></div>
      )}

      <div
        className={`
        relative w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner
        ${
          urgency.active
            ? "bg-red-500/20 text-red-400"
            : "bg-blue-500/20 text-blue-400"
        }
      `}
      >
        {urgency.active ? "🚨" : "🛡️"}
        {urgency.active && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              urgency.active ? "text-red-400" : "text-blue-400"
            }`}
          >
            {urgency.active ? "Action Requise" : "Statut Système"}
          </span>
        </div>
        <div className="text-white font-bold tracking-tight text-sm">
          {urgency.active ? urgency.focus?.name : "Optimisation en cours"}
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {urgency.message}
        </div>
      </div>

      {/* Jauge de tension à droite */}
      <div className="text-right border-l border-white/10 pl-4">
        <div className="text-[10px] text-slate-500 font-bold uppercase">
          Tension
        </div>
        <div
          className={`text-lg font-mono font-black ${
            urgency.active ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {urgency.active ? "CRITIQUE" : "STABLE"}
        </div>
      </div>
    </div>
  );
};

// Affiche "Sécuriser acomptes" ou "Closer leads chauds"
// ============================================
// MODAL COLORS (pour Override Modal)
// ============================================
const MODAL_COLORS = {
  green: {
    header: "bg-green-500/20 border-green-500/50",
    warn: "bg-green-500/10 border-green-500/30",
    text: "text-green-400",
    softText: "text-green-300/70",
    button: "bg-green-600 hover:bg-green-500",
  },
  red: {
    header: "bg-red-500/20 border-red-500/50",
    warn: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    softText: "text-red-300/70",
    button: "bg-red-600 hover:bg-red-500",
  },
  orange: {
    header: "bg-orange-500/20 border-orange-500/50",
    warn: "bg-orange-500/10 border-orange-500/30",
    text: "text-orange-400",
    softText: "text-orange-300/70",
    button: "bg-orange-600 hover:bg-orange-500",
  },
  blue: {
    header: "bg-blue-500/20 border-blue-500/50",
    warn: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
    softText: "text-blue-300/70",
    button: "bg-blue-600 hover:bg-blue-500",
  },
};
// ============================================
// OVERRIDE MODAL - SÉCURITÉ ACTIONS CRITIQUES AUGMENTÉ
// ============================================
interface OverrideModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  studyName?: string;
  actionType?: "force_sign" | "delete" | "override";
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
}
export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  title,
  message,
  studyName,
  actionType,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const color =
    actionType === "force_sign"
      ? "green"
      : actionType === "delete"
      ? "red"
      : actionType === "override"
      ? "orange"
      : "blue";

  // NOUVEAU : Mapping pour les styles de boutons et bordures
  const styles = {
    green: {
      border: "border-green-500/50",
      btn: "bg-green-600 hover:bg-green-500 shadow-green-500/20",
      icon: "✅",
    },
    red: {
      border: "border-red-500/50",
      btn: "bg-red-600 hover:bg-red-500 shadow-red-500/20",
      icon: "🗑️",
    },
    orange: {
      border: "border-orange-500/50",
      btn: "bg-orange-600 hover:bg-orange-500 shadow-orange-500/20",
      icon: "⚠️",
    },
    blue: {
      border: "border-blue-500/50",
      btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
      icon: "ℹ️",
    },
  }[color];

  // ✅ NOUVEAU : Templates de justification
  const templates = [
    "Contact téléphonique confirmé",
    "Accord oral en attente",
    "Erreur de tracking connue",
    "Client en déplacement",
    "Paiement en cours de validation",
  ];
  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert("⚠️ Veuillez fournir une justification");
      return;
    }
    if (reason.trim().length < 10) {
      alert("⚠️ La justification doit contenir au moins 10 caractères");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } catch (error) {
      console.error("Error confirming override:", error);
      alert("❌ Erreur lors de la confirmation");
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setReason("");
    onCancel();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`
          glass-panel w-full max-w-lg rounded-2xl overflow-hidden border-2 ${styles.border} 
          shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all animate-slideUp
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-2xl">{styles.icon}</span>
                {title}
              </h3>
              {studyName && (
                <div className="text-sm text-slate-300 ml-9">
                  Dossier :{" "}
                  <span className="font-bold text-white">{studyName}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {message && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-300 leading-relaxed text-sm">
                {message}
              </p>
            </div>
          )}

          <div
            className={`rounded-xl p-4 ${
              color === "red"
                ? "bg-red-500/10 border border-red-500/20"
                : "bg-orange-500/10 border border-orange-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <div
                  className={`font-bold text-sm mb-0.5 ${
                    color === "red" ? "text-red-400" : "text-orange-400"
                  }`}
                >
                  Action critique - Justification requise
                </div>
                <div className="text-xs text-slate-400">
                  Cette action sera enregistrée de manière immuable dans les
                  logs de sécurité.
                </div>
              </div>
            </div>
          </div>

          {/* Justification & Templates */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Justification
              </label>
              <span className="text-[10px] text-slate-500">
                Requis pour valider
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {templates.map((template) => (
                <button
                  key={template}
                  onClick={() => setReason(template)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-md text-[10px] text-slate-300 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Expliquez la raison de cette action exceptionnelle..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none resize-none text-sm transition-all"
            />
            <div className="flex justify-end mt-1">
              <span
                className={`text-[10px] ${
                  reason.trim().length < 10
                    ? "text-orange-400"
                    : "text-emerald-400"
                }`}
              >
                {reason.trim().length}/10 caractères
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg font-bold text-sm transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || reason.trim().length < 10}
            className={`
                px-6 py-2 rounded-lg font-bold text-sm text-white shadow-lg transition-all
                ${styles.btn}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              `}
          >
            {loading ? "Validation..." : "Confirmer l'action"}
          </button>
        </div>
      </div>
    </div>
  );
};
// ============================================
// ✅ NOUVEAU : COMPOSANT STUDY CARD PREMIUM (BI TOOL)
// ============================================
interface StudyCardPremiumProps {
  study: Study;
  antiAnnulationByStudy?: Record<string, any>;
  postRefusByStudy?: Record<string, any>;
  leads?: EmailLead[]; // ✅ AJOUTÉ : Fallback leads
  onSignStudy?: (id: string, name: string) => void;
  onCancelStudy?: (id: string, name: string) => void;
  onDeleteStudy?: (id: string, name: string) => void;
  onMarkDepositPaid?: (id: string, name: string) => void;
  onMarkRibSent?: (id: string, name: string) => void;
  showActions?: boolean;
}

export const StudyCardPremium: React.FC<StudyCardPremiumProps> = ({
  study,
  antiAnnulationByStudy,
  postRefusByStudy,
  onSignStudy,
  onCancelStudy,
  onDeleteStudy,
  onMarkDepositPaid,
  onMarkRibSent,
  showActions = true,
  leads = [],
}) => {
  const behavioral = getBehavioralState(study);
  const behaviorConfig = BEHAVIORAL_LABELS[behavioral.state as keyof typeof BEHAVIORAL_LABELS] || BEHAVIORAL_LABELS.STABLE;

  // ✅ DÉTERMINER QUEL FLOW AFFICHER (Greedy selection respectant le statut)
  const hasSentEmails = (f: any) => f && f.sent && f.sent.length > 0;
  
  const flowA = antiAnnulationByStudy ? (antiAnnulationByStudy[String(study.id)] || antiAnnulationByStudy[String(study.client_id)]) : null;
  const flowB = postRefusByStudy ? (postRefusByStudy[String(study.id)] || postRefusByStudy[String(study.client_id)]) : null;
  const leadDataForFlow = leads?.find(l => (l.client_email?.toLowerCase() === study.email?.toLowerCase()) || l.client_id === study.client_id);
  const flowC = leadDataForFlow ? {
    total_opens: leadDataForFlow.total_opens || 0,
    sent: leadDataForFlow.last_email_sent ? [{ sent_at: leadDataForFlow.last_email_sent, opened_at: leadDataForFlow.last_opened_at }] : [],
    next: leadDataForFlow.next_email_date ? { scheduled_for: leadDataForFlow.next_email_date } : null
  } : null;

  let flowType: 'anti-annulation' | 'post-refus' | 'prospection' | null = null;
  let flowData = null;

  // Priorisation selon le statut du dossier
  if (study.status === "signed") {
    if (hasSentEmails(flowA)) { flowType = 'anti-annulation'; flowData = flowA; }
    else if (hasSentEmails(flowB)) { flowType = 'post-refus'; flowData = flowB; }
    else if (hasSentEmails(flowC)) { flowType = 'prospection'; flowData = flowC; }
  } else {
    // Hors Axe A -> Priorité absolue au Post-Refus
    if (hasSentEmails(flowB)) { flowType = 'post-refus'; flowData = flowB; }
    else if (hasSentEmails(flowA)) { flowType = 'anti-annulation'; flowData = flowA; }
    else if (hasSentEmails(flowC)) { flowType = 'prospection'; flowData = flowC; }
  }

  // Fallback par défaut si rien n'est envoyé
  if (!flowType) {
    if (study.status === "signed") {
        if (flowA?.next) { flowType = 'anti-annulation'; flowData = flowA; }
        else if (flowB?.next) { flowType = 'post-refus'; flowData = flowB; }
        else { flowType = 'anti-annulation'; flowData = flowA; }
    } else {
        if (flowB?.next) { flowType = 'post-refus'; flowData = flowB; }
        else if (flowA?.next) { flowType = 'anti-annulation'; flowData = flowA; }
        else if (flowC?.next) { flowType = 'prospection'; flowData = flowC; }
        else { flowType = 'post-refus'; flowData = flowB; }
    }
  }


  let emailStep = (flowType === 'prospection' && leadDataForFlow) ? (leadDataForFlow.email_sequence_step || 0) : (flowData?.sent?.length || 0);

  if (study.name?.toUpperCase().includes("GUYOT")) {
      console.log("🎯 GUYOT SELECTED FLOW:", { flowType, hasSent: hasSentEmails(flowData), step: emailStep });
  }


  const totalEmailsInFlow = 5;

  // Extraire dernier email
  const lastEmail = flowData?.sent && flowData.sent.length > 0 
    ? flowData.sent[flowData.sent.length - 1] 
    : null;
  const nextEmail = flowData?.next || null;

  // Logic pour le risque (Probabilité)
  // 3. Fallback ultime si rien n'est trouvé mais qu'il y a des vues
  if (!flowType && (study.views > 0 || study.last_view)) {
    flowType = study.status === "signed" ? 'anti-annulation' : 'post-refus';
    flowData = {
        total_opens: study.views || 0,
        sent: study.last_view ? [{
            sent_at: study.last_view,
            opened_at: study.last_view
        }] : [],
        next: null,
        is_fallback: true
    };
    emailStep = Math.min(5, Math.max(1, Math.floor((study.views || 0) / 2)));
  }

  // ✅ FIX: Utiliser cancellationRisk (existe partout) au lieu de dangerScore (War Room uniquement)
  const probability = Math.min(100, Math.max(0, study.cancellationRisk || study.dangerScore || 0));
  const isHighRisk = probability > 80;

  // Déterminer le label de catégorie (Cash vs Financement vs Relance)
  const isCash = study.payment_mode === 'cash' || (study as any).financing_mode === 'cash_payment' || (study as any).financing_mode === 'cash';
  const flowCategory = (flowType === 'anti-annulation' || flowType === 'post-refus')
    ? (isCash ? 'cash' : 'financement')
    : 'prospection';

  return (
    <div className="group relative mb-4">
      {/* Bordure lumineuse dynamique (Subtile) */}
      <div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/50 to-indigo-600/50 opacity-0 blur-sm group-hover:opacity-30 transition duration-500 ${
          isHighRisk ? "from-orange-600/50 to-red-600/50 group-hover:opacity-40" : ""
        }`}
      ></div>

      <div className="relative glass-panel rounded-2xl bg-slate-950/40 border border-white/5 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:bg-slate-900/40 hover:border-white/10 shadow-lg">
        {/* COLONNE 1 : IDENTITÉ & STATUT */}
        <div className="flex flex-col gap-2 min-w-[220px]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <h3 className="text-white font-black tracking-tight text-lg uppercase">
              {study.name}
            </h3>
            {study.status === "signed" && (
              <LucideShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="opacity-60 text-[10px]">📧</span> {study.email}
          </div>
            {isCash && (
              <div className='flex items-center gap-2 mt-1'>
                <span className='px-2 py-0.5 rounded text-[10px] bg-amber-500/10 border-amber-500/20 text-amber-400 font-black uppercase tracking-tighter shadow-[0_0_8px_rgba(251,191,36,0.2)]'>
                  CASH {study.has_deposit ? '+ ACOMPTE' : ''}
                </span>
              </div>
            )}
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${behaviorConfig.class}`}
            >
              {behaviorConfig.label.replace(/^[^\s]+\s/, "")}
            </span>

            {/* BADGE SÉCURISÉ */}
            {study.contract_secured && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-black uppercase flex items-center gap-1">
                🛡️ SÉCURISÉ
              </span>
            )}

            {/* BADGE RIB */}
            {study.rib_sent && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-black uppercase">
                📄 RIB OK
              </span>
            )}

            <span className="px-2 py-0.5 rounded bg-slate-800/50 border border-white/5 text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
              🗓️ J+{study.daysSinceSigned || study.diffDays || 0}
            </span>
          </div>
        </div>

        {/* COLONNE 2 : ENGAGEMENT FLOW */}
        <div className="hidden lg:flex flex-col gap-3 flex-1 px-8 border-x border-white/5 min-h-[100px] justify-center">
          {flowType ? (
            <>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1.5">
                  <LucideActivity className="w-3 h-3 text-blue-400" />
                  Engagement Flow
                </span>
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {study.views || 0} VUES
                </span>
              </div>
              
              <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden flex gap-1.5 p-[2px] border border-white/5">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-sm transition-all duration-700 ${
                      step <= emailStep
                        ? "bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                        : "bg-slate-700/50"
                    }`}
                  ></div>
                ))}
              </div>
              
              <div className="flex justify-between text-[9px] font-bold text-slate-600 tracking-widest uppercase">
                <span>Séquence Auto</span>
                <span>{emailStep}/{totalEmailsInFlow} Envoyés</span>
              </div>

              {/* DÉTAILS DU FLOW BOX */}
              <div className={`flex flex-col gap-2 p-3 rounded-lg border mt-1 ${
                flowType === 'anti-annulation' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.1)]' 
                  : (flowType === 'post-refus' ? 'bg-red-500/5 border-red-500/20 shadow-[0_4px_12px_rgba(239,68,68,0.1)]' : 'bg-blue-500/5 border-blue-500/20 shadow-[0_4px_12px_rgba(59,130,246,0.1)]')
              }`}>
                {/* Badge type de séquence */}
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                  flowType === 'anti-annulation' ? 'text-emerald-400' : (flowType === 'post-refus' ? 'text-red-400' : 'text-blue-400')
                }`}>
                  {flowType === 'anti-annulation' ? `🛡️ ANTI-ANNULATION ${flowCategory.toUpperCase()}` : (flowType === 'post-refus' ? `❌ POST-REFUS ${flowCategory.toUpperCase()}` : '🚀 PROSPECTION')}

                </div>

                {/* Dernier email envoyé */}
                {lastEmail ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-600 font-bold">Dernier :</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${
                          flowType === 'anti-annulation' ? 'text-emerald-400' : (flowType === 'post-refus' ? 'text-red-400' : 'text-blue-400')
                        }`}>
                          j{emailStep} {flowCategory}
                        </span>
                        <span className="text-slate-500 font-mono">
                          ({new Date(lastEmail.sent_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-700 font-bold">Ouvertures :</span>
                      <div className="flex items-center gap-2">
                         {lastEmail.opened_at && (
                           <span className="text-[8px] text-slate-500 font-mono">
                             Lu le: {new Date(lastEmail.opened_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à {new Date(lastEmail.opened_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                         )}
                         <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                           flowData.total_opens > 0 
                             ? (flowType === 'anti-annulation' ? 'bg-emerald-500/10 text-emerald-400' : (flowType === 'post-refus' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'))
                             : 'bg-slate-800 text-slate-600'
                         }`}>
                           {flowData.total_opens || 0}x
                         </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic py-1">⌛ En attente du premier envoi...</div>
                )}

                {/* Prochain email */}
                {nextEmail && emailStep < totalEmailsInFlow && (
                  <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2 mt-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-600 font-bold">Prochain :</span>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 font-mono font-bold">
                          j{emailStep + 1} {flowCategory}
                        </span>
                        <span className="text-orange-400/60 font-mono">
                          → {new Date(nextEmail.scheduled_for).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Séquence terminée */}
                {emailStep >= totalEmailsInFlow && (
                  <div className={`flex items-center justify-center gap-1 rounded-md px-2 py-1.5 border mt-1 font-black text-[8px] uppercase tracking-widest ${
                    flowType === 'anti-annulation'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : (flowType === 'post-refus' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400')
                  }`}>
                    ✅ SÉQUENCE TERMINÉE
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1 opacity-50">Engagement Flow</div>
              <div className="text-xs text-slate-500 italic">Aucune séquence active détectée</div>
            </div>
          )}
        </div>

        {/* COLONNE 3 : FINANCES */}
        <div className="flex flex-col items-end gap-2 min-w-[160px]">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
            VALEUR DOSSIER
            {study.financing_mode && (
              <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-slate-400 border border-white/5">
                {study.financing_mode === 'cash_payment' ? 'COMPTANT' : 'FINANCÉ'}
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-white tracking-tighter">
            {formatCurrency(study.total_price)}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* APPORT Badges */}
            {study.cash_apport > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 shadow-lg shadow-yellow-900/10">
                <LucideCreditCard className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] font-black text-yellow-400 font-mono tracking-tight uppercase">
                  APPORT: {formatCurrency(study.cash_apport)}
                </span>
              </div>
            )}

            {/* ACOMPTE Status - UNIQUEMENT si acompte requis */}
            {study.status === 'signed' && study.has_deposit && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase leading-none
                ${study.deposit_paid
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                }`}>
                {study.deposit_paid ? "✅ Acompte Payé" : "⏳ Acompte Attendu (1500€)"}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 4 : PROBABILITÉ (Score Circulaire) */}
        <div className="flex items-center gap-6 pl-6 border-l border-white/5">
          <div className="relative w-16 h-16 group/gauge">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-slate-800/80"
                strokeWidth="2.5"
              ></circle>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={`${isHighRisk ? "stroke-orange-500" : "stroke-blue-500"} transition-all duration-1000 ease-out`}
                strokeWidth="2.5"
                strokeDasharray={`${probability}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-white font-mono leading-none">
                {probability}%
              </span>
            </div>
            {/* Anim de pulse sur la jauge */}
            <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${isHighRisk ? "bg-orange-500" : "bg-blue-500"} animate-pulse`}></div>
          </div>
          <div className="hidden xl:flex flex-col items-start gap-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              Niveau Risque
            </span>
            <span
              className={`text-[11px] font-black tracking-[0.1em] px-2 py-0.5 rounded border ${behaviorConfig.class}`}
            >
              {behaviorConfig.label.replace(/^[^\s]+\s/, "")}
            </span>
          </div>
        </div>

        {/* COLONNE 5 : ACTIONS (Mobile Friendly) */}
        {showActions && (
          <div className="flex flex-row lg:flex-col gap-2 border-l border-white/5 pl-4 ml-4">
             <button
               onClick={() => {
                const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "";
                if (frontendUrl) window.open(`${frontendUrl}/guest/${study.id}`, "_blank");
               }}
               className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
               title="Voir Document"
             >
               <LucideActivity className="w-4 h-4" />
             </button>
             <button
                onClick={() => {
                  if (study.phone) window.location.href = `tel:${study.phone}`;
                }}
                className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                title="Appeler Client"
             >
               <span className="text-sm">📞</span>
             </button>

             {/* NOUVEAU : BOUTON SIGNER SI PAS ENCORE SIGNÉ */}
             {study.status === "sent" && onSignStudy && (
               <button
                 onClick={() => onSignStudy(study.id, study.name)}
                 className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                 title="Marquer comme Signé"
               >
                 <span className="text-sm">🖊️</span>
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
// ============================================
// ✅ NOUVEAU : SYSTEM STATE GLASSMORPHISM PREMIUM
// ============================================
interface SystemStateProps {
  totalStudies: number;
  activeStudies: number;
  signedStudies: number;
  securedStudies: number;
  waitingStudies: number;
  totalLeads: number;
  activeLeads: number;
  totalEmailsSent: number;
  pendingEmails: number;
  unsubscribedCount: number;
  unsubscribeRate: number;
  onStatClick?: (type: string) => void;

}
export const SystemState: React.FC<SystemStateProps> = ({
  totalStudies,
  activeStudies,
  signedStudies,
  totalLeads,
  activeLeads,
  securedStudies,
  waitingStudies,
  totalEmailsSent,
  pendingEmails,
  unsubscribedCount,
  unsubscribeRate,
  onStatClick,
}) => {
  return (
    <div className="relative mb-12">
      <div className="relative z-10 px-6">
        <div className="glass-panel py-10 px-12 rounded-3xl border border-white/5 shadow-2xl overflow-x-auto custom-scrollbar">
          <div className="flex items-center justify-center gap-20 min-w-max mx-auto">
            {/* Groupe Études */}
            <div className="flex items-center gap-16">
              <KPICard label="Total Études" value={totalStudies} color="blue" onClick={() => onStatClick?.('performance')} />
              <KPICard
                label="Sécurisés"
                value={securedStudies}
                color="emerald"
                glow
              />
              <KPICard label="Actives" value={activeStudies} color="green" onClick={() => onStatClick?.('engagement')} />
              <KPICard label="Signées" value={signedStudies} color="green" onClick={() => onStatClick?.('revenue')} />
              <KPICard
                label="En Attente"
                value={waitingStudies}
                color="yellow"
              />
            </div>

            {/* Séparateur Vertical */}
            <div className="h-16 w-px bg-white/10 mx-6"></div>

            {/* Groupe Leads */}
            <div className="flex items-center gap-16">
              <KPICard label="Total Leads" value={totalLeads} color="purple" />
              <KPICard
                label="Leads Actifs"
                value={activeLeads}
                color="orange"
              />
              <KPICard
                label="Emails Envoyés"
                value={totalEmailsSent}
                color="indigo"
              />
               <KPICard
                label="À venir"
                value={pendingEmails}
                color="purple"
              />
              <KPICard
                label="Désabonnés"
                value={unsubscribedCount}
                color="red"
              />
              <KPICard
                label="Taux Opt-out"
                value={parseFloat(unsubscribeRate.toFixed(1))}
                color="red"
                isPercentage
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({
  label,
  value,
  color,
  glow = false,
  isPercentage = false,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  glow?: boolean;
  isPercentage?: boolean;
  onClick?: () => void;
}) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 font-black text-4xl mb-1",
    emerald: "text-emerald-400 font-black text-4xl mb-1",
    green: "text-green-400 font-black text-4xl mb-1",
    purple: "text-purple-400 font-black text-4xl mb-1",
    orange: "text-orange-400 font-black text-4xl mb-1",
    indigo: "text-indigo-400 font-black text-4xl mb-1",
    yellow: "text-yellow-400 font-black text-4xl mb-1",
    red: "text-red-400 font-black text-4xl mb-1",
  };

  return (
    <div 
      className={`flex flex-col items-center min-w-[100px] group transition-all duration-300 hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center group-hover:text-slate-400 transition-colors">
        {label}
      </div>
      <div className={`relative ${colorMap[color] || "text-white"}`}>
        {glow && (
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
        )}
        <span className="relative z-10">
          <div
            className={`text-4xl font-black mb-1 transition-all duration-300 group-hover:scale-110 tracking-tighter ${
              color === "blue"
                ? "text-blue-400 group-hover:text-blue-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : color === "emerald"
                ? "text-emerald-400 group-hover:text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                : color === "green"
                ? "text-green-400 group-hover:text-green-300 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                : color === "orange"
                ? "text-orange-400 group-hover:text-orange-300 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]"
                : color === "purple"
                ? "text-purple-400 group-hover:text-purple-300 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]"
                : color === "indigo"
                ? "text-indigo-400 group-hover:text-indigo-300 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]"
                : color === "red"
                ? "text-red-400 group-hover:text-red-300 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]"
                : color === "yellow"
                ? "text-yellow-400 group-hover:text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                : "text-white"
            }`}
          >
            {value}
            {isPercentage && <span className="text-xl ml-1 opacity-60">%</span>}
          </div>
        </span>
      </div>
    </div>
  );
};
// ============================================
// ✅ CRITICAL ALERT WAR ROOM - ALERTE PRIORITAIRE
// ============================================
interface CriticalAlertWarRoomProps {
  show: boolean;
  warRoomCount: number;
  warRoomCA: number;
  silent: Study[]; // ✅ CHANGÉ : array au lieu de number
  agitated: Study[]; // ✅ CHANGÉ : array au lieu de number
  interested: Study[]; // ✅ CHANGÉ : array au lieu de number
  tensionLevel: number;
  priority: Study | null;
  onPrimaryAction: () => void;
  onScrollToWarRoom: () => void;
}

// ============================================
// 🎯 EXECUTION DESK - OPS DESK V2 🦅
// ============================================
interface ExecutionDeskProps {
  show: boolean;
  priority: Study | null;
  onPrimaryAction: () => void;
  onScrollToWarRoom: () => void;
}

export const ExecutionDesk: React.FC<ExecutionDeskProps> = ({
  show,
  priority,
  onPrimaryAction,
  onScrollToWarRoom,
}) => {
  if (!show || !priority) return null;

  // Mapping intelligent pour le Desk d'Exécution
  const status = priority.status;
  const behavior = (priority as any).behavior;
  
  // Extraction précise depuis l'objet priority (qui contient maintenant total_price)
  const focus = {
    objective: status === 'signed' ? "SÉCURISER L'ACOMPTE & VALIDATION" : "DÉROUILLER LE DOSSIER & CLÔTURER",
    situation: status === 'signed' ? "Contrat signé, acompte en attente." : "Prospect chaud, momentum élevé.",
    whyNow: [
      `Momentum critique : ${(priority as any).dangerScore}% d'instabilité.`,
      behavior === 'muet' ? "Client muet : risque de décrochage silencieux." : "Fréquence de vue élevée : intention d'achat confirmée.",
      (priority as any).requiresDeposit ? "Acompte manquant : risque de caducité légale." : "Délai de réflexion en phase finale."
    ],
    mainAction: priority.status === 'signed' ? `APPELER ${priority.name.split(" ")[0].toUpperCase()} — SÉCURISER` : `APPELER ${priority.name.split(" ")[0].toUpperCase()} — CLOSING`,
    risk: status === 'signed' ? "Perte de contrat signé" : "Perte de momentum émotionnel",
    stake: (priority as any).total_price || 0,
    deadline: "48:00"
  };

  return (
    <div id="execution-desk" className="mb-8 animate-fadeIn">
      <style>{`
          .desk-glass {
            background: linear-gradient(145deg, rgba(10, 15, 30, 0.7) 0%, rgba(2, 6, 23, 0.9) 100%);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.4);
          }
          .premium-button {
            background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);
            background-size: 200% auto;
            transition: 0.5s;
            box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.5);
          }
          .premium-button:hover {
            background-position: right center;
            transform: translateY(-1px);
            box-shadow: 0 12px 30px -10px rgba(59, 130, 246, 0.4);
          }
          .premium-button:active {
            transform: translateY(1px);
          }
          @keyframes glow-border {
            0%, 100% { border-color: rgba(59, 130, 246, 0.3); }
            50% { border-color: rgba(59, 130, 246, 0.6); }
          }
          .animate-glow-border {
            animation: glow-border 2s infinite ease-in-out;
          }
      `}</style>

      <div className="desk-glass rounded-3xl overflow-hidden animate-fadeIn">
        {/* HEADER */}
        <div className="px-10 py-5 bg-white/[0.02] border-b border-white/[0.05] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400/80">
              COMMANDE OPÉRATIONNELLE <span className="text-zinc-600 ml-2 font-bold tracking-widest">(OPS-01)</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">System: Intelligent Priority Engine</span>
             <div className="h-3 w-px bg-white/10" />
             <span className="text-[9px] text-blue-500 font-black font-mono">LIVE</span>
          </div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-12 gap-12">
            {/* ACTION CARD - LEFT SECTION */}
            <div className="col-span-12 lg:col-span-7 space-y-10">
              {/* Identity & Status */}
              <div>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-2 block">Prospect Prioritaire</span>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
                  {priority.name.toUpperCase()}
                </h3>
                <div className="flex gap-4 items-center">
                   <div className="px-4 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-black uppercase tracking-[0.15em]">
                     Statut : {focus.situation.toUpperCase()}
                   </div>
                </div>
              </div>

              {/* Business Objective */}
              <div className="space-y-4">
                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] block">🎯 Objectif de Fin de Cycle</span>
                <p className="text-2xl text-zinc-100 font-black leading-tight tracking-tight">
                  {focus.objective}
                </p>
              </div>

              {/* Why Now */}
              <div className="space-y-5">
                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] block">💡 Facteurs de Tension IA</span>
                <div className="space-y-3">
                    {focus.whyNow.map((reason, idx) => (
                      <div key={idx} className="flex gap-4 items-start text-zinc-400 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                        <p className="text-xs font-semibold leading-relaxed tracking-wide">{reason}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* ACTION CENTER - RIGHT SECTION */}
            <div className="col-span-12 lg:col-span-5 flex flex-col justify-between pt-6 lg:pt-0">
              {/* NEXT BEST ACTION focal point */}
              <div className="space-y-8">
                <div className="text-center p-10 bg-white/[0.01] border border-white/[0.05] rounded-3xl relative overflow-hidden group shadow-2xl animate-glow-border">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                  <span className="text-[10px] text-blue-500/70 font-black uppercase tracking-[0.4em] block mb-8">NEXT BEST ACTION</span>
                  
                  <button 
                    onClick={onPrimaryAction}
                    className="w-full py-8 premium-button rounded-2xl text-white text-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-4 group"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">📞</span>
                    <span>{focus.mainAction}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button className="py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest rounded-xl">
                      📧 Mail
                    </button>
                    <button 
                      onClick={onScrollToWarRoom}
                      className="py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest rounded-xl"
                    >
                      📂 Dossier
                    </button>
                  </div>
                </div>

                {/* MINI CONTEXT BAR */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                   <div className="text-center border-r border-white/5">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest block mb-2">Impact Cash</span>
                     <span className={`text-lg font-black font-mono tracking-tighter ${focus.stake > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                       {formatCurrency(focus.stake)}
                     </span>
                   </div>
                   <div className="text-center border-r border-white/5">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest block mb-2">Deadline</span>
                     <span className="text-lg font-black text-red-500/90 font-mono tracking-tighter">{focus.deadline}</span>
                   </div>
                   <div className="text-center">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest block mb-2">Risque</span>
                     <span className="text-[11px] font-black text-orange-500/90 uppercase leading-none block mt-1 tracking-tighter">
                       {focus.risk.split(' ')[0]} {focus.risk.split(' ')[1]}
                     </span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ✅ CRITICAL ALERT - ALERTES CRITIQUES GÉNÉRIQUES
// (Composant séparé pour d'autres types d'alertes)
// ============================================

// ============================================
// ✅ CRITICAL ALERT - ALERTES CRITIQUES GÉNÉRIQUES
// (Composant séparé pour d'autres types d'alertes)
// ============================================
interface CriticalAlertProps {
  show: boolean;
  message: string;
  onDismiss?: () => void;
}

export const CriticalAlert: React.FC<CriticalAlertProps> = ({
  show,
  message,
  onDismiss,
}) => {
  if (!show) return null;

  return (
    <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-6 mb-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🚨</div>
          <div>
            <h4 className="text-xl font-bold text-red-400 mb-2">
              ALERTE CRITIQUE
            </h4>
            <p className="text-red-300 text-center mb-6">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// AUTOPILOTE SOLAIRE FUSION - PARTIE 4/6
// War Room Augmentée + Stats Financières + Zone d'Action
// ============================================

// ============================================
// ✅ REFONTE : STATS FINANCIÈRES ULTRA-PREMIUM COMPACT
// ============================================
interface FinancialStatsProps {
  stats: FinancialStats;
}

export const FinancialStatsPanel: React.FC<FinancialStatsProps> = ({
  stats,
}) => {
  const caTotal = stats.caTotal || 0;
  const cashSecured = stats.cashSecured || 0;
  const securedCount = stats.securedCount || 0;
  const cashWaitingDeposit = stats.cashWaitingDeposit || 0;
  const waitingDepositCount = stats.waitingDepositCount || 0;
  const cashCancellable = stats.cashCancellable || 0;
  const cancellableCount = stats.cancellableCount || 0;
  const tauxConversion = stats.tauxConversion || 0;

  return (
    <div className="mb-8">
      {/* Titre section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              SITUATION FINANCIÈRE
            </h2>
            <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Analyse des risques et sécurisations
            </div>
          </div>
        </div>
        
        {/* Taux de conversion global */}
        <div className="glass-panel px-4 py-2 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Taux Conversion
          </div>
          <div className="text-2xl font-black text-blue-400">
            {formatPercentage(tauxConversion)}
          </div>
        </div>
      </div>

      {/* Grid 4 cartes compactes */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* CARTE 1 : CA Réalisé (Total Signé) */}
        <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-blue-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>📊</span> CA Réalisé
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {formatCurrency(caTotal)}
            </div>
            <div className="text-xs text-slate-400">
              Total signatures
            </div>
          </div>
        </div>

        {/* CARTE 2 : CA Sécurisé (Délai + Acompte) */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-emerald-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>🛡️</span> CA Sécurisé
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {formatCurrency(cashSecured)}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{securedCount} contrats</span>
              <span className="text-emerald-400/70">Hors délai</span>
            </div>
          </div>
        </div>

        {/* CARTE 3 : Acomptes en Attente */}
        <div className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-orange-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-orange-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>⏳</span> Acomptes Attente
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {formatCurrency(cashWaitingDeposit)}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{waitingDepositCount} dossiers</span>
              <span className="text-orange-400/70">Action requise</span>
            </div>
          </div>
        </div>

        {/* CARTE 4 : CA Annulable */}
        <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-red-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>⚠️</span> CA Annulable
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {formatCurrency(cashCancellable)}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{cancellableCount} dossiers</span>
              <span className="text-red-400/70">&lt; 14 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression visuelle */}
      <div className="mt-4 glass-panel p-3 rounded-xl border border-white/5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-500 font-bold uppercase tracking-wider">Répartition du CA</span>
          <span className="text-slate-400 font-mono">{formatCurrency(caTotal)}</span>
        </div>
        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden flex">
          {cashSecured > 0 && (
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${(cashSecured / caTotal) * 100}%` }}
              title={`Sécurisé: ${formatCurrency(cashSecured)}`}
            ></div>
          )}
          {cashWaitingDeposit > 0 && (
            <div 
              className="h-full bg-orange-500 transition-all duration-1000"
              style={{ width: `${(cashWaitingDeposit / caTotal) * 100}%` }}
              title={`En attente: ${formatCurrency(cashWaitingDeposit)}`}
            ></div>
          )}
          {cashCancellable > 0 && (
            <div 
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(cashCancellable / caTotal) * 100}%` }}
              title={`Annulable: ${formatCurrency(cashCancellable)}`}
            ></div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-slate-500">Sécurisé</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-slate-500">Attente Acompte</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-slate-500">Annulable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ✅ NOUVEAU : WAR ROOM AUGMENTÉE AVEC TENSION
// ============================================
// ============================================
// ✅ NOUVEAU : WAR ROOM - SYSTEM BRAIN v2
// ============================================
import { WarRoom as WarRoomV2 } from './WarRoom/WarRoom';
import { takeSystemSnapshot } from '@/lib/brain/synthesis/systemSnapshot';

const WarRoom: React.FC<{
  metrics: Metrics;
  antiAnnulationByStudy: Record<string, any>;
  postRefusByStudy: Record<string, any>;
  leads?: EmailLead[]; 
  onSignStudy: (id: string, name: string) => void;
  onMarkDepositPaid: (id: string, name: string) => void;
  onMarkRibSent: (id: string, name: string) => void;
  onCancelStudy: (id: string, name: string) => void;
  onDeleteStudy: (id: string, name: string) => void;
}> = ({
  metrics,
  antiAnnulationByStudy,
  postRefusByStudy,
  leads = [],
  onSignStudy,
  onMarkDepositPaid,
  onMarkRibSent,
  onCancelStudy,
  onDeleteStudy,
}) => {
    // Adapter les props existantes pour créer un SystemSnapshot à la volée
    // C'est un pont temporaire pour faire fonctionner la nouvelle UI avec l'ancien Data Flow qui arrive dans Dashboard
    const studies = metrics.warRoom.studies; // On prendrait toutes les metrics normalement
    
    // Simuler le snapshot à partir des props reçues (PONT)
    // Idéalement, Dashboard recevrait déjà le snapshot.
    // Ici on fait la transformation pour rester compatible avec le composant parent.
    const snapshot = React.useMemo(() => {
        // Recréer une liste de Study complète ou partielle selon ce qu'on a
        return takeSystemSnapshot(studies, {
             now: new Date().toISOString(),
             mode: metrics.urgencyMode.active ? "war_room" : "standard",
             dryRun: false
        });
    }, [studies, metrics.urgencyMode]);
    

    return (
        <div className="mb-8">
            <WarRoomV2 snapshot={snapshot} />
        </div>
    );
};
// LEGACY CODE BELOW TO BE DELETED


// ============================================
// ✅ NOUVEAU : ZONE D'ACTION PRIORITAIRE
// ============================================
interface ActionZoneProps {
  studies: Study[];
  metrics: Metrics;
  onMarkDepositPaid: (id: string, name: string) => void;
  onMarkRibSent: (id: string, name: string) => void;
}

export const ActionZone: React.FC<ActionZoneProps> = ({
  studies,
  metrics,
  onMarkDepositPaid,
  onMarkRibSent,
}) => {
  // Calculer les 5 dossiers les plus critiques
  const criticalStudies = studies
    .filter(
      (s) => s.status === "signed" && !s.deposit_paid && s.requiresDeposit
    )
    .sort((a, b) => {
      // Prioriser par nombre de jours depuis signature
      const daysA = a.daysSinceSigned || 0;
      const daysB = b.daysSinceSigned || 0;
      return daysB - daysA;
    })
    .slice(0, 5);

  if (criticalStudies.length === 0) {
    return null;
  }

  const scrollToLateDeposits = () => {
    const element = document.getElementById("late-deposits-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mb-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🎯</span>
        <div>
          <h2 className="text-2xl font-black text-white">
            ZONE D'ACTION PRIORITAIRE
          </h2>
          <div className="text-sm text-orange-300">
            Top {criticalStudies.length} dossiers critiques nécessitant action
            immédiate
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {criticalStudies.map((study, index) => (
          <div
            key={study.id}
            className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-4 hover:bg-slate-900/70 transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Priorité */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-black text-white text-lg">
                  {index + 1}
                </div>

                {/* Info */}
                <div>
                  <div className="font-bold text-white">{study.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    ⚠️{" "}
                    <span className="font-bold text-orange-400">
                      {study.daysLate}j de retard
                    </span>
                    {" · "}
                    {formatCurrency(study.total_price || 0)}
                    {" · "}
                    Mode: {study.payment_mode || "N/A"}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onMarkDepositPaid(study.id, study.name)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
                >
                  ✅ Payé
                </button>
                <button
                  onClick={() => scrollToLateDeposits()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
                >
                  📋 Détails
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// AUTOPILOTE SOLAIRE FUSION - PARTIE 5/6
// Pipeline AXE B + Signed Studies AXE A + Email Leads AXE C
// ============================================

// ============================================
// FILTRES - COMPOSANT DE FILTRAGE
// ============================================
export interface FiltersProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Recherche */}
      <input
        type="text"
        placeholder="🔍 Rechercher un client..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px] px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
      />

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            onFilterChange({
              ...filters,
              views: filters.views === "5+" ? null : "5+",
            })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.views === "5+"
              ? "bg-orange-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          👁️ Vues 5+
        </button>

        <button
          onClick={() =>
            onFilterChange({
              ...filters,
              clicks: filters.clicks === "1+" ? null : "1+",
            })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.clicks === "1+"
              ? "bg-green-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          🖱️ Clics 1+
        </button>

        <button
          onClick={() =>
            onFilterChange({
              ...filters,
              status: filters.status === "sent" ? null : "sent",
            })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.status === "sent"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          📧 Envoyés
        </button>

        <button
          onClick={() =>
            onFilterChange({ ...filters, optout: !filters.optout })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.optout
              ? "bg-red-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          🚫 Opt-out
        </button>
      </div>

      {/* Reset */}
      {(filters.search ||
        filters.views ||
        filters.clicks ||
        filters.status ||
        filters.optout) && (
        <button
          onClick={() =>
            onFilterChange({
              search: "",
              views: null,
              clicks: null,
              status: null,
              optout: false,
            })
          }
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
        >
          🔄 Reset
        </button>
      )}
    </div>
  );
};

// ============================================
// ✅ NOUVEAU : PIPELINE AXE B - GRID AUGMENTÉ
// ============================================
interface PipelineProps {
  studies: Study[];
  filters: DashboardFilters;
  hideSignedInPipeline: boolean;
  emailFlowByClient: Record<string, any>;
  antiAnnulationByStudy: Record<string, any>;
  postRefusByStudy: Record<string, any>;
  leads: EmailLead[];
  onSignStudy: (id: string, name: string) => void;
  onCancelStudy: (id: string, name: string) => void;
  onDeleteStudy: (id: string, name: string) => void;
}

export const Pipeline: React.FC<PipelineProps> = ({
  studies,
  filters,
  hideSignedInPipeline,
  emailFlowByClient,
  antiAnnulationByStudy,
  postRefusByStudy,
  leads,
  onSignStudy,
  onCancelStudy,
  onDeleteStudy,
}) => {
  // Filtrage
  let filtered = studies.filter((s) => {
    // Masquer les signés si demandé
    if (hideSignedInPipeline && s.status === "signed") return false;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        !s.name.toLowerCase().includes(search) &&
        !s.email.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (filters.views === "5+" && s.views < 5) return false;
    if (filters.clicks === "1+" && s.clicks < 1) return false;
    if (filters.status && s.status !== filters.status) return false;
    if (filters.optout && !s.email_optout) return false;

    return true;
  });

  // Tri par température (HOT > WARM > COLD > SIGNED)
  filtered = filtered.sort((a, b) => {
    const tempOrder = { hot: 0, warm: 1, cold: 2, signed: 3 };
    const tempA = getLeadTemperature(a);
    const tempB = getLeadTemperature(b);
    return tempOrder[tempA] - tempOrder[tempB];
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h2 className="text-2xl font-black text-white">
              AXE B — PIPELINE COMMERCIAL
            </h2>
            <div className="text-sm text-slate-400">
              {filtered.length} dossier{filtered.length > 1 ? "s" : ""} en cours
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-bold text-slate-400">
            Aucun dossier trouvé
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Ajustez vos filtres ou critères de recherche
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((study) => (
            <StudyCardPremium
              key={study.id}
              study={study}
              antiAnnulationByStudy={antiAnnulationByStudy}
              postRefusByStudy={postRefusByStudy}
              leads={leads}
              onSignStudy={onSignStudy}
              onCancelStudy={onCancelStudy}
              onDeleteStudy={onDeleteStudy}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ✅ NOUVEAU : SIGNED STUDIES AXE A - GRID AUGMENTÉ
// ============================================
interface SignedStudiesProps {
  studies: Study[];
  metrics: Metrics;
  antiAnnulationByStudy: Record<string, any>;
  postRefusByStudy: Record<string, any>;
  leads: EmailLead[];
  onSignStudy: (id: string, name: string) => void; // ✅ AJOUTÉ
  onMarkDepositPaid: (id: string, name: string) => void;
  onMarkRibSent: (id: string, name: string) => void;
  onCancelStudy: (id: string, name: string) => void;
  onDeleteStudy: (id: string, name: string) => void;
}

export const SignedStudies: React.FC<SignedStudiesProps> = ({
  studies,
  metrics,
  antiAnnulationByStudy,
  postRefusByStudy,
  leads,
  onSignStudy, // ✅ FIX : Ajouté
  onMarkDepositPaid,
  onMarkRibSent,
  onCancelStudy,
  onDeleteStudy,
}) => {
  // ✅ NOUVELLE APPROCHE : Utilise directement les données du cerveau
  const signed = metrics.signed; // Déjà calculé par le cerveau
  const warRoomIds = metrics.warRoom.studies.map((s) => s.id);

  const warRoomStudies = metrics?.warRoom?.studies || [];

  const sortedWarRoom = [...warRoomStudies].sort(
    (a, b) => b.cancellationRisk - a.cancellationRisk
  );

  // ✅ Calculer seulement ce qui n'est pas dans le cerveau
  const regularStudies = signed.filter((s) => 
    !warRoomIds.includes(s.id) || s.name?.toUpperCase().includes("GUYOT")
  );

  // Trier par retard décroissant (avec Guyot en priorité absolue)
  const sortedRegular = regularStudies.sort((a, b) => {
    if (a.name?.toUpperCase().includes("GUYOT")) return -1;
    if (b.name?.toUpperCase().includes("GUYOT")) return 1;
    const daysA = a.daysLate || 0;
    const daysB = b.daysLate || 0;
    return daysB - daysA;
  });

  // ✅ Calcul du vrai nombre de dossiers en attente d'acompte (Exclure 100% financé)
  const waitingDepositCount = sortedRegular.filter(
    (s) =>
      s.requiresDeposit &&
      !s.deposit_paid &&
      s.financing_mode !== "full_financing"
  ).length;
  // 🔍 DEBUG - AJOUTEZ CES LIGNES ICI ⬇️
  console.log("📊 DEBUG ACOMPTES:", {
    total_signed: sortedRegular.length,
    waitingDepositCount,
    breakdown: sortedRegular.map((s) => ({
      name: s.name,
      requiresDeposit: s.requiresDeposit,
      deposit_paid: s.deposit_paid,
      financing_mode: s.financing_mode,
      eligible:
        s.requiresDeposit &&
        !s.deposit_paid &&
        s.financing_mode !== "full_financing",
    })),
  });
  // 🔍 FIN DEBUG ⬆️

  console.log("📧 ANTI-ANNULATION DEBUG:", {
    total_studies: studies.length,
    antiAnnulationKeys: Object.keys(antiAnnulationByStudy),
    robin_kaiser_id: studies.find((s) =>
      s.name.toUpperCase().includes("KAISER")
    )?.id,
    robin_kaiser_emails:
      antiAnnulationByStudy[
        studies.find((s) => s.name.toUpperCase().includes("KAISER"))?.id || ""
      ],
  });

  return (
    <div id="late-deposits-section" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✅</span>
          <div>
            <h2 className="text-2xl font-black text-white">
              AXE A — DOSSIERS SIGNÉS (HORS WAR ROOM)
            </h2>
            <div className="text-sm text-slate-400">
              {sortedRegular.length} dossiers en cours •{" "}
              <span className="text-orange-400 font-bold">
                {waitingDepositCount} en attente d'acompte
              </span>
            </div>
          </div>
        </div>
      </div>

      {sortedRegular.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-lg font-bold text-emerald-400">
            Tous les acomptes sont à jour !
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Aucun retard hors War Room
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRegular.map((study) => (
            <StudyCardPremium
              key={study.id}
              study={study}
              antiAnnulationByStudy={antiAnnulationByStudy}
              postRefusByStudy={postRefusByStudy}
              leads={leads}
              onMarkDepositPaid={onMarkDepositPaid}
              onMarkRibSent={onMarkRibSent}
              onCancelStudy={onCancelStudy}
              onDeleteStudy={onDeleteStudy}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// EMAIL LEADS AXE C - LISTE AUGMENTÉE
// ============================================
interface EmailLeadsProps {
  leads: EmailLead[];
  onSetOptOut: (email: string) => void;
  onDeleteLead: (clientId: string, email: string, name: string) => void;
}

export const EmailLeads: React.FC<EmailLeadsProps> = ({
  leads,
  onSetOptOut,
  onDeleteLead,
}) => {
  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    today: false,
    optedOut: false,
  });

  // Filtrage
  let filtered = leads.filter((l) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        !l.client_name.toLowerCase().includes(search) && // ✅ CORRIGÉ
        !l.client_email.toLowerCase().includes(search) // ✅ CORRIGÉ
      ) {
        return false;
      }
    }
    if (filters.today && l.next_email_date) {
      const today = new Date().toDateString();
      const nextDate = new Date(l.next_email_date).toDateString();
      if (today !== nextDate) return false;
    }
    if (filters.optedOut && !l.opted_out) return false;

    return true;
  });

  // Tri par prochaine relance
  filtered = filtered.sort((a, b) => {
    if (!a.next_email_date) return 1;
    if (!b.next_email_date) return -1;
    return (
      new Date(a.next_email_date).getTime() -
      new Date(b.next_email_date).getTime()
    );
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📧</span>
          <div>
            <h2 className="text-2xl font-black text-white">
              AXE C — LEADS EMAIL (AUTOMATISATION)
            </h2>
            <div className="text-sm text-slate-400">
              {filtered.length} lead{filtered.length > 1 ? "s" : ""} en
              nurturing
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un lead..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 min-w-[200px] px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />

        <button
          onClick={() => setFilters({ ...filters, today: !filters.today })}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.today
              ? "bg-green-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          📅 Aujourd'hui
        </button>

        <button
          onClick={() =>
            setFilters({ ...filters, optedOut: !filters.optedOut })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.optedOut
              ? "bg-red-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          🚫 Désabonnés
        </button>

        {(filters.search || filters.today || filters.optedOut) && (
          <button
            onClick={() =>
              setFilters({ search: "", today: false, optedOut: false })
            }
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-bold text-slate-400">
            Aucun lead trouvé
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const nextFollowup = getNextFollowup(lead);
            const isToday =
              lead.next_email_date &&
              new Date(lead.next_email_date).toDateString() ===
                new Date().toDateString();

            return (
              <div
                key={lead.id}
                className={`rounded-xl p-5 border-2 transition-all ${
                  lead.opted_out
                    ? "bg-red-500/10 border-red-500/50"
                    : isToday
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70"
                }`}
              >
                <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-4 items-center">
                  {/* COLONNE 1 : Identité & Badges */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                          {lead.client_name}
                        </div>
                      </div>
                      <div className="text-sm text-slate-400 font-medium ml-0.5">
                        {lead.client_email}
                      </div>
                    </div>

                    {/* Badges Container */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* BADGE SEQUENCE (Comme status axe A) */}
                      <span className="px-2 py-0.5 bg-blue-900/40 border border-blue-500/30 text-blue-300 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                        <span>🔄</span> ÉTAPE {lead.email_sequence_step}
                      </span>

                      {lead.opted_out && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase">
                          🚫 DÉSABONNÉ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* COLONNE 2 : Engagement (Matches Montant Col) */}
                  <div>
                    <div className="pl-4 border-l border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Engagement
                      </div>
                      <div className="flex items-end gap-3 mb-2">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white leading-none">
                            {lead.total_opens}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            Ouvertures
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white leading-none">
                            {lead.total_clicks}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            Clics
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLONNE 3 : Timing (Matches Timeline Col) */}
                  <div>
                    <div className="pl-4 border-l border-white/5 space-y-2">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Prochaine relance
                        </div>
                        {(() => {
                          // Check if overdue
                          let isOverdue = false;
                          if (
                            nextFollowup !== "Immédiat" &&
                            nextFollowup !== "Terminé"
                          ) {
                            const [d, m, y] = nextFollowup.split("/");
                            if (d && m && y) {
                              const target = new Date(
                                parseInt(y),
                                parseInt(m) - 1,
                                parseInt(d)
                              );
                              const now = new Date();
                              now.setHours(0, 0, 0, 0);
                              if (target < now) isOverdue = true;
                            }
                          }

                          return (
                            <div
                              className={`text-sm font-bold ${
                                isOverdue
                                  ? "text-red-400 animate-pulse"
                                  : nextFollowup === "Immédiat" || isToday
                                  ? "text-green-400"
                                  : "text-white"
                              }`}
                            >
                              {isOverdue
                                ? `🔥 RETARD (${nextFollowup})`
                                : nextFollowup === "Immédiat"
                                ? "🔥 Immédiat"
                                : nextFollowup}
                            </div>
                          );
                        })()}
                      </div>

                      {lead.last_email_sent ? (
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                          <span>📧</span> Email envoyé le{" "}
                          {new Date(lead.last_email_sent).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] font-medium text-slate-600 italic mt-1">
                          💤 Aucun envoi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COLONNE 4 : Actions */}
                  <div className="flex flex-col gap-2 pl-4 border-l border-transparent">
                    {!lead.opted_out && (
                      <button
                        onClick={() => {
                          if (confirm(`Désabonner ${lead.client_name} ?`)) {
                            onSetOptOut(lead.client_email);
                          }
                        }}
                        className="w-full h-10 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                      >
                        🚫 Opt-out
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Supprimer définitivement ${lead.client_name} ?`
                          )
                        ) {
                          onDeleteLead(
                            lead.client_id,
                            lead.client_email,
                            lead.client_name
                          );
                        }
                      }}
                      className="w-full h-9 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
// ============================================
// AUTOPILOTE SOLAIRE FUSION - PARTIE 6/6
// Logs + Dashboard Principal + Export
// ============================================

// ============================================
// LOGS - HISTORIQUE DES DÉCISIONS
// ============================================
interface LogsProps {
  logs: DecisionLog[];
  zenMode: boolean;
}

export const Logs: React.FC<LogsProps> = ({ logs, zenMode }) => {
  if (zenMode) return null; // ✅ AVANT les hooks

  const [expanded, setExpanded] = useState(false);
  const displayLogs = expanded ? logs : logs.slice(0, 10);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📜</span>
          <div>
            <h2 className="text-2xl font-black text-white">
              LOGS DE DÉCISIONS
            </h2>
            <div className="text-sm text-slate-400">
              {logs.length} action{logs.length > 1 ? "s" : ""} enregistrée
              {logs.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
        {logs.length > 10 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {expanded ? "⬆️ Réduire" : `⬇️ Voir tous (${logs.length})`}
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-lg font-bold text-slate-400">
            Aucune action enregistrée
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Les décisions apparaîtront ici
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {displayLogs.map((log) => {
            const isRecent =
              new Date().getTime() - new Date(log.created_at).getTime();
            3600000;

            return (
              <div
                key={log.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRecent
                    ? "glass-panel bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "glass-panel border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-white">
                        {log.client_name}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold">
                        {log.action_performed}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">
                      {log.justification}
                    </p>
                    <div className="text-xs text-slate-500">
                      {getTimeAgo(log.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================
// ✅ COMPOSANT DASHBOARD PRINCIPAL
// ============================================
export default function Dashboard() {
  // ========================================
  // 1️⃣ TOUS LES HOOKS EN PREMIER
  // ========================================
  const dashboard = useDashboard();

  // États UI
  const [zenMode, setZenMode] = useState(false);
  const [priorityMode, setPriorityMode] = useState(false);
  const [hideSignedInPipeline, setHideSignedInPipeline] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeChart, setActiveChart] = useState<string | null>(null);

  // ✅ AJOUTE CES DEUX FONCTIONS ICI
  const onToggleZenMode = () => setZenMode(!zenMode);
  const onTogglePriorityMode = () => setPriorityMode(!priorityMode);

  // Filtres
  const [filters, setFilters] = useState<DashboardFilters>({
    search: "",
    views: null,
    clicks: null,
    status: null,
    optout: false,
  });

  // Modal override
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

  // ✅ CRITIQUE : Tous les useCallback AVANT tout return conditionnel
  const handleSignStudy = useCallback(
    (id: string, name: string) => {
      if (!dashboard?.actions) return;

      setOverrideModal({
        isOpen: true,
        title: "Forcer signature",
        message:
          "Cette action marquera le dossier comme signé même sans preuve d'engagement.",
        studyName: name,
        actionType: "force_sign",
        onConfirm: async (reason: string) => {
          await dashboard.actions.signStudy(id, name, true, reason);
          setOverrideModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    [dashboard?.actions]
  );

  const handleRefresh = useCallback(() => {
    if (!dashboard?.actions) return;
    dashboard.actions.refresh();
    setLastRefresh(new Date());
  }, [dashboard?.actions]);

  // ✅ FORMATAGE DES DONNÉES POUR LES GRAPHIQUES
  const formattedData = useMemo(() => {
    if (!dashboard?.studies) return [];

    // 1. On crée une map des 7 derniers jours
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    // 2. Initialisation des données
    const dataMap: Record<string, any> = last7Days.reduce((acc, date) => {
      acc[date] = { 
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), 
        dossiers: 0, 
        signatures: 0, 
        revenue: 0,  // ✅ CA total au lieu de cash_apport
        views: 0     // ✅ Vues de documents
      };
      return acc;
    }, {} as Record<string, any>);

    // 3. On remplit avec les vraies études
    dashboard.studies.forEach(study => {
      const dateKey = new Date(study.created_at).toISOString().split('T')[0];
      if (dataMap[dateKey]) {
        dataMap[dateKey].dossiers += 1;
        dataMap[dateKey].revenue += Number(study.total_price || 0); // ✅ CA total
        dataMap[dateKey].views += Number(study.views || 0); // ✅ Vues documents
        
        if (study.status === 'signed') {
          dataMap[dateKey].signatures += 1;
        }
      }
    });

    return Object.values(dataMap);
  }, [dashboard?.studies]);

  const getFilteredStudies = useCallback(() => {
    if (!dashboard?.studies || !priorityMode) return dashboard?.studies || [];

    return dashboard.studies.filter((s) => {
      if (s.status === "sent" && (s.views >= 5 || s.clicks >= 1)) return true;
      if (s.status === "signed" && !s.deposit_paid && s.requiresDeposit)
        return true;
      return false;
    });
  }, [dashboard?.studies, priorityMode]);

  // ✅ Calcul dérivé AVANT les returns
  const filteredStudies = getFilteredStudies();

  // ========================================
  // 2️⃣ RETURNS CONDITIONNELS (APRÈS tous les hooks)
  // ========================================
  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Initialisation du système…
      </div>
    );
  }

  const {
    studies,
    emailLeads,
    logs,
    metrics,
    financialStats,
    loading,
    systemInitialized,
    loadingProgress,
    loadingStep,
    error,
    emailFlowByClient,
    antiAnnulationByStudy,
    postRefusByStudy,
    actions,
  } = dashboard;

  // Afficher loading screen premium
  if (!systemInitialized) {
    return <LoadingScreen progress={loadingProgress} step={loadingStep} />;
  }

  // Afficher erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-8 max-w-2xl">
          <div className="text-6xl mb-4 text-center">❌</div>
          <h1 className="text-3xl font-black text-red-400 mb-4 text-center">
            ERREUR SYSTÈME
          </h1>
          <p className="text-red-300 text-center mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const systemStatus: "active" | "warning" | "critical" | "normal" =
    metrics.urgencyMode.level === "critical"
      ? "critical"
      : metrics.urgencyMode.level === "high"
      ? "warning"
      : metrics.urgencyMode.level === "medium"
      ? "active"
      : "normal";

  // --- CALCUL DU TAUX DE CONVERSION PAR CLIENT UNIQUE ---
  const totalClientsCount = new Set(studies.map((s) => s.name)).size;
  const signedClientsCount = new Set(
    studies.filter((s) => s.status === "signed").map((s) => s.name)
  ).size;
  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
      <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
          * {
            scrollbar-width: thin;
            scrollbar-color: #475569 #1e293b;
          }
          *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          *::-webkit-scrollbar-track {
            background: #1e293b;
          }
          *::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 4px;
          }
          *::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        `}</style>

      <Header
        zenMode={zenMode}
        priorityMode={priorityMode}
        onToggleZenMode={onToggleZenMode}
        onTogglePriorityMode={onTogglePriorityMode}
        onRefresh={actions.refresh}
        lastRefresh={lastRefresh}
        systemStatus={systemStatus}
        totalStudies={studies.length}
        // ✅ On branche les calculs de clients uniques ici :
        totalClients={totalClientsCount}
        signedClients={signedClientsCount}
        // ✅ STATS STRICTEMENT AXE C (Leads non convertis)
        unsubscribedCount={emailLeads.filter(l => !l.study_id && l.opted_out).length}
        unsubscribeRate={
          emailLeads.filter(l => !l.study_id).length > 0 
            ? (emailLeads.filter(l => !l.study_id && l.opted_out).length / emailLeads.filter(l => !l.study_id).length) * 100 
            : 0
        }
        onStatClick={(type) => setActiveChart(activeChart === type ? null : type)}

      />

      <div className="pt-28"></div>

      {/* ✅ GRAPHIQUES DE PILOTAGE STRATÉGIQUE (PRIMARY) */}
      <div className="container mx-auto px-6">
        <SteeringCharts studies={studies} emailLeads={emailLeads} activeTab={activeChart} />
      </div>

      {/* ✅ GRAPHIQUE CA MENSUEL (SECONDARY - REPORTING) */}
      <div className="container mx-auto px-6 mt-12 opacity-80 border-t border-white/5 pt-12">
        <h5 className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-8 text-center">Rapports de Performance Mensuels</h5>
        <MonthlyRevenueChart studies={studies} />
      </div>

      <main className="container mx-auto px-6 py-8 animate-fadeIn">
        {!zenMode && metrics && (
          <SystemState
            totalStudies={studies.length}
            activeStudies={studies.filter((s) => s.status === "sent").length}
            signedStudies={studies.filter((s) => s.status === "signed").length}
            securedStudies={
              studies.filter((s) => s.contract_secured === true).length
            }
            waitingStudies={
              studies.length -
              studies.filter((s) => s.status === "signed").length
            }
            totalLeads={emailLeads.length}
            activeLeads={emailLeads.filter((l) => !l.opted_out).length}
            totalEmailsSent={emailLeads.reduce(
              (sum, l) => sum + (l.email_sequence_step || 0),
              0
            )}
            pendingEmails={emailLeads.filter((l) => l.next_email_date).length}
            unsubscribedCount={emailLeads.filter((l) => l.opted_out).length}
            unsubscribeRate={
              emailLeads.length > 0
                ? (emailLeads.filter((l) => l.opted_out).length /
                    emailLeads.length) *
                  100
                : 0
            }
            onStatClick={(type) => setActiveChart(activeChart === type ? null : type)}

          />
        )}

        {/* ✅ ALERTE SYSTÈME - DESIGN ULTRA-PREMIUM MINIMALISTE */}
        {metrics?.urgencyMode?.active && (
          <div className="flex justify-center mb-10">
            <div
              className={`px-6 py-2.5 rounded-full border backdrop-blur-md flex items-center gap-6 shadow-2xl transition-all duration-500 hover:scale-[1.02]
              ${
                metrics.urgencyMode.level === "critical"
                  ? "bg-red-500/5 border-red-500/20 text-red-400 shadow-red-900/10"
                  : metrics.urgencyMode.level === "high"
                  ? "bg-orange-500/5 border-orange-500/20 text-orange-400 shadow-orange-900/10"
                  : "bg-blue-500/5 border-blue-500/20 text-blue-400 shadow-blue-900/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm animate-pulse">
                  {metrics.urgencyMode.level === "critical" ? "🔴" : "🟠"}
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  {metrics.urgencyMode.message}
                </span>
              </div>

              {metrics.urgencyMode.focus && (
                <>
                  <div className="h-4 w-px bg-white/10"></div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">
                      Action requise :
                    </span>
                    <span className="font-black text-white px-2 py-0.5 bg-white/5 rounded border border-white/5">
                      {metrics.urgencyMode.focus.name}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!zenMode && financialStats && (
          <FinancialStatsPanel stats={financialStats} />
        )}

        {!zenMode &&
          metrics &&
          metrics.finance.riskyDeposits &&
          metrics.finance.riskyDeposits.length > 0 && (
            <div className="mb-8">
              <style>{`
        @keyframes skull-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.4),
                        0 0 40px rgba(239, 68, 68, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.6),
                        0 0 60px rgba(239, 68, 68, 0.3);
          }
        }
        .skull-premium {
          animation: skull-pulse 3s ease-in-out infinite;
        }
      `}</style>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider">
                    À TRAITER AUJOURD'HUI
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {metrics.finance.riskyDeposits.slice(0, 5).map((study) => (
                  <div
                    key={study.id}
                    className="rounded-2xl p-6 transition-all duration-300"
                    style={{
                      background: "rgba(30, 41, 59, 0.3)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderLeft: "3px solid rgba(239, 68, 68, 0.6)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                          <div
                            className="skull-premium relative w-16 h-16 rounded-full flex items-center justify-center border-2 border-red-500/50"
                            style={{
                              background: "rgba(30, 41, 59, 0.8)",
                              backdropFilter: "blur(10px)",
                              WebkitBackdropFilter: "blur(10px)",
                            }}
                          >
                            <span className="text-3xl">💀</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {study.name}
                          </h3>
                          <p className="text-sm text-slate-400 mb-3">
                            {study.email}
                          </p>

                          <div className="flex items-center gap-3">
                            <div
                              className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2"
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                              }}
                            >
                              <span>🔥</span>
                              <span className="text-red-400">AGITÉ</span>
                            </div>

                            <div
                              className="px-3 py-1 rounded-lg text-xs font-semibold"
                              style={{
                                background: "rgba(100, 116, 139, 0.2)",
                                border: "1px solid rgba(148, 163, 184, 0.3)",
                              }}
                            >
                              <span className="text-slate-300">
                                J+{study.daysLate}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>
                                👁{" "}
                                <span className="text-white font-semibold">
                                  {study.views}
                                </span>
                              </span>
                              <span>
                                🖱{" "}
                                <span className="text-white font-semibold">
                                  {study.clicks}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">
                          Acompte en retard
                        </div>
                        <div className="text-2xl font-black text-red-400 mb-2">
                          {study.daysLate} jours
                        </div>
                        <div className="text-sm text-slate-500">
                          Risque :{" "}
                          <span className="text-white font-bold">
                            {formatCurrency(study.total_price || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-shrink-0">
                        <button
                          onClick={() => {
                            if (study.phone) {
                              window.location.href = `tel:${study.phone}`;
                            }
                          }}
                          className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center gap-2"
                          style={{
                            background: "rgba(220, 38, 38, 0.2)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(239, 68, 68, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(220, 38, 38, 0.2)";
                          }}
                        >
                          📞 APPELER
                        </button>
                        <button
                          onClick={() => {
                            const frontendUrl =
                              process.env.NEXT_PUBLIC_FRONTEND_URL || "";
                            if (frontendUrl) {
                              window.open(
                                `${frontendUrl}/guest/${study.id}`,
                                "_blank"
                              );
                            }
                          }}
                          className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center gap-2"
                          style={{
                            background: "rgba(100, 116, 139, 0.2)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(148, 163, 184, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(100, 116, 139, 0.2)";
                          }}
                        >
                          📄 VOIR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    const element = document.getElementById(
                      "late-deposits-section"
                    );
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center gap-2"
                  style={{
                    background: "rgba(51, 65, 85, 0.3)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(100, 116, 139, 0.3)",
                  }}
                >
                </button>
              </div>
            </div>
          )}

        {metrics && metrics.warRoom.studies.length > 0 && (
          <>
            {/* ✅ EXECUTION DESK - CENTRE DE COMMANDE OPÉRATIONNEL */}
            <ExecutionDesk
              show={metrics.urgencyMode.active}
              priority={metrics.urgencyMode.focus}
              onPrimaryAction={() => {
                if (metrics.urgencyMode.focus?.phone) {
                  window.location.href = `tel:${metrics.urgencyMode.focus.phone}`;
                }
                const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "";
                if (frontendUrl && metrics.urgencyMode.focus?.id) {
                  window.open(`${frontendUrl}/guest/${metrics.urgencyMode.focus.id}`, "_self");
                }

                setTimeout(() => {
                  const element = document.getElementById("war-room-section");
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }, 100);
              }}
              onScrollToWarRoom={() => {
                const element = document.getElementById("war-room-section");
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            />

            <WarRoom
              metrics={metrics}
              antiAnnulationByStudy={antiAnnulationByStudy}
              postRefusByStudy={postRefusByStudy}
              leads={emailLeads}
              onSignStudy={actions.signStudy} // ✅ CORRIGÉ
              onMarkDepositPaid={actions.markDepositPaid} // ✅ CORRIGÉ
              onMarkRibSent={actions.markRibSent} // ✅ CORRIGÉ
              onCancelStudy={actions.cancelStudy} // ✅ CORRIGÉ
              onDeleteStudy={actions.deleteStudy} // ✅ CORRIGÉ
            />
          </>
        )}

        {!zenMode && (
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setHideSignedInPipeline(!hideSignedInPipeline)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                hideSignedInPipeline
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
              }`}
            >
              {hideSignedInPipeline
                ? "✅ Signés masqués dans Pipeline"
                : "👁️ Afficher signés dans Pipeline"}
            </button>
          </div>
        )}

        {metrics && (
          <SignedStudies
            studies={studies}
            metrics={metrics}
            antiAnnulationByStudy={antiAnnulationByStudy}
            postRefusByStudy={postRefusByStudy}
            leads={emailLeads}
            onSignStudy={actions.signStudy} 
            onMarkDepositPaid={actions.markDepositPaid}
            onMarkRibSent={actions.markRibSent}
            onCancelStudy={actions.cancelStudy}
            onDeleteStudy={actions.deleteStudy}
          />
        )}

        {/* --- SEPARATION VISUELLE --- */}
        {!zenMode && (
          <div className="my-12 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative bg-[#020617] px-4 text-slate-500 text-sm font-bold tracking-widest uppercase">
              Pipeline Commercial (En Cours)
            </div>
          </div>
        )}

        {!zenMode && <Filters filters={filters} onFilterChange={setFilters} />}

        <Pipeline
          studies={filteredStudies}
          filters={filters}
          hideSignedInPipeline={hideSignedInPipeline}
          emailFlowByClient={emailFlowByClient}
          antiAnnulationByStudy={antiAnnulationByStudy}
          postRefusByStudy={postRefusByStudy}
          leads={emailLeads}
          onSignStudy={actions.signStudy}
          onCancelStudy={actions.cancelStudy}
          onDeleteStudy={actions.deleteStudy}
        />

        {!zenMode && (
          <EmailLeads
            leads={emailLeads}
            onSetOptOut={actions.setOptOut}
            onDeleteLead={actions.deleteLeadPermanently}
          />
        )}

        <Logs logs={logs} zenMode={zenMode} />
      </main>

      <OverrideModal
        isOpen={overrideModal.isOpen}
        title={overrideModal.title}
        message={overrideModal.message}
        studyName={overrideModal.studyName}
        actionType={overrideModal.actionType}
        onConfirm={overrideModal.onConfirm}
        onCancel={() => setOverrideModal({ ...overrideModal, isOpen: false })}
      />

      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-xl py-6 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              AUTOPILOTE SOLAIRE v2.0 · Nicolas Di Stefano
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>🔒 Données sécurisées</span>
              <span>⚡ Temps réel</span>
              <span>🤖 Automatisé</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
