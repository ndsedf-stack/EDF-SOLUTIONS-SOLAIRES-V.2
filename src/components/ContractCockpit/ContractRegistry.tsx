import React, { useState, useMemo } from 'react';
import { SecuredContract } from './contractEngine';

interface Props {
  contracts: SecuredContract[];
}

export function ContractRegistry({ contracts }: Props) {
  const [filter, setFilter] = useState<'all' | 'high_risk' | 'high_amount' | 'silent'>('all');
  const [sortBy, setSortBy] = useState<'danger' | 'amount' | 'age'>('danger');

  // Apply filters
  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    switch (filter) {
      case 'high_risk':
        result = result.filter(c => c.status_layer === 'danger' || c.cancellation_risk_score > 0.6);
        break;
      case 'high_amount':
        result = result.filter(c => c.amount > 30000);
        break;
      case 'silent':
        result = result.filter(c => {
          if (!c.last_client_activity) return true;
          const daysSinceActivity = Math.floor(
            (Date.now() - new Date(c.last_client_activity).getTime()) / 86400000
          );
          return daysSinceActivity > 7;
        });
        break;
      default:
        break;
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'danger':
          return b.cancellation_risk_score - a.cancellation_risk_score;
        case 'amount':
          return b.amount - a.amount;
        case 'age':
          return b.days_since_signature - a.days_since_signature;
        default:
          return 0;
      }
    });

    return result;
  }, [contracts, filter, sortBy]);

  // Top 5 contracts to monitor
  const top5Critical = useMemo(() => {
    return [...contracts]
      .sort((a, b) => {
        const scoreA = a.cancellation_risk_score * a.financial_weight;
        const scoreB = b.cancellation_risk_score * b.financial_weight;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [contracts]);

  const getStatusColor = (status: 'locked' | 'exposed' | 'danger') => {
    switch (status) {
      case 'locked': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      case 'exposed': return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      case 'danger': return 'bg-red-500/20 border-red-500/30 text-red-400';
    }
  };

  const getStatusLabel = (status: 'locked' | 'exposed' | 'danger') => {
    switch (status) {
      case 'locked': return '🔒 Verrouillé';
      case 'exposed': return '🟡 Exposé';
      case 'danger': return '🔴 Critique';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full" />
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            🎯 REGISTRE INTELLIGENT
          </h2>
          <div className="text-xs text-white/40 font-mono uppercase tracking-wider">
            Radar opérationnel des contrats
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 uppercase tracking-wider">Filtres:</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tous' },
              { value: 'high_risk', label: 'Risque élevé' },
              { value: 'high_amount', label: 'Gros montants' },
              { value: 'silent', label: 'Silence client' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 uppercase tracking-wider">Tri:</span>
          <div className="flex gap-2">
            {[
              { value: 'danger', label: 'Danger' },
              { value: 'amount', label: 'Montant' },
              { value: 'age', label: 'Âge' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSortBy(value as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sortBy === value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="ml-auto text-sm text-white/60">
          <span className="font-bold text-white">{filteredContracts.length}</span> contrats
        </div>
      </div>

      {/* Top 5 Alert */}
      {filter === 'all' && (
        <div className="rounded-2xl bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 p-4">
          <div className="text-xs uppercase tracking-wider text-red-400 mb-2 font-bold">
            ⚠️ Top 5 à surveiller
          </div>
          <div className="flex flex-wrap gap-2">
            {top5Critical.map(c => (
              <div
                key={c.id}
                className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs font-bold text-white"
              >
                {c.client_name} <span className="text-red-400">({Math.round(c.cancellation_risk_score * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Cards List - Horizontal Design */}
      <div className="flex flex-col gap-4">
        {filteredContracts.map(contract => {
           // Helper calculations
           const isLocked = contract.status_layer === 'locked';
           const isCrisis = contract.cancellation_risk_score > 0.6;
           
           const riskColor = isCrisis ? '#ef4444' : isLocked ? '#10b981' : '#f59e0b';
           const riskBg = isCrisis ? 'bg-red-500/10' : isLocked ? 'bg-emerald-500/10' : 'bg-amber-500/10';
           const riskBorder = isCrisis ? 'border-red-500/20' : isLocked ? 'border-emerald-500/20' : 'border-amber-500/20';
           const riskText = isCrisis ? 'text-red-400' : isLocked ? 'text-emerald-400' : 'text-amber-400';
           
           const dateStr = new Date(contract.signed_at).toLocaleDateString('fr-FR');
           const silenceDays = contract.last_client_activity 
             ? Math.floor((Date.now() - new Date(contract.last_client_activity).getTime()) / 86400000)
             : (contract.days_since_signature > 0 ? Math.floor(contract.days_since_signature/2) : 0);
             
           // REAL DATA MAPPINGS
           const currentStep = contract.current_step || Math.min(5, Math.floor(contract.interaction_score / 20) + 1);
           const stepLabel = currentStep >= 5 ? 'Terminée' : `Étape ${currentStep}`;
           const paymentLabel = contract.payment_method || (contract.deposit_received ? 'Financé' : 'Comptant');
           
           const lastOpened = silenceDays === 0 ? 'Aujourd\'hui' : `Il y a ${silenceDays}j`;

           return (
            <div key={contract.id} className="w-full relative overflow-hidden rounded-2xl border border-white/5 bg-[#14141e]/90 backdrop-blur-xl p-0 hover:border-white/10 transition-all group">
                <div className="flex flex-col md:flex-row min-h-[160px]">
                    
                    {/* 1. LEFT: Client Info */}
                    <div className="p-6 md:w-[320px] border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500/50 opacity-50" />
                        
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">
                                    {contract.client_name}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Signé
                                </span>
                                 <span className="text-emerald-500 text-xs">🛡️</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-6">
                                <span>📧</span> {contract.client_email || 'Non renseigné'}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                 {/* Tags */}
                                 {contract.payment_method === 'CASH + ACOMPTE' && (
                                     <span className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase">
                                         CASH + ACOMPTE
                                     </span>
                                 )}
                                 {silenceDays > 7 && (
                                     <span className="px-2 py-1 rounded bg-red-900/20 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase">
                                         SILENCE
                                     </span>
                                 )}
                                 <span className={`px-2 py-1 rounded ${riskBg} border ${riskBorder} text-[10px] font-bold ${riskText} uppercase flex items-center gap-1`}>
                                     🛡️ {isLocked ? 'Verrouillé' : isCrisis ? 'Critique' : 'Sécurisé'}
                                 </span>
                                 <span className="px-2 py-1 rounded bg-slate-800 border border-white/10 text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                                     📅 J+{contract.days_since_signature}
                                 </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. MIDDLE: Engagement Flow */}
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/5 bg-slate-900/20">
                        <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2">
                                 <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">⚡ Engagement Flow</span>
                             </div>
                             <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase">
                                 {silenceDays === 0 ? 'Actif' : `${contract.interaction_score} pts`}
                             </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex gap-1 h-1.5 w-full mb-2">
                            {[1, 2, 3, 4, 5].map(step => (
                                <div 
                                    key={step} 
                                    className={`flex-1 rounded-full ${step <= currentStep ? 'bg-blue-500' : 'bg-slate-700/30'}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-6">
                            <span>Séquence Auto</span>
                            <span>{stepLabel}</span>
                        </div>

                        {/* Anti-Annulation Box */}
                        <div className="relative rounded-lg border border-emerald-500/20 bg-emerald-900/5 p-4 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="relative z-10 font-mono">
                                <h4 className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wide mb-4 font-sans">
                                    🛡️ {contract.payment_method?.includes('CASH') ? 'ANTI-ANNULATION CASH' : 'Anti-Annulation Financement'}
                                </h4>
                                
                                <div className="flex flex-col gap-3">
                                    {/* Dernier */}
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="text-white font-bold">Dernier :</div>
                                        <div className="text-emerald-300">
                                            {contract.payment_method?.includes('CASH') ? `j${Math.max(1, currentStep)} cash` : `Email j${Math.max(1, currentStep)}`} <span className="text-slate-500 opacity-60">({dateStr})</span>
                                        </div>
                                    </div>
                                    
                                    {/* Ouvertures */}
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="text-white font-bold">Ouvertures :</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-slate-300">
                                                {contract.last_client_activity ? `Lu le: ${new Date(contract.last_client_activity).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à ${new Date(contract.last_client_activity).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : lastOpened}
                                            </div>
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold">
                                                {Math.max(1, Math.floor(contract.interaction_score / 10))}x
                                            </span>
                                        </div>
                                    </div>

                                    {/* Prochain (Conditional for Cash) */}
                                    {contract.payment_method?.includes('CASH') && (
                                        <>
                                            <div className="h-px bg-white/5 my-1" />
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="text-white font-bold">Prochain :</div>
                                                <div className="text-white font-bold">
                                                    j{Math.max(1, currentStep) + 1} cash <span className="text-slate-500 mx-1">→</span> <span className="text-white">01/02</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. RIGHT: Financials & Actions */}
                    <div className="md:w-[300px] p-6 flex flex-col justify-center gap-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valeur Dossier</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white font-bold uppercase border border-white/5">
                                        {contract.deposit_received ? 'COMPTANT' : paymentLabel}
                                    </span>
                                </div>
                                <div className="text-2xl font-black text-white tracking-tighter">
                                    {contract.amount.toLocaleString()} €
                                </div>
                             </div>
                             
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="3" fill="none" />
                                    <circle 
                                        cx="24" cy="24" r="20" 
                                        stroke={riskColor} 
                                        strokeWidth="3" 
                                        fill="none" 
                                        strokeDasharray="125"
                                        strokeDashoffset={125 - (125 * (Math.round((1 - contract.cancellation_risk_score) * 100)) / 100)}
                                    />
                                </svg>
                                <div className={`absolute text-[10px] font-bold ${riskText}`}>
                                    {Math.round((1 - contract.cancellation_risk_score) * 100)}%
                                </div>
                            </div>
                        </div>

                        {/* Apport & Status Badges */}
                        {contract.deposit_received && (
                            <div className="space-y-2">
                                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-amber-500 uppercase">💳 Apport:</span>
                                    <span className="text-xs font-mono font-bold text-amber-400">{contract.deposit_amount?.toLocaleString()} €</span>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase">✅ Acompte Payé</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. ACTIONS SIDEBAR */}
                    <div className="w-16 border-l border-white/5 bg-black/20 flex flex-col items-center justify-center gap-3 p-2">
                        <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-white/20 transition-all">
                            ⚡
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-white/20 transition-all">
                            📞
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                            ✖️
                        </button>
                    </div>
                </div>
            </div>
           );
        })}
      </div>
      
      {filteredContracts.length === 0 && (
        <div className="text-center py-12 text-white/40">
          Aucun contrat ne correspond aux filtres sélectionnés.
        </div>
      )}
    </div>
  );
}
