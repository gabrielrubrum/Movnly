"use client";

import React from "react";
import { Building2, Plus, Search, MapPin, Globe, ExternalLink, ShieldCheck, Tag, Download, Zap } from "lucide-react";

const PARTNERS = [
    { id: "NET-01", name: "Hotel Albatroz Cascais", type: "Hotelaria de Luxo", location: "Cascais", commission: "15%", bookings: 88, status: "Ativo" },
    { id: "NET-02", name: "Belmond Reid's Palace", type: "Hotelaria de Luxo", location: "Madeira", commission: "12%", bookings: 124, status: "Ativo" },
    { id: "NET-03", name: "Abreu Luxury Travel", type: "Gestão de Viagens", location: "Porto", commission: "10%", bookings: 456, status: "Ativo" },
    { id: "NET-04", name: "Private Jet Services (PJS)", type: "Parceiro de Aviação", location: "Londres/LX", commission: "20%", bookings: 24, status: "Pendente" },
];

export default function PartnersPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                        <Building2 className="w-3.5 h-3.5" />
                        Rede de Parceiros NexRice
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">Parcerias Estratégicas</h1>
                    <p className="text-white/40 text-sm mt-1">Gestão de grupos hoteleiros, aviação privada e agências de viagens de luxo.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-black font-black text-xs hover:bg-white transition-all">
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Parceiro
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {PARTNERS.map((p) => (
                    <div key={p.id} className="bg-surface-1/50 border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl shadow-2xl hover:border-brand-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-md ${p.status === "Ativo" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                }`}>{p.status}</span>
                        </div>

                        <h3 className="text-lg font-black text-white group-hover:text-brand-400 transition-colors">{p.name}</h3>
                        <p className="text-xs text-white/30 font-medium mb-4">{p.type} · {p.location}</p>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/[0.05] mb-4">
                            <div>
                                <p className="text-[0.6rem] text-white/20 uppercase font-bold tracking-widest">Commission</p>
                                <p className="text-sm font-black text-brand-400">{p.commission}</p>
                            </div>
                            <div>
                                <p className="text-[0.6rem] text-white/20 uppercase font-bold tracking-widest">Bookings</p>
                                <p className="text-sm font-black text-white">{p.bookings}</p>
                            </div>
                        </div>

                        <button className="w-full py-2 text-xs font-bold text-white/40 hover:text-white flex items-center justify-center gap-2 transition-all">
                            Ver Perfil <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
