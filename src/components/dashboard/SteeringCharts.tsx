import React, { useMemo } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from "recharts";
import { Study, EmailLead } from "../../brain/types";
import { InteractiveRevenueChart } from "./InteractiveRevenueChart";
import { LucideBarChart3, LucideZap, LucideTimer, LucideTarget, LucideUserMinus, LucideChevronRight } from "lucide-react";

interface SteeringChartsProps {
  studies: Study[];
  emailLeads: EmailLead[];
  activeTab?: string | null;
}

// --- EXECUTIVE TOOLTIP ---
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/95 border border-white/10 p-4 rounded-xl shadow-2xl min-w-[160px] backdrop-blur-xl">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-white font-mono tabular-nums">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const SteeringCharts: React.FC<SteeringChartsProps> = ({ studies, emailLeads }) => {
  
  // ========================================
  // 1️⃣ FUNNEL EXÉCUTIF CUSTOM (VERTICAL)
  // ========================================
  const funnelMetrics = useMemo(() => {
    const totalLeads = emailLeads.length;
    const totalProspects = studies.filter(s => s.status === 'sent' || s.status === 'signed').length;
    const totalSigned = studies.filter(s => s.status === 'signed').length;
    const totalSecured = studies.filter(s => s.status === 'signed' && (s.contract_secured || s.deposit_paid)).length;
    const totalOptOut = emailLeads.filter(l => l.opted_out).length;

    const conversionRate = totalLeads > 0 ? (totalSigned / totalLeads) * 100 : 0;
    const churnRate = totalLeads > 0 ? (totalOptOut / totalLeads) * 100 : 0;

    return {
      steps: [
        { name: "Leads Actifs", value: totalLeads, icon: <LucideTarget className="w-3 h-3"/>, color: "text-slate-400", bg: "bg-slate-400/5", border: "border-slate-400/20" },
        { name: "Prospects Intéressés", value: totalProspects, icon: <LucideZap className="w-3 h-3"/>, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20" },
        { name: "Contrats Signés", value: totalSigned, icon: <LucideFileCheck className="w-3 h-3"/>, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
        { name: "Cash Sécurisé", value: totalSecured, icon: <LucideWallet className="w-3 h-3"/>, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/20" },
      ] as any[],
      conversionRate,
      churnRate,
      totalOptOut
    };
  }, [studies, emailLeads]);

  // ========================================
  // 2️⃣ DRIFT COMPORTEMENTAL (AREA REDESIGN)
  // ========================================
  const behaviorData = useMemo(() => {
    const bins: Record<string, any> = {};
    const labels = ["J+0", "J+3", "J+7", "J+14", "J+21"];
    labels.forEach(l => bins[l] = { name: l, muet: 0, agite: 0, interesse: 0 });

    studies.forEach(s => {
      const d = s.daysSinceSigned || s.diffDays || 0;
      let label = "J+21";
      if (d <= 1) label = "J+0";
      else if (d <= 3) label = "J+3";
      else if (d <= 7) label = "J+7";
      else if (d <= 14) label = "J+14";

      const b = (s as any).behavioralState?.toLowerCase() || 'stable';
      if (b === 'muet') bins[label].muet++;
      if (b === 'agité' || b === 'agite') bins[label].agite++;
      if (b === 'intéressé' || b === 'interesse') bins[label].interesse++;
    });
    return Object.values(bins);
  }, [studies]);

  return (
    <div className="space-y-8 mb-20">
      
      {/* 🌟 PILOTE DE CHIFFRE D'AFFAIRES (CUMULÉ) */}
      <InteractiveRevenueChart studies={studies} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* 🟧 FUNNEL "CLASS EDITION" (CUSTOM VERTICAL) */}
        <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl">
           <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <LucideBarChart3 className="w-4 h-4 text-blue-400" />
                 </div>
                 <div>
                    <h4 className="text-white font-black text-sm tracking-tight uppercase italic">Analyse du Pipeline</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Flux de conversion vertical</p>
                 </div>
              </div>
              
              <div className="flex gap-4">
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Désabonnement</span>
                    <div className="flex items-center gap-2 text-red-500/80">
                        <LucideUserMinus className="w-3 h-3" />
                        <span className="text-base font-black tabular-nums tracking-tighter">{funnelMetrics.totalOptOut} <span className="text-[9px] opacity-60">({funnelMetrics.churnRate.toFixed(1)}%)</span></span>
                    </div>
                 </div>
                 <div className="flex flex-col items-end border-l border-white/5 pl-4">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Conversion Global</span>
                    <span className="text-base font-black text-emerald-500 tabular-nums tracking-tighter">{funnelMetrics.conversionRate.toFixed(1)}%</span>
                 </div>
              </div>
           </div>
           
           <div className="space-y-4">
             {funnelMetrics.steps.map((step, idx) => (
               <div key={idx} className="relative">
                 <div className={`flex items-center justify-between p-4 ${step.bg} border ${step.border} rounded-xl group hover:scale-[1.01] transition-all`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-black/40 border border-white/5 ${step.color}`}>
                            {step.icon}
                        </div>
                        <span className="text-[11px] font-black text-white/90 uppercase tracking-widest group-hover:text-white transition-colors">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{step.value}</span>
                        <LucideChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
                    </div>
                 </div>
                 {idx < funnelMetrics.steps.length - 1 && (
                    <div className="flex justify-center -my-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        <div className="w-px h-6 bg-gradient-to-b from-slate-500 to-transparent" />
                    </div>
                 )}
               </div>
             ))}
           </div>
        </div>

        {/* 🟥 DRIFT COMPORTEMENTAL (AREA LUXE) */}
        <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 shadow-xl relative group overflow-hidden">
            <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
               <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <LucideZap className="w-4 h-4 text-emerald-400" />
               </div>
               <div>
                  <h4 className="text-white font-black text-sm tracking-tight uppercase italic">Drift Client (21j)</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Analyse du momentum et du décrochage</p>
               </div>
            </div>

            <div className="h-[280px] w-full mt-2">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={behaviorData}>
                    <defs>
                        <linearGradient id="colorMuet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e293b" stopOpacity={0.6}/><stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAgite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInteresse" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="#ffffff03" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: '0.05em'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.05)', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="muet" stackId="1" stroke="#1e293b" fill="url(#colorMuet)" name="GHOSTED" />
                    <Area type="monotone" dataKey="agite" stackId="1" stroke="#3b82f6" fill="url(#colorAgite)" name="AGITÉ" />
                    <Area type="monotone" dataKey="interesse" stackId="1" stroke="#10b981" fill="url(#colorInteresse)" name="CLOSING" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center items-center gap-8 opacity-40">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-700" /><span className="text-[9px] font-black tracking-widest uppercase">Muet</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /><span className="text-[9px] font-black tracking-widest uppercase">Actif</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /><span className="text-[9px] font-black tracking-widest uppercase">Closing</span></div>
            </div>
        </div>
      </div>

      {/* 🟪 EXECUTIVE TIMING (POLISHED) */}
      <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-10 justify-center opacity-40">
             <div className="h-px w-10 bg-slate-800" />
             <LucideTimer className="w-4 h-4" />
             <h4 className="text-white font-black text-xs tracking-widest uppercase italic border-x border-white/10 px-6">Benchmark de Momentum</h4>
             <div className="h-px w-10 bg-slate-800" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: "Moyenne Signature", value: "4.2", unit: "JOURS", target: "TARGET < 4J", color: "text-blue-500" },
              { label: "Moyenne Acompte", value: "1.8", unit: "JOURS", target: "TARGET < 2J", color: "text-emerald-500" },
              { label: "Seuil de Silence", value: "3.0", unit: "JOURS", target: "CRITICAL", color: "text-orange-500" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center group/card">
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 group-hover/card:text-slate-400 transition-colors uppercase tracking-[0.2em]">{item.label}</span>
                 <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-black text-white tabular-nums tracking-tighter group-hover/card:scale-105 transition-transform duration-500">{item.value}</span>
                    <span className="text-xs font-black text-slate-500 tracking-widest">{item.unit}</span>
                 </div>
                 <div className={`px-4 py-1 rounded-full bg-white/[0.02] border border-white/5 text-[9px] font-black tracking-widest ${item.color} shadow-lg shadow-black/20`}>
                    {item.target}
                 </div>
              </div>
            ))}
          </div>
      </div>

    </div>
  );
};

const LucideWallet = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);

const LucideFileCheck = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
);
