"use client";

import React, { useEffect, useState } from "react";
import { Building2, User, Shield, Search, MoreHorizontal, UserPlus, Mail, Calendar } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface StaffMember {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
    ADMIN: { label: "Super Admin", color: "bg-brand-gold text-black", desc: "Acesso total ao sistema" },
    MANAGER: { label: "Gestor", color: "bg-blue-500 text-white", desc: "Gestão operacional e despacho" },
    ACCOUNTANT: { label: "Financeiro", color: "bg-emerald-500 text-white", desc: "Contabilidade e faturamento" },
    OPERATOR: { label: "Operador", color: "bg-white/10 text-white/60", desc: "Gestão de reservas e suporte" },
};

export default function StaffManagementPage() {
    const { token } = useAuthStore();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchStaff = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/admin/staff`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStaff(data);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            fetchStaff();
        } catch (error) {
            console.error("Failed to update role:", error);
        }
    };

    useEffect(() => {
        if (token) fetchStaff();
    }, [token]);

    const filtered = staff.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                        <Building2 className="w-3.5 h-3.5" />
                        Gestão de Recursos Humanos
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">Equipa & Cargos</h1>
                    <p className="text-white/40 text-sm mt-1">Controle de acessos e hierarquia administrativa da plataforma.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="Procurar membro..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all w-64" 
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-gold text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-luxury">
                        <UserPlus className="w-3.5 h-3.5" /> Adicionar Staff
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                    <div key={role} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl group hover:border-brand-gold/20 transition-all shadow-2xl">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110", config.color)}>
                            <Shield className="w-5 h-5" />
                        </div>
                        <h4 className="text-white font-bold mb-1 tracking-tight">{config.label}</h4>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black leading-tight">{config.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white/[0.01] border border-white/[0.05] rounded-[2.5rem] overflow-hidden shadow-luxury backdrop-blur-3xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/[0.03] text-[0.6rem] uppercase tracking-widest font-black text-white/20 bg-white/[0.02]">
                            <th className="px-10 py-6">Membro</th>
                            <th className="px-10 py-6">Cargo Atual</th>
                            <th className="px-10 py-6">Desde</th>
                            <th className="px-10 py-6 text-right pr-12">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-10 py-8 bg-white/[0.01]" />
                                </tr>
                            ))
                        ) : filtered.map((member) => (
                            <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black text-lg transition-all group-hover:bg-brand-gold group-hover:text-black shadow-glow">
                                            {member.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">{member.name}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-white/30 font-medium">
                                                <Mail className="w-3 h-3" /> {member.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <select 
                                        value={member.role}
                                        onChange={(e) => updateRole(member.id, e.target.value)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent outline-none cursor-pointer hover:scale-105 transition-all",
                                            ROLE_CONFIG[member.role]?.color || "bg-white/5 text-white/40"
                                        )}
                                    >
                                        {Object.keys(ROLE_CONFIG).map(r => (
                                            <option key={r} value={r} className="bg-[#07070A] text-white">{ROLE_CONFIG[r].label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-right pr-12">
                                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-white hover:bg-white/10 transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
