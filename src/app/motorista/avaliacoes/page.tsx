"use client";

import { motion } from "framer-motion";
import {
    Star, User, MessageSquare,
    ShieldCheck, TrendingUp, Award,
    ThumbsUp, CheckCircle2, Zap,
    Activity, StarHalf
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const FEEDBACK_MOCK = [
    { id: 1, name: "António Costa", rating: 5, comment: "Serviço absolutamente impecável. O veículo estava em estado de concurso e o motorista foi extremamente profissional e discreto.", date: "Hoje" },
    { id: 2, name: "Maria Santos", rating: 5, comment: "Melhor serviço de transfer em Lisboa. Recomendo vivamente pela pontualidade e cortesia.", date: "Ontem" },
    { id: 3, name: "Francisca Silva", rating: 4, comment: "Excelente viagem, muito confortável. Apenas um pequeno atraso devido ao trânsito na Ponte 25 de Abril, mas o motorista avisou com antecedência.", date: "Há 2 dias" },
    { id: 4, name: "Ricardo Pereira", rating: 5, comment: "Serviço de excelência. Tudo foi cumprido com o máximo de profissionalismo.", date: "Há 3 dias" },
];

export default function AvaliacoesPage() {

    return (
        <main className="py-16 lg:py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-16">

            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-brand-gold" />
                        <span className="text-[8px] font-bold text-brand-gold uppercase tracking-[0.3em]">Reputação Certificada NexRice</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="text-white text-6xl font-bold tracking-tight leading-none">
                            Minhas <span className="text-brand-gold not-italic font-light">Avaliações</span>
                        </h1>
                        <p className="text-white/30 text-lg font-light max-w-md">
                            O seu índice de confiança é o pilar da nossa excelência. Analise o feedback dos seus passageiros.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/5 flex items-center gap-6 backdrop-blur-3xl group hover:border-brand-gold/20 transition-all">
                            <div className="w-16 h-16 rounded-3xl bg-brand-gold flex items-center justify-center text-black shadow-[0_15px_40px_-5px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Nível de Desempenho</p>
                                <p className="text-2xl font-light text-white italic tracking-tighter">Diamante • Top 1%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Big Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Star className="w-48 h-48 text-brand-gold" />
                    </div>
                    <div className="text-8xl font-extralight text-brand-gold tracking-tighter italic leading-none">4.98</div>
                    <div className="flex items-center gap-1.5 text-brand-gold">
                        <Star className="w-4 h-4 fill-brand-gold" />
                        <Star className="w-4 h-4 fill-brand-gold" />
                        <Star className="w-4 h-4 fill-brand-gold" />
                        <Star className="w-4 h-4 fill-brand-gold" />
                        <Star className="w-4 h-4 fill-brand-gold" />
                    </div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Índice de Confiança Global</p>
                </motion.div>

                {/* Metric Cards */}
                <div className="md:col-span-2 grid grid-cols-2 gap-8">
                    {[
                        { label: "Cortesia & Etiqueta", value: "100%", icon: ThumbsUp, color: "emerald" },
                        { label: "Pontualidade", value: "99.8%", icon: Activity, color: "gold" },
                        { label: "Higienização Veicular", value: "100%", icon: CheckCircle2, color: "emerald" },
                        { label: "Sugestões de Rota", value: "98.5%", icon: TrendingUp, color: "gold" },
                    ].map((metric, idx) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 flex items-center gap-6 group hover:bg-white/[0.02] transition-colors"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                metric.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-gold/10 text-brand-gold"
                            )}>
                                <metric.icon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{metric.label}</div>
                                <div className="text-xl font-light text-white italic tracking-tighter leading-none">{metric.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Feedback Feed */}
            <div className="space-y-8">
                <h2 className="text-2xl font-light text-white italic tracking-tight px-4">Feedback Recente</h2>
                <div className="grid gap-6">
                    {FEEDBACK_MOCK.map((f, idx) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 relative group hover:border-white/10 transition-all backdrop-blur-md"
                        >
                            <div className="flex flex-col md:flex-row gap-10">

                                {/* User Info */}
                                <div className="md:w-64 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 font-black text-xl group-hover:bg-brand-gold group-hover:text-black transition-all">
                                            {f.name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-light text-white italic tracking-tight leading-none">{f.name}</p>
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{f.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-brand-gold opacity-60">
                                        {[...Array(f.rating)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-brand-gold" />
                                        ))}
                                    </div>
                                </div>

                                {/* Comment Content */}
                                <div className="flex-1 space-y-4 relative">
                                    <MessageSquare className="absolute -top-4 -left-4 w-12 h-12 text-white/[0.02] -z-10" />
                                    <p className="text-lg font-light text-white/60 leading-relaxed italic pr-12">
                                        "{f.comment}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                            Ver Missão Associada
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    ))}

                    <button className="py-8 text-center rounded-[40px] border border-dashed border-white/5 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hover:border-brand-gold/40 hover:text-brand-gold transition-all">
                        Carregar Mais Histórico de Feedback
                    </button>
                </div>
            </div>

        </main>
    );
}
