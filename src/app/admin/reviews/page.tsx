"use client";

import React from "react";
import { MessageSquare, Star, MessageCircle, ShieldCheck } from "lucide-react";

const REVIEWS = [
    { id: "REV-44", customer: "Sr. Bernardo Silva", rating: 5, date: "Ontem", comment: "Serviço impecável. O Motorista foi extremamente pontual e a viatura estava num estado imaculado.", trip: "NX-588" },
    { id: "REV-43", customer: "Matias van den Berg", rating: 5, date: "Há 2 dias", comment: "Experiência fantástica do aeroporto para Cascais. O Mercedes S-Class foi perfeito para trabalhar durante o trajeto.", trip: "NX-587" },
    { id: "REV-42", customer: "Dra. Helena Rocha", rating: 4, date: "Há 1 semana", comment: "Excelente profissionalismo. Um pequeno atraso no voo foi gerido com total tranquilidade pela equipa.", trip: "NX-112" },
];

export default function ReviewsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Excelência de Serviço
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter italic">Feedback dos Clientes</h1>
                <p className="text-white/40 text-sm mt-1">Acompanhamento de avaliações e opiniões qualitativas dos passageiros sobre as viagens.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Avaliação Média", value: "4.9", icon: Star, color: "amber" },
                    { label: "Total Avaliações", value: "842", icon: MessageCircle, color: "brand" },
                    { label: "Positivas", value: "98%", icon: ShieldCheck, color: "emerald" },
                    { label: "Crescimento", value: "+12%", icon: Star, color: "brand" },
                ].map((s) => (
                    <div key={s.label} className="bg-surface-1/50 border border-white/[0.05] p-5 rounded-2xl shadow-2xl">
                        <p className="text-[0.6rem] uppercase tracking-widest font-black text-white/30 mb-2">{s.label}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-white">{s.value}</span>
                            <s.icon className={cn("w-4 h-4", s.color === "brand" ? "text-brand-gold" : s.color === "amber" ? "text-amber-400" : "text-emerald-400")} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                {REVIEWS.map((r) => (
                    <div key={r.id} className="bg-surface-1/50 border border-white/[0.05] p-6 rounded-3xl backdrop-blur-xl hover:bg-white/[0.02] transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white/40">
                                    {r.customer.substring(0, 1)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">{r.customer}</p>
                                    <p className="text-[0.65rem] text-white/30 font-medium">{r.date} • Reserva {r.trip}</p>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("w-3.5 h-3.5", i < r.rating ? "text-amber-400 fill-amber-400" : "text-white/10")} />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed italic">"{r.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
