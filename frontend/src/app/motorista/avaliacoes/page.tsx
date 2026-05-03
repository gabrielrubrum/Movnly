"use client";

import { motion } from "framer-motion";
import { Star, MessageSquare, Award, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRatings } from "@/hooks/useRatings";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";

export default function AvaliacoesPage() {
    const { data, loading } = useRatings();
    const [search, setSearch] = useState("");
    const [starFilter, setStarFilter] = useState(0);

    const avg = data?.avg || 0;
    const total = data?.total || 0;
    const dist = data?.distribution || [5, 4, 3, 2, 1].map(s => ({ score: s, count: 0 }));
    const allRatings = data?.ratings || [];

    const filtered = useMemo(() => {
        return allRatings.filter(r => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                r.booking.passenger.name.toLowerCase().includes(q) ||
                (r.comment?.toLowerCase() || '').includes(q) ||
                r.booking.from.toLowerCase().includes(q) ||
                r.booking.to.toLowerCase().includes(q);
            const matchStar = starFilter === 0 || r.score === starFilter;
            return matchSearch && matchStar;
        });
    }, [allRatings, search, starFilter]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Avaliações</h1>
                    <p className="text-white/30 text-sm mt-1.5">{total} avaliações de passageiros</p>
                </div>
                {avg >= 4.5 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0C0C11] border border-white/[0.06] self-start">
                        <div className="w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-black">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Nível</p>
                            <p className="text-sm font-bold text-white">Diamante · Top 1%</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Score + distribution */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-8 rounded-3xl bg-[#0C0C11] border border-brand-gold/20 flex items-center gap-8">
                    <div className="text-center flex-shrink-0">
                        <p className="text-7xl font-bold text-brand-gold leading-none">{avg > 0 ? avg.toFixed(1) : "—"}</p>
                        <div className="flex items-center justify-center gap-0.5 mt-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={cn("w-4 h-4", i <= Math.round(avg) ? "fill-brand-gold text-brand-gold" : "text-white/10")} />
                            ))}
                        </div>
                        <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mt-2">{total} avaliações</p>
                    </div>
                    <div className="flex-1 space-y-2">
                        {dist.map(({ score, count }) => (
                            <button key={score} onClick={() => setStarFilter(starFilter === score ? 0 : score)}
                                className={cn("w-full flex items-center gap-2 rounded-lg px-1 py-0.5 transition-all text-left",
                                    starFilter === score ? "bg-brand-gold/10" : "hover:bg-white/5")}>
                                <span className="text-[9px] font-black text-white/30 w-3">{score}</span>
                                <Star className="w-3 h-3 text-brand-gold/40 flex-shrink-0" />
                                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-brand-gold/60 rounded-full transition-all duration-700"
                                        style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }} />
                                </div>
                                <span className="text-[9px] font-black text-white/20 w-4 text-right">{count}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: "Média Geral", value: avg > 0 ? `${avg.toFixed(1)} ★` : "—", color: "gold" },
                        { label: "Total", value: String(total), color: "white" },
                        { label: "5 Estrelas", value: String(dist.find(d => d.score === 5)?.count || 0), color: "emerald" },
                        { label: "Abaixo de 4", value: String(dist.filter(d => d.score < 4).reduce((s, d) => s + d.count, 0)), color: "white" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="p-5 rounded-2xl bg-[#0C0C11] border border-white/[0.06] flex flex-col justify-between">
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">{label}</p>
                            <p className={cn("text-2xl font-bold mt-2",
                                color === "gold" ? "text-brand-gold" : color === "emerald" ? "text-emerald-400" : "text-white"
                            )}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search + star filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Procurar por passageiro, comentário ou rota..."
                        className="w-full bg-[#0C0C11] border border-white/[0.08] rounded-xl py-3 pl-11 pr-10 text-sm text-white outline-none focus:border-brand-gold/30 transition-all" />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setStarFilter(0)}
                        className={cn("px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            starFilter === 0 ? "bg-brand-gold text-black" : "bg-[#0C0C11] border border-white/[0.08] text-white/40 hover:text-white")}>
                        Todas
                    </button>
                    {[5, 4, 3].map(s => (
                        <button key={s} onClick={() => setStarFilter(starFilter === s ? 0 : s)}
                            className={cn("px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1",
                                starFilter === s ? "bg-brand-gold text-black" : "bg-[#0C0C11] border border-white/[0.08] text-white/40 hover:text-white")}>
                            {s}<Star className="w-3 h-3" />
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-white/40 uppercase tracking-widest">
                        Feedback dos Passageiros {filtered.length < total && `(${filtered.length} de ${total})`}
                    </h2>
                    {(search || starFilter > 0) && (
                        <button onClick={() => { setSearch(""); setStarFilter(0); }}
                            className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1">
                            <X className="w-3 h-3" /> Limpar
                        </button>
                    )}
                </div>

                {filtered.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/5">
                        <Star className="w-10 h-10 text-white/5 mx-auto mb-4" />
                        <p className="text-white/25 font-bold">
                            {total === 0 ? "Sem avaliações ainda" : "Nenhum resultado"}
                        </p>
                        <p className="text-[9px] text-white/10 uppercase tracking-widest font-black mt-2">
                            {total === 0 ? "As avaliações aparecem após viagens concluídas" : "Tenta outros critérios"}
                        </p>
                    </div>
                ) : filtered.map((r, idx) => (
                    <motion.div key={r.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06] hover:border-white/10 transition-all group">
                        <div className="flex flex-col sm:flex-row gap-5">
                            <div className="sm:w-44 flex-shrink-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 font-bold group-hover:bg-brand-gold group-hover:text-black transition-all">
                                        {r.booking.passenger.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{r.booking.passenger.name}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                            {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={cn("w-3 h-3", i <= r.score ? "fill-brand-gold text-brand-gold" : "text-white/10")} />
                                    ))}
                                </div>
                                <p className="text-[9px] text-white/20 mt-2 truncate">{r.booking.from.split(',')[0]} → {r.booking.to.split(',')[0]}</p>
                            </div>
                            <div className="flex-1 flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-white/10 flex-shrink-0 mt-0.5" />
                                {r.comment ? (
                                    <p className="text-sm text-white/50 leading-relaxed">"{r.comment}"</p>
                                ) : (
                                    <p className="text-sm text-white/20">Sem comentário</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
