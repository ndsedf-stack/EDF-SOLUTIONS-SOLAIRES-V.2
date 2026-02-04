import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Sub-modules
import { AdminKPIs } from './components/AdminKPIs';
import { UserManagement } from './components/UserManagement';
import { EngineParameters } from './components/EngineParameters';
import { AgentMonitoring } from './components/AgentMonitoring';
import { AuditLogs } from './components/AuditLogs';
import { CRMIntegrations } from './components/CRMIntegrations';
import { Maintenance } from './components/Maintenance';

type AdminSection = 'kpi' | 'users' | 'engine' | 'agents' | 'audit' | 'crm' | 'maintenance';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<AdminSection>('kpi');

    const MenuButton = ({ section, icon, label }: { section: AdminSection, icon: string, label: string }) => (
        <button
            onClick={() => setActiveSection(section)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                activeSection === section
                    ? 'bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium text-sm tracking-wide">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#02050a] flex text-slate-200 font-sans selection:bg-[#f97316]/30">
            {/* SIDEBAR */}
            <aside className="w-72 border-r border-white/5 flex flex-col bg-[#050505]">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#f97316] to-orange-700 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <span className="text-lg">⚡</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white tracking-widest leading-none">ADMIN</h1>
                            <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1">Gouvernance</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Pilotage</div>
                    <MenuButton section="kpi" icon="📊" label="Dashboard Vital" />
                    <MenuButton section="users" icon="👥" label="Utilisateurs BU" />
                    
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 mt-6">Moteur</div>
                    <MenuButton section="engine" icon="⚙️" label="Paramètres Scores" />
                    <MenuButton section="agents" icon="🤖" label="Monitoring Agents" />
                    <MenuButton section="crm" icon="🔌" label="Intégrations CRM" />

                    <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 mt-6">Risque & Audit</div>
                    <MenuButton section="audit" icon="📜" label="Logs Forensiques" />
                    <MenuButton section="maintenance" icon="🛠️" label="Maintenance" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <span>⬅</span> Retour Cockpit
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/10 via-[#02050a] to-[#02050a]">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {activeSection === 'kpi' && 'Signaux Vitaux du Système'}
                            {activeSection === 'users' && 'Administration des Équipes'}
                            {activeSection === 'engine' && 'Paramètres du Moteur'}
                            {activeSection === 'agents' && 'Santé des Agents IA'}
                            {activeSection === 'audit' && 'Audit Trail & Tracabilité'}
                            {activeSection === 'crm' && 'Connecteurs Externes'}
                            {activeSection === 'maintenance' && 'Maintenance Système'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            Interface de gouvernance niveau COMEX - Accès restreint
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-green-500">SYSTEM HEALTHY</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] mx-auto">
                    {/* Content Area */}
                    {activeSection === 'kpi' && <AdminKPIs />}
                    {activeSection === 'users' && <UserManagement />}
                    {activeSection === 'engine' && <EngineParameters />}
                    {activeSection === 'agents' && <AgentMonitoring />}
                    {activeSection === 'audit' && <AuditLogs />}
                    {activeSection === 'crm' && <CRMIntegrations />}
                    {activeSection === 'maintenance' && <Maintenance />}
                </div>
            </main>
        </div>
    );
};


export default AdminDashboard;
