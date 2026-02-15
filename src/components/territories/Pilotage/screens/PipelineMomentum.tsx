import React from "react";

interface Study {
  id: string;
  name: string;
  email: string;
  status: string;
  payment_mode?: string;
  financing_mode?: string;
  deposit_paid?: boolean;
}

interface PipelineMomentumProps {
  leads: number;
  visited: number;
  signed: number;
  waitingSignatureStudies: Study[];
  waitingDepositStudies: Study[];
  secured: number;
  securedAmount?: number;
}

export const PipelineMomentum: React.FC<PipelineMomentumProps> = ({
  leads,
  visited,
  signed,
  waitingSignatureStudies = [],
  waitingDepositStudies = [],
  secured,
  securedAmount = 0
}) => {
  const safeLeads = Math.max(leads, 1);
  const safeVisited = Math.max(visited, 1);

  // --- LOGIQUE MÉTIER ---
  const conversionVente = visited ? Math.round((signed / visited) * 100) : 0;
  const tauxPenetration = leads ? Math.round((visited / leads) * 100) : 0;
  const globalPerformance = leads ? Math.round((signed / leads) * 100) : 0;

  // Volumes Différentiels pour la barre
  const nonContactes = Math.max(0, leads - visited);
  const enAttenteSignature = waitingSignatureStudies.length;
  const enAttenteAcompte = waitingDepositStudies.length;
  const succesEncaisses = secured;

  const hasData = leads > 0;

  // Goulot d'étranglement
  const convQualif = leads ? (visited / leads) * 100 : 0;
  const convVente = visited ? (signed / visited) * 100 : 0;
  const convTreso = signed ? (secured / signed) * 100 : 0;
  
  const bottleneck = Math.min(convQualif, convVente, convTreso) === convQualif ? "Qualification" : 
                    Math.min(convQualif, convVente, convTreso) === convVente ? "Transformation" : "Administratif";

  return (
    <div className="w-full space-y-12">
      {/* Header Premium Institutional */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-emerald-500 pl-8 py-2">
        <div className="space-y-1">
          <p className="text-[9px] tracking-[0.4em] text-emerald-400 font-black uppercase">
            S03 — Pipeline Momentum
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Trajectoire Dossiers
          </h1>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
            Données dédoublonnées par email · 1 Email = 1 Dossier
          </p>
        </div>
        <div className="flex gap-12">
           <div className="text-right">
              <div className="text-4xl font-black text-white font-mono tracking-tighter tabular-nums">{leads}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Leads Entrants</div>
           </div>
           <div className="text-right">
              <div className="text-4xl font-black text-emerald-400 font-mono tracking-tighter tabular-nums">
                {securedAmount > 0 ? `${Math.round(securedAmount/1000)}k€` : secured}
              </div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Valeur Encaissée</div>
           </div>
        </div>
      </div>

      {/* VISUALIZATION PRINCIPALE */}
      <div className="relative bg-black/60 rounded-[2.5rem] p-12 border border-white/5 shadow-2xl backdrop-blur-xl overflow-hidden">
        {!hasData ? (
          <div className="h-32 flex items-center justify-center text-white/20 uppercase font-black tracking-widest italic">
            Aucune donnée de pipeline disponible
          </div>
        ) : (
          <>
            {/* Étiquettes de Volume */}
            <div className="relative h-6 mb-2 flex">
               <div style={{ width: `${(succesEncaisses/safeLeads)*100}%` }} className="relative">
                  <span className="absolute right-0 bottom-0 text-[10px] font-black text-emerald-400 uppercase translate-x-1/2">{succesEncaisses}</span>
               </div>
               <div style={{ width: `${(enAttenteAcompte/safeLeads)*100}%` }} className="relative">
                  <span className="absolute right-0 bottom-0 text-[10px] font-black text-white/40 uppercase translate-x-1/2">{signed}</span>
               </div>
               <div style={{ width: `${(enAttenteSignature/safeLeads)*100}%` }} className="relative">
                  <span className="absolute right-0 bottom-0 text-[10px] font-black text-white/30 uppercase translate-x-1/2">{visited}</span>
               </div>
               <div style={{ width: `${(nonContactes/safeLeads)*100}%` }} className="relative">
                  <span className="absolute right-0 bottom-0 text-[10px] font-black text-white/20 uppercase">{leads}</span>
               </div>
            </div>

            {/* Barre de flux */}
            <div className="relative h-20 mb-12 flex gap-1 items-center">
              <div 
                className="h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-l-2xl relative group transition-all duration-700"
                style={{ width: `${Math.max((succesEncaisses/safeLeads)*100, 2)}%` }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-8 left-0 text-[8px] font-black text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">SÉCURISÉ</div>
              </div>

              <div 
                className="h-2/3 bg-white/10 border border-white/10 relative group transition-all duration-700"
                style={{ width: `${(enAttenteAcompte/safeLeads)*100}%` }}
              >
                <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {enAttenteAcompte > 0 && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/20">-{enAttenteAcompte}</div>}
                <div className="absolute -top-8 left-0 text-[8px] font-black text-white/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">ATTENTE ACOMPTE</div>
              </div>

              <div 
                className="h-1/2 bg-white/5 border border-white/5 relative group transition-all duration-700"
                style={{ width: `${(enAttenteSignature/safeLeads)*100}%` }}
              >
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {enAttenteSignature > 0 && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/10">-{enAttenteSignature}</div>}
                <div className="absolute -top-8 left-0 text-[8px] font-black text-white/30 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">VISITÉ · SANS CONTRAT</div>
              </div>

              <div 
                className="h-1/4 bg-white/[0.02] border border-white/[0.02] rounded-r-2xl relative group transition-all duration-700"
                style={{ width: `${(nonContactes/safeLeads)*100}%` }}
              >
                <div className="absolute inset-0 bg-slate-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                {nonContactes > 0 && <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/[0.05]">-{nonContactes}</div>}
                <div className="absolute -top-8 right-0 text-[8px] font-black text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">LEADS BRUTS</div>
              </div>
            </div>

            {/* Cartes de Conversion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <ConversionCard 
                label="Qualité Commerciale" 
                rate={conversionVente} 
                lostLabel="Visites sans contrat"
                loss={enAttenteSignature}
                color="text-emerald-400"
                subLabel="Signés / Total Visites"
              />
              <ConversionCard 
                label="Pénétration Prospect" 
                rate={tauxPenetration} 
                lostLabel="Leads sans Dossier"
                loss={nonContactes}
                color="text-cyan-400"
                subLabel="Dossiers / Total Leads"
              />
              <ConversionCard 
                label="Transformation Leads" 
                rate={tauxPenetration} 
                lostLabel="Leads non transformés"
                loss={nonContactes}
                color="text-white"
                subLabel="RDV Réalisé / Lead Contacté"
              />
            </div>
          </>
        )}
      </div>

      {/* Recapitulatif Stratégique */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem 
          label="Conversion Vente" 
          value={`${conversionVente}%`} 
          color="text-emerald-400" 
          sub="Signés vs Visités"
        />
        <KPIItem 
          label="Taux Pénétration" 
          value={`${tauxPenetration}%`} 
          color="text-sky-400" 
          sub="Visités vs Leads"
        />
        <KPIItem 
          label="Bottleneck" 
          value={bottleneck} 
          color="text-orange-400" 
          sub="Point critique"
          isTextValue={true}
        />
        <KPIItem 
          label="En Attente" 
          value={enAttenteSignature + enAttenteAcompte} 
          color="text-white" 
          sub="Dossiers à débloquer"
          hoverList={[...waitingSignatureStudies, ...waitingDepositStudies]}
        />
      </div>
    </div>
  );
};

// --- COMPOSANTS INTERNES ---

const ConversionCard = ({ label, rate, loss, lostLabel, color, subLabel }: { label: string, rate: number, loss: number, lostLabel: string, color: string, subLabel: string }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-baseline">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[9px] font-bold text-white/40 uppercase">{subLabel}</span>
      </div>
      <span className={`text-3xl font-black font-mono tracking-tighter ${color}`}>{rate}%</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color.replace('text-', 'bg-')} opacity-60 transition-all duration-1000`} style={{ width: `${rate}%` }} />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-mono text-red-500/60 font-bold uppercase tracking-wider tabular-nums">-{loss} {lostLabel}</span>
    </div>
  </div>
);

const KPIItem = ({ label, value, color, sub, isTextValue = false, hoverList }: { label: string, value: string | number, color: string, sub: string, isTextValue?: boolean, hoverList?: Study[] }) => (
  <div className="bg-black/40 rounded-3xl p-6 border border-white/5 hover:border-white/20 transition-all duration-300 shadow-lg group relative">
    <div className="flex flex-col">
      <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">{label}</div>
      <div className="text-[9px] text-white/20 uppercase font-bold tracking-widest mb-4">{sub}</div>
    </div>
    <div className={`${isTextValue ? 'text-xl' : 'text-3xl'} font-black font-mono tracking-tighter ${color} truncate transition-transform duration-300 group-hover:scale-105 origin-left`}>
      {value}
    </div>

    {/* TOOLTIP LIST ON HOVER */}
    {hoverList && hoverList.length > 0 && (
      <div className="absolute bottom-full left-0 mb-4 w-64 bg-[#0a0e27] border border-white/10 rounded-2xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Détail des dossiers</div>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {hoverList.map((s, i) => (
            <div key={i} className="flex justify-between items-center gap-4">
              <span className="text-[10px] font-black text-white truncate uppercase">{s.name || 'Inconnu'}</span>
              <span className="text-[8px] font-bold text-white/20 uppercase px-2 py-0.5 bg-white/5 rounded-full">{s.status === 'signed' ? 'Attente €' : 'Attente Signature'}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);