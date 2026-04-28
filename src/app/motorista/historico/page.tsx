"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
    Clock, Search, Filter,
    MapPin, Calendar, Star,
    Download, ArrowUpRight, ShieldCheck,
    Briefcase
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";

export default function HistoricoPage() {
    const { completed, loading } = useBookings();
    const [searchQuery, setSearchQuery] = useState("");
    const [monthFilter, setMonthFilter] = useState("Todos os Meses");

    const { filteredMissions, uniqueMonths } = useMemo(() => {
        const unique = Array.from(new Set(completed.map(m => {
            const dt = new Date(m.pickupTime || m.createdAt || Date.now());
            const st = dt.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
            return st.charAt(0).toUpperCase() + st.slice(1);
        })));
        
        const filtered = completed.filter((mission: any) => {
            const matchesSearch = (mission.reference?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                                  (mission.destination?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                                  (mission.origin?.toLowerCase() || '').includes(searchQuery.toLowerCase());
                                  
            const date = new Date(mission.pickupTime || mission.createdAt || Date.now());
            const monthYear = date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
            const finalMonthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
            
            const matchesMonth = monthFilter === "Todos os Meses" || finalMonthYear === monthFilter;

            return matchesSearch && matchesMonth;
        });

        return { filteredMissions: filtered, uniqueMonths: unique };
    }, [completed, searchQuery, monthFilter]);

    const handleExportCSV = () => {
        const headers = ["Data", "Referência", "Origem", "Destino", "Valor Liquido"];
        const rows = filteredMissions.map((m: any) => [
            new Date(m.pickupTime || m.createdAt || Date.now()).toLocaleDateString('pt-PT'),
            m.reference || `REF-${m.id.substring(0, 6).toUpperCase()}`,
            `"${m.origin}"`,
            `"${m.destination}"`,
            (m.driverAmount || 0).toString()
        ]);
        
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `nexrice_historico_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="py-16 lg:py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-16">

            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-brand-gold" />
                        <span className="text-[8px] font-bold text-brand-gold uppercase tracking-[0.3em]">Arquivo Operacional • Lisboa</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="text-white text-6xl font-bold tracking-tight leading-none">
                            Meu {" "}<span className="text-brand-gold not-italic font-light">Histórico</span>
                        </h1>
                        <p className="text-white/30 text-lg font-light max-w-md">
                            Registo institucional de todas as viagens concluídas no ecossistema NexRice.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={handleExportCSV} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all flex items-center gap-3 group">
                            <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" /> Exportar Relatório
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-4 backdrop-blur-md">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-gold transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="PROCURAR POR REFERÊNCIA OU DESTINO..."
                        className="w-full bg-white/5 border border-transparent focus:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black tracking-widest text-white outline-none transition-all uppercase"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <select 
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="bg-white/5 border border-transparent focus:border-white/10 rounded-2xl py-4 px-8 text-[10px] font-black tracking-widest text-white/60 outline-none uppercase cursor-pointer hover:bg-white/10 transition-all flex-1 md:flex-none"
                    >
                        <option value="Todos os Meses">Todos os Meses</option>
                        {uniqueMonths.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* History Table/List */}
            <div className="space-y-4">
                {filteredMissions.length > 0 ? (
                    filteredMissions.map((mission: any, idx: number) => (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr] items-center gap-8 p-8 rounded-[28px] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all"
                        >
                            {/* Reference & Date */}
                            <div className="space-y-1">
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                                    {new Date(mission.pickupTime || mission.createdAt || Date.now()).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                                </div>
                                <div className="text-lg font-light text-white italic tracking-tight uppercase group-hover:text-brand-gold transition-colors">
                                    {mission.reference || `REF-${mission.id.substring(0, 6).toUpperCase()}`}
                                </div>
                            </div>

                            {/* Path */}
                            <div className="flex items-center gap-6 px-8 border-x border-white/5">
                                <div className="space-y-1 flex-1">
                                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Trajeto Concluído</p>
                                    <p className="text-sm font-light text-white/60 italic truncate">
                                        {mission.origin} <ArrowUpRight className="inline w-3 h-3 mx-1 text-brand-gold/40" /> {mission.destination}
                                    </p>
                                </div>
                            </div>

                            {/* Performance */}
                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center gap-1 text-brand-gold">
                                    <Star className="w-3 h-3 fill-brand-gold" />
                                    <span className="text-sm font-light">5.0</span>
                                </div>
                                <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Avaliação</p>
                            </div>

                            {/* Financial */}
                            <div className="text-right space-y-1">
                                <div className="text-xl font-light text-white italic tracking-tighter">{formatCurrency(mission.driverAmount || 0)}</div>
                                <p className="text-[8px] font-black text-emerald-400/40 uppercase tracking-widest flex items-center justify-end gap-1">
                                    Liquidado
                                </p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-32 text-center rounded-[48px] bg-white/[0.01] border border-white/5">
                        <Clock className="w-16 h-16 text-white/5 mx-auto mb-8" />
                        <h3 className="text-3xl font-light text-white/30 italic mb-3">Sem Registos A Exibir</h3>
                        <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">Nenhuma viagem encontrada para os filtros aplicados.</p>
                    </div>
                )}

                <div className="flex items-center justify-between p-10 border-t border-white/5 opacity-50">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Exibindo {filteredMissions.length} registo(s)</span>
                </div>
            </div>

        </main>
    );
}
