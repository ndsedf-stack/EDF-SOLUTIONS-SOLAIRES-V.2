import { Study } from "../types";
import { computeBehavioralRisk } from "../intelligence/behavior";
import { computeCancellationRisk } from "../intelligence/cancellation";
import { getDaysSince } from "../../utils/dates";

// ============================================
// MAPPING DB → DISPLAY AUGMENTÉ
// ============================================

export function getBehavioralState(study: Study): {
  state: "MUET" | "CAS_LIMITE" | "AGITÉ" | "INTÉRESSÉ" | "STABLE" | "FATIGUE";
  icon: string;
  label: string;
} {
  const views = study.views || 0;
  const clicks = study.clicks || 0;
  const sendCount = study.send_count || 0;

  // 🚀 FATIGUE
  if (views === 0 && clicks === 0 && sendCount >= 4) {
    return {
      state: "FATIGUE",
      icon: "😴",
      label: "FATIGUE",
    };
  }
  const risk = computeBehavioralRisk(study);
  if (risk === "muet") return { state: "MUET", icon: "🧊", label: "MUET" };
  if (risk === "cas_limite")
    return { state: "CAS_LIMITE", icon: "⚠️", label: "CAS LIMITE" };
  if (risk === "agite") return { state: "AGITÉ", icon: "🔥", label: "AGITÉ" };
  if (risk === "interesse")
    return { state: "INTÉRESSÉ", icon: "🟢", label: "INTÉRESSÉ" };
  return { state: "STABLE", icon: "⚪", label: "STABLE" };
}

export function mapStudyToDisplay(s: any, st: any, antiAnnul: Record<string, any> = {}, postRefus: Record<string, any> = {}): Study {
  const gId = s.id;
  const gClientId = s.clients?.id || "";
  
  // ✅ CALCULER LE NOMBRE TOTAL D'ENVOIS (ANTI-ANNUL + POST-REFUS)
  const flowA = antiAnnul[String(gId)] || antiAnnul[String(gClientId)];
  const flowB = postRefus[String(gId)] || postRefus[String(gClientId)];
  const sendCount = (flowA?.sent?.length || 0) + (flowB?.sent?.length || 0);

  // 🔍 DEBUG ULTRA-DÉTAILLÉ
  if (!st) {
    console.warn("⚠️ Pas de stats trouvé pour study:", s.id, s.clients?.email);
  }

  const diffDays = getDaysSince(s.created_at);
  const now = new Date();

  // ✅ FIX: Extraction des stats avec fallbacks multiples + LOG
  let views = st?.email_opens ?? st?.views ?? st?.total_opens ?? 0;
  let clicks = st?.interactions ?? st?.clicks ?? st?.total_clicks ?? 0;

  // 🔍 LOG pour chaque étude
  if (s.clients?.last_name?.toUpperCase().includes("GUYOT")) {
    console.log(`📊 Study ${s.clients?.first_name} ${s.clients?.last_name}:`, {
      id: s.id,
      views,
      clicks,
      stat_found: !!st,
      stat_data: st,
    });
  }

  // ✅ SOURCE DE VÉRITÉ : Priorité aux champs top-level DB
  const mode = s.payment_mode || s.study_data?.mode || null;
  const totalCost = s.install_cost || s.study_data?.installCost || 0;
  const apport = s.cash_apport ?? s.study_data?.cashApport ?? 0;

  // ✅ SMART FINANCING DETECTION
  let financingMode:
    | "full_financing"
    | "financing_with_deposit"
    | "cash_payment"
    | undefined;

  if (mode === "cash" || (totalCost > 0 && apport >= totalCost)) {
    financingMode = "cash_payment";
  } else if (mode === "financement") {
    financingMode = apport > 0 ? "financing_with_deposit" : "full_financing";
  } else {
    financingMode = s.financing_mode;
  }

  const requiresDepositCalc =
    financingMode === "cash_payment" ||
    financingMode === "financing_with_deposit";

  const daysSinceSigned = s.signed_at
    ? Math.floor((now.getTime() - new Date(s.signed_at).getTime()) / 86400000)
    : null;

  const isDepositLateCalc = (() => {
    if (!s.signed_at || s.status !== "signed") return false;
    if (s.deposit_paid) return false;
    if (!requiresDepositCalc) return false;
    return daysSinceSigned && daysSinceSigned > 0;
  })();

  // ✅ FIX CRITIQUE: Créer l'objet Study COMPLET avant d'appeler getBehavioralState
  const mappedStudy: Study = {
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
    // ✅ LECTURE SUPABASE PAYMENT
    payment_mode: s.payment_mode || null,
    payment_type: s.payment_type || null,
    financing_mode: s.financing_mode || null,
    has_deposit: s.has_deposit || false, // ✅ LIT SUPABASE
    cash_apport: s.cash_apport || 0,
    total_price: totalCost, // ✅ CALCULÉ depuis study_data (PAS s.total_price qui n'existe pas!)
    install_cost: s.install_cost || 0,
    contract_secured: s.status === "signed" && ((daysSinceSigned !== null && daysSinceSigned >= 14) || (s.deposit_paid || false)),
    cancellation_deadline: s.cancellation_deadline || null,
    // Champs calculés
    views,
    clicks,
    diffDays: Math.floor(diffDays),
    hasLog: false,
    rib_sent: s.rib_sent || false,
    rib_sent_at: s.rib_sent_at,
    email_optout: s.clients?.email_optout || false,
    last_open: st?.last_open || st?.last_open_at || st?.last_email_open || null,
    last_click: st?.last_click || st?.last_click_at || null,
    last_view: st?.last_view || null,
    requiresDeposit: requiresDepositCalc,
    daysLate: daysSinceSigned || 0,
    daysSinceSigned,
    isDepositLate: isDepositLateCalc,
    behavioralState: undefined as any,
    behavioralIcon: undefined as any,
    behavioralLabel: undefined as any,
    send_count: sendCount,
  };

  // ✅ MAINTENANT on peut calculer le comportement avec toutes les données
  const behavioral = getBehavioralState(mappedStudy);

  // ✅ Mise à jour finale
  mappedStudy.behavioralState = behavioral.state;
  
  // ✅ CALCUL cancellationRisk pour TOUTES les études (Signées ET Pipeline)
  let basicDangerScore = mappedStudy.dangerScore || 0;
  
  if (basicDangerScore === 0) {
    const v = views || 0;
    const c = clicks || 0;
    const d = Math.max(daysSinceSigned || 0, diffDays || 0);

    // Score de base par moteur comportemental
    if (behavioral.state === 'MUET') {
      basicDangerScore = 65 + Math.min(d, 20); // Plus c'est long, plus c'est grave
    } else if (behavioral.state === 'FATIGUE') { // 🚀 RAJOUT
      basicDangerScore = 85 + Math.min(d, 15);
    } else if (behavioral.state === 'AGITÉ') {
      basicDangerScore = 45 + Math.min(v * 2, 20); // Plus il regarde sans agir, plus il rumine
    } else if (behavioral.state === 'CAS_LIMITE') {
      basicDangerScore = 30 + Math.min(d, 10);
    } else if (behavioral.state === 'INTÉRESSÉ') {
      // DYNAMISME POUR AXE B : Varier selon clics et vues
      // Risque = base - (clics * 2) + (jours * 1)
      basicDangerScore = 18 + Math.min(d, 12) - Math.min(c * 2, 10) + Math.min(v, 5);
    } else {
      basicDangerScore = 5 + Math.min(v, 7);
    }

    // Protection contre les scores plats (Jitter basé sur l'ID)
    const jitter = (parseInt(mappedStudy.id.slice(0, 2), 16) % 5) - 2; // -2 à +2
    basicDangerScore += jitter;
  }
  
  mappedStudy.cancellationRisk = computeCancellationRisk({
    dangerScore: Math.max(5, Math.min(98, basicDangerScore)),
    tensionLevel: mappedStudy.status === 'signed' ? 50 : 30,
    behavior: behavioral.state,
  });

  return mappedStudy;
}

export function mapEmailLeadToDisplay(
  l: any,
  studyIdByClientId: Record<string, string>,
  lastOpenByStudyId: Record<string, string>,
  lastClickByStudyId: Record<string, string>
) {
  const studyId = studyIdByClientId[l.client_id];
  const lastOpen =
    l.last_opened_at || (studyId ? lastOpenByStudyId[studyId] : null) || null;
  const lastClick =
    l.last_clicked_at || (studyId ? lastClickByStudyId[studyId] : null) || null;

  return {
    id: l.id,
    client_id: l.client_id,
    study_id: studyId, // ✅ AJOUTÉ (manquait)
    created_at: l.created_at,
    client_name: l.clients // ✅ CHANGÉ : name → client_name
      ? `${l.clients.first_name || ""} ${l.clients.last_name || ""}`.trim()
      : "Inconnu",
    client_email: l.clients?.email || "Pas d'email", // ✅ CHANGÉ : email → client_email
    last_email_sent: l.last_email_sent_at,
    next_email_date: l.next_email_scheduled_at,
    email_sequence_step: l.email_step || 0,
    opted_out: l.clients?.email_optout || false,
    total_opens: l.total_opens || 0,
    total_clicks: l.total_clicks || 0,
    last_opened_at: lastOpen, // ✅ CHANGÉ : last_open → last_opened_at
    last_clicked_at: lastClick, // ✅ CHANGÉ : last_click → last_clicked_at
  };
}

export function getLeadTemperature(
  study: Study
): "cold" | "warm" | "hot" | "signed" {
  if (study.status === "signed") return "signed";
  if (study.clicks > 0) return "hot";
  if (study.views >= 2) return "warm";
  return "cold";
}
