"use client";

import { motion } from "framer-motion";
import {
    Calendar, MapPin, Navigation,
    Search, Filter, ShieldCheck,
    Car, ArrowRight, MessageSquare, Clock
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";
import { BookingChat } from "@/components/chat/BookingChat";
import { useState } from "react";

export default function ViagensPage() {
    const { live, upcoming, loading } = useBookings();
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const allMissions = [...live, ...upcoming].filter(
        (m, index, self) => index === self.findIndex(x => x.id === m.id)
    );

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
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                        <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.35em]">Operações em Tempo Real</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Minhas Viagens</h1>
                    <p className="text-white/30 text-sm mt-1.5">Atribuições atuais e próximas viagens agendadas</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/8 transition-all">
                        <Filter className="w-3.5 h-3.5" /> Filtrar
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                        <input
                            type="text"
                            placeholder="Procurar..."
                            className="bg-white/5 border border-white/8 rounded-xl py-2.5 pl-10 pr-4 text-[11px] text-white outline-none focus:border-brand-gold/30 transition-all w-48"
                        />
                    </div>
                </div>
            </div>

            {/* Missions */}
            <div className="space-y-4">
                {allMissions.length > 0 ? allMissions.map((mission, idx) => (
                    <motion.div
                        key={mission.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="group p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06] hover:border-brand-gold/25 transition-all"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                            {/* Status + ref */}
                            <div className="lg:w-44 space-y-2">
                                <span className={cn(
                                    "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    mission.status === 'in_progress' || mission.status === 'on_route' || mission.status === 'arrived'
                                        ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                                        : "bg-white/5 text-white/40 border border-white/8"
                                )}>
                                    {['in_progress', 'on_route', 'arrived'].includes(mission.status) ? 'Em Curso' : 'Agendado'}
                                </span>
                                <p className="text-sm font-bold text-white">{mission.reference || `REF-${mission.id.substring(0, 6).toUpperCase()}`}</p>
                            </div>

                            {/* Route */}
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

                            {/* Time + actions */}
                            <div className="flex items-center gap-4 lg:pl-6">
                                <div className="text-center">
                                    <p className="text-base font-bold text-white">{mission.pickupTime || '--:--'}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">Horário</p>
                                </div>
                                <button
                                    onClick={() => setActiveChatId(mission.id)}
                                    className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-black transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all">
                                    <Navigation className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-24 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/5">
                        <Calendar className="w-12 h-12 text-white/5 mx-auto mb-5" />
                        <p className="text-white/25 font-bold">Sem viagens agendadas</p>
                        <p className="text-[9px] text-white/10 uppercase tracking-widest font-black mt-2">As próximas viagens aparecerão aqui</p>
                    </div>
                )}
            </div>

            {activeChatId && (
                <BookingChat
                    bookingId={activeChatId}
                    isOpen={!!activeChatId}
                    onClose={() => setActiveChatId(null)}
                    title="Conversa com Passageiro"
                />
            )}
        </div>
    );
}
