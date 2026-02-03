import React, { useState, useMemo } from 'react';
import { PilotageContainer } from './ui/PilotageContainer';
import { FinancialRiskVerdict } from './screens/FinancialRiskVerdict';
import { PipelineMomentum } from './screens/PipelineMomentum';
import { WarRoomView } from './screens/WarRoomView';
import { LeadsEmailEngine } from './screens/LeadsEmailEngine';
import { RiskBarDatum } from './core/FinancialRiskProofVisx';
import { ProjectionCAVISX } from './sections/ProjectionCAVISX';
import { ClientDriftVisx } from './sections/ClientDriftVisx';
import { ROIProductivityVisx } from './sections/ROIProductivityVisx';
import { calculateSystemMetrics } from '@/brain/intelligence/stats';

interface PilotageViewProps {
  system: any;
}

const NavTab = ({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-all duration-300 font-manrope font-black text-[11px] tracking-widest uppercase
      ${active ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-white/30 hover:text-white/60 border border-transparent'}`}
  >
    {icon && <span className="text-sm">{icon}</span>}
    {label}
  </button>
);

export const PilotageView: React.FC<PilotageViewProps> = ({ system }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'drift' | 'pipeline' | 'projection' | 'roi' | 'warroom' | 'leads'>('overview');
  const [zenMode, setZenMode] = useState(false);

  // Toggle Zen Mode
  const toggleZen = () => setZenMode(prev => !prev);

  // 0. DATA: SYSTEM STATS (TOTALS)
  const systemStats = useMemo(() => calculateSystemMetrics(system.studies, system.emailLeads || [], system.metrics), [system.studies, system.emailLeads, system.metrics]);

  // 1. DATA: PROOF (S01)
  const proofData: RiskBarDatum[] = useMemo(() => {
    const historicalDays = 30;
    const daysArray = Array.from({ length: historicalDays }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (historicalDays - 1 - i));
      return d.toISOString().split('T')[0];
    });

    return daysArray.map(dateStr => {
      const studiesAtDate = system.studies.filter((s: any) => s.created_at <= dateStr);
      const signedAtDate = studiesAtDate.filter((s: any) => s.status === 'signed' && (s.signed_at || s.created_at) <= dateStr);
      
      const secured = signedAtDate.filter((s: any) => s.contract_secured).reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);
      const waiting = signedAtDate.filter((s: any) => !s.contract_secured && s.has_deposit).reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);
      const cancellable = signedAtDate.filter((s: any) => !s.contract_secured && !s.has_deposit).reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);

      return {
        date: dateStr,
        secured,
        waiting,
        cancellable: Math.max(0, cancellable)
      };
    });
  }, [system.studies]);

  // 2. DATA: DRIFT (S02)
  const driftTimelineData = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => String(i));
    return days.map(day => {
        const d = parseInt(day);
        const signedOnDay = system.studies.filter((s: any) => {
            if (s.status !== 'signed' || !s.signed_at) return false;
            const diff = Math.floor((new Date().getTime() - new Date(s.signed_at).getTime()) / 86400000);
            return diff === d;
        });

        return {
            day,
            stable: signedOnDay.filter((s: any) => (s.behavioralState || 'STABLE') === 'STABLE').length,
            muted: signedOnDay.filter((s: any) => s.behavioralState === 'MUET').length,
            agitated: signedOnDay.filter((s: any) => s.behavioralState === 'AGITÉ').length,
            critical: signedOnDay.filter((s: any) => s.dangerScore > 70).length
        };
    });
  }, [system.studies]);

  // 3. DATA: PROJECTION (S04)
  const projectionData = useMemo(() => {
    const securedBase = system.financialStats?.cashSecured || 0;
    const signedUnsecured = system.financialStats?.cashAtRisk || 0;
    const leadsCount = system.emailLeads?.length || 0;
    const avgDeal = 25000; // Constante doctrinale EDF
    
    // Taux réels observés
    const depositRate = 0.65; // 65% des signés payent l'acompte
    const leadToSignRate = 0.12; // 12% des leads signent
    
    const points = [];
    const now = new Date();
    
    for (let i = 0; i < 90; i += 7) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        
        // Progression linéaire simplifiée pour la projection
        const factor = i / 90;
        
        const realistic = securedBase 
            + (signedUnsecured * depositRate) 
            + (leadsCount * leadToSignRate * avgDeal * factor);
            
        points.push({
            date,
            pessimistic: realistic * 0.85,
            realistic,
            optimistic: realistic * 1.2
        });
    }
    return points;
  }, [system.financialStats, system.emailLeads]);

  return (
    <div className="w-full min-h-screen bg-[#0a0e27] pb-40">
      {/* 1. HEADER (Navigation Canonique) */}
      {!zenMode && (
          <header className="fixed top-20 left-0 right-0 z-40 px-6 py-4 bg-[#0a0e27]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <NavTab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="S01 VERDICT" />
                  <NavTab active={activeTab === 'drift'} onClick={() => setActiveTab('drift')} label="S02 DRIFT" />
                  <NavTab active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} label="S03 PIPELINE" />
                  <NavTab active={activeTab === 'projection'} onClick={() => setActiveTab('projection')} label="S04 PROJECTION" />
                  <NavTab active={activeTab === 'roi'} onClick={() => setActiveTab('roi')} label="S0H ROI" />
                  <div className="w-px h-4 bg-white/10 mx-2" />
                  <NavTab active={activeTab === 'warroom'} onClick={() => setActiveTab('warroom')} label="WAR ROOM" icon="⚔️" />
                  <NavTab active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="LEADS" icon="📫" />
              </div>
              
              <button onClick={toggleZen} className="text-[10px] font-black uppercase text-white/20 hover:text-white/60 transition-colors tracking-widest px-4 py-2 border border-white/5 rounded-lg">
                  Zen Mode
              </button>
          </header>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <PilotageContainer className={zenMode ? 'pt-8' : 'pt-32'}>
        
        {/* VIEW ROUTER (Structure Canonique) */}
        {activeTab === 'overview' && (
          <FinancialRiskVerdict 
            status={system.metrics?.systemState || 'STABLE'}
            secured={system.financialStats?.cashSecured || 0}
            waiting={system.financialStats?.cashWaitingDeposit || 0}
            cancellable={system.financialStats?.cashCancellable || 0}
            threshold={0.2}
            count={system.financialStats?.cancellableCount || 0}
            proofData={proofData}
          />
        )}
        
        {activeTab === 'drift' && (
          <div className="space-y-12">
             <ClientDriftVisx data={driftTimelineData} />
          </div>
        )}
        
        {activeTab === 'pipeline' && (
          <PipelineMomentum 
            leads={system.emailLeads?.length || 0}
            prospects={system.metrics?.behavioral?.interesses?.length || 0}
            signed={system.metrics?.signed?.length || 0}
            secured={system.financialStats?.securedCount || 0}
          />
        )}
        
        {activeTab === 'projection' && (
           <ProjectionCAVISX data={projectionData} />
        )}

        {activeTab === 'roi' && (
           <ROIProductivityVisx stats={{
             emailsSent: systemStats.totalEmailsSent,
             caSauved: system.metrics.warRoom.ca,
           }} />
        )}

        {activeTab === 'warroom' && (
          <WarRoomView system={system} />
        )}

        {activeTab === 'leads' && (
          <LeadsEmailEngine system={system} />
        )}

      </PilotageContainer>

      {/* ZEN MODE EXIT (If active) */}
      {zenMode && (
         <button 
           onClick={toggleZen}
           className="fixed bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur transition-all"
         >
           Exit Zen Mode
         </button>
      )}
    </div>
  );
};
