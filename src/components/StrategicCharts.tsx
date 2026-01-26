import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

// Configuration des couleurs type Shadcn/Enterprise
const chartConfig = {
  performance: { color: "#3b82f6", label: "Dossiers" },
  signatures: { color: "#10b981", label: "Signatures" },
  revenue: { color: "#8b5cf6", label: "CA (€)" },
  engagement: { color: "#f59e0b", label: "Ouvertures" },
};

interface StrategicChartsProps {
  activeTab: string | null;
  data: any[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

export const StrategicCharts: React.FC<StrategicChartsProps> = ({ activeTab, data }) => {
  if (!activeTab) return null;

  return (
    <div className="w-full mt-6 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl">
        
        {/* Header du Graphique */}
        <div className="mb-8">
          <h3 className="text-white font-bold text-xl tracking-tight">
            {activeTab === 'performance' && "Pipeline & Conversion"}
            {activeTab === 'revenue' && "Chiffre d'Affaires"}
            {activeTab === 'engagement' && "Performance Autopilote"}
          </h3>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Analyse des 7 derniers jours</p>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {/* Dégradés style Shadcn Area */}
                <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig[activeTab as keyof typeof chartConfig]?.color || "#3b82f6"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartConfig[activeTab as keyof typeof chartConfig]?.color || "#3b82f6"} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}}
                dy={10}
              />
              
              <YAxis 
                hide={activeTab === 'performance'} 
                tick={{fill: '#64748b', fontSize: 10}}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip 
                cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-panel p-3 border border-white/10 rounded-xl shadow-2xl bg-slate-950/90">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">{payload[0].payload.date}</p>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></div>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">{entry.name}</span>
                            <span className="text-sm font-mono font-bold text-white">
                              {activeTab === 'revenue' ? formatCurrency(entry.value) : entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                content={({ payload }) => (
                  <div className="flex items-center justify-center gap-6">
                    {payload?.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />

              {/* GRAPHIQUE 1 : PERFORMANCE (Dossiers vs Signatures) */}
              {activeTab === 'performance' && (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="dossiers" 
                    name="Dossiers"
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorMain)" 
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="signatures" 
                    name="Signatures"
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSecondary)" 
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </>
              )}

              {/* GRAPHIQUE 2 : REVENUE (Chiffre d'Affaires) */}
              {activeTab === 'revenue' && (
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="CA Total"
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorMain)"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              )}

              {/* GRAPHIQUE 3 : ENGAGEMENT (Ouvertures emails) */}
              {activeTab === 'engagement' && (
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  name="Vues Documents"
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorMain)"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
