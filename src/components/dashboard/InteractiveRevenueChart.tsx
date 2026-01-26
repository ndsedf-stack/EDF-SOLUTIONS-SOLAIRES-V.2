import React, { useMemo, useState } from "react";
import { 
  Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ComposedChart, Line
} from "recharts";
import { Study } from "../../brain/types";
import { LucideChevronDown, LucideTrendingUp, LucideWallet, LucideFileCheck } from "lucide-react";

interface InteractiveRevenueChartProps {
  studies: Study[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

export const InteractiveRevenueChart: React.FC<InteractiveRevenueChartProps> = ({ studies }) => {
  const [timeRange, setTimeRange] = useState("90d");

  // ========================================
  // DATA TRANSFORMATION (EXECUTIVE FIDELITY)
  // ========================================
  const chartData = useMemo(() => {
    const days = timeRange === "90d" ? 90 : 30;
    const data = [];
    const now = new Date();
    
    let cumulativeRevenue = 0;
    let cumulativeProjection = 0;

    // Build timeline from past to now
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStudies = studies.filter(s => s.created_at?.startsWith(dateStr));
      
      const revenueToday = dayStudies.filter(s => s.status === 'signed')
                      .reduce((acc, s) => acc + (s.total_price || 0), 0);
      const projectionToday = dayStudies.filter(s => s.status !== 'signed')
                      .reduce((acc, s) => acc + (s.total_price || 0), 0);
      
      const salesCountToday = dayStudies.filter(s => s.status === 'signed').length;

      cumulativeRevenue += revenueToday;
      cumulativeProjection += projectionToday;

      data.push({
        date: dateStr,
        revenue: cumulativeRevenue,
        projection: cumulativeProjection,
        sales: salesCountToday
      });
    }
    return data;
  }, [studies, timeRange]);

  const totalRevenue = studies.filter(s => s.status === 'signed').reduce((acc, s) => acc + (s.total_price || 0), 0);
  const totalSales = studies.filter(s => s.status === 'signed').length;

  return (
    <div className="w-full bg-[#020617] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      
      {/* 🟦 LUXURY HEADER */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/5">
        <div className="flex items-center gap-5">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
             <LucideTrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Pilote de Chiffre d'Affaires</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1.5 opacity-60">Analyse de croissance cumulative et volume de ventes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
            {/* VENTES STAT (COMPACT) */}
            <div className="hidden lg:flex items-center gap-3 pr-6 border-r border-white/5">
                <LucideFileCheck className="w-4 h-4 text-emerald-500 opacity-40" />
                <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Ventes Total</span>
                    <span className="text-sm font-black text-white tabular-nums">{totalSales} <span className="text-[10px] text-slate-600 italic">u.</span></span>
                </div>
            </div>

            {/* SELECTOR */}
            <div className="relative group">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-slate-950 border border-white/10 text-white text-[10px] font-black px-8 py-2.5 rounded-xl cursor-pointer hover:border-blue-500/40 transition-all outline-none pr-12 tracking-[0.2em] uppercase shadow-lg"
              >
                <option value="90d">90 JOURS</option>
                <option value="30d">30 JOURS</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-hover:text-blue-400">
                <LucideChevronDown className="w-4 h-4" />
              </div>
            </div>
        </div>
      </div>

      {/* 🟩 CHART AREA (EXECUTIVE COMPOSED) */}
      <div className="p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="execRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="execProjection" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="#ffffff03" />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={15} 
                minTickGap={40}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" }).toUpperCase();
                }}
                tick={{ fill: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: '0.05em' }}
              />
              <YAxis 
                yAxisId="revenue"
                tickLine={false} 
                axisLine={false} 
                tickMargin={15}
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                tickFormatter={(value) => `${value/1000}k`}
              />
              <YAxis 
                yAxisId="sales"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 'black', opacity: 0.4 }}
                domain={[0, 'dataMax + 2']}
              />
              <Tooltip 
                cursor={{ stroke: 'rgba(59, 130, 246, 0.1)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                     const date = new Date(label).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });
                     return (
                        <div className="bg-[#0f172a]/95 border border-white/10 p-5 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2 text-center italic">{date}</p>
                           <div className="space-y-4 min-w-[200px]">
                              {payload.map((p: any) => (
                                 <div key={p.dataKey} className="flex items-center justify-between gap-12">
                                    <div className="flex items-center gap-3">
                                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                                       <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest whitespace-nowrap">
                                            {p.name === 'revenue' ? 'Revenu Cumulé' : p.name === 'projection' ? 'Projection Pipeline' : 'Ventes du Jour'}
                                       </span>
                                    </div>
                                    <span className="text-sm font-black text-white font-mono tabular-nums">
                                        {p.name === 'sales' ? `${p.value} u.` : formatCurrency(p.value)}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )
                  }
                  return null;
                }}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="projection"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#execProjection)"
                animationDuration={1500}
                name="projection"
                strokeDasharray="10 5"
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={4}
                fill="url(#execRevenue)"
                animationDuration={2000}
                name="revenue"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
              />
              <Bar 
                yAxisId="sales"
                dataKey="sales" 
                fill="#3b82f6" 
                opacity={0.35} 
                radius={[4, 4, 0, 0]} 
                barSize={12}
                name="sales"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 🟧 LUXURY FOOTER */}
      <div className="px-8 py-5 bg-slate-900/20 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Business Intel Engine v12.0</span>
         </div>
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 border-r border-white/5 pr-6">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">Global CA :</span>
                <span className="text-xl font-black text-white tabular-nums tracking-tighter leading-none">{formatCurrency(totalRevenue)}</span>
            </div>
            <LucideWallet className="w-5 h-5 text-slate-600 opacity-20" />
         </div>
      </div>
    </div>
  );
};
