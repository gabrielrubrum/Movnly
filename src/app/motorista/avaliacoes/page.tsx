"use client";

import { motion } from "framer-motion";
import {
    Star, MessageSquare, ShieldCheck,
    TrendingUp, Award, ThumbsUp,
    CheckCircle2, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEEDBACK = [
    { id: 1, name: "António Costa", rating: 5, comment: "Serviço impecável. Veículo em estado de concurso e motorista extremamente profissional e discreto.", date: "Hoje" },
    { id: 2, name: "Maria Santos", rating: 5, comment: "Melhor serviço de transfer em Lisboa. Pontualidade e cortesia exemplares.", date: "Ontem" },
    { id: 3, name: "Francisca Silva", rating: 4, comment: "Viagem muito confortável. Pequeno atraso no trânsito mas o motorista avisou com antecedência.", date: "Há 2 dias" },
    { id: 4, name: "Ricardo Pereira", rating: 5, comment: "Serviço de excelência. Tudo cumprido com o máximo profissionalismo.", date: "Há 3 dias" },
];

export default function AvaliacoesPage() {
    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                        <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.35em]">Reputação Certificada</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Avaliações</h1>
                    <p className="text-white/30 text-sm mt-1.5">Feedback dos seus passageiros</p>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0C0C11] border border-white/[0.06] self-start">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-black">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Nível</p>
                        <p className="text-sm font-bold text-white">Diamante · Top 1%</p>
                    </div>
                </div>
            </div>

            {/* Score + metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Big score */}
                <div className="sm:col-span-2 lg:col-span-1 p-6 rounded-3xl bg-[#0C0C11] border border-brand-gold/20 text-center">
                    <p className="text-6xl font-bold text-brand-gold">4.98</p>
                    <div className="flex items-center justify-center gap-1 mt-2 mb-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />)}
                    </div>
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Índice Global</p>
                </div>

                {[
                    { label: "Cortesia", value: "100%", icon: ThumbsUp, color: "emerald" },
                    { label: "Pontualidade", value: "99.8%", icon: Activity, color: "gold" },
                    { label: "Higienização", value: "100%", icon: CheckCircle2, color: "emerald" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06] flex flex-col justify-between">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                            color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-gold/10 text-brand-gold"
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{value}</p>
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mt-1">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feedback list */}
            <div className="space-y-4">
                <h2 className="text-sm font-black text-white/40 uppercase tracking-widest">Feedback Recente</h2>
                {FEEDBACK.map((f, idx) => (
                    <motion.div key={f.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                        className="p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06] hover:border-white/10 transition-all group">
                        <div className="flex flex-col sm:flex-row gap-5">
                            <div className="sm:w-48 flex-shrink-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 font-bold group-hover:bg-brand-gold group-hover:text-black transition-all">
                                        {f.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{f.name}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{f.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(f.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-brand-gold text-brand-gold" />)}
                                    {[...Array(5 - f.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-white/10" />)}
                                </div>
                            </div>
                            <div className="flex-1 flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-white/10 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-white/50 leading-relaxed">"{f.comment}"</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
