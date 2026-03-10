import React from 'react';
import { 
  Area, 
  ComposedChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Line,
  Bar,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { HeroChartContainer } from '../../components/shared/HeroChartContainer';

interface ProjectionChartProps {
  period: '30' | '90';
}

const generateMockProjectionData = (days: number) => {
  const data = [];
  const todayIndex = Math.floor(days / 3);
  let cumulativeRevenue = 145000;

  for (let i = 0; i < days; i++) {
    const isPast = i <= todayIndex;
    const date = new Date();
    date.setDate(date.getDate() + (i - todayIndex));
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

    if (isPast) {
        // Historical Data
        cumulativeRevenue += Math.random() * 5000;
        data.push({
            date: dateStr,
            revenue_real: cumulativeRevenue,
            revenue_projected: null,
            confidence_upper: null,
            confidence_lower: null,
            signatures: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
            isToday: i === todayIndex
        });
    } else {
        // Future Data
        cumulativeRevenue += 4000; // Linear projection
        const uncertainty = (i - todayIndex) * 1000;
        data.push({
            date: dateStr,
            revenue_real: null,
            revenue_projected: cumulativeRevenue,
            confidence_upper: cumulativeRevenue + uncertainty,
            confidence_lower: cumulativeRevenue - uncertainty,
            signatures: 0,
            isToday: false
        });
    }
  }
  return { data, todayIndex };
};

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ period }) => {
  const days = period === '30' ? 30 : 90;
  const { data, todayIndex } = generateMockProjectionData(days);
  const todayLabel = data[todayIndex].date;

  return (
    <HeroChartContainer height={640} className="bg-transparent border-none shadow-none p-0">
       <div className="absolute top-8 left-8 z-10">
          <h3 className="font-display font-bold text-2xl text-white">PROJECTION 90 JOURS</h3>
       </div>

       {/* LEGEND */}
       <div className="absolute top-8 right-8 z-10 bg-[#0F1629]/90 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl min-w-[300px]">
           <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-1 bg-accent-cyan rounded-full" />
                 <span className="text-white/90 text-sm font-medium">CA Cumulé Réel</span>
              </div>
              <span className="font-mono font-bold text-white">305 530€</span>
           </div>
           <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-1 border-t-2 border-dashed border-accent-success" />
                 <span className="text-white/90 text-sm font-medium">Projection Pipeline</span>
              </div>
              <span className="font-mono font-bold text-white">94 470€</span>
           </div>
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-1 border-t-2 border-dashed border-text-tertiary" />
                 <span className="text-white/90 text-sm font-medium">Objectif Mensuel</span>
              </div>
              <span className="font-mono font-bold text-white">400 000€</span>
           </div>
       </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 80, right: 30, left: 20, bottom: 20 }}>
          <defs>
             <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#00D9FF" stopOpacity={0}/>
             </linearGradient>
             <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E676" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
             </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={true} />
          
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#8B93B0', fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            dy={10}
            interval={period === '30' ? 4 : 14}
          />
          
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#8B93B0', fontSize: 13, fontFamily: 'IBM Plex Mono' }}
            tickFormatter={(val) => `${val/1000}k€`}
          />

          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(0,217,255,0.7)', fontSize: 12, fontFamily: 'IBM Plex Mono' }}
          />

          <Tooltip 
             contentStyle={{ backgroundColor: '#1A2332', border: '2px solid #00D9FF', borderRadius: '14px', padding: '20px' }}
             itemStyle={{ color: '#fff', fontFamily: 'IBM Plex Mono' }}
             labelStyle={{ color: '#00D9FF', fontWeight: 'bold', fontFamily: 'Manrope', marginBottom: '10px' }}
             formatter={(value: any, name: string) => {
                 if (name === 'revenue_real') return [new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value), 'CA Cumulé'];
                 if (name === 'revenue_projected') return [new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value), 'Projection'];
                 if (name === 'signatures' && value > 0) return [value, 'Signatures'];
                 return [];
             }}
          />

          {/* OBJECTIVE LINE */}
          <ReferenceLine y={400000} yAxisId="left" stroke="#8B93B0" strokeDasharray="10 5" strokeWidth={2}>
             {/* Label logic tricky in recharts, simplified here */}
          </ReferenceLine>

          {/* TODAY MARKER */}
          <ReferenceLine x={todayLabel} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 3" />
          
           {/* CONFIDENCE BAND (Area range) - Recharts doesn't support 'range' area easily, simulating with stacking or just custom shape. 
               Simplified: Just showing projected line + fill for now to keep it standard. 
           */}
          
           {/* HISTORICAL (Real) */}
           <Area 
             yAxisId="left"
             type="monotone" 
             dataKey="revenue_real" 
             stroke="#00D9FF" 
             strokeWidth={4} 
             fill="url(#gradReal)" 
             style={{ filter: 'drop-shadow(0 0 12px rgba(0,217,255,0.4))' }}
           />

           {/* FUTURE (Projected) */}
           <Line 
             yAxisId="left"
             type="monotone" 
             dataKey="revenue_projected" 
             stroke="#00E676" 
             strokeWidth={3} 
             strokeDasharray="12 6" 
             dot={false}
           />

           {/* SIGNATURES BARS */}
           <Bar 
             yAxisId="right"
             dataKey="signatures" 
             fill="#00D9FF" 
             opacity={0.35} 
             barSize={6} 
             radius={[3,3,0,0]} 
           />

        </ComposedChart>
      </ResponsiveContainer>
    </HeroChartContainer>
  );
};
