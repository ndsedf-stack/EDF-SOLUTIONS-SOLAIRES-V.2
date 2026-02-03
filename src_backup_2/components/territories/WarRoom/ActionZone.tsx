import React from 'react';
import { Study, Metrics, EmailLead } from '@/brain/types';
import { StudyCardPremium } from '@/components/dashboard/StudyCardPremium';

interface ActionZoneProps {
  studies: Study[];
  metrics: Metrics;
  antiAnnulationByStudy: Record<string, any>;
  postRefusByStudy: Record<string, any>;
  leads: EmailLead[];
  onMarkDepositPaid: (id: string, name: string) => void;
  onMarkRibSent: (id: string, name: string) => void;
  onSignStudy: (id: string, name: string) => void;
  onCancelStudy: (id: string, name: string) => void;
  onDeleteStudy: (id: string, name: string) => void;
}

export const ActionZone: React.FC<ActionZoneProps> = ({
  studies,
  metrics,
  antiAnnulationByStudy,
  postRefusByStudy,
  leads,
  onMarkDepositPaid,
  onMarkRibSent,
  onSignStudy,
  onCancelStudy,
  onDeleteStudy,
}) => {
  // Calculer les dossiers critiques (Signés sans acompte + en retard)
  const criticalStudies = studies
    .filter(
      (s) => s.status === "signed" && !s.deposit_paid && s.requiresDeposit
    )
    .sort((a, b) => {
      const daysA = a.daysSinceSigned || 0;
      const daysB = b.daysSinceSigned || 0;
      return daysB - daysA;
    })
    .slice(0, 5);

  if (criticalStudies.length === 0) {
    return (
        <div className="mb-8 p-12 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h2 className="text-xl font-black text-emerald-400 uppercase tracking-widest">Zone d'Action Sécurisée</h2>
            <p className="text-slate-500 mt-2">Aucun dossier critique en attente d'action immédiate.</p>
        </div>
    );
  }

  const scrollToLateDeposits = () => {
    const element = document.getElementById("late-deposits-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                ZONE D'ACTION PRIORITAIRE
              </h2>
              <div className="text-sm text-orange-400 font-medium font-mono uppercase">
                {criticalStudies.length} dossier(s) critique(s) en attente d'acompte
              </div>
            </div>
        </div>
        <button
          onClick={scrollToLateDeposits}
          className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase hover:bg-orange-500/20 transition-all"
        >
          Voir Historique Complexe ▼
        </button>
      </div>

      <div className="space-y-4">
        {criticalStudies.map((study) => (
          <StudyCardPremium
            key={study.id}
            study={study}
            antiAnnulationByStudy={antiAnnulationByStudy}
            postRefusByStudy={postRefusByStudy}
            leads={leads}
            onMarkDepositPaid={onMarkDepositPaid}
            onMarkRibSent={onMarkRibSent}
            onSignStudy={onSignStudy}
            onCancelStudy={onCancelStudy}
            onDeleteStudy={onDeleteStudy}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );
};
