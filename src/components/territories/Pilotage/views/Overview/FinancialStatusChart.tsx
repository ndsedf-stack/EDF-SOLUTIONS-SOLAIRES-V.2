import React from 'react';
import { 
  Area, 
  ComposedChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Bar 
} from 'recharts';
import { HeroChartContainer } from '../../components/shared/HeroChartContainer';

interface ChartDataPoint {
  dateStr: string;
  secured: number;
  waiting: number;
  cancellable: number;
  signatures: number;
}

interface FinancialStatusChartProps {
  data: ChartDataPoint[];
  totalSecured: number;
  totalWaiting: number;
  totalCancellable: number;
  newSignaturesCount: number;
}

const formatCurrencyK = (value: number) => {
  return `${(value / 1000).toFixed(0)}k€`;
};

const formatCurrencyFull = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR', 
    maximumFractionDigits: 0 
  }).format(value);
};

export const FinancialStatusChart: React.FC<FinancialStatusChartProps> = ({ 
  data, 
  totalSecured, 
  totalWaiting, 
  totalCancellable, 
  newSignaturesCount 
}) => {
  const total = totalSecured + totalWaiting + totalCancellable;
  const pctSecured = total > 0 ? Math.round((totalSecured / total) * 100) : 0;
  const pctWaiting = total > 0 ? Math.round((totalWaiting / total) * 100) : 0;
  const pctCancellable = total > 0 ? Math.round((totalCancellable / total) * 100) : 0;

  return (
    <HeroChartContainer>
      {/* LEGEND (INSIDE TOP RIGHT) */}
      <div 
        className="absolute top-6 right-8 z-10 bg-[#0F1629]/85 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl min-w-[280px]"
        role="region"
        aria-label="Légende du graphique financier"
      >
        <div className="space-y-3">
          {/* Secured */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full bg-accent-success/80 shadow-[0_0_8px_rgba(0,230,118,0.4)]"
                  aria-hidden="true"
                />
                <span className="text-white/90 font-medium">CA Sécurisé</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold text-white mr-3">
                  {formatCurrencyFull(totalSecured)}
                </span>
                <span className="text-xs text-white/50">{pctSecured}%</span>
              </div>
            </div>
            {/* Progress bar */}
            <div 
              className="w-full h-1 bg-white/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={pctSecured}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`CA Sécurisé: ${pctSecured}%`}
            >
              <div 
                className="h-full bg-accent-success rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${pctSecured}%` }} 
              />
            </div>
          </div>

          {/* Waiting */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full bg-accent-warning/80"
                  aria-hidden="true"
                />
                <span className="text-white/90 font-medium">CA Attente</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold text-white mr-3">
                  {formatCurrencyFull(totalWaiting)}
                </span>
                <span className="text-xs text-white/50">{pctWaiting}%</span>
              </div>
            </div>
            <div 
              className="w-full h-1 bg-white/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={pctWaiting}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`CA en Attente: ${pctWaiting}%`}
            >
              <div 
                className="h-full bg-accent-warning rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${pctWaiting}%` }} 
              />
            </div>
          </div>

          {/* Cancellable */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full bg-accent-danger/80"
                  aria-hidden="true"
                />
                <span className="text-white/90 font-medium">CA Annulable</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold text-white mr-3">
                  {formatCurrencyFull(totalCancellable)}
                </span>
                <span className="text-xs text-white/50">{pctCancellable}%</span>
              </div>
            </div>
            <div 
              className="w-full h-1 bg-white/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={pctCancellable}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`CA Annulable: ${pctCancellable}%`}
            >
              <div 
                className="h-full bg-accent-danger rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${pctCancellable}%` }} 
              />
            </div>
          </div>

          <div className="h-px w-full bg-white/10 my-3" aria-hidden="true" />

          {/* Signatures */}
          <div className="flex items-center gap-3 text-sm">
            <div 
              className="w-1.5 h-4 bg-accent-cyan rounded-sm opacity-60"
              aria-hidden="true"
            />
            <span className="text-white/90 font-medium">Signatures</span>
            <span className="ml-auto font-mono font-bold text-white">
              {newSignaturesCount}
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={data} 
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradSecured" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E676" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gradWaiting" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF9F40" stopOpacity={0.20}/>
              <stop offset="95%" stopColor="#FF9F40" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gradCancellable" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF4757" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#FF4757" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.05)" 
            vertical={true} 
          />
          
          <XAxis 
            dataKey="dateStr" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8B93B0', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            dy={15}
            interval={4}
          />
          
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#8B93B0', fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            tickFormatter={formatCurrencyK}
            dx={-10}
          />

          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#00D9FF', fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            domain={[0, 'auto']}
            dx={10}
            label={{
              value: 'Signatures / jour',
              angle: -90,
              position: 'insideRight',
              fill: '#00D9FF',
              fontSize: 11,
              fontFamily: 'IBM Plex Mono',
              offset: 5
            }}
          />

          <Tooltip 
            cursor={{ stroke: 'rgba(0,217,255,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
            position={{ x: 20, y: undefined }}
            content={({ active, payload, label, coordinate }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div 
                    className="bg-[#1A2332] border border-accent-cyan rounded-xl p-6 shadow-[0_8px_32px_rgba(0,217,255,0.25)] min-w-[300px]"
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: coordinate?.y ? `${coordinate.y - 150}px` : '0',
                      pointerEvents: 'none'
                    }}
                  >
                    <p className="font-display font-bold text-xs text-accent-cyan uppercase tracking-wider mb-4">
                      {label}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">Sécurisé</span>
                        <span className="font-mono font-medium text-white">
                          {formatCurrencyFull(d.secured)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">Attente</span>
                        <span className="font-mono font-medium text-white">
                          {formatCurrencyFull(d.waiting)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">Annulable</span>
                        <span className="font-mono font-medium text-white">
                          {formatCurrencyFull(d.cancellable)}
                        </span>
                      </div>
                    </div>

                    {d.signatures > 0 && (
                      <>
                        <div className="h-px bg-white/15 my-4" />
                        <div className="flex items-center gap-2">
                          <span className="text-lg" role="img" aria-label="graphique">📊</span>
                          <span className="text-white/90 text-sm font-medium">
                            {d.signatures} contrat{d.signatures > 1 ? 's' : ''} signé{d.signatures > 1 ? 's' : ''}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Layer 1: Cancellable (Bottom) */}
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="cancellable" 
            stackId="1" 
            stroke="#FF4757" 
            strokeWidth={2}
            fill="url(#gradCancellable)" 
            animationDuration={1200}
          />

          {/* Layer 2: Waiting (Middle) */}
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="waiting" 
            stackId="1" 
            stroke="#FF9F40" 
            strokeWidth={2}
            fill="url(#gradWaiting)" 
            animationDuration={1350}
          />

          {/* Layer 3: Secured (Top) */}
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="secured" 
            stackId="1" 
            stroke="#00E676" 
            strokeWidth={3}
            fill="url(#gradSecured)"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,230,118,0.3))' }}
            animationDuration={1500}
          />

          {/* Layer 4: Signatures (Bars Overlay) */}
          <Bar 
            yAxisId="right"
            dataKey="signatures" 
            fill="#00D9FF" 
            barSize={8}
            radius={[4, 4, 0, 0]}
            opacity={0.6}
            animationDuration={1600}
          />

        </ComposedChart>
      </ResponsiveContainer>
    </HeroChartContainer>
  );
};