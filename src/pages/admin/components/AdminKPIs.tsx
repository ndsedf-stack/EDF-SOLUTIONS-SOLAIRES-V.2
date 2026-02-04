import React from 'react';

const KPICard = ({ title, value, subtitle, trend, trendValue, icon, color }: any) => (
    <div className={`p-6 bg-[#0a0a0a] border border-white/5 rounded-xl relative overflow-hidden group`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${color}`}></div>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</h3>
                <div className="text-3xl font-black text-white">{value}</div>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl`}>
                {icon}
            </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
            <span className={`${trend === 'up' ? 'text-green-500' : 'text-red-500'} font-bold flex items-center`}>
                {trend === 'up' ? '↗' : '↘'} {trendValue}
            </span>
            <span className="text-slate-600 font-medium">{subtitle}</span>
        </div>
    </div>
);

const AlertRow = ({ severity, message, time, source }: any) => (
    <div className={`flex items-center justify-between p-3 border-l-2 ${
        severity === 'critical' ? 'border-red-500 bg-red-500/5' : 
        severity === 'warning' ? 'border-orange-500 bg-orange-500/5' : 
        'border-blue-500 bg-blue-500/5'
    } mb-2`}>
        <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase ${
                severity === 'critical' ? 'text-red-500' : 
                severity === 'warning' ? 'text-orange-500' : 
                'text-blue-500'
            }`}>{severity}</span>
            <span className="text-sm text-slate-300">{message}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span>{source}</span>
            <span>{time}</span>
        </div>
    </div>
);

export const AdminKPIs = () => {
    return (
        <div className="space-y-8">
            {/* TOP ROW: VITAL SIGNS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard 
                    title="Danger Score Moyen" 
                    value="64/100" 
                    subtitle="vs 58 hier" 
                    trend="up" 
                    trendValue="+10%" 
                    icon="🔥" 
                    color="bg-orange-500" 
                />
                <KPICard 
                    title="CA à Risque (Actif)" 
                    value="420k€" 
                    subtitle="24 opportunités" 
                    trend="up" 
                    trendValue="+12%" 
                    icon="📉" 
                    color="bg-red-500" 
                />
                <KPICard 
                    title="Opportunités Death Zone" 
                    value="8" 
                    subtitle="Aucune action > 5j" 
                    trend="up" 
                    trendValue="+2" 
                    icon="☠️" 
                    color="bg-slate-500" 
                />
                 <KPICard 
                    title="Taux d'Inaction" 
                    value="12%" 
                    subtitle="Recommandations ignorées" 
                    trend="down" 
                    trendValue="-2%" 
                    icon="💤" 
                    color="bg-blue-500" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
                {/* LEFT: REAL TIME ALERTS */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Alertes Système Temps Réel
                        </h3>
                        <button className="text-xs text-slate-500 hover:text-white uppercase font-bold">Voir tout</button>
                    </div>

                    <div className="flex-1 overflow-auto pr-2 space-y-1">
                        <AlertRow severity="critical" message="Agent Zero : Incohérence détectée sur Dossier #22910 (Refus vs Intérêt)" source="AGENT-ZERO" time="10:42:01" />
                        <AlertRow severity="warning" message="Fatigue Guard : Client DURAND activé (4 relances en 24h)" source="OPS-GUARD" time="10:38:15" />
                        <AlertRow severity="info" message="Sync Salesforce : Latence élevée (450ms)" source="CRM-CONNECTOR" time="10:35:00" />
                        <AlertRow severity="warning" message="Règle d'Inaction : 3 Commerciaux n'ont pas ouvert le Cockpit ce matin" source="SUPERVISOR" time="09:00:00" />
                        <AlertRow severity="critical" message="Ops Audit : Tentative d'accès hors plage horaire (User: M.Martin)" source="SECURITY" time="03:15:22" />
                        <AlertRow severity="info" message="Backup : Sauvegarde nocturne effectuée avec succès" source="SYSTEM" time="03:00:00" />
                    </div>
                </div>

                {/* RIGHT: AGENT HEALTH */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                     <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Santé des Agents</h3>
                     
                     <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-blue-400">AGENT ZERO (Cerveau)</span>
                                <span className="text-green-500">OPTIMAL</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">Latence 120ms • 99.9% Confidence</div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-green-400">OPS AGENT (Gardien)</span>
                                <span className="text-green-500">ACTIF</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">0 Failles • 142 Blocages/jour</div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-orange-400">EMAIL ENGINE</span>
                                <span className="text-orange-500">BUSY</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5">
                                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">Queue: 42 emails • Deliverability 99%</div>
                        </div>
                     </div>

                     <div className="mt-8 pt-8 border-t border-white/10">
                        <div className="text-center">
                            <div className="text-4xl font-black text-white mb-1">99.8%</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uptime Système (30j)</div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};
