"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Navigation, Search, ArrowRight, MessageSquare, X, ChevronDown, ChevronUp, Users, Car, MapPin, DollarSign } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { cn, formatCurrency } from "@/lib/utils";
import { BookingChat } from "@/components/chat/BookingChat";
import { useState, useMemo } from "react";

const STATUS_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Em Curso" },
    { value: "scheduled", label: "Agendado" },
];

export default function ViagensPage() {
    const { live, upcoming, loading } = useBookings();
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const allMissions = useMemo(() => {
        const raw = [...live, ...upcoming].filter(
            (m, i, self) => i === self.findIndex(x => x.id === m.id)
        );
        return raw.filter(m => {
            const q = search.toLowerCase();
            const matchSearch = !q ||
                (m.origin?.toLowerCase() || '').includes(q) ||
                (m.destination?.toLowerCase() || '').includes(q) ||
                (m.reference?.toLowerCase() || '').includes(q);
            const s = (m.status || '').toLowerCase();
            const isActive = ['in_progress', 'on_route', 'arrived', 'driver_en_route', 'driver_arrived'].includes(s);
            const matchStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && isActive) ||
                (statusFilter === "scheduled" && !isActive);
            return matchSearch && matchStatus;
        });
    }, [live, upcoming, search, statusFilter]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Minhas Viagens</h1>
                <p className="text-white/30 text-sm mt-1.5">{allMissions.length} viagem(ns) encontrada(s)</p>
            </div>

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Procurar por origem, destino ou referência..."
                        className="w-full bg-[#0C0C11] border border-white/[0.08] rounded-xl py-3 pl-11 pr-10 text-sm text-white outline-none focus:border-brand-gold/30 transition-all" />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    {STATUS_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                            className={cn("px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                statusFilter === opt.value
                                    ? "bg-brand-gold text-black"
                                    : "bg-[#0C0C11] border border-white/[0.08] text-white/40 hover:text-white hover:border-white/15")}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {allMissions.length > 0 ? allMissions.map((mission, idx) => (
                    <motion.div key={mission.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="group p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06] hover:border-brand-gold/25 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="lg:w-44 space-y-2">
                                <span className={cn("inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    ['in_progress', 'on_route', 'arrived', 'driver_en_route', 'driver_arrived'].includes((mission.status || '').toLowerCase())
                                        ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                                        : "bg-white/5 text-white/40 border border-white/[0.08]")}>
                                    {['in_progress', 'on_route', 'arrived', 'driver_en_route', 'driver_arrived'].includes((mission.status || '').toLowerCase()) ? 'Em Curso' : 'Agendado'}
                                </span>
                                <p className="text-sm font-bold text-white">{mission.reference || `REF-${mission.id.substring(0, 6).toUpperCase()}`}</p>
                            </div>
                            <div className="flex-1 flex items-center gap-3 lg:px-6 lg:border-x border-white/5">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Origem</p>
                                    <p className="text-sm font-bold text-white truncate">{mission.origin}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/15 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Destino</p>
                                    <p className="text-sm font-bold text-white truncate">{mission.destination}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 lg:pl-6">
                                <div className="text-center pr-2">
                                    <p className="text-base font-bold text-white">{mission.pickupTime || '--:--'}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">Horário</p>
                                </div>
                                <button onClick={() => setExpandedId(expandedId === mission.id ? null : mission.id)}
                                    className={cn("px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                        expandedId === mission.id
                                            ? "bg-white/10 text-white"
                                            : "bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-black")}
                                >
                                    {expandedId === mission.id ? "Fechar" : "Detalhes"}
                                    {expandedId === mission.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                <button onClick={() => setActiveChatId(mission.id)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/40 hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all">
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Details Dropdown */}
                        <AnimatePresence>
                            {expandedId === mission.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden border-t border-white/5 mt-6 pt-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                        {/* Passageiro */}
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                            <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" /> Passageiro
                                            </p>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-white">{mission.passenger?.name || "Cliente MOVNLY"}</p>
                                                <p className="text-xs text-white/40 font-mono truncate">{mission.passenger?.email}</p>
                                                <a href={`tel:${mission.passenger?.phone || ''}`} className="inline-block text-xs text-emerald-400 font-mono mt-2 hover:underline">
                                                    {mission.passenger?.phone || "+351 --- --- ---"}
                                                </a>
                                            </div>
                                        </div>

                                        {/* Corrida */}
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                            <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                <Car className="w-3.5 h-3.5" /> Detalhes da Corrida
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div>
                                                    <p className="text-white/30 uppercase text-[8px] tracking-wider mb-0.5">Data</p>
                                                    <p className="text-white font-bold">{mission.pickupDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/30 uppercase text-[8px] tracking-wider mb-0.5">Categoria</p>
                                                    <p className="text-white font-bold uppercase">{mission.category}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/30 uppercase text-[8px] tracking-wider mb-0.5">Passageiros</p>
                                                    <p className="text-white font-bold">{mission.passengers} pax</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/30 uppercase text-[8px] tracking-wider mb-0.5">Bagagem</p>
                                                    <p className="text-white font-bold">{mission.luggage} mala(s)</p>
                                                </div>
                                            </div>
                                            {mission.flightNumber && (
                                                <div className="pt-2 border-t border-white/5">
                                                    <p className="text-[8px] text-brand-gold/60 uppercase tracking-widest">Nº VOO: {mission.flightNumber}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rendimento */}
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                            <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                <DollarSign className="w-3.5 h-3.5" /> Rendimento
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-white/40">Tarifa do Cliente</span>
                                                    <span className="text-white font-mono">{formatCurrency(mission.totalPrice)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-white/40">Taxa de Serviço (15%)</span>
                                                    <span className="text-red-400/60 font-mono">-{formatCurrency(mission.platformFee || (mission.totalPrice * 0.15))}</span>
                                                </div>
                                                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                                    <span className="text-xs font-bold text-white">O seu Ganho</span>
                                                    <span className="text-sm font-black text-brand-gold font-mono">{formatCurrency(mission.driverAmount || (mission.totalPrice * 0.85))}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )) : (
                    <div className="py-24 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/5">
                        <Calendar className="w-12 h-12 text-white/5 mx-auto mb-5" />
                        <p className="text-white/25 font-bold">
                            {search || statusFilter !== "all" ? "Nenhum resultado para os filtros" : "Sem viagens agendadas"}
                        </p>
                        {(search || statusFilter !== "all") && (
                            <button onClick={() => { setSearch(""); setStatusFilter("all"); }}
                                className="mt-4 text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline">
                                Limpar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>

            {activeChatId && (
                <BookingChat bookingId={activeChatId} isOpen={!!activeChatId} onClose={() => setActiveChatId(null)} title="Conversa com Passageiro" />
            )}
        </div>
    );
}
