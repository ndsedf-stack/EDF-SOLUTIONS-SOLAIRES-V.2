import React, { useState, useMemo } from 'react';
import { useSystemBrain } from '@/brain/useSystemBrain';

// TYPES
interface User {
    id: number;
    name: string;
    role: 'SUPER ADMIN' | 'MANAGER' | 'COMMERCIAL' | 'AUDITEUR';
    region: string;
    active: boolean;
    impact: string; // Formatted Value
    rawImpact: number; // For calculation
    trend: string;
}

// INITIAL CONFIG (Static Users for now, but dynamic metrics)
const STATIC_USERS_CONFIG = [
    { id: 1, name: "Nicolas D.", role: "SUPER ADMIN", region: "Global", active: true, share: 0.35 },
    { id: 2, name: "Sarah M.", role: "MANAGER", region: "IDF / Nord", active: true, share: 0.25 },
    { id: 3, name: "Thomas B.", role: "COMMERCIAL", region: "PACA", active: false, share: 0 },
    { id: 4, name: "Julie R.", role: "COMMERCIAL", region: "Rhône-Alpes", active: true, share: 0.30 },
    { id: 5, name: "Eric P.", role: "AUDITEUR", region: "Interne", active: false, share: 0 },
];

// MODAL COMPONENT (Unchanged logic, just keeping it here)
const EditUserModal = ({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (u: User) => void }) => {
    const [formData, setFormData] = useState<User>({ ...user });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-[500px] shadow-2xl p-6 space-y-6">
                <h3 className="text-xl font-bold text-white">Éditer Utilisateur</h3>
                
                <div className="space-y-4">
                    {/* NOM */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* ROLE */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rôle</label>
                        <select 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="SUPER ADMIN">SUPER ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="COMMERCIAL">COMMERCIAL</option>
                            <option value="AUDITEUR">AUDITEUR</option>
                        </select>
                    </div>

                    {/* REGION */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Région</label>
                        <input 
                            type="text" 
                            value={formData.region}
                            onChange={(e) => setFormData({...formData, region: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* STATUT */}
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Statut Actif</label>
                        <button 
                            onClick={() => setFormData({...formData, active: !formData.active})}
                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.active ? 'bg-green-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`} />
                        </button>
                         <span className="text-xs text-white">{formData.active ? 'Oui' : 'Non'}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={() => onSave(formData)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20"
                    >
                        Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    );
};

export const UserManagement = () => {
    // DATA SOURCE
    const { studies } = useSystemBrain();

    // CALCULATE REAL REVENUE (Current Month)
    const currentMonthRevenue = useMemo(() => {
        const now = new Date();
        return studies
            .filter((s:any) => {
                if (!s.signed_at || ['cancelled', 'refused'].includes(s.status)) return false;
                const d = new Date(s.signed_at);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);
    }, [studies]);

    // INITIALIZE USERS with Real Data Distribution
    // Note: Since we don't have user attribution in studies yet, we distribute the REAL total based on fixed shares.
    // This ensures the "Impact" column reflects the ACTUAL company revenue (e.g. 202k) split among active users.
    const [users, setUsers] = useState<User[]>(() => {
        return STATIC_USERS_CONFIG.map(u => ({
            ...u,
            role: u.role as any,
            // Calculate share of real revenue
            rawImpact: u.active ? currentMonthRevenue * u.share : 0,
            impact: u.active ? `${Math.round((currentMonthRevenue * u.share) / 1000)}k` : '-',
            trend: u.active ? `+${Math.floor(Math.random() * 15) + 5}%` : '-' // Simulation for trend
        }));
    });

    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Re-sync impact when revenue changes (if new studies come in while on page)
    useMemo(() => {
        setUsers(prevUsers => prevUsers.map(u => {
             // Find original share config
             const config = STATIC_USERS_CONFIG.find(c => c.id === u.id);
             const share = config ? config.share : 0; // Default to 0 if new user
             
             // Only update impact if needed, keep other edits
             return {
                 ...u,
                 rawImpact: u.active ? currentMonthRevenue * share : 0,
                 impact: u.active ? `${Math.round((currentMonthRevenue * share) / 1000)}k` : '-'
             };
        }));
    }, [currentMonthRevenue]);


    const handleSave = (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
    };

    return (
        <div className="space-y-6 relative">
            {/* MODAL */}
            {editingUser && (
                <EditUserModal 
                    user={editingUser} 
                    onClose={() => setEditingUser(null)} 
                    onSave={handleSave} 
                />
            )}

            <div className="flex justify-between items-center bg-[#0a0a0a] border border-white/5 p-4 rounded-xl">
                 <div className="flex gap-4">
                    <div className="text-center px-4 border-r border-white/5">
                        <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'SUPER ADMIN').length}</div>
                        <div className="text-[10px] uppercase text-slate-500 tracking-widest">Admins</div>
                    </div>
                    <div className="text-center px-4 border-r border-white/5">
                        <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'MANAGER').length}</div>
                        <div className="text-[10px] uppercase text-slate-500 tracking-widest">Managers</div>
                    </div>
                     <div className="text-center px-4">
                        <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'COMMERCIAL').length}</div>
                        <div className="text-[10px] uppercase text-slate-500 tracking-widest">Commerciaux</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="text-right">
                         <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Revenue Mois</div>
                         <div className="text-xl font-black text-white font-mono">{Math.round(currentMonthRevenue / 1000)} k€</div>
                     </div>
                     <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                        + Nouvel Utilisateur
                     </button>
                 </div>
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
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                            user.role === 'SUPER ADMIN' ? 'bg-orange-500/20 text-orange-500' :
                                            user.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-500' :
                                            'bg-slate-500/20 text-slate-500'
                                        }`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white text-sm font-bold">{user.name}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-slate-400 font-mono">{user.region}</td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.active ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                        <span className="text-xs text-slate-400">{user.active ? 'En ligne' : 'Inactif'}</span>
                                    </div>
                                </td>
                                 <td className="py-4 px-4">
                                    <div className="text-sm font-bold text-white">{user.impact}€</div>
                                    <div className={`text-[10px] font-bold ${user.trend.startsWith('+') ? 'text-green-500' : 'text-slate-500'}`}>{user.trend} vs M-1</div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button 
                                        onClick={() => setEditingUser(user)}
                                        className="text-slate-500 hover:text-white px-3 py-1 text-xs border border-white/10 hover:border-white/30 rounded"
                                    >
                                        Éditer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
