import React from 'react';

const UserRow = ({ name, role, region, score, active, impact }: any) => (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    role === 'SUPER ADMIN' ? 'bg-orange-500/20 text-orange-500' :
                    role === 'MANAGER' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-slate-500/20 text-slate-500'
                }`}>
                    {name.charAt(0)}
                </div>
                <div>
                    <div className="text-white text-sm font-bold">{name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{role}</div>
                </div>
            </div>
        </td>
        <td className="py-4 px-4 text-sm text-slate-400 font-mono">{region}</td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                <span className="text-xs text-slate-400">{active ? 'En ligne' : 'Inactif'}</span>
            </div>
        </td>
         <td className="py-4 px-4">
            <div className="text-sm font-bold text-white">{impact}€</div>
            <div className="text-[10px] text-green-500 font-bold">+12% vs M-1</div>
        </td>
        <td className="py-4 px-4 text-right">
            <button className="text-slate-500 hover:text-white px-3 py-1 text-xs">Éditer</button>
        </td>
    </tr>
);

export const UserManagement = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-[#0a0a0a] border border-white/5 p-4 rounded-xl">
             <div className="flex gap-4">
                <div className="text-center px-4 border-r border-white/5">
                    <div className="text-2xl font-bold text-white">4</div>
                    <div className="text-[10px] uppercase text-slate-500 tracking-widest">Admins</div>
                </div>
                <div className="text-center px-4 border-r border-white/5">
                    <div className="text-2xl font-bold text-white">12</div>
                    <div className="text-[10px] uppercase text-slate-500 tracking-widest">Managers</div>
                </div>
                 <div className="text-center px-4">
                    <div className="text-2xl font-bold text-white">48</div>
                    <div className="text-[10px] uppercase text-slate-500 tracking-widest">Commerciaux</div>
                </div>
             </div>
             <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                + Nouvel Utilisateur
             </button>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-white/5">
                    <tr>
                        <th className="py-3 px-4">Utilisateur</th>
                        <th className="py-3 px-4">Region</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 px-4">Impact CA (Mois)</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <UserRow name="Nicolas D." role="SUPER ADMIN" region="Global" active={true} impact="2.4M" />
                    <UserRow name="Sarah M." role="MANAGER" region="IDF / Nord" active={true} impact="850k" />
                    <UserRow name="Thomas B." role="COMMERCIAL" region="PACA" active={false} impact="120k" />
                    <UserRow name="Julie R." role="COMMERCIAL" region="Rhône-Alpes" active={true} impact="340k" />
                    <UserRow name="Eric P." role="AUDITEUR" region="Interne" active={false} impact="-" />
                </tbody>
            </table>
        </div>
    </div>
);
