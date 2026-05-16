"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Clock, Search, Star, Download, ArrowRight } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";

export default function HistoricoPage() {
    const { completed, loading } = useBookings();
    const [searchQuery, setSearchQuery] = useState("");
    const [monthFilter, setMonthFilter] = useState("Todos");

    const { filteredMissions, uniqueMonths } = useMemo(() => {
        const unique = Array.from(new Set(completed.map(m => {
            const dt = new Date(m.pickupTime || m.createdAt || Date.now());
            const s = dt.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
            return s.charAt(0).toUpperCase() + s.slice(1);
        })));
        const filtered = completed.filter((m: any) => {
            const matchSearch = (m.reference?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (m.destination?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (m.origin?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            const dt = new Date(m.pickupTime || m.createdAt || Date.now());
            const my = dt.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
            const matchMonth = monthFilter === "Todos" || (my.charAt(0).toUpperCase() + my.slice(1)) === monthFilter;
            return matchSearch && matchMonth;
        });
        return { filteredMissions: filtered, uniqueMonths: unique };
    }, [completed, searchQuery, monthFilter]);

    const handleExportCSV = () => {
        const headers = ["Data", "Referência", "Origem", "Destino", "Valor Líquido"];
        const rows = filteredMissions.map((m: any) => [
            new Date(m.pickupTime || m.createdAt || Date.now()).toLocaleDateString('pt-PT'),
            m.reference || `REF-${m.id.substring(0, 6).toUpperCase()}`,
            `"${m.origin}"`, `"${m.destination}"`,
            (m.driverAmount || 0).toString()
        ]);
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `movnly_historico_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Histórico</h1>
                    <p className="text-white/30 text-sm mt-1.5">Registo de todas as viagens concluídas</p>
                </div>
                <button onClick={handleExportCSV}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/8 text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all self-start">
                    <Download className="w-4 h-4" /> Exportar CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Procurar por referência ou destino..."
                        className="w-full bg-[#0C0C11] border border-white/8 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-brand-gold/30 transition-all" />
                </div>
                <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
                    className="bg-[#0C0C11] border border-white/8 rounded-xl py-3 px-4 text-sm text-white/50 outline-none cursor-pointer hover:border-white/15 transition-all">
                    <option value="Todos">Todos os meses</option>
                    {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredMissions.length > 0 ? filteredMissions.map((m: any, idx: number) => (
                    <motion.div key={m.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                        className="group grid grid-cols-1 md:grid-cols-[140px_1fr_80px_100px] items-center gap-4 p-5 rounded-2xl bg-[#0C0C11] border border-white/[0.06] hover:border-white/10 transition-all">

                        <div>
                            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">
                                {new Date(m.pickupTime || m.createdAt || Date.now()).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                            </p>
                            <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">
                                {m.reference || `REF-${m.id.substring(0, 6).toUpperCase()}`}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 md:px-4 md:border-x border-white/5 min-w-0">
                            <p className="text-sm text-white/60 truncate">{m.origin}</p>
                            <ArrowRight className="w-3 h-3 text-white/15 flex-shrink-0" />
                            <p className="text-sm text-white/60 truncate">{m.destination}</p>
                        </div>

                        <div className="flex items-center gap-1 text-brand-gold">
                            <Star className="w-3 h-3 fill-brand-gold" />
                            <span className="text-sm font-bold text-white">5.0</span>
                        </div>

                        <div className="text-right">
                            <p className="text-base font-bold text-white">{formatCurrency(m.driverAmount || 0)}</p>
                            <p className="text-[8px] font-black text-emerald-400/50 uppercase tracking-widest mt-0.5">Liquidado</p>
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-20 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/5">
                        <Clock className="w-10 h-10 text-white/5 mx-auto mb-4" />
                        <p className="text-white/25 font-bold">Sem registos</p>
                        <p className="text-[9px] text-white/10 uppercase tracking-widest font-black mt-2">Nenhuma viagem encontrada</p>
                    </div>
                )}
                {filteredMissions.length > 0 && (
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center pt-2">
                        {filteredMissions.length} registo(s)
                    </p>
                )}
            </div>
        </div>
    );
}
