console.log("⚠️ ATTENTION : ANCIEN DASHBOARD0 CHARGÉ !");
// ============================================
// AUTOPILOTE SOLAIRE - PARTIE 1/5
// Configuration, Types & Utilitaires
// ============================================
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

// ============================================
// CONFIGURATION SUPABASE
// ============================================

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
import { supabase } from "../lib/supabase";

// ============================================
// TYPES BASE DE DONNÉES (STRUCTURES RÉELLES)
// ============================================

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  email_optout: boolean;
}

export interface StudyData {
  installCost?: number;
  address?: string;
  mode?: "cash" | "financement";
  cashApport?: number;
  [key: string]: any;
}

export interface Study {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone?: string;
  status: "draft" | "sent" | "signed" | "cancelled";
  created_at: string;
  signed_at: string | null;
  study_data: StudyData | null;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  views: number;
  clicks: number;
  diffDays: number;
  hasLog: boolean;
  rib_sent: boolean;
  rib_sent_at: string | null;
  email_optout: boolean;
  last_open: string | null;
  last_click: string | null;
  last_view: string | null;
}

export interface EmailLead {
  id: string;
  client_id: string;
  name: string;
  email: string;
  created_at: string;
  last_email_sent: string | null;
  next_email_date: string | null;
  email_sequence_step: number;
  opted_out: boolean;
  total_opens: number;
  total_clicks: number;
  last_open: string | null;
  last_click: string | null;
}

export interface DecisionLog {
  id: string;
  study_id?: string;
  client_name: string;
  action_performed: string;
  justification: string;
  created_at: string;
}

export interface EmailQueue {
  study_id: string;
  client_id: string;
  email_type: string;
  status: "pending" | "sent" | "cancelled";
  sent_at: string | null;
  scheduled_for: string | null;
}

export interface EmailFlow {
  step: number;
  last: string | null;
  next: string | null;
  opens: number;
  clicks: number;
  opted_out: boolean;
}

export interface AntiAnnulationFlow {
  sent: EmailQueue[];
  next: EmailQueue | null;
}

export interface Metrics {
  signed: Study[];
  sent: Study[];
  riskyDeposits: Study[];
  veryHotLeads: Study[];
  coldSigned: Study[];
  caSigned: number;
  cashSecured: number;
  riskScore: number;
  cashScore: number;
  salesScore: number;
  mode: string;
}

export interface DashboardFilters {
  search: string;
  views: string | null;
  clicks: string | null;
  status: string | null;
  optout: boolean;
}

export interface LeadFilters {
  search: string;
  today: boolean;
  optedOut: boolean;
}

// ============================================
// CONSTANTES
// ============================================

export const STATUS_LABELS = {
  draft: "DRAFT",
  sent: "SENT",
  signed: "SIGNED",
  cancelled: "CANCELLED",
} as const;

export const TEMP_LABELS = {
  cold: {
    label: "FROID",
    class: "bg-slate-500/20 text-slate-300 border-slate-500",
  },
  warm: {
    label: "TIÈDE",
    class: "bg-blue-500/20 text-blue-300 border-blue-500",
  },
  hot: {
    label: "CHAUD",
    class: "bg-orange-500/20 text-orange-300 border-orange-500",
  },
  signed: {
    label: "SIGNÉ",
    class: "bg-emerald-500/20 text-emerald-300 border-emerald-500",
  },
} as const;

// ============================================
// UTILITAIRES - CALCUL MÉTRIQUES
// ============================================

export function computeEduMetrics(data: Study[]): Metrics {
  const now = new Date();

  const signed = data.filter((d) => d.status === "signed");
  const sent = data.filter((d) => d.status === "sent");

  const riskyDeposits = signed.filter((s) => {
    if (s.deposit_paid) return false;
    if (s.study_data?.mode === "financement" && !s.deposit_amount) return false;
    const days =
      (now.getTime() - new Date(s.signed_at || s.created_at).getTime()) /
      86400000;
    return days > 10;
  });

  const veryHotLeads = sent.filter((s) => s.views >= 5);
  const coldSigned = signed.filter((s) => s.views < 2);

  const caSigned = signed.reduce(
    (t, s) => t + (s.study_data?.installCost || 0),
    0
  );
  const cashSecured = signed
    .filter((s) => s.deposit_paid)
    .reduce((t, s) => t + (s.deposit_amount || 0), 0);

  const riskScore = Math.min(
    100,
    riskyDeposits.length * 20 + coldSigned.length * 10
  );
  const cashScore = Math.min(100, (cashSecured / (caSigned || 1)) * 100);
  const salesScore = Math.min(100, veryHotLeads.length * 12);

  let mode = "ACCÉLÉRATION";
  if (riskScore > 60) mode = "URGENCE";
  else if (cashScore < 30) mode = "CHASSE CASH";
  else if (veryHotLeads.length > 6) mode = "CLOSING";

  return {
    signed,
    sent,
    riskyDeposits,
    veryHotLeads,
    coldSigned,
    caSigned,
    cashSecured,
    riskScore,
    cashScore,
    salesScore,
    mode,
  };
}

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

export function getLeadTemperature(
  study: Study
): "cold" | "warm" | "hot" | "signed" {
  if (study.status === "signed") return "signed";
  if (study.clicks > 0) return "hot";
  if (study.views >= 2) return "warm";
  return "cold";
}

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
  const daysSinceLastEmail = Math.floor(
    (now.getTime() - lastSent.getTime()) / 86400000
  );

  if (daysSinceCreation > 120) return "Terminé";

  if (daysSinceCreation <= 60) {
    if (daysSinceLastEmail >= 3) return "Dû";
    const next = new Date(lastSent);
    next.setDate(next.getDate() + 3);
    return next.toLocaleDateString("fr-FR");
  }

  if (daysSinceLastEmail >= 7) return "Dû";
  const next = new Date(lastSent);
  next.setDate(next.getDate() + 7);
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

export function detectAnomalies(
  studies: Study[],
  settings = { view_threshold: 5, day_threshold: 3 }
): string[] {
  const anomalies: string[] = [];

  studies.forEach((s) => {
    if (
      s.status === "sent" &&
      s.views > settings.view_threshold &&
      s.clicks === 0
    ) {
      anomalies.push(s.id);
    }
    if (
      s.status === "signed" &&
      s.diffDays > settings.day_threshold &&
      s.views < 2
    ) {
      anomalies.push(s.id);
    }
  });

  return anomalies;
}

// ============================================
// MAPPING DB → DISPLAY
// ============================================

export function mapStudyToDisplay(s: any, stats: any[]): Study {
  const st = stats.find((item) => item.id === s.id) || {};
  const diffDays = getDaysSince(s.created_at);

  let views = st.email_opens ?? st.views ?? st.total_opens ?? 0;
  let clicks = st.interactions ?? st.clicks ?? st.total_clicks ?? 0;

  return {
    id: s.id,
    client_id: s.clients?.id || "",
    name: s.clients
      ? `${s.clients.first_name || ""} ${s.clients.last_name || ""}`.trim()
      : "Inconnu",
    email: s.clients?.email || "Pas d'email",
    phone: s.clients?.phone,
    status: s.status,
    created_at: s.created_at,
    signed_at: s.signed_at,
    study_data: s.study_data,
    deposit_amount: s.deposit_amount || 0,
    deposit_paid: s.deposit_paid || false,
    deposit_paid_at: s.deposit_paid_at,
    views,
    clicks,
    diffDays: Math.floor(diffDays),
    hasLog: false, // Sera calculé après chargement des logs
    rib_sent: s.rib_sent || false,
    rib_sent_at: s.rib_sent_at,
    email_optout: s.clients?.email_optout || false,
    last_open: st.last_open || st.last_open_at || st.last_email_open || null,
    last_click: st.last_click || st.last_click_at || null,
    last_view: st.last_view || null,
  };
}

export function mapEmailLeadToDisplay(
  l: any,
  studyIdByClientId: Record<string, string>,
  lastOpenByStudyId: Record<string, string>,
  lastClickByStudyId: Record<string, string>
): EmailLead {
  const studyId = studyIdByClientId[l.client_id];
  const lastOpen =
    l.last_opened_at || (studyId ? lastOpenByStudyId[studyId] : null) || null;
  const lastClick =
    l.last_clicked_at || (studyId ? lastClickByStudyId[studyId] : null) || null;

  return {
    id: l.id,
    client_id: l.client_id,
    created_at: l.created_at,
    name: l.clients
      ? `${l.clients.first_name || ""} ${l.clients.last_name || ""}`.trim()
      : "Inconnu",
    email: l.clients?.email || "Pas d'email",
    last_email_sent: l.last_email_sent_at,
    next_email_date: l.next_email_scheduled_at,
    email_sequence_step: l.email_step || 0,
    opted_out: l.clients?.email_optout || false,
    total_opens: l.total_opens || 0,
    total_clicks: l.total_clicks || 0,
    last_open: lastOpen,
    last_click: lastClick,
  };
}
// ============================================
// AUTOPILOTE SOLAIRE - PARTIE 2/5
// Hook useDashboard - Logique métier complète
// ===========================================

// ============================================
// HOOK useDashboard - GESTION COMPLÈTE DES DONNÉES
// ============================================

export function useDashboard() {
  // États principaux
  const [studies, setStudies] = useState<Study[]>([]);
  const [emailLeads, setEmailLeads] = useState<EmailLead[]>([]);
  const [logs, setLogs] = useState<DecisionLog[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États avancés pour email automation
  const [emailFlowByClient, setEmailFlowByClient] = useState<
    Record<string, any>
  >({});
  const [antiAnnulationByStudy, setAntiAnnulationByStudy] = useState<
    Record<string, any>
  >({});
  const [postRefusByStudy, setPostRefusByStudy] = useState<Record<string, any>>(
    {}
  );

  // ============================================
  // CHARGEMENT DONNÉES PRINCIPALES
  // ============================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Charger études avec clients
      const { data: studiesData, error: studiesError } = await supabase
        .from("studies")
        .select("*, clients(*)");

      if (studiesError) throw studiesError;

      // 2️⃣ Charger stats d'activité
      let stats: any[] = [];
      const statsRes = await supabase
        .from("studies_activity_summary_v2")
        .select("*");

      if (statsRes.error) {
        const statsRes2 = await supabase.from("email_stats").select("*");
        stats = statsRes2.data || [];
      } else {
        stats = statsRes.data || [];
      }

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

      const queueEmails = queueData || [];

      // 5️⃣ Indexer anti-annulation par study
      const antiAnnulation: Record<string, any> = {};
      queueEmails.forEach((e) => {
        if (!e.study_id || !e.email_type?.startsWith("anti_")) return;
        if (!antiAnnulation[e.study_id]) {
          antiAnnulation[e.study_id] = { sent: [], next: null };
        }
        if (e.status === "sent") {
          antiAnnulation[e.study_id].sent.push(e);
        }
        if (e.status === "pending") {
          const current = antiAnnulation[e.study_id].next;
          if (
            !current ||
            new Date(e.scheduled_for!) < new Date(current.scheduled_for!)
          ) {
            antiAnnulation[e.study_id].next = e;
          }
        }
      });
      setAntiAnnulationByStudy(antiAnnulation);

      // 6️⃣ Indexer post-refus par study
      const postRefus: Record<string, any> = {};
      queueEmails
        .filter((q) => q.email_type?.startsWith("post_refus"))
        .forEach((q) => {
          if (!postRefus[q.study_id]) {
            postRefus[q.study_id] = { sent: [], next: null };
          }
          if (q.status === "sent") {
            postRefus[q.study_id].sent.push(q);
          }
          if (q.status === "pending") {
            const currentNext = postRefus[q.study_id].next;
            if (
              !currentNext ||
              new Date(q.scheduled_for!) < new Date(currentNext.scheduled_for!)
            ) {
              postRefus[q.study_id].next = q;
            }
          }
        });
      setPostRefusByStudy(postRefus);

      // 7️⃣ Mapper études avec stats
      const mappedStudies: Study[] = (studiesData || []).map((s) => {
        const mapped = mapStudyToDisplay(s, stats);
        const logsForStudy = (logsData || []).filter(
          (l) => l.study_id === s.id
        );
        return { ...mapped, hasLog: logsForStudy.length > 0 };
      });

      setStudies(mappedStudies);

      // 8️⃣ Calculer métriques EDU
      const computedMetrics = computeEduMetrics(mappedStudies);
      setMetrics(computedMetrics);
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

      if (studyIds.length > 0) {
        // Dernières ouvertures
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

        // Derniers clics
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

      // Mapper leads
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
  // CHARGEMENT INITIAL + AUTO-REFRESH
  // ============================================

  useEffect(() => {
    loadData();
    loadEmailLeads();

    // Auto-refresh toutes les 60 secondes
    const interval = setInterval(() => {
      loadData();
      loadEmailLeads();
    }, 60000);

    return () => clearInterval(interval);
  }, [loadData, loadEmailLeads]);

  // ============================================
  // RETOUR DU HOOK
  // ============================================

  return {
    // Données
    studies,
    emailLeads,
    logs,
    metrics,
    loading,
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
      setOptOut,
      deleteLeadPermanently,
      deleteStudy,
      logForceAction,
      refresh,
    },
  };
}
// ============================================
// AUTOPILOTE SOLAIRE - PARTIE 3/5
// Composants UI - Header, Modals, SystemState
// ============================================

// ============================================
// HEADER - NAVIGATION PRINCIPALE
// ============================================

interface HeaderProps {
  zenMode: boolean;
  priorityMode: boolean;
  onToggleZenMode: () => void;
  onTogglePriorityMode: () => void;
  onRefresh: () => void;
  lastRefresh?: Date;
  systemStatus?: "normal" | "active" | "warning" | "critical";
}

export const Header: React.FC<HeaderProps> = ({
  zenMode,
  priorityMode,
  onToggleZenMode,
  onTogglePriorityMode,
  onRefresh,
  lastRefresh,
  systemStatus = "normal",
}) => {
  const getStatusColor = () => {
    switch (systemStatus) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      case "active":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = () => {
    switch (systemStatus) {
      case "critical":
        return "CRITIQUE";
      case "warning":
        return "ATTENTION";
      case "active":
        return "ACTIF";
      default:
        return "NORMAL";
    }
  };

  return (
    <header className="glass border-b border-slate-800 sticky top-0 z-50 backdrop-blur-xl">
      <style>{`
        .glass { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(20px); }
      `}</style>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  AUTOPILOTE SOLAIRE
                </h1>
                <div className="text-xs text-slate-400">
                  Nicolas Di Stefano · Dashboard Commercial
                </div>
              </div>
            </div>

            {/* Statut système */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}
              ></div>
              <span className="text-sm font-bold text-slate-300">
                {getStatusLabel()}
              </span>
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center gap-3">
            {/* Dernier refresh */}
            {lastRefresh && (
              <div className="hidden md:block text-xs text-slate-500">
                Actualisé : {lastRefresh.toLocaleTimeString("fr-FR")}
              </div>
            )}

            {/* Bouton refresh */}
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              <span className="text-lg">🔄</span>
              <span className="hidden md:inline">Actualiser</span>
            </button>

            {/* Mode priorité */}
            <button
              onClick={onTogglePriorityMode}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                priorityMode
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-500/50"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
              }`}
            >
              <span className="text-lg">🔥</span>
              <span className="hidden md:inline">
                {priorityMode ? "Mode Priorité" : "Priorité"}
              </span>
            </button>

            {/* Mode zen */}
            <button
              onClick={onToggleZenMode}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                zenMode
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
              }`}
            >
              <span className="text-lg">🧘</span>
              <span className="hidden md:inline">
                {zenMode ? "Mode Zen" : "Zen"}
              </span>
            </button>

            {/* Menu utilisateur */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                ND
              </div>
              <div className="hidden lg:block">
                <div className="text-sm font-bold text-white">Nicolas</div>
                <div className="text-xs text-slate-400">Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre d'info modes actifs */}
        {(zenMode || priorityMode) && (
          <div className="mt-3 flex items-center gap-2">
            {zenMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs">
                <span>🧘</span>
                <span className="text-purple-300">
                  Mode Zen activé : Interface simplifiée
                </span>
              </div>
            )}
            {priorityMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-xs">
                <span>🔥</span>
                <span className="text-orange-300">
                  Mode Priorité activé : Focus sur HOTs et urgences
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
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
// OVERRIDE MODAL - SÉCURITÉ ACTIONS CRITIQUES
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

  const C = MODAL_COLORS[color];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl animate-slideUp">
        {/* Header */}
        <div className={`${C.header} border-b-2 p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                {actionType === "force_sign" && "✅"}
                {actionType === "delete" && "🗑️"}
                {actionType === "override" && "⚠️"}
                {title}
              </h3>
              {studyName && (
                <div className="text-sm text-slate-300">
                  Dossier : <span className="font-bold">{studyName}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {message && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300 leading-relaxed">{message}</p>
            </div>
          )}

          <div className={`${C.warn} rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className={`${C.text} font-bold text-sm mb-1`}>
                  Action critique - Justification requise
                </div>
                <div className={`${C.softText} text-xs`}>
                  Cette action sera enregistrée dans les logs.
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Justification obligatoire :
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={loading}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 border-t border-slate-700 p-6 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold"
          >
            ❌ Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || reason.trim().length < 10}
            className={`px-6 py-3 ${C.button} text-white rounded-lg font-bold`}
          >
            {loading ? "Traitement..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SYSTEM STATE - ÉTAT DU SYSTÈME
// ============================================

interface SystemStateProps {
  totalStudies: number;
  activeStudies: number;
  signedStudies: number;
  totalLeads: number;
  activeLeads: number;
  coldLeads: number;
  totalEmailsSent: number;
  pendingEmails: number;
}

export const SystemState: React.FC<SystemStateProps> = ({
  totalStudies,
  activeStudies,
  signedStudies,
  totalLeads,
  activeLeads,
  coldLeads,
  totalEmailsSent,
  pendingEmails,
}) => {
  return (
    <div className="glass border border-slate-700/40 hover:border-slate-600 p-6 rounded-xl mb-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        ÉTAT DU SYSTÈME
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {/* Études */}
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <div className="text-blue-400 text-xs uppercase mb-1">
            Total Études
          </div>
          <div className="text-3xl font-bold text-blue-300">{totalStudies}</div>
        </div>

        <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/30">
          <div className="text-cyan-400 text-xs uppercase mb-1">Actives</div>
          <div className="text-3xl font-bold text-cyan-300">
            {activeStudies}
          </div>
        </div>

        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
          <div className="text-green-400 text-xs uppercase mb-1">Signées</div>
          <div className="text-3xl font-bold text-green-300">
            {signedStudies}
          </div>
        </div>

        {/* Leads */}
        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
          <div className="text-purple-400 text-xs uppercase mb-1">
            Total Leads
          </div>
          <div className="text-3xl font-bold text-purple-300">{totalLeads}</div>
        </div>

        <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
          <div className="text-orange-400 text-xs uppercase mb-1">
            Leads Actifs
          </div>
          <div className="text-3xl font-bold text-orange-300">
            {activeLeads}
          </div>
        </div>

        <div className="bg-slate-500/10 rounded-lg p-4 border border-slate-500/30">
          <div className="text-slate-400 text-xs uppercase mb-1">Froids</div>
          <div className="text-3xl font-bold text-slate-300">{coldLeads}</div>
        </div>

        {/* Emails */}
        <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/30">
          <div className="text-indigo-400 text-xs uppercase mb-1">
            Emails Envoyés
          </div>
          <div className="text-3xl font-bold text-indigo-300">
            {totalEmailsSent}
          </div>
        </div>

        <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
          <div className="text-amber-400 text-xs uppercase mb-1">
            En Attente
          </div>
          <div className="text-3xl font-bold text-amber-300">
            {pendingEmails}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CRITICAL ALERT - ALERTES CRITIQUES
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
            <p className="text-red-300">{message}</p>
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
// AUTOPILOTE SOLAIRE - PARTIE 4/5
// War Room, Pipeline & Stats
// ============================================

// ============================================
// WAR ROOM - ZONE D'ACTION PRIORITAIRE
// ============================================

interface WarRoomProps {
  metrics: Metrics;
  criticalStudies?: Study[];
  onActionRequired: (studyId: string) => void;
  onForceSign: (studyId: string, clientName: string) => void;
  scrollIntoView?: boolean;
}

export const WarRoom: React.FC<WarRoomProps> = ({
  metrics,
  criticalStudies,
  onActionRequired,
  onForceSign,
  scrollIntoView = false,
}) => {
  const warRoomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll si demandé
  useEffect(() => {
    if (scrollIntoView && warRoomRef.current) {
      warRoomRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [scrollIntoView]);

  // Détection du niveau d'urgence
  const getUrgencyLevel = () => {
    const hotsSignable = metrics.veryHotLeads?.length || 0;
    const atRisk = metrics.riskyDeposits?.length || 0;
    const totalActive = metrics.sent?.length || 0;

    if (hotsSignable >= 3 || atRisk >= 2) {
      return {
        label: "CRITIQUE",
        color: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500",
      };
    }
    if (hotsSignable >= 1 || atRisk >= 1) {
      return {
        label: "ATTENTION",
        color: "text-orange-400",
        bg: "bg-orange-500/20",
        border: "border-orange-500",
      };
    }
    if (totalActive >= 5) {
      return {
        label: "ACTIF",
        color: "text-blue-400",
        bg: "bg-blue-500/20",
        border: "border-blue-500",
      };
    }
    return {
      label: "NORMAL",
      color: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500",
    };
  };

  const urgency = getUrgencyLevel();
  const hotsSignable = metrics.veryHotLeads?.length || 0;
  const atRisk = metrics.riskyDeposits?.length || 0;
  const totalActive = metrics.sent?.length || 0;
  const potentialRevenue =
    metrics.sent?.reduce(
      (sum, s) => sum + (s.study_data?.installCost || 0),
      0
    ) || 0;
  const conversionRate =
    totalActive > 0
      ? Math.round(
          ((metrics.signed?.length || 0) /
            (metrics.signed?.length + totalActive)) *
            100
        )
      : 0;

  return (
    <div
      ref={warRoomRef}
      className={`glass border-2 ${urgency.border} p-6 rounded-xl scroll-mt-4 mb-8`}
    >
      {/* Header War Room */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            WAR ROOM
            <span
              className={`${urgency.bg} ${urgency.color} px-3 py-1 rounded-lg text-sm font-bold border border-current/30`}
            >
              {urgency.label}
            </span>
          </h2>
          <div className="text-sm text-slate-400 mt-1">
            Zone d'action prioritaire · Éducation Cockpit Closer
          </div>
        </div>
      </div>

      {/* Métriques EDU */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {/* Total Actifs */}
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <div className="text-blue-400 text-xs uppercase mb-1">Actifs</div>
          <div className="text-3xl font-bold text-blue-300">{totalActive}</div>
          <div className="text-xs text-blue-500/70 mt-1">En pipeline</div>
        </div>

        {/* HOTs Signables */}
        <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
          <div className="text-orange-400 text-xs uppercase mb-1 flex items-center gap-1">
            🔥 HOTs
          </div>
          <div className="text-3xl font-bold text-orange-300">
            {hotsSignable}
          </div>
          <div className="text-xs text-orange-500/70 mt-1">Signables</div>
        </div>

        {/* À risque */}
        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
          <div className="text-red-400 text-xs uppercase mb-1 flex items-center gap-1">
            ⚠️ Risque
          </div>
          <div className="text-3xl font-bold text-red-300">{atRisk}</div>
          <div className="text-xs text-red-500/70 mt-1">Attention</div>
        </div>

        {/* Nouveaux */}
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
          <div className="text-green-400 text-xs uppercase mb-1">Nouveaux</div>
          <div className="text-3xl font-bold text-green-300">
            {metrics.sent?.filter((s) => getDaysSince(s.created_at) < 3)
              .length || 0}
          </div>
          <div className="text-xs text-green-500/70 mt-1">Récents</div>
        </div>

        {/* CA Potentiel */}
        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
          <div className="text-purple-400 text-xs uppercase mb-1">
            CA Potentiel
          </div>
          <div className="text-xl font-bold text-purple-300">
            {formatCurrency(potentialRevenue)}
          </div>
          <div className="text-xs text-purple-500/70 mt-1">En jeu</div>
        </div>

        {/* Taux conversion */}
        <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/30">
          <div className="text-cyan-400 text-xs uppercase mb-1">Conversion</div>
          <div className="text-3xl font-bold text-cyan-300">
            {conversionRate}%
          </div>
          <div className="text-xs text-cyan-500/70 mt-1">Efficacité</div>
        </div>
      </div>

      {/* Dossiers critiques */}
      {criticalStudies && criticalStudies.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🚨</span>
            Dossiers nécessitant une action ({criticalStudies.length})
          </h3>

          <div className="space-y-2">
            {criticalStudies.map((study) => {
              const isHot = study.views >= 5;
              const isAtRisk =
                study.status === "sent" && getDaysSince(study.created_at) > 7;

              return (
                <div
                  key={study.id}
                  className={`
                    ${
                      isHot
                        ? "bg-orange-500/10 border-orange-500/50"
                        : "bg-slate-800/50 border-slate-700/30"
                    }
                    rounded-lg p-4 border hover:border-slate-600 transition-colors
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Info dossier */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isHot && <span className="text-xl">🔥</span>}
                        {isAtRisk && <span className="text-xl">⚠️</span>}
                        <span className="font-bold text-white">
                          {study.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          #{study.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="text-sm text-slate-300 mb-2">
                        {study.study_data?.address || "Adresse non renseignée"}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {/* Statut */}
                        <span
                          className={`px-2 py-1 rounded ${
                            study.status === "sent"
                              ? "bg-blue-500/20 text-blue-300"
                              : study.status === "signed"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {study.status === "sent" && "📤 Envoyé"}
                          {study.status === "signed" && "✅ Signé"}
                          {study.status === "draft" && "📝 Brouillon"}
                        </span>

                        {/* Prix */}
                        {study.study_data?.installCost && (
                          <span className="text-slate-400">
                            💰 {formatCurrency(study.study_data.installCost)}
                          </span>
                        )}

                        {/* Date */}
                        <span className="text-slate-400">
                          📅 {formatDate(study.created_at)}
                        </span>

                        {/* Jours */}
                        <span
                          className={`${
                            getDaysSince(study.created_at) > 7
                              ? "text-red-400 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          ⏱️ {getDaysSince(study.created_at)}j
                        </span>

                        {/* Vues */}
                        <span className="text-slate-400">
                          👁️ {study.views} vues
                        </span>
                      </div>

                      {/* Raison critique */}
                      {isHot && (
                        <div className="mt-2 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded inline-block">
                          🔥 HOT - À signer en priorité
                        </div>
                      )}
                      {isAtRisk && (
                        <div className="mt-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded inline-block">
                          ⚠️ Risque - Relance nécessaire
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {study.status === "sent" && (
                        <button
                          onClick={() => onForceSign(study.id, study.name)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
                        >
                          ✅ Forcer signature
                        </button>
                      )}

                      <button
                        onClick={() => onActionRequired(study.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors whitespace-nowrap"
                      >
                        👁️ Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
          <span className="text-4xl block mb-2">✅</span>
          <p className="text-green-400 font-bold">
            Aucune action critique requise
          </p>
          <p className="text-sm text-green-500/70 mt-1">
            Tous les dossiers sont sous contrôle
          </p>
        </div>
      )}
    </div>
  );
};
// ============================================
// SIGNED STUDIES
// ============================================

interface SignedStudiesProps {
  studies: Study[];
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const SignedStudies: React.FC<SignedStudiesProps> = ({ studies }) => {
  const signedStudies = studies.filter((s) => s.status === "signed");

  return (
    <div className="glass border border-emerald-500/20 rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-emerald-400 mb-4">
        ✅ AXE A : COMMANDES VALIDÉES
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signedStudies.map((s) => (
          <div
            key={s.id}
            className="bg-slate-950 border border-slate-800 p-4 rounded-lg"
          >
            <div className="font-bold text-white">{s.name}</div>
            <div className="text-sm text-slate-400">
              {s.study_data?.address}
            </div>
            <div className="text-emerald-400 font-bold mt-2">
              {formatCurrency(s.study_data?.installCost || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// PIPELINE - GESTION DOSSIERS ACTIFS
// ============================================

interface PipelineProps {
  studies: Study[];
  onStatusChange: (
    studyId: string,
    newStatus: "draft" | "sent" | "signed",
    name: string
  ) => void;
  onForceSign: (studyId: string, name: string) => void;
  anomalyIds?: string[];
}

export const Pipeline: React.FC<PipelineProps> = ({
  studies,
  onStatusChange,
  onForceSign,
  anomalyIds = [],
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "sent">(
    "sent"
  );
  const [showAnomalies, setShowAnomalies] = useState(false);

  const filteredStudies = useMemo(() => {
    let filtered = studies;

    // Filtre anomalies
    if (showAnomalies) {
      filtered = filtered.filter((s) => anomalyIds.includes(s.id));
    }

    // Filtre statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Recherche
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.study_data?.address &&
            s.study_data.address.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [studies, search, statusFilter, showAnomalies, anomalyIds]);

  const stats = useMemo(() => {
    const draft = studies.filter((s) => s.status === "draft").length;
    const sent = studies.filter((s) => s.status === "sent").length;
    const hot = studies.filter((s) => s.views >= 5).length;
    return { draft, sent, hot, anomalies: anomalyIds.length };
  }, [studies, anomalyIds]);

  return (
    <div className="glass border border-slate-700/40 hover:border-slate-600 p-6 rounded-xl mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
          <span className="text-3xl">📊</span>
          AXE B · PIPELINE ACTIF
        </h2>
        <div className="text-sm text-slate-400">
          Gestion des dossiers · Suivi commercial
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-500/10 rounded-lg p-3 border border-slate-500/30">
          <div className="text-slate-400 text-xs uppercase mb-1">
            Brouillons
          </div>
          <div className="text-2xl font-bold text-slate-300">{stats.draft}</div>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
          <div className="text-blue-400 text-xs uppercase mb-1">Envoyés</div>
          <div className="text-2xl font-bold text-blue-300">{stats.sent}</div>
        </div>
        <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
          <div className="text-orange-400 text-xs uppercase mb-1">🔥 HOT</div>
          <div className="text-2xl font-bold text-orange-300">{stats.hot}</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
          <div className="text-red-400 text-xs uppercase mb-1">
            ⚠️ Anomalies
          </div>
          <div className="text-2xl font-bold text-red-300">
            {stats.anomalies}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher par client ou adresse..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              statusFilter === "all"
                ? "bg-slate-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              statusFilter === "draft"
                ? "bg-slate-500 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            📝 Brouillons
          </button>
          <button
            onClick={() => setStatusFilter("sent")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              statusFilter === "sent"
                ? "bg-blue-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            📤 Envoyés
          </button>
          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              showAnomalies
                ? "bg-red-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700"
            }`}
          >
            ⚠️ Anomalies ({stats.anomalies})
          </button>
        </div>
      </div>

      {/* Tableau */}
      {filteredStudies.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 text-xs uppercase py-3 px-4">
                  Client
                </th>
                <th className="text-left text-slate-400 text-xs uppercase py-3 px-4">
                  Adresse
                </th>
                <th className="text-left text-slate-400 text-xs uppercase py-3 px-4">
                  Prix
                </th>
                <th className="text-left text-slate-400 text-xs uppercase py-3 px-4">
                  Activité
                </th>
                <th className="text-right text-slate-400 text-xs uppercase py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudies.map((study) => {
                const hasAnomaly = anomalyIds.includes(study.id);
                const isHot = study.views >= 5;
                return (
                  <tr
                    key={study.id}
                    className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                      hasAnomaly ? "bg-red-500/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {hasAnomaly && <span className="text-red-400">⚠️</span>}
                        {isHot && <span className="text-orange-400">🔥</span>}
                        <div>
                          <div className="font-bold text-white">
                            {study.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            #{study.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-sm">
                      {study.study_data?.address || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {study.study_data?.installCost ? (
                        <div className="font-bold text-purple-400">
                          {formatCurrency(study.study_data.installCost)}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs space-y-1">
                        <div className="text-slate-400">
                          👁️ {study.views} vues
                        </div>
                        <div className="text-slate-400">
                          🖱️ {study.clicks} clics
                        </div>
                        <div
                          className={
                            getDaysSince(study.created_at) > 7
                              ? "text-red-400 font-bold"
                              : "text-slate-400"
                          }
                        >
                          ⏱️ {getDaysSince(study.created_at)}j
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {study.status === "sent" && (
                          <button
                            onClick={() => onForceSign(study.id, study.name)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors"
                          >
                            ✅ Signer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-8 text-center">
          <span className="text-4xl block mb-2">📭</span>
          <p className="text-slate-400 font-bold">Aucun dossier trouvé</p>
        </div>
      )}
    </div>
  );
};
// ============================================
// EMAIL AUTOMATION - GESTION LEADS
// ============================================

interface EmailAutomationProps {
  leads: EmailLead[];
  emailFlows?: any;
  onSendEmail?: (leadId: string) => void;
  onUpdateLeadTemperature?: (leadId: string, temp: string) => void;
  onDeleteLead?: (leadId: string) => void;
}

const EmailAutomation: React.FC<EmailAutomationProps> = ({ leads }) => {
  const [search, setSearch] = useState("");

  return (
    <div className="glass border border-slate-700/40 p-6 rounded-xl mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        📧 AXE C · EMAIL AUTOMATION
      </h2>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Rechercher..."
        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
      />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {leads.slice(0, 8).map((lead) => (
          <div
            key={lead.id}
            className="bg-slate-950 border border-slate-800 p-4 rounded-lg"
          >
            <div className="font-bold text-white text-sm">{lead.name}</div>
            <div className="text-xs text-slate-500">{lead.email}</div>
            <div className="text-xs text-blue-400 mt-2">
              👁️ {lead.total_opens} • 🖱️ {lead.total_clicks}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// DECISION LOGS
// ============================================

interface DecisionLogsProps {
  logs: DecisionLog[];
}

const DecisionLogs: React.FC<DecisionLogsProps> = ({ logs }) => {
  return (
    <div className="glass border border-slate-700/40 p-6 rounded-xl mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        📋 LOGS DE DÉCISIONS
      </h2>
      <div className="space-y-3">
        {logs.slice(0, 20).map((log) => (
          <div
            key={log.id}
            className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4"
          >
            <div className="font-bold text-white">{log.client_name}</div>
            <div className="text-sm text-slate-400">{log.action_performed}</div>
            <div className="text-xs text-slate-500 mt-1">
              {log.justification}
            </div>
            <div className="text-xs text-slate-600 mt-2">
              {formatDate(log.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// COMPOSANT PRINCIPAL - À METTRE TOUT EN BAS DU FICHIER
export default function Dashboard() {
  // ============================================
  // CHARGEMENT DES DONNÉES AVEC LE HOOK
  // ============================================
  const {
    studies,
    emailLeads,
    logs,
    metrics,
    loading,
    error,
    emailFlowByClient,
    antiAnnulationByStudy,
    postRefusByStudy,
    actions,
  } = useDashboard();

  // ============================================
  // ÉTATS LOCAUX
  // ============================================
  const [zenMode, setZenMode] = useState(false);
  const [priorityMode, setPriorityMode] = useState(false);
  const [overrideModal, setOverrideModal] = useState<{
    isOpen: boolean;
    studyId: string;
    studyName: string;
    actionType: "force_sign" | "delete" | "override";
  } | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // ============================================
  // CALCUL DES ANOMALIES
  // ============================================
  const anomalyIds = useMemo(() => {
    return detectAnomalies(studies);
  }, [studies]);

  // ============================================
  // DOSSIERS CRITIQUES POUR WAR ROOM
  // ============================================
  const criticalStudies = useMemo(() => {
    return studies.filter(
      (s) =>
        (s.status === "sent" && s.views >= 5) ||
        (s.status === "sent" && getDaysSince(s.created_at) > 10)
    );
  }, [studies]);

  // ============================================
  // STATS POUR SYSTEM STATE
  // ============================================
  const systemStats = useMemo(() => {
    const totalStudies = studies.length;
    const activeStudies = studies.filter((s) => s.status === "sent").length;
    const signedStudies = studies.filter((s) => s.status === "signed").length;
    const totalLeads = emailLeads.length;
    const activeLeads = emailLeads.filter((l) => !l.opted_out).length;
    const coldLeads = emailLeads.filter((l) => l.total_opens < 2).length;

    return {
      totalStudies,
      activeStudies,
      signedStudies,
      totalLeads,
      activeLeads,
      coldLeads,
      totalEmailsSent: emailLeads.reduce(
        (sum, l) => sum + l.email_sequence_step,
        0
      ),
      pendingEmails: emailLeads.filter((l) => l.next_email_date).length,
    };
  }, [studies, emailLeads]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleRefresh = useCallback(async () => {
    await actions.refresh();
    setLastRefresh(new Date());
  }, [actions]);

  const handleForceSign = useCallback((studyId: string, studyName: string) => {
    setOverrideModal({
      isOpen: true,
      studyId,
      studyName,
      actionType: "force_sign",
    });
  }, []);

  const handleConfirmOverride = useCallback(
    async (reason: string) => {
      if (!overrideModal) return;

      if (overrideModal.actionType === "force_sign") {
        await actions.signStudy(
          overrideModal.studyId,
          overrideModal.studyName,
          true,
          reason
        );
      }

      setOverrideModal(null);
    },
    [overrideModal, actions]
  );

  const handleStatusChange = useCallback(
    async (
      studyId: string,
      newStatus: "draft" | "sent" | "signed",
      studyName: string
    ) => {
      if (newStatus === "signed") {
        handleForceSign(studyId, studyName);
      } else {
        await actions.updateStudyStatus(studyId, newStatus, studyName);
      }
    },
    [actions, handleForceSign]
  );

  // ============================================
  // DÉTECTION NIVEAU SYSTÈME
  // ============================================
  const systemStatus = useMemo(() => {
    if (!metrics) return "normal";

    const hotsSignable = metrics.veryHotLeads?.length || 0;
    const atRisk = metrics.riskyDeposits?.length || 0;

    if (hotsSignable >= 3 || atRisk >= 2) return "critical";
    if (hotsSignable >= 1 || atRisk >= 1) return "warning";
    if (metrics.sent?.length >= 5) return "active";
    return "normal";
  }, [metrics]);

  // ============================================
  // AFFICHAGE CHARGEMENT
  // ============================================
  if (loading && studies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-blue-500 font-black tracking-widest text-xs uppercase animate-pulse">
          Initialisation du Système Nicolas OPS...
        </div>
      </div>
    );
  }

  // ============================================
  // AFFICHAGE ERREUR
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Erreur de chargement
        </h1>
        <p className="text-slate-400 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ============================================
  // RENDU PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <style>{`
        .glass { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(20px); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 
          from { transform: translateY(20px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>

      {/* HEADER */}
      <Header
        zenMode={zenMode}
        priorityMode={priorityMode}
        onToggleZenMode={() => setZenMode(!zenMode)}
        onTogglePriorityMode={() => setPriorityMode(!priorityMode)}
        onRefresh={handleRefresh}
        lastRefresh={lastRefresh}
        systemStatus={systemStatus}
      />

      <main className="container mx-auto px-8 py-10 max-w-[1600px]">
        {/* CRITICAL ALERT SI NÉCESSAIRE */}
        {systemStatus === "critical" && (
          <CriticalAlert
            show={true}
            message={`${criticalStudies.length} dossiers nécessitent une action immédiate !`}
          />
        )}

        {/* SYSTEM STATE */}
        <SystemState {...systemStats} />

        {/* WAR ROOM */}
        {metrics && (
          <WarRoom
            metrics={metrics}
            criticalStudies={criticalStudies}
            onActionRequired={(studyId) =>
              console.log("Voir détails:", studyId)
            }
            onForceSign={handleForceSign}
            scrollIntoView={systemStatus === "critical"}
          />
        )}

        {/* PIPELINE */}
        {!zenMode && (
          <>
            <Pipeline
              studies={studies}
              onStatusChange={handleStatusChange}
              onForceSign={handleForceSign}
              anomalyIds={anomalyIds}
            />

            {/* EMAIL AUTOMATION */}
            <EmailAutomation
              leads={emailLeads}
              emailFlows={undefined}
              onSendEmail={async (leadId) => console.log("Send email:", leadId)}
              onUpdateLeadTemperature={async (leadId, temp) =>
                console.log("Update temp:", leadId, temp)
              }
              onDeleteLead={async (leadId) =>
                console.log("Delete lead:", leadId)
              }
            />

            {/* DOSSIERS SIGNÉS */}
            <SignedStudies
              studies={studies}
              onDelete={async (studyId) => {
                const study = studies.find((s) => s.id === studyId);
                if (study) {
                  await actions.deleteStudy(studyId, study.name);
                }
              }}
              onViewDetails={(studyId) => console.log("View details:", studyId)}
              onToggleVisibility={async (studyId) =>
                console.log("Toggle visibility:", studyId)
              }
            />

            {/* DECISION LOGS */}
            <DecisionLogs logs={logs} />
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-16 text-center text-slate-800 text-[11px] font-black uppercase tracking-[0.5em] border-t border-slate-900 mt-20">
        &copy; 2026 Nicolas Di Stefano • Closer Performance System • All Rights
        Reserved
      </footer>

      {/* OVERRIDE MODAL */}
      {overrideModal && (
        <OverrideModal
          isOpen={overrideModal.isOpen}
          title="SIGNATURE FORCÉE"
          message="Vous allez forcer la signature de ce dossier. Cette action sera enregistrée dans les logs."
          studyName={overrideModal.studyName}
          actionType={overrideModal.actionType}
          onConfirm={handleConfirmOverride}
          onCancel={() => setOverrideModal(null)}
        />
      )}
    </div>
  );
}
