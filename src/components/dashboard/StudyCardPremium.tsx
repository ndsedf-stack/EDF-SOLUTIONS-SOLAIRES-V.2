
import React from 'react';
import { Study, EmailLead } from '@/brain/types';
import { getBehavioralState } from '@/brain/signals/mappers';
import { 
  LucideActivity, 
  ShieldCheck as LucideShieldCheck, 
  CreditCard as LucideCreditCard
} from "lucide-react";
import StudyStatusBadge from '../StudyStatusBadge';
import { formatCurrency } from './utils';
import { BEHAVIORAL_LABELS } from './constants';

interface StudyCardPremiumProps {
  study: Study;
  antiAnnulationByStudy?: Record<string, any>;
  postRefusByStudy?: Record<string, any>;
  onSignStudy?: (id: string, name: string) => void;
  onCancelStudy?: (id: string, name: string) => void;
  onDeleteStudy?: (id: string, name: string) => void;
  onMarkDepositPaid?: (id: string, name: string) => void;
  onMarkRibSent?: (id: string, name: string) => void;
  showActions?: boolean;
  leads?: EmailLead[];
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
  
  // ✅ MATCHING ULTRA-ROBUSTE POUR L'ENGAGEMENT FLOW
  const leadDataForFlow = (leads || []).find(l => {
    if (l.study_id && l.study_id === study.id) return true;
    if (l.client_id && l.client_id === study.client_id) return true;
    if (l.client_email && study.email && l.client_email.toLowerCase().trim() === study.email.toLowerCase().trim() && l.client_email !== "Pas d'email") return true;
    return false;
  });

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
    // FIX: Ne jamais fallback sur Prospection (flowC) pour un signé, même si flowA est vide/pending
    // On laisse tomber dans le default block plus bas qui force Anti-Annulation
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


  // ✅ DÉTERMINER L'ÉTAPE ACTUELLE DU FLOW (Consolidation de toutes les sources)
  let emailStep = Math.max(
    flowData?.sent?.length || 0,
    leadDataForFlow?.email_sequence_step || 0,
    study.send_count || 0
  );

  // Correction si mismatch entre engagement (vues) et step
  if (study.views > 0 && emailStep === 0) emailStep = 1;

  if (study.name?.toUpperCase().includes("GUYOT")) {
      console.log("🎯 GUYOT SELECTED FLOW:", { 
        flowType, 
        sentLength: flowData?.sent?.length, 
        leadStep: leadDataForFlow?.email_sequence_step,
        studySendCount: study.send_count,
        finalStep: emailStep 
      });
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

      <div className="relative glass-panel rounded-2xl bg-slate-950/40 border border-white/5 p-6 flex flex-col lg:grid lg:grid-cols-[220px_1fr_200px_120px_auto] lg:items-center gap-6 transition-all hover:bg-slate-900/40 hover:border-white/10 shadow-lg">
        {/* COLONNE 1 : IDENTITÉ & STATUT (Vertical Stack) */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            <StudyStatusBadge status={study.status} />
            {study.status === "signed" && (
              <LucideShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          
          <h3 className="text-white font-black tracking-tight text-base lg:text-lg uppercase leading-none mb-1">
            {study.name.split(' ')[0]}<br/>
            <span className="text-blue-400">{study.name.split(' ').slice(1).join(' ')}</span>
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono truncate">
            <span className="opacity-60 text-[10px] flex-shrink-0">📧</span> 
            <span className="truncate">{study.email}</span>
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
        <div className="hidden lg:flex flex-col gap-3 px-8 border-x border-white/5 min-h-[100px] justify-center">
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
                          j{[0, 1, 3, 7, 14][emailStep - 1] || 0} {flowCategory}
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

                {/* Prochain email (Toujours afficher si sequence active) */}
                {emailStep < totalEmailsInFlow && (
                  <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2 mt-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-600 font-bold">Prochain :</span>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 font-mono font-bold">
                          j{[0, 1, 3, 7, 14][emailStep] || '?'} {flowCategory}
                        </span>
                        {nextEmail ? (
                          <span className="text-orange-400/60 font-mono">
                            → {new Date(nextEmail.scheduled_for).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-slate-500/50 font-mono text-[8px] uppercase tracking-wider border border-slate-700/30 px-1.5 py-0.5 rounded">
                            Non planifié
                          </span>
                        )}
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

        {/* COLONNE 3 : FINANCES (Layout Premium Adaptatif) */}
        <div className="flex flex-col items-end justify-center h-full min-w-[180px] gap-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">VALEUR DOSSIER</span>
            {study.financing_mode && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-md border font-black tracking-widest ${
                study.financing_mode === 'cash_payment' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                {study.financing_mode === 'cash_payment' ? 'COMPTANT' : 'FINANCÉ'}
              </span>
            )}
          </div>
          
          <div className="text-3xl font-black text-white tracking-tighter mb-1 select-none">
            {formatCurrency(study.total_price)}
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full">
            {/* Détails Financiers : Apport / Acompte */}
            {study.cash_apport > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10 w-full justify-end">
                <LucideCreditCard className="w-3 h-3 text-yellow-500/70" />
                <span className="text-[9px] font-black text-yellow-500/90 font-mono tracking-tight uppercase">
                  APPORT: {formatCurrency(study.cash_apport)}
                </span>
              </div>
            )}

            {study.status === 'signed' && study.has_deposit && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase w-full justify-end
                ${study.deposit_paid
                   ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80"
                   : "bg-orange-500/5 border-orange-500/10 text-orange-400/80"
                }`}>
                {study.deposit_paid ? "✅ Règlement Acompte" : `⏳ Acompte: ${formatCurrency(study.deposit_amount || 1500)}`}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 4 : PROBABILITÉ & RISQUE (Pivot Vertical XXL) */}
        <div className="flex flex-col items-center justify-center gap-4 px-8 border-l border-white/5 h-full min-w-[160px]">
          {/* Gauge XXL */}
          <div className="relative w-16 h-16 flex-shrink-0 group/gauge">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800/60" strokeWidth="2"></circle>
              <circle
                cx="18" cy="18" r="16" fill="none"
                className={`${isHighRisk ? "stroke-orange-500" : "stroke-blue-500"} transition-all duration-1000 ease-out`}
                strokeWidth="2"
                strokeDasharray={`${probability}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-white font-mono tracking-tighter">{probability}%</span>
            </div>
          </div>

          {/* Labels & Status Badge */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em]">
              RISQUE
            </span>
            <div className={`px-4 py-1 rounded-lg border ${behaviorConfig.class} uppercase text-[10px] font-black tracking-[0.15em] shadow-lg whitespace-nowrap`}>
              {behaviorConfig.label.replace(/^[^\s]+\s/, "")}
            </div>
          </div>
        </div>

        {/* COLONNE 5 : ACTIONS (Mobile Friendly) */}
        {showActions && (
          <div className="flex flex-row lg:flex-col gap-2 border-l border-white/5 pl-4 ml-4">
             <button
               onClick={() => {
                // ✅ Utiliser l'origine actuelle du navigateur au lieu de la variable d'environnement
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                if (baseUrl) {
                  window.open(`${baseUrl}/guest/${study.id}`, "_blank");
                } else {
                  console.error("❌ Impossible d'ouvrir l'étude : URL de base introuvable");
                }
               }}
               className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
               title="Voir Document"
             >
               <LucideActivity className="w-4 h-4" />
             </button>
             <button
                onClick={() => {
                  if (study.phone) window.location.href = `tel:${study.phone}`;
                  else alert("Numéro de téléphone non renseigné");
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                title="Appeler Client"
             >
               <span className="text-sm">📞</span>
               <span className="text-[10px] font-black uppercase tracking-tight">Appeler</span>
             </button>

             {/* ✅ NOUVEAU : BOUTON PREMIUM "SIGNER LE DOSSIER" (Croix jaune bas droite) */}
             {study.status !== "signed" && study.status !== "cancelled" && onSignStudy && (
               <button
                 onClick={() => onSignStudy(study.id, study.name)}
                 className="group/sign relative p-2.5 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:from-emerald-600/30 hover:to-emerald-500/20 hover:text-emerald-300 hover:border-emerald-400/60 transition-all active:scale-95 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50"
                 title="Signer le Dossier"
               >
                 {/* Glow effect */}
                 <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md opacity-0 group-hover/sign:opacity-100 transition-opacity duration-300"></div>
                 <span className="relative text-base">✍️</span>
               </button>
             )}

             {/* ✅ NOUVEAU : BOUTON PREMIUM "ANNULER L'ÉTUDE" (Croix jaune haut droite) */}
             {study.status !== "cancelled" && onCancelStudy && (
               <button
                 onClick={() => onCancelStudy(study.id, study.name)}
                 className="group/cancel relative p-2.5 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/10 border border-red-500/40 text-red-400 hover:from-red-600/30 hover:to-red-500/20 hover:text-red-300 hover:border-red-400/60 transition-all active:scale-95 shadow-lg shadow-red-900/30 hover:shadow-red-900/50"
                 title="Annuler l'Étude"
               >
                 {/* Glow effect */}
                 <div className="absolute inset-0 rounded-xl bg-red-500/20 blur-md opacity-0 group-hover/cancel:opacity-100 transition-opacity duration-300"></div>
                 <span className="relative text-base">❌</span>
               </button>
             )}

             {/* 💰 NOUVEAU : BOUTON PREMIUM "MARQUER ACOMPTE PAYÉ" */}
             {study.status === "signed" && study.has_deposit && !study.deposit_paid && onMarkDepositPaid && (
               <button
                 onClick={() => onMarkDepositPaid(study.id, study.name)}
                 className="group/deposit relative p-2.5 rounded-xl bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-500/40 text-green-400 hover:from-green-600/30 hover:to-green-500/20 hover:text-green-300 hover:border-green-400/60 transition-all active:scale-95 shadow-lg shadow-green-900/30 hover:shadow-green-900/50"
                 title="Marquer Acompte Payé"
               >
                 {/* Glow effect */}
                 <div className="absolute inset-0 rounded-xl bg-green-500/20 blur-md opacity-0 group-hover/deposit:opacity-100 transition-opacity duration-300"></div>
                 <span className="relative text-base">💰</span>
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
