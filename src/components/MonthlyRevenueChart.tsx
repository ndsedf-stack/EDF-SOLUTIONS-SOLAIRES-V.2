import React, { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface MonthlyRevenueChartProps {
  studies: any[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ studies }) => {
  const { chartData, totalRevenue, signedCount, unsignedCount } = useMemo(() => {
    if (!studies || studies.length === 0) return { chartData: [], totalRevenue: 0, signedCount: 0, unsignedCount: 0 };

    // Obtenir le premier jour du mois en cours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Créer un tableau de tous les jours depuis le 1er du mois
    const daysInMonth: string[] = [];
    const currentDate = new Date(firstDayOfMonth);
    
    while (currentDate <= today) {
      daysInMonth.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Initialiser les données
    const dataMap: Record<string, any> = {};
    daysInMonth.forEach(date => {
      dataMap[date] = {
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        revenue: 0,
        signedClients: 0,
        unsignedClients: 0
      };
    });

    // Remplir avec les études
    studies.forEach(study => {
      const createdDate = new Date(study.created_at);
      const dateKey = createdDate.toISOString().split('T')[0];
      
      if (dataMap[dateKey]) {
        if (study.status === 'signed') {
          dataMap[dateKey].revenue += Number(study.total_price || 0);
          dataMap[dateKey].signedClients += 1;
        } else {
          dataMap[dateKey].unsignedClients += 1;
        }
      }
    });

    // Calculer le CA cumulé et les totaux
    let cumulativeRevenue = 0;
    let totalSigned = 0;
    let totalUnsigned = 0;

    const data = Object.values(dataMap).map((item: any) => {
      cumulativeRevenue += item.revenue;
      totalSigned += item.signedClients;
      totalUnsigned += item.unsignedClients;
      return {
        ...item,
        cumulativeRevenue
      };
    });

    return { 
      chartData: data, 
      totalRevenue: cumulativeRevenue,
      signedCount: totalSigned,
      unsignedCount: totalUnsigned
    };
  }, [studies]);

  const monthName = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-2xl shadow-2xl">
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>
        
        <div className="relative z-10 p-8">
          {/* Header avec stats */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h3 className="text-white font-black text-3xl tracking-tight mb-2 flex items-center gap-3">
                <span className="text-2xl">💰</span>
                Chiffre d'Affaires {monthName}
              </h3>
              <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em]">
                Performance commerciale depuis le 1er du mois
              </p>
            </div>
            
            {/* Stats cards */}
            <div className="flex items-center gap-6">
              <div className="glass-panel px-6 py-4 rounded-2xl border border-white/10">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">CA Total</div>
                <div className="text-3xl font-black text-violet-400">
                  {formatCurrency(totalRevenue)}
                </div>
              </div>
              
              <div className="glass-panel px-6 py-4 rounded-2xl border border-white/10">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Clients</div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">{signedCount}</div>
                    <div className="text-[10px] text-emerald-500/70 font-bold uppercase">Signés</div>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-400">{unsignedCount}</div>
                    <div className="text-[10px] text-blue-500/70 font-bold uppercase">En cours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorSigned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorUnsigned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}}
                  dy={10}
                  interval="preserveStartEnd"
                />
                
                <YAxis 
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#64748b', fontSize: 10}}
                  width={80}
                  tickFormatter={(value) => formatCurrency(value)}
                />

                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#64748b', fontSize: 10}}
                  width={40}
                />

                <Tooltip 
                  cursor={{ stroke: '#ffffff15', strokeWidth: 2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel p-4 border border-white/10 rounded-2xl shadow-2xl bg-slate-950/95 backdrop-blur-xl">
                          <p className="text-xs text-slate-500 font-bold uppercase mb-3">{payload[0].payload.date}</p>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider">CA Cumulé</span>
                              </div>
                              <span className="text-sm font-mono font-black text-violet-400">
                                {formatCurrency(payload[0].payload.cumulativeRevenue)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider">Signés</span>
                              </div>
                              <span className="text-sm font-mono font-black text-emerald-400">
                                {payload[0].payload.signedClients}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-slate-400 uppercase tracking-wider">En cours</span>
                              </div>
                              <span className="text-sm font-mono font-black text-blue-400">
                                {payload[0].payload.unsignedClients}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  content={({ payload }) => (
                    <div className="flex items-center justify-center gap-8">
                      {payload?.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />

                {/* CA Cumulé */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="cumulativeRevenue" 
                  name="CA Cumulé"
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />

                {/* Clients Signés */}
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="signedClients" 
                  name="Clients Signés"
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorSigned)"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />

                {/* Clients Non Signés */}
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="unsignedClients" 
                  name="Clients En Cours"
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorUnsigned)"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
