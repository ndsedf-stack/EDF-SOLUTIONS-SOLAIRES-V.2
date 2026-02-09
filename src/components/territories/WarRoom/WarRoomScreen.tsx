import React, { useMemo, useState } from 'react';
import { RiskMapVisx, WarRoomPoint } from './core/RiskMapVisx';
import { BehaviorDriftTimeline, BehaviorTimelineEvent } from './core/BehaviorDriftTimeline';
import { DealFocusPanel } from './core/DealFocusPanel';


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
  const [hoveredStudyId, setHoveredStudyId] = useState<string | null>(null);

  const criticalCount = warRoomStudies.length;
  const totalCriticalStake = warRoomStudies.reduce((sum, s) => sum + s.totalPrice, 0);

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

  // 3. AXE B & C DATA MEMOIZATION
  const axeBStudies = useMemo(() => (studies || []).filter((s: any) => s.status === 'sent'), [studies]);
  const toRelanceStudies = useMemo(() => axeBStudies.filter((s: any) => s.behavioralState === 'INTÉRESSÉ'), [axeBStudies]);
  const toObserveStudies = useMemo(() => axeBStudies.filter((s: any) => s.behavioralState === 'AGITÉ'), [axeBStudies]);
  const toWakeUpStudies = useMemo(() => axeBStudies.filter((s: any) => s.behavioralState === 'MUET' && s.diffDays < 7), [axeBStudies]);
  const toStopStudies = useMemo(() => axeBStudies.filter((s: any) => s.behavioralState === 'FATIGUE'), [axeBStudies]);

  const axeCLeads = useMemo(() => (system.emailLeads || []).filter((l: any) => !l.study_id), [system.emailLeads]);
  const toCallLeads = useMemo(() => axeCLeads.filter((l: any) => l.total_clicks >= 1), [axeCLeads]);
  const toObserveLeads = useMemo(() => axeCLeads.filter((l: any) => l.total_clicks === 0 && l.total_opens >= 1), [axeCLeads]);
  const toDropLeads = useMemo(() => axeCLeads.filter((l: any) => l.total_clicks === 0 && l.total_opens === 0), [axeCLeads]);

  return (
    <div className="flex flex-col gap-12 py-8 px-4 max-w-[1400px] mx-auto pb-40">
      
      <header className="flex flex-col gap-1">
         <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase">War Room Operations</h1>
         <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Concentration humaine sur le CA récupérable</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: RISK MAP (CENTRAL) */}
        {/* LEFT: RISK MAP (CENTRAL - 70%) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
           
           {/* CHART CONTAINER - IMMERSIVE */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
               <div className="absolute top-6 left-6 z-10 pointer-events-none">
                  <h2 className="text-lg font-black text-white tracking-tight uppercase">Focus Décisionnel — {criticalCount} Dossiers en Zone de Danger</h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    EXPOSITION TOTALE : <span className="font-mono">{Math.round(totalCriticalStake).toLocaleString('fr-FR')} €</span>
                  </p>
               </div>
              
              <div className="pt-10"> {/* Padding top pour laisser place au titre */}
                <RiskMapVisx 
                  studies={warRoomStudies} 
                  onPointClick={setActiveStudyId} 
                  highlightedStudyId={hoveredStudyId}
                />
              </div>
           </div>

           {/* COMPACT DATA LIST - INTEGRATED BELOW CHART */}
           <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Dossiers en Alerte ({warRoomStudies.length})
                </h3>
                <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Sync: Active</span>
              </div>
              
              <div className="divide-y divide-white/[0.03]">
                {warRoomStudies.slice(0, 5).map(s => (
                  <button 
                    key={s.studyId}
                    onClick={() => setActiveStudyId(s.studyId)}
                    onMouseEnter={() => setHoveredStudyId(s.studyId)}
                    onMouseLeave={() => setHoveredStudyId(null)}
                    className={`w-full px-6 py-3 flex justify-between items-center hover:bg-white/[0.02] transition-colors group ${
                      activeStudyId === s.studyId ? 'bg-white/[0.04]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dangerScore > 70 ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <span className={`text-sm font-black uppercase tracking-tight ${activeStudyId === s.studyId ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {s.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <span className="w-14 text-right inline-block font-black">{Math.round(s.totalPrice / 1000)}k€</span>
                      <span className={`w-12 text-right inline-block font-black ${s.daysBeforeDeadline < 5 ? 'text-red-400' : 'text-blue-400'}`}>
                        J-{s.daysBeforeDeadline}
                      </span>
                      <span className="text-slate-600 w-10 text-right inline-block font-black">{s.dangerScore}%</span>
                    </div>
                  </button>
                ))}
                {warRoomStudies.length > 5 && (
                    <div className="px-6 py-2 text-center border-t border-white/5">
                        <span className="text-[10px] text-slate-600 uppercase tracking-widest">+ {warRoomStudies.length - 5} autres dossiers</span>
                    </div>
                )}
              </div>
           </div>
        </div>

        {/* RIGHT: DEAL FOCUS & TIMELINE (30%) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
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

               <div className="bg-black/20 backdrop-blur-sm p-10 rounded-xl border border-white/10 space-y-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dérive Comportementale</h3>
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
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">
          AXE A — DOSSIERS SIGNÉS (ANTI-ANNULATION)
        </h2>

        {/* LOGIC HELPER AXE A */}
        {(() => {
           const studies = (system.studies || []) as Study[];
           const signedStudies = studies.filter(s => s.status === 'signed');
           
           const classifyAxeA = (s: Study) => {
              const daysSinceSigned = s.signed_at ? Math.floor((new Date().getTime() - new Date(s.signed_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
              const dangerScore = s.dangerScore || 0;

              // ✅ DÉCISION PREMIUM : Un dossier sécurisé est SOUS CONTRÔLE.
              // On ne le sort du périmètre (archive) qu'après 30 jours.
              if (s.contract_secured) {
                 return daysSinceSigned > 30 ? 'HORS_PERIMETRE' : 'SOUS_CONTROLE';
              }
              
              // 🚨 WAR ROOM : dangerScore >= 70 OU (!deposit_paid && days > 7)
              if (dangerScore >= 70 || (!s.deposit_paid && daysSinceSigned > 7)) return 'WAR_ROOM';

              // 🟠 À SÉCURISER : !deposit_paid OU agité
              if (!s.deposit_paid || s.behavioralState === 'AGITÉ') return 'A_SECURISER';

              // 🟢 SOUS CONTRÔLE (Fallback pour les dossiers récents et sains non encore "secured")
              return 'SOUS_CONTROLE';
           };

           // 🛠️ CORRECTIF : Si signé et deposit_paid est null/false mais que c'est une vieille étude (> 7j), on assume que c'est géré ou payé hors plateforme
           // Cela évite l'alerte "En Attente" massive.
           const getDepositStatus = (s: Study) => {
                 if (s.deposit_paid) return "PAYÉ ✅";
                 if (s.has_deposit && !s.deposit_paid) return "EN ATTENTE ⚠️";
                 return "NON REQUIS ➖";
           };

           const warRoom = signedStudies.filter(s => classifyAxeA(s) === 'WAR_ROOM');
           const toSecure = signedStudies.filter(s => classifyAxeA(s) === 'A_SECURISER');
           const underControl = signedStudies.filter(s => classifyAxeA(s) === 'SOUS_CONTROLE');
           const outOfScope = signedStudies.filter(s => classifyAxeA(s) === 'HORS_PERIMETRE');

           return (
             <>
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                   <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-red-500/20">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">War Room</span>
                      <p className="text-3xl font-black text-white mt-1 font-mono">{warRoom.length}</p>
                   </div>
                   <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-amber-500/20">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">À Sécuriser</span>
                      <p className="text-3xl font-black text-white mt-1 font-mono">{toSecure.length}</p>
                   </div>
                   <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sous Contrôle</span>
                      <p className="text-3xl font-black text-white mt-1 font-mono">{underControl.length}</p>
                   </div>
                   <div className="bg-black/20 backdrop-blur-sm p-8 rounded-xl border border-white/10 opacity-30">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hors Périmètre</span>
                      <p className="text-3xl font-black text-slate-600 mt-1 font-mono">{outOfScope.length}</p>
                   </div>
                </div>

                {/* LISTE DETAILLEE WAR ROOM + A SECURISER */}
                 <div className="bg-[#0B0F14] rounded-2xl border border-white/5 overflow-hidden">
                     <div className="px-8 py-4 border-b border-white/5 bg-white/[0.01]">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dossiers à Sécuriser ({warRoom.length + toSecure.length})</h3>
                     </div>
                     <div className="divide-y divide-white/[0.03]">
                        {[...warRoom, ...toSecure].length === 0 && (
                             <div className="p-8 text-center text-white/20 text-xs uppercase tracking-widest">Aucun dossier critique</div>
                        )}
                        {[...warRoom, ...toSecure].map(s => {
                            const isWarRoom = classifyAxeA(s) === 'WAR_ROOM';
                            const lastInteraction = s.last_click || s.last_open || s.signed_at;
                            const daysSinceSigned = s.signed_at ? Math.floor((new Date().getTime() - new Date(s.signed_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                            
                            return (
                               <div key={s.id} className={`p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors ${isWarRoom ? 'bg-red-500/5' : ''}`}>
                                   <div className="w-[35%]">
                                       <div className="flex items-center gap-2">
                                           {isWarRoom && <span className="text-lg">🚨</span>}
                                           <div>
                                               <p className="text-white font-black text-sm truncate pr-2 uppercase tracking-tight">{s.name}</p>
                                               <p className="text-slate-500 text-[10px] font-bold uppercase">Signé il y a <span className="font-mono">{daysSinceSigned}</span> jours</p>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="w-[15%]">
                                       <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Acompte</p>
                                       {(() => {
                                            const status = getDepositStatus(s);
                                            return (
                                                <span className={`text-xs font-bold uppercase ${
                                                    status.includes('PAYÉ') ? 'text-emerald-400' : 
                                                    status.includes('EN COURS') ? 'text-blue-400' : 'text-orange-400'
                                                }`}>
                                                    {status}
                                                </span>
                                            );
                                       })()}
                                   </div>
                                   <div className="w-[20%] flex flex-col items-end">
                                      <p className="text-white font-bold text-sm">{Math.round(s.total_price).toLocaleString('fr-FR')} €</p>
                                      <p className="text-white/40 text-[10px] uppercase tracking-wider mt-1 text-right">
                                         {lastInteraction ? (
                                             <>Interaction il y a {Math.floor((new Date().getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24))} j</>
                                         ) : 'Aucune interaction'}
                                      </p>
                                   </div>
                                   <div className="w-[30%] flex justify-end pl-4">
                                       <div className={`px-4 py-2 rounded-lg border ${isWarRoom ? 'bg-red-500/5 border-red-500/10' : 'bg-amber-500/5 border-white/5'} whitespace-nowrap`}>
                                           <p className={`${isWarRoom ? 'text-red-400' : 'text-slate-400'} text-[10px] font-bold uppercase tracking-widest`}>
                                               {isWarRoom ? 'URGENCE : SÉCURISER' : 'ACTION : SÉCURISER'}
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
      <div className="border-t border-white/5 pt-16 mt-16">
        <header className="mb-10">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Retention Strategy</span>
           <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1 uppercase">AXE B — Post-Présentation sans Signature</h2>
           <p className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest mt-2">
              Impact : <span className="font-mono">{toRelanceStudies.length}</span> Relances Prioritaires en attente
           </p>
        </header>
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                    <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-red-500/20">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priorité Relance</span>
                       <p className="text-3xl font-black text-white mt-1 font-mono">{toRelanceStudies.length}</p>
                    </div>

                    <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-amber-500/20">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">À Surveiller</span>
                       <p className="text-3xl font-black text-white mt-1 font-mono">{toObserveStudies.length}</p>
                    </div>
                    
                    <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-blue-500/20">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Réveil Nécessaire</span>
                       <p className="text-3xl font-black text-white mt-1 font-mono">{toWakeUpStudies.length}</p>
                    </div>

                    <div className="bg-black/20 backdrop-blur-sm p-8 rounded-xl border border-white/10 opacity-30">
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Interruption (Stop)</span>
                       <p className="text-3xl font-black text-slate-600 mt-1 font-mono">{toStopStudies.length}</p>
                    </div>
                 </div>
                 
                 {/* LISTE A RELANCER (PREMIUM REDESIGN) */}
                 <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-2xl">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01]">
                         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            Priorité Relance ({toRelanceStudies.length})
                         </h3>
                    </div>
           
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-4 px-6 text-[9px] uppercase font-bold text-slate-500 tracking-widest">Client Identity</th>
                    <th className="py-4 px-6 text-[9px] uppercase font-bold text-slate-500 tracking-widest">Potentiel</th>
                    <th className="py-4 px-6 text-[9px] uppercase font-bold text-slate-500 tracking-widest text-right">Last Interaction</th>
                    <th className="py-4 px-6 text-[9px] uppercase font-bold text-slate-500 tracking-widest text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {toRelanceStudies.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-white/20 text-xs uppercase tracking-widest font-mono">
                            Aucun dossier à relancer
                        </td>
                    </tr>
                ) : (
                    toRelanceStudies.map(s => {
                        const lastInteraction = s.last_click || s.last_open || s.created_at;
                        const clientPhone = (s as any).clients?.phone || s.phone || 'N/A';
                        const clientName = ((s as any).client_name || s.name || "CLIENT INCONNU").toUpperCase();

                        return (
                           <tr key={s.id} className="group hover:bg-white/[0.04] transition-all duration-300 ease-out">
                               <td className="py-4 px-6">
                                   <div className="flex flex-col gap-1">
                                       <span className="text-sm font-black text-slate-200 group-hover:text-white transition-colors tracking-wide uppercase">
                                           {clientName}
                                       </span>
                                       <span className="text-[10px] font-mono text-white/30">{clientPhone}</span>
                                   </div>
                               </td>
                               <td className="py-4 px-6">
                                   <span className="text-emerald-400 font-bold font-mono text-xs bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                       {Math.round(s.total_price).toLocaleString('fr-FR')} €
                                   </span>
                               </td>
                               <td className="py-4 px-6 text-right">
                                   <span className="text-white/40 text-[10px] font-mono uppercase">
                                      {(() => {
                                           if (!lastInteraction) return 'N/A';
                                           const days = Math.floor((new Date().getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
                                           return days === 0 ? "Aujourd'hui" : `il y a ${days}j`;
                                      })()}
                                   </span>
                               </td>
                               <td className="py-4 px-6 text-right">
                                   <button className="bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border border-white/10 transition-all">
                                       Lancer Appel
                                   </button>
                               </td>
                           </tr>
                        );
                    })
                )}
              </tbody>
           </table>
        </div>
      </div>

      {/* AXE C - LEADS JAMAIS JOINTS */}
      <div className="border-t border-white/5 pt-16 mt-16">
        <header className="mb-10">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acquisition Control</span>
           <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1 uppercase">AXE C — Leads Qualifiés jamais joints</h2>
           <p className="text-red-500/60 text-[10px] font-bold uppercase tracking-widest mt-2">
              Priorité : <span className="font-mono">{toCallLeads.length}</span> Appels Recommandés
           </p>
        </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-red-500/20">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priorité Appel</span>
               <p className="text-3xl font-black text-white mt-1 font-mono">{toCallLeads.length}</p>
            </div>
            
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl border border-amber-500/20">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Observation Active</span>
               <p className="text-3xl font-black text-white mt-1 font-mono">{toObserveLeads.length}</p>
            </div>

            <div className="bg-black/20 backdrop-blur-sm p-8 rounded-xl border border-white/10 opacity-30">
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Interruption (Abandon)</span>
               <p className="text-3xl font-black text-slate-600 mt-1 font-mono">{toDropLeads.length}</p>
            </div>
         </div>

         {/* LISTE A APPELER */}
         <div className="bg-[#0B0F14] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
             <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Priorité Appel ({toCallLeads.length})
                 </h3>
             </div>
             <div className="divide-y divide-white/[0.03]">
                 {toCallLeads.length === 0 ? (
                     <div className="p-8 text-center text-slate-500 text-xs uppercase tracking-widest">Aucun lead à rappeler</div>
                 ) : toCallLeads.map(lead => (
                     <div key={lead.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                         <div className="w-[40%]">
                             <p className="text-white font-bold text-sm tracking-tight">{lead.client_name.toUpperCase()}</p>
                             <p className="text-slate-500 text-xs mt-0.5">{lead.client_email}</p>
                         </div>
                         <div className="w-[30%] text-right">
                             <p className="text-slate-500 text-[9px] uppercase tracking-wider mb-1">Dernière interaction</p>
                             <p className="text-slate-300 font-mono text-xs">{(() => {
                                 if (!lead.last_clicked_at) return 'N/A';
                                 const days = Math.floor((new Date().getTime() - new Date(lead.last_clicked_at).getTime()) / (1000 * 60 * 60 * 24));
                                 return days === 0 ? "Aujourd'hui" : `il y a ${days}j`;
                             })()}</p>
                         </div>
                         <div className="w-[30%] flex justify-end">
                             <div className="px-4 py-2 bg-red-500/5 rounded-lg border border-red-500/20">
                                 <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest italic">Intervention Recommandée</p>
                             </div>
                         </div>
                     </div>
                 ))}
              </div>
          </div>
       </div>
    </div>
  );
}
