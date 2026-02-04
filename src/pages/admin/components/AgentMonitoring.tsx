import React from 'react';

const AgentStatusCard = ({ name, status, role, uptime, latency, requests, logs }: any) => (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex flex-col h-full relative overflow-hidden">
        {status === 'error' && <div className="absolute top-0 right-0 p-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest">Incident</div>}
        
        <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                status === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse'
            }`}>
                {role === 'brain' ? '🧠' : role === 'guard' ? '🛡️' : '✉️'}
            </div>
            <div>
                <h3 className="font-bold text-white text-lg">{name}</h3>
                <div className={`text-[10px] uppercase font-bold tracking-widest ${
                    status === 'active' ? 'text-green-500' :
                    status === 'warning' ? 'text-orange-500' :
                    'text-red-500'
                }`}>
                    {status === 'active' ? '● Opérationnel' : status === 'warning' ? '● Instable' : '● Panne'}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Uptime</div>
                <div className="text-white font-bold">{uptime}</div>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Latence</div>
                <div className="text-white font-bold">{latency}</div>
            </div>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Req/min</div>
                <div className="text-white font-bold">{requests}</div>
            </div>
        </div>

        <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-[10px] text-slate-400 overflow-hidden border border-white/5">
            <div className="mb-2 text-slate-600 uppercase font-bold tracking-widest text-[9px]">Live Logs</div>
            {logs.map((log: string, i: number) => (
                <div key={i} className="truncate mb-1 hover:text-white cursor-default">
                    <span className="text-slate-600 mr-2 opacity-50">{new Date().toLocaleTimeString()}</span>
                    {log}
                </div>
            ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 uppercase">
                Restart
            </button>
             <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 uppercase">
                Config
            </button>
        </div>
    </div>
);

export const AgentMonitoring = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-[600px]">
        <AgentStatusCard 
            name="AGENT ZERO" 
            role="brain" 
            status="active" 
            uptime="99.99%" 
            latency="124ms" 
            requests="420"
            logs={[
                "[INFO] Processing batch #4402",
                "[INFO] Decision: PRIORITY for Lead #9921",
                "[DEBUG] Context updated (340ms)",
                "[INFO] Syncing with Supabase..."
            ]}
        />
        <AgentStatusCard 
            name="OPS GUARD" 
            role="guard" 
            status="active" 
            uptime="100%" 
            latency="12ms" 
            requests="1450"
            logs={[
                "[SEC] Request from IP 192.168.1.42 authorized",
                "[AUDIT] Blocked suspicious update on Lead #110",
                "[INFO] Scanning for anomalies...",
                "[SEC] Token validation OK"
            ]}
        />
        <AgentStatusCard 
            name="EMAIL ENGINE" 
            role="worker" 
            status="warning" 
            uptime="98.5%" 
            latency="850ms" 
            requests="12"
            logs={[
                "[WARN] SMTP Relay latency high (>500ms)",
                "[INFO] Queue size: 45 emails",
                "[INFO] Sending campaign batch #2",
                "[ERROR] Timeout connecting to SMTP Provider 2"
            ]}
        />
    </div>
);
