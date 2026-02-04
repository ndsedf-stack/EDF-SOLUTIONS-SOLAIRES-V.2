import React from 'react';

const IntegrationCard = ({ name, status, lastSync, icon, color }: any) => (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex flex-col justify-between h-48 group hover:border-white/10 transition-all relative overflow-hidden">
        {status === 'active' && <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500 blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity`}></div>}
        
        <div className="flex justify-between items-start z-10">
            <div className={`w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-2xl`}>
                {icon}
            </div>
            <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                status === 'active' ? 'bg-green-500/10 text-green-500' : 
                'bg-slate-500/10 text-slate-500'
            }`}>
                {status === 'active' ? 'Connected' : 'Inactive'}
            </div>
        </div>

        <div className="z-10">
            <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
            <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Last Sync: {lastSync}</span>
                {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 z-10 flex gap-2">
            <button className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider flex-1 text-left">
                Configurer
            </button>
             <button className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider">
                Logs
            </button>
        </div>
    </div>
);

export const CRMIntegrations = () => (
    <div className="space-y-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1 border-l-4 border-orange-500">Connecteurs CRM Actifs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard name="Salesforce" status="active" lastSync="2 min ago" icon="☁️" color="blue" />
            <IntegrationCard name="HubSpot" status="active" lastSync="5 min ago" icon="🟧" color="orange" />
            <IntegrationCard name="Microsoft Dynamics" status="inactive" lastSync="Never" icon="🔷" color="indigo" />
            <IntegrationCard name="Pipedrive" status="inactive" lastSync="Never" icon="🟢" color="green" />
        </div>

        <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1 border-l-4 border-purple-500 pt-4">Intégrations IA & Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <IntegrationCard name="Cortex AI (EDF Internal)" status="active" lastSync="Real-time" icon="⚡" color="blue" />
             <IntegrationCard name="OpenAI GDP-4o" status="active" lastSync="Real-time" icon="🧠" color="purple" />
             <IntegrationCard name="SendGrid (Email)" status="active" lastSync="30 sec ago" icon="📧" color="cyan" />
        </div>
    </div>
);
