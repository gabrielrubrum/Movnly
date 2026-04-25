"use client";

import React from "react";
import { Tag, Edit2, Zap, Shield, Info, Archive, Plus, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const TIERS = [
    { name: "Classe Executiva", base: 1.0, multiplier: 1.0, perKm: 1.50, minPrice: 35.00, status: "Ativo" },
    { name: "Classe Superior (S-Class)", base: 2.2, multiplier: 2.0, perKm: 2.80, minPrice: 75.00, status: "Ativo" },
    { name: "Carrinha de Grupo (V-Class)", base: 1.8, multiplier: 1.5, perKm: 2.20, minPrice: 65.00, status: "Ativo" },
    { name: "Premium Presidencial", base: 4.5, multiplier: 4.0, perKm: 6.50, minPrice: 250.00, status: "Ativo" },
];

export default function PricingPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                        <Tag className="w-3.5 h-3.5" />
                        Otimização de Tarifas
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter italic">Estratégia de Preços</h1>
                    <p className="text-white/40 text-sm mt-1">Gestão de receitas por categoria e protocolo de multiplicadores dinâmicos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Multiplicador de Época Ativo (x1.2)
                    </div>
                    <button className="nx-btn nx-btn-primary nx-btn-sm font-black uppercase tracking-widest px-6 bg-brand-gold text-black hover:bg-white border-brand-gold/50">Guardar Alterações</button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {TIERS.map((tier) => (
                    <div key={tier.name} className="bg-surface-1/50 border border-white/[0.05] p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl group hover:border-brand-gold/20 transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white group-hover:text-brand-gold transition-colors">{tier.name}</h3>
                                <span className="text-[0.6rem] font-bold text-emerald-400 uppercase tracking-widest">{tier.status}</span>
                            </div>
                            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: "Base", value: `x${tier.base.toFixed(1)}` },
                                { label: "Multiplicador", value: `x${tier.multiplier.toFixed(1)}` },
                                { label: "Por KM", value: formatCurrency(tier.perKm) },
                                { label: "Mínimo", value: formatCurrency(tier.minPrice) },
                            ].map((val) => (
                                <div key={val.label}>
                                    <p className="text-[0.6rem] text-white/20 uppercase font-black tracking-widest mb-1">{val.label}</p>
                                    <p className="text-lg font-black text-white">{val.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[0.6rem] text-white/20 uppercase font-bold tracking-widest">Tarifa Noturna</span>
                                    <span className="text-xs font-bold text-amber-400">+20%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[0.6rem] text-white/20 uppercase font-bold tracking-widest">Tempo de Espera</span>
                                    <span className="text-xs font-bold text-white/60">€0.50 / min</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-brand-gold transition-all" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: "Preços Dinâmicos", desc: "Ajuste baseado na procura em tempo real", icon: Zap },
                    { title: "Regras de Segurança", desc: "Prevenção de fraude e verificação de pagamentos", icon: Shield },
                    { title: "Impostos (IVA 23%)", desc: "Taxa padrão de IVA aplicada em Portugal", icon: Info },
                ].map((card) => (
                    <div key={card.title} className="bg-white/[0.02] border border-white/[0.04] p-6 rounded-3xl hover:bg-white/[0.04] transition-all">
                        <card.icon className="w-6 h-6 text-brand-gold mb-4" />
                        <h4 className="text-sm font-black text-white mb-1">{card.title}</h4>
                        <p className="text-xs text-white/40">{card.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
