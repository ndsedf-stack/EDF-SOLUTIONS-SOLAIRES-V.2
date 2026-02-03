import React, { useMemo, useState } from 'react';
import { RiskMapVisx, WarRoomPoint } from './core/RiskMapVisx';
import { BehaviorDriftTimeline, BehaviorTimelineEvent } from './core/BehaviorDriftTimeline';
import { DealFocusPanel } from './core/DealFocusPanel';
// Assuming utils.ts is in the same directory as this file or ExecutionDesk
// If formatCurrency is not exported from a local utils, we might need another source.
// Checking file listing... ExecutionDesk imports from ./utils.
import { formatCurrency } from './utils';

import { EmailLead, Study } from '@/brain/types';

interface WarRoomScreenProps {
  system: any;
}

export function WarRoomScreen({ system }: WarRoomScreenProps) {
  const { metrics, studies, logs } = system;

  // 1. MAPPING WAR ROOM STUDIES
  const warRoomStudies: WarRoomPoint[] = useMemo(() => {
    return metrics.warRoom.studies.map((s: any) => ({
      studyId: s.id,
      name: s.name,
      daysBeforeDeadline: s.daysLate ? 14 - s.daysLate : 14,
      totalPrice: s.total_price || 0,
      dangerScore: s.dangerScore || 50,
      engagementScore: (s.views || 0) * 10 + (s.clicks || 0) * 20,
    }));
  }, [metrics.warRoom.studies]);

  const [activeStudyId, setActiveStudyId] = useState<string | null>(
    warRoomStudies.length > 0 ? warRoomStudies[0].studyId : null
  );

  const selectedStudy = useMemo(() => {
    return (studies || []).find((s: any) => s.id === (activeStudyId || (warRoomStudies[0]?.studyId)));
  }, [studies, activeStudyId, warRoomStudies]);

  // 2. MAPPING BEHAVIOR TIMELINE FOR SELECTED STUDY
  const behaviorEvents: BehaviorTimelineEvent[] = useMemo(() => {
    if (!selectedStudy) return [];
    
    const events: BehaviorTimelineEvent[] = [];
    if (selectedStudy.signed_at) {
        events.push({ type: 'signature', date: new Date(selectedStudy.signed_at).toLocaleDateString(), label: 'Signature du contrat' });
    }
    
    if (selectedStudy.views > 0) {
        events.push({ type: 'opening', date: 'J+1', label: `${selectedStudy.views} ouvertures détectées` });
    }
    
    if (selectedStudy.clicks > 0) {
        events.push({ type: 'click', date: 'J+2', label: `${selectedStudy.clicks} interactions avec l'étude` });
    }

    if (selectedStudy.send_count > 0) {
        events.push({ type: 'email_sent', date: 'J+3', label: `Relance automatique de réassurance` });
    }

    if (selectedStudy.behavioralState === 'MUET') {
        events.push({ type: 'silence', date: 'Aujourd\'hui', label: 'Silence prolongé - Risque d\'annulation élevé' });
    }

    return events;
  }, [selectedStudy]);

  return (
    <div className="flex flex-col gap-12 py-8 px-4 max-w-[1400px] mx-auto pb-40">
      
      <header className="flex flex-col gap-2">
         <h1 className="text-4xl font-black text-white tracking-tighter uppercase">War Room Operations</h1>
         <p className="text-white/40 text-sm font-black uppercase tracking-[0.4em]">Concentration humaine sur le CA récupérable</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: RISK MAP (CENTRAL) */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-8">
              <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-widest">Carte des risques actifs</h2>
                   <p className="text-white/40 text-sm font-medium italic">"X = Momentum (Temps), Y = Enjeu (CA), Taille = Engagement."</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-black text-white/20 uppercase tracking-widest">Dossiers en alerte</span>
                    <p className="text-2xl font-black text-red-500">{warRoomStudies.length}</p>
                </div>
              </div>
              <RiskMapVisx studies={warRoomStudies} />
           </div>

           {/* LISTE DES DOSSIERS (MINIMALISTE) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warRoomStudies.map(s => (
                <button 
                  key={s.studyId}
                  onClick={() => setActiveStudyId(s.studyId)}
                  className={`p-6 rounded-2xl border transition-all text-left flex justify-between items-center ${
                    activeStudyId === s.studyId ? 'bg-red-500/10 border-red-500/40 ring-1 ring-red-500/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="space-y-1">
                     <p className="text-sm font-black text-white">{s.name}</p>
                     <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{Math.round(s.totalPrice / 1000)}k€ — {s.daysBeforeDeadline}j</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${s.dangerScore > 70 ? 'bg-red-500' : 'bg-orange-400'}`} />
                </button>
              ))}
           </div>
        </div>

        {/* RIGHT: DEAL FOCUS & TIMELINE */}
        <div className="lg:col-span-4 space-y-10">
           {selectedStudy ? (
             <>
               <DealFocusPanel 
                  study={{
                    id: selectedStudy.id,
                    name: selectedStudy.name,
                    totalPrice: selectedStudy.total_price || 0,
                    dangerScore: selectedStudy.dangerScore || 50,
                    daysBeforeDeadline: selectedStudy.daysLate ? 14 - selectedStudy.daysLate : 14,
                  }}
                  recommendation={{
                    type: 'Appel Téléphonique',
                    reason: selectedStudy.behavioralState === 'MUET' ? 'Silence prolongé post-signature. Suspicion de doute.' : 'Baisse d\'engagement suspecte sur l\'étude.',
                    urgency: (selectedStudy.dangerScore || 0) > 70 ? 'high' : 'medium',
                  }}
                  onAction={(id) => console.log('Action human intervention launched for', id)}
               />

               <div className="bg-[#0F1629] p-10 rounded-3xl border border-white/5 space-y-8">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">Dérive Comportementale</h3>
                  <BehaviorDriftTimeline events={behaviorEvents} />
               </div>
             </>
           ) : (
             <div className="h-full flex items-center justify-center p-20 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Sélectionnez un dossier pour lancer l'analyse</p>
             </div>


           )}
        </div>

      </div>

      {/* AXE A - DOSSIERS SIGNÉS (ANTI-ANNULATION) */}
      <div className="border-t border-white/10 pt-12 mt-8">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8">
          AXE A — DOSSIERS SIGNÉS (ANTI-ANNULATION)
        </h2>

        {/* LOGIC HELPER AXE A */}
        {(() => {
           const studies = (system.studies || []) as Study[];
           const signedStudies = studies.filter(s => s.status === 'signed');
           
           const classifyAxeA = (s: Study) => {
              if (s.contract_secured) return 'HORS_PERIMETRE';
              
              const daysSinceSigned = s.signed_at ? Math.floor((new Date().getTime() - new Date(s.signed_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
              const dangerScore = s.dangerScore || 0;

              // 🚨 WAR ROOM : dangerScore >= 70 OU (!deposit_paid && days > 7)
              if (dangerScore >= 70 || (!s.deposit_paid && daysSinceSigned > 7)) return 'WAR_ROOM';

              // 🟠 À SÉCURISER : !deposit_paid OU agité
              if (!s.deposit_paid || s.behavioralState === 'AGITÉ') return 'A_SECURISER';

              // 🟢 SOUS CONTRÔLE
              return 'SOUS_CONTROLE';
           };

           const warRoom = signedStudies.filter(s => classifyAxeA(s) === 'WAR_ROOM');
           const toSecure = signedStudies.filter(s => classifyAxeA(s) === 'A_SECURISER');
           const underControl = signedStudies.filter(s => classifyAxeA(s) === 'SOUS_CONTROLE');
           const outOfScope = signedStudies.filter(s => classifyAxeA(s) === 'HORS_PERIMETRE');

           return (
             <>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                   <div className="bg-[#0F1629] p-8 rounded-2xl border border-red-500/20">
                      <span className="text-xs font-black text-red-500 uppercase tracking-widest">🚨 WAR ROOM</span>
                      <p className="text-4xl font-black text-white mt-2">{warRoom.length}</p>
                   </div>
                   <div className="bg-[#0F1629] p-8 rounded-2xl border border-orange-500/20">
                      <span className="text-xs font-black text-orange-500 uppercase tracking-widest">🟠 À SÉCURISER</span>
                      <p className="text-4xl font-black text-white mt-2">{toSecure.length}</p>
                   </div>
                   <div className="bg-[#0F1629] p-8 rounded-2xl border border-emerald-500/20">
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">🟢 SOUS CONTRÔLE</span>
                      <p className="text-4xl font-black text-white mt-2">{underControl.length}</p>
                   </div>
                   <div className="bg-[#0F1629] p-8 rounded-2xl border border-white/10 opacity-50">
                      <span className="text-xs font-black text-white/50 uppercase tracking-widest">⛔ HORS PÉRIMÈTRE</span>
                      <p className="text-4xl font-black text-white mt-2">{outOfScope.length}</p>
                   </div>
                </div>

                {/* LISTE DETAILLEE WAR ROOM + A SECURISER */}
                <div className="bg-[#0F1629] rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">📋 DOSSIERS À TRAITER ({warRoom.length + toSecure.length})</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {[...warRoom, ...toSecure].length === 0 && (
                             <div className="p-8 text-center text-white/20 text-xs uppercase tracking-widest">Aucun dossier critique</div>
                        )}
                        {[...warRoom, ...toSecure].map(s => {
                            const isWarRoom = classifyAxeA(s) === 'WAR_ROOM';
                            const lastInteraction = s.last_click || s.last_open || s.signed_at;
                            const daysSinceSigned = s.signed_at ? Math.floor((new Date().getTime() - new Date(s.signed_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                            
                            return (
                               <div key={s.id} className={`p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors ${isWarRoom ? 'bg-red-500/5' : ''}`}>
                                   <div className="w-1/4">
                                       <div className="flex items-center gap-2">
                                           {isWarRoom && <span className="text-lg">🚨</span>}
                                           <div>
                                               <p className="text-white font-bold text-sm">{s.name}</p>
                                               <p className="text-white/40 text-xs">Signé il y a {daysSinceSigned} jours</p>
                                           </div>
                                       </div>
                                   </div>
                                    <div className="w-1/4">
                                       <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Acompte</p>
                                       {s.deposit_paid ? (
                                           <span className="text-emerald-400 text-xs font-bold uppercase">Payé ✅</span>
                                       ) : (
                                           <span className="text-orange-400 text-xs font-bold uppercase">En attente ⏳</span>
                                       )}
                                   </div>
                                   <div className="w-1/4 flex flex-col items-end">
                                      <p className="text-white font-bold text-sm">{Math.round(s.total_price).toLocaleString('fr-FR')} €</p>
                                      <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1">
                                         {lastInteraction ? (
                                             <>Interaction il y a {Math.floor((new Date().getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24))} j</>
                                         ) : 'Aucune interaction'}
                                      </p>
                                   </div>
                                   <div className="w-1/4 flex justify-end">
                                       <div className={`px-4 py-2 rounded-lg border ${isWarRoom ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                                           <p className={`${isWarRoom ? 'text-red-400' : 'text-orange-400'} text-[10px] font-black uppercase tracking-widest`}>
                                               {isWarRoom ? 'Recommandation : Sécuriser Urgence' : 'Recommandation : Sécuriser'}
                                           </p>
                                       </div>
                                   </div>
                               </div>
                            );
                        })}
                    </div>
                </div>
             </>
           );
        })()}
      </div>

      {/* AXE B - POST-RDV SANS SIGNATURE */}
      <div className="border-t border-white/10 pt-12 mt-8">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8">
          AXE B — POST-RDV SANS SIGNATURE
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
           <div className="bg-[#0F1629] p-8 rounded-2xl border border-red-500/20">
              <span className="text-xs font-black text-red-500 uppercase tracking-widest">🔥 À RELANCER</span>
              <p className="text-4xl font-black text-white mt-2">{(() => {
                  const studies = (system.studies || []) as Study[];
                  return studies.filter(s => s.status === 'sent' && (s.behavioralState === 'INTÉRESSÉ')).length;
              })()}</p>
           </div>

           <div className="bg-[#0F1629] p-8 rounded-2xl border border-orange-500/20">
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">🟠 À SURVEILLER</span>
              <p className="text-4xl font-black text-white mt-2">{(() => {
                  const studies = (system.studies || []) as Study[];
                  return studies.filter(s => s.status === 'sent' && s.behavioralState === 'AGITÉ').length;
              })()}</p>
           </div>
           
           <div className="bg-[#0F1629] p-8 rounded-2xl border border-blue-500/20">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">🧊 À RÉVEILLER</span>
              <p className="text-4xl font-black text-white mt-2">{(() => {
                  const studies = (system.studies || []) as Study[];
                  return studies.filter(s => s.status === 'sent' && s.behavioralState === 'MUET' && s.diffDays < 7).length;
              })()}</p>
           </div>

           <div className="bg-[#0F1629] p-8 rounded-2xl border border-white/10 opacity-50">
              <span className="text-xs font-black text-white/50 uppercase tracking-widest">⛔ STOP</span>
              <p className="text-4xl font-black text-white mt-2">{(() => {
                  const studies = (system.studies || []) as Study[];
                  return studies.filter(s => s.status === 'sent' && s.behavioralState === 'FATIGUE').length;
              })()}</p>
           </div>
        </div>
        
        {/* LISTE A RELANCER (DETAIL) */}
        <div className="bg-[#0F1629] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">🔥 PRIORITÉ RELANCE ({(() => {
                  const studies = (system.studies || []) as Study[];
                  return studies.filter(s => s.status === 'sent' && s.behavioralState === 'INTÉRESSÉ').length;
              })()})</h3>
            </div>
            <div className="divide-y divide-white/5">
                {(() => {
                    const studies = (system.studies || []) as Study[];
                    const toRelance = studies.filter(s => s.status === 'sent' && s.behavioralState === 'INTÉRESSÉ');

                    if (toRelance.length === 0) {
                        return <div className="p-8 text-center text-white/20 text-xs uppercase tracking-widest">Aucun dossier à relancer</div>;
                    }

                    return toRelance.map(s => {
                        const lastInteraction = s.last_click || s.last_open || s.created_at;
                        const clientPhone = (s as any).clients?.phone || s.phone || 'N/A';
                        
                        return (
                           <div key={s.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                               <div className="w-1/4">
                                   <p className="text-white font-bold text-sm">{s.name}</p>
                                   <p className="text-white/40 text-xs font-mono">{clientPhone}</p>
                               </div>
                               <div className="w-1/4">
                                   <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Potentiel</p>
                                   <p className="text-white font-bold text-sm">{Math.round(s.total_price).toLocaleString('fr-FR')} €</p>
                               </div>
                               <div className="w-1/4 text-right">
                                   <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Dernière interaction</p>
                                   <p className="text-white font-mono text-xs">{(() => {
                                       if (!lastInteraction) return 'N/A';
                                       const days = Math.floor((new Date().getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
                                       return days === 0 ? "Aujourd'hui" : `il y a ${days} jours`;
                                   })()}</p>
                               </div>
                               <div className="w-1/4 flex justify-end">
                                   <div className="px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                       <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Recommandation : Appeler (Intérêt détecté)</p>
                                   </div>
                               </div>
                           </div>
                        );
                    });
                })()}
            </div>
        </div>
      </div>

      {/* AXE C - LEADS JAMAIS JOINTS */}
      <div className="border-t border-white/10 pt-12 mt-8">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8">
          AXE C — LEADS JAMAIS JOINTS
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           {/* STATS CARDS */}
           <div className="bg-[#0F1629] p-8 rounded-2xl border border-red-500/20">
              <span className="text-xs font-black text-red-500 uppercase tracking-widest">🔥 À Appeler</span>
              <p className="text-4xl font-black text-white mt-2">{(() => {
                  const leads = (system.emailLeads || []) as EmailLead[];
                  return leads.filter(l => !l.study_id && l.total_clicks >= 1).length;
              })()}</p>
           </div>
           
           <div className="bg-[#0F1629] p-8 rounded-2xl border border-orange-500/20">
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">🟠 À Observer</span>
              <p className="text-4xl font-black text-white mt-2">{(() => {
                  const leads = (system.emailLeads || []) as EmailLead[];
                  return leads.filter(l => !l.study_id && l.total_clicks === 0 && l.total_opens >= 1).length;
              })()}</p>
           </div>

           <div className="bg-[#0F1629] p-8 rounded-2xl border border-blue-500/20">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">🧊 À Abandonner</span>
              <p className="text-4xl font-black text-white mt-2">{(() => {
                  const leads = (system.emailLeads || []) as EmailLead[];
                  return leads.filter(l => !l.study_id && l.total_clicks === 0 && l.total_opens === 0).length;
              })()}</p>
           </div>
        </div>

        {/* LISTE A APPELER */}
        <div className="bg-[#0F1629] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">🔥 PRIORITÉ APPEL ({(() => {
                  const leads = (system.emailLeads || []) as EmailLead[];
                  return leads.filter(l => !l.study_id && l.total_clicks >= 1).length;
              })()})</h3>
            </div>
            <div className="divide-y divide-white/5">
                {(() => {
                   const leads = (system.emailLeads || []) as EmailLead[];
                   const toCall = leads.filter(l => !l.study_id && l.total_clicks >= 1);
                   
                   if (toCall.length === 0) {
                       return <div className="p-8 text-center text-white/20 text-xs uppercase tracking-widest">Aucun lead à appeler</div>;
                   }

                   return toCall.map(lead => (
                       <div key={lead.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                           <div>
                               <p className="text-white font-bold text-sm">{lead.client_name}</p>
                               <p className="text-white/40 text-xs">{lead.client_email}</p>
                           </div>
                           <div className="text-right">
                               <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Dernière interaction</p>
                               <p className="text-white font-mono text-xs">{(() => {
                                   if (!lead.last_clicked_at) return 'N/A';
                                   const days = Math.floor((new Date().getTime() - new Date(lead.last_clicked_at).getTime()) / (1000 * 60 * 60 * 24));
                                   return days === 0 ? "Aujourd'hui" : `il y a ${days} jours`;
                               })()}</p>
                           </div>
                           <div className="px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                               <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Recommandation : Appeler</p>
                           </div>
                       </div>
                   ));
                })()}
            </div>
        </div>
      </div>
    </div>
  );
}
