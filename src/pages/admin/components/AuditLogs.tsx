import React from 'react';

const AuditRow = ({ time, source, action, details, user, risk }: any) => (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-default text-xs">
        <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">{time}</td>
        <td className="py-2.5 px-4">
             <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                source === 'SYSTEM' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                source === 'USER' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                'bg-slate-500/10 text-slate-500 border border-slate-500/20'
            }`}>
               {source}
            </span>
        </td>
        <td className="py-2.5 px-4 font-bold text-slate-300">{action}</td>
        <td className="py-2.5 px-4 text-slate-400 max-w-sm truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-[#050505] group-hover:absolute group-hover:z-10 group-hover:border group-hover:border-white/10 group-hover:p-2 group-hover:rounded-lg group-hover:shadow-xl">
            {details}
        </td>
        <td className="py-2.5 px-4 font-mono text-slate-500">{user}</td>
        <td className="py-2.5 px-4 text-right">
             <span className={`inline-block w-2 h-2 rounded-full ${
                risk === 'high' ? 'bg-red-500' :
                risk === 'medium' ? 'bg-orange-500' :
                'bg-green-500/20'
            }`}></span>
        </td>
    </tr>
);

export const AuditLogs = () => {
    return (
        <div className="space-y-6">
            {/* FILTERS */}
            <div className="flex gap-4 p-4 bg-[#0a0a0a] border border-white/5 rounded-xl">
                <input type="text" placeholder="Rechercher (ID, User, Action)..." className="bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-sm text-white w-96 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50" />
                <select className="bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none">
                    <option>Tous les agents</option>
                    <option>Agent Zero</option>
                    <option>Ops Guard</option>
                </select>
                 <select className="bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-sm text-slate-400 focus:outline-none">
                    <option>Tous les niveaux de risque</option>
                    <option>Critique</option>
                    <option>Warning</option>
                </select>
                <div className="flex-1"></div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span>⬇</span> Export CSV
                </button>
            </div>

            {/* LOGS TABLE (Forensic View) */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden font-mono">
                <table className="w-full text-left">
                    <thead className="bg-[#020202] text-[9px] uppercase font-bold text-slate-600 tracking-widest border-b border-white/5">
                        <tr>
                            <th className="py-2 px-4 w-32">Timestamp</th>
                            <th className="py-2 px-4 w-24">Source</th>
                            <th className="py-2 px-4 w-48">Action</th>
                            <th className="py-2 px-4">Détails de la décision</th>
                            <th className="py-2 px-4 w-32">User / Agent</th>
                            <th className="py-2 px-4 w-16 text-right">Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                         <AuditRow time="14 Feb 10:42:01" source="SYSTEM" action="DECISION BLOCKED" details="Blocked by Conflict Guard: Incohérence entre score fin.(88) et score comp.(12)" user="OPS-GUARD" risk="high" />
                         <AuditRow time="14 Feb 10:41:22" source="USER" action="OVERRIDE" details="User forced validation despite warning on Client #3302" user="N.Distefano" risk="medium" />
                         <AuditRow time="14 Feb 10:40:05" source="SYSTEM" action="SCORE UPDATE" details="Danger Score updated for Client #1102: 44 > 65 (+21)" user="AGENT-ZERO" risk="low" />
                         <AuditRow time="14 Feb 10:38:00" source="SYSTEM" action="EMAIL QUEUED" details="Relance J+3 queued for Campaign 'Solaire Hiver'" user="EMAIL-ENG" risk="low" />
                         <AuditRow time="14 Feb 10:15:00" source="USER" action="LOGIN" details="Successful login from IP 82.120.x.x" user="S.Manager" risk="low" />
                         <AuditRow time="14 Feb 09:00:00" source="SYSTEM" action="BATCH SYNC" details="Synchronized 142 records with Salesforce" user="CRM-BOT" risk="low" />
                          <AuditRow time="14 Feb 08:30:00" source="SYSTEM" action="NIGHTLY PURGE" details="Purged 0 obsolete draft records" user="SYSTEM" risk="low" />
                    </tbody>
                </table>
            </div>
            <div className="text-center text-[10px] text-slate-600 uppercase font-bold tracking-widest mt-2">
                Affichage des 7 derniers événements sur 14 202
            </div>
        </div>
    );
};
