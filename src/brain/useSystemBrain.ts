import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { buildSystemBrain } from "@/brain/Engine";
import { 
  Metrics, 
  FinancialStats,
  Study,
  EmailLead,
  DecisionLog,
} from "@/brain/types";
import { mapStudyToDisplay, mapEmailLeadToDisplay as mapEmailLeadHelper } from "@/brain/signals/mappers";
import { genId } from "@/lib/id";

// HELPER TIMEOUT
const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout Supabase after ${ms}ms`)), ms));
async function fetchWithTimeout<T>(promise: PromiseLike<T>, ms = 15000): Promise<T> {
    return Promise.race([promise, timeoutPromise(ms)]) as Promise<T>;
}

// ============================================
// SYSTEM BRAIN HOOK
// ============================================
export function useSystemBrain() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [emailLeads, setEmailLeads] = useState<EmailLead[]>([]);
  const [logs, setLogs] = useState<DecisionLog[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États avancés
  const [emailFlowByClient, setEmailFlowByClient] = useState<Record<string, any>>({});
  const [antiAnnulationByStudy, setAntiAnnulationByStudy] = useState<Record<string, any>>({});
  const [postRefusByStudy, setPostRefusByStudy] = useState<Record<string, any>>({});
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState("");

  // ============================================
  // ANIMATION INITIALISATION
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
  // LOAD DATA CHUNKING HELPER
  // ============================================
  const fetchInChunks = async (
    table: string, 
    column: string, 
    ids: string[], 
    select = "*", 
    orderBy?: { col: string, ascending: boolean }
  ) => {
    const BATCH_SIZE = 800;
    const allData: any[] = [];
    
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const chunk = ids.slice(i, i + BATCH_SIZE);
      let query = supabase.from(table).select(select).in(column, chunk);
      if (orderBy) {
        query = query.order(orderBy.col, { ascending: orderBy.ascending });
      }
      const { data, error } = await fetchWithTimeout(query);
      if (error) throw error;
      if (data) allData.push(...data);
    }
    return { data: allData, error: null };
  };

  // ============================================
  // CHARGEMENT DONNÉES
  // ============================================
  // ============================================
  // CHARGEMENT DONNÉES (PARALLEL & SAFE)
  // ============================================
  const loadData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      // 1. CHARGEMENT PARALLÈLE DES SOURCES INDÉPENDANTES (Etudes + Logs)
      const logsPromise = supabase
          .from("decision_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

      const studiesPromise = fetchWithTimeout(supabase
        .from("studies")
        .select(`
            id, client_id, status, created_at, signed_at, study_data,
            deposit_amount, deposit_paid, deposit_paid_at, has_deposit,
            payment_type, payment_mode, cash_apport,
            total_price: install_cost, financing_mode, contract_secured, cancellation_deadline,
            clients (id, first_name, last_name, email, phone, email_optout)
        `));

      const [logsResponse, studiesResponse] = await Promise.all([
        logsPromise,
        studiesPromise
      ]);

      const { data: studiesData, error: studiesError } = studiesResponse;
      
      // Gestion Logs immédiate
      const logsData = logsResponse.data || [];
      if (logsResponse.error) console.error("Logs fetch failed", logsResponse.error);
      setLogs(logsData);

      if (studiesError) throw studiesError;

      const studyIdsList = (studiesData || []).map(s => s.id);
      const clientIdsList = (studiesData || []).map(s => s.client_id).filter(Boolean);

      // 2. CHARGEMENT BATCHÉ DES DONNÉES DÉPENDANTES (Tracking, Emails)
      // Protection .in() : chunking automatique via helper
      
      const trackingPromise = studyIdsList.length > 0 
        ? fetchInChunks("tracking_events", "study_id", studyIdsList, "study_id, event_type, created_at")
        : Promise.resolve({ data: [] });

      const queuePromise = clientIdsList.length > 0
        ? fetchInChunks("email_queue", "client_id", clientIdsList, "study_id, client_id, email_type, status, sent_at, scheduled_for, created_at", { col: "created_at", ascending: false })
        : Promise.resolve({ data: [] });
      
      const [trackingResult, queueResult] = await Promise.allSettled([trackingPromise, queuePromise]);

      // @ts-ignore
      const trackingData = trackingResult.status === "fulfilled" ? (trackingResult.value.data || []) : [];
      if (trackingResult.status === "rejected") console.error("Tracking fetch failed", trackingResult.reason);

      // @ts-ignore
      const queueEmails = queueResult.status === "fulfilled" ? (queueResult.value.data || []) : [];
      if (queueResult.status === "rejected") console.error("Queue fetch failed", queueResult.reason);

      // 3. INDEXATION TRACKING (BEFORE MAPPING)
      const statsMap = new Map<string, any>();
      const trackingByStudy: Record<string, { last_open?: string; last_click?: string; total_opens: number }> = {};
      const seenMinutes = new Map<string, Set<string>>();

      trackingData.forEach((event) => {
        if (!event.study_id) return;
        
        if (!statsMap.has(event.study_id)) {
          statsMap.set(event.study_id, { id: event.study_id, email_opens: 0, interactions: 0, last_open_at: null, last_click_at: null });
          trackingByStudy[event.study_id] = { total_opens: 0 };
          seenMinutes.set(event.study_id, new Set<string>());
        }

        const stat = statsMap.get(event.study_id)!;
        const track = trackingByStudy[event.study_id];
        const studySeen = seenMinutes.get(event.study_id)!;
        const minuteKey = new Date(event.created_at).toISOString().substring(0, 16); // Minute bucket

        if (event.event_type === "email_open" || event.event_type === "view") {
          if (!studySeen.has(minuteKey)) {
            stat.email_opens++;
            track.total_opens++;
            studySeen.add(minuteKey);
          }
          if (!stat.last_open_at || event.created_at > stat.last_open_at) {
            stat.last_open_at = event.created_at;
            track.last_open = event.created_at;
          }
        } else if (event.event_type === "email_click" || event.event_type === "click") {
          const clickKey = `click-${minuteKey}`;
          if (!studySeen.has(clickKey)) {
            stat.interactions++;
            studySeen.add(clickKey);
          }
          if (!stat.last_click_at || event.created_at > stat.last_click_at) {
            stat.last_click_at = event.created_at;
            track.last_click = event.created_at;
          }
        }
      });
      const stats = Array.from(statsMap.values());

      // 4. INDEXATION QUEUE (EMAIL FLOW)
      const studyIdByClientId: Record<string, string> = {};
      (studiesData || []).forEach((s) => { if (s.client_id) studyIdByClientId[s.client_id] = s.id; });

      const antiAnnulation: Record<string, any> = {};
      const postRefus: Record<string, any> = {};

      queueEmails.forEach((e: any) => {
        const sId = e.study_id || (e.client_id ? studyIdByClientId[e.client_id] : null);
        if (!sId) return;

        const enrichedEmail = {
          ...e,
          opened_at: trackingByStudy[sId]?.last_open || null,
          clicked_at: trackingByStudy[sId]?.last_click || null,
        };

        const isPostRefusType = e.email_type?.startsWith("post_refus") || e.email_type?.includes("relance") || e.email_type?.includes("prospecting");
        const targetMap = isPostRefusType ? postRefus : antiAnnulation;

        if (!targetMap[sId]) targetMap[sId] = { sent: [], next: null, total_opens: trackingByStudy[sId]?.total_opens || 0 };
        
        const isSent = ["sent", "SUCCESS", "success", "delivered", "processed"].includes(e.status?.toLowerCase() || "");
        const isPending = ["pending", "scheduled", "PENDING"].includes(e.status || "");

        if (isSent) targetMap[sId].sent.push(enrichedEmail);
        else if (isPending) {
          const current = targetMap[sId].next;
          if (!current || new Date(e.scheduled_for!) < new Date(current.scheduled_for!)) targetMap[sId].next = enrichedEmail;
        }

        if (e.client_id) targetMap[String(e.client_id)] = targetMap[sId];
      });

      [antiAnnulation, postRefus].forEach(map => {
        Object.keys(map).forEach(id => {
          map[id].sent.sort((a: any, b: any) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
        });
      });

      setAntiAnnulationByStudy(antiAnnulation);
      setPostRefusByStudy(postRefus);

      // 5. MAPPING FINAL ETUDES (AVEC TOUTES LES DONNÉES PRÊTES)
      // Note: On utilise les leads déjà chargés en state ou on devrait les recharger ? 
      // Pour éviter la race condition complete, idéalement on reload leads ici aussi, mais restons sur le scope P0 'charge parallel'.
      // Assumption: metrics calculation depends on correct study mapping.
      
      const mappedStudies: Study[] = (studiesData || []).map((s) => {
        const clientsArray = Array.isArray(s.clients) ? s.clients : (s.clients ? [s.clients] : []);
        const clientId = clientsArray[0]?.id;
        // Fallback sur emailLeads du state (risque si pas à jour, mais acceptable pour P0 si refresh global)
        const lead = clientId ? emailLeads.find(l => l.client_id === clientId) : null; 
        
        const studyStats = stats.find(st => st.id === s.id) || { id: s.id, email_opens: 0, interactions: 0 };
        const enrichedStats = {
          ...studyStats,
          email_opens: studyStats.email_opens > 0 ? studyStats.email_opens : (lead?.total_opens || 0),
          interactions: studyStats.interactions > 0 ? studyStats.interactions : (lead?.total_clicks || 0),
          last_open: studyStats.last_open_at || lead?.last_opened_at,
          last_click: studyStats.last_click_at || lead?.last_clicked_at
        };

        return mapStudyToDisplay(s, enrichedStats, antiAnnulation, postRefus);
      });

      setStudies(mappedStudies);

      // 6. LOGIQUE DÉCISIONNELLE (ET LOGGING ASYNC SÉCURISÉ)
      const brain = buildSystemBrain(mappedStudies);
      setMetrics(brain);
      setFinancialStats(brain.financialStats);
      
      // LOG PRIORITÉ SÉCURISÉ (AWAIT + TRY/CATCH)
      if (brain.priorityCase) {
        // On check si le cas a changé ou si c'est pertinent, mais pour l'instant insertion directe
        const uuid = genId();
        try {
            await supabase.from("decision_logs").insert({
              id: uuid,
              study_id: brain.priorityCase.id,
              created_at: new Date().toISOString(),
              action_performed: `PRIORITY_FLAG_${brain.priorityCase.action.toUpperCase().replace(/\s+/g, '_')}`,
              justification: JSON.stringify({
                danger: brain.priorityCase.dangerScore,
                behavior: brain.priorityCase.behavior,
                state: brain.systemState
              })
            });
        } catch (logErr) {
            console.warn("Log failed:", logErr);
        }
      }

      // 7. TRAFFIC DATA REBUILD (REAL DATA AGGREGATION)
      const TRAFFIC_DAYS = 14; 
      const dailyStats = new Map<string, { date: string, count: number, opened: number, clicked: number }>();
      
      // Init last X days
      const today = new Date();
      for (let i = TRAFFIC_DAYS - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        dailyStats.set(dateKey, { date: dateKey, count: 0, opened: 0, clicked: 0 });
      }

      // A. Count SENT (from Email Queue)
      queueEmails.forEach((e: any) => {
        const dateKey = new Date(e.sent_at || e.created_at || new Date()).toISOString().split('T')[0];
        const isSent = ["sent", "SUCCESS", "success", "delivered", "processed"].includes(e.status?.toLowerCase() || "");
        
        if (dailyStats.has(dateKey) && isSent) {
            dailyStats.get(dateKey)!.count++;
        }
      });

      // B. Count OPEN/CLICK (from Tracking Events)
      trackingData.forEach((t: any) => {
          const dateKey = new Date(t.created_at).toISOString().split('T')[0];
          if (dailyStats.has(dateKey)) {
              const stat = dailyStats.get(dateKey)!;
              if (t.event_type === "email_open" || t.event_type === "view") stat.opened++;
      if (t.event_type === "email_click" || t.event_type === "click") stat.clicked++;
          }
      });

      // Convert Map to Sorted Array
      const trafficData = Array.from(dailyStats.values()).sort((a, b) => a.date.localeCompare(b.date));
      setTrafficData(trafficData);

    } catch (err: any) {
      console.error("❌ System Brain Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [emailLeads]); // Dependance à emailLeads pour le mapping correct

  // ============================================
  // LOAD EMAIL LEADS
  // ============================================
  /* LOAD EMAIL LEADS WITH TIMEOUT */
  const loadEmailLeads = useCallback(async () => {
    try {
      const { data, error } = await fetchWithTimeout(supabase.from("email_leads").select(`
          id, client_id, created_at, last_email_sent_at, next_email_scheduled_at,
          email_step, total_opens, total_clicks, last_opened_at, last_clicked_at,
          clients!inner(id, first_name, last_name, email, email_optout)
        `).order("next_email_scheduled_at", { ascending: true }));

      if (error) throw error;
      const clientIds = data.map((l) => l.client_id).filter(Boolean);
      const { data: studiesData } = await supabase.from("studies").select("id, client_id").in("client_id", clientIds);
      
      const studyIdByClientId: Record<string, string> = {};
      (studiesData || []).forEach((s) => { if (s.client_id) studyIdByClientId[s.client_id] = s.id; });
      const studyIds = Object.values(studyIdByClientId).filter(Boolean);

      let lastOpenByStudyId: Record<string, string> = {};
      let lastClickByStudyId: Record<string, string> = {};

      if (studyIds.length > 0) {
        const { data: openEvents } = await supabase.from("tracking_events").select("study_id, created_at").in("study_id", studyIds).in("event_type", ["email_open", "view"]);
        (openEvents || []).forEach(e => { if (!lastOpenByStudyId[e.study_id]) lastOpenByStudyId[e.study_id] = e.created_at; });
        
        const { data: clickEvents } = await supabase.from("tracking_events").select("study_id, created_at").in("study_id", studyIds).in("event_type", ["email_click", "click"]);
        (clickEvents || []).forEach(e => { if (!lastClickByStudyId[e.study_id]) lastClickByStudyId[e.study_id] = e.created_at; });
      }

      // Utilisation du helper local pour map
      const mappedLeads = (data || []).map(l => mapEmailLeadToDisplayInternal(l, studyIdByClientId, lastOpenByStudyId, lastClickByStudyId));
      setEmailLeads(mappedLeads);

      const flowByClient: Record<string, any> = {};
      mappedLeads.forEach(l => {
        flowByClient[l.client_id] = { 
          step: l.email_sequence_step, 
          last: l.last_email_sent, 
          next: l.next_email_date, 
          opens: l.total_opens, 
          clicks: l.total_clicks, 
          opted_out: l.opted_out,
          last_opened: l.last_opened_at,
          last_clicked: l.last_clicked_at
        };
      });
      setEmailFlowByClient(flowByClient);
    } catch (err) { console.error(err); }
  }, []);

  // HELPER INTERNAL
  function mapEmailLeadToDisplayInternal(l: any, studyIdByClientId: any, lastOpenByStudyId: any, lastClickByStudyId: any): EmailLead {
    const studyId = studyIdByClientId[l.client_id] || null;
    return {
      id: l.id,
      client_id: l.client_id,
      study_id: studyId,
      client_name: `${l.clients?.first_name || ""} ${l.clients?.last_name || ""}`.trim(),
      client_email: l.clients?.email || "",
      opted_out: l.clients?.email_optout || false,
      email_sequence_step: l.email_step || 0,
      last_email_sent: l.last_email_sent_at,
      next_email_date: l.next_email_scheduled_at,
      total_opens: l.total_opens || 0,
      total_clicks: l.total_clicks || 0,
      last_opened_at: studyId ? lastOpenByStudyId[studyId] : l.last_opened_at,
      last_clicked_at: studyId ? lastClickByStudyId[studyId] : l.last_clicked_at,
      created_at: l.created_at,
    };
  }

  // ============================================
  // ACTIONS
  // ============================================
  const updateStudyStatus = useCallback(async (id: string, status: string, name: string, reason: string = "Manuel") => {
    const { error } = await supabase.from("studies").update({ status, signed_at: status === "signed" ? new Date().toISOString() : null }).eq("id", id);
    if (!error) {
      await supabase.from("decision_logs").insert({ study_id: id, client_name: name, action_performed: `STATUS_CHANGE_${status.toUpperCase()}`, justification: reason });
      loadData();
    }
  }, [loadData]);

  const signStudy = useCallback(async (studyId: string, studyName?: string): Promise<boolean> => {
    // UI doit avoir déjà demandé confirmation
    const { error } = await supabase.from("studies").update({ status: "signed", signed_at: new Date().toISOString() }).eq("id", studyId);
    if (error) { console.error("Erreur signature", error); return false; }
    await loadData(true);
    return true;
  }, [loadData]);

  const cancelStudy = useCallback(async (studyId: string, studyName?: string): Promise<boolean> => {
    const { error } = await supabase.from("studies").update({ status: "cancelled" }).eq("id", studyId);
    if (error) { console.error("Erreur annulation", error); return false; }
    await loadData(true);
    return true;
  }, [loadData]);

  const markDepositPaid = useCallback(async (id: string, name: string, paymentMode: string = "virement"): Promise<boolean> => {
    // Mode passé en paramètre, plus de prompt()
    // SAFE UPDATE: On essaie d'abord avec le mode, si ça fail (colonne manquante), on fallback
    let error;
    try {
        const res = await supabase.from("studies").update({ 
            deposit_paid: true, 
            deposit_paid_at: new Date().toISOString(), 
            deposit_payment_mode: paymentMode.toLowerCase().trim() 
        }).eq("id", id);
        error = res.error;
    } catch (e) {
        // Fallback si colonne n'existe pas
        const res = await supabase.from("studies").update({ 
            deposit_paid: true, 
            deposit_paid_at: new Date().toISOString(), 
        }).eq("id", id);
        error = res.error;
    }
    
    if (error) {
        console.error("Erreur paiement", error);
        return false;
    }

    try {
        await supabase.from("decision_logs").insert({ 
            study_id: id, 
            client_name: name, 
            action_performed: "DEPOSIT_PAID_CONFIRMED", 
            justification: `Mode: ${paymentMode}` 
        });
    } catch(e) { console.warn("Log failed", e); }
    
    await loadData(true);
    return true;

  }, [loadData]);

  const markRibSent = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from("studies").update({ rib_sent: true, rib_sent_at: new Date().toISOString() }).eq("id", id);
    if (error) alert("❌ Erreur : " + error.message);
    else { await supabase.from("decision_logs").insert({ study_id: id, client_name: name, action_performed: "RIB_SENT_CONFIRMED", justification: "RIB marqué comme envoyé" }); alert("✅ RIB marqué comme envoyé !"); loadData(); }
  }, [loadData]);

  const setOptOut = useCallback(async (email: string) => {
    const { data } = await supabase.from("clients").update({ email_optout: true }).eq("email", email).select();
    if (!data || data.length === 0) { alert("❌ ERREUR : Aucun client trouvé avec cet email"); return; }
    await supabase.from("email_queue").update({ status: "cancelled" }).eq("client_id", data[0].id).in("status", ["pending", "scheduled"]);
    await supabase.from("decision_logs").insert({ client_name: `${data[0].first_name} ${data[0].last_name}`, action_performed: "EMAIL_OPTOUT", justification: "Désabonnement depuis dashboard" });
    alert("✅ Client désabonné avec succès !"); loadEmailLeads(); loadData();
  }, [loadData, loadEmailLeads]);

  const deleteLeadPermanently = useCallback(async (clientId: string, email: string, name: string) => {
    await supabase.from("studies").delete().eq("client_id", clientId);
    await supabase.from("email_queue").delete().eq("client_id", clientId);
    await supabase.from("email_leads").delete().eq("client_id", clientId);
    await supabase.from("clients").delete().eq("id", clientId);
    await supabase.from("decision_logs").insert({ action_performed: "LEAD_DELETED_PERMANENTLY", client_name: name, justification: `Suppression définitive ${email}` });
    alert("✅ Lead supprimé définitivement"); loadData(); loadEmailLeads();
  }, [loadData, loadEmailLeads]);

  const deleteStudy = useCallback(async (id: string, name: string) => {
    await supabase.from("studies").delete().eq("id", id);
    await supabase.from("decision_logs").insert({ client_name: name, action_performed: "DELETE_STUDY", justification: "Suppression définitive" });
    loadData();
  }, [loadData]);

  const logForceAction = useCallback(async (studyId: string, clientName: string, action: string, justification: string) => {
    await supabase.from("decision_logs").insert({ study_id: studyId, client_name: clientName, action_performed: action, justification });
  }, []);

  const refresh = useCallback((isSilent = false) => { 
    loadData(isSilent); 
    loadEmailLeads(); 
  }, [loadData, loadEmailLeads]);

  // INIT SECURISE (EVITE BOUCLE INFINIE)
  useEffect(() => {
    initializeSystem();
    loadData(); // Initial load avec loader
    loadEmailLeads();

    // Refresh silencieux toutes les minutes
    const interval = setInterval(() => { refresh(true); }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount

  // Met à jour les leads quand ils arrivent (sans re-trigger loadData complet si pas nécessaire, mais ici on recharge pour le matching)
  // Attention: loadData dépend de emailLeads, donc ce useEffect tourne quand emailLeads change.
  // C'est OK car loadData ne change PAS emailLeads (donc pas de boucle).
  useEffect(() => {
    if (emailLeads.length > 0) {
        loadData(true); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailLeads]);

  return {
    studies, emailLeads, logs, metrics, financialStats, loading, systemInitialized, loadingProgress, loadingStep, error,
    emailFlowByClient, antiAnnulationByStudy, postRefusByStudy, trafficData,
    actions: { updateStudyStatus, signStudy, cancelStudy, markDepositPaid, markRibSent, setOptOut, deleteLeadPermanently, deleteStudy, logForceAction, refresh }
  };
}

export type SystemState = ReturnType<typeof useSystemBrain>;
