"use client";

import React from "react";
import { Users, Search, Plus, MoreHorizontal, Mail, Phone } from "lucide-react";

const CUSTOMERS = [
    { id: "PAT-001", name: "Sr. Bernardo Silva", email: "b.silva@exclusive.pt", phone: "+351 912 888 777", trips: 42, totalSpent: "€8.420,00", status: "VIP" },
    { id: "PAT-002", name: "Dra. Helena Rocha", email: "h.rocha@private.pt", phone: "+351 913 222 111", trips: 15, totalSpent: "€2.150,00", status: "Preferred" },
    { id: "PAT-003", name: "Matias van den Berg", email: "matias@global.nl", phone: "+31 6 1234 5678", trips: 28, totalSpent: "€5.900,00", status: "VIP" },
    { id: "CORP-99", name: "Four Seasons Ritz (Concierge)", email: "concierge@ritz-lisbon.pt", phone: "+351 210 000 000", trips: 312, totalSpent: "€42.800,00", status: "Corporate" },
];

export default function CustomersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                        <Users className="w-3.5 h-3.5" />
                        Diretório de Clientes
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">Gestão de Clientes</h1>
                    <p className="text-white/40 text-sm mt-1">Gestão de perfis individuais e contas institucionais autorizadas.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type="text" placeholder="Pesquisar clientes..." className="bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all w-64" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-black font-black text-xs hover:bg-white transition-all">
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Cliente
                    </button>
                </div>
            </div>

            <div className="bg-surface-1/50 border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/[0.03] text-[0.6rem] uppercase tracking-widest font-black text-white/20 bg-white/[0.01]">
                            <th className="px-8 py-4">Nome / ID</th>
                            <th className="px-8 py-4">Contacto</th>
                            <th className="px-8 py-4 text-center">Viagens</th>
                            <th className="px-8 py-4">Faturação</th>
                            <th className="px-8 py-4">Estado</th>
                            <th className="px-8 py-4 text-right pr-12">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {CUSTOMERS.map((c) => (
                            <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-bold">
                                            {c.name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{c.name}</p>
                                            <p className="text-[0.7rem] text-white/30 font-medium">{c.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[0.75rem] text-white/60">
                                            <Mail className="w-3 h-3" /> {c.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-[0.75rem] text-white/40">
                                            <Phone className="w-3 h-3" /> {c.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center font-bold text-white/80">{c.trips}</td>
                                <td className="px-8 py-6 font-black text-white">{c.totalSpent}</td>
                                <td className="px-8 py-6">
                                    <span className={`px-2 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider ${c.status === "VIP" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                                        c.status === "Corporate" ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/20" :
                                            "bg-white/5 text-white/40 border border-white/10"
                                        }`}>{c.status}</span>
                                </td>
                                <td className="px-8 py-6 text-right pr-12">
                                    <button className="p-2 text-white/20 hover:text-white transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
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
